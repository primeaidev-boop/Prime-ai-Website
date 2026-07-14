import axios from 'axios';
import api from './axios';
import type { ProjectPageData } from '@/types';

const base = import.meta.env.VITE_API_URL || '/api';

// Session cache: the payload is ~71 KB gzipped and pages already paint instantly
// from localStorage (stale-while-revalidate), so refetching on every page mount
// within the same session is wasted bandwidth. TTL keeps admin edits visible fast.
const CACHE_TTL_MS = 5 * 60 * 1000;
let cached: { data: ProjectPageData; at: number } | null = null;

/** Public fetch - no auth needed. Returns null if no data saved on server yet. */
export async function getProjectsData(): Promise<ProjectPageData | null> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }
  try {
    const res = await axios.get<ProjectPageData | null>(`${base}/projects/data`, {
      params: { t: Date.now() },
    });
    if (res.data && typeof res.data === 'object' && 'projects' in res.data) {
      cached = { data: res.data as ProjectPageData, at: Date.now() };
      return res.data as ProjectPageData;
    }
    return null;
  } catch {
    return null;
  }
}

/** Admin save - JWT sent automatically by the `api` instance. */
export async function putProjectsData(data: ProjectPageData): Promise<void> {
  await api.put('/projects/data', data);
  // Bust the session cache so the admin (and this tab) sees the save immediately
  cached = { data, at: Date.now() };
}
