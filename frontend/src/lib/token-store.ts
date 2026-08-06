/**
 * In-memory access-token store.
 *
 * The access token lives in memory only (never `localStorage`/`sessionStorage`,
 * which are XSS-accessible). The refresh token lives in an httpOnly cookie
 * managed by the BFF route handlers.
 *
 * Kept as a tiny standalone module (instead of a Zustand store) so the axios
 * interceptors can read/write it without creating a circular import with the
 * auth store.
 */

export interface TokenStoreSnapshot {
  accessToken: string | null;
  /** Epoch ms at which the access token expires. */
  expiresAt: number | null;
}

type Listener = (snapshot: TokenStoreSnapshot) => void;

let accessToken: string | null = null;
let expiresAt: number | null = null;

const listeners = new Set<Listener>();

function snapshot(): TokenStoreSnapshot {
  return { accessToken, expiresAt };
}

function notify(): void {
  const next = snapshot();
  for (const listener of listeners) listener(next);
}

export const tokenStore = {
  get(): TokenStoreSnapshot {
    return snapshot();
  },

  getAccessToken(): string | null {
    return accessToken;
  },

  set(token: string | null, tokenExpiresAt: number | null = null): void {
    accessToken = token;
    expiresAt = tokenExpiresAt;
    notify();
  },

  isExpired(): boolean {
    if (!accessToken || expiresAt === null) return true;
    return Date.now() >= expiresAt;
  },

  clear(): void {
    accessToken = null;
    expiresAt = null;
    notify();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
