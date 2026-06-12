// Default content and localStorage helpers for the Contact page

export interface ContactFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ContactPageData {
  // Hero
  badge: string;
  heading: string;
  subtext: string;
  // Contact info
  address: string;
  phone: string;
  email: string;
  hours: string;
  // WhatsApp
  whatsappNumber: string; // digits only e.g. "917573055191"
  whatsappMessage: string;
  showWhatsapp: boolean;
  // Map
  mapEmbedUrl: string;
  mapLinkUrl: string;
  showMap: boolean;
  // Form
  formTitle: string;
  // FAQ
  showFaq: boolean;
  faqSectionTitle: string;
  faqs: ContactFAQ[];
}

const STORAGE_KEY = 'primAI_contactPage';

export const DEFAULT_CONTACT_DATA: ContactPageData = {
  badge: 'GET IN TOUCH',
  heading: 'Start Your AI Journey Today',
  subtext:
    'Connect with our admissions team to explore course details, campus visits, or bespoke AI training solutions for your team.',
  address:
    '1016, 10th Floor, Ganesh Glory, Off S.G. Highway, Jagatpur Road, Gota, Ahmedabad – 382470',
  phone: '+91 88490 31797',
  email: 'primeai.dev@gmail.com',
  hours: 'Mon – Sat: 9 AM – 6 PM IST',
  whatsappNumber: '917573055191',
  whatsappMessage:
    "Hi! I'm interested in PRIM AI Institute courses. Please share more details.",
  showWhatsapp: true,
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5482349281685!2d72.54098!3d23.08501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84c0b68a4e6f%3A0x4d1d5b2b36e2c92f!2sGanesh%20Glory%2C%20Gota%2C%20Ahmedabad%2C%20Gujarat%20382481!5e0!3m2!1sen!2sin!4v1720000000000!5m2!1sen!2sin',
  mapLinkUrl:
    'https://maps.google.com/?q=Ganesh+Glory+Gota+Ahmedabad+Gujarat+382470',
  showMap: true,
  formTitle: 'Send an Enquiry',
  showFaq: true,
  faqSectionTitle: 'Frequently Asked Questions',
  faqs: [
    {
      id: '1',
      question: 'What is the primary focus of PRIM AI Institute?',
      answer:
        'PRIM AI Institute specializes in practical AI education for school students, college students, working professionals, and business owners. Our programs focus on real-world applications of Artificial Intelligence with zero theoretical bloat and 100% hands-on learning.',
    },
    {
      id: '2',
      question: 'Do I need prior coding or AI knowledge to join?',
      answer:
        'Not at all! Our Level 1 Introduction course is designed for absolute beginners. We start from the very basics and build your skills step by step. All you need is curiosity and a smartphone or laptop.',
    },
    {
      id: '3',
      question: 'What payment options are available?',
      answer:
        'We offer flexible payment options including full payment, easy EMI plans, and scholarship opportunities for deserving students. Contact our admissions team to discuss the option that works best for you.',
    },
    {
      id: '4',
      question: 'What kind of career support do you provide?',
      answer:
        'We provide 100% placement assistance including resume building workshops, mock interview sessions, LinkedIn optimization, and direct referrals to our 350+ hiring partner companies across India.',
    },
  ],
};

export function getContactData(): ContactPageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<ContactPageData>;
      return { ...DEFAULT_CONTACT_DATA, ...parsed };
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_CONTACT_DATA };
}

export function saveContactData(data: ContactPageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
