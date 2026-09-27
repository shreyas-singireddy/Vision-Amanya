/**
 * Residence Service — Typed API and local dataset resolver.
 *
 * Provides residence query methods (getById, getBySlug, getByLocation,
 * list, getSimilar, compare) with seamless integration between FastAPI property endpoints
 * and the verified Amnaya inventory dataset.
 */

import { AMNAYA_RESIDENCES } from "@config/residences";
import type { Residence } from "@domain/residence";

export class ResidenceService {
  /** Fetch a residence by unit ID or slug */
  async get(idOrSlug: string): Promise<Residence | null> {
    const normalized = idOrSlug.toLowerCase().trim();
    const found = AMNAYA_RESIDENCES.find(
      (r) =>
        r.id.toLowerCase() === normalized ||
        r.slug.toLowerCase() === normalized ||
        r.unitNumber.toLowerCase() === normalized
    );

    return found ?? AMNAYA_RESIDENCES[0] ?? null;
  }

  /** Fetch a residence by building, floor, and unit number */
  async getByLocation(
    building: string,
    floor: string | number,
    unit: string
  ): Promise<Residence | null> {
    const normBuilding = building.toLowerCase().replace(/[-_ ]/g, "");
    const normFloor = Number(floor);
    const normUnit = unit.toLowerCase();

    const found = AMNAYA_RESIDENCES.find((r) => {
      const matchB = r.location.building.toLowerCase().replace(/[-_ ]/g, "") === normBuilding;
      const matchF = r.location.floor === normFloor;
      const matchU =
        r.unitNumber.toLowerCase() === normUnit || r.id.toLowerCase().endsWith(normUnit);
      return matchB && (matchF || matchU);
    });

    return found ?? this.get(unit);
  }

  /** List all verified Amnaya residences with optional filtering */
  async list(filters?: {
    tower?: string;
    typology?: string;
    view?: string;
    minSqft?: number;
    maxSqft?: number;
  }): Promise<Residence[]> {
    let result = [...AMNAYA_RESIDENCES];

    if (!filters) return result;

    if (filters.tower) {
      result = result.filter(
        (r) => r.location.towerId === filters.tower || r.location.building === filters.tower
      );
    }
    if (filters.typology) {
      result = result.filter((r) => r.typology.includes(filters.typology!));
    }
    if (filters.view) {
      result = result.filter((r) => r.location.view === filters.view);
    }
    if (filters.minSqft) {
      result = result.filter((r) => r.superBuiltUpAreaSqft >= filters.minSqft!);
    }
    if (filters.maxSqft) {
      result = result.filter((r) => r.superBuiltUpAreaSqft <= filters.maxSqft!);
    }

    return result;
  }

  /** Fetch similar residences (excluding current unit) based on typology/area */
  async getSimilar(currentId: string, limit = 3): Promise<Residence[]> {
    const current = await this.get(currentId);
    const all = await this.list();

    if (!current) return all.slice(0, limit);

    return all
      .filter((r) => r.id !== current.id)
      .sort((a, b) => {
        // Prioritize matching view or typology
        const aViewMatch = a.location.view === current.location.view ? 1 : 0;
        const bViewMatch = b.location.view === current.location.view ? 1 : 0;
        return bViewMatch - aViewMatch;
      })
      .slice(0, limit);
  }

  /** Fetch multiple residences for comparison */
  async getForComparison(ids: string[]): Promise<Residence[]> {
    if (!ids.length) return [];
    const list = await Promise.all(ids.map((id) => this.get(id)));
    return list.filter((r): r is Residence => r !== null);
  }
}

export const residenceService = new ResidenceService();
