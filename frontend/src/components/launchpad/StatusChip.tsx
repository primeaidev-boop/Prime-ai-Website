import type { BatchStatus } from '@/data/aiLaunchpadContent';

const STYLE: Record<BatchStatus, { label: string; color: string; bg: string; border: string }> = {
  OPEN: { label: 'Open', color: 'var(--lp-cyan)', bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.35)' },
  FILLING: { label: 'Filling Fast', color: 'var(--lp-orange)', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.35)' },
  CLOSED: { label: 'Closed', color: 'var(--lp-muted)', bg: 'rgba(255,255,255,0.05)', border: 'var(--lp-border)' },
};

export function StatusChip({ status }: { status: BatchStatus }) {
  const st = STYLE[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
      style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: st.color }} />
      {st.label}
    </span>
  );
}
