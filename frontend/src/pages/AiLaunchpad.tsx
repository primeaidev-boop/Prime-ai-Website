// Standalone campaign landing page — NOT wired into the /admin ContentBlock
// system, no row in the `courses` table. See the implementation plan for the
// design-token and lead-capture-reuse decisions behind this page's choices.

import { useEffect, useRef, useState } from 'react';
import { useModal } from '@/hooks/useModal';
import { useSettingsStore } from '@/store/settingsStore';
import { LaunchpadLeadModal } from '@/components/launchpad/LaunchpadLeadModal';
import { CurriculumTimeline } from '@/components/launchpad/CurriculumTimeline';
import { StatusChip } from '@/components/launchpad/StatusChip';
import {
  CURRICULUM,
  AUDIENCE_CARDS,
  OUTCOMES,
  BATCH_SLOTS,
  FACULTY,
  TESTIMONIALS,
  FAQS,
  PRICING_INCLUDES,
} from '@/data/aiLaunchpadContent';
import '@/styles/launchpad.css';

const PAGE_TITLE = '10-Day AI Launchpad — ₹399 | PRIM AI Institute';
const PAGE_DESCRIPTION =
  'Learn practical AI in 10 live days for ₹399. 5 real projects, certificate included, no coding required. For students, professionals, homemakers & business owners.';

// Same fade-up-on-scroll pattern CoursePage.tsx uses, redefined locally per
// this codebase's existing precedent (the hook isn't exported/shared).
function useReveal(ready: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ready) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('lp-visible'); obs.disconnect(); } },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ready]);
  return ref;
}

function updateMetaTag(selector: string, attr: string, value: string) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export default function AiLaunchpad() {
  const modal = useModal();
  const s = useSettingsStore((state) => state.s);
  const heroRef = useRef<HTMLElement>(null);
  const sampleRef = useRef<HTMLDivElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  const r1 = useReveal(true); // who
  const r2 = useReveal(true); // curriculum
  const r3 = useReveal(true); // outcomes
  const r4 = useReveal(true); // trust band
  const r5 = useReveal(true); // testimonials
  const r6 = useReveal(true); // pricing
  const r7 = useReveal(true); // faq

  // Per-page title + OG/meta override, same pattern as RefundPolicy.tsx's
  // document.title swap, extended to social tags since this is a paid-ad
  // destination. No react-helmet — none of this codebase's pages use it.
  useEffect(() => {
    const prevTitle = document.title;
    const ogTitle = document.head.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? '';
    const ogDesc = document.head.querySelector('meta[property="og:description"]')?.getAttribute('content') ?? '';
    const twTitle = document.head.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ?? '';
    const twDesc = document.head.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ?? '';

    document.title = PAGE_TITLE;
    updateMetaTag('meta[property="og:title"]', 'content', PAGE_TITLE);
    updateMetaTag('meta[property="og:description"]', 'content', PAGE_DESCRIPTION);
    updateMetaTag('meta[name="twitter:title"]', 'content', PAGE_TITLE);
    updateMetaTag('meta[name="twitter:description"]', 'content', PAGE_DESCRIPTION);
    // og:image intentionally left as the site default (/og-image.png) —
    // TODO: supply a dedicated campaign OG image and set it here.

    return () => {
      document.title = prevTitle;
      updateMetaTag('meta[property="og:title"]', 'content', ogTitle);
      updateMetaTag('meta[property="og:description"]', 'content', ogDesc);
      updateMetaTag('meta[name="twitter:title"]', 'content', twTitle);
      updateMetaTag('meta[name="twitter:description"]', 'content', twDesc);
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  const waMessage = "Hi! I'm interested in the 10-Day AI Launchpad (₹399). Please share more details.";
  const waUrl = `https://wa.me/${s.contactWhatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  const scrollToSample = () => {
    sampleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="launchpad-page">

      {/* ── Sticky bottom CTA bar (mobile + desktop) ───────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 px-4 md:px-10 py-3"
        style={{
          background: 'rgba(13,13,13,0.97)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--lp-border)',
          transform: stickyVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s ease',
          // Keep clear of WhatsAppFloat (fixed bottom-right FAB, ~64px+margins).
          paddingRight: 'max(1rem, 88px)',
        }}
      >
        <div className="hidden sm:block">
          <div className="font-bold text-sm" style={{ color: 'var(--lp-white)', fontFamily: 'var(--lp-font-head)' }}>
            10-Day AI Launchpad
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--lp-muted)' }}>
            ₹399 flat · 5 real projects · Certificate included
          </div>
        </div>
        <button onClick={modal.open} className="lp-btn-primary text-xs sm:text-sm px-5 py-2.5 flex-1 sm:flex-none">
          Reserve My Seat — ₹399
        </button>
      </div>

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="pt-16 md:pt-24 pb-14 px-4"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(13,27,42,0.9) 0%, var(--lp-bg) 65%)' }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="lp-anim-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--lp-cyan)', border: '1px solid rgba(34,211,238,0.35)' }}
          >
            <span className="lp-pulse-dot w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--lp-cyan)' }} />
            10 Live Days · Beginner-Friendly · No Coding
          </div>

          <h1
            className="lp-anim-2 text-4xl md:text-6xl font-extrabold mb-5 leading-[1.05]"
            style={{ fontFamily: 'var(--lp-font-head)', letterSpacing: '-1.5px' }}
          >
            <span style={{ color: 'var(--lp-white)' }}>Learn AI in 10 Days.</span>
            <br />
            <span style={{ color: 'var(--lp-orange)' }}>For Just ₹399.</span>
          </h1>

          <p className="lp-anim-3 text-base md:text-lg leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: 'var(--lp-muted)' }}>
            For students, professionals, homemakers, and business owners — no coding, no prior experience needed.
          </p>

          <div className="lp-anim-4 flex flex-wrap justify-center gap-3">
            <button onClick={modal.open} className="lp-btn-primary px-7 py-3 text-sm">
              Reserve My Seat — ₹399
            </button>
            <button onClick={scrollToSample} className="lp-btn-outline px-7 py-3 text-sm">
              Watch a Free Sample Session
            </button>
          </div>
        </div>

        {/* ── 2. Benefit / credibility strip ───────────────────────────── */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="flex flex-wrap justify-center gap-2.5 mb-6">
            {['10 Live Days', '5 Real Projects', 'Certificate Included', 'No Coding Required'].map((pill) => (
              <div
                key={pill}
                className="lp-glass-card flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-semibold"
                style={{ color: 'var(--lp-white)' }}
              >
                {pill}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs" style={{ color: 'var(--lp-muted)' }}>
            <span>🏅 ISO 9001:2015 Certified</span>
            <span>🏛️ PRIM AI Institute</span>
            <span>📍 Ahmedabad</span>
          </div>
        </div>
      </section>

      {/* ── 3. Who This Is For ──────────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ borderTop: '1px solid var(--lp-border)' }}>
        <div ref={r1} className="lp-reveal max-w-5xl mx-auto">
          <div className="lp-section-tag mb-3">Who This Is For</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ fontFamily: 'var(--lp-font-head)' }}>
            Built for Absolute Beginners
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AUDIENCE_CARDS.map((card) => (
              <div
                key={card.id}
                className="lp-glass-card lp-glass-card-hover rounded-2xl p-5"
              >
                <div className="text-2xl mb-3">{card.emoji}</div>
                <h3 className="font-bold text-sm mb-1.5" style={{ fontFamily: 'var(--lp-font-head)' }}>
                  {card.label}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--lp-muted)' }}>{card.benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Curriculum ──────────────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ borderTop: '1px solid var(--lp-border)' }}>
        <div ref={r2} className="lp-reveal max-w-3xl mx-auto">
          <CurriculumTimeline days={CURRICULUM} />
        </div>
      </section>

      {/* ── 5. Outcomes ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ borderTop: '1px solid var(--lp-border)' }}>
        <div ref={r3} className="lp-reveal max-w-5xl mx-auto">
          <div className="lp-section-tag mb-3">After 10 Days</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ fontFamily: 'var(--lp-font-head)' }}>
            What You Walk Away With
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {OUTCOMES.map((o) => (
              <div key={o.id} className="lp-glass-card rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{o.emoji}</div>
                <div className="text-xs font-semibold leading-snug" style={{ color: 'var(--lp-white)' }}>{o.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Trust / proof band: batches, faculty, certificate ────────── */}
      <section className="py-16 px-4" style={{ borderTop: '1px solid var(--lp-border)' }}>
        <div ref={r4} className="lp-reveal max-w-5xl mx-auto grid md:grid-cols-3 gap-5">

          {/* Batch schedule */}
          <div className="lp-glass-card rounded-2xl p-6">
            <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'var(--lp-font-head)' }}>
              Upcoming Batches
            </h3>
            <div className="flex flex-col gap-3">
              {BATCH_SLOTS.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--lp-white)' }}>{slot.dateLabel}</div>
                    <div style={{ color: 'var(--lp-muted)' }}>{slot.timeLabel}</div>
                  </div>
                  <StatusChip status={slot.status} />
                </div>
              ))}
            </div>
            <p className="text-[0.65rem] mt-4" style={{ color: 'var(--lp-muted)' }}>
              Batch dates shown are placeholders pending final scheduling.
            </p>
          </div>

          {/* Faculty */}
          <div className="lp-glass-card rounded-2xl p-6">
            <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'var(--lp-font-head)' }}>
              Your Instructor
            </h3>
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 min-w-14 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--lp-muted)' }}
                aria-label="Faculty photo placeholder"
              >
                👤
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--lp-white)' }}>{FACULTY.name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--lp-muted)' }}>{FACULTY.credential}</div>
              </div>
            </div>
          </div>

          {/* Certificate mockup */}
          <div className="lp-glass-card rounded-2xl p-6 flex flex-col">
            <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'var(--lp-font-head)' }}>
              Certificate of Completion
            </h3>
            <div
              className="flex-1 min-h-24 rounded-xl flex items-center justify-center text-center text-xs px-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed var(--lp-border)', color: 'var(--lp-muted)' }}
              role="img"
              aria-label="Certificate of Completion sample — TODO: replace with real design"
            >
              🏆 Certificate design coming soon
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Testimonials ─────────────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ borderTop: '1px solid var(--lp-border)' }}>
        <div ref={r5} className="lp-reveal max-w-5xl mx-auto">
          <div className="lp-section-tag mb-3">Student Stories</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ fontFamily: 'var(--lp-font-head)' }}>
            Hear From Learners Like You
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="lp-glass-card rounded-2xl p-5 flex flex-col">
                <div
                  className="w-9 h-9 min-w-9 rounded-full flex items-center justify-center text-xs font-bold mb-3"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--lp-muted)' }}
                >
                  👤
                </div>
                <div className="text-[0.65rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--lp-blue)' }}>
                  {t.audience}
                </div>
                <p className="text-xs leading-relaxed italic flex-1 mb-3" style={{ color: 'var(--lp-muted)' }}>
                  "{t.quote}"
                </p>
                <div className="text-xs font-semibold" style={{ color: 'var(--lp-white)' }}>{t.name}</div>
                <div className="text-[0.65rem]" style={{ color: 'var(--lp-muted)' }}>{t.city}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Pricing ──────────────────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ borderTop: '1px solid var(--lp-border)' }}>
        <div ref={r6} className="lp-reveal max-w-md mx-auto">
          <div className="lp-glass-card rounded-3xl p-8 text-center" style={{ borderColor: 'rgba(249,115,22,0.35)' }}>
            <div className="lp-section-tag mb-2">10-Day AI Launchpad</div>
            <div className="text-5xl font-extrabold mb-1" style={{ fontFamily: 'var(--lp-font-head)', color: 'var(--lp-orange)' }}>
              ₹399
            </div>
            <div className="text-xs mb-6" style={{ color: 'var(--lp-muted)' }}>flat price · no hidden fees</div>

            <div className="flex flex-col gap-2.5 text-left mb-6">
              {PRICING_INCLUDES.map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm">
                  <span className="font-bold flex-shrink-0" style={{ color: 'var(--lp-cyan)' }}>✓</span>
                  <span style={{ color: 'var(--lp-white)' }}>{item}</span>
                </div>
              ))}
            </div>

            <button onClick={modal.open} className="lp-btn-primary w-full py-3 text-sm mb-3">
              Reserve My Seat — ₹399
            </button>
            <p className="text-[0.7rem]" style={{ color: 'var(--lp-muted)' }}>
              Seats are limited per live batch — once a batch fills, you'll be offered the next one.
            </p>
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ borderTop: '1px solid var(--lp-border)' }}>
        <div ref={r7} className="lp-reveal max-w-2xl mx-auto">
          <div className="lp-section-tag mb-3">FAQ</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ fontFamily: 'var(--lp-font-head)' }}>
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-2">
            {FAQS.map((faq) => (
              <FaqRow key={faq.id} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Free sample session (secondary CTA target) ───────────────────── */}
      <section className="py-16 px-4" style={{ borderTop: '1px solid var(--lp-border)' }}>
        <div ref={sampleRef} className="max-w-2xl mx-auto text-center">
          <div className="lp-section-tag mb-3">Free Preview</div>
          <h2 className="text-xl md:text-2xl font-bold mb-5" style={{ fontFamily: 'var(--lp-font-head)' }}>
            Watch a Free Sample Session
          </h2>
          <div
            className="lp-glass-card rounded-2xl aspect-video flex items-center justify-center"
            role="img"
            aria-label="Sample session video placeholder"
          >
            {/* TODO: paste real sample-session video URL / embed here */}
            <div className="flex flex-col items-center gap-2" style={{ color: 'var(--lp-muted)' }}>
              <span className="text-3xl">▶️</span>
              <span className="text-xs">Sample session video coming soon</span>
            </div>
          </div>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="lp-btn-outline inline-flex mt-6 px-6 py-2.5 text-sm">
            💬 Ask Us on WhatsApp
          </a>
        </div>
      </section>

      {/* ── 11. Final CTA + lead capture modal ───────────────────────────── */}
      <section className="py-20 px-4 text-center pb-32" style={{ borderTop: '1px solid var(--lp-border)' }}>
        <div className="max-w-xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight"
            style={{ fontFamily: 'var(--lp-font-head)', letterSpacing: '-1.5px' }}
          >
            Your AI Journey Starts at ₹399.
          </h2>
          <p className="mb-8" style={{ color: 'var(--lp-muted)' }}>
            10 live days. 5 real projects. One certificate. Zero coding required.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={modal.open} className="lp-btn-primary px-8 py-3 text-base">
              Reserve My Seat — ₹399
            </button>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="lp-btn-outline px-8 py-3 text-base">
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <LaunchpadLeadModal isOpen={modal.isOpen} onClose={modal.close} />
    </div>
  );
}

function FaqRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lp-glass-card rounded-xl overflow-hidden" style={{ borderColor: open ? 'rgba(59,130,246,0.4)' : 'var(--lp-border)' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
      >
        <span className="font-semibold text-sm" style={{ color: 'var(--lp-white)' }}>{question}</span>
        <span
          className="w-6 h-6 min-w-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold"
          style={{
            border: `1px solid ${open ? 'var(--lp-blue)' : 'var(--lp-border)'}`,
            color: open ? 'var(--lp-blue)' : 'var(--lp-muted)',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'all 0.3s',
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--lp-muted)' }}>
          {answer}
        </div>
      )}
    </div>
  );
}
