import { create } from 'zustand';
import { getPublicSettings } from '@/api/settings';

export interface SiteSettings {
  navLogoText: string;
  navCtaText: string;
  navLinkHome: string;
  navLinkAbout: string;
  navLinkCourses: string;
  navLinkContact: string;
  heroBadgeText: string;
  heroHeadingLine1: string;
  heroHeadingCyan: string;
  heroHeadingWhite: string;
  heroHeadingOrange: string;
  heroSubtext: string;
  heroCta1Text: string;
  heroCta2Text: string;
  heroStudentsCount: string;
  heroStudentsLabel: string;
  heroCompaniesCount: string;
  heroCompaniesLabel: string;
  heroYearsCount: string;
  heroYearsLabel: string;
  heroIsoShow: boolean;
  newBatchBanner: boolean;
  newBatchText: string;
}

const DEFAULTS: SiteSettings = {
  navLogoText: 'PRIM AI',
  navCtaText: 'Book Free Demo',
  navLinkHome: 'Home',
  navLinkAbout: 'About',
  navLinkCourses: 'Courses',
  navLinkContact: 'Contact',
  heroBadgeText: "India's AI-First Training Institute",
  heroHeadingLine1: 'The Future Runs on AI.',
  heroHeadingCyan: 'Are',
  heroHeadingWhite: 'You',
  heroHeadingOrange: 'Ready?',
  heroSubtext:
    'Join PRIM AI Institute — where school students, professionals & entrepreneurs learn to harness the power of Artificial Intelligence and lead the next decade.',
  heroCta1Text: 'Book Your Free Demo Class',
  heroCta2Text: 'Explore Courses',
  heroStudentsCount: '5000+',
  heroStudentsLabel: 'Students',
  heroCompaniesCount: '350+',
  heroCompaniesLabel: 'Companies',
  heroYearsCount: '10+',
  heroYearsLabel: 'Years',
  heroIsoShow: true,
  newBatchBanner: true,
  newBatchText: 'New Batch Starting Soon — Limited Seats!',
};

interface SettingsState {
  s: SiteSettings;
  loaded: boolean;
  fetch: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  s: DEFAULTS,
  loaded: false,
  fetch: async () => {
    try {
      const res = await getPublicSettings();
      const r = res.data;
      set({
        loaded: true,
        s: {
          navLogoText: r.nav_logo_text ?? DEFAULTS.navLogoText,
          navCtaText: r.nav_cta_text ?? DEFAULTS.navCtaText,
          navLinkHome: r.nav_link_home ?? DEFAULTS.navLinkHome,
          navLinkAbout: r.nav_link_about ?? DEFAULTS.navLinkAbout,
          navLinkCourses: r.nav_link_courses ?? DEFAULTS.navLinkCourses,
          navLinkContact: r.nav_link_contact ?? DEFAULTS.navLinkContact,
          heroBadgeText: r.hero_badge_text ?? DEFAULTS.heroBadgeText,
          heroHeadingLine1: r.hero_heading_line1 ?? DEFAULTS.heroHeadingLine1,
          heroHeadingCyan: r.hero_heading_cyan ?? DEFAULTS.heroHeadingCyan,
          heroHeadingWhite: r.hero_heading_white ?? DEFAULTS.heroHeadingWhite,
          heroHeadingOrange: r.hero_heading_orange ?? DEFAULTS.heroHeadingOrange,
          heroSubtext: r.hero_subtext ?? DEFAULTS.heroSubtext,
          heroCta1Text: r.hero_cta1_text ?? DEFAULTS.heroCta1Text,
          heroCta2Text: r.hero_cta2_text ?? DEFAULTS.heroCta2Text,
          heroStudentsCount: r.hero_students_count ?? DEFAULTS.heroStudentsCount,
          heroStudentsLabel: r.hero_students_label ?? DEFAULTS.heroStudentsLabel,
          heroCompaniesCount: r.hero_companies_count ?? DEFAULTS.heroCompaniesCount,
          heroCompaniesLabel: r.hero_companies_label ?? DEFAULTS.heroCompaniesLabel,
          heroYearsCount: r.hero_years_count ?? DEFAULTS.heroYearsCount,
          heroYearsLabel: r.hero_years_label ?? DEFAULTS.heroYearsLabel,
          heroIsoShow: r.hero_iso_show !== 'false',
          newBatchBanner: r.new_batch_banner === 'true',
          newBatchText: r.new_batch_text ?? DEFAULTS.newBatchText,
        },
      });
    } catch {
      set({ loaded: true });
    }
  },
}));
