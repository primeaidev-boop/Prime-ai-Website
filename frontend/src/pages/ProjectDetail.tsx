import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadProjectsData } from '@/data/projectsData';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const data = useMemo(() => loadProjectsData(), []);

  const project = useMemo(
    () => data.projects.find((p) => p.slug === slug && p.visible),
    [data.projects, slug],
  );

  const category = useMemo(
    () => project ? data.categories.find((c) => c.slug === project.category) : undefined,
    [data.categories, project],
  );

  if (!project) {
    return (
      <main
        style={{ background: 'var(--navy)', minHeight: '100vh', paddingTop: 64 }}
        className="flex flex-col items-center justify-center gap-6 text-center px-6"
      >
        <div className="text-6xl">🔍</div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>
          Project Not Found
        </h1>
        <p style={{ color: 'var(--muted)' }}>
          This project doesn't exist or is no longer visible.
        </p>
        <Link to="/projects" className="btn-primary px-8 py-3">
          Back to Projects
        </Link>
      </main>
    );
  }

  return (
    <main style={{ background: 'var(--navy)', minHeight: '100vh', paddingTop: 64 }}>

      {/* ── COVER HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        {project.coverImageUrl ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${project.coverImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.25)',
            }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(0,212,255,0.15),transparent 70%)' }}
          />
        )}

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--muted)' }}>
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/projects" className="hover:text-white transition-colors">Projects</Link>
            <span>/</span>
            <span style={{ color: 'var(--white)' }}>{project.title}</span>
          </nav>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {category && (
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(0,212,255,0.15)',
                  color: 'var(--electric)',
                  border: '1px solid rgba(0,212,255,0.3)',
                }}
              >
                {category.name}
              </span>
            )}
            {project.awardBadge && (
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  background: 'linear-gradient(135deg,var(--orange),var(--orange2))',
                  color: '#fff',
                }}
              >
                {project.awardBadge}
              </span>
            )}
          </div>

          <h1
            className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 max-w-3xl"
            style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
          >
            {project.title}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8" style={{ color: 'var(--muted)' }}>
            {project.shortDescription}
          </p>

          {/* Action buttons - only render when URLs are non-empty */}
          <div className="flex flex-wrap gap-4">
            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-6 py-3 text-sm font-semibold"
              >
                🔗 Live Demo
              </a>
            )}
            {project.sourceCodeUrl && (
              <a
                href={project.sourceCodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline px-6 py-3 text-sm font-semibold"
              >
                {'</>  '} Source Code
              </a>
            )}
            <button
              className="btn-electric px-6 py-3 text-sm font-semibold"
              onClick={() => navigate('/projects')}
            >
              ← All Projects
            </button>
          </div>
        </div>
      </section>

      {/* ── BODY - two-column on desktop ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left - main content (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-10">

            {/* About Project */}
            <div className="glass-card p-8">
              <h2
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
              >
                About the Project
              </h2>

              <div className="mb-6">
                <h3
                  className="text-sm font-semibold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--electric)' }}
                >
                  The Problem
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {project.problemStatement}
                </p>
              </div>

              <div className="mb-6">
                <h3
                  className="text-sm font-semibold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--electric)' }}
                >
                  The Solution
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {project.solution}
                </p>
              </div>

              {project.keyFeatures.length > 0 && (
                <div>
                  <h3
                    className="text-sm font-semibold uppercase tracking-widest mb-3"
                    style={{ color: 'var(--electric)' }}
                  >
                    Key Features
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {project.keyFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-1 shrink-0" style={{ color: 'var(--electric)' }}>✓</span>
                        <span style={{ color: 'var(--muted)' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Student Story */}
            <div className="glass-card p-8">
              <h2
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
              >
                Student Story
              </h2>
              <div className="flex items-start gap-5">
                {project.studentPhotoUrl ? (
                  <img
                    src={project.studentPhotoUrl}
                    alt={project.studentName}
                    className="w-16 h-16 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                    style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--electric)' }}
                  >
                    {project.studentInitials}
                  </div>
                )}
                <div>
                  <div
                    className="text-lg font-bold mb-0.5"
                    style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}
                  >
                    {project.studentName}
                  </div>
                  <div className="text-sm mb-4" style={{ color: 'var(--electric)' }}>
                    {project.studentCohort}
                  </div>
                  <blockquote
                    className="text-base italic leading-relaxed"
                    style={{ color: 'var(--muted)' }}
                  >
                    {project.studentQuote}
                  </blockquote>
                </div>
              </div>
            </div>

            {/* Mentor Feedback */}
            <div
              className="glass-card p-8"
              style={{ borderLeft: '3px solid var(--orange)' }}
            >
              <h2
                className="text-xl font-bold mb-5"
                style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
              >
                Mentor Feedback
              </h2>
              <blockquote
                className="text-base italic leading-relaxed mb-4"
                style={{ color: 'var(--muted)' }}
              >
                {project.mentorQuote}
              </blockquote>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--white)' }}>
                  - {project.mentorName}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  {project.mentorTitle}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Project Impact */}
            {project.impactStats.length > 0 && (
              <div className="glass-card p-6">
                <h3
                  className="text-lg font-bold mb-5"
                  style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
                >
                  Project Impact
                </h3>
                <div className="flex flex-col gap-4">
                  {project.impactStats.map((stat) => (
                    <div key={stat.id}>
                      <div
                        className="text-3xl font-extrabold mb-1"
                        style={{
                          fontFamily: 'var(--font-head)',
                          background: 'linear-gradient(135deg,var(--orange),var(--orange2))',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted)' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {project.techStack.length > 0 && (
              <div className="glass-card p-6">
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
                >
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-sm font-medium px-3 py-1.5 rounded-lg"
                      style={{
                        background: 'rgba(0,212,255,0.08)',
                        color: 'var(--electric)',
                        border: '1px solid rgba(0,212,255,0.15)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links sidebar card */}
            {(project.liveDemoUrl || project.sourceCodeUrl) && (
              <div className="glass-card p-6">
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
                >
                  Project Links
                </h3>
                <div className="flex flex-col gap-3">
                  {project.liveDemoUrl && (
                    <a
                      href={project.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm py-2.5 text-center"
                    >
                      🔗 View Live Demo
                    </a>
                  )}
                  {project.sourceCodeUrl && (
                    <a
                      href={project.sourceCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-sm py-2.5 text-center"
                    >
                      Source Code
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Back to projects */}
            <Link
              to="/projects"
              className="btn-electric text-sm py-2.5 text-center"
              style={{ borderRadius: '0.5rem' }}
            >
              ← Back to All Projects
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
