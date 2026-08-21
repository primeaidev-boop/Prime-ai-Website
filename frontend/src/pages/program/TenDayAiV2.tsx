// Standalone A/B landing page variant: /program/10-day-ai-v2
//
// Markup + styling are ported verbatim from primai-landing-page-v2.html and are
// intentionally OFF-BRAND (purple/pink). Do not harmonize to site tokens, and do
// not add the site Navbar/Footer - this page ships its own header and footer.
//
// Style isolation: everything renders inside .v2-landing, and every rule in
// styles/program-v2.css is prefixed with .v2-landing. The source stylesheet left
// a large set of .primai-* utility rules unscoped, which would have leaked into
// the rest of the site; prefixing closes that off. Nothing was added to
// globals.css.
//
// The enrollment form posts to the SAME endpoint as the original page
// (POST /api/program-enrollments via submitProgramEnrollment) - no new endpoint,
// model or service. Rows are distinguishable by programTitle/programSlug.

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { submitProgramEnrollment } from '@/api/programEnrollments';
import { getPageContent } from '@/api/content';
import { getStoredRef, sanitizeRef } from '@/lib/refSource';
import { PROGRAM_ENROLLMENT_PROFILE_OPTIONS } from '@/data/programPagesData';
import type { ProgramPage as ProgramPageData } from '@/data/programPagesData';
import { initV2Effects } from './tenDayAiV2Effects';
import '@/styles/program-v2.css';

/** Marks rows from this variant in the admin Program column. */
const PROGRAM_LABEL = 'PRIM AI Institute - 10-Day Hands-On AI Program (V2)';

/** Own slug so By Program stays separated and dedup buckets don't collide
 *  with the original page's rows. */
const PROGRAM_SLUG = '10-day-ai-v2';

/** Batches are admin-managed on the original program page; this variant has no
 *  picker, so it reads the same content and uses the first non-Closed batch -
 *  the same source of truth the original form's dropdown is built from. */
const BATCH_CONTENT_SLUG = '10-day-ai';
const BATCH_FALLBACK = 'Not Specified';

export default function TenDayAiV2() {
  const { search } = useLocation();

  // --- form state ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);
  const inFlight = useRef(false);          // hard guard against double-submit
  const [batchName, setBatchName] = useState(BATCH_FALLBACK);

  // noindex: this is an A/B variant of an already-indexed page. Injected here
  // (and removed on unmount) because the project has no react-helmet - other
  // pages manage document head the same way.
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'PRIM AI Institute - AI Mastery Course | Learn AI in 10 Days';

    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    return () => {
      document.title = prevTitle;
      meta.remove();
    };
  }, []);

  // Vanilla interactivity (lazy videos, scroll reveals, FAQ accordion).
  useEffect(() => {
    initV2Effects();
  }, []);

  // Resolve the current batch from the admin-managed content.
  useEffect(() => {
    let alive = true;
    getPageContent<ProgramPageData[]>('programPages')
      .then((pages) => {
        if (!alive || !Array.isArray(pages)) return;
        const page = pages.find((p) => p.slug === BATCH_CONTENT_SLUG);
        const batches = page?.batches ?? [];
        const open = batches.find((b) => b.status !== 'Closed') ?? batches[0];
        if (open?.name) setBatchName(open.name);
      })
      .catch(() => { /* keep the fallback - never block the form */ });
    return () => { alive = false; };
  }, []);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Please enter your name.';
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) next.mobile = 'Please enter a valid 10-digit mobile number.';
    if (!city.trim()) next.city = 'Please enter your city.';
    if (!role) next.role = 'Please tell us who you are.';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Please enter a valid email address.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;           // block double-submit
    setSubmitError('');
    if (!validate()) return;

    // ?source= wins when present, else the same stored-ref fallback the
    // original page uses. Sanitized so the server whitelist can't 400 us.
    const fromUrl = sanitizeRef(new URLSearchParams(search).get('source'));
    const source = fromUrl ?? getStoredRef();

    inFlight.current = true;
    setSubmitting(true);
    try {
      await submitProgramEnrollment({
        fullName: name.trim(),
        whatsappNumber: mobile.trim(),
        city: city.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
        userType: role,
        programSlug: PROGRAM_SLUG,
        programTitle: PROGRAM_LABEL,
        batchName,
        source,
      });
      setDone(true);
    } catch {
      // Keep every entered value - the visitor should only have to retry.
      setSubmitError('Could not submit right now. Please check your connection and try again.');
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="v2-landing">


<a className="primai-skip-link" href="#primai-main-content">Skip to main content</a>


<div className="primai-landing">

  
  
  
  <header className="primai-header">
    <div className="primai-container primai-header__inner">
      <img
        className="primai-logo-img"
        src="/Asset%2016.svg"
        alt="PRIM AI Institute"
        width={234}
        height={49}
      />
      <a className="primai-btn primai-btn--primary primai-header__cta" href="#primai-registration">Enroll Now</a>
    </div>
  </header>

  <main id="primai-main-content">

    
    
    
    <section className="primai-section primai-hero" aria-label="Hero">
      <span className="primai-glow-orb primai-hero__glow-orb--a" aria-hidden="true"></span>
      <span className="primai-glow-orb primai-hero__glow-orb--b" aria-hidden="true"></span>

      <div className="primai-container primai-hero__inner">

        
        <div className="primai-hero__head">

          <span className="primai-badge primai-hero__badge">
            <span className="primai-hero__badge-dot" aria-hidden="true"></span>
            Learn AI in 10 Days
          </span>

          <h1 className="primai-heading-xl primai-hero__heading">
            AI Mastery Course
          </h1>

          <p className="primai-hero__tagline">
            <span className="primai-hero__tagline-word">Learn</span>
            <span className="primai-hero__tagline-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="primai-hero__tagline-word">Create</span>
            <span className="primai-hero__tagline-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="primai-hero__tagline-word">Earn</span>
          </p>

        </div>

        <div className="primai-hero__rest">

          <div className="primai-hero__tools">
            <span className="primai-body-sm primai-hero__tools-label">Tools You'll Master</span>
            <div className="primai-tool-marquee">
              <div className="primai-tool-track">
                <div className="primai-tool-group" role="list" aria-label="AI tools covered in the program">
                  <span className="primai-tool-item" role="listitem">
                    <span className="primai-tool-chip">
                      <img src="/logos/chatgpt.png" alt="ChatGPT" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">ChatGPT</span>
                  </span>
                  <span className="primai-tool-item" role="listitem">
                    <span className="primai-tool-chip">
                      <img src="/logos/claude.png" alt="Claude" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">Claude</span>
                  </span>
                  <span className="primai-tool-item" role="listitem">
                    <span className="primai-tool-chip">
                      <img src="/logos/gemini.png" alt="Gemini" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">Gemini</span>
                  </span>
                  <span className="primai-tool-item" role="listitem">
                    <span className="primai-tool-chip">
                      <img src="/logos/perplexity.png" alt="Perplexity" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">Perplexity</span>
                  </span>
                  <span className="primai-tool-item" role="listitem">
                    <span className="primai-tool-chip">
                      <img src="/logos/notebooklm.png" alt="NotebookLM" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">NotebookLM</span>
                  </span>
                  <span className="primai-tool-item" role="listitem">
                    <span className="primai-tool-chip">
                      <img src="/logos/midjourney.png" alt="Midjourney" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">Midjourney</span>
                  </span>
                  <span className="primai-tool-item" role="listitem">
                    <span className="primai-tool-chip">
                      <img src="/logos/n8n.png" alt="n8n" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">n8n</span>
                  </span>
                  <span className="primai-tool-item" role="listitem">
                    <span className="primai-tool-chip">
                      <img src="/logos/heygen.png" alt="HeyGen" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">HeyGen</span>
                  </span>
                  <span className="primai-tool-item" role="listitem">
                    <span className="primai-tool-chip">
                      <img src="/logos/gamma.png" alt="Gamma" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">Gamma</span>
                  </span>
                </div>
                
                <div className="primai-tool-group" role="presentation" aria-hidden="true">
                  <span className="primai-tool-item">
                    <span className="primai-tool-chip">
                      <img src="/logos/chatgpt.png" alt="" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">ChatGPT</span>
                  </span>
                  <span className="primai-tool-item">
                    <span className="primai-tool-chip">
                      <img src="/logos/claude.png" alt="" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">Claude</span>
                  </span>
                  <span className="primai-tool-item">
                    <span className="primai-tool-chip">
                      <img src="/logos/gemini.png" alt="" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">Gemini</span>
                  </span>
                  <span className="primai-tool-item">
                    <span className="primai-tool-chip">
                      <img src="/logos/perplexity.png" alt="" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">Perplexity</span>
                  </span>
                  <span className="primai-tool-item">
                    <span className="primai-tool-chip">
                      <img src="/logos/notebooklm.png" alt="" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">NotebookLM</span>
                  </span>
                  <span className="primai-tool-item">
                    <span className="primai-tool-chip">
                      <img src="/logos/midjourney.png" alt="" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">Midjourney</span>
                  </span>
                  <span className="primai-tool-item">
                    <span className="primai-tool-chip">
                      <img src="/logos/n8n.png" alt="" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">n8n</span>
                  </span>
                  <span className="primai-tool-item">
                    <span className="primai-tool-chip">
                      <img src="/logos/heygen.png" alt="" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">HeyGen</span>
                  </span>
                  <span className="primai-tool-item">
                    <span className="primai-tool-chip">
                      <img src="/logos/gamma.png" alt="" width="32" height="32" loading="eager" decoding="async" />
                    </span>
                    <span className="primai-tool-name">Gamma</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="primai-callout primai-hero__callout">
            <span className="primai-callout__icon" aria-hidden="true">💬</span>
            <p className="primai-callout__text">
              <strong className="primai-callout__question">10 din mein AI seekh sakte ho?</strong>
              Roz 1–1.5 ghanta sahi tarike se diya toh zaroor seekhoge - nahi seekha toh poora paisa wapas.
            </p>
          </div>

          <div className="primai-hero__price-row">
            <span className="primai-hero__price">&#8377;399</span>
            <span className="primai-hero__price-original">&#8377;2999</span>
          </div>

          <div className="primai-hero__actions">
            <a className="primai-btn primai-btn--primary primai-btn--lg" href="#primai-registration">
              Book My Seat - &#8377;399
            </a>
            <span className="primai-hero__rating">⭐⭐⭐⭐⭐ Rated by 5,000+ Learners</span>
          </div>

        </div>

        
        <div className="primai-hero__visual">
          <div className="primai-hero__video-frame">
            <div className="primai-hero__video-inner" id="primai-hero-video-frame">
              <div className="primai-hero__video-fallback" id="primai-hero-video-fallback" aria-hidden="true"></div>
              <video
                className="primai-hero-video"
                id="primai-hero-video"
                data-src="https://primaiinstitute.com/uploads/program/video/1784701615759-animate-hero-section-image-202607211543.mp4"
                muted={true}
                loop={true}
                playsInline={true}
                preload="none"
                aria-hidden="true">
              </video>
            </div>

            <span className="primai-hero__float-badge primai-hero__float-badge--guarantee">
              🛡️ 100% Money-Back Guarantee
            </span>

            <span className="primai-hero__float-badge primai-hero__float-badge--nocoding">
              🚫 No Coding
            </span>
          </div>
        </div>

      </div>
    </section>

    
    
    
    <section className="primai-section primai-overview" aria-label="Program overview">
      <div className="primai-container"></div>
    </section>

    
    <section className="primai-section primai-company-marquee" aria-label="Industries and companies AI skills apply to">
      <span className="primai-glow-orb primai-company-marquee__glow" aria-hidden="true"></span>

      <div className="primai-container">
        <div className="primai-section-head primai-section-head--center">
          <h2 className="primai-heading-md">Skills That Matter Across <span className="primai-gradient-text">Leading Companies</span></h2>
        </div>

        
        <p className="primai-sr-only">
          Industries where these AI skills apply include Google, Microsoft, Amazon, Adobe, Salesforce,
          TCS, Infosys, Accenture, Cognizant, Capgemini, HDFC Bank, ICICI Bank, Reliance Industries,
          Tata Motors, and Deloitte.
        </p>

        <div className="primai-company-rows" aria-hidden="true">

          
          <div className="primai-company-row primai-company-row--1">
            <div className="primai-company-track">
              <div className="primai-company-group">
                <span className="primai-company-chip">Google</span>
                <span className="primai-company-chip">Microsoft</span>
                <span className="primai-company-chip">Amazon</span>
                <span className="primai-company-chip">Adobe</span>
                <span className="primai-company-chip">Salesforce</span>
                <span className="primai-company-chip">TCS</span>
                <span className="primai-company-chip">Infosys</span>
                <span className="primai-company-chip">Accenture</span>
                <span className="primai-company-chip">Cognizant</span>
                <span className="primai-company-chip">Capgemini</span>
              </div>
              <div className="primai-company-group">
                <span className="primai-company-chip">Google</span>
                <span className="primai-company-chip">Microsoft</span>
                <span className="primai-company-chip">Amazon</span>
                <span className="primai-company-chip">Adobe</span>
                <span className="primai-company-chip">Salesforce</span>
                <span className="primai-company-chip">TCS</span>
                <span className="primai-company-chip">Infosys</span>
                <span className="primai-company-chip">Accenture</span>
                <span className="primai-company-chip">Cognizant</span>
                <span className="primai-company-chip">Capgemini</span>
              </div>
            </div>
          </div>

          
          <div className="primai-company-row primai-company-row--2">
            <div className="primai-company-track">
              <div className="primai-company-group">
                <span className="primai-company-chip">HDFC Bank</span>
                <span className="primai-company-chip">ICICI Bank</span>
                <span className="primai-company-chip">Reliance Industries</span>
                <span className="primai-company-chip">Tata Motors</span>
                <span className="primai-company-chip">Deloitte</span>
                <span className="primai-company-chip">Google</span>
                <span className="primai-company-chip">Microsoft</span>
                <span className="primai-company-chip">Amazon</span>
                <span className="primai-company-chip">Infosys</span>
                <span className="primai-company-chip">Accenture</span>
              </div>
              <div className="primai-company-group">
                <span className="primai-company-chip">HDFC Bank</span>
                <span className="primai-company-chip">ICICI Bank</span>
                <span className="primai-company-chip">Reliance Industries</span>
                <span className="primai-company-chip">Tata Motors</span>
                <span className="primai-company-chip">Deloitte</span>
                <span className="primai-company-chip">Google</span>
                <span className="primai-company-chip">Microsoft</span>
                <span className="primai-company-chip">Amazon</span>
                <span className="primai-company-chip">Infosys</span>
                <span className="primai-company-chip">Accenture</span>
              </div>
            </div>
          </div>

          
          <div className="primai-company-row primai-company-row--3">
            <div className="primai-company-track">
              <div className="primai-company-group">
                <span className="primai-company-chip">Salesforce</span>
                <span className="primai-company-chip">Adobe</span>
                <span className="primai-company-chip">Capgemini</span>
                <span className="primai-company-chip">Cognizant</span>
                <span className="primai-company-chip">TCS</span>
                <span className="primai-company-chip">Tata Motors</span>
                <span className="primai-company-chip">HDFC Bank</span>
                <span className="primai-company-chip">ICICI Bank</span>
                <span className="primai-company-chip">Reliance Industries</span>
                <span className="primai-company-chip">Microsoft</span>
              </div>
              <div className="primai-company-group">
                <span className="primai-company-chip">Salesforce</span>
                <span className="primai-company-chip">Adobe</span>
                <span className="primai-company-chip">Capgemini</span>
                <span className="primai-company-chip">Cognizant</span>
                <span className="primai-company-chip">TCS</span>
                <span className="primai-company-chip">Tata Motors</span>
                <span className="primai-company-chip">HDFC Bank</span>
                <span className="primai-company-chip">ICICI Bank</span>
                <span className="primai-company-chip">Reliance Industries</span>
                <span className="primai-company-chip">Microsoft</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    
    <section className="primai-section primai-build-section" aria-label="Everything you'll build in 10 days">
      <span className="primai-glow-orb primai-build-glow" aria-hidden="true"></span>
      <span className="primai-glow-orb primai-build-glow--pink" aria-hidden="true"></span>

      <div className="primai-container">
        <div className="primai-section-head">
          <h2 className="primai-heading-lg">Everything You'll Build in <span className="primai-gradient-text">10 Days</span></h2>
          
          <p className="primai-body-lg primai-build-lead">
            Yeh sirf theory nahi hai. Har project yahan tum khud AI se banaoge, live.
          </p>
        </div>

        <div className="primai-build-grid">

          <article className="primai-build-card">
            <span className="primai-build-number" aria-hidden="true">01</span>
            <div className="primai-build-media">
              <div className="primai-build-media-fallback" aria-hidden="true"></div>
              <video
                className="primai-build-video"
                data-src="https://primaiinstitute.com/uploads/program/video/1784626484564-your-personal-ai-assistant.mp4"
                muted={true} loop={true} playsInline={true} preload="none" aria-hidden="true"></video>
            </div>
            <h3 className="primai-build-title">Your Personal AI Assistant</h3>
            <p className="primai-build-desc">Jo aapke liye 24&times;7 smart kaam kare</p>
          </article>

          <article className="primai-build-card">
            <span className="primai-build-number" aria-hidden="true">02</span>
            <div className="primai-build-media">
              <div className="primai-build-media-fallback" aria-hidden="true"></div>
              <video
                className="primai-build-video"
                data-src="https://primaiinstitute.com/uploads/program/video/1784627601480-ats-optimized-ai-resume.mp4"
                muted={true} loop={true} playsInline={true} preload="none" aria-hidden="true"></video>
            </div>
            <h3 className="primai-build-title">ATS-Optimized AI Resume</h3>
            <p className="primai-build-desc">Aisa resume jo job shortlist hone ke chances badhaye</p>
          </article>

          <article className="primai-build-card">
            <span className="primai-build-number" aria-hidden="true">03</span>
            <div className="primai-build-media">
              <div className="primai-build-media-fallback" aria-hidden="true"></div>
              <video
                className="primai-build-video"
                data-src="https://primaiinstitute.com/uploads/program/video/1784627557362-viral-social-media-content.mp4"
                muted={true} loop={true} playsInline={true} preload="none" aria-hidden="true"></video>
            </div>
            <h3 className="primai-build-title">Viral Social Media Content</h3>
            <p className="primai-build-desc">AI se engaging posts aur videos create karein</p>
          </article>

          <article className="primai-build-card">
            <span className="primai-build-number" aria-hidden="true">04</span>
            <div className="primai-build-media">
              <div className="primai-build-media-fallback" aria-hidden="true"></div>
              <video
                className="primai-build-video"
                data-src="https://primaiinstitute.com/uploads/program/video/1784628480315-man-with-ai-avatar-in-202607211239.mp4"
                muted={true} loop={true} playsInline={true} preload="none" aria-hidden="true"></video>
            </div>
            <h3 className="primai-build-title">Professional AI Avatar Video</h3>
            <p className="primai-build-desc">Bina camera ke professional AI videos banayein</p>
          </article>

          <article className="primai-build-card">
            <span className="primai-build-number" aria-hidden="true">05</span>
            <div className="primai-build-media">
              <div className="primai-build-media-fallback" aria-hidden="true"></div>
              <video
                className="primai-build-video"
                data-src="https://primaiinstitute.com/uploads/program/video/1784628493829-monitor-with-analytics-and-growth-202607211433.mp4"
                muted={true} loop={true} playsInline={true} preload="none" aria-hidden="true"></video>
            </div>
            <h3 className="primai-build-title">High-Converting Landing Page</h3>
            <p className="primai-build-desc">Aisi website banayein jo visitors ko customers mein convert kare</p>
          </article>

          <article className="primai-build-card">
            <span className="primai-build-number" aria-hidden="true">06</span>
            <div className="primai-build-media">
              <img
                className="primai-build-image"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEReeCGiABMx1ZEmR4PbMdl9fnZdKHZdMzfEfGWRSvyiiF4eP7NhCq-kts811XIHm9-REb3K2lAxuFiHrhgd1G-Ps1Pr7FUMjjKeeZ9PXD7L47lzBOfadWVcACVViwpnIGvH5JjnJ96Goq2qzctEU8DRjqj9U4hBG2vVZFeJiZ78CMvJaisv0vwq7Hr_Mv3Lk9RNPIyByYaJpS12YeVomG42bceLUXtPbvMbVRoGmUsu8Ic-kN7Z0HBHhXqvzC_SNAukV1tNtP7Ow"
                alt="Data-driven AI presentation example"
                loading="lazy" decoding="async" />
            </div>
            <h3 className="primai-build-title">Data-Driven AI Presentations</h3>
            <p className="primai-build-desc">AI se professional presentations, reports aur insights banayein</p>
          </article>

        </div>
      </div>
    </section>

    
    <section className="primai-section primai-guarantee" aria-label="100% money-back guarantee">
      <span className="primai-glow-orb primai-guarantee-glow" aria-hidden="true"></span>

      <div className="primai-container primai-container--narrow primai-guarantee-inner">
        <img
          className="primai-guarantee-badge-img"
          src="https://freepngimg.com/download/moneyback/6-2-moneyback-free-png-image.png"
          alt="100% money-back guarantee badge"
          loading="lazy" decoding="async" />

        <span className="primai-guarantee-label">100% Money-Back Guarantee</span>

        <h2 className="primai-guarantee-title">
          6 Skills Nahi Aayi?<br />
          <span className="primai-guarantee-highlight">Paisa Wapas.</span>
        </h2>

        <p className="primai-guarantee-text">
          10-Day training ke baad agar aap ye 6 practical AI skills nahi kar paaye, toh 100% fees refund.
        </p>

        <span className="primai-guarantee-note">Learn it. Apply it. Or Get Your Money Back.</span>
      </div>
    </section>

    
    
    
    
    <section className="primai-section primai-plan" aria-label="Your day-by-day 10-day plan">
      <span className="primai-glow-orb primai-plan-glow" aria-hidden="true"></span>
      <span className="primai-glow-orb primai-plan-glow--2" aria-hidden="true"></span>

      <div className="primai-container">
        <div className="primai-section-head primai-section-head--center">
          <h2 className="primai-heading-lg">Your Day-by-Day <span className="primai-gradient-text">10-Day Plan</span></h2>
          <p className="primai-body-lg primai-plan-lead">
            Learn the tools. Master the skills. Build real AI outputs.
          </p>
        </div>

        
        <div className="primai-plan-overview">
          <div className="primai-plan-phase-pill primai-plan-phase-pill--1">
            <span className="primai-plan-phase-eyebrow">Phase 01</span>
            <span className="primai-plan-phase-days">Days 1-5</span>
            <span className="primai-plan-phase-desc">Master the AI toolkit</span>
          </div>

          <span className="primai-plan-overview-arrow" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>

          <div className="primai-plan-phase-pill primai-plan-phase-pill--2">
            <span className="primai-plan-phase-eyebrow">Phase 02</span>
            <span className="primai-plan-phase-days">Days 6-10</span>
            <span className="primai-plan-phase-desc">Build real outputs</span>
          </div>
        </div>

        
        <div className="primai-plan-phase-block primai-plan-phase-block--1">
          <div className="primai-plan-phase-header">
            <span className="primai-plan-phase-header-label">Phase 01</span>
            <span className="primai-plan-phase-header-sub">Days 1-5 &middot; Master the AI toolkit</span>
          </div>

          <div className="primai-plan-grid">

            <article className="primai-plan-card primai-plan-card--phase1" data-expanded="false">
              <div className="primai-plan-card-top">
                <span className="primai-plan-number" aria-hidden="true"><span className="primai-plan-number-label">Day</span><span className="primai-plan-number-value">01</span></span>
                <div className="primai-plan-card-body">
                  <div className="primai-plan-card-heading-row">
                    <h3 className="primai-plan-title">AI Foundations</h3>
                    <button type="button" className="primai-plan-expand-btn" aria-expanded="false" aria-label="Show more about Day 1">+</button>
                  </div>
                  <p className="primai-plan-desc">Understand AI, its evolution and where it's heading.</p>
                  <div className="primai-plan-details-wrapper">
                    <div className="primai-plan-details-inner">
                      <p className="primai-plan-details">You'll build a clear mental model of how modern AI works, how it's evolved, and where the industry is headed, so everything you learn after Day 1 has real context.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="primai-plan-card primai-plan-card--phase1" data-expanded="false">
              <div className="primai-plan-card-top">
                <span className="primai-plan-number" aria-hidden="true"><span className="primai-plan-number-label">Day</span><span className="primai-plan-number-value">02</span></span>
                <div className="primai-plan-card-body">
                  <div className="primai-plan-card-heading-row">
                    <h3 className="primai-plan-title">The Art of Prompting</h3>
                    <button type="button" className="primai-plan-expand-btn" aria-expanded="false" aria-label="Show more about Day 2">+</button>
                  </div>
                  <p className="primai-plan-desc">Learn how to write prompts that get better results.</p>
                  <div className="primai-plan-details-wrapper">
                    <div className="primai-plan-details-inner">
                      <p className="primai-plan-details">You'll practice structuring prompts clearly, giving the right context, and iterating on responses, the core skill every other day in the program builds on.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="primai-plan-card primai-plan-card--phase1" data-expanded="false">
              <div className="primai-plan-card-top">
                <span className="primai-plan-number" aria-hidden="true"><span className="primai-plan-number-label">Day</span><span className="primai-plan-number-value">03</span></span>
                <div className="primai-plan-card-body">
                  <div className="primai-plan-card-heading-row">
                    <h3 className="primai-plan-title">ChatGPT &amp; Claude Mastery</h3>
                    <button type="button" className="primai-plan-expand-btn" aria-expanded="false" aria-label="Show more about Day 3">+</button>
                  </div>
                  <p className="primai-plan-desc">Work smarter with ChatGPT and Claude.</p>
                  <div className="primai-plan-details-wrapper">
                    <div className="primai-plan-details-inner">
                      <p className="primai-plan-details">You'll go beyond basic chat and learn how to use these two assistants for real work: writing, research, analysis, and everyday problem-solving.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="primai-plan-card primai-plan-card--phase1" data-expanded="false">
              <div className="primai-plan-card-top">
                <span className="primai-plan-number" aria-hidden="true"><span className="primai-plan-number-label">Day</span><span className="primai-plan-number-value">04</span></span>
                <div className="primai-plan-card-body">
                  <div className="primai-plan-card-heading-row">
                    <h3 className="primai-plan-title">AI Image Creation</h3>
                    <button type="button" className="primai-plan-expand-btn" aria-expanded="false" aria-label="Show more about Day 4">+</button>
                  </div>
                  <p className="primai-plan-desc">Create visuals with modern AI image tools.</p>
                  <div className="primai-plan-details-wrapper">
                    <div className="primai-plan-details-inner">
                      <p className="primai-plan-details">You'll learn to generate and refine images with AI, useful for social posts, presentations, and any project that needs visuals fast.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="primai-plan-card primai-plan-card--phase1" data-expanded="false">
              <div className="primai-plan-card-top">
                <span className="primai-plan-number" aria-hidden="true"><span className="primai-plan-number-label">Day</span><span className="primai-plan-number-value">05</span></span>
                <div className="primai-plan-card-body">
                  <div className="primai-plan-card-heading-row">
                    <h3 className="primai-plan-title">AI Productivity Workflows</h3>
                    <button type="button" className="primai-plan-expand-btn" aria-expanded="false" aria-label="Show more about Day 5">+</button>
                  </div>
                  <p className="primai-plan-desc">Use AI to improve productivity and workflows.</p>
                  <div className="primai-plan-details-wrapper">
                    <div className="primai-plan-details-inner">
                      <p className="primai-plan-details">You'll close out the toolkit phase by connecting what you've learned into everyday workflows, so AI becomes a habit, not a one-off trick.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

          </div>
        </div>

        
        <div className="primai-plan-connector">
          <span className="primai-plan-connector-line" aria-hidden="true"></span>
          <span className="primai-plan-connector-label">Build Phase Starts</span>
          <span className="primai-plan-connector-line" aria-hidden="true"></span>
        </div>

        
        <div className="primai-plan-phase-block primai-plan-phase-block--2">
          <div className="primai-plan-phase-header">
            <span className="primai-plan-phase-header-label">Phase 02</span>
            <span className="primai-plan-phase-header-sub">Days 6-10 &middot; Build real outputs</span>
          </div>

          <div className="primai-plan-grid">

            <article className="primai-plan-card primai-plan-card--phase2" data-expanded="false">
              <div className="primai-plan-card-top">
                <span className="primai-plan-number" aria-hidden="true"><span className="primai-plan-number-label">Day</span><span className="primai-plan-number-value">06</span></span>
                <div className="primai-plan-card-body">
                  <div className="primai-plan-card-heading-row">
                    <h3 className="primai-plan-title">Build Your AI Assistant</h3>
                    <span className="primai-plan-badge">Project</span>
                    <button type="button" className="primai-plan-expand-btn" aria-expanded="false" aria-label="Show more about Day 6">+</button>
                  </div>
                  <p className="primai-plan-desc">Build your own practical AI assistant.</p>
                  <div className="primai-plan-details-wrapper">
                    <div className="primai-plan-details-inner">
                      <p className="primai-plan-details">Your first build day: you'll put Days 1-5 to work and walk away with a personal AI assistant you actually use.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="primai-plan-card primai-plan-card--phase2" data-expanded="false">
              <div className="primai-plan-card-top">
                <span className="primai-plan-number" aria-hidden="true"><span className="primai-plan-number-label">Day</span><span className="primai-plan-number-value">07</span></span>
                <div className="primai-plan-card-body">
                  <div className="primai-plan-card-heading-row">
                    <h3 className="primai-plan-title">Build Your AI Resume</h3>
                    <span className="primai-plan-badge">Project</span>
                    <button type="button" className="primai-plan-expand-btn" aria-expanded="false" aria-label="Show more about Day 7">+</button>
                  </div>
                  <p className="primai-plan-desc">Create an ATS-friendly AI-powered resume.</p>
                  <div className="primai-plan-details-wrapper">
                    <div className="primai-plan-details-inner">
                      <p className="primai-plan-details">You'll build a resume designed to actually get past applicant tracking systems, not just look good to a human.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="primai-plan-card primai-plan-card--phase2" data-expanded="false">
              <div className="primai-plan-card-top">
                <span className="primai-plan-number" aria-hidden="true"><span className="primai-plan-number-label">Day</span><span className="primai-plan-number-value">08</span></span>
                <div className="primai-plan-card-body">
                  <div className="primai-plan-card-heading-row">
                    <h3 className="primai-plan-title">Build Viral Content</h3>
                    <span className="primai-plan-badge">Project</span>
                    <button type="button" className="primai-plan-expand-btn" aria-expanded="false" aria-label="Show more about Day 8">+</button>
                  </div>
                  <p className="primai-plan-desc">Create engaging social media content with AI.</p>
                  <div className="primai-plan-details-wrapper">
                    <div className="primai-plan-details-inner">
                      <p className="primai-plan-details">You'll script, generate, and package social content built to catch attention in the first few seconds.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="primai-plan-card primai-plan-card--phase2" data-expanded="false">
              <div className="primai-plan-card-top">
                <span className="primai-plan-number" aria-hidden="true"><span className="primai-plan-number-label">Day</span><span className="primai-plan-number-value">09</span></span>
                <div className="primai-plan-card-body">
                  <div className="primai-plan-card-heading-row">
                    <h3 className="primai-plan-title">Build Your Landing Page</h3>
                    <span className="primai-plan-badge">Project</span>
                    <button type="button" className="primai-plan-expand-btn" aria-expanded="false" aria-label="Show more about Day 9">+</button>
                  </div>
                  <p className="primai-plan-desc">Build and launch your own landing page.</p>
                  <div className="primai-plan-details-wrapper">
                    <div className="primai-plan-details-inner">
                      <p className="primai-plan-details">You'll design and publish a real landing page built to convert visitors, using AI for both the copy and the layout.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="primai-plan-card primai-plan-card--phase2" data-expanded="false">
              <div className="primai-plan-card-top">
                <span className="primai-plan-number" aria-hidden="true"><span className="primai-plan-number-label">Day</span><span className="primai-plan-number-value">10</span></span>
                <div className="primai-plan-card-body">
                  <div className="primai-plan-card-heading-row">
                    <h3 className="primai-plan-title">Your AI Business Model</h3>
                    <span className="primai-plan-badge">Project</span>
                    <button type="button" className="primai-plan-expand-btn" aria-expanded="false" aria-label="Show more about Day 10">+</button>
                  </div>
                  <p className="primai-plan-desc">Bring everything together in your final AI business model.</p>
                  <div className="primai-plan-details-wrapper">
                    <div className="primai-plan-details-inner">
                      <p className="primai-plan-details">You'll close the program by tying every skill and project from the last 9 days into one final AI-powered business model.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

          </div>
        </div>

      </div>
    </section>

    
    
    
    <section className="primai-section primai-tools" aria-label="AI tools and technologies">
      <div className="primai-container"></div>
    </section>

    
    
    
    
    <section className="primai-section primai-live-training" aria-label="Why students love our live training">
      <span className="primai-glow-orb primai-live-glow" aria-hidden="true"></span>
      <span className="primai-glow-orb primai-live-glow--cyan" aria-hidden="true"></span>

      <div className="primai-container">
        <div className="primai-section-head primai-section-head--center">
          <span className="primai-live-eyebrow">Learn Live. Practice Live.</span>
          <h2 className="primai-heading-lg">Why Students Love Our <span className="primai-gradient-text">Live Training</span></h2>
          <p className="primai-body-lg primai-live-lead">
            Learn live, interact in real-time, and grow with expert guidance.
          </p>
        </div>

        <div className="primai-live-layout">

          
          <div className="primai-live-media">
            <div className="primai-live-video-frame">
              <div className="primai-live-video-inner" id="primai-live-video-frame">
                <div className="primai-live-video-fallback" id="primai-live-video-fallback" aria-hidden="true"></div>
                <video
                  className="primai-live-video"
                  id="primai-live-video"
                  data-src="https://primaiinstitute.com/uploads/program/video/1784630079829-live-class-interactive-sessions.mp4"
                  muted={true} loop={true} playsInline={true} preload="none" aria-hidden="true"></video>
              </div>
            </div>
          </div>

          
          <div className="primai-live-benefits">

            <div className="primai-live-benefit">
              <span className="primai-live-benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M8 20H16M12 16V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <div className="primai-live-benefit-body">
                <div className="primai-live-benefit-title-row">
                  <h3 className="primai-live-benefit-title">100% Live Instructor-Led Classes</h3>
                  <span className="primai-live-benefit-check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9.5 17.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <p className="primai-live-benefit-desc">Learn directly from experienced mentors in real time.</p>
              </div>
            </div>

            <div className="primai-live-benefit">
              <span className="primai-live-benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12c0 4-4 7-9 7-1 0-2-.1-2.9-.4L4 20l1.5-3.8C4.6 15 4 13.6 4 12c0-4 4-7 9-7s8 3 8 7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="primai-live-benefit-body">
                <div className="primai-live-benefit-title-row">
                  <h3 className="primai-live-benefit-title">Instant Doubt Solving</h3>
                  <span className="primai-live-benefit-check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9.5 17.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <p className="primai-live-benefit-desc">Ask questions and get answers immediately during class.</p>
              </div>
            </div>

            <div className="primai-live-benefit">
              <span className="primai-live-benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 9L4 12.5L8 16M16 9L20 12.5L16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.5 6L10.5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <div className="primai-live-benefit-body">
                <div className="primai-live-benefit-title-row">
                  <h3 className="primai-live-benefit-title">Hands-On Practical Learning</h3>
                  <span className="primai-live-benefit-check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9.5 17.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <p className="primai-live-benefit-desc">Practice on real-world projects with live guidance.</p>
              </div>
            </div>

            <div className="primai-live-benefit">
              <span className="primai-live-benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M10 8.5L15.5 12L10 15.5V8.5Z" fill="currentColor"/>
                </svg>
              </span>
              <div className="primai-live-benefit-body">
                <div className="primai-live-benefit-title-row">
                  <h3 className="primai-live-benefit-title">Class Recording Access</h3>
                  <span className="primai-live-benefit-check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9.5 17.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <p className="primai-live-benefit-desc">Revise every topic anytime after the session.</p>
              </div>
            </div>

            <div className="primai-live-benefit">
              <span className="primai-live-benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M3.5 19c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="17" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M15.5 13.2c2.3.4 4 2.3 4 5.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <div className="primai-live-benefit-body">
                <div className="primai-live-benefit-title-row">
                  <h3 className="primai-live-benefit-title">Personal Mentorship</h3>
                  <span className="primai-live-benefit-check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9.5 17.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <p className="primai-live-benefit-desc">Receive individual guidance throughout your learning journey.</p>
              </div>
            </div>

            <div className="primai-live-benefit">
              <span className="primai-live-benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="12" cy="12" r="1.2" fill="currentColor"/>
                </svg>
              </span>
              <div className="primai-live-benefit-body">
                <div className="primai-live-benefit-title-row">
                  <h3 className="primai-live-benefit-title">Career-Focused Training</h3>
                  <span className="primai-live-benefit-check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9.5 17.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <p className="primai-live-benefit-desc">Build job-ready skills with industry-relevant projects.</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>

    
    
    
    <section className="primai-section primai-learners" aria-label="Designed for every learner">
      <span className="primai-glow-orb primai-learners-glow" aria-hidden="true"></span>

      <div className="primai-container">
        <div className="primai-section-head primai-section-head--center">
          <h2 className="primai-heading-lg">Designed for <span className="primai-gradient-text">Every Learner</span></h2>
          <p className="primai-body-lg primai-learners-lead">
            Whether you're starting your career, growing your business, or looking to work smarter with AI.
          </p>
        </div>

        <div className="primai-learners-grid">

          <article className="primai-learner-card primai-learner-card--students">
            <span className="primai-learner-avatar-frame">
              <span className="primai-learner-avatar-inner">
                <img
                  className="primai-learner-avatar"
                  src="https://primaiinstitute.com/uploads/blog/avatar/1784536817930-fetched-1784536817902.webp"
                  alt="Students learner"
                  loading="lazy" decoding="async" />
              </span>
            </span>
            <h3 className="primai-learner-title">Students</h3>
            <p className="primai-learner-desc">Future-proof your career with in-demand AI skills.</p>
          </article>

          <article className="primai-learner-card primai-learner-card--professionals">
            <span className="primai-learner-avatar-frame">
              <span className="primai-learner-avatar-inner">
                <img
                  className="primai-learner-avatar"
                  src="https://primaiinstitute.com/uploads/blog/avatar/1784536915374-fetched-1784536915346.webp"
                  alt="Professional learner"
                  loading="lazy" decoding="async" />
              </span>
            </span>
            <h3 className="primai-learner-title">Professionals</h3>
            <p className="primai-learner-desc">Automate repetitive work and boost your productivity.</p>
          </article>

          <article className="primai-learner-card primai-learner-card--homemakers">
            <span className="primai-learner-avatar-frame">
              <span className="primai-learner-avatar-inner">
                <img
                  className="primai-learner-avatar"
                  src="https://primaiinstitute.com/uploads/blog/avatar/1784536989758-fetched-1784536989730.webp"
                  alt="Homemaker learner"
                  loading="lazy" decoding="async" />
              </span>
            </span>
            <h3 className="primai-learner-title">Homemakers</h3>
            <p className="primai-learner-desc">Learn practical AI skills and explore new earning opportunities.</p>
          </article>

          <article className="primai-learner-card primai-learner-card--business">
            <span className="primai-learner-avatar-frame">
              <span className="primai-learner-avatar-inner">
                <img
                  className="primai-learner-avatar"
                  src="https://primaiinstitute.com/uploads/blog/avatar/1784536721193-fetched-1784536721160.webp"
                  alt="Business owner learner"
                  loading="lazy" decoding="async" />
              </span>
            </span>
            <h3 className="primai-learner-title">Business Owners</h3>
            <p className="primai-learner-desc">Use AI to improve marketing, productivity and business growth.</p>
          </article>

        </div>
      </div>
    </section>

    
    <section className="primai-section primai-bonus" aria-label="Bonuses included with enrollment">
      <span className="primai-glow-orb primai-bonus-glow" aria-hidden="true"></span>
      <span className="primai-glow-orb primai-bonus-glow--pink" aria-hidden="true"></span>

      <div className="primai-container">
        <div className="primai-section-head primai-section-head--center">
          <span className="primai-bonus-eyebrow">Free With Enrollment</span>
          <h2 className="primai-heading-lg">Bonuses Worth <span className="primai-gradient-text">&#8377;20,000+</span></h2>
          <p className="primai-body-lg primai-bonus-lead">
            Get premium AI resources included with your program, at no extra cost.
          </p>
        </div>

        <div className="primai-bonus-grid">

          <article className="primai-bonus-card">
            <div className="primai-bonus-media">
              <div className="primai-bonus-media-fallback" aria-hidden="true"></div>
              <video
                className="primai-bonus-video"
                data-src="https://primaiinstitute.com/uploads/program/video/1784895612242-smartphone-floating-with-glowing----202607241746.mp4"
                muted={true} loop={true} playsInline={true} preload="none" aria-hidden="true"></video>
              <span className="primai-bonus-label" aria-hidden="true">Bonus 01</span>
            </div>
            <div className="primai-bonus-body">
              <h3 className="primai-bonus-title">AI Learning Portal</h3>
              <p className="primai-bonus-desc">Access recorded sessions, AI resources, templates, prompts and future course updates in one place.</p>
              <div className="primai-bonus-value">
                <span className="primai-bonus-worth">Worth &#8377;7,999</span>
                <span className="primai-bonus-free">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M5 13L9.5 17.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Included FREE with enrollment
                </span>
              </div>
            </div>
          </article>

          <article className="primai-bonus-card">
            <div className="primai-bonus-media">
              <div className="primai-bonus-media-fallback" aria-hidden="true"></div>
              <video
                className="primai-bonus-video"
                data-src="https://primaiinstitute.com/uploads/program/video/1784895731909-glowing-nodes-connecting-forming----202607241746.mp4"
                muted={true} loop={true} playsInline={true} preload="none" aria-hidden="true"></video>
              <span className="primai-bonus-label" aria-hidden="true">Bonus 02</span>
            </div>
            <div className="primai-bonus-body">
              <h3 className="primai-bonus-title">AI Workflow Templates</h3>
              <p className="primai-bonus-desc">Ready-to-use AI workflows for content, marketing, productivity and business tasks.</p>
              <div className="primai-bonus-value">
                <span className="primai-bonus-worth">Worth &#8377;4,999</span>
                <span className="primai-bonus-free">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M5 13L9.5 17.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Included FREE with enrollment
                </span>
              </div>
            </div>
          </article>

          <article className="primai-bonus-card">
            <div className="primai-bonus-media">
              <div className="primai-bonus-media-fallback" aria-hidden="true"></div>
              <video
                className="primai-bonus-video"
                data-src="https://primaiinstitute.com/uploads/program/video/1784895841095-cards-fanning-out-and-shuffling-202607241746.mp4"
                muted={true} loop={true} playsInline={true} preload="none" aria-hidden="true"></video>
              <span className="primai-bonus-label" aria-hidden="true">Bonus 03</span>
            </div>
            <div className="primai-bonus-body">
              <h3 className="primai-bonus-title">AI Prompt Library</h3>
              <p className="primai-bonus-desc">1000+ ready-to-use AI prompts for marketing, content, research, productivity and more.</p>
              <div className="primai-bonus-value">
                <span className="primai-bonus-worth">Worth &#8377;4,999</span>
                <span className="primai-bonus-free">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M5 13L9.5 17.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Included FREE with enrollment
                </span>
              </div>
            </div>
          </article>

          <article className="primai-bonus-card">
            <div className="primai-bonus-media">
              <div className="primai-bonus-media-fallback" aria-hidden="true"></div>
              <video
                className="primai-bonus-video"
                data-src="https://primaiinstitute.com/uploads/program/video/1784895874560-book-opening-releasing-glowing-p----202607241746.mp4"
                muted={true} loop={true} playsInline={true} preload="none" aria-hidden="true"></video>
              <span className="primai-bonus-label" aria-hidden="true">Bonus 04</span>
            </div>
            <div className="primai-bonus-body">
              <h3 className="primai-bonus-title">AI Career Roadmap</h3>
              <p className="primai-bonus-desc">Follow a step-by-step roadmap to learn AI skills and build an AI-powered career.</p>
              <div className="primai-bonus-value">
                <span className="primai-bonus-worth">Worth &#8377;2,999</span>
                <span className="primai-bonus-free">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M5 13L9.5 17.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Included FREE with enrollment
                </span>
              </div>
            </div>
          </article>

        </div>

        <div className="primai-bonus-banner">
          <span className="primai-bonus-banner-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12v9H4v-9M2 7h20v5H2V7ZM12 22V7M12 7c-1.5-3-6-4-6 0s4.5 3 6 0ZM12 7c1.5-3 6-4 6 0s-4.5 3-6 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="primai-bonus-banner-label">Total Bonus Value</span>
          <span className="primai-bonus-banner-value">&#8377;20,996</span>
          <span className="primai-bonus-banner-sub">Included FREE with your enrollment.</span>
        </div>

      </div>
    </section>

    
    
    
    <section className="primai-section primai-why-us" aria-label="Why PRIM AI Institute">
      <div className="primai-container"></div>
    </section>

    
    
    
    
    <section className="primai-section primai-testimonials" aria-label="Real stories from real beginners">
      <span className="primai-glow-orb primai-testimonials-glow" aria-hidden="true"></span>
      <span className="primai-glow-orb primai-testimonials-glow--pink" aria-hidden="true"></span>

      <div className="primai-container">
        <div className="primai-section-head primai-section-head--center">
          <h2 className="primai-heading-lg">Real Stories from <span className="primai-gradient-text">Real Beginners</span></h2>
          <p className="primai-body-lg primai-testimonials-lead">
            See how learners are using AI to work smarter, create more and grow.
          </p>
        </div>

        
        <div className="primai-testimonials-marquee">
          <div className="primai-testimonials-track">

            <div className="primai-testimonial-group">
              <article className="primai-testimonial-card">
                <span className="primai-testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
                <p className="primai-testimonial-quote">I never thought I could use AI at 40. Now I save 2 hours daily on my household management and side business!</p>
                <div className="primai-testimonial-footer">
                  <span className="primai-testimonial-avatar" aria-hidden="true">AS</span>
                  <div className="primai-testimonial-who">
                    <div className="primai-testimonial-name">Anjali Sharma</div>
                    <div className="primai-testimonial-profile">Homemaker &middot; Ahmedabad &middot; Batch 6</div>
                  </div>
                </div>
              </article>

              <article className="primai-testimonial-card">
                <span className="primai-testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
                <p className="primai-testimonial-quote">The hands-on projects made all the difference. I built my own personal assistant in just 10 days.</p>
                <div className="primai-testimonial-footer">
                  <span className="primai-testimonial-avatar" aria-hidden="true">RM</span>
                  <div className="primai-testimonial-who">
                    <div className="primai-testimonial-name">Rohan Mehta</div>
                    <div className="primai-testimonial-profile">Professional &middot; Ahmedabad &middot; Batch 6</div>
                  </div>
                </div>
              </article>

              <article className="primai-testimonial-card">
                <span className="primai-testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
                <p className="primai-testimonial-quote">I landed an internship because I could show real AI projects on my resume. Best &#8377;399 I ever spent.</p>
                <div className="primai-testimonial-footer">
                  <span className="primai-testimonial-avatar" aria-hidden="true">AP</span>
                  <div className="primai-testimonial-who">
                    <div className="primai-testimonial-name">Aryan Patel</div>
                    <div className="primai-testimonial-profile">Student &middot; Ahmedabad &middot; Batch 5</div>
                  </div>
                </div>
              </article>
            </div>

            
            <div className="primai-testimonial-group" aria-hidden="true">
              <article className="primai-testimonial-card">
                <span className="primai-testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
                <p className="primai-testimonial-quote">I never thought I could use AI at 40. Now I save 2 hours daily on my household management and side business!</p>
                <div className="primai-testimonial-footer">
                  <span className="primai-testimonial-avatar">AS</span>
                  <div className="primai-testimonial-who">
                    <div className="primai-testimonial-name">Anjali Sharma</div>
                    <div className="primai-testimonial-profile">Homemaker &middot; Ahmedabad &middot; Batch 6</div>
                  </div>
                </div>
              </article>

              <article className="primai-testimonial-card">
                <span className="primai-testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
                <p className="primai-testimonial-quote">The hands-on projects made all the difference. I built my own personal assistant in just 10 days.</p>
                <div className="primai-testimonial-footer">
                  <span className="primai-testimonial-avatar">RM</span>
                  <div className="primai-testimonial-who">
                    <div className="primai-testimonial-name">Rohan Mehta</div>
                    <div className="primai-testimonial-profile">Professional &middot; Ahmedabad &middot; Batch 6</div>
                  </div>
                </div>
              </article>

              <article className="primai-testimonial-card">
                <span className="primai-testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
                <p className="primai-testimonial-quote">I landed an internship because I could show real AI projects on my resume. Best &#8377;399 I ever spent.</p>
                <div className="primai-testimonial-footer">
                  <span className="primai-testimonial-avatar">AP</span>
                  <div className="primai-testimonial-who">
                    <div className="primai-testimonial-name">Aryan Patel</div>
                    <div className="primai-testimonial-profile">Student &middot; Ahmedabad &middot; Batch 5</div>
                  </div>
                </div>
              </article>
            </div>

          </div>
        </div>

        
        <div className="primai-testimonials-swipe" role="list" aria-label="Testimonials">

          <article className="primai-testimonial-card" role="listitem">
            <span className="primai-testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
            <p className="primai-testimonial-quote">I never thought I could use AI at 40. Now I save 2 hours daily on my household management and side business!</p>
            <div className="primai-testimonial-footer">
              <span className="primai-testimonial-avatar" aria-hidden="true">AS</span>
              <div className="primai-testimonial-who">
                <div className="primai-testimonial-name">Anjali Sharma</div>
                <div className="primai-testimonial-profile">Homemaker &middot; Ahmedabad &middot; Batch 6</div>
              </div>
            </div>
          </article>

          <article className="primai-testimonial-card" role="listitem">
            <span className="primai-testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
            <p className="primai-testimonial-quote">The hands-on projects made all the difference. I built my own personal assistant in just 10 days.</p>
            <div className="primai-testimonial-footer">
              <span className="primai-testimonial-avatar" aria-hidden="true">RM</span>
              <div className="primai-testimonial-who">
                <div className="primai-testimonial-name">Rohan Mehta</div>
                <div className="primai-testimonial-profile">Professional &middot; Ahmedabad &middot; Batch 6</div>
              </div>
            </div>
          </article>

          <article className="primai-testimonial-card" role="listitem">
            <span className="primai-testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
            <p className="primai-testimonial-quote">I landed an internship because I could show real AI projects on my resume. Best &#8377;399 I ever spent.</p>
            <div className="primai-testimonial-footer">
              <span className="primai-testimonial-avatar" aria-hidden="true">AP</span>
              <div className="primai-testimonial-who">
                <div className="primai-testimonial-name">Aryan Patel</div>
                <div className="primai-testimonial-profile">Student &middot; Ahmedabad &middot; Batch 5</div>
              </div>
            </div>
          </article>

        </div>

      </div>
    </section>

    
    
    
    <section className="primai-section primai-pricing" aria-label="Pricing">
      <div className="primai-container"></div>
    </section>

    
    
    
    
    <section className="primai-section primai-register" id="primai-registration" aria-label="Book your seat">
      <span className="primai-glow-orb primai-register-glow" aria-hidden="true"></span>
      <span className="primai-glow-orb primai-register-glow--pink" aria-hidden="true"></span>
      <span className="primai-register-watermark" aria-hidden="true">&#8377;399</span>

      <div className="primai-container primai-container--narrow">
        <div className="primai-section-head primai-section-head--center">
          <h2 className="primai-heading-lg">Book Your <span className="primai-gradient-text">&#8377;399</span> Seat</h2>
          <p className="primai-body-lg primai-register-lead">
            Secure your seat and start your AI learning journey.
          </p>
        </div>

        <div className="primai-register-card">
          <form className="primai-register-form" id="primai-register-form" noValidate onSubmit={handleSubmit}>

            <div className="primai-register-field" data-invalid={errors.name ? 'true' : 'false'}>
              <label className="primai-register-label" htmlFor="primai-register-name">Name</label>
              <div className="primai-register-input-wrap">
                <span className="primai-register-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M4.5 20c1.5-3.5 5-5 7.5-5s6 1.5 7.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <input className="primai-register-input" type="text" id="primai-register-name" name="name" placeholder="Enter your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} disabled={submitting} />
              </div>
              <span className="primai-register-error">{errors.name || 'Please enter your name.'}</span>
            </div>

            <div className="primai-register-field" data-invalid={errors.email ? 'true' : 'false'}>
              <label className="primai-register-label" htmlFor="primai-register-email">Email</label>
              <div className="primai-register-input-wrap">
                <span className="primai-register-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M4 7l8 6l8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <input className="primai-register-input" type="email" id="primai-register-email" name="email" placeholder="Enter your email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={submitting} />
              </div>
              <span className="primai-register-error">{errors.email || 'Please enter a valid email address.'}</span>
            </div>

            <div className="primai-register-field" data-invalid={errors.mobile ? 'true' : 'false'}>
              <label className="primai-register-label" htmlFor="primai-register-mobile">Mobile Number</label>
              <div className="primai-register-input-wrap">
                <span className="primai-register-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.5 3h3l1.5 4.5l-2 1.5a11 11 0 0 0 6 6l1.5-2l4.5 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2A2 2 0 0 1 6.5 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                </span>
                <input className="primai-register-input" type="tel" id="primai-register-mobile" name="mobile" placeholder="Enter number" inputMode="numeric" autoComplete="tel" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} disabled={submitting} />
              </div>
              <span className="primai-register-error">{errors.mobile || 'Please enter a valid 10-digit mobile number.'}</span>
            </div>

            <div className="primai-register-field" data-invalid={errors.city ? 'true' : 'false'}>
              <label className="primai-register-label" htmlFor="primai-register-city">City</label>
              <div className="primai-register-input-wrap">
                <span className="primai-register-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <input className="primai-register-input" type="text" id="primai-register-city" name="city" placeholder="Enter your city" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} disabled={submitting} />
              </div>
              <span className="primai-register-error">{errors.city || 'Please enter your city.'}</span>
            </div>

            <div className="primai-register-field" data-invalid={errors.role ? 'true' : 'false'}>
              <label className="primai-register-label" htmlFor="primai-register-role">I am a...</label>
              <select className="primai-register-select" id="primai-register-role" name="role" value={role} onChange={(e) => setRole(e.target.value)} disabled={submitting}>
                <option value="" disabled>Select...</option>
                {PROGRAM_ENROLLMENT_PROFILE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span className="primai-register-error">{errors.role || 'Please tell us who you are.'}</span>
            </div>

            <button type="submit" className="primai-btn primai-btn--primary primai-btn--lg primai-register-submit" disabled={submitting || done}>
              {done ? 'Seat Booked ✓' : submitting ? 'Booking…' : 'Book My Seat - ₹399'}
            </button>

            {submitError && (
              <p className="primai-register-trust" role="alert" style={{ color: '#ff8098' }}>{submitError}</p>
            )}
            {done && (
              <p className="primai-register-trust" role="status">
                Thank you! Our team will contact you on WhatsApp shortly.
              </p>
            )}
            {!submitError && !done && (
              <p className="primai-register-trust">Secure registration &bull; No spam</p>
            )}

          </form>
        </div>
      </div>
    </section>

    
    <section className="primai-section primai-payment-flow" aria-label="What happens after payment">
      <span className="primai-glow-orb primai-payment-flow-glow" aria-hidden="true"></span>
      <span className="primai-glow-orb primai-payment-flow-glow--cyan" aria-hidden="true"></span>

      <div className="primai-container">
        <div className="primai-section-head primai-section-head--center">
          <h2 className="primai-heading-lg">&#8377;399 Pay Karne Ke Baad <span className="primai-gradient-text">Kya Hoga?</span></h2>
          <p className="primai-body-lg primai-payment-flow-lead">
            Bas 4 simple steps, aur aap ready ho learning start karne ke liye.
          </p>
        </div>

        <div className="primai-payment-flow-track">

          <article className="primai-payment-step primai-payment-step--1">
            <div className="primai-payment-step-top">
              <span className="primai-payment-number" aria-hidden="true"><span className="primai-payment-number-label">Step</span><span className="primai-payment-number-value">01</span></span>
              <span className="primai-payment-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M7 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
            </div>
            <h3 className="primai-payment-title"><span className="primai-payment-price">&#8377;399</span>Pay Karo</h3>
            <p className="primai-payment-desc">Apni seat secure karo aur training ke liye registration complete karo.</p>
          </article>

          <article className="primai-payment-step primai-payment-step--2">
            <div className="primai-payment-step-top">
              <span className="primai-payment-number" aria-hidden="true"><span className="primai-payment-number-label">Step</span><span className="primai-payment-number-value">02</span></span>
              <span className="primai-payment-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
            </div>
            <h3 className="primai-payment-title">LMS Access</h3>
            <p className="primai-payment-desc">Payment ke baad aapko LMS access milega jahan se aap apni learning start kar sakte ho.</p>
          </article>

          <article className="primai-payment-step primai-payment-step--3">
            <div className="primai-payment-step-top">
              <span className="primai-payment-number" aria-hidden="true"><span className="primai-payment-number-label">Step</span><span className="primai-payment-number-value">03</span></span>
              <span className="primai-payment-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M17 9.5l4-2.5v8l-4-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                  <circle cx="6.5" cy="18" r="1" fill="currentColor"/>
                </svg>
              </span>
            </div>
            <h3 className="primai-payment-title">Live Training</h3>
            <p className="primai-payment-desc">Scheduled live sessions join karo aur trainer ke saath practical learning karo.</p>
          </article>

          <article className="primai-payment-step primai-payment-step--4">
            <div className="primai-payment-step-top">
              <span className="primai-payment-number" aria-hidden="true"><span className="primai-payment-number-label">Step</span><span className="primai-payment-number-value">04</span></span>
              <span className="primai-payment-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M10 8.5L15.5 12L10 15.5V8.5Z" fill="currentColor"/>
                </svg>
              </span>
            </div>
            <h3 className="primai-payment-title">1 Year Recording Access</h3>
            <p className="primai-payment-desc">Miss ho gayi class? Recordings ko 1 saal tak apne time aur speed par dekho.</p>
          </article>

        </div>
      </div>
    </section>

    
    
    
    <section className="primai-section primai-faq" aria-label="Frequently asked questions">
      <span className="primai-glow-orb primai-faq-glow" aria-hidden="true"></span>
      <span className="primai-glow-orb primai-faq-glow--pink" aria-hidden="true"></span>
      <span className="primai-faq-watermark" aria-hidden="true">FAQ</span>

      <div className="primai-container primai-container--narrow">
        <div className="primai-section-head primai-section-head--center">
          <span className="primai-faq-eyebrow">Payment Se Pehle</span>
          <h2 className="primai-heading-lg">Har sawaal ka <span className="primai-gradient-text">seedha jawaab.</span></h2>
          <p className="primai-body-lg primai-faq-lead">
            Training, payment, classes aur guarantee se jude common questions ke answers.
          </p>
        </div>

        <div className="primai-faq-list">

              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-1" id="primai-faq-question-1">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">Kya ye program bilkul beginners ke liye hai?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-1" role="region" aria-labelledby="primai-faq-question-1">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Haan, bilkul. AI ka pehle se knowledge hona zaroori nahi hai. Training basic level se start hogi.</p>
                  </div>
                </div>
              </div>
              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-2" id="primai-faq-question-2">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">Ye training kin logon ke liye hai?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-2" role="region" aria-labelledby="primai-faq-question-2">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Students, professionals, homemakers aur business owners jo AI ko practically use karna seekhna chahte hain.</p>
                  </div>
                </div>
              </div>
              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-3" id="primai-faq-question-3">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">Is training mein kaunse AI tools seekhenge?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-3" role="region" aria-labelledby="primai-faq-question-3">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Aap prompting, content creation, productivity, AI assistants, visual content, presentations aur bahut se practical AI tools seekhenge.</p>
                  </div>
                </div>
              </div>
              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-4" id="primai-faq-question-4">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">10 din mein kya kya seekhne ko milega?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-4" role="region" aria-labelledby="primai-faq-question-4">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Aap 6 practical AI skills seekhenge aur AI Assistant, AI Resume, Social Media Content, AI Avatar Video, Landing Page aur AI Presentation jaise real outputs par kaam karenge.</p>
                  </div>
                </div>
              </div>
              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-5" id="primai-faq-question-5">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">Class ka timing kya rahega?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-5" role="region" aria-labelledby="primai-faq-question-5">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Training live hogi aur aap registration ke time available batch mein se apna preferred timing select kar sakte hain.</p>
                  </div>
                </div>
              </div>
              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-6" id="primai-faq-question-6">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">Agar meri live class miss ho gayi toh?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-6" role="region" aria-labelledby="primai-faq-question-6">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Koi problem nahi. Aapko recordings ka 1 year access milega, jise aap baad mein apne time par dekh sakte hain.</p>
                  </div>
                </div>
              </div>
              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-7" id="primai-faq-question-7">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">Kya training complete karne par certificate milega?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-7" role="region" aria-labelledby="primai-faq-question-7">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Haan, training requirements complete karne ke baad certificate diya jayega.</p>
                  </div>
                </div>
              </div>
              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-8" id="primai-faq-question-8">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">Kya mujhe koi software ya tool kharidna padega?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-8" role="region" aria-labelledby="primai-faq-question-8">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Training start karne ke liye kisi special software ki zaroorat nahi hai. Agar kisi specific AI tool ka paid plan required hua toh training mein clearly bataya jayega.</p>
                  </div>
                </div>
              </div>

          <div className="primai-faq-more-group" id="primai-faq-more-group" data-open="false">
            <div className="primai-faq-more-inner">

              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-9" id="primai-faq-question-9">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">Kya training ke liye laptop zaroori hai?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-9" role="region" aria-labelledby="primai-faq-question-9">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Haan, practical activities ke liye laptop ya desktop aur stable internet connection recommended hai.</p>
                  </div>
                </div>
              </div>
              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-10" id="primai-faq-question-10">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">Training live hogi ya recorded?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-10" role="region" aria-labelledby="primai-faq-question-10">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Training live instructor-led hogi. Aap trainer se directly questions pooch sakte hain aur doubts clear kar sakte hain.</p>
                  </div>
                </div>
              </div>
              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-11" id="primai-faq-question-11">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">&#8377;399 pay karne ke baad kya hoga?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-11" role="region" aria-labelledby="primai-faq-question-11">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Payment ke baad aapko LMS access, live training details aur 1 year recording access milega.</p>
                  </div>
                </div>
              </div>
              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-12" id="primai-faq-question-12">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">Agar mujhe promised 6 practical AI skills nahi aayi toh?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-12" role="region" aria-labelledby="primai-faq-question-12">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Agar aap training requirements complete karne ke baad promised 6 practical AI skills perform nahi kar paate, toh 100% money-back guarantee applicable hogi.</p>
                  </div>
                </div>
              </div>
              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-13" id="primai-faq-question-13">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">Money-back guarantee kaise claim kar sakte hain?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-13" role="region" aria-labelledby="primai-faq-question-13">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Eligible learners guarantee ki required conditions complete karke defined process ke according refund claim kar sakte hain.</p>
                  </div>
                </div>
              </div>
              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-14" id="primai-faq-question-14">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">Kya main ye AI skills apne work ya business mein use kar sakta hoon?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-14" role="region" aria-labelledby="primai-faq-question-14">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Haan. Training mein seekhi skills ko work, business, content creation, productivity aur daily tasks mein practically use kiya ja sakta hai.</p>
                  </div>
                </div>
              </div>
              <div className="primai-faq-item" data-open="false">
                <button type="button" className="primai-faq-question" aria-expanded="false" aria-controls="primai-faq-answer-15" id="primai-faq-question-15">
                  <span className="primai-faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="primai-faq-question-text">Kya bina technical background ke AI seekh sakte hain?</span>
                  <span className="primai-faq-toggle-icon" aria-hidden="true">
                    <svg className="primai-faq-icon-plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="primai-faq-icon-minus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="primai-faq-answer-wrapper" id="primai-faq-answer-15" role="region" aria-labelledby="primai-faq-question-15">
                  <div className="primai-faq-answer-inner">
                    <p className="primai-faq-answer">Haan. Ye program beginner-friendly hai aur AI seekhne ke liye technical background zaroori nahi hai.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <button type="button" className="primai-faq-more-btn" id="primai-faq-more-btn" aria-expanded="false" aria-controls="primai-faq-more-group">
          <span className="primai-faq-more-btn-text">See More FAQs</span>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 9l6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

      </div>
    </section>

    
    
    
    <section className="primai-section primai-final-cta" aria-label="Final call to action">
      <span className="primai-glow-orb primai-final-cta-glow" aria-hidden="true"></span>
      <span className="primai-glow-orb primai-final-cta-glow--pink" aria-hidden="true"></span>
      <span className="primai-glow-orb primai-final-cta-glow--cyan" aria-hidden="true"></span>
      <span className="primai-final-cta-orb primai-final-cta-orb--1" aria-hidden="true"></span>
      <span className="primai-final-cta-orb primai-final-cta-orb--2" aria-hidden="true"></span>
      <span className="primai-final-cta-orb primai-final-cta-orb--3" aria-hidden="true"></span>
      <span className="primai-final-cta-watermark" aria-hidden="true">AI</span>

      <div className="primai-container primai-container--narrow">
        <div className="primai-final-cta-card">
          <span className="primai-final-cta-eyebrow">Ready to Start?</span>

          <h2 className="primai-final-cta-title">
            Learn AI. <span className="primai-gradient-text">Create with AI.</span> <span className="primai-gradient-text">Earn with AI.</span>
            <span className="primai-final-cta-title-line2">In Just 10 Days.</span>
          </h2>

          <p className="primai-final-cta-text">
            Join the live training and start building practical AI skills from Day 1.
          </p>

          <a className="primai-btn primai-btn--primary primai-btn--lg primai-final-cta-button" href="#primai-registration">
            Secure My Spot for &#8377;399 &rarr;
          </a>

          <div className="primai-final-cta-trust">
            <span className="primai-final-cta-trust-item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M5 13L9.5 17.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Live Training
            </span>
            <span className="primai-final-cta-trust-item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M5 13L9.5 17.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              1 Year Recording Access
            </span>
            <span className="primai-final-cta-trust-item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M5 13L9.5 17.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              100% Money-Back Guarantee
            </span>
          </div>
        </div>
      </div>
    </section>

  </main>

  
  
  
  <footer className="primai-footer" aria-label="Footer">
    <div className="primai-container primai-footer-inner">

      <div className="primai-footer-brand">
        <span className="primai-footer-brand-name">PRIM AI Institute</span>
        <p className="primai-footer-description">Learn practical AI skills. Build real things. Create new opportunities.</p>
      </div>

      <div className="primai-footer-contact">
        <a className="primai-footer-link" href="tel:+917573055577">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6.5 3h3l1.5 4.5l-2 1.5a11 11 0 0 0 6 6l1.5-2l4.5 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2A2 2 0 0 1 6.5 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
          </svg>
          75730 55577
        </a>
        <a className="primai-footer-link" href="https://wa.me/917573055577?text=Hi%2C%20I%27m%20interested%20in%20the%2010-Day%20AI%20Mastery%20Course.%20Please%20share%20more%20details." target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2l-3 .8l.8-2.9l-.2-.3A8 8 0 1 1 12 20Z"/>
            <path d="M16.6 13.4c-.3-.1-1.6-.8-1.8-.9c-.2-.1-.4-.1-.6.1c-.2.2-.6.9-.8 1.1c-.1.2-.3.2-.5.1c-.7-.3-1.4-.7-2-1.3c-.5-.5-1-1.1-1.4-1.8c-.1-.2 0-.4.1-.5c.1-.1.3-.3.4-.5c.1-.1.2-.3.2-.4c.1-.2 0-.4 0-.5c-.1-.1-.6-1.4-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3c-.7.7-1 1.5-1 2.4c.1 1.1.5 2.2 1.3 3.2c1.4 2 3.3 3.5 5.5 4.2c.6.2 1.1.4 1.7.5c.6.1 1.2.1 1.8 0c.7-.1 1.5-.6 1.8-1.3c.2-.4.2-.8.1-1.2c0-.1-.2-.2-.4-.3Z"/>
          </svg>
          WhatsApp Us
        </a>
      </div>

      <p className="primai-footer-bottom">&copy; 2026 PRIM AI Institute. All rights reserved.</p>

    </div>
  </footer>

  
  {/* The page's own WhatsApp float was removed: the site-wide <WhatsAppFloat />
      in App.tsx already renders on every route, so keeping this one showed
      two buttons stacked on top of each other. Its .primai-whatsapp-float
      styles remain in program-v2.css, unused and harmless. */}

  
  <div className="primai-sticky-cta">
    <a className="primai-btn primai-btn--primary primai-sticky-cta__btn" href="#primai-registration">
      Book My Seat - &#8377;399
      <span className="primai-sticky-cta__strike">&#8377;2999</span>
    </a>
  </div>

</div>



    </div>
  );
}
