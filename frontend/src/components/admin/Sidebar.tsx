// Admin sidebar navigation

import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const links = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/bookings', icon: '📅', label: 'Demo Bookings' },
  { to: '/admin/enquiries', icon: '📩', label: 'Enquiries' },
  { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
];

export function Sidebar() {
  const { admin, logout } = useAuth();

  return (
    <aside
      className="flex flex-col h-full w-64 px-4 py-6 gap-2"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid var(--border)',
      }}
    >
      <div className="mb-6 px-2">
        <div
          className="text-lg font-bold gradient-text"
          style={{ fontFamily: 'var(--font-head)' }}
        >
          PRIM AI
        </div>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          Admin Panel
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'hover:bg-white/5'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: 'rgba(0,212,255,0.1)',
                    color: 'var(--electric)',
                    border: '1px solid rgba(0,212,255,0.2)',
                  }
                : { color: 'var(--muted)' }
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div
        className="mt-auto pt-4 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="px-2 mb-3">
          <div className="text-sm font-medium" style={{ color: 'var(--white)' }}>
            {admin?.name}
          </div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            {admin?.email}
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
          style={{ color: 'var(--muted)' }}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
