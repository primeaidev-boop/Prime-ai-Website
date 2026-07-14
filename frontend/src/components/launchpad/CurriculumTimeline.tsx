import { useState } from 'react';
import type { CurriculumDay } from '@/data/aiLaunchpadContent';

interface DayRowProps {
  item: CurriculumDay;
  isOpen: boolean;
  onToggle: () => void;
}

function DayRow({ item, isOpen, onToggle }: DayRowProps) {
  return (
    <div
      className="lp-glass-card rounded-2xl overflow-hidden"
      style={{ borderColor: isOpen ? 'rgba(249,115,22,0.4)' : 'var(--lp-border)' }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <span
          className="w-9 h-9 min-w-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: isOpen ? 'var(--lp-orange)' : 'rgba(255,255,255,0.06)',
            color: isOpen ? '#fff' : 'var(--lp-muted)',
            fontFamily: 'var(--lp-font-head)',
          }}
        >
          {item.day}
        </span>
        <span className="flex-1 font-semibold text-sm md:text-base" style={{ color: 'var(--lp-white)' }}>
          {item.title}
        </span>
        <span
          className="w-6 h-6 min-w-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold"
          style={{
            border: `1px solid ${isOpen ? 'var(--lp-orange)' : 'var(--lp-border)'}`,
            color: isOpen ? 'var(--lp-orange)' : 'var(--lp-muted)',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'all 0.3s',
          }}
        >
          +
        </span>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pl-[4.25rem]">
          <div
            className="flex items-start gap-2.5 text-sm rounded-xl px-4 py-3"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            <span className="font-bold flex-shrink-0" style={{ color: 'var(--lp-blue)' }}>Practical:</span>
            <span style={{ color: 'var(--lp-muted)' }}>{item.practical}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Days 6-10 in the curriculum are the 5 hands-on "Project" days —
// used to drive an accurate "projects unlocked" count, not a 1:1 day count.
const PROJECT_DAY_THRESHOLD = 6;

export function CurriculumTimeline({ days }: { days: CurriculumDay[] }) {
  const [openDays, setOpenDays] = useState<Set<number>>(new Set([1]));
  const projectsUnlocked = [...openDays].filter((d) => d >= PROJECT_DAY_THRESHOLD).length;
  const totalProjects = days.filter((d) => d.day >= PROJECT_DAY_THRESHOLD).length;

  const toggle = (day: number) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <span className="lp-section-tag">10-Day Curriculum</span>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ color: 'var(--lp-cyan)', border: '1px solid rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.08)' }}
        >
          {openDays.size} of {days.length} days explored · {projectsUnlocked} of {totalProjects} projects in your portfolio
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {days.map((item) => (
          <DayRow
            key={item.day}
            item={item}
            isOpen={openDays.has(item.day)}
            onToggle={() => toggle(item.day)}
          />
        ))}
      </div>
    </div>
  );
}
