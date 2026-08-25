// Site-wide first-visit promo popup for the 10-Day AI program.
//
// Reuses DemoModal's actual patterns: createPortal to document.body, and
// click-on-overlay-to-close (stopPropagation on the panel). Body-scroll-lock
// mirrors the identical 2-line pattern TutorialGateModal/LaunchpadLeadModal
// already use (DemoModal now uses it too - see DemoModal.tsx). That same
// lock is what lets this popup reliably detect "another modal is already
// open" without a new global store: if document.body.style.overflow is
// 'hidden' when the timer fires, something else (DemoModal included) is up,
// so this popup skips itself for this pageview rather than stacking.

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Calendar, GraduationCap, Users, Award, Gift, Clock, X, Check } from 'lucide-react';

const PROGRAM_URL = '/program/10-day-ai-v2?source=popup';
const STORAGE_KEY = 'primai_promo_10day_seen';
const SHOW_AFTER_MS = 4000;
const REPEAT_AFTER_DAYS = 7;

// Every localStorage access is wrapped - private browsing throws on both
// getItem and setItem in some browsers, and this popup must never crash the
// app or block a conversion over an analytics nicety.
function readLastSeen(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function markSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  } catch {
    // Storage unavailable - the popup just won't remember; never throw.
  }
}

const FEATURES = [
  { Icon: Calendar, title: '10 DAYS', subtitle: 'Intensive Live Learning' },
  { Icon: GraduationCap, title: 'PRACTICAL LEARNING', subtitle: 'Build Real AI Projects' },
  { Icon: Users, title: 'EXPERT MENTORS', subtitle: 'Learn from AI Professionals' },
  { Icon: Award, title: 'CERTIFICATE INCLUDED', subtitle: 'Boost Your Career & Portfolio' },
];

const LEARN_LEFT = ['AI Tools & Foundations', 'Prompt Engineering', 'ChatGPT & Advanced AI', 'AI Automations'];
const LEARN_RIGHT = ['Content Generation with AI', 'AI-Powered Projects', 'And Much More!'];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function ProgramPromoPopup() {
  const [mounted, setMounted] = useState(false);   // in the DOM at all
  const [visible, setVisible] = useState(false);   // driving the transition classes
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const unmountTimer = useRef<number | undefined>(undefined);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- schedule the popup once per app load ---
  useEffect(() => {
    const lastSeen = readLastSeen();
    if (lastSeen !== null) {
      const daysSince = (Date.now() - lastSeen) / (1000 * 60 * 60 * 24);
      if (daysSince < REPEAT_AFTER_DAYS) return; // dismissed recently - stay quiet
    }

    const timer = window.setTimeout(() => {
      // Re-read live state at fire time, not schedule time - the visitor may
      // have navigated (SPA, no reload) or opened another modal during the wait.
      const path = window.location.pathname;
      if (path.startsWith('/program') || path.startsWith('/admin')) return;
      if (document.body.style.overflow === 'hidden') return; // another modal is open
      setMounted(true);
    }, SHOW_AFTER_MS);

    return () => window.clearTimeout(timer);
  }, []);

  // --- mount -> visible on the next frame, so the CSS transition actually runs ---
  useEffect(() => {
    if (!mounted) return;
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // --- scroll lock + focus management while open ---
  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = 'hidden';
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      previouslyFocused?.blur();
      document.body.focus();
    };
  }, [mounted]);

  const dismiss = useCallback(() => {
    markSeen();
    setVisible(false);
    if (reducedMotion) {
      setMounted(false);
      return;
    }
    unmountTimer.current = window.setTimeout(() => setMounted(false), 250);
  }, [reducedMotion]);

  useEffect(() => () => window.clearTimeout(unmountTimer.current), []);

  // --- ESC + Tab trap while open ---
  useEffect(() => {
    if (!mounted) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        dismiss();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mounted, dismiss]);

  if (!mounted) return null;

  const transitionClass = reducedMotion ? '' : 'transition-all duration-[250ms] ease-out';

  return createPortal(
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 ${transitionClass}`}
      style={{
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        opacity: visible ? 1 : 0,
      }}
      onClick={dismiss}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-popup-heading"
        onClick={(e) => e.stopPropagation()}
        className={`glass-card relative w-full max-w-4xl max-h-[92vh] md:max-h-[90vh] overflow-y-auto rounded-2xl mx-4 md:mx-0 ${transitionClass}`}
        style={{
          background: 'var(--navy)',
          border: '1px solid var(--border)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.96)',
        }}
      >
        {/* Close button - fixed reachable top-right, 44x44 minimum */}
        <button
          ref={closeBtnRef}
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 md:top-4 md:right-4 z-10 flex items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid var(--border)',
            color: 'var(--white)',
          }}
        >
          <X size={20} />
        </button>

        <div className="p-6 pt-16 md:p-10 md:pt-10">
          {/* Header row: logo left */}
          <div className="mb-6 md:mb-8">
            <img src="/Asset%2025.svg" alt="PRIM AI Institute" className="h-8 w-auto" style={{ maxHeight: 32 }} />
          </div>

          {/* Hero + text / artwork */}
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2
                id="promo-popup-heading"
                className="font-black leading-[0.95] mb-4"
                style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.25rem, 6vw, 3.25rem)' }}
              >
                <span className="block" style={{ color: 'var(--white)' }}>10-DAY</span>
                <span className="block" style={{ color: 'var(--electric)' }}>AI MASTERY</span>
              </h2>

              <p className="text-base md:text-lg font-semibold mb-4" style={{ color: 'var(--white)' }}>
                Learn AI. Build Real Projects.{' '}
                <span style={{ color: 'var(--gold)' }}>Transform Your Future.</span>
              </p>

              <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
                A practical, hands-on program designed to take you from AI beginner to confident
                creator in just 10 days - no coding, no prior experience required.
              </p>

              {/* Bonus strip */}
              <div
                className="flex items-start gap-3 rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(0,212,255,0.12))',
                  border: '1px solid rgba(124,58,237,0.4)',
                }}
              >
                <div
                  className="flex items-center justify-center rounded-lg shrink-0"
                  style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)' }}
                >
                  <Gift size={20} color="var(--white)" />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--gold)' }}>
                    BONUS: CERTIFICATE OF COMPLETION
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>For all participants</p>
                </div>
              </div>
            </div>

            {/* Hero artwork - desktop only. Source: pop-up.png (AI-brain/laptop
                crop) - see summary note on this asset. Hides itself cleanly if
                the file isn't present yet, rather than showing a broken image. */}
            <div className="hidden md:block">
              <img
                src="/promo/ai-mastery-hero.webp"
                alt=""
                aria-hidden="true"
                className="w-full h-auto rounded-xl"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          </div>

          {/* Feature strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 mt-8 md:mt-10">
            {FEATURES.map(({ Icon, title, subtitle }, i) => (
              <div
                key={title}
                className="flex flex-col items-center text-center gap-2 px-3"
                style={i < FEATURES.length - 1 ? { borderRight: '1px solid var(--border)' } : undefined}
              >
                <Icon size={26} color="var(--electric)" />
                <p className="text-xs font-bold" style={{ color: 'var(--white)' }}>{title}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{subtitle}</p>
              </div>
            ))}
          </div>

          {/* What you'll learn */}
          <div className="glass-card rounded-xl p-5 md:p-6 mt-8 md:mt-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--electric)' }}>
              What You'll Learn &amp; Build
            </p>
            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
              <div className="grid gap-2.5 md:grid-cols-2">
                {[...LEARN_LEFT, ...LEARN_RIGHT].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={16} color="var(--electric)" className="shrink-0" />
                    <span className="text-sm" style={{ color: 'var(--white)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div
                className="flex flex-col items-center justify-center text-center rounded-lg p-4"
                style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }}
              >
                <p className="text-sm font-bold" style={{ color: 'var(--electric)' }}>
                  NO PRIOR AI KNOWLEDGE REQUIRED
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  Start from zero - we'll guide you through every step.
                </p>
              </div>
            </div>
          </div>

          {/* Footer CTA bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-8 md:mt-10">
            <Link
              to={PROGRAM_URL}
              onClick={markSeen}
              className="w-full md:w-auto text-center rounded-full font-bold px-8 py-4"
              style={{ background: 'var(--gold)', color: 'var(--navy)' }}
            >
              ENROLL NOW →
            </Link>
            <div className="flex flex-col md:items-end gap-1">
              <p className="text-sm font-bold" style={{ color: 'var(--gold)' }}>
                LIMITED SEATS – ENROLL TODAY!
              </p>
              <p className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                <Clock size={14} />
                BATCH STARTS SOON!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
