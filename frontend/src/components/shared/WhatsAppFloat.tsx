// WhatsApp floating button -appears after 300px scroll, reads number from settings

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export function WhatsAppFloat() {
  const footerSettings = useSettingsStore((state) => state.s.footerSettings);
  const [visible, setVisible] = useState(false);

  const show = footerSettings['footer_wa_float_show'] !== 'false';
  const number = footerSettings['footer_wa_float_number'] ?? '';

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show || !number) return null;

  return (
    <div
      className="fixed bottom-8 right-8 z-[500] flex flex-col items-end gap-2.5 transition-all duration-400"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        pointerEvents: visible ? 'all' : 'none',
      }}
    >
      {/* Tooltip */}
      <div
        className="text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 opacity-0 translate-x-2.5 pointer-events-none"
        style={{
          background: 'rgba(8,18,38,0.95)',
          border: '1px solid rgba(37,211,102,0.3)',
          color: 'var(--white)',
          fontFamily: 'var(--font-body)',
        }}
        id="wa-tooltip"
      >
        Chat with us on WhatsApp
      </div>

      {/* Button + pulse ring */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'rgba(37,211,102,0.3)',
            animation: 'wa-pulse 2.5s ease-out infinite',
          }}
        />
        <a
          href={`https://wa.me/${number}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="relative w-[58px] h-[58px] rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: '#25d366',
            boxShadow: '0 8px 28px rgba(37,211,102,0.4)',
            animation: 'wa-bounce 3s ease-in-out infinite',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.animation = 'none';
            el.style.transform = 'scale(1.12)';
            el.style.boxShadow = '0 12px 36px rgba(37,211,102,0.55)';
            const tip = document.getElementById('wa-tooltip');
            if (tip) { tip.style.opacity = '1'; tip.style.transform = 'translateX(0)'; }
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.animation = 'wa-bounce 3s ease-in-out infinite';
            el.style.transform = '';
            el.style.boxShadow = '0 8px 28px rgba(37,211,102,0.4)';
            const tip = document.getElementById('wa-tooltip');
            if (tip) { tip.style.opacity = '0'; tip.style.transform = 'translateX(10px)'; }
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
