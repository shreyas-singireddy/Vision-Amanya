"""OTP issuance and verification backed by Redis.

OTPs are stored under ``otp:{scope}:{identifier}`` with a configurable TTL.
Attempt counters protect against brute-force guessing. The service degrades
gracefully when Redis is unavailable by refusing issuance (fail-closed).
"""

from __future__ import annotations

import redis.asyncio as aioredis

from app.core.security import generate_otp


class OtpService:
    """Issue, verify and invalidate time-limited numeric OTPs."""

    def __init__(self, redis: aioredis.Redis) -> None:
        self.redis = redis

    def _key(self, scope: str, identifier: str) -> str:
        return f"otp:{scope}:{identifier}"

    async def issue(self, scope: str, identifier: str, ttl_seconds: int = 300, length: int = 6) -> str:
        """Generate and store an OTP, returning the plaintext value."""
        otp = generate_otp(length)
        await self.redis.set(self._key(scope, identifier), otp, ex=ttl_seconds)
        await self.redis.set(self._key(scope, identifier) + ":attempts", 0, ex=ttl_seconds)
        return otp

    async def verify(self, scope: str, identifier: str, otp: str, max_attempts: int = 5) -> bool:
        """Verify an OTP; each failed attempt consumes one attempt credit."""
        key = self._key(scope, identifier)
        attempts_key = key + ":attempts"
        attempts = int(await self.redis.get(attempts_key) or 0)
        if attempts >= max_attempts:
            await self.redis.delete(key, attempts_key)
            return False
        stored = await self.redis.get(key)
        if stored is None:
            return False
        if stored == otp:
            await self.redis.delete(key, attempts_key)
            return True
        await self.redis.incr(attempts_key)
        return False

    async def invalidate(self, scope: str, identifier: str) -> None:
        """Delete any stored OTP for the given scope/identifier."""
        key = self._key(scope, identifier)
        await self.redis.delete(key, key + ":attempts")
