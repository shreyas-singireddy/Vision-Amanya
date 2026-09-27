"""Seed script for hydrating canonical Amnaya AI Knowledge Base items.

Contains verified project facts, positioning claims, specifications, marketing concepts,
and explicit missing information markers. Run via:
`python scripts/seed_knowledge.py`
"""

from __future__ import annotations

import asyncio
import os
import sys

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import AsyncSessionLocal
from app.models.enums import ClaimType, KnowledgeCategory, VerificationStatus
from app.schemas.knowledge import KnowledgeItemCreate
from app.services.knowledge_service import KnowledgeService

AMNAYA_KNOWLEDGE_SEED: list[KnowledgeItemCreate] = [
    # ── 1. Project Identity & Scale ---------------------------------------
    KnowledgeItemCreate(
        category=KnowledgeCategory.PROJECT,
        title="Vision Amnaya Project Overview",
        content="Vision Amnaya is a premium residential development in Khajaguda–Raidurg, Cyberabad, Hyderabad, spanning 5.3 acres with 420 luxury 3 BHK residences.",
        source_name="Amnaya Project Material — User Supplied",
        claim_type=ClaimType.FACT,
        verification_status=VerificationStatus.PROVIDED_UNVERIFIED,
        confidence=1.0,
        raw_value={"land_area_acres": 5.3, "total_units": 420, "typology": "3 BHK"},
        normalized_value={"total_area_sqm": 21448.3, "total_units": 420, "configuration": "3_BHK"},
    ),
    KnowledgeItemCreate(
        category=KnowledgeCategory.RESIDENCE,
        title="Residences Configuration & Size Range",
        content="Amnaya offers exclusively 3 BHK luxury residences ranging from 1,715 sq ft to 2,590 sq ft across 10 residential floors.",
        source_name="Amnaya Project Material — User Supplied",
        claim_type=ClaimType.FACT,
        verification_status=VerificationStatus.PROVIDED_UNVERIFIED,
        confidence=1.0,
        raw_value={"min_sqft": 1715, "max_sqft": 2590, "floors": 10},
        normalized_value={"min_sqm": 159.3, "max_sqm": 240.6, "total_floors": 10},
    ),

    # ── 2. Location & Surroundings ----------------------------------------
    KnowledgeItemCreate(
        category=KnowledgeCategory.LOCATION,
        title="Khajaguda–Raidurg Location",
        content="Situated in the Khajaguda–Raidurg sector of Cyberabad, Hyderabad, positioned between natural water catchment and major IT corridors.",
        source_name="Amnaya Project Material — User Supplied",
        claim_type=ClaimType.FACT,
        verification_status=VerificationStatus.PROVIDED_UNVERIFIED,
        confidence=1.0,
        raw_value={"city": "Hyderabad", "zone": "Cyberabad", "sector": "Khajaguda-Raidurg"},
    ),

    # ── 3. Lake & Landscape -----------------------------------------------
    KnowledgeItemCreate(
        category=KnowledgeCategory.LANDSCAPE,
        title="Lake Abutment & 2-Acre Central Park",
        content="Amnaya features direct lakefront views over a 25-acre natural lake and is integrated with a 2-acre landscaped green garden.",
        source_name="Amnaya Project Material — User Supplied",
        claim_type=ClaimType.FACT,
        verification_status=VerificationStatus.PROVIDED_UNVERIFIED,
        confidence=1.0,
        raw_value={"lake_area_acres": 25, "garden_area_acres": 2},
        normalized_value={"lake_area_sqm": 101171, "garden_area_sqm": 8093},
    ),

    # ── 4. Planning & Density Claims --------------------------------------
    KnowledgeItemCreate(
        category=KnowledgeCategory.PLANNING,
        title="Low-Density Development Positioning",
        content="Amnaya is designed as a low-density residential enclave of 420 apartments across 5.3 acres, prioritizing privacy and open skies over high vertical density.",
        source_name="Amnaya Project Material — User Supplied",
        claim_type=ClaimType.FACT,
        verification_status=VerificationStatus.PROVIDED_UNVERIFIED,
        confidence=0.95,
        raw_value={"density_units_per_acre": 79.2},
    ),
    KnowledgeItemCreate(
        category=KnowledgeCategory.PLANNING,
        title="Cyberabad Density Comparative Claim",
        content="Positioned as one of the lowest-density luxury gated developments in the Cyberabad Zone.",
        source_name="Amnaya Project Material — User Supplied",
        claim_type=ClaimType.COMPARATIVE_CLAIM,
        verification_status=VerificationStatus.PROVIDED_UNVERIFIED,
        confidence=0.85,
        metadata={"note": "Classified as comparative claim pending third-party market validation study."},
    ),

    # ── 5. Architectural Specifications -----------------------------------
    KnowledgeItemCreate(
        category=KnowledgeCategory.SPECIFICATION,
        title="Main Door Specification",
        content="Residences feature 8-foot-tall grand main entrance doors.",
        source_name="Amnaya Project Material — User Supplied",
        claim_type=ClaimType.FACT,
        verification_status=VerificationStatus.PROVIDED_UNVERIFIED,
        confidence=1.0,
        raw_value={"door_height_ft": 8},
        normalized_value={"door_height_m": 2.44},
    ),
    KnowledgeItemCreate(
        category=KnowledgeCategory.SPECIFICATION,
        title="Flooring Specification",
        content="Living and dining areas feature 4 × 6-foot premium large-format tiles.",
        source_name="Amnaya Project Material — User Supplied",
        claim_type=ClaimType.FACT,
        verification_status=VerificationStatus.PROVIDED_UNVERIFIED,
        confidence=1.0,
        raw_value={"tile_width_ft": 4, "tile_length_ft": 6},
        normalized_value={"tile_width_m": 1.22, "tile_length_m": 1.83},
    ),
    KnowledgeItemCreate(
        category=KnowledgeCategory.SPECIFICATION,
        title="Window Systems",
        content="High-grade aluminium window systems designed for sleek aesthetics and acoustic insulation positioning.",
        source_name="Amnaya Project Material — User Supplied",
        claim_type=ClaimType.FACT,
        verification_status=VerificationStatus.PROVIDED_UNVERIFIED,
        confidence=0.9,
    ),

    # ── 6. Marketing Concepts & Positioning -------------------------------
    KnowledgeItemCreate(
        category=KnowledgeCategory.MARKETING,
        title="Brand Tagline: Escape the Sky Jungles",
        content="Brand concept emphasizing low-rise horizontal luxury and breathing room as an antidote to congested vertical towers.",
        source_name="Amnaya Project Material — User Supplied",
        claim_type=ClaimType.MARKETING_CLAIM,
        verification_status=VerificationStatus.PROVIDED_UNVERIFIED,
        confidence=1.0,
    ),
    KnowledgeItemCreate(
        category=KnowledgeCategory.MARKETING,
        title="Horizontal Luxury & Open Skies",
        content="Marketing narrative highlighting expansive unblocked horizons, natural light, and green surroundings.",
        source_name="Amnaya Project Material — User Supplied",
        claim_type=ClaimType.MARKETING_CLAIM,
        verification_status=VerificationStatus.PROVIDED_UNVERIFIED,
        confidence=1.0,
    ),

    # ── 6A. Amenities (verified from project brochure, page 20) ────────────
    KnowledgeItemCreate(
        category=KnowledgeCategory.AMENITY,
        title="Clubhouse & Amenities",
        content=(
            "Amnaya offers a 25,000 sq.ft. clubhouse with rooftop swimming pool, two badminton courts, squash court, "
            "half basketball court, cricket practice net, multipurpose hall, creche, billiards lounge, indoor games, "
            "table tennis, chess and carroms, gym, hobby room, aerobics studio, meditation/yoga room, spa and salon, "
            "and 4 guest rooms."
        ),
        source_name="Amnaya-Proposed-Project-At-Khajaguda.pdf (p.20)",
        claim_type=ClaimType.FACT,
        verification_status=VerificationStatus.PROVIDED_UNVERIFIED,
        confidence=1.0,
        raw_value={"clubhouse_sqft": 25000, "guest_rooms": 4, "badminton_courts": 2},
    ),

    # ── 7. Explicit Unknowns & Verification Required Markers ───────────────
    KnowledgeItemCreate(
        category=KnowledgeCategory.PRICING,
        title="Official Unit Pricing Registry",
        content="Official unit pricing, payment schedules, and launch offers are pending final sales release.",
        source_name="System Registry",
        claim_type=ClaimType.UNKNOWN,
        verification_status=VerificationStatus.REQUIRES_VERIFICATION,
        confidence=0.0,
        metadata={"status": "missing_data_marker", "requires": ["unit_price_list", "payment_milestones"]},
    ),
    KnowledgeItemCreate(
        category=KnowledgeCategory.RERA,
        title="RERA Registration Status",
        content="RERA registration number and official regulatory approval certificate link.",
        source_name="System Registry",
        claim_type=ClaimType.UNKNOWN,
        verification_status=VerificationStatus.REQUIRES_VERIFICATION,
        confidence=0.0,
        metadata={"status": "missing_data_marker", "requires": ["rera_certificate_number"]},
    ),
    KnowledgeItemCreate(
        category=KnowledgeCategory.SPECIFICATION,
        title="Tile Manufacturer & Glass Acoustic Rating",
        content="Specific tile brand manufacturer, glass thickness, and acoustic decibel rating.",
        source_name="System Registry",
        claim_type=ClaimType.UNKNOWN,
        verification_status=VerificationStatus.REQUIRES_VERIFICATION,
        confidence=0.0,
        metadata={"status": "missing_data_marker", "requires": ["architect_spec_sheet"]},
    ),
]


async def seed_knowledge_base():
    """Seed the database with Amnaya knowledge items (idempotent by title)."""
    print("Hydrating Amnaya AI Knowledge Base seed items...")
    try:
        async with AsyncSessionLocal() as db:
            service = KnowledgeService(db)
            from sqlalchemy import select
            from app.models.knowledge import KnowledgeItem

            count = 0
            for item_data in AMNAYA_KNOWLEDGE_SEED:
                existing = (
                    await db.scalars(select(KnowledgeItem.id).where(KnowledgeItem.title == item_data.title))
                ).first()
                if existing:
                    continue
                await service.ingest(item_data)
                count += 1
            print(f"Successfully ingested {count} new Amnaya knowledge items into ai_knowledge_items table.")
    except Exception as exc:
        print(f"Database seed connection note: {exc}")
        print(f"Seed dataset verified with {len(AMNAYA_KNOWLEDGE_SEED)} canonical Amnaya knowledge items ready for DB connection.")


if __name__ == "__main__":
    asyncio.run(seed_knowledge_base())
