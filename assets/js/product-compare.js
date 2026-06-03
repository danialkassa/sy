(function() {
  'use strict';
  var STORAGE_KEY = 'ns-compare';
  var MAX_ITEMS = 3;
  var _t = function(key, fallback) {
    if (typeof i18n !== 'undefined' && i18n.t) { var val = i18n.t(key); return val && val !== key ? val : fallback; }
    return fallback;
  };

  function getCompareList() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveCompareList(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function renderFab() {
    var list = getCompareList();
    var fab = document.getElementById('compare-fab');
    var countEl = document.getElementById('compare-count');
    if (!fab || !countEl) return;
    if (list.length >= 2) {
      fab.classList.remove('hidden');
      countEl.textContent = list.length;
    } else {
      fab.classList.add('hidden');
    }
  }

  function updateCheckboxes() {
    var list = getCompareList();
    var cbs = document.querySelectorAll('.compare-checkbox');
    for (var i = 0; i < cbs.length; i++) {
      var sku = cbs[i].getAttribute('data-compare-sku') || '';
      cbs[i].checked = list.indexOf(sku) >= 0;
    }
  }

  function toggleCompareItem(sku) {
    if (!sku) return;
    var list = getCompareList();
    var idx = list.indexOf(sku);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      if (list.length >= MAX_ITEMS) {
        list.shift();
      }
      list.push(sku);
    }
    saveCompareList(list);
    updateCheckboxes();
    renderFab();
  }

  function clearCompare() {
    localStorage.removeItem(STORAGE_KEY);
    updateCheckboxes();
    renderFab();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function openCompareOverlay() {
    var overlay = document.getElementById('compare-overlay');
    if (!overlay) return;
    var list = getCompareList();
    if (list.length < 2) return;

    var content = document.getElementById('compare-content');
    if (!content) return;

    content.innerHTML = '<div class="text-center py-10"><div class="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div><p class="text-zinc-400">" + _t("compare.loadingComparison","Loading comparison...") + "</p></div>';
    overlay.classList.remove('hidden');

    var base = window.location.pathname.indexOf('/products/') >= 0 ? '../' : '';
    var promises = list.map(function(sku) {
      var safeSku = sku.replace(/\//g, '-');
      return fetch(base + 'content/products/' + safeSku + '.json')
        .then(function(r) { return r.json(); })
        .catch(function() { return null; });
    });

    Promise.all(promises).then(function(products) {
      var valid = products.filter(Boolean);
      if (valid.length < 2) {
        content.innerHTML = '<div class="text-center py-10 text-zinc-400">" + _t("compare.notEnoughData","Not enough products with data to compare.") + "</div>';
        return;
      }

      var allSpecKeys = [];
      valid.forEach(function(p) {
        if (p.specs) {
          Object.keys(p.specs).forEach(function(k) {
            if (allSpecKeys.indexOf(k) < 0) allSpecKeys.push(k);
          });
        }
      });

      var colWidth = valid.length === 2 ? 'md:w-1/2' : 'md:w-1/3';
      var html = '<div class="flex flex-col md:flex-row gap-4 overflow-x-auto">';

      valid.forEach(function(p, colIdx) {
        html += '<div class="' + colWidth + ' min-w-[280px] bg-zinc-900 border border-zinc-800 rounded-xl p-5">';
        html += '<div class="flex items-center justify-between mb-3">';
        html += '<h3 class="font-oswald text-lg font-bold text-white">' + escapeHtml(p.name || '') + '</h3>';
        html += '<button type="button" class="compare-remove text-zinc-500 hover:text-red-400 text-sm" data-sku="' + escapeHtml(p.sku || '') + '">&#10005; Remove</button>';
        html += '</div>';
        html += '<img src="' + (p.images && p.images[0] ? p.images[0] : '../images/placeholder.jpg') + '" alt="' + escapeHtml(p.name || '') + '" class="w-full aspect-square object-cover rounded-lg mb-3"/>';
        html += '<p class="text-xs text-yellow-400/80 uppercase tracking-wider font-semibold mb-1">' + escapeHtml(p.brand || '') + '</p>';
        html += '<p class="text-xs text-zinc-500 mb-1">SKU: ' + escapeHtml(p.sku || '') + '</p>';
        html += '<p class="text-xs text-zinc-500 mb-1">Category: ' + escapeHtml(p.categoryLabel || p.category || '') + '</p>';
        html += '<p class="text-xs text-zinc-500 mb-2">MOQ: ' + escapeHtml(p.moq || '') + ' | Lead: ' + escapeHtml(p.leadTime || '') + '</p>';
        if (p.userBenefits && p.userBenefits.length) {
          html += '<div class="mt-3"><p class="text-xs font-semibold text-zinc-300 mb-1">" + _t("compare.benefits","Benefits") + "</p><ul class="text-xs text-zinc-400 space-y-1">';
          p.userBenefits.forEach(function(b) { html += '<li class="flex items-start gap-1"><span class="text-green-400">&#10003;</span> ' + escapeHtml(b) + '</li>'; });
          html += '</ul></div>';
        }
        html += '</div>';
      });

      html += '</div>';

      if (allSpecKeys.length) {
        html += '<div class="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5 overflow-x-auto">';
        html += '<h3 class="font-oswald text-lg font-bold text-white mb-4">" + _t("compare.specificationsComparison","Specifications Comparison") + "</h3>';
        html += '<table class="compare-table w-full min-w-[500px]">';
        html += '<thead><tr><th class="text-left text-zinc-400 text-xs uppercase tracking-wider py-2 pr-4">Spec</th>';
        valid.forEach(function(p) {
          html += '<th class="text-left text-white text-xs font-semibold py-2 pr-4">' + escapeHtml(p.name || '').substring(0, 30) + '</th>';
        });
        html += '</tr></thead><tbody>';

        allSpecKeys.forEach(function(key) {
          var values = valid.map(function(p) { return p.specs && p.specs[key] ? p.specs[key] : '-'; });
          var allSame = values.every(function(v, i) { return i === 0 || v === values[0]; });
          html += '<tr class="border-b border-zinc-800' + (allSame ? '' : ' bg-yellow-400/5') + '">';
          html += '<td class="py-2 pr-4 text-zinc-400 text-xs">' + escapeHtml(key) + '</td>';
          values.forEach(function(v) {
            html += '<td class="py-2 pr-4 text-white text-xs font-medium">' + escapeHtml(v) + '</td>';
          });
          html += '</tr>';
        });

        html += '</tbody></table></div>';
      }

      content.innerHTML = html;

      var removeBtns = content.querySelectorAll('.compare-remove');
      for (var i = 0; i < removeBtns.length; i++) {
        removeBtns[i].addEventListener('click', function() {
          var sku = this.getAttribute('data-sku');
          toggleCompareItem(sku);
          openCompareOverlay();
        });
      }
    });
  }

  function closeCompareOverlay() {
    var overlay = document.getElementById('compare-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  document.addEventListener('DOMContentLoaded', function() {
    var cards = document.querySelectorAll('[data-quote-sku]');
    cards.forEach(function(card) {
      if (card.querySelector('.compare-card-checkbox')) return;
      var sku = card.getAttribute('data-quote-sku') || '';
      if (!sku) return;
      var label = document.createElement('label');
      label.className = 'compare-card-checkbox absolute top-3 left-3 z-10 flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-zinc-900/80 backdrop-blur-sm rounded-md px-2 py-1 cursor-pointer';
      label.innerHTML = '<input type="checkbox" class="compare-checkbox" data-compare-sku="' + sku + '"/> <span>" + _t("compare.compare","Compare") + "</span>';
      var imageContainer = card.querySelector('.aspect-square');
      if (imageContainer) {
        imageContainer.style.position = 'relative';
        imageContainer.appendChild(label);
      }
    });
    updateCheckboxes();

    var overlayHTML = '<div id="compare-overlay" class="fixed inset-0 z-[100] bg-zinc-950/98 hidden overflow-y-auto">' +
      '<div class="container mx-auto px-4 py-8">' +
        '<div class="flex justify-between items-center mb-6">' +
          '<h2 class="font-oswald text-2xl font-bold text-white">" + _t("compare.title","Product Comparison") + "</h2>' +
          '<div class="flex gap-3">' +
            '<button id="compare-clear" class="text-sm text-zinc-400 hover:text-yellow-400">" + _t("compare.clearAll","Clear All") + "</button>' +
            '<button id="compare-close" class="text-zinc-400 hover:text-white">' +
              '<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div id="compare-content" class="overflow-x-auto"></div>' +
      '</div>' +
    '</div>';

    var fabHTML = '<div id="compare-fab" class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 hidden" style="z-index:80">' +
      '<button type="button" class="flex items-center gap-2 bg-yellow-400 text-zinc-950 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-yellow-500 transition-colors">' +
        '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6 0V9a2 2 0 012-2h2a2 2 0 012 2v10m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4"/></svg>' +
        '" + _t("compare.compare","Compare") + " (<span id="compare-count">0</span>)' +
      '</button>' +
    '</div>';

    var temp = document.createElement('div');
    temp.innerHTML = overlayHTML + fabHTML;
    while (temp.firstChild) {
      document.body.appendChild(temp.firstChild);
    }

    updateCheckboxes();

    document.body.addEventListener('change', function(e) {
      if (e.target && e.target.classList.contains('compare-checkbox')) {
        toggleCompareItem(e.target.getAttribute('data-compare-sku'));
      }
    });

    var fabBtn = document.querySelector('#compare-fab button');
    if (fabBtn) fabBtn.addEventListener('click', openCompareOverlay);

    var clearBtn = document.getElementById('compare-clear');
    if (clearBtn) clearBtn.addEventListener('click', function() { clearCompare(); closeCompareOverlay(); });

    var closeBtn = document.getElementById('compare-close');
    if (closeBtn) closeBtn.addEventListener('click', closeCompareOverlay);

    var overlay = document.getElementById('compare-overlay');
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeCompareOverlay();
      });
    }

    if (typeof i18n !== 'undefined' && i18n.applyTranslations) i18n.applyTranslations();

    document.addEventListener('languageChanged', function() {
      if (typeof i18n !== 'undefined' && i18n.applyTranslations) i18n.applyTranslations();
      var overlay = document.getElementById('compare-overlay');
      if (overlay && !overlay.classList.contains('hidden')) openCompareOverlay();
    });
  });
})();
