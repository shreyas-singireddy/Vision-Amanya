"use client";

/**
 * Floor Plan feature hooks — analytics trail preparation for Phase 7.
 *
 * No analytics are sent directly. The hook exposes a typed `trackFloorPlan`
 * function that Phase 7's analytics architecture can subscribe to. Components
 * call it at interaction boundaries; it is intentionally a no-op today.
 */

import { useCallback } from "react";

import type { FloorPlanAnalyticsEvent, FloorPlanAnalyticsPayload } from "@domain/floor-plan";
import { createLogger } from "@lib/logger";

const logger = createLogger("floorplan.analytics");

/** Phase 7 analytics sink — replace with real analytics SDK wiring here. */
export function trackFloorPlan(
  _event: FloorPlanAnalyticsEvent,
  _payload: FloorPlanAnalyticsPayload = {}
): void {
  // Phase 7: send to analytics SDK. Currently a no-op that logs in dev.
  logger.debug("track", { event: _event, ..._payload });
}

/** Convenience hook allowing components to call tracking via stable callback. */
export function useFloorPlanTracking() {
  return useCallback(
    (event: FloorPlanAnalyticsEvent, payload?: FloorPlanAnalyticsPayload) =>
      trackFloorPlan(event, payload),
    []
  );
}
