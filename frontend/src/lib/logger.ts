/** Isomorphic logger.
 *
 * In development it writes structured, labeled output to the console. In
 * production it is a no-op so sensitive data never leaks and noise is kept
 * out of production logs (use an observability SDK there instead).
 */

const isDev = process.env.NODE_ENV !== "production";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerOptions {
  /** Namespace prefix, e.g. `api.refresh`. */
  label?: string;
  /** Allowlist of metadata keys to emit in production (empty = none). */
  prodMetaKeys?: string[];
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configuredLevel: LogLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) ?? "info";

function serializeMeta(meta: Record<string, unknown>, options: LoggerOptions): string {
  if (isDev) return Object.entries(meta).length ? ` ${JSON.stringify(meta)}` : "";
  const allowed = options.prodMetaKeys ?? [];
  const safe = Object.fromEntries(Object.entries(meta).filter(([key]) => allowed.includes(key)));
  return Object.keys(safe).length ? ` ${JSON.stringify(safe)}` : "";
}

function emit(
  level: LogLevel,
  message: string,
  meta: Record<string, unknown>,
  options: LoggerOptions
): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[configuredLevel]) return;
  if (!isDev) return;

  const prefix = options.label ? `[${options.label}]` : "";
  const tag = level.toUpperCase();
  // eslint-disable-next-line no-console
  console[level === "debug" ? "log" : level](
    `${tag} ${prefix} ${message}${serializeMeta(meta, options)}`
  );
}

/** Create a namespaced logger. */
export function createLogger(label: string): Logger {
  return new Logger({ label });
}

export class Logger {
  private readonly options: LoggerOptions;

  constructor(options: LoggerOptions = {}) {
    this.options = options;
  }

  child(label: string): Logger {
    return new Logger({
      ...this.options,
      label: [this.options.label, label].filter(Boolean).join("."),
    });
  }

  debug(message: string, meta: Record<string, unknown> = {}): void {
    emit("debug", message, meta, this.options);
  }

  info(message: string, meta: Record<string, unknown> = {}): void {
    emit("info", message, meta, this.options);
  }

  warn(message: string, meta: Record<string, unknown> = {}): void {
    emit("warn", message, meta, this.options);
  }

  error(message: string, meta: Record<string, unknown> = {}): void {
    emit("error", message, meta, this.options);
  }
}

/** App-wide default logger. */
export const logger = new Logger({ label: "app" });
