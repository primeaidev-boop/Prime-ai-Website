// Default tutorial data - admin edits stored in localStorage under 'primAI_tutorials'
// Pages read localStorage first, fall back to this file if empty.

import type { TutorialPageData } from '@/types';

export const DEFAULT_TUTORIAL_DATA: TutorialPageData = {
  hero: {
    badge: '40+ Free AI Tool Tutorials',
    heading1: 'Master Every AI Tool',
    heading2: 'One Tutorial at a Time',
    stats: [
      { value: '40+', label: 'Tools' },
      { value: '120+', label: 'Tutorials' },
      { value: '100%', label: 'Free' },
    ],
    showGraphic: true,
  },
  newsletter: {
    show: true,
    heading: 'Sign up newsletter',
    placeholder: 'Email',
    btnLabel: 'Notify Me',
  },
  upsell: {
    show: true,
    heading: 'Ready to Go Beyond Tutorials?',
    subtitle:
      'Enroll in our structured AI programs for hands-on training, mentorship, and a certificate.',
    btnEnroll: 'Enroll in Foundation Program',
    btnDownload: 'Download Brochure',
    btnDemo: 'Book Free Demo',
  },
  categories: [
    { id: 'cat-1', name: 'AI Assistants', slug: 'ai-assistants', color: '#00D4FF', order: 1, isVisible: true },
    { id: 'cat-2', name: 'Research & Notes', slug: 'research', color: '#a78bfa', order: 2, isVisible: true },
    { id: 'cat-3', name: 'Writing', slug: 'writing', color: '#FF6B2B', order: 3, isVisible: true },
    { id: 'cat-4', name: 'Design', slug: 'design', color: '#FBBF24', order: 4, isVisible: true },
    { id: 'cat-5', name: 'Coding', slug: 'coding', color: '#34d399', order: 5, isVisible: true },
  ],
  tutorials: [
    // ── AI Assistants ─────────────────────────────────────────────────────────
    {
      id: 'tut-chatgpt',
      categorySlug: 'ai-assistants',
      name: 'ChatGPT',
      slug: 'chatgpt',
      logoColor: '#10a37f',
      logoInitials: 'GPT',
      description: 'The most popular LLM chat interface',
      tags: ['Writing', 'Coding', 'Analysis'],
      difficulty: 'Beginner',
      isPremium: false,
      lessonCount: 23,
      isFeatured: true,
      isVisible: true,
      order: 1,
      ctaEnrollLink: '/courses',
      ctaDownloadLink: '/contact',
      chapters: [
        {
          id: 'ch-chatgpt-1',
          title: 'Week 1 - AI Fundamentals',
          order: 1,
          lessons: [
            {
              id: 'les-chatgpt-1',
              title: 'What is AI?',
              slug: 'what-is-ai',
              lessonNumber: 1,
              isFree: true,
              readTime: 8,
              difficulty: 'Beginner',
              toolName: 'ChatGPT',
              intro: 'A plain-English introduction to artificial intelligence - what it is, where it came from, and why it matters right now.',
              blocks: [],
              visible: true,
              locked: false,
              unlockRule: 'sequential',
            },
            {
              id: 'les-chatgpt-2',
              title: 'Generative AI vs Traditional AI',
              slug: 'generative-vs-traditional-ai',
              lessonNumber: 2,
              isFree: true,
              readTime: 10,
              difficulty: 'Beginner',
              toolName: 'ChatGPT',
              intro: 'Understand the key difference between systems that classify and systems that create - and why the generative revolution changes everything.',
              blocks: [],
              visible: true,
              locked: false,
              unlockRule: 'sequential',
            },
            {
              id: 'les-chatgpt-3',
              title: 'How ChatGPT Works',
              slug: 'how-chatgpt-works',
              lessonNumber: 3,
              isFree: true,
              readTime: 12,
              difficulty: 'Beginner',
              toolName: 'ChatGPT',
              intro: "Understand the massive language model behind the interface. We'll break down tokens, context windows, and how it predicts the next word.",
              blocks: [
                {
                  id: 'b-chatgpt-3-1',
                  type: 'paragraph',
                  html: "<p>At its core, ChatGPT is a highly advanced text prediction engine powered by a Large Language Model (LLM). It doesn't <em>think</em> in the human sense; instead, it analyses vast amounts of text data to predict which word (or token) should come next based on the prompt you provide.</p>",
                },
                {
                  id: 'b-chatgpt-3-2',
                  type: 'highlightBox',
                  icon: '💡',
                  title: 'Key Concept: Tokens',
                  content: 'LLMs don\'t read words; they read "tokens." A token can be a word, part of a word, or even a single character. Rough rule of thumb: 100 tokens ≈ 75 words.',
                },
                {
                  id: 'b-chatgpt-3-3',
                  type: 'heading',
                  level: 2,
                  text: 'Try This Prompt',
                },
                {
                  id: 'b-chatgpt-3-4',
                  type: 'prompt',
                  label: 'Study Assistant Prompt',
                  promptText: 'Act as an expert AI tutor. Explain the concept of "Large Language Models" to a high school student in three simple bullet points. Use an analogy involving a highly advanced autocorrect.',
                  tryInTool: 'chatgpt',
                },
              ],
              visible: true,
              locked: false,
              unlockRule: 'sequential',
            },
            {
              id: 'les-chatgpt-4',
              title: 'AI Ethics & Responsible Use',
              slug: 'ai-ethics',
              lessonNumber: 4,
              isFree: false,
              readTime: 9,
              difficulty: 'Beginner',
              toolName: 'ChatGPT',
              intro: 'Explore the ethical dimensions of AI - bias, privacy, misinformation, and how to use these tools responsibly.',
              blocks: [],
              visible: true,
              locked: false,
              unlockRule: 'sequential',
            },
            {
              id: 'les-chatgpt-5',
              title: 'Prompt Engineering 101',
              slug: 'prompt-engineering-101',
              lessonNumber: 5,
              isFree: false,
              readTime: 15,
              difficulty: 'Beginner',
              toolName: 'ChatGPT',
              intro: 'Learn the science and art of writing prompts that get dramatically better results from any AI assistant.',
              blocks: [],
              visible: true,
              locked: false,
              unlockRule: 'sequential',
            },
          ],
        },
      ],
      toolsAndStats: {
        sessionLabel: 'Session',
        liveTools: [
          { id: 'live-gpt', name: 'ChatGPT 4.0', icon: '🤖' },
          { id: 'live-templates', name: 'Prompt Templates', icon: '📄' },
        ],
        promptTemplatesLink: '/tutorials/chatgpt',
      },
    },
    {
      id: 'tut-claude',
      categorySlug: 'ai-assistants',
      name: 'Claude',
      slug: 'claude',
      logoColor: '#CC785C',
      logoInitials: 'CL',
      description: "Anthropic's thoughtful AI assistant for deep analysis and writing",
      tags: ['Writing', 'Analysis'],
      difficulty: 'Beginner',
      isPremium: false,
      lessonCount: 23,
      isFeatured: false,
      isVisible: true,
      order: 2,
      ctaEnrollLink: '/courses',
      ctaDownloadLink: '/contact',
    },
    {
      id: 'tut-gemini',
      categorySlug: 'ai-assistants',
      name: 'Google Gemini',
      slug: 'google-gemini',
      logoColor: '#4285F4',
      logoInitials: 'GG',
      description: "Google's multimodal AI assistant with real-time search",
      tags: ['Research', 'Analysis'],
      difficulty: 'Beginner',
      isPremium: false,
      lessonCount: 23,
      isFeatured: false,
      isVisible: true,
      order: 3,
      ctaEnrollLink: '/courses',
      ctaDownloadLink: '/contact',
    },
    {
      id: 'tut-perplexity',
      categorySlug: 'ai-assistants',
      name: 'Perplexity',
      slug: 'perplexity',
      logoColor: '#20B2AA',
      logoInitials: 'PX',
      description: 'AI-powered search engine with real-time citations',
      tags: ['Research', 'Writing'],
      difficulty: 'Beginner',
      isPremium: false,
      lessonCount: 23,
      isFeatured: false,
      isVisible: true,
      order: 4,
      ctaEnrollLink: '/courses',
      ctaDownloadLink: '/contact',
    },
    // ── Research & Notes ─────────────────────────────────────────────────────
    {
      id: 'tut-obsidian',
      categorySlug: 'research',
      name: 'Obsidian',
      slug: 'obsidian',
      logoColor: '#7C3AED',
      logoInitials: 'OB',
      description: 'Knowledge management with powerful AI plugins',
      tags: ['Research', 'Productivity'],
      difficulty: 'Beginner',
      isPremium: false,
      lessonCount: 23,
      isFeatured: false,
      isVisible: true,
      order: 1,
      ctaEnrollLink: '/courses',
      ctaDownloadLink: '/contact',
    },
    {
      id: 'tut-notion',
      categorySlug: 'research',
      name: 'Notion AI',
      slug: 'notion-ai',
      logoColor: '#374151',
      logoInitials: 'NT',
      description: 'AI-powered workspace for notes, docs and databases',
      tags: ['Writing', 'Productivity'],
      difficulty: 'Beginner',
      isPremium: false,
      lessonCount: 23,
      isFeatured: false,
      isVisible: true,
      order: 2,
      ctaEnrollLink: '/courses',
      ctaDownloadLink: '/contact',
    },
    {
      id: 'tut-consensus',
      categorySlug: 'research',
      name: 'Consensus',
      slug: 'consensus',
      logoColor: '#2563EB',
      logoInitials: 'CS',
      description: 'AI search engine for scientific research papers',
      tags: ['Research', 'Analysis'],
      difficulty: 'Beginner',
      isPremium: false,
      lessonCount: 23,
      isFeatured: false,
      isVisible: true,
      order: 3,
      ctaEnrollLink: '/courses',
      ctaDownloadLink: '/contact',
    },
    {
      id: 'tut-elicit',
      categorySlug: 'research',
      name: 'Elicit',
      slug: 'elicit',
      logoColor: '#059669',
      logoInitials: 'EL',
      description: 'AI research assistant for literature review and synthesis',
      tags: ['Research'],
      difficulty: 'Beginner',
      isPremium: false,
      lessonCount: 23,
      isFeatured: false,
      isVisible: true,
      order: 4,
      ctaEnrollLink: '/courses',
      ctaDownloadLink: '/contact',
    },
    // ── Writing ──────────────────────────────────────────────────────────────
    {
      id: 'tut-jasper',
      categorySlug: 'writing',
      name: 'Jasper AI',
      slug: 'jasper-ai',
      logoColor: '#7C3AED',
      logoInitials: 'JA',
      description: 'AI writing assistant for marketing and long-form content',
      tags: ['Writing', 'Marketing'],
      difficulty: 'Beginner',
      isPremium: false,
      lessonCount: 18,
      isFeatured: false,
      isVisible: true,
      order: 1,
      ctaEnrollLink: '/courses',
      ctaDownloadLink: '/contact',
    },
    {
      id: 'tut-copy-ai',
      categorySlug: 'writing',
      name: 'Copy.ai',
      slug: 'copy-ai',
      logoColor: '#0EA5E9',
      logoInitials: 'CA',
      description: 'Generate marketing copy, emails and social content with AI',
      tags: ['Writing', 'Marketing'],
      difficulty: 'Beginner',
      isPremium: false,
      lessonCount: 15,
      isFeatured: false,
      isVisible: true,
      order: 2,
      ctaEnrollLink: '/courses',
      ctaDownloadLink: '/contact',
    },
    // ── Design ───────────────────────────────────────────────────────────────
    {
      id: 'tut-midjourney',
      categorySlug: 'design',
      name: 'Midjourney',
      slug: 'midjourney',
      logoColor: '#1a1a2e',
      logoInitials: 'MJ',
      description: 'AI image generation via Discord prompts',
      tags: ['Design', 'Creative'],
      difficulty: 'Beginner',
      isPremium: false,
      lessonCount: 20,
      isFeatured: false,
      isVisible: true,
      order: 1,
      ctaEnrollLink: '/courses',
      ctaDownloadLink: '/contact',
    },
    {
      id: 'tut-canva-ai',
      categorySlug: 'design',
      name: 'Canva AI',
      slug: 'canva-ai',
      logoColor: '#a259ff',
      logoInitials: 'C',
      description: 'Design anything with Canva\'s built-in AI tools',
      tags: ['Design', 'Marketing'],
      difficulty: 'Beginner',
      isPremium: false,
      lessonCount: 18,
      isFeatured: false,
      isVisible: true,
      order: 2,
      ctaEnrollLink: '/courses',
      ctaDownloadLink: '/contact',
    },
    // ── Coding ───────────────────────────────────────────────────────────────
    {
      id: 'tut-github-copilot',
      categorySlug: 'coding',
      name: 'GitHub Copilot',
      slug: 'github-copilot',
      logoColor: '#24292e',
      logoInitials: 'GH',
      description: 'AI pair programmer that suggests code in real time',
      tags: ['Coding', 'Productivity'],
      difficulty: 'Intermediate',
      isPremium: false,
      lessonCount: 20,
      isFeatured: false,
      isVisible: true,
      order: 1,
      ctaEnrollLink: '/courses',
      ctaDownloadLink: '/contact',
    },
    {
      id: 'tut-cursor',
      categorySlug: 'coding',
      name: 'Cursor AI',
      slug: 'cursor-ai',
      logoColor: '#5B21B6',
      logoInitials: 'CR',
      description: 'AI-first code editor built for pair-programming with AI',
      tags: ['Coding'],
      difficulty: 'Intermediate',
      isPremium: false,
      lessonCount: 18,
      isFeatured: false,
      isVisible: true,
      order: 2,
      ctaEnrollLink: '/courses',
      ctaDownloadLink: '/contact',
    },
  ],
};

// ── localStorage helpers ──────────────────────────────────────────────────────

// locked:true only means a hard admin gate when paired with unlockRule:'manual'.
// For every progress-based unlockRule (sequential, mark-complete, etc.) locked:true
// is a legacy/accidental marker that must not block progression — this function
// strips it so sequential lessons unlock automatically as the user completes them.
// Idempotent - safe to run on every load.
const PROGRESS_BASED_RULES = new Set([
  'sequential', 'mark-complete', 'read-fully', 'pass-quiz', 'watch-video', 'quiz', 'custom',
]);

export function migrateLockedSemantics(data: TutorialPageData): TutorialPageData {
  let changed = false;
  const tutorials = data.tutorials.map((tut) => ({
    ...tut,
    chapters: (tut.chapters ?? []).map((ch) => ({
      ...ch,
      lessons: ch.lessons.map((l) => {
        if (l.locked && PROGRESS_BASED_RULES.has(l.unlockRule)) {
          changed = true;
          return { ...l, locked: false };
        }
        return l;
      }),
    })),
  }));
  return changed ? { ...data, tutorials } : data;
}

export function loadTutorialData(): TutorialPageData {
  try {
    const raw = localStorage.getItem('primAI_tutorials');
    if (raw) return migrateLockedSemantics(JSON.parse(raw) as TutorialPageData);
  } catch { /* ignore */ }
  return DEFAULT_TUTORIAL_DATA;
}

export function saveTutorialData(data: TutorialPageData): void {
  localStorage.setItem('primAI_tutorials', JSON.stringify(data));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
