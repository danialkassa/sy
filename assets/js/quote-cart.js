/**
 * Quote Cart — B2B quote request cart
 * Persisted to localStorage. Works across all pages.
 * Products can be added, quantities adjusted, and the full list
 * can be sent as a professional quote-request via POST.
 */
(function() {
  'use strict';

  var _t = function(key, fallback) {
    if (typeof i18n !== 'undefined' && i18n.t) { var val = i18n.t(key); return val && val !== key ? val : fallback; }
    return fallback;
  };

  var STORAGE_KEY = 'sy_quote_cart';

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveCart(items) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
    catch (e) {}
  }

  function getCount() {
    return loadCart().reduce(function(s, i) { return s + i.quantity; }, 0);
  }

  // ── Build a professional email body from cart items (fallback) ────────────
  function buildPlainTextBody(name, company) {
    var items = loadCart();
    var total = items.reduce(function(s, i) { return s + i.quantity; }, 0);
    var notesEl = document.getElementById('quote-notes');
    var notes = notesEl ? notesEl.value.trim() : '';
    var lines = [];
    lines.push(_t("quote.greeting","Hello Ningbo Siyang Team,"));
    lines.push('');
    lines.push((name || _t("quote.defaultCustomer","A customer")) + (company ? ' ' + _t("quote.from","from") + ' ' + company : '') + ' ' + _t("quote.requestedQuote","has requested a quote for the following items:"));
    lines.push('');
    items.forEach(function(item, idx) {
      lines.push('  ' + (idx + 1) + '. ' + item.name);
      lines.push('     SKU: ' + item.sku + '  |  Qty: ' + item.quantity + (item.brand ? '  |  Brand: ' + item.brand : ''));
    });
    lines.push('');
    lines.push('-------------------------------------------');
    lines.push(_t("quote.totalItems","Total Items") + ': ' + total);
    if (notes) {
      lines.push('');
      lines.push(_t("quote.additionalRequirements","Additional Requirements:"));
      lines.push(notes);
    }
    lines.push('');
    lines.push(_t("quote.pricingRequest","Please provide pricing and estimated lead time."));
    lines.push('');
    lines.push(_t("quote.thankYou","Thank you,"));
    if (name) lines.push(name);
    return lines.join('\n');
  }

  function buildEmailBody(name, company) {
    return encodeURIComponent(buildPlainTextBody(name, company));
  }

  function buildMailtoUrl(name, company) {
    var recipient = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.email) ? SITE_CONFIG.email : 'sales@ningbosiyang.com';
    var subject = encodeURIComponent(_t("quote.subject", "Quote Request – Ningbo Siyang"));
    var body = buildEmailBody(name, company);
    return 'mailto:' + recipient + '?subject=' + subject + '&body=' + body;
  }

  // ── Show send confirmation ───────────────────────────────────────────────
  function showConfirmation() {
    var body = document.getElementById('quote-drawer-body');
    var footer = document.getElementById('quote-drawer-footer');
    if (!body || !footer) return;
    var recipient = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.email) ? SITE_CONFIG.email : 'sales@ningbosiyang.com';

    body.innerHTML =
      '<div class="flex flex-col items-center justify-center h-full text-center px-6 py-10">' +
        '<div class="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-5">' +
          '<svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>' +
        '</div>' +
        '<h3 class="text-lg font-bold text-white mb-2">' + _t("quote.quotePrepared","Quote Request Prepared!") + '</h3>' +
        '<p class="text-sm text-zinc-400 mb-4">' + _t("quote.quotePreparedDesc","Your quote request has been prepared. Send the email that was opened in your email client, or copy the details and paste them into an email to") + ' <span class="text-yellow-400">' + recipient + '</span></p>' +
        '<button onclick="quoteCart.copyQuoteToClipboard()" id="quote-copy-btn" class="inline-flex items-center justify-center h-10 px-5 bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 font-semibold rounded-md transition-colors text-sm mb-3">' +
          '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
          _t("quote.copyQuoteDetails","Copy Quote Details") +
        '</button>' +
        '<span id="quote-copy-feedback" class="text-xs text-green-400 hidden mb-4">' + _t("quote.copiedToClipboard","Copied to clipboard!") + '</span>' +
        '<button onclick="quoteCart.close()" class="inline-flex items-center justify-center h-10 px-6 bg-yellow-400 text-zinc-900 hover:bg-yellow-300 font-semibold rounded-md transition-colors">' + _t("quote.continueShopping","Continue shopping") + '</button>' +
      '</div>';
    footer.innerHTML =
      '<p class="text-center text-xs text-zinc-500">' + _t("quote.cartCleared","Your cart has been cleared. You can always add items again later.") + '</p>';
  }

  // ── Show error message ───────────────────────────────────────────────────
  function showError(msg) {
    var errorEl = document.getElementById('quote-send-error');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
      setTimeout(function() { errorEl.classList.add('hidden'); }, 5000);
    }
  }

  // ── Inject drawer HTML ───────────────────────────────────────────────────
  function injectDrawer() {
    if (document.getElementById('quote-drawer')) return;
    var drawer = document.createElement('div');
    drawer.id = 'quote-drawer';
    drawer.className = 'fixed inset-0 z-50 hidden';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', _t("quote.title","Quote cart"));
    drawer.innerHTML =
      '<div class="quote-backdrop absolute inset-0 bg-black opacity-60 backdrop-blur-sm transition-opacity opacity-0" onclick="quoteCart.close()"></div>' +
      '<div class="quote-panel absolute top-0 right-0 h-full w-full bg-zinc-950 border-l border-zinc-800 shadow-2xl transform translate-x-full transition-transform duration-300 ease-out flex flex-col" style="max-width:440px">' +
        '<div class="flex items-center justify-between p-5 border-b border-zinc-800 shrink-0">' +
          '<div class="flex items-center gap-3">' +
            '<div class="relative">' +
              '<svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>' +
              '<span id="quote-drawer-badge" class="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 text-zinc-900 text-xs font-bold rounded-full flex items-center justify-center hidden">0</span>' +
            '</div>' +
            '<div>' +
              '<h2 class="font-oswald text-lg font-bold text-white">' + _t("quote.title","Quote Cart") + '</h2>' +
              '<p class="text-xs text-zinc-500"><span id="quote-drawer-count">0</span> ' + _t("quote.itemsCount","items") + '</p>' +
            '</div>' +
          '</div>' +
          '<button onclick="quoteCart.close()" aria-label="' + _t("quote.closeCart","Close quote cart") + '" class="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">' +
            '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div id="quote-drawer-body" class="flex-1 overflow-y-auto p-4">' +
        '</div>' +
        '<div id="quote-drawer-footer" class="border-t border-zinc-800 p-5 shrink-0">' +
        '</div>' +
      '</div>';
    document.body.appendChild(drawer);
  }

  // ── Render ───────────────────────────────────────────────────────────────
  function render() {
    var items = loadCart();
    var body = document.getElementById('quote-drawer-body');
    var footer = document.getElementById('quote-drawer-footer');
    var countEl = document.getElementById('quote-drawer-count');
    var badgeEl = document.getElementById('quote-drawer-badge');
    var headerBadge = document.getElementById('quote-header-badge');

    var total = items.reduce(function(s, i) { return s + i.quantity; }, 0);
    if (countEl) countEl.textContent = total;
    if (badgeEl) { badgeEl.textContent = total; badgeEl.classList.toggle('hidden', total === 0); }
    if (headerBadge) { headerBadge.textContent = total; headerBadge.classList.toggle('hidden', total === 0); }

    if (!body || !footer) return;

    if (items.length === 0) {
      body.innerHTML =
        '<div class="flex flex-col items-center justify-center h-full text-center px-6">' +
          '<div class="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-6">' +
            '<svg class="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>' +
          '</div>' +
          '<h3 class="text-lg font-semibold text-white mb-2">' + _t("quote.empty","Your quote cart is empty") + '</h3>' +
          '<p class="text-sm text-zinc-500 mb-6">' + _t("quote.emptyDesc","Browse our products and add items to request a quote.") + '</p>' +
          '<a href="/products/index.html" onclick="quoteCart.close()" class="inline-flex items-center justify-center h-10 px-6 bg-yellow-400 text-zinc-900 hover:bg-yellow-300 font-semibold rounded-md transition-colors">' + _t("quote.browseProducts","Browse Products") + '</a>' +
        '</div>';
      footer.innerHTML = '';
      return;
    }

    // ── Cart items list ────────────────────────────────────────────────────
    var html = items.map(function(item) {
      return '<div class="flex gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 mb-3" data-quote-sku="' + item.sku + '">' +
        '<div class="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">' +
          '<img src="' + item.image + '" alt="' + item.name + '" class="w-full h-full object-cover" onerror="this.style.display=\'none\'"/>' +
        '</div>' +
        '<div class="flex-1 min-w-0">' +
          '<div class="flex justify-between items-start">' +
            '<div class="min-w-0">' +
              '<p class="text-xs text-zinc-500">' + (item.brand || '') + '</p>' +
              '<h4 class="text-sm font-medium text-white truncate">' + item.name + '</h4>' +
            '</div>' +
            '<button onclick="quoteCart.removeItem(\'' + item.sku + '\')" aria-label="' + _t("quote.removeItem","Remove") + ' ' + item.name + '" class="text-zinc-600 hover:text-red-400 transition-colors ml-2 flex-shrink-0">' +
              '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="flex items-center justify-between mt-2">' +
            '<span class="text-xs text-zinc-400">' + _t("quote.qty","Qty") + '</span>' +
            '<div class="flex items-center bg-zinc-800 rounded-lg border border-zinc-700">' +
              '<button onclick="quoteCart.updateQty(\'' + item.sku + '\',' + (item.quantity - 1) + ')" aria-label="' + _t("quote.decreaseQty","Decrease quantity") + '" class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-l-lg transition-colors">' +
                '<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>' +
              '</button>' +
              '<input type="number" min="1" max="10000" step="1" value="' + item.quantity + '" onchange="quoteCart.updateQty(\'' + item.sku + '\', Math.max(1, parseInt(this.value)||1))" class="w-12 h-8 text-center text-sm text-white font-medium bg-zinc-900 border-0 outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]" />' +
              '<button onclick="quoteCart.updateQty(\'' + item.sku + '\',' + (item.quantity + 1) + ')" aria-label="' + _t("quote.increaseQty","Increase quantity") + '" class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-r-lg transition-colors">' +
                '<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5v14"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    // ── Additional Requirements + Contact form for quote submission ─────────
    html +=
      '<div class="mb-4">' +
        '<label class="block text-sm font-medium text-zinc-300 mb-1">' + _t("quote.additionalRequirements","Additional Requirements") + '</label>' +
        '<textarea id="quote-notes" rows="3" placeholder="' + _t("quote.requirementsPlaceholder","E.g., Need custom packaging, specific plug type, CE marking...") + '" class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none"></textarea>' +
      '</div>' +
      '<div class="mt-6 pt-4 border-t border-zinc-800">' +
        '<h3 class="text-sm font-semibold text-white mb-3">' + _t("quote.contactInfo","Your Contact Information") + '</h3>' +
        '<div id="quote-send-error" class="hidden mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs"></div>' +
        '<div class="space-y-3">' +
          '<div class="grid grid-cols-2 gap-3">' +
            '<div>' +
              '<label for="quote-contact-name" class="block text-xs text-zinc-400 mb-1">' + _t("quote.fullName","Full Name") + ' <span class="text-red-400">*</span></label>' +
              '<input type="text" id="quote-contact-name" required class="w-full h-9 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 outline-none" placeholder="' + _t("quote.namePlaceholder","John Smith") + '"/>' +
            '</div>' +
            '<div>' +
              '<label for="quote-contact-company" class="block text-xs text-zinc-400 mb-1">' + _t("quote.company","Company") + '</label>' +
              '<input type="text" id="quote-contact-company" class="w-full h-9 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 outline-none" placeholder="' + _t("quote.companyPlaceholder","Company name") + '"/>' +
            '</div>' +
          '</div>' +
          '<div class="grid grid-cols-2 gap-3">' +
            '<div>' +
              '<label for="quote-contact-email" class="block text-xs text-zinc-400 mb-1">' + _t("quote.email","Email") + ' <span class="text-red-400">*</span></label>' +
              '<input type="email" id="quote-contact-email" required class="w-full h-9 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 outline-none" placeholder="' + _t("quote.emailPlaceholder","john@example.com") + '"/>' +
            '</div>' +
            '<div>' +
              '<label for="quote-contact-phone" class="block text-xs text-zinc-400 mb-1">' + _t("quote.phone","Phone") + '</label>' +
              '<input type="tel" id="quote-contact-phone" class="w-full h-9 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 outline-none" placeholder="' + _t("quote.phonePlaceholder","+1 555 123 4567") + '"/>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<label for="quote-contact-notes" class="block text-xs text-zinc-400 mb-1">' + _t("quote.additionalNotes","Additional Notes") + '</label>' +
            '<textarea id="quote-contact-notes" rows="2" class="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 outline-none resize-none" placeholder="' + _t("quote.notesPlaceholder","Any special requirements, quantity estimates, target delivery date...") + '"></textarea>' +
          '</div>' +
        '</div>' +
      '</div>';

    body.innerHTML = html;

    // ── Footer: total + send button ────────────────────────────────────────
    footer.innerHTML =
      '<div class="space-y-3">' +
        '<div class="flex justify-between text-sm">' +
          '<span class="text-zinc-400">' + _t("quote.totalItems","Total Items") + '</span>' +
          '<span class="text-white font-semibold">' + total + '</span>' +
        '</div>' +
        '<div class="flex justify-between text-sm">' +
          '<span class="text-zinc-400">' + _t("quote.uniqueProducts","Unique Products") + '</span>' +
          '<span class="text-white font-semibold">' + items.length + '</span>' +
        '</div>' +
        '<button onclick="quoteCart.sendRequest()" class="w-full inline-flex items-center justify-center h-12 bg-yellow-400 text-zinc-900 hover:bg-yellow-300 font-bold rounded-md transition-colors text-base">' +
          '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>' +
          _t("quote.sendQuoteRequest","Send Quote Request") +
        '</button>' +
        '<div class="flex gap-2">' +
          '<button onclick="quoteCart.clear()" class="flex-1 text-sm text-zinc-500 hover:text-red-400 transition-colors py-2">' + _t("quote.clearCart","Clear cart") + '</button>' +
          '<button onclick="quoteCart.close()" class="flex-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-2">' + _t("quote.continueShopping","Continue shopping") + '</button>' +
        '</div>' +
      '</div>';
  }

  // ── Gather form data as a structured object ──────────────────────────────
  function gatherFormData() {
    return {
      name: (document.getElementById('quote-contact-name') || {}).value || '',
      email: (document.getElementById('quote-contact-email') || {}).value || '',
      company: (document.getElementById('quote-contact-company') || {}).value || '',
      phone: (document.getElementById('quote-contact-phone') || {}).value || '',
      notes: (document.getElementById('quote-contact-notes') || {}).value || ''
    };
  }

  // ── Build request payload ────────────────────────────────────────────────
  function buildPayload(formData) {
    var items = loadCart();
    var totalQty = items.reduce(function(s, i) { return s + i.quantity; }, 0);
    return {
      type: 'quote_request',
      timestamp: new Date().toISOString(),
      customer: {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        notes: formData.notes
      },
      summary: {
        uniqueProducts: items.length,
        totalQuantity: totalQty
      },
      items: items.map(function(item, idx) {
        return {
          lineNumber: idx + 1,
          sku: item.sku,
          name: item.name,
          brand: item.brand || '',
          quantity: item.quantity,
          image: item.image || ''
        };
      })
    };
  }

  // ── Public API ───────────────────────────────────────────────────────────
  window.quoteCart = {
    addItem: function(data) {
      var items = loadCart();
      var existing = items.find(function(i) { return i.sku === data.sku; });
      if (existing) {
        existing.quantity += 1;
      } else {
        items.push({
          sku: data.sku,
          name: data.name,
          slug: data.slug || '',
          brand: data.brand || '',
          image: data.image || '',
          quantity: 1
        });
      }
      saveCart(items);
      render();
      this.open();
    },

    removeItem: function(sku) {
      var items = loadCart().filter(function(i) { return i.sku !== sku; });
      saveCart(items);
      render();
    },

    updateQty: function(sku, qty) {
      var items = loadCart();
      if (qty <= 0) {
        items = items.filter(function(i) { return i.sku !== sku; });
      } else {
        items = items.map(function(i) {
          return i.sku === sku ? Object.assign({}, i, { quantity: qty }) : i;
        });
      }
      saveCart(items);
      render();
    },

    clear: function() {
      saveCart([]);
      render();
    },

    sendRequest: function() {
      var formData = gatherFormData();

      if (!formData.name.trim()) {
        showError(_t("quote.errorName", "Please enter your full name."));
        return;
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        showError(_t("quote.errorEmail", "Please enter a valid email address."));
        return;
      }

      var sendBtn = document.querySelector('#quote-drawer-footer button');
      var originalText = sendBtn ? sendBtn.innerHTML : '';
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<svg class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"/></svg>' + _t("quote.sending","Sending...");
      }

      var recipient = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.email) ? SITE_CONFIG.email : 'sales@ningbosiyang.com';
      var mailtoUrl = buildMailtoUrl(formData.name, formData.company);
      window.open(mailtoUrl, '_blank');

      showConfirmation();
      saveCart([]);

      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalText;
      }
    },

    copyQuoteToClipboard: function() {
      var formData = gatherFormData();
      var plainText = buildPlainTextBody(formData.name, formData.company);
      var recipient = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.email) ? SITE_CONFIG.email : 'sales@ningbosiyang.com';
      var fullText = 'To: ' + recipient + '\nSubject: ' + _t("quote.subject", "Quote Request – Ningbo Siyang") + '\n\n' + plainText;

      navigator.clipboard.writeText(fullText).then(function() {
        var feedback = document.getElementById('quote-copy-feedback');
        var btn = document.getElementById('quote-copy-btn');
        if (feedback) {
          feedback.classList.remove('hidden');
          setTimeout(function() { feedback.classList.add('hidden'); }, 3000);
        }
        if (btn) {
          btn.innerHTML = '<svg class="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>' + _t("quote.copiedToClipboard","Copied to clipboard!");
          setTimeout(function() {
            btn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' + _t("quote.copyQuoteDetails","Copy Quote Details");
          }, 3000);
        }
      }).catch(function() {
        var feedback = document.getElementById('quote-copy-feedback');
        if (feedback) {
          feedback.textContent = _t("quote.failedToCopy","Failed to copy. Please select and copy manually.");
          feedback.classList.remove('hidden');
          feedback.classList.remove('text-green-400');
          feedback.classList.add('text-red-400');
        }
      });
    },

    open: function() {
      var drawer = document.getElementById('quote-drawer');
      if (!drawer) return;
      drawer.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function() {
        var bd = drawer.querySelector('.quote-backdrop');
        var panel = drawer.querySelector('.quote-panel');
        if (bd) bd.classList.remove('opacity-0');
        if (panel) panel.classList.remove('translate-x-full');
      });
      render();
    },

    close: function() {
      var drawer = document.getElementById('quote-drawer');
      if (!drawer) return;
      var bd = drawer.querySelector('.quote-backdrop');
      var panel = drawer.querySelector('.quote-panel');
      if (bd) bd.classList.add('opacity-0');
      if (panel) panel.classList.add('translate-x-full');
      setTimeout(function() {
        drawer.classList.add('hidden');
        document.body.style.overflow = '';
      }, 300);
    },

    toggle: function() {
      var drawer = document.getElementById('quote-drawer');
      if (drawer && !drawer.classList.contains('hidden')) {
        this.close();
      } else {
        this.open();
      }
    },

    getItems: function() { return loadCart(); },
    getCount: getCount
  };

  // ── Init ─────────────────────────────────────────────────────────────────
  injectDrawer();
  render();

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') window.quoteCart.close();
  });

  // Delegate click for data-quote-add buttons
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-quote-add]');
    if (!btn) return;
    window.quoteCart.addItem({
      sku: btn.dataset.quoteSku,
      name: btn.dataset.quoteName,
      slug: btn.dataset.quoteSlug || '',
      brand: btn.dataset.quoteBrand || '',
      image: btn.dataset.quoteImage || ''
    });
  });
})();