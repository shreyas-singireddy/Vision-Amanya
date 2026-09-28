"""AI Consultant Intent Orchestrator.

Routes user queries to specialized sub-agent intent handlers:
- Knowledge Agent (Project specs, lake view, location, architecture) - grounded in RAG
- Property Agent & Recommendation Agent (3 BHK typologies, lake-facing units) - grounded in PostgreSQL inventory
- Floor Plan Agent (Layouts, orientations, dimensions) - grounded in published inventory
- Financial Agent (Possession dates, EMI calculations) - deterministic calculator only
- Site Visit & Lead Agent (Scheduling private visits, capturing contact context)

Grounding rules enforced by this module:
- Knowledge answers are composed exclusively from verified RAG chunks.
- Unit recommendations come exclusively from the deterministic RecommendationEngine
  over real published inventory. No fabricated units, prices, or availability.
- Financial figures come exclusively from the backend FinancialCalculator.
"""

from __future__ import annotations

import re
import uuid
from datetime import date, timedelta
from typing import Any

from sqlalchemy import select

from app.ai.guardrails import guardrails
from app.ai.providers import BaseAIProvider, get_ai_provider
from app.core.logging import get_logger
from app.models.enums import ListingStatus
from app.models.property import Property
from app.schemas.ai import (
    AIChatContext,
    AICitation,
    AISuggestedAction,
    AIStructuredResponse,
    AIResponseType,
)

logger = get_logger("app.ai.orchestrator")


async def _fetch_published_properties(db_session: Any) -> list[Property]:
    """Load all active, published inventory units from PostgreSQL."""
    if db_session is None:
        return []
    try:
        stmt = select(Property).where(
            Property.is_active.is_(True),
            Property.listing_status == ListingStatus.PUBLISHED,
        )
        rows = (await db_session.scalars(stmt)).all()
        return list(rows)
    except Exception:
        logger.exception("Failed to load published inventory")
        return []


def _unit_number_of(prop: Property) -> str:
    feat = prop.features or {}
    return str(feat.get("unit_number") or prop.title.split()[-1])


def _next_site_visit_date() -> date:
    """Next upcoming Saturday (visits run on weekends per hospitality guide)."""
    today = date.today()
    days_ahead = (5 - today.weekday()) % 7
    if days_ahead == 0:
        days_ahead = 7
    return today + timedelta(days=days_ahead)


class AIOrchestrator:
    """Orchestrates query intent classification and routes to sub-agent handlers with RAG context."""

    def __init__(self, provider: BaseAIProvider | None = None) -> None:
        self.provider = provider or get_ai_provider()

    async def get_rag_context(self, prompt: str, session: Any | None = None) -> dict[str, Any] | None:
        """Fetch RAG retrieved context if session is provided."""
        if not session:
            return None
        try:
            from app.ai.rag.context_builder import ContextBuilder
            from app.ai.rag.retriever import HybridRetriever

            retriever = HybridRetriever(session)
            chunks = await retriever.retrieve(prompt, top_k=5)
            builder = ContextBuilder()
            result = builder.build_context(chunks)
            return {
                "context_str": result.formatted_context,
                "insufficient_context": result.insufficient_context,
                "sources": result.sources,
                "max_confidence": result.max_confidence,
                "chunks": result.retrieved_chunks,
            }
        except Exception:
            from app.core.logging import get_logger

            get_logger("app.ai.orchestrator").exception("RAG retrieval failed")
            return None

    def classify_intent(self, prompt: str, context: AIChatContext | None = None) -> str:
        """Legacy helper delegating to IntentEngine.classify()."""
        from app.ai.intent_engine import intent_engine
        result = intent_engine.classify(prompt, context=context)
        return result.intent

    async def process_query(
        self,
        conversation_id: uuid.UUID,
        user_message: str,
        context: AIChatContext | None = None,
        history: list[dict[str, Any]] | None = None,
        db_session: Any | None = None,
    ) -> AIStructuredResponse:
        """Process query and return structured AI response."""
        from app.ai.intent_engine import intent_engine
        from app.ai.context_resolver import ContextResolver

        # 0. Resolve Server-side Authoritative Context
        resolved_context = await ContextResolver(db_session).resolve(context)

        sanitized_input = guardrails.sanitize_input(user_message)

        # ── Phase 7.5: Profile extraction + stage machine ─────────────────────
        from app.ai.profile_extractor import profile_extractor
        from app.ai.conversation_manager import ConversationManager
        from app.ai.lead_scoring import lead_scoring_engine

        state = ConversationManager.get_or_create(conversation_id)

        # Extract profile signals from this message
        extraction = profile_extractor.extract(
            user_message,
            recommendations=[
                u.get("unit_number") for u in (state.last_recommendations or [])
                if isinstance(u, dict)
            ],
            awaiting_consent=state.awaiting_consent,
            awaiting_phone=state.awaiting_phone,
        )
        ConversationManager.update_lead_profile(state, extraction)
        ConversationManager.advance_stage(state)

        # Recompute lead score after profile update
        score_result = lead_scoring_engine.score(state.lead_profile.model_dump())
        state.lead_profile.lead_score = score_result.total
        # ──────────────────────────────────────────────────────────────────────

        intent_result = intent_engine.classify(sanitized_input, history=history, context=context)
        intent = intent_result.intent

        # 0. Handoff & Sales Consultant Escalation Triggers
        if intent == "human_handoff":
            return self._enrich_response(state, AIStructuredResponse(
                conversation_id=conversation_id,
                message="Of course. I can connect you with an Amnaya sales consultant who can assist you directly.",
                response_type=AIResponseType.HANDOFF,
                intent=intent,
                confidence=intent_result.confidence,
                suggested_actions=[
                    AISuggestedAction(label="Connect Me With a Consultant", action_type="handoff", payload={"reason": "explicit_human_request"}),
                    AISuggestedAction(label="Continue with AI Assistant", action_type="chat_prompt", payload={"prompt": "Tell me about available 3 BHK units"}),
                ],
                handoff_context={
                    "reason": "explicit_human_request",
                    "title": "Speak with an Amnaya Sales Consultant",
                    "description": "A member of our sales team can assist you with availability, pricing discussions, and private site visits.",
                },
            ))

        if intent == "negotiation_request":
            return self._enrich_response(state, AIStructuredResponse(
                conversation_id=conversation_id,
                message="Pricing flexibility can depend on current sales terms and inventory schedule. I can connect you with an Amnaya sales consultant to discuss this with you.",
                response_type=AIResponseType.HANDOFF,
                intent=intent,
                confidence=intent_result.confidence,
                suggested_actions=[
                    AISuggestedAction(label="Connect with Sales Consultant", action_type="handoff", payload={"reason": "negotiation_request"}),
                    AISuggestedAction(label="Schedule Private Visit", action_type="site_visit", payload={}),
                ],
                handoff_context={
                    "reason": "negotiation_request",
                    "title": "Pricing & Sales Terms Discussion",
                    "description": "Our sales team can evaluate current payment plans and terms for your preferred residence.",
                },
            ))

        if intent == "unknown_verified_information":
            return self._enrich_response(state, AIStructuredResponse(
                conversation_id=conversation_id,
                message="I don't have verified information on that specific detail in our knowledge base. I can connect you with an Amnaya sales consultant who can provide exact details.",
                response_type=AIResponseType.HANDOFF,
                intent=intent,
                confidence=intent_result.confidence,
                suggested_actions=[
                    AISuggestedAction(label="Speak with Sales Consultant", action_type="handoff", payload={"reason": "unknown_verified_information"}),
                    AISuggestedAction(label="Explore Residence Features", action_type="chat_prompt", payload={"prompt": "Show 3 BHK floor plans"}),
                ],
                handoff_context={
                    "reason": "unknown_verified_information",
                    "title": "Consultant Escalation",
                    "description": "Connect with our team for details beyond the standard digital factsheet.",
                },
            ))

        if intent == "custom_requirement":
            return self._enrich_response(state, AIStructuredResponse(
                conversation_id=conversation_id,
                message="Custom layout modifications and bespoke requirements are reviewed directly by our architectural and sales teams. Would you like me to connect you with a consultant?",
                response_type=AIResponseType.HANDOFF,
                intent=intent,
                confidence=intent_result.confidence,
                suggested_actions=[
                    AISuggestedAction(label="Request Consultant Callback", action_type="handoff", payload={"reason": "custom_requirement"}),
                ],
                handoff_context={
                    "reason": "custom_requirement",
                    "title": "Bespoke Residence Consultation",
                    "description": "Discuss custom spatial requirements with Amnaya real estate specialists.",
                },
            ))

        # 1. Unsupported Out-of-Scope Requests
        if intent == "unsupported_request":
            return self._enrich_response(state, AIStructuredResponse(
                conversation_id=conversation_id,
                message=intent_result.clarification_prompt or "I am the Amnaya AI Consultant. I can only assist with Vision Amnaya luxury residences, specifications, lake views, and site visits.",
                response_type=AIResponseType.CLARIFICATION,
                intent=intent,
                confidence=intent_result.confidence,
                suggested_actions=[
                    AISuggestedAction(label="Explore 3 BHK Residences", action_type="navigate", payload={"url": "/residences"}),
                    AISuggestedAction(label="Schedule Site Visit", action_type="site_visit", payload={}),
                ],
            ))

        # 7. Pricing & Financial Calculations (deterministic backend calculator only)
        if intent in ("pricing_information", "emi_calculation", "loan_calculation", "affordability_check"):
            return self._enrich_response(state, await self._handle_financial(conversation_id, sanitized_input, intent, intent_result))

        # 2. Site Visit & Lead Capture (real availability service)
        if intent in ("site_visit", "lead_capture", "site_visit_request", "site_visit_booking", "sales_conversion"):
            return self._enrich_response(state, await self._handle_site_visit(conversation_id, intent, intent_result))

        # 3. Unit Recommendation, Refinement, Rejection & Paged Search (real inventory)
        if intent in ("unit_recommendation", "unit_search", "refine_recommendation", "show_more_units", "reject_unit", "select_unit"):
            return self._enrich_response(state, await self._handle_recommendation(
                conversation_id, user_message, sanitized_input, intent, intent_result, db_session
            ))

        # 4. Unit Comparison (grounded in published inventory)
        if intent == "unit_comparison":
            return self._enrich_response(state, await self._handle_comparison(conversation_id, intent, intent_result, db_session))

        # 5. Floor Plan & Spatial Visualization (grounded in published inventory)
        if intent in ("floor_plan_information", "floor_plan_navigation", "locate_unit", "show_3d"):
            return self._enrich_response(state, await self._handle_floor_plan(conversation_id, intent, intent_result, db_session))

        # 6. Knowledge questions & general conversation - grounded in verified RAG context only.
        rag = await self.get_rag_context(sanitized_input, session=db_session)
        chunks = (rag or {}).get("chunks") or []
        insufficient = (not rag) or rag.get("insufficient_context", True)

        if insufficient or not chunks:
            return self._enrich_response(state, AIStructuredResponse(
                conversation_id=conversation_id,
                message=(
                    "I don't have verified Amnaya information for that yet. "
                    "I can connect you with a sales consultant who can help."
                ),
                response_type=AIResponseType.HANDOFF,
                intent=intent,
                confidence=intent_result.confidence,
                suggested_actions=[
                    AISuggestedAction(label="Speak with Sales Consultant", action_type="handoff", payload={"reason": "insufficient_knowledge"}),
                    AISuggestedAction(label="Find my ideal residence", action_type="chat_prompt", payload={"prompt": "Recommend a residence for my family"}),
                ],
                handoff_context={
                    "reason": "insufficient_knowledge",
                    "title": "Amnaya Sales Consultant Handoff",
                    "description": "Connect directly with our sales team for details beyond the verified knowledge base.",
                },
                metadata={"rag_insufficient": True},
            ))

        # Compose a strictly extractive answer from retrieved verified chunks.
        lines: list[str] = []
        citations: list[AICitation] = []
        seen_contents: set[str] = set()
        for chunk in chunks[:3]:
            content = " ".join(chunk.content.split())
            key = content.lower()
            if not content or key in seen_contents:
                continue
            seen_contents.add(key)
            lines.append(f"- {content}")
            citations.append(
                AICitation(
                    document_title=chunk.metadata.get("title") or chunk.source_name,
                    document_type=chunk.category.value,
                    snippet=content[:240],
                )
            )
        raw_text = "Here is what our verified Amnaya information covers:\n" + "\n".join(lines)
        is_valid, validated_text = guardrails.validate_facts(raw_text, context={"prompt": sanitized_input})
        return self._enrich_response(state, AIStructuredResponse(
            conversation_id=conversation_id,
            message=validated_text,
            response_type=AIResponseType.TEXT if is_valid else AIResponseType.ERROR,
            intent=intent,
            confidence=round(min(0.98, float(rag.get("max_confidence") or 0.0)), 2),
            suggested_actions=[
                AISuggestedAction(label="Find my ideal residence", action_type="chat_prompt", payload={"prompt": "Recommend a residence for my family"}),
                AISuggestedAction(label="Schedule a Private Visit", action_type="site_visit", payload={}),
            ],
            citations=citations,
            metadata={"rag_sources": rag.get("sources", [])},
        ))

    # ── Phase 7.5: Response enrichment & stage-prompt injection ───────────────

    @staticmethod
    def _enrich_response(
        state: Any,
        response: "AIStructuredResponse",
    ) -> "AIStructuredResponse":
        """Attach live pipeline state to the response and optionally append a
        stage-aware follow-up question to the AI message."""
        from app.ai.conversation_manager import ConversationManager
        profile_summary = ConversationManager.get_profile_summary(state)
        response.lead_score = state.lead_profile.lead_score
        response.stage = state.stage.value
        response.profile_summary = profile_summary
        response.lead_context = profile_summary

        # Append a single non-repetitive follow-up nudge based on current stage
        follow_up = AIOrchestrator._inject_stage_prompt(state)
        if follow_up:
            response.message = response.message.rstrip() + "\n\n" + follow_up

        return response

    @staticmethod
    def _inject_stage_prompt(state: Any) -> str | None:
        """Return a single, natural follow-up question appropriate for the current
        ConvStage. Each question is asked at most once per conversation."""
        from app.ai.conversation_manager import ConversationManager
        from app.models.enums import ConvStage

        stage = state.stage
        lp = state.lead_profile

        # Discovery: get name first
        if stage == ConvStage.DISCOVERY and not lp.name and not ConversationManager.has_asked(state, "name"):
            ConversationManager.mark_asked(state, "name")
            return "May I know your name so I can personalise your experience?"

        # Profile building: location
        if stage == ConvStage.PROFILE_BUILDING and not lp.location and not ConversationManager.has_asked(state, "location"):
            ConversationManager.mark_asked(state, "location")
            return "Where are you currently based?"

        # Profile building: buying purpose
        if stage == ConvStage.PROFILE_BUILDING and not lp.buying_purpose and not ConversationManager.has_asked(state, "purpose"):
            ConversationManager.mark_asked(state, "purpose")
            return "Is this residence for your own use, investment, or a second home?"

        # Requirement discovery: configuration
        if stage == ConvStage.REQUIREMENT_DISCOVERY and not lp.configuration and not ConversationManager.has_asked(state, "configuration"):
            ConversationManager.mark_asked(state, "configuration")
            return "What configuration are you looking for — 3 BHK or 4 BHK?"

        # Requirement discovery: timeline
        if stage == ConvStage.REQUIREMENT_DISCOVERY and not lp.buying_timeline and not ConversationManager.has_asked(state, "timeline"):
            ConversationManager.mark_asked(state, "timeline")
            return "What is your approximate buying timeline?"

        # Contact permission: WhatsApp consent
        if (
            stage == ConvStage.CONTACT_PERMISSION
            and not state.whatsapp_declined
            and lp.whatsapp_consent is None
            and not ConversationManager.has_asked(state, "whatsapp_consent")
        ):
            ConversationManager.mark_asked(state, "whatsapp_consent")
            state.awaiting_consent = True
            return "Would you like me to send you the shortlisted residences on WhatsApp for easy reference?"

        # Contact capture: phone number
        if (
            stage == ConvStage.CONTACT_CAPTURE
            and lp.whatsapp_consent is True
            and not lp.whatsapp_number
            and not ConversationManager.has_asked(state, "phone")
        ):
            ConversationManager.mark_asked(state, "phone")
            state.awaiting_phone = True
            return "Could you share your WhatsApp number so I can send the shortlist?"

        return None

    async def _handle_financial(
        self,
        conversation_id: uuid.UUID,
        sanitized_input: str,
        intent: str,
        intent_result: Any,
    ) -> AIStructuredResponse:
        """Deterministic financial calculation; never an LLM-authored figure."""
        from app.ai.financial_calculator import FinancialCalculator
        from app.schemas.financial import FinancialRequest

        prefs = intent_result.preferences
        lower = sanitized_input.lower()

        # Parse explicit amounts mentioned in the message ("₹3 crore", "75 lakh").
        money_matches = re.findall(r"(?:₹\s*)?(\d+(?:\.\d+)?)\s*(crores?|cr|lakhs?|l)\b", lower)
        price_str = f"{money_matches[0][0]} {money_matches[0][1]}" if money_matches else None
        down_str = f"{money_matches[1][0]} {money_matches[1][1]}" if len(money_matches) > 1 else None

        rate_match = re.search(r"(\d+(?:\.\d+)?)\s*%", lower)
        tenure_match = re.search(r"(\d+)\s*(?:years?|yrs?)\b", lower)

        calc = FinancialCalculator()
        fin_req = FinancialRequest(
            property_price=price_str or prefs.budget or prefs.maximum_budget,
            down_payment=down_str,
            interest_rate=float(rate_match.group(1)) if rate_match else 8.5,
            tenure_years=int(tenure_match.group(1)) if tenure_match else 20,
        )
        fin_res = calc.calculate(fin_req)

        msg = (
            f"For a residence priced at ₹{fin_res.property_price/10000000:.2f} Cr with a down payment of ₹{fin_res.down_payment/100000:.2f} L "
            f"({fin_res.down_payment_percentage}%), the calculated monthly EMI is ₹{fin_res.monthly_emi:,.0f}/month "
            f"for a {fin_res.tenure_years}-year loan at {fin_res.interest_rate}% interest. "
            f"Loan amount: ₹{fin_res.loan_amount/10000000:.2f} Cr | Total interest: ₹{fin_res.total_interest/100000:.1f} L. "
            f"These are calculated estimates, not an offer; {fin_res.warnings[0]}"
        )

        return AIStructuredResponse(
            conversation_id=conversation_id,
            message=msg,
            response_type=AIResponseType.PRICING,
            intent=intent,
            confidence=intent_result.confidence,
            suggested_actions=[
                AISuggestedAction(label="Open Financial Calculator", action_type="open_modal", payload={"modal": "financial_calculator"}),
                AISuggestedAction(label="Compare 15 vs 20 Year Tenure", action_type="chat_prompt", payload={"prompt": "Compare 15 vs 20 year tenure"}),
            ],
            metadata={"financial_calculation": fin_res.model_dump()},
        )

    async def _handle_site_visit(
        self,
        conversation_id: uuid.UUID,
        intent: str,
        intent_result: Any,
    ) -> AIStructuredResponse:
        """Real site-visit availability from the scheduling service."""
        from app.services.lead_conversion_service import LeadConversionService

        target_date = _next_site_visit_date()
        date_str = target_date.isoformat()

        service = LeadConversionService(None)
        avail_res = await service.get_site_visit_availability(date_str)
        slots = list(avail_res.available_slots)
        slots_str = ", ".join(slots) if slots else "no open slots remain for this date"

        msg = (
            f"We would be delighted to host you for a private site visit at Khajaguda, Hyderabad. "
            f"Available time slots for {target_date.strftime('%A, %b %d')} are: {slots_str}. Which time works best for you?"
        )

        actions = [
            AISuggestedAction(label=f"Book {slot}", action_type="site_visit", payload={"date": date_str, "time_slot": slot})
            for slot in slots[:3]
        ]
        actions.append(AISuggestedAction(label="Open Full Scheduler", action_type="open_modal", payload={"modal": "site_visit_scheduler"}))

        return AIStructuredResponse(
            conversation_id=conversation_id,
            message=msg,
            response_type=AIResponseType.SITE_VISIT if "visit" in intent else AIResponseType.LEAD_CAPTURE,
            intent=intent,
            confidence=intent_result.confidence,
            suggested_actions=actions[:4],
            metadata={"available_slots": slots, "target_date": date_str},
        )

    async def _handle_recommendation(
        self,
        conversation_id: uuid.UUID,
        user_message: str,
        sanitized_input: str,
        intent: str,
        intent_result: Any,
        db_session: Any,
    ) -> AIStructuredResponse:
        """Deterministic recommendations over real published inventory via RecommendationEngine."""
        from app.ai.conversation_manager import ConversationManager
        from app.ai.recommendation_engine import RecommendationEngine
        from app.schemas.recommendation import RecommendationRequest

        state = ConversationManager.get_or_create(conversation_id)

        # Check if prompt requires intelligent clarification
        if ConversationManager.should_clarify(user_message, state):
            return AIStructuredResponse(
                conversation_id=conversation_id,
                message="I'd be delighted to help you discover the perfect residence at Amnaya. Could you share your preferred budget or key priorities (e.g. lake view or higher floor)?",
                response_type=AIResponseType.CLARIFICATION,
                intent="clarification",
                confidence=0.9,
                suggested_actions=[
                    AISuggestedAction(label="Under ₹2.5 Cr", action_type="chat_prompt", payload={"prompt": "Show 3 BHK under 2.5 Crore"}),
                    AISuggestedAction(label="Lake View First", action_type="chat_prompt", payload={"prompt": "Prioritize lake view"}),
                    AISuggestedAction(label="High Floor", action_type="chat_prompt", payload={"prompt": "Prefer 10th floor or higher"}),
                ],
            )

        # Handle Unit Rejection using extracted unit IDs (never a hardcoded list)
        if intent == "reject_unit" or "don't like" in user_message.lower() or "not interested in" in user_message.lower():
            for u_num in intent_result.preferences.unit_ids:
                ConversationManager.reject_unit(state, u_num)

        # Handle "Show More" Pagination
        if intent == "show_more_units" or "show more" in user_message.lower() or "more options" in user_message.lower():
            ConversationManager.next_page(state)

        # Update & Merge Preferences across dialogue turns
        ConversationManager.update_preferences(state, intent_result.preferences)
        ConversationManager.refine_weights_from_text(user_message, state)

        engine = RecommendationEngine(db_session, weights=state.scoring_weights)
        rec_response = await engine.recommend(
            RecommendationRequest(conversation_id=conversation_id, preferences=state.preferences, top_n=10)
        )

        ranked = [u.model_dump() for u in rec_response.recommendations]
        alternatives = [u.model_dump() for u in rec_response.alternatives]

        # Controlled no-inventory / zero-result states (never fabricate units).
        if not ranked and not alternatives:
            return AIStructuredResponse(
                conversation_id=conversation_id,
                message=(
                    "I couldn't find residences matching those preferences in the currently published Amnaya inventory. "
                    "New releases may not be reflected here yet — would you like me to connect you with a sales consultant?"
                ),
                response_type=AIResponseType.UNIT_RECOMMENDATION,
                intent=intent,
                confidence=intent_result.confidence,
                units=[],
                suggested_actions=[
                    AISuggestedAction(label="Connect with Sales Consultant", action_type="handoff", payload={"reason": "no_matching_inventory"}),
                    AISuggestedAction(label="Adjust Budget", action_type="chat_prompt", payload={"prompt": "Show 3 BHK under 3 Crore"}),
                ],
                handoff_context={
                    "reason": "no_matching_inventory",
                    "title": "Inventory Assistance",
                    "description": "Our sales team has the latest availability, including unreleased inventory.",
                },
                metadata={
                    "preferences": state.preferences.model_dump(),
                    "total_matches": rec_response.total_matches,
                    "rejected_units": state.rejected_units,
                    "offset": state.offset,
                    "inventory_empty": True,
                },
            )

        constraint_relaxed = rec_response.constraint_relaxed and not ranked
        pool = alternatives if constraint_relaxed else ranked
        active_units = [u for u in pool if u["unit_number"] not in state.rejected_units]

        # Reset offset when it runs past the end after filtering
        if state.offset >= len(active_units) > 0:
            state.offset = 0
        units_payload = active_units[state.offset : state.offset + 3]

        pref_bits: list[str] = []
        if state.preferences.maximum_budget:
            pref_bits.append(f"budget up to {RecommendationEngine.format_inr(state.preferences.maximum_budget)}")
        if state.preferences.view:
            pref_bits.append(f"{state.preferences.view} view")
        if state.preferences.floor_preference:
            pref_bits.append(f"{state.preferences.floor_preference} floor")

        if constraint_relaxed:
            msg = f"{rec_response.relaxation_notes[0]} These are the closest available matches:"
        elif not units_payload:
            msg = (
                "You've now viewed all matching residences in the current published inventory. "
                "Would you like me to adjust the constraints or restart your shortlist?"
            )
        else:
            criteria = ", ".join(pref_bits) if pref_bits else "your preferences"
            msg = f"Based on {criteria}, here are the top matches from current published Amnaya inventory:"

        state.last_recommendations = active_units

        return AIStructuredResponse(
            conversation_id=conversation_id,
            message=msg,
            response_type=AIResponseType.UNIT_RECOMMENDATION,
            intent=intent,
            confidence=intent_result.confidence,
            units=units_payload,
            suggested_actions=[
                AISuggestedAction(label="Show Cheaper Options", action_type="chat_prompt", payload={"prompt": "Show cheaper options"}),
                AISuggestedAction(label="Prioritize Lake View", action_type="chat_prompt", payload={"prompt": "Prioritize lake view"}),
                AISuggestedAction(label="Show More Units", action_type="chat_prompt", payload={"prompt": "Show more options"}),
            ],
            metadata={
                "preferences": state.preferences.model_dump(),
                "rejected_units": state.rejected_units,
                "offset": state.offset,
                "total_matches": rec_response.total_matches,
                "constraint_relaxed": rec_response.constraint_relaxed,
                "relaxation_notes": rec_response.relaxation_notes,
            },
        )

    async def _handle_comparison(
        self,
        conversation_id: uuid.UUID,
        intent: str,
        intent_result: Any,
        db_session: Any,
    ) -> AIStructuredResponse:
        """Compare real published units fetched from PostgreSQL."""
        requested_ids = intent_result.preferences.unit_ids or []

        inventory = {(_unit_number_of(p)): p for p in await _fetch_published_properties(db_session)}
        matched = [(uid, inventory[uid]) for uid in requested_ids if uid in inventory] if requested_ids else []

        if len(matched) < 2:
            available_preview = ", ".join(sorted(inventory.keys())[:6]) if inventory else ""
            if len(matched) == 1:
                uid, prop = matched[0]
                msg = (
                    f"I have verified details for Residence {uid} (₹{float(prop.price)/10000000:.2f} Cr, "
                    f"{float(prop.floor_area_sqft or prop.built_up_area_sqft or 0):,.0f} sq.ft.), "
                    f"but I need a second valid unit number to compare. Available residences include: {available_preview}."
                )
            else:
                msg = (
                    "I don't have verified inventory data for those residences yet. "
                    + (f"Currently published residences include: {available_preview}. " if available_preview else "")
                    + "Could you share the unit numbers you'd like to compare, or shall I connect you with a sales consultant?"
                )
            return AIStructuredResponse(
                conversation_id=conversation_id,
                message=msg,
                response_type=AIResponseType.CLARIFICATION if inventory else AIResponseType.HANDOFF,
                intent=intent,
                confidence=intent_result.confidence,
                suggested_actions=[
                    AISuggestedAction(label="Connect with Sales Consultant", action_type="handoff", payload={"reason": "comparison_data_unavailable"}),
                ] if not inventory else [
                    AISuggestedAction(label="Show Available Residences", action_type="chat_prompt", payload={"prompt": "Show me available 3 BHK units"}),
                ],
                handoff_context={
                    "reason": "comparison_data_unavailable",
                    "title": "Comparison Assistance",
                    "description": "Our sales team can compare residences including options not yet listed online.",
                } if not inventory else None,
            )

        (id_a, a), (id_b, b) = matched[0], matched[1]
        area_a = float(a.floor_area_sqft or a.built_up_area_sqft or 0)
        area_b = float(b.floor_area_sqft or b.built_up_area_sqft or 0)
        price_a, price_b = float(a.price or 0), float(b.price or 0)

        cheaper_id, pricier_id = (id_a, id_b) if price_a <= price_b else (id_b, id_a)
        larger_id, smaller_id = (id_a, id_b) if area_a >= area_b else (id_b, id_a)

        def _advantages(uid: str) -> list[str]:
            advs = []
            if uid == cheaper_id and price_a != price_b:
                advs.append(f"Lower entry price by ₹{abs(price_a - price_b)/100000:.2f} L")
            if uid == larger_id and area_a != area_b:
                advs.append(f"Larger layout by {abs(area_a - area_b):,.0f} sq.ft.")
            floor_val = a.floor_number if uid == id_a else b.floor_number
            if floor_val:
                advs.append(f"Floor {floor_val}")
            return advs or ["Balanced overall profile"]

        def _unit_dict(uid: str, prop: Property) -> dict[str, Any]:
            feat = prop.features or {}
            area_val = float(prop.floor_area_sqft or prop.built_up_area_sqft or 0)
            price_val = float(prop.price or 0)
            return {
                "unit_number": uid,
                "typology": f"{prop.bedrooms or 3} BHK",
                "tower": feat.get("tower") or "Tower A",
                "floor": prop.floor_number,
                "view": feat.get("view"),
                "area_sqft": area_val,
                "price": price_val,
                "price_per_sqft": round(price_val / area_val) if area_val else None,
                "facing": feat.get("orientation") or feat.get("facing"),
                "status": str(prop.listing_status.value if hasattr(prop.listing_status, 'value') else prop.listing_status),
                "advantages": _advantages(uid),
            }

        msg = (
            f"Comparing Residence {id_a} (₹{price_a/10000000:.2f} Cr, {area_a:,.0f} sq.ft.) and "
            f"Residence {id_b} (₹{price_b/10000000:.2f} Cr, {area_b:,.0f} sq.ft.): "
            f"Residence {cheaper_id} offers the lower entry price by ₹{abs(price_a - price_b)/100000:.2f} L, "
            f"while Residence {larger_id} provides {abs(area_a - area_b):,.0f} sq.ft. of additional layout area."
        ) if (price_a != price_b or area_a != area_b) else (
            f"Residence {id_a} and Residence {id_b} share identical pricing and area in the published inventory."
        )

        return AIStructuredResponse(
            conversation_id=conversation_id,
            message=msg,
            response_type=AIResponseType.UNIT_COMPARISON,
            intent=intent,
            confidence=intent_result.confidence,
            units=[_unit_dict(id_a, a), _unit_dict(id_b, b)],
            suggested_actions=[
                AISuggestedAction(label="Schedule Private Visit", action_type="site_visit", payload={"unit_id": id_a}),
                AISuggestedAction(label="Explore Residence " + id_a, action_type="navigate", payload={"url": f"/residences/residence-{id_a}"}),
            ],
            metadata={"compared_units": requested_ids},
        )

    async def _handle_floor_plan(
        self,
        conversation_id: uuid.UUID,
        intent: str,
        intent_result: Any,
        db_session: Any,
    ) -> AIStructuredResponse:
        """Locate a real published unit on the floor plan."""
        u_target = intent_result.preferences.unit_id

        inventory = {(_unit_number_of(p)): p for p in await _fetch_published_properties(db_session)}
        prop = inventory.get(u_target) if u_target else None
        if prop is None and inventory:
            prop = next(iter(inventory.values()))
            u_target = _unit_number_of(prop)
        if prop is None:
            return AIStructuredResponse(
                conversation_id=conversation_id,
                message="I don't have published floor-plan data for that residence yet. I can connect you with a sales consultant for the latest block plans.",
                response_type=AIResponseType.HANDOFF,
                intent=intent,
                confidence=intent_result.confidence,
                suggested_actions=[
                    AISuggestedAction(label="Connect with Sales Consultant", action_type="handoff", payload={"reason": "floor_plan_unavailable"}),
                ],
                handoff_context={
                    "reason": "floor_plan_unavailable",
                    "title": "Floor Plan Assistance",
                    "description": "Our sales team can share the latest architectural floor plans.",
                },
                metadata={"inventory_empty": True},
            )

        feat = prop.features or {}
        tower_name = feat.get("tower") or "Tower A"
        area_val = float(prop.floor_area_sqft or prop.built_up_area_sqft or 0)
        facing = feat.get("orientation") or feat.get("facing")
        view = feat.get("view")

        location_bits = [f"Residence {u_target}", tower_name]
        if prop.floor_number:
            location_bits.append(f"Floor {prop.floor_number}")
        if facing:
            location_bits.append(f"{str(facing).title()} facing")
        if view:
            location_bits.append(str(view))
        location_str = f"{location_bits[0]} is located in {', '.join(location_bits[1:])}"

        floor_plan_context: dict[str, Any] = {
            "building": tower_name,
            "floor_number": prop.floor_number,
            "target_unit_id": u_target,
        }
        if feat.get("floor_plan_polygon"):
            floor_plan_context["polygon"] = feat["floor_plan_polygon"]
        if feat.get("block_plan_url"):
            floor_plan_context["asset_url"] = feat["block_plan_url"]

        return AIStructuredResponse(
            conversation_id=conversation_id,
            message=(
                f"{location_str} "
                f"with an area of {area_val:,.0f} sq.ft. as per published inventory."
            ),
            response_type=AIResponseType.FLOOR_PLAN,
            intent=intent,
            confidence=intent_result.confidence,
            floor_plan_context=floor_plan_context,
            units=[
                {
                    "unit_number": u_target,
                    "typology": f"{prop.bedrooms or 3} BHK",
                    "tower": tower_name,
                    "floor": prop.floor_number,
                    "view": view,
                    "area_sqft": area_val,
                    "price": float(prop.price or 0),
                }
            ],
            suggested_actions=[
                AISuggestedAction(label="Open Interactive Floor Plan", action_type="navigate", payload={"url": f"/residences?unit={u_target}"}),
                AISuggestedAction(label="View 3D Residence Model", action_type="open_modal", payload={"modal": "3d_viewer"}),
            ],
        )


orchestrator = AIOrchestrator()
