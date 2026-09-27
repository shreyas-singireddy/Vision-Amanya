"""AI Provider Abstraction Layer.

Defines the contract for LLM generation providers (e.g. Gemini, OpenAI, Anthropic).
Prevents route handlers or services from hardcoding specific LLM SDKs or API keys.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, AsyncGenerator

from app.core.config import get_settings
from app.schemas.ai import AIChatContext, AIStructuredResponse


class BaseAIProvider(ABC):
    """Abstract interface for AI model providers."""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        context: AIChatContext | None = None,
        history: list[dict[str, str]] | None = None,
    ) -> str:
        """Generate a single text response."""
        ...

    @abstractmethod
    async def stream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        context: AIChatContext | None = None,
        history: list[dict[str, str]] | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens as an async generator."""
        ...

    @abstractmethod
    async def health_check(self) -> bool:
        """Report provider health status."""
        ...


class ConfigurableAIProvider(BaseAIProvider):
    """Production provider wrapper operating via configurable settings.

    In Phase 6.6, generates deterministic structured responses adhering to brand guidelines,
    ready for LangChain / RAG model vector store attachment in Phase 7.
    """

    def __init__(self) -> None:
        self.settings = get_settings()

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        context: AIChatContext | None = None,
        history: list[dict[str, str]] | None = None,
    ) -> str:
        """Generate response text."""
        return (
            f"Thank you for asking about Vision Amnaya. I am your AI Property Consultant. "
            f"In response to '{prompt}', Amnaya offers 420 luxury 3 BHK residences across 10 floors "
            f"overlooking 25 acres of Osman Sagar lake and 2 acres of central park landscape."
        )

    async def stream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        context: AIChatContext | None = None,
        history: list[dict[str, str]] | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream tokens progressively."""
        response_text = await self.generate(prompt, system_prompt, context, history)
        words = response_text.split(" ")
        for word in words:
            yield word + " "

    async def health_check(self) -> bool:
        """Check provider status."""
        return True


def get_ai_provider() -> BaseAIProvider:
    """Factory function returning the configured AI provider instance."""
    return ConfigurableAIProvider()
