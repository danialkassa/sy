/**
 * GSAP + ScrollTrigger Animation Engine
 * Ningbo Siyang Tools — Public Website
 *
 * ARCHITECTURE:
 * 1. PER-SECTION REVEALS — Each section animates independently
 *    when it scrolls into view (toggleActions: "play none none none").
 * 2. STAGGER GRIDS — Cards stagger in with back.out easing for pop-in.
 * 3. COUNT-UP — Numbers animate from 0 when visible.
 * 4. MICRO-INTERACTIONS — Button hover scale via gsap.quickTo.
 *
 * SAFETY:
 * • If GSAP is absent, elements fall back to CSS transition (.is-visible).
 * • Respects Premium Motion elements (pm-hero-text, pm-blur-reveal, etc.).
 * • data-gsap-managed attribute prevents Anime.js double-animation.
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  if (typeof gsap === 'undefined') {
    console.warn('[GSAP] Not loaded — falling back to CSS transitions.');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  var $ = function (sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); };

  function isPremiumMotion(el) {
    return el.classList.contains('pm-hero-text') ||
           el.classList.contains('pm-blur-reveal') ||
           el.classList.contains('pm-mask-reveal') ||
           el.classList.contains('pm-kinetic-line') ||
           el.classList.contains('pm-ambient') ||
           el.closest('.pm-kinetic-line') ||
           el.hasAttribute('data-pm-parallax');
  }

  /* ═════════════════════════════════════════════
   * 1. STANDALONE ELEMENTS — Fade-in-up on scroll
   * ═════════════════════════════════════════════ */
  var standaloneEls = $('.animate-fade-in-up').filter(function (el) {
    return !el.closest('.grid') && !isPremiumMotion(el);
  });

  standaloneEls.forEach(function (el) {
    el.setAttribute('data-gsap-managed', '');
    gsap.set(el, { opacity: 0, y: 60 });

    var isHeading = el.matches('h1, h2, h3, h4') || el.querySelector('h1, h2, h3, h4');

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      toggleActions: 'play none none none',
      onEnter: function () {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: isHeading ? 1.0 : 0.8,
          ease: isHeading ? 'power4.out' : 'back.out(1.4)',
          overwrite: 'auto'
        });
      }
    });
  });

  /* ═════════════════════════════════════════════
   * 2. GRID CARDS — Staggered pop-in on scroll
   * ═════════════════════════════════════════════ */
  var grids = $('.grid');
  grids.forEach(function (grid) {
    var cards = Array.from(grid.querySelectorAll('.animate-fade-in-up')).filter(function (el) {
      return !isPremiumMotion(el);
    });
    if (cards.length < 2) return;

    cards.forEach(function (card) {
      card.setAttribute('data-gsap-managed', '');
    });
    gsap.set(cards, { opacity: 0, y: 60, scale: 0.92 });

    ScrollTrigger.create({
      trigger: grid,
      start: 'top 85%',
      toggleActions: 'play none none none',
      onEnter: function () {
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.7)',
          stagger: { each: 0.12, from: 'start' },
          overwrite: 'auto'
        });
      }
    });
  });

  /* ═════════════════════════════════════════════
   * 3. COUNT-UP NUMBERS
   * ═════════════════════════════════════════════ */
  var countUpEls = $('[data-count-up]');
  countUpEls.forEach(function (el) {
    var target = parseInt(el.dataset.countUp, 10);
    var suffix = el.dataset.countSuffix || '';
    if (isNaN(target)) return;

    el.setAttribute('data-gsap-managed', '');
    el.textContent = '0' + suffix;

    var countObj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      toggleActions: 'play none none reverse',
      onEnter: function () {
        var parentCard = el.closest('.animate-fade-in-up[data-gsap-managed]');
        if (parentCard && gsap.getProperty(parentCard, 'opacity') < 0.5) {
          gsap.to(parentCard, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
        }
        gsap.to(countObj, {
          val: target,
          duration: 2.0,
          ease: 'power2.out',
          overwrite: 'auto',
          onUpdate: function () {
            el.textContent = Math.round(countObj.val) + suffix;
          }
        });
      },
      onLeaveBack: function () {
        gsap.to(countObj, {
          val: 0,
          duration: 0.4,
          ease: 'power2.in',
          overwrite: 'auto',
          onUpdate: function () {
            el.textContent = '0' + suffix;
          }
        });
      }
    });
  });

  /* ═════════════════════════════════════════════
   * 4. BUTTON MICRO-INTERACTIONS
   * ═════════════════════════════════════════════ */
  $('a[href*="contact.html"]').forEach(function (btn) {
    if (btn.closest('nav') || btn.closest('footer')) return;
    if (btn.dataset.gsapHover) return;
    if (btn.classList.contains('pm-btn')) return;
    btn.dataset.gsapHover = '1';

    var scaleTo = gsap.quickTo(btn, 'scale', { duration: 0.18, ease: 'power2.out' });

    btn.addEventListener('mouseenter', function () { scaleTo(1.05); });
    btn.addEventListener('mouseleave', function () { scaleTo(1); });
    btn.addEventListener('mousedown', function () { scaleTo(0.97); });
    btn.addEventListener('mouseup',   function () { scaleTo(1.05); });
  });

  /* ═════════════════════════════════════════════
   * 5. PERFORMANCE
   * ═════════════════════════════════════════════ */
  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
  });

  console.log(
    '%c[GSAP] %cEngine ready — %c' + (standaloneEls.length) + ' singles, ' +
    grids.length + ' grids, ' + countUpEls.length + ' count-ups',
    'color: #facc15; font-weight: bold;',
    'color: inherit;',
    'color: #a3a3a3;'
  );
});
