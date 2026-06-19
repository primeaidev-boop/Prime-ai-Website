// Auth hook - reads from authStore; logout clears httpOnly cookie via server

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { adminLogout } from '@/api/admin';

export function useAuth() {
  const { admin, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      await adminLogout();
    } catch {
      // cookie cleared server-side; proceed regardless
    }
    logout();
    navigate('/admin/login');
  };

  return { admin, isAuthenticated, logout: signOut };
}
