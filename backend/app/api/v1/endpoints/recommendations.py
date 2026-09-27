"""API Endpoint for Intelligent Unit Recommendations."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.recommendation_engine import RecommendationEngine
from app.api.deps import get_db
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse

router = APIRouter()


@router.post(
    "",
    response_model=RecommendationResponse,
    summary="Get intelligent Amnaya unit recommendations",
    description="Executes hard constraint filtering and soft preference scoring over real Amnaya inventory.",
)
async def get_unit_recommendations(
    payload: RecommendationRequest,
    db: AsyncSession = Depends(get_db),
) -> RecommendationResponse:
    """Generate deterministic recommendations for user property preferences."""
    engine = RecommendationEngine(db)
    return await engine.recommend(payload)
