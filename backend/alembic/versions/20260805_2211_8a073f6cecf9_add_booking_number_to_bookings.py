"""add booking_number to bookings

Revision ID: 8a073f6cecf9
Revises: 0b1bc8f5245f
Create Date: 2026-08-05 22:11:47.987396

"""
from __future__ import annotations

import secrets
import string
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8a073f6cecf9'
down_revision: str | None = '0b1bc8f5245f'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_ALPHABET = string.ascii_uppercase + string.digits
_UQ_NAME = 'uq_bookings_booking_number'


def _generate(attempt: int = 0) -> str:
    """Self-contained booking number generator (mirrors app.utils)."""
    import datetime as _dt

    date_part = _dt.datetime.now(_dt.timezone.utc).strftime("%Y%m%d")
    random_part = "".join(secrets.choice(_ALPHABET) for _ in range(6))
    if attempt > 0:
        random_part = f"{random_part[:5]}{chr(ord('A') + min(attempt - 1, 25))}"
    return f"BK-{date_part}-{random_part}"


def upgrade() -> None:
    """Add a NOT NULL, unique booking reference, backfilling any existing rows."""
    op.add_column('bookings', sa.Column('booking_number', sa.String(length=32), nullable=True))

    conn = op.get_bind()
    rows = conn.execute(
        sa.text("SELECT id FROM bookings WHERE booking_number IS NULL")
    ).fetchall()
    for index, row in enumerate(rows):
        attempt = 0
        number = _generate(attempt)
        existing = conn.execute(
            sa.text("SELECT 1 FROM bookings WHERE booking_number = :n"),
            {"n": number},
        ).scalar()
        while existing is not None:
            attempt += 1
            number = _generate(attempt)
            existing = conn.execute(
                sa.text("SELECT 1 FROM bookings WHERE booking_number = :n"),
                {"n": number},
            ).scalar()
        conn.execute(
            sa.text("UPDATE bookings SET booking_number = :n WHERE id = :i"),
            {"n": number, "i": row.id},
        )

    op.alter_column('bookings', 'booking_number', nullable=False)
    op.create_unique_constraint(_UQ_NAME, 'bookings', ['booking_number'])


def downgrade() -> None:
    """Drop the booking_number column and its unique constraint."""
    op.drop_constraint(_UQ_NAME, 'bookings', type_='unique')
    op.drop_column('bookings', 'booking_number')
