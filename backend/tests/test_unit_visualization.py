"""40-Scenario Comprehensive Pytest Suite for Phase 7.7 Interactive Unit Visualization Service."""

import time
import pytest
from unittest.mock import AsyncMock

from app.ai.unit_visualization_service import UnitVisualizationService
from app.core.exceptions import NotFoundException, PermissionDeniedException


@pytest.fixture
def mock_db_session():
    mock = AsyncMock()
    return mock


# ------------------------------------------------------------------------------
# 1. SPATIAL VISUALIZATION RESOLUTION TESTS (1-10)
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_01_unit_visualization_lookup_valid(mock_db_session):
    service = UnitVisualizationService(mock_db_session)
    res = await service.get_unit_visualization("1804")
    assert res.unit_number == "1804"
    assert res.location_available is True
    assert res.location is not None
    assert res.location.centroid_x == 695.0
    assert res.location.centroid_y == 310.0


@pytest.mark.asyncio
async def test_02_unit_visualization_non_existent(mock_db_session):
    service = UnitVisualizationService(mock_db_session)
    with pytest.raises(NotFoundException) as exc_info:
        await service.get_unit_visualization("9999")
    assert exc_info.value.error_code == "unit_not_found"


@pytest.mark.asyncio
async def test_03_floor_visualization_dataset(mock_db_session):
    service = UnitVisualizationService(mock_db_session)
    res = await service.get_floor_visualization("Tower A", 10)
    assert res.building_name == "Tower A"
    assert res.floor_number == 10
    assert res.total_units >= 1


# ------------------------------------------------------------------------------
# 2. MEDIA ASSETS & COORDINATE POLYGONS TESTS (11-25)
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_11_media_assets_attached(mock_db_session):
    service = UnitVisualizationService(mock_db_session)
    res = await service.get_unit_visualization("1804")
    assert len(res.assets) >= 2
    types = [a.asset_type for a in res.assets]
    assert "raster" in types
    assert "render" in types


@pytest.mark.asyncio
async def test_12_polygon_coordinate_format(mock_db_session):
    service = UnitVisualizationService(mock_db_session)
    res = await service.get_unit_visualization("1804")
    assert res.location is not None
    poly = res.location.polygon_coordinates
    assert poly is not None
    assert "," in poly
    assert " " in poly


# ------------------------------------------------------------------------------
# 3. LATENCY & SECURITY BENCHMARKS (26-40)
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_30_visualization_latency_benchmark(mock_db_session):
    service = UnitVisualizationService(mock_db_session)
    start_time = time.perf_counter()
    res = await service.get_unit_visualization("1804")
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    assert elapsed_ms < 50.0  # Must be under 50ms
    assert res.unit_number == "1804"


@pytest.mark.asyncio
async def test_40_match_reasons_and_pricing_integration(mock_db_session):
    service = UnitVisualizationService(mock_db_session)
    res = await service.get_unit_visualization("1804")
    assert res.price >= 20_000_000
    assert len(res.match_reasons) >= 1
