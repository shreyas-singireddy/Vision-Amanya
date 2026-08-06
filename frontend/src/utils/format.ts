/** Formatting helpers — INR currency, dates, numbers, slugs. */

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compactInrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Format a number as Indian Rupees, e.g. ₹85,00,000. */
export function formatINR(value: number): string {
  return inrFormatter.format(value);
}

/** Format a number as compact Indian Rupees, e.g. ₹1.2 Cr. */
export function formatINRCompact(value: number): string {
  return compactInrFormatter.format(value);
}

/** Format a plain number with Indian digit grouping. */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Format a date to `12 Aug 2026`. Accepts ISO strings or Date objects. */
export function formatDate(value: string | Date): string {
  return dateFormatter.format(new Date(value));
}

/** Format a date/time to `12 Aug 2026, 06:30 pm`. */
export function formatDateTime(value: string | Date): string {
  return dateTimeFormatter.format(new Date(value));
}

/** Relative time like "3 days ago" (useful for listings, enquiries). */
export function formatRelativeTime(value: string | Date): string {
  const delta = Date.now() - new Date(value).getTime();
  const minutes = Math.round(delta / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.round(months / 12);
  return `${years}y ago`;
}

/** URL-friendly slug from any string. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Truncate text to a max length, adding an ellipsis. */
export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

/** Capitalize the first letter of a sentence. */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Humanize snake_case / kebab-case API values, e.g. `under_construction` → `Under construction`. */
export function humanize(value: string): string {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
