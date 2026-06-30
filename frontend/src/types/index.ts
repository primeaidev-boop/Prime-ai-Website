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

// ─── Tutorial Module ───────────────────────────────────────────────────────────

export type TutorialDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface TutorialHeroStat {
  value: string;
  label: string;
}

export interface TutorialHero {
  badge: string;
  heading1: string;
  heading2: string;
  stats: TutorialHeroStat[];
  showGraphic: boolean;
}

export interface TutorialCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  order: number;
  isVisible: boolean;
}

export interface Tutorial {
  id: string;
  categorySlug: string;
  name: string;
  slug: string;
  thumbnailUrl?: string;
  logoColor: string;
  logoInitials: string;
  description: string;
  tags: string[];
  difficulty: TutorialDifficulty;
  isPremium: boolean;
  lessonCount: number;
  isFeatured: boolean;
  isVisible: boolean;
  order: number;
  ctaEnrollLink: string;
  ctaDownloadLink: string;
  chapters?: Chapter[];
  toolsAndStats?: ToolsAndStats;
  hasCertificate?: boolean;
}

export interface TutorialNewsletter {
  show: boolean;
  heading: string;
  placeholder: string;
  btnLabel: string;
}

export interface TutorialUpsell {
  show: boolean;
  heading: string;
  subtitle: string;
  btnEnroll: string;
  btnDownload: string;
  btnDemo: string;
}

export interface TutorialPageData {
  hero: TutorialHero;
  categories: TutorialCategory[];
  tutorials: Tutorial[];
  newsletter: TutorialNewsletter;
  upsell: TutorialUpsell;
}

// ─── Tutorial Content Blocks ──────────────────────────────────────────────────

export interface HeadingBlock { id: string; type: 'heading'; level: 1 | 2 | 3; text: string; }
export interface ParagraphBlock { id: string; type: 'paragraph'; html: string; }
export interface ImageBlock { id: string; type: 'image'; src: string; alt: string; caption?: string; }
export interface VideoBlock { id: string; type: 'video'; url: string; caption?: string; }
export interface HighlightBoxBlock { id: string; type: 'highlightBox'; icon: string; title: string; content: string; }
export type PromptTool = 'chatgpt' | 'gemini' | 'claude' | 'none';
export interface PromptBlock { id: string; type: 'prompt'; label: string; promptText: string; tryInTool: PromptTool; }
export interface TableBlock { id: string; type: 'table'; headers: string[]; rows: string[][]; }
export interface CodeBlock { id: string; type: 'code'; language: string; code: string; caption?: string; }
export type CalloutVariant = 'info' | 'success' | 'warning' | 'error';
export interface CalloutBlock { id: string; type: 'callout'; variant: CalloutVariant; title?: string; content: string; }
export interface ComparisonBlock { id: string; type: 'comparison'; leftTitle: string; rightTitle: string; leftItems: string[]; rightItems: string[]; }
export interface ChecklistBlock { id: string; type: 'checklist'; items: { id: string; text: string; checked: boolean }[]; }
export interface DownloadBlock { id: string; type: 'download'; label: string; href: string; fileType?: string; size?: string; }
export interface QuizOption { id: string; text: string; }
export type QuizBlockType = 'mcq' | 'truefalse' | 'multiselect';
export interface QuizBlock {
  id: string; type: 'quiz';
  question: string;
  options: QuizOption[];
  correctIndex: number;          // single-answer (mcq / truefalse)
  explanation?: string;
  // Phase 3 additions - all optional for backward compatibility
  quizType?: QuizBlockType;      // default 'mcq'
  passThreshold?: number;        // 0–100 %, default 100
  correctIndices?: number[];     // multi-select correct answers
}
export interface FaqItem { id: string; question: string; answer: string; }
export interface FaqBlock { id: string; type: 'faq'; items: FaqItem[]; }
export interface AiToolCardBlock { id: string; type: 'aiToolCard'; toolName: string; logoColor: string; logoInitials: string; description: string; tryLink?: string; }
export interface DividerBlock { id: string; type: 'divider'; }
/** Rich prose authored in the TipTap WYSIWYG editor; stored as an HTML string. */
export interface RichTextBlock { id: string; type: 'richText'; html: string; }

export type ContentBlock =
  | HeadingBlock | ParagraphBlock | ImageBlock | VideoBlock
  | HighlightBoxBlock | PromptBlock | TableBlock | CodeBlock
  | CalloutBlock | ComparisonBlock | ChecklistBlock | DownloadBlock
  | QuizBlock | FaqBlock | AiToolCardBlock | DividerBlock | RichTextBlock;

// ─── Lesson & Chapter ─────────────────────────────────────────────────────────

export type UnlockRule =
  | 'sequential'    // previous lesson must be marked complete
  | 'free'          // always accessible
  | 'quiz'          // Phase 2 alias ➞ treated as pass-quiz
  | 'manual'        // admin-only; locked client-side always
  | 'pass-quiz'     // previous lesson quiz must be passed
  | 'mark-complete' // explicit Mark Complete click on previous lesson
  | 'read-fully'    // previous lesson article scrolled to bottom
  | 'watch-video'   // previous lesson video watched (falls back to mark-complete)
  | 'custom';       // custom rule, falls back to mark-complete

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  lessonNumber: number;
  isFree: boolean;
  readTime: number;
  difficulty: TutorialDifficulty;
  toolName: string;
  intro: string;
  blocks: ContentBlock[];
  visible: boolean;
  locked: boolean;
  unlockRule: UnlockRule;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface ToolsAndStatsTool { id: string; name: string; icon: string; }

export interface ToolsAndStats {
  sessionLabel: string;
  liveTools: ToolsAndStatsTool[];
  promptTemplatesLink: string;
}

// ─── User Progress (Phase 3) ──────────────────────────────────────────────────

export type LessonStatus = 'not-started' | 'in-progress' | 'completed';

export interface LessonProgress {
  status: LessonStatus;
  startedAt?: string;          // ISO timestamp
  completedAt?: string;        // ISO timestamp
  quizPassed?: boolean;        // set when any quiz block in the lesson is passed
  scrolledToBottom?: boolean;  // set when scroll sentinel enters viewport
  videoWatched?: boolean;      // set when video reaches watch threshold
}

export interface TutorialProgressRecord {
  tutorialId: string;
  lessonsProgress: Record<string, LessonProgress>;  // lessonId ➞ progress
  completedAt?: string;        // ISO timestamp when all visible lessons done
  learningMinutes: number;
  certificateEarned?: boolean;
}

export interface Certificate {
  tutorialId: string;
  tutorialName: string;
  earnedAt: string;            // ISO timestamp
  learnerName?: string;
}

export interface UserProgress {
  learnerName: string;
  savedTutorials: string[];    // tutorialIds
  completedTutorials: string[];
  totalLearningMinutes: number;
  tutorials: Record<string, TutorialProgressRecord>;
  certificates: Certificate[];
  lastUpdated: string;
}

// ─── Analytics (Phase 3) ─────────────────────────────────────────────────────

export interface TutorialAnalytics {
  views: number;
  lastViewed: string;
}

export interface AnalyticsData {
  tutorials: Record<string, TutorialAnalytics>;
  totalViews: number;
  lastUpdated: string;
}

// ─── Projects Module ──────────────────────────────────────────────────────────

/** Single impact metric shown on project detail page (admin can add/remove freely) */
export interface ProjectImpactStat {
  id: string;
  value: string;  // e.g. "98%"
  label: string;  // e.g. "Detection Accuracy"
}

/** Filter category pill for the listing page */
export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;   // used for filtering
  order: number;
  isVisible: boolean;
}

/** Full project entry - all admin-editable fields */
export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  problemStatement: string;
  solution: string;
  keyFeatures: string[];          // checklist bullet points
  category: string;               // matches ProjectCategory.slug
  techStack: string[];            // variable tag list
  coverImageUrl?: string;
  // Featured / Award
  isFeatured: boolean;
  awardBadge?: string;            // e.g. "🏆 Best Innovation" - omit or empty = not shown
  // Student info
  studentName: string;
  studentInitials: string;
  studentPhotoUrl?: string;
  studentCohort: string;
  studentQuote: string;
  // Mentor info
  mentorName: string;
  mentorTitle: string;
  mentorQuote: string;
  // Variable impact stats
  impactStats: ProjectImpactStat[];
  // Optional links - only rendered when non-empty
  liveDemoUrl?: string;
  sourceCodeUrl?: string;
  // Admin controls
  visible: boolean;
  order: number;
}

/** Single stat in the listing-page header stats row */
export interface ProjectPageStat {
  id: string;
  value: string;  // e.g. "500+"
  label: string;  // e.g. "Student Projects"
}

export interface ProjectHero {
  eyebrow: string;
  heading1: string;
  heading2Gradient: string;   // rendered with gradient-text
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface ProjectCta {
  heading: string;
  description: string;
  btnLabel: string;
}

export interface ProjectPageData {
  hero: ProjectHero;
  stats: ProjectPageStat[];
  categories: ProjectCategory[];
  projects: Project[];
  cta: ProjectCta;
}

// ─────────────────────────────────────────────────────────────────────────────

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
