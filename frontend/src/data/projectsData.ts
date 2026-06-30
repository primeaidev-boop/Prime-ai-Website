// Default projects data - admin edits stored in localStorage under 'primAI_projects'
// Pages read localStorage first, fall back to this file if empty.

import type { ProjectPageData } from '@/types';
import { generateId, slugify } from '@/data/tutorialData';

export { generateId, slugify };

export const DEFAULT_PROJECTS_DATA: ProjectPageData = {
  // ── Hero section (admin-editable via Page Content tab) ──────────────────
  hero: {
    eyebrow: 'STUDENT INNOVATION HUB',
    heading1: 'Building the Future',
    heading2Gradient: 'with AI',
    description:
      'Every project tells a story of learning, creativity, and innovation. Explore the AI applications, websites, mobile apps, automations, and business solutions created by our talented students.',
    ctaPrimary: 'Submit Your Project',
    ctaSecondary: 'Explore Projects',
  },

  // ── Stats row (admin can add/remove/edit each stat) ──────────────────────
  stats: [
    { id: 'stat-1', value: '500+', label: 'Student Projects' },
    { id: 'stat-2', value: '200+', label: 'AI Applications' },
    { id: 'stat-3', value: '100+', label: 'Websites' },
    { id: 'stat-4', value: '80+',  label: 'Automations' },
    { id: 'stat-5', value: '50+',  label: 'Mobile Apps' },
    { id: 'stat-6', value: '95%',  label: 'Completion Rate' },
  ],

  // ── Filter categories (admin-defined, shown as pills on listing page) ────
  categories: [
    { id: 'cat-all', name: 'All', slug: 'all', order: 0, isVisible: true },
    { id: 'cat-webapps', name: 'Web Apps', slug: 'web-apps', order: 1, isVisible: true },
    { id: 'cat-llms', name: 'LLMs', slug: 'llms', order: 2, isVisible: true },
    { id: 'cat-cv', name: 'Computer Vision', slug: 'computer-vision', order: 3, isVisible: true },
    { id: 'cat-ml', name: 'Machine Learning', slug: 'machine-learning', order: 4, isVisible: true },
    { id: 'cat-robotics', name: 'Robotics', slug: 'robotics', order: 5, isVisible: true },
  ],

  // ── Projects (full admin-editable project entries) ───────────────────────
  projects: [
    {
      id: 'proj-neuroscan',
      title: 'NeuroScan AI Diagnostics',
      slug: 'neuroscan-ai-diagnostics',
      shortDescription: "An early-stage Alzheimer's detection tool using deep learning to analyze MRI scans with 98% accuracy.",
      problemStatement:
        "Early Alzheimer's diagnosis relies on costly neurologist assessments that are often available too late. MRI scans contain patterns trained deep learning models can detect years before clinical symptoms appear.",
      solution:
        "NeuroScan AI uses a custom CNN trained on 12,000+ MRI images to classify early-stage Alzheimer's with 98% accuracy, providing radiologists with a second-opinion tool that speeds up diagnosis and expands access.",
      keyFeatures: [
        'Real-time MRI scan analysis via web upload',
        '98% detection accuracy on held-out test set',
        'Confidence scores and explainability heatmaps',
        'HIPAA-compliant data handling pipeline',
      ],
      category: 'computer-vision',
      techStack: ['Python', 'PyTorch', 'FastAPI', 'React'],
      coverImageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDTYf2VbRio4r6DxbyNMpB0QlBp0LO-oOCijMiAbLely0LG7btTACAnRazQ-BEt9FDbYBtjH03T4vDsh3LrbDtP00uRv4YDhRhKCWuiNqds5ZIk2n8YnTSEm-KvIGSWOLu2f2t_jWahjCkgNr0O6Kv24Icb_EAmIq_L4wwWEoKS5m5wmIiFRLcI0vHr4aK0pKCA6MCVaSjMW4PTk0aNb8Wz7mTVbsaRZlxYBz3X0V-53jI3dswFgUGRNAH1nHM1uqUtW7SD79R4KVG2',
      isFeatured: true,
      awardBadge: '🏆 Best Innovation',
      studentName: 'Elena D.',
      studentInitials: 'ED',
      studentPhotoUrl: '',
      studentCohort: "Advanced ML Cohort '24",
      studentQuote:
        '"Building NeuroScan pushed me to understand the boundary between research and production ML. The most challenging part was explainability - making model decisions interpretable for clinicians was as hard as the accuracy problem itself."',
      mentorName: 'Dr. A. Patel',
      mentorTitle: 'Senior AI Researcher',
      mentorQuote:
        '"Elena identified a critical preprocessing step that boosted accuracy by 12 percentage points - a finding the team is now preparing to publish."',
      impactStats: [
        { id: 'is-1', value: '98%',  label: 'Detection Accuracy' },
        { id: 'is-2', value: '12K+', label: 'MRI Scans Trained On' },
      ],
      liveDemoUrl: '',
      sourceCodeUrl: '',
      visible: true,
      order: 0,
    },
    {
      id: 'proj-logiflow',
      title: 'LogiFlow Autobots',
      slug: 'logiflow-autobots',
      shortDescription:
        'Reinforcement learning algorithms powering a simulated fleet of autonomous warehouse robots to optimize supply chains.',
      problemStatement:
        'Warehouse logistics suffers from inefficient routing of autonomous robots, leading to congestion, delays, and wasted energy - costing companies millions annually.',
      solution:
        'LogiFlow uses multi-agent reinforcement learning to coordinate a fleet of simulated warehouse robots, optimizing pick paths and reducing congestion by 35% compared to rule-based systems.',
      keyFeatures: [
        'Multi-agent RL coordination with shared reward shaping',
        'Real-time 3D simulation environment',
        '35% congestion reduction vs. rule-based baseline',
        'Scalable architecture tested to 100+ robot fleets',
      ],
      category: 'machine-learning',
      techStack: ['Python', 'Ray RLlib', 'PyTorch', 'Unity ML-Agents'],
      coverImageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBy3-Vht06zm085ZlajydyfyU8Ahh8XjEwQ0D7rjpOLK95Wvtz8JQjfW0wP6JuKMaViX1FoSjVjcxQ7CSyLpt2fHnhboFw3iLKQlE6-9RGS5lKGoZu-rKR04MYqXGEpD2f4vKDTUwM0agNllpQ5tPsRU6R4CHiQ0MwVrei6U_m7SLLNQmb6xgFlXmGAlmTHnr0fg1Cm3fpExonYyky583Q5nnCvAViq-bvxE-_eg8x9200YbgQ61eK9LUpkMLH-QahoU9_ZPiVbqF71',
      isFeatured: true,
      awardBadge: '🤖 AI Excellence',
      studentName: 'Marcus K.',
      studentInitials: 'MK',
      studentPhotoUrl: '',
      studentCohort: "AI Engineering Cohort '24",
      studentQuote:
        '"The hardest problem was credit assignment - teaching agents to cooperate when rewards are delayed by dozens of time steps. The PRIM AI curriculum gave me exactly what I needed to crack it."',
      mentorName: 'Dr. R. Singh',
      mentorTitle: 'RL Research Lead',
      mentorQuote:
        '"Marcus built one of the most sophisticated multi-agent environments I have seen from a student project. The reward shaping alone is thesis-level work."',
      impactStats: [
        { id: 'is-1', value: '35%',  label: 'Congestion Reduction' },
        { id: 'is-2', value: '100+', label: 'Robot Fleet Scale' },
      ],
      liveDemoUrl: '',
      sourceCodeUrl: '',
      visible: true,
      order: 1,
    },
    {
      id: 'proj-legalbrief',
      title: 'LegalBrief AI',
      slug: 'legalbrief-ai',
      shortDescription:
        'An automated legal document summarizer utilizing fine-tuned GPT models to extract key clauses.',
      problemStatement:
        'Legal professionals spend 60% of their time reading and summarizing documents. Existing tools hallucinate or miss critical clauses, making them unusable in practice.',
      solution:
        'LegalBrief fine-tunes GPT-4 on 5,000 annotated legal documents, achieving a 92% clause-recall rate - reliably surfacing termination, liability, and jurisdiction clauses in seconds.',
      keyFeatures: [
        'Fine-tuned GPT-4 on legal corpora',
        '92% clause-recall rate on held-out dataset',
        'Supports PDF and DOCX upload',
        'Side-by-side original and summary view',
      ],
      category: 'llms',
      techStack: ['Python', 'OpenAI', 'FastAPI', 'React'],
      coverImageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAmifkWvvR7cB7stDgU9k_Wpr2uC9VDX_NPBb0bcWfBqaDvBNgyAoWK6T41rTFQhtd2bwPFcrQiYo2OZNjdvVtKKZVvc93hBWRKbr-n13suY2RXiTHwz28oDtIogbFl3CY3ZXxk0SozukzFtoZufPZ7lf0Ff1aNqTMm2_o0za6-_yWQwuAVEw_4nLYFIT6tS4qXxlbPmnfmUmRyW2HP6CyfQxxMVdfw9J4F13xN3eqFDjhfjhsGH6JWutD5s9vRm0CK8b6xSvEbvfyE',
      isFeatured: false,
      awardBadge: '',
      studentName: 'Riya S.',
      studentInitials: 'RS',
      studentPhotoUrl: '',
      studentCohort: "AI Generalist Cohort '24",
      studentQuote:
        '"Fine-tuning for domain specificity was a revelation. General GPT-4 missed 40% of clauses; after fine-tuning on legal data, it missed fewer than 8%."',
      mentorName: 'Prof. M. Chen',
      mentorTitle: 'NLP Research Advisor',
      mentorQuote:
        '"Riya\'s fine-tuning methodology is publication-ready. The evaluation framework she built for clause-recall is particularly rigorous."',
      impactStats: [
        { id: 'is-1', value: '92%', label: 'Clause Recall Rate' },
        { id: 'is-2', value: '60%', label: 'Time Saved per Document' },
      ],
      liveDemoUrl: '',
      sourceCodeUrl: '',
      visible: true,
      order: 2,
    },
    {
      id: 'proj-climate',
      title: 'ClimatePredict',
      slug: 'climate-predict',
      shortDescription:
        'Interactive dashboard predicting micro-climate changes using historical satellite imagery and ML.',
      problemStatement:
        'Farmers and city planners lack granular, local climate predictions - global models are too coarse (50km+ resolution) to drive on-the-ground decisions.',
      solution:
        'ClimatePredict combines satellite imagery with LSTM models to predict temperature, rainfall, and humidity at 1km resolution, 7 days ahead, via an interactive map dashboard.',
      keyFeatures: [
        '1km resolution micro-climate forecasts',
        '7-day prediction horizon',
        'Interactive Mapbox visualization',
        'Historical trend analysis mode',
      ],
      category: 'web-apps',
      techStack: ['React', 'TensorFlow', 'Python', 'Mapbox'],
      coverImageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCwIPiUthWhWVyBV9Bhz53h72HGUyaEIiyVXgFKeulCsNdv37b1sJVG1ONEuF6qHzvlsWDJWMFn9WY0suEQ2E4N1mCmtIhyzOF9lApjhMsJdXq9evfI1GIzFU2hMo7iBGclXM3rA4ceYIjLCltqEnCOq5qAZKAA_p2LiktSfperNyNHVHedS71qDAKsynIe_Vt0PGcbaVF7AkriWxLavpbzb4NbbGwtSBJ7TgspGRwF35JGWgSPM9Hpnos2B574YBTqlwpxMllABn5F',
      isFeatured: false,
      awardBadge: '',
      studentName: 'Arjun M.',
      studentInitials: 'AM',
      studentPhotoUrl: '',
      studentCohort: "AI Generalist Cohort '24",
      studentQuote:
        '"Getting the spatial LSTM to learn from satellite time-series was the hardest technical challenge I have faced. The PRIM AI curriculum gave me exactly the right foundations to tackle it."',
      mentorName: 'Dr. L. Park',
      mentorTitle: 'ML Systems Advisor',
      mentorQuote:
        '"Arjun\'s spatial attention mechanism is novel. Combining ConvLSTM with Mapbox for real-time visualization at this resolution is genuinely impressive."',
      impactStats: [
        { id: 'is-1', value: '1km', label: 'Forecast Resolution' },
        { id: 'is-2', value: '87%', label: 'Prediction Accuracy' },
      ],
      liveDemoUrl: '',
      sourceCodeUrl: '',
      visible: true,
      order: 3,
    },
    {
      id: 'proj-ecoroute',
      title: 'Eco-Route AI',
      slug: 'eco-route-ai',
      shortDescription:
        'An intelligent routing engine that minimizes carbon emissions for global supply chains without compromising delivery speed.',
      problemStatement:
        'Current logistics routing models prioritize solely time and cost, entirely ignoring the environmental impact of varying topologies, traffic patterns, and vehicle specifics, leading to massive unnecessary carbon outputs.',
      solution:
        'Eco-Route AI introduces a multi-objective reinforcement learning agent that factors in real-time traffic, elevation changes, and vehicle emission profiles to propose routes that balance efficiency with a significantly reduced carbon footprint.',
      keyFeatures: [
        'Real-time emission prediction modeling',
        'Multi-modal transport integration (EVs, Hybrids, Diesel)',
        'Topographic-aware route smoothing',
      ],
      category: 'machine-learning',
      techStack: ['PyTorch', 'Ray RLlib', 'OSMnx', 'FastAPI', 'React'],
      coverImageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCPIw1-SxS0Sm0xl0VdsHC-yQf4gIxkUEVcCCbbDf8UbNjV9JknD8S94TjAHHMA_qxG2PM4y74f7ydrxeOgDgI5K2vVK5LiDTagK7mw35T_MR1SJoqozRK_pmIC7kSzt8Sp1IQ3PGrPTmBKIjZwW1eE840nwy3XII6ifB6-DA-kXBphm54nI-ubEsGxhc0kgisDEMrLUak6qRZ3l6X6FSwOJ5Dmidymi5M9sRP0m8GjTCS9Kw98svI2LR-fntJKZdNl26_5JBaNFhbN',
      isFeatured: false,
      awardBadge: '',
      studentName: 'Sarah J.',
      studentInitials: 'SJ',
      studentPhotoUrl: '',
      studentCohort: "Advanced ML Cohort '24",
      studentQuote:
        '"Building Eco-Route pushed me to understand the mathematical friction between competing objectives. Seeing the potential emissions savings made every late night worth it."',
      mentorName: 'Dr. H. Chen',
      mentorTitle: 'Senior Researcher',
      mentorQuote:
        '"Sarah\'s approach to the reward function design is nothing short of brilliant. She elegantly handled the sparse reward problem inherent in long-haul logistics simulation."',
      impactStats: [
        { id: 'is-1', value: '24%',  label: 'Average Carbon Reduction' },
        { id: 'is-2', value: '98.5%', label: 'Routing Accuracy' },
      ],
      liveDemoUrl: '',
      sourceCodeUrl: '',
      visible: true,
      order: 4,
    },
  ],

  // ── Bottom CTA banner (admin-editable) ───────────────────────────────────
  cta: {
    heading: 'Ready to Build Your Own AI Project?',
    description:
      'Join our intensive programs, master the latest AI tools, and become part of our next showcase.',
    btnLabel: 'Enroll Now',
  },
};

const STORAGE_KEY = 'primAI_projects';

export function loadProjectsData(): ProjectPageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProjectPageData;
  } catch {
    // fall through
  }
  return DEFAULT_PROJECTS_DATA;
}

export function saveProjectsData(data: ProjectPageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}
