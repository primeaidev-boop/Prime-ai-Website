import api from './axios';

export interface CreateTutorialLeadPayload {
  fullName: string;
  mobile: string;
  city: string;
  userType: string;
  tutorialAccessed: string;
  sourcePage: string;
}

export interface TrackViewPayload {
  mobile: string;
  tutorialAccessed: string;
}

export const submitTutorialLead = (data: CreateTutorialLeadPayload) =>
  api.post('/tutorial-leads', data);

export const trackTutorialView = (data: TrackViewPayload) =>
  api.post('/tutorial-leads/view', data);

export const getAdminTutorialLeads = (params: Record<string, string | number | undefined>) =>
  api.get('/admin/tutorial-leads', { params });

export const getAdminTutorialLeadStats = () =>
  api.get('/admin/tutorial-leads/stats');

export const exportTutorialLeadsCsv = () =>
  api.get('/admin/tutorial-leads/export', { responseType: 'blob' });
