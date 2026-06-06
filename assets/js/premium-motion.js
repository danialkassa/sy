/**
 * NINGBO SIYANG — PREMIUM MOTION ENGINE
 *
 * Systems:
 * 1. Parallax Scroll      — Lerp-smoothed scroll-linked translation
 * 2. Kinetic Typography   — Auto-split headings into animated lines/words
 * 3. Reveal Triggers      — IntersectionObserver hands off to CSS animations
 * 4. Magnetic Buttons     — Tactile hover attraction (desktop only)
 * 5. Auto-Enhancement     — Applies premium classes to existing DOM without HTML edits
 */

(function() {
  'use strict';

  if (window.__premiumMotionLoaded) return;
  window.__premiumMotionLoaded = true;

  const ENGINE = {
    state: {
      scrollY: 0,
      targetScrollY: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      raf: null
    },

    config: {
      parallaxSmoothing: 0.085,   /* Lerp factor — lower = heavier, more fluid */
      revealThreshold: 0.12,
      revealRootMargin: '0px 0px -50px 0px'
    },

    /* ── BOOT ───────────────────────────────── */
    init() {
      // ── Lenis Smooth Scroll ─────────────────
      if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
        });
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        // Expose globally so other scripts can use lenis.scrollTo()
        window.__lenis = lenis;
        console.log('%c[Premium Motion] Lenis smooth scroll active', 'color: #facc15;');
      }

      // ── Scroll Progress Bar ─────────────────
      const progressBar = document.getElementById('scroll-progress-bar');
      if (progressBar) {
        const updateProgress = () => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          progressBar.style.width = progress + '%';
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
      }

      // ── Additional Auto-Enhancements ────────
      this.enhanceSectionReveals();
      this.enhanceCounters();
      this.enhanceHeroGradient();

      this.enhanceHero();
      this.enhanceCards();
      this.enhanceButtons();
      this.enhanceLinks();
      this.enhanceParallaxLayers();
      this.initKineticTypography();
      this.initParallax();
      this.initRevealObserver();
      this.initMagneticButtons();
      this.bindEvents();
      this.startLoop();
      console.log('%c[Premium Motion] Engine started — physics-based motion active', 'color: #facc15; font-weight: bold;');
    },

    /* ── 1. AUTO-ENHANCE EXISTING DOM ───────── */

    enhanceHero() {
      const hero = document.getElementById('hero');
      if (!hero) return;

      /* Remove the generic fade-up class from hero elements so the built-in
         IntersectionObserver and GSAP don't fight our cinematic entrance.
         We preserve the original inline animation-delay so the stagger
         timing (0.3s → 0.6s → 1.2s) stays intact. */
      hero.querySelectorAll('.animate-fade-in-up').forEach((el) => {
        /* Skip the scroll indicator — it uses -translate-x-1/2 for centering,
           and pm-hero-enter's transform would override that offset. */
        if (el.classList.contains('-translate-x-1/2')) return;

        const originalDelay = parseFloat(el.style.animationDelay || 0);
        el.classList.remove('animate-fade-in-up');
        el.classList.add('pm-hero-text');
        /* Clear conflicting inline styles from the built-in observer */
        el.style.opacity = '';
        el.style.transform = '';
        el.style.transition = '';
        /* Preserve original delay; fallback to 0.3s if none existed */
        el.style.animationDelay = (originalDelay || 0.3) + 's';
      });

      /* The entire carousel container moves slower than scroll, creating
         separation from the hero text overlay. */
      const slides = document.getElementById('hero-slides');
      if (slides) slides.setAttribute('data-pm-parallax', '0.06');
    },

    enhanceCards() {
      /* Walk every grid item and locate the actual card surface (the element
         with background, border, or gradient). This avoids attaching the
         effect to tiny icon containers nested inside cards. */
      document.querySelectorAll('section .grid > div, section .grid > li').forEach(el => {
        const selfIsCard = el.matches('[class*="bg-zinc-8"], [class*="bg-zinc-9"], [class*="bg-gradient"], [class*="border"]');
        const card = selfIsCard ? el : (el.querySelector('[class*="bg-zinc-8"], [class*="bg-zinc-9"], [class*="bg-gradient"], [class*="border"]') || el);

        if (card.classList.contains('pm-card')) return;
        /* Skip tiny icon wrappers (w-10 / w-12 / w-14) that live inside real cards */
        if (card.matches('[class*="w-10"], [class*="w-12"], [class*="w-14"]')) return;

        card.classList.add('pm-card');

        const img = (selfIsCard ? el : card).querySelector('img');
        if (img) img.classList.add('pm-card-img');
      });
    },

    enhanceButtons() {
      document.querySelectorAll('button, a').forEach(btn => {
        const isCta = btn.classList.contains('bg-yellow-400') ||
                      btn.classList.contains('hover:bg-yellow-300') ||
                      btn.classList.contains('bg-zinc-800');
        const isNav = btn.closest('nav') || btn.closest('#mobile-menu-panel') || btn.closest('footer');
        /* Exclude icon-only square buttons (e.g., cart toggle) — the magnetic
           effect feels disorienting on elements with no text label. */
        const isIconOnly = btn.classList.contains('w-11') && !btn.textContent.trim();
        if (isCta && !isNav && !isIconOnly) btn.classList.add('pm-btn');
      });
    },

    enhanceLinks() {
      /* Footer and dropdown text links get the underline-grow treatment.
         We skip flex/block links (dropdown cards) so the pseudo-element
         underline doesn't land far below the text inside padded containers. */
      document.querySelectorAll('footer a, .dropdown-panel a').forEach(link => {
        if (link.classList.contains('flex') || link.classList.contains('block')) return;
        link.classList.add('pm-link');
      });
    },

    enhanceParallaxLayers() {
      /* Use-case background images scroll slower than their cards,
         making the cards feel like they float above the imagery. */
      document.querySelectorAll('#usecase-heading').forEach(heading => {
        const section = heading.closest('section');
        if (section) {
          section.querySelectorAll('.absolute.inset-0 > img').forEach(img => {
            img.setAttribute('data-pm-parallax', '0.1');
          });
        }
      });

      /* Trust badge icon containers (not the SVGs themselves) get a gentle bob */
      document.querySelectorAll('section .grid svg[class*="w-7"]').forEach((svg, i) => {
        const container = svg.closest('[class*="w-14"], [class*="w-12"], [class*="w-10"]');
        if (container) {
          container.classList.add('pm-ambient');
          container.style.animationDelay = (i * 0.2) + 's';
        }
      });
    },

    /* ── 2. KINETIC TYPOGRAPHY ──────────────── */

    initKineticTypography() {
      /* We limit guaranteed-visible kinetic typography to the hero h1.
         The hero is explicitly removed from GSAP control, so this animation
         will always play in front of the user. Other headings receive the
         blur-reveal treatment, which is less dependent on precise parent timing. */
      const heroH1 = document.querySelector('#hero h1');
      if (heroH1 && !heroH1.dataset.pmKinetic) {
        this.splitIntoKineticLines(heroH1);
        heroH1.dataset.pmKinetic = 'true';
      }

      /* Sub-headings (h3): soft blur reveal for elegance.
         These are subtle enough that even if they trigger while a GSAP parent
         is still at opacity:0, the user simply sees crisp text when the parent
         arrives — no visual glitch. */
      document.querySelectorAll('section h3.font-oswald').forEach((h, i) => {
        if (h.dataset.pmReveal) return;
        h.classList.add('pm-blur-reveal');
        h.style.animationDelay = (0.1 * (i % 4)) + 's';
        h.dataset.pmReveal = 'true';
      });
    },

    splitIntoKineticLines(element) {
      /* If the heading already contains child elements (color spans, etc.)
         we wrap the whole node in a single kinetic line so we don't
         destroy the existing HTML structure. */
      if (element.children.length > 0) {
        const wrapper = document.createElement('span');
        wrapper.className = 'pm-kinetic-line';
        wrapper.style.display = 'block';
        /* Base delay lets the parent container settle before text reveals */
        wrapper.style.animationDelay = '0.2s';
        wrapper.innerHTML = `<span>${element.innerHTML}</span>`;
        element.innerHTML = '';
        element.appendChild(wrapper);
        return;
      }

      /* Plain text headings: split into words for a cascading reveal.
         Word-level stagger is more reliable than true line-splitting
         in responsive layouts, and feels equally kinetic. */
      const words = element.textContent.trim().split(/\s+/);
      element.innerHTML = '';
      words.forEach((word, i) => {
        const line = document.createElement('span');
        line.className = 'pm-kinetic-line';
        /* 0.2s base delay + 0.05s per word creates a readable cascade */
        line.style.animationDelay = (0.2 + i * 0.05) + 's';
        line.innerHTML = `<span>${word}</span>`;
        element.appendChild(line);
        if (i < words.length - 1) {
          element.appendChild(document.createTextNode(' '));
        }
      });
    },

    /* ── 3. PARALLAX ENGINE ─────────────────── */

    initParallax() {
      this.parallaxItems = Array.from(document.querySelectorAll('[data-pm-parallax]')).map(el => ({
        el,
        speed: parseFloat(el.dataset.pmParallax) || 0.2
      }));
    },

    bindEvents() {
      window.addEventListener('scroll', () => {
        this.state.targetScrollY = window.scrollY;
      }, { passive: true });

      window.addEventListener('resize', () => {
        this.state.width = window.innerWidth;
        this.state.height = window.innerHeight;
      });
    },

    startLoop() {
      /* If no parallax items exist, don't burn rAF cycles. */
      if (!this.parallaxItems.length) return;

      const tick = () => {
        /* Lerp = linear interpolation. We don't snap to the exact scroll
           position; we chase it. This creates inertia — the visual layer
           feels like it has mass and momentum, not like it's mechanically
           locked to the scrollbar. */
        this.state.scrollY += (this.state.targetScrollY - this.state.scrollY) * this.config.parallaxSmoothing;
        this.updateParallax();
        this.state.raf = requestAnimationFrame(tick);
      };
      this.state.raf = requestAnimationFrame(tick);
    },

    updateParallax() {
      const sy = this.state.scrollY;
      this.parallaxItems.forEach(item => {
        const offset = sy * item.speed;
        /* translate3d forces GPU compositing, preventing paint thrash. */
        item.el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    },

    /* ── 4. REVEAL OBSERVER ─────────────────── */

    initRevealObserver() {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: this.config.revealThreshold,
        rootMargin: this.config.revealRootMargin
      });

      document.querySelectorAll('.pm-kinetic-line, .pm-mask-reveal, .pm-blur-reveal, .pm-clip-reveal, .pm-scale-reveal, .pm-slide-left, .pm-slide-right').forEach(el => {
        obs.observe(el);
      });
    },

    /* ── 5. MAGNETIC BUTTONS ────────────────── */

    initMagneticButtons() {
      /* Skip on touch devices — magnetic pull is disorienting without
         a cursor to provide spatial context. */
      if (window.matchMedia('(pointer: coarse)').matches) return;

      document.querySelectorAll('.pm-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          /* 0.25 multiplier keeps the movement subtle — the button
             "leans toward" the cursor rather than sticking to it. */
          btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px) scale(1.03)`;
        });

        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
          btn.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
          setTimeout(() => { btn.style.transition = ''; }, 600);
        });
      });
    },

    /* ── 6. SECTION REVEAL ENHANCEMENTS ────── */

    enhanceSectionReveals() {
      // Apply clip-path reveal to major sections
      document.querySelectorAll('section').forEach((section, i) => {
        // Skip hero and tiny sections
        if (section.id === 'hero' || section.offsetHeight < 200) return;
        // Alternate between clip-reveal and scale-reveal for variety
        const animClass = i % 3 === 0 ? 'pm-clip-reveal' : 'pm-scale-reveal';
        section.classList.add(animClass);
      });

      // Observe them
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

      document.querySelectorAll('.pm-clip-reveal, .pm-scale-reveal').forEach(el => {
        obs.observe(el);
      });
    },

    enhanceCounters() {
      // Add glow effect to stat counters
      document.querySelectorAll('[data-count-up]').forEach(counter => {
        counter.classList.add('pm-counter-glow');
      });
    },

    enhanceHeroGradient() {
      // Apply animated gradient to hero headline's yellow/accent text
      const heroH1 = document.querySelector('#hero h1');
      if (!heroH1) return;
      const yellowSpan = heroH1.querySelector('.text-yellow-400, .text-amber-400');
      if (yellowSpan) {
        yellowSpan.classList.remove('text-yellow-400', 'text-amber-400');
        yellowSpan.classList.add('pm-gradient-text');
      }
    }
  };

  /* Boot when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ENGINE.init());
  } else {
    ENGINE.init();
  }
})();
