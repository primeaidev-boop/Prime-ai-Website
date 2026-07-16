// Admin CMS for Program Pages (/program/:slug)
// Follows the same glass-card + tab pattern as TutorialsAdmin / ProjectsAdmin.

import { useState, useCallback, useEffect } from 'react';
import {
  loadProgramPagesData,
  saveProgramPagesData,
  emptyProgramPage,
  pgId,
} from '@/data/programPagesData';
import { getPageContent, putPageContent } from '@/api/content';
import { convertImageUrl } from '@/lib/imageUrl';
import type {
  ProgramPage,
  PgNavLink,
  PgBuildCard,
  PgDayItem,
  PgClassroomImage,
  PgLearnerCard,
  PgMentor,
  PgBatch,
  PgTestimonial,
  PgFaq,
  PgFooterLink,
  BatchStatus,
} from '@/data/programPagesData';

// ── Shared admin design tokens (match existing admin pages) ───────────────────

const S = {
  label:   { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  input:   { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--white)', fontSize: 14, outline: 'none' },
  textarea:{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--white)', fontSize: 14, resize: 'vertical' as const, outline: 'none', minHeight: 80 },
  card:    { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' },
  row:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
  section: { marginBottom: 32 },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      style={S.input}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      style={{ ...S.textarea, minHeight: rows * 28 }}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// ── Generic list item controls (up / down / delete) ───────────────────────────

function ListControls({
  idx,
  total,
  onUp,
  onDown,
  onDelete,
}: {
  idx: number;
  total: number;
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
}) {
  const btnStyle: React.CSSProperties = {
    padding: '4px 8px',
    borderRadius: 6,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--muted)',
    cursor: 'pointer',
    fontSize: 13,
  };
  return (
    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
      <button type="button" style={btnStyle} onClick={onUp}   disabled={idx === 0}         title="Move up">↑</button>
      <button type="button" style={btnStyle} onClick={onDown} disabled={idx === total - 1}  title="Move down">↓</button>
      <button
        type="button"
        style={{ ...btnStyle, color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
        onClick={onDelete}
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
}

// ── Add button ────────────────────────────────────────────────────────────────

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        marginTop: 8,
        padding: '8px 16px',
        borderRadius: 8,
        border: '1px dashed rgba(0,212,255,0.4)',
        background: 'rgba(0,212,255,0.05)',
        color: 'var(--electric)',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      + {label}
    </button>
  );
}

// ── Tab system ────────────────────────────────────────────────────────────────

type EditorTab = 'meta' | 'hero' | 'content' | 'people' | 'batches' | 'pricing' | 'form';

const EDITOR_TABS: { id: EditorTab; label: string }[] = [
  { id: 'meta',    label: 'Metadata' },
  { id: 'hero',    label: 'Header & Hero' },
  { id: 'content', label: 'Build & Day Plan' },
  { id: 'people',  label: 'Gallery & People' },
  { id: 'batches', label: 'Batches & Reviews' },
  { id: 'pricing', label: 'Pricing & FAQ' },
  { id: 'form',    label: 'Form & Footer' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function move<T>(arr: T[], from: number, to: number): T[] {
  const a = [...arr];
  const [item] = a.splice(from, 1);
  a.splice(to, 0, item);
  return a;
}

function removeAt<T>(arr: T[], idx: number): T[] {
  return arr.filter((_, i) => i !== idx);
}

// ── Editor modal ──────────────────────────────────────────────────────────────

function ProgramEditor({
  page,
  onSave,
  onClose,
}: {
  page: ProgramPage;
  onSave: (p: ProgramPage) => void;
  onClose: () => void;
}) {
  const [p, setP] = useState<ProgramPage>(page);
  const [tab, setTab] = useState<EditorTab>('meta');

  const set = useCallback(
    <K extends keyof ProgramPage>(key: K, val: ProgramPage[K]) =>
      setP((prev) => ({ ...prev, [key]: val })),
    [],
  );

  // ── Sub-list updater factories ────────────────────────────────────────────

  function navLinkUpdater(idx: number, field: keyof PgNavLink, val: string) {
    const updated = p.navLinks.map((l, i) => (i === idx ? { ...l, [field]: val } : l));
    set('navLinks', updated);
  }

  function buildCardUpdater(idx: number, field: keyof PgBuildCard, val: string) {
    const updated = p.buildCards.map((c, i) => (i === idx ? { ...c, [field]: val } : c));
    set('buildCards', updated);
  }

  function dayItemUpdater<K extends keyof PgDayItem>(idx: number, field: K, val: PgDayItem[K]) {
    const updated = p.dayPlanItems.map((d, i) => (i === idx ? { ...d, [field]: val } : d));
    set('dayPlanItems', updated);
  }

  function galleryUpdater(idx: number, field: keyof PgClassroomImage, val: string | boolean) {
    const updated = p.classroomImages.map((img, i) => (i === idx ? { ...img, [field]: val } : img));
    set('classroomImages', updated);
  }

  function learnerUpdater(idx: number, field: keyof PgLearnerCard, val: string) {
    const updated = p.learnerCards.map((c, i) => (i === idx ? { ...c, [field]: val } : c));
    set('learnerCards', updated);
  }

  function mentorUpdater(idx: number, field: keyof PgMentor, val: string) {
    const updated = p.mentors.map((m, i) => (i === idx ? { ...m, [field]: val } : m));
    set('mentors', updated);
  }

  function batchUpdater<K extends keyof PgBatch>(idx: number, field: K, val: PgBatch[K]) {
    const updated = p.batches.map((b, i) => (i === idx ? { ...b, [field]: val } : b));
    set('batches', updated);
  }

  function testimonialUpdater(idx: number, field: keyof PgTestimonial, val: string) {
    const updated = p.testimonials.map((t, i) => (i === idx ? { ...t, [field]: val } : t));
    set('testimonials', updated);
  }

  function featureUpdater(idx: number, val: string) {
    const updated = p.pricingFeatures.map((f, i) => (i === idx ? { ...f, text: val } : f));
    set('pricingFeatures', updated);
  }

  function faqUpdater(idx: number, field: keyof PgFaq, val: string) {
    const updated = p.faqs.map((f, i) => (i === idx ? { ...f, [field]: val } : f));
    set('faqs', updated);
  }

  function footerLinkUpdater(idx: number, field: keyof PgFooterLink, val: string) {
    const updated = p.footerLinks.map((l, i) => (i === idx ? { ...l, [field]: val } : l));
    set('footerLinks', updated);
  }

  // ── Render tabs ───────────────────────────────────────────────────────────

  function renderMeta() {
    return (
      <div>
        <div style={S.row}>
          <Field label="Slug (URL path: /program/[slug])">
            <Input value={p.slug} onChange={(v) => set('slug', v)} placeholder="10-day-ai" />
          </Field>
          <Field label="Visible (show on site)">
            <select
              style={{ ...S.input, width: 'auto' }}
              value={p.visible ? 'true' : 'false'}
              onChange={(e) => set('visible', e.target.value === 'true')}
            >
              <option value="true">Yes - reachable at /program/{p.slug}</option>
              <option value="false">No - returns 404</option>
            </select>
          </Field>
        </div>
        <Field label="Page Title (browser tab + SEO)">
          <Input value={p.pageTitle} onChange={(v) => set('pageTitle', v)} />
        </Field>
        <Field label="Page Description (meta description)">
          <Textarea value={p.pageDescription} onChange={(v) => set('pageDescription', v)} rows={2} />
        </Field>
      </div>
    );
  }

  function renderHero() {
    return (
      <div>
        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Announcement Bar</p>
        <div style={S.row}>
          <Field label="Announcement Text">
            <Input value={p.announcementText} onChange={(v) => set('announcementText', v)} />
          </Field>
          <Field label={'Badge Text (e.g. "Limited seats")'}>

            <Input value={p.announcementBadge} onChange={(v) => set('announcementBadge', v)} />
          </Field>
        </div>

        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 0 16px' }}>Header</p>
        <div style={S.row}>
          <Field label="Brand Name">
            <Input value={p.brandName} onChange={(v) => set('brandName', v)} />
          </Field>
          <Field label="Header CTA Button Text">
            <Input value={p.headerCtaText} onChange={(v) => set('headerCtaText', v)} />
          </Field>
        </div>

        <Field label="Navigation Links">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {p.navLinks.map((link, idx) => (
              <div key={link.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  style={{ ...S.input, flex: 2 }}
                  value={link.label}
                  placeholder="Label"
                  onChange={(e) => navLinkUpdater(idx, 'label', e.target.value)}
                />
                <input
                  style={{ ...S.input, flex: 1 }}
                  value={link.href}
                  placeholder="#anchor"
                  onChange={(e) => navLinkUpdater(idx, 'href', e.target.value)}
                />
                <ListControls
                  idx={idx} total={p.navLinks.length}
                  onUp={() => set('navLinks', move(p.navLinks, idx, idx - 1))}
                  onDown={() => set('navLinks', move(p.navLinks, idx, idx + 1))}
                  onDelete={() => set('navLinks', removeAt(p.navLinks, idx))}
                />
              </div>
            ))}
            <AddBtn label="Add Nav Link" onClick={() => set('navLinks', [...p.navLinks, { id: pgId(), label: 'New Link', href: '#' }])} />
          </div>
        </Field>

        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 0 16px' }}>Hero Section</p>
        <div style={S.row}>
          <Field label='Heading (before gradient, e.g. "10 Days to Go From")'>
            <Input value={p.heroHeading} onChange={(v) => set('heroHeading', v)} />
          </Field>
          <Field label="Gradient-coloured phrase">
            <Input value={p.heroHeadingGradient} onChange={(v) => set('heroHeadingGradient', v)} />
          </Field>
        </div>
        <Field label="Hero Subtext">
          <Textarea value={p.heroSubtext} onChange={(v) => set('heroSubtext', v)} />
        </Field>
        <div style={S.row}>
          <Field label="Price (e.g. ₹399)">
            <Input value={p.heroPrice} onChange={(v) => set('heroPrice', v)} />
          </Field>
          <Field label="Strikethrough Price">
            <Input value={p.heroStrikePrice} onChange={(v) => set('heroStrikePrice', v)} />
          </Field>
        </div>
        <div style={S.row}>
          <Field label={'Price Badge (e.g. "Launch batch price")'}>

            <Input value={p.heroPriceBadge} onChange={(v) => set('heroPriceBadge', v)} />
          </Field>
          <Field label="CTA Button Text">
            <Input value={p.heroCtaText} onChange={(v) => set('heroCtaText', v)} />
          </Field>
        </div>
        <Field label="Hero Image URL">
          <Input value={p.heroImage} onChange={(v) => set('heroImage', v)} placeholder="https://..." />
        </Field>
        <Field label='Floating Badge Text (e.g. "5 Real Projects · 10 Days")'>
          <Input value={p.heroFloatingBadge} onChange={(v) => set('heroFloatingBadge', v)} />
        </Field>

        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 0 16px' }}>Dark Stat Band</p>
        <div style={S.row}>
          <Field label='Big Number (e.g. "82%")'>
            <Input value={p.statNumber} onChange={(v) => set('statNumber', v)} />
          </Field>
          <Field label="Supporting Text">
            <Input value={p.statText} onChange={(v) => set('statText', v)} />
          </Field>
        </div>
      </div>
    );
  }

  function renderContent() {
    return (
      <div>
        {/* Build Cards */}
        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Build Cards (What You'll Build)</p>
        <Field label="Section Title">
          <Input value={p.buildSectionTitle} onChange={(v) => set('buildSectionTitle', v)} />
        </Field>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
          {p.buildCards.map((card, idx) => (
            <div key={card.id} style={{ ...S.card, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                <div>
                  <label style={S.label}>Image URL</label>
                  <input style={S.input} value={card.image} placeholder="https://..." onChange={(e) => buildCardUpdater(idx, 'image', e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Title</label>
                  <input style={S.input} value={card.title} onChange={(e) => buildCardUpdater(idx, 'title', e.target.value)} />
                </div>
              </div>
              <ListControls
                idx={idx} total={p.buildCards.length}
                onUp={() => set('buildCards', move(p.buildCards, idx, idx - 1))}
                onDown={() => set('buildCards', move(p.buildCards, idx, idx + 1))}
                onDelete={() => set('buildCards', removeAt(p.buildCards, idx))}
              />
            </div>
          ))}
        </div>
        <AddBtn label="Add Build Card" onClick={() => set('buildCards', [...p.buildCards, { id: pgId(), image: '', title: 'New Project' }])} />

        {/* Day Plan */}
        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '32px 0 12px' }}>Day-by-Day Plan</p>
        <Field label="Section Title">
          <Input value={p.dayPlanTitle} onChange={(v) => set('dayPlanTitle', v)} />
        </Field>
        <div style={S.row}>
          <Field label='Blue Pill Label (e.g. "Days 1–5 Master the Toolkit")'>
            <Input value={p.dayPlanPill1} onChange={(v) => set('dayPlanPill1', v)} />
          </Field>
          <Field label='Orange Pill Label (e.g. "Days 6–10 Build 5 Real Projects")'>
            <Input value={p.dayPlanPill2} onChange={(v) => set('dayPlanPill2', v)} />
          </Field>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
          {p.dayPlanItems.map((day, idx) => (
            <div key={day.id} style={{ ...S.card, display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                style={{ ...S.input, width: 50, textAlign: 'center', flexShrink: 0 }}
                type="number"
                value={day.number}
                onChange={(e) => dayItemUpdater(idx, 'number', Number(e.target.value))}
                title="Day number"
              />
              <input
                style={{ ...S.input, flex: 1 }}
                value={day.title}
                placeholder="Day title"
                onChange={(e) => dayItemUpdater(idx, 'title', e.target.value)}
              />
              <select
                style={{ ...S.input, width: 120, flexShrink: 0 }}
                value={day.phase}
                onChange={(e) => dayItemUpdater(idx, 'phase', e.target.value as PgDayItem['phase'])}
                title="Phase"
              >
                <option value="toolkit">Blue</option>
                <option value="project">Orange</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={day.isProject}
                  onChange={(e) => dayItemUpdater(idx, 'isProject', e.target.checked)}
                />
                Project badge
              </label>
              <ListControls
                idx={idx} total={p.dayPlanItems.length}
                onUp={() => set('dayPlanItems', move(p.dayPlanItems, idx, idx - 1))}
                onDown={() => set('dayPlanItems', move(p.dayPlanItems, idx, idx + 1))}
                onDelete={() => set('dayPlanItems', removeAt(p.dayPlanItems, idx))}
              />
            </div>
          ))}
        </div>
        <AddBtn label="Add Day" onClick={() => set('dayPlanItems', [...p.dayPlanItems, { id: pgId(), number: p.dayPlanItems.length + 1, title: 'New Day', isProject: false, phase: 'toolkit' }])} />
      </div>
    );
  }

  function renderPeople() {
    return (
      <div>
        {/* Classroom Gallery */}
        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Classroom Gallery</p>
        <Field label="Section Title">
          <Input value={p.classroomTitle} onChange={(v) => set('classroomTitle', v)} />
        </Field>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
          {p.classroomImages.map((img, idx) => (
            <div key={img.id} style={{ ...S.card, display: 'flex', gap: 10, alignItems: 'center' }}>
              <input style={{ ...S.input, flex: 3 }} value={img.url} placeholder="Image URL" onChange={(e) => galleryUpdater(idx, 'url', e.target.value)} />
              <input style={{ ...S.input, flex: 2 }} value={img.alt} placeholder="Alt text" onChange={(e) => galleryUpdater(idx, 'alt', e.target.value)} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, flexShrink: 0 }}>
                <input type="checkbox" checked={img.isWide} onChange={(e) => galleryUpdater(idx, 'isWide', e.target.checked)} />
                Wide (2-col)
              </label>
              <ListControls
                idx={idx} total={p.classroomImages.length}
                onUp={() => set('classroomImages', move(p.classroomImages, idx, idx - 1))}
                onDown={() => set('classroomImages', move(p.classroomImages, idx, idx + 1))}
                onDelete={() => set('classroomImages', removeAt(p.classroomImages, idx))}
              />
            </div>
          ))}
        </div>
        <AddBtn label="Add Gallery Image" onClick={() => set('classroomImages', [...p.classroomImages, { id: pgId(), url: '', alt: '', isWide: false }])} />

        {/* Learner Cards */}
        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '32px 0 12px' }}>Learner Type Cards</p>
        <Field label="Section Title">
          <Input value={p.learnerSectionTitle} onChange={(v) => set('learnerSectionTitle', v)} />
        </Field>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
          {p.learnerCards.map((card, idx) => (
            <div key={card.id} style={{ ...S.card, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 10 }}>
                <div>
                  <label style={S.label}>Photo URL</label>
                  <input style={S.input} value={card.image} placeholder="https://..." onChange={(e) => learnerUpdater(idx, 'image', e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Title</label>
                  <input style={S.input} value={card.title} onChange={(e) => learnerUpdater(idx, 'title', e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Description</label>
                  <input style={S.input} value={card.desc} onChange={(e) => learnerUpdater(idx, 'desc', e.target.value)} />
                </div>
              </div>
              <ListControls
                idx={idx} total={p.learnerCards.length}
                onUp={() => set('learnerCards', move(p.learnerCards, idx, idx - 1))}
                onDown={() => set('learnerCards', move(p.learnerCards, idx, idx + 1))}
                onDelete={() => set('learnerCards', removeAt(p.learnerCards, idx))}
              />
            </div>
          ))}
        </div>
        <AddBtn label="Add Learner Card" onClick={() => set('learnerCards', [...p.learnerCards, { id: pgId(), image: '', title: 'New Audience', desc: '' }])} />

        {/* Mentors */}
        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '32px 0 12px' }}>Mentors</p>
        <Field label="Section Title">
          <Input value={p.mentorSectionTitle} onChange={(v) => set('mentorSectionTitle', v)} />
        </Field>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
          {p.mentors.map((mentor, idx) => (
            <div key={mentor.id} style={{ ...S.card, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={S.label}>Photo URL</label>
                  <input style={S.input} value={mentor.image} placeholder="https://..." onChange={(e) => mentorUpdater(idx, 'image', e.target.value)} />
                  <label style={{ ...S.label, marginTop: 8 }}>Name</label>
                  <input style={S.input} value={mentor.name} onChange={(e) => mentorUpdater(idx, 'name', e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Role / Title</label>
                  <input style={S.input} value={mentor.role} onChange={(e) => mentorUpdater(idx, 'role', e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Bio</label>
                  <textarea style={S.textarea} value={mentor.bio} rows={3} onChange={(e) => mentorUpdater(idx, 'bio', e.target.value)} />
                </div>
              </div>
              <ListControls
                idx={idx} total={p.mentors.length}
                onUp={() => set('mentors', move(p.mentors, idx, idx - 1))}
                onDown={() => set('mentors', move(p.mentors, idx, idx + 1))}
                onDelete={() => set('mentors', removeAt(p.mentors, idx))}
              />
            </div>
          ))}
        </div>
        <AddBtn label="Add Mentor" onClick={() => set('mentors', [...p.mentors, { id: pgId(), image: '', name: '', role: '', bio: '' }])} />
      </div>
    );
  }

  function renderBatches() {
    return (
      <div>
        {/* Batches */}
        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Batches</p>
        <Field label="Section Title">
          <Input value={p.batchSectionTitle} onChange={(v) => set('batchSectionTitle', v)} />
        </Field>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
          {p.batches.map((batch, idx) => (
            <div key={batch.id} style={{ ...S.card, display: 'flex', gap: 10, alignItems: 'center' }}>
              <input style={{ ...S.input, flex: 1 }} value={batch.name} placeholder="Batch name" onChange={(e) => batchUpdater(idx, 'name', e.target.value)} />
              <input style={{ ...S.input, flex: 2 }} value={batch.datetime} placeholder="Starts DD Month | Morning" onChange={(e) => batchUpdater(idx, 'datetime', e.target.value)} />
              <select
                style={{ ...S.input, width: 140, flexShrink: 0 }}
                value={batch.status}
                onChange={(e) => batchUpdater(idx, 'status', e.target.value as BatchStatus)}
              >
                <option value="Open">Open</option>
                <option value="Filling Fast">Filling Fast</option>
                <option value="Closed">Closed</option>
              </select>
              <input style={{ ...S.input, flex: 1 }} value={batch.seatsText} placeholder="6 seats left" onChange={(e) => batchUpdater(idx, 'seatsText', e.target.value)} />
              <ListControls
                idx={idx} total={p.batches.length}
                onUp={() => set('batches', move(p.batches, idx, idx - 1))}
                onDown={() => set('batches', move(p.batches, idx, idx + 1))}
                onDelete={() => set('batches', removeAt(p.batches, idx))}
              />
            </div>
          ))}
        </div>
        <AddBtn label="Add Batch" onClick={() => set('batches', [...p.batches, { id: pgId(), name: 'Batch', datetime: '', status: 'Open', seatsText: '' }])} />

        {/* Testimonials */}
        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '32px 0 12px' }}>Testimonials</p>
        <Field label="Section Title">
          <Input value={p.testimonialSectionTitle} onChange={(v) => set('testimonialSectionTitle', v)} />
        </Field>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
          {p.testimonials.map((t, idx) => (
            <div key={t.id} style={{ ...S.card, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 3fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={S.label}>Photo URL</label>
                  <input style={S.input} value={t.image} placeholder="https://..." onChange={(e) => testimonialUpdater(idx, 'image', e.target.value)} />
                  <label style={{ ...S.label, marginTop: 8 }}>Name</label>
                  <input style={S.input} value={t.name} onChange={(e) => testimonialUpdater(idx, 'name', e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Quote</label>
                  <textarea style={S.textarea} value={t.quote} onChange={(e) => testimonialUpdater(idx, 'quote', e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Meta (Role · City · Batch)</label>
                  <input style={S.input} value={t.meta} placeholder="Homemaker · Ahmedabad · Batch 5" onChange={(e) => testimonialUpdater(idx, 'meta', e.target.value)} />
                </div>
              </div>
              <ListControls
                idx={idx} total={p.testimonials.length}
                onUp={() => set('testimonials', move(p.testimonials, idx, idx - 1))}
                onDown={() => set('testimonials', move(p.testimonials, idx, idx + 1))}
                onDelete={() => set('testimonials', removeAt(p.testimonials, idx))}
              />
            </div>
          ))}
        </div>
        <AddBtn label="Add Testimonial" onClick={() => set('testimonials', [...p.testimonials, { id: pgId(), image: '', quote: '', name: '', meta: '' }])} />
      </div>
    );
  }

  function renderPricing() {
    return (
      <div>
        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Pricing Card</p>
        <div style={S.row}>
          <Field label="Strikethrough Price">
            <Input value={p.pricingStrikePrice} onChange={(v) => set('pricingStrikePrice', v)} />
          </Field>
          <Field label="Actual Price">
            <Input value={p.pricingActualPrice} onChange={(v) => set('pricingActualPrice', v)} />
          </Field>
        </div>
        <div style={S.row}>
          <Field label='Price Badge (e.g. "Limited time launch offer")'>
            <Input value={p.pricingBadge} onChange={(v) => set('pricingBadge', v)} />
          </Field>
          <Field label="CTA Button Text">
            <Input value={p.pricingCtaText} onChange={(v) => set('pricingCtaText', v)} />
          </Field>
        </div>
        <Field label="Certificate Image URL (shown to the right of pricing card)">
          <Input value={p.pricingCertImage} onChange={(v) => set('pricingCertImage', v)} placeholder="https://..." />
        </Field>

        <Field label="Pricing Features (checklist)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            {p.pricingFeatures.map((f, idx) => (
              <div key={f.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input style={{ ...S.input, flex: 1 }} value={f.text} onChange={(e) => featureUpdater(idx, e.target.value)} placeholder="Feature text" />
                <ListControls
                  idx={idx} total={p.pricingFeatures.length}
                  onUp={() => set('pricingFeatures', move(p.pricingFeatures, idx, idx - 1))}
                  onDown={() => set('pricingFeatures', move(p.pricingFeatures, idx, idx + 1))}
                  onDelete={() => set('pricingFeatures', removeAt(p.pricingFeatures, idx))}
                />
              </div>
            ))}
          </div>
          <AddBtn label="Add Feature" onClick={() => set('pricingFeatures', [...p.pricingFeatures, { id: pgId(), text: '' }])} />
        </Field>

        {/* CTA Banner */}
        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '32px 0 12px' }}>Bottom CTA Banner (orange strip)</p>
        <div style={S.row}>
          <Field label="Banner Text">
            <Input value={p.ctaBannerText} onChange={(v) => set('ctaBannerText', v)} />
          </Field>
          <Field label="Button Text">
            <Input value={p.ctaBannerBtnText} onChange={(v) => set('ctaBannerBtnText', v)} />
          </Field>
        </div>

        {/* FAQ */}
        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '32px 0 12px' }}>FAQ</p>
        <Field label="Section Title">
          <Input value={p.faqSectionTitle} onChange={(v) => set('faqSectionTitle', v)} />
        </Field>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
          {p.faqs.map((faq, idx) => (
            <div key={faq.id} style={{ ...S.card, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={S.label}>Question</label>
                  <input style={S.input} value={faq.question} onChange={(e) => faqUpdater(idx, 'question', e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Answer</label>
                  <textarea style={S.textarea} value={faq.answer} rows={2} onChange={(e) => faqUpdater(idx, 'answer', e.target.value)} />
                </div>
              </div>
              <ListControls
                idx={idx} total={p.faqs.length}
                onUp={() => set('faqs', move(p.faqs, idx, idx - 1))}
                onDown={() => set('faqs', move(p.faqs, idx, idx + 1))}
                onDelete={() => set('faqs', removeAt(p.faqs, idx))}
              />
            </div>
          ))}
        </div>
        <AddBtn label="Add FAQ" onClick={() => set('faqs', [...p.faqs, { id: pgId(), question: '', answer: '' }])} />
      </div>
    );
  }

  function renderFormAndFooter() {
    return (
      <div>
        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Enrollment Form</p>
        <Field label="Form Section Title">
          <Input value={p.formTitle} onChange={(v) => set('formTitle', v)} />
        </Field>
        <div style={S.row}>
          <Field label="Name Field Label">
            <Input value={p.formNameLabel} onChange={(v) => set('formNameLabel', v)} />
          </Field>
          <Field label="Name Field Placeholder">
            <Input value={p.formNamePlaceholder} onChange={(v) => set('formNamePlaceholder', v)} />
          </Field>
        </div>
        <div style={S.row}>
          <Field label="Phone Field Label">
            <Input value={p.formPhoneLabel} onChange={(v) => set('formPhoneLabel', v)} />
          </Field>
          <Field label="Phone Field Placeholder">
            <Input value={p.formPhonePlaceholder} onChange={(v) => set('formPhonePlaceholder', v)} />
          </Field>
        </div>
        <div style={S.row}>
          <Field label="Batch Dropdown Label">
            <Input value={p.formBatchLabel} onChange={(v) => set('formBatchLabel', v)} />
          </Field>
          <Field label="Submit Button Text">
            <Input value={p.formSubmitText} onChange={(v) => set('formSubmitText', v)} />
          </Field>
        </div>
        <div style={S.row}>
          <Field label="WhatsApp Number (digits only, with country code, e.g. 917573055191)">
            <Input value={p.whatsappNumber} onChange={(v) => set('whatsappNumber', v)} placeholder="917573055191" />
          </Field>
        </div>
        <Field label='WhatsApp Message Template (use {name}, {phone}, {batch} as placeholders)'>
          <Textarea value={p.whatsappMessageTemplate} onChange={(v) => set('whatsappMessageTemplate', v)} rows={3} />
        </Field>

        <p style={{ color: 'var(--electric)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '32px 0 12px' }}>Footer</p>
        <div style={S.row}>
          <Field label="Brand Tagline">
            <Input value={p.footerTagline} onChange={(v) => set('footerTagline', v)} />
          </Field>
          <Field label="Address">
            <Input value={p.footerAddress} onChange={(v) => set('footerAddress', v)} />
          </Field>
        </div>
        <div style={S.row}>
          <Field label="Certificate Image URL">
            <Input value={p.footerCertImage} onChange={(v) => set('footerCertImage', v)} placeholder="https://..." />
          </Field>
          <Field label="Copyright Text">
            <Input value={p.footerCopyright} onChange={(v) => set('footerCopyright', v)} />
          </Field>
        </div>

        <Field label='Footer Links (grouped by "Section" heading)'>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            {p.footerLinks.map((link, idx) => (
              <div key={link.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input style={{ ...S.input, flex: 1 }} value={link.section} placeholder="Section" onChange={(e) => footerLinkUpdater(idx, 'section', e.target.value)} />
                <input style={{ ...S.input, flex: 2 }} value={link.label} placeholder="Link label" onChange={(e) => footerLinkUpdater(idx, 'label', e.target.value)} />
                <input style={{ ...S.input, flex: 1 }} value={link.href} placeholder="#anchor or /path" onChange={(e) => footerLinkUpdater(idx, 'href', e.target.value)} />
                <ListControls
                  idx={idx} total={p.footerLinks.length}
                  onUp={() => set('footerLinks', move(p.footerLinks, idx, idx - 1))}
                  onDown={() => set('footerLinks', move(p.footerLinks, idx, idx + 1))}
                  onDelete={() => set('footerLinks', removeAt(p.footerLinks, idx))}
                />
              </div>
            ))}
          </div>
          <AddBtn label="Add Footer Link" onClick={() => set('footerLinks', [...p.footerLinks, { id: pgId(), section: 'Program', label: '', href: '#' }])} />
        </Field>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: 'var(--navy)',
          width: 'min(100vw, 900px)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 28px',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            background: 'var(--navy)',
            zIndex: 10,
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)', margin: 0 }}>
              Edit Program Page
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '2px 0 0' }}>
              /program/{p.slug}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => onSave(p)}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, var(--orange), var(--orange2))',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--muted)',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 2,
            padding: '0 28px',
            borderBottom: '1px solid var(--border)',
            overflowX: 'auto',
          }}
        >
          {EDITOR_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                padding: '14px 18px',
                borderRadius: 0,
                border: 'none',
                borderBottom: tab === t.id ? '2px solid var(--electric)' : '2px solid transparent',
                background: 'transparent',
                color: tab === t.id ? 'var(--electric)' : 'var(--muted)',
                fontWeight: tab === t.id ? 700 : 400,
                cursor: 'pointer',
                fontSize: 13,
                whiteSpace: 'nowrap',
                transition: 'color 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: '28px', flex: 1, overflowY: 'auto' }}>
          {tab === 'meta'    && renderMeta()}
          {tab === 'hero'    && renderHero()}
          {tab === 'content' && renderContent()}
          {tab === 'people'  && renderPeople()}
          {tab === 'batches' && renderBatches()}
          {tab === 'pricing' && renderPricing()}
          {tab === 'form'    && renderFormAndFooter()}
        </div>

        {/* Bottom save bar */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            position: 'sticky',
            bottom: 0,
            background: 'var(--navy)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(p)}
            style={{
              padding: '10px 28px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, var(--orange), var(--orange2))',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main admin page ───────────────────────────────────────────────────────────

export default function ProgramPagesAdmin() {
  const [pages, setPages] = useState<ProgramPage[]>(() => loadProgramPagesData());
  const [editing, setEditing] = useState<ProgramPage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [serverEmpty, setServerEmpty] = useState(false);
  const [pushing, setPushing] = useState(false);

  // Load the published server content on mount. If the server has nothing
  // but this browser has local edits, offer the one-click migration below.
  useEffect(() => {
    getPageContent<ProgramPage[]>('programPages').then((serverPages) => {
      if (Array.isArray(serverPages) && serverPages.length > 0) {
        setPages(serverPages);
        saveProgramPagesData(serverPages); // local copy is cache only
      } else if (localStorage.getItem('primAI_programPages')) {
        setServerEmpty(true);
      }
    });
  }, []);

  // Google Drive share links return HTML, not image bytes - normalize every
  // image field once, at the single save choke-point.
  function normalizeImages(p: ProgramPage): ProgramPage {
    return {
      ...p,
      heroImage: convertImageUrl(p.heroImage),
      pricingCertImage: convertImageUrl(p.pricingCertImage),
      footerCertImage: convertImageUrl(p.footerCertImage),
      buildCards: p.buildCards.map((c) => ({ ...c, image: convertImageUrl(c.image) })),
      classroomImages: p.classroomImages.map((c) => ({ ...c, url: convertImageUrl(c.url) })),
      learnerCards: p.learnerCards.map((c) => ({ ...c, image: convertImageUrl(c.image) })),
      mentors: p.mentors.map((m) => ({ ...m, image: convertImageUrl(m.image) })),
      testimonials: p.testimonials.map((t) => ({ ...t, image: convertImageUrl(t.image) })),
    };
  }

  // Server is the write target; success/failure reflects the real API result.
  async function persist(updated: ProgramPage[]) {
    const normalized = updated.map(normalizeImages);
    setPages(normalized);
    setSaveError('');
    try {
      await putPageContent('programPages', normalized);
      saveProgramPagesData(normalized); // cache of last successful save
      setServerEmpty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError('Save failed - changes are NOT on the server. Check you are still logged in, then save again.');
    }
  }

  async function pushLocalToServer() {
    setPushing(true);
    await persist(loadProgramPagesData());
    setPushing(false);
  }

  function handleSave(updated: ProgramPage) {
    const newPages = pages.map((p) => (p.id === updated.id ? updated : p));
    persist(newPages);
    setEditing(null);
  }

  function handleCreate() {
    const newPage = emptyProgramPage();
    const newPages = [...pages, newPage];
    persist(newPages);
    setEditing(newPage);
  }

  function handleDuplicate(page: ProgramPage) {
    const copy: ProgramPage = {
      ...page,
      id: pgId(),
      slug: `${page.slug}-copy`,
      visible: false,
      pageTitle: `${page.pageTitle} (Copy)`,
    };
    persist([...pages, copy]);
  }

  function handleDelete(id: string) {
    persist(pages.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  }

  function handleToggleVisible(id: string) {
    persist(pages.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)));
  }

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--white)', margin: 0 }}>
            Program Pages
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            Standalone light-theme landing pages reachable at <code style={{ color: 'var(--electric)' }}>/program/:slug</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {saved && (
            <span style={{ color: '#4ade80', fontSize: 13, fontWeight: 600 }}>✓ Saved to server</span>
          )}
          {saveError && (
            <span style={{ color: '#f87171', fontSize: 13, fontWeight: 600, maxWidth: 320 }}>{saveError}</span>
          )}
          {serverEmpty && (
            <button
              type="button"
              onClick={pushLocalToServer}
              disabled={pushing}
              className="btn-electric"
              style={{ padding: '10px 18px', fontSize: 13 }}
            >
              {pushing ? 'Pushing…' : '⬆ Push local content to server'}
            </button>
          )}
          <button
            type="button"
            onClick={handleCreate}
            className="btn-primary"
            style={{ padding: '10px 22px' }}
          >
            + New Program Page
          </button>
        </div>
      </div>

      {/* Pages list */}
      {pages.length === 0 ? (
        <div
          className="glass-card"
          style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}
        >
          <p style={{ marginBottom: 16, fontSize: 16 }}>No program pages yet.</p>
          <button
            type="button"
            onClick={handleCreate}
            className="btn-primary"
            style={{ padding: '12px 28px' }}
          >
            Create your first program page
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pages.map((page) => (
            <div
              key={page.id}
              className="glass-card"
              style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}
            >
              {/* Visible toggle */}
              <button
                type="button"
                onClick={() => handleToggleVisible(page.id)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: `1px solid ${page.visible ? 'rgba(0,212,255,0.4)' : 'var(--border)'}`,
                  background: page.visible ? 'rgba(0,212,255,0.1)' : 'transparent',
                  color: page.visible ? 'var(--electric)' : 'var(--muted)',
                  cursor: 'pointer',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}
                title={page.visible ? 'Published - click to unpublish' : 'Unpublished - click to publish'}
              >
                {page.visible ? '🟢' : '⚫'}
              </button>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--white)' }}>
                    {page.pageTitle || page.slug}
                  </span>
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: 9999,
                      fontSize: 11,
                      fontWeight: 700,
                      background: page.visible ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.06)',
                      color: page.visible ? 'var(--electric)' : 'var(--muted)',
                      border: `1px solid ${page.visible ? 'rgba(0,212,255,0.25)' : 'var(--border)'}`,
                    }}
                  >
                    {page.visible ? 'Live' : 'Draft'}
                  </span>
                </div>
                <div style={{ color: 'var(--electric)', fontSize: 13, marginTop: 2 }}>
                  /program/{page.slug}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
                  {page.batches.length} batch{page.batches.length !== 1 ? 'es' : ''} ·{' '}
                  {page.dayPlanItems.length} days ·{' '}
                  {page.faqs.length} FAQs
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {page.visible && (
                  <a
                    href={`/program/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      color: 'var(--muted)',
                      fontSize: 13,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    title="Open live page"
                  >
                    ↗ Preview
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleDuplicate(page)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    fontSize: 13,
                    transition: 'all 0.2s',
                  }}
                  title="Duplicate"
                >
                  ⧉ Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(page)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid rgba(0,212,255,0.3)',
                    background: 'rgba(0,212,255,0.08)',
                    color: 'var(--electric)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  Edit
                </button>
                {deleteConfirm === page.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleDelete(page.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1px solid rgba(248,113,113,0.4)',
                        background: 'rgba(248,113,113,0.1)',
                        color: '#f87171',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(null)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'transparent',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(page.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid rgba(248,113,113,0.25)',
                      background: 'transparent',
                      color: '#f87171',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                    title="Delete"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <ProgramEditor
          page={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
