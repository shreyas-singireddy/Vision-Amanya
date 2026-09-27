"""Hybrid Retriever & Source Priority Reranker for Amnaya RAG Pipeline."""

from __future__ import annotations

import math
import uuid
from dataclasses import dataclass, field
from typing import Any, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.rag.embeddings import BaseEmbeddingProvider, ConfigurableEmbeddingProvider
from app.models.enums import ClaimType, KnowledgeCategory, VerificationStatus
from app.models.knowledge import RAGChunk


@dataclass
class RetrievedChunk:
    """Retrieved RAG Chunk payload with similarity score and provenance."""

    chunk_id: uuid.UUID
    knowledge_item_id: uuid.UUID
    content: str
    normalized_content: str
    category: KnowledgeCategory
    claim_type: ClaimType
    verification_status: VerificationStatus
    source_name: str
    similarity_score: float
    keyword_score: float
    final_score: float
    metadata: dict[str, Any] = field(default_factory=dict)


class HybridRetriever:
    """Hybrid Retriever combining Cosine Vector Similarity, Keyword Match, and Source Priority Reranking."""

    def __init__(
        self,
        session: AsyncSession,
        embedding_provider: BaseEmbeddingProvider | None = None,
    ) -> None:
        self.session = session
        self.embedding_provider = embedding_provider or ConfigurableEmbeddingProvider()

    @staticmethod
    def _cosine_similarity(v1: list[float], v2: list[float]) -> float:
        """Compute cosine similarity between two float vectors."""
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2, strict=False))
        mag1 = math.sqrt(sum(a * a for a in v1))
        mag2 = math.sqrt(sum(b * b for b in v2))
        if mag1 == 0 or mag2 == 0:
            return 0.0
        return dot / (mag1 * mag2)

    # Minimal English stopword set - excluded from keyword overlap so generic
    # question words ("what", "the", "is") cannot fabricate relevance.
    _STOPWORDS: frozenset[str] = frozenset(
        {
            "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do",
            "does", "for", "from", "had", "has", "have", "how", "i", "in", "is",
            "it", "its", "me", "my", "of", "on", "or", "our", "s", "tell",
            "that", "the", "their", "them", "there", "these", "they", "this",
            "to", "was", "we", "were", "what", "when", "where", "which", "who",
            "why", "will", "with", "you", "your",
        }
    )

    @staticmethod
    def _compute_keyword_score(query: str, content: str) -> float:
        """Calculate word overlap / trigram keyword matching score.

        Stopword query tokens are ignored so that relevance reflects
        content-bearing terms only (e.g. "amenities", "possession").
        """
        q_tokens = {
            tok.strip(".,!?;:?")
            for tok in query.lower().split()
        } - HybridRetriever._STOPWORDS
        q_tokens = {tok for tok in q_tokens if tok}
        if not q_tokens:
            return 0.0
        c_text = content.lower()
        matched = sum(1 for tok in q_tokens if tok in c_text)
        return matched / len(q_tokens)

    @staticmethod
    def _source_priority_weight(claim_type: ClaimType, verification_status: VerificationStatus) -> float:
        """Reranking weight prioritizing verified facts over marketing claims."""
        weight = 1.0
        # Verification boost
        if verification_status == VerificationStatus.VERIFIED:
            weight += 0.2
        elif verification_status == VerificationStatus.PROVIDED_UNVERIFIED:
            weight += 0.1
        elif verification_status == VerificationStatus.REQUIRES_VERIFICATION:
            weight -= 0.1

        # Claim type weighting
        if claim_type == ClaimType.FACT:
            weight += 0.15
        elif claim_type == ClaimType.COMPARATIVE_CLAIM:
            weight += 0.05
        elif claim_type == ClaimType.MARKETING_CLAIM:
            weight += 0.0
        elif claim_type == ClaimType.UNKNOWN:
            weight -= 0.2

        return weight

    async def retrieve(
        self,
        query: str,
        *,
        project_id: uuid.UUID | None = None,
        category: KnowledgeCategory | None = None,
        claim_type: ClaimType | None = None,
        verification_status: VerificationStatus | None = None,
        top_k: int = 5,
        candidate_k: int = 200,
    ) -> list[RetrievedChunk]:
        """Perform hybrid retrieval with vector similarity, keyword matching, and source reranking.

        ``candidate_k`` bounds the SQL pre-filter stage; similarity scoring happens
        in Python over the fetched candidates, so the window must be wide enough to
        contain the globally best matches (embeddings live in JSONB, no ANN index).
        """
        query_vector = self.embedding_provider.embed_query(query)

        # 1. Fetch candidate RAG chunks matching metadata filters
        stmt = select(RAGChunk)
        if project_id:
            stmt = stmt.where(RAGChunk.project_id == project_id)
        if category:
            stmt = stmt.where(RAGChunk.category == category)
        if claim_type:
            stmt = stmt.where(RAGChunk.claim_type == claim_type)
        if verification_status:
            stmt = stmt.where(RAGChunk.verification_status == verification_status)

        stmt = stmt.limit(candidate_k)
        result = await self.session.scalars(stmt)
        chunks: Sequence[RAGChunk] = result.all()

        retrieved_list: list[RetrievedChunk] = []

        # 2. Score candidates
        for chunk in chunks:
            sim_score = self._cosine_similarity(query_vector, chunk.embedding or [])
            kw_score = self._compute_keyword_score(query, chunk.normalized_content)
            weight = self._source_priority_weight(chunk.claim_type, chunk.verification_status)

            # Combined score: 60% semantic + 40% keyword * source weight
            raw_score = (0.60 * sim_score) + (0.40 * kw_score)
            final_score = raw_score * weight

            retrieved_list.append(
                RetrievedChunk(
                    chunk_id=chunk.id,
                    knowledge_item_id=chunk.knowledge_item_id,
                    content=chunk.content,
                    normalized_content=chunk.normalized_content,
                    category=chunk.category,
                    claim_type=chunk.claim_type,
                    verification_status=chunk.verification_status,
                    source_name=chunk.source_name,
                    similarity_score=sim_score,
                    keyword_score=kw_score,
                    final_score=final_score,
                    metadata=chunk.metadata_ or {},
                )
            )

        # 3. Rerank descending by final score
        retrieved_list.sort(key=lambda c: c.final_score, reverse=True)
        return retrieved_list[:top_k]
