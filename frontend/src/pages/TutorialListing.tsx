import { useState, useMemo, lazy, Suspense, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { loadTutorialData, saveTutorialData } from '@/data/tutorialData';
import { getTutorialData } from '@/api/tutorials';
import { DemoModal } from '@/components/shared/DemoModal';
import { useModal } from '@/hooks/useModal';
import type { Tutorial, TutorialCategory, TutorialPageData } from '@/types';
import ElectricBorder from '@/components/effects/ElectricBorder';

const GridScanEffect = lazy(() => import('@/components/effects/GridScan'));

// ── Electric border hover wrapper ─────────────────────────────────────────────

function HoverElectricCard({
  children,
  always = false,
  borderRadius = 16,
}: {
  children: ReactNode;
  always?: boolean;
  borderRadius?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const showEffect = (always || hovered) && !reducedMotion && !isTouchDevice;

  return (
    <div
      className="relative"
      style={{ borderRadius }}
      onMouseEnter={() => { if (!always) setHovered(true); }}
      onMouseLeave={() => { if (!always) setHovered(false); }}
      onFocus={() => { if (!always) setHovered(true); }}
      onBlur={() => { if (!always) setHovered(false); }}
    >
      {children}
      {showEffect ? (
        <ElectricBorder
          color="#22d3ee"
          speed={1}
          chaos={0.1}
          borderRadius={borderRadius}
          className="absolute inset-0 pointer-events-none"
        >
          <div />
        </ElectricBorder>
      ) : (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ border: '1px solid rgba(34,211,238,0.18)', borderRadius }}
        />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ToolLogo({
  color,
  initials,
  imgUrl,
  size = 'md',
}: {
  color: string;
  initials: string;
  imgUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const cls = {
    sm: 'w-10 h-10 text-xs rounded-xl',
    md: 'w-12 h-12 text-sm rounded-xl',
    lg: 'w-16 h-16 text-base rounded-2xl',
  }[size];
  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt=""
        className={`${cls} object-cover shrink-0`}
        style={{ border: '1px solid var(--border)' }}
      />
    );
  }
  return (
    <div
      className={`${cls} flex items-center justify-center font-bold text-white shrink-0`}
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

function FreeBadge({ isPremium }: { isPremium: boolean }) {
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
      style={{
        background: isPremium ? 'rgba(251,191,36,0.12)' : 'rgba(0,212,255,0.12)',
        color: isPremium ? '#FBBF24' : 'var(--electric)',
        border: `1px solid ${isPremium ? 'rgba(251,191,36,0.25)' : 'rgba(0,212,255,0.25)'}`,
      }}
    >
      {isPremium ? 'PREMIUM' : 'FREE'}
    </span>
  );
}

function HeroGraphic({ tutorials, reducedMotion }: { tutorials: Tutorial[]; reducedMotion: boolean }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const picks = tutorials.filter((t) => t.isVisible).slice(0, 4);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const dy = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setTilt({ x: -dy * 8, y: dx * 8 });
  };

  return (
    /* Float wrapper - CSS animation drives the vertical bob */
    <div
      className="relative flex-shrink-0 w-56 h-56 md:w-64 md:h-64"
      style={{ animation: reducedMotion ? undefined : 'heroFloat 4s ease-in-out infinite' }}
    >
      {/* Tilt + scale wrapper - driven by mouse position */}
      <div
        className="absolute inset-0"
        style={{
          transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovered ? 1.04 : 1})`,
          transition: 'transform 0.35s ease-out',
        }}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHovered(false); }}
      >
        {/* Depth card 1 */}
        <div className="absolute inset-0 rounded-2xl" style={{ background: 'rgba(255,107,43,0.06)', border: '1px solid rgba(255,107,43,0.18)', transform: 'rotate(7deg) scale(0.96)' }} />
        {/* Depth card 2 */}
        <div className="absolute inset-0 rounded-2xl" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)', transform: 'rotate(-4deg) scale(0.98)' }} />

        {/* Main card - glow pulse + shimmer overlay */}
        <div
          className="absolute inset-0 rounded-2xl p-3.5 grid grid-cols-2 gap-3 hero-graphic-shimmer"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${hovered ? 'rgba(0,212,255,0.35)' : 'rgba(255,255,255,0.09)'}`,
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            animation: reducedMotion ? undefined : 'heroGlow 3s ease-in-out infinite',
            boxShadow: hovered
              ? '0 0 50px rgba(0,212,255,0.28), 0 0 100px rgba(0,212,255,0.1), 0 12px 40px rgba(0,0,0,0.5)'
              : undefined,
          }}
        >
          {picks.map((tut, i) => (
            <div
              key={tut.id}
              className="rounded-xl flex flex-col items-center justify-center gap-0.5 overflow-hidden"
              style={{
                background: tut.thumbnailUrl ? 'transparent' : tut.logoColor,
                animation: reducedMotion ? undefined : 'tileFloat 2.5s ease-in-out infinite',
                animationDelay: reducedMotion ? undefined : `${i * 0.35}s`,
              }}
            >
              {tut.thumbnailUrl ? (
                <img src={tut.thumbnailUrl} alt={tut.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <>
                  <span className="font-bold text-base text-white">{tut.logoInitials}</span>
                  <span className="text-[9px] opacity-70 text-white">{tut.name}</span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Corner badges */}
        <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, var(--orange), var(--orange2))', zIndex: 10 }}>
          40+ Tools
        </div>
        <div className="absolute -bottom-3 -left-3 px-3 py-1 rounded-full text-[11px] font-bold shadow-lg" style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--electric)', border: '1px solid rgba(0,212,255,0.35)', zIndex: 10 }}>
          FREE
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ tutorial }: { tutorial: Tutorial }) {
  return (
    <Link
      to={`/tutorials/${tutorial.slug}`}
      className="block glass-card p-6 md:p-8 tut-card-hover"
      style={{ borderTop: '3px solid var(--electric)' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <ToolLogo color={tutorial.logoColor} initials={tutorial.logoInitials} imgUrl={tutorial.thumbnailUrl} size="lg" />
        <div className="flex-1 min-w-0">
          <div
            className="font-bold text-xl mb-1"
            style={{ color: 'var(--white)', fontFamily: 'Montserrat, var(--font-head)' }}
          >
            {tutorial.name}
          </div>
          <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--muted)' }}>
            {tutorial.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {tutorial.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--muted)',
                  border: '1px solid var(--border)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 shrink-0">
          <span className="text-sm font-medium" style={{ color: 'var(--white)' }}>
            ⏱ {tutorial.lessonCount} Tutorials
          </span>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            Level:{' '}
            <span style={{ color: 'var(--white)' }}>{tutorial.difficulty}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  return (
    <Link
      to={`/tutorials/${tutorial.slug}`}
      className="glass-card tut-card-hover p-4 flex flex-col gap-3 group rounded-xl"
    >
      <div className="flex items-start justify-between gap-2">
        <ToolLogo color={tutorial.logoColor} initials={tutorial.logoInitials} imgUrl={tutorial.thumbnailUrl} size="sm" />
        <FreeBadge isPremium={tutorial.isPremium} />
      </div>
      <div>
        <div className="font-semibold text-sm mb-1" style={{ color: 'var(--white)' }}>
          {tutorial.name}
        </div>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          ⏱ {tutorial.lessonCount} Tutorials
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
          Level: <span style={{ color: 'var(--white)' }}>{tutorial.difficulty}</span>
        </div>
      </div>
    </Link>
  );
}

function CategorySection({
  category,
  tutorials,
}: {
  category: TutorialCategory;
  tutorials: Tutorial[];
}) {
  if (!tutorials.length) return null;
  return (
    <div className="mb-12">
      <h2
        className="text-lg font-bold mb-5"
        style={{ color: 'var(--white)', fontFamily: 'Montserrat, var(--font-head)' }}
      >
        {category.name}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tutorials.map((tut) => (
          <HoverElectricCard key={tut.id}>
            <TutorialCard tutorial={tut} />
          </HoverElectricCard>
        ))}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TutorialListing() {
  const [data, setData] = useState<TutorialPageData>(loadTutorialData);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [email, setEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const modal = useModal();

  useEffect(() => {
    getTutorialData().then((serverData) => {
      if (serverData) { setData(serverData); saveTutorialData(serverData); }
    }).catch(() => {});
  }, []);

  const { hero, categories, tutorials, newsletter, upsell } = data;

  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const visibleCategories = [...categories]
    .filter((c) => c.isVisible)
    .sort((a, b) => a.order - b.order);

  const filterPills = ['All', ...visibleCategories.map((c) => c.name)];

  const featured = tutorials.find((t) => t.isFeatured && t.isVisible);

  const filteredTutorials = useMemo(() => {
    const q = search.toLowerCase();
    return tutorials.filter((t) => {
      if (!t.isVisible) return false;
      const inSearch =
        !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      const catName = categories.find((c) => c.slug === t.categorySlug)?.name ?? '';
      const inCategory = activeCategory === 'All' || catName === activeCategory;
      return inSearch && inCategory;
    });
  }, [tutorials, categories, search, activeCategory]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
    setNewsletterDone(true);
  };

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 px-4 md:px-12 overflow-hidden relative">

        {/* GridScan background - confined to hero, never blocks clicks */}
        {!reducedMotion && !isMobile && (
          <div className="absolute inset-0" style={{ zIndex: 0, pointerEvents: 'none' }}>
            <Suspense fallback={null}>
              <GridScanEffect
                enableWebcam={false}
                showPreview={false}
                scanColor="#22d3ee"
                linesColor="#0a1628"
                scanOpacity={0.4}
                bloomIntensity={0.6}
                chromaticAberration={0.002}
                noiseIntensity={0.01}
                lineJitter={0.1}
                scanGlow={0.5}
                scanSoftness={2}
                lineThickness={1}
                gridScale={0.1}
                sensitivity={0.55}
                enablePost
              />
            </Suspense>
          </div>
        )}

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16 relative" style={{ zIndex: 1 }}>

          {/* Left: text */}
          <div className="flex-1">
            <span
              className="inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-6"
              style={{
                background: 'rgba(0,212,255,0.1)',
                color: 'var(--electric)',
                border: '1px solid rgba(0,212,255,0.25)',
              }}
            >
              {hero.badge}
            </span>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ fontFamily: 'Montserrat, var(--font-head)', color: 'var(--white)' }}
            >
              {hero.heading1}
              <br />
              <span className="gradient-text">{hero.heading2}</span>
            </h1>

            <div className="flex flex-wrap gap-10 mt-2">
              {hero.stats.map((stat, i) => (
                <div key={i}>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: 'var(--white)', fontFamily: 'Montserrat, var(--font-head)' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: graphic */}
          {hero.showGraphic && (
            <div className="hidden md:flex flex-shrink-0 items-center justify-center">
              <HeroGraphic tutorials={tutorials} reducedMotion={reducedMotion} />
            </div>
          )}
        </div>
      </section>

      {/* ── Search + Filter pills ─────────────────────────────────────────── */}
      <section className="pb-10 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Search bar */}
          <div className="relative mb-5">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'var(--muted)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search for AI tools or topics"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4"
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {filterPills.map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveCategory(pill)}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
                style={
                  activeCategory === pill
                    ? { background: 'var(--electric)', color: 'var(--navy)' }
                    : {
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--muted)',
                        border: '1px solid var(--border)',
                      }
                }
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Tutorial Card ────────────────────────────────────────── */}
      {featured && (
        <section className="pb-10 px-4 md:px-12">
          <div className="max-w-6xl mx-auto">
            <HoverElectricCard always borderRadius={16}>
              <FeaturedCard tutorial={featured} />
            </HoverElectricCard>
          </div>
        </section>
      )}

      {/* ── Category Sections ─────────────────────────────────────────────── */}
      <section className="pb-8 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          {visibleCategories.map((cat) => {
            const catTuts = filteredTutorials.filter((t) => t.categorySlug === cat.slug);
            return <CategorySection key={cat.id} category={cat} tutorials={catTuts} />;
          })}

          {filteredTutorials.length === 0 && (
            <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg font-medium" style={{ color: 'var(--white)' }}>
                No tutorials found
              </p>
              <p className="text-sm mt-1">Try a different search term or category.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Newsletter Strip ──────────────────────────────────────────────── */}
      {newsletter.show && (
        <section className="px-4 md:px-12 py-4">
          <form
            onSubmit={handleNewsletterSubmit}
            className="max-w-6xl mx-auto rounded-2xl px-8 py-7 flex flex-col sm:flex-row items-center gap-5"
            style={{ background: 'linear-gradient(135deg, var(--orange), var(--orange2))' }}
          >
            <div className="flex-1 text-white">
              <div
                className="text-lg font-bold"
                style={{ fontFamily: 'Montserrat, var(--font-head)' }}
              >
                {newsletter.heading}
              </div>
            </div>
            {newsletterDone ? (
              <div className="text-white font-semibold text-sm px-5 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)' }}>
                ✓ You&apos;re on the list!
              </div>
            ) : (
            <div className="flex gap-3 w-full sm:w-auto">
              <input
                type="email"
                placeholder={newsletter.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 sm:w-56 text-sm"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  color: 'white',
                }}
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-full font-bold text-sm shrink-0 transition-opacity hover:opacity-90"
                style={{ background: 'white', color: 'var(--orange)' }}
              >
                {newsletter.btnLabel}
              </button>
            </div>
            )}
          </form>
        </section>
      )}

      {/* ── Upsell CTA ───────────────────────────────────────────────────── */}
      {upsell.show && (
        <section className="px-4 md:px-12 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{
                color: 'var(--white)',
                fontFamily: 'Montserrat, var(--font-head)',
              }}
            >
              {upsell.heading}
            </h2>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--muted)' }}>
              {upsell.subtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/courses" className="btn-primary px-7 py-3 text-sm">
                {upsell.btnEnroll}
              </Link>
              <Link to="/contact" className="btn-outline px-7 py-3 text-sm">
                {upsell.btnDownload}
              </Link>
              <button onClick={modal.open} className="btn-electric px-7 py-3 text-sm">
                {upsell.btnDemo}
              </button>
            </div>
          </div>
        </section>
      )}

      <DemoModal isOpen={modal.isOpen} onClose={modal.close} />
    </div>
  );
}
