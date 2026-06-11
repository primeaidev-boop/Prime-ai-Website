// Glassmorphism card — base container used throughout the site

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  return (
    <div
      className={`glass-card ${hover ? 'glass-card-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
