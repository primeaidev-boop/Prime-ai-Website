import { useRef, useEffect, useCallback } from 'react';
import { useModal } from '@/hooks/useModal';
import { DemoModal } from '@/components/shared/DemoModal';
import { LearningPathway } from '@/components/shared/LearningPathway';
import { useSettingsStore } from '@/store/settingsStore';

// ─── Static data (not admin-editable) ────────────────────────────

const COMPANIES_R1 = ['Meta', 'Amazon', 'Google', 'Microsoft', 'Apple', 'Nvidia', 'Adobe', 'Netflix', 'Salesforce', 'IBM'];
const COMPANIES_R2 = ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant', 'Capgemini', 'Accenture', 'Deloitte', 'Mphasis'];
const COMPANIES_R3 = ['Razorpay', 'Zepto', 'PhonePe', 'CRED', 'Swiggy', 'Zomato', 'Freshworks', 'Zoho', 'Nykaa', 'Paytm', 'Ola', 'Meesho', 'Groww'];

const TOOL_CATS = [
  { name: 'Writing & Research', count: 10, icon: '✍️', color: 'var(--electric)', bg: 'rgba(0,212,255,.12)', tools: ['ChatGPT', 'Claude', 'Google Gemini', 'Perplexity AI', 'NotebookLM', 'Quillbot', 'Grammarly AI', 'Jasper AI', 'Copy.ai', 'Notion AI'] },
  { name: 'Design & Visual', count: 8, icon: '🎨', color: 'var(--orange)', bg: 'rgba(255,107,43,.12)', tools: ['Canva AI', 'Adobe Firefly', 'Midjourney', 'DALL-E', 'Ideogram', 'Microsoft Designer', 'Stable Diffusion', 'Leonardo AI'] },
  { name: 'Video & Audio', count: 8, icon: '🎬', color: '#f43f5e', bg: 'rgba(244,63,94,.12)', tools: ['Runway ML', 'Pika Labs', 'InVideo AI', 'Synthesia', 'HeyGen', 'ElevenLabs', 'Otter.ai', 'Descript'] },
  { name: 'Code & Development', count: 8, icon: '💻', color: '#a78bfa', bg: 'rgba(167,139,250,.12)', tools: ['GitHub Copilot', 'Cursor AI', 'Replit', 'Bolt.new', 'OpenAI API', 'LangChain', 'V0.dev', 'Tabnine'] },
  { name: 'Automation & Productivity', count: 8, icon: '⚙️', color: '#10b981', bg: 'rgba(16,185,129,.12)', tools: ['Zapier', 'Make.com', 'Microsoft Copilot', 'Gamma.app', 'Beautiful.ai', 'Tome', 'Otter.ai', 'Notion AI'] },
  { name: 'Data & Analytics', count: 7, icon: '📊', color: '#fbbf24', bg: 'rgba(251,191,36,.12)', tools: ['Julius AI', 'Polymer', 'ChatCSV', 'Obviously AI', 'Tableau AI', 'Power BI AI', 'MonkeyLearn'] },
] as const;

const DIFF_POINTS = [
  { icon: '🎯', title: 'Placement-First Curriculum', desc: 'We start with what employers need and build courses backwards from there.' },
  { icon: '⚡', title: 'Real Industry DNA', desc: 'Founded by IT company veterans - not just educators. Real experience, real results.' },
  { icon: '🚀', title: 'Startup-Ready Training', desc: 'Beyond jobs - we train you to launch your own AI-powered business or freelance career.' },
  { icon: '✅', title: 'ISO 9001:2015 Certified', desc: 'International quality standards - every course, every center, every student.' },
];

const WHO_CARDS = [
  { emoji: '🎓', title: 'School Students', desc: 'Class 6-12 students who want to be ahead of their generation. Learn AI before it becomes mandatory.' },
  { emoji: '📚', title: 'College Students', desc: 'Freshers and graduates who want to stand out. AI skills are the fastest way to get hired and grow faster.' },
  { emoji: '💼', title: 'Working Professionals', desc: 'Admin, HR, operations - use AI to do your work 3× faster and become the most valuable person in your team.' },
  { emoji: '🚀', title: 'Entrepreneurs', desc: 'Want to start your own AI-powered business or freelance career? Learn the tools. Build the future.' },
  { emoji: '🤖', title: 'Anyone Curious', desc: 'No background needed. If you\'re curious about AI and want to use it in your life - start here.' },
];

const STARTUP_OUTCOMES = [
  'Launch an AI Freelance Career', 'Start an AI Content Agency',
  'Build AI-Powered Products', 'Become an AI Consultant', 'Get Hired at Top Companies',
];

const TESTIMONIALS = [
  { initials: 'RS', grad: 'linear-gradient(135deg,var(--electric),#0077aa)', name: 'Riya Sharma', meta: 'Class 10 · Ahmedabad', badge: '🎓 Student', badgeCls: 'rgba(0,212,255,.1)', badgeColor: 'var(--electric)', quote: '"Maine AI se apna science project banaya - teacher ne best project award diya. Puri class shock thi!"', before: 'Struggling student', after: 'School topper' },
  { initials: 'AP', grad: 'linear-gradient(135deg,#a78bfa,#6d52e8)', name: 'Arjun Patel', meta: 'B.Tech Final Year · Surat', badge: '📚 College', badgeCls: 'rgba(167,139,250,.1)', badgeColor: '#a78bfa', quote: '"Resume mein AI skills add ki - 3 companies ne same week mein interview call diya. Placed in 2 months."', before: 'No job offers', after: 'Placed at IT company' },
  { initials: 'NM', grad: 'linear-gradient(135deg,var(--orange),var(--orange2))', name: 'Neha Modi', meta: 'HR Manager · Vadodara', badge: '💼 Professional', badgeCls: 'rgba(255,107,43,.1)', badgeColor: 'var(--orange)', quote: '"Jo kaam 3 ghante leta tha - ab 20 minute mein hota hai. Boss ne promotion di sirf 4 months mein."', before: 'Overworked, no growth', after: 'Promoted in 4 months' },
  { initials: 'KS', grad: 'linear-gradient(135deg,#f43f5e,#e11d48)', name: 'Karan Shah', meta: 'Freelancer · Rajkot', badge: '🚀 Entrepreneur', badgeCls: 'rgba(244,63,94,.1)', badgeColor: '#f43f5e', quote: '"Course ke baad AI content agency shuru ki. Pehle hi month mein 2 clients. Ab 6 figure monthly."', before: '9-to-5 job', after: 'Own AI agency' },
  { initials: 'PD', grad: 'linear-gradient(135deg,#10b981,#059669)', name: 'Priya Desai', meta: 'Homemaker · Anand', badge: '🤖 Anyone', badgeCls: 'rgba(16,185,129,.1)', badgeColor: '#10b981', quote: '"Mujhe lagta tha AI sirf engineers ke liye hai. Yahan seekha - ab main freelance graphic work karti hoon."', before: 'Zero tech background', after: 'Earning from home' },
];

// ─── Sub-components ───────────────────────────────────────────────

function StatPill({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--muted)' }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p className={`section-tag mb-3 ${center ? 'text-center' : ''}`}>{children}</p>
  );
}

// ─── Main component ───────────────────────────────────────────────

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modal = useModal();
  const s = useSettingsStore((state) => state.s);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const mobile = window.innerWidth < 768;
    interface Pt { x: number; y: number; r: number; dx: number; dy: number; a: number }
    const pts: Pt[] = Array.from({ length: mobile ? 35 : 75 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.4,
      dx: (Math.random() - 0.5) * 0.25, dy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.4 + 0.08,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${p.a})`; ctx.fill();
      });
      if (!mobile) {
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
            if (d < 105) {
              ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
              ctx.strokeStyle = `rgba(0,212,255,${0.035 * (1 - d / 105)})`; ctx.lineWidth = 0.5; ctx.stroke();
            }
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e, i) => { if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 70); }),
      { threshold: 0.07 },
    );
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const openModal = useCallback(() => modal.open(), [modal]);

  return (
    <>
      {/* Fixed particle canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0, opacity: 0.3 }}
      />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20"
        style={{ zIndex: 1 }}
      >
        {/* Batch banner */}
        {s.newBatchBanner && (
          <div
            className="anim-1 mb-6 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{ background: 'rgba(255,107,43,.1)', border: '1px solid rgba(255,107,43,.3)', color: 'var(--orange)' }}
          >
            🔥 {s.newBatchText}
          </div>
        )}

        {/* Badge */}
        <div
          className="anim-1 inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{ background: 'rgba(0,212,255,.08)', border: '1px solid rgba(0,212,255,.28)', color: 'var(--electric)' }}
        >
          <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--electric)', minWidth: '6px', minHeight: '6px' }} />
          {s.heroBadgeText}
        </div>

        {/* H1 */}
        <h1
          className="anim-2 font-bold leading-tight mb-6"
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(2.6rem, 7.5vw, 6.5rem)',
            letterSpacing: 'clamp(-1px, -0.02em, -2px)',
            color: 'var(--white)',
          }}
        >
          {s.heroHeadingLine1}
          <span className="block">
            <span className="gradient-text">{s.heroHeadingCyan} {s.heroHeadingWhite} {s.heroHeadingOrange}</span>
          </span>
        </h1>

        {/* Subtext */}
        <p
          className="anim-3 max-w-xl mb-10 leading-relaxed"
          style={{ color: 'var(--muted)', fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}
        >
          {s.heroSubtext}
        </p>

        {/* CTAs */}
        <div className="anim-4 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button onClick={openModal} className="btn-primary text-base px-8 py-3">
            {s.heroCta1Text} ➞
          </button>
          <a
            href="#courses"
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--muted)', minHeight: '44px' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--white)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            {s.heroCta2Text} ↓
          </a>
        </div>

        {/* Stats pills */}
        <div className="anim-5 flex flex-wrap gap-3 justify-center mt-16">
          <StatPill>{s.heroStudentsCount} {s.heroStudentsLabel}</StatPill>
          <StatPill>{s.heroCompaniesCount} {s.heroCompaniesLabel}</StatPill>
          <StatPill>{s.heroYearsCount} {s.heroYearsLabel}</StatPill>
          {s.heroIsoShow && (
            <StatPill>
              <span style={{ color: 'var(--electric)' }}>✓</span> ISO Certified
            </StatPill>
          )}
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1"
          style={{ color: 'var(--muted)', fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase' }}
        >
          <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, var(--electric), transparent)' }} />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── PROBLEM / REALITY ────────────────────────────────── */}
      <section className="relative px-6 md:px-20 py-24 max-w-6xl mx-auto" style={{ zIndex: 1 }}>
        <SectionLabel>The Reality</SectionLabel>
        <h2
          className="font-bold mb-12 max-w-xl"
          style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.9rem, 4vw, 3.2rem)', letterSpacing: '-1px', lineHeight: 1.15, color: 'var(--white)' }}
        >
          82% of companies can't find <em className="not-italic" style={{ color: 'var(--orange)' }}>AI-ready talent.</em> Don't be the gap.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { num: '82%', label: 'Companies Struggling to Hire', desc: 'Employers across India report difficulty finding candidates with the right AI and digital skills.' },
            { num: '47M', label: 'Skilled Worker Deficit by 2027', desc: 'India will be short 47 million skilled workers - AI skills are the fastest path to stand out.' },
            { num: '42.6%', label: 'Graduates Are Job-Ready', desc: 'Less than half of India\'s graduates are considered employable. AI skills change that equation.' },
          ].map((c) => (
            <div key={c.num} className="reveal glass-card p-8 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1" style={{ borderColor: 'var(--border)' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, var(--electric), transparent)' }} />
              <div className="font-bold mb-2" style={{ fontFamily: 'var(--font-head)', fontSize: '2.8rem', color: 'var(--electric)', letterSpacing: '-1px' }}>{c.num}</div>
              <div className="font-semibold mb-2 text-sm" style={{ color: 'var(--white)' }}>{c.label}</div>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPANIES HIRING ─────────────────────────────────── */}
      <section
        className="relative py-20 overflow-hidden"
        style={{ zIndex: 1, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(0,212,255,.02), transparent)' }}
      >
        <div className="px-6 md:px-20 max-w-6xl mx-auto mb-10 text-center">
          <SectionLabel center>Who's Hiring AI Talent</SectionLabel>
          <h2 className="font-bold mb-2" style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.9rem, 4vw, 3rem)', letterSpacing: '-1px', color: 'var(--white)' }}>
            The World's Biggest Companies<br className="hidden md:block" /> Are Actively Hiring AI Skills
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Our students are already working here. Your turn.</p>
        </div>
        <div className="flex flex-col gap-3 overflow-hidden">
          {[
            { items: COMPANIES_R1, cls: 'marquee-fwd', color: 'var(--white)', bg: 'rgba(255,255,255,.05)', border: 'var(--border)' },
            { items: COMPANIES_R2, cls: 'marquee-rev', color: 'rgba(255,180,140,.9)', bg: 'rgba(255,107,43,.06)', border: 'rgba(255,107,43,.2)' },
            { items: COMPANIES_R3, cls: 'marquee-med', color: 'rgba(200,185,255,.9)', bg: 'rgba(167,139,250,.06)', border: 'rgba(167,139,250,.2)' },
          ].map((row, ri) => (
            <div key={ri} className="overflow-hidden">
              <div className={`flex gap-3 w-max ${row.cls}`}>
                {[...row.items, ...row.items].map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300"
                    style={{ background: row.bg, border: `1px solid ${row.border}`, color: row.color }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-xs" style={{ color: 'var(--muted)' }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle" style={{ background: 'var(--electric)' }} />
          1500+ companies actively hiring from our network
        </p>
      </section>

      {/* ── WHY DIFFERENT ────────────────────────────────────── */}
      <section
        className="relative py-24 px-6 md:px-20"
        style={{ zIndex: 1, background: 'linear-gradient(180deg,transparent,rgba(0,212,255,.03),transparent)' }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <SectionLabel>Why PRIM AI</SectionLabel>
            <h2
              className="font-bold mb-4"
              style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', letterSpacing: '-1px', lineHeight: 1.15, color: 'var(--white)' }}
            >
              We are not just another institute.{' '}
              <span className="gradient-text">We are the AI Institute.</span>
            </h2>
            <p className="mb-6 leading-relaxed" style={{ color: 'var(--muted)' }}>
              Built by IT industry veterans with 20+ years of real-world experience. Every course reflects what the industry actually needs today.
            </p>
            <div className="flex flex-col gap-3">
              {DIFF_POINTS.map((pt) => (
                <div
                  key={pt.title}
                  className="reveal flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 group"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,212,255,.25)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div
                    className="w-10 h-10 min-w-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: 'linear-gradient(135deg,rgba(0,212,255,.12),rgba(255,107,43,.08))' }}
                  >
                    {pt.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1" style={{ color: 'var(--white)' }}>{pt.title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{pt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating visual box - hidden on mobile */}
          <div className="relative hidden md:block" style={{ height: '420px' }}>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full flex items-center justify-center text-center orb-pulse"
              style={{ background: 'radial-gradient(circle,rgba(0,212,255,.1),rgba(255,107,43,.04),transparent)', border: '1px solid rgba(0,212,255,.2)' }}
            >
              <span className="gradient-text font-bold text-lg" style={{ fontFamily: 'var(--font-head)' }}>PRIM<br />AI</span>
            </div>
            {[
              { pos: 'top-[8%] left-[2%]', cls: 'float-1', label: 'Who Can Join', content: ['School Students', 'College Students', 'Professionals', 'Entrepreneurs', 'Anyone Curious'] },
              { pos: 'top-[33%] right-[2%]', cls: 'float-2', label: "Tools You'll Master", content: ['ChatGPT', 'Gemini', 'Canva AI', 'Runway', 'Zapier', '+ Many More...'] },
              { pos: 'bottom-[8%] left-[10%]', cls: 'float-3', label: 'After This Course', content: null, value: 'Launch Your AI Career', sub: 'Job. Freelance. Startup. Your choice.' },
            ].map((card, i) => (
              <div
                key={i}
                className={`absolute ${card.pos} ${card.cls} p-4 rounded-2xl backdrop-blur-xl`}
                style={{ background: 'rgba(10,22,40,.93)', border: '1px solid var(--border)', width: '200px' }}
              >
                <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--electric)', fontSize: '0.62rem' }}>{card.label}</div>
                {card.content ? (
                  <div className="flex flex-wrap gap-1">
                    {card.content.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(0,212,255,.1)', border: '1px solid rgba(0,212,255,.2)', color: 'var(--electric)', fontSize: '0.62rem' }}>{t}</span>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="font-bold leading-tight mb-1" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)', fontSize: '1.05rem' }}>{card.value}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{card.sub}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOOLS CATEGORIES ─────────────────────────────────── */}
      <section
        className="relative py-24 px-6 md:px-20"
        id="tools"
        style={{ zIndex: 1, borderTop: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(0,212,255,.02), transparent)' }}
      >
        <div className="max-w-6xl mx-auto">
          <SectionLabel center>What You Will Learn</SectionLabel>
          <h2 className="text-center font-bold mb-3" style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.9rem, 4vw, 3.2rem)', letterSpacing: '-1px', color: 'var(--white)' }}>
            50+ AI Tools Across 6 Categories
          </h2>
          <p className="text-center mb-12" style={{ color: 'var(--muted)' }}>From writing to coding, design to automation - master the tools the industry runs on.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOOL_CATS.map((cat) => (
              <div
                key={cat.name}
                className="reveal glass-card p-6 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1.5"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {/* Bottom color bar on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: cat.color }} />
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: cat.bg }}>{cat.icon}</div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: 'var(--white)', fontFamily: 'var(--font-head)' }}>{cat.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{cat.count} Tools</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.tools.map((t) => (
                    <span key={t} className="px-2.5 py-0.5 rounded-full text-xs transition-all duration-200" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', color: 'var(--muted)' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <div
              className="inline-flex items-center gap-4 px-10 py-4 rounded-full"
              style={{ background: 'rgba(0,212,255,.06)', border: '1px solid rgba(0,212,255,.2)' }}
            >
              <span className="font-bold" style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', color: 'var(--electric)', letterSpacing: '-1px' }}>50+</span>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>Industry AI Tools - All Covered in Our Programs</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── COURSES PATHWAY ──────────────────────────────────── */}
      <section className="relative py-24 px-6 md:px-20 max-w-6xl mx-auto" id="courses" style={{ zIndex: 1 }}>
        <SectionLabel center>The Programs</SectionLabel>
        <h2 className="text-center font-bold mb-3" style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.9rem, 4vw, 3.2rem)', letterSpacing: '-1px', color: 'var(--white)' }}>
          Your AI Learning Pathway
        </h2>
        <p className="text-center mb-12" style={{ color: 'var(--muted)' }}>Start from the foundation or jump straight to your track - every program is built for real outcomes.</p>

        <LearningPathway />

      </section>

      {/* ── WHO IS THIS FOR ──────────────────────────────────── */}
      <section className="relative py-24 px-6 md:px-20 max-w-6xl mx-auto" id="who" style={{ zIndex: 1 }}>
        <SectionLabel center>Who Is This For</SectionLabel>
        <h2 className="text-center font-bold mb-12" style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.9rem, 4vw, 3rem)', letterSpacing: '-1px', color: 'var(--white)' }}>
          AI is for Everyone. We mean it.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {WHO_CARDS.slice(0, 3).map((c) => (
            <div
              key={c.title}
              className="reveal glass-card p-8 text-center transition-all duration-300 hover:-translate-y-2"
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,212,255,.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div className="text-4xl mb-3">{c.emoji}</div>
              <h3 className="font-bold mb-2" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>{c.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {WHO_CARDS.slice(3).map((c) => (
            <div
              key={c.title}
              className="reveal glass-card p-8 text-center transition-all duration-300 hover:-translate-y-2"
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,212,255,.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div className="text-4xl mb-3">{c.emoji}</div>
              <h3 className="font-bold mb-2" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>{c.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STARTUP / FUTURE ─────────────────────────────────── */}
      <section
        className="relative py-24 px-6 text-center"
        id="startup"
        style={{ zIndex: 1, background: 'linear-gradient(135deg,rgba(255,107,43,.04),rgba(0,212,255,.04))', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-3xl mx-auto">
          <SectionLabel center>Your Future</SectionLabel>
          <h2 className="font-bold mb-4" style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2rem, 5vw, 3.8rem)', letterSpacing: '-1.5px', lineHeight: 1.1, color: 'var(--white)' }}>
            Not just a job.<br />
            <span style={{ background: 'linear-gradient(135deg,var(--orange) 20%,var(--orange2) 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Launch your AI Startup.
            </span>
          </h2>
          <p className="mb-8 leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
            After completing our programs, students don't just get placed - they build things. Freelance agencies, AI content studios, automation consultancies. The tools you learn here are the tools the future runs on.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {STARTUP_OUTCOMES.map((o) => (
              <div
                key={o}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--white)' }}
              >
                <span style={{ color: 'var(--orange)' }}>✓</span>{o}
              </div>
            ))}
          </div>
          <button onClick={openModal} className="btn-primary text-base px-8 py-3">
            Start Your AI Journey - Free Demo ➞
          </button>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="relative py-24 px-6 md:px-20 max-w-6xl mx-auto" style={{ zIndex: 1 }}>
        <SectionLabel center>Real Stories</SectionLabel>
        <h2 className="text-center font-bold mb-3" style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.9rem, 4vw, 3.2rem)', letterSpacing: '-1px', color: 'var(--white)' }}>
          One Course. Life Changed.
        </h2>
        <p className="text-center mb-12" style={{ color: 'var(--muted)' }}>Real people. Real transformations. Straight from our students.</p>

        {/* Desktop: 3+2 grid */}
        <div className="hidden md:flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-5">
            {TESTIMONIALS.slice(0, 3).map((t) => <TestiCard key={t.name} t={t} />)}
          </div>
          <div className="grid grid-cols-2 gap-5 max-w-[68%] mx-auto w-full">
            {TESTIMONIALS.slice(3).map((t) => <TestiCard key={t.name} t={t} />)}
          </div>
        </div>

        {/* Mobile: horizontal scroll */}
        <div
          className="md:hidden flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={{ minWidth: '78vw', maxWidth: '78vw', scrollSnapAlign: 'start', flexShrink: 0 }}>
              <TestiCard t={t} />
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="relative py-36 px-6 text-center overflow-hidden" style={{ zIndex: 1 }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: '500px', height: '500px', background: 'radial-gradient(circle,rgba(0,212,255,.06),transparent 70%)', borderRadius: '50%' }}
        />
        <SectionLabel center>The Time Is Now</SectionLabel>
        <h2
          className="font-bold mb-4"
          style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)', letterSpacing: '-1.5px', lineHeight: 1.08, color: 'var(--white)' }}
        >
          AI's future is<br />being written today.
        </h2>
        <p className="mb-10" style={{ color: 'var(--muted)' }}>The question is - are you writing it, or watching others write it?</p>
        <button onClick={openModal} className="btn-primary text-base px-10 py-4">
          Book Your Free Demo Class ➞
        </button>
        <p className="mt-4 text-xs" style={{ color: 'var(--muted)' }}>Free. No obligation. Limited seats per batch.</p>
      </section>

      <DemoModal isOpen={modal.isOpen} onClose={modal.close} />
    </>
  );
}

// ─── Testimonial card ─────────────────────────────────────────────

interface Testi {
  initials: string; grad: string; name: string; meta: string;
  badge: string; badgeCls: string; badgeColor: string;
  quote: string; before: string; after: string;
}

function TestiCard({ t }: { t: Testi }) {
  return (
    <div
      className="reveal glass-card p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden group"
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,212,255,.25)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, var(--electric), var(--orange))' }} />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 min-w-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: t.grad }}>{t.initials}</div>
        <div>
          <div className="font-bold text-sm" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>{t.name}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>{t.meta}</div>
        </div>
        <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: t.badgeCls, color: t.badgeColor, border: `1px solid ${t.badgeColor}40` }}>{t.badge}</span>
      </div>
      <p className="text-sm leading-relaxed italic flex-1" style={{ color: 'var(--white)' }}>{t.quote}</p>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs overflow-hidden" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)' }}>
        <span className="truncate" style={{ color: 'var(--muted)' }}>{t.before}</span>
        <span className="font-bold flex-shrink-0" style={{ color: 'var(--electric)' }}>➞</span>
        <span className="font-semibold truncate" style={{ color: 'var(--electric)' }}>{t.after}</span>
      </div>
    </div>
  );
}
