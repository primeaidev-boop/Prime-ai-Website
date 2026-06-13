// Seed script - creates default admin account and site settings

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  await prisma.admin.upsert({
    where: { email: 'admin@primaiinstitute.com' },
    update: {},
    create: {
      email: 'admin@primaiinstitute.com',
      passwordHash,
      name: 'PRIM AI Admin',
    },
  });

  const defaultSettings = [
    // Navigation
    { key: 'nav_logo_text', value: 'PRIM AI' },
    { key: 'nav_cta_text', value: 'Book Free Demo' },
    { key: 'nav_link_home', value: 'Home' },
    { key: 'nav_link_about', value: 'About' },
    { key: 'nav_link_courses', value: 'Courses' },
    { key: 'nav_link_contact', value: 'Contact' },
    // Hero content
    { key: 'hero_badge_text', value: "India's AI-First Training Institute" },
    { key: 'hero_heading_line1', value: 'The Future Runs on AI.' },
    { key: 'hero_heading_cyan', value: 'Are' },
    { key: 'hero_heading_white', value: 'You' },
    { key: 'hero_heading_orange', value: 'Ready?' },
    { key: 'hero_subtext', value: "Join PRIM AI Institute - where school students, professionals & entrepreneurs learn to harness the power of Artificial Intelligence and lead the next decade." },
    { key: 'hero_cta1_text', value: 'Book Your Free Demo Class' },
    { key: 'hero_cta2_text', value: 'Explore Courses' },
    // Hero stats
    { key: 'hero_students_count', value: '5000+' },
    { key: 'hero_students_label', value: 'Students' },
    { key: 'hero_companies_count', value: '350+' },
    { key: 'hero_companies_label', value: 'Companies' },
    { key: 'hero_years_count', value: '10+' },
    { key: 'hero_years_label', value: 'Years' },
    { key: 'hero_iso_show', value: 'true' },
    // Batch banner
    { key: 'new_batch_banner', value: 'true' },
    { key: 'new_batch_text', value: 'New Batch Starting Soon - Limited Seats!' },
    // Admin contact
    { key: 'admin_whatsapp', value: '917573055191' },
    { key: 'admin_email', value: 'info@stadsolution.com' },
    // About hero
    { key: 'about_badge_text', value: 'OUR STORY' },
    { key: 'about_hero_h1', value: 'Built by Industry Veterans.' },
    { key: 'about_hero_h1_accent', value: 'Designed for Your Future.' },
    { key: 'about_hero_subtext', value: 'PRIM AI Institute emerged from a simple realization: the gap between academic theory and industry reality in Artificial Intelligence was widening. We set out to build an ecosystem where cutting-edge research meets practical application.' },
    { key: 'about_stat1_count', value: '10+' },
    { key: 'about_stat1_label', value: 'YEARS EXP' },
    { key: 'about_stat2_count', value: '5k+' },
    { key: 'about_stat2_label', value: 'STUDENTS' },
    { key: 'about_stat3_count', value: '350+' },
    { key: 'about_stat3_label', value: 'COMPANIES' },
    { key: 'about_show_iso', value: 'true' },
    // About quote
    { key: 'about_show_quote', value: 'true' },
    { key: 'about_quote_main', value: 'We believe AI education should be accessible to every Indian -' },
    { key: 'about_quote_accent', value: 'from Class 6 to CEO.' },
    // About differentiators
    { key: 'about_show_diff', value: 'true' },
    { key: 'about_diff1_icon', value: '🏅' },
    { key: 'about_diff1_title', value: 'ISO Certified' },
    { key: 'about_diff1_body', value: 'Internationally recognized quality management standards in technical education.' },
    { key: 'about_diff2_icon', value: '🧑‍💻' },
    { key: 'about_diff2_title', value: 'MNC Experts' },
    { key: 'about_diff2_body', value: 'Learn directly from senior engineers actively working in top tech companies.' },
    { key: 'about_diff3_icon', value: '🚀' },
    { key: 'about_diff3_title', value: '100% Placement' },
    { key: 'about_diff3_body', value: 'Dedicated career support and direct hiring partnerships with leading firms.' },
    { key: 'about_diff4_icon', value: '⚡' },
    { key: 'about_diff4_title', value: '100% Practical' },
    { key: 'about_diff4_body', value: 'Zero theoretical bloat. Build real-world projects from day one.' },
    // About trainers
    { key: 'about_show_trainers', value: 'true' },
    { key: 'about_trainer1_name', value: 'Dr. Alok Sharma' },
    { key: 'about_trainer1_role', value: 'Lead AI Architect' },
    { key: 'about_trainer1_exp', value: '15+ YRS EXP' },
    { key: 'about_trainer1_img', value: '' },
    { key: 'about_trainer2_name', value: 'Priya Patel' },
    { key: 'about_trainer2_role', value: 'Senior ML Engineer' },
    { key: 'about_trainer2_exp', value: '8+ YRS EXP' },
    { key: 'about_trainer2_img', value: '' },
    { key: 'about_trainer3_name', value: 'Rahul Verma' },
    { key: 'about_trainer3_role', value: 'Director of Research' },
    { key: 'about_trainer3_exp', value: '12+ YRS EXP' },
    { key: 'about_trainer3_img', value: '' },
    // About CTA
    { key: 'about_show_cta', value: 'true' },
    { key: 'about_cta_heading', value: 'Ready to Shape the Future?' },
    { key: 'about_cta_subtext', value: 'Join thousands of professionals who have accelerated their careers through our industry-aligned AI programs.' },
    { key: 'about_cta_btn1_text', value: 'Explore Courses' },
    { key: 'about_cta_btn2_text', value: 'Contact Admissions' },
    // Contact hero & info
    { key: 'contact_badge', value: 'GET IN TOUCH' },
    { key: 'contact_heading', value: 'Start Your AI Journey Today' },
    { key: 'contact_subtext', value: 'Connect with our admissions team to explore course details, campus visits, or bespoke AI training solutions for your team.' },
    { key: 'contact_address', value: '1016, 10th Floor, Ganesh Glory, Off S.G. Highway, Jagatpur Road, Gota, Ahmedabad – 382470' },
    { key: 'contact_phone', value: '+91 88490 31797' },
    { key: 'contact_email', value: 'primeai.dev@gmail.com' },
    { key: 'contact_hours', value: 'Mon – Sat: 9 AM – 6 PM IST' },
    { key: 'contact_form_title', value: 'Send an Enquiry' },
    // Contact WhatsApp & Map
    { key: 'contact_show_whatsapp', value: 'true' },
    { key: 'contact_whatsapp_number', value: '917573055191' },
    { key: 'contact_whatsapp_message', value: "Hi! I'm interested in PRIM AI Institute courses. Please share more details." },
    { key: 'contact_show_map', value: 'true' },
    { key: 'contact_map_embed_url', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5482349281685!2d72.54098!3d23.08501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84c0b68a4e6f%3A0x4d1d5b2b36e2c92f!2sGanesh%20Glory%2C%20Gota%2C%20Ahmedabad%2C%20Gujarat%20382481!5e0!3m2!1sen!2sin!4v1720000000000!5m2!1sen!2sin' },
    { key: 'contact_map_link_url', value: 'https://maps.google.com/?q=Ganesh+Glory+Gota+Ahmedabad+Gujarat+382470' },
    // Contact FAQ
    // Courses page (single JSON blob)
    { key: 'course_page_data', value: JSON.stringify({
      badge: 'Level 1 – AI Foundation',
      title: 'AI Foundation Program',
      tagline: 'Your first step into the world of Artificial Intelligence. No prior knowledge required — just curiosity and the willingness to learn.',
      cta1Text: 'Book Free Demo Class →',
      cta2Text: 'Download Syllabus',
      quickStats: ['⏱ 6-8 Weeks', '👤 1-to-1 Mentorship', '🏫 Offline · Hands-on', '✅ ISO Certificate', '🗣 Hindi & Gujarati'],
      cardHighlights: [
        { id: '1', label: 'Duration', value: '6 to 8 Weeks', highlighted: false },
        { id: '2', label: 'Mentorship', value: '1-to-1 Personal', highlighted: true },
        { id: '3', label: 'Training Days', value: 'Monday to Friday', highlighted: false },
        { id: '4', label: 'Language', value: 'Hindi & Gujarati', highlighted: false },
        { id: '5', label: 'Mode', value: 'Offline · Hands-on', highlighted: false },
        { id: '6', label: 'Certificate', value: 'ISO 9001:2015 ✓', highlighted: true },
        { id: '7', label: 'Placement Support', value: 'Yes – 1500+ Partners', highlighted: true },
      ],
      showAudience: true, showCurriculum: true, showTools: true,
      showOutcomes: true, showBeforeAfter: true, showTestimonials: true,
      showFaq: true, showRelated: true,
      audienceTitle: 'Who Should Join This Course?',
      audienceSubtext: 'This course is designed for anyone who wants to start their AI journey — regardless of age, background, or technical experience.',
      audience: [
        { id: '1', emoji: '🎒', title: 'School Students', description: 'Class 6-12 students who want to stand out in school and get ahead of their generation with AI skills.' },
        { id: '2', emoji: '🎓', title: 'College Students', description: 'Freshers and graduates who want to add high-demand AI skills to their resume and get hired faster.' },
        { id: '3', emoji: '💼', title: 'Working Professionals', description: 'Admin, HR, operations — anyone who wants to use AI to work smarter and grow faster at their job.' },
        { id: '4', emoji: '💡', title: 'Entrepreneurs', description: 'Business owners and aspiring entrepreneurs who want to use AI to build or grow their venture.' },
        { id: '5', emoji: '🤝', title: 'Anyone Curious', description: 'Zero background needed. If you are curious about AI and want to start — this is your entry point.' },
        { id: '6', emoji: '✅', title: 'No Prerequisites', description: 'No coding. No technical background. No prior AI knowledge. Just show up ready to learn.' },
      ],
      curriculumTitle: 'Module-by-Module Breakdown',
      curriculumSubtext: 'A structured 8-week journey from complete beginner to confident AI user — with real projects every week.',
      modules: [
        { id: '1', label: 'Module 1', title: 'AI Fundamentals & Getting Started', topics: ['What is Artificial Intelligence?', 'How AI thinks and works', 'ChatGPT basics', 'Google Gemini introduction', 'Your first AI conversation'] },
        { id: '2', label: 'Module 2', title: 'Prompt Engineering & Content Creation', topics: ['What is a prompt?', 'Writing effective prompts', 'AI for writing & essays', 'Email drafting with AI', 'Quillbot & Grammarly AI'] },
        { id: '3', label: 'Module 3', title: 'Creative AI — Design, Images & Presentations', topics: ['Canva AI — posters & banners', 'DALL-E image generation', 'AI presentations with Gamma.app', 'Microsoft Copilot in Office', 'Creative project building'] },
        { id: '4', label: 'Module 4', title: 'Real-World Application & Final Project', topics: ['AI for research & summarization', 'Productivity automation basics', 'Personal AI workflow setup', 'Final capstone project', 'Certificate presentation'] },
      ],
      toolsTitle: 'AI Tools You Will Master',
      toolsSubtext: 'Every tool you learn is actively used in the industry — no outdated software, no textbook tools.',
      tools: [
        { id: '1', emoji: '🤖', name: 'ChatGPT', category: 'Writing & Research' },
        { id: '2', emoji: '🔍', name: 'Google Gemini', category: 'Research & Search' },
        { id: '3', emoji: '🎨', name: 'Canva AI', category: 'Design & Visual' },
        { id: '4', emoji: '🖼️', name: 'DALL-E', category: 'Image Generation' },
        { id: '5', emoji: '🪟', name: 'Microsoft Copilot', category: 'Office Productivity' },
        { id: '6', emoji: '✍️', name: 'Quillbot', category: 'Writing & Grammar' },
        { id: '7', emoji: '📊', name: 'Gamma.app', category: 'AI Presentations' },
        { id: '8', emoji: '🔵', name: 'Claude by Anthropic', category: 'Writing Assistant' },
      ],
      toolsMoreText: 'And many more tools covered throughout the program',
      outcomesTitle: 'What You Will Be Able to Do',
      outcomesSubtext: 'Every outcome below is a real, practical skill you will walk away with — not just theory.',
      outcomes: [
        { id: '1', title: 'Build Presentations in Minutes', description: 'Use Gamma.app and Canva AI to create professional presentations without design skills.' },
        { id: '2', title: 'Write Emails & Content with AI', description: 'Draft professional emails, essays, reports, and social content in seconds using ChatGPT.' },
        { id: '3', title: 'Generate Images & Posters', description: 'Create stunning visuals, banners, and artwork using DALL-E and Canva AI — no design experience needed.' },
        { id: '4', title: 'Research Any Topic Instantly', description: 'Use AI to summarize documents, research topics, and get clear answers in seconds.' },
        { id: '5', title: 'Automate Simple Daily Tasks', description: 'Set up basic AI workflows that save you hours every week at school, college, or work.' },
        { id: '6', title: 'Start Your AI Career Journey', description: 'Build a strong foundation to confidently move into the AI Generalist or AI Developer track next.' },
      ],
      beforeLabel: 'Before This Course',
      afterLabel: 'After This Course',
      beforeItems: ['Spending hours on assignments', 'Struggling to write good content', 'Paying for design work', 'No idea how AI works', 'Feeling left behind'],
      afterItems: ['Projects done in minutes with AI', 'Confident AI-powered writer', 'Creating your own designs for free', 'Using 8+ AI tools confidently', 'Ready for the AI-powered future'],
      testimonialsTitle: 'What Our Students Say',
      testimonialsSubtext: 'Real results from real students who started exactly where you are right now.',
      testimonials: [
        { id: '1', initials: 'RS', avatarColor: 'linear-gradient(135deg,#00D4FF,#0077aa)', name: 'Riya Sharma', meta: 'Class 10 · Ahmedabad', quote: 'I made my science project using AI and won the best project award. My entire class was shocked!', before: 'Struggling student', after: 'School topper' },
        { id: '2', initials: 'PD', avatarColor: 'linear-gradient(135deg,#10b981,#059669)', name: 'Priya Desai', meta: 'Homemaker · Anand', quote: 'I thought AI was only for engineers. After this course, I now do freelance graphic work from home.', before: 'Zero tech background', after: 'Earning from home' },
        { id: '3', initials: 'NM', avatarColor: 'linear-gradient(135deg,#FF6B2B,#FF9500)', name: 'Neha Modi', meta: 'HR Manager · Vadodara', quote: 'Work that used to take 3 hours now takes 20 minutes. My manager noticed and promoted me in 4 months.', before: 'Overworked, no growth', after: 'Promoted in 4 months' },
      ],
      faqTitle: 'Frequently Asked Questions',
      faqSubtext: 'Everything you need to know before joining — answered clearly.',
      faqs: [
        { id: '1', question: 'Do I need any coding or technical knowledge?', answer: 'Absolutely not. This course is designed for complete beginners. No coding, no prior AI knowledge, and no technical background is required. If you can use a smartphone, you are ready for this course.' },
        { id: '2', question: 'Will I receive a certificate after completing the course?', answer: 'Yes. Upon successful completion, you will receive an ISO 9001:2015 certified course completion certificate issued directly by PRIM AI Institute. This certificate is recognized by our 1500+ hiring partner companies.' },
        { id: '3', question: 'What is 1-to-1 mentorship? How does it work?', answer: 'Unlike group batches, we offer personal 1-to-1 mentorship. Your trainer focuses entirely on your learning pace, your questions, and your progress. This means faster learning and better outcomes tailored to you specifically.' },
        { id: '4', question: 'Is placement assistance provided after this course?', answer: 'Yes. We provide strong placement support with access to our network of 1500+ corporate hiring partners. This includes resume building, mock interviews, and direct referrals.' },
        { id: '5', question: 'What are the training days and timings?', answer: 'Training runs Monday to Friday. Timing is flexible and can be discussed at the time of enrollment. We offer morning and evening slots to accommodate students and working professionals.' },
        { id: '6', question: 'What language will the training be conducted in?', answer: 'All training is conducted in Hindi and Gujarati, making it comfortable and easy to understand for every learner.' },
        { id: '7', question: 'Can I move to Level 2 after this course?', answer: 'Yes — and that is exactly the plan. After completing Level 1, you can choose your track: AI Generalist (for non-tech professionals) or AI Developer (for IT and engineering students).' },
      ],
      finalCtaTitle: 'Your AI Journey\nStarts With One Step.',
      finalCtaBody: 'Book a free demo class — no fees, no obligation. Just come and see what AI can do for you.',
      finalCtaNote: 'Limited seats · Monday to Friday · Hindi & Gujarati · 1-to-1 Mentorship',
    }) },
    { key: 'contact_show_faq', value: 'true' },
    { key: 'contact_faq_title', value: 'Frequently Asked Questions' },
    { key: 'contact_faqs', value: JSON.stringify([
      { id: '1', question: 'What is the primary focus of PRIM AI Institute?', answer: 'PRIM AI Institute specializes in practical AI education for school students, college students, working professionals, and business owners. Our programs focus on real-world applications of Artificial Intelligence with zero theoretical bloat and 100% hands-on learning.' },
      { id: '2', question: 'Do I need prior coding or AI knowledge to join?', answer: 'Not at all! Our Level 1 Introduction course is designed for absolute beginners. We start from the very basics and build your skills step by step. All you need is curiosity and a smartphone or laptop.' },
      { id: '3', question: 'What payment options are available?', answer: 'We offer flexible payment options including full payment, easy EMI plans, and scholarship opportunities for deserving students. Contact our admissions team to discuss the option that works best for you.' },
      { id: '4', question: 'What kind of career support do you provide?', answer: 'We provide 100% placement assistance including resume building workshops, mock interview sessions, LinkedIn optimization, and direct referrals to our 350+ hiring partner companies across India.' },
    ]) },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Seed complete - admin and settings created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
