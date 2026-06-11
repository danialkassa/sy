var SearchEngine = (function() {
  var _t = function(key, fallback) {
    if (typeof i18n !== 'undefined' && i18n.t) { var val = i18n.t(key); return val && val !== key ? val : fallback; }
    return fallback;
  };
  var productIndex = [];
  var isLoading = false;
  var isLoaded = false;

  function getBasePath() {
    var path = window.location.pathname;
    if (path.indexOf('/blogs/') !== -1) return '../';
    if (path.indexOf('/products/') !== -1) return '../';
    if (path.indexOf('/about/') !== -1) return '../';
    return './';
  }

  function loadIndex() {
    if (isLoaded) return Promise.resolve(productIndex);
    if (isLoading) return new Promise(function(resolve) { setTimeout(function() { resolve(productIndex); }, 200); });

    isLoading = true;
    var base = getBasePath();
    return fetch(base + 'content/products/index.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        productIndex = Array.isArray(data) ? data : (data.products || []);
        isLoaded = true;
        isLoading = false;
        return productIndex;
      })
      .catch(function(err) {
        console.warn('Search: Failed to load product index', err);
        isLoading = false;
        return [];
      });
  }

  function normalize(str) {
    if (!str) return '';
    return str.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function searchProducts(query) {
    if (!query || query.length < 2) return [];
    var q = normalize(query);
    var terms = q.split(' ').filter(function(t) { return t.length > 0; });

    return productIndex.map(function(product) {
      var searchable = normalize(
        (product.name || '') + ' ' +
        (product.sku || '') + ' ' +
        (product.category || '') + ' ' +
        (product.categoryLabel || '') + ' ' +
        (product.brand || '') + ' ' +
        (product.description || '')
      );

      var score = 0;

      if (normalize(product.sku) === q) {
        score += 100;
      } else if (normalize(product.sku).indexOf(q) === 0) {
        score += 80;
      } else if (normalize(product.sku).indexOf(q) !== -1) {
        score += 60;
      }

      if (normalize(product.name).indexOf(q) !== -1) {
        score += 50;
      }

      if (normalize(product.categoryLabel).indexOf(q) !== -1 || normalize(product.category).indexOf(q) !== -1) {
        score += 30;
      }

      for (var i = 0; i < terms.length; i++) {
        if (searchable.indexOf(terms[i]) !== -1) {
          score += 10;
        }
      }

      return { product: product, score: score };
    })
    .filter(function(r) { return r.score > 0; })
    .sort(function(a, b) { return b.score - a.score; })
    .map(function(r) { return r.product; });
  }

  function init() {
    var overlay = document.getElementById('search-overlay');
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');
    var closeBtn = document.getElementById('search-close');
    var openBtns = document.querySelectorAll('[data-search-open]');
    var headerSearch = document.getElementById('header-search');
    var headerForm = headerSearch && headerSearch.closest('form');

    if (!overlay || !input) return;

    var debounceTimer = null;

    function openSearch() {
      overlay.classList.remove('hidden');
      overlay.classList.add('flex');
      document.body.style.overflow = 'hidden';
      setTimeout(function() { input.focus(); }, 100);
      loadIndex();
    }

    function closeSearch() {
      overlay.classList.add('hidden');
      overlay.classList.remove('flex');
      document.body.style.overflow = '';
      input.value = '';
      results.innerHTML = '';
    }

    for (var i = 0; i < openBtns.length; i++) {
      openBtns[i].addEventListener('click', function(e) {
        e.preventDefault();
        openSearch();
      });
    }

    if (headerSearch) {
      headerSearch.addEventListener('focus', function(e) {
        e.preventDefault();
        openSearch();
        headerSearch.blur();
      });
    }

    if (headerForm) {
      headerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        openSearch();
        if (input) {
          input.value = headerSearch.value;
          input.dispatchEvent(new Event('input'));
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeSearch);
    }

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeSearch();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
        closeSearch();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (overlay.classList.contains('hidden')) {
          openSearch();
        } else {
          closeSearch();
        }
      }
    });

    input.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {
        var query = input.value.trim();
        if (query.length < 2) {
          results.innerHTML = '';
          return;
        }

        var matches = searchProducts(query);
        var base = getBasePath();

        if (matches.length === 0) {
          results.innerHTML = '<div class="text-center py-8 text-zinc-500" data-i18n="search.noResults">' + _t("search.noResultsFor","No products found for") + ' "' + query.replace(/</g, '&lt;') + '"</div>';
          return;
        }

        var html = '';
        for (var j = 0; j < Math.min(matches.length, 10); j++) {
          var p = matches[j];
          var img = p.image || (base + 'images/products/10034.webp');
          if (img.indexOf('http') !== 0 && img.indexOf('/') !== 0) img = base + img.replace('../', '');
          html += '<a href="' + base + 'products/product.html?sku=' + encodeURIComponent(p.sku) + '" class="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">';
          html += '<img src="' + img + '" alt="" class="w-12 h-12 object-contain rounded bg-zinc-900"/>';
          html += '<div class="flex-1 min-w-0">';
          html += '<div class="text-white font-medium text-sm truncate">' + (p.name || p.sku) + '</div>';
          html += '<div class="text-zinc-500 text-xs">' + (p.sku || '') + ' &middot; ' + (p.categoryLabel || p.category || '') + '</div>';
          html += '</div>';
          html += '</a>';
        }

        results.innerHTML = html;
      }, 300);
    });
  }

  return { init: init, loadIndex: loadIndex, search: searchProducts };
})();

document.addEventListener('DOMContentLoaded', function() {
  SearchEngine.init();
});

document.addEventListener('languageChanged', function() {
  var overlay = document.getElementById('search-overlay');
  if (!overlay) return;
  var input = document.getElementById('search-input');
  if (input && !input.value) {
    input.setAttribute('placeholder', _t('search.placeholder', 'Search products by name, SKU, or category...'));
  }
  if (typeof i18n !== 'undefined' && i18n.applyTranslations) {
    i18n.applyTranslations();
  }
});
