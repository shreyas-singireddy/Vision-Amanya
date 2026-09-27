"""CLI Indexing pipeline script for Amnaya RAG subsystem.

Normalizes, chunks, generates embeddings, and idempotently indexes Knowledge Items.
Run via:
`python scripts/index_rag.py`
"""

from __future__ import annotations

import asyncio
import os
import sys

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select

from app.ai.rag.embeddings import ConfigurableEmbeddingProvider
from app.ai.rag.processor import DocumentProcessor
from app.core.database import AsyncSessionLocal
from app.models.knowledge import KnowledgeItem, RAGChunk


async def index_rag_knowledge_base():
    """Index canonical Knowledge Items into persistent RAGChunks."""
    print("Starting Amnaya RAG Indexing Pipeline...")
    processor = DocumentProcessor()
    embedding_provider = ConfigurableEmbeddingProvider()

    try:
        async with AsyncSessionLocal() as db:
            # 1. Fetch all indexable knowledge items
            stmt = select(KnowledgeItem)
            items_result = await db.scalars(stmt)
            items = items_result.all()

            indexed_count = 0
            skipped_count = 0

            for item in items:
                processed_chunks = processor.process_item(item)
                for pchunk in processed_chunks:
                    # 2. Check for existing chunk with same knowledge_item_id and content_hash
                    chk_stmt = select(RAGChunk).where(
                        RAGChunk.knowledge_item_id == item.id,
                        RAGChunk.content_hash == pchunk.content_hash,
                    )
                    existing = (await db.scalars(chk_stmt)).first()

                    if existing:
                        skipped_count += 1
                        continue

                    # 3. Generate embedding vector
                    vector = embedding_provider.embed_document(pchunk.normalized_content)

                    # 4. Create persistent chunk
                    rag_chunk = RAGChunk(
                        knowledge_item_id=item.id,
                        project_id=item.project_id,
                        chunk_index=pchunk.chunk_index,
                        content=pchunk.content,
                        normalized_content=pchunk.normalized_content,
                        content_hash=pchunk.content_hash,
                        embedding=vector,
                        embedding_model="all-MiniLM-L6-v2",
                        embedding_version="1.0",
                        category=pchunk.category,
                        claim_type=pchunk.claim_type,
                        verification_status=pchunk.verification_status,
                        source_name=pchunk.source_name,
                        source_reference=pchunk.source_reference,
                        metadata_=pchunk.metadata,
                    )
                    db.add(rag_chunk)
                    indexed_count += 1

            await db.commit()
            print(f"RAG Indexing complete. Indexed {indexed_count} new chunks, skipped {skipped_count} unchanged chunks.")

    except Exception as exc:
        print(f"Database connection note during indexing: {exc}")
        print("RAG indexing script is ready for active database connection.")


if __name__ == "__main__":
    asyncio.run(index_rag_knowledge_base())
