import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';

function TrainerAvatar({ name, imgUrl }: { name: string; imgUrl: string }) {
  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={name}
        className="w-28 h-28 rounded-full object-cover flex-shrink-0"
        style={{ border: '2px solid rgba(0,212,255,.3)' }}
      />
    );
  }
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="w-28 h-28 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
      style={{
        background: 'rgba(0,212,255,.1)',
        color: 'var(--electric)',
        border: '2px solid rgba(0,212,255,.25)',
        fontFamily: 'var(--font-head)',
      }}
    >
      {initials}
    </div>
  );
}

export default function About() {
  const s = useSettingsStore((state) => state.s);

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const diffs = [
    { icon: s.aboutDiff1Icon, title: s.aboutDiff1Title, body: s.aboutDiff1Body },
    { icon: s.aboutDiff2Icon, title: s.aboutDiff2Title, body: s.aboutDiff2Body },
    { icon: s.aboutDiff3Icon, title: s.aboutDiff3Title, body: s.aboutDiff3Body },
    { icon: s.aboutDiff4Icon, title: s.aboutDiff4Title, body: s.aboutDiff4Body },
  ];

  const trainers = [
    { name: s.aboutTrainer1Name, role: s.aboutTrainer1Role, exp: s.aboutTrainer1Exp, img: s.aboutTrainer1Img },
    { name: s.aboutTrainer2Name, role: s.aboutTrainer2Role, exp: s.aboutTrainer2Exp, img: s.aboutTrainer2Img },
    { name: s.aboutTrainer3Name, role: s.aboutTrainer3Role, exp: s.aboutTrainer3Exp, img: s.aboutTrainer3Img },
  ];

  return (
    <main style={{ background: 'var(--navy)', minHeight: '100vh', paddingTop: '80px' }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row gap-16 items-center">

          {/* Text column */}
          <div className="flex-1 space-y-6">
            <div
              className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
              style={{ background: 'rgba(0,212,255,.1)', border: '1px solid rgba(0,212,255,.2)', color: 'var(--electric)' }}
            >
              {s.aboutBadgeText}
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ fontFamily: 'var(--font-head)', letterSpacing: '-1px', color: 'var(--white)' }}
            >
              {s.aboutHeroH1}
              <br />
              <span className="gradient-text">{s.aboutHeroH1Accent}</span>
            </h1>
            <p className="text-lg leading-relaxed max-w-xl" style={{ color: 'var(--muted)' }}>
              {s.aboutHeroSubtext}
            </p>
          </div>

          {/* 2×2 stat grid */}
          <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-xs md:max-w-sm">
            <div className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col items-center justify-center text-center min-h-[110px]">
              <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--electric)' }}>
                {s.aboutStat1Count}
              </span>
              <span className="text-xs font-bold tracking-widest uppercase mt-2" style={{ color: 'var(--muted)' }}>
                {s.aboutStat1Label}
              </span>
            </div>
            <div className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col items-center justify-center text-center min-h-[110px]">
              <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--electric)' }}>
                {s.aboutStat2Count}
              </span>
              <span className="text-xs font-bold tracking-widest uppercase mt-2" style={{ color: 'var(--muted)' }}>
                {s.aboutStat2Label}
              </span>
            </div>
            <div className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col items-center justify-center text-center min-h-[110px]">
              <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--electric)' }}>
                {s.aboutStat3Count}
              </span>
              <span className="text-xs font-bold tracking-widest uppercase mt-2" style={{ color: 'var(--muted)' }}>
                {s.aboutStat3Label}
              </span>
            </div>
            {s.aboutShowIso && (
              <div className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col items-center justify-center text-center min-h-[110px]">
                <span className="text-3xl mb-1">🏅</span>
                <span className="text-xs font-bold tracking-widest uppercase mt-1" style={{ color: 'var(--muted)' }}>
                  ISO CERTIFIED
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Mission Quote ──────────────────────────────────────────── */}
      {s.aboutShowQuote && (
        <section
          className="py-20 reveal"
          style={{
            background: 'rgba(255,255,255,.025)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div
              className="text-7xl mb-4 leading-none select-none"
              style={{ color: 'var(--electric)', opacity: 0.15, fontFamily: 'Georgia, serif' }}
            >
              "
            </div>
            <h2
              className="text-2xl md:text-4xl font-bold leading-tight"
              style={{ fontFamily: 'var(--font-head)', letterSpacing: '-0.5px', color: 'var(--white)' }}
            >
              {s.aboutQuoteMain}{' '}
              <span style={{ color: 'var(--electric)' }}>{s.aboutQuoteAccent}</span>
            </h2>
          </div>
        </section>
      )}

      {/* ── Differentiators ────────────────────────────────────────── */}
      {s.aboutShowDiff && (
        <section className="max-w-6xl mx-auto px-6 py-20 reveal">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {diffs.map((d, i) => (
              <div key={i} className="glass-card diff-card p-6 rounded-2xl">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4"
                  style={{ background: 'rgba(0,212,255,.1)' }}
                >
                  {d.icon}
                </div>
                <h3
                  className="font-bold text-lg mb-2"
                  style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
                >
                  {d.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {d.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Trainers ───────────────────────────────────────────────── */}
      {s.aboutShowTrainers && (
        <section className="py-20 reveal" style={{ background: 'rgba(0,0,0,.18)' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <div className="section-tag mb-3">Our Faculty</div>
              <h2
                className="text-3xl md:text-5xl font-bold"
                style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
              >
                Learn From The Best
              </h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--muted)' }}>
                Our faculty comprises elite researchers and industry practitioners.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trainers.map((t, i) => (
                <div
                  key={i}
                  className="glass-card glass-card-hover p-8 rounded-2xl flex flex-col items-center text-center"
                >
                  <TrainerAvatar name={t.name} imgUrl={t.img} />
                  <h3
                    className="font-bold text-xl mt-5 mb-1"
                    style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
                  >
                    {t.name}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--electric)' }}>
                    {t.role}
                  </p>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
                    style={{ background: 'rgba(255,255,255,.06)', color: 'var(--muted)' }}
                  >
                    {t.exp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────────────── */}
      {s.aboutShowCta && (
        <section className="max-w-6xl mx-auto px-6 py-20 reveal">
          <div
            className="glass-card p-12 md:p-16 rounded-3xl text-center relative overflow-hidden"
            style={{ border: '1px solid rgba(0,212,255,.2)' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(0,212,255,.06) 0%, transparent 70%)' }}
            />
            <h2
              className="relative text-3xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
            >
              {s.aboutCtaHeading}
            </h2>
            <p className="relative text-lg max-w-xl mx-auto mb-8" style={{ color: 'var(--muted)' }}>
              {s.aboutCtaSubtext}
            </p>
            <div className="relative flex flex-col sm:flex-row justify-center gap-4">
              <NavLink to="/courses" className="btn-primary px-8 py-4 text-lg">
                {s.aboutCtaBtn1Text}
              </NavLink>
              <NavLink to="/contact" className="btn-outline px-8 py-4 text-lg">
                {s.aboutCtaBtn2Text}
              </NavLink>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
