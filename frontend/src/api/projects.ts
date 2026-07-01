import axios from 'axios';
import api from './axios';
import type { ProjectPageData } from '@/types';

const base = import.meta.env.VITE_API_URL || '/api';

/** Public fetch — no auth needed. Returns null if no data saved on server yet. */
export async function getProjectsData(): Promise<ProjectPageData | null> {
  try {
    const res = await axios.get<ProjectPageData | null>(`${base}/projects/data`, {
      params: { t: Date.now() },
    });
    if (res.data && typeof res.data === 'object' && 'projects' in res.data) {
      return res.data as ProjectPageData;
    }
    return null;
  } catch {
    return null;
  }
}

/** Admin save — JWT sent automatically by the `api` instance. */
export async function putProjectsData(data: ProjectPageData): Promise<void> {
  await api.put('/projects/data', data);
}
