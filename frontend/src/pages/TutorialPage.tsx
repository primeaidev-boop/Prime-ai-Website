import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { loadTutorialData, saveTutorialData, migrateLockedSemantics } from '@/data/tutorialData';
import { getTutorialData } from '@/api/tutorials';
import type { TutorialPageData } from '@/types';
import {
  loadUserProgress, startLesson, markLessonComplete, markQuizPassed,
  markScrolledToBottom, isLessonAccessible, toggleSaveTutorial,
  markTutorialComplete, findFirstIncomplete,
} from '@/data/userProgress';
import { recordTutorialView } from '@/data/analyticsData';
import { BlockRenderer, extractRichTextHeadings } from '@/components/tutorial/BlockRenderer';
import type {
  Tutorial, Chapter, Lesson, UserProgress,
  TutorialUpsell, Certificate,
} from '@/types';

// Lazy: bundles html2canvas + jsPDF (~182 KB gzip) - only fetched when the
// certificate modal is actually opened, not on every lesson-page visit.
const CertificateModal = lazy(() =>
  import('@/components/tutorial/CertificateModal').then((m) => ({ default: m.CertificateModal })),
);

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useSessionTimer(): string {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s.toString().padStart(2, '0')}s` : `${s}s`;
}

function useScrollSpy(ids: string[]): string {
  const [activeId, setActiveId] = useState('');
  const key = ids.join(',');
  useEffect(() => {
    if (!ids.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) { setActiveId(entry.target.id); break; }
        }
      },
      { rootMargin: '-64px 0px -60% 0px', threshold: 0 },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return activeId;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type LessonState = 'active' | 'completed' | 'locked' | 'available';

function getLessonState(
  lesson: Lesson,
  currentId: string,
  allLessons: Lesson[],
  tutorialId: string,
  progress: UserProgress,
): LessonState {
  if (lesson.id === currentId) return 'active';
  const lessonProg = progress.tutorials[tutorialId]?.lessonsProgress[lesson.id];
  if (lessonProg?.status === 'completed') return 'completed';
  if (!isLessonAccessible(lesson, allLessons, tutorialId, progress)) return 'locked';
  return 'available';
}

// ── Locked redirect banner ─────────────────────────────────────────────────────

function LockedBanner({ visible }: { visible: boolean }) {
  return (
    <div
      className="fixed top-16 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-300"
      style={{
        background: 'rgba(251,191,36,0.12)',
        borderBottom: '1px solid rgba(251,191,36,0.3)',
        color: '#FBBF24',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transform: visible ? 'translateY(0)' : 'translateY(-8px)',
      }}
    >
      🔒 This lesson is locked. Please choose an available lesson.
    </div>
  );
}

// ── Left Sidebar ───────────────────────────────────────────────────────────────

function LeftSidebar({
  tutorial, chapters, currentLessonId, progress, onLessonClick, onClose,
}: {
  tutorial: Tutorial;
  chapters: Chapter[];
  currentLessonId: string;
  progress: UserProgress;
  onLessonClick: (lesson: Lesson) => void;
  onClose?: () => void;
}) {
  const allLessons = useMemo(() => chapters.flatMap((ch) => ch.lessons), [chapters]);
  const currentChapter = chapters.find((ch) => ch.lessons.some((l) => l.id === currentLessonId)) ?? chapters[0];
  const [openChapterId, setOpenChapterId] = useState(currentChapter?.id ?? '');

  useEffect(() => { if (currentChapter) setOpenChapterId(currentChapter.id); }, [currentLessonId]);

  // Overall tutorial progress %
  const visibleCount = allLessons.filter((l) => l.visible !== false).length;
  const completedCount = visibleCount > 0
    ? allLessons.filter((l) => progress.tutorials[tutorial.id]?.lessonsProgress[l.id]?.status === 'completed').length
    : 0;
  const pct = visibleCount > 0 ? Math.round((completedCount / visibleCount) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {tutorial.thumbnailUrl ? (
              <img src={tutorial.thumbnailUrl} alt={tutorial.name} loading="lazy" className="w-6 h-6 rounded object-cover shrink-0" style={{ border: '1px solid var(--border)' }} />
            ) : (
              <div className="w-6 h-6 rounded text-[10px] font-bold text-white flex items-center justify-center shrink-0" style={{ background: tutorial.logoColor }}>
                {tutorial.logoInitials}
              </div>
            )}
            <Link to="/tutorials" className="text-[10px] uppercase tracking-wider hover:underline" style={{ color: 'var(--muted)' }}>
              Tutorials
            </Link>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 text-lg" style={{ color: 'var(--muted)' }}>✕</button>
          )}
        </div>
        <div className="text-sm font-bold mb-3" style={{ color: 'var(--white)', fontFamily: 'Montserrat, var(--font-head)' }}>
          {tutorial.name}
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--electric), var(--orange))' }}
            />
          </div>
          <span className="text-[10px] shrink-0 font-semibold" style={{ color: 'var(--muted)' }}>{pct}%</span>
        </div>
      </div>

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto py-2">
        {chapters.map((ch) => {
          const isOpen = openChapterId === ch.id;
          return (
            <div key={ch.id}>
              <button
                onClick={() => setOpenChapterId(isOpen ? '' : ch.id)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider hover:bg-white/5 transition-colors"
                style={{ color: 'var(--muted)' }}
              >
                <span>{ch.title}</span>
                <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
              </button>
              {isOpen && (
                <div className="flex flex-col pb-1">
                  {ch.lessons.map((lesson) => {
                    const state = getLessonState(lesson, currentLessonId, allLessons, tutorial.id, progress);
                    return (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        state={state}
                        onClick={() => state !== 'locked' && onLessonClick(lesson)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LessonItem({ lesson, state, onClick }: { lesson: Lesson; state: LessonState; onClick: () => void }) {
  const isActive = state === 'active';
  const isCompleted = state === 'completed';
  const isLocked = state === 'locked';
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className="w-full flex items-center gap-2.5 py-2.5 text-left transition-all"
      style={{
        paddingLeft: isActive ? 14 : 16,
        paddingRight: 16,
        background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
        borderLeft: isActive ? '2px solid var(--electric)' : '2px solid transparent',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        opacity: isLocked ? 0.45 : 1,
      }}
    >
      <span className="text-base shrink-0 w-4 text-center">
        {isCompleted ? <span style={{ color: 'var(--electric)', fontSize: 12 }}>✓</span>
          : isLocked ? <span style={{ fontSize: 12 }}>🔒</span>
          : isActive ? <span style={{ color: 'var(--electric)', fontSize: 10 }}>▶</span>
          : <span style={{ color: 'var(--muted)', fontSize: 10 }}>○</span>}
      </span>
      <span
        className="text-xs leading-snug"
        style={{
          color: isActive ? 'var(--electric)' : isCompleted ? 'var(--muted)' : 'var(--white)',
          fontWeight: isActive ? 600 : 400,
          textDecoration: isCompleted ? 'line-through' : 'none',
        }}
      >
        {String(lesson.lessonNumber).padStart(2, '0')}. {lesson.title}
      </span>
      {lesson.isFree && !isLocked && (
        <span className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: 'rgba(255,107,43,0.2)', color: 'var(--orange)' }}>
          FREE
        </span>
      )}
    </button>
  );
}

// ── Right Sidebar ──────────────────────────────────────────────────────────────

function RightSidebar({
  lesson, tutorial, sessionTime, isSaved, onToggleSave,
}: {
  lesson: Lesson; tutorial: Tutorial; sessionTime: string;
  isSaved: boolean; onToggleSave: () => void;
}) {
  // Build unified TOC from `heading` blocks AND h2/h3 headings inside richText blocks.
  const tocItems = useMemo(() => {
    const items: { id: string; level: 1 | 2 | 3; text: string }[] = [];
    for (const b of lesson.blocks) {
      if (b.type === 'heading') {
        items.push({ id: `heading-${b.id}`, level: b.level, text: b.text });
      } else if (b.type === 'richText') {
        for (const h of extractRichTextHeadings(b.id, b.html)) {
          items.push(h);
        }
      }
    }
    return items;
  }, [lesson.blocks]);
  const tocIds = tocItems.map((item) => item.id);
  const activeId = useScrollSpy(tocIds);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };

  const tools = tutorial.toolsAndStats ?? {
    sessionLabel: 'Session',
    liveTools: [{ id: 'default', name: tutorial.name, icon: '🤖' }],
    promptTemplatesLink: `/tutorials/${tutorial.slug}`,
  };

  return (
    <div className="flex flex-col p-5 h-full overflow-y-auto">
      {/* Tools & Stats */}
      <div className="mb-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ffb690' }}>
            Tools &amp; Stats
          </div>
          {/* Bookmark toggle */}
          <button
            onClick={onToggleSave}
            title={isSaved ? 'Remove bookmark' : 'Save tutorial'}
            className="text-base transition-colors"
            style={{ color: isSaved ? '#FBBF24' : 'var(--muted)' }}
          >
            {isSaved ? '★' : '☆'}
          </button>
        </div>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          {tools.sessionLabel}: <span style={{ color: 'var(--electric)' }}>{sessionTime}</span>
        </div>
      </div>

      {/* Live Tools */}
      <div className="mb-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="text-xs font-bold flex items-center gap-1.5 mb-3" style={{ color: '#ffb690' }}>
          ⚡ Live Tools
        </div>
        <div className="flex flex-col gap-1.5">
          {tools.liveTools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
            >
              <span className="text-base">{tool.icon}</span>
              <span className="text-xs" style={{ color: 'var(--white)' }}>{tool.name}</span>
            </div>
          ))}
          <a
            href={tools.promptTemplatesLink}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors hover:bg-white/5 text-xs"
            style={{ color: 'var(--muted)' }}
          >
            <span>📄</span> Prompt Templates
          </a>
        </div>
      </div>

      {/* Auto-generated TOC - heading blocks + h2/h3 inside richText blocks */}
      {tocItems.length > 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
            On This Page
          </div>
          <nav className="flex flex-col gap-0.5">
            {tocItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-left text-xs py-1.5 rounded transition-all hover:text-white"
                  style={{
                    paddingLeft: item.level === 3 ? 20 : 8,
                    color: isActive ? 'var(--electric)' : 'var(--muted)',
                    fontWeight: isActive ? 600 : 400,
                    borderLeft: isActive ? '2px solid var(--electric)' : '2px solid transparent',
                    transition: 'color 0.2s, border-color 0.2s',
                  }}
                >
                  {item.text}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}

// ── Completion Modal ───────────────────────────────────────────────────────────

function CompletionModal({
  tutorial, upsell, certificate, onClose, onViewCertificate,
}: {
  tutorial: Tutorial;
  upsell: TutorialUpsell;
  certificate: Certificate | null;
  onClose: () => void;
  onViewCertificate: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative z-10 glass-card rounded-2xl p-8 w-full max-w-md text-center"
        style={{ border: '1px solid rgba(0,212,255,0.2)', animation: 'fadeUp 0.4s ease both' }}
      >
        {/* Celebration */}
        <div className="text-6xl mb-3">🎉</div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--white)', fontFamily: 'Montserrat, var(--font-head)' }}
        >
          Tutorial Complete!
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          You've finished the <strong style={{ color: 'var(--white)' }}>{tutorial.name}</strong> tutorial.
          Great work!
        </p>

        {/* Certificate earned */}
        {certificate && (
          <div
            className="mb-6 p-4 rounded-xl"
            style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)' }}
          >
            <div className="text-3xl mb-2">🏆</div>
            <div className="font-semibold text-sm mb-3" style={{ color: 'var(--electric)' }}>
              Certificate Earned!
            </div>
            <button onClick={onViewCertificate} className="btn-electric text-sm px-5 py-2">
              Get Certificate ➞
            </button>
          </div>
        )}

        {/* Upsell CTAs */}
        {upsell.show && (
          <div className="mb-5">
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>{upsell.subtitle}</p>
            <div className="flex flex-col gap-2">
              <a href="/courses" className="btn-primary text-sm px-5 py-2.5 w-full text-center block"
                style={{ textDecoration: 'none' }}>
                {upsell.btnEnroll}
              </a>
              <a href="/contact" className="btn-outline text-sm px-5 py-2.5 w-full text-center block"
                style={{ textDecoration: 'none' }}>
                {upsell.btnDemo}
              </a>
            </div>
          </div>
        )}

        <button onClick={onClose} className="text-xs" style={{ color: 'var(--muted)' }}>
          Continue Exploring Tutorials
        </button>
      </div>
    </div>
  );
}

// ── Center Content ─────────────────────────────────────────────────────────────

function CenterContent({
  tutorial, lesson, isCompleted, canComplete, onMarkComplete, prevLesson, nextLesson, onNavigate, onQuizPass, onScrollBottom,
}: {
  tutorial: Tutorial;
  lesson: Lesson;
  isCompleted: boolean;
  canComplete: boolean;
  onMarkComplete: () => void;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
  onNavigate: (lesson: Lesson) => void;
  onQuizPass: () => void;
  onScrollBottom: () => void;
}) {
  const num = String(lesson.lessonNumber).padStart(2, '0');

  // Scroll sentinel - fires once when the bottom of the article enters viewport
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasFiredRef = useRef(false);
  const stableOnScrollBottom = useCallback(onScrollBottom, [lesson.id]);

  useEffect(() => {
    hasFiredRef.current = false; // reset on lesson change
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasFiredRef.current) {
          hasFiredRef.current = true;
          stableOnScrollBottom();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lesson.id, stableOnScrollBottom]);

  const markCompleteDisabled = isCompleted || !canComplete;
  const markCompleteLabel = isCompleted
    ? '✓ Lesson Complete'
    : !canComplete
    ? '⟳ Unlock requirement pending…'
    : 'Mark as Complete';

  return (
    <div className="max-w-[860px] mx-auto px-6 md:px-12 pt-28 lg:pt-24 pb-28">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] mb-8 flex-wrap" style={{ color: 'var(--muted)' }}>
        <Link to="/tutorials" className="hover:underline" style={{ color: 'var(--muted)' }}>Tutorials</Link>
        <span>›</span>
        <Link to={`/tutorials/${tutorial.slug}`} className="hover:underline" style={{ color: 'var(--muted)' }}>{tutorial.name}</Link>
        <span>›</span>
        <span style={{ color: 'var(--white)' }}>{lesson.title}</span>
      </nav>

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          {lesson.isFree && (
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider text-white"
              style={{ background: 'linear-gradient(135deg, var(--orange), var(--orange2))' }}
            >
              FREE
            </span>
          )}
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--electric)' }}>
            Lesson {num}
          </span>
        </div>

        <h1
          className="text-2xl md:text-4xl font-bold mb-5 leading-tight"
          style={{ color: 'var(--white)', fontFamily: 'Montserrat, var(--font-head)' }}
        >
          {lesson.title}
        </h1>

        {lesson.intro && (
          <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: 'var(--muted)', maxWidth: 680 }}>
            {lesson.intro}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-6 py-4" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
            <span>⏱</span><span>{lesson.readTime} min read</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
            <span>🤖</span><span>{lesson.toolName || tutorial.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
            <span>📊</span><span>{lesson.difficulty}</span>
          </div>
        </div>
      </header>

      {/* Lesson blocks */}
      <article className="flex flex-col gap-6">
        {lesson.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} onQuizPass={onQuizPass} />
        ))}
        {lesson.blocks.length === 0 && (
          <div className="text-center py-16 glass-card rounded-2xl" style={{ color: 'var(--muted)' }}>
            Lesson content coming soon - check back after the next update!
          </div>
        )}
      </article>

      {/* Scroll sentinel for read-fully unlock */}
      <div ref={sentinelRef} style={{ height: 1, marginTop: 32 }} />

      {/* Desktop navigation row */}
      <div className="hidden lg:flex items-center justify-between gap-4 mt-10 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => prevLesson && onNavigate(prevLesson)}
          disabled={!prevLesson}
          className="flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-30"
          style={{ color: 'var(--muted)' }}
        >
          ← Previous
        </button>
        <button
          onClick={onMarkComplete}
          disabled={markCompleteDisabled}
          className="btn-primary px-8 py-2.5 text-sm font-bold disabled:opacity-60"
          style={isCompleted ? { background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' } : {}}
        >
          {markCompleteLabel}
        </button>
        <button
          onClick={() => nextLesson && onNavigate(nextLesson)}
          disabled={!nextLesson}
          className="flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-30"
          style={{ color: 'var(--muted)' }}
        >
          Next ➞
        </button>
      </div>
    </div>
  );
}

// ── Main TutorialPage ──────────────────────────────────────────────────────────

export default function TutorialPage() {
  const { slug, lesson: lessonSlug } = useParams<{ slug: string; lesson?: string }>();
  const navigate = useNavigate();
  const sessionTime = useSessionTimer();

  const [data, setData] = useState<TutorialPageData>(() => loadTutorialData());
  const [serverDataLoaded, setServerDataLoaded] = useState(false);

  useEffect(() => {
    getTutorialData().then((serverData) => {
      if (serverData) {
        // Server data may still have locked:true on sequential lessons (old design).
        // Always migrate before using so lock semantics stay consistent.
        const migrated = migrateLockedSemantics(serverData);
        setData(migrated);
        saveTutorialData(migrated);
      }
    }).catch(() => {}).finally(() => setServerDataLoaded(true));
  }, []);

  const tutorial = data.tutorials.find((t) => t.slug === slug);
  const chapters = useMemo(
    () => [...(tutorial?.chapters ?? [])].sort((a, b) => a.order - b.order),
    [tutorial],
  );
  const allLessons = useMemo(() => chapters.flatMap((ch) => ch.lessons), [chapters]);

  const currentLesson = lessonSlug ? allLessons.find((l) => l.slug === lessonSlug) : allLessons[0];
  const currentIndex = currentLesson ? allLessons.indexOf(currentLesson) : -1;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // ── Real progress state ──────────────────────────────────────────────────────
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgress());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [lockedBanner, setLockedBanner] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // ── Track view + start lesson on navigation ──────────────────────────────────
  useEffect(() => {
    if (!tutorial || !currentLesson) return;
    if (!isLessonAccessible(currentLesson, allLessons, tutorial.id, progress)) return;
    recordTutorialView(tutorial.id);
    const updated = startLesson(tutorial.id, currentLesson.id);
    setProgress(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorial?.id, currentLesson?.id]);

  // ── Unlock guard: redirect locked lesson URLs ────────────────────────────────
  useEffect(() => {
    if (!tutorial || !currentLesson || !allLessons.length) return;
    if (!isLessonAccessible(currentLesson, allLessons, tutorial.id, progress)) {
      const fallback =
        findFirstIncomplete(allLessons, tutorial.id, progress) ??
        allLessons.find((lesson) => isLessonAccessible(lesson, allLessons, tutorial.id, progress));

      if (fallback && fallback.id !== currentLesson.id) {
        navigate(`/tutorials/${slug}/${fallback.slug}`, { replace: true });
      }
      setLockedBanner(true);
      const t = setTimeout(() => setLockedBanner(false), 4000);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson?.id, tutorial?.id, progress]);

  // ── Auto-redirect /tutorials/:slug to first lesson ───────────────────────────
  useEffect(() => {
    if (!lessonSlug && allLessons.length > 0 && tutorial) {
      navigate(`/tutorials/${slug}/${allLessons[0].slug}`, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonSlug, allLessons.length, tutorial?.slug]);

  // ── Derived state ────────────────────────────────────────────────────────────
  const isCompleted =
    progress.tutorials[tutorial?.id ?? '']?.lessonsProgress[currentLesson?.id ?? '']?.status === 'completed';

  const canMarkComplete = !isCompleted;

  const isSaved = progress.savedTutorials.includes(tutorial?.id ?? '');

  const certificate = progress.certificates.find((c) => c.tutorialId === (tutorial?.id ?? '')) ?? null;

  const canAccessCurrentLesson = !!(
    tutorial &&
    currentLesson &&
    isLessonAccessible(currentLesson, allLessons, tutorial.id, progress)
  );

  // ── Navigation handler ───────────────────────────────────────────────────────
  const handleLessonNav = useCallback((lesson: Lesson) => {
    navigate(`/tutorials/${slug}/${lesson.slug}`);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate, slug]);

  // ── Mark Complete ────────────────────────────────────────────────────────────
  const handleMarkComplete = () => {
    if (!currentLesson || !tutorial) return;
    const updated = markLessonComplete(tutorial.id, currentLesson.id, currentLesson.readTime);
    setProgress(updated);

    // Check if ALL visible lessons are now complete
    const visible = allLessons.filter((l) => l.visible !== false);
    const allDone = visible.every(
      (l) => updated.tutorials[tutorial.id]?.lessonsProgress[l.id]?.status === 'completed',
    );

    if (allDone && !updated.completedTutorials.includes(tutorial.id)) {
      const final = markTutorialComplete(tutorial.id, tutorial.name, tutorial.hasCertificate ?? false);
      setProgress(final);
      setShowCompletionModal(true);
    } else if (nextLesson) {
      setTimeout(() => handleLessonNav(nextLesson), 450);
    }
  };

  // ── Quiz pass (called by BlockRenderer when any quiz in lesson is passed) ────
  const handleQuizPass = useCallback(() => {
    if (!currentLesson || !tutorial) return;
    const updated = markQuizPassed(tutorial.id, currentLesson.id);
    setProgress(updated);
  }, [currentLesson?.id, tutorial?.id]);

  // ── Scroll-to-bottom (for read-fully unlock) ─────────────────────────────────
  const handleScrollBottom = useCallback(() => {
    if (!currentLesson || !tutorial) return;
    const updated = markScrolledToBottom(tutorial.id, currentLesson.id);
    setProgress(updated);
  }, [currentLesson?.id, tutorial?.id]);

  // ── Bookmark toggle ──────────────────────────────────────────────────────────
  const handleToggleSave = useCallback(() => {
    if (!tutorial) return;
    const updated = toggleSaveTutorial(tutorial.id);
    setProgress(updated);
  }, [tutorial?.id]);

  // ── Empty / error states ─────────────────────────────────────────────────────
  if (!serverDataLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-6" style={{ background: 'var(--navy)', color: 'var(--muted)' }}>
        <div className="text-sm">Loading lesson...</div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-6" style={{ background: 'var(--navy)', color: 'var(--muted)' }}>
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--white)', fontFamily: 'Montserrat, sans-serif' }}>Tutorial not found</h1>
        <p className="mb-6 text-center">This tutorial doesn't exist or has been removed.</p>
        <Link to="/tutorials" className="btn-primary px-6 py-2.5 text-sm">Browse All Tutorials</Link>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-6" style={{ background: 'var(--navy)', color: 'var(--muted)' }}>
        {tutorial.thumbnailUrl ? (
          <img src={tutorial.thumbnailUrl} alt={tutorial.name} loading="lazy" className="w-16 h-16 rounded-2xl object-cover mb-6" style={{ border: '1px solid var(--border)' }} />
        ) : (
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-6" style={{ background: tutorial.logoColor }}>
            {tutorial.logoInitials}
          </div>
        )}
        <h1 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--white)', fontFamily: 'Montserrat, sans-serif' }}>
          {tutorial.name} Tutorial
        </h1>
        <p className="mb-2 text-center">Lessons are being prepared. Check back soon!</p>
        <Link to="/tutorials" className="btn-outline mt-4 px-6 py-2.5 text-sm">← Back to Tutorials</Link>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-6" style={{ background: 'var(--navy)', color: 'var(--muted)' }}>
        <p>Lesson not found.</p>
        <Link to={`/tutorials/${slug}`} className="btn-outline mt-4 px-6 py-2.5 text-sm">← Back to {tutorial.name}</Link>
      </div>
    );
  }

  if (!canAccessCurrentLesson) {
    const firstAvailable = allLessons.find((lesson) => isLessonAccessible(lesson, allLessons, tutorial.id, progress));
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-6" style={{ background: 'var(--navy)', color: 'var(--muted)' }}>
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--white)', fontFamily: 'Montserrat, sans-serif' }}>Lesson locked</h1>
        <p className="mb-6 text-center">This lesson is not available right now.</p>
        {firstAvailable ? (
          <button onClick={() => handleLessonNav(firstAvailable)} className="btn-primary px-6 py-2.5 text-sm">
            Go to Available Lesson
          </button>
        ) : (
          <Link to="/tutorials" className="btn-outline px-6 py-2.5 text-sm">Browse Tutorials</Link>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>

      {/* Locked redirect banner */}
      <LockedBanner visible={lockedBanner} />

      {/* Fixed left sidebar - desktop */}
      <aside
        className="hidden lg:flex flex-col fixed top-16 left-0 z-30 w-[260px]"
        style={{ height: 'calc(100vh - 64px)', background: 'rgba(2,6,18,0.97)', borderRight: '1px solid var(--border)' }}
      >
        <LeftSidebar
          tutorial={tutorial}
          chapters={chapters}
          currentLessonId={currentLesson.id}
          progress={progress}
          onLessonClick={handleLessonNav}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside
            className="absolute top-0 left-0 w-[280px] h-full z-50 flex flex-col"
            style={{ background: 'rgba(2,6,18,0.99)', borderRight: '1px solid var(--border)' }}
          >
            <LeftSidebar
              tutorial={tutorial}
              chapters={chapters}
              currentLessonId={currentLesson.id}
              progress={progress}
              onLessonClick={handleLessonNav}
              onClose={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* TOC / right-sidebar drawer - slides in from the right, below xl */}
      {tocOpen && (
        <div className="xl:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setTocOpen(false)} />
          <aside
            className="absolute top-0 right-0 w-[280px] h-full z-50 flex flex-col"
            style={{ background: 'rgba(2,6,18,0.99)', borderLeft: '1px solid var(--border)' }}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                Contents
              </span>
              <button onClick={() => setTocOpen(false)} className="p-1 text-lg" style={{ color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <RightSidebar
                lesson={currentLesson}
                tutorial={tutorial}
                sessionTime={sessionTime}
                isSaved={isSaved}
                onToggleSave={handleToggleSave}
              />
            </div>
          </aside>
        </div>
      )}

      {/* Mobile lesson toggle button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-[68px] left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
        style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: 'var(--electric)' }}
      >
        ☰ Lessons
      </button>

      {/* Contents / TOC toggle button - visible below xl where the right sidebar is hidden */}
      <button
        onClick={() => setTocOpen(true)}
        className="xl:hidden fixed top-[68px] right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
        style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: 'var(--electric)' }}
      >
        Contents ☰
      </button>

      {/* Center content */}
      <main className="lg:pl-[260px] xl:pr-[280px]">
        <CenterContent
          tutorial={tutorial}
          lesson={currentLesson}
          isCompleted={isCompleted}
          canComplete={canMarkComplete}
          onMarkComplete={handleMarkComplete}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          onNavigate={handleLessonNav}
          onQuizPass={handleQuizPass}
          onScrollBottom={handleScrollBottom}
        />
      </main>

      {/* Fixed right sidebar - xl+ */}
      <aside
        className="hidden xl:flex flex-col fixed top-16 right-0 z-30 w-[280px]"
        style={{ height: 'calc(100vh - 64px)', background: 'rgba(2,6,18,0.97)', borderLeft: '1px solid var(--border)' }}
      >
        <RightSidebar
          lesson={currentLesson}
          tutorial={tutorial}
          sessionTime={sessionTime}
          isSaved={isSaved}
          onToggleSave={handleToggleSave}
        />
      </aside>

      {/* Mobile bottom nav */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(2,6,18,0.96)', borderTop: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}
      >
        <button
          onClick={() => prevLesson && handleLessonNav(prevLesson)}
          disabled={!prevLesson}
          className="text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-30"
          style={{ color: 'var(--muted)', background: 'rgba(255,255,255,0.05)' }}
        >
          ← Prev
        </button>
        <button
          onClick={handleMarkComplete}
          disabled={isCompleted}
          className="btn-primary text-sm px-4 py-2 disabled:opacity-60"
        >
          {isCompleted ? '✓ Done' : 'Mark Complete'}
        </button>
        <button
          onClick={() => nextLesson && handleLessonNav(nextLesson)}
          disabled={!nextLesson}
          className="text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-30"
          style={{ color: 'var(--muted)', background: 'rgba(255,255,255,0.05)' }}
        >
          Next ➞
        </button>
      </div>

      {/* Completion modal */}
      {showCompletionModal && (
        <CompletionModal
          tutorial={tutorial}
          upsell={data.upsell}
          certificate={certificate}
          onClose={() => setShowCompletionModal(false)}
          onViewCertificate={() => { setShowCompletionModal(false); setShowCertModal(true); }}
        />
      )}

      {/* Certificate modal */}
      {showCertModal && certificate && (
        <Suspense fallback={null}>
          <CertificateModal
            certificate={certificate}
            onClose={() => setShowCertModal(false)}
            onNameSaved={(name) => {
              const updated = loadUserProgress();
              setProgress(updated);
              // Refresh certificate with updated name
              const cert = updated.certificates.find((c) => c.tutorialId === tutorial.id);
              if (cert) cert.learnerName = name;
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
