import { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { loadProjectsData, saveProjectsData, generateId, slugify } from '@/data/projectsData';
import { getProjectsData, putProjectsData } from '@/api/projects';
import type {
  ProjectPageData,
  Project,
  ProjectCategory,
  ProjectPageStat,
  ProjectImpactStat,
} from '@/types';

type AdminTab = 'projects' | 'categories' | 'content';
type CodeTab = 'html' | 'css' | 'js' | 'preview';

/**
 * Converts any Google Drive share URL to a thumbnail URL that browsers can
 * load as an <img> src. The /thumbnail endpoint always returns a real JPEG
 * (unlike uc?export=view which returns an HTML warning page for large files).
 *
 * Handles both common Drive share formats:
 *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   https://drive.google.com/open?id=FILE_ID
 *
 * Non-Drive URLs are returned unchanged.
 */
function convertImageUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  const driveId = (() => {
    // Format 1: /file/d/FILE_ID/
    const m1 = trimmed.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
    if (m1) return m1[1];
    // Format 2: ?id=FILE_ID or &id=FILE_ID
    const m2 = trimmed.match(/drive\.google\.com\/.*[?&]id=([^&#+]+)/);
    if (m2) return m2[1];
    return null;
  })();

  if (driveId) {
    // /thumbnail?sz=w1200 always returns a real image - never an HTML interstitial
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
  }

  // Also upgrade any previously-saved uc?export=view URLs
  const ucId = trimmed.match(/drive\.google\.com\/uc\?.*[?&]?id=([^&#+]+)/);
  if (ucId) return `https://drive.google.com/thumbnail?id=${ucId[1]}&sz=w1200`;

  return trimmed;
}

// Builds the full HTML document injected into the sandboxed preview iframe.
function buildSrcDoc(html: string, css: string, js: string): string {
  // Escape closing tags so they can't break out of their container tag.
  const safeJs = js.replace(/<\/script>/gi, '<\\/script>');
  const safeCss = css.replace(/<\/style>/gi, '<\\/style>');
  // In sandbox="allow-scripts" (no allow-same-origin), window.localStorage
  // throws SecurityError and kills the whole script. Inject a shim first so
  // any code that calls localStorage still runs (data is in-memory only).
  const storagePatch =
    '<script>(function(){' +
    'function mem(){var s={};return{' +
    'getItem:function(k){return s.hasOwnProperty(k)?s[k]:null;},' +
    'setItem:function(k,v){s[String(k)]=String(v);},' +
    'removeItem:function(k){delete s[String(k)];},' +
    'clear:function(){s={};},' +
    'key:function(i){return Object.keys(s)[i]??null;},' +
    'get length(){return Object.keys(s).length;}' +
    '};}' +
    "['localStorage','sessionStorage'].forEach(function(n){" +
    'try{window[n].getItem("__");}' +
    'catch(e){try{Object.defineProperty(window,n,{value:mem(),configurable:true,writable:true});}catch(e2){}}' +
    '});' +
    '})();<\/script>';
  return [
    '<!DOCTYPE html><html><head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    storagePatch,
    `<style>*{box-sizing:border-box}body{margin:0;padding:16px}${safeCss}</style>`,
    `</head><body>${html}`,
    `<script>${safeJs}<\/script>`,
    '</body></html>',
  ].join('');
}

// ── Empty templates ───────────────────────────────────────────────────────────

function emptyProject(): Project {
  return {
    id: generateId(),
    title: '',
    slug: '',
    shortDescription: '',
    problemStatement: '',
    solution: '',
    keyFeatures: [''],
    category: 'web-apps',
    techStack: [''],
    coverImageUrl: '',
    isFeatured: false,
    awardBadge: '',
    studentName: '',
    studentInitials: '',
    studentPhotoUrl: '',
    studentCohort: '',
    studentQuote: '',
    mentorName: '',
    mentorTitle: '',
    mentorQuote: '',
    impactStats: [{ id: generateId(), value: '', label: '' }],
    liveDemoUrl: '',
    sourceCodeUrl: '',
    codeRunnerEnabled: false,
    codeHtml: '',
    codeCss: '',
    codeJs: '',
    visible: true,
    order: 0,
  };
}

function emptyCategory(): ProjectCategory {
  return { id: generateId(), name: '', slug: '', order: 0, isVisible: true };
}

function emptyStat(): ProjectPageStat {
  return { id: generateId(), value: '', label: '' };
}

// ── Small UI helpers ──────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--white)' }}>
      {children}
    </label>
  );
}

function Field({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-1 ${className ?? ''}`}>{children}</div>;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProjectsAdmin() {
  const [data, setData] = useState<ProjectPageData>(() => loadProjectsData());
  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Project modal state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Sync from backend on mount so admin always sees the latest DB state
  useEffect(() => {
    getProjectsData().then((serverData) => {
      if (serverData) {
        setData(serverData);
        saveProjectsData(serverData);
      }
    }).catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await putProjectsData(data);
      saveProjectsData(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // Silent - localStorage already saved; backend may be unreachable
      saveProjectsData(data);
    } finally {
      setSaving(false);
    }
  }

  // ── Project CRUD ──────────────────────────────────────────────────────────

  function openAdd() {
    setEditingProject(emptyProject());
    setShowProjectModal(true);
  }

  function openEdit(p: Project) {
    setEditingProject({ ...p });
    setShowProjectModal(true);
  }

  function confirmDelete(id: string) {
    setDeleteTarget(id);
  }

  function executeDelete() {
    if (!deleteTarget) return;
    setData((d) => ({
      ...d,
      projects: d.projects.filter((p) => p.id !== deleteTarget),
    }));
    setDeleteTarget(null);
  }

  function toggleVisible(id: string) {
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === id ? { ...p, visible: !p.visible } : p,
      ),
    }));
  }

  function toggleFeatured(id: string) {
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === id ? { ...p, isFeatured: !p.isFeatured } : p,
      ),
    }));
  }

  function moveProject(id: string, dir: -1 | 1) {
    setData((d) => {
      const sorted = [...d.projects].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((p) => p.id === id);
      const swap = idx + dir;
      if (swap < 0 || swap >= sorted.length) return d;
      const tmp = sorted[idx].order;
      sorted[idx] = { ...sorted[idx], order: sorted[swap].order };
      sorted[swap] = { ...sorted[swap], order: tmp };
      return { ...d, projects: sorted };
    });
  }

  function saveProject(p: Project) {
    const finalSlug = p.slug || slugify(p.title);
    const updated = { ...p, slug: finalSlug };
    setData((d) => {
      const exists = d.projects.find((x) => x.id === updated.id);
      if (exists) {
        return { ...d, projects: d.projects.map((x) => (x.id === updated.id ? updated : x)) };
      }
      return {
        ...d,
        projects: [
          ...d.projects,
          { ...updated, order: d.projects.length },
        ],
      };
    });
    setShowProjectModal(false);
    setEditingProject(null);
  }

  // ── Category CRUD ─────────────────────────────────────────────────────────

  function addCategory() {
    setData((d) => ({
      ...d,
      categories: [...d.categories, { ...emptyCategory(), order: d.categories.length }],
    }));
  }

  function updateCategory(id: string, field: keyof ProjectCategory, value: string | boolean | number) {
    setData((d) => ({
      ...d,
      categories: d.categories.map((c) =>
        c.id === id ? { ...c, [field]: value } : c,
      ),
    }));
  }

  function deleteCategory(id: string) {
    setData((d) => ({
      ...d,
      categories: d.categories.filter((c) => c.id !== id),
    }));
  }

  // ── Stats CRUD ────────────────────────────────────────────────────────────

  function addStat() {
    setData((d) => ({ ...d, stats: [...d.stats, emptyStat()] }));
  }

  function updateStat(id: string, field: 'value' | 'label', val: string) {
    setData((d) => ({
      ...d,
      stats: d.stats.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    }));
  }

  function deleteStat(id: string) {
    setData((d) => ({ ...d, stats: d.stats.filter((s) => s.id !== id) }));
  }

  const sortedProjects = [...data.projects].sort((a, b) => a.order - b.order);

  return (
    <div
      className="flex flex-col gap-0 min-h-screen"
      style={{ background: 'var(--navy)', color: 'var(--white)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-8 py-5 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-head)' }}>
            Project Showcase CMS
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            Manage student projects, categories, and listing-page content
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-6 py-2.5 text-sm font-semibold"
          style={{ opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {([['projects', '🚀 Projects'], ['categories', '🏷️ Categories'], ['content', '📄 Page Content']] as [AdminTab, string][]).map(
          ([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-4 text-sm font-semibold transition-colors"
              style={{
                color: activeTab === tab ? 'var(--electric)' : 'var(--muted)',
                borderBottom: activeTab === tab ? '2px solid var(--electric)' : '2px solid transparent',
                background: 'transparent',
              }}
            >
              {label}
            </button>
          ),
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-8">

        {/* ── PROJECTS TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'projects' && (
          <div className="flex flex-col gap-6 max-w-5xl">
            <div className="flex items-center justify-between">
              <div className="text-sm" style={{ color: 'var(--muted)' }}>
                {data.projects.length} project{data.projects.length !== 1 ? 's' : ''} total
              </div>
              <button className="btn-primary px-5 py-2 text-sm" onClick={openAdd}>
                + Add Project
              </button>
            </div>

            {sortedProjects.length === 0 ? (
              <div className="glass-card text-center py-16" style={{ borderRadius: '1rem' }}>
                <div className="text-3xl mb-3">🚀</div>
                <div className="font-semibold" style={{ color: 'var(--white)' }}>No projects yet</div>
                <button className="btn-primary mt-4 px-6 py-2 text-sm" onClick={openAdd}>
                  Add First Project
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sortedProjects.map((p, idx) => (
                  <div
                    key={p.id}
                    className="glass-card flex items-center gap-4 p-4"
                    style={{ borderRadius: '0.75rem' }}
                  >
                    {/* Reorder */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-30"
                        disabled={idx === 0}
                        onClick={() => moveProject(p.id, -1)}
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-30"
                        disabled={idx === sortedProjects.length - 1}
                        onClick={() => moveProject(p.id, 1)}
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Cover thumb */}
                    {p.coverImageUrl ? (
                      <img
                        src={p.coverImageUrl}
                        alt={p.title}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-lg flex items-center justify-center text-xl shrink-0"
                        style={{ background: 'rgba(0,212,255,0.08)' }}
                      >
                        🚀
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm" style={{ color: 'var(--white)' }}>
                          {p.title || '(untitled)'}
                        </span>
                        {p.isFeatured && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,107,43,0.15)', color: 'var(--orange)' }}
                          >
                            ⭐ Featured
                          </span>
                        )}
                        {!p.visible && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}
                          >
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                        {p.category} · {p.studentName || 'No student'} · /projects/{p.slug || '(no-slug)'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                        style={{
                          background: p.visible ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.06)',
                          color: p.visible ? 'var(--electric)' : 'var(--muted)',
                        }}
                        onClick={() => toggleVisible(p.id)}
                        title={p.visible ? 'Hide' : 'Show'}
                      >
                        {p.visible ? '👁 Visible' : '🚫 Hidden'}
                      </button>
                      <button
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                        style={{
                          background: p.isFeatured ? 'rgba(255,107,43,0.12)' : 'rgba(255,255,255,0.06)',
                          color: p.isFeatured ? 'var(--orange)' : 'var(--muted)',
                        }}
                        onClick={() => toggleFeatured(p.id)}
                        title={p.isFeatured ? 'Unfeature' : 'Feature'}
                      >
                        ⭐
                      </button>
                      <button
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                        style={{ color: 'var(--white)', background: 'rgba(255,255,255,0.06)' }}
                        onClick={() => openEdit(p)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                        onClick={() => confirmDelete(p.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CATEGORIES TAB ───────────────────────────────────────────────── */}
        {activeTab === 'categories' && (
          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Categories appear as filter pills on the listing page.
              </p>
              <button className="btn-primary px-5 py-2 text-sm" onClick={addCategory}>
                + Add Category
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {data.categories.map((cat) => (
                <div
                  key={cat.id}
                  className="glass-card flex items-center gap-4 p-4"
                  style={{ borderRadius: '0.75rem' }}
                >
                  <input
                    className="flex-1 bg-transparent text-sm border-0 outline-none"
                    style={{ color: 'var(--white)' }}
                    value={cat.name}
                    placeholder="Category name"
                    onChange={(e) => {
                      updateCategory(cat.id, 'name', e.target.value);
                      updateCategory(cat.id, 'slug', slugify(e.target.value));
                    }}
                  />
                  <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }}>
                    {cat.slug || 'auto-slug'}
                  </span>
                  <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--muted)' }}>
                    <input
                      type="checkbox"
                      checked={cat.isVisible}
                      onChange={(e) => updateCategory(cat.id, 'isVisible', e.target.checked)}
                      className="accent-cyan-400"
                    />
                    Visible
                  </label>
                  <button
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                    onClick={() => deleteCategory(cat.id)}
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PAGE CONTENT TAB ─────────────────────────────────────────────── */}
        {activeTab === 'content' && (
          <div className="flex flex-col gap-8 max-w-3xl">

            {/* Hero */}
            <div className="glass-card p-6" style={{ borderRadius: '1rem' }}>
              <h3 className="text-lg font-bold mb-5" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
                Hero Section
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field>
                  <Label>Eyebrow</Label>
                  <input
                    className="admin-input"
                    value={data.hero.eyebrow}
                    onChange={(e) => setData((d) => ({ ...d, hero: { ...d.hero, eyebrow: e.target.value } }))}
                  />
                </Field>
                <Field>
                  <Label>Heading Line 1</Label>
                  <input
                    className="admin-input"
                    value={data.hero.heading1}
                    onChange={(e) => setData((d) => ({ ...d, hero: { ...d.hero, heading1: e.target.value } }))}
                  />
                </Field>
                <Field>
                  <Label>Gradient Heading (line 2)</Label>
                  <input
                    className="admin-input"
                    value={data.hero.heading2Gradient}
                    onChange={(e) => setData((d) => ({ ...d, hero: { ...d.hero, heading2Gradient: e.target.value } }))}
                  />
                </Field>
                <Field>
                  <Label>Primary CTA Label</Label>
                  <input
                    className="admin-input"
                    value={data.hero.ctaPrimary}
                    onChange={(e) => setData((d) => ({ ...d, hero: { ...d.hero, ctaPrimary: e.target.value } }))}
                  />
                </Field>
                <Field>
                  <Label>Secondary CTA Label</Label>
                  <input
                    className="admin-input"
                    value={data.hero.ctaSecondary}
                    onChange={(e) => setData((d) => ({ ...d, hero: { ...d.hero, ctaSecondary: e.target.value } }))}
                  />
                </Field>
                <Field>
                  <Label>Description</Label>
                  <textarea
                    rows={3}
                    className="admin-input resize-none"
                    value={data.hero.description}
                    onChange={(e) => setData((d) => ({ ...d, hero: { ...d.hero, description: e.target.value } }))}
                  />
                </Field>
              </div>
            </div>

            {/* Stats */}
            <div className="glass-card p-6" style={{ borderRadius: '1rem' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
                  Stats Row
                </h3>
                <button className="btn-electric px-4 py-2 text-sm" onClick={addStat}>
                  + Add Stat
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {data.stats.map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <input
                      className="admin-input flex-1"
                      placeholder="Value (e.g. 500+)"
                      value={s.value}
                      onChange={(e) => updateStat(s.id, 'value', e.target.value)}
                    />
                    <input
                      className="admin-input flex-1"
                      placeholder="Label (e.g. Student Projects)"
                      value={s.label}
                      onChange={(e) => updateStat(s.id, 'label', e.target.value)}
                    />
                    <button
                      className="text-sm px-3 py-2 rounded-lg shrink-0"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                      onClick={() => deleteStat(s.id)}
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Banner */}
            <div className="glass-card p-6" style={{ borderRadius: '1rem' }}>
              <h3 className="text-lg font-bold mb-5" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
                Bottom CTA Banner
              </h3>
              <div className="flex flex-col gap-4">
                <Field>
                  <Label>Heading</Label>
                  <input
                    className="admin-input"
                    value={data.cta.heading}
                    onChange={(e) => setData((d) => ({ ...d, cta: { ...d.cta, heading: e.target.value } }))}
                  />
                </Field>
                <Field>
                  <Label>Description</Label>
                  <textarea
                    rows={2}
                    className="admin-input resize-none"
                    value={data.cta.description}
                    onChange={(e) => setData((d) => ({ ...d, cta: { ...d.cta, description: e.target.value } }))}
                  />
                </Field>
                <Field>
                  <Label>Button Label</Label>
                  <input
                    className="admin-input"
                    value={data.cta.btnLabel}
                    onChange={(e) => setData((d) => ({ ...d, cta: { ...d.cta, btnLabel: e.target.value } }))}
                  />
                </Field>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── DELETE CONFIRM DIALOG ───────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div
            className="glass-card p-8 max-w-sm w-full text-center"
            style={{ background: 'rgba(4,11,28,0.97)', borderRadius: '1rem' }}
          >
            <div className="text-3xl mb-3">🗑️</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--white)' }}>
              Delete this project?
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
              This cannot be undone. Click "Save Changes" to make permanent.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                className="btn-outline px-6 py-2 text-sm"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 text-sm rounded-full font-semibold"
                style={{ background: '#ef4444', color: '#fff' }}
                onClick={executeDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROJECT EDIT MODAL ──────────────────────────────────────────────── */}
      {showProjectModal && editingProject && (
        <ProjectEditModal
          project={editingProject}
          categories={data.categories}
          onSave={saveProject}
          onClose={() => { setShowProjectModal(false); setEditingProject(null); }}
        />
      )}
    </div>
  );
}

// ── Project Edit Modal ────────────────────────────────────────────────────────

function ProjectEditModal({
  project: initial,
  categories,
  onSave,
  onClose,
}: {
  project: Project;
  categories: ProjectCategory[];
  onSave: (p: Project) => void;
  onClose: () => void;
}) {
  const [p, setP] = useState<Project>(initial);
  const [codeTab, setCodeTab] = useState<CodeTab>('html');

  const updateP = useCallback(<K extends keyof Project>(field: K, value: Project[K]) => {
    setP((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Impact stats helpers
  function addStat() {
    setP((prev) => ({
      ...prev,
      impactStats: [...prev.impactStats, { id: generateId(), value: '', label: '' }],
    }));
  }
  function updateStat(id: string, field: keyof ProjectImpactStat, val: string) {
    setP((prev) => ({
      ...prev,
      impactStats: prev.impactStats.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    }));
  }
  function removeStat(id: string) {
    setP((prev) => ({ ...prev, impactStats: prev.impactStats.filter((s) => s.id !== id) }));
  }

  // Key features helpers
  function updateFeature(i: number, val: string) {
    const next = [...p.keyFeatures];
    next[i] = val;
    setP((prev) => ({ ...prev, keyFeatures: next }));
  }
  function addFeature() { setP((prev) => ({ ...prev, keyFeatures: [...prev.keyFeatures, ''] })); }
  function removeFeature(i: number) {
    setP((prev) => ({ ...prev, keyFeatures: prev.keyFeatures.filter((_, idx) => idx !== i) }));
  }

  // Tech stack helpers
  function updateTech(i: number, val: string) {
    const next = [...p.techStack];
    next[i] = val;
    setP((prev) => ({ ...prev, techStack: next }));
  }
  function addTech() { setP((prev) => ({ ...prev, techStack: [...prev.techStack, ''] })); }
  function removeTech(i: number) {
    setP((prev) => ({ ...prev, techStack: prev.techStack.filter((_, idx) => idx !== i) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(p);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-black/80 overflow-hidden">
      <div
        className="m-auto w-full max-w-3xl max-h-screen flex flex-col"
        style={{
          background: 'rgba(4,11,28,0.97)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
          borderRadius: '1rem',
          maxHeight: '95vh',
        }}
      >
        {/* Modal header */}
        <div
          className="shrink-0 flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
            {initial.title ? `Edit: ${initial.title}` : 'New Project'}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <form id="proj-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 p-6">
          <div className="flex flex-col gap-6">

            {/* Basic Info */}
            <Section title="Basic Info">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field><label className="admin-label">Title</label>
                  <input
                    required
                    className="admin-input"
                    value={p.title}
                    onChange={(e) => {
                      updateP('title', e.target.value);
                      if (!p.slug || p.slug === slugify(initial.title)) {
                        updateP('slug', slugify(e.target.value));
                      }
                    }}
                  />
                </Field>
                <Field><label className="admin-label">Slug (auto-generated)</label>
                  <input
                    className="admin-input"
                    value={p.slug}
                    onChange={(e) => updateP('slug', e.target.value)}
                    placeholder="auto-from-title"
                  />
                </Field>
                <Field>
                  <label className="admin-label">Category</label>
                  <select
                    className="admin-input"
                    value={p.category}
                    onChange={(e) => updateP('category', e.target.value)}
                  >
                    {categories.filter((c) => c.slug !== 'all').map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </Field>
                <Field><label className="admin-label">Award Badge (optional, e.g. 🏆 Best Innovation)</label>
                  <input
                    className="admin-input"
                    value={p.awardBadge ?? ''}
                    onChange={(e) => updateP('awardBadge', e.target.value)}
                    placeholder="🏆 Best Innovation"
                  />
                </Field>
                <Field><label className="admin-label">Cover Image URL</label>
                  <input
                    className="admin-input"
                    value={p.coverImageUrl ?? ''}
                    onChange={(e) => updateP('coverImageUrl', convertImageUrl(e.target.value))}
                    placeholder="Paste any image URL or Google Drive share link"
                  />
                  {p.coverImageUrl && (
                    <div
                      className="mt-2 overflow-hidden rounded-lg"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      <img
                        key={p.coverImageUrl}
                        src={p.coverImageUrl}
                        alt="Cover preview"
                        className="w-full object-cover"
                        style={{ maxHeight: 160 }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          const msg = e.currentTarget.nextElementSibling as HTMLElement | null;
                          if (msg) msg.style.display = 'block';
                        }}
                        onLoad={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'block';
                          const msg = e.currentTarget.nextElementSibling as HTMLElement | null;
                          if (msg) msg.style.display = 'none';
                        }}
                      />
                      <p
                        className="text-xs px-3 py-2"
                        style={{ color: 'var(--orange)', display: 'none' }}
                      >
                        Image failed to load - check the URL or make sure the Google Drive file is shared as "Anyone with the link can view".
                      </p>
                    </div>
                  )}
                </Field>
                <Field className="md:col-span-2"><label className="admin-label">Short Description</label>
                  <textarea
                    required
                    rows={2}
                    className="admin-input resize-none"
                    value={p.shortDescription}
                    onChange={(e) => updateP('shortDescription', e.target.value)}
                  />
                </Field>
              </div>
              <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--muted)' }}>
                  <input
                    type="checkbox"
                    checked={p.isFeatured}
                    onChange={(e) => updateP('isFeatured', e.target.checked)}
                    className="accent-cyan-400"
                  />
                  ⭐ Featured (Innovation Excellence section)
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--muted)' }}>
                  <input
                    type="checkbox"
                    checked={p.visible}
                    onChange={(e) => updateP('visible', e.target.checked)}
                    className="accent-cyan-400"
                  />
                  👁 Visible on site
                </label>
              </div>
            </Section>

            {/* About */}
            <Section title="About the Project">
              <Field><label className="admin-label">Problem Statement</label>
                <textarea
                  rows={3}
                  className="admin-input resize-none"
                  value={p.problemStatement}
                  onChange={(e) => updateP('problemStatement', e.target.value)}
                />
              </Field>
              <Field><label className="admin-label">Solution</label>
                <textarea
                  rows={3}
                  className="admin-input resize-none"
                  value={p.solution}
                  onChange={(e) => updateP('solution', e.target.value)}
                />
              </Field>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="admin-label">Key Features</label>
                  <button type="button" className="text-xs text-cyan-400 hover:underline" onClick={addFeature}>+ Add</button>
                </div>
                <div className="flex flex-col gap-2">
                  {p.keyFeatures.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        className="admin-input flex-1"
                        value={f}
                        placeholder={`Feature ${i + 1}`}
                        onChange={(e) => updateFeature(i, e.target.value)}
                      />
                      <button
                        type="button"
                        className="text-sm px-2 py-1.5 rounded"
                        style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}
                        onClick={() => removeFeature(i)}
                      >✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* Tech Stack */}
            <Section title="Tech Stack">
              <div className="flex flex-wrap gap-2 mb-2">
                {p.techStack.map((t, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <input
                      className="admin-input"
                      style={{ width: 120, fontSize: 13 }}
                      value={t}
                      placeholder="React"
                      onChange={(e) => updateTech(i, e.target.value)}
                    />
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded"
                      style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}
                      onClick={() => removeTech(i)}
                    >✕</button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs btn-electric px-3 py-1.5"
                  onClick={addTech}
                >+ Tag</button>
              </div>
            </Section>

            {/* Impact Stats */}
            <Section title="Impact Stats (variable, shown on detail page)">
              <div className="flex flex-col gap-2">
                {p.impactStats.map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <input
                      className="admin-input"
                      style={{ width: 100 }}
                      placeholder="Value"
                      value={s.value}
                      onChange={(e) => updateStat(s.id, 'value', e.target.value)}
                    />
                    <input
                      className="admin-input flex-1"
                      placeholder="Label"
                      value={s.label}
                      onChange={(e) => updateStat(s.id, 'label', e.target.value)}
                    />
                    <button
                      type="button"
                      className="text-sm px-2 py-1.5 rounded shrink-0"
                      style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}
                      onClick={() => removeStat(s.id)}
                    >✕</button>
                  </div>
                ))}
                <button type="button" className="text-xs text-cyan-400 hover:underline self-start" onClick={addStat}>
                  + Add Stat
                </button>
              </div>
            </Section>

            {/* Student */}
            <Section title="Student Story">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field><label className="admin-label">Student Name</label>
                  <input className="admin-input" value={p.studentName} onChange={(e) => updateP('studentName', e.target.value)} />
                </Field>
                <Field><label className="admin-label">Initials (for avatar fallback)</label>
                  <input className="admin-input" value={p.studentInitials} placeholder="ED" onChange={(e) => updateP('studentInitials', e.target.value)} />
                </Field>
                <Field><label className="admin-label">Cohort / Program</label>
                  <input className="admin-input" value={p.studentCohort} placeholder="Advanced ML Cohort '24" onChange={(e) => updateP('studentCohort', e.target.value)} />
                </Field>
                <Field><label className="admin-label">Photo URL (optional)</label>
                  <input className="admin-input" value={p.studentPhotoUrl ?? ''} placeholder="https://..." onChange={(e) => updateP('studentPhotoUrl', e.target.value)} />
                </Field>
                <Field className="md:col-span-2"><label className="admin-label">Student Quote</label>
                  <textarea rows={3} className="admin-input resize-none" value={p.studentQuote} onChange={(e) => updateP('studentQuote', e.target.value)} />
                </Field>
              </div>
            </Section>

            {/* Mentor */}
            <Section title="Mentor Feedback">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field><label className="admin-label">Mentor Name</label>
                  <input className="admin-input" value={p.mentorName} onChange={(e) => updateP('mentorName', e.target.value)} />
                </Field>
                <Field><label className="admin-label">Mentor Title</label>
                  <input className="admin-input" value={p.mentorTitle} placeholder="Senior AI Researcher" onChange={(e) => updateP('mentorTitle', e.target.value)} />
                </Field>
                <Field className="md:col-span-2"><label className="admin-label">Mentor Quote</label>
                  <textarea rows={3} className="admin-input resize-none" value={p.mentorQuote} onChange={(e) => updateP('mentorQuote', e.target.value)} />
                </Field>
              </div>
            </Section>

            {/* Links */}
            <Section title="Project Links (leave blank to hide buttons)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field><label className="admin-label">Live Demo URL</label>
                  <input className="admin-input" type="url" value={p.liveDemoUrl ?? ''} placeholder="https://..." onChange={(e) => updateP('liveDemoUrl', e.target.value)} />
                </Field>
                <Field><label className="admin-label">Source Code URL</label>
                  <input className="admin-input" type="url" value={p.sourceCodeUrl ?? ''} placeholder="https://github.com/..." onChange={(e) => updateP('sourceCodeUrl', e.target.value)} />
                </Field>
              </div>
            </Section>

            {/* Live Code Demo */}
            <Section title="Live Code Demo">
              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={p.codeRunnerEnabled ?? false}
                  onChange={(e) => updateP('codeRunnerEnabled', e.target.checked)}
                  className="accent-cyan-400 w-4 h-4"
                />
                <span style={{ color: 'var(--muted)' }}>
                  Enable Live Demo - embeds an interactive code runner on the public project page
                </span>
              </label>

              {p.codeRunnerEnabled && (
                <div className="flex flex-col gap-4 mt-1">
                  {/* Tab bar */}
                  <div className="flex gap-1.5">
                    {(['html', 'css', 'js', 'preview'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setCodeTab(tab)}
                        className="px-4 py-1.5 text-xs font-bold rounded-md transition-colors"
                        style={{
                          background: codeTab === tab ? 'var(--electric)' : 'rgba(255,255,255,0.06)',
                          color: codeTab === tab ? '#020818' : 'var(--muted)',
                          border: `1px solid ${codeTab === tab ? 'var(--electric)' : 'var(--border)'}`,
                        }}
                      >
                        {tab === 'preview' ? '▶ Preview' : tab.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Editors */}
                  {codeTab !== 'preview' && (
                    <div
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                      }}
                    >
                      <Editor
                        height="320px"
                        language={codeTab === 'js' ? 'javascript' : codeTab}
                        theme="vs-dark"
                        value={
                          codeTab === 'html' ? (p.codeHtml ?? '')
                          : codeTab === 'css'  ? (p.codeCss ?? '')
                          :                      (p.codeJs ?? '')
                        }
                        onChange={(v) =>
                          updateP(
                            codeTab === 'html' ? 'codeHtml'
                            : codeTab === 'css' ? 'codeCss'
                            :                    'codeJs',
                            v ?? '',
                          )
                        }
                        options={{
                          minimap: { enabled: false },
                          wordWrap: 'on',
                          fontSize: 13,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          tabSize: 2,
                        }}
                      />
                    </div>
                  )}

                  {/* Inline preview */}
                  {codeTab === 'preview' && (
                    <div
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        height: '400px',
                        background: '#fff',
                      }}
                    >
                      <iframe
                        srcDoc={buildSrcDoc(p.codeHtml ?? '', p.codeCss ?? '', p.codeJs ?? '')}
                        sandbox="allow-scripts"
                        title="Admin live preview"
                        className="w-full h-full"
                        style={{ border: 'none' }}
                      />
                    </div>
                  )}

                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    HTML body content · CSS styles · JavaScript - rendered in a fully sandboxed iframe on the public project page. Switch to Preview to check the output before saving.
                  </p>
                </div>
              )}
            </Section>
          </div>
        </form>

        {/* Modal footer */}
        <div
          className="shrink-0 flex justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button type="button" className="btn-outline px-6 py-2 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="proj-form" className="btn-primary px-8 py-2 text-sm">
            Save Project
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section wrapper helper ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4
        className="text-sm font-bold uppercase tracking-widest mb-4 pb-2"
        style={{
          color: 'var(--electric)',
          borderBottom: '1px solid var(--border)',
          fontFamily: 'var(--font-head)',
        }}
      >
        {title}
      </h4>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
