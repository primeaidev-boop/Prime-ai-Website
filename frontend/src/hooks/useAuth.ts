// Auth hook — reads from authStore and provides typed access with redirect helper

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { admin, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/admin/login');
  };

  return { admin, isAuthenticated, logout: signOut };
}
