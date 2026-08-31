// One shared source for every WhatsApp link on the site.
//
// A course page (or the 10-Day AI program page) sets its own message via
// setPageMessage once its data loads; every other page leaves it null and
// inherits the site default (SiteSetting contact_whatsapp_message). Reset to
// null on every route change - without that, navigating from a course page
// to Home would leave the course's message showing in the footer/floating
// button, which is invisible in a quick manual check and obvious in
// production.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';

interface WhatsAppContextValue {
  /** Digits only, with country code - e.g. "917573055577". */
  number: string;
  /** The page-specific message if one is set, otherwise the site default. */
  message: string;
  setPageMessage: (msg: string | null) => void;
  /** Ready-to-use wa.me link - number + URL-encoded message. */
  url: string;
}

const WhatsAppContext = createContext<WhatsAppContextValue | undefined>(undefined);

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const number = useSettingsStore((state) => state.s.footerSettings['footer_wa_float_number'] ?? '');
  const defaultMessage = useSettingsStore((state) => state.s.contactWhatsappMessage);
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setPageMessage(null);
  }, [pathname]);

  const message = pageMessage ?? defaultMessage;
  // encodeURIComponent, not a raw string interpolation - an unencoded "&",
  // "?", "#", newline or emoji in the message would otherwise break the URL
  // (truncating it at the first special character, or building an invalid
  // query string wa.me silently drops).
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  const value = useMemo<WhatsAppContextValue>(
    () => ({ number, message, setPageMessage, url }),
    [number, message, url],
  );

  return <WhatsAppContext.Provider value={value}>{children}</WhatsAppContext.Provider>;
}

export function useWhatsApp(): WhatsAppContextValue {
  const ctx = useContext(WhatsAppContext);
  if (!ctx) throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  return ctx;
}
