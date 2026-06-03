var SUPPORTED_LANGUAGES = [
  {code: 'en', name: 'English', shortName: 'EN', dir: 'ltr', flag: '\u{1F1FA}\u{1F1F8}'},
  {code: 'zh', name: '\u4E2D\u6587', shortName: 'ZH', dir: 'ltr', flag: '\u{1F1E8}\u{1F1F3}'},
  {code: 'ar', name: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', shortName: 'AR', dir: 'rtl', flag: '\u{1F1F8}\u{1F1E6}'},
  {code: 'fr', name: 'Fran\u00E7ais', shortName: 'FR', dir: 'ltr', flag: '\u{1F1EB}\u{1F1F7}'},
  {code: 'ru', name: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439', shortName: 'RU', dir: 'ltr', flag: '\u{1F1F7}\u{1F1FA}'},
  {code: 'es', name: 'Espa\u00F1ol', shortName: 'ES', dir: 'ltr', flag: '\u{1F1EA}\u{1F1F8}'}
];

var I18N_DEFAULT_LANG = 'en';
var I18N_STORAGE_KEY = 'ns-lang';
var I18N_URL_PARAM = 'lang';
var I18N_CACHE = {};
window.__i18n_cache = I18N_CACHE;

function I18N() {
  this.currentLanguage = I18N_DEFAULT_LANG;
  this.translations = {};
}

I18N.prototype.detectLanguage = function() {
  var urlParams = new URLSearchParams(window.location.search);
  var urlLang = urlParams.get(I18N_URL_PARAM);
  if (urlLang && this.getSupportedLang(urlLang)) return urlLang;

  var storedLang = localStorage.getItem(I18N_STORAGE_KEY);
  if (storedLang && this.getSupportedLang(storedLang)) return storedLang;

  var browserLang = navigator.language || navigator.userLanguage || '';
  var baseLang = browserLang.split('-')[0].toLowerCase();
  if (this.getSupportedLang(baseLang)) return baseLang;

  return I18N_DEFAULT_LANG;
};

I18N.prototype.getSupportedLang = function(code) {
  for (var i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
    if (SUPPORTED_LANGUAGES[i].code === code) return SUPPORTED_LANGUAGES[i];
  }
  return null;
};

I18N.prototype.loadTranslations = function(lang) {
  var self = this;
  if (I18N_CACHE[lang]) {
    self.translations = I18N_CACHE[lang];
    return Promise.resolve(self.translations);
  }

  var basePath = self._getBasePath();
  var url = basePath + 'assets/translations/' + lang + '.json';

  return fetch(url).then(function(response) {
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  }).then(function(data) {
    I18N_CACHE[lang] = data;
    self.translations = data;
    return data;
  }).catch(function(err) {
    console.warn('i18n: Failed to load translations for "' + lang + '"', err);
    if (lang !== I18N_DEFAULT_LANG) {
      return self.loadTranslations(I18N_DEFAULT_LANG);
    }
    return {};
  });
};

I18N.prototype._getBasePath = function() {
  var path = window.location.pathname;
  if (path.indexOf('/blogs/') !== -1) return '../';
  if (path.indexOf('/products/') !== -1) return '../';
  if (path.indexOf('/about/') !== -1) return '../';
  return './';
};

I18N.prototype.setLanguage = function(lang) {
  var self = this;
  if (!self.getSupportedLang(lang)) lang = I18N_DEFAULT_LANG;

  return self.loadTranslations(lang).then(function() {
    self.currentLanguage = lang;
    localStorage.setItem(I18N_STORAGE_KEY, lang);

    var langInfo = self.getSupportedLang(lang);
    var htmlEl = document.documentElement;
    htmlEl.setAttribute('lang', lang);
    htmlEl.setAttribute('dir', langInfo ? langInfo.dir : 'ltr');

    self.applyTranslations();
    self._updateLangSelector(lang);
    self._updateUrlParam(lang);

    document.dispatchEvent(new CustomEvent('languageChanged', {detail: {lang: lang}}));
  });
};

I18N.prototype.t = function(key, fallback, params) {
  var keys = key.split('.');
  var val = this.translations;
  for (var i = 0; i < keys.length; i++) {
    if (val == null || typeof val !== 'object') return fallback || key;
    val = val[keys[i]];
  }
  if (val == null) return fallback || key;

  if (params && typeof val === 'string') {
    for (var p in params) {
      if (params.hasOwnProperty(p)) {
        val = val.replace(new RegExp('\\{\\{' + p + '\\}\\}', 'g'), params[p]);
      }
    }
  }

  return val;
};

I18N.prototype.applyTranslations = function() {
  var self = this;

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    var val = self.t(key);
    if (val !== key) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-placeholder');
    var val = self.t(key);
    if (val !== key) el.setAttribute('placeholder', val);
  });

  document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-title');
    var val = self.t(key);
    if (val !== key) el.setAttribute('title', val);
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-aria');
    var val = self.t(key);
    if (val !== key) el.setAttribute('aria-label', val);
  });
};

I18N.prototype._updateLangSelector = function(lang) {
  var langInfo = this.getSupportedLang(lang);
  if (!langInfo) return;

  var flagEl = document.getElementById('current-lang-flag');
  var nameEl = document.getElementById('current-lang-name');
  if (flagEl) flagEl.textContent = langInfo.flag;
  if (nameEl) nameEl.textContent = langInfo.shortName;

  var optionsContainer = document.getElementById('lang-options');
  if (optionsContainer) {
    var buttons = optionsContainer.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('bg-yellow-400/10', 'text-yellow-400');
        btn.classList.remove('text-zinc-400');
      } else {
        btn.classList.remove('bg-yellow-400/10', 'text-yellow-400');
        btn.classList.add('text-zinc-400');
      }
    }
  }

  var mobileOptions = document.getElementById('mobile-lang-options');
  if (mobileOptions) {
    var mobileButtons = mobileOptions.querySelectorAll('button');
    for (var j = 0; j < mobileButtons.length; j++) {
      var mBtn = mobileButtons[j];
      if (mBtn.getAttribute('data-lang') === lang) {
        mBtn.classList.add('text-yellow-400');
        mBtn.classList.remove('text-zinc-400');
      } else {
        mBtn.classList.remove('text-yellow-400');
        mBtn.classList.add('text-zinc-400');
      }
    }
  }
  var mobileOptions2 = document.getElementById('mobile-lang-options-2');
  if (mobileOptions2) {
    var mobileButtons2 = mobileOptions2.querySelectorAll('button');
    for (var k = 0; k < mobileButtons2.length; k++) {
      var mBtn2 = mobileButtons2[k];
      if (mBtn2.getAttribute('data-lang') === lang) {
        mBtn2.classList.add('text-yellow-400');
        mBtn2.classList.remove('text-zinc-400');
      } else {
        mBtn2.classList.remove('text-yellow-400');
        mBtn2.classList.add('text-zinc-400');
      }
    }
  }
};

I18N.prototype._updateUrlParam = function(lang) {
  var url = new URL(window.location.href);
  if (lang === I18N_DEFAULT_LANG) {
    url.searchParams.delete(I18N_URL_PARAM);
  } else {
    url.searchParams.set(I18N_URL_PARAM, lang);
  }
  var newUrl = url.pathname + (url.search ? url.search : '');
  history.replaceState(null, '', newUrl);
};

I18N.prototype.initLangSelector = function() {
  var self = this;

  var optionsContainer = document.getElementById('lang-options');
  if (optionsContainer) {
    optionsContainer.innerHTML = '';
    for (var i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
      (function(lang) {
        var btn = document.createElement('button');
        btn.setAttribute('data-lang', lang.code);
        btn.setAttribute('role', 'option');
        btn.className = 'w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors';
        btn.innerHTML = '<span class="text-lg leading-none">' + lang.flag + '</span><span class="flex-1 text-left">' + lang.name + '</span><span class="text-xs text-zinc-600">' + lang.shortName + '</span>';
        if (lang.code === self.currentLanguage) {
          btn.classList.remove('text-zinc-400');
          btn.classList.add('text-yellow-400', 'bg-zinc-800/50');
        }
        btn.addEventListener('click', function() {
          self.setLanguage(lang.code);
          self._closeDropdowns();
        });
        optionsContainer.appendChild(btn);
      })(SUPPORTED_LANGUAGES[i]);
    }
  }

  var mobileOptions = document.getElementById('mobile-lang-options');
  if (mobileOptions) {
    mobileOptions.innerHTML = '';
    for (var j = 0; j < SUPPORTED_LANGUAGES.length; j++) {
      (function(lang) {
        var btn = document.createElement('button');
        btn.setAttribute('data-lang', lang.code);
        btn.className = 'w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800/50 rounded-md transition-colors';
        btn.innerHTML = '<span class="text-lg leading-none">' + lang.flag + '</span><span class="flex-1 text-left">' + lang.name + '</span><span class="text-xs text-zinc-600">' + lang.shortName + '</span>';
        if (lang.code === self.currentLanguage) {
          btn.classList.remove('text-zinc-400');
          btn.classList.add('text-yellow-400', 'bg-zinc-800/50');
        }
        btn.addEventListener('click', function() {
          self.setLanguage(lang.code);
        });
        mobileOptions.appendChild(btn);
      })(SUPPORTED_LANGUAGES[j]);
    }
  }

  var mobileOptions2 = document.getElementById('mobile-lang-options-2');
  if (mobileOptions2) {
    mobileOptions2.innerHTML = '';
    for (var m = 0; m < SUPPORTED_LANGUAGES.length; m++) {
      (function(lang) {
        var btn = document.createElement('button');
        btn.setAttribute('data-lang', lang.code);
        btn.className = 'w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800/50 rounded-md transition-colors';
        btn.innerHTML = '<span class="text-lg leading-none">' + lang.flag + '</span><span class="flex-1 text-left">' + lang.name + '</span><span class="text-xs text-zinc-600">' + lang.shortName + '</span>';
        if (lang.code === self.currentLanguage) {
          btn.classList.remove('text-zinc-400');
          btn.classList.add('text-yellow-400', 'bg-zinc-800/50');
        }
        btn.addEventListener('click', function() {
          self.setLanguage(lang.code);
        });
        mobileOptions2.appendChild(btn);
      })(SUPPORTED_LANGUAGES[m]);
    }
  }

  var selector = document.getElementById('lang-selector');
  if (selector) {
    var toggleBtn = selector.querySelector('button');
    var dropdown = selector.querySelector('.dropdown-panel');
    if (toggleBtn && dropdown) {
      toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = dropdown.classList.contains('is-open');
        self._closeDropdowns();
        if (!isOpen) {
          dropdown.classList.add('is-open');
          toggleBtn.setAttribute('aria-expanded', 'true');
          var chevron = selector.querySelector('.lang-chevron');
          if (chevron) chevron.style.transform = 'rotate(180deg)';
        }
      });
    }
  }

  document.addEventListener('click', function() {
    self._closeDropdowns();
  });
};

I18N.prototype._closeDropdowns = function() {
  var dropdowns = document.querySelectorAll('#lang-selector .dropdown-panel');
  for (var i = 0; i < dropdowns.length; i++) {
    dropdowns[i].classList.remove('is-open');
  }
  var selector = document.getElementById('lang-selector');
  if (selector) {
    var toggleBtn = selector.querySelector('button');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    var chevron = selector.querySelector('.lang-chevron');
    if (chevron) chevron.style.transform = '';
  }
};

var i18n = new I18N();
window.i18n = i18n;

document.addEventListener('DOMContentLoaded', function() {
  var detectedLang = i18n.detectLanguage();
  i18n.initLangSelector();

  i18n.loadTranslations(detectedLang).then(function() {
    i18n.currentLanguage = detectedLang;
    var langInfo = i18n.getSupportedLang(detectedLang);
    if (langInfo) {
      document.documentElement.setAttribute('lang', detectedLang);
      document.documentElement.setAttribute('dir', langInfo.dir);
    }
    i18n.applyTranslations();
    i18n._updateLangSelector(detectedLang);

    document.dispatchEvent(new CustomEvent('i18nReady', {detail: {lang: detectedLang}}));
  });
});
