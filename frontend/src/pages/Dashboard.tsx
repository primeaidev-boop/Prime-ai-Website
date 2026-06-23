import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { loadUserProgress, setLearnerName, toggleSaveTutorial } from '@/data/userProgress';
import { loadTutorialData, saveTutorialData } from '@/data/tutorialData';
import { getTutorialData } from '@/api/tutorials';
import { CertificateModal } from '@/components/tutorial/CertificateModal';
import type { UserProgress, Tutorial, Certificate, TutorialPageData } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTutorialPct(progress: UserProgress, tutorial: Tutorial): number {
  const tut = progress.tutorials[tutorial.id];
  if (!tut) return 0;
  const allLessons = (tutorial.chapters ?? []).flatMap((ch) => ch.lessons).filter((l) => l.visible !== false);
  if (!allLessons.length) return 0;
  const done = allLessons.filter((l) => tut.lessonsProgress[l.id]?.status === 'completed').length;
  return Math.round((done / allLessons.length) * 100);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtMinutes(total: number) {
  if (total < 60) return `${total}m`;
  return `${Math.floor(total / 60)}h ${total % 60}m`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="glass-card rounded-xl p-5 flex flex-col items-center text-center">
      <div className="text-2xl font-black mb-1" style={{ color, fontFamily: 'Montserrat, var(--font-head)' }}>
        {value}
      </div>
      <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>{label}</div>
    </div>
  );
}

function TutorialCard({
  tutorial, progress, onUnsave,
}: {
  tutorial: Tutorial;
  progress: UserProgress;
  onUnsave?: () => void;
}) {
  const pct = getTutorialPct(progress, tutorial);
  const firstLesson = (tutorial.chapters ?? [])[0]?.lessons[0];
  const href = firstLesson ? `/tutorials/${tutorial.slug}/${firstLesson.slug}` : `/tutorials/${tutorial.slug}`;

  return (
    <div className="glass-card rounded-xl p-4 flex flex-col gap-3 relative group" style={{ border: '1px solid var(--border)' }}>
      {onUnsave && (
        <button
          onClick={onUnsave}
          className="absolute top-3 right-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--muted)' }}
          title="Remove bookmark"
        >
          ✕
        </button>
      )}
      <div className="flex items-center gap-3">
        {tutorial.thumbnailUrl ? (
          <img src={tutorial.thumbnailUrl} alt={tutorial.name} className="w-9 h-9 rounded-lg object-cover shrink-0" style={{ border: '1px solid var(--border)' }} />
        ) : (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0" style={{ background: tutorial.logoColor }}>
            {tutorial.logoInitials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate" style={{ color: 'var(--white)' }}>{tutorial.name}</div>
          <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{tutorial.difficulty}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-[11px] mb-1" style={{ color: 'var(--muted)' }}>
          <span>Progress</span><span>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--electric), var(--orange))' }}
          />
        </div>
      </div>

      <Link
        to={href}
        className="btn-electric text-xs px-4 py-2 text-center"
        style={{ textDecoration: 'none' }}
      >
        {pct === 0 ? 'Start Tutorial →' : pct === 100 ? 'Review Tutorial →' : 'Continue →'}
      </Link>
    </div>
  );
}

function CertCard({
  cert, onView,
}: { cert: Certificate; onView: () => void }) {
  return (
    <div
      className="glass-card rounded-xl p-4 flex items-center gap-4"
      style={{ border: '1px solid rgba(0,212,255,0.2)' }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ background: 'rgba(0,212,255,0.08)' }}
      >
        🏆
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate" style={{ color: 'var(--white)' }}>{cert.tutorialName}</div>
        <div className="text-[11px]" style={{ color: 'var(--muted)' }}>Earned {fmtDate(cert.earnedAt)}</div>
      </div>
      <button onClick={onView} className="btn-electric text-[11px] px-3 py-1.5 shrink-0">
        View →
      </button>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ icon, msg, cta }: { icon: string; msg: string; cta?: ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-8 text-center" style={{ border: '1px solid var(--border)' }}>
      <div className="text-3xl mb-3">{icon}</div>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>{msg}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHead({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="font-bold text-base" style={{ color: 'var(--white)', fontFamily: 'Montserrat, var(--font-head)' }}>
        {title}
      </h2>
      {count !== undefined && (
        <span
          className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: 'rgba(0,212,255,0.12)', color: 'var(--electric)' }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgress());
  const [data, setData] = useState<TutorialPageData>(() => loadTutorialData());
  const [nameInput, setNameInput] = useState(progress.learnerName);
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  // Keep data fresh: progress from localStorage, tutorial content from server
  useEffect(() => {
    setProgress(loadUserProgress());
    setData(loadTutorialData());
    getTutorialData().then((serverData) => {
      if (serverData) { setData(serverData); saveTutorialData(serverData); }
    }).catch(() => {});
  }, []);

  const allTutorials = data.tutorials.filter((t) => t.isVisible);

  const tutorialMap = useMemo(() => {
    const m: Record<string, Tutorial> = {};
    allTutorials.forEach((t) => { m[t.id] = t; });
    return m;
  }, [allTutorials]);

  // Tutorials with at least one lesson started/completed
  const startedTutorials = useMemo(
    () => allTutorials.filter((t) => {
      const rec = progress.tutorials[t.id];
      return rec && Object.keys(rec.lessonsProgress).length > 0;
    }),
    [allTutorials, progress],
  );

  const completedTutorials = useMemo(
    () => allTutorials.filter((t) => progress.completedTutorials.includes(t.id)),
    [allTutorials, progress],
  );

  const inProgressTutorials = useMemo(
    () => startedTutorials.filter((t) => !progress.completedTutorials.includes(t.id)),
    [startedTutorials, progress],
  );

  const savedTutorials = useMemo(
    () => progress.savedTutorials.map((id) => tutorialMap[id]).filter(Boolean) as Tutorial[],
    [progress.savedTutorials, tutorialMap],
  );

  const hasAnyActivity = startedTutorials.length > 0 || savedTutorials.length > 0 || progress.certificates.length > 0;

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const updated = setLearnerName(trimmed);
    setProgress(updated);
  };

  const handleUnsave = (tutorialId: string) => {
    const updated = toggleSaveTutorial(tutorialId);
    setProgress(updated);
  };

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-28 pb-20">

        {/* Header */}
        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.2em] mb-2 font-semibold" style={{ color: 'var(--electric)' }}>
            My Learning Dashboard
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-2">
            <h1
              className="text-3xl md:text-4xl font-bold leading-tight"
              style={{ color: 'var(--white)', fontFamily: 'Montserrat, var(--font-head)' }}
            >
              {progress.learnerName ? `Welcome back, ${progress.learnerName}!` : 'Welcome Back!'}
            </h1>
          </div>
          {/* Name editor */}
          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              onBlur={handleSaveName}
              placeholder="Enter your name for certificates…"
              className="text-sm max-w-xs"
              style={{ paddingTop: '8px', paddingBottom: '8px' }}
            />
            {nameInput.trim() && nameInput.trim() !== progress.learnerName && (
              <button onClick={handleSaveName} className="btn-electric text-xs px-3 py-1.5">
                Save
              </button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <StatCard value={startedTutorials.length} label="Started" color="var(--electric)" />
          <StatCard value={completedTutorials.length} label="Completed" color="#34d399" />
          <StatCard value={fmtMinutes(progress.totalLearningMinutes)} label="Learning Time" color="var(--orange)" />
          <StatCard value={progress.certificates.length} label="Certificates" color="#FBBF24" />
        </div>

        {/* Full empty state */}
        {!hasAnyActivity && (
          <EmptyState
            icon="📚"
            msg="You haven't started any tutorials yet. Begin learning and your progress will appear here."
            cta={
              <Link to="/tutorials" className="btn-primary text-sm px-6 py-2.5" style={{ textDecoration: 'none' }}>
                Browse Tutorials →
              </Link>
            }
          />
        )}

        {/* In Progress */}
        {inProgressTutorials.length > 0 && (
          <section className="mb-10">
            <SectionHead title="In Progress" count={inProgressTutorials.length} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressTutorials.map((t) => (
                <TutorialCard key={t.id} tutorial={t} progress={progress} />
              ))}
            </div>
          </section>
        )}

        {/* Completed */}
        {completedTutorials.length > 0 && (
          <section className="mb-10">
            <SectionHead title="Completed" count={completedTutorials.length} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedTutorials.map((t) => (
                <TutorialCard key={t.id} tutorial={t} progress={progress} />
              ))}
            </div>
          </section>
        )}

        {/* Saved / Bookmarked */}
        <section className="mb-10">
          <SectionHead title="Saved Tutorials" count={savedTutorials.length} />
          {savedTutorials.length === 0 ? (
            <EmptyState
              icon="☆"
              msg="Bookmark tutorials with the ★ button to save them for later."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedTutorials.map((t) => (
                <TutorialCard
                  key={t.id}
                  tutorial={t}
                  progress={progress}
                  onUnsave={() => handleUnsave(t.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Certificates */}
        <section className="mb-10">
          <SectionHead title="Certificates" count={progress.certificates.length} />
          {progress.certificates.length === 0 ? (
            <EmptyState
              icon="🏆"
              msg="Complete a certificate-eligible tutorial to earn your first certificate."
              cta={
                <Link to="/tutorials" className="btn-outline text-sm px-5 py-2" style={{ textDecoration: 'none' }}>
                  Find Tutorials →
                </Link>
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {progress.certificates.map((cert) => (
                <CertCard
                  key={cert.tutorialId}
                  cert={cert}
                  onView={() => setActiveCert(cert)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Upsell CTA */}
        <div
          className="glass-card rounded-2xl p-8 text-center"
          style={{ border: '1px solid rgba(255,107,43,0.2)', background: 'rgba(255,107,43,0.04)' }}
        >
          <div className="text-3xl mb-3">🚀</div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--white)', fontFamily: 'Montserrat, var(--font-head)' }}
          >
            Ready to go beyond tutorials?
          </h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
            Join a live cohort at PRIM AI Institute and get hands-on mentorship, projects, and a industry-recognised certification.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/courses" className="btn-primary text-sm px-6 py-2.5" style={{ textDecoration: 'none' }}>
              Explore Courses →
            </Link>
            <Link to="/contact" className="btn-outline text-sm px-6 py-2.5" style={{ textDecoration: 'none' }}>
              Book a Free Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Certificate modal */}
      {activeCert && (
        <CertificateModal
          certificate={{ ...activeCert, learnerName: progress.learnerName || activeCert.learnerName }}
          onClose={() => setActiveCert(null)}
          onNameSaved={(name) => {
            const updated = loadUserProgress();
            setProgress(updated);
            setNameInput(name);
          }}
        />
      )}
    </div>
  );
}
