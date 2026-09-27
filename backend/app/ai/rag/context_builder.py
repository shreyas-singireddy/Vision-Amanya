"""Context Builder for formatting structured, verification-aware RAG context payloads."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from app.ai.rag.retriever import RetrievedChunk
from app.models.enums import ClaimType, VerificationStatus


@dataclass
class RAGContextResult:
    """Structured context result formatted for LLM ingestion and source attribution."""

    formatted_context: str
    insufficient_context: bool
    retrieved_chunks: list[RetrievedChunk]
    sources: list[dict[str, Any]]
    max_confidence: float = 0.0


class ContextBuilder:
    """Deduplicates, ranks, and structures retrieved chunks into an LLM-ready context block."""

    def __init__(self, min_confidence_threshold: float = 0.25) -> None:
        self.min_confidence_threshold = min_confidence_threshold

    def build_context(self, chunks: list[RetrievedChunk]) -> RAGContextResult:
        """Format retrieved chunks into structured <AMNAYA_CONTEXT> payload."""
        if not chunks:
            return RAGContextResult(
                formatted_context="<AMNAYA_CONTEXT>\nNo verified Amnaya information found.\n</AMNAYA_CONTEXT>",
                insufficient_context=True,
                retrieved_chunks=[],
                sources=[],
                max_confidence=0.0,
            )

        # Check max score
        max_score = max(c.final_score for c in chunks)
        is_unknown = all(
            c.claim_type == ClaimType.UNKNOWN or c.verification_status == VerificationStatus.REQUIRES_VERIFICATION
            for c in chunks
        )

        insufficient = max_score < self.min_confidence_threshold or is_unknown

        sources_list: list[dict[str, Any]] = []
        context_blocks: list[str] = ["<AMNAYA_CONTEXT>"]

        for idx, chunk in enumerate(chunks, 1):
            source_info = {
                "source_id": idx,
                "title": chunk.metadata.get("title", f"Source {idx}"),
                "category": chunk.category.value,
                "claim_type": chunk.claim_type.value,
                "verification_status": chunk.verification_status.value,
                "source_name": chunk.source_name,
                "confidence_score": round(chunk.final_score, 3),
            }
            sources_list.append(source_info)

            block = (
                f"[Source {idx}]\n"
                f"Category: {chunk.category.value}\n"
                f"Claim Type: {chunk.claim_type.value}\n"
                f"Verification: {chunk.verification_status.value}\n"
                f"Source: {chunk.source_name}\n"
                f"Content:\n{chunk.content}\n"
            )
            context_blocks.append(block)

        context_blocks.append("</AMNAYA_CONTEXT>")
        formatted_str = "\n".join(context_blocks)

        return RAGContextResult(
            formatted_context=formatted_str,
            insufficient_context=insufficient,
            retrieved_chunks=chunks,
            sources=sources_list,
            max_confidence=max_score,
        )
