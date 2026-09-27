"""Pytest suite for Phase 7.1 Knowledge Base Architecture & Data Preparation."""

import uuid
import pytest
from unittest.mock import AsyncMock, patch

from app.models.enums import ClaimType, KnowledgeCategory, VerificationStatus
from app.schemas.knowledge import KnowledgeItemCreate
from app.services.knowledge_service import KnowledgeService
from scripts.seed_knowledge import AMNAYA_KNOWLEDGE_SEED


def test_seed_dataset_facts_integrity():
    """Verify supplied project facts are represented accurately without hallucinated metrics."""
    items_by_title = {item.title: item for item in AMNAYA_KNOWLEDGE_SEED}

    # 1. Project Scale
    project_item = items_by_title["Vision Amnaya Project Overview"]
    assert project_item.category == KnowledgeCategory.PROJECT
    assert project_item.claim_type == ClaimType.FACT
    assert project_item.raw_value["land_area_acres"] == 5.3
    assert project_item.raw_value["total_units"] == 420

    # 2. Residence Configuration
    residence_item = items_by_title["Residences Configuration & Size Range"]
    assert residence_item.category == KnowledgeCategory.RESIDENCE
    assert residence_item.raw_value["min_sqft"] == 1715
    assert residence_item.raw_value["max_sqft"] == 2590

    # 3. Location
    loc_item = items_by_title["Khajaguda–Raidurg Location"]
    assert "Khajaguda" in loc_item.content
    assert "Cyberabad" in loc_item.content

    # 4. Landscape
    lake_item = items_by_title["Lake Abutment & 2-Acre Central Park"]
    assert lake_item.raw_value["lake_area_acres"] == 25
    assert lake_item.raw_value["garden_area_acres"] == 2

    # 5. Specifications
    door_item = items_by_title["Main Door Specification"]
    assert door_item.raw_value["door_height_ft"] == 8

    tile_item = items_by_title["Flooring Specification"]
    assert tile_item.raw_value["tile_width_ft"] == 4
    assert tile_item.raw_value["tile_length_ft"] == 6


def test_claim_classification_taxonomy():
    """Verify marketing claims and comparative claims are classified correctly."""
    items_by_title = {item.title: item for item in AMNAYA_KNOWLEDGE_SEED}

    # Comparative claim
    comp_claim = items_by_title["Cyberabad Density Comparative Claim"]
    assert comp_claim.claim_type == ClaimType.COMPARATIVE_CLAIM
    assert comp_claim.claim_type != ClaimType.FACT

    # Marketing claim
    mktg_claim = items_by_title["Brand Tagline: Escape the Sky Jungles"]
    assert mktg_claim.claim_type == ClaimType.MARKETING_CLAIM
    assert mktg_claim.claim_type != ClaimType.FACT


def test_missing_information_markers():
    """Verify unverified/missing information (pricing, RERA, tile brand) is explicitly flagged."""
    items_by_title = {item.title: item for item in AMNAYA_KNOWLEDGE_SEED}

    pricing_item = items_by_title["Official Unit Pricing Registry"]
    assert pricing_item.claim_type == ClaimType.UNKNOWN
    assert pricing_item.verification_status == VerificationStatus.REQUIRES_VERIFICATION
    assert pricing_item.confidence == 0.0

    rera_item = items_by_title["RERA Registration Status"]
    assert rera_item.claim_type == ClaimType.UNKNOWN
    assert rera_item.verification_status == VerificationStatus.REQUIRES_VERIFICATION


@pytest.mark.asyncio
async def test_knowledge_service_rag_chunk_adapter():
    """Test KnowledgeService.get_rag_chunks formats items cleanly for Phase 7.2 RAG readiness."""
    mock_db = AsyncMock()
    service = KnowledgeService(mock_db)

    # Mock repository return value
    mock_item = KnowledgeItemCreate(
        category=KnowledgeCategory.SPECIFICATION,
        title="Main Door Specification",
        content="8-foot-tall grand doors.",
        source_name="Amnaya Project Material — User Supplied",
        claim_type=ClaimType.FACT,
        verification_status=VerificationStatus.PROVIDED_UNVERIFIED,
    )

    with patch.object(service, "list_items", new_callable=AsyncMock) as mock_list:
        mock_list.return_value = [
            AsyncMock(
                id=uuid.uuid4(),
                category=mock_item.category,
                title=mock_item.title,
                content=mock_item.content,
                source_name=mock_item.source_name,
                claim_type=mock_item.claim_type,
                verification_status=mock_item.verification_status,
                confidence=1.0,
                raw_value={"door_height_ft": 8},
                normalized_value={"door_height_m": 2.44},
            )
        ]

        chunks = await service.get_rag_chunks("door")
        assert len(chunks) == 1
        chunk = chunks[0]
        assert chunk["title"] == "Main Door Specification"
        assert chunk["metadata"]["category"] == "specification"
        assert chunk["metadata"]["claim_type"] == "fact"
        assert chunk["metadata"]["raw_value"]["door_height_ft"] == 8
