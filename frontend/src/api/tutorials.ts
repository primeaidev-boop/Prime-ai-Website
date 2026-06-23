import axios from 'axios';
import api from './axios';
import type { TutorialPageData } from '@/types';

const base = import.meta.env.VITE_API_URL || '/api';

/** Public fetch — no auth needed. Returns null if no data saved yet on server. */
export async function getTutorialData(): Promise<TutorialPageData | null> {
  try {
    const res = await axios.get<TutorialPageData | null>(`${base}/tutorials/data`, {
      params: { t: Date.now() },
    });
    if (res.data && typeof res.data === 'object' && 'tutorials' in res.data) {
      return res.data as TutorialPageData;
    }
    return null;
  } catch {
    return null;
  }
}

/** Admin save — JWT cookie sent automatically by the `api` instance. */
export async function putTutorialData(data: TutorialPageData): Promise<void> {
  await api.put('/tutorials/data', data);
}
