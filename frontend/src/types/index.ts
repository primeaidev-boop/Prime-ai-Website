// Shared TypeScript types for PRIM AI Institute frontend

export type Profile =
  | 'SCHOOL_STUDENT'
  | 'COLLEGE_STUDENT'
  | 'WORKING_PROFESSIONAL'
  | 'BUSINESS_OWNER'
  | 'OTHER';

export type Course =
  | 'LEVEL_1_FOUNDATION'
  | 'LEVEL_2A_GENERALIST'
  | 'LEVEL_2B_DEVELOPER'
  | 'NOT_SURE';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'CONVERTED' | 'LOST';

export interface DemoBooking {
  id: string;
  name: string;
  phone: string;
  profile: Profile;
  courseInterest: Course;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  profile: Profile;
  courseInterest: Course;
  message: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
}

export interface SiteSetting {
  key: string;
  value: string;
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  thisWeekLeads: number;
  convertedLeads: number;
  bookingsCount: number;
  enquiriesCount: number;
}

export interface CreateBookingDto {
  name: string;
  phone: string;
  profile: Profile;
  courseInterest: Course;
}

export interface CreateEnquiryDto {
  name: string;
  phone: string;
  email?: string;
  profile: Profile;
  courseInterest: Course;
  message: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  admin: Admin;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
