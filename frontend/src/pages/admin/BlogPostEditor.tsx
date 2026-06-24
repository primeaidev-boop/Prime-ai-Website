import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Save } from 'lucide-react';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { ImageUploadDropzone } from '@/components/admin/ImageUploadDropzone';
import ToggleSwitch from '@/components/admin/ToggleSwitch';
import {
  adminFetchPost, adminCreatePost, adminUpdatePost,
  adminFetchCategories, adminFetchTags, adminFetchAuthors,
  adminCreateCategory, adminCreateTag, adminCreateAuthor, adminUpdateAuthor,
  type BlogCategory, type BlogTag, type BlogAuthor,
} from '@/api/blog';

// ─── Slug generator ────────────────────────────────────────────────────────

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

// ─── Quick-add dialogs ─────────────────────────────────────────────────────

function QuickAddInput({
  label,
  placeholder,
  onAdd,
  loading,
}: {
  label: string;
  placeholder: string;
  onAdd: (name: string) => Promise<void>;
  loading: boolean;
}) {
  const [val, setVal] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!val.trim()) return;
    await onAdd(val.trim());
    setVal('');
  }
  return (
    <form onSubmit={submit} className="flex gap-2 mt-2">
      <input
        type="text"
        placeholder={placeholder}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="flex-1 text-sm"
        style={{ padding: '0.4rem 0.75rem', minHeight: '36px' }}
      />
      <button
        type="submit"
        disabled={loading || !val.trim()}
        className="px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-40"
        style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--electric)', border: '1px solid rgba(0,212,255,0.25)', whiteSpace: 'nowrap' }}
      >
        {loading ? '…' : `+ ${label}`}
      </button>
    </form>
  );
}

// ─── Main editor ───────────────────────────────────────────────────────────

const EXCERPT_MAX = 300;

export default function BlogPostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [categoryId, setCategoryId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showAuthor, setShowAuthor] = useState(true);

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingRef, setLoadingRef] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [addingAuthor, setAddingAuthor] = useState(false);

  // Controlled body state — bodyContent feeds into RichTextEditor as initial/async
  // loaded value; bodyHtml is what onChange keeps current for saving.
  const [bodyContent, setBodyContent] = useState<string | undefined>(undefined);
  const [bodyHtml, setBodyHtml] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const loadRefs = useCallback(async () => {
    setLoadingRef(true);
    const [cats, tgs, auths] = await Promise.all([
      adminFetchCategories(),
      adminFetchTags(),
      adminFetchAuthors(),
    ]).finally(() => setLoadingRef(false));
    setCategories(cats);
    setTags(tgs);
    setAuthors(auths);
    return { cats, auths };
  }, []);

  useEffect(() => {
    loadRefs().then(({ cats, auths }) => {
      if (isNew) {
        if (cats.length > 0) setCategoryId(cats[0].id);
        if (auths.length > 0) setAuthorId(auths[0].id);
        return;
      }
      adminFetchPost(id!).then((post) => {
        setTitle(post.title);
        setSlug(post.slug);
        setSlugManual(true);
        setExcerpt(post.excerpt);
        setCoverImageUrl(post.coverImageUrl);
        setStatus(post.status);
        setCategoryId(post.category.id);
        setAuthorId(post.author.id);
        setSelectedTagIds(post.tags.map((t) => t.id));
        setShowAuthor(post.showAuthor);
        setBodyContent(post.content ?? '');
      }).catch(() => navigate('/admin/blog'));
    });
  }, [id, isNew, navigate, loadRefs]);

  function onTitleChange(val: string) {
    setTitle(val);
    if (!slugManual) setSlug(toSlug(val));
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  }

  async function addCategory(name: string) {
    setAddingCategory(true);
    try {
      const cat = await adminCreateCategory({ name, slug: toSlug(name) });
      setCategories((prev) => [...prev, cat]);
      setCategoryId(cat.id);
    } finally {
      setAddingCategory(false);
    }
  }

  async function addTag(name: string) {
    setAddingTag(true);
    try {
      const tag = await adminCreateTag({ name, slug: toSlug(name) });
      setTags((prev) => [...prev, tag]);
      setSelectedTagIds((prev) => [...prev, tag.id]);
    } finally {
      setAddingTag(false);
    }
  }

  async function addAuthor(name: string) {
    setAddingAuthor(true);
    try {
      const author = await adminCreateAuthor({ name });
      setAuthors((prev) => [...prev, author]);
      setAuthorId(author.id);
    } finally {
      setAddingAuthor(false);
    }
  }

  async function handleSave(publishNow = false) {
    if (!title.trim() || !slug.trim() || !categoryId || !authorId) return;
    const content = bodyHtml;
    const effectiveStatus = publishNow ? 'PUBLISHED' : status;

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content,
        coverImageUrl: coverImageUrl ?? undefined,
        status: effectiveStatus,
        showAuthor,
        categoryId,
        authorId,
        tagIds: selectedTagIds,
      };

      const saved = isNew
        ? await adminCreatePost(payload)
        : await adminUpdatePost(id!, payload);

      if (publishNow) setStatus('PUBLISHED');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (isNew) navigate(`/admin/blog/${saved.id}/edit`, { replace: true });
    } finally {
      setSaving(false);
    }
  }

  const readTimeEst = Math.max(1, Math.ceil(wordCount / 200));
  const isValid = title.trim().length >= 5 && slug.trim().length >= 3 && categoryId && authorId;

  return (
    <div className="flex h-full" style={{ color: 'var(--white)' }}>
      {/* Main edit area */}
      <div className="flex-1 overflow-y-auto p-8 min-w-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/admin/blog" className="p-2 rounded-lg transition-colors" style={{ color: 'var(--muted)' }}>
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-head)' }}>
                {isNew ? 'New Post' : 'Edit Post'}
              </h1>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Article title…"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full text-3xl font-bold"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                borderRadius: 0,
                padding: '0.5rem 0',
                color: 'var(--white)',
                fontFamily: 'var(--font-head)',
              }}
            />
          </div>

          {/* Slug */}
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--muted)' }}>
              URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--muted)' }}>/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(toSlug(e.target.value)); setSlugManual(true); }}
                className="flex-1 text-sm"
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between" style={{ color: 'var(--muted)' }}>
              <span>Excerpt</span>
              <span className={excerpt.length > EXCERPT_MAX ? 'text-orange-400' : ''}>{excerpt.length}/{EXCERPT_MAX}</span>
            </label>
            <textarea
              rows={3}
              placeholder="A short description of this article (shown in listing cards)…"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value.slice(0, EXCERPT_MAX))}
              className="resize-none"
            />
          </div>

          {/* TipTap editor — shared RichTextEditor component */}
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--muted)' }}>
              Content
            </label>
            <RichTextEditor
              content={bodyContent}
              onChange={setBodyHtml}
              onWordCountChange={setWordCount}
              placeholder="Write your article here…"
              minHeight={400}
              showWordCount
            />
          </div>

          {/* Cover image */}
          <div className="mb-8">
            <ImageUploadDropzone
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              variant="cover"
              label="Cover Image"
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className="w-80 shrink-0 overflow-y-auto p-6 flex flex-col gap-6"
        style={{ borderLeft: '1px solid var(--border)', background: 'rgba(255,255,255,0.015)' }}
      >
        {/* Publish panel */}
        <div className="glass-card p-5 rounded-xl">
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-head)' }}>Publishing</h3>

          <div className="flex flex-col gap-2 mb-4">
            {(['DRAFT', 'PUBLISHED'] as const).map((s) => (
              <label
                key={s}
                className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors"
                style={{
                  background: status === s ? 'rgba(0,212,255,0.08)' : 'transparent',
                  border: `1px solid ${status === s ? 'rgba(0,212,255,0.2)' : 'transparent'}`,
                }}
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="accent-current"
                  style={{ accentColor: 'var(--electric)' }}
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: status === s ? 'var(--white)' : 'var(--muted)' }}>
                    {s === 'DRAFT' ? '○ Draft' : '● Published'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    {s === 'DRAFT' ? 'Not visible to public' : 'Visible at /blog'}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <div className="pt-1 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <ToggleSwitch
              checked={showAuthor}
              onChange={setShowAuthor}
              label="Show Author Details"
            />
          </div>

          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-sm"
            style={{ background: 'rgba(0,212,255,0.06)', color: 'var(--electric)', border: '1px solid rgba(0,212,255,0.15)' }}
          >
            <Clock size={14} />
            <span>~{readTimeEst} min read</span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving || !isValid}
              className="btn-primary w-full text-sm disabled:opacity-40"
            >
              {saving ? 'Saving…' : '🚀 Publish Now'}
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving || !isValid}
              className="btn-outline w-full text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Save size={14} />
              {saving ? 'Saving…' : 'Save Draft'}
            </button>
          </div>

          {saved && (
            <p className="text-xs mt-3 text-center" style={{ color: 'var(--electric)' }}>
              ✓ Saved successfully
            </p>
          )}

          {status === 'PUBLISHED' && !isNew && (
            <a
              href={`/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-3 text-xs transition-colors hover:text-white"
              style={{ color: 'var(--muted)' }}
            >
              <Eye size={13} /> View live post
            </a>
          )}
        </div>

        {/* Organization */}
        <div className="glass-card p-5 rounded-xl">
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-head)' }}>Organization</h3>

          {/* Category */}
          <div className="mb-4">
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Category *</label>
            {loadingRef ? (
              <div className="h-9 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
            ) : (
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select category…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            <QuickAddInput label="Category" placeholder="New category name" onAdd={addCategory} loading={addingCategory} />
          </div>

          {/* Author */}
          <div className="mb-4">
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Author *</label>
            {loadingRef ? (
              <div className="h-9 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
            ) : (
              <select value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
                <option value="">Select author…</option>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            )}
            <QuickAddInput label="Author" placeholder="New author name" onAdd={addAuthor} loading={addingAuthor} />

            {/* Author detail editor - shown when an author is selected */}
            {authorId && (() => {
              const sel = authors.find(a => a.id === authorId);
              if (!sel) return null;
              return (
                <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>Author details</p>
                  <ImageUploadDropzone
                    value={sel.avatarUrl ?? undefined}
                    onChange={async (url) => {
                      if (url === undefined) return;
                      await adminUpdateAuthor(authorId, { avatarUrl: url ?? undefined });
                      setAuthors(prev => prev.map(a => a.id === authorId ? { ...a, avatarUrl: url ?? undefined } : a));
                    }}
                    variant="avatar"
                    label="Author photo"
                  />
                  <input
                    key={`desig-${authorId}`}
                    type="text"
                    placeholder="Designation (e.g. Lead Instructor, PRIM AI)"
                    defaultValue={sel.designation ?? ''}
                    className="mt-2"
                    style={{ fontSize: '0.8rem' }}
                    onBlur={async (e) => {
                      const designation = e.target.value.trim();
                      await adminUpdateAuthor(authorId, { designation });
                      setAuthors(prev => prev.map(a => a.id === authorId ? { ...a, designation } : a));
                    }}
                  />
                </div>
              );
            })()}
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted)' }}>Tags</label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => {
                  const active = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: active ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                        color: active ? 'var(--gold)' : 'var(--muted)',
                        border: `1px solid ${active ? 'rgba(251,191,36,0.35)' : 'var(--border)'}`,
                      }}
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            )}
            <QuickAddInput label="Tag" placeholder="New tag name" onAdd={addTag} loading={addingTag} />
          </div>
        </div>
      </aside>

    </div>
  );
}
