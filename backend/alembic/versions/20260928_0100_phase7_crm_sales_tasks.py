"""Phase 7: internal sales CRM tasks (sales notification + task automation).

Creates the ``crm_tasks`` table that backs automated internal sales follow-up
work. Existing tables (``leads``, ``agents``, ``users``, ``sales_notifications``,
``audit_logs``) are untouched — this migration is purely additive.

Revision ID: 20260928_0100_phase7_crm_sales_tasks
Revises: 20260825_0200_phase_75_lead_qualification
Create Date: 2026-09-28
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers
# NOTE: the id must fit ``alembic_version.version_num`` (VARCHAR(32)).
revision = "20260928_0100_phase7_crm_tasks"
down_revision = "20260825_0200_phase75_lead_qual"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "crm_tasks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column(
            "lead_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("leads.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "assigned_to",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("agents.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("task_type", sa.String(40), nullable=False, server_default="contact_qualified_lead"),
        sa.Column("status", sa.String(20), nullable=False, server_default="open"),
        sa.Column("priority", sa.String(20), nullable=False, server_default="medium"),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("trigger", sa.String(40), nullable=True),
        sa.Column("qualification", sa.String(30), nullable=True),
        sa.Column("lead_score", sa.SmallInteger(), nullable=True),
        sa.Column("dedupe_key", sa.String(200), nullable=True),
        sa.Column("context_data", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reminder_sent", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_crm_tasks_lead_id", "crm_tasks", ["lead_id"])
    op.create_index("ix_crm_tasks_assigned_to", "crm_tasks", ["assigned_to"])
    op.create_index("ix_crm_tasks_created_by", "crm_tasks", ["created_by"])
    op.create_index("ix_crm_tasks_task_type", "crm_tasks", ["task_type"])
    op.create_index("ix_crm_tasks_status", "crm_tasks", ["status"])
    op.create_index("ix_crm_tasks_priority", "crm_tasks", ["priority"])
    op.create_index("ix_crm_tasks_trigger", "crm_tasks", ["trigger"])
    op.create_index("ix_crm_tasks_due_at", "crm_tasks", ["due_at"])
    op.create_index("ix_crm_tasks_dedupe_key", "crm_tasks", ["dedupe_key"], unique=True)
    op.create_index("ix_crm_tasks_status_due", "crm_tasks", ["status", "due_at"])
    op.create_index("ix_crm_tasks_assignee_status", "crm_tasks", ["assigned_to", "status"])

    # Enum-like CHECK constraints mirroring the model's non-native enums.
    op.execute(
        "ALTER TABLE crm_tasks ADD CONSTRAINT ck_crm_tasks_status CHECK "
        "(status IN ('open','in_progress','completed','cancelled'))"
    )
    op.execute(
        "ALTER TABLE crm_tasks ADD CONSTRAINT ck_crm_tasks_priority CHECK "
        "(priority IN ('low','medium','high','urgent'))"
    )
    op.execute(
        "ALTER TABLE crm_tasks ADD CONSTRAINT ck_crm_tasks_task_type CHECK "
        "(task_type IN ('contact_qualified_lead','hot_lead_follow_up','site_visit_coordination','manual'))"
    )
    op.execute(
        "ALTER TABLE crm_tasks ADD CONSTRAINT ck_crm_tasks_trigger CHECK "
        "(trigger IS NULL OR trigger IN "
        "('high_intent_lead','hot_lead','site_visit_request','human_assistance_request','manual'))"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE crm_tasks DROP CONSTRAINT IF EXISTS ck_crm_tasks_trigger")
    op.execute("ALTER TABLE crm_tasks DROP CONSTRAINT IF EXISTS ck_crm_tasks_task_type")
    op.execute("ALTER TABLE crm_tasks DROP CONSTRAINT IF EXISTS ck_crm_tasks_priority")
    op.execute("ALTER TABLE crm_tasks DROP CONSTRAINT IF EXISTS ck_crm_tasks_status")
    op.drop_index("ix_crm_tasks_assignee_status", table_name="crm_tasks")
    op.drop_index("ix_crm_tasks_status_due", table_name="crm_tasks")
    op.drop_index("ix_crm_tasks_dedupe_key", table_name="crm_tasks")
    op.drop_index("ix_crm_tasks_due_at", table_name="crm_tasks")
    op.drop_index("ix_crm_tasks_trigger", table_name="crm_tasks")
    op.drop_index("ix_crm_tasks_priority", table_name="crm_tasks")
    op.drop_index("ix_crm_tasks_status", table_name="crm_tasks")
    op.drop_index("ix_crm_tasks_task_type", table_name="crm_tasks")
    op.drop_index("ix_crm_tasks_created_by", table_name="crm_tasks")
    op.drop_index("ix_crm_tasks_assigned_to", table_name="crm_tasks")
    op.drop_index("ix_crm_tasks_lead_id", table_name="crm_tasks")
    op.drop_table("crm_tasks")
