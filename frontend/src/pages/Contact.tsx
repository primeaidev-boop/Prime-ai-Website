// Contact page with enquiry form

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { SectionTag } from '@/components/shared/SectionTag';
import { GlassCard } from '@/components/shared/GlassCard';
import { createEnquiry } from '@/api/enquiries';
import type { CreateEnquiryDto } from '@/types';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateEnquiryDto>();

  const onSubmit = async (data: CreateEnquiryDto) => {
    setError('');
    try {
      await createEnquiry(data);
      setSubmitted(true);
      reset();
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-6 pt-32 pb-16">
      <SectionTag>Get in Touch</SectionTag>
      <h1
        className="text-4xl md:text-5xl font-bold mt-4 mb-12 gradient-text text-center"
        style={{ fontFamily: 'var(--font-head)' }}
      >
        Contact Us
      </h1>

      <GlassCard className="w-full max-w-lg p-8">
        {submitted ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-head)' }}>
              Enquiry Sent!
            </h2>
            <p style={{ color: 'var(--muted)' }}>
              We'll get back to you within 24 hours.
            </p>
            <button className="btn-primary mt-6" onClick={() => setSubmitted(false)}>
              Send Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <input type="text" placeholder="Your Name" {...register('name', { required: 'Name is required', minLength: 2 })} />
              {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>{errors.name.message}</p>}
            </div>
            <div>
              <input type="tel" placeholder="Mobile Number" {...register('phone', { required: 'Phone is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit Indian mobile number' } })} />
              {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>{errors.phone.message}</p>}
            </div>
            <div>
              <input type="email" placeholder="Email (optional)" {...register('email')} />
            </div>
            <div>
              <select {...register('profile', { required: 'Required' })}>
                <option value="">I am a...</option>
                <option value="SCHOOL_STUDENT">School Student</option>
                <option value="COLLEGE_STUDENT">College Student</option>
                <option value="WORKING_PROFESSIONAL">Working Professional</option>
                <option value="BUSINESS_OWNER">Business Owner</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.profile && <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>{errors.profile.message}</p>}
            </div>
            <div>
              <select {...register('courseInterest', { required: 'Required' })}>
                <option value="">Interested in...</option>
                <option value="LEVEL_1_FOUNDATION">Level 1 — Foundation</option>
                <option value="LEVEL_2A_GENERALIST">Level 2A — AI Generalist</option>
                <option value="LEVEL_2B_DEVELOPER">Level 2B — AI Developer</option>
                <option value="NOT_SURE">Not Sure Yet</option>
              </select>
              {errors.courseInterest && <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>{errors.courseInterest.message}</p>}
            </div>
            <div>
              <textarea rows={4} placeholder="Your message (min 10 characters)" {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Minimum 10 characters' }, maxLength: 500 })} />
              {errors.message && <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>{errors.message.message}</p>}
            </div>
            {error && <p className="text-sm text-center" style={{ color: 'var(--orange)' }}>{error}</p>}
            <button type="submit" className="btn-primary w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Enquiry →'}
            </button>
          </form>
        )}
      </GlassCard>
    </main>
  );
}
