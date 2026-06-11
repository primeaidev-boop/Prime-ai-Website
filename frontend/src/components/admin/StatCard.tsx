// Admin dashboard stat card — shows icon, big number, label, optional trend

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

const trendSymbol = { up: '↑', down: '↓', neutral: '→' } as const;
const trendColor = {
  up: '#22c55e',
  down: 'var(--orange)',
  neutral: 'var(--muted)',
} as const;

export function StatCard({
  label,
  value,
  icon,
  trend,
  color = 'var(--electric)',
}: StatCardProps) {
  return (
    <div className="glass-card glass-card-hover p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span
            className="text-sm font-bold"
            style={{ color: trendColor[trend] }}
          >
            {trendSymbol[trend]}
          </span>
        )}
      </div>
      <div
        className="text-4xl font-bold"
        style={{ fontFamily: 'var(--font-head)', color }}
      >
        {value}
      </div>
      <div className="text-sm" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
    </div>
  );
}
