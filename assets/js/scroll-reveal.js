(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Scroll Reveal ---
  function initScrollReveal() {
    var els = document.querySelectorAll('.animate-fade-in-up');
    if (!els.length) return;

    if (reduced) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    els.forEach(function (el) { obs.observe(el); });
  }

  // --- FAQ Accordion ---
  window.toggleFaq = function (btn) {
    var item = btn.closest('.faq-item') || btn.parentElement;
    var answer = item.querySelector('.faq-answer') || item.querySelector('.faq-body');
    if (!answer) return;

    var isOpen = !answer.classList.contains('hidden') && answer.style.maxHeight && answer.style.maxHeight !== '0px';

    if (isOpen) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
      requestAnimationFrame(function () { answer.style.maxHeight = '0px'; });
      item.classList.remove('active');
    } else {
      answer.classList.remove('hidden');
      answer.style.maxHeight = answer.scrollHeight + 'px';
      item.classList.add('active');
      var handler = function () {
        answer.style.maxHeight = 'none';
        answer.removeEventListener('transitionend', handler);
      };
      answer.addEventListener('transitionend', handler);
    }
  };

  // --- Quote Cart Drawer ---
  function initQuoteDrawer() {
    var drawer = document.querySelector('.quote-drawer') || document.querySelector('.quote-cart-drawer');
    var openBtns = document.querySelectorAll('.quote-drawer-open, [data-open-quote]');
    var closeBtns = document.querySelectorAll('.quote-drawer-close, [data-close-quote]');
    if (!drawer) return;

    function open() { drawer.classList.add('is-open'); drawer.classList.remove('is-closed'); }
    function close() { drawer.classList.remove('is-open'); drawer.classList.add('is-closed'); }

    openBtns.forEach(function (b) { b.addEventListener('click', open); });
    closeBtns.forEach(function (b) { b.addEventListener('click', close); });
  }

  // --- Count-Up Numbers ---
  function initCountUp() {
    var els = document.querySelectorAll('[data-count-up]');
    if (!els.length) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count-up'));
      var duration = parseInt(el.getAttribute('data-count-duration')) || 2000;
      var start = 0;
      var startTime = null;

      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var ease = 1 - Math.pow(1 - progress, 3);
        var current = start + (target - start) * ease;
        el.textContent = Number.isInteger(target) ? Math.round(current) : current.toFixed(1);
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }

    if (reduced) {
      els.forEach(function (el) { el.textContent = el.getAttribute('data-count-up'); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animate(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });

    els.forEach(function (el) { obs.observe(el); });
  }

  // --- Init ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initScrollReveal();
      initQuoteDrawer();
      initCountUp();
    });
  } else {
    initScrollReveal();
    initQuoteDrawer();
    initCountUp();
  }
})();
