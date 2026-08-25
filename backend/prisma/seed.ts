// Seed script - creates default admin account, site settings, and courses

import { PrismaClient, BlogStatus, CourseLevel } from '@prisma/client';
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
    { key: 'admin_whatsapp', value: '917573055577' },
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
    { key: 'contact_whatsapp_number', value: '917573055577' },
    { key: 'contact_whatsapp_message', value: "Hi! I'm interested in PRIM AI Institute courses. Please share more details." },
    { key: 'contact_show_map', value: 'true' },
    { key: 'contact_map_embed_url', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5482349281685!2d72.54098!3d23.08501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84c0b68a4e6f%3A0x4d1d5b2b36e2c92f!2sGanesh%20Glory%2C%20Gota%2C%20Ahmedabad%2C%20Gujarat%20382481!5e0!3m2!1sen!2sin!4v1720000000000!5m2!1sen!2sin' },
    { key: 'contact_map_link_url', value: 'https://maps.google.com/?q=Ganesh+Glory+Gota+Ahmedabad+Gujarat+382470' },
    // Contact FAQ
    // Courses page (single JSON blob)
    { key: 'course_page_data', value: JSON.stringify({
      badge: 'Level 1 – AI Foundation',
      title: 'AI Foundation Program',
      tagline: 'Your first step into the world of Artificial Intelligence. No prior knowledge required - just curiosity and the willingness to learn.',
      cta1Text: 'Book Free Demo Class ➞',
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
      audienceSubtext: 'This course is designed for anyone who wants to start their AI journey - regardless of age, background, or technical experience.',
      audience: [
        { id: '1', emoji: '🎒', title: 'School Students', description: 'Class 6-12 students who want to stand out in school and get ahead of their generation with AI skills.' },
        { id: '2', emoji: '🎓', title: 'College Students', description: 'Freshers and graduates who want to add high-demand AI skills to their resume and get hired faster.' },
        { id: '3', emoji: '💼', title: 'Working Professionals', description: 'Admin, HR, operations - anyone who wants to use AI to work smarter and grow faster at their job.' },
        { id: '4', emoji: '💡', title: 'Entrepreneurs', description: 'Business owners and aspiring entrepreneurs who want to use AI to build or grow their venture.' },
        { id: '5', emoji: '🤝', title: 'Anyone Curious', description: 'Zero background needed. If you are curious about AI and want to start - this is your entry point.' },
        { id: '6', emoji: '✅', title: 'No Prerequisites', description: 'No coding. No technical background. No prior AI knowledge. Just show up ready to learn.' },
      ],
      curriculumTitle: 'Module-by-Module Breakdown',
      curriculumSubtext: 'A structured 8-week journey from complete beginner to confident AI user - with real projects every week.',
      modules: [
        { id: '1', label: 'Module 1', title: 'AI Fundamentals & Getting Started', topics: ['What is Artificial Intelligence?', 'How AI thinks and works', 'ChatGPT basics', 'Google Gemini introduction', 'Your first AI conversation'] },
        { id: '2', label: 'Module 2', title: 'Prompt Engineering & Content Creation', topics: ['What is a prompt?', 'Writing effective prompts', 'AI for writing & essays', 'Email drafting with AI', 'Quillbot & Grammarly AI'] },
        { id: '3', label: 'Module 3', title: 'Creative AI - Design, Images & Presentations', topics: ['Canva AI - posters & banners', 'DALL-E image generation', 'AI presentations with Gamma.app', 'Microsoft Copilot in Office', 'Creative project building'] },
        { id: '4', label: 'Module 4', title: 'Real-World Application & Final Project', topics: ['AI for research & summarization', 'Productivity automation basics', 'Personal AI workflow setup', 'Final capstone project', 'Certificate presentation'] },
      ],
      toolsTitle: 'AI Tools You Will Master',
      toolsSubtext: 'Every tool you learn is actively used in the industry - no outdated software, no textbook tools.',
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
      outcomesSubtext: 'Every outcome below is a real, practical skill you will walk away with - not just theory.',
      outcomes: [
        { id: '1', title: 'Build Presentations in Minutes', description: 'Use Gamma.app and Canva AI to create professional presentations without design skills.' },
        { id: '2', title: 'Write Emails & Content with AI', description: 'Draft professional emails, essays, reports, and social content in seconds using ChatGPT.' },
        { id: '3', title: 'Generate Images & Posters', description: 'Create stunning visuals, banners, and artwork using DALL-E and Canva AI - no design experience needed.' },
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
      faqSubtext: 'Everything you need to know before joining - answered clearly.',
      faqs: [
        { id: '1', question: 'Do I need any coding or technical knowledge?', answer: 'Absolutely not. This course is designed for complete beginners. No coding, no prior AI knowledge, and no technical background is required. If you can use a smartphone, you are ready for this course.' },
        { id: '2', question: 'Will I receive a certificate after completing the course?', answer: 'Yes. Upon successful completion, you will receive an ISO 9001:2015 certified course completion certificate issued directly by PRIM AI Institute. This certificate is recognized by our 1500+ hiring partner companies.' },
        { id: '3', question: 'What is 1-to-1 mentorship? How does it work?', answer: 'Unlike group batches, we offer personal 1-to-1 mentorship. Your trainer focuses entirely on your learning pace, your questions, and your progress. This means faster learning and better outcomes tailored to you specifically.' },
        { id: '4', question: 'Is placement assistance provided after this course?', answer: 'Yes. We provide strong placement support with access to our network of 1500+ corporate hiring partners. This includes resume building, mock interviews, and direct referrals.' },
        { id: '5', question: 'What are the training days and timings?', answer: 'Training runs Monday to Friday. Timing is flexible and can be discussed at the time of enrollment. We offer morning and evening slots to accommodate students and working professionals.' },
        { id: '6', question: 'What language will the training be conducted in?', answer: 'All training is conducted in Hindi and Gujarati, making it comfortable and easy to understand for every learner.' },
        { id: '7', question: 'Can I move to Level 2 after this course?', answer: 'Yes - and that is exactly the plan. After completing Level 1, you can choose your track: AI Generalist (for non-tech professionals) or AI Developer (for IT and engineering students).' },
      ],
      finalCtaTitle: 'Your AI Journey\nStarts With One Step.',
      finalCtaBody: 'Book a free demo class - no fees, no obligation. Just come and see what AI can do for you.',
      finalCtaNote: 'Limited seats · Monday to Friday · Hindi & Gujarati · 1-to-1 Mentorship',
    }) },
    { key: 'contact_show_faq', value: 'true' },
    { key: 'contact_faq_title', value: 'Frequently Asked Questions' },
    // Footer -CTA strip
    { key: 'footer_cta_show', value: 'true' },
    { key: 'footer_cta_heading', value: 'Ready to Start Your AI Journey?' },
    { key: 'footer_cta_subtext', value: 'Book a free demo class -no fees, no obligation. Just come and experience it.' },
    { key: 'footer_cta_demo_btn_text', value: '🚀 Book Free Demo Class' },
    { key: 'footer_cta_wa_btn_text', value: '💬 WhatsApp Us' },
    // Footer -stats bar
    { key: 'footer_stats_show', value: 'true' },
    { key: 'footer_stat_1_num', value: '5000+' },
    { key: 'footer_stat_1_label', value: 'Students Trained' },
    { key: 'footer_stat_2_num', value: '1500+' },
    { key: 'footer_stat_2_label', value: 'Hiring Partners' },
    { key: 'footer_stat_3_num', value: '20+' },
    { key: 'footer_stat_3_label', value: 'Years Expertise' },
    { key: 'footer_stat_4_num', value: '3' },
    { key: 'footer_stat_4_label', value: 'AI Programs' },
    { key: 'footer_stat_5_num', value: '50+' },
    { key: 'footer_stat_5_label', value: 'AI Tools Taught' },
    // Footer -brand col
    { key: 'footer_desc', value: "Gujarat's premier AI training institute -empowering students, professionals, and entrepreneurs with real-world AI skills that transform careers and businesses." },
    { key: 'footer_iso_show', value: 'true' },
    // Footer -column visibility
    { key: 'footer_quicklinks_show', value: 'true' },
    { key: 'footer_courses_show', value: 'true' },
    { key: 'footer_explore_more_show', value: 'true' },
    // Footer -contact col
    { key: 'footer_contact_show', value: 'true' },
    { key: 'footer_address', value: 'Ahmedabad, Gujarat, India' },
    { key: 'footer_phone', value: '+91 88490 31797' },
    { key: 'footer_email', value: 'primeai.dev@gmail.com' },
    { key: 'footer_hours', value: 'Mon – Fri, 9 AM – 7 PM' },
    // Footer -social icons
    { key: 'footer_social_show', value: 'true' },
    { key: 'footer_social_whatsapp', value: '' },
    { key: 'footer_social_linkedin', value: '' },
    { key: 'footer_social_instagram', value: '' },
    { key: 'footer_social_youtube', value: '' },
    // Footer -WhatsApp float
    { key: 'footer_wa_float_show', value: 'true' },
    { key: 'footer_wa_float_number', value: '917573055577' },
    // Footer -legal links
    { key: 'footer_privacy_url', value: '/privacy' },
    { key: 'footer_terms_url', value: '/terms' },
    { key: 'footer_refund_url', value: '/refund-policy' },
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

  // ─── Patch PRIM AI Team author with designation + bio ──────────────────────
  const primTeam = await prisma.blogAuthor.findFirst({ where: { name: 'PRIM AI Team' } });
  if (primTeam && !primTeam.designation) {
    await prisma.blogAuthor.update({
      where: { id: primTeam.id },
      data: {
        designation: 'Editorial Team, PRIM AI Institute',
        bio: 'Curated by our trainers and industry mentors to help you navigate AI - practically, not theoretically.',
      },
    });
    console.log('✅ PRIM AI Team author updated with designation');
  }

  // ─── Blog sample posts ──────────────────────────────────────────────────────
  // Idempotent: only creates if the slug doesn't already exist
  const seedPostExists = await prisma.blogPost.findUnique({
    where: { slug: '5-ai-tools-every-student-should-know' },
  });

  if (!seedPostExists) {
    const catAI = await prisma.blogCategory.upsert({
      where: { slug: 'ai-education' },
      update: {},
      create: { name: 'AI Education', slug: 'ai-education', color: '#00D4FF' },
    });
    const catCareer = await prisma.blogCategory.upsert({
      where: { slug: 'career' },
      update: {},
      create: { name: 'Career', slug: 'career', color: '#FF6B2B' },
    });
    const catTools = await prisma.blogCategory.upsert({
      where: { slug: 'ai-tools' },
      update: {},
      create: { name: 'AI Tools', slug: 'ai-tools', color: '#FBBF24' },
    });

    let author = await prisma.blogAuthor.findFirst({ where: { name: 'PRIM AI Team' } });
    if (!author) {
      author = await prisma.blogAuthor.create({
        data: {
          name: 'PRIM AI Team',
          designation: 'Editorial Team, PRIM AI Institute',
          bio: 'Curated by our trainers and industry mentors to help you navigate AI - practically, not theoretically.',
        },
      });
    }

    const now = new Date();

    await prisma.blogPost.upsert({
      where: { slug: '5-ai-tools-every-student-should-know' },
      update: {},
      create: {
        title: '5 AI Tools Every Student Should Know in 2026',
        slug: '5-ai-tools-every-student-should-know',
        excerpt: 'From writing essays to creating presentations in minutes, these five AI tools are transforming how students study and work.',
        content: `<h2>Why AI Tools Matter for Students</h2><p>Artificial intelligence is no longer something only engineers use. Today, a Class 10 student can use the same AI tools that Fortune 500 companies rely on - for free. The only difference is knowing which tools exist and how to use them effectively.</p><h2>1. ChatGPT for Writing and Research</h2><p>ChatGPT is the most versatile AI tool for students. Use it to draft essays, summarize long articles, explain difficult concepts in simple language, and practice for exams. The key is learning how to write good prompts - a skill called prompt engineering that we teach at PRIM AI from day one.</p><h2>2. Canva AI for Design</h2><p>Canva's Magic Design feature generates entire slide decks from a single sentence. Students use this for school projects, college presentations, and internship applications - all without any design experience.</p><h2>3. Google Gemini for Research</h2><p>Gemini is deeply integrated into Google Docs, Sheets, Gmail, and Search. For students already using Google Workspace, it is the fastest way to add AI to an existing workflow. Use it to summarize research papers or analyze data in Sheets.</p><h2>4. Gamma.app for Presentations</h2><p>Gamma turns a topic or rough outline into a complete, beautifully designed presentation in under two minutes. Students at PRIM AI have created project presentations that their teachers thought took weeks to prepare.</p><h2>5. Quillbot for Writing Polish</h2><p>Quillbot paraphrases and rewrites text to make it clearer, more formal, or more concise. Combine it with ChatGPT for drafting and Quillbot for polishing, and your writing quality improves dramatically. Especially useful for non-native English speakers.</p><h2>Getting Started</h2><p>All five tools have free tiers that are more than enough for student use. The best approach is to pick one tool, use it every day for a week, and master it before moving to the next.</p>`,
        coverImageUrl: 'https://picsum.photos/seed/tools2026/1600/900',
        status: BlogStatus.PUBLISHED,
        categoryId: catTools.id,
        authorId: author.id,
        publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        readTimeMin: 4,
      },
    });

    await prisma.blogPost.upsert({
      where: { slug: 'how-to-get-an-ai-job-without-coding' },
      update: {},
      create: {
        title: 'How to Get an AI Job Without Knowing How to Code',
        slug: 'how-to-get-an-ai-job-without-coding',
        excerpt: 'Think AI careers are only for software engineers? Think again. Here are the fastest-growing non-technical AI roles in India right now.',
        content: `<h2>The Myth: AI is Only for Coders</h2><p>Most people assume that working in AI requires years of computer science education and the ability to write complex Python scripts. This assumption is wrong - and it is holding a lot of talented people back.</p><p>In 2026, some of the most in-demand AI roles require zero programming skills. Companies are desperately hiring people who can bridge the gap between AI technology and real-world business problems.</p><h2>AI Prompt Engineer</h2><p>Prompt engineers design the instructions given to AI systems to get the best possible outputs. They work in marketing, customer service, legal, healthcare, and almost every other industry. In India, experienced prompt engineers earn between 4 to 12 LPA, with the role growing 300% year-over-year.</p><p>No coding required. The key skills are clear communication, logical thinking, and deep familiarity with how AI models behave - all teachable in weeks, not years.</p><h2>AI Content Strategist</h2><p>AI content strategists use AI tools to plan, create, and optimize content at scale. Companies that previously needed a team of 10 content writers now hire 2-3 AI-fluent strategists instead. Salaries range from 5 to 15 LPA for experienced strategists.</p><h2>AI Trainer and Evaluator</h2><p>AI models need human feedback to improve. AI trainers review AI outputs, rate their quality, and flag errors. This role is available remotely, pays well for part-time work, and is an excellent entry point into the AI industry.</p><h2>AI Business Analyst</h2><p>Business analysts who understand AI identify where AI can save costs, improve efficiency, or create new revenue. They do not build AI systems - they decide where AI should be applied and measure the results. This role commands a premium salary because the supply of people who understand both business and AI is extremely limited.</p><h2>How to Start Today</h2><p>Our Level 1 AI Foundation course teaches you to use 8+ AI tools professionally in 6-8 weeks. Our Level 2 Generalist track then builds the specific skills for the roles above. You go from zero to job-ready without writing a single line of code.</p>`,
        coverImageUrl: 'https://picsum.photos/seed/aicareer/1600/900',
        status: BlogStatus.PUBLISHED,
        categoryId: catCareer.id,
        authorId: author.id,
        publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        readTimeMin: 5,
      },
    });

    await prisma.blogPost.upsert({
      where: { slug: 'prompt-engineering-beginners-guide' },
      update: {},
      create: {
        title: 'Prompt Engineering: The Skill That Makes AI 10x More Useful',
        slug: 'prompt-engineering-beginners-guide',
        excerpt: 'The difference between a useful AI output and a useless one is almost always the quality of the prompt. Here is how to write prompts that actually work.',
        content: `<h2>What Is Prompt Engineering?</h2><p>Prompt engineering is the practice of writing clear, specific instructions for AI systems to get the best possible outputs. It is not a technical skill - it is a communication skill. The better you are at describing what you want, the better the AI performs.</p><p>Think of it like giving directions. Telling someone "go to the nearby shop" gets inconsistent results. Telling someone "turn left, walk 200 meters, enter the green door" gets them exactly where you want. Prompt engineering is the same principle applied to AI.</p><h2>The Four Elements of a Strong Prompt</h2><p>Every effective prompt has four key elements: Role, Task, Context, and Format. When you include all four, AI outputs become dramatically more accurate and useful.</p><p><strong>Role:</strong> Tell the AI who it should behave as. "You are an experienced HR manager with 15 years of experience hiring for tech companies." This shapes the entire tone and expertise level of the response.</p><p><strong>Task:</strong> State exactly what you want. "Write a job description for a junior software developer role." Vague tasks produce vague outputs.</p><p><strong>Context:</strong> Provide relevant background. "The company is a 50-person startup in Ahmedabad. The role is remote-first. Salary is 4-6 LPA." Context eliminates guesswork.</p><p><strong>Format:</strong> Specify how you want the output. "Format it as a bulleted list. Keep total length under 300 words." Format instructions prevent the AI from returning a wall of text when you wanted something scannable.</p><h2>Common Mistakes to Avoid</h2><p>The most common mistake is writing a one-line prompt and expecting a perfect result. "Write me a blog post" produces something generic. "Write a 600-word blog post for Indian college students explaining three benefits of learning AI before graduating. Use a conversational tone. Include one real-world example per benefit." - that produces something usable.</p><p>The second mistake is not iterating. Prompt engineering is a conversation. If the first output is 80% of what you need, ask the AI to adjust the remaining 20%. "Make the tone more casual" or "Expand the second section" are perfectly valid follow-ups.</p><h2>Practice Exercise</h2><p>Take any task you do regularly at school or work. Write a prompt using the four elements above. Run it in ChatGPT or Gemini. Evaluate the output. Refine until the result matches what you would have written yourself. This exercise, done ten times, will make you a competent prompt engineer.</p>`,
        coverImageUrl: 'https://picsum.photos/seed/prompteng/1600/900',
        status: BlogStatus.PUBLISHED,
        categoryId: catAI.id,
        authorId: author.id,
        publishedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        readTimeMin: 5,
      },
    });

    console.log('✅ Blog sample posts seeded (3 posts)');
  }

  await seedCourses();
  await seedCoursesListingPage();
}

async function seedCoursesListingPage() {
  const existing = await prisma.coursesListingPage.count();
  if (existing > 0) {
    console.log('⏭  Courses listing page already seeded');
    return;
  }

  await prisma.coursesListingPage.create({
    data: {
      heroTag: 'THE PROGRAMS',
      heroHeadingMain: 'One Path.',
      heroHeadingAccent: 'Four Levels.',
      heroSubtitle: 'From absolute beginner to professional AI practitioner -our structured pathway takes you from zero knowledge to job-ready skills at the pace that suits you.',
      whoTag: 'WHO IS THIS FOR',
      whoHeadingMain: 'Built for',
      whoHeadingAccent: 'Every Background',
      ctaTag: 'GET STARTED',
      ctaHeading: 'Not Sure Where to Start?',
      ctaDesc: 'Book a free 60-minute demo session and our trainers will guide you to the right level based on your background, goals, and schedule.',
      ctaBtnPrimary: 'Book Free Demo ➞',
      ctaBtnSecondary: 'Talk to Us',
      whoCards: {
        create: [
          { emoji: '🎓', title: 'Students (Class 6–Grad)', desc: 'Stand out in school projects, assignments, and placements with real AI skills.', order: 0 },
          { emoji: '💼', title: 'Working Professionals', desc: 'Save 5–10 hours per week by using AI to automate content, research, and routine tasks.', order: 1 },
          { emoji: '🚀', title: 'Entrepreneurs', desc: 'Handle marketing, content, design, and customer communication in-house with AI.', order: 2 },
          { emoji: '✍️', title: 'Freelancers & Creators', desc: 'Offer AI-powered services, 10x your output, and charge premium rates.', order: 3 },
          { emoji: '🤔', title: 'AI Curious – Zero Background', desc: 'No coding, no tech experience. Just bring curiosity – we handle everything else.', order: 4 },
        ],
      },
    },
  });

  console.log('✅ Courses listing page seeded');
}

async function seedCourses() {
  const coursesData = [
    // ─── L1 Foundation ────────────────────────────────────────────────────────
    {
      level: CourseLevel.L1_FOUNDATION,
      displayOrder: 0,
      badgeText: 'Level 1 · AI Foundation',
      title: 'AI Foundation Program',
      tagline: 'Your first step into the world of Artificial Intelligence. No coding. No experience. Just curiosity.',
      heroImageUrl: null,
      duration: '6 to 8 Weeks',
      mentorship: '1-to-1 Personal',
      trainingDays: 'Monday to Friday',
      language: 'Hindi & Gujarati',
      mode: 'Offline · Hands-on',
      certificate: 'ISO 9001:2015 ✓',
      placementInfo: 'Yes – 1500+ Partners',
      levelLabel: 'Beginner · No experience needed',
      ctaDemoText: 'Book Free Demo ➞',
      ctaWaText: '💬 Chat on WhatsApp',
      ctaDownloadText: 'Download Syllabus',
      whoItems: [
        { emoji: '🎓', title: 'School Students', desc: 'Class 6–12 students who want to stand out in school projects, assignments, and competitions using AI tools.', order: 0 },
        { emoji: '🎓', title: 'College Students', desc: 'Freshers and graduates looking to add practical AI skills to their resume before entering the job market.', order: 1 },
        { emoji: '💼', title: 'Working Professionals', desc: 'Admin, HR, operations, sales, and marketing professionals who want to use AI to save time and work smarter.', order: 2 },
        { emoji: '🚀', title: 'Entrepreneurs', desc: 'Business owners and aspiring entrepreneurs who want to use AI for marketing, content, and daily operations.', order: 3 },
        { emoji: '🤔', title: 'Anyone Curious About AI', desc: 'Zero background needed. If you have heard about AI and want to understand it by actually using it, this is where you start.', order: 4 },
        { emoji: '✅', title: 'No Prerequisites Required', desc: 'No coding. No technical background. No expensive laptop. Just bring your curiosity and willingness to learn.', order: 5 },
      ],
      modules: [
        { label: 'Module 1', title: 'AI Fundamentals & Getting Started', topics: ['What is Artificial Intelligence?', 'How AI thinks and works', 'ChatGPT basics and setup', 'Google Gemini introduction', 'Your first AI conversation'], order: 0 },
        { label: 'Module 2', title: 'Prompt Engineering & Content Creation', topics: ['What is a prompt?', 'Writing effective prompts', 'AI for writing & essays', 'Email drafting with AI', 'Quillbot & Grammarly AI'], order: 1 },
        { label: 'Module 3', title: 'Creative AI · Design, Images & Presentations', topics: ['Canva AI – posters & banners', 'DALL-E image generation', 'AI presentations with Gamma.app', 'Microsoft Copilot in Office', 'Creative project building'], order: 2 },
        { label: 'Module 4', title: 'Real-World Application & Final Project', topics: ['AI for research & summarization', 'Productivity automation basics', 'Personal AI workflow setup', 'Final capstone project', 'Certificate presentation'], order: 3 },
      ],
      tools: [
        { emoji: '🤖', name: 'ChatGPT', category: 'Writing & Research', order: 0 },
        { emoji: '🌐', name: 'Google Gemini', category: 'Research & Search', order: 1 },
        { emoji: '🎨', name: 'Canva AI', category: 'Design & Visual', order: 2 },
        { emoji: '🖼️', name: 'DALL-E', category: 'Image Generation', order: 3 },
        { emoji: '🪟', name: 'Microsoft Copilot', category: 'Office Productivity', order: 4 },
        { emoji: '✍️', name: 'Quillbot', category: 'Writing & Grammar', order: 5 },
        { emoji: '📐', name: 'Gamma.app', category: 'AI Presentations', order: 6 },
        { emoji: '💙', name: 'Claude by Anthropic', category: 'Writing Assistant', order: 7 },
      ],
      outcomes: [
        { title: 'Build Presentations in Minutes', desc: 'Use Gamma.app and Canva AI to create professional presentations that impress teachers, clients, and managers.', order: 0 },
        { title: 'Write Emails & Content with AI', desc: 'Draft professional emails, essays, reports, and social media content using ChatGPT and Claude in half the time.', order: 1 },
        { title: 'Generate Images & Posters', desc: 'Create stunning visuals, banners, and artwork for any project using DALL-E and Canva AI – no design skills needed.', order: 2 },
        { title: 'Research Any Topic Instantly', desc: 'Use AI to summarize documents, research papers, news articles, and complex topics in seconds.', order: 3 },
        { title: 'Automate Simple Daily Tasks', desc: 'Set up basic AI workflows that save you 1–2 hours every day across email, content, and research tasks.', order: 4 },
        { title: 'Start Your AI Career Journey', desc: 'Build a strong foundation to confidently move to Level 2 specializations – generalist or developer track.', order: 5 },
      ],
      beforeAfter: {
        beforeItems: ['Spending hours on assignments and projects', 'Struggling to write good content', 'Paying for design work or templates', 'No idea how AI works or where to start', 'Feeling left behind in the AI revolution'],
        afterItems: ['Projects done in minutes with AI assistance', 'Confident AI-powered writer and creator', 'Creating your own professional designs for free', 'Using 8+ AI tools confidently every day', 'Ready for the AI-powered future of work'],
      },
      eligibilityItems: [
        { text: 'Age 12 years and above', order: 0 },
        { text: 'Any educational qualification – school, college, or working', order: 1 },
        { text: 'Zero coding or technical knowledge required', order: 2 },
        { text: 'No prior AI experience needed', order: 3 },
        { text: 'School students, college students, and professionals – all welcome', order: 4 },
        { text: 'Entrepreneurs and homemakers – absolutely welcome', order: 5 },
        { text: 'Anyone curious about AI – this is your starting point', order: 6 },
      ],
      faqs: [
        { question: 'Do I need to know coding to join?', answer: 'No. This course has zero coding. You will use AI tools through simple text interfaces – no programming knowledge needed at any point.', order: 0 },
        { question: 'What kind of laptop or device do I need?', answer: 'Any laptop, tablet, or smartphone with internet access works. All AI tools used are browser-based and free to access.', order: 1 },
        { question: 'How long is the course?', answer: 'The AI Foundation Program runs for 6 to 8 weeks with classes Monday to Friday. Each session is approximately 1.5 hours.', order: 2 },
        { question: 'Is there a certificate at the end?', answer: 'Yes. You receive an ISO 9001:2015 certified completion certificate from PRIM AI Institute upon successful project submission.', order: 3 },
        { question: 'Can school students join this program?', answer: 'Yes. The course is designed to be accessible from Class 6 onwards. Many of our best students have been in school.', order: 4 },
        { question: 'What happens after I complete Level 1?', answer: 'You can progress to Level 2A (AI Generalist – non-tech track) or Level 2B (AI Developer – tech track) based on your career goals.', order: 5 },
        { question: 'Is there a free demo I can attend first?', answer: 'Yes. We offer a free 60-minute demo session where you experience the teaching style and meet our trainers before enrolling.', order: 6 },
      ],
      testimonials: [
        { initials: 'RS', name: 'Rahul S.', meta: 'Class 11, Ahmedabad', avatarGrad: 'linear-gradient(135deg,#00D4FF,#0099CC)', quote: 'I used to think AI was only for engineers. After just two weeks at PRIM AI, I was building presentations and writing content that my teachers were amazed by. Best decision I made.', before: 'Struggling with assignments', after: 'Using 8 AI tools daily', order: 0 },
        { initials: 'PD', name: 'Priya D.', meta: 'HR Executive, Surat', avatarGrad: 'linear-gradient(135deg,#FF6B2B,#FF9500)', quote: 'As an HR professional, I was spending 3 hours writing job descriptions and emails. Now I do it in 20 minutes with AI. The ROI on this course is incredible.', before: '3 hours writing JDs', after: '20 minutes with AI', order: 1 },
        { initials: 'NM', name: 'Neel M.', meta: 'Small Business Owner, Baroda', avatarGrad: 'linear-gradient(135deg,#a78bfa,#7c3aed)', quote: 'I was skeptical about AI for my business. The foundation course showed me exactly how to use ChatGPT and Canva AI to create all my marketing content. My costs dropped by 60%.', before: 'Paying for content creation', after: '60% cost reduction', order: 2 },
      ],
    },

    // ─── L2A Generalist ────────────────────────────────────────────────────────
    {
      level: CourseLevel.L2A_GENERALIST,
      displayOrder: 1,
      badgeText: 'Level 2A · Non-Tech Track',
      title: 'AI Generalist Program',
      tagline: 'Master 15+ AI tools for content creation, design, video, and business automation. No coding needed.',
      heroImageUrl: null,
      duration: '6 to 8 Weeks',
      mentorship: '1-to-1 Personal',
      trainingDays: 'Monday to Friday',
      language: 'Hindi & Gujarati',
      mode: 'Offline · Hands-on',
      certificate: 'ISO 9001:2015 ✓',
      placementInfo: 'Yes – 1500+ Partners',
      levelLabel: 'Intermediate · L1 recommended',
      ctaDemoText: 'Book Free Demo ➞',
      ctaWaText: '💬 Chat on WhatsApp',
      ctaDownloadText: 'Download Syllabus',
      whoItems: [
        { emoji: '💼', title: 'Working Professionals', desc: 'HR, marketing, sales, and operations professionals who want to use AI to dramatically increase their output and value.', order: 0 },
        { emoji: '🎓', title: 'Fresh Graduates', desc: 'Job seekers who want to stand out in interviews by demonstrating real AI skills with a portfolio of projects.', order: 1 },
        { emoji: '🚀', title: 'Entrepreneurs & Founders', desc: 'Business owners who want to handle their own content creation, social media, design, and marketing using AI.', order: 2 },
        { emoji: '✍️', title: 'Content Creators', desc: 'Bloggers, YouTubers, Instagram creators who want to 10x their content output using AI writing and video tools.', order: 3 },
        { emoji: '💡', title: 'Freelancers', desc: 'Designers, writers, virtual assistants who want to offer AI-powered services and charge premium rates.', order: 4 },
        { emoji: '✅', title: 'Zero Coding Required', desc: 'This track is specifically designed for non-technical professionals. You will never write a single line of code.', order: 5 },
      ],
      modules: [
        { label: 'Week 1–2', title: 'Advanced Prompt Engineering & AI Writing', topics: ['Advanced ChatGPT techniques', 'Claude AI for professional writing', 'Prompt frameworks for business use', 'Email drafting & professional communication', 'AI for reports, proposals & presentations', 'Perplexity AI for deep research'], order: 0 },
        { label: 'Week 3–4', title: 'AI Design, Image & Visual Content', topics: ['Canva AI – advanced features', 'Adobe Firefly for creative visuals', 'Midjourney prompt writing', 'DALL-E for product images', 'Social media content creation at scale', 'Logo & branding with AI tools'], order: 1 },
        { label: 'Week 5–6', title: 'AI Video Creation & Presentations', topics: ['Runway ML for AI video', 'InVideo AI for video editing', 'Pika Labs for short video', 'Gamma.app for AI presentations', 'Reel & YouTube script writing with AI', 'AI voiceover & dubbing tools'], order: 2 },
        { label: 'Week 7–8', title: 'Workflow Automation & Final Project', topics: ['Zapier for task automation', 'Make.com workflow builder', 'Notion AI for productivity', 'Otter.ai for meeting automation', 'Build your personal AI workflow system', 'Final capstone project & presentation'], order: 3 },
      ],
      tools: [
        { emoji: '✍️', name: 'ChatGPT', category: 'Writing & Research', order: 0 },
        { emoji: '🤖', name: 'Claude AI', category: 'Professional Writing', order: 1 },
        { emoji: '🔍', name: 'Perplexity AI', category: 'Deep Research', order: 2 },
        { emoji: '📓', name: 'Notion AI', category: 'Productivity', order: 3 },
        { emoji: '🎨', name: 'Canva AI', category: 'Design & Visuals', order: 4 },
        { emoji: '🎆', name: 'Adobe Firefly', category: 'Creative Visuals', order: 5 },
        { emoji: '🖼️', name: 'Midjourney', category: 'Image Generation', order: 6 },
        { emoji: '🎬', name: 'Runway ML', category: 'AI Video', order: 7 },
        { emoji: '📹', name: 'InVideo AI', category: 'Video Editing', order: 8 },
        { emoji: '🎥', name: 'Pika Labs', category: 'Short Video', order: 9 },
        { emoji: '📊', name: 'Gamma.app', category: 'AI Presentations', order: 10 },
        { emoji: '⚡', name: 'Zapier', category: 'Task Automation', order: 11 },
        { emoji: '🔄', name: 'Make.com', category: 'Workflow Builder', order: 12 },
        { emoji: '📝', name: 'Otter.ai', category: 'Meeting Automation', order: 13 },
        { emoji: '🖼️', name: 'DALL-E', category: 'Image Generation', order: 14 },
      ],
      outcomes: [
        { title: 'Create Professional Content at Scale', desc: 'Write blog posts, social media captions, email campaigns, and video scripts in minutes using AI writing tools.', order: 0 },
        { title: 'Design Stunning Visuals Without a Designer', desc: 'Use Canva AI, Adobe Firefly, and Midjourney to create professional-grade graphics, thumbnails, and brand assets.', order: 1 },
        { title: 'Produce Videos with AI', desc: 'Use Runway ML and InVideo AI to create short-form video content, reels, and YouTube videos without a production team.', order: 2 },
        { title: 'Automate Repetitive Business Tasks', desc: 'Build Zapier and Make.com workflows that run automatically – saving 5–10 hours of manual work every week.', order: 3 },
        { title: 'Build a Marketable AI Portfolio', desc: 'Complete 4+ real projects during the course that you can showcase to employers or clients as proof of your skills.', order: 4 },
        { title: 'Offer AI-Powered Freelance Services', desc: 'Know how to package and sell AI-powered content, design, and automation services at premium freelance rates.', order: 5 },
        { title: 'Research and Summarize at 10x Speed', desc: 'Use Perplexity AI and Claude to research any topic, summarize documents, and extract insights in minutes.', order: 6 },
        { title: 'Transition Into AI-Adjacent Roles', desc: 'Qualify for roles like AI Content Manager, Digital Marketing Specialist, or Marketing Automation Executive.', order: 7 },
      ],
      beforeAfter: {
        beforeItems: ['Writing content manually for hours', 'Paying freelancers for design and video', 'Doing repetitive admin tasks by hand', 'No clear AI skills to show employers', 'Feeling overwhelmed by the number of AI tools'],
        afterItems: ['Publishing polished content in under 30 minutes', 'Handling design, video, and content in-house with AI', 'Automated workflows running on autopilot', 'A portfolio of 4+ AI projects ready to show', 'Confident using 15+ professional AI tools'],
      },
      eligibilityItems: [
        { text: 'Age 16 years and above', order: 0 },
        { text: 'Completed Level 1 or have equivalent AI basics knowledge', order: 1 },
        { text: 'No coding or technical background required', order: 2 },
        { text: 'Working professionals, fresh graduates, and entrepreneurs welcome', order: 3 },
        { text: 'Content creators, freelancers, and marketers welcome', order: 4 },
        { text: 'Basic smartphone or laptop proficiency needed', order: 5 },
        { text: 'Willingness to practice tools between sessions', order: 6 },
      ],
      faqs: [
        { question: 'Is Level 1 mandatory before joining Level 2A?', answer: 'It is strongly recommended. If you already have hands-on experience using tools like ChatGPT, Canva AI, and understand prompt writing, you may be eligible to skip Level 1 after a brief assessment.', order: 0 },
        { question: 'Will I need to pay for the AI tools used?', answer: 'Most tools have free tiers that are sufficient for the course. A few tools like Midjourney have minimal subscription costs. We will guide you on the most cost-effective setups.', order: 1 },
        { question: 'What kind of projects will I build?', answer: 'You will build 4 real projects: an AI content marketing campaign, a visual brand kit, an AI-generated video, and a personal automation workflow system.', order: 2 },
        { question: 'Is there placement support after this course?', answer: 'Yes. We provide resume review, portfolio presentation coaching, and connect you with our 1500+ hiring partner network.', order: 3 },
        { question: 'Can I learn this course alongside my job?', answer: 'Absolutely. Classes run Monday to Friday and session timings can be adjusted for working professionals on a case-by-case basis.', order: 4 },
        { question: 'How is this different from free YouTube tutorials?', answer: 'This is structured, hands-on, and mentored learning. You get 1-to-1 guidance, real project feedback, a certificate, and placement support – none of which YouTube provides.', order: 5 },
        { question: 'Will I receive a certificate for this level?', answer: 'Yes. An ISO 9001:2015 certified Level 2A completion certificate is awarded upon successful project submission and presentation.', order: 6 },
      ],
      testimonials: [
        { initials: 'NM', name: 'Neha M.', meta: 'Marketing Manager, Ahmedabad', avatarGrad: 'linear-gradient(135deg,#00D4FF,#0099CC)', quote: 'Level 2A completely changed how I work. I now produce a week of social media content in 3 hours using AI. My productivity has doubled and my boss has noticed. This course paid for itself in month one.', before: 'Week of content took 3 days', after: 'Same content in 3 hours', order: 0 },
        { initials: 'KS', name: 'Karan S.', meta: 'Freelance Designer, Surat', avatarGrad: 'linear-gradient(135deg,#FF6B2B,#FF9500)', quote: 'I was spending 8 hours on a logo project. Now with Midjourney and Canva AI, I deliver in 2 hours and charge the same rate. My monthly income has gone up by 40%.', before: '8 hours per logo project', after: '2 hours, 40% more income', order: 1 },
        { initials: 'PD', name: 'Pooja D.', meta: 'Fresh Graduate, Baroda', avatarGrad: 'linear-gradient(135deg,#a78bfa,#7c3aed)', quote: 'I was struggling to find a job. After completing the AI Generalist program, I built a portfolio of AI projects and landed a Digital Marketing role with a 30% higher salary than my peers.', before: 'Job searching for 4 months', after: 'Hired within 3 weeks of graduating', order: 2 },
      ],
    },

    // ─── L2B Developer ─────────────────────────────────────────────────────────
    {
      level: CourseLevel.L2B_DEVELOPER,
      displayOrder: 2,
      badgeText: 'Level 2B · Tech Track',
      title: 'AI Developer Program',
      tagline: 'Learn to code smarter, build faster, and develop AI-powered applications. Turn ideas into real products.',
      heroImageUrl: null,
      duration: '8 to 10 Weeks',
      mentorship: '1-to-1 Personal',
      trainingDays: 'Monday to Friday',
      language: 'Hindi & Gujarati',
      mode: 'Offline · Hands-on',
      certificate: 'ISO 9001:2015 ✓',
      placementInfo: 'Yes – 1500+ Partners',
      levelLabel: 'Tech Track · Basic coding helpful',
      ctaDemoText: 'Book Free Demo ➞',
      ctaWaText: '💬 Chat on WhatsApp',
      ctaDownloadText: 'Download Syllabus',
      whoItems: [
        { emoji: '💻', title: 'IT & CS Students', desc: 'Computer science students who want to build AI-powered projects that stand out in campus placements and internships.', order: 0 },
        { emoji: '⚙️', title: 'Engineering Students', desc: 'Engineering graduates who want to add AI development skills to their technical profile and access better opportunities.', order: 1 },
        { emoji: '👨‍💻', title: 'Working Developers', desc: 'Software developers who want to integrate AI into their projects, automate testing, and work with LLM APIs.', order: 2 },
        { emoji: '🧪', title: 'QA & Testers', desc: 'Testers who want to use AI for automated test generation, bug analysis, and intelligent test execution.', order: 3 },
        { emoji: '🚀', title: 'Tech Entrepreneurs', desc: 'Founders building SaaS products, apps, or tools who want to leverage AI APIs without hiring a large team.', order: 4 },
        { emoji: '✅', title: 'Basic Coding Helpful', desc: 'You do not need to be an expert, but knowing basic Python or JavaScript will help you get the most from this course.', order: 5 },
      ],
      modules: [
        { label: 'Week 1–2', title: 'AI-Assisted Coding & Developer Tools', topics: ['GitHub Copilot setup & workflow', 'Cursor AI for intelligent coding', 'ChatGPT for code explanation & review', 'Claude for debugging and refactoring', 'Prompt engineering for developers', 'AI code review best practices'], order: 0 },
        { label: 'Week 3–4', title: 'LLM APIs & AI Integration', topics: ['OpenAI API fundamentals', 'Gemini API integration', 'API authentication & security', 'Building chat interfaces with AI', 'Handling AI responses and streaming', 'Error handling and rate limits'], order: 1 },
        { label: 'Week 5–6', title: 'AI App Development & No-Code Tools', topics: ['LangChain basics and agents', 'Replit for rapid prototyping', 'Bolt.new for full-stack AI apps', 'V0.dev for AI-powered UI', 'Building your first AI chatbot', 'AI-powered search & retrieval (RAG)'], order: 2 },
        { label: 'Week 7–8', title: 'Testing, Automation & Deployment', topics: ['AI for test case generation', 'Selenium + AI for automated testing', 'Zapier & API integrations', 'Deploying AI apps to production', 'Performance & cost optimization', 'Security considerations in AI apps'], order: 3 },
        { label: 'Week 9–10', title: 'Capstone Project & Portfolio Building', topics: ['Build a complete AI-powered application', 'Code review & mentor feedback sessions', 'GitHub portfolio setup and README', 'Project documentation with AI', 'Demo day presentation', 'Certificate & placement guidance'], order: 4 },
      ],
      tools: [
        { emoji: '💻', name: 'GitHub Copilot', category: 'AI Coding Assistants', order: 0 },
        { emoji: '🖊️', name: 'Cursor AI', category: 'AI Coding Assistants', order: 1 },
        { emoji: '🔤', name: 'Tabnine', category: 'AI Coding Assistants', order: 2 },
        { emoji: '🤖', name: 'OpenAI API', category: 'LLM APIs', order: 3 },
        { emoji: '🌐', name: 'Gemini API', category: 'LLM APIs', order: 4 },
        { emoji: '💬', name: 'Claude API', category: 'LLM APIs', order: 5 },
        { emoji: '🔗', name: 'LangChain', category: 'AI Frameworks', order: 6 },
        { emoji: '💾', name: 'Replit', category: 'Development Platform', order: 7 },
        { emoji: '⚡', name: 'Bolt.new', category: 'AI App Builder', order: 8 },
      ],
      outcomes: [
        { title: 'Code 3x Faster with AI Assistance', desc: 'Use GitHub Copilot and Cursor AI to write, review, and refactor code significantly faster than before.', order: 0 },
        { title: 'Integrate LLM APIs into Real Applications', desc: 'Build applications that use OpenAI, Gemini, and Claude APIs to add intelligent features to any project.', order: 1 },
        { title: 'Build and Deploy AI-Powered Apps', desc: 'Create full-stack AI applications using LangChain, Bolt.new, and Replit and deploy them to production.', order: 2 },
        { title: 'Automate Testing with AI', desc: 'Use AI to generate comprehensive test cases, run automated tests, and reduce QA time by up to 60%.', order: 3 },
        { title: 'Create a Strong GitHub Portfolio', desc: 'Graduate with 2+ complete AI projects on GitHub that demonstrate your skills to any technical interviewer.', order: 4 },
        { title: 'Understand RAG and Agent Architecture', desc: 'Build AI systems that can search documents, use tools, and operate autonomously as intelligent agents.', order: 5 },
        { title: 'Work with AI in Any Tech Stack', desc: 'Apply AI integration patterns regardless of whether you work in Python, JavaScript, or any other language.', order: 6 },
        { title: 'Access Higher-Paying Tech Roles', desc: 'Position yourself for AI Engineer, ML Engineer, or Full-Stack AI Developer roles with 40–80% salary premium.', order: 7 },
      ],
      beforeAfter: {
        beforeItems: ['Writing boilerplate code manually for hours', 'No experience with AI APIs or LLMs', 'Struggling to stand out in campus placements', 'Time-consuming manual testing and debugging', 'No AI projects in your GitHub portfolio'],
        afterItems: ['Shipping features 3x faster with AI-assisted coding', 'Confidently integrating OpenAI, Gemini & Claude APIs', 'A portfolio with 2+ complete AI-powered applications', 'Automated test suites generated by AI', 'Ready for AI Engineer roles with premium pay'],
      },
      eligibilityItems: [
        { text: 'Age 16 years and above', order: 0 },
        { text: 'Basic programming knowledge in any language (Python or JavaScript preferred)', order: 1 },
        { text: 'Completed Level 1 or has equivalent AI fundamentals knowledge', order: 2 },
        { text: 'Laptop with at least 8GB RAM and internet connection', order: 3 },
        { text: 'IT students, CS students, engineering students, and working developers', order: 4 },
        { text: 'Willingness to write code, build projects, and commit to 2+ hours of practice daily', order: 5 },
        { text: 'Passion for building real AI applications – not just learning theory', order: 6 },
      ],
      faqs: [
        { question: 'What programming language will be used?', answer: 'Primarily Python for AI work (LangChain, OpenAI API) and JavaScript/TypeScript for frontend integrations. Basic Python knowledge is very helpful.', order: 0 },
        { question: 'Do I need to know AI or machine learning theory?', answer: 'No. This course focuses on practical AI application development – using existing AI APIs and tools – not building AI models from scratch.', order: 1 },
        { question: 'What will my final project look like?', answer: 'You will build and deploy a complete AI-powered application of your choice – for example, a document Q&A chatbot, an AI content generator, or an automated workflow tool.', order: 2 },
        { question: 'Is there support for placing into AI developer roles?', answer: 'Yes. We offer resume coaching, GitHub portfolio review, mock technical interviews, and direct referrals to our 1500+ hiring partner network.', order: 3 },
        { question: 'Will I need to pay for API costs?', answer: 'Most providers offer free tiers that are sufficient for the course (OpenAI free credits, Gemini free tier). We will show you how to minimize costs throughout.', order: 4 },
        { question: 'Can working professionals join while employed?', answer: 'Yes. This is designed to be completable alongside a full-time job. The intensive 10-week schedule includes daily practice but sessions can be scheduled flexibly for working professionals.', order: 5 },
        { question: 'How is this different from an online coding bootcamp?', answer: 'This is AI-specific, project-based, and mentored 1-to-1. You are not just learning to code – you are learning to build AI applications that have immediate market demand.', order: 6 },
      ],
      testimonials: [
        { initials: 'AP', name: 'Arjun P.', meta: 'CS Student, Ahmedabad', avatarGrad: 'linear-gradient(135deg,#00D4FF,#0099CC)', quote: 'I walked into campus placements with a GitHub portfolio showing 2 working AI apps. Every interviewer was impressed. I got a 7.5 LPA offer – 60% higher than my peers who did not have AI skills.', before: 'No AI projects, average placements', after: '7.5 LPA offer with AI portfolio', order: 0 },
        { initials: 'RV', name: 'Riya V.', meta: 'Junior Developer, Surat', avatarGrad: 'linear-gradient(135deg,#FF6B2B,#FF9500)', quote: 'I was spending hours writing repetitive code. After this course, GitHub Copilot and Cursor AI changed my workflow completely. I ship features 3x faster and my manager has noticed the difference.', before: 'Hours on repetitive coding tasks', after: '3x faster feature delivery', order: 1 },
        { initials: 'SM', name: 'Sanket M.', meta: 'QA Engineer, Baroda', avatarGrad: 'linear-gradient(135deg,#a78bfa,#7c3aed)', quote: 'I used to manually write test cases for days. AI now generates my test suites in hours. I also built a small AI testing tool that my entire QA team now uses. This course genuinely advanced my career.', before: 'Manual test writing took days', after: 'AI-generated test suites in hours', order: 2 },
      ],
    },

    // ─── AI & Machine Learning ────────────────────────────────────────────────
    {
      level: CourseLevel.L3_AIML,
      displayOrder: 3,
      badgeText: 'AI & Machine Learning',
      title: 'AI & Machine Learning Program',
      tagline: 'Learn to build, train, and deploy real-world AI/ML models. From Python fundamentals to Generative AI, turn data into intelligent products.',
      heroImageUrl: null,
      duration: '6 Months',
      mentorship: '1-to-1 Personal',
      trainingDays: 'Monday to Friday',
      language: 'Hindi & Gujarati',
      mode: 'Offline · Online',
      certificate: 'ISO 9001:2015 ✓',
      placementInfo: 'Yes – 1500+ Partners',
      levelLabel: 'Advanced · Basic Python helpful',
      ctaDemoText: 'Book Free Demo ➞',
      ctaWaText: '💬 Chat on WhatsApp',
      ctaDownloadText: 'Download Syllabus',
      whoItems: [
        { emoji: '💻', title: 'IT & CS Students', desc: 'Computer science students who want to build real ML and AI projects that stand out in campus placements and internships.', order: 0 },
        { emoji: '⚙️', title: 'Engineering Students', desc: 'Engineering graduates from any branch who want to add AI/ML skills to their technical profile and access better job opportunities.', order: 1 },
        { emoji: '👔', title: 'Working Professionals', desc: 'Software developers, analysts, and IT professionals who want to integrate AI/ML into their current role and move into data-driven positions.', order: 2 },
        { emoji: '📊', title: 'Data & Analytics Enthusiasts', desc: 'Anyone working with data, Excel, SQL, or reporting who wants to move into predictive modeling and machine learning.', order: 3 },
        { emoji: '🚀', title: 'Tech Entrepreneurs', desc: 'Founders and business owners who want to understand AI/ML well enough to build products, automate workflows, or evaluate AI vendors.', order: 4 },
        { emoji: '✅', title: 'Basic Coding Helpful', desc: 'You do not need to be an expert, but knowing basic Python will help you get the most from this course.', order: 5 },
      ],
      modules: [
        { label: 'Module 1', title: 'Foundations', topics: ['Python programming basics', 'Statistics & probability for ML', 'Linear algebra & calculus essentials', 'Intro to AI/ML landscape & careers'], order: 0 },
        { label: 'Module 2', title: 'Data Handling & Visualization', topics: ['NumPy & Pandas for data', 'Data cleaning & EDA', 'Visualization with Matplotlib & Seaborn', 'SQL for data extraction'], order: 1 },
        { label: 'Module 3', title: 'Machine Learning', topics: ['Regression & classification models', 'Decision trees, random forest, SVM, KNN', 'Clustering & PCA', 'Ensemble methods – XGBoost, LightGBM', 'Model evaluation & tuning'], order: 2 },
        { label: 'Module 4', title: 'Deep Learning', topics: ['Neural network fundamentals', 'CNNs for image classification', 'RNN/LSTM for sequence data', 'Transfer learning with pre-trained models'], order: 3 },
        { label: 'Module 5', title: 'NLP & Generative AI / LLMs', topics: ['Text preprocessing & embeddings', 'Transformer architecture basics', 'Prompt engineering', 'LLM APIs – OpenAI, Claude, Gemini', 'RAG & LangChain basics', 'Building a GenAI chatbot'], order: 4 },
        { label: 'Module 6', title: 'MLOps & Deployment', topics: ['Model deployment with Flask/FastAPI', 'Docker basics', 'Cloud fundamentals – AWS/Azure', 'Git/GitHub & MLflow basics', 'Streamlit for ML app demos'], order: 5 },
        { label: 'Module 7', title: 'Capstone Project & Career Prep', topics: ['End-to-end real-world project', 'GitHub portfolio setup', 'Mock interviews & question banks', 'Interview communication skills', 'Certificate & placement guidance'], order: 6 },
      ],
      tools: [
        { emoji: '💻', name: 'Python', category: 'Programming & Data', order: 0 },
        { emoji: '💻', name: 'SQL', category: 'Programming & Data', order: 1 },
        { emoji: '💻', name: 'NumPy', category: 'Programming & Data', order: 2 },
        { emoji: '💻', name: 'Pandas', category: 'Programming & Data', order: 3 },
        { emoji: '📊', name: 'Matplotlib', category: 'Visualization & BI', order: 4 },
        { emoji: '📊', name: 'Seaborn', category: 'Visualization & BI', order: 5 },
        { emoji: '📊', name: 'Power BI/Tableau', category: 'Visualization & BI', order: 6 },
        { emoji: '🤖', name: 'Scikit-learn', category: 'Machine Learning Frameworks', order: 7 },
        { emoji: '🤖', name: 'XGBoost', category: 'Machine Learning Frameworks', order: 8 },
        { emoji: '🧠', name: 'TensorFlow', category: 'Deep Learning', order: 9 },
        { emoji: '🧠', name: 'Keras', category: 'Deep Learning', order: 10 },
        { emoji: '🧠', name: 'PyTorch', category: 'Deep Learning', order: 11 },
        { emoji: '🔗', name: 'NLTK', category: 'NLP & Generative AI', order: 12 },
        { emoji: '🔗', name: 'spaCy', category: 'NLP & Generative AI', order: 13 },
        { emoji: '🔗', name: 'Hugging Face', category: 'NLP & Generative AI', order: 14 },
        { emoji: '🔗', name: 'LangChain', category: 'NLP & Generative AI', order: 15 },
        { emoji: '🔗', name: 'OpenAI/Claude/Gemini APIs', category: 'NLP & Generative AI', order: 16 },
        { emoji: '👁', name: 'OpenCV', category: 'Computer Vision', order: 17 },
        { emoji: '🚀', name: 'Flask', category: 'Deployment & Cloud', order: 18 },
        { emoji: '🚀', name: 'FastAPI', category: 'Deployment & Cloud', order: 19 },
        { emoji: '🚀', name: 'Streamlit', category: 'Deployment & Cloud', order: 20 },
        { emoji: '🚀', name: 'Docker', category: 'Deployment & Cloud', order: 21 },
        { emoji: '🚀', name: 'AWS/Azure', category: 'Deployment & Cloud', order: 22 },
        { emoji: '💾', name: 'Git', category: 'Version Control & IDE', order: 23 },
        { emoji: '💾', name: 'GitHub', category: 'Version Control & IDE', order: 24 },
        { emoji: '💾', name: 'Jupyter Notebook', category: 'Version Control & IDE', order: 25 },
        { emoji: '💾', name: 'Google Colab', category: 'Version Control & IDE', order: 26 },
        { emoji: '💾', name: 'VS Code', category: 'Version Control & IDE', order: 27 },
      ],
      outcomes: [
        { title: 'Build End-to-End ML Models', desc: 'Take a raw dataset from cleaning and analysis all the way to a trained, evaluated machine learning model.', order: 0 },
        { title: 'Work with Deep Learning Architectures', desc: 'Build and train CNNs and RNN/LSTM models for image and sequence-based problems.', order: 1 },
        { title: 'Integrate LLM APIs into Real Applications', desc: 'Build applications that use OpenAI, Gemini, and Claude APIs to add intelligent features to any project.', order: 2 },
        { title: 'Understand RAG and GenAI Application Design', desc: 'Build AI systems that can search documents, retrieve context, and generate accurate responses.', order: 3 },
        { title: 'Deploy Models to Production', desc: 'Package and deploy ML/AI models using Flask, FastAPI, or Streamlit, with basic cloud fundamentals.', order: 4 },
        { title: 'Create a Strong GitHub Portfolio', desc: 'Graduate with 2+ complete ML/AI projects on GitHub that demonstrate your skills to technical interviewers.', order: 5 },
        { title: 'Apply AI/ML Across Domains', desc: 'Work confidently with structured data, images, and text, and know which technique fits which problem.', order: 6 },
        { title: 'Be Ready for AI/ML Job Roles', desc: 'Position yourself for roles such as ML Engineer, Data Scientist, or AI Engineer with a project-backed profile.', order: 7 },
      ],
      beforeAfter: {
        beforeItems: ['No structured understanding of ML/AI concepts', 'No hands-on experience with real datasets', 'No exposure to LLMs or GenAI tools', 'No deployed or production-ready project', 'No AI/ML projects in your GitHub portfolio'],
        afterItems: ['Confident building models from raw data to deployment', 'Hands-on experience across ML, Deep Learning, and NLP', 'Comfortable working with LLM APIs and RAG systems', 'A portfolio with 2+ complete, deployed projects', 'Ready for ML/AI Engineer roles with a proven skillset'],
      },
      eligibilityItems: [
        { text: 'Graduate with any stream', order: 0 },
        { text: 'With or without IT/CS background', order: 1 },
        { text: 'Basic school-level math – algebra and graphs', order: 2 },
        { text: 'No prior coding experience needed', order: 3 },
        { text: 'Working professionals also welcome', order: 4 },
        { text: 'Willingness to practice outside class hours', order: 5 },
      ],
      faqs: [
        { question: 'What programming language will be used?', answer: 'Python is the primary language used throughout the course. It is taught from the basics in Module 1, so no prior programming experience is needed. SQL is also introduced for working with data.', order: 0 },
        { question: 'Do I need to know AI or machine learning theory beforehand?', answer: 'No. The course starts with foundational statistics and Python, then builds up to machine learning and deep learning step by step. You do not need any prior ML background to join.', order: 1 },
        { question: 'What will my final project look like?', answer: 'You will build a complete, end-to-end AI/ML project of your choice, from raw data to a trained model to a deployed application. This becomes part of your GitHub portfolio and is presented on demo day.', order: 2 },
        { question: 'Is there support for placement into AI/ML roles?', answer: 'Yes. The course includes resume building, mock interviews, and placement guidance through our partner network, alongside a portfolio of real projects to show employers.', order: 3 },
        { question: 'Will I need to pay for API costs?', answer: 'Basic usage of LLM APIs such as OpenAI, Gemini, and Claude during training is covered as part of the course. Any large-scale personal experimentation beyond course exercises may use free-tier limits or small individual costs.', order: 4 },
        { question: 'Can working professionals join while employed?', answer: 'Yes. Batches run Monday to Friday with fixed timings, and the course is designed so working professionals can attend alongside their job. Please check current batch timings for exact scheduling.', order: 5 },
        { question: 'How is this different from an online coding bootcamp?', answer: 'This is a hands-on program with 1-to-1 personal mentorship, live doubt resolution, and in-person project reviews, rather than pre-recorded videos or self-paced online modules.', order: 6 },
        { question: 'Do I need my own laptop for this course?', answer: 'Yes, a personal laptop is required since you will be writing code, training models, and working on projects throughout the course.', order: 7 },
        { question: 'What kind of certificate will I receive?', answer: 'You will receive a course completion certificate from PRIM AI Institute, which is ISO 9001:2015 certified.', order: 8 },
      ],
      testimonials: [
        { initials: 'PS', name: 'Priya S.', meta: 'CS Student, Ahmedabad', avatarGrad: 'linear-gradient(135deg,#10b981,#059669)', quote: 'I had zero experience with machine learning before this course. Now I have a working ML model and an NLP chatbot in my portfolio. It completely changed how interviewers looked at my resume.', before: 'No ML projects, average placements', after: 'Portfolio-backed placement offer', order: 0 },
        { initials: 'KM', name: 'Kunal M.', meta: 'Data Analyst, Pune', avatarGrad: 'linear-gradient(135deg,#00D4FF,#0099CC)', quote: 'I was stuck doing manual reporting in Excel for years. After this course, I can now build predictive models and automate half my old workload. My role has genuinely upgraded.', before: 'Manual Excel reporting', after: 'Automated ML-driven analysis', order: 1 },
        { initials: 'ND', name: 'Neha D.', meta: 'Working Professional, Bangalore', avatarGrad: 'linear-gradient(135deg,#FF6B2B,#FF9500)', quote: 'I wanted to move into AI but did not know where to start. The projects and mentor feedback gave me the confidence to actually build and deploy something real, not just watch tutorials.', before: 'No AI/ML experience', after: 'Deployed a real AI project independently', order: 2 },
      ],
    },
  ];

  for (const courseData of coursesData) {
    const { whoItems, modules, tools, outcomes, beforeAfter, eligibilityItems, faqs, testimonials, ...coreData } = courseData;

    const course = await prisma.aiCourse.upsert({
      where: { level: coreData.level },
      update: {},
      create: coreData,
    });

    // Only seed related items if they don't exist yet
    const existingWho = await prisma.courseWhoItem.count({ where: { courseId: course.id } });
    if (existingWho === 0) {
      await prisma.courseWhoItem.createMany({ data: whoItems.map((i) => ({ ...i, courseId: course.id })) });
    }

    const existingModules = await prisma.courseModule.count({ where: { courseId: course.id } });
    if (existingModules === 0) {
      await prisma.courseModule.createMany({ data: modules.map((i) => ({ ...i, courseId: course.id })) });
    }

    const existingTools = await prisma.courseTool.count({ where: { courseId: course.id } });
    if (existingTools === 0) {
      await prisma.courseTool.createMany({ data: tools.map((i) => ({ ...i, courseId: course.id })) });
    }

    const existingOutcomes = await prisma.courseOutcome.count({ where: { courseId: course.id } });
    if (existingOutcomes === 0) {
      await prisma.courseOutcome.createMany({ data: outcomes.map((i) => ({ ...i, courseId: course.id })) });
    }

    const existingBA = await prisma.courseBeforeAfter.count({ where: { courseId: course.id } });
    if (existingBA === 0 && beforeAfter) {
      await prisma.courseBeforeAfter.create({ data: { ...beforeAfter, courseId: course.id } });
    }

    const existingElig = await prisma.courseEligibilityItem.count({ where: { courseId: course.id } });
    if (existingElig === 0) {
      await prisma.courseEligibilityItem.createMany({ data: eligibilityItems.map((i) => ({ ...i, courseId: course.id })) });
    }

    const existingFaqs = await prisma.courseFAQ.count({ where: { courseId: course.id } });
    if (existingFaqs === 0) {
      await prisma.courseFAQ.createMany({ data: faqs.map((i) => ({ ...i, courseId: course.id })) });
    }

    const existingTestimonials = await prisma.courseTestimonial.count({ where: { courseId: course.id } });
    if (existingTestimonials === 0) {
      await prisma.courseTestimonial.createMany({ data: testimonials.map((i) => ({ ...i, courseId: course.id })) });
    }
  }

  console.log('✅ Courses seeded (L1, L2A, L2B)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
