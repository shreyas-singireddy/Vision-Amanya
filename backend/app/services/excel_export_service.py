"""Phase 7.5: Excel Lead Export Service.

Generates sales-friendly Excel workbooks for individual leads or bulk exports.
PostgreSQL is the source of truth — Excel is a derived export artifact only.

Architecture rules:
- The LLM never calls this service.
- Returns bytes (in-memory) — never writes to disk.
- File is built with openpyxl in memory and returned as bytes to the caller.
- Caller is responsible for streaming the bytes in HTTP response.

Columns (per spec):
  Lead ID | Created At | Name | WhatsApp | Phone | City/Location |
  Buying Purpose | Configuration | Budget (₹ Cr) | View | Floor |
  Timeline | Interested Units | Lead Score | Temperature | Status |
  Site Visit | Notes | Conversation ID | Consent Given
"""

from __future__ import annotations

import io
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from app.core.logging import get_logger

logger = get_logger("app.services.excel_export")

# Column definitions: (header, lead_attr_or_callable, width)
_COLUMNS: list[tuple[str, Any, int]] = [
    ("Lead ID",           "id",                    38),
    ("Created At",        "_created_at",           22),
    ("Name",              "name",                  22),
    ("WhatsApp",          "whatsapp_number",        18),
    ("Phone",             "phone",                  18),
    ("City / Location",   "location",              20),
    ("Buying Purpose",    "_buying_purpose",        18),
    ("Configuration",     "configuration",          16),
    ("Budget Min (₹ Cr)", "_budget_min_cr",         18),
    ("Budget Max (₹ Cr)", "_budget_max_cr",         18),
    ("View Preference",   "preferred_view",         18),
    ("Floor Preference",  "preferred_floor",        18),
    ("Timeline",          "buying_timeline",        18),
    ("Interested Units",  "_unit_ids",              28),
    ("Lead Score",        "lead_score",             14),
    ("Temperature",       "_temperature",           16),
    ("Status",            "status",                 16),
    ("Priority",          "priority",               14),
    ("Site Visit",        "_site_visit",            14),
    ("WhatsApp Consent",  "_consent",               18),
    ("Consent Date",      "_consent_ts",            22),
    ("Notes",             "notes",                  40),
    ("Conversation ID",   "conversation_id",        38),
]

_HEADER_FILL_COLOR = "1A1A2E"   # Dark navy
_HEADER_FONT_COLOR = "C9A84C"   # Amnaya gold
_ALT_ROW_COLOR = "F5F0E8"       # Warm ivory


def _cell_value(lead: Any, attr: str) -> Any:
    """Extract a display-friendly value from the lead object."""
    # Computed fields
    if attr == "_created_at":
        raw = getattr(lead, "created_at", None)
        if raw:
            if hasattr(raw, "strftime"):
                return raw.strftime("%Y-%m-%d %H:%M IST")
            return str(raw)
        return ""
    if attr == "_buying_purpose":
        p = getattr(lead, "buying_purpose", None) or ""
        return p.replace("_", " ").title() if p else ""
    if attr == "_budget_min_cr":
        val = getattr(lead, "budget_min", None)
        return round(val / 10_000_000, 2) if val else ""
    if attr == "_budget_max_cr":
        val = getattr(lead, "budget_max", None)
        return round(val / 10_000_000, 2) if val else ""
    if attr == "_unit_ids":
        ids = getattr(lead, "interested_unit_ids", None) or []
        return ", ".join(ids) if ids else ""
    if attr == "_temperature":
        score = getattr(lead, "lead_score", 0) or 0
        if score <= 30:
            return "Cold"
        if score <= 60:
            return "Warm"
        if score <= 80:
            return "Hot"
        return "High Intent"
    if attr == "_site_visit":
        return "Yes" if getattr(lead, "site_visit_interest", False) else "No"
    if attr == "_consent":
        c = getattr(lead, "whatsapp_consent", None)
        if c is True:
            return "Yes"
        if c is False:
            return "No"
        return "Not Asked"
    if attr == "_consent_ts":
        raw = getattr(lead, "consent_timestamp", None)
        if raw and hasattr(raw, "strftime"):
            return raw.strftime("%Y-%m-%d %H:%M")
        return ""

    # Direct attribute
    val = getattr(lead, attr, None)
    if val is None:
        return ""
    if isinstance(val, uuid.UUID):
        return str(val)
    if isinstance(val, (list, dict)):
        return str(val)
    return val


def _build_workbook(leads: list[Any]) -> io.BytesIO:
    """Build an openpyxl workbook for the given leads and return as BytesIO."""
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Alignment, Font, PatternFill
        from openpyxl.utils import get_column_letter
    except ImportError:
        raise RuntimeError("openpyxl is required for Excel export. Run: pip install openpyxl")

    wb = Workbook()
    ws = wb.active
    ws.title = "Amnaya Leads"

    # ── Header row ─────────────────────────────────────────────────────────────
    header_fill = PatternFill("solid", fgColor=_HEADER_FILL_COLOR)
    header_font = Font(bold=True, color=_HEADER_FONT_COLOR, size=10)

    for col_idx, (header, _, width) in enumerate(_COLUMNS, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        ws.column_dimensions[get_column_letter(col_idx)].width = width

    ws.row_dimensions[1].height = 24
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = ws.dimensions

    # ── Data rows ─────────────────────────────────────────────────────────────
    alt_fill = PatternFill("solid", fgColor=_ALT_ROW_COLOR)
    data_font = Font(size=9)

    for row_idx, lead in enumerate(leads, 2):
        is_alt = (row_idx % 2 == 0)
        for col_idx, (_, attr, _) in enumerate(_COLUMNS, 1):
            val = _cell_value(lead, attr)
            cell = ws.cell(row=row_idx, column=col_idx, value=val)
            cell.font = data_font
            cell.alignment = Alignment(vertical="top", wrap_text=(col_idx in {22, 1}))
            if is_alt:
                cell.fill = alt_fill

    # ── Summary row ───────────────────────────────────────────────────────────
    summary_row = len(leads) + 2
    ws.cell(row=summary_row, column=1, value=f"Total leads: {len(leads)}")
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    ws.cell(row=summary_row, column=2, value=f"Generated: {now_str}")

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf


class ExcelExportService:
    """Export leads as Excel workbooks.

    PostgreSQL is the source of truth — Excel is a derived artifact.
    The returned bytes are never written to disk by this service.
    """

    def __init__(self, db: Any) -> None:
        self.db = db

    async def export_lead(self, lead_id: uuid.UUID) -> bytes:
        """Export a single lead as an Excel file (bytes)."""
        from sqlalchemy import select
        from app.models.crm import Lead

        lead = None
        if self.db:
            stmt = select(Lead).where(Lead.id == lead_id, Lead.deleted_at.is_(None))
            lead = await self.db.scalar(stmt)

        if not lead:
            raise ValueError(f"Lead {lead_id} not found")

        buf = _build_workbook([lead])
        logger.info("Excel export: single lead %s", lead_id)
        return buf.read()

    async def export_all_leads(
        self,
        *,
        status: Optional[str] = None,
        limit: int = 1000,
    ) -> bytes:
        """Export multiple leads with optional status filter (bytes)."""
        from sqlalchemy import select
        from app.models.crm import Lead

        stmt = select(Lead).where(Lead.deleted_at.is_(None)).limit(limit)
        if status:
            stmt = stmt.where(Lead.status == status)
        stmt = stmt.order_by(Lead.created_at.desc())

        leads = []
        if self.db:
            result = await self.db.scalars(stmt)
            leads = list(result.all())

        buf = _build_workbook(leads)
        logger.info("Excel export: %d leads (status=%s)", len(leads), status)
        return buf.read()

    @staticmethod
    def build_from_list(leads: list[Any]) -> bytes:
        """Build an Excel export from a pre-fetched lead list (sync-compatible)."""
        buf = _build_workbook(leads)
        return buf.read()
