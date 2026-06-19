// Zustand auth store - persists admin display info only; actual auth is the httpOnly cookie

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Admin } from '@/types';

interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (admin: Admin) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      login: (admin) => set({ admin, isAuthenticated: true }),
      logout: () => set({ admin: null, isAuthenticated: false }),
    }),
    { name: 'primai_admin_auth' },
  ),
);
