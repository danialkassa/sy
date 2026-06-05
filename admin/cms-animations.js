/**
 * NINGBO SIYANG — CMS ANIMATION ORCHESTRATOR
 *
 * Watches Decap CMS React DOM mutations and injects
 * premium staggered entry animations as elements render.
 *
 * Architecture:
 *   - Single shared IntersectionObserver (performance-safe)
 *   - MutationObserver watches the CMS root for new elements
 *   - Hash change listener detects route transitions
 *   - All animations respect prefers-reduced-motion
 *   - Debounced to avoid re-triggering on rapid React re-renders
 */

(function() {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     0. CONFIGURATION
     ═══════════════════════════════════════════════════════════ */

  var CONFIG = {
    stagger: {
      sidebarLink: 30,
      collectionCard: 50,
      editorField: 40,
      previewChild: 50,
      relationOption: 20,
      filterControl: 25,
      workflowCard: 40,
    },
    maxBatchSize: 50,
    debounceMs: 16,
    class: {
      entry: 'cms-animate-entry',
      scale: 'cms-animate-scale',
      slideLeft: 'cms-animate-slide-left',
      visible: 'is-visible',
    },
  };

  /* ═══════════════════════════════════════════════════════════
     1. MOTION PREFERENCE DETECTION
     ═══════════════════════════════════════════════════════════ */

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersReduced = motionQuery.matches;

  function onMotionChange(e) {
    prefersReduced = e.matches;
    if (prefersReduced) {
      // Force all animated elements visible immediately
      document.querySelectorAll('.' + CONFIG.class.entry + ', .' + CONFIG.class.scale + ', .' + CONFIG.class.slideLeft)
        .forEach(function(el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.filter = 'none';
          el.classList.add(CONFIG.class.visible);
        });
    } else {
      // Clear forced inline styles so animations can resume
      document.querySelectorAll('.' + CONFIG.class.entry + ', .' + CONFIG.class.scale + ', .' + CONFIG.class.slideLeft)
        .forEach(function(el) {
          el.style.opacity = '';
          el.style.transform = '';
          el.style.filter = '';
          el.classList.remove(CONFIG.class.visible);
        });
    }
  }

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', onMotionChange);
  } else if (motionQuery.addListener) {
    motionQuery.addListener(onMotionChange);
  }

  /* ═══════════════════════════════════════════════════════════
     2. DOM HELPERS
     ═══════════════════════════════════════════════════════════ */

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function addClass(el, cls) {
    if (!el) return;
    var list = el.classList;
    if (list) list.add(cls);
  }

  function removeClass(el, cls) {
    if (!el) return;
    var list = el.classList;
    if (list) list.remove(cls);
  }

  function hasClass(el, cls) {
    return el && el.classList && el.classList.contains(cls);
  }

  function debounce(fn, ms) {
    var t;
    return function() {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function() { fn.apply(null, args); }, ms);
    };
  }

  /* ═══════════════════════════════════════════════════════════
     3. SINGLE SHARED INTERSECTION OBSERVER
     ═══════════════════════════════════════════════════════════ */

  var sharedObserver = null;
  var observedElements = new WeakSet();

  function getSharedObserver() {
    if (sharedObserver) return sharedObserver;
    if (!('IntersectionObserver' in window)) return null;

    sharedObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          addClass(entry.target, CONFIG.class.visible);
          sharedObserver.unobserve(entry.target);
          observedElements.delete(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 20px 0px' });

    return sharedObserver;
  }

  function unobserveAll() {
    if (!sharedObserver) return;
    sharedObserver.disconnect();
    sharedObserver = null;
    observedElements = new WeakSet();
  }

  /* ═══════════════════════════════════════════════════════════
     4. ANIMATION INJECTION ENGINE
     ═══════════════════════════════════════════════════════════ */

  function animateBatch(elements, animClass, staggerMs, maxItems) {
    if (prefersReduced) return;
    if (!elements || !elements.length) return;

    var items = elements.slice(0, maxItems || CONFIG.maxBatchSize);
    var observer = getSharedObserver();

    items.forEach(function(el, i) {
      if (hasClass(el, animClass) || hasClass(el, CONFIG.class.visible)) return;

      var delayIdx = Math.min(i + 1, 10);
      addClass(el, animClass);
      addClass(el, 'cms-delay-' + delayIdx);

      if (observer) {
        if (!observedElements.has(el)) {
          observedElements.add(el);
          observer.observe(el);
        }
      } else {
        // Fallback for very old browsers
        setTimeout(function() {
          addClass(el, CONFIG.class.visible);
        }, (staggerMs || 50) * i);
      }
    });
  }

  function clearAnimations(root) {
    var scope = root || document;
    $$('.' + CONFIG.class.entry + ', .' + CONFIG.class.scale + ', .' + CONFIG.class.slideLeft, scope)
      .forEach(function(el) {
        removeClass(el, CONFIG.class.entry);
        removeClass(el, CONFIG.class.scale);
        removeClass(el, CONFIG.class.slideLeft);
        removeClass(el, CONFIG.class.visible);
        for (var i = 1; i <= 10; i++) removeClass(el, 'cms-delay-' + i);
      });
    unobserveAll();
  }

  /* ═══════════════════════════════════════════════════════════
     5. ELEMENT DETECTORS
     ═══════════════════════════════════════════════════════════ */

  function detectSidebarLinks() {
    var links = $$('aside a, [class*="SidebarLink"], .nc-sidebar-link');
    animateBatch(links, CONFIG.class.slideLeft, CONFIG.stagger.sidebarLink);
  }

  function detectCollectionCards() {
    var cards = $$('[class*="CollectionItemContainer-card"], [class*="card"], .nc-collection-list-item, [class*="WorkflowCard"]');
    animateBatch(cards, CONFIG.class.entry, CONFIG.stagger.collectionCard);
  }

  function detectEditorFields() {
    var fields = $$('[class*="ControlContainer"], [class*="controlContainer"], .nc-control');
    animateBatch(fields, CONFIG.class.entry, CONFIG.stagger.editorField);
  }

  function detectPreviewContent() {
    var previewRoots = $$('[class*="PreviewPane"], .nc-preview-pane, [class*="previewPane"]');
    previewRoots.forEach(function(root) {
      if (!hasClass(root, 'cms-preview-root')) {
        addClass(root, 'cms-preview-root');
      }
    });
  }

  function detectWorkflowCards() {
    var cards = $$('[class*="WorkflowCard"], [class*="workflowCard"], .nc-editorial-workflow-card');
    animateBatch(cards, CONFIG.class.entry, CONFIG.stagger.workflowCard);
  }

  function detectFilterControls() {
    var controls = $$('[class*="FilterContainer"] select, [class*="FilterContainer"] button, [class*="filterContainer"] select, [class*="filterContainer"] button');
    animateBatch(controls, CONFIG.class.entry, CONFIG.stagger.filterControl);
  }

  function detectEmptyStates() {
    var emptyStates = $$('[class*="EmptyState"], [class*="emptyState"]');
    emptyStates.forEach(function(el) {
      if (!hasClass(el, CONFIG.class.scale)) {
        addClass(el, CONFIG.class.scale);
        setTimeout(function() { addClass(el, CONFIG.class.visible); }, 100);
      }
    });
  }

  function detectTopBar() {
    var topBars = $$('[class*="AppHeader"], [class*="TopBar"], .nc-topBar');
    topBars.forEach(function(el) {
      if (!hasClass(el, CONFIG.class.entry)) {
        addClass(el, CONFIG.class.entry);
        setTimeout(function() { addClass(el, CONFIG.class.visible); }, 50);
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     6. ROUTE CHANGE DETECTION
     ═══════════════════════════════════════════════════════════ */

  var lastHash = location.hash;

  function onRouteChange() {
    var newHash = location.hash;
    if (newHash === lastHash) return;
    lastHash = newHash;

    setTimeout(function() {
      clearAnimations();
      runAllDetectors();
    }, 120);
  }

  window.addEventListener('hashchange', onRouteChange);

  setInterval(function() {
    if (location.hash !== lastHash) {
      onRouteChange();
    }
  }, 200);

  /* ═══════════════════════════════════════════════════════════
     7. MUTATION OBSERVER
     ═══════════════════════════════════════════════════════════ */

  var observer;
  var pendingMutations = false;

  var handleMutations = debounce(function() {
    if (prefersReduced) return;
    pendingMutations = false;
    runAllDetectors();
  }, CONFIG.debounceMs);

  function runAllDetectors() {
    if (prefersReduced) return;
    detectTopBar();
    detectSidebarLinks();
    detectCollectionCards();
    detectEditorFields();
    detectPreviewContent();
    detectWorkflowCards();
    detectFilterControls();
    detectEmptyStates();
  }

  function hasElementNode(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.nodeType === 1 && n.tagName !== 'SCRIPT' && n.tagName !== 'STYLE') {
        return true;
      }
    }
    return false;
  }

  function initObserver() {
    var root = document.getElementById('nc-root') || document.body;
    if (!root) return;

    observer = new MutationObserver(function(mutations) {
      if (prefersReduced) return;
      var hasSignificantChange = false;
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes.length > 0 && hasElementNode(mutations[i].addedNodes)) {
          hasSignificantChange = true;
          break;
        }
      }
      if (hasSignificantChange && !pendingMutations) {
        pendingMutations = true;
        handleMutations();
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });
  }

  /* ═══════════════════════════════════════════════════════════
     8. TOAST NOTIFICATION SYSTEM
     ═══════════════════════════════════════════════════════════ */

  window.CMSToast = {
    active: [],

    show: function(message, type, duration) {
      type = type || 'info';
      // Allow explicit 0 for persistent toasts (error toasts)
      if (duration === undefined || duration === null) {
        duration = type === 'error' ? 0 : 4000;
      }

      var toast = document.createElement('div');
      toast.className = 'cms-toast cms-toast--' + type;
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');

      var icon = document.createElement('span');
      icon.style.fontSize = '1.25rem';
      if (type === 'success') icon.textContent = '\u2713';
      else if (type === 'error') icon.textContent = '\u2717';
      else icon.textContent = '\u2139';

      var textNode = document.createElement('span');
      textNode.textContent = message;

      toast.appendChild(icon);
      toast.appendChild(textNode);

      if (duration > 0) {
        var progress = document.createElement('div');
        progress.className = 'cms-toast-progress';
        progress.style.width = '100%';
        toast.appendChild(progress);

        var start = Date.now();
        var tick = setInterval(function() {
          var elapsed = Date.now() - start;
          var pct = 100 - (elapsed / duration * 100);
          progress.style.width = Math.max(0, pct) + '%';
          if (pct <= 0) {
            clearInterval(tick);
            window.CMSToast.dismiss(toast);
          }
        }, 50);
        toast._tick = tick;
      }

      toast.addEventListener('click', function() {
        window.CMSToast.dismiss(toast);
      });

      document.body.appendChild(toast);
      window.CMSToast.active.push(toast);

      // Limit to 3 toasts with safety counter
      var safety = 0;
      while (window.CMSToast.active.length > 3 && safety++ < 10) {
        window.CMSToast.dismiss(window.CMSToast.active[0]);
      }

      return toast;
    },

    success: function(message, duration) {
      return this.show(message, 'success', duration);
    },

    error: function(message, duration) {
      return this.show(message, 'error', duration);
    },

    info: function(message, duration) {
      return this.show(message, 'info', duration);
    },

    dismiss: function(toast) {
      if (!toast || !toast.parentNode) return;
      if (toast._tick) clearInterval(toast._tick);
      toast.classList.add('cms-toast--exit');
      setTimeout(function() {
        if (toast.parentNode) toast.remove();
      }, 350);
      var idx = window.CMSToast.active.indexOf(toast);
      if (idx > -1) window.CMSToast.active.splice(idx, 1);
    },

    dismissAll: function() {
      window.CMSToast.active.slice().forEach(function(t) {
        window.CMSToast.dismiss(t);
      });
    }
  };

  /* ═══════════════════════════════════════════════════════════
     9. INITIALIZATION
     ═══════════════════════════════════════════════════════════ */

  function init() {
    runAllDetectors();
    initObserver();

    // Re-run after delays to catch late-rendered content
    setTimeout(runAllDetectors, 800);
    setTimeout(runAllDetectors, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ═══════════════════════════════════════════════════════════
     10. EXPORTS
     ═══════════════════════════════════════════════════════════ */

  window.CMSAnimation = {
    config: CONFIG,
    runAllDetectors: runAllDetectors,
    clearAnimations: clearAnimations,
    animateBatch: animateBatch,
    prefersReduced: function() { return prefersReduced; }
  };

})();
