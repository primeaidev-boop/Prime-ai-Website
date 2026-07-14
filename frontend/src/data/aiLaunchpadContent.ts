// Local, static content for the "10-Day AI Launchpad" campaign page.
// Not fetched from the backend and not wired into the /admin ContentBlock
// system — this program has no row in the `courses` table (see PROJECT plan).
// Anything not confirmed by real docs is a bracketed placeholder, not an
// invented fact — search for "TODO" to find every item that needs real data.

export interface CurriculumDay {
  day: number;
  title: string;
  practical: string;
}

export const CURRICULUM: CurriculumDay[] = [
  { day: 1, title: 'What Is AI + Today’s AI Landscape', practical: 'First Steps with the Big Assistants' },
  { day: 2, title: 'How AI Works + The Art of Prompting', practical: 'Prompt Improvement Challenge' },
  { day: 3, title: 'AI for Research and Working with Documents', practical: 'Research Sprint + Talk to Your Documents' },
  { day: 4, title: 'Creative AI: Images, Voice, Music, and Video', practical: 'AI Creative Studio' },
  { day: 5, title: 'AI for Everyday Productivity + Using AI Responsibly', practical: 'From Notes to Presentation in Minutes' },
  { day: 6, title: 'Project 1: Build Your Resume with AI', practical: 'Build an ATS-Ready Resume' },
  { day: 7, title: 'Project 2: Branded Social Media Posts with AI', practical: 'Create a Branded Post Set' },
  { day: 8, title: 'Project 3: Your AI Digital Twin and Avatar Videos', practical: 'Make Your First Avatar Video' },
  { day: 9, title: 'Project 4: Build and Publish a Landing Page', practical: 'Launch a Live Landing Page' },
  { day: 10, title: 'Project 5 (Capstone): Build Your Own AI Assistant', practical: 'Assemble and Demo Your Assistant' },
];

export interface AudienceCard {
  id: string;
  label: string;
  emoji: string;
  benefit: string;
}

export const AUDIENCE_CARDS: AudienceCard[] = [
  { id: 'students', label: 'Students', emoji: '🎓', benefit: 'Build a portfolio of 5 real AI projects before you even graduate.' },
  { id: 'professionals', label: 'Working Professionals', emoji: '💼', benefit: 'Learn the AI tools already changing your industry — in 10 days, not 10 months.' },
  { id: 'homemakers', label: 'Homemakers', emoji: '🏡', benefit: 'Turn spare hours into a real, marketable skill set — no prior experience needed.' },
  { id: 'business-owners', label: 'Business Owners', emoji: '🚀', benefit: 'Use AI for content, marketing, and productivity without hiring a tech team.' },
];

export interface OutcomeTile {
  id: string;
  emoji: string;
  title: string;
}

export const OUTCOMES: OutcomeTile[] = [
  { id: 'resume', emoji: '📄', title: 'ATS-Ready Resume' },
  { id: 'social', emoji: '📱', title: 'Branded Social Post Set' },
  { id: 'avatar', emoji: '🎥', title: 'AI Avatar Video' },
  { id: 'landing', emoji: '🌐', title: 'Live Landing Page' },
  { id: 'assistant', emoji: '🤖', title: 'Your Own AI Assistant' },
  { id: 'prompting', emoji: '✨', title: 'Confident, Practical Prompting' },
  { id: 'toolkit', emoji: '🧰', title: 'A Working AI Toolkit for Daily Life' },
  { id: 'certificate', emoji: '🏆', title: 'Certificate of Completion' },
];

export type BatchStatus = 'OPEN' | 'FILLING' | 'CLOSED';

export interface BatchSlot {
  id: string;
  dateLabel: string;
  timeLabel: string;
  status: BatchStatus;
}

// TODO: replace with real batch data once a batches/seats endpoint exists
// (no such table exists in backend/prisma/schema.prisma today — see plan).
// Dates below are intentionally bracketed placeholders, not real schedule.
export const BATCH_SLOTS: BatchSlot[] = [
  { id: 'batch-1', dateLabel: '[DATE TBD] — Batch A', timeLabel: '[TIME TBD]', status: 'FILLING' },
  { id: 'batch-2', dateLabel: '[DATE TBD] — Batch B', timeLabel: '[TIME TBD]', status: 'OPEN' },
];

export interface FacultyPlaceholder {
  name: string;
  credential: string;
}

// TODO: supply real faculty name(s), credentials, and photo before launch.
export const FACULTY: FacultyPlaceholder = {
  name: '[FACULTY NAME]',
  credential: '[CREDENTIAL / TITLE]',
};

export interface TestimonialPlaceholder {
  id: string;
  audience: string;
  name: string;
  city: string;
  quote: string;
}

// TODO: replace every field with a real testimonial before launch —
// these are structural placeholders only, not invented quotes attributed
// to real people.
export const TESTIMONIALS: TestimonialPlaceholder[] = [
  { id: 't-student', audience: 'Student', name: '[Student Name]', city: '[City]', quote: '[Placeholder outcome quote — replace with a real testimonial]' },
  { id: 't-professional', audience: 'Working Professional', name: '[Professional Name]', city: '[City]', quote: '[Placeholder outcome quote — replace with a real testimonial]' },
  { id: 't-homemaker', audience: 'Homemaker', name: '[Homemaker Name]', city: '[City]', quote: '[Placeholder outcome quote — replace with a real testimonial]' },
  { id: 't-business', audience: 'Business Owner', name: '[Business Owner Name]', city: '[City]', quote: '[Placeholder outcome quote — replace with a real testimonial]' },
];

export interface LaunchpadFaq {
  id: string;
  question: string;
  answer: string;
}

export const FAQS: LaunchpadFaq[] = [
  {
    id: 'coding',
    question: 'Do I need to know coding?',
    answer: 'No. The 10-Day AI Launchpad is built for complete beginners — every session uses point-and-click AI tools, not code. If you can use a smartphone or a web browser, you can do this course.',
  },
  {
    id: 'miss-session',
    question: 'What if I miss a live session?',
    answer: '[CONFIRM WITH TEAM] — whether missed live sessions are recorded and shared, or made up in another batch.',
  },
  {
    id: 'certificate-value',
    question: 'Is the certificate valid for my resume/LinkedIn?',
    answer: '[CONFIRM WITH TEAM] — confirm the certificate’s issuing basis and recommended wording before this is promised on a paid-ad page.',
  },
  {
    id: 'not-tech-savvy',
    question: 'What if I’m not tech-savvy at all?',
    answer: 'That’s exactly who this course is for. The pace, the tools, and the projects are all chosen to work for absolute beginners — no assumed background at all.',
  },
  {
    id: 'refund',
    question: 'Refund policy?',
    answer: 'All course fees paid to PRIM AI Institute are non-refundable once paid — see our full Refund Policy. That’s why we offer a free sample session before you enroll, so you can be confident before you pay.',
  },
];

export const PRICING_INCLUDES: string[] = [
  '10 live, instructor-led days',
  '5 real, hands-on projects',
  'Certificate of Completion',
  'No coding required',
  'Beginner-friendly pace',
];
