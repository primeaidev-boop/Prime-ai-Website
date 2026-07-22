import { lazy } from 'react';
import type { ComponentType } from 'react';

const RELOAD_FLAG = 'pp_chunk_reload';

/**
 * A drop-in replacement for React.lazy that survives deploys.
 *
 * Each production build gives every code-split chunk a new content hash and
 * deletes the previous files. A browser tab that loaded the app BEFORE a
 * deploy still references the old hashes, so the next dynamic import (e.g.
 * navigating to the Thank-You page after submitting the enroll form) requests
 * a chunk that no longer exists → 404 → the unhandled rejection unmounts the
 * whole app into a blank page.
 *
 * On such a failure we reload once, which fetches the fresh index.html and its
 * current chunk graph. A one-shot sessionStorage guard prevents a reload loop
 * when the failure is genuine (offline, real 5xx) - in that case we rethrow so
 * the ErrorBoundary can show a real message.
 */
export function lazyWithRetry<T extends ComponentType<object>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const mod = await factory();
      sessionStorage.removeItem(RELOAD_FLAG);
      return mod;
    } catch (err) {
      if (!sessionStorage.getItem(RELOAD_FLAG)) {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
        // Never resolve - keep the tree suspended until the reload takes over.
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}
