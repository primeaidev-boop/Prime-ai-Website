// Admin API calls - auth, stats, bookings/enquiries CRUD, settings

import api from './axios';
import type { LoginDto, LeadStatus } from '@/types';

export const adminLogin = (data: LoginDto) => api.post('/auth/login', data);
export const adminLogout = () => api.post('/auth/logout');
export const authMe = () => api.get('/auth/me');

export const getStats = () => api.get('/admin/stats');

export const getRecentLeads = (limit = 10) =>
  api.get('/admin/recent-leads', { params: { limit } });

export const getBookings = (params?: {
  status?: LeadStatus;
  page?: number;
  limit?: number;
  search?: string;
}) => api.get('/admin/bookings', { params });

export const updateBookingStatus = (
  id: string,
  status: LeadStatus,
  notes?: string,
) => api.patch(`/admin/bookings/${id}`, { status, notes });

export const deleteBooking = (id: string) =>
  api.delete(`/admin/bookings/${id}`);

export const exportBookingsCsv = () =>
  api.get('/admin/bookings/export', { responseType: 'blob' });

export const getEnquiries = (params?: {
  status?: LeadStatus;
  page?: number;
  limit?: number;
  search?: string;
}) => api.get('/admin/enquiries', { params });

export const updateEnquiryStatus = (
  id: string,
  status: LeadStatus,
  notes?: string,
) => api.patch(`/admin/enquiries/${id}`, { status, notes });

export const deleteEnquiry = (id: string) =>
  api.delete(`/admin/enquiries/${id}`);

export const exportEnquiriesCsv = () =>
  api.get('/admin/enquiries/export', { responseType: 'blob' });

export const getSettings = () => api.get('/settings');

export const updateSetting = (key: string, value: string) =>
  api.patch(`/settings/${key}`, { value });
