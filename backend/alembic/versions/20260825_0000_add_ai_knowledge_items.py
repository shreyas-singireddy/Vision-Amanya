"""add ai_knowledge_items and ai_knowledge_conflicts tables

Revision ID: 20260825_0000
Revises: f645703c7b34
Create Date: 2026-08-25 00:00:00.000000

"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20260825_0000'
down_revision: str | None = 'f645703c7b34'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Apply schema changes."""
    op.create_table(
        'ai_knowledge_items',
        sa.Column('project_id', sa.Uuid(), nullable=True),
        sa.Column('category', sa.Enum('project', 'location', 'landscape', 'architecture', 'planning', 'residence', 'specification', 'amenity', 'connectivity', 'developer', 'pricing', 'availability', 'legal', 'rera', 'finance', 'faq', 'marketing', name='knowledgecategory', native_enum=False, create_constraint=True, length=30), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('source_name', sa.String(length=255), server_default='Amnaya Project Material — User Supplied', nullable=False),
        sa.Column('source_type', sa.String(length=100), server_default='user_supplied', nullable=False),
        sa.Column('source_reference', sa.String(length=255), nullable=True),
        sa.Column('source_version', sa.String(length=50), server_default='1.0', nullable=True),
        sa.Column('verification_status', sa.Enum('verified', 'provided_unverified', 'requires_verification', 'deprecated', name='verificationstatus', native_enum=False, create_constraint=True, length=30), nullable=False),
        sa.Column('claim_type', sa.Enum('fact', 'marketing_claim', 'comparative_claim', 'lifestyle_claim', 'unknown', name='claimtype', native_enum=False, create_constraint=True, length=30), nullable=False),
        sa.Column('confidence', sa.Float(), server_default='1.0', nullable=False),
        sa.Column('effective_from', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('effective_until', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('raw_value', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('normalized_value', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('id', sa.Uuid(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_ai_knowledge_items_category', 'ai_knowledge_items', ['category'], unique=False)
    op.create_index('ix_ai_knowledge_items_claim_type', 'ai_knowledge_items', ['claim_type'], unique=False)
    op.create_index('ix_ai_knowledge_items_project_id', 'ai_knowledge_items', ['project_id'], unique=False)
    op.create_index('ix_ai_knowledge_items_verification_status', 'ai_knowledge_items', ['verification_status'], unique=False)

    op.create_table(
        'ai_knowledge_conflicts',
        sa.Column('item_a_id', sa.Uuid(), nullable=False),
        sa.Column('item_b_id', sa.Uuid(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('resolution_status', sa.String(length=50), server_default='unresolved', nullable=False),
        sa.Column('resolved_item_id', sa.Uuid(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('id', sa.Uuid(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['item_a_id'], ['ai_knowledge_items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['item_b_id'], ['ai_knowledge_items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['resolved_item_id'], ['ai_knowledge_items.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_ai_knowledge_conflicts_item_a_id', 'ai_knowledge_conflicts', ['item_a_id'], unique=False)
    op.create_index('ix_ai_knowledge_conflicts_item_b_id', 'ai_knowledge_conflicts', ['item_b_id'], unique=False)


def downgrade() -> None:
    """Revert schema changes."""
    op.drop_table('ai_knowledge_conflicts')
    op.drop_table('ai_knowledge_items')
