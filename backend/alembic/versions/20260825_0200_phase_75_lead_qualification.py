"""Phase 7.5: Alembic migration — Conversational Lead Qualification + Sales Handoff.

Revision ID: 20260825_0200_phase_75_lead_qualification
Revises: 20260825_0100_add_ai_rag_chunks
Create Date: 2026-08-25
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers
# NOTE: the revision id must fit ``alembic_version.version_num`` (VARCHAR(32)).
revision = "20260825_0200_phase75_lead_qual"
down_revision = "20260825_0100"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── 1. Alter leads.email → nullable (WhatsApp-first flow) ───────────────
    op.alter_column("leads", "email", existing_type=sa.String(255), nullable=True)

    # ── 2. Add Phase 7.5 columns to leads ───────────────────────────────────
    op.add_column("leads", sa.Column("whatsapp_number", sa.String(20), nullable=True))
    op.add_column("leads", sa.Column("whatsapp_consent", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("leads", sa.Column("consent_timestamp", sa.DateTime(timezone=True), nullable=True))
    op.add_column("leads", sa.Column("consent_source", sa.String(50), nullable=True))
    op.add_column("leads", sa.Column("location", sa.String(100), nullable=True))
    op.add_column("leads", sa.Column("buying_purpose", sa.String(50), nullable=True))
    op.add_column("leads", sa.Column("configuration", sa.String(20), nullable=True))
    op.add_column("leads", sa.Column("preferred_floor", sa.String(20), nullable=True))
    op.add_column("leads", sa.Column("preferred_view", sa.String(50), nullable=True))
    op.add_column("leads", sa.Column("preferred_orientation", sa.String(30), nullable=True))
    op.add_column("leads", sa.Column("family_size", sa.SmallInteger(), nullable=True))
    op.add_column("leads", sa.Column("buying_timeline", sa.String(50), nullable=True))
    op.add_column("leads", sa.Column("site_visit_interest", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("leads", sa.Column("interested_unit_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("leads", sa.Column("recommended_unit_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("leads", sa.Column("viewed_unit_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("leads", sa.Column("compared_unit_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("leads", sa.Column("conversation_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("leads", sa.Column("landing_page", sa.String(500), nullable=True))
    op.add_column("leads", sa.Column("last_contacted_at", sa.DateTime(timezone=True), nullable=True))

    op.create_foreign_key(
        "fk_leads_conversation_id", "leads", "chat_sessions",
        ["conversation_id"], ["id"], ondelete="SET NULL",
    )
    op.create_index("ix_leads_whatsapp_number", "leads", ["whatsapp_number"])
    op.create_index("ix_leads_conversation_id", "leads", ["conversation_id"])

    # Extend LeadStatus CHECK to include new values
    op.execute("ALTER TABLE leads DROP CONSTRAINT IF EXISTS ck_leads_status")
    op.execute(
        "ALTER TABLE leads ADD CONSTRAINT ck_leads_status CHECK "
        "(status IN ('new','contacted','qualified','site_visit','proposal','negotiation','nurture','won','lost'))"
    )

    # ── 3. Create whatsapp_messages table ────────────────────────────────────
    op.create_table(
        "whatsapp_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("lead_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("leads.id", ondelete="SET NULL"), nullable=True),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("chat_sessions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("phone_number", sa.String(20), nullable=False),
        sa.Column("message_body", sa.Text(), nullable=False),
        sa.Column("template_name", sa.String(100), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("provider_message_id", sa.String(200), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_reason", sa.Text(), nullable=True),
        sa.Column("provider_name", sa.String(50), nullable=True),
    )
    op.create_index("ix_whatsapp_messages_lead_id", "whatsapp_messages", ["lead_id"])
    op.create_index("ix_whatsapp_messages_status", "whatsapp_messages", ["status"])

    # ── 4. Create sales_notifications table ──────────────────────────────────
    op.create_table(
        "sales_notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("lead_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("leads.id", ondelete="SET NULL"), nullable=True),
        sa.Column("handoff_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("sales_handoffs.id", ondelete="SET NULL"), nullable=True),
        sa.Column("channel", sa.String(30), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("recipient", sa.String(255), nullable=True),
        sa.Column("subject", sa.String(300), nullable=True),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_reason", sa.Text(), nullable=True),
    )
    op.create_index("ix_sales_notifications_lead_id", "sales_notifications", ["lead_id"])
    op.create_index("ix_sales_notifications_status", "sales_notifications", ["status"])


def downgrade() -> None:
    op.drop_table("sales_notifications")
    op.drop_table("whatsapp_messages")
    op.drop_constraint("fk_leads_conversation_id", "leads", type_="foreignkey")
    op.drop_index("ix_leads_whatsapp_number", table_name="leads")
    op.drop_index("ix_leads_conversation_id", table_name="leads")
    for col in [
        "last_contacted_at", "landing_page", "conversation_id",
        "compared_unit_ids", "viewed_unit_ids", "recommended_unit_ids", "interested_unit_ids",
        "site_visit_interest", "buying_timeline", "family_size",
        "preferred_orientation", "preferred_view", "preferred_floor",
        "configuration", "buying_purpose", "location",
        "consent_source", "consent_timestamp", "whatsapp_consent", "whatsapp_number",
    ]:
        op.drop_column("leads", col)
    op.alter_column("leads", "email", existing_type=sa.String(255), nullable=False)
    op.execute("ALTER TABLE leads DROP CONSTRAINT IF EXISTS ck_leads_status")
    op.execute(
        "ALTER TABLE leads ADD CONSTRAINT ck_leads_status CHECK "
        "(status IN ('new','contacted','qualified','proposal','negotiation','won','lost'))"
    )
