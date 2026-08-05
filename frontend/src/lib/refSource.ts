// Referral source tracking for program enrollments.
//
// A visitor arriving at /program/:slug?ref=it_jobs_gujarat has that ref stored
// locally, so it can be attached to the enrollment they submit later in the
// session (possibly several route changes afterwards).
//
// This is analytics data, never a required field: every entry point is wrapped
// in try/catch so a blocked/full/unavailable localStorage (private mode, some
// in-app browsers) can never throw into the form submit path.

const STORAGE_KEY = 'prim_ref_source';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_LENGTH = 100;

// Only these characters are accepted - anything else is rejected outright
// rather than stored partially sanitized, so a bad link stores nothing.
const ALLOWED = /^[a-zA-Z0-9_-]+$/;

interface StoredRef {
  value: string;
  capturedAt: number;
}

/** Returns the cleaned ref, or null when it fails validation. */
export function sanitizeRef(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_LENGTH) return null;
  return ALLOWED.test(trimmed) ? trimmed : null;
}

/**
 * Reads ?ref= from the given search string and stores it. Last touch wins -
 * a newer ref overwrites an older one. Values that fail validation are
 * ignored (the previously stored ref, if any, is left untouched).
 */
export function captureRefFromSearch(search: string): void {
  try {
    const value = sanitizeRef(new URLSearchParams(search).get('ref'));
    if (!value) return;
    const payload: StoredRef = { value, capturedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage unavailable - tracking is best-effort, never fatal.
  }
}

/**
 * The stored ref, or null when absent/expired/corrupt. Expired entries are
 * cleared on read so they cannot be attached to a later enrollment.
 */
export function getStoredRef(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredRef>;
    const value = sanitizeRef(typeof parsed?.value === 'string' ? parsed.value : null);
    const capturedAt = typeof parsed?.capturedAt === 'number' ? parsed.capturedAt : 0;

    if (!value || !capturedAt || Date.now() - capturedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}
