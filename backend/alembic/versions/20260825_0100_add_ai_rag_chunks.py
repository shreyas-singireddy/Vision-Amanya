"""add ai_rag_chunks table

Revision ID: 20260825_0100
Revises: 20260825_0000
Create Date: 2026-08-25 01:00:00.000000

"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20260825_0100'
down_revision: str | None = '20260825_0000'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Apply schema changes."""
    op.create_table(
        'ai_rag_chunks',
        sa.Column('knowledge_item_id', sa.Uuid(), nullable=False),
        sa.Column('project_id', sa.Uuid(), nullable=True),
        sa.Column('chunk_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('normalized_content', sa.Text(), nullable=False),
        sa.Column('content_hash', sa.String(length=64), nullable=False),
        sa.Column('embedding', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('embedding_model', sa.String(length=100), server_default='all-MiniLM-L6-v2', nullable=False),
        sa.Column('embedding_version', sa.String(length=50), server_default='1.0', nullable=False),
        sa.Column('category', sa.Enum('project', 'location', 'landscape', 'architecture', 'planning', 'residence', 'specification', 'amenity', 'connectivity', 'developer', 'pricing', 'availability', 'legal', 'rera', 'finance', 'faq', 'marketing', name='knowledgecategory', native_enum=False, create_constraint=True, length=30), nullable=False),
        sa.Column('claim_type', sa.Enum('fact', 'marketing_claim', 'comparative_claim', 'lifestyle_claim', 'unknown', name='claimtype', native_enum=False, create_constraint=True, length=30), nullable=False),
        sa.Column('verification_status', sa.Enum('verified', 'provided_unverified', 'requires_verification', 'deprecated', name='verificationstatus', native_enum=False, create_constraint=True, length=30), nullable=False),
        sa.Column('source_name', sa.String(length=255), server_default='Amnaya Project Material', nullable=False),
        sa.Column('source_reference', sa.String(length=255), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('id', sa.Uuid(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['knowledge_item_id'], ['ai_knowledge_items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_ai_rag_chunks_category', 'ai_rag_chunks', ['category'], unique=False)
    op.create_index('ix_ai_rag_chunks_claim_type', 'ai_rag_chunks', ['claim_type'], unique=False)
    op.create_index('ix_ai_rag_chunks_content_hash', 'ai_rag_chunks', ['content_hash'], unique=False)
    op.create_index('ix_ai_rag_chunks_knowledge_item_id', 'ai_rag_chunks', ['knowledge_item_id'], unique=False)
    op.create_index('ix_ai_rag_chunks_project_id', 'ai_rag_chunks', ['project_id'], unique=False)
    op.create_index('ix_ai_rag_chunks_verification_status', 'ai_rag_chunks', ['verification_status'], unique=False)


def downgrade() -> None:
    """Revert schema changes."""
    op.drop_table('ai_rag_chunks')
