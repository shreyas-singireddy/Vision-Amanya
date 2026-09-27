"""AI Consultant Foundation API endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import OptionalUser, get_db
from app.core.response import success_response
from app.schemas.ai import (
    AIChatRequest,
    AIConversationCreate,
    AIConversationResponse,
    AILeadCaptureRequest,
    AISiteVisitRequest,
    AIStructuredResponse,
)
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat")
async def chat_with_ai(
    payload: AIChatRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: OptionalUser = None,
) -> dict:
    """Send a message to the Amnaya AI Consultant and receive a structured response."""
    service = AIService(db)
    user_id = user.id if user else None
    response: AIStructuredResponse = await service.chat(payload, user_id=user_id)
    return success_response(response.model_dump(), message="AI response generated.")


@router.post("/conversations")
async def create_conversation(
    payload: AIConversationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: OptionalUser = None,
) -> dict:
    """Initialize a new AI conversation thread."""
    service = AIService(db)
    user_id = user.id if user else None
    session = await service.get_or_create_session(
        user_id=user_id,
        guest_id=payload.guest_id,
        persona=payload.persona,
    )
    return success_response(
        AIConversationResponse.model_validate(session).model_dump(),
        message="Conversation initialized.",
    )


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: OptionalUser = None,
) -> dict:
    """Retrieve an existing AI conversation history."""
    service = AIService(db)
    user_id = user.id if user else None
    session = await service.get_session_history(conversation_id, user_id=user_id)
    return success_response(AIConversationResponse.model_validate(session).model_dump())


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: OptionalUser = None,
) -> dict:
    """Close/archive an AI conversation thread."""
    service = AIService(db)
    user_id = user.id if user else None
    await service.delete_session(conversation_id, user_id=user_id)
    return success_response(None, message="Conversation closed.")


@router.post("/lead")
async def create_ai_lead(
    payload: AILeadCaptureRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: OptionalUser = None,
) -> dict:
    """Capture or update an AI-qualified lead."""
    service = AIService(db)
    user_id = user.id if user else None
    result = await service.capture_lead(payload, user_id=user_id)
    return success_response(result, message="Lead captured successfully.")


@router.post("/site-visit")
async def create_ai_site_visit(
    payload: AISiteVisitRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: OptionalUser = None,
) -> dict:
    """Create a site-visit request from the AI Consultant interaction."""
    service = AIService(db)
    user_id = user.id if user else None
    result = await service.request_site_visit(payload, user_id=user_id)
    return success_response(result, message="Site visit request submitted successfully.")


@router.post("/recommendations")
async def get_unit_recommendations(
    payload: dict,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Generate intelligent Amnaya unit recommendations based on property preferences."""
    from app.ai.recommendation_engine import RecommendationEngine
    from app.schemas.recommendation import RecommendationRequest

    req = RecommendationRequest(**payload)
    engine = RecommendationEngine(db)
    result = await engine.recommend(req)
    return success_response(result.model_dump(), message="Unit recommendations generated.")


@router.post("/compare")
async def compare_residences(
    payload: dict,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Compare multiple Amnaya residences deterministically across price, area, floor, view and value."""
    from app.ai.unit_comparison_engine import UnitComparisonEngine
    from app.schemas.unit_comparison import ComparisonRequest

    req = ComparisonRequest(**payload)
    engine = UnitComparisonEngine(db)
    result = await engine.compare(req)
    return success_response(result.model_dump(), message="Unit comparison generated.")


@router.get("/units/{unit_target}/visualization")
async def get_unit_visualization_endpoint(
    unit_target: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Get spatial floor plan coordinates, assets, and location map for a specific residence."""
    from app.ai.unit_visualization_service import UnitVisualizationService

    service = UnitVisualizationService(db)
    result = await service.get_unit_visualization(unit_target)
    return success_response(result.model_dump(), message="Unit visualization generated.")


@router.get("/floors/{floor_number}/visualization")
async def get_floor_visualization_endpoint(
    floor_number: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    tower: str = Query("Tower A"),
) -> dict:
    """Get complete floor block layout visualization."""
    from app.ai.unit_visualization_service import UnitVisualizationService

    service = UnitVisualizationService(db)
    result = await service.get_floor_visualization(tower_name=tower, floor_number=floor_number)
    return success_response(result.model_dump(), message="Floor visualization generated.")


@router.post("/financial/calculate")
async def calculate_financial_endpoint(
    payload: dict,
) -> dict:
    """Execute deterministic home loan EMI, affordability, and scenario calculations."""
    from app.ai.financial_calculator import FinancialCalculator
    from app.schemas.financial import FinancialRequest

    req = FinancialRequest(**payload)
    calc = FinancialCalculator()
    result = calc.calculate(req)
    return success_response(result.model_dump(), message="Financial calculation executed.")


@router.post("/leads/qualify")
async def qualify_lead_endpoint(
    payload: dict,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Qualify visitor lead and generate structured CRM sales summary."""
    from app.schemas.lead_conversion import LeadQualificationRequest
    from app.services.lead_conversion_service import LeadConversionService

    req = LeadQualificationRequest(**payload)
    service = LeadConversionService(db)
    result = await service.qualify_and_create_lead(req)
    return success_response(result.model_dump(), message="Lead qualified and registered.")


@router.get("/site-visits/availability")
async def site_visit_availability_endpoint(
    date: str = Query(..., description="Target visit date YYYY-MM-DD"),
    db: Annotated[AsyncSession, Depends(get_db)] = None,
) -> dict:
    """Query available site visit slots for a target date."""
    from app.services.lead_conversion_service import LeadConversionService

    service = LeadConversionService(db)
    result = await service.get_site_visit_availability(date)
    return success_response(result.model_dump(), message="Site visit availability retrieved.")


@router.post("/site-visits/book")
async def book_site_visit_endpoint(
    payload: dict,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Atomically recheck slot availability and book a private site visit."""
    from app.schemas.lead_conversion import SiteVisitBookingRequest
    from app.services.lead_conversion_service import LeadConversionService

    req = SiteVisitBookingRequest(**payload)
    service = LeadConversionService(db)
    result = await service.book_site_visit(req)
    return success_response(result.model_dump(), message="Site visit booking confirmed.")


@router.post("/handoff")
async def create_ai_handoff_endpoint(
    payload: dict,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: OptionalUser = None,
) -> dict:
    """Request or initiate an AI-to-human sales consultant handoff."""
    from app.schemas.handoff import HandoffRequest
    from app.services.handoff_service import HandoffService

    req = HandoffRequest(**payload)
    service = HandoffService(db)
    user_id = user.id if user else None
    res = await service.request_handoff(req, user_id=user_id)
    return success_response(res.model_dump(), message=res.message)


@router.get("/handoff/{handoff_id}")
async def get_ai_handoff_endpoint(
    handoff_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: OptionalUser = None,
) -> dict:
    """Retrieve status and estimated wait time for a handoff request."""
    from app.services.handoff_service import HandoffService

    service = HandoffService(db)
    user_id = user.id if user else None
    res = await service.get_handoff_status(handoff_id, user_id=user_id)
    return success_response(res.model_dump(), message="Handoff status retrieved.")






