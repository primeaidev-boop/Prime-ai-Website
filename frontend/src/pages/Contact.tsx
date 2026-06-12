import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createEnquiry } from '@/api/enquiries';
import type { CreateEnquiryDto } from '@/types';
import { getContactData } from '@/data/contactPageData';
import type { ContactPageData } from '@/data/contactPageData';

export default function Contact() {
  const [data, setData] = useState<ContactPageData>(() => getContactData());
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(
    () => getContactData().faqs[0]?.id ?? null
  );

  // Re-read when window gains focus so admin edits show immediately
  useEffect(() => {
    const sync = () => setData(getContactData());
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<CreateEnquiryDto>();

  const onSubmit = async (formData: CreateEnquiryDto) => {
    setFormError('');
    try {
      await createEnquiry(formData);
      setSubmitted(true);
      reset();
    } catch {
      setFormError('Something went wrong. Please try again.');
    }
  };

  const waUrl = `https://wa.me/${data.whatsappNumber}?text=${encodeURIComponent(data.whatsappMessage)}`;

  return (
    <>
      <main style={{ background: 'var(--navy)', minHeight: '100vh', paddingTop: '80px' }}>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div
            className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{ background: 'rgba(0,212,255,.1)', border: '1px solid rgba(0,212,255,.2)', color: 'var(--electric)' }}
          >
            {data.badge}
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold mb-5"
            style={{ fontFamily: 'var(--font-head)', letterSpacing: '-1.5px', color: 'var(--white)' }}
          >
            {data.heading}
          </h1>
          <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
            {data.subtext}
          </p>
        </section>

        {/* ── Two-column: Info + Form ────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-6 reveal">

          {/* Left: Contact info cards */}
          <div className="flex flex-col gap-4">

            {/* Address card */}
            <a
              href={data.mapLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card glass-card-hover p-6 rounded-2xl flex gap-4 items-start group no-underline"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'rgba(0,212,255,.1)' }}
              >
                📍
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-1" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
                  Global Headquarters
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {data.address}
                </p>
                <span
                  className="inline-block mt-3 text-xs font-semibold"
                  style={{ color: 'var(--electric)' }}
                >
                  Open in Maps →
                </span>
              </div>
            </a>

            {/* 2×2 info grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Phone */}
              <a
                href={`tel:${data.phone.replace(/\s/g, '')}`}
                className="glass-card glass-card-hover p-5 rounded-2xl flex items-start gap-3 no-underline"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: 'rgba(0,212,255,.1)' }}
                >
                  📞
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>
                    Admissions
                  </p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--white)' }}>{data.phone}</p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${data.email}`}
                className="glass-card glass-card-hover p-5 rounded-2xl flex items-start gap-3 no-underline"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: 'rgba(0,212,255,.1)' }}
                >
                  ✉️
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>
                    Email
                  </p>
                  <p className="text-sm font-semibold break-all" style={{ color: 'var(--white)' }}>{data.email}</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card glass-card-hover p-5 rounded-2xl flex items-start gap-3 no-underline"
                style={{ borderLeft: '2px solid #25D366' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: 'rgba(37,211,102,.1)' }}
                >
                  💬
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>
                    Chat Support
                  </p>
                  <p className="text-sm font-semibold" style={{ color: '#25D366' }}>WhatsApp Us</p>
                </div>
              </a>

              {/* Hours */}
              <div className="glass-card p-5 rounded-2xl flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: 'rgba(0,212,255,.1)' }}
                >
                  🕐
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>
                    Hours
                  </p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--white)' }}>{data.hours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Enquiry form */}
          <div
            className="glass-card rounded-2xl p-8 relative overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            <div
              className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(0,212,255,.08) 0%, transparent 70%)' }}
            />

            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
                  Enquiry Sent!
                </h2>
                <p className="mb-6" style={{ color: 'var(--muted)' }}>
                  We'll get back to you within 24 hours.
                </p>
                <button className="btn-primary px-6 py-2" onClick={() => setSubmitted(false)}>
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h2
                  className="relative text-xl font-bold mb-6"
                  style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
                >
                  {data.formTitle}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="relative flex flex-col gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 ml-1" style={{ color: 'var(--muted)' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ravi Sharma"
                      {...register('name', { required: 'Name is required', minLength: 2 })}
                    />
                    {errors.name && (
                      <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email + Phone row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 ml-1" style={{ color: 'var(--muted)' }}>
                        Email (optional)
                      </label>
                      <input type="email" placeholder="you@example.com" {...register('email')} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 ml-1" style={{ color: 'var(--muted)' }}>
                        WhatsApp / Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile"
                        {...register('phone', {
                          required: 'Phone is required',
                          pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit Indian mobile' },
                        })}
                      />
                      {errors.phone && (
                        <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Profile + Course row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 ml-1" style={{ color: 'var(--muted)' }}>
                        I am a…
                      </label>
                      <select {...register('profile', { required: 'Required' })}>
                        <option value="">Select Profile</option>
                        <option value="SCHOOL_STUDENT">School Student</option>
                        <option value="COLLEGE_STUDENT">College Student</option>
                        <option value="WORKING_PROFESSIONAL">Working Professional</option>
                        <option value="BUSINESS_OWNER">Business Owner</option>
                        <option value="OTHER">Other</option>
                      </select>
                      {errors.profile && (
                        <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>{errors.profile.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 ml-1" style={{ color: 'var(--muted)' }}>
                        Interested in…
                      </label>
                      <select {...register('courseInterest', { required: 'Required' })}>
                        <option value="">Select Program</option>
                        <option value="LEVEL_1_FOUNDATION">Level 1 – Introduction</option>
                        <option value="LEVEL_2A_GENERALIST">Level 2A – AI Generalist</option>
                        <option value="LEVEL_2B_DEVELOPER">Level 2B – AI Developer</option>
                        <option value="NOT_SURE">Not Sure Yet</option>
                      </select>
                      {errors.courseInterest && (
                        <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>{errors.courseInterest.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 ml-1" style={{ color: 'var(--muted)' }}>
                      How can we help?
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Share your goals or questions… (min 10 characters)"
                      {...register('message', {
                        required: 'Message is required',
                        minLength: { value: 10, message: 'Minimum 10 characters' },
                        maxLength: 500,
                      })}
                    />
                    {errors.message && (
                      <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>{errors.message.message}</p>
                    )}
                  </div>

                  {formError && (
                    <p className="text-sm text-center" style={{ color: 'var(--orange)' }}>{formError}</p>
                  )}

                  <button
                    type="submit"
                    className="btn-primary w-full py-3 mt-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending…' : 'Send Enquiry →'}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        {data.showFaq && data.faqs.length > 0 && (
          <section className="max-w-3xl mx-auto px-6 pb-20 reveal">
            <h2
              className="text-3xl md:text-4xl font-bold text-center mb-10"
              style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
            >
              {data.faqSectionTitle}
            </h2>
            <div className="flex flex-col gap-3">
              {data.faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div key={faq.id} className="glass-card rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left"
                      style={{ color: isOpen ? 'var(--electric)' : 'var(--white)' }}
                    >
                      <span className="font-semibold text-sm pr-4" style={{ fontFamily: 'var(--font-body)' }}>
                        {faq.question}
                      </span>
                      <span
                        className="flex-shrink-0 text-lg"
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.25s ease',
                          color: 'var(--electric)',
                        }}
                      >
                        ▾
                      </span>
                    </button>
                    <div
                      style={{
                        maxHeight: isOpen ? '400px' : '0',
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease',
                      }}
                    >
                      <p className="px-6 pb-6 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Map ────────────────────────────────────────────── */}
        {data.showMap && (
          <section className="reveal" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div
              className="relative w-full cursor-pointer group"
              style={{ height: '400px' }}
              onClick={() => window.open(data.mapLinkUrl, '_blank')}
            >
              <iframe
                src={data.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(30%) invert(92%) hue-rotate(180deg)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="PRIM AI Institute Location"
              />
              {/* Dark overlay so it matches the theme */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'rgba(2,8,24,.35)', mixBlendMode: 'multiply' }}
              />
              {/* Center marker */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="flex flex-col items-center gap-2 px-5 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(2,8,24,.75)',
                    border: '1px solid rgba(0,212,255,.3)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <span className="text-2xl">📍</span>
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--electric)' }}>
                    Click to open in Google Maps
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── WhatsApp FAB ─────────────────────────────────────── */}
      {data.showWhatsapp && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full font-bold text-sm shadow-2xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
          style={{
            background: '#25D366',
            color: 'white',
            padding: '14px 20px',
            boxShadow: '0 0 24px rgba(37,211,102,.5)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            Chat on WhatsApp
          </span>
        </a>
      )}
    </>
  );
}
