import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { DEFAULT_COURSE_DATA } from '@/data/coursePageData';
import { updateSetting } from '@/api/admin';
import { useSettingsStore } from '@/store/settingsStore';
import type {
  CoursePageData,
  CourseModule,
  CourseTool,
  AudienceCard,
  CourseOutcome,
  CourseTestimonial,
  CourseFAQ,
  CardHighlight,
} from '@/data/coursePageData';

// ─── Helpers ────────────────────────────────────────────────────────────────

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Card({ title, accent = '#00D4FF', children, onSave, saving, saved }: {
  title: string;
  accent?: string;
  children: React.ReactNode;
  onSave: () => void | Promise<void>;
  saving: boolean;
  saved: boolean;
}) {
  return (
    <div
      className="glass-card rounded-2xl overflow-hidden mb-6"
      style={{ borderTop: `2px solid ${accent}` }}
    >
      <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-bold text-base" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
          {title}
        </h2>
      </div>
      <div className="px-6 py-5 flex flex-col gap-4">{children}</div>
      <div className="px-6 pb-5">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="btn-primary px-6 py-2.5 text-sm"
        >
          {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className="w-10 h-5 rounded-full relative transition-colors"
        style={{ background: checked ? 'var(--electric)' : 'rgba(255,255,255,.12)', cursor: 'pointer' }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ left: checked ? '22px' : '2px', transition: 'left 0.2s ease' }}
        />
      </div>
      <span className="text-sm" style={{ color: 'var(--white)' }}>{label}</span>
    </label>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CourseSettings() {
  const storeData = useSettingsStore((state) => state.s.coursePageData);
  const [data, setData] = useState<CoursePageData>(storeData);
  const prevStoreRef = useRef(storeData);

  // Sync from store when it loads fresh data from API (first render after fetch)
  useEffect(() => {
    if (storeData !== prevStoreRef.current) {
      prevStoreRef.current = storeData;
      setData(storeData);
    }
  }, [storeData]);

  // Per-section save state
  const [heroSaving, setHeroSaving]     = useState(false); const [heroSaved, setHeroSaved]     = useState(false);
  const [visSaving, setVisSaving]       = useState(false); const [visSaved, setVisSaved]       = useState(false);
  const [audSaving, setAudSaving]       = useState(false); const [audSaved, setAudSaved]       = useState(false);
  const [currSaving, setCurrSaving]     = useState(false); const [currSaved, setCurrSaved]     = useState(false);
  const [toolSaving, setToolSaving]     = useState(false); const [toolSaved, setToolSaved]     = useState(false);
  const [outSaving, setOutSaving]       = useState(false); const [outSaved, setOutSaved]       = useState(false);
  const [baSaving, setBaSaving]         = useState(false); const [baSaved, setBaSaved]         = useState(false);
  const [testSaving, setTestSaving]     = useState(false); const [testSaved, setTestSaved]     = useState(false);
  const [faqSaving, setFaqSaving]       = useState(false); const [faqSaved, setFaqSaved]       = useState(false);
  const [ctaSaving, setCtaSaving]       = useState(false); const [ctaSaved, setCtaSaved]       = useState(false);

  // ── Generic field setter
  function set<K extends keyof CoursePageData>(key: K, value: CoursePageData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  // ── Persist helper — saves to Neon via API then refreshes store
  async function save(setSaving: (v: boolean) => void, setSaved: (v: boolean) => void) {
    setSaving(true);
    try {
      await updateSetting('course_page_data', JSON.stringify(data));
      await useSettingsStore.getState().fetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  // ── Reset to defaults
  async function resetAll() {
    if (!window.confirm('Reset ALL course page data to defaults? This cannot be undone.')) return;
    setData({ ...DEFAULT_COURSE_DATA });
    await updateSetting('course_page_data', JSON.stringify(DEFAULT_COURSE_DATA));
    await useSettingsStore.getState().fetch();
  }

  // ──────────────────────── Curriculum helpers ───────────────────────────

  function addModule() {
    const mod: CourseModule = { id: uid(), label: 'Module', title: 'New Module', topics: [] };
    set('modules', [...data.modules, mod]);
  }
  function deleteModule(id: string) {
    if (!window.confirm('Delete this module?')) return;
    set('modules', data.modules.filter((m) => m.id !== id));
  }
  function updateModule(id: string, patch: Partial<Omit<CourseModule, 'id'>>) {
    set('modules', data.modules.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  function moveModule(idx: number, dir: -1 | 1) {
    const arr = [...data.modules];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    set('modules', arr);
  }
  function addTopic(moduleId: string) {
    set('modules', data.modules.map((m) =>
      m.id === moduleId ? { ...m, topics: [...m.topics, 'New Topic'] } : m
    ));
  }
  function updateTopic(moduleId: string, ti: number, val: string) {
    set('modules', data.modules.map((m) =>
      m.id === moduleId ? { ...m, topics: m.topics.map((t, i) => (i === ti ? val : t)) } : m
    ));
  }
  function deleteTopic(moduleId: string, ti: number) {
    set('modules', data.modules.map((m) =>
      m.id === moduleId ? { ...m, topics: m.topics.filter((_, i) => i !== ti) } : m
    ));
  }

  // ──────────────────────── Audience helpers ─────────────────────────────

  function addAudience() {
    set('audience', [...data.audience, { id: uid(), emoji: '🎯', title: 'New Audience', description: 'Description here.' }]);
  }
  function deleteAudience(id: string) {
    if (!window.confirm('Delete this card?')) return;
    set('audience', data.audience.filter((a) => a.id !== id));
  }
  function updateAudience(id: string, patch: Partial<AudienceCard>) {
    set('audience', data.audience.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }
  function moveAudience(idx: number, dir: -1 | 1) {
    const arr = [...data.audience];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    set('audience', arr);
  }

  // ──────────────────────── Tools helpers ───────────────────────────────

  function addTool() {
    set('tools', [...data.tools, { id: uid(), emoji: '🔧', name: 'New Tool', category: 'Category' }]);
  }
  function deleteTool(id: string) {
    if (!window.confirm('Delete this tool?')) return;
    set('tools', data.tools.filter((t) => t.id !== id));
  }
  function updateTool(id: string, patch: Partial<CourseTool>) {
    set('tools', data.tools.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }
  function moveTool(idx: number, dir: -1 | 1) {
    const arr = [...data.tools];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    set('tools', arr);
  }

  // ──────────────────────── Outcomes helpers ────────────────────────────

  function addOutcome() {
    set('outcomes', [...data.outcomes, { id: uid(), title: 'New Outcome', description: 'Description.' }]);
  }
  function deleteOutcome(id: string) {
    if (!window.confirm('Delete this outcome?')) return;
    set('outcomes', data.outcomes.filter((o) => o.id !== id));
  }
  function updateOutcome(id: string, patch: Partial<CourseOutcome>) {
    set('outcomes', data.outcomes.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }
  function moveOutcome(idx: number, dir: -1 | 1) {
    const arr = [...data.outcomes];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    set('outcomes', arr);
  }

  // ──────────────────────── Testimonials helpers ────────────────────────

  function addTestimonial() {
    set('testimonials', [...data.testimonials, { id: uid(), initials: 'AB', avatarColor: 'linear-gradient(135deg,#00D4FF,#0077aa)', name: 'Student Name', meta: 'Background', quote: 'Quote here.', before: 'Before', after: 'After' }]);
  }
  function deleteTestimonial(id: string) {
    if (!window.confirm('Delete this testimonial?')) return;
    set('testimonials', data.testimonials.filter((t) => t.id !== id));
  }
  function updateTestimonial(id: string, patch: Partial<CourseTestimonial>) {
    set('testimonials', data.testimonials.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  // ──────────────────────── FAQ helpers ─────────────────────────────────

  function addFaq() {
    set('faqs', [...data.faqs, { id: uid(), question: 'New Question?', answer: 'Answer here.' }]);
  }
  function deleteFaq(id: string) {
    if (!window.confirm('Delete this FAQ?')) return;
    set('faqs', data.faqs.filter((f) => f.id !== id));
  }
  function updateFaq(id: string, patch: Partial<CourseFAQ>) {
    set('faqs', data.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }
  function moveFaq(idx: number, dir: -1 | 1) {
    const arr = [...data.faqs];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    set('faqs', arr);
  }

  // ──────────────────────── Card Highlights helpers ─────────────────────

  function updateHighlight(id: string, patch: Partial<CardHighlight>) {
    set('cardHighlights', data.cardHighlights.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }
  function addHighlight() {
    set('cardHighlights', [...data.cardHighlights, { id: uid(), label: 'Label', value: 'Value', highlighted: false }]);
  }
  function deleteHighlight(id: string) {
    if (!window.confirm('Delete this highlight row?')) return;
    set('cardHighlights', data.cardHighlights.filter((h) => h.id !== id));
  }

  // ─── Quick Stats helpers ──────────────────────────────────────────────

  function updateStat(idx: number, val: string) {
    const arr = [...data.quickStats];
    arr[idx] = val;
    set('quickStats', arr);
  }
  function deleteStat(idx: number) {
    set('quickStats', data.quickStats.filter((_, i) => i !== idx));
  }
  function addStat() {
    set('quickStats', [...data.quickStats, '⭐ New Stat']);
  }

  // ─── Before/After helpers ─────────────────────────────────────────────

  function updateBefore(idx: number, val: string) {
    const arr = [...data.beforeItems]; arr[idx] = val; set('beforeItems', arr);
  }
  function deleteBefore(idx: number) { set('beforeItems', data.beforeItems.filter((_, i) => i !== idx)); }
  function addBefore() { set('beforeItems', [...data.beforeItems, 'New before item']); }

  function updateAfter(idx: number, val: string) {
    const arr = [...data.afterItems]; arr[idx] = val; set('afterItems', arr);
  }
  function deleteAfter(idx: number) { set('afterItems', data.afterItems.filter((_, i) => i !== idx)); }
  function addAfter() { set('afterItems', [...data.afterItems, 'New after item']); }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: 'var(--navy)' }}>
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
              📚 Courses Page
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              All changes save to browser storage and appear instantly on the courses page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/courses"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-4 py-2 text-sm"
            >
              Preview /courses ↗
            </a>
            <button type="button" onClick={resetAll} className="px-4 py-2 rounded-full text-xs font-semibold" style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171' }}>
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* ── Hero / Badge ─────────────────────────────────────────────── */}
        <Card
          title="Hero Section"
          accent="#00D4FF"
          onSave={() => save(setHeroSaving, setHeroSaved)}
          saving={heroSaving}
          saved={heroSaved}
        >
          <Field label="Badge Text"><input value={data.badge} onChange={(e) => set('badge', e.target.value)} /></Field>
          <Field label="Main Title"><input value={data.title} onChange={(e) => set('title', e.target.value)} /></Field>
          <Field label="Tagline / Subtitle"><textarea rows={2} value={data.tagline} onChange={(e) => set('tagline', e.target.value)} /></Field>
          <Field label="CTA Button 1 Text"><input value={data.cta1Text} onChange={(e) => set('cta1Text', e.target.value)} /></Field>
          <Field label="CTA Button 2 Text"><input value={data.cta2Text} onChange={(e) => set('cta2Text', e.target.value)} /></Field>

          {/* Quick Stats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Quick Stats Badges</span>
              <button type="button" onClick={addStat} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0,212,255,.1)', color: 'var(--electric)', border: '1px solid rgba(0,212,255,.2)' }}>+ Add Stat</button>
            </div>
            {data.quickStats.map((stat, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={stat} onChange={(e) => updateStat(i, e.target.value)} className="flex-1" />
                <button type="button" onClick={() => deleteStat(i)} className="px-3 py-1 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,.1)', color: '#f87171', border: '1px solid rgba(239,68,68,.2)' }}>✕</button>
              </div>
            ))}
          </div>

          {/* Card Highlights */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Sticky Card Highlights</span>
              <button type="button" onClick={addHighlight} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0,212,255,.1)', color: 'var(--electric)', border: '1px solid rgba(0,212,255,.2)' }}>+ Add Row</button>
            </div>
            {data.cardHighlights.map((h) => (
              <div key={h.id} className="flex gap-2 mb-2 items-center flex-wrap">
                <input value={h.label} onChange={(e) => updateHighlight(h.id, { label: e.target.value })} placeholder="Label" style={{ flex: '1 1 100px' }} />
                <input value={h.value} onChange={(e) => updateHighlight(h.id, { value: e.target.value })} placeholder="Value" style={{ flex: '1 1 120px' }} />
                <label className="flex items-center gap-1.5 text-xs whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                  <input type="checkbox" checked={h.highlighted} onChange={(e) => updateHighlight(h.id, { highlighted: e.target.checked })} style={{ width: 'auto', minHeight: 'auto' }} />
                  Highlight
                </label>
                <button type="button" onClick={() => deleteHighlight(h.id)} className="px-3 py-1 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,.1)', color: '#f87171', border: '1px solid rgba(239,68,68,.2)' }}>✕</button>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Visibility Toggles ─────────────────────────────────────────── */}
        <Card
          title="Section Visibility"
          accent="#f59e0b"
          onSave={() => save(setVisSaving, setVisSaved)}
          saving={visSaving}
          saved={visSaved}
        >
          <Toggle label="Who Should Join" checked={data.showAudience} onChange={(v) => set('showAudience', v)} />
          <Toggle label="Curriculum Accordion" checked={data.showCurriculum} onChange={(v) => set('showCurriculum', v)} />
          <Toggle label="AI Tools Grid" checked={data.showTools} onChange={(v) => set('showTools', v)} />
          <Toggle label="Outcomes Section" checked={data.showOutcomes} onChange={(v) => set('showOutcomes', v)} />
          <Toggle label="Before / After Comparison" checked={data.showBeforeAfter} onChange={(v) => set('showBeforeAfter', v)} />
          <Toggle label="Testimonials" checked={data.showTestimonials} onChange={(v) => set('showTestimonials', v)} />
          <Toggle label="FAQ Section" checked={data.showFaq} onChange={(v) => set('showFaq', v)} />
          <Toggle label="Related Courses" checked={data.showRelated} onChange={(v) => set('showRelated', v)} />
        </Card>

        {/* ── Who Should Join ─────────────────────────────────────────────── */}
        <Card
          title="Who Should Join — Audience Cards"
          accent="#10b981"
          onSave={() => save(setAudSaving, setAudSaved)}
          saving={audSaving}
          saved={audSaved}
        >
          <Field label="Section Title"><input value={data.audienceTitle} onChange={(e) => set('audienceTitle', e.target.value)} /></Field>
          <Field label="Section Subtext"><textarea rows={2} value={data.audienceSubtext} onChange={(e) => set('audienceSubtext', e.target.value)} /></Field>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Audience Cards</span>
            <button type="button" onClick={addAudience} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(16,185,129,.1)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)' }}>+ Add Card</button>
          </div>

          {data.audience.map((card, idx) => (
            <div key={card.id} className="glass-card p-4 rounded-xl" style={{ borderColor: 'rgba(16,185,129,.15)' }}>
              <div className="flex gap-2 mb-3 items-center">
                <input value={card.emoji} onChange={(e) => updateAudience(card.id, { emoji: e.target.value })} style={{ width: '70px' }} placeholder="Emoji" />
                <input value={card.title} onChange={(e) => updateAudience(card.id, { title: e.target.value })} className="flex-1" placeholder="Title" />
                <button type="button" onClick={() => moveAudience(idx, -1)} disabled={idx === 0} className="px-2 py-1 rounded text-xs" style={{ background: 'var(--card)', color: 'var(--muted)' }}>↑</button>
                <button type="button" onClick={() => moveAudience(idx, 1)} disabled={idx === data.audience.length - 1} className="px-2 py-1 rounded text-xs" style={{ background: 'var(--card)', color: 'var(--muted)' }}>↓</button>
                <button type="button" onClick={() => deleteAudience(card.id)} className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(239,68,68,.1)', color: '#f87171' }}>✕</button>
              </div>
              <textarea rows={2} value={card.description} onChange={(e) => updateAudience(card.id, { description: e.target.value })} placeholder="Description" />
            </div>
          ))}
        </Card>

        {/* ── Curriculum ──────────────────────────────────────────────────── */}
        <Card
          title="Curriculum — Modules & Topics"
          accent="#8b5cf6"
          onSave={() => save(setCurrSaving, setCurrSaved)}
          saving={currSaving}
          saved={currSaved}
        >
          <Field label="Section Title"><input value={data.curriculumTitle} onChange={(e) => set('curriculumTitle', e.target.value)} /></Field>
          <Field label="Section Subtext"><textarea rows={2} value={data.curriculumSubtext} onChange={(e) => set('curriculumSubtext', e.target.value)} /></Field>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Modules</span>
            <button type="button" onClick={addModule} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(139,92,246,.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,.2)' }}>+ Add Module</button>
          </div>

          {data.modules.map((mod, idx) => (
            <div key={mod.id} className="glass-card p-4 rounded-xl" style={{ borderColor: 'rgba(139,92,246,.15)' }}>
              <div className="flex gap-2 mb-3 items-center">
                <input value={mod.label} onChange={(e) => updateModule(mod.id, { label: e.target.value })} style={{ width: '90px' }} placeholder="Label" />
                <input value={mod.title} onChange={(e) => updateModule(mod.id, { title: e.target.value })} className="flex-1" placeholder="Module Title" />
                <button type="button" onClick={() => moveModule(idx, -1)} disabled={idx === 0} className="px-2 py-1 rounded text-xs" style={{ background: 'var(--card)', color: 'var(--muted)' }}>↑</button>
                <button type="button" onClick={() => moveModule(idx, 1)} disabled={idx === data.modules.length - 1} className="px-2 py-1 rounded text-xs" style={{ background: 'var(--card)', color: 'var(--muted)' }}>↓</button>
                <button type="button" onClick={() => deleteModule(mod.id)} className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(239,68,68,.1)', color: '#f87171' }}>✕</button>
              </div>

              {/* Topics */}
              <div className="ml-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Topics</span>
                  <button type="button" onClick={() => addTopic(mod.id)} className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(139,92,246,.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,.2)' }}>+ Topic</button>
                </div>
                {mod.topics.map((topic, ti) => (
                  <div key={ti} className="flex gap-2 mb-1.5">
                    <input value={topic} onChange={(e) => updateTopic(mod.id, ti, e.target.value)} className="flex-1 text-xs" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} />
                    <button type="button" onClick={() => deleteTopic(mod.id, ti)} className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(239,68,68,.08)', color: '#f87171' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>

        {/* ── AI Tools ────────────────────────────────────────────────────── */}
        <Card
          title="AI Tools Grid"
          accent="#00D4FF"
          onSave={() => save(setToolSaving, setToolSaved)}
          saving={toolSaving}
          saved={toolSaved}
        >
          <Field label="Section Title"><input value={data.toolsTitle} onChange={(e) => set('toolsTitle', e.target.value)} /></Field>
          <Field label="Section Subtext"><textarea rows={2} value={data.toolsSubtext} onChange={(e) => set('toolsSubtext', e.target.value)} /></Field>
          <Field label="Footer Note (e.g. '+ many more tools')"><input value={data.toolsMoreText} onChange={(e) => set('toolsMoreText', e.target.value)} /></Field>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Tools</span>
            <button type="button" onClick={addTool} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0,212,255,.1)', color: 'var(--electric)', border: '1px solid rgba(0,212,255,.2)' }}>+ Add Tool</button>
          </div>

          {data.tools.map((tool, idx) => (
            <div key={tool.id} className="flex gap-2 items-center">
              <input value={tool.emoji} onChange={(e) => updateTool(tool.id, { emoji: e.target.value })} style={{ width: '60px' }} />
              <input value={tool.name} onChange={(e) => updateTool(tool.id, { name: e.target.value })} style={{ flex: '1 1 120px' }} placeholder="Name" />
              <input value={tool.category} onChange={(e) => updateTool(tool.id, { category: e.target.value })} style={{ flex: '1 1 130px' }} placeholder="Category" />
              <button type="button" onClick={() => moveTool(idx, -1)} disabled={idx === 0} className="px-2 py-1 rounded text-xs" style={{ background: 'var(--card)', color: 'var(--muted)' }}>↑</button>
              <button type="button" onClick={() => moveTool(idx, 1)} disabled={idx === data.tools.length - 1} className="px-2 py-1 rounded text-xs" style={{ background: 'var(--card)', color: 'var(--muted)' }}>↓</button>
              <button type="button" onClick={() => deleteTool(tool.id)} className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(239,68,68,.1)', color: '#f87171' }}>✕</button>
            </div>
          ))}
        </Card>

        {/* ── Outcomes ────────────────────────────────────────────────────── */}
        <Card
          title="Outcomes — What You Will Be Able to Do"
          accent="#f59e0b"
          onSave={() => save(setOutSaving, setOutSaved)}
          saving={outSaving}
          saved={outSaved}
        >
          <Field label="Section Title"><input value={data.outcomesTitle} onChange={(e) => set('outcomesTitle', e.target.value)} /></Field>
          <Field label="Section Subtext"><textarea rows={2} value={data.outcomesSubtext} onChange={(e) => set('outcomesSubtext', e.target.value)} /></Field>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Outcome Items</span>
            <button type="button" onClick={addOutcome} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(245,158,11,.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,.2)' }}>+ Add Outcome</button>
          </div>

          {data.outcomes.map((out, idx) => (
            <div key={out.id} className="glass-card p-4 rounded-xl">
              <div className="flex gap-2 items-center mb-2">
                <input value={out.title} onChange={(e) => updateOutcome(out.id, { title: e.target.value })} className="flex-1" placeholder="Outcome title" />
                <button type="button" onClick={() => moveOutcome(idx, -1)} disabled={idx === 0} className="px-2 py-1 rounded text-xs" style={{ background: 'var(--card)', color: 'var(--muted)' }}>↑</button>
                <button type="button" onClick={() => moveOutcome(idx, 1)} disabled={idx === data.outcomes.length - 1} className="px-2 py-1 rounded text-xs" style={{ background: 'var(--card)', color: 'var(--muted)' }}>↓</button>
                <button type="button" onClick={() => deleteOutcome(out.id)} className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(239,68,68,.1)', color: '#f87171' }}>✕</button>
              </div>
              <textarea rows={2} value={out.description} onChange={(e) => updateOutcome(out.id, { description: e.target.value })} placeholder="Description" />
            </div>
          ))}
        </Card>

        {/* ── Before / After ───────────────────────────────────────────────── */}
        <Card
          title="Before / After Comparison"
          accent="#34d399"
          onSave={() => save(setBaSaving, setBaSaved)}
          saving={baSaving}
          saved={baSaved}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Field label="Before Column Label">
                <input value={data.beforeLabel} onChange={(e) => set('beforeLabel', e.target.value)} />
              </Field>
              <div className="mt-3 flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Before Items</span>
                <button type="button" onClick={addBefore} className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(239,68,68,.08)', color: '#f87171' }}>+ Add</button>
              </div>
              {data.beforeItems.map((item, i) => (
                <div key={i} className="flex gap-1.5 mb-1.5">
                  <input value={item} onChange={(e) => updateBefore(i, e.target.value)} className="flex-1" />
                  <button type="button" onClick={() => deleteBefore(i)} className="px-2 rounded text-xs" style={{ color: '#f87171' }}>✕</button>
                </div>
              ))}
            </div>
            <div>
              <Field label="After Column Label">
                <input value={data.afterLabel} onChange={(e) => set('afterLabel', e.target.value)} />
              </Field>
              <div className="mt-3 flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>After Items</span>
                <button type="button" onClick={addAfter} className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(52,211,153,.08)', color: '#34d399' }}>+ Add</button>
              </div>
              {data.afterItems.map((item, i) => (
                <div key={i} className="flex gap-1.5 mb-1.5">
                  <input value={item} onChange={(e) => updateAfter(i, e.target.value)} className="flex-1" />
                  <button type="button" onClick={() => deleteAfter(i)} className="px-2 rounded text-xs" style={{ color: '#f87171' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Testimonials ─────────────────────────────────────────────────── */}
        <Card
          title="Testimonials — Student Stories"
          accent="#ec4899"
          onSave={() => save(setTestSaving, setTestSaved)}
          saving={testSaving}
          saved={testSaved}
        >
          <Field label="Section Title"><input value={data.testimonialsTitle} onChange={(e) => set('testimonialsTitle', e.target.value)} /></Field>
          <Field label="Section Subtext"><textarea rows={2} value={data.testimonialsSubtext} onChange={(e) => set('testimonialsSubtext', e.target.value)} /></Field>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Testimonials</span>
            <button type="button" onClick={addTestimonial} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(236,72,153,.1)', color: '#ec4899', border: '1px solid rgba(236,72,153,.2)' }}>+ Add</button>
          </div>

          {data.testimonials.map((t) => (
            <div key={t.id} className="glass-card p-4 rounded-xl" style={{ borderColor: 'rgba(236,72,153,.15)' }}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="Initials"><input value={t.initials} onChange={(e) => updateTestimonial(t.id, { initials: e.target.value })} /></Field>
                <Field label="Avatar Color (gradient CSS)"><input value={t.avatarColor} onChange={(e) => updateTestimonial(t.id, { avatarColor: e.target.value })} /></Field>
                <Field label="Name"><input value={t.name} onChange={(e) => updateTestimonial(t.id, { name: e.target.value })} /></Field>
                <Field label="Meta (role, city)"><input value={t.meta} onChange={(e) => updateTestimonial(t.id, { meta: e.target.value })} /></Field>
                <Field label="Before"><input value={t.before} onChange={(e) => updateTestimonial(t.id, { before: e.target.value })} /></Field>
                <Field label="After"><input value={t.after} onChange={(e) => updateTestimonial(t.id, { after: e.target.value })} /></Field>
              </div>
              <Field label="Quote">
                <textarea rows={3} value={t.quote} onChange={(e) => updateTestimonial(t.id, { quote: e.target.value })} />
              </Field>
              <button type="button" onClick={() => deleteTestimonial(t.id)} className="mt-2 text-xs px-3 py-1 rounded" style={{ background: 'rgba(239,68,68,.1)', color: '#f87171', border: '1px solid rgba(239,68,68,.2)' }}>Delete Testimonial</button>
            </div>
          ))}
        </Card>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <Card
          title="FAQ Section"
          accent="#a78bfa"
          onSave={() => save(setFaqSaving, setFaqSaved)}
          saving={faqSaving}
          saved={faqSaved}
        >
          <Field label="Section Title"><input value={data.faqTitle} onChange={(e) => set('faqTitle', e.target.value)} /></Field>
          <Field label="Section Subtext"><textarea rows={2} value={data.faqSubtext} onChange={(e) => set('faqSubtext', e.target.value)} /></Field>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>FAQ Items</span>
            <button type="button" onClick={addFaq} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(167,139,250,.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,.2)' }}>+ Add FAQ</button>
          </div>

          {data.faqs.map((faq, idx) => (
            <div key={faq.id} className="glass-card p-4 rounded-xl" style={{ borderColor: 'rgba(167,139,250,.15)' }}>
              <div className="flex gap-2 items-start mb-2">
                <div className="flex-1">
                  <Field label="Question"><input value={faq.question} onChange={(e) => updateFaq(faq.id, { question: e.target.value })} /></Field>
                </div>
                <div className="flex flex-col gap-1 pt-5">
                  <button type="button" onClick={() => moveFaq(idx, -1)} disabled={idx === 0} className="px-2 py-1 rounded text-xs" style={{ background: 'var(--card)', color: 'var(--muted)' }}>↑</button>
                  <button type="button" onClick={() => moveFaq(idx, 1)} disabled={idx === data.faqs.length - 1} className="px-2 py-1 rounded text-xs" style={{ background: 'var(--card)', color: 'var(--muted)' }}>↓</button>
                  <button type="button" onClick={() => deleteFaq(faq.id)} className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(239,68,68,.1)', color: '#f87171' }}>✕</button>
                </div>
              </div>
              <Field label="Answer"><textarea rows={3} value={faq.answer} onChange={(e) => updateFaq(faq.id, { answer: e.target.value })} /></Field>
            </div>
          ))}
        </Card>

        {/* ── Final CTA ────────────────────────────────────────────────────── */}
        <Card
          title="Final CTA Section"
          accent="#FF6B2B"
          onSave={() => save(setCtaSaving, setCtaSaved)}
          saving={ctaSaving}
          saved={ctaSaved}
        >
          <Field label="Headline (use \\n for line break)"><textarea rows={2} value={data.finalCtaTitle} onChange={(e) => set('finalCtaTitle', e.target.value)} /></Field>
          <Field label="Body Text"><textarea rows={2} value={data.finalCtaBody} onChange={(e) => set('finalCtaBody', e.target.value)} /></Field>
          <Field label="Footer Note (below CTA buttons)"><input value={data.finalCtaNote} onChange={(e) => set('finalCtaNote', e.target.value)} /></Field>
        </Card>

        {/* ── Nav links ─────────────────────────────────────────────────── */}
        <div className="flex gap-3 mt-4">
          <NavLink to="/admin/dashboard" className="btn-outline px-5 py-2 text-sm">← Dashboard</NavLink>
          <NavLink to="/admin/settings" className="btn-outline px-5 py-2 text-sm">Site Settings</NavLink>
        </div>

      </div>
    </div>
  );
}
