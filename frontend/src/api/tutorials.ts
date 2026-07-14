import axios from 'axios';
import api from './axios';
import type { TutorialPageData } from '@/types';

const base = import.meta.env.VITE_API_URL || '/api';

// Session cache: the payload is ~92 KB gzipped and pages already paint instantly
// from localStorage (stale-while-revalidate), so refetching on every page mount
// within the same session is wasted bandwidth. TTL keeps admin edits visible fast.
const CACHE_TTL_MS = 5 * 60 * 1000;
let cached: { data: TutorialPageData; at: number } | null = null;

/** Public fetch - no auth needed. Returns null if no data saved yet on server. */
export async function getTutorialData(): Promise<TutorialPageData | null> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }
  try {
    const res = await axios.get<TutorialPageData | null>(`${base}/tutorials/data`, {
      params: { t: Date.now() },
    });
    if (res.data && typeof res.data === 'object' && 'tutorials' in res.data) {
      cached = { data: res.data as TutorialPageData, at: Date.now() };
      return res.data as TutorialPageData;
    }
    return null;
  } catch {
    return null;
  }
}

/** Admin save - JWT cookie sent automatically by the `api` instance. */
export async function putTutorialData(data: TutorialPageData): Promise<void> {
  await api.put('/tutorials/data', data);
  // Bust the session cache so the admin (and this tab) sees the save immediately
  cached = { data, at: Date.now() };
}
