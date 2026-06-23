import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useModal } from '@/hooks/useModal';
import { DemoModal } from '@/components/shared/DemoModal';
import { useSettingsStore } from '@/store/settingsStore';

const COURSE_LINKS = [
  { to: '/courses', label: 'All Courses', sub: 'View all programs', icon: '📚' },
  { to: '/courses/l1', label: 'AI Foundation (L1)', sub: 'Entry point for everyone', icon: '🎯' },
  { to: '/courses/l2a', label: 'AI Generalist (L2A)', sub: 'Non-tech track · L2A', icon: '⚡' },
  { to: '/courses/l2b', label: 'AI Developer (L2B)', sub: 'Tech track · L2B', icon: '💻' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modal = useModal();
  const s = useSettingsStore((state) => state.s);
  const location = useLocation();
  const navigate = useNavigate();

  const coursesActive = location.pathname.startsWith('/courses');

  const baseLinks = [
    { to: '/', label: s.navLinkHome },
    { to: '/about', label: s.navLinkAbout },
    { to: '/tutorials', label: 'Tutorials' },
    { to: '/dashboard', label: 'My Progress' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: s.navLinkContact },
  ];

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDropOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  function onMouseEnterTrigger() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setDropOpen(true);
  }

  function onMouseLeaveArea() {
    hoverTimer.current = setTimeout(() => setDropOpen(false), 120);
  }

  function onMouseEnterPanel() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }

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
        <NavLink to="/" className="flex items-center">
          <img
            src="/Asset%2016.svg"
            alt="PRIM AI Institute"
            className="h-9 w-auto"
            style={{ maxHeight: 36 }}
          />
        </NavLink>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? '' : 'hover:text-white'}`
            }
            style={({ isActive }) => ({ color: isActive ? 'var(--electric)' : 'var(--muted)' })}
          >
            {s.navLinkHome}
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? '' : 'hover:text-white'}`
            }
            style={({ isActive }) => ({ color: isActive ? 'var(--electric)' : 'var(--muted)' })}
          >
            {s.navLinkAbout}
          </NavLink>

          {/* Courses dropdown trigger */}
          <div
            ref={dropRef}
            className="relative"
            onMouseEnter={onMouseEnterTrigger}
            onMouseLeave={onMouseLeaveArea}
          >
            <button
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-white"
              style={{ color: coursesActive ? 'var(--electric)' : 'var(--muted)' }}
              onClick={() => navigate('/courses')}
              aria-haspopup="true"
              aria-expanded={dropOpen}
            >
              {s.navLinkCourses}
              <svg
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{ transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown panel */}
            {dropOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[280px] z-[300] rounded-2xl overflow-hidden py-2"
                style={{
                  background: '#020818',
                  border: '1px solid var(--border)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
                }}
                onMouseEnter={onMouseEnterPanel}
                onMouseLeave={onMouseLeaveArea}
              >
                {COURSE_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/courses'}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5"
                    onClick={() => setDropOpen(false)}
                  >
                    <span className="text-lg mt-0.5">{link.icon}</span>
                    <div>
                      <div
                        className="text-sm font-semibold"
                        style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}
                      >
                        {link.label}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                        {link.sub}
                      </div>
                    </div>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <NavLink
            to="/tutorials"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? '' : 'hover:text-white'}`
            }
            style={({ isActive }) => ({ color: isActive ? 'var(--electric)' : 'var(--muted)' })}
          >
            Tutorials
          </NavLink>

          <NavLink
            to="/blog"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? '' : 'hover:text-white'}`
            }
            style={({ isActive }) => ({ color: isActive ? 'var(--electric)' : 'var(--muted)' })}
          >
            Blog
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? '' : 'hover:text-white'}`
            }
            style={({ isActive }) => ({ color: isActive ? 'var(--electric)' : 'var(--muted)' })}
          >
            {s.navLinkContact}
          </NavLink>
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

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 pt-16 flex flex-col gap-1 p-4 overflow-y-auto"
          style={{ background: 'rgba(2,8,24,0.98)' }}
        >
          {baseLinks.slice(0, 2).map((link) => (
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

          {/* Mobile courses accordion */}
          <div>
            <button
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium"
              style={{
                color: coursesActive ? 'var(--electric)' : 'var(--white)',
                background: coursesActive ? 'rgba(0,212,255,0.08)' : 'transparent',
              }}
              onClick={() => setMobileCoursesOpen((v) => !v)}
            >
              <span>{s.navLinkCourses}</span>
              <svg
                className="w-4 h-4 transition-transform duration-200"
                style={{ transform: mobileCoursesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {mobileCoursesOpen && (
              <div className="ml-4 mt-1 flex flex-col gap-1">
                {COURSE_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/courses'}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
                    style={({ isActive }) => ({
                      color: isActive ? 'var(--electric)' : 'var(--muted)',
                      background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                    })}
                  >
                    <span>{link.icon}</span>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'inherit' }}>{link.label}</div>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>{link.sub}</div>
                    </div>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {baseLinks.slice(2).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
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
