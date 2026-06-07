(function () {
  'use strict';

  if (window.__compareLoaded) return;
  window.__compareLoaded = true;

  var MAX_COMPARE = 3;
  var STORAGE_KEY = 'pm-compare-items';

  var COMPARE_FIELDS = [
    { key: 'power',          label: 'Power (W)' },
    { key: 'voltage',        label: 'Voltage' },
    { key: 'noLoadSpeed',    label: 'RPM' },
    { key: 'discSize',       label: 'Disc Size' },
    { key: 'weightToolOnly', label: 'Weight' },
    { key: 'priceRange',     label: 'Price Range' },
    { key: 'certifications', label: 'Certifications' },
    { key: 'moq',            label: 'MOQ' }
  ];

  function loadItems() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) { return []; }
  }

  function saveItems(items) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
  }

  function isSelected(sku) {
    return loadItems().some(function (p) { return p.sku === sku; });
  }

  function addItem(product) {
    var items = loadItems();
    if (items.length >= MAX_COMPARE) return false;
    if (items.some(function (p) { return p.sku === product.sku; })) return false;
    items.push(product);
    saveItems(items);
    return true;
  }

  function removeItem(sku) {
    var items = loadItems().filter(function (p) { return p.sku !== sku; });
    saveItems(items);
  }

  /* ── Bar HTML ── */
  function renderBar() {
    var bar = document.getElementById('pm-compare-bar');
    if (!bar) return;
    var items = loadItems();
    if (items.length === 0) {
      bar.style.transform = 'translateY(100%)';
      return;
    }
    bar.style.transform = 'translateY(0)';

    var slots = '';
    for (var i = 0; i < MAX_COMPARE; i++) {
      var p = items[i];
      if (p) {
        slots += '<div class="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">' +
          '<img src="' + (p.image || '') + '" alt="" class="w-10 h-10 object-cover rounded"/>' +
          '<span class="text-xs font-medium text-white max-w-[80px] truncate">' + (p.name || p.sku) + '</span>' +
          '<button data-remove-sku="' + p.sku + '" class="text-zinc-400 hover:text-red-400 transition-colors ml-1 text-lg leading-none">&times;</button>' +
          '</div>';
      } else {
        slots += '<div class="flex items-center justify-center w-24 h-14 border border-dashed border-zinc-600 rounded-lg">' +
          '<span class="text-xs text-zinc-600">Empty</span>' +
          '</div>';
      }
    }

    document.getElementById('pm-compare-slots').innerHTML = slots;
    var countEl = document.getElementById('pm-compare-count');
    if (countEl) countEl.textContent = items.length + ' / ' + MAX_COMPARE;

    var btn = document.getElementById('pm-compare-now');
    if (btn) {
      btn.disabled = items.length < 2;
      btn.className = items.length >= 2
        ? 'px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-bold text-sm rounded-lg transition-colors cursor-pointer'
        : 'px-4 py-2 bg-zinc-700 text-zinc-500 font-bold text-sm rounded-lg cursor-not-allowed';
    }
  }

  /* ── Modal HTML ── */
  function openModal() {
    var items = loadItems();
    if (items.length < 2) return;

    var modal = document.getElementById('pm-compare-modal');
    if (!modal) return;

    var cols = items.map(function (p) {
      return '<th class="sticky top-0 bg-zinc-900 z-10 px-4 py-3 text-left min-w-[160px]">' +
        '<div class="flex flex-col gap-1">' +
        '<img src="' + (p.image || '') + '" alt="" class="w-full h-28 object-cover rounded-lg mb-1"/>' +
        '<span class="text-xs font-semibold text-yellow-400">' + (p.brand || '') + '</span>' +
        '<span class="text-sm font-bold text-white leading-snug">' + (p.name || p.sku) + '</span>' +
        '<a href="product.html?sku=' + p.sku + '" class="text-xs text-zinc-400 hover:text-yellow-400 mt-1 transition-colors">View Details &rarr;</a>' +
        '</div>' +
        '</th>';
    }).join('');

    var rows = COMPARE_FIELDS.map(function (field) {
      var cells = items.map(function (p) {
        var specVal = (p.specs && p.specs[field.key]) ? p.specs[field.key] : (p[field.key] || '—');
        return '<td class="px-4 py-3 text-sm text-zinc-300 border-b border-zinc-800">' + specVal + '</td>';
      }).join('');
      return '<tr class="hover:bg-zinc-800/50 transition-colors">' +
        '<td class="sticky left-0 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-400 border-b border-zinc-800 whitespace-nowrap">' + field.label + '</td>' +
        cells +
        '</tr>';
    }).join('');

    document.getElementById('pm-compare-table-head').innerHTML = '<tr><th class="sticky left-0 top-0 bg-zinc-900 z-20 px-4 py-3 text-left text-xs text-zinc-500 uppercase">Spec</th>' + cols + '</tr>';
    document.getElementById('pm-compare-table-body').innerHTML = rows;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    var modal = document.getElementById('pm-compare-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }

  /* ── Inject compare bar and modal into DOM ── */
  function injectUI() {
    if (document.getElementById('pm-compare-bar')) return;

    var bar = document.createElement('div');
    bar.id = 'pm-compare-bar';
    bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9000;transform:translateY(100%);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);background:#18181b;border-top:1px solid #3f3f46;padding:12px 16px;';
    bar.innerHTML =
      '<div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">' +
      '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">' +
      '<span style="font-size:13px;font-weight:600;color:#facc15;white-space:nowrap;">Compare</span>' +
      '<span id="pm-compare-count" style="font-size:12px;color:#71717a;"></span>' +
      '<div id="pm-compare-slots" style="display:flex;gap:8px;flex-wrap:wrap;"></div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;align-items:center;">' +
      '<button id="pm-compare-now" disabled style="padding:8px 16px;background:#3f3f46;color:#71717a;font-weight:700;font-size:13px;border-radius:8px;border:none;cursor:not-allowed;">Compare Now</button>' +
      '<button id="pm-compare-clear" style="padding:8px 12px;background:transparent;color:#71717a;font-size:13px;border-radius:8px;border:1px solid #3f3f46;cursor:pointer;">Clear</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(bar);

    var modal = document.createElement('div');
    modal.id = 'pm-compare-modal';
    modal.className = 'hidden';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9100;background:rgba(0,0,0,0.85);align-items:center;justify-content:center;padding:16px;';
    modal.innerHTML =
      '<div style="background:#18181b;border:1px solid #3f3f46;border-radius:16px;width:100%;max-width:900px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #3f3f46;">' +
      '<h2 style="font-family:Oswald,sans-serif;font-size:20px;font-weight:700;color:#fff;">Product Comparison</h2>' +
      '<button id="pm-compare-modal-close" style="font-size:24px;color:#71717a;background:none;border:none;cursor:pointer;line-height:1;">&times;</button>' +
      '</div>' +
      '<div style="overflow:auto;flex:1;">' +
      '<table style="width:100%;border-collapse:collapse;">' +
      '<thead id="pm-compare-table-head"></thead>' +
      '<tbody id="pm-compare-table-body"></tbody>' +
      '</table>' +
      '</div>' +
      '</div>';
    document.body.appendChild(modal);

    document.getElementById('pm-compare-now').addEventListener('click', openModal);
    document.getElementById('pm-compare-clear').addEventListener('click', function () {
      saveItems([]);
      updateAllCheckboxes();
      renderBar();
    });
    document.getElementById('pm-compare-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    bar.addEventListener('click', function (e) {
      var sku = e.target.dataset.removeSku;
      if (sku) {
        removeItem(sku);
        updateAllCheckboxes();
        renderBar();
      }
    });
  }

  function updateAllCheckboxes() {
    document.querySelectorAll('[data-compare-sku]').forEach(function (cb) {
      cb.checked = isSelected(cb.dataset.compareSku);
    });
  }

  /* ── Public: attach to a product card ── */
  window.attachCompareCheckbox = function (cardEl, product) {
    if (!product || !product.sku) return;
    if (cardEl.querySelector('[data-compare-sku]')) return;

    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:absolute;top:8px;right:8px;z-index:10;';

    var label = document.createElement('label');
    label.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;background:rgba(24,24,27,0.85);border:1px solid #3f3f46;border-radius:6px;padding:4px 8px;backdrop-filter:blur(4px);';
    label.title = 'Add to Compare';

    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.compareSku = product.sku;
    cb.checked = isSelected(product.sku);
    cb.style.cssText = 'accent-color:#facc15;width:14px;height:14px;cursor:pointer;';

    var span = document.createElement('span');
    span.style.cssText = 'font-size:11px;font-weight:600;color:#a1a1aa;white-space:nowrap;';
    span.textContent = 'Compare';

    label.appendChild(cb);
    label.appendChild(span);
    wrapper.appendChild(label);

    var imgContainer = cardEl.querySelector('.relative.aspect-square, .relative.overflow-hidden');
    if (imgContainer) {
      if (getComputedStyle(imgContainer).position === 'static') {
        imgContainer.style.position = 'relative';
      }
      imgContainer.appendChild(wrapper);
    } else {
      cardEl.style.position = 'relative';
      cardEl.appendChild(wrapper);
    }

    cb.addEventListener('change', function () {
      if (cb.checked) {
        var added = addItem(product);
        if (!added) {
          cb.checked = false;
          var msg = document.createElement('div');
          msg.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#ef4444;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;z-index:9999;';
          msg.textContent = 'Maximum 3 products can be compared.';
          document.body.appendChild(msg);
          setTimeout(function () { document.body.removeChild(msg); }, 2000);
        }
      } else {
        removeItem(product.sku);
      }
      renderBar();
    });
  };

  /* ── Init ── */
  function init() {
    injectUI();
    renderBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
