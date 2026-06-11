// Demo booking modal — rendered at app root via portal, usable from any page

import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { createBooking } from '@/api/bookings';
import type { CreateBookingDto, Profile, Course } from '@/types';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateBookingDto>();

  if (!isOpen) return null;

  const onSubmit = async (data: CreateBookingDto) => {
    setError('');
    try {
      await createBooking(data);
      setSubmitted(true);
      reset();
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError('');
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,8,24,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={handleClose}
    >
      <div
        className="glass-card w-full max-w-md p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-2xl leading-none"
          style={{ color: 'var(--muted)' }}
          aria-label="Close"
        >
          ×
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-head)' }}>
              Booking Confirmed!
            </h2>
            <p style={{ color: 'var(--muted)' }}>
              We'll reach out on WhatsApp within 24 hours.
            </p>
            <button className="btn-primary mt-6" onClick={handleClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <h2
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: 'var(--font-head)' }}
            >
              Book a Free Demo
            </h2>
            <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
              Experience PRIM AI firsthand — no commitment.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  {...register('name', { required: 'Name is required', minLength: 2, maxLength: 50 })}
                />
                {errors.name && (
                  <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  {...register('phone', {
                    required: 'Phone is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Enter valid 10-digit Indian mobile number',
                    },
                  })}
                />
                {errors.phone && (
                  <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <select {...register('profile', { required: 'Profile is required' })}>
                  <option value="">I am a...</option>
                  <option value="SCHOOL_STUDENT">School Student</option>
                  <option value="COLLEGE_STUDENT">College Student</option>
                  <option value="WORKING_PROFESSIONAL">Working Professional</option>
                  <option value="BUSINESS_OWNER">Business Owner</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.profile && (
                  <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>
                    {errors.profile.message}
                  </p>
                )}
              </div>

              <div>
                <select {...register('courseInterest', { required: 'Please select a course' })}>
                  <option value="">Interested in...</option>
                  <option value="LEVEL_1_FOUNDATION">Level 1 — Foundation</option>
                  <option value="LEVEL_2A_GENERALIST">Level 2A — AI Generalist</option>
                  <option value="LEVEL_2B_DEVELOPER">Level 2B — AI Developer</option>
                  <option value="NOT_SURE">Not Sure Yet</option>
                </select>
                {errors.courseInterest && (
                  <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>
                    {errors.courseInterest.message}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-sm text-center" style={{ color: 'var(--orange)' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Booking...' : 'Book Free Demo →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

export type { Profile, Course };
