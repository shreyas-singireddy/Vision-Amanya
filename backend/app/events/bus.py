"""In-process asynchronous domain Event Bus with Pub/Sub, idempotency, and failure isolation."""

from __future__ import annotations

import asyncio
import inspect
import logging
import time
from collections import OrderedDict
from typing import Any, Awaitable, Callable, Optional

from app.events.models import BaseDomainEvent

logger = logging.getLogger("app.events.bus")

EventHandler = Callable[[BaseDomainEvent, Optional[Any]], Awaitable[Any] | Any]


class EventBus:
    """Thread-safe, observable domain event bus with deduplication and error isolation."""

    def __init__(self, max_idempotency_records: int = 5000) -> None:
        self._subscribers: dict[str, list[EventHandler]] = {}
        self._max_idempotency = max_idempotency_records
        # Ordered dictionary for LRU deduplication
        self._processed_keys: OrderedDict[str, float] = OrderedDict()
        self._lock = asyncio.Lock()

    def subscribe(self, event_type: str, handler: EventHandler) -> None:
        """Register a handler for a specific event type."""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        if handler not in self._subscribers[event_type]:
            self._subscribers[event_type].append(handler)
            logger.debug("Subscribed %s to event %s", getattr(handler, "__name__", str(handler)), event_type)

    def unsubscribe(self, event_type: str, handler: EventHandler) -> None:
        """Remove a handler subscription."""
        if event_type in self._subscribers and handler in self._subscribers[event_type]:
            self._subscribers[event_type].remove(handler)

    async def is_processed(self, idempotency_key: str) -> bool:
        """Check if an idempotency key has already been processed."""
        async with self._lock:
            return idempotency_key in self._processed_keys

    async def mark_processed(self, idempotency_key: str) -> None:
        """Record an idempotency key with LRU eviction."""
        async with self._lock:
            if idempotency_key in self._processed_keys:
                self._processed_keys.move_to_end(idempotency_key)
            else:
                self._processed_keys[idempotency_key] = time.time()
                if len(self._processed_keys) > self._max_idempotency:
                    self._processed_keys.popitem(last=False)

    async def publish(
        self,
        event: BaseDomainEvent,
        db: Optional[Any] = None,
        *,
        force: bool = False,
    ) -> list[dict[str, Any]]:
        """Dispatch event to all registered subscribers with strict failure isolation.

        Returns a list of handler execution results with status, duration, and error metadata.
        """
        key = event.idempotency_key
        if not force and await self.is_processed(key):
            logger.info(
                "Event %s [%s] skipped (idempotency key %s already processed)",
                event.event_type,
                event.event_id,
                key,
            )
            return [{"handler": "deduplication", "status": "skipped_duplicate", "idempotency_key": key}]

        handlers = list(self._subscribers.get(event.event_type, []))
        wildcard_handlers = list(self._subscribers.get("*", []))
        all_handlers = handlers + wildcard_handlers

        if not all_handlers:
            logger.debug("No subscribers for event %s [%s]", event.event_type, event.event_id)
            await self.mark_processed(key)
            return []

        results: list[dict[str, Any]] = []
        logger.info(
            "Dispatching event %s [ID: %s, Key: %s] to %d handlers",
            event.event_type,
            event.event_id,
            key,
            len(all_handlers),
        )

        for handler in all_handlers:
            handler_name = getattr(handler, "__name__", str(handler))
            start = time.perf_counter()
            try:
                if inspect.iscoroutinefunction(handler):
                    res = await handler(event, db)
                else:
                    res = handler(event, db)
                duration_ms = (time.perf_counter() - start) * 1000.0
                results.append({
                    "handler": handler_name,
                    "status": "success",
                    "duration_ms": duration_ms,
                    "result": res,
                })
                logger.info(
                    "Handler %s executed successfully for %s in %.2fms",
                    handler_name,
                    event.event_type,
                    duration_ms,
                )
            except Exception as exc:
                duration_ms = (time.perf_counter() - start) * 1000.0
                logger.error(
                    "Handler %s failed on event %s [%s] after %.2fms: %s",
                    handler_name,
                    event.event_type,
                    event.event_id,
                    duration_ms,
                    exc,
                    exc_info=True,
                )
                results.append({
                    "handler": handler_name,
                    "status": "failed",
                    "duration_ms": duration_ms,
                    "error": str(exc),
                })
                # Failure in one subscriber MUST NOT crash other subscribers (Failure Isolation)

        await self.mark_processed(key)
        return results

    def publish_background(
        self,
        event: BaseDomainEvent,
        db_factory: Optional[Callable[[], Any]] = None,
    ) -> asyncio.Task[list[dict[str, Any]]]:
        """Fire-and-forget event publishing in the background without blocking the caller."""
        async def _run() -> list[dict[str, Any]]:
            db = None
            if db_factory and callable(db_factory):
                try:
                    db = db_factory()
                except Exception:
                    pass
            return await self.publish(event, db)

        return asyncio.create_task(_run())

    def clear(self) -> None:
        """Clear all subscribers and idempotency state (useful for testing)."""
        self._subscribers.clear()
        self._processed_keys.clear()


# Global event bus singleton instance
event_bus = EventBus()
