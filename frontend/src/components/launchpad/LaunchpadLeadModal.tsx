// Lead-capture modal for the 10-Day AI Launchpad campaign page.
// Modeled tightly on TutorialGateModal.tsx (same fields, same validation,
// same submitTutorialLead()/tutorial_leads table) rather than DemoModal,
// since DemoModal's courseInterest enum has no value for this program and
// its POST /api/bookings has no source-tagging column — see plan doc.
// Zero backend changes: reuses the existing POST /api/tutorial-leads as-is.

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { submitTutorialLead } from '@/api/tutorialLeads';

const USER_TYPES = [
  'School Student',
  'College Student',
  'Working Professional',
  'Homemaker',
  'Business Owner',
  'Freelancer',
  'Other',
];

const PHONE_RE = /^[6-9]\d{9}$/;
const LEAD_STORAGE_KEY = 'primAI_launchpadLeadCaptured';

interface FormState {
  fullName: string;
  mobile: string;
  city: string;
  userType: string;
}

const EMPTY_FORM: FormState = { fullName: '', mobile: '', city: '', userType: '' };

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function LaunchpadLeadModal({ isOpen, onClose }: Props) {
  const firstRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    firstRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
    setApiError('');
  };

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      errs.fullName = 'Enter your full name (min 2 chars)';
    if (!PHONE_RE.test(form.mobile))
      errs.mobile = 'Enter a valid 10-digit Indian mobile number';
    if (!form.city.trim() || form.city.trim().length < 2)
      errs.city = 'Enter your city';
    if (!form.userType)
      errs.userType = 'Please select who you are';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm(EMPTY_FORM);
    setErrors({});
    setApiError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await submitTutorialLead({
        fullName: form.fullName.trim(),
        mobile: form.mobile.trim(),
        city: form.city.trim(),
        userType: form.userType,
        tutorialAccessed: 'ai-launchpad-10-day',
        sourcePage: window.location.pathname,
      });
      localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify({ mobile: form.mobile.trim() }));
      setSubmitted(true);
    } catch {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="launchpad-page fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="launchpad-modal-title"
      onClick={handleClose}
    >
      <div
        className="lp-glass-card w-full max-w-md p-6 md:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-2xl leading-none"
          style={{ color: 'var(--lp-muted)' }}
          aria-label="Close"
        >
          ×
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--lp-font-head)' }}>
              Seat Reserved!
            </h2>
            <p style={{ color: 'var(--lp-muted)' }}>
              We'll reach out on WhatsApp within 24 hours to confirm your batch.
            </p>
            <button className="lp-btn-primary mt-6" onClick={handleClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--lp-cyan)' }}>
              10-Day AI Launchpad
            </div>
            <h2
              id="launchpad-modal-title"
              className="text-xl font-bold mb-1"
              style={{ fontFamily: 'var(--lp-font-head)' }}
            >
              Reserve Your Seat — ₹399
            </h2>
            <p className="mb-6 text-sm" style={{ color: 'var(--lp-muted)' }}>
              Enter your details and our team will confirm your batch on WhatsApp.
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div>
                <input
                  ref={firstRef}
                  type="text"
                  placeholder="Your Full Name"
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  style={errors.fullName ? { borderColor: '#f87171' } : {}}
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p className="text-xs mt-1" style={{ color: 'var(--lp-orange)' }}>{errors.fullName}</p>
                )}
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={form.mobile}
                  onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={errors.mobile ? { borderColor: '#f87171' } : {}}
                  autoComplete="tel"
                  inputMode="numeric"
                />
                {errors.mobile && (
                  <p className="text-xs mt-1" style={{ color: 'var(--lp-orange)' }}>{errors.mobile}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  style={errors.city ? { borderColor: '#f87171' } : {}}
                  autoComplete="address-level2"
                />
                {errors.city && (
                  <p className="text-xs mt-1" style={{ color: 'var(--lp-orange)' }}>{errors.city}</p>
                )}
              </div>

              <div>
                <select
                  value={form.userType}
                  onChange={(e) => set('userType', e.target.value)}
                  style={errors.userType ? { borderColor: '#f87171' } : {}}
                >
                  <option value="">I am a...</option>
                  {USER_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.userType && (
                  <p className="text-xs mt-1" style={{ color: 'var(--lp-orange)' }}>{errors.userType}</p>
                )}
              </div>

              {apiError && (
                <p className="text-sm text-center" style={{ color: 'var(--lp-orange)' }}>{apiError}</p>
              )}

              <button
                type="submit"
                className="lp-btn-primary w-full mt-2"
                disabled={loading}
                style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
              >
                {loading ? 'Reserving...' : 'Reserve My Seat — ₹399 ➞'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
