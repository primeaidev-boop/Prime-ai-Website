// Inline line-icon set for the program page's "Live Training" benefit cards.
// Kept as inline SVG (not an icon font or external lib) so it is CSP-safe on
// the standalone program pages and matches the reference's thin-stroke look.
// Shared by the renderer (ProgramPage) and the admin icon picker.

import type { ReactElement } from 'react';

const svg = (children: ReactElement) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const BENEFIT_ICONS: Record<string, ReactElement> = {
  live: svg(
    <>
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <circle cx="12" cy="9" r="2" />
      <path d="M8.5 14c.7-1.6 6.3-1.6 7 0" />
      <path d="M9 20h6M12 17v3" />
    </>,
  ),
  chat: svg(
    <>
      <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
      <path d="M8 10h.01M12 10h.01M16 10h.01" />
    </>,
  ),
  code: svg(
    <>
      <path d="M9 8l-4 4 4 4" />
      <path d="M15 8l4 4-4 4" />
    </>,
  ),
  play: svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5l6 3.5-6 3.5z" />
    </>,
  ),
  people: svg(
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.5-3 4-4.5 5.5-4.5S14 16 14.5 19" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6" />
      <path d="M16.5 14.7c2 .5 3.7 1.9 4 4.3" />
    </>,
  ),
  target: svg(
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" />
    </>,
  ),
  certificate: svg(
    <>
      <rect x="4" y="4" width="16" height="12" rx="2" />
      <circle cx="12" cy="10" r="2.2" />
      <path d="M9.7 14l-1 5 3.3-2 3.3 2-1-5" />
    </>,
  ),
  clock: svg(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>,
  ),
  book: svg(
    <>
      <path d="M5 4h9a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H5z" />
      <path d="M16 6a2 2 0 0 1 2-2h1v14h-1a2 2 0 0 0-2 2" />
    </>,
  ),
  rocket: svg(
    <>
      <path d="M12 3c3 1 5 4 5 8l-2.5 2.5h-5L7 11c0-4 2-7 5-8z" />
      <circle cx="12" cy="9" r="1.5" />
      <path d="M9.5 16c-1.5 1-2 3-2 4 1 0 3-.5 4-2M14.5 16c1.5 1 2 3 2 4-1 0-3-.5-4-2" />
    </>,
  ),
  star: svg(
    <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.7l5.9-.9z" />,
  ),
  shield: svg(
    <>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>,
  ),
  phone: svg(
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </>,
  ),
  mail: svg(
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7.5l8 5.5 8-5.5" />
    </>,
  ),
  percent: svg(
    <>
      <path d="M19 5L5 19" />
      <circle cx="7.5" cy="7.5" r="2.4" />
      <circle cx="16.5" cy="16.5" r="2.4" />
    </>,
  ),
  gift: svg(
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" />
      <path d="M12 8v13" />
      <path d="M12 8C11 5 8 4 7 5.5S8 8 12 8zM12 8c1-3 4-4 5-2.5S16 8 12 8z" />
    </>,
  ),
};

export const BENEFIT_ICON_NAMES = Object.keys(BENEFIT_ICONS);

/** Renders a benefit icon by name; falls back to a neutral star if unknown. */
export function BenefitIcon({ name }: { name: string }) {
  return BENEFIT_ICONS[name] ?? BENEFIT_ICONS.star;
}

/** White check on the card's right edge (blue circle supplied by CSS). */
export function BenefitCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4 4 10-10" />
    </svg>
  );
}
