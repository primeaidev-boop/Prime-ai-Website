import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useModal } from '@/hooks/useModal';
import { DemoModal } from '@/components/shared/DemoModal';
import { useSettingsStore } from '@/store/settingsStore';

export default function Courses() {
  const modal = useModal();
  const data = useSettingsStore((state) => state.s.coursePageData);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  useEffect(() => {
    if (!openModuleId && data.modules.length > 0) {
      setOpenModuleId(data.modules[0].id);
    }
  }, [data.modules, openModuleId]);

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.07 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [data]);

  const Divider = () => (
    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />
  );

  const STag = ({ children }: { children: React.ReactNode }) => (
    <div className="section-tag mb-3">{children}</div>
  );

  return (
    <>
      <main style={{ background: 'var(--navy)', minHeight: '100vh', paddingTop: '80px' }}>

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section style={{ background: 'linear-gradient(180deg, rgba(0,212,255,.05) 0%, transparent 60%)' }}>
          <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 lg:gap-16 items-start">

            {/* Left */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5 anim-1"
                style={{ background: 'rgba(0,212,255,.08)', border: '1px solid rgba(0,212,255,.28)', color: 'var(--electric)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--electric)', display: 'inline-block' }} />
                {data.badge}
              </div>
              <h1
                className="text-4xl md:text-6xl font-bold mb-5 anim-2"
                style={{ fontFamily: 'var(--font-head)', letterSpacing: '-1.5px', color: 'var(--white)', lineHeight: 1.1 }}
              >
                {data.title}
              </h1>
              <p className="text-lg leading-relaxed max-w-2xl mb-7 anim-3" style={{ color: 'var(--muted)' }}>
                {data.tagline}
              </p>

              <div className="flex flex-wrap gap-2 mb-8 anim-4">
                {data.quickStats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--white)' }}>
                    {stat}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 anim-5">
                <button type="button" onClick={modal.open} className="btn-primary px-8 py-3.5 text-base">{data.cta1Text}</button>
                <button type="button" onClick={modal.open} className="btn-outline px-7 py-3.5 text-base">{data.cta2Text}</button>
              </div>
            </div>

            {/* Right — sticky card */}
            <div className="glass-card rounded-2xl p-7 anim-4" style={{ border: '1px solid rgba(0,212,255,.2)', position: 'sticky', top: '100px' }}>
              <h3 className="font-bold text-sm mb-5 pb-4" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
                Course Highlights
              </h3>
              <div className="flex flex-col">
                {data.cardHighlights.map((row) => (
                  <div key={row.id} className="flex justify-between items-center py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                    <span className="text-sm" style={{ color: 'var(--muted)' }}>{row.label}</span>
                    <span className="text-sm font-semibold text-right" style={{ color: row.highlighted ? 'var(--electric)' : 'var(--white)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <button type="button" onClick={modal.open} className="btn-primary w-full py-3 mt-5 justify-center">Book Free Demo →</button>
              <p className="text-xs text-center mt-3" style={{ color: 'var(--muted)' }}>Free demo · No fees · No obligation</p>
            </div>
          </div>
        </section>

        <Divider />

        {/* ── Who Should Join ────────────────────────────────────────── */}
        {data.showAudience && (
          <>
            <section className="max-w-6xl mx-auto px-6 py-16 reveal">
              <STag>Perfect For</STag>
              <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)', letterSpacing: '-0.5px' }}>{data.audienceTitle}</h2>
              <p className="text-base mb-10 max-w-2xl" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>{data.audienceSubtext}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.audience.map((card) => (
                  <div key={card.id} className="glass-card glass-card-hover flex items-start gap-4 p-5 rounded-2xl">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(0,212,255,.08)' }}>{card.emoji}</div>
                    <div>
                      <h4 className="font-bold text-sm mb-1" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>{card.title}</h4>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* ── Curriculum ─────────────────────────────────────────────── */}
        {data.showCurriculum && (
          <>
            <section className="max-w-6xl mx-auto px-6 py-16 reveal">
              <STag>Curriculum</STag>
              <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)', letterSpacing: '-0.5px' }}>{data.curriculumTitle}</h2>
              <p className="text-base mb-10 max-w-2xl" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>{data.curriculumSubtext}</p>
              <div className="flex flex-col rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {data.modules.map((mod, idx) => {
                  const isOpen = openModuleId === mod.id;
                  return (
                    <div key={mod.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--border)' }}>
                      <button
                        type="button"
                        onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
                        className="w-full flex items-center gap-6 px-6 py-5 text-left transition-all duration-200"
                        style={{ background: isOpen ? 'rgba(0,212,255,.04)' : 'transparent', borderLeft: isOpen ? '3px solid var(--electric)' : '3px solid transparent' }}
                      >
                        <span className="flex-shrink-0 text-xs font-bold tracking-widest uppercase min-w-[80px]" style={{ color: 'var(--electric)' }}>{mod.label}</span>
                        <span className="flex-1 font-bold text-sm" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>{mod.title}</span>
                        <span className="flex-shrink-0 text-base" style={{ color: 'var(--electric)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>▾</span>
                      </button>
                      <div style={{ maxHeight: isOpen ? '600px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
                        <div className="px-6 pb-5 pt-1 flex flex-wrap gap-2" style={{ borderLeft: '3px solid var(--electric)', background: 'rgba(0,212,255,.03)' }}>
                          {mod.topics.map((topic, ti) => (
                            <span key={ti} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', color: 'var(--muted)' }}>{topic}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* ── AI Tools ───────────────────────────────────────────────── */}
        {data.showTools && (
          <>
            <section className="max-w-6xl mx-auto px-6 py-16 reveal">
              <STag>Tools</STag>
              <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)', letterSpacing: '-0.5px' }}>{data.toolsTitle}</h2>
              <p className="text-base mb-10 max-w-2xl" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>{data.toolsSubtext}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.tools.map((tool) => (
                  <div key={tool.id} className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col items-center text-center">
                    <div className="text-3xl mb-3">{tool.emoji}</div>
                    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--white)' }}>{tool.name}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{tool.category}</div>
                  </div>
                ))}
              </div>
              {data.toolsMoreText && (
                <p className="text-center mt-6 text-sm" style={{ color: 'var(--muted)' }}>
                  And <span style={{ color: 'var(--electric)', fontWeight: 600 }}>many more</span> tools covered throughout the program
                </p>
              )}
            </section>
            <Divider />
          </>
        )}

        {/* ── Outcomes ───────────────────────────────────────────────── */}
        {data.showOutcomes && (
          <>
            <section className="max-w-6xl mx-auto px-6 py-16 reveal">
              <STag>After This Course</STag>
              <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)', letterSpacing: '-0.5px' }}>{data.outcomesTitle}</h2>
              <p className="text-base mb-10 max-w-2xl" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>{data.outcomesSubtext}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.outcomes.map((outcome) => (
                  <div key={outcome.id} className="glass-card glass-card-hover flex items-start gap-4 p-5 rounded-2xl">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(0,212,255,.1)', color: 'var(--electric)' }}>✓</div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--white)' }}>{outcome.title}</h4>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{outcome.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {data.showBeforeAfter && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                  <div className="glass-card p-7 rounded-2xl">
                    <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--muted)' }}>{data.beforeLabel}</p>
                    {data.beforeItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 mb-3 last:mb-0 text-sm" style={{ color: 'var(--muted)' }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--muted)' }} />{item}
                      </div>
                    ))}
                  </div>
                  <div className="text-3xl text-center" style={{ color: 'var(--electric)' }}>→</div>
                  <div className="glass-card p-7 rounded-2xl" style={{ border: '1px solid rgba(0,212,255,.2)', background: 'rgba(0,212,255,.04)' }}>
                    <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--electric)' }}>{data.afterLabel}</p>
                    {data.afterItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 mb-3 last:mb-0 text-sm" style={{ color: 'var(--white)' }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--electric)' }} />{item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
            <Divider />
          </>
        )}

        {/* ── Testimonials ────────────────────────────────────────────── */}
        {data.showTestimonials && (
          <>
            <section className="max-w-6xl mx-auto px-6 py-16 reveal">
              <STag>Student Stories</STag>
              <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)', letterSpacing: '-0.5px' }}>{data.testimonialsTitle}</h2>
              <p className="text-base mb-10 max-w-2xl" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>{data.testimonialsSubtext}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {data.testimonials.map((t) => (
                  <div key={t.id} className="glass-card glass-card-hover p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: t.avatarColor }}>{t.initials}</div>
                      <div>
                        <div className="font-bold text-sm" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>{t.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{t.meta}</div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed italic mb-4" style={{ color: 'var(--muted)' }}>"{t.quote}"</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span style={{ color: 'var(--muted)' }}>{t.before}</span>
                      <span className="font-bold" style={{ color: 'var(--electric)' }}>→</span>
                      <span className="font-semibold" style={{ color: 'var(--electric)' }}>{t.after}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        {data.showFaq && (
          <>
            <section className="max-w-3xl mx-auto px-6 py-16 reveal">
              <STag>FAQ</STag>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)', letterSpacing: '-0.5px' }}>{data.faqTitle}</h2>
              <p className="text-base mb-10 text-center" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>{data.faqSubtext}</p>
              <div className="flex flex-col gap-3">
                {data.faqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div key={faq.id} className="glass-card rounded-2xl overflow-hidden" style={{ borderColor: isOpen ? 'rgba(0,212,255,.25)' : undefined }}>
                      <button
                        type="button"
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        className="w-full flex items-center justify-between px-6 py-5 text-left"
                        style={{ color: isOpen ? 'var(--electric)' : 'var(--white)' }}
                      >
                        <span className="font-semibold text-sm pr-4">{faq.question}</span>
                        <span
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs border"
                          style={{ background: isOpen ? 'rgba(0,212,255,.1)' : 'transparent', borderColor: isOpen ? 'var(--electric)' : 'var(--border)', color: isOpen ? 'var(--electric)' : 'var(--muted)', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease, background 0.3s, border-color 0.3s' }}
                        >+</span>
                      </button>
                      <div style={{ maxHeight: isOpen ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                        <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{faq.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* ── Related Courses ─────────────────────────────────────────── */}
        {data.showRelated && (
          <>
            <section className="max-w-6xl mx-auto px-6 py-16 reveal">
              <STag>Next Steps</STag>
              <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)', letterSpacing: '-0.5px' }}>Continue Your AI Journey</h2>
              <p className="text-base mb-10 max-w-2xl" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>After completing Level 1, choose the track that matches your goals.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NavLink to="/courses" className="glass-card glass-card-hover p-8 rounded-2xl no-underline block" style={{ borderTop: '2.5px solid var(--orange)' }}>
                  <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--orange)' }}>Level 2A – Non-Tech Track</div>
                  <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>AI Generalist Program</div>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--muted)' }}>For freshers, professionals, and entrepreneurs. Master 15+ AI tools for content, design, video, automation, and productivity.</p>
                  <span className="text-sm font-semibold" style={{ color: 'var(--orange)' }}>Explore Course →</span>
                </NavLink>
                <NavLink to="/courses" className="glass-card glass-card-hover p-8 rounded-2xl no-underline block" style={{ borderTop: '2.5px solid #a78bfa' }}>
                  <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#a78bfa' }}>Level 2B – Tech Track</div>
                  <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>AI Developer Program</div>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--muted)' }}>For IT and engineering students. Learn AI-assisted coding, LLM APIs, GitHub Copilot, and build your own AI-powered applications.</p>
                  <span className="text-sm font-semibold" style={{ color: '#a78bfa' }}>Explore Course →</span>
                </NavLink>
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-24 text-center relative reveal">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(0,212,255,.05) 0%, transparent 70%)' }} />
          <STag>Start Today</STag>
          <h2 className="relative text-4xl md:text-6xl font-bold mb-5" style={{ fontFamily: 'var(--font-head)', letterSpacing: '-1.5px', color: 'var(--white)', lineHeight: 1.1, whiteSpace: 'pre-line' }}>
            {data.finalCtaTitle}
          </h2>
          <p className="relative text-lg max-w-xl mx-auto mb-10" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{data.finalCtaBody}</p>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <button type="button" onClick={modal.open} className="btn-primary px-10 py-4 text-lg">Book Free Demo Class →</button>
            <a
              href={`https://wa.me/917573055191?text=${encodeURIComponent("Hi! I'm interested in the AI Foundation Program. Please share more details.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-8 py-4 text-lg"
              style={{ borderColor: '#25D366', color: '#25D366' }}
            >
              💬 WhatsApp Us
            </a>
          </div>
          {data.finalCtaNote && (
            <p className="relative mt-5 text-sm" style={{ color: 'var(--muted)' }}>{data.finalCtaNote}</p>
          )}
        </section>

      </main>

      <DemoModal isOpen={modal.isOpen} onClose={modal.close} />
    </>
  );
}
