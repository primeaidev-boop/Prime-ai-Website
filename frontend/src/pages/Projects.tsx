import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadProjectsData } from '@/data/projectsData';
import type { Project, ProjectCategory } from '@/types';

// ── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, categories }: { project: Project; categories: ProjectCategory[] }) {
  const cat = categories.find((c) => c.slug === project.category);
  return (
    <Link to={`/projects/${project.slug}`} className="glass-card glass-card-hover block group">
      {/* Cover image */}
      <div className="relative overflow-hidden" style={{ borderRadius: '0.75rem 0.75rem 0 0', height: 200 }}>
        {project.coverImageUrl ? (
          <img
            src={project.coverImageUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ background: 'rgba(0,212,255,0.06)' }}
          >
            🚀
          </div>
        )}
        {project.awardBadge && (
          <span
            className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: 'linear-gradient(135deg,var(--orange),var(--orange2))',
              color: '#fff',
              fontFamily: 'var(--font-head)',
            }}
          >
            {project.awardBadge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          {cat && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(0,212,255,0.1)',
                color: 'var(--electric)',
                border: '1px solid rgba(0,212,255,0.2)',
              }}
            >
              {cat.name}
            </span>
          )}
        </div>

        <h3
          className="text-base font-bold mb-2 line-clamp-2 transition-colors group-hover:text-white"
          style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}
        >
          {project.title}
        </h3>
        <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--muted)' }}>
          {project.shortDescription}
        </p>

        {/* Tech stack tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Student info */}
        <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          {project.studentPhotoUrl ? (
            <img src={project.studentPhotoUrl} alt={project.studentName} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--electric)' }}
            >
              {project.studentInitials}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: 'var(--white)' }}>
              {project.studentName}
            </div>
            <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>
              {project.studentCohort}
            </div>
          </div>
          <span className="ml-auto text-xs font-medium" style={{ color: 'var(--electric)' }}>
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Featured Card (Innovation Excellence) ────────────────────────────────────

function FeaturedCard({ project, categories }: { project: Project; categories: ProjectCategory[] }) {
  const cat = categories.find((c) => c.slug === project.category);
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="glass-card glass-card-hover group relative overflow-hidden block"
    >
      <div className="flex flex-col md:flex-row gap-0">
        {/* Image */}
        <div className="relative shrink-0 md:w-64 overflow-hidden" style={{ minHeight: 220 }}>
          {project.coverImageUrl ? (
            <img
              src={project.coverImageUrl}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ minHeight: 220 }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-5xl"
              style={{ background: 'rgba(0,212,255,0.06)', minHeight: 220 }}
            >
              🏆
            </div>
          )}
          {project.awardBadge && (
            <span
              className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: 'linear-gradient(135deg,var(--orange),var(--orange2))',
                color: '#fff',
                fontFamily: 'var(--font-head)',
              }}
            >
              {project.awardBadge}
            </span>
          )}
        </div>

        {/* Text */}
        <div className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {cat && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: 'rgba(0,212,255,0.1)',
                    color: 'var(--electric)',
                    border: '1px solid rgba(0,212,255,0.2)',
                  }}
                >
                  {cat.name}
                </span>
              )}
            </div>
            <h3
              className="text-xl font-bold mb-2 group-hover:text-white transition-colors"
              style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}
            >
              {project.title}
            </h3>
            <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--muted)' }}>
              {project.shortDescription}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              {project.studentPhotoUrl ? (
                <img src={project.studentPhotoUrl} alt={project.studentName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--electric)' }}
                >
                  {project.studentInitials}
                </div>
              )}
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--white)' }}>
                  {project.studentName}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  {project.studentCohort}
                </div>
              </div>
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--electric)' }}>
              View Project →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 6;

export default function Projects() {
  const navigate = useNavigate();
  const data = useMemo(() => loadProjectsData(), []);
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const filterBarRef = useRef<HTMLDivElement>(null);

  const visibleCategories = useMemo(
    () => data.categories.filter((c) => c.isVisible).sort((a, b) => a.order - b.order),
    [data.categories],
  );

  const allProjects = useMemo(
    () => data.projects.filter((p) => p.visible).sort((a, b) => a.order - b.order),
    [data.projects],
  );

  const featuredProjects = useMemo(
    () => allProjects.filter((p) => p.isFeatured),
    [allProjects],
  );

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'all') return allProjects;
    return allProjects.filter((p) => p.category === activeCategory);
  }, [allProjects, activeCategory]);

  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategory]);

  return (
    <main style={{ background: 'var(--navy)', minHeight: '100vh', paddingTop: 64 }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* Background orb */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4 w-[700px] h-[700px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle,var(--electric) 0%,transparent 70%)' }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-left md:text-center">
          <span className="section-tag mb-4 inline-block">{data.hero.eyebrow}</span>
          <h1
            className="text-4xl md:text-6xl font-extrabold leading-tight mb-6"
            style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
          >
            {data.hero.heading1}{' '}
            <span className="gradient-text">{data.hero.heading2Gradient}</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl md:mx-auto mb-10" style={{ color: 'var(--muted)' }}>
            {data.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:justify-center">
            <button className="btn-primary text-base px-8 py-3" onClick={() => navigate('/contact')}>
              {data.hero.ctaPrimary}
            </button>
            <button
              className="btn-outline text-base px-8 py-3"
              onClick={() => filterBarRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              {data.hero.ctaSecondary}
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS ROW (desktop: after hero; mobile: stay here too, 2-col grid) */}
      {data.stats.length > 0 && (
        <section className="px-6 pb-16 max-w-6xl mx-auto">
          <div
            className="glass-card p-6 md:p-8"
            style={{ borderRadius: '1rem' }}
          >
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            >
              {data.stats.map((s) => (
                <div key={s.id} className="text-center">
                  <div
                    className="text-2xl md:text-3xl font-extrabold mb-1 gradient-text"
                    style={{ fontFamily: 'var(--font-head)' }}
                  >
                    {s.value}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--muted)' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── INNOVATION EXCELLENCE (featured projects - hidden on mobile) ──── */}
      {featuredProjects.length > 0 && (
        <section className="hidden md:block px-6 pb-20 max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="section-tag mb-3 inline-block">Innovation Excellence</span>
              <h2
                className="text-3xl font-bold"
                style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
              >
                Featured Projects
              </h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredProjects.slice(0, 4).map((p) => (
              <FeaturedCard key={p.id} project={p} categories={data.categories} />
            ))}
          </div>
        </section>
      )}

      {/* ── FILTER BAR + GRID ─────────────────────────────────────────────── */}
      <section className="pb-24">
        {/* Sticky filter bar */}
        <div
          ref={filterBarRef}
          className="sticky z-30 px-6 py-4"
          style={{
            top: 64,
            background: 'rgba(2,8,24,0.92)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              {visibleCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className="shrink-0 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200"
                  style={{
                    background: activeCategory === cat.slug
                      ? 'linear-gradient(135deg,var(--orange),var(--orange2))'
                      : 'rgba(255,255,255,0.06)',
                    color: activeCategory === cat.slug ? '#fff' : 'var(--muted)',
                    border: activeCategory === cat.slug
                      ? '1px solid transparent'
                      : '1px solid var(--border)',
                    minHeight: 44,
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid header */}
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="section-tag mb-3 inline-block">Explore All Projects</span>
              <h2
                className="text-3xl font-bold"
                style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
              >
                Student Creations
              </h2>
            </div>
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Project grid */}
        <div className="max-w-6xl mx-auto px-6">
          {visibleProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} categories={data.categories} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    className="btn-outline px-8 py-3 text-sm font-semibold"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  >
                    Load More Projects
                  </button>
                </div>
              )}
            </>
          ) : (
            <div
              className="glass-card text-center py-20"
              style={{ borderRadius: '1rem' }}
            >
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>
                No projects found
              </div>
              <div className="text-sm" style={{ color: 'var(--muted)' }}>
                Try a different category filter.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div
          className="max-w-4xl mx-auto rounded-2xl p-10 md:p-14 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(255,107,43,0.08) 100%)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{ background: 'radial-gradient(ellipse at 50% 0%,var(--electric),transparent 70%)' }}
          />
          <h2
            className="relative z-10 text-3xl md:text-4xl font-extrabold mb-4"
            style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
          >
            {data.cta.heading}
          </h2>
          <p className="relative z-10 text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
            {data.cta.description}
          </p>
          <button
            className="relative z-10 btn-primary text-base px-10 py-3"
            onClick={() => navigate('/courses')}
          >
            {data.cta.btnLabel}
          </button>
        </div>
      </section>
    </main>
  );
}
