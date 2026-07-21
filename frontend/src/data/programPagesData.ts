// Program pages data - admin-managed, localStorage key: primAI_programPages
// Each ProgramPage is a standalone light-theme landing page reachable at /program/:slug.

const STORAGE_KEY = 'primAI_programPages';

// ── Shared utility ────────────────────────────────────────────────────────────

export function pgId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Same options as the Tutorial Leads "Who are you?" field, so program
// enrollments and tutorial leads stay comparable in the admin.
export const PROGRAM_ENROLLMENT_PROFILE_OPTIONS = [
  'School Student',
  'College Student',
  'Working Professional',
  'Business Owner',
  'Freelancer',
  'Job Seeker',
  'Other',
];

// ── Media values ──────────────────────────────────────────────────────────────
// Every image slot accepts either a plain URL string (all previously saved
// content) or a media object that can carry a looping video. Strings are
// normalized to image objects at read time via toMedia() - old content keeps
// rendering with zero migration. Image-only slots continue to be saved as
// plain strings; the object form is written only when a video is attached.

export interface PgMedia {
  type: 'image' | 'video';
  imageUrl: string;    // always required - poster + fallback for video slots
  videoUrl?: string;   // set only when type === 'video'
}

export type PgMediaValue = string | PgMedia;

export function toMedia(v: PgMediaValue | undefined | null): PgMedia {
  if (!v) return { type: 'image', imageUrl: '' };
  if (typeof v === 'string') return { type: 'image', imageUrl: v };
  if (v.type === 'video' && v.videoUrl) return v;
  return { type: 'image', imageUrl: v.imageUrl ?? '' };
}

/** True when the slot has anything to show (poster image or video). */
export function hasMedia(v: PgMediaValue | undefined | null): boolean {
  const m = toMedia(v);
  return Boolean(m.imageUrl || (m.type === 'video' && m.videoUrl));
}

// ── Sub-types ─────────────────────────────────────────────────────────────────

/** A named logo entry - used by the hero tools marquee and the trust bar. */
export interface PgLogoItem {
  id: string;
  name: string;
  logo: string;        // image URL (bundled /logos/* by default, admin-replaceable)
}

export interface PgNavLink {
  id: string;
  label: string;
  href: string;        // anchor like "#plan" or full URL
}

export interface PgBuildCard {
  id: string;
  image: PgMediaValue; // URL string or media object - admin-editable
  title: string;
}

export interface PgDayItem {
  id: string;
  number: number;
  title: string;
  isProject: boolean;
  phase: 'toolkit' | 'project';  // 'toolkit' → blue circle, 'project' → orange circle
}

export interface PgClassroomImage {
  id: string;
  url: PgMediaValue;
  alt: string;
  isWide: boolean;     // the first/big image spans 2 cols on desktop
}

export interface PgLearnerCard {
  id: string;
  image: PgMediaValue;
  title: string;
  desc: string;
}

export interface PgMentor {
  id: string;
  image: PgMediaValue;
  name: string;
  role: string;
  bio: string;
}

export type BatchStatus = 'Open' | 'Filling Fast' | 'Closed';

export interface PgBatch {
  id: string;
  name: string;         // "Batch 7"
  datetime: string;     // "Starts 21 July | Evening"
  status: BatchStatus;
  seatsText: string;    // "6 seats left of 20"
}

export interface PgTestimonial {
  id: string;
  image: PgMediaValue;
  quote: string;
  name: string;
  meta: string;         // "Homemaker · Ahmedabad · Batch 5"
}

export interface PgFeature {
  id: string;
  text: string;
}

export interface PgFaq {
  id: string;
  question: string;
  answer: string;
}

export interface PgFooterLink {
  id: string;
  section: string;      // group heading: "Program", "Support", etc.
  label: string;
  href: string;
}

// ── Master type ───────────────────────────────────────────────────────────────

export interface ProgramPage {
  id: string;
  slug: string;
  visible: boolean;
  pageTitle: string;
  pageDescription: string;

  // ── Announcement bar
  announcementText: string;
  announcementBadge: string;

  // ── Header
  brandName: string;
  navLinks: PgNavLink[];
  headerCtaText: string;

  // ── Hero
  heroHeading: string;
  heroHeadingGradient: string;   // the gradient-coloured phrase
  showHeroGuarantee: boolean;    // trust strip directly below the title
  heroGuaranteeText: string;
  heroSubtext: string;
  heroPrice: string;
  heroStrikePrice: string;
  heroPriceBadge: string;
  heroCtaText: string;
  showHeroSocialProof: boolean;  // small rating line under the CTA button
  heroSocialProofText: string;
  heroImage: PgMediaValue;
  heroFloatingBadge: string;

  // ── Hero tools marquee ("TOOLS YOU'LL MASTER", below the subtitle)
  heroToolsLabel: string;
  heroTools: PgLogoItem[];       // empty array hides the marquee

  // ── Trust bar (full-width strip below the hero)
  showTrustBar: boolean;
  trustBarLabel: string;
  trustBarCompanies: PgLogoItem[];
  trustBarTrailing: string;      // e.g. "and 500+ more"

  // ── Stat band (dark section below hero)
  statNumber: string;
  statText: string;

  // ── "What You'll Build" section
  buildSectionTitle: string;
  buildCards: PgBuildCard[];

  // ── "Day-by-Day Plan" section
  dayPlanTitle: string;
  dayPlanPill1: string;          // "Days 1–5 Master the Toolkit"
  dayPlanPill2: string;          // "Days 6–10 Build 5 Real Projects"
  dayPlanItems: PgDayItem[];

  // ── Classroom gallery
  classroomTitle: string;
  classroomImages: PgClassroomImage[];   // first item should have isWide: true

  // ── "Designed for Every Learner"
  learnerSectionTitle: string;
  learnerCards: PgLearnerCard[];

  // ── Mentors
  mentorSectionTitle: string;
  mentors: PgMentor[];

  // ── Batches
  batchSectionTitle: string;
  batches: PgBatch[];

  // ── Testimonials
  testimonialSectionTitle: string;
  testimonials: PgTestimonial[];

  // ── Pricing
  pricingStrikePrice: string;
  pricingActualPrice: string;
  pricingBadge: string;
  pricingFeatures: PgFeature[];
  pricingCtaText: string;
  pricingCertImage: PgMediaValue;

  // ── Enrollment form
  formTitle: string;
  formNameLabel: string;
  formNamePlaceholder: string;
  formPhoneLabel: string;
  formPhonePlaceholder: string;
  formBatchLabel: string;
  formSubmitText: string;
  whatsappNumber: string;        // e.g. "917573055191" (no + or spaces)
  whatsappMessageTemplate: string;

  // ── Thank You page (shown after a confirmed enrollment capture, before
  // the WhatsApp redirect) - see pages/ThankYouPage.tsx
  thankYouHeading: string;
  thankYouSubtext: string;
  thankYouCountdownSeconds: number;
  thankYouWhatsappMessageTemplate: string;  // placeholders: {name} {program} {batch}

  // Optional predefined fields - toggle per program without code changes.
  // Submissions only store whatever fields were active at submit time.
  showCityField: boolean;
  formCityLabel: string;
  formCityPlaceholder: string;
  showEmailField: boolean;
  formEmailLabel: string;
  formEmailPlaceholder: string;
  showUserTypeField: boolean;
  formUserTypeLabel: string;

  // ── FAQ
  faqSectionTitle: string;
  faqs: PgFaq[];

  // ── Bottom CTA banner
  ctaBannerText: string;
  ctaBannerBtnText: string;

  // ── Footer
  footerTagline: string;
  footerLinks: PgFooterLink[];
  footerAddress: string;
  footerCertImage: PgMediaValue;
  footerCopyright: string;
}

// ── Default logo lists ────────────────────────────────────────────────────────
// Real brand assets bundled in frontend/public/logos/. Exported so renderers
// can fall back to them when older saved content predates these fields.

export const DEFAULT_HERO_TOOLS: PgLogoItem[] = [
  { id: pgId(), name: 'ChatGPT',    logo: '/logos/chatgpt.png' },
  { id: pgId(), name: 'Claude',     logo: '/logos/claude.png' },
  { id: pgId(), name: 'Gemini',     logo: '/logos/gemini.png' },
  { id: pgId(), name: 'NotebookLM', logo: '/logos/notebooklm.png' },
  { id: pgId(), name: 'Midjourney', logo: '/logos/midjourney.png' },
  { id: pgId(), name: 'n8n',        logo: '/logos/n8n.png' },
  { id: pgId(), name: 'HeyGen',     logo: '/logos/heygen.png' },
  { id: pgId(), name: 'Perplexity', logo: '/logos/perplexity.png' },
  { id: pgId(), name: 'Gamma',      logo: '/logos/gamma.png' },
];

export const DEFAULT_TRUST_COMPANIES: PgLogoItem[] = [
  { id: pgId(), name: 'Google',    logo: '/logos/google.svg' },
  { id: pgId(), name: 'Microsoft', logo: '/logos/microsoft.svg' },
  { id: pgId(), name: 'Deloitte',  logo: '/logos/deloitte.svg' },
  { id: pgId(), name: 'Amazon',    logo: '/logos/amazon.svg' },
  { id: pgId(), name: 'Infosys',   logo: '/logos/infosys.svg' },
  { id: pgId(), name: 'TCS',       logo: '/logos/tcs.svg' },
];

// ── Default data (seeded from the 10-Day Hands-On AI Program HTML) ────────────

const DEFAULT_10DAY: ProgramPage = {
  id: 'prog-10day-ai',
  slug: '10-day-ai',
  visible: true,
  pageTitle: 'PRIM AI Institute - 10-Day Hands-On AI Program',
  pageDescription:
    'Master ChatGPT, Claude, and Gemini in 10 practical days for ₹399. 5 real projects, ISO certificate, no coding required.',

  // Announcement bar
  announcementText: 'New 10-Day Hands-On AI Program - all 10 days for just ₹399',
  announcementBadge: 'Limited seats',

  // Header
  brandName: 'PRIM AI Institute',
  navLinks: [
    { id: pgId(), label: "What You'll Build", href: '#build' },
    { id: pgId(), label: '10-Day Plan',        href: '#plan' },
    { id: pgId(), label: 'Batches',            href: '#batches' },
    { id: pgId(), label: 'Pricing',            href: '#pricing' },
    { id: pgId(), label: 'FAQ',                href: '#faq' },
  ],
  headerCtaText: 'Enroll - ₹399',

  // Hero
  heroHeading: '10 Days to Go From',
  heroHeadingGradient: 'AI-Curious to AI-Capable',
  showHeroGuarantee: true,
  heroGuaranteeText: '100% Money-Back Guarantee',
  heroSubtext:
    'Master ChatGPT, Claude, and Gemini through practical daily projects. No coding required. Build real-world skills that make you indispensable.',
  heroPrice: '₹399',
  heroStrikePrice: '₹2,999',
  heroPriceBadge: 'Launch batch price',
  heroCtaText: 'Book My Seat - ₹399',
  showHeroSocialProof: true,
  heroSocialProofText: '⭐⭐⭐⭐⭐ Rated by 5,000+ Learners',
  heroImage: '',
  heroFloatingBadge: '5 Real Projects · 10 Days',

  heroToolsLabel: "Tools You'll Master",
  heroTools: DEFAULT_HERO_TOOLS,

  showTrustBar: true,
  trustBarLabel: 'Trusted by learners from',
  trustBarCompanies: DEFAULT_TRUST_COMPANIES,
  trustBarTrailing: 'and 500+ more',

  // Stat band
  statNumber: '82%',
  statText: "of companies can't find AI-ready talent - be the 18% they're looking for.",

  // Build section
  buildSectionTitle: "Everything You'll Build in 10 Days",
  buildCards: [
    { id: pgId(), image: '', title: 'Your Personal AI Assistant' },
    { id: pgId(), image: '', title: 'ATS-Optimized AI Resume' },
    { id: pgId(), image: '', title: 'Viral Social Media Content' },
    { id: pgId(), image: '', title: 'Professional AI Avatar Video' },
    { id: pgId(), image: '', title: 'High-Converting Landing Page' },
    { id: pgId(), image: '', title: 'Data-Driven AI Presentations' },
  ],

  // Day plan
  dayPlanTitle: 'Your Day-by-Day 10-Day Plan',
  dayPlanPill1: 'Days 1–5 Master the Toolkit',
  dayPlanPill2: 'Days 6–10 Build 5 Real Projects',
  dayPlanItems: [
    { id: pgId(), number: 1,  title: 'AI Foundations & The New World',        isProject: false, phase: 'toolkit' },
    { id: pgId(), number: 2,  title: 'The Art of Prompting',                  isProject: false, phase: 'toolkit' },
    { id: pgId(), number: 3,  title: 'Mastering Text: ChatGPT & Claude',      isProject: false, phase: 'toolkit' },
    { id: pgId(), number: 4,  title: 'Visual AI: Midjourney & Canva',         isProject: false, phase: 'toolkit' },
    { id: pgId(), number: 5,  title: 'AI for Productivity & Workflows',       isProject: false, phase: 'toolkit' },
    { id: pgId(), number: 6,  title: 'Build Your Personal AI Assistant',      isProject: true,  phase: 'project' },
    { id: pgId(), number: 7,  title: 'Create Your ATS-Optimized Resume',      isProject: true,  phase: 'project' },
    { id: pgId(), number: 8,  title: 'Design Viral Social Media Content',     isProject: true,  phase: 'project' },
    { id: pgId(), number: 9,  title: 'Launch Your Own Landing Page',          isProject: true,  phase: 'project' },
    { id: pgId(), number: 10, title: 'The Capstone: Your AI Business Model',  isProject: true,  phase: 'project' },
  ],

  // Classroom gallery
  classroomTitle: 'Real Classroom. Real Hands-On Learning.',
  classroomImages: [
    { id: pgId(), url: '', alt: 'Instructor teaching AI',         isWide: true  },
    { id: pgId(), url: '', alt: 'Hands typing on AI interface',   isWide: false },
    { id: pgId(), url: '', alt: 'Students collaborating',         isWide: false },
  ],

  // Learner types
  learnerSectionTitle: 'Designed for Every Learner',
  learnerCards: [
    { id: pgId(), image: '', title: 'Students',        desc: 'Future-proof your career with in-demand AI skills.' },
    { id: pgId(), image: '', title: 'Professionals',   desc: 'Automate repetitive tasks and 10x your productivity.' },
    { id: pgId(), image: '', title: 'Homemakers',      desc: 'Empower yourself to restart your career or manage home better.' },
    { id: pgId(), image: '', title: 'Business Owners', desc: 'Scale your business with AI-driven marketing and efficiency.' },
  ],

  // Mentors
  mentorSectionTitle: 'Meet Your Mentors',
  mentors: [
    {
      id: pgId(), image: '', name: 'Dr. Arvind Shah', role: 'Lead AI Instructor',
      bio: 'PhD in Machine Learning with 15+ years of industry experience at top tech firms.',
    },
    {
      id: pgId(), image: '', name: 'Priya Nair', role: 'AI Research Expert',
      bio: 'Former Senior Researcher specializing in Generative AI and Large Language Models.',
    },
    {
      id: pgId(), image: '', name: 'Rahul Mehta', role: 'Tech Mentor',
      bio: 'Full-stack developer and AI consultant helping startups integrate smart workflows.',
    },
  ],

  // Batches
  batchSectionTitle: 'Pick Your Batch',
  batches: [
    { id: pgId(), name: 'Batch 7', datetime: 'Starts 21 July | Evening', status: 'Open',         seatsText: '6 seats left of 20' },
    { id: pgId(), name: 'Batch 8', datetime: 'Starts 28 July | Morning', status: 'Filling Fast', seatsText: '3 seats left' },
    { id: pgId(), name: 'Batch 6', datetime: 'Completed',                status: 'Closed',       seatsText: 'Full' },
  ],

  // Testimonials
  testimonialSectionTitle: 'Real Stories from Real Beginners',
  testimonials: [
    {
      id: pgId(), image: '',
      quote: "I never thought I could use AI at 40. Now I save 2 hours daily on my household management and side business!",
      name: 'Anjali Sharma', meta: 'Homemaker · Ahmedabad · Batch 5',
    },
    {
      id: pgId(), image: '',
      quote: "The hands-on projects made all the difference. I built my own personal assistant in just 10 days.",
      name: 'Rohan Mehta', meta: 'Professional · Ahmedabad · Batch 4',
    },
    {
      id: pgId(), image: '',
      quote: "I landed an internship because I could show real AI projects on my resume. Best ₹399 I ever spent.",
      name: 'Aryan Patel', meta: 'Student · Ahmedabad · Batch 7',
    },
  ],

  // Pricing
  pricingStrikePrice: '₹2,999',
  pricingActualPrice: '₹399',
  pricingBadge: 'Limited time launch offer',
  pricingFeatures: [
    { id: pgId(), text: '10 In-person sessions' },
    { id: pgId(), text: '5 Real-world projects' },
    { id: pgId(), text: '10+ AI tools mastered' },
    { id: pgId(), text: 'Personal mentorship' },
    { id: pgId(), text: 'ISO 9001:2015 Certificate' },
  ],
  pricingCtaText: 'Book My Seat Now',
  pricingCertImage: '',

  // Enrollment form
  formTitle: 'Book Your ₹399 Seat',
  formNameLabel: 'Full Name',
  formNamePlaceholder: 'Enter your name',
  formPhoneLabel: 'WhatsApp Number',
  formPhonePlaceholder: 'Enter WhatsApp number',
  formBatchLabel: 'Select Batch',
  formSubmitText: 'Confirm on WhatsApp',
  whatsappNumber: '917573055191',
  whatsappMessageTemplate:
    'Hi! I want to enroll in the 10-Day AI Program (₹399). Name: {name}, Phone: {phone}, Batch: {batch}. Please share enrollment details.',

  thankYouHeading: 'Thank You! Your Seat Request is Received 🎉',
  thankYouSubtext: 'Our team will confirm your enrollment on WhatsApp shortly.',
  thankYouCountdownSeconds: 3,
  thankYouWhatsappMessageTemplate:
    "Hi, I'm {name}. I just booked my seat for {program} – {batch}. Please confirm my enrollment.",

  showCityField: true,
  formCityLabel: 'City',
  formCityPlaceholder: 'Enter your city',
  showEmailField: false,
  formEmailLabel: 'Email',
  formEmailPlaceholder: 'Enter your email',
  showUserTypeField: false,
  formUserTypeLabel: 'Who are you?',

  // FAQ
  faqSectionTitle: 'Frequently Asked Questions',
  faqs: [
    { id: pgId(), question: 'Is this program for absolute beginners?',  answer: 'Yes! We start from the absolute basics. No coding or technical background is required.' },
    { id: pgId(), question: 'Will I get a certificate?',                answer: 'Yes, you will receive an ISO 9001:2015 certified certificate upon successful completion of the 10-day program.' },
    { id: pgId(), question: 'What tools will I learn?',                 answer: 'You will master ChatGPT, Claude, Gemini, Midjourney, Canva AI, and several productivity automation tools.' },
    { id: pgId(), question: 'What are the class timings?',              answer: "We have morning and evening batches to suit your schedule. Check the 'Pick Your Batch' section for specific dates." },
    { id: pgId(), question: 'Is there any software I need to buy?',     answer: 'No. We will primarily use free versions of tools or provide guidance on how to access them without extra cost.' },
    { id: pgId(), question: 'What if I miss a session?',               answer: 'All sessions are recorded and shared with participants, so you can catch up at your own pace.' },
  ],

  // CTA banner
  ctaBannerText: 'The best time to learn AI was yesterday. The second best time is today.',
  ctaBannerBtnText: 'Secure My Spot Now',

  // Footer
  footerTagline: 'Learn AI. Use AI. Lead with AI.',
  footerLinks: [
    { id: pgId(), section: 'Program', label: 'Curriculum', href: '#plan' },
    { id: pgId(), section: 'Program', label: 'Projects',   href: '#build' },
    { id: pgId(), section: 'Program', label: 'Mentors',    href: '#mentors' },
    { id: pgId(), section: 'Support', label: 'FAQ',        href: '#faq' },
    { id: pgId(), section: 'Support', label: 'Contact Us', href: '#enroll' },
    { id: pgId(), section: 'Support', label: 'WhatsApp',   href: '#enroll' },
  ],
  footerAddress: '123 Tech Hub, Ahmedabad, Gujarat, India',
  footerCertImage: '',
  footerCopyright: '© 2026 PRIM AI Institute. All rights reserved.',
};

// ── Persistence helpers ───────────────────────────────────────────────────────

export function loadProgramPagesData(): ProgramPage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [DEFAULT_10DAY];
    const parsed = JSON.parse(raw) as ProgramPage[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_10DAY];
  } catch {
    return [DEFAULT_10DAY];
  }
}

export function saveProgramPagesData(pages: ProgramPage[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
}

export function getProgramBySlug(slug: string): ProgramPage | undefined {
  return loadProgramPagesData().find((p) => p.slug === slug && p.visible);
}

export function emptyProgramPage(): ProgramPage {
  return {
    ...DEFAULT_10DAY,
    id: pgId(),
    slug: 'new-program',
    visible: false,
    pageTitle: 'New Program',
    pageDescription: '',
    announcementText: '',
    announcementBadge: '',
    buildCards: [],
    dayPlanItems: [],
    classroomImages: [],
    learnerCards: [],
    mentors: [],
    batches: [],
    testimonials: [],
    pricingFeatures: [],
    faqs: [],
    footerLinks: [],
  };
}
