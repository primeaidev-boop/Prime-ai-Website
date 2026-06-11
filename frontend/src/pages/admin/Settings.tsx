import { useEffect, useState, useCallback } from 'react';
import { getSettings, updateSetting } from '@/api/admin';
import { useSettingsStore } from '@/store/settingsStore';

// ─── Types ────────────────────────────────────────────────────────

interface FormValues {
  // Hero
  hero_badge_text: string;
  hero_heading_line1: string;
  hero_heading_cyan: string;
  hero_heading_white: string;
  hero_heading_orange: string;
  hero_subtext: string;
  hero_cta1_text: string;
  hero_cta2_text: string;
  // Stats
  hero_students_count: string;
  hero_students_label: string;
  hero_companies_count: string;
  hero_companies_label: string;
  hero_years_count: string;
  hero_years_label: string;
  hero_iso_show: string;
  // Navigation
  nav_logo_text: string;
  nav_cta_text: string;
  nav_link_home: string;
  nav_link_about: string;
  nav_link_courses: string;
  nav_link_contact: string;
  // Banner
  new_batch_banner: string;
  new_batch_text: string;
}

type FormKey = keyof FormValues;

const DEFAULTS: FormValues = {
  hero_badge_text: "India's AI-First Training Institute",
  hero_heading_line1: 'The Future Runs on AI.',
  hero_heading_cyan: 'Are',
  hero_heading_white: 'You',
  hero_heading_orange: 'Ready?',
  hero_subtext: "Join PRIM AI Institute — where school students, professionals & entrepreneurs learn to harness the power of Artificial Intelligence and lead the next decade.",
  hero_cta1_text: 'Book Your Free Demo Class',
  hero_cta2_text: 'Explore Courses',
  hero_students_count: '5000+',
  hero_students_label: 'Students',
  hero_companies_count: '350+',
  hero_companies_label: 'Companies',
  hero_years_count: '10+',
  hero_years_label: 'Years',
  hero_iso_show: 'true',
  nav_logo_text: 'PRIM AI',
  nav_cta_text: 'Book Free Demo',
  nav_link_home: 'Home',
  nav_link_about: 'About',
  nav_link_courses: 'Courses',
  nav_link_contact: 'Contact',
  new_batch_banner: 'true',
  new_batch_text: 'New Batch Starting Soon — Limited Seats!',
};

// ─── Section definitions ──────────────────────────────────────────

interface FieldDef {
  key: FormKey;
  label: string;
  type?: 'text' | 'textarea' | 'toggle';
  hint?: string;
}

interface SectionDef {
  id: string;
  icon: string;
  title: string;
  accentColor: string;
  fields: FieldDef[];
}

const SECTIONS: SectionDef[] = [
  {
    id: 'hero',
    icon: '🎯',
    title: 'Hero Content',
    accentColor: 'var(--electric)',
    fields: [
      { key: 'hero_badge_text', label: 'Badge Text', hint: 'Shown in the pill above the heading' },
      { key: 'hero_heading_line1', label: 'Heading — Line 1' },
      { key: 'hero_heading_cyan', label: 'Heading — Cyan Word', hint: 'Displays in cyan (#00D4FF)' },
      { key: 'hero_heading_white', label: 'Heading — White Word', hint: 'Displays in white' },
      { key: 'hero_heading_orange', label: 'Heading — Orange Word', hint: 'Displays in orange (#FF6B2B)' },
      { key: 'hero_subtext', label: 'Subtext Paragraph', type: 'textarea' },
      { key: 'hero_cta1_text', label: 'Primary CTA Button Text', hint: 'Orange button (Book Demo)' },
      { key: 'hero_cta2_text', label: 'Secondary CTA Text', hint: 'Ghost link (Explore Courses)' },
    ],
  },
  {
    id: 'stats',
    icon: '📊',
    title: 'Hero Stats',
    accentColor: 'var(--orange)',
    fields: [
      { key: 'hero_students_count', label: 'Students — Number', hint: 'e.g. 5000+' },
      { key: 'hero_students_label', label: 'Students — Label', hint: 'e.g. Students' },
      { key: 'hero_companies_count', label: 'Companies — Number', hint: 'e.g. 350+' },
      { key: 'hero_companies_label', label: 'Companies — Label', hint: 'e.g. Companies' },
      { key: 'hero_years_count', label: 'Years — Number', hint: 'e.g. 10+' },
      { key: 'hero_years_label', label: 'Years — Label', hint: 'e.g. Years' },
      { key: 'hero_iso_show', label: 'Show ISO Certified Pill', type: 'toggle' },
    ],
  },
  {
    id: 'nav',
    icon: '🧭',
    title: 'Navigation',
    accentColor: '#a78bfa',
    fields: [
      { key: 'nav_logo_text', label: 'Logo Text', hint: 'Shown top-left in the navbar' },
      { key: 'nav_cta_text', label: 'Navbar CTA Button Text', hint: 'Orange button in top-right' },
      { key: 'nav_link_home', label: 'Nav Link — Home' },
      { key: 'nav_link_about', label: 'Nav Link — About' },
      { key: 'nav_link_courses', label: 'Nav Link — Courses' },
      { key: 'nav_link_contact', label: 'Nav Link — Contact' },
    ],
  },
  {
    id: 'banner',
    icon: '📢',
    title: 'Batch Banner',
    accentColor: '#f43f5e',
    fields: [
      { key: 'new_batch_banner', label: 'Show Batch Banner', type: 'toggle' },
      { key: 'new_batch_text', label: 'Banner Message Text', hint: 'Orange announcement bar above hero' },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────

export default function Settings() {
  const [form, setForm] = useState<FormValues>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [sectionSaving, setSectionSaving] = useState<string | null>(null);
  const [sectionSaved, setSectionSaved] = useState<string | null>(null);
  const refreshPublic = useSettingsStore((state) => state.fetch);

  useEffect(() => {
    getSettings()
      .then((res) => {
        const raw = res.data as Record<string, string>;
        setForm((prev) => {
          const next = { ...prev };
          (Object.keys(DEFAULTS) as FormKey[]).forEach((k) => {
            if (raw[k] !== undefined) next[k] = raw[k];
          });
          return next;
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = useCallback((key: FormKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveSection = async (section: SectionDef) => {
    setSectionSaving(section.id);
    try {
      await Promise.all(section.fields.map((f) => updateSetting(f.key, form[f.key])));
      await refreshPublic();
      setSectionSaved(section.id);
      setTimeout(() => setSectionSaved(null), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSectionSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted)' }}>
        Loading settings…
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
            Homepage Content
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            All changes update the live website immediately after saving.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline text-sm px-5 py-2 flex items-center gap-2"
        >
          Preview ↗
        </a>
      </div>

      {/* Heading preview card */}
      <div
        className="glass-card p-5 mb-8 rounded-2xl"
        style={{ background: 'rgba(0,0,0,.25)', border: '1px solid rgba(0,212,255,.15)' }}
      >
        <p className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: 'var(--electric)' }}>Live Heading Preview</p>
        <div className="font-bold leading-tight" style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', color: 'var(--white)' }}>
          {form.hero_heading_line1}
          <span className="block">
            <span style={{ color: 'var(--electric)' }}>{form.hero_heading_cyan || 'Are'}</span>
            {' '}
            <span style={{ color: 'var(--white)' }}>{form.hero_heading_white || 'You'}</span>
            {' '}
            <span style={{ color: 'var(--orange)' }}>{form.hero_heading_orange || 'Ready?'}</span>
          </span>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-8">
        {SECTIONS.map((section) => (
          <div key={section.id} className="glass-card rounded-2xl overflow-hidden">
            {/* Section header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,.02)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{section.icon}</span>
                <h2 className="font-bold text-sm" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
                  {section.title}
                </h2>
              </div>
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: section.accentColor, boxShadow: `0 0 6px ${section.accentColor}` }}
              />
            </div>

            {/* Fields */}
            <div className="px-6 py-5 flex flex-col gap-5">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: section.accentColor }}>
                    {field.label}
                  </label>
                  {field.hint && (
                    <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>{field.hint}</p>
                  )}

                  {field.type === 'toggle' ? (
                    <button
                      type="button"
                      onClick={() => set(field.key, form[field.key] === 'true' ? 'false' : 'true')}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{
                        background: form[field.key] === 'true' ? 'rgba(0,212,255,.12)' : 'rgba(255,255,255,.04)',
                        border: `1px solid ${form[field.key] === 'true' ? 'rgba(0,212,255,.3)' : 'var(--border)'}`,
                        color: form[field.key] === 'true' ? 'var(--electric)' : 'var(--muted)',
                      }}
                    >
                      <span
                        className="w-8 h-4 rounded-full relative transition-all duration-200 flex-shrink-0"
                        style={{
                          background: form[field.key] === 'true' ? 'var(--electric)' : 'rgba(255,255,255,.15)',
                        }}
                      >
                        <span
                          className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200"
                          style={{ left: form[field.key] === 'true' ? '18px' : '2px' }}
                        />
                      </span>
                      {form[field.key] === 'true' ? 'Enabled' : 'Disabled'}
                    </button>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={form[field.key]}
                      onChange={(e) => set(field.key, e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[field.key]}
                      onChange={(e) => set(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}

              {/* Save button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => saveSection(section)}
                  disabled={sectionSaving === section.id}
                  className="btn-primary text-sm px-6 py-2"
                  style={{ minWidth: '130px' }}
                >
                  {sectionSaving === section.id
                    ? 'Saving…'
                    : sectionSaved === section.id
                    ? '✓ Saved!'
                    : `Save ${section.title}`}
                </button>
                {sectionSaved === section.id && (
                  <span className="text-xs" style={{ color: 'var(--electric)' }}>
                    Homepage updated live
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
