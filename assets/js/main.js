/**
 * Ningbo Siyang - Pure HTML Site Interactivity
 * Vanilla JS replacement for React interactions
 */

(function() {
  'use strict';

  var _t = function(key, fallback) {
    if (typeof i18n !== 'undefined' && i18n.t) { var val = i18n.t(key); return val && val !== key ? val : fallback; }
    return fallback;
  };

  // ===== Hero Carousel (if present) =====
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.hero-dot');
  if (heroSlides.length > 0) {
    let currentSlide = 0;
    const totalSlides = heroSlides.length;
    let autoPlayInterval;

    function updateSlides() {
      heroSlides.forEach((slide, i) => {
        slide.style.opacity = i === currentSlide ? '1' : '0';
      });
      heroDots.forEach((dot, i) => {
        if (i === currentSlide) {
          dot.classList.remove('w-4', 'bg-white/40');
          dot.classList.add('w-16', 'bg-yellow-400');
        } else {
          dot.classList.remove('w-16', 'bg-yellow-400');
          dot.classList.add('w-4', 'bg-white/40');
        }
      });
    }

    window.nextSlide = function() {
      currentSlide = (currentSlide + 1) % totalSlides;
      updateSlides();
      resetAutoPlay();
    };

    window.prevSlide = function() {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      updateSlides();
      resetAutoPlay();
    };

    window.goToSlide = function(index) {
      currentSlide = index;
      updateSlides();
      resetAutoPlay();
    };

    function startAutoPlay() {
      autoPlayInterval = setInterval(window.nextSlide, 3000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayInterval);
      if (autoPlayActive) {
        startAutoPlay();
      }
    }

    // Pause/Resume toggle for WCAG 2.2.2 compliance
    let autoPlayActive = true;
    window.toggleAutoPlay = function(btn) {
      autoPlayActive = !autoPlayActive;
      if (autoPlayActive) {
        startAutoPlay();
        if (btn) {
          btn.setAttribute('aria-label', 'Pause slideshow');
          btn.setAttribute('aria-pressed', 'false');
          btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>';
          btn.classList.remove('bg-yellow-400/30');
          btn.classList.add('bg-white/10');
        }
      } else {
        stopAutoPlay();
        if (btn) {
          btn.setAttribute('aria-label', 'Resume slideshow');
          btn.setAttribute('aria-pressed', 'true');
          btn.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><polygon points="8,5 19,12 8,19"/></svg>';
          btn.classList.remove('bg-white/10');
          btn.classList.add('bg-yellow-400/30');
        }
      }
    };

    // Video error fallback
    document.querySelectorAll('.hero-slide video').forEach(video => {
      video.addEventListener('error', function() {
        this.classList.add('hidden');
        const fallback = this.parentElement.querySelector('[data-fallback]');
        if (fallback) fallback.classList.remove('hidden');
      });
    });

    startAutoPlay();
  }

  // ===== Mobile Navigation =====
  const mobileMenuBtn = document.querySelector('[data-mobile-menu-toggle]');
  const mobileNav = document.getElementById('mobile-menu-panel');
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileNav.classList.toggle('hidden');
      const isOpen = !mobileNav.classList.contains('hidden');
      this.setAttribute('aria-expanded', isOpen);
      this.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      this.innerHTML = isOpen
        ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
        : '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    });
  }

  // ===== Dropdown menus (click to toggle on mobile, hover on desktop) =====
  document.querySelectorAll('.group > button[aria-haspopup="true"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      // Only handle click on mobile/tablet where hover doesn't work well
      if (window.innerWidth < 1024) {
        e.preventDefault();
        const panel = this.parentElement.querySelector('.dropdown-panel');
        if (panel) {
          const isHidden = panel.classList.contains('hidden');
          // Close all other dropdowns
          document.querySelectorAll('.dropdown-panel').forEach(p => {
            if (p !== panel) p.classList.add('hidden');
          });
          panel.classList.toggle('hidden', !isHidden);
          this.setAttribute('aria-expanded', isHidden);
        }
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.group')) {
      document.querySelectorAll('.dropdown-panel').forEach(panel => {
        panel.classList.add('hidden');
      });
    }
  });

  // ===== FAQ Accordion =====
  // Smooth expansion handled by animations.js (Anime.js) if available.
  // This fallback runs when Anime.js didn't define window.toggleFaq (CDN failure or slow load).
  if (typeof window.toggleFaq !== 'function') {
    window.toggleFaq = function(button) {
      var content = button.nextElementSibling;
      var chevron = button.querySelector('.faq-chevron');
      var isOpen = !content.classList.contains('hidden');
      if (isOpen) {
        content.classList.add('hidden');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
      } else {
        content.classList.remove('hidden');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
      }
      button.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    };
  }

  // ===== Video Modal =====
  window.openVideo = function(url) {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('video-player');
    if (modal && player) {
      player.src = url;
      modal.classList.remove('hidden');
      player.play().catch(function(){});
    }
  };

  window.closeVideo = function() {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('video-player');
    if (modal && player) {
      player.pause();
      player.src = '';
      modal.classList.add('hidden');
    }
  };

  const videoModal = document.getElementById('video-modal');
  if (videoModal) {
    videoModal.addEventListener('click', function(e) {
      if (e.target === this) window.closeVideo();
    });
  }

  // ===== Cookie Consent =====
  const cookieBanner = document.querySelector('[data-cookie-banner]');
  const cookieAccept = document.querySelector('[data-cookie-accept]');
  const cookieDecline = document.querySelector('[data-cookie-decline]');
  if (cookieBanner) {
    if (localStorage.getItem('cookiesAccepted')) {
      cookieBanner.remove();
    } else {
      if (cookieAccept) {
        cookieAccept.addEventListener('click', function() {
          localStorage.setItem('cookiesAccepted', 'true');
          cookieBanner.remove();
        });
      }
      if (cookieDecline) {
        cookieDecline.addEventListener('click', function() {
          localStorage.setItem('cookiesAccepted', 'false');
          cookieBanner.remove();
        });
      }
    }
  }

  // ===== Smooth Scroll for Anchor Links =====
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== Active Navigation Highlighting =====
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('a[href]').forEach(function(link) {
    const href = link.getAttribute('href').split('/').pop();
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('text-yellow-400');
      link.classList.remove('text-zinc-300', 'text-zinc-400');
    }
  });

  // Scroll animations are handled by animations.js (Anime.js)
  // This avoids duplicate animation conflicts on .animate-fade-in-up elements

  // ===== Search Form Handler =====
  document.querySelectorAll('form[action*="products"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      const input = this.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        e.preventDefault();
      }
    });
  });

  console.log('Ningbo Siyang - Pure HTML site loaded');
})();

function handleNewsletterSubscribe(e) {
  e.preventDefault();
  var input = e.target.closest('div').querySelector('input[type="email"]') || document.querySelector('#newsletter-email');
  if (!input) return;
  var email = input.value.trim();
  if (!email || email.indexOf('@') === -1) { alert(_t('quote.errorEmail','Please enter a valid email address.')); return; }
  var recipient = (typeof SITE_CONFIG !== 'undefined') ? SITE_CONFIG.email : 'sales@ningbosiyang.com';
  var subject = encodeURIComponent(_t('newsletter.subject','Newsletter Subscription Request'));
  var body = encodeURIComponent(_t('newsletter.bodyText','Please add ') + email + _t('newsletter.bodyText2',' to the Ningbo Siyang newsletter mailing list.\n\nThank you.'));
  window.location.href = 'mailto:' + recipient + '?subject=' + subject + '&body=' + body;
  input.value = '';
  alert(_t('newsletter.success','Your subscription request has been prepared. Please send the email that was opened in your email client.'));
}

document.addEventListener('click', function(e) {
  var fab = document.getElementById('messaging-fab');
  if (!fab) return;
  if (!fab.contains(e.target)) {
    document.getElementById('fab-options').classList.add('hidden');
  }
});
