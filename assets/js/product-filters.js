var ProductFilters = (function() {
  var activeFilters = {};

  function init() {
    var filterBar = document.getElementById('product-filter-bar');
    if (!filterBar) return;

    var cards = document.querySelectorAll('[data-filter-category]');
    if (cards.length === 0) return;

    buildFilterUI(filterBar, cards);
    restoreFromURL();
    applyFilters();
    bindEvents(filterBar);
  }

  function getFilterableAttributes(cards) {
    var attrs = {};
    cards.forEach(function(card) {
      var attrsOnCard = card.attributes;
      for (var i = 0; i < attrsOnCard.length; i++) {
        var name = attrsOnCard[i].name;
        if (name.indexOf('data-filter-') === 0) {
          var key = name.replace('data-filter-', '');
          if (!attrs[key]) attrs[key] = new Set();
          attrs[key].add(attrsOnCard[i].value);
        }
      }
    });
    return attrs;
  }

  function buildFilterUI(filterBar, cards) {
    var attrs = getFilterableAttributes(cards);
    var labels = {
      voltage: 'Voltage',
      motor: 'Motor',
      power: 'Power',
      type: 'Type',
      discsize: 'Disc Size',
      padsize: 'Pad Size',
      drive: 'Drive',
      pieces: 'Pieces'
    };

    filterBar.innerHTML = '';

    var countEl = document.createElement('div');
    countEl.id = 'filter-count';
    countEl.className = 'text-sm text-zinc-400 mr-4 flex-shrink-0';
    filterBar.appendChild(countEl);

    for (var key in attrs) {
      if (!attrs.hasOwnProperty(key)) continue;
      var values = Array.from(attrs[key]).sort();

      var wrapper = document.createElement('div');
      wrapper.className = 'relative';

      var btn = document.createElement('button');
      btn.className = 'flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:border-yellow-400 hover:text-yellow-400 transition-colors';
      btn.setAttribute('data-filter-toggle', key);
      btn.innerHTML = (labels[key] || key) + ' <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';

      var dropdown = document.createElement('div');
      dropdown.className = 'hidden absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl shadow-black/50 z-30 min-w-[140px] py-1';
      dropdown.setAttribute('data-filter-dropdown', key);

      var allBtn = document.createElement('button');
      allBtn.className = 'w-full text-left px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors';
      allBtn.textContent = 'All';
      allBtn.setAttribute('data-filter-value', '');
      allBtn.setAttribute('data-filter-key', key);
      dropdown.appendChild(allBtn);

      for (var v = 0; v < values.length; v++) {
        var opt = document.createElement('button');
        opt.className = 'w-full text-left px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors';
        opt.textContent = values[v];
        opt.setAttribute('data-filter-value', values[v]);
        opt.setAttribute('data-filter-key', key);
        dropdown.appendChild(opt);
      }

      wrapper.appendChild(btn);
      wrapper.appendChild(dropdown);
      filterBar.appendChild(wrapper);
    }

    var clearBtn = document.createElement('button');
    clearBtn.id = 'filter-clear';
    clearBtn.className = 'text-sm text-zinc-500 hover:text-yellow-400 transition-colors ml-2 flex-shrink-0';
    clearBtn.textContent = 'Clear All';
    clearBtn.style.display = 'none';
    filterBar.appendChild(clearBtn);
  }

  function bindEvents(filterBar) {
    filterBar.addEventListener('click', function(e) {
      var toggleBtn = e.target.closest('[data-filter-toggle]');
      var optionBtn = e.target.closest('[data-filter-value]');
      var clearBtn = e.target.closest('#filter-clear');

      if (optionBtn) {
        var key = optionBtn.getAttribute('data-filter-key');
        var value = optionBtn.getAttribute('data-filter-value');

        if (value === '') {
          delete activeFilters[key];
        } else {
          activeFilters[key] = value;
        }

        var dropdown = filterBar.querySelector('[data-filter-dropdown="' + key + '"]');
        if (dropdown) dropdown.classList.add('hidden');

        updateToggleLabels();
        applyFilters();
        saveToURL();
        return;
      }

      if (toggleBtn) {
        var filterKey = toggleBtn.getAttribute('data-filter-toggle');
        var allDropdowns = filterBar.querySelectorAll('[data-filter-dropdown]');
        for (var i = 0; i < allDropdowns.length; i++) {
          if (allDropdowns[i].getAttribute('data-filter-dropdown') === filterKey) {
            allDropdowns[i].classList.toggle('hidden');
          } else {
            allDropdowns[i].classList.add('hidden');
          }
        }
        return;
      }

      if (clearBtn) {
        activeFilters = {};
        updateToggleLabels();
        applyFilters();
        saveToURL();
        return;
      }

      var allDropdowns2 = filterBar.querySelectorAll('[data-filter-dropdown]');
      for (var j = 0; j < allDropdowns2.length; j++) {
        allDropdowns2[j].classList.add('hidden');
      }
    });

    document.addEventListener('click', function(e) {
      if (!filterBar.contains(e.target)) {
        var allDropdowns = filterBar.querySelectorAll('[data-filter-dropdown]');
        for (var i = 0; i < allDropdowns.length; i++) {
          allDropdowns[i].classList.add('hidden');
        }
      }
    });
  }

  function updateToggleLabels() {
    var toggles = document.querySelectorAll('[data-filter-toggle]');
    for (var i = 0; i < toggles.length; i++) {
      var key = toggles[i].getAttribute('data-filter-toggle');
      if (activeFilters[key]) {
        toggles[i].classList.add('border-yellow-400', 'text-yellow-400');
        toggles[i].classList.remove('border-zinc-700', 'text-zinc-300');
      } else {
        toggles[i].classList.remove('border-yellow-400', 'text-yellow-400');
        toggles[i].classList.add('border-zinc-700', 'text-zinc-300');
      }
    }

    var clearBtn = document.getElementById('filter-clear');
    if (clearBtn) {
      clearBtn.style.display = Object.keys(activeFilters).length > 0 ? '' : 'none';
    }
  }

  function applyFilters() {
    var cards = document.querySelectorAll('[data-filter-category]');
    var visible = 0;
    var total = cards.length;

    cards.forEach(function(card) {
      var show = true;
      for (var key in activeFilters) {
        if (!activeFilters.hasOwnProperty(key)) continue;
        var cardVal = card.getAttribute('data-filter-' + key);
        if (!cardVal || cardVal.toLowerCase() !== activeFilters[key].toLowerCase()) {
          show = false;
          break;
        }
      }

      if (show) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    var countEl = document.getElementById('filter-count');
    if (countEl) {
      countEl.textContent = 'Showing ' + visible + ' of ' + total + ' products';
    }
  }

  function saveToURL() {
    var params = new URLSearchParams();
    for (var key in activeFilters) {
      if (activeFilters.hasOwnProperty(key) && activeFilters[key]) {
        params.set(key, activeFilters[key]);
      }
    }
    var newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    history.replaceState(null, '', newUrl);
  }

  function restoreFromURL() {
    var params = new URLSearchParams(window.location.search);
    params.forEach(function(value, key) {
      activeFilters[key] = value;
    });
    updateToggleLabels();
  }

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', function() {
  ProductFilters.init();
});

document.addEventListener('languageChanged', function() {
  var countEl = document.getElementById('filter-count');
  if (!countEl) return;
  var cards = document.querySelectorAll('[data-filter-category]');
  var visible = 0;
  cards.forEach(function(card) {
    if (card.style.display !== 'none') visible++;
  });
  var showingText = (typeof i18n !== 'undefined' && i18n.t) ? i18n.t('products.showing', 'Showing') : 'Showing';
  var ofText = (typeof i18n !== 'undefined' && i18n.t) ? i18n.t('products.of', 'of') : 'of';
  var productsText = (typeof i18n !== 'undefined' && i18n.t) ? i18n.t('products.products', 'products') : 'products';
  countEl.textContent = showingText + ' ' + visible + ' ' + ofText + ' ' + cards.length + ' ' + productsText;

  var clearBtn = document.getElementById('filter-clear');
  if (clearBtn) {
    clearBtn.textContent = (typeof i18n !== 'undefined' && i18n.t) ? i18n.t('common.clearAll', 'Clear All') : 'Clear All';
  }

  if (typeof i18n !== 'undefined' && i18n.applyTranslations) {
    i18n.applyTranslations();
  }
});
