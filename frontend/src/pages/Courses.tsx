import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getListingPage } from '@/api/courses';
import { useModal } from '@/hooks/useModal';
import { DemoModal } from '@/components/shared/DemoModal';
import { LearningPathway } from '@/components/shared/LearningPathway';
import type { CoursesListingPage } from '@/types';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function Courses() {
  const [page, setPage] = useState<CoursesListingPage | null>(null);
  const modal = useModal();
  const heroRef = useReveal();
  const pathwayRef = useReveal();
  const whoRef = useReveal();

  useEffect(() => {
    getListingPage()
      .then((res) => setPage(res.data))
      .catch(() => { /* backend offline - page uses local defaults */ });
  }, []);

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 text-center">
        <div ref={heroRef} className="reveal max-w-3xl mx-auto">
          <div className="section-tag mb-4">
            {page?.heroTag ?? 'THE PROGRAMS'}
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}
          >
            {page?.heroHeadingMain ?? 'One Path.'}{' '}
            <span className="gradient-text">{page?.heroHeadingAccent ?? 'Three Levels.'}</span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
            {page?.heroSubtitle ?? 'From absolute beginner to professional AI practitioner - our structured pathway takes you from zero knowledge to job-ready skills at the pace that suits you.'}
          </p>
        </div>
      </section>

      {/* Pathway - single source of truth */}
      <section className="pb-20 px-4">
        <div ref={pathwayRef} className="reveal max-w-5xl mx-auto">
          <LearningPathway />
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-20 px-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div ref={whoRef} className="reveal max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-tag mb-4">
              {page?.whoTag ?? 'WHO IS THIS FOR'}
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}
            >
              {page?.whoHeadingMain ?? 'Built for'}{' '}
              <span className="gradient-text">{page?.whoHeadingAccent ?? 'Every Background'}</span>
            </h2>
          </div>

          {page && page.whoCards.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {page.whoCards.slice(0, 3).map((card) => (
                  <div key={card.id} className="glass-card glass-card-hover rounded-xl p-5">
                    <div className="text-3xl mb-3">{card.emoji}</div>
                    <h3 className="font-bold mb-1.5 text-base" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{card.desc}</p>
                  </div>
                ))}
              </div>
              {page.whoCards.length > 3 && (
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mx-auto ${
                    page.whoCards.length - 3 === 1 ? 'max-w-sm' :
                    page.whoCards.length - 3 === 2 ? 'max-w-2xl' : ''
                  }`}
                >
                  {page.whoCards.slice(3).map((card) => (
                    <div key={card.id} className="glass-card glass-card-hover rounded-xl p-5">
                      <div className="text-3xl mb-3">{card.emoji}</div>
                      <h3 className="font-bold mb-1.5 text-base" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
                        {card.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{card.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="glass-card rounded-xl p-5 h-32" style={{ background: 'var(--card)' }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div
          className="max-w-3xl mx-auto text-center glass-card rounded-2xl p-10 md:p-14"
          style={{ border: '1px solid rgba(0,212,255,0.15)' }}
        >
          <div className="section-tag mb-4">
            {page?.ctaTag ?? 'GET STARTED'}
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}
          >
            {page?.ctaHeading ?? 'Not Sure Where to Start?'}
          </h2>
          <p className="mb-8 leading-relaxed" style={{ color: 'var(--muted)' }}>
            {page?.ctaDesc ?? 'Book a free 60-minute demo session and our trainers will guide you to the right level based on your background, goals, and schedule.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={modal.open} className="btn-primary px-8 py-3 text-base">
              {page?.ctaBtnPrimary ?? 'Book Free Demo ➞'}
            </button>
            <Link to="/contact" className="btn-outline px-8 py-3 text-base">
              {page?.ctaBtnSecondary ?? 'Talk to Us'}
            </Link>
          </div>
        </div>
      </section>

      <DemoModal isOpen={modal.isOpen} onClose={modal.close} />
    </div>
  );
}
