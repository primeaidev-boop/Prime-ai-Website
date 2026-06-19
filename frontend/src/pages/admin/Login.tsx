// Admin login page - authenticates with JWT and stores token in Zustand

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/shared/GlassCard';
import { adminLogin } from '@/api/admin';
import { useAuthStore } from '@/store/authStore';
import type { LoginDto, AuthResponse } from '@/types';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>();

  const onSubmit = async (data: LoginDto) => {
    setError('');
    try {
      const res = await adminLogin(data);
      const { admin } = res.data as AuthResponse;
      login(admin);
      navigate('/admin/dashboard');
    } catch {
      setError('Invalid email or password.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--navy)' }}
    >
      <GlassCard className="w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/Asset%2013.svg"
              alt="PRIM AI Institute"
              className="h-20 w-auto"
            />
          </div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Sign in to your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              autoComplete="email"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && (
              <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: 'var(--orange)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In ➞'}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
