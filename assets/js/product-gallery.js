(function() {
  'use strict';
  var _t = function(key, fallback) {
    if (typeof i18n !== 'undefined' && i18n.t) { var val = i18n.t(key); return val && val !== key ? val : fallback; }
    return fallback;
  };


  var currentIndex = 0;
  var images = [];
  var zoomed = false;

  function injectGallery() {
    var container = document.getElementById('product-main-image');
    if (!container || !container.parentElement) return;
    var parent = container.parentElement;

    var galleryHTML = '<div id="gallery-container" class="space-y-3">' +
      '<div class="relative overflow-hidden rounded-lg bg-zinc-900 aspect-square cursor-zoom-in" id="gallery-main">' +
        '<img id="gallery-main-img" src="" alt="" class="w-full h-full object-contain transition-transform duration-300"/>' +
        '<div id="gallery-zoom-lens" class="hidden absolute inset-0 pointer-events-none"></div>' +
      '</div>' +
      '<div id="gallery-thumbnails" class="flex gap-2 overflow-x-auto pb-2"></div>' +
    '</div>' +
    '<div id="gallery-lightbox" class="fixed inset-0 z-[100] bg-black/95 hidden flex items-center justify-center">' +
      '<button id="lightbox-close" class="absolute top-4 right-4 text-white hover:text-yellow-400 z-10">' +
        '<svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>' +
      '</button>' +
      '<button id="lightbox-prev" class="absolute left-4 text-white hover:text-yellow-400 z-10">' +
        '<svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>' +
      '</button>' +
      '<button id="lightbox-next" class="absolute right-4 text-white hover:text-yellow-400 z-10">' +
        '<svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>' +
      '</button>' +
      '<img id="lightbox-img" src="" alt="" class="max-w-[90vw] max-h-[85vh] object-contain"/>' +
      '<div id="lightbox-counter" class="absolute bottom-4 left-1/2 -translate-x-1/2 text-zinc-400 text-sm"></div>' +
    '</div>';

    parent.innerHTML = galleryHTML;
    bindGalleryEvents();
  }

  function bindGalleryEvents() {
    var thumbsContainer = document.getElementById('gallery-thumbnails');
    var mainImg = document.getElementById('gallery-main-img');
    var main = document.getElementById('gallery-main');
    var lightbox = document.getElementById('gallery-lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCounter = document.getElementById('lightbox-counter');
    var closeBtn = document.getElementById('lightbox-close');
    var prevBtn = document.getElementById('lightbox-prev');
    var nextBtn = document.getElementById('lightbox-next');

    window.updateProductGallery = function(imgList, currentSrc) {
      images = imgList && imgList.length ? imgList : [currentSrc || '../images/placeholder.jpg'];
      currentIndex = 0;
      if (currentSrc) {
        var idx = images.indexOf(currentSrc);
        if (idx >= 0) currentIndex = idx;
      }
      renderThumbnails();
      renderMain();
    };

    function renderMain() {
      if (!mainImg) return;
      mainImg.src = images[currentIndex] || '';
      mainImg.alt = _t('gallery.viewImage','View image') + ' ' + (currentIndex + 1) + ' ' + _t('gallery.of','of') + ' ' + images.length;
    }

    function renderThumbnails() {
      if (!thumbsContainer) return;
      if (images.length <= 1) {
        thumbsContainer.innerHTML = '';
        thumbsContainer.style.display = 'none';
        return;
      }
      thumbsContainer.style.display = 'flex';
      var html = '';
      for (var i = 0; i < images.length; i++) {
        html += '<button type="button" class="gallery-thumb' + (i === currentIndex ? ' active' : '') + '" data-index="' + i + '" aria-label="' + _t('gallery.viewImage','View image') + ' ' + (i + 1) + '">' +
          '<img src="' + images[i] + '" alt="' + _t('gallery.thumbnail','Thumbnail') + ' ' + (i + 1) + '"/>' +
        '</button>';
      }
      thumbsContainer.innerHTML = html;
      var thumbBtns = thumbsContainer.querySelectorAll('.gallery-thumb');
      for (var j = 0; j < thumbBtns.length; j++) {
        thumbBtns[j].addEventListener('click', function(e) {
          var idx = parseInt(this.getAttribute('data-index'), 10);
          if (!isNaN(idx)) {
            currentIndex = idx;
            renderMain();
            renderThumbnails();
          }
        });
      }
    }

    if (main) {
      main.addEventListener('mousemove', function(e) {
        if (!zoomed || !mainImg) return;
        var rect = main.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        mainImg.style.transformOrigin = x + '% ' + y + '%';
      });

      main.addEventListener('mouseenter', function() {
        if (window.innerWidth >= 768) {
          zoomed = true;
          if (mainImg) mainImg.style.transform = 'scale(2)';
        }
      });

      main.addEventListener('mouseleave', function() {
        zoomed = false;
        if (mainImg) mainImg.style.transform = 'scale(1)';
      });

      main.addEventListener('click', function() {
        openLightbox();
      });
    }

    function openLightbox() {
      if (!lightbox || !lightboxImg) return;
      lightbox.classList.remove('hidden');
      lightboxImg.src = images[currentIndex] || '';
      updateLightboxCounter();
      document.addEventListener('keydown', handleLightboxKeys);
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.add('hidden');
      document.removeEventListener('keydown', handleLightboxKeys);
    }

    function navigateLightbox(direction) {
      if (direction === 'prev') {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
      } else {
        currentIndex = (currentIndex + 1) % images.length;
      }
      if (lightboxImg) lightboxImg.src = images[currentIndex] || '';
      if (mainImg) mainImg.src = images[currentIndex] || '';
      updateLightboxCounter();
      renderThumbnails();
    }

    function updateLightboxCounter() {
      if (lightboxCounter) lightboxCounter.textContent = (currentIndex + 1) + ' ' + _t('gallery.of','of') + ' ' + images.length;
    }

    function handleLightboxKeys(e) {
      if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); navigateLightbox('prev'); }
      if (e.key === 'ArrowRight') { e.preventDefault(); navigateLightbox('next'); }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', function() { navigateLightbox('prev'); });
    if (nextBtn) nextBtn.addEventListener('click', function() { navigateLightbox('next'); });

    if (lightbox) {
      lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
      });

      var touchStartX = 0;
      lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
      });
      lightbox.addEventListener('touchend', function(e) {
        var diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          navigateLightbox(diff > 0 ? 'next' : 'prev');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    var imgEl = document.getElementById('product-main-image');
    if (imgEl) {
      var initialSrc = imgEl.src || '';
      if (initialSrc && initialSrc.indexOf('placeholder') < 0) {
        injectGallery();
        var imgArr = [initialSrc];
        if (window._productImages) imgArr = window._productImages;
        if (typeof updateProductGallery === 'function') {
          updateProductGallery(imgArr, initialSrc);
        }
      }
    }
  });
  if (typeof i18n !== "undefined" && i18n.applyTranslations) i18n.applyTranslations();

  document.addEventListener('languageChanged', function() {
    if (typeof i18n !== 'undefined' && i18n.applyTranslations) i18n.applyTranslations();
    if (typeof updateProductGallery === 'function' && window._productImages) {
      updateProductGallery(window._productImages, document.getElementById('gallery-main-img') ? document.getElementById('gallery-main-img').src : '');
    }
  });
})();
