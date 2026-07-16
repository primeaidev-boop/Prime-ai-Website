// Standalone light-theme landing page for /program/:slug
// No main-site Navbar/Footer - this page ships its own sticky header + footer.
// Styling lives in styles/program-page.css (scoped .pp-root).

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProgramBySlug } from '@/data/programPagesData';
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

// ── Image helper: renders placeholder when URL is empty ───────────────────────

function Img({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!src) {
    return (
      <div className={`pp-img-placeholder ${className ?? ''}`} style={style}>
        <span>📷 Add image URL in admin</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} style={style} />;
}

// ── Avatar: circular with placeholder ────────────────────────────────────────

function Avatar({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: number;
}) {
  const sizeStyle: React.CSSProperties = { width: size, height: size, minWidth: size };
  if (!src) {
    return (
      <div className="pp-avatar-placeholder" style={sizeStyle} aria-label={alt}>
        👤
      </div>
    );
  }
  return (
    <img
      src={src}
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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProgramPage() {
  const { slug } = useParams<{ slug: string }>();
  // Synchronous read - localStorage is always available, so there is no async
  // loading phase. This ensures reveal refs are attached before their effects run.
  const page = useMemo(
    () => (slug ? (getProgramBySlug(slug) ?? null) : null),
    [slug],
  );
  const [scrolled, setScrolled] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBatch, setFormBatch] = useState('');

  // Reveal refs
  const rBuild        = useReveal();
  const rDayPlan      = useReveal();
  const rClassroom    = useReveal();
  const rLearners     = useReveal();
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

  // WhatsApp submission
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!page) return;
    const batchLabel = formBatch || (page.batches[0]?.name ?? '');
    const msg = page.whatsappMessageTemplate
      .replace('{name}', formName)
      .replace('{phone}', formPhone)
      .replace('{batch}', batchLabel);
    const url = `https://wa.me/${page.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // Scroll to enroll section
  function scrollToEnroll() {
    document.getElementById('enroll')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (!page) {
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
          <div
            style={{
              fontFamily: 'var(--pp-font-head)',
              fontWeight: 700,
              fontSize: 22,
              color: 'var(--pp-navy-dark)',
            }}
          >
            {page.brandName}
          </div>

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

            <p style={{ color: 'var(--pp-muted)', fontSize: 18, lineHeight: 1.6, marginBottom: 32, maxWidth: 520 }}>
              {page.heroSubtext}
            </p>

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
              <div
                key={day.id}
                className="pp-card-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 16,
                }}
              >
                <div
                  className={`pp-day-circle ${day.phase === 'project' ? 'pp-day-circle-orange' : 'pp-day-circle-blue'}`}
                >
                  {day.number}
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--pp-navy-dark)' }}>
                    {day.title}
                  </p>
                  {day.isProject && (
                    <span
                      className="pp-badge pp-badge-orange"
                      style={{ fontSize: 10, flexShrink: 0, borderRadius: 4, padding: '2px 8px', border: 'none' }}
                    >
                      Project
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Classroom gallery ─────────────────────────────────────── */}
      <section className="pp-section">
        <div ref={rClassroom} className="pp-reveal pp-container">
          <h2 className="pp-h2">{page.classroomTitle}</h2>

          {page.classroomImages.length > 0 && (
            <div className="pp-grid-classroom">
              {page.classroomImages.map((img) => (
                <div
                  key={img.id}
                  className={img.isWide ? 'pp-classroom-wide-cell' : undefined}
                >
                  <Img
                    src={img.url}
                    alt={img.alt}
                    className={`pp-classroom-img${img.isWide ? ' pp-classroom-img-wide' : ''}`}
                  />
                </div>
              ))}
            </div>
          )}
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
            {page.pricingCertImage ? (
              <div className="pp-pricing-cert" style={{ transform: 'rotate(3deg)', transition: 'transform 0.5s', borderRadius: 20, overflow: 'hidden' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(0deg)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(3deg)')}
              >
                <img src={page.pricingCertImage} alt="Certificate" style={{ width: '100%', borderRadius: 20 }} />
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

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    color: 'var(--pp-navy)',
                    marginBottom: 10,
                    fontSize: 15,
                  }}
                >
                  {page.formNameLabel}
                </label>
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
                <label
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    color: 'var(--pp-navy)',
                    marginBottom: 10,
                    fontSize: 15,
                  }}
                >
                  {page.formPhoneLabel}
                </label>
                <input
                  className="pp-input"
                  type="tel"
                  placeholder={page.formPhonePlaceholder}
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    color: 'var(--pp-navy)',
                    marginBottom: 10,
                    fontSize: 15,
                  }}
                >
                  {page.formBatchLabel}
                </label>
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
                style={{ width: '100%', padding: '20px', fontSize: 18 }}
              >
                💬 {page.formSubmitText}
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
              {page.footerCertImage && (
                <img
                  src={page.footerCertImage}
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
