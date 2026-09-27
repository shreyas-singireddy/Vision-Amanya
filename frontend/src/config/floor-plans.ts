/**
 * Amnaya Floor Plan Dataset — Phase 6.5 Interactive Floor Plans.
 *
 * ⚠️ DATA STATUS
 * ─────────────
 * The Amnaya source PDF contains raster floor-plan images only. No vector SVG,
 * DWG or DXF files with embedded unit boundaries exist in the repository.
 *
 * The unit, floor and building data below is therefore a DEVELOPMENT MOCK
 * dataset. It is:
 *   • consistent with the verified `AMNAYA_RESIDENCES` inventory in
 *     `config/residences.ts` (unit numbers, areas, orientations),
 *   • clearly documented as representative — it is NOT real tower unit
 *     placement data,
 *   • driven by the same `FloorPlanUnit` contract that a future real dataset
 *     will satisfy.
 *
 * The 1000×1000 normalized stage is an approximate 4-unit-per-floor schematic
 * block. When real CAD/SVG plans arrive, replace ONLY the coordinates here.
 */

import { projectAssets } from "./project";
import type { FloorPlanDataset, FloorPlanFloor, FloorPlanUnit } from "@domain/floor-plan";
import type { UnitBoundary } from "@domain/floor-plan";

/**
 * Construct a typical 4-unit floor block.
 *
 * Units are rectangles in a 1000×1000 normalized stage:
 *   ┌─────────────────────────────┐
 *   │  Unit 01      Unit 02       │
 *   │  (NW)         (NE)          │
 *   ├─────────────────────────────┤
 *   │  Unit 04      Unit 03       │
 *   │  (SW)         (SE)          │
 *   └─────────────────────────────┘
 */
function buildUnit(
  id: string,
  unitNumber: string,
  availability: FloorPlanUnit["availability"],
  typology: string,
  carpetAreaSqft: number,
  superBuiltUpAreaSqft: number,
  facing: string,
  view: FloorPlanUnit["view"],
  x: number,
  y: number,
  w: number,
  h: number
): FloorPlanUnit {
  const polygon = `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const boundary: UnitBoundary = {
    labelX: cx,
    labelY: cy,
    centroidX: cx,
    centroidY: cy,
    polygon,
  };
  return {
    id,
    unitNumber,
    availability,
    typology,
    carpetAreaSqft,
    superBuiltUpAreaSqft,
    facing,
    view,
    boundary,
  };
}

/** Builds the standard four-unit floor layout for a tower. */
function buildFloor(
  buildingKey: string,
  floorNumber: number,
  units: FloorPlanUnit[]
): FloorPlanFloor {
  const pad = String(floorNumber).padStart(2, "0");
  return {
    id: `${buildingKey}-F${pad}`,
    floorNumber,
    label: `Floor ${pad}`,
    assetUrl: projectAssets.blockPlan,
    assetAlt: `Amnaya ${buildingKey.replace(/-/g, " ")} — typical floor ${floorNumber} block plan`,
    kind: "raster",
    units,
  };
}

/** Tower A — representative 4-unit floors. */
const TOWER_A_UNITS: Record<number, FloorPlanUnit[]> = {
  4: [
    buildUnit(
      "A-0401",
      "0401",
      "available",
      "3 BHK Type A",
      1260,
      1715,
      "North",
      "Garden View",
      80,
      160,
      360,
      300
    ),
    buildUnit(
      "A-0402",
      "0402",
      "reserved",
      "3 BHK Type B",
      1540,
      2100,
      "East",
      "Lake View",
      470,
      160,
      450,
      300
    ),
    buildUnit(
      "A-0403",
      "0403",
      "available",
      "3 BHK Type B",
      1540,
      2100,
      "West",
      "Garden View",
      470,
      520,
      450,
      300
    ),
    buildUnit(
      "A-0404",
      "0404",
      "sold",
      "3 BHK Type C",
      1910,
      2590,
      "South",
      "Dual Aspect",
      80,
      520,
      330,
      300
    ),
  ],
  6: [
    buildUnit(
      "A-0601",
      "0601",
      "available",
      "3 BHK Type B",
      1540,
      2100,
      "North",
      "Lake View",
      80,
      200,
      260,
      300
    ),
    buildUnit(
      "A-0602",
      "0602",
      "available",
      "3 BHK Type A",
      1260,
      1715,
      "East",
      "Garden View",
      470,
      160,
      450,
      300
    ),
    buildUnit(
      "A-0603",
      "0603",
      "sold",
      "3 BHK Type B",
      1540,
      2100,
      "West",
      "Garden View",
      470,
      520,
      450,
      300
    ),
    buildUnit(
      "A-0604",
      "0604",
      "reserved",
      "3 BHK Type C",
      1910,
      2590,
      "South-East",
      "Dual Aspect",
      80,
      520,
      330,
      300
    ),
  ],
  9: [
    buildUnit(
      "A-0901",
      "0901",
      "sold",
      "3 BHK Type A",
      1260,
      1715,
      "North",
      "Garden View",
      80,
      200,
      260,
      300
    ),
    buildUnit(
      "A-0902",
      "0902",
      "available",
      "3 BHK Type B",
      1540,
      2100,
      "East",
      "Lake View",
      470,
      160,
      450,
      300
    ),
    buildUnit(
      "A-0903",
      "0903",
      "available",
      "3 BHK Type C",
      1910,
      2590,
      "West",
      "Lake View",
      470,
      520,
      450,
      300
    ),
    buildUnit(
      "A-0904",
      "0904",
      "reserved",
      "3 BHK Type B",
      1540,
      2100,
      "South-West",
      "Garden View",
      80,
      520,
      330,
      300
    ),
  ],
  10: [
    buildUnit(
      "A-1001",
      "1001",
      "available",
      "3 BHK Type A",
      1260,
      1715,
      "North",
      "Garden View",
      80,
      200,
      260,
      300
    ),
    buildUnit(
      "A-1002",
      "1002",
      "reserved",
      "3 BHK Type B",
      1540,
      2100,
      "East",
      "Lake View",
      470,
      160,
      450,
      300
    ),
    buildUnit(
      "A-1003",
      "1003",
      "available",
      "3 BHK Type B",
      1540,
      2100,
      "West",
      "Lake View",
      470,
      520,
      450,
      300
    ),
    buildUnit(
      "A-1004",
      "1004",
      "available",
      "3 BHK Type C",
      1910,
      2590,
      "South-East",
      "Dual Aspect",
      80,
      520,
      330,
      300
    ),
  ],
};

/** Tower B representative inventory. */
const TOWER_B_UNITS: Record<number, FloorPlanUnit[]> = {
  4: [
    buildUnit(
      "B-0401",
      "0401",
      "reserved",
      "3 BHK Type A",
      1260,
      1715,
      "East",
      "Garden View",
      80,
      200,
      260,
      300
    ),
    buildUnit(
      "B-0402",
      "0402",
      "available",
      "3 BHK Type B",
      1540,
      2100,
      "North",
      "Lake View",
      470,
      160,
      450,
      300
    ),
    buildUnit(
      "B-0403",
      "0403",
      "available",
      "3 BHK Type A",
      1260,
      1715,
      "West",
      "Garden View",
      470,
      520,
      450,
      300
    ),
    buildUnit(
      "B-0404",
      "0404",
      "sold",
      "3 BHK Type B",
      1540,
      2100,
      "South",
      "Garden View",
      80,
      520,
      330,
      300
    ),
  ],
  6: [
    buildUnit(
      "B-0601",
      "0601",
      "reserved",
      "3 BHK Type B",
      1540,
      2100,
      "East",
      "Lake View",
      80,
      200,
      260,
      300
    ),
    buildUnit(
      "B-0602",
      "0602",
      "available",
      "3 BHK Type A",
      1260,
      1715,
      "North",
      "Garden View",
      470,
      160,
      450,
      300
    ),
    buildUnit(
      "B-0603",
      "0603",
      "available",
      "3 BHK Type B",
      1540,
      2100,
      "West",
      "Garden View",
      470,
      520,
      450,
      300
    ),
    buildUnit(
      "B-0604",
      "0604",
      "sold",
      "3 BHK Type C",
      1910,
      2590,
      "South",
      "Dual Aspect",
      80,
      520,
      330,
      300
    ),
  ],
  9: [
    buildUnit(
      "B-0901",
      "0901",
      "available",
      "3 BHK Type A",
      1260,
      1715,
      "East",
      "Garden View",
      80,
      200,
      260,
      300
    ),
    buildUnit(
      "B-0902",
      "0902",
      "available",
      "3 BHK Type B",
      1540,
      2100,
      "North",
      "Lake View",
      470,
      160,
      450,
      300
    ),
    buildUnit(
      "B-0903",
      "0903",
      "reserved",
      "3 BHK Type B",
      1540,
      2100,
      "West",
      "Garden View",
      470,
      520,
      450,
      300
    ),
    buildUnit(
      "B-0904",
      "0904",
      "sold",
      "3 BHK Type C",
      1910,
      2590,
      "South-East",
      "Dual Aspect",
      80,
      520,
      330,
      300
    ),
  ],
  10: [
    buildUnit(
      "B-1001",
      "1001",
      "available",
      "3 BHK Type B",
      1540,
      2100,
      "East",
      "Lake View",
      80,
      200,
      260,
      300
    ),
    buildUnit(
      "B-1002",
      "1002",
      "reserved",
      "3 BHK Type A",
      1260,
      1715,
      "North",
      "Garden View",
      470,
      160,
      450,
      300
    ),
    buildUnit(
      "B-1003",
      "1003",
      "available",
      "3 BHK Type C",
      1910,
      2590,
      "West",
      "Lake View",
      470,
      520,
      450,
      300
    ),
    buildUnit(
      "B-1004",
      "1004",
      "sold",
      "3 BHK Type B",
      1540,
      2100,
      "South-West",
      "Dual Aspect",
      80,
      520,
      330,
      300
    ),
  ],
};

/** Tower C representative inventory. */
const TOWER_C_UNITS: Record<number, FloorPlanUnit[]> = {
  9: [
    buildUnit(
      "C-0901",
      "0901",
      "available",
      "3 BHK Type C",
      1910,
      2590,
      "North-West",
      "Dual Aspect",
      80,
      200,
      260,
      300
    ),
    buildUnit(
      "C-0902",
      "0902",
      "available",
      "3 BHK Type B",
      1540,
      2100,
      "North-East",
      "Lake View",
      470,
      160,
      450,
      300
    ),
    buildUnit(
      "C-0903",
      "0903",
      "reserved",
      "3 BHK Type B",
      1540,
      2100,
      "West",
      "Garden View",
      470,
      520,
      450,
      300
    ),
    buildUnit(
      "C-0904",
      "0904",
      "sold",
      "3 BHK Type A",
      1260,
      1715,
      "South",
      "Garden View",
      80,
      520,
      330,
      300
    ),
  ],
  10: [
    buildUnit(
      "C-1001",
      "1001",
      "sold",
      "3 BHK Type B",
      1540,
      2100,
      "North-East",
      "Lake View",
      80,
      200,
      260,
      300
    ),
    buildUnit(
      "C-1002",
      "1002",
      "available",
      "3 BHK Type C",
      1910,
      2590,
      "North-West",
      "Dual Aspect",
      470,
      160,
      450,
      300
    ),
    buildUnit(
      "C-1003",
      "1003",
      "available",
      "3 BHK Type A",
      1260,
      1715,
      "West",
      "Garden View",
      470,
      520,
      450,
      300
    ),
    buildUnit(
      "C-1004",
      "1004",
      "reserved",
      "3 BHK Type B",
      1540,
      2100,
      "South-East",
      "Dual Aspect",
      80,
      520,
      330,
      300
    ),
  ],
};

/** Tower D representative inventory. */
const TOWER_D_UNITS: Record<number, FloorPlanUnit[]> = {
  6: [
    buildUnit(
      "D-0601",
      "0601",
      "available",
      "3 BHK Type B",
      1540,
      2100,
      "North",
      "Lake View",
      80,
      200,
      260,
      300
    ),
    buildUnit(
      "D-0602",
      "0602",
      "reserved",
      "3 BHK Type A",
      1260,
      1715,
      "East",
      "Garden View",
      470,
      160,
      450,
      300
    ),
    buildUnit(
      "D-0603",
      "0603",
      "available",
      "3 BHK Type B",
      1540,
      2100,
      "West",
      "Lake View",
      470,
      520,
      450,
      300
    ),
    buildUnit(
      "D-0604",
      "0604",
      "sold",
      "3 BHK Type C",
      1910,
      2590,
      "South-East",
      "Dual Aspect",
      80,
      520,
      330,
      300
    ),
  ],
  8: [
    buildUnit(
      "D-0801",
      "0801",
      "available",
      "3 BHK Type B",
      1540,
      2100,
      "North",
      "Lake View",
      80,
      200,
      260,
      300
    ),
    buildUnit(
      "D-0802",
      "0802",
      "available",
      "3 BHK Type A",
      1260,
      1715,
      "East",
      "Garden View",
      470,
      160,
      450,
      300
    ),
    buildUnit(
      "D-0803",
      "0803",
      "sold",
      "3 BHK Type B",
      1540,
      2100,
      "West",
      "Garden View",
      470,
      520,
      450,
      300
    ),
    buildUnit(
      "D-0804",
      "0804",
      "reserved",
      "3 BHK Type C",
      1910,
      2590,
      "South-East",
      "Dual Aspect",
      80,
      520,
      330,
      300
    ),
  ],
  10: [
    buildUnit(
      "D-1001",
      "1001",
      "reserved",
      "3 BHK Type A",
      1260,
      1715,
      "North",
      "Garden View",
      80,
      200,
      260,
      300
    ),
    buildUnit(
      "D-1002",
      "1002",
      "available",
      "3 BHK Type B",
      1540,
      2100,
      "East",
      "Lake View",
      470,
      160,
      450,
      300
    ),
    buildUnit(
      "D-1003",
      "1003",
      "sold",
      "3 BHK Type B",
      1540,
      2100,
      "West",
      "Garden View",
      470,
      520,
      450,
      300
    ),
    buildUnit(
      "D-1004",
      "1004",
      "available",
      "3 BHK Type C",
      1910,
      2590,
      "South-East",
      "Dual Aspect",
      80,
      520,
      330,
      300
    ),
  ],
};

/** Create floors 1–10 for a tower, populating unit data where verified. */
function createTowerFloors(
  towerKey: string,
  unitsByFloor: Record<number, FloorPlanUnit[]>
): FloorPlanFloor[] {
  const floors: FloorPlanFloor[] = [];
  for (let floor = 10; floor >= 1; floor -= 1) {
    floors.push(buildFloor(towerKey, floor, unitsByFloor[floor] ?? []));
  }
  return floors;
}

/**
 * The full Phase 6.5 development dataset.
 *
 * NOTE: `assetUrl` points at the real verified Amnaya block-plan raster asset
 * for all floors. Unit coordinates are representative DEVELOPMENT MOCK
 * boundaries — they are not extracted from a real floor plan SVG.
 */
export const FLOOR_PLAN_DATASET: FloorPlanDataset = {
  projectName: "Amnaya",
  projectDescription:
    "420 premium 3 BHK residences across four 10-floor towers, framed by 2 acres of central garden and 25 acres of lake view.",
  buildings: [
    {
      id: "Tower-A",
      name: "Tower A",
      shortLabel: "A",
      totalFloors: 10,
      floors: createTowerFloors("Tower-A", TOWER_A_UNITS),
    },
    {
      id: "Tower-B",
      name: "Tower B",
      shortLabel: "B",
      totalFloors: 10,
      floors: createTowerFloors("Tower-B", TOWER_B_UNITS),
    },
    {
      id: "Tower-C",
      name: "Tower C",
      shortLabel: "C",
      totalFloors: 10,
      floors: createTowerFloors("Tower-C", TOWER_C_UNITS),
    },
    {
      id: "Tower-D",
      name: "Tower D",
      shortLabel: "D",
      totalFloors: 10,
      floors: createTowerFloors("Tower-D", TOWER_D_UNITS),
    },
  ],
};
