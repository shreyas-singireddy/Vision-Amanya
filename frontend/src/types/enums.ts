/**
 * Domain enums mirrored from the FastAPI backend (`app/models/enums.py`).
 * Values are the string literals the API accepts and returns.
 *
 * Keep this file in lock-step with the backend enum module. When the backend
 * adds/renames a value, update it here and the strict string-literal types
 * will surface every affected call site at compile time.
 */

export type ProjectType = "residential" | "commercial" | "mixed_use";

export type ProjectStatus = "upcoming" | "under_construction" | "ready_to_move";

export type ListingType = "sale" | "rent" | "lease";

export type ListingStatus =
  "draft" | "published" | "under_offer" | "reserved" | "sold" | "rented" | "withdrawn";

export type FurnishingStatus = "unfurnished" | "semi_furnished" | "furnished";

export type PropertyImageType = "image" | "floor_plan" | "virtual_tour" | "other";

export type EnquiryStatus = "new" | "in_progress" | "closed" | "converted";

export type LeadStatus =
  "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

export type LeadPriority = "low" | "medium" | "high" | "urgent";

export type InterestType = "sale" | "rent" | "investment";

export type VisitType = "site_visit" | "virtual_tour" | "call";

export type BookingStatus = "requested" | "confirmed" | "completed" | "cancelled" | "no_show";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type NotificationType = "email" | "push" | "sms" | "in_app";

export type NotificationCategory =
  "lead_assigned" | "property_update" | "enquiry_reply" | "booking_confirm" | "system";

export type NotificationStatus = "pending" | "sent" | "failed" | "delivered" | "read";

export type ChatSessionStatus = "active" | "closed";

export type ChatMessageRole = "user" | "assistant" | "system" | "tool";

export type KnowledgeDocumentType =
  "brochure" | "floor_plan" | "legal" | "rera" | "faq" | "website_content";

export type KnowledgeDocumentStatus = "pending" | "processing" | "ready" | "failed";

export type StorageProvider = "local" | "s3" | "gcs" | "azure";

export type FileCategory = "image" | "document" | "video" | "avatar";

export type AccessLevel = "public" | "private";

export type AgentStatus = "active" | "inactive";
