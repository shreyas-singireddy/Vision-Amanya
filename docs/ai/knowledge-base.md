# CANONICAL AMNAYA AI KNOWLEDGE BASE — PHASE 7.1 SPECIFICATION

> **Phase Status:** Completed ✅
> **Last Updated:** 2026-08-25

---

## 1. Executive Summary

Phase 7.1 establishes the canonical **Knowledge Base Architecture** for the **Vision Amnaya** AI Consultant platform.

It separates transactional property inventory (`projects`, `towers`, `properties`, `bookings`) from narrative project knowledge (`ai_knowledge_items`), while establishing strict claim classification taxonomy, provenance tracking, and missing information boundaries to prevent AI hallucination.

---

## 2. Canonical Hierarchy

```text
AMNAYA CANONICAL KNOWLEDGE
│
├── Project Identity (Name: Vision Amnaya, Developer: Vision Infra Developers)
├── Project Overview (5.3 Acres, 420 total units, 10 floors)
├── Location (Khajaguda–Raidurg, Cyberabad, Hyderabad)
├── Planning & Density (Low-density 79 units/acre, Cyberabad Comparative Claim)
├── Lake & Landscape (25-acre natural lake view, 2-acre central park garden)
├── Residences (3 BHK exclusive, 1,715 sq ft to 2,590 sq ft)
├── Specifications (8-ft main door, 4 × 6 ft ceramic tiles, high-grade aluminium windows)
├── Marketing Positioning ("Escape the Sky Jungles", "Horizontal Luxury", "Open Skies")
└── Missing Information Markers (Pricing, RERA #, balcony dimensions, tile brand)
```

---

## 3. Claim Classification Taxonomy

Every knowledge item is tagged with a `claim_type`:

| Claim Type | Description | Example |
| :--- | :--- | :--- |
| `FACT` | Verifiable objective metric or specification | 5.3 acres land area, 420 3 BHK apartments, 8-ft doors |
| `MARKETING_CLAIM` | Brand positioning language or brand narrative | "Escape the Sky Jungles", "Horizontal Luxury" |
| `COMPARATIVE_CLAIM` | Relative positioning requiring market validation | "One of the lowest-density luxury gated developments in Cyberabad" |
| `LIFESTYLE_CLAIM` | Experiential description | "Wake up to continuous cool lake breezes" |
| `UNKNOWN` | Mandatory missing data marker | Official unit price list, RERA registration certificate # |

---

## 4. Verification Status Taxonomy

| Status | Meaning |
| :--- | :--- |
| `VERIFIED` | Confirmed by official RERA or architect architectural drawings |
| `PROVIDED_UNVERIFIED` | Supplied in official project material, pending final legal review |
| `REQUIRES_VERIFICATION` | Data is missing or incomplete; AI must acknowledge as unverified |
| `DEPRECATED` | Historical information superseded by newer specs |

---

## 5. Registry of Missing Information

The following items are intentionally marked `REQUIRES_VERIFICATION` / `UNKNOWN` in the canonical database:

1. **Official Unit Price List & Payment Schedules**: AI must direct pricing questions to an official Amnaya Relationship Manager.
2. **RERA Certificate Number**: RERA registration status is marked pending official certificate publication.
3. **Balcony & Carpet Area Breakdown per Unit**: Only total size range (1,715–2,590 sq.ft.) is verified.
4. **Tile & Aluminium Window Manufacturers**: Brand names and acoustic decibel ratings require final architect specification sheets.

---

## 6. Phase 7.2 RAG Integration Boundary

Knowledge items are exposed via `KnowledgeService.get_rag_chunks()`.

Each chunk returns:
```json
{
  "chunk_id": "00000000-0000-0000-0000-000000000000",
  "title": "Main Door Specification",
  "content": "Residences feature 8-foot-tall grand main entrance doors.",
  "metadata": {
    "category": "specification",
    "claim_type": "fact",
    "verification_status": "provided_unverified",
    "source_name": "Amnaya Project Material — User Supplied",
    "confidence": 1.0,
    "raw_value": { "door_height_ft": 8 },
    "normalized_value": { "door_height_m": 2.44 }
  }
}
```
Phase 7.2 vector store pipelines (Chroma / FAISS) can ingest these normalized chunks directly for semantic search and RAG citations.
