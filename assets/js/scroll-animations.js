/**
 * Scroll-Trigger Animations — Vanilla JS port of the React scroll-trigger system
 * Supports: ContainerScrollAnimation, ContainerScrollInset, ContainerScrollInsetX/Y,
 *           ContainerScrollScale, ContainerScrollTranslate, ContainerScrollRadius
 *
 * Usage: Add data-sa-* attributes to HTML elements. Call ScrollAnimations.init()
 */
(function () {
  'use strict';

  var ScrollAnimations = {};

  // ── Utility: linear interpolation ──
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // ── Utility: clamp ──
  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  // ── Utility: map value from input range to output range ──
  function mapRange(value, inMin, inMax, outMin, outMax) {
    var t = clamp((value - inMin) / (inMax - inMin), 0, 1);
    return lerp(outMin, outMax, t);
  }

  // ── Utility: parse a range like "0,1" or "45,0" into number array ──
  function parseRange(str) {
    if (!str) return null;
    return str.split(',').map(Number);
  }

  // ── Core: compute scroll progress for a container (0 to 1) ──
  function getScrollProgress(container) {
    var rect = container.getBoundingClientRect();
    var windowHeight = window.innerHeight;
    // Progress 0 when container top enters viewport bottom
    // Progress 1 when container bottom exits viewport top
    var totalTravel = windowHeight + rect.height;
    var traveled = windowHeight - rect.top;
    return clamp(traveled / totalTravel, 0, 1);
  }

  // ── Animation handlers mapped by data attribute ──
  var handlers = {
    // data-sa-inset="insetYStart,insetYEnd|insetXStart,insetXEnd|radiusStart,radiusEnd"
    inset: function (el, progress) {
      var parts = (el.dataset.saInset || '45,0|45,0|16,16').split('|');
      var yRange = parseRange(parts[0]) || [45, 0];
      var xRange = parseRange(parts[1]) || [45, 0];
      var radiusRange = parseRange(parts[2]) || [16, 16];
      var y = mapRange(progress, 0, 1, yRange[0], yRange[1]);
      var x = mapRange(progress, 0, 1, xRange[0], xRange[1]);
      var r = mapRange(progress, 0, 1, radiusRange[0], radiusRange[1]);
      el.style.clipPath = 'inset(' + y + '% ' + x + '% ' + y + '% ' + x + '% round ' + r + 'px)';
    },

    // data-sa-inset-x="start,end"
    'inset-x': function (el, progress) {
      var range = parseRange(el.dataset.saInsetX) || [48, 0];
      var val = mapRange(progress, 0, 1, range[0], range[1]);
      el.style.clipPath = 'inset(0px ' + val + 'px)';
    },

    // data-sa-inset-y="start,end"
    'inset-y': function (el, progress) {
      var range = parseRange(el.dataset.saInsetY) || [48, 0];
      var val = mapRange(progress, 0, 1, range[0], range[1]);
      el.style.clipPath = 'inset(' + val + 'px 0px)';
    },

    // data-sa-scale="start,end"
    scale: function (el, progress) {
      var range = parseRange(el.dataset.saScale) || [1.2, 1];
      var val = mapRange(progress, 0, 1, range[0], range[1]);
      el.style.transform = 'scale(' + val + ')';
    },

    // data-sa-translate-y="start,end" (in px or %)
    'translate-y': function (el, progress) {
      var range = parseRange(el.dataset.saTranslateY) || [0, -384];
      var unit = el.dataset.saTranslateUnit || 'px';
      var val = mapRange(progress, 0, 1, range[0], range[1]);
      el.style.transform = 'translateY(' + val + unit + ')';
    },

    // data-sa-radius="start,end"
    radius: function (el, progress) {
      var range = parseRange(el.dataset.saRadius) || [9999, 16];
      var val = mapRange(progress, 0, 1, range[0], range[1]);
      el.style.borderRadius = val + 'px';
    },

    // data-sa-opacity="start,end"
    opacity: function (el, progress) {
      var range = parseRange(el.dataset.saOpacity) || [0, 1];
      var val = mapRange(progress, 0, 1, range[0], range[1]);
      el.style.opacity = val;
    }
  };

  // ── Main init ──
  ScrollAnimations.init = function () {
    var containers = document.querySelectorAll('[data-sa-container]');

    if (!containers.length) return;

    // Reduced motion check
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      containers.forEach(function (container) {
        var children = container.querySelectorAll('[data-sa]');
        children.forEach(function (el) {
          el.style.clipPath = 'none';
          el.style.transform = 'none';
          el.style.opacity = '1';
          el.style.borderRadius = '0';
        });
      });
      return;
    }

    var rafId = null;

    function update() {
      containers.forEach(function (container) {
        var progress = getScrollProgress(container);
        var children = container.querySelectorAll('[data-sa]');

        children.forEach(function (el) {
          var type = el.dataset.sa;
          var handler = handlers[type];
          if (handler) {
            handler(el, progress);
          }
        });
      });

      rafId = null;
    }

    function scheduleUpdate() {
      if (rafId === null) {
        rafId = requestAnimationFrame(update);
      }
    }

    // Listen to scroll (Lenis already fires native scroll events via rAF)
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    // Initial update
    update();
  };

  window.ScrollAnimations = ScrollAnimations;

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { ScrollAnimations.init(); });
  } else {
    ScrollAnimations.init();
  }
})();
