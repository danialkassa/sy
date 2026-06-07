/**
 * Scroll-Trigger Animations — Vanilla JS port of the React scroll-trigger system
 * Supports: ContainerScrollAnimation, ContainerScrollInset, ContainerScrollInsetX/Y,
 *           ContainerScrollScale, ContainerScrollTranslate, ContainerScrollRadius
 *
 * Usage: Add data-sa-* attributes to HTML elements. Call ScrollAnimations.init()
 *
 * Multi-stop interpolation (v2):
 *   - data-sa-scale="1.3,1.1,1"          three evenly-spaced stops
 *   - data-sa-input="0,0.3,0.7,1"        custom input range (optional)
 *   - All two-value attributes work exactly as before (fully backwards compatible)
 */
(function () {
  'use strict';

  var ScrollAnimations = {};

  /* ── Easing functions (Task 5) ── */

  var EASING = {
    'linear':        function(p) { return p; },
    'ease-out':      function(p) { return 1 - Math.pow(1 - p, 3); },
    'ease-in':       function(p) { return Math.pow(p, 3); },
    'ease-in-out':   function(p) { return p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2,3)/2; },
    'ease-out-expo': function(p) { return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); }
  };

  function applyEasing(progress, el) {
    var easeName = el.dataset.saEase || 'linear';
    var fn = EASING[easeName];
    if (!fn) fn = EASING['linear'];
    return fn(progress);
  }

  function getEaseFn(el) {
    var easeName = el.dataset.saEase;
    if (!easeName || easeName === 'linear') return null;
    return EASING[easeName] || null;
  }

  /* ── Mobile detection ── */

  var IS_MOBILE = window.matchMedia('(max-width: 767px)').matches;
  var IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  var IS_SLOW_CONNECTION = (function() {
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return false;
    return conn.saveData === true || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g';
  })();

  /* ── Low-level math helpers ── */

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  // Map a single value from one numeric range to another (2-stop only)
  function mapRange(value, inMin, inMax, outMin, outMax) {
    var t = clamp((value - inMin) / (inMax - inMin), 0, 1);
    return lerp(outMin, outMax, t);
  }

  /* ── Parsing helpers ── */

  // Parse "0,1" or "45,0" into number array (original, kept for compatibility)
  function parseRange(str) {
    if (!str) return null;
    return str.split(',').map(Number);
  }

  // Parse range of any length with fallback and NaN guard
  function parseRangeMulti(str, fallback) {
    if (!str) return fallback;
    var parsed = str.split(',').map(Number);
    for (var i = 0; i < parsed.length; i++) {
      if (isNaN(parsed[i])) return fallback;
    }
    return parsed;
  }

  // Read optional data-sa-input attribute, or generate evenly-spaced stops
  // 2 values → [0, 1], 3 values → [0, 0.5, 1], 4 values → [0, 0.33, 0.67, 1]
  function parseInputRange(el, outputLength) {
    var raw = el.dataset.saInput;

    if (raw) {
      var parsed = raw.split(',').map(Number);
      var valid =
        parsed.length === outputLength &&
        parsed[0] === 0 &&
        parsed[parsed.length - 1] === 1;

      if (valid) {
        for (var i = 1; i < parsed.length; i++) {
          if (parsed[i] <= parsed[i - 1] || isNaN(parsed[i])) {
            valid = false;
            break;
          }
        }
      }

      if (valid) return parsed;

      console.warn(
        '[ScrollAnimations] Invalid data-sa-input "' + raw + '" on element:',
        el,
        '— falling back to evenly-spaced stops.'
      );
    }

    // Auto-generate evenly-spaced stops
    var stops = [];
    for (var j = 0; j < outputLength; j++) {
      stops.push(Math.round((j / (outputLength - 1)) * 10000) / 10000);
    }
    return stops;
  }

  /* ── Core interpolation engine ── */

  // Multi-stop interpolation (mirrors Framer Motion useTransform with arrays)
  // For two-value arrays it calls mapRange directly — identical output to original
  function interpolateMulti(progress, outputValues, inputRange, easeFn) {
    var n = outputValues.length;

    // Fast path: original 2-stop behaviour (no new overhead)
    if (n === 2) {
      if (easeFn) {
        var t2 = clamp((progress - inputRange[0]) / (inputRange[1] - inputRange[0]), 0, 1);
        return lerp(outputValues[0], outputValues[1], easeFn(t2));
      }
      return mapRange(progress, inputRange[0], inputRange[1], outputValues[0], outputValues[1]);
    }

    var p = clamp(progress, 0, 1);

    // Edge: progress at or beyond last stop
    if (p >= inputRange[n - 1]) return outputValues[n - 1];

    // Edge: progress at or before first stop
    if (p <= inputRange[0]) return outputValues[0];

    // Find the segment that contains progress
    var segIndex = 0;
    for (var i = 0; i < n - 1; i++) {
      if (p <= inputRange[i + 1]) {
        segIndex = i;
        break;
      }
    }

    var segIn0 = inputRange[segIndex];
    var segIn1 = inputRange[segIndex + 1];
    var segT = clamp((p - segIn0) / (segIn1 - segIn0), 0, 1);
    if (easeFn) segT = easeFn(segT);
    return lerp(outputValues[segIndex], outputValues[segIndex + 1], segT);
  }

  /* ── Inset-specific helper ── */

  // Parse pipe-delimited inset string with multi-stop support
  // "40,20,0|40,20,0|9999,128,16" → { yRange, xRange, radiusRange }
  function parseInsetAttribute(raw) {
    var parts = (raw || '45,0|45,0|16,16').split('|');
    return {
      yRange:      parseRangeMulti(parts[0], [45, 0]),
      xRange:      parseRangeMulti(parts[1], [45, 0]),
      radiusRange: parseRangeMulti(parts[2], [16, 16])
    };
  }

  // ── Core: compute scroll progress for a container (0 to 1) ──
  function getScrollProgress(container) {
    var rect = container.getBoundingClientRect();
    var windowHeight = window.innerHeight;
    var totalTravel = windowHeight + rect.height;
    var traveled = windowHeight - rect.top;
    return clamp(traveled / totalTravel, 0, 1);
  }

  // ── Animation handlers ──
  var handlers = {

    // data-sa="inset"
    // data-sa-inset="insetYStops|insetXStops|radiusStops"
    // data-sa-input="0,0.5,1" (optional)
    // Original:  data-sa-inset="45,0|45,0|16,16"
    // 3-stop:    data-sa-inset="40,20,0|40,20,0|9999,128,16"
    inset: function (el, progress) {
      var parsed      = parseInsetAttribute(el.dataset.saInset);
      var yRange      = parsed.yRange;
      var xRange      = parsed.xRange;
      var radiusRange = parsed.radiusRange;

      var stops = Math.max(yRange.length, xRange.length, radiusRange.length);
      var inputRange = parseInputRange(el, stops);
      var easeFn = getEaseFn(el);

      var y = interpolateMulti(progress, yRange, inputRange, easeFn);
      var x = interpolateMulti(progress, xRange, inputRange, easeFn);
      var r = interpolateMulti(progress, radiusRange, inputRange, easeFn);

      el.style.clipPath =
        'inset(' + y + '% ' + x + '% ' + y + '% ' + x + '% round ' + r + 'px)';
    },

    // data-sa="inset-x"
    // data-sa-inset-x="48,0" or "48,24,0"
    // data-sa-input="0,0.4,1" (optional)
    'inset-x': function (el, progress) {
      var range      = parseRangeMulti(el.dataset.saInsetX, [48, 0]);
      var inputRange = parseInputRange(el, range.length);
      var val        = interpolateMulti(progress, range, inputRange, getEaseFn(el));

      el.style.clipPath = 'inset(0px ' + val + 'px)';
    },

    // data-sa="inset-y"
    // data-sa-inset-y="48,0" or "48,24,0"
    'inset-y': function (el, progress) {
      var range      = parseRangeMulti(el.dataset.saInsetY, [48, 0]);
      var inputRange = parseInputRange(el, range.length);
      var val        = interpolateMulti(progress, range, inputRange, getEaseFn(el));

      el.style.clipPath = 'inset(' + val + 'px 0px)';
    },

    // data-sa="scale"
    // data-sa-scale="1.2,1" or "1.3,1.1,1"
    // data-sa-input="0,0.3,1" (optional)
    scale: function (el, progress) {
      var range      = parseRangeMulti(el.dataset.saScale, [1.2, 1]);
      var inputRange = parseInputRange(el, range.length);
      var val        = interpolateMulti(progress, range, inputRange, getEaseFn(el));

      el.style.transform = 'scale(' + val + ')';
    },

    // data-sa="translate-y"
    // data-sa-translate-y="0,-384" or "0,-200,-384"
    // data-sa-translate-unit="px" or "%"
    // data-sa-input="0,0.6,1" (optional)
    'translate-y': function (el, progress) {
      var range      = parseRangeMulti(el.dataset.saTranslateY, [0, -384]);
      var inputRange = parseInputRange(el, range.length);
      var unit       = el.dataset.saTranslateUnit || 'px';
      var val        = interpolateMulti(progress, range, inputRange, getEaseFn(el));

      el.style.transform = 'translateY(' + val + unit + ')';
    },

    // data-sa="radius"
    // data-sa-radius="9999,16" or "9999,64,16"
    radius: function (el, progress) {
      var range      = parseRangeMulti(el.dataset.saRadius, [9999, 16]);
      var inputRange = parseInputRange(el, range.length);
      var val        = interpolateMulti(progress, range, inputRange, getEaseFn(el));

      el.style.borderRadius = val + 'px';
    },

    // data-sa="opacity"
    // data-sa-opacity="0,1" or "0,0.5,1"
    // data-sa-input="0,0.2,1" (optional — fast fade in, then slow)
    opacity: function (el, progress) {
      var range      = parseRangeMulti(el.dataset.saOpacity, [0, 1]);
      var inputRange = parseInputRange(el, range.length);
      var val        = interpolateMulti(progress, range, inputRange, getEaseFn(el));

      el.style.opacity = val;
    }
  };

  // ── Main init ──
  ScrollAnimations.init = function () {
    var containers = document.querySelectorAll('[data-sa-container]');

    if (!containers.length) return;

    // Reduced motion or save-data: remove all animation side-effects
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || IS_SLOW_CONNECTION) {
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

    // ── Mobile adjustments ──
    if (IS_MOBILE) {
      // Reduce parallax wrap height on mobile
      document.querySelectorAll('.sa-parallax-wrap').forEach(function (el) {
        el.style.height = '60vh';
      });
      // Use overflow: clip instead of hidden on mobile to prevent content clipping
      containers.forEach(function (container) {
        container.style.overflow = 'clip';
      });
    }

    var rafId = null;
    var mobileFrameSkip = 0; // Task 3: skip every other rAF on touch+mobile

    function update() {
      containers.forEach(function (container) {
        var progress = getScrollProgress(container);
        var children = container.querySelectorAll('[data-sa]');

        children.forEach(function (el) {
          var type = el.dataset.sa;
          var handler = handlers[type];
          if (handler) {
            // On mobile, reduce translate-y intensity by 50%
            if (IS_MOBILE && type === 'translate-y') {
              var origAttr = el.dataset.saTranslateY;
              if (origAttr && !el._mobileScaled) {
                var vals = origAttr.split(',').map(Number);
                var scaled = vals.map(function (v) { return Math.round(v * 0.5); });
                el.dataset.saTranslateY = scaled.join(',');
                el._mobileScaled = true;
              }
            }

            handler(el, progress);
          }
        });
      });

      rafId = null;
    }

    function scheduleUpdate() {
      if (rafId === null) {
        if (IS_TOUCH && IS_MOBILE) {
          mobileFrameSkip++;
          if (mobileFrameSkip % 2 === 0) {
            rafId = requestAnimationFrame(function() {
              rafId = null;
            });
            return;
          }
        }
        rafId = requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

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
