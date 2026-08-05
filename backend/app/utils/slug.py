"""Slug generation helpers.

Produces URL-safe slugs from human-readable names/titles and keeps them
unique within the calling context (uniqueness is enforced by callers against
the relevant table).
"""

from __future__ import annotations

import re
import unicodedata

_SLUG_RE = re.compile(r"[^a-z0-9]+")
_TRIM_RE = re.compile(r"^-+|-+$")


def slugify(value: str, max_length: int = 100) -> str:
    """Convert a string into a lowercase, URL-safe slug.

    Example:
        >>> slugify("2BHK Luxury Apartment at Vision Amanya!")
        '2bhk-luxury-apartment-at-vision-amanya'
    """
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = _SLUG_RE.sub("-", ascii_text.lower())
    slug = _TRIM_RE.sub("", slug)
    if not slug:
        slug = "item"
    return slug[:max_length].rstrip("-")


def unique_slug(base: str, exists: callable) -> str:
    """Return a slug guaranteed unique against ``exists(slug) -> bool``.

    Appends a numeric suffix when the base slug is already taken.
    """
    candidate = slugify(base)
    if not exists(candidate):
        return candidate
    index = 1
    while True:
        next_candidate = f"{candidate}-{index}"
        if not exists(next_candidate):
            return next_candidate
        index += 1
