"""Centralised logging configuration.

Provides a single, consistent logger setup for the whole application with
structured key/value pairs and a correlation-id-friendly formatter.
"""

from __future__ import annotations

import logging
import sys
from typing import Any

_CONFIGURED = False


def setup_logging(level: str = "INFO", json_format: bool = False) -> None:
    """Configure the root logger once for the application lifetime.

    Args:
        level: Logging level as a string ("DEBUG", "INFO", "WARNING"...).
        json_format: When True, emit one JSON object per line (production).

    Note:
        This function is idempotent; repeated calls are no-ops.
    """
    global _CONFIGURED
    if _CONFIGURED:
        return
    _CONFIGURED = True

    root = logging.getLogger()
    root.setLevel(level.upper())

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level.upper())

    if json_format:
        handler.setFormatter(_JsonFormatter())
    else:
        handler.setFormatter(
            logging.Formatter(
                fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
                datefmt="%Y-%m-%dT%H:%M:%S%z",
            )
        )

    root.addHandler(handler)

    # Keep third-party loggers from being noisy unless they are broken.
    for noisy in ("uvicorn.access", "httpx", "httpcore"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


class _JsonFormatter(logging.Formatter):
    """Minimal JSON formatter for machine-readable logs."""

    def format(self, record: logging.LogRecord) -> str:
        import json

        payload: dict[str, Any] = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        extra = getattr(record, "extra_fields", None)
        if extra:
            payload.update(extra)
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload)


def get_logger(name: str) -> logging.Logger:
    """Return a namespaced logger, e.g. ``get_logger("app.services.users")``."""
    return logging.getLogger(name)
