// @ts-nocheck -- verbatim port of the landing page's vanilla <script>.
// Kept byte-identical to the source (bar the excised register-form block)
// so the shipped, working DOM logic is not altered by retyping it. The
// checker objects only to untyped querySelector results (HTMLElement vs
// HTMLVideoElement) and null-guards the code already performs at runtime.
// Vanilla interactivity for the V2 landing page (/program/10-day-ai-v2).
//
// Ported verbatim from primai-landing-page-v2.html's <script>, with ONE
// deliberate omission: the original initPrimaiRegisterForm() block. That form
// is owned by React in TenDayAiV2.tsx so it can post to the real enrollment
// endpoint - leaving the vanilla validator in place would fight it.
//
// The original guarded on document.readyState === 'complete'; inside an SPA
// the load event has already fired by mount time, so each init runs
// immediately when this is called from useEffect.

export function initV2Effects(): void {
  const root = document.querySelector('.v2-landing');
  if (!root) return;
  // React StrictMode invokes effects twice in dev. These blocks bind click
  // handlers (FAQ accordion) that would double-fire, so bind only once per
  // mounted root - a remount creates a fresh element without the marker.
  if (root.getAttribute('data-v2-init') === '1') return;
  root.setAttribute('data-v2-init', '1');

  // Foundation JS scope - kept minimal on purpose.
  // No libraries loaded. Section-specific interactivity
  // (form handling, FAQ accordion, testimonial carousel,
  // batch picker, etc.) will be added as those sections
  // are built, each wrapped to avoid leaking globals.
  (function () {
    'use strict';

    /* ============================================
       HERO VIDEO - deferred / non-blocking load
       - No src is set until AFTER window 'load', so the
         video never competes with hero text/CTA/fonts.
       - IntersectionObserver only starts the download once
         the frame is actually in (or near) the viewport.
       - Fallback gradient stays visible until 'canplay',
         then cross-fades to the video.
       - If autoplay is blocked by the browser, the fallback
         gradient remains visible instead of a broken/blank
         video, so the hero still looks intentional.
       ============================================ */
    function initPrimaiHeroVideo() {
      var frame = document.getElementById('primai-hero-video-frame');
      var video = document.getElementById('primai-hero-video');
      var fallback = document.getElementById('primai-hero-video-fallback');

      if (!frame || !video || !fallback) return;

      var src = video.getAttribute('data-src');
      if (!src) return;

      var hasLoaded = false;

      function loadVideo() {
        if (hasLoaded) return;
        hasLoaded = true;

        video.setAttribute('src', src);
        video.load();

        video.addEventListener('canplay', function onCanPlay() {
          video.classList.add('primai-is-visible');
          fallback.classList.add('primai-is-hidden');
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              /* Autoplay blocked: fallback gradient already
                 shown, so nothing further to do here. */
            });
          }
          video.removeEventListener('canplay', onCanPlay);
        });
      }

      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              loadVideo();
              observer.disconnect();
            }
          });
        }, { rootMargin: '200px 0px' });

        observer.observe(frame);
      } else {
        /* No IntersectionObserver support: fall back to a
           simple deferred load after window load. */
        loadVideo();
      }
    }

    if (document.readyState === 'complete') {
      initPrimaiHeroVideo();
    } else {
      window.addEventListener('load', initPrimaiHeroVideo);
    }
  })();

  /* ============================================
     "EVERYTHING YOU'LL BUILD" SECTION - lazy video grid
     Fully isolated from the hero video logic above and
     from any other page script. Each <video> in this
     section starts with no src (preload="none"), only
     gets one assigned when it approaches the viewport,
     and pauses (without dropping the src) once it
     scrolls significantly out of view, resuming on
     return. No globals leak outside this IIFE.
     ============================================ */
  (function () {
    'use strict';

    function initPrimaiBuildVideos() {
      var section = document.querySelector('.primai-build-section');
      if (!section) return;

      var cards = section.querySelectorAll('.primai-build-video');
      if (!cards.length) return;

      function loadAndPlay(video) {
        var src = video.getAttribute('data-src');
        var fallback = video.parentElement.querySelector('.primai-build-media-fallback');

        if (src && !video.getAttribute('src')) {
          video.setAttribute('src', src);
          video.load();

          video.addEventListener('canplay', function onCanPlay() {
            video.classList.add('primai-is-visible');
            if (fallback) fallback.classList.add('primai-is-hidden');
            attemptPlay(video);
            video.removeEventListener('canplay', onCanPlay);
          });
        } else if (video.getAttribute('src')) {
          /* Already loaded from an earlier viewport visit -
             just resume playback, don't re-download. */
          attemptPlay(video);
        }
      }

      function attemptPlay(video) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            /* Autoplay blocked: the gradient fallback behind
               the video is still visible, so the card still
               looks intentional rather than broken. */
          });
        }
      }

      function pauseVideo(video) {
        if (!video.paused) video.pause();
      }

      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              loadAndPlay(entry.target);
            } else {
              pauseVideo(entry.target);
            }
          });
        }, { rootMargin: '200px 0px', threshold: 0.25 });

        cards.forEach(function (video) {
          observer.observe(video);
        });
      } else {
        /* No IntersectionObserver support: load everything
           once, after window load, rather than not at all. */
        cards.forEach(loadAndPlay);
      }
    }

    if (document.readyState === 'complete') {
      initPrimaiBuildVideos();
    } else {
      window.addEventListener('load', initPrimaiBuildVideos);
    }
  })();

  /* ============================================
     DAY-BY-DAY PLAN - expand/collapse ("+") cards
     Fully isolated. Uses the CSS grid-template-rows
     0fr/1fr trick for a smooth height animation
     without measuring anything in JS.
     ============================================ */
  (function () {
    'use strict';

    var cards = document.querySelectorAll('.primai-plan-card');

    cards.forEach(function (card) {
      var btn = card.querySelector('.primai-plan-expand-btn');
      if (!btn) return;

      btn.addEventListener('click', function () {
        var isExpanded = card.getAttribute('data-expanded') === 'true';
        card.setAttribute('data-expanded', String(!isExpanded));
        btn.setAttribute('aria-expanded', String(!isExpanded));
      });
    });
  })();

  /* ============================================
     "WHY STUDENTS LOVE OUR LIVE TRAINING" video
     Fully isolated from every other video module on
     the page. Lazy-loads via IntersectionObserver,
     autoplays muted once ready, pauses when scrolled
     far out of view (source is kept, not dropped, so
     it resumes instantly on return), and animates the
     benefit cards into view as they scroll in.
     ============================================ */
  (function () {
    'use strict';

    function initPrimaiLiveTraining() {
      var frame = document.getElementById('primai-live-video-frame');
      var video = document.getElementById('primai-live-video');
      var fallback = document.getElementById('primai-live-video-fallback');
      var benefits = document.querySelectorAll('.primai-live-benefit');

      if (video && frame) {
        var src = video.getAttribute('data-src');

        function loadAndPlay() {
          if (!video.getAttribute('src') && src) {
            video.setAttribute('src', src);
            video.load();

            video.addEventListener('canplay', function onCanPlay() {
              video.classList.add('primai-is-visible');
              if (fallback) fallback.classList.add('primai-is-hidden');
              attemptPlay();
              video.removeEventListener('canplay', onCanPlay);
            });
          } else if (video.getAttribute('src')) {
            attemptPlay();
          }
        }

        function attemptPlay() {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              /* Autoplay blocked: fallback gradient stays visible. */
            });
          }
        }

        if ('IntersectionObserver' in window) {
          var videoObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                loadAndPlay();
              } else if (!video.paused) {
                video.pause();
              }
            });
          }, { rootMargin: '200px 0px', threshold: 0.25 });

          videoObserver.observe(frame);
        } else {
          loadAndPlay();
        }
      }

      if (benefits.length && 'IntersectionObserver' in window) {
        var benefitObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('primai-is-in-view');
              benefitObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 });

        benefits.forEach(function (benefit, index) {
          benefit.style.transitionDelay = (index * 60) + 'ms';
          benefitObserver.observe(benefit);
        });
      } else {
        benefits.forEach(function (benefit) {
          benefit.classList.add('primai-is-in-view');
        });
      }
    }

    if (document.readyState === 'complete') {
      initPrimaiLiveTraining();
    } else {
      window.addEventListener('load', initPrimaiLiveTraining);
    }
  })();

  /* ============================================
     "BONUSES WORTH ₹20,000+" - lazy video cards
     Fully isolated from every other video module on
     the page (hero, build grid, live-training). Only
     targets the 4 videos inside .primai-bonus.
     ============================================ */
  (function () {
    'use strict';

    function initPrimaiBonusVideos() {
      var section = document.querySelector('.primai-bonus');
      if (!section) return;

      var videos = section.querySelectorAll('.primai-bonus-video');
      if (!videos.length) return;

      function loadAndPlay(video) {
        var src = video.getAttribute('data-src');
        var fallback = video.parentElement.querySelector('.primai-bonus-media-fallback');

        if (src && !video.getAttribute('src')) {
          video.setAttribute('src', src);
          video.load();

          video.addEventListener('canplay', function onCanPlay() {
            video.classList.add('primai-is-visible');
            if (fallback) fallback.classList.add('primai-is-hidden');
            attemptPlay(video);
            video.removeEventListener('canplay', onCanPlay);
          });
        } else if (video.getAttribute('src')) {
          attemptPlay(video);
        }
      }

      function attemptPlay(video) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            /* Autoplay blocked: gradient fallback stays visible. */
          });
        }
      }

      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              loadAndPlay(entry.target);
            } else if (!entry.target.paused) {
              entry.target.pause();
            }
          });
        }, { rootMargin: '200px 0px', threshold: 0.25 });

        videos.forEach(function (video) {
          observer.observe(video);
        });
      } else {
        videos.forEach(loadAndPlay);
      }
    }

    if (document.readyState === 'complete') {
      initPrimaiBonusVideos();
    } else {
      window.addEventListener('load', initPrimaiBonusVideos);
    }
  })();

  /* ============================================
     "PAYMENT KE BAAD KYA HOGA?" - scroll-reveal
     Fully isolated. Fades/slides each step up as it
     enters the viewport, staggered slightly.
     ============================================ */
  (function () {
    'use strict';

    function initPrimaiPaymentFlow() {
      var steps = document.querySelectorAll('.primai-payment-step');
      if (!steps.length) return;

      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('primai-is-in-view');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 });

        steps.forEach(function (step, index) {
          step.style.transitionDelay = (index * 80) + 'ms';
          observer.observe(step);
        });
      } else {
        steps.forEach(function (step) {
          step.classList.add('primai-is-in-view');
        });
      }
    }

    if (document.readyState === 'complete') {
      initPrimaiPaymentFlow();
    } else {
      window.addEventListener('load', initPrimaiPaymentFlow);
    }
  })();

  /* ============================================
     FAQ SECTION - accordion + "See More" reveal
     Fully isolated. Only one FAQ open at a time
     (opening one closes any other open item). The
     hidden FAQs 9-15 expand/collapse via the same
     CSS grid-template-rows trick used elsewhere on
     this page, so no height is measured in JS.
     ============================================ */
  (function () {
    'use strict';

    function initPrimaiFaq() {
      var faqSection = document.querySelector('.primai-faq');
      if (!faqSection) return;

      var items = faqSection.querySelectorAll('.primai-faq-item');

      items.forEach(function (item) {
        var btn = item.querySelector('.primai-faq-question');
        if (!btn) return;

        btn.addEventListener('click', function () {
          var isOpen = item.getAttribute('data-open') === 'true';

          /* Close every other open item first (single-open accordion). */
          items.forEach(function (other) {
            if (other !== item) {
              other.setAttribute('data-open', 'false');
              var otherBtn = other.querySelector('.primai-faq-question');
              if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            }
          });

          item.setAttribute('data-open', String(!isOpen));
          btn.setAttribute('aria-expanded', String(!isOpen));
        });
      });

      var moreBtn = document.getElementById('primai-faq-more-btn');
      var moreGroup = document.getElementById('primai-faq-more-group');
      var moreBtnText = moreBtn ? moreBtn.querySelector('.primai-faq-more-btn-text') : null;

      if (moreBtn && moreGroup) {
        moreBtn.addEventListener('click', function () {
          var isOpen = moreGroup.getAttribute('data-open') === 'true';
          moreGroup.setAttribute('data-open', String(!isOpen));
          moreBtn.setAttribute('aria-expanded', String(!isOpen));
          if (moreBtnText) {
            moreBtnText.textContent = isOpen ? 'See More FAQs' : 'Show Less';
          }

          /* Collapsing the group while one of its FAQs is open would
             otherwise leave that FAQ's own answer stuck expanded
             underneath a zero-height parent - close them all first. */
          if (isOpen) {
            var hiddenItems = moreGroup.querySelectorAll('.primai-faq-item');
            hiddenItems.forEach(function (item) {
              item.setAttribute('data-open', 'false');
              var itemBtn = item.querySelector('.primai-faq-question');
              if (itemBtn) itemBtn.setAttribute('aria-expanded', 'false');
            });
          }
        });
      }
    }

    if (document.readyState === 'complete') {
      initPrimaiFaq();
    } else {
      window.addEventListener('load', initPrimaiFaq);
    }
  })();

}
