import { useEffect, useState, useCallback } from 'react';
import {
  adminGetCourse,
  adminGetListingPage,
  adminUpdateCourseHero,
  adminUpdateWhoItems,
  adminUpdateModules,
  adminUpdateTools,
  adminUpdateOutcomes,
  adminUpdateBeforeAfter,
  adminUpdateEligibility,
  adminUpdateFaqs,
  adminUpdateTestimonials,
  adminUpdateListingPage,
  adminUpdateListingWhoCards,
} from '@/api/courses';
import type {
  AiCourse,
  CoursesListingPage,
  CoursesListingWhoCard,
  CourseSlug,
  CourseWhoItem,
  CourseModule,
  CourseTool,
  CourseOutcome,
  CourseBeforeAfter,
  CourseEligibilityItem,
  CourseFAQ,
  CourseTestimonial,
} from '@/types';

type TabId = CourseSlug | 'listing';

const TABS: { slug: TabId; label: string; color: string }[] = [
  { slug: 'listing', label: '🏠 Listing Page', color: 'var(--electric)' },
  { slug: 'l1', label: 'L1 · Foundation', color: 'var(--electric)' },
  { slug: 'l2a', label: 'L2A · Generalist', color: 'var(--orange)' },
  { slug: 'l2b', label: 'L2B · Developer', color: '#a78bfa' },
  { slug: 'aiml', label: 'AI/ML · Machine Learning', color: '#10b981' },
];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function useSave() {
  const [state, setState] = useState<SaveState>('idle');
  const save = useCallback(async (fn: () => Promise<unknown>) => {
    setState('saving');
    try {
      await fn();
      setState('saved');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }, []);
  return { state, save };
}

function SaveBtn({ state, onClick }: { state: SaveState; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={state === 'saving'}
      className="btn-primary text-xs px-4 py-2"
      style={{ opacity: state === 'saving' ? 0.6 : 1 }}
    >
      {state === 'saving' ? '⏳ Saving…' : state === 'saved' ? '✓ Saved' : state === 'error' ? '✗ Error' : 'Save'}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <button
        className="w-full flex items-center justify-between px-5 py-4"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-semibold text-sm" style={{ color: 'var(--white)' }}>{title}</span>
        <svg
          className="w-4 h-4 transition-transform duration-200"
          style={{ color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--border)' }}>{children}</div>}
    </div>
  );
}

function Field({
  label, value, onChange, multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const cls = "w-full mt-1 px-3 py-2 rounded-lg text-sm";
  const style = { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--white)' };
  return (
    <div className="mb-3">
      <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>{label}</label>
      {multiline
        ? <textarea className={cls} style={{ ...style, minHeight: 72 }} value={value} onChange={(e) => onChange(e.target.value)} />
        : <input className={cls} style={style} value={value} onChange={(e) => onChange(e.target.value)} />
      }
    </div>
  );
}

// ─── Hero Section ────────────────────────────────────────────────────────────

function HeroSection({ course, slug, onSaved }: { course: AiCourse; slug: CourseSlug; onSaved: (c: AiCourse) => void }) {
  const { state, save } = useSave();
  const [form, setForm] = useState({
    badgeText: course.badgeText,
    title: course.title,
    tagline: course.tagline,
    duration: course.duration,
    mentorship: course.mentorship,
    trainingDays: course.trainingDays,
    language: course.language,
    mode: course.mode,
    certificate: course.certificate,
    placementInfo: course.placementInfo,
    levelLabel: course.levelLabel,
    ctaDemoText: course.ctaDemoText,
    ctaWaText: course.ctaWaText,
    ctaDownloadText: course.ctaDownloadText,
  });
  const f = (key: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [key]: v }));

  return (
    <Section title="1 · Hero & Basic Info">
      <div className="pt-4 grid md:grid-cols-2 gap-x-6">
        <Field label="Badge Text" value={form.badgeText} onChange={f('badgeText')} />
        <Field label="Title" value={form.title} onChange={f('title')} />
        <Field label="Tagline" value={form.tagline} onChange={f('tagline')} multiline />
        <Field label="Level Label" value={form.levelLabel} onChange={f('levelLabel')} />
        <Field label="Duration" value={form.duration} onChange={f('duration')} />
        <Field label="Mentorship" value={form.mentorship} onChange={f('mentorship')} />
        <Field label="Training Days" value={form.trainingDays} onChange={f('trainingDays')} />
        <Field label="Language" value={form.language} onChange={f('language')} />
        <Field label="Mode" value={form.mode} onChange={f('mode')} />
        <Field label="Certificate" value={form.certificate} onChange={f('certificate')} />
        <Field label="Placement Info" value={form.placementInfo} onChange={f('placementInfo')} />
        <Field label="CTA: Demo Button" value={form.ctaDemoText} onChange={f('ctaDemoText')} />
        <Field label="CTA: WhatsApp Button" value={form.ctaWaText} onChange={f('ctaWaText')} />
        <Field label="CTA: Download Button" value={form.ctaDownloadText} onChange={f('ctaDownloadText')} />
      </div>
      <SaveBtn state={state} onClick={() => save(async () => {
        const res = await adminUpdateCourseHero(slug, form);
        onSaved(res.data);
      })} />
    </Section>
  );
}

// ─── Who Items ────────────────────────────────────────────────────────────────

function WhoSection({ course, slug, onSaved }: { course: AiCourse; slug: CourseSlug; onSaved: (c: AiCourse) => void }) {
  type Item = Omit<CourseWhoItem, 'id' | 'courseId'>;
  const { state, save } = useSave();
  const [items, setItems] = useState<Item[]>(
    course.whoItems.map(({ emoji, title, desc, order }) => ({ emoji, title, desc, order }))
  );

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next.map((x, idx) => ({ ...x, order: idx })));
  };

  return (
    <Section title="2 · Who Should Join">
      <div className="pt-4 flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="glass-card rounded-lg p-4 flex gap-3">
            <div className="flex flex-col gap-1">
              <button onClick={() => move(i, -1)} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--border)', color: 'var(--muted)' }}>↑</button>
              <button onClick={() => move(i, 1)} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--border)', color: 'var(--muted)' }}>↓</button>
            </div>
            <div className="flex-1 grid md:grid-cols-3 gap-3">
              <Field label="Emoji" value={item.emoji} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, emoji: v } : x))} />
              <Field label="Title" value={item.title} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, title: v } : x))} />
              <Field label="Description" value={item.desc} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, desc: v } : x))} multiline />
            </div>
            <button
              onClick={() => setItems((p) => p.filter((_, j) => j !== i).map((x, idx) => ({ ...x, order: idx })))}
              className="text-xs self-start" style={{ color: '#ef4444' }}
            >✕</button>
          </div>
        ))}
        <button
          onClick={() => setItems((p) => [...p, { emoji: '✅', title: '', desc: '', order: p.length }])}
          className="btn-outline text-xs px-4 py-2 self-start"
        >
          + Add Item
        </button>
      </div>
      <div className="mt-4">
        <SaveBtn state={state} onClick={() => save(async () => {
          const res = await adminUpdateWhoItems(slug, items);
          onSaved(res.data);
        })} />
      </div>
    </Section>
  );
}

// ─── Modules ─────────────────────────────────────────────────────────────────

function ModulesSection({ course, slug, onSaved }: { course: AiCourse; slug: CourseSlug; onSaved: (c: AiCourse) => void }) {
  type Item = Omit<CourseModule, 'id' | 'courseId'>;
  const { state, save } = useSave();
  const [items, setItems] = useState<Item[]>(
    course.modules.map(({ label, title, topics, order }) => ({ label, title, topics, order }))
  );

  const updateTopic = (modIdx: number, topicIdx: number, val: string) => {
    setItems((p) => p.map((m, i) => i === modIdx
      ? { ...m, topics: m.topics.map((t, j) => j === topicIdx ? val : t) }
      : m
    ));
  };

  return (
    <Section title="3 · Curriculum Modules">
      <div className="pt-4 flex flex-col gap-4">
        {items.map((mod, i) => (
          <div key={i} className="glass-card rounded-lg p-4">
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <Field label="Label (e.g. Module 1)" value={mod.label} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, label: v } : x))} />
              <Field label="Title" value={mod.title} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, title: v } : x))} />
            </div>
            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>Topics</div>
            <div className="flex flex-col gap-1.5 mb-2">
              {mod.topics.map((topic, ti) => (
                <div key={ti} className="flex gap-2">
                  <input
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--white)' }}
                    value={topic}
                    onChange={(e) => updateTopic(i, ti, e.target.value)}
                  />
                  <button
                    onClick={() => setItems((p) => p.map((x, j) => j === i ? { ...x, topics: x.topics.filter((_, k) => k !== ti) } : x))}
                    className="text-xs" style={{ color: '#ef4444' }}
                  >✕</button>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setItems((p) => p.map((x, j) => j === i ? { ...x, topics: [...x.topics, ''] } : x))}
                className="text-xs" style={{ color: 'var(--electric)' }}
              >+ Add Topic</button>
              <button onClick={() => setItems((p) => p.filter((_, j) => j !== i).map((x, idx) => ({ ...x, order: idx })))} className="text-xs" style={{ color: '#ef4444' }}>
                Remove Module
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => setItems((p) => [...p, { label: '', title: '', topics: [], order: p.length }])}
          className="btn-outline text-xs px-4 py-2 self-start"
        >
          + Add Module
        </button>
      </div>
      <div className="mt-4">
        <SaveBtn state={state} onClick={() => save(async () => {
          const res = await adminUpdateModules(slug, items);
          onSaved(res.data);
        })} />
      </div>
    </Section>
  );
}

// ─── Tools ────────────────────────────────────────────────────────────────────

function ToolsSection({ course, slug, onSaved }: { course: AiCourse; slug: CourseSlug; onSaved: (c: AiCourse) => void }) {
  type Item = Omit<CourseTool, 'id' | 'courseId'>;
  const { state, save } = useSave();
  const [items, setItems] = useState<Item[]>(
    course.tools.map(({ emoji, name, category, order }) => ({ emoji, name, category, order }))
  );

  return (
    <Section title="4 · Tools">
      <div className="pt-4 flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="grid grid-cols-3 gap-3 flex-1">
              <Field label="Emoji" value={item.emoji} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, emoji: v } : x))} />
              <Field label="Name" value={item.name} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, name: v } : x))} />
              <Field label="Category" value={item.category} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, category: v } : x))} />
            </div>
            <button onClick={() => setItems((p) => p.filter((_, j) => j !== i).map((x, idx) => ({ ...x, order: idx })))} className="text-xs mt-5 flex-shrink-0" style={{ color: '#ef4444' }}>✕</button>
          </div>
        ))}
        <button onClick={() => setItems((p) => [...p, { emoji: '🔧', name: '', category: '', order: p.length }])} className="btn-outline text-xs px-4 py-2 self-start">
          + Add Tool
        </button>
      </div>
      <div className="mt-4">
        <SaveBtn state={state} onClick={() => save(async () => {
          const res = await adminUpdateTools(slug, items);
          onSaved(res.data);
        })} />
      </div>
    </Section>
  );
}

// ─── Outcomes ─────────────────────────────────────────────────────────────────

function OutcomesSection({ course, slug, onSaved }: { course: AiCourse; slug: CourseSlug; onSaved: (c: AiCourse) => void }) {
  type Item = Omit<CourseOutcome, 'id' | 'courseId'>;
  const { state, save } = useSave();
  const [items, setItems] = useState<Item[]>(
    course.outcomes.map(({ title, desc, order }) => ({ title, desc, order }))
  );

  return (
    <Section title="5 · Outcomes">
      <div className="pt-4 flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 grid md:grid-cols-2 gap-3">
              <Field label="Title" value={item.title} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, title: v } : x))} />
              <Field label="Description" value={item.desc} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, desc: v } : x))} multiline />
            </div>
            <button onClick={() => setItems((p) => p.filter((_, j) => j !== i).map((x, idx) => ({ ...x, order: idx })))} className="text-xs mt-5 flex-shrink-0" style={{ color: '#ef4444' }}>✕</button>
          </div>
        ))}
        <button onClick={() => setItems((p) => [...p, { title: '', desc: '', order: p.length }])} className="btn-outline text-xs px-4 py-2 self-start">
          + Add Outcome
        </button>
      </div>
      <div className="mt-4">
        <SaveBtn state={state} onClick={() => save(async () => {
          const res = await adminUpdateOutcomes(slug, items);
          onSaved(res.data);
        })} />
      </div>
    </Section>
  );
}

// ─── Before / After ──────────────────────────────────────────────────────────

function BeforeAfterSection({ course, slug, onSaved }: { course: AiCourse; slug: CourseSlug; onSaved: (c: AiCourse) => void }) {
  type Item = Omit<CourseBeforeAfter, 'id' | 'courseId'>;
  const { state, save } = useSave();
  const [form, setForm] = useState<Item>({
    beforeItems: course.beforeAfter?.beforeItems ?? [],
    afterItems: course.beforeAfter?.afterItems ?? [],
  });

  const ListEditor = ({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) => (
    <div>
      <div className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="flex flex-col gap-2 mb-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="flex-1 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--white)' }}
              value={item}
              onChange={(e) => onChange(items.map((x, j) => j === i ? e.target.value : x))}
            />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-xs" style={{ color: '#ef4444' }}>✕</button>
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...items, ''])} className="text-xs" style={{ color: 'var(--electric)' }}>+ Add</button>
    </div>
  );

  return (
    <Section title="6 · Before & After Transformation">
      <div className="pt-4 grid md:grid-cols-2 gap-6">
        <ListEditor label="Before Items" items={form.beforeItems} onChange={(v) => setForm((p) => ({ ...p, beforeItems: v }))} />
        <ListEditor label="After Items" items={form.afterItems} onChange={(v) => setForm((p) => ({ ...p, afterItems: v }))} />
      </div>
      <div className="mt-4">
        <SaveBtn state={state} onClick={() => save(async () => {
          const res = await adminUpdateBeforeAfter(slug, form);
          onSaved(res.data);
        })} />
      </div>
    </Section>
  );
}

// ─── Eligibility ──────────────────────────────────────────────────────────────

function EligibilitySection({ course, slug, onSaved }: { course: AiCourse; slug: CourseSlug; onSaved: (c: AiCourse) => void }) {
  type Item = Omit<CourseEligibilityItem, 'id' | 'courseId'>;
  const { state, save } = useSave();
  const [items, setItems] = useState<Item[]>(
    course.eligibilityItems.map(({ text, order }) => ({ text, order }))
  );

  return (
    <Section title="7 · Eligibility">
      <div className="pt-4 flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--white)' }}
              value={item.text}
              onChange={(e) => setItems((p) => p.map((x, j) => j === i ? { ...x, text: e.target.value } : x))}
            />
            <button onClick={() => setItems((p) => p.filter((_, j) => j !== i).map((x, idx) => ({ ...x, order: idx })))} className="text-xs" style={{ color: '#ef4444' }}>✕</button>
          </div>
        ))}
        <button onClick={() => setItems((p) => [...p, { text: '', order: p.length }])} className="btn-outline text-xs px-4 py-2 self-start mt-2">
          + Add Item
        </button>
      </div>
      <div className="mt-4">
        <SaveBtn state={state} onClick={() => save(async () => {
          const res = await adminUpdateEligibility(slug, items);
          onSaved(res.data);
        })} />
      </div>
    </Section>
  );
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────

function FaqsSection({ course, slug, onSaved }: { course: AiCourse; slug: CourseSlug; onSaved: (c: AiCourse) => void }) {
  type Item = Omit<CourseFAQ, 'id' | 'courseId'>;
  const { state, save } = useSave();
  const [items, setItems] = useState<Item[]>(
    course.faqs.map(({ question, answer, order }) => ({ question, answer, order }))
  );

  return (
    <Section title="8 · FAQs">
      <div className="pt-4 flex flex-col gap-4">
        {items.map((item, i) => (
          <div key={i} className="glass-card rounded-lg p-4 flex gap-3">
            <div className="flex-1">
              <Field label="Question" value={item.question} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, question: v } : x))} />
              <Field label="Answer" value={item.answer} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, answer: v } : x))} multiline />
            </div>
            <button onClick={() => setItems((p) => p.filter((_, j) => j !== i).map((x, idx) => ({ ...x, order: idx })))} className="text-xs self-start" style={{ color: '#ef4444' }}>✕</button>
          </div>
        ))}
        <button onClick={() => setItems((p) => [...p, { question: '', answer: '', order: p.length }])} className="btn-outline text-xs px-4 py-2 self-start">
          + Add FAQ
        </button>
      </div>
      <div className="mt-4">
        <SaveBtn state={state} onClick={() => save(async () => {
          const res = await adminUpdateFaqs(slug, items);
          onSaved(res.data);
        })} />
      </div>
    </Section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function TestimonialsSection({ course, slug, onSaved }: { course: AiCourse; slug: CourseSlug; onSaved: (c: AiCourse) => void }) {
  type Item = Omit<CourseTestimonial, 'id' | 'courseId'>;
  const { state, save } = useSave();
  const [items, setItems] = useState<Item[]>(
    course.testimonials.map(({ initials, name, meta, avatarGrad, quote, before, after, order }) =>
      ({ initials, name, meta, avatarGrad, quote, before, after, order })
    )
  );

  return (
    <Section title="9 · Testimonials">
      <div className="pt-4 flex flex-col gap-4">
        {items.map((item, i) => (
          <div key={i} className="glass-card rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
              <Field label="Initials" value={item.initials} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, initials: v } : x))} />
              <Field label="Name" value={item.name} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, name: v } : x))} />
              <Field label="Meta (Role/City)" value={item.meta} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, meta: v } : x))} />
              <Field label="Avatar Gradient CSS" value={item.avatarGrad} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, avatarGrad: v } : x))} />
            </div>
            <Field label="Quote" value={item.quote} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, quote: v } : x))} multiline />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Before (short)" value={item.before} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, before: v } : x))} />
              <Field label="After (short)" value={item.after} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, after: v } : x))} />
            </div>
            <button onClick={() => setItems((p) => p.filter((_, j) => j !== i).map((x, idx) => ({ ...x, order: idx })))} className="text-xs mt-2" style={{ color: '#ef4444' }}>
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={() => setItems((p) => [...p, { initials: '', name: '', meta: '', avatarGrad: 'linear-gradient(135deg,#00D4FF,#0099CC)', quote: '', before: '', after: '', order: p.length }])}
          className="btn-outline text-xs px-4 py-2 self-start"
        >
          + Add Testimonial
        </button>
      </div>
      <div className="mt-4">
        <SaveBtn state={state} onClick={() => save(async () => {
          const res = await adminUpdateTestimonials(slug, items);
          onSaved(res.data);
        })} />
      </div>
    </Section>
  );
}

// ─── Listing Page Tab ─────────────────────────────────────────────────────────

function ListingHeroSection({ page, onSaved }: { page: CoursesListingPage; onSaved: (p: CoursesListingPage) => void }) {
  const { state, save } = useSave();
  const [form, setForm] = useState({
    heroTag: page.heroTag,
    heroHeadingMain: page.heroHeadingMain,
    heroHeadingAccent: page.heroHeadingAccent,
    heroSubtitle: page.heroSubtitle,
  });
  const f = (key: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [key]: v }));

  return (
    <Section title="1 · Hero Section">
      <div className="pt-4 grid md:grid-cols-2 gap-x-6">
        <Field label="Tag Label (e.g. THE PROGRAMS)" value={form.heroTag} onChange={f('heroTag')} />
        <Field label="Heading -Plain Part (e.g. One Path.)" value={form.heroHeadingMain} onChange={f('heroHeadingMain')} />
        <Field label="Heading -Gradient Part (e.g. Three Levels.)" value={form.heroHeadingAccent} onChange={f('heroHeadingAccent')} />
        <Field label="Subtitle" value={form.heroSubtitle} onChange={f('heroSubtitle')} multiline />
      </div>
      <SaveBtn state={state} onClick={() => save(async () => {
        const res = await adminUpdateListingPage(form);
        onSaved(res.data);
      })} />
    </Section>
  );
}

function ListingWhoSection({ page, onSaved }: { page: CoursesListingPage; onSaved: (p: CoursesListingPage) => void }) {
  type Item = Omit<CoursesListingWhoCard, 'id' | 'pageId'>;
  const { state, save } = useSave();
  const [headingForm, setHeadingForm] = useState({
    whoTag: page.whoTag,
    whoHeadingMain: page.whoHeadingMain,
    whoHeadingAccent: page.whoHeadingAccent,
  });
  const [items, setItems] = useState<Item[]>(
    page.whoCards.map(({ emoji, title, desc, order }) => ({ emoji, title, desc, order }))
  );

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next.map((x, idx) => ({ ...x, order: idx })));
  };

  const handleSave = async () => {
    await adminUpdateListingPage(headingForm);
    const res = await adminUpdateListingWhoCards(items);
    onSaved(res.data);
  };

  return (
    <Section title="2 · Who Is This For">
      <div className="pt-4 grid md:grid-cols-3 gap-x-6 mb-4">
        <Field label="Section Tag" value={headingForm.whoTag} onChange={(v) => setHeadingForm((p) => ({ ...p, whoTag: v }))} />
        <Field label="Heading -Plain Part" value={headingForm.whoHeadingMain} onChange={(v) => setHeadingForm((p) => ({ ...p, whoHeadingMain: v }))} />
        <Field label="Heading -Gradient Part" value={headingForm.whoHeadingAccent} onChange={(v) => setHeadingForm((p) => ({ ...p, whoHeadingAccent: v }))} />
      </div>
      <div className="flex flex-col gap-3 mb-4">
        {items.map((item, i) => (
          <div key={i} className="glass-card rounded-lg p-4 flex gap-3">
            <div className="flex flex-col gap-1">
              <button onClick={() => move(i, -1)} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--border)', color: 'var(--muted)' }}>↑</button>
              <button onClick={() => move(i, 1)} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--border)', color: 'var(--muted)' }}>↓</button>
            </div>
            <div className="flex-1 grid md:grid-cols-3 gap-3">
              <Field label="Emoji" value={item.emoji} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, emoji: v } : x))} />
              <Field label="Title" value={item.title} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, title: v } : x))} />
              <Field label="Description" value={item.desc} onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, desc: v } : x))} multiline />
            </div>
            <button
              onClick={() => setItems((p) => p.filter((_, j) => j !== i).map((x, idx) => ({ ...x, order: idx })))}
              className="text-xs self-start" style={{ color: '#ef4444' }}
            >✕</button>
          </div>
        ))}
        <button
          onClick={() => setItems((p) => [...p, { emoji: '✅', title: '', desc: '', order: p.length }])}
          className="btn-outline text-xs px-4 py-2 self-start"
        >
          + Add Card
        </button>
      </div>
      <SaveBtn state={state} onClick={() => save(handleSave)} />
    </Section>
  );
}

function ListingCtaSection({ page, onSaved }: { page: CoursesListingPage; onSaved: (p: CoursesListingPage) => void }) {
  const { state, save } = useSave();
  const [form, setForm] = useState({
    ctaTag: page.ctaTag,
    ctaHeading: page.ctaHeading,
    ctaDesc: page.ctaDesc,
    ctaBtnPrimary: page.ctaBtnPrimary,
    ctaBtnSecondary: page.ctaBtnSecondary,
  });
  const f = (key: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [key]: v }));

  return (
    <Section title="3 · CTA Section">
      <div className="pt-4 grid md:grid-cols-2 gap-x-6">
        <Field label="Tag Label (e.g. GET STARTED)" value={form.ctaTag} onChange={f('ctaTag')} />
        <Field label="Heading" value={form.ctaHeading} onChange={f('ctaHeading')} />
        <Field label="Description" value={form.ctaDesc} onChange={f('ctaDesc')} multiline />
        <div />
        <Field label="Primary Button Text" value={form.ctaBtnPrimary} onChange={f('ctaBtnPrimary')} />
        <Field label="Secondary Button Text" value={form.ctaBtnSecondary} onChange={f('ctaBtnSecondary')} />
      </div>
      <SaveBtn state={state} onClick={() => save(async () => {
        const res = await adminUpdateListingPage(form);
        onSaved(res.data);
      })} />
    </Section>
  );
}

function ListingPageTab() {
  const [page, setPage] = useState<CoursesListingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminGetListingPage()
      .then((res) => setPage(res.data))
      .catch(() => setError('Failed to load listing page data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-32" style={{ color: 'var(--muted)' }}>
      Loading…
    </div>
  );
  if (error || !page) return (
    <div className="text-sm p-4" style={{ color: '#ef4444' }}>{error || 'Data not found.'}</div>
  );

  const save = (p: CoursesListingPage) => setPage(p);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="text-xs px-4 py-2.5 rounded-lg"
        style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--electric)' }}
      >
        Editing the <strong>/courses</strong> listing page -the page that shows all three programs together.
      </div>
      <ListingHeroSection page={page} onSaved={save} />
      <ListingWhoSection page={page} onSaved={save} />
      <ListingCtaSection page={page} onSaved={save} />
    </div>
  );
}

// ─── Course Tab ───────────────────────────────────────────────────────────────

function CourseTab({ slug }: { slug: CourseSlug }) {
  const [course, setCourse] = useState<AiCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    adminGetCourse(slug)
      .then((res) => setCourse(res.data))
      .catch(() => setError('Failed to load course data.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="flex items-center justify-center h-32" style={{ color: 'var(--muted)' }}>
      Loading…
    </div>
  );
  if (error || !course) return (
    <div className="text-sm p-4" style={{ color: '#ef4444' }}>{error || 'Course not found.'}</div>
  );

  const save = (c: AiCourse) => setCourse(c);

  return (
    <div className="flex flex-col gap-3">
      <HeroSection course={course} slug={slug} onSaved={save} />
      <WhoSection course={course} slug={slug} onSaved={save} />
      <ModulesSection course={course} slug={slug} onSaved={save} />
      <ToolsSection course={course} slug={slug} onSaved={save} />
      <OutcomesSection course={course} slug={slug} onSaved={save} />
      <BeforeAfterSection course={course} slug={slug} onSaved={save} />
      <EligibilitySection course={course} slug={slug} onSaved={save} />
      <FaqsSection course={course} slug={slug} onSaved={save} />
      <TestimonialsSection course={course} slug={slug} onSaved={save} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoursesAdmin() {
  const [activeTab, setActiveTab] = useState<TabId>('listing');

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
          Courses Management
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Edit content for all three course levels. Each section saves independently.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.slug}
            onClick={() => setActiveTab(tab.slug)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: activeTab === tab.slug ? `${tab.color}18` : 'rgba(255,255,255,0.04)',
              color: activeTab === tab.slug ? tab.color : 'var(--muted)',
              border: `1px solid ${activeTab === tab.slug ? `${tab.color}40` : 'var(--border)'}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'listing'
        ? <ListingPageTab key="listing" />
        : <CourseTab key={activeTab} slug={activeTab as CourseSlug} />
      }
    </div>
  );
}
