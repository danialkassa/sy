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
      this.init3DTilt();
      this.init3DCarousel();
      this.init360Viewer();
      this.initPageTransitions();
      this.initProductLightbox();

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
    },

    // ── 3D Tilt Effect ──────────────────────
    init3DTilt() {
      document.querySelectorAll('.pm-3d-tilt').forEach(card => {
        const glare = card.querySelector('.pm-tilt-glare') || document.createElement('div');
        if (!glare.classList.contains('pm-tilt-glare')) {
          glare.classList.add('pm-tilt-glare');
          card.appendChild(glare);
        }

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          const rotateX = (0.5 - y) * 20;
          const rotateY = (x - 0.5) * 20;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
          card.style.setProperty('--tilt-x', (x * 100) + '%');
          card.style.setProperty('--tilt-y', (y * 100) + '%');
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
      });

      // Also apply tilt to dynamically loaded product cards
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              const cards = node.matches?.('.pm-product-card-3d') ? [node] :
                           (node.querySelectorAll ? node.querySelectorAll('.pm-product-card-3d') : []);
              cards.forEach(card => {
                if (!card.dataset.tiltInit) {
                  card.dataset.tiltInit = 'true';
                  const glare = document.createElement('div');
                  glare.classList.add('pm-tilt-glare');
                  card.classList.add('pm-3d-tilt');
                  card.appendChild(glare);

                  card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;
                    const rotateX = (0.5 - y) * 15;
                    const rotateY = (x - 0.5) * 15;
                    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
                    card.style.setProperty('--tilt-x', (x * 100) + '%');
                    card.style.setProperty('--tilt-y', (y * 100) + '%');
                  });

                  card.addEventListener('mouseleave', () => {
                    card.style.transform = '';
                  });
                }
              });
            }
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    },

    // ── 3D Carousel ─────────────────────────
    init3DCarousel() {
      const track = document.querySelector('.pm-3d-carousel-track');
      if (!track) return;

      const items = track.querySelectorAll('.pm-3d-carousel-item');
      const count = items.length;
      if (count === 0) return;

      const angle = 360 / count;
      const radius = Math.max(300, count * 50);

      items.forEach((item, i) => {
        item.style.transform = `rotateY(${angle * i}deg) translateZ(${radius}px)`;
      });

      // Start with auto-spin
      track.classList.add('pm-carousel-auto');

      // Drag + momentum state
      let isDragging = false;
      let hasInteracted = false;
      let startX = 0;
      let dragStartX = 0;
      let currentRotation = 0;
      const dragThreshold = 5; // px before drag starts

      // Momentum
      let velocity = 0;
      let lastX = 0;
      let lastTime = 0;
      let momentumRafId = null;
      const FRICTION = 0.92;
      const SNAP_THRESHOLD = 0.25; // deg/ms — below this, snap to card
      let rafPending = false;

      function captureAutoAngle() {
        track.classList.remove('pm-carousel-auto');
        const style = getComputedStyle(track);
        const matrix = style.transform;
        if (matrix && matrix !== 'none') {
          try {
            const dm = new DOMMatrix(matrix);
            currentRotation = Math.atan2(dm.m13, dm.m33) * (180 / Math.PI);
          } catch (ex) {
            const values = matrix.match(/matrix3d\((.+)\)/);
            if (values) {
              const parts = values[1].split(',').map(Number);
              currentRotation = Math.round(Math.atan2(parts[8], parts[10]) * (180 / Math.PI));
            }
          }
        }
        track.style.transform = `rotateY(${currentRotation}deg)`;
      }

      function snapToNearest() {
        const nearest = Math.round(currentRotation / angle) * angle;
        const diff = nearest - currentRotation;
        const duration = 400;
        let startTime = null;
        const startRot = currentRotation;

        function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

        function animateSnap(ts) {
          if (!startTime) startTime = ts;
          const progress = Math.min((ts - startTime) / duration, 1);
          currentRotation = startRot + diff * easeOutCubic(progress);
          track.style.transform = `rotateY(${currentRotation}deg)`;
          if (progress < 1) requestAnimationFrame(animateSnap);
        }
        requestAnimationFrame(animateSnap);
      }

      function momentumLoop() {
        if (Math.abs(velocity) < SNAP_THRESHOLD) {
          velocity = 0;
          momentumRafId = null;
          if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) snapToNearest();
          return;
        }
        velocity *= FRICTION;
        currentRotation += velocity;
        track.style.transform = `rotateY(${currentRotation}deg)`;
        momentumRafId = requestAnimationFrame(momentumLoop);
      }

      function stopMomentum() {
        if (momentumRafId) {
          cancelAnimationFrame(momentumRafId);
          momentumRafId = null;
        }
      }

      track.addEventListener('pointerdown', (e) => {
        stopMomentum();
        dragStartX = e.clientX;
        startX = e.clientX;
        lastX = e.clientX;
        lastTime = performance.now();
        velocity = 0;
        isDragging = false; // wait for threshold
        track.setPointerCapture(e.pointerId);

        // Stop auto-spin on first interaction
        if (!hasInteracted) {
          hasInteracted = true;
          captureAutoAngle();
        }

        // Hide hint
        const hint = document.getElementById('cms-spline-hint');
        if (hint) hint.style.opacity = '0';
      });

      track.addEventListener('pointermove', (e) => {
        if (!hasInteracted) return;

        // Threshold check
        if (!isDragging) {
          if (Math.abs(e.clientX - dragStartX) > dragThreshold) {
            isDragging = true;
            if (e.pointerType === 'touch') e.preventDefault(); // prevent page scroll while dragging
          } else {
            return;
          }
        }

        const now = performance.now();
        let dt = now - lastTime;
        if (dt < 1) dt = 1;

        velocity = ((e.clientX - lastX) / dt) * 16 * 0.45; // scale to ~60fps frame with friction

        lastX = e.clientX;
        lastTime = now;

        if (!rafPending) {
          rafPending = true;
          const capturedDx = e.clientX - startX;
          requestAnimationFrame(() => {
            currentRotation += capturedDx * 0.45;
            track.style.transform = `rotateY(${currentRotation}deg)`;
            startX = lastX;
            rafPending = false;
          });
        }
      });

      track.addEventListener('pointerup', () => {
        if (!isDragging && hasInteracted) {
          isDragging = false;
          return;
        }
        isDragging = false;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { snapToNearest(); return; }
        // Start momentum if velocity is above threshold
        if (Math.abs(velocity) > SNAP_THRESHOLD) {
          momentumRafId = requestAnimationFrame(momentumLoop);
        } else {
          snapToNearest();
        }
      });

      track.addEventListener('pointercancel', () => {
        isDragging = false;
        stopMomentum();
        snapToNearest();
      });

      // Prevent context menu on long press (mobile)
      track.addEventListener('contextmenu', (e) => { e.preventDefault(); });
    },

    // ── Page Transitions ─────────────────────
    initPageTransitions() {
      const curtain = document.getElementById('pm-curtain');
      if (!curtain) return;

      const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Entry animation — if we just arrived from a transition
      const fromTransition = sessionStorage.getItem('pm-transitioning');
      if (fromTransition) {
        sessionStorage.removeItem('pm-transitioning');
        if (!REDUCED) {
          curtain.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
          curtain.style.display = 'block';
          requestAnimationFrame(() => requestAnimationFrame(() => {
            curtain.classList.add('leaving');
            curtain.addEventListener('animationend', function handler() {
              curtain.style.display = 'none';
              curtain.classList.remove('leaving');
              curtain.style.clipPath = '';
              curtain.removeEventListener('animationend', handler);
            });
          }));
        }
      }

      // Intercept internal link clicks
      document.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (!target) return;

        const href = target.getAttribute('href');
        if (!href) return;

        // Exclude non-navigating links
        if (
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:') ||
          target.getAttribute('target') === '_blank' ||
          target.hasAttribute('data-no-transition') ||
          href === '' ||
          href.startsWith('javascript:')
        ) return;

        // Only same-origin links
        try {
          const url = new URL(href, window.location.origin);
          if (url.origin !== window.location.origin) return;
        } catch (ex) { return; }

        e.preventDefault();
        if (REDUCED) { window.location.href = href; return; }

        sessionStorage.setItem('pm-transitioning', '1');
        curtain.style.display = 'block';
        curtain.classList.add('entering');
        curtain.addEventListener('animationend', function handler() {
          window.location.href = href;
          curtain.removeEventListener('animationend', handler);
        });
      });
    },

    // ── Product Image Lightbox ───────────────
    initProductLightbox() {
      // Only activate on product detail pages
      const mainImg = document.getElementById('product-main-image');
      if (!mainImg) return;

      // Create lightbox overlay if not already in DOM
      let overlay = document.getElementById('pm-lightbox');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'pm-lightbox';
        overlay.className = 'pm-lightbox-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Product image lightbox');
        overlay.innerHTML =
          '<button class="pm-lightbox-arrow pm-lightbox-prev" id="lb-prev" aria-label="Previous image">&larr;</button>' +
          '<div class="pm-lightbox-img-wrap" id="lb-img-wrap">' +
            '<button class="pm-lightbox-close" id="lb-close" aria-label="Close lightbox">&times;</button>' +
            '<img id="lb-main-img" src="" alt="Product image" />' +
            '<div class="pm-zoom-indicator" id="lb-zoom-indicator">1&times;</div>' +
          '</div>' +
          '<button class="pm-lightbox-arrow pm-lightbox-next" id="lb-next" aria-label="Next image">&rarr;</button>' +
          '<div class="pm-lightbox-strip" id="lb-thumb-strip"></div>';
        document.body.appendChild(overlay);
      }

      const lbMainImg = document.getElementById('lb-main-img');
      const imgWrap = document.getElementById('lb-img-wrap');
      const thumbStrip = document.getElementById('lb-thumb-strip');
      const closeBtn = document.getElementById('lb-close');
      const prevBtn = document.getElementById('lb-prev');
      const nextBtn = document.getElementById('lb-next');
      const zoomIndicator = document.getElementById('lb-zoom-indicator');

      let currentIndex = 0;
      let zoomLevel = 1;
      const maxZoom = 3;
      let zoomHideTimer = null;

      // Collect all product images from the page
      function getImages() {
        const thumbs = document.querySelectorAll('.product-thumb img, #product-thumb-strip img');
        if (thumbs.length > 0) {
          return Array.from(thumbs).map(t => t.src || t.getAttribute('data-src'));
        }
        // Fallback: just the main image
        return [mainImg.src || mainImg.getAttribute('data-src')];
      }

      function buildThumbs(images) {
        if (!thumbStrip) return;
        thumbStrip.innerHTML = '';
        images.forEach((src, i) => {
          const thumb = document.createElement('div');
          thumb.className = 'pm-lightbox-thumb' + (i === currentIndex ? ' active' : '');
          thumb.innerHTML = '<img src="' + src + '" alt="View ' + (i + 1) + '" loading="lazy" />';
          thumb.addEventListener('click', () => goTo(i));
          thumbStrip.appendChild(thumb);
        });
      }

      function updateThumbs() {
        if (!thumbStrip) return;
        const thumbs = thumbStrip.querySelectorAll('.pm-lightbox-thumb');
        thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));
        const activeThumb = thumbStrip.children[currentIndex];
        if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }

      function showZoom() {
        if (zoomIndicator) {
          zoomIndicator.textContent = Math.round(zoomLevel * 10) / 10 + '\u00d7';
          zoomIndicator.classList.add('visible');
          clearTimeout(zoomHideTimer);
          zoomHideTimer = setTimeout(() => zoomIndicator.classList.remove('visible'), 1200);
        }
      }

      function setZoom(level) {
        zoomLevel = Math.min(maxZoom, Math.max(1, level));
        if (lbMainImg) lbMainImg.style.transform = 'scale(' + zoomLevel + ')';
        showZoom();
      }

      function goTo(idx) {
        const images = getImages();
        currentIndex = ((idx % images.length) + images.length) % images.length;
        zoomLevel = 1;
        if (lbMainImg) {
          lbMainImg.style.transform = 'scale(1)';
          lbMainImg.style.opacity = '0';
          lbMainImg.style.transition = 'opacity 0.2s ease';
          setTimeout(() => {
            lbMainImg.src = images[currentIndex];
            lbMainImg.onload = () => { lbMainImg.style.opacity = '1'; };
            if (lbMainImg.complete) lbMainImg.style.opacity = '1';
          }, 80);
        }
        updateThumbs();
      }

      function openLightbox(idx) {
        const images = getImages();
        currentIndex = idx;
        zoomLevel = 1;
        if (lbMainImg) {
          lbMainImg.style.transform = 'scale(1)';
          lbMainImg.src = images[idx];
        }
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        buildThumbs(images);
        updateThumbs();
      }

      function closeLightbox() {
        overlay.classList.remove('active');
        setTimeout(() => { document.body.style.overflow = ''; }, 200);
      }

      // Open on main product image click
      const mainWrap = mainImg.closest('.product-main-image-wrap, .overflow-hidden') || mainImg.parentElement;
      if (mainWrap && !mainWrap.dataset.lbBound) {
        mainWrap.dataset.lbBound = '1';
        mainWrap.style.cursor = 'zoom-in';
        mainWrap.addEventListener('click', () => openLightbox(0));
      }

      // Watch for CMS-injected content
      const observer = new MutationObserver(() => {
        const mainProductImg = document.getElementById('product-main-image');
        if (mainProductImg && !mainProductImg.dataset.lbBound) {
          mainProductImg.dataset.lbBound = '1';
          mainProductImg.style.cursor = 'zoom-in';
          mainProductImg.addEventListener('click', () => openLightbox(0));
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      // Close
      closeBtn && closeBtn.addEventListener('click', closeLightbox);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
      document.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
        if (e.key === 'ArrowRight') goTo(currentIndex + 1);
      });

      // Prev / Next buttons
      prevBtn && prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
      nextBtn && nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

      // Scroll-wheel zoom
      imgWrap && imgWrap.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.25 : 0.25;
        setZoom(zoomLevel + delta);
      }, { passive: false });

      // Swipe navigation with velocity tracking
      let swipeStartX = 0, swipeLastX = 0, swipeStartTime = 0, swipeActive = false;

      imgWrap && imgWrap.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        swipeStartX = e.clientX;
        swipeLastX = e.clientX;
        swipeStartTime = performance.now();
        swipeActive = true;
        imgWrap.setPointerCapture(e.pointerId);
      });

      imgWrap && imgWrap.addEventListener('pointermove', (e) => {
        if (!swipeActive) return;
        swipeLastX = e.clientX;
      });

      imgWrap && imgWrap.addEventListener('pointerup', () => {
        if (!swipeActive) return;
        swipeActive = false;
        const dx = swipeLastX - swipeStartX;
        const dt = performance.now() - swipeStartTime;
        const vel = Math.abs(dx / dt);
        if ((Math.abs(dx) > 50 && vel > 0.2) || Math.abs(dx) > 120) {
          if (dx < 0) goTo(currentIndex + 1);
          else goTo(currentIndex - 1);
        }
      });

      // Double-tap to zoom (touch only)
      let lastTap = 0;
      imgWrap && imgWrap.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'touch') return;
        const now = Date.now();
        if (now - lastTap < 300) setZoom(zoomLevel > 1 ? 1 : 2);
        lastTap = now;
      });

      // Pinch-to-zoom (pointer events)
      const pointers = new Map();
      let pinchDist0 = 0, pinchZoom0 = 1;

      overlay.addEventListener('pointerdown', (e) => {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      });

      overlay.addEventListener('pointermove', (e) => {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          const dist = Math.hypot(b.x - a.x, b.y - a.y);
          if (pinchDist0 === 0) { pinchDist0 = dist; pinchZoom0 = zoomLevel; return; }
          setZoom(pinchZoom0 * (dist / pinchDist0));
        }
      });

      overlay.addEventListener('pointerup', (e) => {
        pointers.delete(e.pointerId);
        if (pointers.size < 2) pinchDist0 = 0;
      });

      overlay.addEventListener('pointercancel', (e) => {
        pointers.delete(e.pointerId);
        if (pointers.size < 2) pinchDist0 = 0;
      });
    },

    // ── 360° Image Rotation Viewer ─────────
    init360Viewer() {
      document.querySelectorAll('.pm-360-viewer').forEach(viewer => {
        const images = viewer.querySelectorAll('img');
        if (images.length < 2) return;

        let currentIndex = 0;
        let isDragging = false;
        let startX = 0;
        let hasInteracted = false;

        // Show first image
        images[0].classList.add('pm-360-active');

        // Create dot indicators
        const ring = viewer.querySelector('.pm-360-ring');
        if (ring) {
          images.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('pm-360-dot');
            if (i === 0) dot.classList.add('pm-360-dot-active');
            ring.appendChild(dot);
          });
        }

        function showFrame(index) {
          images.forEach(img => img.classList.remove('pm-360-active'));
          images[index].classList.add('pm-360-active');
          currentIndex = index;

          // Update dots
          const dots = viewer.querySelectorAll('.pm-360-dot');
          dots.forEach((d, i) => d.classList.toggle('pm-360-dot-active', i === index));
        }

        viewer.addEventListener('pointerdown', (e) => {
          isDragging = true;
          startX = e.clientX;
          viewer.setPointerCapture(e.pointerId);

          // Hide hint
          if (!hasInteracted) {
            hasInteracted = true;
            const hint = viewer.querySelector('.pm-360-hint');
            if (hint) hint.style.opacity = '0';
          }
        });

        viewer.addEventListener('pointermove', (e) => {
          if (!isDragging) return;
          const diff = e.clientX - startX;
          if (Math.abs(diff) > 30) {
            const direction = diff > 0 ? 1 : -1;
            const nextIndex = (currentIndex + direction + images.length) % images.length;
            showFrame(nextIndex);
            startX = e.clientX;
          }
        });

        viewer.addEventListener('pointerup', () => { isDragging = false; });
        viewer.addEventListener('pointercancel', () => { isDragging = false; });

        // Auto-rotate slowly
        let autoInterval = setInterval(() => {
          if (!isDragging && !hasInteracted) {
            showFrame((currentIndex + 1) % images.length);
          }
        }, 2000);

        // Stop auto-rotate on first interaction
        viewer.addEventListener('pointerdown', () => {
          clearInterval(autoInterval);
        }, { once: true });
      });
    }
  };

  /* Boot when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ENGINE.init());
  } else {
    ENGINE.init();
  }
})();
