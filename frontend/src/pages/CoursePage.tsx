import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getCourseBySlug } from '@/api/courses';
import { useModal } from '@/hooks/useModal';
import { DemoModal } from '@/components/shared/DemoModal';
import type { AiCourse, CourseFAQ, CourseTool } from '@/types';

function useSlug(): string {
  const { pathname } = useLocation();
  return pathname.split('/').pop() ?? '';
}

const LEVEL_COLOR: Record<string, string> = {
  L1_FOUNDATION: 'var(--electric)',
  L2A_GENERALIST: 'var(--orange)',
  L2B_DEVELOPER: '#a78bfa',
  L3_AIML: '#10b981',
};

const AIML_RELATED = {
  label: 'AI & Machine Learning', slug: 'aiml',
  levelLabel: 'AI/ML -Advanced Track',
  desc: 'Build, train, and deploy real ML, Deep Learning, and GenAI systems. From Python and data fundamentals to LLMs, RAG, and production deployment.',
};

const RELATED: Record<string, { label: string; slug: string; levelLabel: string; desc: string }[]> = {
  l1: [
    {
      label: 'AI Generalist Program', slug: 'l2a',
      levelLabel: 'Level 2A -Non-Tech Track',
      desc: 'For freshers, professionals, and entrepreneurs. Master 15+ AI tools for content, design, video, automation, and productivity.',
    },
    {
      label: 'AI Developer Program', slug: 'l2b',
      levelLabel: 'Level 2B -Tech Track',
      desc: 'For IT and engineering students. Learn AI-assisted coding, LLM APIs, GitHub Copilot, and build your own AI-powered applications.',
    },
    AIML_RELATED,
  ],
  l2a: [
    {
      label: 'AI Foundation Program', slug: 'l1',
      levelLabel: 'Level 1 -Foundation',
      desc: 'The entry point for everyone. Learn AI fundamentals, 8+ tools, and get certified -no coding required.',
    },
    {
      label: 'AI Developer Program', slug: 'l2b',
      levelLabel: 'Level 2B -Tech Track',
      desc: 'For IT and engineering students. Learn AI-assisted coding, LLM APIs, GitHub Copilot, and build your own AI-powered applications.',
    },
    AIML_RELATED,
  ],
  l2b: [
    {
      label: 'AI Foundation Program', slug: 'l1',
      levelLabel: 'Level 1 -Foundation',
      desc: 'The entry point for everyone. Learn AI fundamentals, 8+ tools, and get certified -no coding required.',
    },
    {
      label: 'AI Generalist Program', slug: 'l2a',
      levelLabel: 'Level 2A -Non-Tech Track',
      desc: 'For freshers, professionals, and entrepreneurs. Master 15+ AI tools for content, design, video, and automation.',
    },
    AIML_RELATED,
  ],
  aiml: [
    {
      label: 'AI Foundation Program', slug: 'l1',
      levelLabel: 'Level 1 -Foundation',
      desc: 'The entry point for everyone. Learn AI fundamentals, 8+ tools, and get certified -no coding required.',
    },
    {
      label: 'AI Developer Program', slug: 'l2b',
      levelLabel: 'Level 2B -Tech Track',
      desc: 'For IT and engineering students. Learn AI-assisted coding, LLM APIs, GitHub Copilot, and build your own AI-powered applications.',
    },
  ],
};

const RELATED_COLOR: Record<string, string> = {
  l1: 'var(--electric)',
  l2a: 'var(--orange)',
  l2b: '#a78bfa',
  aiml: '#10b981',
};

// Fires IntersectionObserver only after async data is loaded and sections are mounted
function useReveal(ready: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ready) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ready]);
  return ref;
}

function FAQItem({ faq, accent }: { faq: CourseFAQ; accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--card)',
        border: `1px solid ${open ? `${accent}40` : 'var(--border)'}`,
        transition: 'border-color 0.3s',
      }}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-semibold text-sm" style={{ color: 'var(--white)' }}>
          {faq.question}
        </span>
        <span
          className="w-6 h-6 min-w-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold"
          style={{
            border: `1px solid ${open ? accent : 'var(--border)'}`,
            background: open ? `${accent}18` : 'transparent',
            color: open ? accent : 'var(--muted)',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'all 0.3s',
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          {faq.answer}
        </div>
      )}
    </div>
  );
}

function groupToolsByCategory(tools: CourseTool[]): { category: string; emoji: string; items: CourseTool[] }[] {
  const map = new Map<string, CourseTool[]>();
  tools.forEach((t) => {
    if (!map.has(t.category)) map.set(t.category, []);
    map.get(t.category)!.push(t);
  });
  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    emoji: items[0].emoji,
    items,
  }));
}

function PageSkeleton() {
  return (
    <div className="animate-pulse pt-24 px-4 max-w-6xl mx-auto">
      <div className="h-5 w-28 rounded-full mb-4" style={{ background: 'var(--border)' }} />
      <div className="h-10 w-2/3 rounded mb-3" style={{ background: 'var(--border)' }} />
      <div className="h-5 w-full rounded mb-2" style={{ background: 'var(--border)' }} />
      <div className="h-5 w-3/4 rounded mb-8" style={{ background: 'var(--border)' }} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-xl" style={{ background: 'var(--border)' }} />
        ))}
      </div>
    </div>
  );
}

export default function CoursePage() {
  const slug = useSlug();
  const navigate = useNavigate();
  const modal = useModal();
  const [course, setCourse] = useState<AiCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [stickyVisible, setStickyVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setLoading(true);
    setCourse(null);
    getCourseBySlug(slug)
      .then((res) => setCourse(res.data))
      .catch(() => navigate('/courses', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  // Sticky bottom bar: appear after hero scrolls out of view
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, [course]);

  const loaded = !loading && !!course;
  const r1 = useReveal(loaded); // who
  const r2 = useReveal(loaded); // curriculum
  const r3 = useReveal(loaded); // tools
  const r4 = useReveal(loaded); // outcomes + before/after
  const r5 = useReveal(loaded); // course details & eligibility
  const r6 = useReveal(loaded); // testimonials
  const r7 = useReveal(loaded); // faq
  const r8 = useReveal(loaded); // related

  if (loading) return <div style={{ background: 'var(--navy)', minHeight: '100vh' }}><PageSkeleton /></div>;
  if (!course) return null;

  const accent = LEVEL_COLOR[course.level];
  const related = RELATED[slug] ?? [];
  const isL2 = slug === 'l2a' || slug === 'l2b';
  const toolGroups = groupToolsByCategory(course.tools ?? []);

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>

      {/* ── Bottom sticky bar (slides up from below after hero scrolls out) ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-5 md:px-12 py-3"
        style={{
          background: 'rgba(2,8,24,0.97)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
          transform: stickyVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s ease',
        }}
      >
        <div className="hidden md:block">
          <div className="font-bold text-sm" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
            {course.title}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            {course.badgeText} · {course.duration} · {course.language}
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Link
            to="/contact"
            className="btn-outline text-xs px-4 py-2.5 flex-1 md:flex-none text-center"
          >
            💬 WhatsApp
          </Link>
          <button onClick={modal.open} className="btn-primary text-xs px-5 py-2.5 flex-1 md:flex-none">
            {course.ctaDemoText}
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="pt-28 pb-16 px-4"
        style={{ background: `linear-gradient(180deg, ${accent}08 0%, transparent 60%)` }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_360px] gap-10 items-start">

          {/* Left: text */}
          <div>
            <Link to="/courses" className="inline-flex items-center gap-1.5 text-xs mb-6 hover:opacity-80" style={{ color: 'var(--muted)' }}>
              ← All Courses
            </Link>

            {/* Badge with pulsing dot */}
            <div
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
              style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}40` }}
            >
              <span className="pulse-dot w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
              {course.badgeText}
            </div>

            <h1
              className="text-3xl md:text-5xl font-bold mb-3 leading-tight"
              style={{ color: 'var(--white)', fontFamily: 'var(--font-head)', letterSpacing: '-1.5px' }}
            >
              {course.title}
            </h1>
            <p className="text-base md:text-lg leading-relaxed mb-7" style={{ color: 'var(--muted)' }}>
              {course.tagline}
            </p>

            {/* Quick stats as pills */}
            <div className="flex flex-wrap gap-2 mb-7">
              {[
                `⏱ ${course.duration}`,
                `🏆 ${course.mentorship}`,
                `📍 ${course.mode}`,
                `✅ ${course.certificate}`,
                `🗣 ${course.language}`,
              ].map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--white)' }}
                >
                  {s}
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <button onClick={modal.open} className="btn-primary px-6 py-2.5 text-sm">
                {course.ctaDemoText}
              </button>
              <Link to="/contact" className="btn-outline px-6 py-2.5 text-sm">
                💬 {course.ctaWaText}
              </Link>
            </div>
          </div>

          {/* Right: course highlights card */}
          <div
            className="glass-card rounded-2xl p-6 md:sticky md:top-24"
            style={{ border: `1px solid ${accent}30` }}
          >
            <div
              className="font-bold text-sm pb-4 mb-1"
              style={{ color: 'var(--white)', fontFamily: 'var(--font-head)', borderBottom: '1px solid var(--border)' }}
            >
              Course Highlights
            </div>
            {[
              { key: 'Duration', val: course.duration, good: false },
              { key: 'Mentorship', val: course.mentorship, good: true },
              { key: 'Training Days', val: course.trainingDays, good: false },
              { key: 'Language', val: course.language, good: false },
              { key: 'Mode', val: course.mode, good: false },
              { key: 'Certificate', val: course.certificate, good: true },
              { key: 'Placement', val: course.placementInfo, good: true },
            ].map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{row.key}</span>
                <span
                  className="text-xs font-semibold text-right ml-4"
                  style={{ color: row.good ? accent : 'var(--white)' }}
                >
                  {row.val}
                </span>
              </div>
            ))}
            <button onClick={modal.open} className="btn-primary w-full mt-5 py-3 text-sm">
              {course.ctaDemoText}
            </button>
            <Link
              to="/contact"
              className="btn-outline w-full flex items-center justify-center mt-2.5 py-3 text-sm"
            >
              💬 {course.ctaWaText}
            </Link>
            <div className="text-center mt-3 text-xs" style={{ color: 'var(--muted)' }}>
              Free demo · No fees · No obligation
            </div>
          </div>
        </div>
      </section>

      {/* ── Prerequisite banner (L2A / L2B only) ── */}
      {isL2 && (
        <div className="px-4 pt-3 pb-0">
          <div
            className="max-w-6xl mx-auto flex items-center gap-3 rounded-xl px-5 py-3"
            style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)' }}
          >
            <span className="text-lg flex-shrink-0">💡</span>
            <p className="text-sm flex-1 leading-snug" style={{ color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--electric)' }}>Recommended:</strong>{' '}
              This course builds on AI Foundation (L1). We suggest completing Level 1 first for the best experience.
            </p>
            <Link
              to="/courses/l1"
              className="text-xs font-semibold flex-shrink-0 underline"
              style={{ color: 'var(--electric)' }}
            >
              View L1 ➞
            </Link>
          </div>
        </div>
      )}

      {/* ── Who Should Join ── */}
      {(course.whoItems ?? []).length > 0 && (
        <section className="py-16 px-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div ref={r1} className="reveal max-w-5xl mx-auto">
            <div className="section-tag mb-3">PERFECT FOR</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
              Who Should Join This Course?
            </h2>
            <p className="text-sm mb-8 leading-relaxed max-w-xl" style={{ color: 'var(--muted)' }}>
              This course is designed for anyone who wants to start their AI journey -regardless of age, background, or technical experience.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(course.whoItems ?? []).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  {/* Emoji in styled square box */}
                  <div
                    className="w-11 h-11 min-w-11 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                    style={{ background: `${accent}14` }}
                  >
                    {item.emoji}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
                      {item.title}
                    </h4>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Curriculum ── */}
      {(course.modules ?? []).length > 0 && (
        <section className="py-16 px-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div ref={r2} className="reveal max-w-4xl mx-auto">
            <div className="section-tag mb-3">CURRICULUM</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
              Module-by-Module Breakdown
            </h2>
            <p className="text-sm mb-8 leading-relaxed max-w-xl" style={{ color: 'var(--muted)' }}>
              A structured journey from beginner to confident AI user -with real projects every step of the way.
            </p>
            {/* Stacked rows: merged borders, left accent bar on hover */}
            <div className="flex flex-col">
              {(course.modules ?? []).map((mod, idx, arr) => {
                const isFirst = idx === 0;
                const isLast = idx === arr.length - 1;
                return (
                  <div
                    key={mod.id}
                    className="group relative overflow-hidden grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-y-2 gap-x-8 px-6 py-5 transition-colors duration-300 hover:bg-white/[0.03]"
                    style={{
                      border: '1px solid var(--border)',
                      borderTop: isFirst ? '1px solid var(--border)' : 'none',
                      borderRadius: isFirst ? '16px 16px 0 0' : isLast ? '0 0 16px 16px' : '0',
                    }}
                  >
                    {/* Left accent bar -revealed on hover */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: accent }}
                    />
                    <div
                      className="text-xs font-bold uppercase tracking-wider pt-1 sm:pt-0.5"
                      style={{ color: accent }}
                    >
                      {mod.label}
                    </div>
                    <div>
                      <div className="font-bold mb-2.5" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
                        {mod.title}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {mod.topics.map((topic) => (
                          <span
                            key={topic}
                            className="text-xs px-2.5 py-0.5 rounded-full"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid var(--border)',
                              color: 'var(--muted)',
                            }}
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Tools ── */}
      {(course.tools ?? []).length > 0 && (
        <section className="py-16 px-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div ref={r3} className="reveal max-w-5xl mx-auto">
            <div className="section-tag mb-3">TOOLS</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
              AI Tools You Will Master
            </h2>
            <p className="text-sm mb-8 leading-relaxed max-w-xl" style={{ color: 'var(--muted)' }}>
              Every tool you learn is actively used in the industry -no outdated software, no textbook tools.
            </p>

            {course.level === 'L1_FOUNDATION' ? (
              /* L1: individual mini-cards (4 columns) */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(course.tools ?? []).map((tool) => (
                  <div
                    key={tool.id}
                    className="rounded-xl p-4 text-center transition-all duration-300 hover:-translate-y-1"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <div className="text-2xl mb-2">{tool.emoji}</div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--white)' }}>{tool.name}</div>
                    <div className="mt-0.5" style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{tool.category}</div>
                  </div>
                ))}
              </div>
            ) : (
              /* L2A / L2B: category-grouped cards (3 columns) */
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {toolGroups.map((grp) => (
                  <div
                    key={grp.category}
                    className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 min-w-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: `${accent}14` }}
                      >
                        {grp.emoji}
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
                          {grp.category}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>
                          {grp.items.length} tool{grp.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {grp.items.map((t) => (
                        <span
                          key={t.id}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            color: 'var(--muted)',
                          }}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Outcomes + Before/After ── */}
      <section className="py-16 px-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div ref={r4} className="reveal max-w-5xl mx-auto">

          {(course.outcomes ?? []).length > 0 && (
            <>
              <div className="section-tag mb-3">AFTER THIS COURSE</div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
                What You Will Be Able to Do
              </h2>
              <p className="text-sm mb-8 leading-relaxed max-w-xl" style={{ color: 'var(--muted)' }}>
                Every outcome below is a real, practical skill you will walk away with -not just theory.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {(course.outcomes ?? []).map((o) => (
                  <div
                    key={o.id}
                    className="rounded-xl p-5 flex items-start gap-4 transition-all duration-300 hover:-translate-y-0.5"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    {/* Circle check icon */}
                    <div
                      className="w-7 h-7 min-w-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                      style={{ background: `${accent}18`, color: accent }}
                    >
                      ✓
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1" style={{ color: 'var(--white)' }}>{o.title}</div>
                      <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{o.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {course.beforeAfter && (
            <>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
                Your Transformation
              </h2>
              {/* 3-column: before | arrow | after */}
              <div className="grid md:grid-cols-[1fr_auto_1fr] gap-5 items-center">
                <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="text-xs font-bold uppercase mb-4" style={{ color: 'var(--muted)', letterSpacing: '2px' }}>
                    Before This Course
                  </div>
                  {course.beforeAfter.beforeItems.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm mb-2.5 last:mb-0" style={{ color: 'var(--muted)' }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--muted)' }} />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="text-3xl font-bold text-center hidden md:block" style={{ color: accent }}>➞</div>
                <div className="text-2xl font-bold text-center block md:hidden" style={{ color: accent }}>↓</div>

                <div
                  className="rounded-2xl p-6"
                  style={{ background: `${accent}06`, border: `1px solid ${accent}30` }}
                >
                  <div className="text-xs font-bold uppercase mb-4" style={{ color: accent, letterSpacing: '2px' }}>
                    After This Course
                  </div>
                  {course.beforeAfter.afterItems.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm mb-2.5 last:mb-0" style={{ color: 'var(--white)' }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Course Details & Eligibility (merged section) ── */}
      {(course.eligibilityItems ?? []).length > 0 && (
        <section className="py-16 px-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div ref={r5} className="reveal max-w-5xl mx-auto">
            <div className="section-tag mb-3">DETAILS</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
              Course Details & Eligibility
            </h2>
            <div className="grid md:grid-cols-2 gap-5">

              {/* Course Information */}
              <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <h3
                  className="font-bold text-sm pb-4 mb-1"
                  style={{ color: 'var(--white)', fontFamily: 'var(--font-head)', borderBottom: '1px solid var(--border)' }}
                >
                  Course Information
                </h3>
                {[
                  { key: 'Duration', val: course.duration, good: false },
                  { key: 'Mentorship', val: course.mentorship, good: true },
                  { key: 'Training Days', val: course.trainingDays, good: false },
                  { key: 'Language', val: course.language, good: false },
                  { key: 'Mode', val: course.mode, good: false },
                  { key: 'Certificate', val: course.certificate, good: true },
                  { key: 'Placement Support', val: course.placementInfo, good: true },
                  { key: 'Level', val: course.levelLabel, good: false },
                ].map((row, i, arr) => (
                  <div
                    key={row.key}
                    className="flex items-center justify-between py-2.5"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  >
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{row.key}</span>
                    <span
                      className="text-xs font-semibold text-right ml-4"
                      style={{ color: row.good ? accent : 'var(--white)' }}
                    >
                      {row.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Who Can Apply */}
              <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <h3
                  className="font-bold text-sm pb-4 mb-1"
                  style={{ color: 'var(--white)', fontFamily: 'var(--font-head)', borderBottom: '1px solid var(--border)' }}
                >
                  Who Can Apply
                </h3>
                {(course.eligibilityItems ?? []).map((item, i, arr) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2.5 text-sm"
                    style={{
                      color: 'var(--white)',
                      borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}
                  >
                    <span className="font-bold flex-shrink-0" style={{ color: accent }}>✓</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      {(course.testimonials ?? []).length > 0 && (
        <section className="py-16 px-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div ref={r6} className="reveal max-w-5xl mx-auto">
            <div className="section-tag mb-3">STUDENT STORIES</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
              What Our Students Say
            </h2>
            <p className="text-sm mb-8 leading-relaxed max-w-xl" style={{ color: 'var(--muted)' }}>
              Real results from real students who started exactly where you are right now.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {(course.testimonials ?? []).map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl p-5 flex flex-col transition-all duration-300 hover:-translate-y-1"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-9 h-9 min-w-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: t.avatarGrad, color: 'white', fontFamily: 'var(--font-head)' }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div className="font-bold text-sm" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
                        {t.name}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{t.meta}</div>
                    </div>
                  </div>
                  {/* Quote */}
                  <p className="text-sm leading-relaxed italic flex-1" style={{ color: 'var(--muted)' }}>
                    "{t.quote}"
                  </p>
                  {/* Transformation row */}
                  <div
                    className="flex items-center gap-1.5 text-xs mt-4 pt-3 flex-wrap"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <span style={{ color: 'var(--muted)' }}>{t.before}</span>
                    <span className="font-bold" style={{ color: accent }}>➞</span>
                    <span className="font-semibold" style={{ color: accent }}>{t.after}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {(course.faqs ?? []).length > 0 && (
        <section className="py-16 px-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div ref={r7} className="reveal max-w-3xl mx-auto">
            <div className="section-tag mb-3">FAQ</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--muted)' }}>
              Everything you need to know before joining -answered clearly.
            </p>
            <div className="flex flex-col gap-2">
              {(course.faqs ?? []).map((faq) => (
                <FAQItem key={faq.id} faq={faq} accent={accent} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Related Courses ── */}
      {related.length > 0 && (
        <section className="py-16 px-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div ref={r8} className="reveal max-w-4xl mx-auto">
            <div className="section-tag mb-3">NEXT STEPS</div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
              Continue Your AI Journey
            </h2>
            <p className="text-sm mb-8 leading-relaxed max-w-xl" style={{ color: 'var(--muted)' }}>
              {slug === 'l1'
                ? 'After completing Level 1, choose the track that matches your goals.'
                : 'Explore other programs in the PRIM AI pathway.'}
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/courses/${r.slug}`}
                  className="block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderTop: `2.5px solid ${RELATED_COLOR[r.slug]}`,
                    textDecoration: 'none',
                  }}
                >
                  <div
                    className="text-xs font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: RELATED_COLOR[r.slug] }}
                  >
                    {r.levelLabel}
                  </div>
                  <div
                    className="text-xl font-bold mb-2"
                    style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}
                  >
                    {r.label}
                  </div>
                  <div className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted)' }}>
                    {r.desc}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: RELATED_COLOR[r.slug] }}>
                    Explore Course ➞
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section
        className="py-20 px-4 text-center relative overflow-hidden"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 50%, ${accent}08, transparent 60%)` }}
        />
        <div className="relative max-w-2xl mx-auto">
          <div className="section-tag mb-4">START TODAY</div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-3 leading-tight"
            style={{ color: 'var(--white)', fontFamily: 'var(--font-head)', letterSpacing: '-1.5px' }}
          >
            Your AI Journey<br />Starts With One Step.
          </h2>
          <p className="mb-8 leading-relaxed" style={{ color: 'var(--muted)' }}>
            Book a free demo class -no fees, no obligation. Just come and see what AI can do for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={modal.open} className="btn-primary px-8 py-3 text-base">
              {course.ctaDemoText}
            </button>
            <Link to="/contact" className="btn-outline px-8 py-3 text-base">
              💬 WhatsApp Us
            </Link>
          </div>
          <div className="mt-4 text-xs" style={{ color: 'var(--muted)' }}>
            Limited seats · {course.trainingDays} · {course.language} · {course.mentorship}
          </div>
        </div>
      </section>

      <DemoModal isOpen={modal.isOpen} onClose={modal.close} />
    </div>
  );
}
