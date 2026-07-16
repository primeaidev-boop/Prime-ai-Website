import axios from 'axios';
import api from './axios';

const base = import.meta.env.VITE_API_URL || '/api';

// Session cache per key - pages already paint instantly from localStorage,
// so refetching on every mount within a session is wasted bandwidth.
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { data: unknown; at: number }>();

/**
 * Public fetch of a page-content document. Returns null when the key has
 * never been published (the caller falls back to bundled defaults) or when
 * the API is unreachable - visitors must always get a rendered page.
 */
export async function getPageContent<T>(key: string): Promise<T | null> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.data as T;
  }
  try {
    const res = await axios.get<{ key: string; content: T } | null>(`${base}/content/${key}`, {
      params: { t: Date.now() },
    });
    if (res.data && typeof res.data === 'object' && 'content' in res.data) {
      cache.set(key, { data: res.data.content, at: Date.now() });
      return res.data.content;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Admin save - auth cookie/JWT sent automatically by the `api` instance.
 * Throws on failure so callers can surface a real error (no silent
 * local-only saves).
 */
export async function putPageContent<T>(key: string, content: T): Promise<void> {
  await api.put(`/content/${key}`, content);
  cache.set(key, { data: content, at: Date.now() });
}
