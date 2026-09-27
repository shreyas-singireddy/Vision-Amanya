"""Embedding provider abstraction layer for Amnaya RAG subsystem."""

from __future__ import annotations

import abc
import hashlib
import math
import os
from typing import Sequence


class BaseEmbeddingProvider(abc.ABC):
    """Abstract interface for RAG vector embedding generation."""

    @abc.abstractmethod
    def embed_document(self, text: str) -> list[float]:
        """Generate embedding vector for a single document chunk."""
        pass

    @abc.abstractmethod
    def embed_documents(self, texts: Sequence[str]) -> list[list[float]]:
        """Generate embedding vectors for multiple document chunks."""
        pass

    @abc.abstractmethod
    def embed_query(self, query: str) -> list[float]:
        """Generate embedding vector for a search query."""
        pass

    @property
    @abc.abstractmethod
    def dimension(self) -> int:
        """Return the vector dimension (e.g. 384)."""
        pass


class ConfigurableEmbeddingProvider(BaseEmbeddingProvider):
    """Configurable embedding provider supporting SentenceTransformers or deterministic semantic hashing fallback."""

    def __init__(
        self,
        model_name: str | None = None,
        dimension: int = 384,
    ) -> None:
        self._model_name = model_name or os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        self._dimension = dimension
        self._st_model = None

        # Attempt optional loading of SentenceTransformers if installed
        try:
            from sentence_transformers import SentenceTransformer
            self._st_model = SentenceTransformer(self._model_name)
        except Exception:
            self._st_model = None

    @property
    def dimension(self) -> int:
        return self._dimension

    def _generate_fallback_vector(self, text: str) -> list[float]:
        """Generates a normalized, deterministic 384-dim semantic feature vector.

        Uses trigram positional hashing so semantically similar phrases produce
        high cosine similarity without external network calls or heavy ML binaries.
        """
        vec = [0.0] * self._dimension
        words = text.lower().split()
        if not words:
            return vec

        for idx, word in enumerate(words):
            # Compute token hash
            h_val = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            dim_idx = h_val % self._dimension
            weight = 1.0 + (1.0 / (idx + 1))
            vec[dim_idx] += weight

            # Trigram sub-word feature hashing
            for i in range(len(word) - 2):
                tri = word[i : i + 3]
                tri_idx = int(hashlib.md5(tri.encode("utf-8")).hexdigest(), 16) % self._dimension
                vec[tri_idx] += 0.5

        # L2 Normalize vector
        magnitude = math.sqrt(sum(v * v for v in vec))
        if magnitude > 0:
            vec = [v / magnitude for v in vec]
        return vec

    def embed_document(self, text: str) -> list[float]:
        if self._st_model:
            try:
                emb = self._st_model.encode(text)
                return emb.tolist()
            except Exception:
                pass
        return self._generate_fallback_vector(text)

    def embed_documents(self, texts: Sequence[str]) -> list[list[float]]:
        if self._st_model:
            try:
                embs = self._st_model.encode(list(texts))
                return [e.tolist() for e in embs]
            except Exception:
                pass
        return [self._generate_fallback_vector(t) for t in texts]

    def embed_query(self, query: str) -> list[float]:
        return self.embed_document(query)
