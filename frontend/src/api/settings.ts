import axios from 'axios';

const base = import.meta.env.VITE_API_URL || '/api';

export const getPublicSettings = () =>
  axios.get<Record<string, string>>(`${base}/settings/public`, {
    params: { t: Date.now() },  // cache-bust - settings must always be fresh
  });
