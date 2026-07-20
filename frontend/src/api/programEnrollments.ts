import api from './axios';

export interface CreateProgramEnrollmentPayload {
  fullName: string;
  whatsappNumber: string;
  city?: string;
  email?: string;
  userType?: string;
  programSlug: string;
  programTitle: string;
  batchName: string;
}

export type EnrollmentStatus = 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'CANCELLED';

export interface ProgramEnrollment {
  id: string;
  fullName: string;
  whatsappNumber: string;
  city: string | null;
  email: string | null;
  userType: string | null;
  programSlug: string;
  programTitle: string;
  batchName: string;
  status: EnrollmentStatus;
  notes: string | null;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramEnrollmentStats {
  total: number;
  todayCount: number;
  byProgram: Array<{ programSlug: string; programTitle: string; count: number }>;
  byBatch: Array<{ programSlug: string; programTitle: string; batchName: string; count: number }>;
  last7Days: Array<{ date: string; count: number }>;
}

/** Public - captures the enrollment before the WhatsApp deep-link opens.
 *  Short timeout: the visitor must reach WhatsApp quickly even on a bad
 *  connection - a slow backend must never hold up the redirect. */
export const submitProgramEnrollment = (data: CreateProgramEnrollmentPayload) =>
  api.post('/program-enrollments', data, { timeout: 6000 });

export const getAdminProgramEnrollments = (params: Record<string, string | number | undefined>) =>
  api.get<{ data: ProgramEnrollment[]; total: number; page: number; limit: number }>(
    '/admin/program-enrollments',
    { params },
  );

export const getAdminProgramEnrollmentStats = () =>
  api.get<ProgramEnrollmentStats>('/admin/program-enrollments/stats');

export const updateProgramEnrollment = (
  id: string,
  data: { status?: EnrollmentStatus; notes?: string },
) => api.patch<ProgramEnrollment>(`/admin/program-enrollments/${id}`, data);

export const exportProgramEnrollmentsCsv = () =>
  api.get('/admin/program-enrollments/export', { responseType: 'blob' });
