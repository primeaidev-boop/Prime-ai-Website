import { useMemo, useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadProjectsData, saveProjectsData } from '@/data/projectsData';
import { getProjectsData } from '@/api/projects';
import { BlockRenderer } from '@/components/tutorial/BlockRenderer';
import type { ProjectPageData } from '@/types';

function buildSrcDoc(html: string, css: string, js: string): string {
  const safeJs = js.replace(/<\/script>/gi, '<\\/script>');
  const safeCss = css.replace(/<\/style>/gi, '<\\/style>');
  // In a sandbox="allow-scripts" iframe (no allow-same-origin), accessing
  // window.localStorage throws SecurityError and kills the entire script.
  // This shim catches that error and installs an in-memory replacement so
  // games and apps that call localStorage without try/catch still run.
  // Scores/prefs won't persist across page refreshes - everything else works.
  const storagePatch =
    '<script>(function(){' +
    'function mem(){var s={};return{' +
    'getItem:function(k){return s.hasOwnProperty(k)?s[k]:null;},' +
    'setItem:function(k,v){s[String(k)]=String(v);},' +
    'removeItem:function(k){delete s[String(k)];},' +
    'clear:function(){s={};},' +
    'key:function(i){return Object.keys(s)[i]??null;},' +
    'get length(){return Object.keys(s).length;}' +
    '};}' +
    "['localStorage','sessionStorage'].forEach(function(n){" +
    'try{window[n].getItem("__");}' +
    'catch(e){try{Object.defineProperty(window,n,{value:mem(),configurable:true,writable:true});}catch(e2){}}' +
    '});' +
    '})();<\/script>';
  return [
    '<!DOCTYPE html><html><head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    storagePatch,
    `<style>*{box-sizing:border-box}body{margin:0;padding:16px}${safeCss}</style>`,
    `</head><body>${html}`,
    `<script>${safeJs}<\/script>`,
    '</body></html>',
  ].join('');
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProjectPageData>(() => loadProjectsData());

  useEffect(() => {
    getProjectsData().then((serverData) => {
      if (serverData) {
        setData(serverData);
        saveProjectsData(serverData);
      }
    }).catch(() => {});
  }, []);

  const project = useMemo(
    () => data.projects.find((p) => p.slug === slug && p.visible),
    [data.projects, slug],
  );

  const category = useMemo(
    () => project ? data.categories.find((c) => c.slug === project.category) : undefined,
    [data.categories, project],
  );

  // Live Demo state
  const DEMO_SCALE = 0.85; // iframe zoom - content renders at compact/tablet width
  const [demoKey, setDemoKey] = useState(0);
  const [nativeFsActive, setNativeFsActive] = useState(false);
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);
  const isFullscreen = nativeFsActive || isCssFullscreen;
  const demoRef = useRef<HTMLDivElement>(null); // outer card - used for native fullscreen

  // Native fullscreen events (desktop Chrome/Firefox/Android)
  useEffect(() => {
    const onFsc = () => setNativeFsActive(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsc);
    return () => document.removeEventListener('fullscreenchange', onFsc);
  }, []);

  // Escape closes CSS overlay fullscreen (iOS / fallback)
  useEffect(() => {
    if (!isCssFullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsCssFullscreen(false); };
    document.addEventListener('keydown', onKey);
    // Prevent background scroll while overlay is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isCssFullscreen]);

  function toggleFullscreen() {
    // Dismiss either mode
    if (isCssFullscreen) { setIsCssFullscreen(false); return; }
    if (nativeFsActive) { document.exitFullscreen(); return; }

    // Try native Fullscreen API (desktop + Android Chrome)
    if (document.fullscreenEnabled && demoRef.current) {
      demoRef.current.requestFullscreen().catch(() => {
        // Rejected - iOS Safari or restricted context; fall back to CSS overlay
        setIsCssFullscreen(true);
      });
    } else {
      // iOS Safari: fullscreenEnabled is false/undefined - always use CSS overlay
      setIsCssFullscreen(true);
    }
  }

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

            {/* ── Rich Content Blocks ──────────────────────────────────────── */}
            {project.contentBlocks && project.contentBlocks.length > 0 && (
              <div className="flex flex-col gap-6">
                {project.contentBlocks.map((block) => (
                  <BlockRenderer key={block.id} block={block} />
                ))}
              </div>
            )}

            {/* ── Live Code Demo ───────────────────────────────────────────── */}
            {project.codeRunnerEnabled && project.codeHtml && (
              <div
                ref={demoRef}
                className="glass-card overflow-hidden"
                style={isFullscreen ? {
                  // CSS overlay fullscreen (iOS + fallback) OR native fullscreen layout
                  ...(isCssFullscreen ? {
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    borderRadius: 0,
                  } : {}),
                  display: 'flex',
                  flexDirection: 'column',
                } : {}}
              >
                {/* Header bar - unchanged */}
                <div
                  className="flex items-center justify-between px-6 py-4"
                  style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg,var(--orange),var(--orange2))',
                        color: '#fff',
                      }}
                    >
                      LIVE
                    </span>
                    <h2
                      className="text-2xl font-bold"
                      style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
                    >
                      Live Demo
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDemoKey((k) => k + 1)}
                      title="Reset demo"
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>↺</span> Reset
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>{isFullscreen ? '⊠' : '⛶'}</span>
                      {isFullscreen ? 'Exit' : 'Fullscreen'}
                    </button>
                  </div>
                </div>

                {/* Sandboxed iframe - allow-scripts only, no allow-same-origin */}
                <div
                  style={{
                    // Fill remaining space in fullscreen; fixed height otherwise
                    flex: isFullscreen ? '1 1 0' : undefined,
                    height: isFullscreen ? undefined : 'clamp(300px, 50vw, 500px)',
                    background: '#fff',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <iframe
                    key={demoKey}
                    srcDoc={buildSrcDoc(
                      project.codeHtml,
                      project.codeCss ?? '',
                      project.codeJs ?? '',
                    )}
                    sandbox="allow-scripts"
                    title="Live Project Demo"
                    style={{
                      border: 'none',
                      display: 'block',
                      // Scale content to ~85% so the demo reads as a compact
                      // tablet-style preview on all screen sizes and viewports.
                      width: `${(100 / DEMO_SCALE).toFixed(1)}%`,
                      height: `${(100 / DEMO_SCALE).toFixed(1)}%`,
                      transform: `scale(${DEMO_SCALE})`,
                      transformOrigin: 'top left',
                    }}
                  />
                </div>
              </div>
            )}

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
                    loading="lazy"
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
