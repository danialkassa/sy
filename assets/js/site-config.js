var SITE_CONFIG = {
  companyName: 'Ningbo Siyang',
  phone: '+86-574-8888-8888',
  phoneDisplay: '+86 574 8888 8888',
  email: 'sales@ningbosiyang.com',
  address: 'Ningbo Industrial Zone, Zhejiang 315000, China',
  whatsapp: '+8657488888888',
  wechatQR: '/assets/images/wechat-qr.png',
  socialLinks: {
    wechat: '/assets/images/wechat-qr.png',
    whatsapp: '+8657488888888'
  },
  businessHours: 'Mon-Fri: 8:00 AM - 5:00 PM (CST, UTC+8)',
  moq: {
    default: '500 units',
    drills: '300 units',
    grinders: '200 units',
    sanders: '300 units',
    saws: '200 units',
    combo: '100 units',
    impact: '200 units'
  },
  leadTime: {
    default: '30-45 days',
    custom: '60-90 days'
  },
  i18n: {
    defaultLanguage: 'en',
    urlParam: 'lang',
    storageKey: 'ns-lang',
    supportedLanguages: [
      {code: 'en', name: 'English', shortName: 'EN', dir: 'ltr', flag: '\u{1F1FA}\u{1F1F8}'},
      {code: 'zh', name: '\u4E2D\u6587', shortName: 'ZH', dir: 'ltr', flag: '\u{1F1E8}\u{1F1F3}'},
      {code: 'ar', name: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', shortName: 'AR', dir: 'rtl', flag: '\u{1F1F8}\u{1F1E6}'},
      {code: 'fr', name: 'Fran\u00E7ais', shortName: 'FR', dir: 'ltr', flag: '\u{1F1EB}\u{1F1F7}'},
      {code: 'ru', name: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439', shortName: 'RU', dir: 'ltr', flag: '\u{1F1F7}\u{1F1FA}'},
      {code: 'es', name: 'Espa\u00F1ol', shortName: 'ES', dir: 'ltr', flag: '\u{1F1EA}\u{1F1F8}'}
    ]
  }
};

function applySiteConfig() {
  if (typeof SITE_CONFIG === 'undefined') return;
  document.querySelectorAll('[data-site-phone]').forEach(function(el) {
    el.textContent = SITE_CONFIG.phoneDisplay;
    if (el.tagName === 'A') el.href = 'tel:' + SITE_CONFIG.phone;
  });
  document.querySelectorAll('[data-site-email]').forEach(function(el) {
    el.textContent = SITE_CONFIG.email;
    if (el.tagName === 'A') el.href = 'mailto:' + SITE_CONFIG.email;
  });
  document.querySelectorAll('[data-site-address]').forEach(function(el) {
    el.textContent = SITE_CONFIG.address;
  });
  document.querySelectorAll('[data-site-hours]').forEach(function(el) {
    el.textContent = SITE_CONFIG.businessHours;
  });
  document.querySelectorAll('[data-site-company]').forEach(function(el) {
    el.textContent = SITE_CONFIG.companyName;
  });
  document.querySelectorAll('[data-site-whatsapp]').forEach(function(el) {
    if (el.tagName === 'A') el.href = 'https://wa.me/' + SITE_CONFIG.whatsapp;
  });
}

applySiteConfig();
