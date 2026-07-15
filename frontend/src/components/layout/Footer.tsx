// Public site footer -4-col grid with contact, social, legal links

import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';

// ── Inline SVG social icons (lucide-react doesn't export these) ──────────────

function IconWhatsApp({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconLinkedIn({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconInstagram({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function IconYouTube({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#040d1e" />
    </svg>
  );
}

// ── Social button in contact col ──────────────────────────────────────────────

interface SocialIconBtnProps {
  href: string;
  label: string;
  hoverColor: string;
  children: React.ReactNode;
}

function SocialIconBtn({ href, label, hoverColor, children }: SocialIconBtnProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--muted)' }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.color = hoverColor;
        el.style.borderColor = hoverColor + '66';
        el.style.background = hoverColor + '18';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.color = 'var(--muted)';
        el.style.borderColor = 'var(--border)';
        el.style.background = 'rgba(255,255,255,0.04)';
      }}
    >
      {children}
    </a>
  );
}

// ── Footer link with hover arrow ──────────────────────────────────────────────

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link
        to={to}
        className="group flex items-center gap-1.5 text-sm transition-all duration-200"
        style={{ color: 'var(--muted)' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--white)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; }}
      >
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[0.7rem]">➞</span>
        {label}
      </Link>
    </li>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Footer() {
  const footerSettings = useSettingsStore((state) => state.s.footerSettings);

  const s = (key: string, fallback = '') => footerSettings[key] ?? fallback;
  const show = (key: string) => s(key) !== 'false';

  const waNumber = s('footer_wa_float_number');
  const waUrl = waNumber ? `https://wa.me/${waNumber}` : '#';

  const socialLinks = [
    { href: s('footer_social_whatsapp'), label: 'WhatsApp', color: '#25d366', Icon: IconWhatsApp },
    { href: s('footer_social_linkedin'), label: 'LinkedIn', color: '#0A66C2', Icon: IconLinkedIn },
    { href: s('footer_social_instagram'), label: 'Instagram', color: '#E1306C', Icon: IconInstagram },
    { href: s('footer_social_youtube'), label: 'YouTube', color: '#FF0000', Icon: IconYouTube },
  ].filter((link) => link.href);

  const legalLinks = [
    { label: 'Privacy Policy',     href: s('footer_privacy_url', '/privacy') },
    { label: 'Terms & Conditions', href: s('footer_terms_url', '/terms') },
    { label: 'Refund Policy',      href: s('footer_refund_url', '/refund-policy') },
  ];

  return (
    <footer
        style={{ background: 'var(--navy2)', borderTop: '1px solid var(--border)' }}
        className="relative overflow-hidden"
      >
        {/* Gradient top line */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, var(--electric), #a78bfa, transparent)', opacity: 0.5 }}
        />

        {/* SECTION C -MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1.4fr] gap-10 px-6 md:px-20 py-16">

          {/* COL 1 -Brand (always visible) */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center">
              <img
                src="/Asset%2016.svg"
                alt="PRIM AI Institute"
                className="h-8 w-auto"
                style={{ maxHeight: 32 }}
              />
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--electric)' }}>
              Learn AI. Use AI. Lead with AI.
            </p>
            <p className="text-sm leading-[1.7] max-w-[260px]" style={{ color: 'var(--muted)' }}>
              {s('footer_desc')}
            </p>
            {show('footer_iso_show') && (
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full w-fit"
                style={{
                  background: 'rgba(0,212,255,0.06)',
                  border: '1px solid rgba(0,212,255,0.2)',
                }}
              >
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[0.6rem] font-black"
                  style={{ background: 'var(--electric)', color: 'var(--navy)' }}
                >
                  ✓
                </span>
                <span className="text-xs font-semibold tracking-[0.5px]" style={{ color: 'var(--electric)' }}>
                  ISO 9001:2015 Certified
                </span>
              </div>
            )}
            <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
              © 2026 PRIM AI Institute. All rights reserved.
            </p>
          </div>

          {/* COL 2 -Quick Links */}
          {show('footer_quicklinks_show') && (
            <div>
              <h4
                className="text-sm font-bold mb-5 tracking-[-0.2px]"
                style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
              >
                Quick Links
              </h4>
              <ul className="flex flex-col gap-2.5">
                <FooterLink to="/" label="Home" />
                <FooterLink to="/about" label="About Us" />
                <FooterLink to="/courses" label="All Courses" />
                <FooterLink to="/projects" label="Projects" />
                <FooterLink to="/blog" label="Blog" />
                <FooterLink to="/contact" label="Contact Us" />
              </ul>
            </div>
          )}

          {/* COL 3 -Courses */}
          {show('footer_courses_show') && (
            <div>
              <h4
                className="text-sm font-bold mb-5 tracking-[-0.2px]"
                style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
              >
                Our Courses
              </h4>
              <ul className="flex flex-col gap-2.5 mb-7">
                {[
                  { label: 'AI Foundation Program',  badge: 'L1',  color: 'var(--electric)' },
                  { label: 'AI Generalist Program',  badge: 'L2A', color: 'var(--orange)' },
                  { label: 'AI Developer Program',   badge: 'L2B', color: '#a78bfa' },
                ].map((c) => (
                  <li key={c.badge}>
                    <Link
                      to="/courses"
                      className="group flex items-center gap-2 text-sm transition-all duration-200"
                      style={{ color: 'var(--muted)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--white)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[0.7rem]">➞</span>
                      {c.label}
                      <span
                        className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full border ml-auto shrink-0"
                        style={{ color: c.color, borderColor: c.color + '66', background: c.color + '18' }}
                      >
                        {c.badge}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {show('footer_explore_more_show') && (
                <>
                  <h4
                    className="text-sm font-bold mb-4 tracking-[-0.2px]"
                    style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
                  >
                    Explore More
                  </h4>
                  <ul className="flex flex-col gap-2.5">
                    <FooterLink to="/contact" label="Corporate Training" />
                    <FooterLink to="/about" label="Success Stories" />
                  </ul>
                </>
              )}
            </div>
          )}

          {/* COL 4 -Contact + Social */}
          {show('footer_contact_show') && (
            <div>
              <h4
                className="text-sm font-bold mb-5 tracking-[-0.2px]"
                style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
              >
                Get In Touch
              </h4>
              <div className="flex flex-col gap-3 mb-6">
                {[
                  { icon: '📍', text: s('footer_address') },
                  { icon: '📞', text: s('footer_phone'), href: `tel:${s('footer_phone')}` },
                  { icon: '✉️', text: s('footer_email'), href: `mailto:${s('footer_email')}` },
                  { icon: '💬', text: 'Chat on WhatsApp', href: waUrl },
                  { icon: '🕐', text: s('footer_hours') },
                ].filter((item) => item.text).map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
                    >
                      {item.icon}
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm transition-colors duration-200"
                        style={{ color: 'var(--muted)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--white)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; }}
                      >
                        {item.text}
                      </a>
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--muted)' }}>{item.text}</span>
                    )}
                  </div>
                ))}
              </div>

              {show('footer_social_show') && socialLinks.length > 0 && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[2px] mb-3" style={{ color: 'var(--muted)' }}>
                    Follow Us
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {socialLinks.map((social) => (
                      <SocialIconBtn
                        key={social.label}
                        href={social.href}
                        label={social.label}
                        hoverColor={social.color}
                      >
                        <social.Icon size={16} />
                      </SocialIconBtn>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* SECTION D -BOTTOM BAR */}
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div className="px-6 md:px-20 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              © 2026 PRIM AI Institute. All Rights Reserved. Headquartered in Ahmedabad, Gujarat, India.
            </p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {legalLinks.map((item, i) => (
                <Fragment key={item.label}>
                  {i > 0 && (
                    <div className="w-1 h-1 rounded-full hidden md:block" style={{ background: 'var(--border)' }} />
                  )}
                  {item.href.startsWith('/') ? (
                    <Link
                      to={item.href}
                      className="text-xs transition-colors duration-200"
                      style={{ color: 'var(--muted)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--white)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className="text-xs transition-colors duration-200"
                      style={{ color: 'var(--muted)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--white)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; }}
                    >
                      {item.label}
                    </a>
                  )}
                </Fragment>
              ))}
              <div className="w-1 h-1 rounded-full hidden md:block" style={{ background: 'var(--border)' }} />
              {/* Plain <a> (not <Link>): /llms.txt is a static file, the SPA router must not intercept it */}
              <a
                href="/llms.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs transition-colors duration-200"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--white)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; }}
              >
                LLM Info
              </a>
            </div>
          </div>
        </div>
    </footer>
  );
}
