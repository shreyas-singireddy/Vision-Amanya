"""Document Processor & Semantic Chunker for Amnaya RAG Pipeline."""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field
from typing import Any, Sequence

from app.models.enums import ClaimType, KnowledgeCategory, VerificationStatus
from app.models.knowledge import KnowledgeItem


@dataclass
class ProcessedChunk:
    """Intermediate data container representing a semantic document chunk."""

    knowledge_item_id: Any
    project_id: Any | None
    chunk_index: int
    content: str
    normalized_content: str
    content_hash: str
    category: KnowledgeCategory
    claim_type: ClaimType
    verification_status: VerificationStatus
    source_name: str
    source_reference: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


class DocumentProcessor:
    """Normalizes text and chunks Knowledge Items into coherent, metadata-rich RAG chunks."""

    @staticmethod
    def normalize_text(text: str) -> str:
        """Normalize whitespace, sanitize characters, and standardize architectural units."""
        if not text:
            return ""
        # Preserve specific architectural measurements (e.g. 4 x 6 -> 4x6)
        cleaned = re.sub(r"(\d+)\s*[\text×]\s*(\d+)", r"\1x\2", text)
        # Collapse multi-whitespace
        cleaned = re.sub(r"\s+", " ", cleaned)
        return cleaned.strip()

    @staticmethod
    def compute_content_hash(
        normalized_content: str,
        category: str,
        claim_type: str,
        source_name: str,
    ) -> str:
        """Compute deterministic SHA-256 hash for incremental indexing duplicate prevention."""
        raw_payload = f"{normalized_content}|{category}|{claim_type}|{source_name}"
        return hashlib.sha256(raw_payload.encode("utf-8")).hexdigest()

    def process_item(self, item: KnowledgeItem) -> list[ProcessedChunk]:
        """Chunk a canonical KnowledgeItem preserving semantic coherent blocks and taxonomy."""
        normalized_title = self.normalize_text(item.title)
        normalized_body = self.normalize_text(item.content)

        full_content = f"{item.title}\n{item.content}"
        normalized_full = f"{normalized_title} - {normalized_body}"

        # Compute deterministic content hash
        chash = self.compute_content_hash(
            normalized_full,
            item.category.value,
            item.claim_type.value,
            item.source_name,
        )

        chunk_metadata = {
            "title": item.title,
            "confidence": item.confidence,
            "raw_value": item.raw_value,
            "normalized_value": item.normalized_value,
            "source_version": item.source_version,
        }

        # Keep coherent facts in a single structured chunk
        processed = ProcessedChunk(
            knowledge_item_id=item.id,
            project_id=item.project_id,
            chunk_index=0,
            content=full_content,
            normalized_content=normalized_full,
            content_hash=chash,
            category=item.category,
            claim_type=item.claim_type,
            verification_status=item.verification_status,
            source_name=item.source_name,
            source_reference=item.source_reference,
            metadata=chunk_metadata,
        )

        return [processed]
