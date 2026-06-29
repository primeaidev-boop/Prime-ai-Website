import { useState, useEffect } from 'react';
import { getTutorialData, putTutorialData } from '@/api/tutorials';
import {
  loadTutorialData,
  saveTutorialData,
  generateId,
  slugify,
  DEFAULT_TUTORIAL_DATA,
} from '@/data/tutorialData';
import { loadAnalytics } from '@/data/analyticsData';
import { loadUserProgress } from '@/data/userProgress';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import type {
  TutorialPageData,
  TutorialCategory,
  Tutorial,
  TutorialDifficulty,
  TutorialHeroStat,
  Chapter,
  Lesson,
  ContentBlock,
  UnlockRule,
  PromptTool,
  CalloutVariant,
  QuizBlockType,
} from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

type AdminTab = 'tutorials' | 'categories' | 'content' | 'lessons' | 'analytics';
type SaveState = 'idle' | 'saved' | 'error';

const EMPTY_CATEGORY: TutorialCategory = {
  id: '', name: '', slug: '', color: '#00D4FF', order: 1, isVisible: true,
};

const EMPTY_TUTORIAL: Tutorial = {
  id: '', categorySlug: '', name: '', slug: '', thumbnailUrl: '', logoColor: '#00D4FF', logoInitials: 'AI',
  description: '', tags: [], difficulty: 'Beginner', isPremium: false, lessonCount: 10,
  isFeatured: false, isVisible: true, order: 1, ctaEnrollLink: '/courses', ctaDownloadLink: '/contact',
  hasCertificate: false,
};

const EMPTY_LESSON: Lesson = {
  id: '', title: '', slug: '', lessonNumber: 1, isFree: true, readTime: 5,
  difficulty: 'Beginner', toolName: '', intro: '', blocks: [],
  visible: true, locked: false, unlockRule: 'sequential',
};

const BLOCK_TYPES: { value: ContentBlock['type']; label: string }[] = [
  { value: 'richText',   label: '✍️ Rich Text' },   // first = default; inline TipTap editing
  { value: 'heading',     label: '📝 Heading' },
  { value: 'paragraph',  label: '📄 Paragraph' },
  { value: 'image',      label: '🖼 Image' },
  { value: 'video',      label: '🎬 Video' },
  { value: 'highlightBox', label: '💡 Highlight Box' },
  { value: 'prompt',     label: '⌨ Prompt Block' },
  { value: 'table',      label: '📊 Table' },
  { value: 'code',       label: '💻 Code Block' },
  { value: 'callout',    label: '📣 Callout' },
  { value: 'comparison', label: '↔ Comparison' },
  { value: 'checklist',  label: '✓ Checklist' },
  { value: 'download',   label: '⬇ Download' },
  { value: 'quiz',       label: '❓ Quiz' },
  { value: 'faq',        label: '💬 FAQ' },
  { value: 'aiToolCard', label: '🤖 AI Tool Card' },
  { value: 'divider',    label: '── Divider' },
];

function createDefaultBlock(type: ContentBlock['type']): ContentBlock {
  const id = generateId();
  switch (type) {
    case 'richText':    return { id, type, html: '' };
    case 'heading':     return { id, type, level: 2, text: '' };
    case 'paragraph':   return { id, type, html: '' };
    case 'image':       return { id, type, src: '', alt: '' };
    case 'video':       return { id, type, url: '' };
    case 'highlightBox': return { id, type, icon: '💡', title: '', content: '' };
    case 'prompt':      return { id, type, label: '', promptText: '', tryInTool: 'chatgpt' };
    case 'table':       return { id, type, headers: ['Column 1', 'Column 2'], rows: [['', '']] };
    case 'code':        return { id, type, language: 'javascript', code: '' };
    case 'callout':     return { id, type, variant: 'info', content: '' };
    case 'comparison':  return { id, type, leftTitle: 'Before', rightTitle: 'After', leftItems: [], rightItems: [] };
    case 'checklist':   return { id, type, items: [] };
    case 'download':    return { id, type, label: '', href: '' };
    case 'quiz':        return { id, type, question: '', options: [{ id: generateId(), text: '' }, { id: generateId(), text: '' }], correctIndex: 0 };
    case 'faq':         return { id, type, items: [] };
    case 'aiToolCard':  return { id, type, toolName: '', logoColor: '#00D4FF', logoInitials: 'AI', description: '' };
    case 'divider':     return { id, type };
  }
}

// ── Save button ───────────────────────────────────────────────────────────────

function SaveBtn({ state, onClick }: { state: SaveState; onClick: () => void }) {
  const labels = { idle: 'Save Changes', saved: '✓ Saved!', error: '✕ Error' };
  const colors = {
    idle: { background: 'linear-gradient(135deg, var(--orange), var(--orange2))', color: 'white' },
    saved: { background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' },
    error: { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
  };
  return (
    <button onClick={onClick} disabled={state !== 'idle'} className="px-5 py-2 rounded-full text-sm font-bold transition-all" style={colors[state]}>
      {labels[state]}
    </button>
  );
}

// ── Category Modal ────────────────────────────────────────────────────────────

function CategoryModal({ isOpen, isNew, form, onChange, onSave, onClose }: {
  isOpen: boolean; isNew: boolean; form: TutorialCategory;
  onChange: (f: TutorialCategory) => void; onSave: () => void; onClose: () => void;
}) {
  if (!isOpen) return null;
  const set = (field: keyof TutorialCategory, value: string | number | boolean) => onChange({ ...form, [field]: value });
  const handleNameChange = (name: string) => onChange({ ...form, name, slug: isNew ? slugify(name) : form.slug });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-md z-10" style={{ border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
          {isNew ? 'Add Category' : 'Edit Category'}
        </h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Name</label>
            <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. AI Assistants" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Slug</label>
            <input type="text" value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} placeholder="e.g. ai-assistants" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Accent Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.color} onChange={(e) => set('color', e.target.value)} className="h-10 w-14 rounded-lg cursor-pointer" style={{ background: 'none', border: '1px solid var(--border)', padding: '2px' }} />
                <input type="text" value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="#00D4FF" className="flex-1" />
              </div>
            </div>
            <div className="w-24">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Order</label>
              <input type="number" value={form.order} min={1} onChange={(e) => set('order', Number(e.target.value))} />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isVisible} onChange={(e) => set('isVisible', e.target.checked)} className="w-auto" style={{ width: 18, height: 18, minHeight: 18 }} />
            <span className="text-sm" style={{ color: 'var(--white)' }}>Visible on listing page</span>
          </label>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-outline px-5 py-2 text-sm">Cancel</button>
          <button onClick={onSave} disabled={!form.name || !form.slug} className="btn-primary px-5 py-2 text-sm">
            {isNew ? 'Add Category' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tutorial Modal ────────────────────────────────────────────────────────────

function TutorialModal({ isOpen, isNew, form, categories, onChange, onSave, onClose }: {
  isOpen: boolean; isNew: boolean; form: Tutorial; categories: TutorialCategory[];
  onChange: (f: Tutorial) => void; onSave: () => void; onClose: () => void;
}) {
  if (!isOpen) return null;
  const set = <K extends keyof Tutorial>(field: K, value: Tutorial[K]) => onChange({ ...form, [field]: value });
  const handleNameChange = (name: string) => onChange({ ...form, name, slug: isNew ? slugify(name) : form.slug });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-2xl z-10 max-h-[90vh] overflow-y-auto" style={{ border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
          {isNew ? 'Add Tutorial' : 'Edit Tutorial'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Tool Name *</label>
            <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. ChatGPT" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Slug</label>
            <input type="text" value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} placeholder="e.g. chatgpt" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Category</label>
            <select value={form.categorySlug} onChange={(e) => set('categorySlug', e.target.value)}>
              <option value="">- Select category -</option>
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Difficulty</label>
            <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value as TutorialDifficulty)}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>
              Logo / Thumbnail Image URL
              <span className="ml-2 font-normal" style={{ color: 'rgba(138,155,192,0.7)' }}>(overrides color badge below)</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                value={form.thumbnailUrl ?? ''}
                onChange={(e) => set('thumbnailUrl', e.target.value)}
                placeholder="https://example.com/chatgpt-logo.png"
                className="flex-1"
              />
              {form.thumbnailUrl ? (
                <img
                  src={form.thumbnailUrl}
                  alt="preview"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'block'; }}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                  style={{ border: '1px solid var(--border)', display: 'none' }}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: form.logoColor, border: '1px solid var(--border)' }}
                >
                  {form.logoInitials}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Badge Color <span className="font-normal" style={{ color: 'rgba(138,155,192,0.7)' }}>(fallback)</span></label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.logoColor} onChange={(e) => set('logoColor', e.target.value)} className="h-10 w-12 rounded-lg cursor-pointer" style={{ background: 'none', border: '1px solid var(--border)', padding: '2px' }} />
                <input type="text" value={form.logoColor} onChange={(e) => set('logoColor', e.target.value)} placeholder="#10a37f" className="flex-1" />
              </div>
            </div>
            <div className="w-24">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Initials <span className="font-normal" style={{ color: 'rgba(138,155,192,0.7)' }}>(fallback)</span></label>
              <input type="text" value={form.logoInitials} onChange={(e) => set('logoInitials', e.target.value.slice(0, 4).toUpperCase())} placeholder="GPT" maxLength={4} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Lesson Count</label>
            <input type="number" value={form.lessonCount} min={1} onChange={(e) => set('lessonCount', Number(e.target.value))} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Description</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} placeholder="Short description of this AI tool" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Tags (comma-separated)</label>
            <input type="text" value={form.tags.join(', ')} onChange={(e) => set('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} placeholder="Writing, Coding, Analysis" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Enroll CTA Link</label>
            <input type="text" value={form.ctaEnrollLink} onChange={(e) => set('ctaEnrollLink', e.target.value)} placeholder="/courses" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Download CTA Link</label>
            <input type="text" value={form.ctaDownloadLink} onChange={(e) => set('ctaDownloadLink', e.target.value)} placeholder="/contact" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Display Order</label>
            <input type="number" value={form.order} min={1} onChange={(e) => set('order', Number(e.target.value))} />
          </div>
        </div>
        <div className="flex flex-wrap gap-6 mt-5">
          {([
            { field: 'isPremium', label: 'Premium (paid)' },
            { field: 'isFeatured', label: 'Featured (top card)' },
            { field: 'isVisible', label: 'Visible on site' },
            { field: 'hasCertificate', label: 'Offers Certificate' },
          ] as { field: 'isPremium' | 'isFeatured' | 'isVisible' | 'hasCertificate'; label: string }[]).map(({ field, label }) => (
            <label key={field} className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={!!form[field]} onChange={(e) => set(field, e.target.checked)} className="w-auto" style={{ width: 18, height: 18, minHeight: 18 }} />
              <span className="text-sm" style={{ color: 'var(--white)' }}>{label}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-outline px-5 py-2 text-sm">Cancel</button>
          <button onClick={onSave} disabled={!form.name || !form.slug} className="btn-primary px-5 py-2 text-sm">
            {isNew ? 'Add Tutorial' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Categories Tab ────────────────────────────────────────────────────────────

function CategoriesTab({ data, onUpdate }: { data: TutorialPageData; onUpdate: (d: TutorialPageData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<TutorialCategory>(EMPTY_CATEGORY);
  const sorted = [...data.categories].sort((a, b) => a.order - b.order);

  const openAdd = () => { setIsNew(true); setForm({ ...EMPTY_CATEGORY, order: data.categories.length + 1 }); setShowModal(true); };
  const openEdit = (cat: TutorialCategory) => { setIsNew(false); setForm({ ...cat }); setShowModal(true); };
  const handleSave = () => {
    if (!form.name || !form.slug) return;
    onUpdate(isNew
      ? { ...data, categories: [...data.categories, { ...form, id: generateId() }] }
      : { ...data, categories: data.categories.map((c) => (c.id === form.id ? form : c)) });
    setShowModal(false);
  };
  const handleDelete = (id: string) => {
    const cat = data.categories.find((c) => c.id === id);
    const inUse = data.tutorials.filter((t) => t.categorySlug === cat?.slug).length;
    const msg = inUse ? `Delete "${cat?.name}"? It has ${inUse} tutorial(s) that will become uncategorized.` : `Delete "${cat?.name}"?`;
    if (!confirm(msg)) return;
    onUpdate({ ...data, categories: data.categories.filter((c) => c.id !== id) });
  };
  const toggleVisible = (id: string) =>
    onUpdate({ ...data, categories: data.categories.map((c) => c.id === id ? { ...c, isVisible: !c.isVisible } : c) });

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold" style={{ color: 'var(--white)' }}>Categories ({data.categories.length})</h3>
        <button onClick={openAdd} className="btn-primary text-sm px-4 py-2">+ Add Category</button>
      </div>
      <div className="flex flex-col gap-2">
        {sorted.map((cat) => (
          <div key={cat.id} className="flex items-center gap-4 glass-card px-4 py-3 rounded-xl">
            <div className="w-4 h-4 rounded-full shrink-0" style={{ background: cat.color }} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm" style={{ color: 'var(--white)' }}>{cat.name}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>/{cat.slug} · order {cat.order} · {data.tutorials.filter((t) => t.categorySlug === cat.slug).length} tutorials</div>
            </div>
            <button onClick={() => toggleVisible(cat.id)} className="text-xs px-2.5 py-1 rounded-full font-medium transition-all" style={cat.isVisible ? { background: 'rgba(52,211,153,0.12)', color: '#34d399' } : { background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }}>
              {cat.isVisible ? '● Visible' : '○ Hidden'}
            </button>
            <button onClick={() => openEdit(cat)} className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--electric)' }}>Edit</button>
            <button onClick={() => handleDelete(cat.id)} className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#ef4444' }}>Delete</button>
          </div>
        ))}
        {data.categories.length === 0 && <p className="text-center py-8" style={{ color: 'var(--muted)' }}>No categories yet. Add one above.</p>}
      </div>
      <CategoryModal isOpen={showModal} isNew={isNew} form={form} onChange={setForm} onSave={handleSave} onClose={() => setShowModal(false)} />
    </>
  );
}

// ── Tutorials Tab ─────────────────────────────────────────────────────────────

function TutorialsTab({ data, onUpdate }: { data: TutorialPageData; onUpdate: (d: TutorialPageData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Tutorial>(EMPTY_TUTORIAL);
  const [filterCat, setFilterCat] = useState('');

  const sorted = [...data.tutorials]
    .filter((t) => !filterCat || t.categorySlug === filterCat)
    .sort((a, b) => {
      const catA = data.categories.find((c) => c.slug === a.categorySlug)?.order ?? 99;
      const catB = data.categories.find((c) => c.slug === b.categorySlug)?.order ?? 99;
      return catA - catB || a.order - b.order;
    });

  const openAdd = () => { setIsNew(true); setForm({ ...EMPTY_TUTORIAL, order: data.tutorials.length + 1 }); setShowModal(true); };
  const openEdit = (tut: Tutorial) => { setIsNew(false); setForm({ ...tut }); setShowModal(true); };
  const handleSave = () => {
    if (!form.name || !form.slug) return;
    onUpdate(isNew
      ? { ...data, tutorials: [...data.tutorials, { ...form, id: generateId() }] }
      : { ...data, tutorials: data.tutorials.map((t) => (t.id === form.id ? form : t)) });
    setShowModal(false);
  };
  const handleDelete = (id: string) => {
    const tut = data.tutorials.find((t) => t.id === id);
    if (!confirm(`Delete tutorial "${tut?.name}"?`)) return;
    onUpdate({ ...data, tutorials: data.tutorials.filter((t) => t.id !== id) });
  };
  const toggleVisible = (id: string) =>
    onUpdate({ ...data, tutorials: data.tutorials.map((t) => t.id === id ? { ...t, isVisible: !t.isVisible } : t) });
  const toggleFeatured = (id: string) =>
    onUpdate({ ...data, tutorials: data.tutorials.map((t) => t.id === id ? { ...t, isFeatured: !t.isFeatured } : { ...t, isFeatured: false }) });
  const getCatName = (slug: string) => data.categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold" style={{ color: 'var(--white)' }}>Tutorials ({data.tutorials.length})</h3>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="text-xs" style={{ width: 'auto', minHeight: 36, padding: '4px 10px' }}>
            <option value="">All categories</option>
            {data.categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm px-4 py-2 shrink-0">+ Add Tutorial</button>
      </div>
      <div className="flex flex-col gap-2">
        {sorted.map((tut) => (
          <div key={tut.id} className="flex items-center gap-3 glass-card px-4 py-3 rounded-xl">
            {tut.thumbnailUrl ? (
              <img src={tut.thumbnailUrl} alt={tut.name} className="w-8 h-8 rounded-lg object-cover shrink-0" style={{ border: '1px solid var(--border)' }} />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: tut.logoColor }}>{tut.logoInitials}</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm flex items-center gap-2" style={{ color: 'var(--white)' }}>
                {tut.name}
                {tut.isFeatured && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--electric)' }}>FEATURED</span>}
                {tut.isPremium && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24' }}>PREMIUM</span>}
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{getCatName(tut.categorySlug)} · {tut.difficulty} · {tut.lessonCount} lessons</div>
            </div>
            <button onClick={() => toggleFeatured(tut.id)} title={tut.isFeatured ? 'Unset featured' : 'Set as featured'} className="text-lg transition-colors hover:opacity-80 shrink-0" style={{ color: tut.isFeatured ? '#FBBF24' : 'var(--muted)' }}>
              {tut.isFeatured ? '★' : '☆'}
            </button>
            <button onClick={() => toggleVisible(tut.id)} className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0 transition-all" style={tut.isVisible ? { background: 'rgba(52,211,153,0.12)', color: '#34d399' } : { background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }}>
              {tut.isVisible ? '● On' : '○ Off'}
            </button>
            <button onClick={() => openEdit(tut)} className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5 shrink-0" style={{ color: 'var(--electric)' }}>Edit</button>
            <button onClick={() => handleDelete(tut.id)} className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5 shrink-0" style={{ color: '#ef4444' }}>Delete</button>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-center py-8" style={{ color: 'var(--muted)' }}>No tutorials found. Add one above.</p>}
      </div>
      <TutorialModal isOpen={showModal} isNew={isNew} form={form} categories={data.categories} onChange={setForm} onSave={handleSave} onClose={() => setShowModal(false)} />
    </>
  );
}

// ── Content Tab ───────────────────────────────────────────────────────────────

function ContentTab({ data, onUpdate }: { data: TutorialPageData; onUpdate: (d: TutorialPageData) => void }) {
  const { hero, newsletter, upsell } = data;
  const setHero = (field: string, value: string | boolean) => onUpdate({ ...data, hero: { ...hero, [field]: value } });
  const updateStat = (i: number, field: keyof TutorialHeroStat, value: string) => {
    const stats = hero.stats.map((s, idx) => (idx === i ? { ...s, [field]: value } : s));
    onUpdate({ ...data, hero: { ...hero, stats } });
  };
  const addStat = () => onUpdate({ ...data, hero: { ...hero, stats: [...hero.stats, { value: '', label: '' }] } });
  const removeStat = (i: number) => onUpdate({ ...data, hero: { ...hero, stats: hero.stats.filter((_, idx) => idx !== i) } });
  const setNewsletter = (field: string, value: string | boolean) => onUpdate({ ...data, newsletter: { ...newsletter, [field]: value } });
  const setUpsell = (field: string, value: string | boolean) => onUpdate({ ...data, upsell: { ...upsell, [field]: value } });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--electric)' }}>Hero Section</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Badge Text</label>
            <input type="text" value={hero.badge} onChange={(e) => setHero('badge', e.target.value)} placeholder={DEFAULT_TUTORIAL_DATA.hero.badge} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Heading Line 1 (white)</label>
              <input type="text" value={hero.heading1} onChange={(e) => setHero('heading1', e.target.value)} placeholder={DEFAULT_TUTORIAL_DATA.hero.heading1} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Heading Line 2 (gradient)</label>
              <input type="text" value={hero.heading2} onChange={(e) => setHero('heading2', e.target.value)} placeholder={DEFAULT_TUTORIAL_DATA.hero.heading2} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Stats Row</label>
              <button onClick={addStat} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--electric)' }}>+ Add Stat</button>
            </div>
            <div className="flex flex-col gap-2">
              {hero.stats.map((stat, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="text" value={stat.value} onChange={(e) => updateStat(i, 'value', e.target.value)} placeholder="40+" className="w-24" />
                  <input type="text" value={stat.label} onChange={(e) => updateStat(i, 'label', e.target.value)} placeholder="Tools" className="flex-1" />
                  <button onClick={() => removeStat(i)} className="text-xs px-2 py-1 rounded" style={{ color: '#ef4444' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={hero.showGraphic} onChange={(e) => setHero('showGraphic', e.target.checked)} className="w-auto" style={{ width: 18, height: 18, minHeight: 18 }} />
            <span className="text-sm" style={{ color: 'var(--white)' }}>Show hero graphic (AI tools collage on right)</span>
          </label>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border)' }} />

      <section>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--electric)' }}>Newsletter Strip</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={newsletter.show} onChange={(e) => setNewsletter('show', e.target.checked)} className="w-auto" style={{ width: 16, height: 16, minHeight: 16 }} />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>Show</span>
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Heading</label>
            <input type="text" value={newsletter.heading} onChange={(e) => setNewsletter('heading', e.target.value)} placeholder={DEFAULT_TUTORIAL_DATA.newsletter.heading} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Input Placeholder</label>
            <input type="text" value={newsletter.placeholder} onChange={(e) => setNewsletter('placeholder', e.target.value)} placeholder="Email" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Button Label</label>
            <input type="text" value={newsletter.btnLabel} onChange={(e) => setNewsletter('btnLabel', e.target.value)} placeholder="Notify Me" />
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border)' }} />

      <section>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--electric)' }}>Upsell CTA Section</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={upsell.show} onChange={(e) => setUpsell('show', e.target.checked)} className="w-auto" style={{ width: 16, height: 16, minHeight: 16 }} />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>Show</span>
          </label>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Heading</label>
            <input type="text" value={upsell.heading} onChange={(e) => setUpsell('heading', e.target.value)} placeholder={DEFAULT_TUTORIAL_DATA.upsell.heading} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Subtitle</label>
            <textarea rows={2} value={upsell.subtitle} onChange={(e) => setUpsell('subtitle', e.target.value)} placeholder={DEFAULT_TUTORIAL_DATA.upsell.subtitle} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {([{ field: 'btnEnroll', label: 'Primary Button' }, { field: 'btnDownload', label: 'Secondary Button' }, { field: 'btnDemo', label: 'Electric Button' }] as { field: 'btnEnroll' | 'btnDownload' | 'btnDemo'; label: string }[]).map(({ field, label }) => (
              <div key={field}>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>{label}</label>
                <input type="text" value={upsell[field]} onChange={(e) => setUpsell(field, e.target.value)} placeholder={DEFAULT_TUTORIAL_DATA.upsell[field]} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Lessons Tab ───────────────────────────────────────────────────────────────

function BlockPreview(block: ContentBlock): string {
  switch (block.type) {
    case 'richText':    return block.html.replace(/<[^>]+>/g, '').slice(0, 80) || '(empty - click to write)';
    case 'heading':     return `H${block.level}: ${block.text}`;
    case 'paragraph':   return block.html.replace(/<[^>]+>/g, '').slice(0, 60) || '(empty)';
    case 'highlightBox': return block.title;
    case 'prompt':      return block.label;
    case 'callout':     return block.title ?? block.content.slice(0, 50);
    case 'quiz':        return block.question.slice(0, 60);
    case 'faq':         return `${block.items.length} FAQ item(s)`;
    case 'code':        return block.language;
    case 'comparison':  return `${block.leftTitle} vs ${block.rightTitle}`;
    case 'checklist':   return `${block.items.length} item(s)`;
    case 'image':       return block.alt || block.src;
    case 'video':       return block.url.slice(0, 50);
    case 'download':    return block.label;
    case 'aiToolCard':  return block.toolName;
    case 'table':       return `${block.rows.length} row(s) × ${block.headers.length} col(s)`;
    case 'divider':     return '── horizontal rule ──';
  }
}

function BlockFieldEditor({ block, onChange }: { block: ContentBlock; onChange: (b: ContentBlock) => void }) {
  switch (block.type) {
    case 'richText':
      return (
        <RichTextEditor
          content={block.html}
          onChange={(html) => onChange({ ...block, html })}
          placeholder="Write lesson content here…"
          minHeight={240}
          showWordCount
        />
      );

    case 'heading':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Level</label>
            <select value={block.level} onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 1 | 2 | 3 })}>
              <option value={1}>H1</option><option value={2}>H2</option><option value={3}>H3</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Text</label>
            <input type="text" value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />
          </div>
        </div>
      );

    case 'paragraph':
      return (
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Content (HTML allowed)</label>
          <textarea rows={5} value={block.html} onChange={(e) => onChange({ ...block, html: e.target.value })} placeholder="<p>Your text here...</p>" />
        </div>
      );

    case 'highlightBox':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Icon (emoji)</label>
            <input type="text" value={block.icon} onChange={(e) => onChange({ ...block, icon: e.target.value })} placeholder="💡" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Title</label>
            <input type="text" value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Content</label>
            <textarea rows={3} value={block.content} onChange={(e) => onChange({ ...block, content: e.target.value })} />
          </div>
        </div>
      );

    case 'prompt':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Label</label>
            <input type="text" value={block.label} onChange={(e) => onChange({ ...block, label: e.target.value })} placeholder="Study Assistant Prompt" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Prompt Text</label>
            <textarea rows={4} value={block.promptText} onChange={(e) => onChange({ ...block, promptText: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Try In Tool</label>
            <select value={block.tryInTool} onChange={(e) => onChange({ ...block, tryInTool: e.target.value as PromptTool })}>
              <option value="chatgpt">ChatGPT</option><option value="gemini">Gemini</option><option value="claude">Claude</option><option value="none">None</option>
            </select>
          </div>
        </div>
      );

    case 'image':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Image URL</label>
            <input type="text" value={block.src} onChange={(e) => onChange({ ...block, src: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Alt Text</label>
            <input type="text" value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Caption (optional)</label>
            <input type="text" value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} />
          </div>
        </div>
      );

    case 'video':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>YouTube or Vimeo URL</label>
            <input type="text" value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Caption (optional)</label>
            <input type="text" value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} />
          </div>
        </div>
      );

    case 'code':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Language</label>
            <input type="text" value={block.language} onChange={(e) => onChange({ ...block, language: e.target.value })} placeholder="javascript" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Code</label>
            <textarea rows={6} value={block.code} onChange={(e) => onChange({ ...block, code: e.target.value })} style={{ fontFamily: 'monospace', fontSize: 12 }} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Caption (optional)</label>
            <input type="text" value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} />
          </div>
        </div>
      );

    case 'callout':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Variant</label>
            <select value={block.variant} onChange={(e) => onChange({ ...block, variant: e.target.value as CalloutVariant })}>
              <option value="info">Info</option><option value="success">Success</option><option value="warning">Warning</option><option value="error">Error</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Title (optional)</label>
            <input type="text" value={block.title ?? ''} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Content</label>
            <textarea rows={3} value={block.content} onChange={(e) => onChange({ ...block, content: e.target.value })} />
          </div>
        </div>
      );

    case 'comparison':
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Left Title</label>
            <input type="text" value={block.leftTitle} onChange={(e) => onChange({ ...block, leftTitle: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Right Title</label>
            <input type="text" value={block.rightTitle} onChange={(e) => onChange({ ...block, rightTitle: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Left Items (one per line)</label>
            <textarea rows={4} value={block.leftItems.join('\n')} onChange={(e) => onChange({ ...block, leftItems: e.target.value.split('\n').filter(Boolean) })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Right Items (one per line)</label>
            <textarea rows={4} value={block.rightItems.join('\n')} onChange={(e) => onChange({ ...block, rightItems: e.target.value.split('\n').filter(Boolean) })} />
          </div>
        </div>
      );

    case 'checklist': {
      const updateItems = (text: string) => {
        const items = text.split('\n').map((t, i) => ({
          id: block.items[i]?.id ?? generateId(),
          text: t,
          checked: block.items[i]?.checked ?? false,
        })).filter((item) => item.text);
        onChange({ ...block, items });
      };
      return (
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Items (one per line)</label>
          <textarea rows={5} value={block.items.map((i) => i.text).join('\n')} onChange={(e) => updateItems(e.target.value)} />
        </div>
      );
    }

    case 'download':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Label</label>
            <input type="text" value={block.label} onChange={(e) => onChange({ ...block, label: e.target.value })} placeholder="Prompt Cheat Sheet" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>File URL</label>
            <input type="text" value={block.href} onChange={(e) => onChange({ ...block, href: e.target.value })} placeholder="/files/prompt-cheatsheet.pdf" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>File Type</label>
              <input type="text" value={block.fileType ?? ''} onChange={(e) => onChange({ ...block, fileType: e.target.value })} placeholder="PDF" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Size</label>
              <input type="text" value={block.size ?? ''} onChange={(e) => onChange({ ...block, size: e.target.value })} placeholder="2.4 MB" />
            </div>
          </div>
        </div>
      );

    case 'quiz': {
      const qType: QuizBlockType = block.quizType ?? 'mcq';
      const isMulti = qType === 'multiselect';
      const correctIndices: Set<number> = new Set(block.correctIndices ?? [block.correctIndex]);

      const updateOption = (id: string, text: string) =>
        onChange({ ...block, options: block.options.map((o) => o.id === id ? { ...o, text } : o) });
      const addOption = () => onChange({ ...block, options: [...block.options, { id: generateId(), text: '' }] });
      const removeOption = (id: string) => onChange({ ...block, options: block.options.filter((o) => o.id !== id) });

      const toggleMultiCorrect = (i: number) => {
        const next = new Set(correctIndices);
        next.has(i) ? next.delete(i) : next.add(i);
        const arr = [...next].sort((a, b) => a - b);
        onChange({ ...block, correctIndices: arr, correctIndex: arr[0] ?? 0 });
      };

      return (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Quiz Type</label>
              <select value={qType} onChange={(e) => onChange({ ...block, quizType: e.target.value as QuizBlockType, correctIndices: undefined })}>
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="truefalse">True / False</option>
                <option value="multiselect">Multi-select</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Pass Threshold (%)</label>
              <input type="number" min={1} max={100} value={block.passThreshold ?? 100} onChange={(e) => onChange({ ...block, passThreshold: Math.min(100, Math.max(1, Number(e.target.value))) })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Question</label>
            <textarea rows={2} value={block.question} onChange={(e) => onChange({ ...block, question: e.target.value })} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                Options {isMulti ? '(checkboxes = correct)' : '(radio = correct)'}
              </label>
              <button onClick={addOption} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--electric)' }}>+ Add</button>
            </div>
            {block.options.map((opt, i) => (
              <div key={opt.id} className="flex gap-2 items-center mb-1.5">
                {isMulti ? (
                  <input type="checkbox" checked={correctIndices.has(i)} onChange={() => toggleMultiCorrect(i)} />
                ) : (
                  <input type="radio" name={`quiz-correct-${block.id}`} checked={block.correctIndex === i} onChange={() => onChange({ ...block, correctIndex: i })} />
                )}
                <input type="text" value={opt.text} onChange={(e) => updateOption(opt.id, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="flex-1" />
                <button onClick={() => removeOption(opt.id)} className="text-xs" style={{ color: '#ef4444' }}>✕</button>
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Explanation (shown after answer)</label>
            <textarea rows={2} value={block.explanation ?? ''} onChange={(e) => onChange({ ...block, explanation: e.target.value })} />
          </div>
        </div>
      );
    }

    case 'faq': {
      const updateItem = (id: string, field: 'question' | 'answer', value: string) =>
        onChange({ ...block, items: block.items.map((i) => i.id === id ? { ...i, [field]: value } : i) });
      const addItem = () => onChange({ ...block, items: [...block.items, { id: generateId(), question: '', answer: '' }] });
      const removeItem = (id: string) => onChange({ ...block, items: block.items.filter((i) => i.id !== id) });
      return (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>FAQ Items</label>
            <button onClick={addItem} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--electric)' }}>+ Add Item</button>
          </div>
          <div className="flex flex-col gap-3">
            {block.items.map((item, i) => (
              <div key={item.id} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Item {i + 1}</span>
                  <button onClick={() => removeItem(item.id)} className="text-xs" style={{ color: '#ef4444' }}>✕</button>
                </div>
                <input type="text" value={item.question} onChange={(e) => updateItem(item.id, 'question', e.target.value)} placeholder="Question" className="mb-2" />
                <textarea rows={2} value={item.answer} onChange={(e) => updateItem(item.id, 'answer', e.target.value)} placeholder="Answer" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'aiToolCard':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Tool Name</label>
            <input type="text" value={block.toolName} onChange={(e) => onChange({ ...block, toolName: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Logo Color</label>
              <input type="color" value={block.logoColor} onChange={(e) => onChange({ ...block, logoColor: e.target.value })} className="h-10 w-full rounded cursor-pointer" style={{ border: '1px solid var(--border)', padding: 2 }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Initials</label>
              <input type="text" value={block.logoInitials} onChange={(e) => onChange({ ...block, logoInitials: e.target.value.slice(0, 4).toUpperCase() })} maxLength={4} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Description</label>
            <textarea rows={2} value={block.description} onChange={(e) => onChange({ ...block, description: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Try Link (optional)</label>
            <input type="text" value={block.tryLink ?? ''} onChange={(e) => onChange({ ...block, tryLink: e.target.value })} placeholder="https://..." />
          </div>
        </div>
      );

    case 'table': {
      const updateHeaders = (text: string) => onChange({ ...block, headers: text.split(',').map((h) => h.trim()).filter(Boolean) });
      const updateRows = (text: string) => onChange({ ...block, rows: text.split('\n').filter(Boolean).map((row) => row.split('|').map((c) => c.trim())) });
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Headers (comma-separated)</label>
            <input type="text" value={block.headers.join(', ')} onChange={(e) => updateHeaders(e.target.value)} placeholder="Name, Description, Example" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Rows (one per line, pipe-separated)</label>
            <textarea rows={5} value={block.rows.map((r) => r.join(' | ')).join('\n')} onChange={(e) => updateRows(e.target.value)} style={{ fontFamily: 'monospace', fontSize: 12 }} />
          </div>
        </div>
      );
    }

    case 'divider':
      return <p className="text-sm text-center py-4" style={{ color: 'var(--muted)' }}>Horizontal divider - no fields needed.</p>;

    default:
      return null;
  }
}

function BlockEditorModal({ block, onChange, onSave, onClose }: {
  block: ContentBlock; onChange: (b: ContentBlock) => void; onSave: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6"
        style={{
          background: 'rgba(4, 11, 28, 0.97)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold" style={{ color: 'var(--white)' }}>
            Edit Block - {BLOCK_TYPES.find((bt) => bt.value === block.type)?.label}
          </h3>
          <button onClick={onClose} style={{ color: 'var(--muted)' }}>✕</button>
        </div>
        <BlockFieldEditor block={block} onChange={onChange} />
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="btn-outline px-5 py-2 text-sm">Cancel</button>
          <button onClick={onSave} className="btn-primary px-5 py-2 text-sm">Save Block</button>
        </div>
      </div>
    </div>
  );
}

function AddBlockSelect({ onAdd }: { onAdd: (type: ContentBlock['type']) => void }) {
  return (
    <select
      onChange={(e) => { if (e.target.value) { onAdd(e.target.value as ContentBlock['type']); e.target.value = ''; } }}
      defaultValue=""
      style={{ width: 'auto', minHeight: 36, padding: '4px 10px', fontSize: 12 }}
    >
      <option value="">+ Add Block</option>
      {BLOCK_TYPES.map((bt) => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
    </select>
  );
}

function LessonEditorModal({ form, onChange, onSave, onClose }: {
  form: Lesson; onChange: (f: Lesson) => void; onSave: () => void; onClose: () => void;
}) {
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState<ContentBlock | null>(null);

  const set = <K extends keyof Lesson>(field: K, value: Lesson[K]) => onChange({ ...form, [field]: value });
  const handleTitleChange = (title: string) => onChange({ ...form, title, slug: form.slug || slugify(title) });

  const addBlock = (type: ContentBlock['type']) => {
    const b = createDefaultBlock(type);
    onChange({ ...form, blocks: [...form.blocks, b] });
    // richText blocks edit inline - no separate modal needed.
    if (type !== 'richText') {
      setBlockForm(b);
      setShowBlockModal(true);
    }
  };

  const openEditBlock = (block: ContentBlock) => { setBlockForm({ ...block }); setShowBlockModal(true); };
  const saveBlock = () => {
    if (!blockForm) return;
    onChange({ ...form, blocks: form.blocks.some((b) => b.id === blockForm.id)
      ? form.blocks.map((b) => b.id === blockForm.id ? blockForm : b)
      : [...form.blocks, blockForm],
    });
    setShowBlockModal(false);
  };
  const deleteBlock = (id: string) => { if (!confirm('Delete this block?')) return; onChange({ ...form, blocks: form.blocks.filter((b) => b.id !== id) }); };
  const moveBlock = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= form.blocks.length) return;
    const blocks = [...form.blocks];
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    onChange({ ...form, blocks });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      {/* Modal card: flex-col so header/footer stay sticky while body scrolls */}
      <div
        className="relative z-10 w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl"
        style={{
          background: 'rgba(4, 11, 28, 0.97)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >

        {/* ── Sticky header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0 rounded-t-2xl"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.025)' }}
        >
          <h3 className="text-lg font-bold" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
            {form.id ? 'Edit Lesson' : 'New Lesson'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-sm"
            style={{ color: 'var(--muted)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">

        {/* Basic fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Title *</label>
            <input type="text" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="How ChatGPT Works" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Slug</label>
            <input type="text" value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} placeholder="how-chatgpt-works" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Tool Name</label>
            <input type="text" value={form.toolName} onChange={(e) => set('toolName', e.target.value)} placeholder="ChatGPT" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Lesson #</label>
            <input type="number" value={form.lessonNumber} min={1} onChange={(e) => set('lessonNumber', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Read Time (min)</label>
            <input type="number" value={form.readTime} min={1} onChange={(e) => set('readTime', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Difficulty</label>
            <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value as TutorialDifficulty)}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Unlock Rule</label>
            <select value={form.unlockRule} onChange={(e) => set('unlockRule', e.target.value as UnlockRule)}>
              <option value="sequential">Sequential (prev complete)</option>
              <option value="mark-complete">Mark Complete (explicit)</option>
              <option value="read-fully">Read Fully (scroll to bottom)</option>
              <option value="pass-quiz">Pass Quiz</option>
              <option value="watch-video">Watch Video</option>
              <option value="free">Always Free</option>
              <option value="manual">Manual (admin only)</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Intro</label>
            <textarea rows={2} value={form.intro} onChange={(e) => set('intro', e.target.value)} placeholder="Brief intro shown below the title..." />
          </div>
        </div>

        <div className="flex flex-wrap gap-5 mb-5">
          {([{ field: 'isFree', label: 'Free lesson' }, { field: 'visible', label: 'Visible' }, { field: 'locked', label: 'Locked' }] as { field: 'isFree' | 'visible' | 'locked'; label: string }[]).map(({ field, label }) => (
            <label key={field} className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form[field]} onChange={(e) => set(field, e.target.checked)} className="w-auto" style={{ width: 18, height: 18, minHeight: 18 }} />
              <span className="text-sm" style={{ color: 'var(--white)' }}>{label}</span>
            </label>
          ))}
        </div>

        {/* Block builder ── richText blocks show inline TipTap; others show compact rows */}
        <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: 'var(--electric)' }}>
              Content Blocks ({form.blocks.length})
            </span>
            <div className="flex gap-2">
              {/* One-click Rich Text button - most common block, no modal needed */}
              <button
                type="button"
                onClick={() => addBlock('richText')}
                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--electric)', border: '1px solid rgba(0,212,255,0.2)' }}
              >
                ✍️ Rich Text
              </button>
              <AddBlockSelect onAdd={addBlock} />
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-2">
            {form.blocks.map((block, i) => {
              const isFirst = i === 0;
              const isLast = i === form.blocks.length - 1;

              if (block.type === 'richText') {
                return (
                  <div key={block.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <div
                      className="flex items-center justify-between px-3 py-1.5"
                      style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid var(--border)' }}
                    >
                      <span className="text-xs font-medium" style={{ color: 'var(--electric)' }}>✍️ Rich Text</span>
                      <div className="flex gap-1">
                        <button onClick={() => moveBlock(i, -1)} disabled={isFirst} className="text-xs px-1.5 py-1 disabled:opacity-30" style={{ color: 'var(--muted)' }}>↑</button>
                        <button onClick={() => moveBlock(i, 1)} disabled={isLast} className="text-xs px-1.5 py-1 disabled:opacity-30" style={{ color: 'var(--muted)' }}>↓</button>
                        <button onClick={() => deleteBlock(block.id)} className="text-xs px-1.5 py-1" style={{ color: '#ef4444' }}>✕</button>
                      </div>
                    </div>
                    <RichTextEditor
                      content={block.html}
                      onChange={(html) => {
                        onChange({
                          ...form,
                          blocks: form.blocks.map((b) => {
                            if (b.id === block.id && b.type === 'richText') return { ...b, html };
                            return b;
                          }),
                        });
                      }}
                      placeholder="Write lesson content here…"
                      minHeight={120}
                    />
                  </div>
                );
              }

              return (
                <div key={block.id} className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <span className="text-xs shrink-0 w-28 truncate" style={{ color: 'var(--electric)' }}>
                    {BLOCK_TYPES.find((bt) => bt.value === block.type)?.label ?? block.type}
                  </span>
                  <span className="flex-1 text-xs truncate" style={{ color: 'var(--muted)' }}>{BlockPreview(block)}</span>
                  <button onClick={() => moveBlock(i, -1)} disabled={isFirst} className="text-xs px-1.5 py-1 disabled:opacity-30" style={{ color: 'var(--muted)' }}>↑</button>
                  <button onClick={() => moveBlock(i, 1)} disabled={isLast} className="text-xs px-1.5 py-1 disabled:opacity-30" style={{ color: 'var(--muted)' }}>↓</button>
                  <button onClick={() => openEditBlock(block)} className="text-xs px-2 py-1" style={{ color: 'var(--electric)' }}>Edit</button>
                  <button onClick={() => deleteBlock(block.id)} className="text-xs px-2 py-1" style={{ color: '#ef4444' }}>✕</button>
                </div>
              );
            })}

            {form.blocks.length === 0 && (
              <div className="text-center py-6 text-xs rounded-xl" style={{ color: 'var(--muted)', border: '1px dashed var(--border)' }}>
                No blocks yet. Click <strong>✍️ Rich Text</strong> to start writing, or choose a block type from the dropdown.
              </div>
            )}
          </div>
        </div>

        </div>{/* end scrollable body */}

        {/* ── Sticky footer ── */}
        <div
          className="flex gap-3 justify-end px-6 py-4 shrink-0 rounded-b-2xl"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.025)' }}
        >
          <button onClick={onClose} className="btn-outline px-5 py-2 text-sm">Cancel</button>
          <button onClick={onSave} disabled={!form.title} className="btn-primary px-5 py-2 text-sm">Save Lesson</button>
        </div>

      </div>{/* end modal card */}

      {showBlockModal && blockForm && (
        <BlockEditorModal block={blockForm} onChange={setBlockForm} onSave={saveBlock} onClose={() => setShowBlockModal(false)} />
      )}
    </div>
  );
}

function ChapterBlock({ chapter, idx, total, onMoveUp, onMoveDown, onDelete, onEditTitle, onAddLesson, onEditLesson, onDeleteLesson }: {
  chapter: Chapter; idx: number; total: number;
  onMoveUp: () => void; onMoveDown: () => void; onDelete: () => void;
  onEditTitle: (t: string) => void; onAddLesson: () => void;
  onEditLesson: (l: Lesson) => void; onDeleteLesson: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(chapter.title);

  const commitTitle = () => { onEditTitle(titleInput); setEditingTitle(false); };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: expanded ? '1px solid var(--border)' : 'none' }}>
        <button onClick={() => setExpanded((e) => !e)} className="text-xs" style={{ color: 'var(--muted)' }}>{expanded ? '▾' : '▸'}</button>
        {editingTitle ? (
          <input
            className="flex-1 text-sm"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => e.key === 'Enter' && commitTitle()}
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm font-semibold cursor-pointer" style={{ color: 'var(--white)' }} onDoubleClick={() => setEditingTitle(true)}>
            {chapter.title}
          </span>
        )}
        <span className="text-xs mr-2" style={{ color: 'var(--muted)' }}>{chapter.lessons.length} lesson(s)</span>
        <button onClick={onMoveUp} disabled={idx === 0} className="text-xs px-1.5 py-1 disabled:opacity-30" style={{ color: 'var(--muted)' }}>↑</button>
        <button onClick={onMoveDown} disabled={idx === total - 1} className="text-xs px-1.5 py-1 disabled:opacity-30" style={{ color: 'var(--muted)' }}>↓</button>
        <button onClick={() => setEditingTitle(true)} className="text-xs px-2 py-1" style={{ color: 'var(--electric)' }}>✏️</button>
        <button onClick={onDelete} className="text-xs px-2 py-1" style={{ color: '#ef4444' }}>✕</button>
      </div>
      {expanded && (
        <div className="p-4">
          <div className="flex flex-col gap-2 mb-3">
            {chapter.lessons.map((l) => (
              <div key={l.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--electric)' }}>
                  {String(l.lessonNumber).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--white)' }}>{l.title}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    {l.difficulty} · {l.readTime}m · {l.blocks.length} block(s) · {l.isFree ? 'Free' : 'Premium'}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={l.locked ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444' } : { background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                  {l.locked ? '🔒 Locked' : '✓ Open'}
                </span>
                <button onClick={() => onEditLesson(l)} className="text-xs px-2 py-1 shrink-0" style={{ color: 'var(--electric)' }}>Edit</button>
                <button onClick={() => onDeleteLesson(l.id)} className="text-xs px-2 py-1 shrink-0" style={{ color: '#ef4444' }}>✕</button>
              </div>
            ))}
            {chapter.lessons.length === 0 && (
              <div className="text-center py-4 text-xs" style={{ color: 'var(--muted)' }}>No lessons yet.</div>
            )}
          </div>
          <button onClick={onAddLesson} className="btn-outline text-xs px-3 py-1.5">+ Add Lesson</button>
        </div>
      )}
    </div>
  );
}

function LessonsTab({ data, onUpdate }: { data: TutorialPageData; onUpdate: (d: TutorialPageData) => void }) {
  const [selectedTutId, setSelectedTutId] = useState('');
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState<Lesson>({ ...EMPTY_LESSON });
  const [lessonChapterId, setLessonChapterId] = useState('');
  const [isNewLesson, setIsNewLesson] = useState(false);

  const selectedTut = data.tutorials.find((t) => t.id === selectedTutId);
  const chapters = [...(selectedTut?.chapters ?? [])].sort((a, b) => a.order - b.order);

  const updateChapters = (newChapters: Chapter[]) =>
    onUpdate({ ...data, tutorials: data.tutorials.map((t) => t.id === selectedTutId ? { ...t, chapters: newChapters } : t) });

  const addChapter = () => {
    if (!selectedTutId) return;
    updateChapters([...chapters, { id: generateId(), title: `Chapter ${chapters.length + 1}`, order: chapters.length + 1, lessons: [] }]);
  };

  const deleteChapter = (id: string) => {
    if (!confirm('Delete this chapter and all its lessons?')) return;
    updateChapters(chapters.filter((c) => c.id !== id));
  };

  const moveChapter = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= chapters.length) return;
    const next = [...chapters];
    [next[i], next[j]] = [next[j], next[i]];
    updateChapters(next.map((c, idx) => ({ ...c, order: idx + 1 })));
  };

  const editChapterTitle = (chapterId: string, title: string) =>
    updateChapters(chapters.map((c) => c.id === chapterId ? { ...c, title } : c));

  const openAddLesson = (chapterId: string) => {
    const ch = chapters.find((c) => c.id === chapterId);
    setLessonChapterId(chapterId);
    setIsNewLesson(true);
    setLessonForm({ ...EMPTY_LESSON, lessonNumber: (ch?.lessons.length ?? 0) + 1 });
    setShowLessonModal(true);
  };

  const openEditLesson = (chapterId: string, lesson: Lesson) => {
    setLessonChapterId(chapterId);
    setIsNewLesson(false);
    setLessonForm({ ...lesson });
    setShowLessonModal(true);
  };

  const saveLessonModal = () => {
    if (!lessonForm.title) return;
    const form: Lesson = { ...lessonForm, id: isNewLesson ? generateId() : lessonForm.id, slug: lessonForm.slug || slugify(lessonForm.title) };
    updateChapters(chapters.map((ch) => {
      if (ch.id !== lessonChapterId) return ch;
      const lessons = isNewLesson ? [...ch.lessons, form] : ch.lessons.map((l) => l.id === form.id ? form : l);
      return { ...ch, lessons };
    }));
    setShowLessonModal(false);
  };

  const deleteLesson = (chapterId: string, lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;
    updateChapters(chapters.map((ch) => ch.id === chapterId ? { ...ch, lessons: ch.lessons.filter((l) => l.id !== lessonId) } : ch));
  };

  return (
    <>
      <div className="mb-6">
        <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Select Tutorial to Edit Lessons</label>
        <select value={selectedTutId} onChange={(e) => setSelectedTutId(e.target.value)} style={{ maxWidth: 360 }}>
          <option value="">- Choose a tutorial -</option>
          {data.tutorials.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {!selectedTutId && (
        <div className="text-center py-12" style={{ color: 'var(--muted)' }}>
          Select a tutorial above to manage its chapters and lessons.
        </div>
      )}

      {selectedTut && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold" style={{ color: 'var(--white)' }}>{selectedTut.name}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{chapters.length} chapter(s)</div>
            </div>
            <button onClick={addChapter} className="btn-primary text-sm px-4 py-2">+ Add Chapter</button>
          </div>
          <div className="flex flex-col gap-4">
            {chapters.map((ch, i) => (
              <ChapterBlock
                key={ch.id}
                chapter={ch}
                idx={i}
                total={chapters.length}
                onMoveUp={() => moveChapter(i, -1)}
                onMoveDown={() => moveChapter(i, 1)}
                onDelete={() => deleteChapter(ch.id)}
                onEditTitle={(title) => editChapterTitle(ch.id, title)}
                onAddLesson={() => openAddLesson(ch.id)}
                onEditLesson={(l) => openEditLesson(ch.id, l)}
                onDeleteLesson={(lId) => deleteLesson(ch.id, lId)}
              />
            ))}
            {chapters.length === 0 && (
              <div className="text-center py-8" style={{ color: 'var(--muted)' }}>
                No chapters yet. Add one above.
              </div>
            )}
          </div>
        </div>
      )}

      {showLessonModal && (
        <LessonEditorModal
          form={lessonForm}
          onChange={setLessonForm}
          onSave={saveLessonModal}
          onClose={() => setShowLessonModal(false)}
        />
      )}
    </>
  );
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────

function AnalyticsTab({ data }: { data: TutorialPageData }) {
  const analytics = loadAnalytics();
  const progress = loadUserProgress();

  const allTutorials = data.tutorials;

  // Derive started / completed from progress
  const startedIds = new Set(
    Object.entries(progress.tutorials)
      .filter(([, rec]) => Object.keys(rec.lessonsProgress).length > 0)
      .map(([id]) => id),
  );
  const completedIds = new Set(progress.completedTutorials);

  // Sort tutorials by views desc
  const byViews = [...allTutorials].sort((a, b) => {
    const va = analytics.tutorials[a.id]?.views ?? 0;
    const vb = analytics.tutorials[b.id]?.views ?? 0;
    return vb - va;
  });

  const maxViews = byViews[0] ? (analytics.tutorials[byViews[0].id]?.views ?? 0) : 1;

  // Per-tutorial lesson stats
  const getLessonStats = (tut: Tutorial) => {
    const allLessons = (tut.chapters ?? []).flatMap((ch) => ch.lessons).filter((l) => l.visible !== false);
    const tutProg = progress.tutorials[tut.id];
    const done = tutProg ? allLessons.filter((l) => tutProg.lessonsProgress[l.id]?.status === 'completed').length : 0;
    return { total: allLessons.length, done };
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Warning banner */}
      <div
        className="px-4 py-3 rounded-xl text-sm flex items-start gap-2"
        style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', color: '#FBBF24' }}
      >
        <span>⚠️</span>
        <span>Metrics are device-local until connected to a backend. They reflect data from this browser only.</span>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Page Views', value: analytics.totalViews ?? 0, color: 'var(--electric)' },
          { label: 'Tutorials Started', value: startedIds.size, color: 'var(--orange)' },
          { label: 'Tutorials Completed', value: completedIds.size, color: '#34d399' },
          { label: 'Certificates Issued', value: progress.certificates.length, color: '#FBBF24' },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4 text-center" style={{ border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black mb-1" style={{ color: s.color, fontFamily: 'Montserrat, var(--font-head)' }}>{s.value}</div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Popular tutorials */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--electric)' }}>
          Popular Tutorials by Views
        </h3>
        <div className="flex flex-col gap-2">
          {byViews.slice(0, 10).map((tut, rank) => {
            const views = analytics.tutorials[tut.id]?.views ?? 0;
            const barPct = maxViews > 0 ? Math.round((views / maxViews) * 100) : 0;
            return (
              <div key={tut.id} className="flex items-center gap-3">
                <span className="text-xs w-4 shrink-0 text-right" style={{ color: 'var(--muted)' }}>#{rank + 1}</span>
                {tut.thumbnailUrl ? (
                  <img src={tut.thumbnailUrl} alt={tut.name} className="w-7 h-7 rounded-md object-cover shrink-0" style={{ border: '1px solid var(--border)' }} />
                ) : (
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: tut.logoColor }}>
                    {tut.logoInitials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium mb-1 truncate" style={{ color: 'var(--white)' }}>{tut.name}</div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${barPct}%`, background: 'linear-gradient(90deg, var(--electric), var(--orange))' }}
                    />
                  </div>
                </div>
                <span className="text-xs font-mono shrink-0 w-12 text-right" style={{ color: 'var(--muted)' }}>{views} views</span>
              </div>
            );
          })}
          {byViews.length === 0 && <p className="text-sm" style={{ color: 'var(--muted)' }}>No views recorded yet.</p>}
        </div>
      </div>

      {/* Per-tutorial table */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--electric)' }}>
          Per-Tutorial Progress Summary
        </h3>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Tutorial', 'Views', 'Lessons Done', 'Status'].map((h) => (
                  <th key={h} className="text-left py-2 pr-4 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allTutorials.map((tut) => {
                const views = analytics.tutorials[tut.id]?.views ?? 0;
                const { total, done } = getLessonStats(tut);
                const isCompleted = completedIds.has(tut.id);
                const isStarted = startedIds.has(tut.id);
                const status = isCompleted ? '✓ Completed' : isStarted ? '▶ In Progress' : '- Not started';
                const statusColor = isCompleted ? '#34d399' : isStarted ? 'var(--electric)' : 'var(--muted)';
                return (
                  <tr key={tut.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        {tut.thumbnailUrl ? (
                          <img src={tut.thumbnailUrl} alt={tut.name} className="w-5 h-5 rounded object-cover shrink-0" style={{ border: '1px solid var(--border)' }} />
                        ) : (
                          <div className="w-5 h-5 rounded shrink-0 flex items-center justify-center text-[9px] font-bold text-white" style={{ background: tut.logoColor }}>{tut.logoInitials}</div>
                        )}
                        <span style={{ color: 'var(--white)' }}>{tut.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4" style={{ color: 'var(--muted)' }}>{views}</td>
                    <td className="py-2.5 pr-4" style={{ color: 'var(--muted)' }}>{total > 0 ? `${done}/${total}` : '-'}</td>
                    <td className="py-2.5" style={{ color: statusColor }}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TutorialsAdmin() {
  const [tab, setTab] = useState<AdminTab>('tutorials');
  const [data, setData] = useState<TutorialPageData>(() => loadTutorialData());
  const [saveState, setSaveState] = useState<SaveState>('idle');

  // Load server data on mount so admin always edits the live version
  useEffect(() => {
    getTutorialData().then((serverData) => {
      if (serverData) {
        setData(serverData);
        saveTutorialData(serverData);
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      saveTutorialData(data);
      await putTutorialData(data);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  };

  const TABS: { id: AdminTab; label: string }[] = [
    { id: 'tutorials', label: '📚 Tutorials' },
    { id: 'categories', label: '🗂 Categories' },
    { id: 'lessons', label: '🎯 Lessons' },
    { id: 'content', label: '✏️ Page Content' },
    { id: 'analytics', label: '📊 Analytics' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl" style={{ color: 'var(--white)' }}>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
            Tutorial CMS
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Manage tutorials, chapters, lessons, and the /tutorials listing page.
          </p>
        </div>
        <SaveBtn state={saveState} onClick={handleSave} />
      </div>

      <div className="flex gap-1 p-1 rounded-xl mb-7 flex-wrap" style={{ background: 'rgba(255,255,255,0.04)', width: 'fit-content' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === t.id ? { background: 'rgba(0,212,255,0.12)', color: 'var(--electric)', border: '1px solid rgba(0,212,255,0.2)' } : { color: 'var(--muted)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        {tab === 'tutorials'  && <TutorialsTab  data={data} onUpdate={setData} />}
        {tab === 'categories' && <CategoriesTab data={data} onUpdate={setData} />}
        {tab === 'lessons'    && <LessonsTab    data={data} onUpdate={setData} />}
        {tab === 'content'    && <ContentTab    data={data} onUpdate={setData} />}
        {tab === 'analytics'  && <AnalyticsTab  data={data} />}
      </div>

      <p className="text-xs mt-4" style={{ color: 'var(--muted)' }}>
        Changes are held in memory until you click "Save Changes" - they will not persist on page refresh.
      </p>
    </div>
  );
}
