/**
 * Anime.js Animations — Universal scroll reveals + micro-interactions
 * Ningbo Siyang Tools — Public Website
 *
 * ARCHITECTURE:
 * 1. UNIVERSAL SCROLL REVEAL — Auto-animates headings, cards, images, paragraphs
 *    on ALL pages without needing .animate-fade-in-up class.
 * 2. STAGGER GRIDS — Cards stagger in with bounce easing.
 * 3. HERO — Cinematic headline + CTA entrance.
 * 4. MICRO-INTERACTIONS — Button hover, dropdown, FAQ, quote cart.
 *
 * SAFETY:
 * • Respects data-gsap-managed (GSAP ownership).
 * • Respects pm-hero-text, pm-blur-reveal (Premium Motion ownership).
 * • If anime.js is absent, elements stay visible (no opacity:0 lock).
 */
(function() {
  'use strict';

  if (typeof anime === 'undefined') return;

  function isOwned(el) {
    return el.hasAttribute('data-gsap-managed') ||
           el.classList.contains('pm-hero-text') ||
           el.classList.contains('pm-blur-reveal') ||
           el.classList.contains('pm-mask-reveal') ||
           el.classList.contains('pm-kinetic-line') ||
           el.classList.contains('pm-ambient') ||
           el.closest('.pm-kinetic-line') ||
           el.hasAttribute('data-pm-parallax');
  }

  function whenVisible(selector, callback, options) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    var opts = Object.assign({ threshold: 0.08, rootMargin: '0px 0px -30px 0px' }, options || {});
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          if (isOwned(entry.target)) return;
          callback(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, opts);
    els.forEach(function(el) { obs.observe(el); });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 1. UNIVERSAL SCROLL REVEAL
   * Automatically animates key elements on ALL pages.
   * No .animate-fade-in-up class needed — works out of the box.
   * ═══════════════════════════════════════════════════════════════════════════ */

  /* 1a. Section headings — dramatic slide-up reveal */
  whenVisible('section h1, section h2', function(el) {
    if (el.classList.contains('no-animate')) return;
    anime({
      targets: el,
      opacity: [0, 1],
      translateY: [40, 0],
      easing: 'easeOutExpo',
      duration: 900,
      delay: 100
    });
  });

  /* 1b. Section paragraphs — gentle fade-in */
  whenVisible('section p', function(el) {
    if (el.closest('nav') || el.closest('footer')) return;
    anime({
      targets: el,
      opacity: [0, 1],
      translateY: [20, 0],
      easing: 'easeOutCubic',
      duration: 700,
      delay: 150
    });
  });

  /* 1c. Section images — scale-up reveal */
  whenVisible('section img', function(el) {
    if (el.closest('nav') || el.closest('footer') || el.classList.contains('pm-card-img')) return;
    if (el.closest('.pm-card')) return;
    anime({
      targets: el,
      opacity: [0, 1],
      scale: [0.92, 1],
      easing: 'easeOutCubic',
      duration: 800,
      delay: 100
    });
  });

  /* 1d. Legacy .animate-fade-in-up support */
  whenVisible('.animate-fade-in-up', function(el) {
    el.classList.add('is-visible');
    anime({
      targets: el,
      opacity: [0, 1],
      translateY: [30, 0],
      easing: 'easeOutCubic',
      duration: 700,
      delay: parseFloat(el.style.animationDelay || 0) * 1000 || 0
    });
  });

  /* ═══════════════════════════════════════════════════════════════════════════
   * 2. STAGGERED GRID REVEALS
   * ═══════════════════════════════════════════════════════════════════════════ */

  function staggerReveal(containerSelector, childSelector) {
    var containers = document.querySelectorAll(containerSelector);
    containers.forEach(function(container) {
      var children = container.querySelectorAll(childSelector);
      if (!children.length) return;
      var allOwned = Array.from(children).every(function(c) { return isOwned(c); });
      if (allOwned) return;

      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var animeChildren = Array.from(children).filter(function(c) { return !isOwned(c); });
            if (!animeChildren.length) return;
            anime({
              targets: animeChildren,
              opacity: [0, 1],
              translateY: [50, 0],
              scale: [0.92, 1],
              easing: 'easeOutBack',
              duration: 700,
              delay: anime.stagger(100, {start: 80})
            });
            obs.unobserve(container);
          }
        });
      }, { threshold: 0.05 });
      obs.observe(container);
    });
  }

  staggerReveal('#products-grid', ':scope > div');
  staggerReveal('.grid', ':scope > div');
  staggerReveal('.grid', ':scope > li');
  staggerReveal('.grid', '.animate-fade-in-up');

  /* ═══════════════════════════════════════════════════════════════════════════
   * 3. HERO ENTRANCE
   * ═══════════════════════════════════════════════════════════════════════════ */

  var heroHeadline = document.querySelector('#hero h1');
  if (heroHeadline && !heroHeadline.classList.contains('pm-hero-text') && !heroHeadline.querySelector('.pm-kinetic-line')) {
    anime({
      targets: '#hero h1',
      opacity: [0, 1],
      translateY: [50, 0],
      easing: 'easeOutExpo',
      duration: 1200,
      delay: 400
    });
    anime({
      targets: '#hero h1 span',
      opacity: [0, 1],
      translateY: [40, 0],
      easing: 'easeOutExpo',
      duration: 1000,
      delay: anime.stagger(200, {start: 600})
    });
  }

  var heroCta = document.querySelector('#hero a[href], #hero button');
  if (heroCta && !heroCta.classList.contains('pm-hero-text') && !heroCta.classList.contains('pm-btn')) {
    anime({
      targets: heroCta,
      opacity: [0, 1],
      scale: [0.9, 1],
      easing: 'easeOutElastic(1, .8)',
      duration: 1200,
      delay: 900
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 4. QUOTE CART DRAWER
   * ═══════════════════════════════════════════════════════════════════════════ */

  var origOpen = window.quoteCart && window.quoteCart.open;
  var origClose = window.quoteCart && window.quoteCart.close;

  if (origOpen) {
    window.quoteCart.open = function() {
      var drawer = document.getElementById('quote-drawer');
      if (!drawer) return;
      drawer.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      origOpen.call(window.quoteCart);

      var bd = drawer.querySelector('.quote-backdrop');
      var panel = drawer.querySelector('.quote-panel');

      if (bd) {
        bd.classList.remove('opacity-0');
        anime({ targets: bd, opacity: [0, 0.6], easing: 'easeOutCubic', duration: 300 });
      }
      if (panel) {
        panel.classList.remove('translate-x-full');
        anime({ targets: panel, translateX: ['100%', '0%'], easing: 'easeOutCubic', duration: 350 });
      }
    };
  }

  if (origClose) {
    window.quoteCart.close = function() {
      var drawer = document.getElementById('quote-drawer');
      if (!drawer) return;
      var bd = drawer.querySelector('.quote-backdrop');
      var panel = drawer.querySelector('.quote-panel');

      if (bd) anime({ targets: bd, opacity: 0, easing: 'easeInCubic', duration: 250 });
      if (panel) {
        anime({
          targets: panel,
          translateX: '100%',
          easing: 'easeInCubic',
          duration: 300,
          complete: function() {
            drawer.classList.add('hidden');
            document.body.style.overflow = '';
            if (bd) bd.classList.add('opacity-0');
            if (panel) panel.classList.add('translate-x-full');
          }
        });
      } else {
        drawer.classList.add('hidden');
        document.body.style.overflow = '';
      }
    };
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 5. MICRO-INTERACTIONS
   * ═══════════════════════════════════════════════════════════════════════════ */

  function isInteractiveControl(el) {
    return el.closest('nav') ||
           el.closest('#mobile-menu-panel') ||
           el.closest('#quote-drawer') ||
           el.closest('[data-cookie-banner]') ||
           el.closest('#video-modal') ||
           el.closest('form') ||
           el.hasAttribute('onclick') ||
           el.matches('[aria-haspopup], [aria-expanded], [data-mobile-menu-toggle], [data-cookie-accept], [data-cookie-decline]');
  }

  document.querySelectorAll('button, a').forEach(function(el) {
    if (el.dataset.noAnime || isInteractiveControl(el) || el.classList.contains('pm-btn')) return;
    el.addEventListener('mouseenter', function() {
      anime.remove(this);
      anime({ targets: this, scale: 1.03, duration: 200, easing: 'easeOutQuad' });
    });
    el.addEventListener('mouseleave', function() {
      anime.remove(this);
      anime({ targets: this, scale: 1, duration: 200, easing: 'easeOutQuad' });
    });
  });

  document.querySelectorAll('.dropdown-panel').forEach(function(panel) {
    var parent = panel.closest('.group');
    if (!parent) return;
    parent.addEventListener('mouseenter', function() {
      anime.remove(panel);
      anime({ targets: panel, opacity: [0, 1], translateY: [-8, 0], duration: 200, easing: 'easeOutCubic' });
    });
  });

  anime({
    targets: '.trust-badge-float',
    translateY: [-4, 4],
    easing: 'easeInOutSine',
    duration: 2500,
    direction: 'alternate',
    loop: true,
    delay: anime.stagger(400)
  });

  window.toggleFaq = function(button) {
    var content = button.nextElementSibling;
    var chevron = button.querySelector('.faq-chevron');
    var isOpen = !content.classList.contains('hidden');

    if (isOpen) {
      anime({
        targets: content,
        height: [content.scrollHeight, 0],
        opacity: [1, 0],
        easing: 'easeInCubic',
        duration: 300,
        complete: function() { content.classList.add('hidden'); content.style.height = ''; }
      });
      if (chevron) anime({ targets: chevron, rotate: 0, duration: 300, easing: 'easeOutCubic' });
    } else {
      content.classList.remove('hidden');
      content.style.height = '0px';
      anime({
        targets: content,
        height: [0, content.scrollHeight],
        opacity: [0, 1],
        easing: 'easeOutCubic',
        duration: 350,
        complete: function() { content.style.height = ''; }
      });
      if (chevron) anime({ targets: chevron, rotate: 180, duration: 300, easing: 'easeOutCubic' });
    }
    button.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  };

})();
