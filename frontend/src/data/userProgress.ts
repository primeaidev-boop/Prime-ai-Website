// Phase 3 - User Progress Data Layer
// localStorage key: primAI_userProgress
// Separate from tutorial content (primAI_tutorials)

import type {
  UserProgress,
  TutorialProgressRecord,
  LessonProgress,
  LessonStatus,
  Lesson,
} from '@/types';

const KEY = 'primAI_userProgress';

function emptyProgress(): UserProgress {
  return {
    learnerName: '',
    savedTutorials: [],
    completedTutorials: [],
    totalLearningMinutes: 0,
    tutorials: {},
    certificates: [],
    lastUpdated: new Date().toISOString(),
  };
}

function emptyTutorialRecord(tutorialId: string): TutorialProgressRecord {
  return { tutorialId, lessonsProgress: {}, learningMinutes: 0 };
}

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UserProgress;
      // Merge with defaults to fill any missing keys from older versions
      return { ...emptyProgress(), ...parsed };
    }
  } catch { /* ignore parse errors - return clean default */ }
  return emptyProgress();
}

export function saveUserProgress(p: UserProgress): void {
  localStorage.setItem(KEY, JSON.stringify({ ...p, lastUpdated: new Date().toISOString() }));
}

// ── Lesson helpers ─────────────────────────────────────────────────────────────

export function getLessonStatus(tutorialId: string, lessonId: string): LessonStatus {
  const p = loadUserProgress();
  return p.tutorials[tutorialId]?.lessonsProgress[lessonId]?.status ?? 'not-started';
}

/** Called when user navigates to a lesson. Marks it in-progress if not already done. */
export function startLesson(tutorialId: string, lessonId: string): UserProgress {
  const p = loadUserProgress();
  const tut = p.tutorials[tutorialId] ?? emptyTutorialRecord(tutorialId);
  const existing = tut.lessonsProgress[lessonId];

  // Never regress from completed
  if (existing?.status === 'completed') {
    saveUserProgress(p);
    return p;
  }
  tut.lessonsProgress[lessonId] = {
    ...existing,
    status: 'in-progress',
    startedAt: existing?.startedAt ?? new Date().toISOString(),
  };
  p.tutorials[tutorialId] = tut;
  saveUserProgress(p);
  return p;
}

/** Mark a lesson as fully completed. Accumulates learning minutes. */
export function markLessonComplete(
  tutorialId: string,
  lessonId: string,
  minutesSpent = 0,
): UserProgress {
  const p = loadUserProgress();
  const tut = p.tutorials[tutorialId] ?? emptyTutorialRecord(tutorialId);
  tut.lessonsProgress[lessonId] = {
    ...tut.lessonsProgress[lessonId],
    status: 'completed',
    completedAt: new Date().toISOString(),
  };
  tut.learningMinutes = (tut.learningMinutes ?? 0) + minutesSpent;
  p.tutorials[tutorialId] = tut;
  p.totalLearningMinutes = (p.totalLearningMinutes ?? 0) + minutesSpent;
  saveUserProgress(p);
  return p;
}

/** Set quizPassed = true on a lesson's progress (used by pass-quiz unlock rule). */
export function markQuizPassed(tutorialId: string, lessonId: string): UserProgress {
  const p = loadUserProgress();
  const tut = p.tutorials[tutorialId] ?? emptyTutorialRecord(tutorialId);
  const existing: LessonProgress = tut.lessonsProgress[lessonId] ?? { status: 'in-progress' };
  tut.lessonsProgress[lessonId] = { ...existing, quizPassed: true };
  p.tutorials[tutorialId] = tut;
  saveUserProgress(p);
  return p;
}

/** Set scrolledToBottom = true (used by read-fully unlock rule). */
export function markScrolledToBottom(tutorialId: string, lessonId: string): UserProgress {
  const p = loadUserProgress();
  const tut = p.tutorials[tutorialId] ?? emptyTutorialRecord(tutorialId);
  const existing: LessonProgress = tut.lessonsProgress[lessonId] ?? { status: 'in-progress' };
  tut.lessonsProgress[lessonId] = { ...existing, scrolledToBottom: true };
  p.tutorials[tutorialId] = tut;
  saveUserProgress(p);
  return p;
}

// ── Tutorial-level helpers ─────────────────────────────────────────────────────

/** Returns 0–100 integer progress for a tutorial. */
export function getTutorialProgress(tutorialId: string, totalVisibleLessons: number): number {
  if (totalVisibleLessons === 0) return 0;
  const p = loadUserProgress();
  const tut = p.tutorials[tutorialId];
  if (!tut) return 0;
  const completed = Object.values(tut.lessonsProgress).filter(
    (l) => l.status === 'completed',
  ).length;
  return Math.min(100, Math.round((completed / totalVisibleLessons) * 100));
}

/** Mark tutorial complete. Creates certificate entry if hasCertificate. Returns updated progress. */
export function markTutorialComplete(
  tutorialId: string,
  tutorialName: string,
  hasCertificate: boolean,
): UserProgress {
  const p = loadUserProgress();
  const tut = p.tutorials[tutorialId] ?? emptyTutorialRecord(tutorialId);
  tut.completedAt = new Date().toISOString();
  p.tutorials[tutorialId] = tut;

  if (!p.completedTutorials.includes(tutorialId)) {
    p.completedTutorials.push(tutorialId);
  }

  if (hasCertificate && !p.certificates.find((c) => c.tutorialId === tutorialId)) {
    p.certificates.push({
      tutorialId,
      tutorialName,
      earnedAt: new Date().toISOString(),
      learnerName: p.learnerName || 'Learner',
    });
    tut.certificateEarned = true;
  }

  saveUserProgress(p);
  return p;
}

// ── Bookmarks ──────────────────────────────────────────────────────────────────

/** Toggle save/bookmark on a tutorial. Returns updated progress. */
export function toggleSaveTutorial(tutorialId: string): UserProgress {
  const p = loadUserProgress();
  const idx = p.savedTutorials.indexOf(tutorialId);
  if (idx === -1) p.savedTutorials.push(tutorialId);
  else p.savedTutorials.splice(idx, 1);
  saveUserProgress(p);
  return p;
}

// ── Learner identity ───────────────────────────────────────────────────────────

export function setLearnerName(name: string): UserProgress {
  const p = loadUserProgress();
  p.learnerName = name.trim();
  // Back-fill learnerName on any existing certificates
  p.certificates = p.certificates.map((c) => ({ ...c, learnerName: p.learnerName }));
  saveUserProgress(p);
  return p;
}

// ── Unlock enforcement ────────────────────────────────────────────────────────

/**
 * Returns true if the given lesson is accessible to the current user.
 *
 * The admin panel's Locked checkbox IS the sequential gate:
 *   - locked:false ("✓ Open" in admin)  → always accessible, regardless of progress
 *   - locked:true  ("🔒 Locked" in admin) → a progress gate that auto-unlocks when the
 *     PREVIOUS lesson satisfies this lesson's unlockRule (sequential = prev completed).
 *     Completing lessons one by one unlocks the chain step by step.
 *   - locked:true + unlockRule:'manual'   → permanent admin lock, never auto-unlocks.
 *
 * isFree deliberately does NOT bypass the lock — it controls the FREE pricing badge,
 * not access. An admin-locked free lesson stays locked until the previous one is done.
 * Pass progressOverride to avoid a redundant localStorage read.
 */
export function isLessonAccessible(
  lesson: Lesson,
  allLessons: Lesson[],
  tutorialId: string,
  progressOverride?: UserProgress,
): boolean {
  // Admin marked it Open → always accessible
  if (!lesson.locked) return true;

  // Locked lessons: how do they unlock?
  if (lesson.unlockRule === 'manual') return false; // admin-only, never auto-unlocks
  if (lesson.unlockRule === 'free') return true;    // rule says always free access

  const idx = allLessons.findIndex((l) => l.id === lesson.id);
  if (idx <= 0) return true; // first lesson can't wait on a previous one

  const prevLesson = allLessons[idx - 1];
  const p = progressOverride ?? loadUserProgress();
  const prev = p.tutorials[tutorialId]?.lessonsProgress[prevLesson.id];

  switch (lesson.unlockRule) {
    case 'pass-quiz':
    case 'quiz': // Phase 2 alias
      return prev?.quizPassed === true;

    case 'read-fully':
      // Scrolled to bottom OR already fully completed counts
      return prev?.scrolledToBottom === true || prev?.status === 'completed';

    case 'watch-video':
      // Video watched OR completed (falls back gracefully)
      return prev?.videoWatched === true || prev?.status === 'completed';

    case 'sequential':
    case 'mark-complete':
    case 'custom':
    default:
      return prev?.status === 'completed';
  }
}

/** Find the first lesson the user can access that isn't yet completed. */
export function findFirstIncomplete(
  allLessons: Lesson[],
  tutorialId: string,
  progress: UserProgress,
): Lesson | undefined {
  return allLessons.find(
    (l) =>
      isLessonAccessible(l, allLessons, tutorialId, progress) &&
      progress.tutorials[tutorialId]?.lessonsProgress[l.id]?.status !== 'completed',
  );
}
