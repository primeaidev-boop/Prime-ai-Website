import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitTutorialLead } from '@/api/tutorialLeads';

const USER_TYPES = [
  'School Student',
  'College Student',
  'Working Professional',
  'Business Owner',
  'Freelancer',
  'Job Seeker',
  'Other',
];

interface Props {
  tutorialSlug: string;
  tutorialName?: string;
  onClose: () => void;
}

interface FormState {
  fullName: string;
  mobile: string;
  city: string;
  userType: string;
}

const PHONE_RE = /^[6-9]\d{9}$/;

export function TutorialGateModal({ tutorialSlug, tutorialName, onClose }: Props) {
  const navigate = useNavigate();
  const firstRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    fullName: '',
    mobile: '',
    city: '',
    userType: '',
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    firstRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

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
        tutorialAccessed: tutorialSlug,
        sourcePage: window.location.pathname,
      });
      localStorage.setItem(
        'primAI_tutorialLeadCaptured',
        JSON.stringify({ mobile: form.mobile.trim() }),
      );
      onClose();
      navigate(`/tutorials/${tutorialSlug}`);
    } catch {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(2,8,24,0.82)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative glass-card rounded-2xl w-full max-w-md z-10 overflow-hidden"
        style={{ border: '1px solid rgba(0,212,255,0.22)' }}
      >
        {/* Cyan top accent */}
        <div
          className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg, var(--electric), var(--orange))' }}
        />

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--electric)' }}>
              Free Access
            </div>
            <h2
              id="gate-modal-title"
              className="text-xl font-bold leading-snug"
              style={{ color: 'var(--white)', fontFamily: 'Montserrat, var(--font-head)' }}
            >
              {tutorialName
                ? `Unlock the ${tutorialName} Tutorial`
                : 'Unlock Free Tutorial Access'}
            </h2>
            <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
              Enter your details once and get unlimited access to all tutorials.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
                Full Name <span style={{ color: 'var(--electric)' }}>*</span>
              </label>
              <input
                ref={firstRef}
                type="text"
                placeholder="Your full name"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                style={errors.fullName ? { borderColor: '#f87171' } : {}}
                autoComplete="name"
              />
              {errors.fullName && (
                <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.fullName}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
                Mobile Number <span style={{ color: 'var(--electric)' }}>*</span>
              </label>
              <input
                type="tel"
                placeholder="10-digit Indian mobile number"
                value={form.mobile}
                onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                style={errors.mobile ? { borderColor: '#f87171' } : {}}
                autoComplete="tel"
                inputMode="numeric"
              />
              {errors.mobile && (
                <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.mobile}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
                City / Location <span style={{ color: 'var(--electric)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ahmedabad, Mumbai"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                style={errors.city ? { borderColor: '#f87171' } : {}}
                autoComplete="address-level2"
              />
              {errors.city && (
                <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.city}</p>
              )}
            </div>

            {/* Who Are You */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
                Who Are You? <span style={{ color: 'var(--electric)' }}>*</span>
              </label>
              <select
                value={form.userType}
                onChange={(e) => set('userType', e.target.value)}
                style={errors.userType ? { borderColor: '#f87171' } : {}}
              >
                <option value="">Select your profile</option>
                {USER_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.userType && (
                <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.userType}</p>
              )}
            </div>

            {apiError && (
              <p className="text-xs text-center py-2 px-3 rounded-lg" style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                {apiError}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full mt-1"
              disabled={loading}
              style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
            >
              {loading ? 'Please wait…' : 'Continue to Tutorial →'}
            </button>
          </form>

          {/* Dismiss */}
          <button
            onClick={onClose}
            className="w-full text-center text-xs mt-4 transition-colors"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--white)'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--muted)'; }}
          >
            No thanks, go back
          </button>
        </div>
      </div>
    </div>
  );
}
