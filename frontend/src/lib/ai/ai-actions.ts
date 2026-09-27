/**
 * Strict AI Response Action Registry & Dispatcher.
 * Maps validated backend action payloads to safe frontend UI navigation and modal triggers.
 */

export enum AIActionType {
  VIEW_UNIT = "VIEW_UNIT",
  VIEW_RESIDENCE = "VIEW_RESIDENCE",
  VIEW_FLOOR_PLAN = "VIEW_FLOOR_PLAN",
  OPEN_LOCATION = "OPEN_LOCATION",
  OPEN_FINANCIAL_CALCULATOR = "OPEN_FINANCIAL_CALCULATOR",
  COMPARE_UNITS = "COMPARE_UNITS",
  SCHEDULE_SITE_VISIT = "SCHEDULE_SITE_VISIT",
  REQUEST_HUMAN = "REQUEST_HUMAN",
  NAVIGATE = "navigate",
  CHAT_PROMPT = "chat_prompt",
  OPEN_MODAL = "open_modal",
}

export interface ExecutableAIAction {
  type: AIActionType | string;
  label?: string;
  payload?: Record<string, unknown>;
}

export interface AIActionHandlers {
  onNavigate?: (url: string) => void;
  onOpenUnit?: (unitId: string) => void;
  onCompareUnits?: (unitIds: string[]) => void;
  onScheduleVisit?: (unitId?: string) => void;
  onRequestHuman?: (reason?: string) => void;
  onOpenFinancial?: (unitId?: string) => void;
}

export function executeAIAction(action: ExecutableAIAction, handlers: AIActionHandlers): boolean {
  const payload = action.payload || {};
  const actionType = action.type;

  switch (actionType) {
    case AIActionType.VIEW_UNIT:
      if (payload.unit_id && typeof payload.unit_id === "string") {
        if (handlers.onOpenUnit) {
          handlers.onOpenUnit(payload.unit_id);
        } else if (handlers.onNavigate) {
          handlers.onNavigate(`/properties/${payload.unit_id}`);
        }
        return true;
      }
      break;

    case AIActionType.VIEW_RESIDENCE:
      if (payload.residence_id && handlers.onNavigate) {
        handlers.onNavigate(`/residences#${payload.residence_id}`);
        return true;
      }
      break;

    case AIActionType.COMPARE_UNITS:
      if (Array.isArray(payload.unit_ids) && handlers.onCompareUnits) {
        handlers.onCompareUnits(payload.unit_ids as string[]);
        return true;
      }
      break;

    case AIActionType.SCHEDULE_SITE_VISIT:
      if (handlers.onScheduleVisit) {
        handlers.onScheduleVisit((payload.unit_id as string) || undefined);
        return true;
      }
      break;

    case AIActionType.REQUEST_HUMAN:
    case "handoff":
      if (handlers.onRequestHuman) {
        handlers.onRequestHuman((payload.reason as string) || "explicit_human_request");
        return true;
      }
      break;

    case AIActionType.OPEN_FINANCIAL_CALCULATOR:
      if (handlers.onOpenFinancial) {
        handlers.onOpenFinancial((payload.unit_id as string) || undefined);
        return true;
      }
      break;

    case AIActionType.OPEN_LOCATION:
      if (handlers.onNavigate) {
        handlers.onNavigate("/location");
        return true;
      }
      break;

    case AIActionType.NAVIGATE:
      if (payload.url && typeof payload.url === "string" && handlers.onNavigate) {
        handlers.onNavigate(payload.url);
        return true;
      }
      break;

    default:
      return false;
  }
  return false;
}
