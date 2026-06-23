import { useEffect, useState, useCallback } from 'react';
import { getSettings, updateSetting } from '@/api/admin';
import { useSettingsStore } from '@/store/settingsStore';
import type { ContactFAQ } from '@/data/contactPageData';

// ─── Types ────────────────────────────────────────────────────────

interface FormValues {
  // Home hero
  hero_badge_text: string;
  hero_heading_line1: string;
  hero_heading_cyan: string;
  hero_heading_white: string;
  hero_heading_orange: string;
  hero_subtext: string;
  hero_cta1_text: string;
  hero_cta2_text: string;
  // Home stats
  hero_students_count: string;
  hero_students_label: string;
  hero_companies_count: string;
  hero_companies_label: string;
  hero_years_count: string;
  hero_years_label: string;
  hero_iso_show: string;
  // Navigation
  nav_logo_text: string;
  nav_cta_text: string;
  nav_link_home: string;
  nav_link_about: string;
  nav_link_courses: string;
  nav_link_contact: string;
  // Batch banner
  new_batch_banner: string;
  new_batch_text: string;
  // About hero
  about_badge_text: string;
  about_hero_h1: string;
  about_hero_h1_accent: string;
  about_hero_subtext: string;
  about_stat1_count: string;
  about_stat1_label: string;
  about_stat2_count: string;
  about_stat2_label: string;
  about_stat3_count: string;
  about_stat3_label: string;
  about_show_iso: string;
  // About quote
  about_show_quote: string;
  about_quote_main: string;
  about_quote_accent: string;
  // About differentiators
  about_show_diff: string;
  about_diff1_icon: string;
  about_diff1_title: string;
  about_diff1_body: string;
  about_diff2_icon: string;
  about_diff2_title: string;
  about_diff2_body: string;
  about_diff3_icon: string;
  about_diff3_title: string;
  about_diff3_body: string;
  about_diff4_icon: string;
  about_diff4_title: string;
  about_diff4_body: string;
  // About trainers
  about_show_trainers: string;
  about_trainer1_name: string;
  about_trainer1_role: string;
  about_trainer1_exp: string;
  about_trainer1_img: string;
  about_trainer2_name: string;
  about_trainer2_role: string;
  about_trainer2_exp: string;
  about_trainer2_img: string;
  about_trainer3_name: string;
  about_trainer3_role: string;
  about_trainer3_exp: string;
  about_trainer3_img: string;
  // About CTA
  about_show_cta: string;
  about_cta_heading: string;
  about_cta_subtext: string;
  about_cta_btn1_text: string;
  about_cta_btn2_text: string;
  // Contact hero & info
  contact_badge: string;
  contact_heading: string;
  contact_subtext: string;
  contact_address: string;
  contact_phone: string;
  contact_email: string;
  contact_hours: string;
  contact_form_title: string;
  // Contact WhatsApp & Map
  contact_show_whatsapp: string;
  contact_whatsapp_number: string;
  contact_whatsapp_message: string;
  contact_show_map: string;
  contact_map_embed_url: string;
  contact_map_link_url: string;
  // Contact FAQ
  contact_show_faq: string;
  contact_faq_title: string;
  // Footer social links (legacy)
  footer_social_facebook: string;
  footer_social_youtube: string;
  footer_social_instagram: string;
  footer_social_linkedin: string;
  // Footer -CTA strip
  footer_cta_show: string;
  footer_cta_heading: string;
  footer_cta_subtext: string;
  footer_cta_demo_btn_text: string;
  footer_cta_wa_btn_text: string;
  // Footer -stats bar
  footer_stats_show: string;
  footer_stat_1_num: string;
  footer_stat_1_label: string;
  footer_stat_2_num: string;
  footer_stat_2_label: string;
  footer_stat_3_num: string;
  footer_stat_3_label: string;
  footer_stat_4_num: string;
  footer_stat_4_label: string;
  footer_stat_5_num: string;
  footer_stat_5_label: string;
  // Footer -brand col
  footer_desc: string;
  footer_iso_show: string;
  // Footer -column visibility
  footer_quicklinks_show: string;
  footer_courses_show: string;
  footer_explore_more_show: string;
  // Footer -contact col
  footer_contact_show: string;
  footer_address: string;
  footer_phone: string;
  footer_email: string;
  footer_hours: string;
  // Footer -social icons
  footer_social_show: string;
  footer_social_whatsapp: string;
  // Footer -WhatsApp float
  footer_wa_float_show: string;
  footer_wa_float_number: string;
  // Footer -legal links
  footer_privacy_url: string;
  footer_terms_url: string;
  footer_refund_url: string;
}

type FormKey = keyof FormValues;

const DEFAULTS: FormValues = {
  hero_badge_text: "India's AI-First Training Institute",
  hero_heading_line1: 'The Future Runs on AI.',
  hero_heading_cyan: 'Are',
  hero_heading_white: 'You',
  hero_heading_orange: 'Ready?',
  hero_subtext: 'Join PRIM AI Institute - where school students, professionals & entrepreneurs learn to harness the power of Artificial Intelligence and lead the next decade.',
  hero_cta1_text: 'Book Your Free Demo Class',
  hero_cta2_text: 'Explore Courses',
  hero_students_count: '5000+',
  hero_students_label: 'Students',
  hero_companies_count: '350+',
  hero_companies_label: 'Companies',
  hero_years_count: '10+',
  hero_years_label: 'Years',
  hero_iso_show: 'true',
  nav_logo_text: 'PRIM AI',
  nav_cta_text: 'Book Free Demo',
  nav_link_home: 'Home',
  nav_link_about: 'About',
  nav_link_courses: 'Courses',
  nav_link_contact: 'Contact',
  new_batch_banner: 'true',
  new_batch_text: 'New Batch Starting Soon - Limited Seats!',
  // About
  about_badge_text: 'OUR STORY',
  about_hero_h1: 'Built by Industry Veterans.',
  about_hero_h1_accent: 'Designed for Your Future.',
  about_hero_subtext: 'PRIM AI Institute emerged from a simple realization: the gap between academic theory and industry reality in Artificial Intelligence was widening.',
  about_stat1_count: '10+',
  about_stat1_label: 'YEARS EXP',
  about_stat2_count: '5k+',
  about_stat2_label: 'STUDENTS',
  about_stat3_count: '350+',
  about_stat3_label: 'COMPANIES',
  about_show_iso: 'true',
  about_show_quote: 'true',
  about_quote_main: 'We believe AI education should be accessible to every Indian -',
  about_quote_accent: 'from Class 6 to CEO.',
  about_show_diff: 'true',
  about_diff1_icon: '🏅',
  about_diff1_title: 'ISO Certified',
  about_diff1_body: 'Internationally recognized quality management standards in technical education.',
  about_diff2_icon: '🧑‍💻',
  about_diff2_title: 'MNC Experts',
  about_diff2_body: 'Learn directly from senior engineers actively working in top tech companies.',
  about_diff3_icon: '🚀',
  about_diff3_title: '100% Placement',
  about_diff3_body: 'Dedicated career support and direct hiring partnerships with leading firms.',
  about_diff4_icon: '⚡',
  about_diff4_title: '100% Practical',
  about_diff4_body: 'Zero theoretical bloat. Build real-world projects from day one.',
  about_show_trainers: 'true',
  about_trainer1_name: 'Dr. Alok Sharma',
  about_trainer1_role: 'Lead AI Architect',
  about_trainer1_exp: '15+ YRS EXP',
  about_trainer1_img: '',
  about_trainer2_name: 'Priya Patel',
  about_trainer2_role: 'Senior ML Engineer',
  about_trainer2_exp: '8+ YRS EXP',
  about_trainer2_img: '',
  about_trainer3_name: 'Rahul Verma',
  about_trainer3_role: 'Director of Research',
  about_trainer3_exp: '12+ YRS EXP',
  about_trainer3_img: '',
  about_show_cta: 'true',
  about_cta_heading: 'Ready to Shape the Future?',
  about_cta_subtext: 'Join thousands of professionals who have accelerated their careers through our industry-aligned AI programs.',
  about_cta_btn1_text: 'Explore Courses',
  about_cta_btn2_text: 'Contact Admissions',
  // Contact
  contact_badge: 'GET IN TOUCH',
  contact_heading: 'Start Your AI Journey Today',
  contact_subtext: 'Connect with our admissions team to explore course details, campus visits, or bespoke AI training solutions for your team.',
  contact_address: '1016, 10th Floor, Ganesh Glory, Off S.G. Highway, Jagatpur Road, Gota, Ahmedabad – 382470',
  contact_phone: '+91 88490 31797',
  contact_email: 'primeai.dev@gmail.com',
  contact_hours: 'Mon – Sat: 9 AM – 6 PM IST',
  contact_form_title: 'Send an Enquiry',
  contact_show_whatsapp: 'true',
  contact_whatsapp_number: '917573055191',
  contact_whatsapp_message: "Hi! I'm interested in PRIM AI Institute courses. Please share more details.",
  contact_show_map: 'true',
  contact_map_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5482349281685!2d72.54098!3d23.08501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84c0b68a4e6f%3A0x4d1d5b2b36e2c92f!2sGanesh%20Glory%2C%20Gota%2C%20Ahmedabad%2C%20Gujarat%20382481!5e0!3m2!1sen!2sin!4v1720000000000!5m2!1sen!2sin',
  contact_map_link_url: 'https://maps.google.com/?q=Ganesh+Glory+Gota+Ahmedabad+Gujarat+382470',
  contact_show_faq: 'true',
  contact_faq_title: 'Frequently Asked Questions',
  footer_social_facebook: '',
  footer_social_youtube: '',
  footer_social_instagram: '',
  footer_social_linkedin: '',
  // Footer
  footer_cta_show: 'true',
  footer_cta_heading: 'Ready to Start Your AI Journey?',
  footer_cta_subtext: 'Book a free demo class -no fees, no obligation. Just come and experience it.',
  footer_cta_demo_btn_text: '🚀 Book Free Demo Class',
  footer_cta_wa_btn_text: '💬 WhatsApp Us',
  footer_stats_show: 'true',
  footer_stat_1_num: '5000+',
  footer_stat_1_label: 'Students Trained',
  footer_stat_2_num: '1500+',
  footer_stat_2_label: 'Hiring Partners',
  footer_stat_3_num: '20+',
  footer_stat_3_label: 'Years Expertise',
  footer_stat_4_num: '3',
  footer_stat_4_label: 'AI Programs',
  footer_stat_5_num: '50+',
  footer_stat_5_label: 'AI Tools Taught',
  footer_desc: "Gujarat's premier AI training institute -empowering students, professionals, and entrepreneurs with real-world AI skills that transform careers and businesses.",
  footer_iso_show: 'true',
  footer_quicklinks_show: 'true',
  footer_courses_show: 'true',
  footer_explore_more_show: 'true',
  footer_contact_show: 'true',
  footer_address: 'Ahmedabad, Gujarat, India',
  footer_phone: '+91 88490 31797',
  footer_email: 'primeai.dev@gmail.com',
  footer_hours: 'Mon – Fri, 9 AM – 7 PM',
  footer_social_show: 'true',
  footer_social_whatsapp: '',
  footer_wa_float_show: 'true',
  footer_wa_float_number: '917573055191',
  footer_privacy_url: '/privacy',
  footer_terms_url: '/terms',
  footer_refund_url: '/refund-policy',
};

// ─── Section definitions ──────────────────────────────────────────

interface FieldDef {
  key: FormKey;
  label: string;
  type?: 'text' | 'textarea' | 'toggle';
  hint?: string;
}

interface SectionDef {
  id: string;
  icon: string;
  title: string;
  accentColor: string;
  fields: FieldDef[];
}

const HOME_SECTIONS: SectionDef[] = [
  {
    id: 'hero',
    icon: '🎯',
    title: 'Hero Content',
    accentColor: 'var(--electric)',
    fields: [
      { key: 'hero_badge_text', label: 'Badge Text', hint: 'Pill above the heading' },
      { key: 'hero_heading_line1', label: 'Heading - Line 1' },
      { key: 'hero_heading_cyan', label: 'Heading - Cyan Word', hint: 'Displays in cyan (#00D4FF)' },
      { key: 'hero_heading_white', label: 'Heading - White Word' },
      { key: 'hero_heading_orange', label: 'Heading - Orange Word', hint: 'Displays in orange (#FF6B2B)' },
      { key: 'hero_subtext', label: 'Subtext Paragraph', type: 'textarea' },
      { key: 'hero_cta1_text', label: 'Primary CTA Button Text', hint: 'Orange button' },
      { key: 'hero_cta2_text', label: 'Secondary CTA Text', hint: 'Ghost link' },
    ],
  },
  {
    id: 'stats',
    icon: '📊',
    title: 'Hero Stats',
    accentColor: 'var(--orange)',
    fields: [
      { key: 'hero_students_count', label: 'Students - Number', hint: 'e.g. 5000+' },
      { key: 'hero_students_label', label: 'Students - Label' },
      { key: 'hero_companies_count', label: 'Companies - Number' },
      { key: 'hero_companies_label', label: 'Companies - Label' },
      { key: 'hero_years_count', label: 'Years - Number' },
      { key: 'hero_years_label', label: 'Years - Label' },
      { key: 'hero_iso_show', label: 'Show ISO Certified Pill', type: 'toggle' },
    ],
  },
  {
    id: 'nav',
    icon: '🧭',
    title: 'Navigation',
    accentColor: '#a78bfa',
    fields: [
      { key: 'nav_logo_text', label: 'Logo Text', hint: 'Top-left in navbar' },
      { key: 'nav_cta_text', label: 'Navbar CTA Button Text' },
      { key: 'nav_link_home', label: 'Nav Link - Home' },
      { key: 'nav_link_about', label: 'Nav Link - About' },
      { key: 'nav_link_courses', label: 'Nav Link - Courses' },
      { key: 'nav_link_contact', label: 'Nav Link - Contact' },
    ],
  },
  {
    id: 'banner',
    icon: '📢',
    title: 'Batch Banner',
    accentColor: '#f43f5e',
    fields: [
      { key: 'new_batch_banner', label: 'Show Batch Banner', type: 'toggle' },
      { key: 'new_batch_text', label: 'Banner Message Text', hint: 'Orange bar above hero' },
    ],
  },
];

const ABOUT_SECTIONS: SectionDef[] = [
  {
    id: 'about_hero',
    icon: '🏛️',
    title: 'About - Hero',
    accentColor: 'var(--electric)',
    fields: [
      { key: 'about_badge_text', label: 'Badge Text', hint: 'Small pill above heading (e.g. OUR STORY)' },
      { key: 'about_hero_h1', label: 'Heading - Line 1', hint: 'White text line' },
      { key: 'about_hero_h1_accent', label: 'Heading - Gradient Line', hint: 'Cyan ➞ orange gradient line' },
      { key: 'about_hero_subtext', label: 'Subtext Paragraph', type: 'textarea' },
      { key: 'about_stat1_count', label: 'Stat 1 - Number', hint: 'e.g. 10+' },
      { key: 'about_stat1_label', label: 'Stat 1 - Label', hint: 'e.g. YEARS EXP' },
      { key: 'about_stat2_count', label: 'Stat 2 - Number' },
      { key: 'about_stat2_label', label: 'Stat 2 - Label' },
      { key: 'about_stat3_count', label: 'Stat 3 - Number' },
      { key: 'about_stat3_label', label: 'Stat 3 - Label' },
      { key: 'about_show_iso', label: 'Show ISO Certified Card', type: 'toggle' },
    ],
  },
  {
    id: 'about_quote',
    icon: '💬',
    title: 'About - Mission Quote',
    accentColor: '#a78bfa',
    fields: [
      { key: 'about_show_quote', label: 'Show Quote Section', type: 'toggle' },
      { key: 'about_quote_main', label: 'Quote - Main Text', hint: 'White portion of the quote' },
      { key: 'about_quote_accent', label: 'Quote - Accent Text', hint: 'Cyan highlighted portion' },
    ],
  },
  {
    id: 'about_diff',
    icon: '⭐',
    title: 'About - Why Different',
    accentColor: 'var(--orange)',
    fields: [
      { key: 'about_show_diff', label: 'Show This Section', type: 'toggle' },
      { key: 'about_diff1_icon', label: 'Card 1 - Icon', hint: 'Paste an emoji (e.g. 🏅)' },
      { key: 'about_diff1_title', label: 'Card 1 - Title' },
      { key: 'about_diff1_body', label: 'Card 1 - Body', type: 'textarea' },
      { key: 'about_diff2_icon', label: 'Card 2 - Icon' },
      { key: 'about_diff2_title', label: 'Card 2 - Title' },
      { key: 'about_diff2_body', label: 'Card 2 - Body', type: 'textarea' },
      { key: 'about_diff3_icon', label: 'Card 3 - Icon' },
      { key: 'about_diff3_title', label: 'Card 3 - Title' },
      { key: 'about_diff3_body', label: 'Card 3 - Body', type: 'textarea' },
      { key: 'about_diff4_icon', label: 'Card 4 - Icon' },
      { key: 'about_diff4_title', label: 'Card 4 - Title' },
      { key: 'about_diff4_body', label: 'Card 4 - Body', type: 'textarea' },
    ],
  },
  {
    id: 'about_trainers',
    icon: '👩‍🏫',
    title: 'About - Trainers',
    accentColor: '#34d399',
    fields: [
      { key: 'about_show_trainers', label: 'Show Trainers Section', type: 'toggle' },
      { key: 'about_trainer1_name', label: 'Trainer 1 - Name' },
      { key: 'about_trainer1_role', label: 'Trainer 1 - Role / Title' },
      { key: 'about_trainer1_exp', label: 'Trainer 1 - Experience Badge', hint: 'e.g. 15+ YRS EXP' },
      { key: 'about_trainer1_img', label: 'Trainer 1 - Photo URL', hint: 'Leave blank to show initials avatar' },
      { key: 'about_trainer2_name', label: 'Trainer 2 - Name' },
      { key: 'about_trainer2_role', label: 'Trainer 2 - Role / Title' },
      { key: 'about_trainer2_exp', label: 'Trainer 2 - Experience Badge' },
      { key: 'about_trainer2_img', label: 'Trainer 2 - Photo URL' },
      { key: 'about_trainer3_name', label: 'Trainer 3 - Name' },
      { key: 'about_trainer3_role', label: 'Trainer 3 - Role / Title' },
      { key: 'about_trainer3_exp', label: 'Trainer 3 - Experience Badge' },
      { key: 'about_trainer3_img', label: 'Trainer 3 - Photo URL' },
    ],
  },
  {
    id: 'about_cta',
    icon: '🚀',
    title: 'About - CTA Section',
    accentColor: '#f43f5e',
    fields: [
      { key: 'about_show_cta', label: 'Show CTA Section', type: 'toggle' },
      { key: 'about_cta_heading', label: 'CTA Heading' },
      { key: 'about_cta_subtext', label: 'CTA Subtext', type: 'textarea' },
      { key: 'about_cta_btn1_text', label: 'Button 1 Text', hint: 'Links to /courses' },
      { key: 'about_cta_btn2_text', label: 'Button 2 Text', hint: 'Links to /contact' },
    ],
  },
];

const CONTACT_SECTIONS: SectionDef[] = [
  {
    id: 'contact_info',
    icon: '📍',
    title: 'Contact - Hero & Info',
    accentColor: '#34d399',
    fields: [
      { key: 'contact_badge', label: 'Badge Text', hint: 'Small pill above heading (e.g. GET IN TOUCH)' },
      { key: 'contact_heading', label: 'Page Heading' },
      { key: 'contact_subtext', label: 'Subtext Paragraph', type: 'textarea' },
      { key: 'contact_address', label: 'Office Address', type: 'textarea' },
      { key: 'contact_phone', label: 'Phone Number' },
      { key: 'contact_email', label: 'Email Address' },
      { key: 'contact_hours', label: 'Office Hours', hint: 'e.g. Mon – Sat: 9 AM – 6 PM IST' },
      { key: 'contact_form_title', label: 'Enquiry Form Title' },
    ],
  },
  {
    id: 'contact_whatsapp_map',
    icon: '💬',
    title: 'Contact - WhatsApp & Map',
    accentColor: '#25d366',
    fields: [
      { key: 'contact_show_whatsapp', label: 'Show WhatsApp Button', type: 'toggle' },
      { key: 'contact_whatsapp_number', label: 'WhatsApp Number', hint: 'Digits only with country code. e.g. 917573055191' },
      { key: 'contact_whatsapp_message', label: 'Pre-filled WhatsApp Message', type: 'textarea' },
      { key: 'contact_show_map', label: 'Show Map Section', type: 'toggle' },
      { key: 'contact_map_embed_url', label: 'Google Maps Embed URL', hint: 'Google Maps ➞ Share ➞ Embed a map ➞ copy the src="" value from the iframe code', type: 'textarea' },
      { key: 'contact_map_link_url', label: 'Map Direct Link', hint: 'Opens in Google Maps when user clicks the map' },
    ],
  },
  {
    id: 'contact_faq_settings',
    icon: '❓',
    title: 'Contact - FAQ Settings',
    accentColor: '#a78bfa',
    fields: [
      { key: 'contact_show_faq', label: 'Show FAQ Section', type: 'toggle' },
      { key: 'contact_faq_title', label: 'FAQ Section Title' },
    ],
  },
];

const FOOTER_SECTIONS: SectionDef[] = [
  {
    id: 'footer_brand',
    icon: '🏷️',
    title: 'Footer - Brand Column',
    accentColor: 'var(--electric)',
    fields: [
      { key: 'footer_desc', label: 'Brand Description', type: 'textarea', hint: 'Appears below the PRIM AI Institute logo' },
      { key: 'footer_iso_show', label: 'Show ISO Certified Badge', type: 'toggle' },
      { key: 'footer_quicklinks_show', label: 'Show Quick Links Column', type: 'toggle' },
      { key: 'footer_courses_show', label: 'Show Courses Column', type: 'toggle' },
      { key: 'footer_explore_more_show', label: 'Show "Explore More" Sub-Section', type: 'toggle', hint: 'The Corporate Training + Success Stories links inside the Courses column' },
    ],
  },
  {
    id: 'footer_contact',
    icon: '📍',
    title: 'Footer - Contact Column',
    accentColor: '#34d399',
    fields: [
      { key: 'footer_contact_show', label: 'Show Contact Column', type: 'toggle' },
      { key: 'footer_address', label: 'Address', hint: 'Shown as plain text' },
      { key: 'footer_phone', label: 'Phone Number', hint: 'Shown as a clickable tel: link' },
      { key: 'footer_email', label: 'Email Address', hint: 'Shown as a clickable mailto: link' },
      { key: 'footer_hours', label: 'Office Hours', hint: 'e.g. Mon – Fri, 9 AM – 7 PM' },
    ],
  },
  {
    id: 'footer_social',
    icon: '🔗',
    title: 'Footer - Social Media Icons',
    accentColor: 'var(--electric)',
    fields: [
      { key: 'footer_social_show', label: 'Show Social Icons', type: 'toggle' },
      { key: 'footer_social_whatsapp', label: 'WhatsApp URL', hint: 'Full URL e.g. https://wa.me/917573055191 -leave blank to hide' },
      { key: 'footer_social_linkedin', label: 'LinkedIn URL', hint: 'Full URL e.g. https://linkedin.com/company/yourcompany' },
      { key: 'footer_social_instagram', label: 'Instagram URL', hint: 'Full URL e.g. https://instagram.com/yourhandle' },
      { key: 'footer_social_youtube', label: 'YouTube URL', hint: 'Full URL e.g. https://youtube.com/@yourchannel' },
    ],
  },
  {
    id: 'footer_wa_float',
    icon: '💬',
    title: 'Footer - WhatsApp Floating Button',
    accentColor: '#25d366',
    fields: [
      { key: 'footer_wa_float_show', label: 'Show WhatsApp Float Button', type: 'toggle' },
      { key: 'footer_wa_float_number', label: 'WhatsApp Number', hint: 'Digits only with country code -no +, no spaces. e.g. 917573055191. Used by both this button and the Footer CTA WhatsApp button.' },
    ],
  },
  {
    id: 'footer_legal',
    icon: '⚖️',
    title: 'Footer - Legal Links',
    accentColor: 'var(--muted)',
    fields: [
      { key: 'footer_privacy_url', label: 'Privacy Policy URL' },
      { key: 'footer_terms_url', label: 'Terms & Conditions URL' },
      { key: 'footer_refund_url', label: 'Refund Policy URL' },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────

export default function Settings() {
  const [form, setForm] = useState<FormValues>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [sectionSaving, setSectionSaving] = useState<string | null>(null);
  const [sectionSaved, setSectionSaved] = useState<string | null>(null);
  const refreshPublic = useSettingsStore((state) => state.fetch);

  // ── FAQ state (contact_faqs stored as JSON in DB) ─────────────
  const [faqs, setFaqs] = useState<ContactFAQ[]>([]);
  const [faqSaving, setFaqSaving] = useState(false);
  const [faqSaved, setFaqSaved] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  const addFaq = () => {
    const newFaq: ContactFAQ = { id: Date.now().toString(), question: '', answer: '' };
    setFaqs((prev) => [...prev, newFaq]);
    setEditingFaqId(newFaq.id);
  };

  const updateFaq = (id: string, field: 'question' | 'answer', value: string) =>
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)));

  const deleteFaq = (id: string) =>
    setFaqs((prev) => prev.filter((f) => f.id !== id));

  const moveFaq = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= faqs.length) return;
    const next = [...faqs];
    [next[index], next[target]] = [next[target], next[index]];
    setFaqs(next);
  };

  const saveFaqs = async () => {
    setFaqSaving(true);
    try {
      await updateSetting('contact_faqs', JSON.stringify(faqs));
      await refreshPublic();
      setFaqSaved(true);
      setTimeout(() => setFaqSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setFaqSaving(false);
    }
  };

  useEffect(() => {
    getSettings()
      .then((res) => {
        const raw = res.data as Record<string, string>;
        setForm((prev) => {
          const next = { ...prev };
          (Object.keys(DEFAULTS) as FormKey[]).forEach((k) => {
            if (raw[k] !== undefined) next[k] = raw[k];
          });
          return next;
        });
        if (raw.contact_faqs) {
          try { setFaqs(JSON.parse(raw.contact_faqs) as ContactFAQ[]); } catch {}
        }
      })
      .catch(() => { /* backend offline */ })
      .finally(() => setLoading(false));
  }, []);

  const set = useCallback((key: FormKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveSection = async (section: SectionDef) => {
    setSectionSaving(section.id);
    try {
      await Promise.all(section.fields.map((f) => updateSetting(f.key, form[f.key])));
      await refreshPublic();
      setSectionSaved(section.id);
      setTimeout(() => setSectionSaved(null), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSectionSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted)' }}>
        Loading settings…
      </div>
    );
  }

  const renderSection = (section: SectionDef) => (
    <div key={section.id} className="glass-card rounded-2xl overflow-hidden">
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,.02)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{section.icon}</span>
          <h2 className="font-bold text-sm" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
            {section.title}
          </h2>
        </div>
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: section.accentColor, boxShadow: `0 0 6px ${section.accentColor}` }}
        />
      </div>

      <div className="px-6 py-5 flex flex-col gap-5">
        {section.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: section.accentColor }}>
              {field.label}
            </label>
            {field.hint && (
              <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>{field.hint}</p>
            )}
            {field.type === 'toggle' ? (
              <button
                type="button"
                onClick={() => set(field.key, form[field.key] === 'true' ? 'false' : 'true')}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: form[field.key] === 'true' ? 'rgba(0,212,255,.12)' : 'rgba(255,255,255,.04)',
                  border: `1px solid ${form[field.key] === 'true' ? 'rgba(0,212,255,.3)' : 'var(--border)'}`,
                  color: form[field.key] === 'true' ? 'var(--electric)' : 'var(--muted)',
                }}
              >
                <span
                  className="w-8 h-4 rounded-full relative transition-all duration-200 flex-shrink-0"
                  style={{ background: form[field.key] === 'true' ? 'var(--electric)' : 'rgba(255,255,255,.15)' }}
                >
                  <span
                    className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200"
                    style={{ left: form[field.key] === 'true' ? '18px' : '2px' }}
                  />
                </span>
                {form[field.key] === 'true' ? 'Enabled' : 'Disabled'}
              </button>
            ) : field.type === 'textarea' ? (
              <textarea
                rows={3}
                value={form[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
                style={{ resize: 'vertical' }}
              />
            ) : (
              <input
                type="text"
                value={form[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
              />
            )}
          </div>
        ))}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => saveSection(section)}
            disabled={sectionSaving === section.id}
            className="btn-primary text-sm px-6 py-2"
            style={{ minWidth: '130px' }}
          >
            {sectionSaving === section.id
              ? 'Saving…'
              : sectionSaved === section.id
              ? '✓ Saved!'
              : `Save ${section.title.replace(/^About - /, '')}`}
          </button>
          {sectionSaved === section.id && (
            <span className="text-xs" style={{ color: 'var(--electric)' }}>
              Live site updated
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
            Site Content
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            All changes update the live website immediately after saving.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn-outline text-sm px-4 py-2">
            Home ↗
          </a>
          <a href="/about" target="_blank" rel="noopener noreferrer" className="btn-electric text-sm px-4 py-2">
            About ↗
          </a>
          <a href="/contact" target="_blank" rel="noopener noreferrer" className="btn-primary text-sm px-4 py-2">
            Contact ↗
          </a>
        </div>
      </div>

      {/* Live heading preview */}
      <div
        className="glass-card p-5 mb-8 rounded-2xl"
        style={{ background: 'rgba(0,0,0,.25)', border: '1px solid rgba(0,212,255,.15)' }}
      >
        <p className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: 'var(--electric)' }}>
          Home Heading Preview
        </p>
        <div
          className="font-bold leading-tight"
          style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', color: 'var(--white)' }}
        >
          {form.hero_heading_line1}
          <span className="block">
            <span style={{ color: 'var(--electric)' }}>{form.hero_heading_cyan || 'Are'}</span>{' '}
            <span style={{ color: 'var(--white)' }}>{form.hero_heading_white || 'You'}</span>{' '}
            <span style={{ color: 'var(--orange)' }}>{form.hero_heading_orange || 'Ready?'}</span>
          </span>
        </div>
      </div>

      {/* ── Homepage sections ──────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs font-bold tracking-widest uppercase px-3" style={{ color: 'var(--orange)' }}>
          Home Page
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>
      <div className="flex flex-col gap-8">
        {HOME_SECTIONS.map(renderSection)}
      </div>

      {/* ── About Page sections ────────────────────────────────── */}
      <div className="flex items-center gap-4 mt-12 mb-6">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs font-bold tracking-widest uppercase px-3" style={{ color: 'var(--electric)' }}>
          About Page
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>
      <div className="flex flex-col gap-8">
        {ABOUT_SECTIONS.map(renderSection)}
      </div>

      {/* ── Footer sections ────────────────────────────────── */}
      <div className="flex items-center gap-4 mt-12 mb-6">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs font-bold tracking-widest uppercase px-3" style={{ color: 'var(--electric)' }}>
          Footer
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>
      <div className="flex flex-col gap-8 mb-0">
        {FOOTER_SECTIONS.map(renderSection)}
      </div>

      {/* ── Contact Page sections ──────────────────────────── */}
      <div className="flex items-center gap-4 mt-12 mb-6">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs font-bold tracking-widest uppercase px-3" style={{ color: '#34d399' }}>
          Contact Page
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>
      <div className="flex flex-col gap-8">
        {CONTACT_SECTIONS.map(renderSection)}

        {/* ── FAQ Items Manager ─────────────────────────────── */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,.02)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <h2 className="font-bold text-sm" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
                Contact - FAQ Items
              </h2>
            </div>
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: '#a78bfa', boxShadow: '0 0 6px #a78bfa' }}
            />
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="rounded-xl p-4 flex flex-col gap-3"
                  style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--muted)' }}>FAQ #{index + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveFaq(index, -1)}
                        disabled={index === 0}
                        className="w-7 h-7 rounded-lg text-xs font-bold transition-all disabled:opacity-30"
                        style={{ background: 'rgba(255,255,255,.06)', color: 'var(--muted)' }}
                      >↑</button>
                      <button
                        type="button"
                        onClick={() => moveFaq(index, 1)}
                        disabled={index === faqs.length - 1}
                        className="w-7 h-7 rounded-lg text-xs font-bold transition-all disabled:opacity-30"
                        style={{ background: 'rgba(255,255,255,.06)', color: 'var(--muted)' }}
                      >↓</button>
                      <button
                        type="button"
                        onClick={() => setEditingFaqId(editingFaqId === faq.id ? null : faq.id)}
                        className="w-7 h-7 rounded-lg text-xs transition-all"
                        style={{ background: 'rgba(0,212,255,.1)', color: 'var(--electric)' }}
                      >✏️</button>
                      <button
                        type="button"
                        onClick={() => deleteFaq(faq.id)}
                        className="w-7 h-7 rounded-lg text-xs transition-all"
                        style={{ background: 'rgba(244,63,94,.1)', color: '#f43f5e' }}
                      >✕</button>
                    </div>
                  </div>

                  {editingFaqId === faq.id ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#a78bfa' }}>Question</label>
                        <input type="text" value={faq.question} onChange={(e) => updateFaq(faq.id, 'question', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#a78bfa' }}>Answer</label>
                        <textarea rows={3} value={faq.answer} onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)} style={{ resize: 'vertical' }} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingFaqId(null)}
                        className="btn-electric text-xs px-4 py-1.5 self-start"
                      >
                        Done ✓
                      </button>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--white)' }}>
                      {faq.question || <em style={{ color: 'var(--muted)' }}>No question set</em>}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addFaq}
              className="btn-outline text-sm px-4 py-2 self-start mt-1"
            >
              + Add FAQ
            </button>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={saveFaqs}
                disabled={faqSaving}
                className="btn-primary text-sm px-6 py-2"
                style={{ minWidth: '130px' }}
              >
                {faqSaving ? 'Saving…' : faqSaved ? '✓ Saved!' : 'Save FAQ Items'}
              </button>
              {faqSaved && (
                <span className="text-xs" style={{ color: 'var(--electric)' }}>
                  Live site updated
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
