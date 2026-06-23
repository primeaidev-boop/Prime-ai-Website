import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses } from '@/api/courses';
import { useModal } from '@/hooks/useModal';
import { DemoModal } from '@/components/shared/DemoModal';
import { CoursePathConnector } from '@/components/shared/CoursePathConnector';
import type { AiCourse } from '@/types';

// ── Constants ─────────────────────────────────────────────────────────────────

const LEVEL_SLUG: Record<string, string> = {
  L1_FOUNDATION: 'l1',
  L2A_GENERALIST: 'l2a',
  L2B_DEVELOPER: 'l2b',
};

const LEVEL_COLOR: Record<string, string> = {
  L1_FOUNDATION: 'var(--electric)',
  L2A_GENERALIST: 'var(--orange)',
  L2B_DEVELOPER: '#a78bfa',
};

const LEVEL_BTN_RGB: Record<string, string> = {
  L1_FOUNDATION: '0,212,255',
  L2A_GENERALIST: '255,107,43',
  L2B_DEVELOPER: '167,139,250',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function MetaPill({ label }: { label: string }) {
  return (
    <span
      className="text-xs px-3 py-1 rounded-full font-medium"
      style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)', border: '1px solid var(--border)' }}
    >
      {label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-6 animate-pulse">
      <div className="h-4 w-24 rounded mb-3" style={{ background: 'var(--border)' }} />
      <div className="h-7 w-3/4 rounded mb-2" style={{ background: 'var(--border)' }} />
      <div className="h-4 w-full rounded mb-1" style={{ background: 'var(--border)' }} />
      <div className="h-4 w-2/3 rounded mb-6" style={{ background: 'var(--border)' }} />
      <div className="flex gap-2 flex-wrap mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-7 w-20 rounded-full" style={{ background: 'var(--border)' }} />
        ))}
      </div>
      <div className="flex gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-9 w-32 rounded-full" style={{ background: 'var(--border)' }} />
        ))}
      </div>
    </div>
  );
}

function PathwayCard({ course, isWide = false }: { course: AiCourse; isWide?: boolean }) {
  const modal = useModal();
  const slug = LEVEL_SLUG[course.level];
  const accentColor = LEVEL_COLOR[course.level];
  const btnRgb = LEVEL_BTN_RGB[course.level];
  const isL1 = course.level === 'L1_FOUNDATION';
  const visibleTools = course.tools.slice(0, 7);
  const extraTools = course.tools.length - 7;

  return (
    <>
      <div
        className={`glass-card rounded-2xl p-6 md:p-8 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-0.5 ${isWide ? 'w-full max-w-2xl mx-auto' : 'h-full'}`}
        style={{ borderTop: `2.5px solid ${accentColor}` }}
      >
        {/* Badge + title + tagline */}
        <div>
          <span
            className="inline-block text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-3"
            style={{ background: `rgba(${btnRgb},0.1)`, color: accentColor, border: `1px solid rgba(${btnRgb},0.3)` }}
          >
            {course.badgeText}
          </span>
          <h3
            className="font-bold mb-1"
            style={{ fontFamily: 'var(--font-head)', fontSize: isWide ? '1.5rem' : '1.15rem', color: 'var(--white)' }}
          >
            {course.title}
          </h3>
          <p className="text-sm italic leading-relaxed" style={{ color: 'var(--muted)' }}>
            {course.tagline}
          </p>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2">
          <MetaPill label={`📅 ${course.duration}`} />
          <MetaPill label={`👥 ${course.levelLabel}`} />
          <MetaPill label={`🏫 ${course.mode}`} />
        </div>

        {/* Tools */}
        {visibleTools.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleTools.map((t) => (
              <span
                key={t.id}
                className="px-2.5 py-0.5 rounded-full text-xs"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                {t.emoji} {t.name}
              </span>
            ))}
            {extraTools > 0 && (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs"
                style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                +{extraTools} more
              </span>
            )}
          </div>
        )}

        {/* Outcomes */}
        {course.outcomes.length > 0 && (
          <div className={`grid gap-1.5 ${isL1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
            {course.outcomes.slice(0, 6).map((o) => (
              <div key={o.id} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                <span style={{ color: accentColor, flexShrink: 0 }}>✓</span>
                {o.title}
              </div>
            ))}
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3 mt-auto pt-1">
          <button
            onClick={modal.open}
            className="flex-1 min-w-[150px] text-sm font-semibold py-3 rounded-full cursor-pointer transition-all duration-300"
            style={{
              background: `rgba(${btnRgb},0.08)`,
              border: `1px solid rgba(${btnRgb},0.4)`,
              color: accentColor,
              boxShadow: `0 0 20px rgba(${btnRgb},0.1)`,
              minHeight: '44px',
              fontFamily: 'var(--font-head)',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = `rgba(${btnRgb},0.18)`;
              el.style.borderColor = `rgba(${btnRgb},0.7)`;
              el.style.boxShadow = `0 0 32px rgba(${btnRgb},0.28), inset 0 0 8px rgba(${btnRgb},0.1)`;
              el.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = `rgba(${btnRgb},0.08)`;
              el.style.borderColor = `rgba(${btnRgb},0.4)`;
              el.style.boxShadow = `0 0 20px rgba(${btnRgb},0.1)`;
              el.style.transform = '';
            }}
          >
            {course.ctaDemoText || 'Book Free Demo ➞'}
          </button>
          {slug && (
            <Link to={`/courses/${slug}`} className="btn-outline text-sm px-5 py-2.5">
              View Course ➞
            </Link>
          )}
        </div>
      </div>
      <DemoModal isOpen={modal.isOpen} onClose={modal.close} />
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function LearningPathway() {
  const [courses, setCourses] = useState<AiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileActiveTrack, setMobileActiveTrack] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllCourses()
      .then((res) => setCourses(res.data))
      .catch(() => { /* backend offline - component stays empty */ })
      .finally(() => setLoading(false));
  }, []);

  const handleMobileCarouselScroll = useCallback(() => {
    const el = mobileCarouselRef.current;
    if (!el) return;
    setMobileActiveTrack(Math.min(1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth))));
  }, []);

  const goToMobileTrack = useCallback((idx: number) => {
    setMobileActiveTrack(idx);
    const el = mobileCarouselRef.current;
    if (el) el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
  }, []);

  const l1  = courses.find((c) => c.level === 'L1_FOUNDATION');
  const l2a = courses.find((c) => c.level === 'L2A_GENERALIST');
  const l2b = courses.find((c) => c.level === 'L2B_DEVELOPER');

  const l2Tracks = [
    { level: 'L2A_GENERALIST' as const, label: 'L2A – Non-Tech', course: l2a, idx: 0 },
    { level: 'L2B_DEVELOPER'  as const, label: 'L2B – Tech',     course: l2b, idx: 1 },
  ];

  const activeRgb = LEVEL_BTN_RGB[mobileActiveTrack === 0 ? 'L2A_GENERALIST' : 'L2B_DEVELOPER'];

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="max-w-2xl mx-auto w-full"><SkeletonCard /></div>
        <div className="grid md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">

      {/* ── Level 1 ────────────────────────────────────────────── */}
      {l1 && <PathwayCard course={l1} isWide />}

      {/* ── Desktop connector SVG ──────────────────────────────── */}
      <div className="hidden md:block w-full">
        <CoursePathConnector />
      </div>

      {/* ── Mobile: synchronized junction + tabs + carousel ───── */}
      <div className="md:hidden flex flex-col items-center w-full">

        {/* Junction node */}
        <div className="flex flex-col items-center mb-5 mt-4">
          <div
            className="w-px h-7"
            style={{ background: 'linear-gradient(to bottom, var(--electric), rgba(0,212,255,0.45))' }}
          />
          <div
            className="w-3 h-3 rounded-full my-2"
            style={{ background: 'var(--electric)', boxShadow: '0 0 12px rgba(0,212,255,0.7), 0 0 24px rgba(0,212,255,0.3)' }}
          />
          <div
            className="text-[10px] font-bold uppercase tracking-[2.5px] px-4 py-1.5 rounded-full"
            style={{ color: 'var(--muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Choose Your Track
          </div>
        </div>

        {/* Track selector tabs */}
        {(l2a || l2b) && (
          <div className="flex gap-2 w-full">
            {l2Tracks.map(({ level, label, idx }) => (
              <button
                key={level}
                onClick={() => goToMobileTrack(idx)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-300"
                style={{
                  background: mobileActiveTrack === idx ? `rgba(${LEVEL_BTN_RGB[level]},0.12)` : 'rgba(255,255,255,0.02)',
                  border: `1.5px solid ${mobileActiveTrack === idx ? `rgba(${LEVEL_BTN_RGB[level]},0.6)` : 'rgba(255,255,255,0.08)'}`,
                  color: mobileActiveTrack === idx ? LEVEL_COLOR[level] : 'var(--muted)',
                  boxShadow: mobileActiveTrack === idx ? `0 0 18px rgba(${LEVEL_BTN_RGB[level]},0.22), inset 0 0 8px rgba(${LEVEL_BTN_RGB[level]},0.06)` : 'none',
                  fontFamily: 'var(--font-head)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Connector line: active tab → card */}
        {(l2a || l2b) && (
          <div
            className="w-px transition-all duration-300"
            style={{
              height: 28,
              background: `linear-gradient(to bottom, rgba(${activeRgb},0.9), rgba(${activeRgb},0.25))`,
              boxShadow: `0 0 8px rgba(${activeRgb},0.5)`,
            }}
          />
        )}

        {/* Snap carousel */}
        {(l2a || l2b) && (
          <div className="overflow-hidden w-full">
            <div
              ref={mobileCarouselRef}
              onScroll={handleMobileCarouselScroll}
              className="no-scrollbar flex overflow-x-auto snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none' }}
            >
              {l2a && (
                <div className="snap-start shrink-0 w-full">
                  <PathwayCard course={l2a} />
                </div>
              )}
              {l2b && (
                <div className="snap-start shrink-0 w-full">
                  <PathwayCard course={l2b} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dot indicators */}
        {l2a && l2b && (
          <div className="flex justify-center gap-2 mt-3">
            {l2Tracks.map(({ level, idx }) => (
              <button
                key={level}
                onClick={() => goToMobileTrack(idx)}
                className="rounded-full cursor-pointer transition-all duration-300"
                style={{
                  width: mobileActiveTrack === idx ? 20 : 6,
                  height: 6,
                  background: mobileActiveTrack === idx ? LEVEL_COLOR[level] : 'rgba(255,255,255,0.15)',
                  boxShadow: mobileActiveTrack === idx ? `0 0 8px rgba(${LEVEL_BTN_RGB[level]},0.55)` : 'none',
                }}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── Desktop: 2-column L2 grid ─────────────────────────── */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 w-full max-w-5xl">
        {l2a && <PathwayCard course={l2a} />}
        {l2b && <PathwayCard course={l2b} />}
      </div>

    </div>
  );
}
