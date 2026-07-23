// Standalone light-theme landing page for /program/:slug
// No main-site Navbar/Footer - this page ships its own sticky header + footer.
// Styling lives in styles/program-page.css (scoped .pp-root).

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  loadProgramPagesData,
  saveProgramPagesData,
  hasMedia,
  PROGRAM_ENROLLMENT_PROFILE_OPTIONS,
  DEFAULT_HERO_TOOLS,
  DEFAULT_TRUST_COMPANIES,
  DEFAULT_BENEFITS,
  DEFAULT_BONUSES,
} from '@/data/programPagesData';
import { convertImageUrl } from '@/lib/imageUrl';
import { MediaDisplay } from '@/components/shared/MediaDisplay';
import { BenefitIcon, BenefitCheck } from '@/components/shared/benefitIcons';
import type { PgMediaValue } from '@/data/programPagesData';
import { getPageContent } from '@/api/content';
import { submitProgramEnrollment } from '@/api/programEnrollments';
import { queueFailedEnrollment, flushQueuedEnrollments } from '@/lib/enrollmentQueue';
import type { ProgramPage as ProgramPageData } from '@/data/programPagesData';
import type {
  PgBatch,
  PgBuildCard,
  PgDayItem,
  PgFaq,
  PgFooterLink,
  PgLearnerCard,
  PgMentor,
  PgTestimonial,
} from '@/data/programPagesData';
import '@/styles/program-page.css';

// Renders text with every literal "FREE" emphasized in orange (bonuses footer).
function withFreeHighlight(text: string): React.ReactNode {
  return text.split(/(FREE)/g).map((part, i) =>
    part === 'FREE'
      ? <strong key={i} style={{ color: 'var(--pp-orange)' }}>FREE</strong>
      : <span key={i}>{part}</span>,
  );
}

const formLabelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  color: 'var(--pp-navy)',
  marginBottom: 10,
  fontSize: 15,
};

// ── Scroll-reveal hook ────────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          obs.disconnect();
        }
      },
      { threshold: 0.07 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── Image/video helper: renders placeholder when the slot is empty ────────────

function Img({
  src,
  alt,
  className,
  style,
}: {
  src: PgMediaValue;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return <MediaDisplay media={src} alt={alt} className={className} style={style} />;
}

// ── Avatar: circular with placeholder ────────────────────────────────────────

function Avatar({
  src,
  alt,
  size,
}: {
  src: PgMediaValue;
  alt: string;
  size: number;
}) {
  const sizeStyle: React.CSSProperties = { width: size, height: size, minWidth: size };
  if (!hasMedia(src)) {
    return (
      <div className="pp-avatar-placeholder" style={sizeStyle} aria-label={alt}>
        👤
      </div>
    );
  }
  return (
    <MediaDisplay
      media={src}
      alt={alt}
      className="pp-avatar"
      style={{ ...sizeStyle, objectFit: 'cover' }}
    />
  );
}

// ── Badge by batch status ─────────────────────────────────────────────────────

function BatchBadge({ status }: { status: PgBatch['status'] }) {
  const cls =
    status === 'Open'
      ? 'pp-badge pp-badge-green'
      : status === 'Filling Fast'
        ? 'pp-badge pp-badge-orange'
        : 'pp-badge pp-badge-grey';
  return <span className={cls}>{status}</span>;
}

// ── FAQ row ───────────────────────────────────────────────────────────────────

function FaqRow({ faq }: { faq: PgFaq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pp-faq-item">
      <button
        type="button"
        className="pp-faq-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span style={{ flex: 1 }}>{faq.question}</span>
        <span className={`pp-faq-icon${open ? ' open' : ''}`}>+</span>
      </button>
      {open && <p className="pp-faq-answer">{faq.answer}</p>}
    </div>
  );
}

// ── 10-Day Plan row (collapsed = identical to the original static row; the
// +→× toggle + panel appear only when the day has a description or tools) ─────

function DayRow({ day }: { day: PgDayItem }) {
  const [open, setOpen] = useState(false);
  const tools = day.tools ?? [];
  const hasDescription = Boolean(day.description?.trim());
  const hasExpandable = hasDescription || tools.length > 0;

  return (
    <div className="pp-card-sm" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className={`pp-day-circle ${day.phase === 'project' ? 'pp-day-circle-orange' : 'pp-day-circle-blue'}`}>
          {day.number}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--pp-navy-dark)' }}>
            {day.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {day.isProject && (
              <span
                className="pp-badge pp-badge-orange"
                style={{ fontSize: 10, borderRadius: 4, padding: '2px 8px', border: 'none' }}
              >
                Project
              </span>
            )}
            {hasExpandable && (
              <button
                type="button"
                className="pp-day-toggle"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label={open ? 'Hide day details' : 'Show day details'}
              >
                <span className={`pp-day-toggle-icon${open ? ' open' : ''}`}>+</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {hasExpandable && (
        <div className={`pp-day-panel${open ? ' open' : ''}`}>
          <div className="pp-day-panel-inner">
            {hasDescription && (
              <p style={{ color: 'var(--pp-muted)', fontSize: 14, lineHeight: 1.55 }}>
                {day.description}
              </p>
            )}
            {tools.length > 0 && (
              <div className="pp-pill-row">
                {tools.map((tool) => (
                  <span key={tool.id} className="pp-pill">
                    {tool.logo && <img src={convertImageUrl(tool.logo)} alt={tool.name} loading="lazy" />}
                    <span>{tool.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProgramPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  // Paint immediately from the local cache/bundled defaults, then replace with
  // the published server content so every visitor sees the admin's real edits.
  const [pages, setPages] = useState<ProgramPageData[]>(() => loadProgramPagesData());
  const [serverChecked, setServerChecked] = useState(false);
  useEffect(() => {
    getPageContent<ProgramPageData[]>('programPages')
      .then((serverPages) => {
        if (Array.isArray(serverPages) && serverPages.length > 0) {
          setPages(serverPages);
          saveProgramPagesData(serverPages); // demoted to cache of last fetch
        }
      })
      .finally(() => setServerChecked(true));
  }, []);
  const page = useMemo(
    () => (slug ? (pages.find((p) => p.slug === slug && p.visible) ?? null) : null),
    [pages, slug],
  );
  const [scrolled, setScrolled] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBatch, setFormBatch] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formUserType, setFormUserType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [captureFailed, setCaptureFailed] = useState(false);
  const [failedWaUrl, setFailedWaUrl] = useState('');

  // Best-effort retry of any enrollment that failed to reach the backend on
  // a previous visit - the visitor never sees this, WhatsApp already opened.
  useEffect(() => { void flushQueuedEnrollments(); }, []);

  // Reveal refs
  const rBuild        = useReveal();
  const rDayPlan      = useReveal();
  const rClassroom    = useReveal();
  const rLearners     = useReveal();
  const rBonuses      = useReveal();
  const rMentors      = useReveal();
  const rBatches      = useReveal();
  const rTestimonials = useReveal();
  const rPricing      = useReveal();
  const rEnroll       = useReveal();
  const rFaq          = useReveal();

  // Page title + meta
  useEffect(() => {
    if (!page) return;
    const prev = document.title;
    document.title = page.pageTitle;
    const metaDesc = document.head.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') ?? '';
    metaDesc?.setAttribute('content', page.pageDescription);
    return () => {
      document.title = prev;
      metaDesc?.setAttribute('content', prevDesc);
    };
  }, [page]);

  // Sticky header shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Capture-first submission: record the enrollment in our DB, then hand off
  // to the Thank You page, which owns the WhatsApp redirect (countdown +
  // always-visible manual button). The page is only reached on a CONFIRMED
  // capture - if the API call fails we fall back to the old direct-WhatsApp
  // safety net instead, since we can't show a "thank you" for a submission
  // we don't know reached the backend.
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!page) return;

    const phoneValid = /^[6-9]\d{9}$/.test(formPhone.trim());
    if (!phoneValid) {
      alert('Enter a valid 10-digit WhatsApp number.');
      return;
    }

    setCaptureFailed(false);
    const batchLabel = formBatch || (page.batches[0]?.name ?? '');
    const fullName = formName.trim();
    const payload = {
      fullName,
      whatsappNumber: formPhone.trim(),
      ...(page.showCityField && formCity.trim() ? { city: formCity.trim() } : {}),
      ...(page.showEmailField && formEmail.trim() ? { email: formEmail.trim() } : {}),
      ...(page.showUserTypeField && formUserType ? { userType: formUserType } : {}),
      programSlug: page.slug,
      programTitle: page.pageTitle,
      batchName: batchLabel,
    };

    setSubmitting(true);
    try {
      await submitProgramEnrollment(payload);
      navigate(`/program/${page.slug}/thank-you`, {
        state: { fullName, batchName: batchLabel, programTitle: page.pageTitle },
      });
    } catch {
      // Backend capture failed - never block the visitor. Queue it for a
      // best-effort retry on their next visit, attempt WhatsApp directly as
      // before, and also surface a manual link in case the auto-attempt gets
      // blocked (we've crossed an await, so the browser may no longer treat
      // this as a user-gesture-triggered open).
      queueFailedEnrollment(payload);
      const msg = page.whatsappMessageTemplate
        .replace('{name}', fullName)
        .replace('{phone}', formPhone)
        .replace('{batch}', batchLabel);
      const waUrl = `https://wa.me/${page.whatsappNumber}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setFailedWaUrl(waUrl);
      setCaptureFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  // Scroll to enroll section
  function scrollToEnroll() {
    document.getElementById('enroll')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (!page) {
    if (!serverChecked) {
      return <div style={{ minHeight: '100vh', background: '#F5F8FC' }} />;
    }
    return (
      <div style={{ minHeight: '100vh', background: '#F5F8FC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 32, color: '#0F172A' }}>Program not found</h1>
        <p style={{ color: '#475569' }}>The program you're looking for doesn't exist or has been unpublished.</p>
        <a href="/" style={{ color: '#F97316', fontWeight: 700 }}>← Back to Home</a>
      </div>
    );
  }

  // Group footer links by section
  const footerSections = page.footerLinks.reduce<Record<string, PgFooterLink[]>>((acc, link) => {
    if (!acc[link.section]) acc[link.section] = [];
    acc[link.section].push(link);
    return acc;
  }, {});

  // Visible (non-closed) batches for the form dropdown
  const activeBatches = page.batches.filter((b) => b.status !== 'Closed');

  // Older saved content predates these lists - fall back to the bundled
  // defaults so the sections are never empty. An admin-saved empty array
  // (deliberate) still hides the section.
  const heroTools = page.heroTools ?? DEFAULT_HERO_TOOLS;
  const trustCompanies = page.trustBarCompanies ?? DEFAULT_TRUST_COMPANIES;
  const showTrustBar = (page.showTrustBar ?? true) && trustCompanies.length > 0;

  // Live-training section: single media falls back to the old gallery's first
  // image so existing saved content surfaces its main photo with no re-entry.
  const liveMedia = hasMedia(page.classroomMedia)
    ? page.classroomMedia
    : (page.classroomImages?.[0]?.url ?? '');
  // Fall back to the seeded defaults only when the field is ABSENT (older saved
  // content) - an admin who deliberately clears the list keeps an empty one.
  const liveBenefits = page.classroomBenefits ?? DEFAULT_BENEFITS;
  const liveSubtitle =
    page.classroomSubtitle ?? 'Learn live, interact in real-time, and grow with expert guidance.';

  // Bonuses section: fall back to seeded defaults for content saved before it
  // existed; the visibility toggle (default on) hides the whole section.
  const showBonuses = (page.showBonuses ?? true) && (page.bonusCards ?? DEFAULT_BONUSES).length > 0;
  const bonusCards = page.bonusCards ?? DEFAULT_BONUSES;
  const bonusEyebrow = page.bonusEyebrow ?? 'Free with enrollment';
  const bonusHeading = page.bonusHeading ?? 'Bonuses Worth';
  const bonusHeadingHighlight = page.bonusHeadingHighlight ?? '₹20,000+';
  const bonusSubtext =
    page.bonusSubtext ??
    'Premium tools, templates, and resources to accelerate your AI journey. Included FREE with your enrollment.';
  const bonusTotalLabel = page.bonusTotalLabel ?? 'Total Value: ₹20,000+';
  const bonusFooterText =
    page.bonusFooterText ?? 'All these premium bonuses are yours – FREE with your enrollment today!';

  return (
    <div className="pp-root pp-body-mobile-pad" style={{ paddingBottom: 80 }}>

      {/* ── 1. Announcement bar ─────────────────────────────────────── */}
      {page.announcementText && (
        <div className="pp-announcement">
          <span>{page.announcementText}</span>
          {page.announcementBadge && (
            <span
              className="pp-badge pp-badge-orange-solid"
              style={{ fontSize: 10 }}
            >
              {page.announcementBadge}
            </span>
          )}
        </div>
      )}

      {/* ── 2. Sticky header ────────────────────────────────────────── */}
      <header className={`pp-header${scrolled ? ' pp-header-scrolled' : ''}`}>
        <div
          className="pp-container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 24px',
            height: 80,
          }}
        >
          {/* Brand */}
          <img
            src="/Asset%208.svg"
            alt={page.brandName}
            style={{
              height: 'clamp(26px, 6vw, 36px)',
              width: 'auto',
              maxWidth: '55vw',
              flexShrink: 0,
              display: 'block',
            }}
          />

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="pp-desktop-nav">
            {page.navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                style={{
                  color: 'var(--pp-muted)',
                  fontFamily: 'var(--pp-font-body)',
                  textDecoration: 'none',
                  fontSize: 15,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pp-orange)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--pp-muted)')}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <a
            href="#enroll"
            className="pp-btn pp-btn-primary"
            style={{ padding: '12px 28px', fontSize: 15 }}
          >
            {page.headerCtaText}
          </a>
        </div>
      </header>

      {/* ── 3. Hero ─────────────────────────────────────────────────── */}
      <section
        style={{
          paddingTop: 80,
          paddingBottom: 80,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div className="pp-container pp-grid-hero">
          {/* Left */}
          <div style={{ minWidth: 0 }}>
            <h1
              className="pp-display"
              style={{ fontSize: 'clamp(36px, 5vw, 48px)', marginBottom: 24 }}
            >
              {page.heroHeading}{' '}
              <span className="pp-gradient-text">{page.heroHeadingGradient}</span>
            </h1>

            {page.showHeroGuarantee && page.heroGuaranteeText && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 999,
                  padding: '8px 18px',
                  marginBottom: 24,
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden="true">🛡️</span>
                <span style={{ color: 'var(--pp-green)', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
                  {page.heroGuaranteeText}
                </span>
              </div>
            )}

            <p style={{ color: 'var(--pp-muted)', fontSize: 18, lineHeight: 1.6, marginBottom: 32, maxWidth: 520 }}>
              {page.heroSubtext}
            </p>

            {/* Tools marquee */}
            {heroTools.length > 0 && (
              <div style={{ marginBottom: 32, maxWidth: 520 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--pp-muted)',
                    marginBottom: 12,
                  }}
                >
                  {page.heroToolsLabel ?? "Tools You'll Master"}
                </p>
                <div className="pp-marquee">
                  <div className="pp-marquee-track">
                    {[...heroTools, ...heroTools].map((tool, i) => (
                      <div
                        key={`${tool.id}-${i}`}
                        className="pp-tool-tile"
                        aria-hidden={i >= heroTools.length}
                      >
                        <img src={convertImageUrl(tool.logo)} alt={tool.name} loading="lazy" />
                        <span>{tool.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Price row - original: strike stacked ABOVE price (flex-col) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#94A3B8', textDecoration: 'line-through', fontSize: 18 }}>
                  {page.heroStrikePrice}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--pp-font-head)',
                    fontWeight: 700,
                    fontSize: 32,
                    color: 'var(--pp-navy-dark)',
                    lineHeight: 1.2,
                  }}
                >
                  {page.heroPrice}
                </span>
              </div>
              {page.heroPriceBadge && (
                <span
                  className="pp-badge pp-badge-green"
                  style={{ fontSize: 13, padding: '5px 14px', textTransform: 'none', letterSpacing: 0 }}
                >
                  {page.heroPriceBadge}
                </span>
              )}
            </div>

            <a
              href="#enroll"
              className="pp-btn pp-btn-primary"
              style={{ padding: '16px 32px', fontSize: 16 }}
            >
              {page.heroCtaText}
            </a>

            {page.showHeroSocialProof && page.heroSocialProofText && (
              <p
                style={{
                  marginTop: 14,
                  color: 'var(--pp-muted)',
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                }}
              >
                {page.heroSocialProofText}
              </p>
            )}
          </div>

          {/* Right - hero image */}
          <div style={{ minWidth: 0, position: 'relative' }}>
            <Img
              src={page.heroImage}
              alt="Program preview"
              className="pp-card"
              style={{
                width: '100%',
                height: 'auto',
                aspectRatio: '16/10',
                objectFit: 'cover',
                borderRadius: 20,
                display: 'block',
              }}
            />
            {page.heroFloatingBadge && (
              <div
                className="pp-card"
                style={{
                  position: 'absolute',
                  top: -16,
                  right: -16,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--pp-navy-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--pp-green)',
                    flexShrink: 0,
                  }}
                />
                {page.heroFloatingBadge}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 3b. Trust bar ───────────────────────────────────────────── */}
      {showTrustBar && (
        <section
          style={{
            background: '#fff',
            borderTop: '1px solid var(--pp-border)',
            borderBottom: '1px solid var(--pp-border)',
            padding: '28px 24px',
          }}
        >
          <div
            className="pp-container"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px 40px',
            }}
          >
            <span className="pp-trust-label" style={{ color: 'var(--pp-muted)', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
              {page.trustBarLabel ?? 'Trusted by learners from'}
            </span>
            <div className="pp-trustbar">
              {trustCompanies.map((c) => (
                <img key={c.id} src={convertImageUrl(c.logo)} alt={c.name} title={c.name} loading="lazy" />
              ))}
              {(page.trustBarTrailing ?? 'and 500+ more') && (
                <span style={{ color: 'var(--pp-muted)', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {page.trustBarTrailing ?? 'and 500+ more'}
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Stat band ────────────────────────────────────────────── */}
      <section className="pp-dark-band" style={{ padding: '64px 24px' }}>
        <div
          className="pp-container"
          style={{ textAlign: 'center', maxWidth: 896, margin: '0 auto' }}
        >
          <span className="pp-stat-number" style={{ marginBottom: 16 }}>{page.statNumber}</span>
          <p
            style={{
              color: '#fff',
              fontSize: 'clamp(24px, 3vw, 30px)',
              lineHeight: 1.4,
              fontFamily: 'var(--pp-font-head)',
              fontWeight: 600,
            }}
          >
            {page.statText}
          </p>
        </div>
      </section>

      {/* ── 5. What You'll Build ────────────────────────────────────── */}
      <section id="build" className="pp-section">
        <div ref={rBuild} className="pp-reveal pp-container">
          <h2 className="pp-h2">{page.buildSectionTitle}</h2>
          <div className="pp-grid-build">
            {page.buildCards.map((card: PgBuildCard) => (
              <div key={card.id} className="pp-card pp-card-hover" style={{ overflow: 'hidden' }}>
                <Img
                  src={card.image}
                  alt={card.title}
                  style={{ width: '100%', height: 224, objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: 24 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--pp-font-body)',
                      fontWeight: 600,
                      fontSize: 18,
                      color: 'var(--pp-navy-dark)',
                    }}
                  >
                    {card.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. 10-Day Plan ──────────────────────────────────────────── */}
      <section
        id="plan"
        style={{ background: '#F1F4F8', padding: '80px 24px' }}
      >
        <div ref={rDayPlan} className="pp-reveal pp-container">
          <h2 className="pp-h2" style={{ marginBottom: 32 }}>
            {page.dayPlanTitle}
          </h2>

          {/* Pill labels */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 48,
            }}
          >
            <span
              className="pp-btn"
              style={{ background: 'var(--pp-blue)', color: '#fff', padding: '8px 24px', fontSize: 14, cursor: 'default' }}
            >
              {page.dayPlanPill1}
            </span>
            <span
              className="pp-btn"
              style={{ background: 'var(--pp-orange)', color: '#fff', padding: '8px 24px', fontSize: 14, cursor: 'default' }}
            >
              {page.dayPlanPill2}
            </span>
          </div>

          {/* Day grid */}
          <div className="pp-grid-day">
            {page.dayPlanItems.map((day: PgDayItem) => (
              <DayRow key={day.id} day={day} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Live Interactive Online Training ──────────────────────── */}
      <section className="pp-section">
        <div ref={rClassroom} className="pp-reveal pp-container">
          <h2 className="pp-h2" style={{ marginBottom: 12 }}>{page.classroomTitle}</h2>
          {liveSubtitle && (
            <p className="pp-section-sub">{liveSubtitle}</p>
          )}

          <div className="pp-grid-live">
            {/* Left: single 16:9 media (media-first on mobile via source order) */}
            <MediaDisplay
              media={liveMedia}
              alt={page.classroomTitle}
              className="pp-live-media-frame"
            />

            {/* Right: benefits list */}
            {liveBenefits.length > 0 && (
              <div className="pp-benefit-list">
                {liveBenefits.map((b) => (
                  <div key={b.id} className="pp-benefit-card">
                    <div className="pp-benefit-icon">
                      <BenefitIcon name={b.icon} />
                    </div>
                    <div className="pp-benefit-body">
                      <h3 className="pp-benefit-title">{b.title}</h3>
                      {b.description && <p className="pp-benefit-desc">{b.description}</p>}
                    </div>
                    <div className="pp-benefit-check">
                      <BenefitCheck />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 8. Designed for Every Learner ───────────────────────────── */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div ref={rLearners} className="pp-reveal pp-container">
          <h2 className="pp-h2">{page.learnerSectionTitle}</h2>

          <div className="pp-grid-learners">
            {page.learnerCards.map((card: PgLearnerCard) => (
              <div
                key={card.id}
                className="pp-card"
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Avatar src={card.image} alt={card.title} size={128} />
                <h3
                  style={{
                    fontFamily: 'var(--pp-font-head)',
                    fontWeight: 600,
                    fontSize: 18,
                    color: 'var(--pp-navy-dark)',
                    margin: '24px 0 12px',
                  }}
                >
                  {card.title}
                </h3>
                <p style={{ color: 'var(--pp-muted)', fontSize: 16 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8b. Bonuses Worth ₹20,000+ ──────────────────────────────── */}
      {showBonuses && (
        <section className="pp-dark-band" style={{ padding: '80px 24px' }}>
          <div ref={rBonuses} className="pp-reveal pp-container">
            <p className="pp-bonus-eyebrow">{bonusEyebrow}</p>
            <h2 className="pp-bonus-heading">
              {bonusHeading}{bonusHeading && bonusHeadingHighlight ? ' ' : ''}
              <span style={{ color: 'var(--pp-orange)' }}>{bonusHeadingHighlight}</span>
            </h2>
            {bonusSubtext && <p className="pp-bonus-sub">{bonusSubtext}</p>}

            <div className="pp-grid-bonus">
              {bonusCards.map((card) => (
                <div key={card.id} className="pp-bonus-card">
                  <MediaDisplay media={card.image} alt={card.title} className="pp-bonus-img" />
                  <div className="pp-bonus-body">
                    <div className="pp-bonus-title-row">
                      <span className="pp-bonus-icon"><BenefitIcon name={card.icon} /></span>
                      <h3 className="pp-bonus-title">{card.title}</h3>
                    </div>
                    {card.description && <p className="pp-bonus-desc">{card.description}</p>}
                    {card.value && <p className="pp-bonus-value">Value: {card.value}</p>}
                  </div>
                </div>
              ))}
            </div>

            {(bonusTotalLabel || bonusFooterText) && (
              <div className="pp-bonus-total">
                <span className="pp-bonus-total-icon"><BenefitIcon name="gift" /></span>
                {bonusTotalLabel && <span className="pp-bonus-total-label">{bonusTotalLabel}</span>}
                {bonusFooterText && (
                  <span className="pp-bonus-total-text">{withFreeHighlight(bonusFooterText)}</span>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 9. Meet Your Mentors ────────────────────────────────────── */}
      <section id="mentors" className="pp-section">
        <div ref={rMentors} className="pp-reveal pp-container">
          <h2 className="pp-h2">{page.mentorSectionTitle}</h2>

          <div className="pp-grid-mentors">
            {page.mentors.map((mentor: PgMentor) => (
              <div
                key={mentor.id}
                className="pp-card"
                style={{
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Avatar src={mentor.image} alt={mentor.name} size={128} />
                <h3
                  style={{
                    fontFamily: 'var(--pp-font-head)',
                    fontWeight: 600,
                    fontSize: 18,
                    color: 'var(--pp-navy-dark)',
                    margin: '24px 0 4px',
                  }}
                >
                  {mentor.name}
                </h3>
                <p
                  style={{
                    color: 'var(--pp-primary)',
                    fontWeight: 600,
                    fontSize: 14,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 12,
                  }}
                >
                  {mentor.role}
                </p>
                <p style={{ color: 'var(--pp-muted)', fontSize: 16, lineHeight: 1.6 }}>{mentor.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. Pick Your Batch ─────────────────────────────────────── */}
      <section id="batches" style={{ background: '#F1F4F8', padding: '80px 24px' }}>
        <div ref={rBatches} className="pp-reveal pp-container">
          <h2 className="pp-h2">{page.batchSectionTitle}</h2>

          <div className="pp-grid-batches">
            {page.batches.map((batch: PgBatch) => (
              <div
                key={batch.id}
                className="pp-card-sm"
                style={{
                  padding: 24,
                  opacity: batch.status === 'Closed' ? 0.75 : 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 16,
                    gap: 12,
                  }}
                >
                  <div>
                    <h4
                      style={{
                        fontWeight: 700,
                        fontSize: 18,
                        color: 'var(--pp-navy-dark)',
                        marginBottom: 4,
                      }}
                    >
                      {batch.name}
                    </h4>
                    <p style={{ color: 'var(--pp-muted)', fontSize: 14 }}>{batch.datetime}</p>
                  </div>
                  <BatchBadge status={batch.status} />
                </div>
                <p
                  style={{
                    fontWeight: 500,
                    color: batch.status === 'Closed' ? 'var(--pp-muted)' : 'var(--pp-navy)',
                    fontSize: 14,
                  }}
                >
                  {batch.seatsText}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. Testimonials ────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div ref={rTestimonials} className="pp-reveal pp-container">
          <h2 className="pp-h2">{page.testimonialSectionTitle}</h2>

          <div className="pp-grid-testis">
            {page.testimonials.map((t: PgTestimonial) => (
              <div
                key={t.id}
                className="pp-card"
                style={{
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Avatar src={t.image} alt={t.name} size={96} />
                <p
                  style={{
                    fontStyle: 'italic',
                    color: 'var(--pp-muted)',
                    fontSize: 18,
                    lineHeight: 1.6,
                    margin: '24px 0',
                    flex: 1,
                  }}
                >
                  "{t.quote}"
                </p>
                <h4 style={{ fontWeight: 700, fontSize: 16, color: 'var(--pp-navy-dark)', marginBottom: 4 }}>
                  {t.name}
                </h4>
                <p style={{ color: 'var(--pp-primary)', fontWeight: 500, fontSize: 14 }}>{t.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. Pricing ─────────────────────────────────────────────── */}
      <section id="pricing" className="pp-dark-band" style={{ padding: '80px 24px' }}>
        <div ref={rPricing} className="pp-reveal pp-container">
          <div className="pp-grid-pricing">
            {/* Pricing card */}
            <div className="pp-card pp-pricing-card">
              <div style={{ marginBottom: 32 }}>
                <span style={{ color: '#94A3B8', textDecoration: 'line-through', fontSize: 24 }}>
                  {page.pricingStrikePrice}
                </span>
                <div
                  style={{
                    fontFamily: 'var(--pp-font-head)',
                    fontWeight: 700,
                    fontSize: 64,
                    color: 'var(--pp-navy-dark)',
                    lineHeight: 1,
                    marginTop: 4,
                  }}
                >
                  {page.pricingActualPrice}
                </div>
                {page.pricingBadge && (
                  <p style={{ color: 'var(--pp-green)', fontWeight: 600, fontSize: 16, marginTop: 8 }}>
                    {page.pricingBadge}
                  </p>
                )}
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {page.pricingFeatures.map((f) => (
                  <li key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16 }}>
                    <span style={{ color: 'var(--pp-green)', fontWeight: 700, fontSize: 22, flexShrink: 0 }}>✓</span>
                    <span style={{ color: 'var(--pp-navy-dark)' }}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={scrollToEnroll}
                className="pp-btn pp-btn-primary"
                style={{ width: '100%', padding: 20, fontSize: 20 }}
              >
                {page.pricingCtaText}
              </button>
            </div>

            {/* Certificate image - original: hidden md:block */}
            {hasMedia(page.pricingCertImage) ? (
              <div className="pp-pricing-cert" style={{ transform: 'rotate(3deg)', transition: 'transform 0.5s', borderRadius: 20, overflow: 'hidden' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(0deg)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(3deg)')}
              >
                <MediaDisplay media={page.pricingCertImage} alt="Certificate" style={{ width: '100%', borderRadius: 20 }} />
              </div>
            ) : (
              <div className="pp-pricing-cert">
                <div
                  className="pp-img-placeholder"
                  style={{
                    height: 420,
                    borderRadius: 20,
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span>Add certificate image URL in admin</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 13. Enrollment form ──────────────────────────────────────── */}
      <section id="enroll" className="pp-section" style={{ background: '#EEF2F8' }}>
        <div ref={rEnroll} className="pp-reveal" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="pp-card pp-form-card">
            <h2
              className="pp-headline"
              style={{ textAlign: 'center', marginBottom: 32, fontSize: 28, fontWeight: 700 }}
            >
              {page.formTitle}
            </h2>

            {captureFailed && (
              <div
                style={{
                  background: 'rgba(249,115,22,0.1)',
                  border: '1px solid rgba(249,115,22,0.3)',
                  borderRadius: 12,
                  padding: '14px 18px',
                  marginBottom: 24,
                  color: 'var(--pp-orange)',
                  fontWeight: 600,
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                We tried opening WhatsApp for you - your seat request is saved either way.{' '}
                <a href={failedWaUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pp-orange)', fontWeight: 700 }}>
                  Didn't open? Tap here.
                </a>
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div>
                <label style={formLabelStyle}>{page.formNameLabel}</label>
                <input
                  className="pp-input"
                  type="text"
                  placeholder={page.formNamePlaceholder}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={formLabelStyle}>{page.formPhoneLabel}</label>
                <input
                  className="pp-input"
                  type="tel"
                  placeholder={page.formPhonePlaceholder}
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  required
                />
              </div>

              {page.showCityField && (
                <div>
                  <label style={formLabelStyle}>{page.formCityLabel}</label>
                  <input
                    className="pp-input"
                    type="text"
                    placeholder={page.formCityPlaceholder}
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    required
                  />
                </div>
              )}

              {page.showEmailField && (
                <div>
                  <label style={formLabelStyle}>{page.formEmailLabel}</label>
                  <input
                    className="pp-input"
                    type="email"
                    placeholder={page.formEmailPlaceholder}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
              )}

              {page.showUserTypeField && (
                <div>
                  <label style={formLabelStyle}>{page.formUserTypeLabel}</label>
                  <select
                    className="pp-input"
                    value={formUserType}
                    onChange={(e) => setFormUserType(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {PROGRAM_ENROLLMENT_PROFILE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={formLabelStyle}>{page.formBatchLabel}</label>
                <select
                  className="pp-input"
                  value={formBatch}
                  onChange={(e) => setFormBatch(e.target.value)}
                  required
                >
                  {activeBatches.length === 0 && (
                    <option value="">No open batches</option>
                  )}
                  {activeBatches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.datetime})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="pp-btn pp-btn-green"
                disabled={submitting}
                style={{ width: '100%', padding: '20px', fontSize: 18, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Submitting…' : `💬 ${page.formSubmitText}`}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── 14. FAQ ─────────────────────────────────────────────────── */}
      <section id="faq" className="pp-section" style={{ background: '#fff' }}>
        <div ref={rFaq} className="pp-reveal" style={{ maxWidth: 768, margin: '0 auto' }}>
          <h2 className="pp-h2">{page.faqSectionTitle}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {page.faqs.map((faq: PgFaq) => (
              <FaqRow key={faq.id} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 15. Bottom CTA banner ────────────────────────────────────── */}
      <section style={{ background: 'var(--pp-orange)', padding: '64px 24px' }}>
        <div
          className="pp-container"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 32,
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--pp-font-head)',
              fontWeight: 700,
              fontSize: 'clamp(18px, 2.5vw, 28px)',
              color: '#fff',
              maxWidth: 600,
              lineHeight: 1.35,
            }}
          >
            {page.ctaBannerText}
          </h2>
          <a
            href="#enroll"
            className="pp-btn pp-btn-white"
            style={{ padding: '20px 40px', fontSize: 17, color: 'var(--pp-orange)' }}
          >
            {page.ctaBannerBtnText}
          </a>
        </div>
      </section>

      {/* ── 16. Footer ──────────────────────────────────────────────── */}
      <footer style={{ background: 'var(--pp-navy)', color: '#fff', padding: '80px 24px 32px' }}>
        <div className="pp-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 40,
              marginBottom: 56,
            }}
          >
            {/* Brand col */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--pp-font-head)',
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 12,
                }}
              >
                {page.brandName}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 20 }}>
                {page.footerTagline}
              </p>
            </div>

            {/* Link groups */}
            {Object.entries(footerSections).map(([section, links]) => (
              <div key={section}>
                <h4
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    marginBottom: 20,
                    color: '#fff',
                  }}
                >
                  {section}
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        style={{
                          color: 'rgba(255,255,255,0.55)',
                          textDecoration: 'none',
                          fontSize: 14,
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Address + cert */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#fff' }}>Address</h4>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 20 }}>
                {page.footerAddress}
              </p>
              {hasMedia(page.footerCertImage) && (
                <MediaDisplay
                  media={page.footerCertImage}
                  alt="ISO Certified"
                  style={{ width: 120, borderRadius: 10 }}
                />
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: 28,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{page.footerCopyright}</p>
            <div style={{ display: 'flex', gap: 28 }}>
              <a href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none' }}>
                Privacy Policy
              </a>
              <a href="/terms" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none' }}>
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Mobile sticky bottom bar ──────────────────────────────────── */}
      <div className="pp-mobile-bar">
        <div>
          <p style={{ color: 'var(--pp-muted)', fontSize: 13, textDecoration: 'line-through' }}>
            {page.heroStrikePrice}
          </p>
          <p
            style={{
              fontFamily: 'var(--pp-font-head)',
              fontWeight: 700,
              fontSize: 24,
              color: 'var(--pp-navy)',
            }}
          >
            {page.heroPrice}
          </p>
        </div>
        <button
          type="button"
          onClick={scrollToEnroll}
          className="pp-btn pp-btn-primary"
          style={{ padding: '16px 28px', fontSize: 15 }}
        >
          Book My Seat
        </button>
      </div>

      {/* Desktop nav hidden below md - use CSS to manage */}
      <style>{`
        @media (max-width: 767px) {
          .pp-desktop-nav { display: none !important; }
          .pp-header > div > a:last-child { display: none !important; }
        }
      `}</style>
    </div>
  );
}
