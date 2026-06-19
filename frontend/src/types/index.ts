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
  admin: Admin;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Courses Module ────────────────────────────────────────────────────────────

export type CourseLevel = 'L1_FOUNDATION' | 'L2A_GENERALIST' | 'L2B_DEVELOPER';
export type CourseSlug = 'l1' | 'l2a' | 'l2b';

export interface CourseWhoItem {
  id: string;
  courseId: string;
  emoji: string;
  title: string;
  desc: string;
  order: number;
}

export interface CourseModule {
  id: string;
  courseId: string;
  label: string;
  title: string;
  topics: string[];
  order: number;
}

export interface CourseTool {
  id: string;
  courseId: string;
  emoji: string;
  name: string;
  category: string;
  order: number;
}

export interface CourseOutcome {
  id: string;
  courseId: string;
  title: string;
  desc: string;
  order: number;
}

export interface CourseBeforeAfter {
  id: string;
  courseId: string;
  beforeItems: string[];
  afterItems: string[];
}

export interface CourseEligibilityItem {
  id: string;
  courseId: string;
  text: string;
  order: number;
}

export interface CourseFAQ {
  id: string;
  courseId: string;
  question: string;
  answer: string;
  order: number;
}

export interface CourseTestimonial {
  id: string;
  courseId: string;
  initials: string;
  name: string;
  meta: string;
  avatarGrad: string;
  quote: string;
  before: string;
  after: string;
  order: number;
}

export interface CoursesListingWhoCard {
  id: string;
  pageId: string;
  emoji: string;
  title: string;
  desc: string;
  order: number;
}

export interface CoursesListingPage {
  id: string;
  heroTag: string;
  heroHeadingMain: string;
  heroHeadingAccent: string;
  heroSubtitle: string;
  whoTag: string;
  whoHeadingMain: string;
  whoHeadingAccent: string;
  ctaTag: string;
  ctaHeading: string;
  ctaDesc: string;
  ctaBtnPrimary: string;
  ctaBtnSecondary: string;
  whoCards: CoursesListingWhoCard[];
  updatedAt: string;
}

export interface AiCourse {
  id: string;
  level: CourseLevel;
  badgeText: string;
  title: string;
  tagline: string;
  heroImageUrl: string | null;
  duration: string;
  mentorship: string;
  trainingDays: string;
  language: string;
  mode: string;
  certificate: string;
  placementInfo: string;
  levelLabel: string;
  ctaDemoText: string;
  ctaWaText: string;
  ctaDownloadText: string;
  displayOrder: number;
  whoItems: CourseWhoItem[];
  modules: CourseModule[];
  tools: CourseTool[];
  outcomes: CourseOutcome[];
  beforeAfter: CourseBeforeAfter | null;
  eligibilityItems: CourseEligibilityItem[];
  faqs: CourseFAQ[];
  testimonials: CourseTestimonial[];
  updatedAt: string;
  createdAt: string;
}
