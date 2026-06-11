import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useModal } from '@/hooks/useModal';
import { DemoModal } from '@/components/shared/DemoModal';
import { useSettingsStore } from '@/store/settingsStore';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const modal = useModal();
  const s = useSettingsStore((state) => state.s);

  const links = [
    { to: '/', label: s.navLinkHome },
    { to: '/about', label: s.navLinkAbout },
    { to: '/courses', label: s.navLinkCourses },
    { to: '/contact', label: s.navLinkContact },
  ];

  return (
    <>
      <nav
        id="mainNav"
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 h-16 transition-all duration-300"
        style={{
          background: 'rgba(2,8,24,0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <NavLink
          to="/"
          className="text-lg font-bold gradient-text"
          style={{ fontFamily: 'var(--font-head)' }}
        >
          {s.navLogoText}
        </NavLink>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? '' : 'hover:text-white'}`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--electric)' : 'var(--muted)',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={modal.open} className="btn-primary text-sm px-5 py-2">
            {s.navCtaText}
          </button>
        </div>

        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: 'var(--muted)' }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {menuOpen && (
        <div
          className="fixed inset-0 z-30 pt-16 flex flex-col gap-2 p-6"
          style={{ background: 'rgba(2,8,24,0.98)' }}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-lg text-base font-medium"
              style={({ isActive }) => ({
                color: isActive ? 'var(--electric)' : 'var(--white)',
                background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
              })}
            >
              {link.label}
            </NavLink>
          ))}
          <button
            onClick={() => { setMenuOpen(false); modal.open(); }}
            className="btn-primary mt-4"
          >
            {s.navCtaText}
          </button>
        </div>
      )}

      <DemoModal isOpen={modal.isOpen} onClose={modal.close} />
    </>
  );
}
