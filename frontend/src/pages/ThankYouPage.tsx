// Standalone light-theme "Thank You" page for /program/:slug/thank-you.
// Reached only after a confirmed enrollment capture (see handleFormSubmit in
// ProgramPage.tsx) - this page never submits anything itself, so refreshing
// it can never double-capture a lead.
// No main-site Navbar/Footer/dark mode - shares styles/program-page.css with
// the program page so the funnel feels continuous.

import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { loadProgramPagesData, saveProgramPagesData } from '@/data/programPagesData';
import { getPageContent } from '@/api/content';
import type { ProgramPage as ProgramPageData } from '@/data/programPagesData';
import '@/styles/program-page.css';

interface ThankYouState {
  fullName?: string;
  batchName?: string;
  programTitle?: string;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: 'var(--pp-muted)', fontSize: 13, fontWeight: 600 }}>{label}</span>
      <span style={{ color: 'var(--pp-navy-dark)', fontSize: 14, fontWeight: 700, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function ThankYouPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  // A direct visit / refresh has no navigation state - fall back to generic
  // content rather than crash or leak a previous visitor's details.
  const state = (location.state ?? {}) as ThankYouState;

  const [pages, setPages] = useState<ProgramPageData[]>(() => loadProgramPagesData());
  const [serverChecked, setServerChecked] = useState(false);
  useEffect(() => {
    getPageContent<ProgramPageData[]>('programPages')
      .then((serverPages) => {
        if (Array.isArray(serverPages) && serverPages.length > 0) {
          setPages(serverPages);
          saveProgramPagesData(serverPages);
        }
      })
      .finally(() => setServerChecked(true));
  }, []);

  const page = slug ? (pages.find((p) => p.slug === slug && p.visible) ?? null) : null;

  const countdownTotal = page?.thankYouCountdownSeconds ?? 3;
  const [secondsLeft, setSecondsLeft] = useState(countdownTotal);
  const autoOpened = useRef(false);

  // The first render may use the bundled default before server content
  // arrives - re-sync once the admin's actual configured duration loads.
  useEffect(() => { setSecondsLeft(countdownTotal); }, [countdownTotal]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  useEffect(() => {
    if (!page) return;
    document.title = `Thank You - ${page.pageTitle}`;
  }, [page]);

  const programName = state.programTitle || page?.pageTitle || '';
  const hasSummary = Boolean(state.fullName && state.batchName);
  // Fall back to the seeded defaults for every thank-you field: content saved
  // before the thank-you feature existed has none of them, and calling
  // .replace() on an undefined template would crash the whole page.
  const heading = page?.thankYouHeading || 'Thank You! Your Seat Request is Received 🎉';
  const subtext = page?.thankYouSubtext || 'Our team will confirm your enrollment on WhatsApp shortly.';
  const template =
    page?.thankYouWhatsappMessageTemplate ||
    "Hi, I'm {name}. I just booked my seat for {program} – {batch}. Please confirm my enrollment.";
  // A direct/refreshed visit has no name or batch to fill the template with -
  // fall back to a generic enquiry message rather than render blank slots.
  const message = page
    ? hasSummary
      ? template
          .replace('{name}', state.fullName!)
          .replace('{program}', programName)
          .replace('{batch}', state.batchName!)
      : `Hi! I'm interested in ${programName}. Please share enrollment details.`
    : '';
  const waUrl = page ? `https://wa.me/${page.whatsappNumber}?text=${encodeURIComponent(message)}` : '';

  // Best-effort auto-open once the countdown hits zero. iOS Safari and most
  // mobile browsers block navigation that isn't tied to a direct user
  // gesture, so this is a bonus, not the guaranteed path - the manual
  // button below is always visible and is a real <a> click, which always
  // works regardless of what the browser decided about this attempt.
  useEffect(() => {
    if (secondsLeft === 0 && waUrl && !autoOpened.current) {
      autoOpened.current = true;
      window.location.href = waUrl;
    }
  }, [secondsLeft, waUrl]);

  if (!page) {
    if (!serverChecked) {
      return <div style={{ minHeight: '100vh', background: '#F5F8FC' }} />;
    }
    return (
      <div style={{ minHeight: '100vh', background: '#F5F8FC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 28, color: '#0F172A' }}>Program not found</h1>
        <a href="/" style={{ color: '#F97316', fontWeight: 700 }}>← Back to Home</a>
      </div>
    );
  }

  return (
    <div
      className="pp-root"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}
    >
      <div
        className="pp-card"
        style={{ maxWidth: 480, width: '100%', padding: 'clamp(28px, 6vw, 48px) clamp(20px, 5vw, 32px)', textAlign: 'center' }}
      >
        <div style={{ fontSize: 56, marginBottom: 8, lineHeight: 1 }} aria-hidden="true">🎉</div>

        <h1 className="pp-headline" style={{ fontSize: 'clamp(22px, 5vw, 26px)', fontWeight: 700, marginBottom: 12 }}>
          {heading}
        </h1>

        <p style={{ color: 'var(--pp-muted)', fontSize: 16, lineHeight: 1.6, marginBottom: 28 }}>
          {subtext}
        </p>

        {hasSummary && (
          <div
            className="pp-card-sm"
            style={{ textAlign: 'left', padding: 20, marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <SummaryRow label="Name" value={state.fullName!} />
            <SummaryRow label="Program" value={programName} />
            <SummaryRow label="Batch" value={state.batchName!} />
          </div>
        )}

        <div
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 24,
            color: 'var(--pp-green)',
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {secondsLeft > 0
            ? `Opening WhatsApp in ${secondsLeft}…`
            : "Didn't open? Tap the button below."}
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pp-btn pp-btn-green"
          style={{ width: '100%', padding: 18, fontSize: 17, display: 'block', boxSizing: 'border-box' }}
        >
          💬 Open WhatsApp Now
        </a>

        <Link
          to={`/program/${page.slug}`}
          style={{ display: 'inline-block', marginTop: 24, color: 'var(--pp-muted)', fontSize: 14, textDecoration: 'none' }}
        >
          ← Back to program page
        </Link>
      </div>
    </div>
  );
}
