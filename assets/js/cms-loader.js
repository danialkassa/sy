(function () {
  var _t = function(key, fallback) {
    if (typeof i18n !== 'undefined' && i18n.t) { var val = i18n.t(key); return val && val !== key ? val : fallback; }
    return fallback;
  };

  var CMSLoader = {};

  var jsYaml = null;
  function loadJsYaml() {
    if (jsYaml) return Promise.resolve(jsYaml);
    return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js';
      script.onload = function() { jsYaml = window.jsyaml; resolve(jsYaml); };
      script.onerror = function() { reject(new Error('Failed to load js-yaml')); };
      document.head.appendChild(script);
    });
  }

  function parseFrontmatter(text) {
    var result = { data: {}, body: text };
    var match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!match) return result;
    result.body = text.slice(match[0].length);
    var raw = match[1];
    if (jsYaml) {
      try {
        result.data = jsYaml.load(raw) || {};
      } catch (e) {
        result.data = {};
      }
    }
    return result;
  }

  function parseMarkdown(text) {
    var html = text;

    html = html.replace(/```[\s\S]*?```/g, function (block) {
      var code = block.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
      code = escapeHtml(code);
      return '<pre class="bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm text-zinc-300">' + code + '</code></pre>';
    });

    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-zinc-800 text-yellow-400 rounded text-sm">$1</code>');

    html = html.replace(/^#### (.+)$/gm, '<h4 class="font-oswald text-lg font-bold text-white mt-8 mb-3">$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="font-oswald text-xl font-bold text-white mt-10 mb-4">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="font-oswald text-2xl font-bold text-white mt-10 mb-4">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="font-oswald text-3xl md:text-4xl font-bold text-white mt-12 mb-6">$1</h1>');

    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" loading="lazy" class="w-full rounded-lg my-6"/>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-yellow-400 hover:text-yellow-300 underline transition-colors">$1</a>');

    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    html = html.replace(/^---$/gm, '<hr class="border-zinc-800 my-8"/>');

    html = html.replace(/^(\d+)\.\s+(.+)$/gm, '\u2324OL\u2324$1\u2324\u2324$2');
    html = html.replace(/^[-*+]\s+(.+)$/gm, '\u2324UL\u2324$1');

    html = html.replace(/(\u2324UL\u2324[^\n]*(\n\u2324UL\u2324[^\n]*)*)/g, function (block) {
      var items = block.split(/\n?\u2324UL\u2324/).filter(function (s) { return s.trim(); });
      var lis = items.map(function (item) { return '<li class="text-zinc-400 leading-relaxed">' + item.trim() + '</li>'; }).join('');
      return '<ul class="list-disc list-inside space-y-1 my-4">' + lis + '</ul>';
    });

    html = html.replace(/(\u2324OL\u2324\d+\u2324\u2324[^\n]*(\n\u2324OL\u2324\d+\u2324\u2324[^\n]*)*)/g, function (block) {
      var items = block.split(/\n?\u2324OL\u2324\d+\u2324\u2324/).filter(function (s) { return s.trim(); });
      var lis = items.map(function (item) { return '<li class="text-zinc-400 leading-relaxed">' + item.trim() + '</li>'; }).join('');
      return '<ol class="list-decimal list-inside space-y-1 my-4">' + lis + '</ol>';
    });

    var blocks = html.split(/\n{2,}/);
    html = blocks.map(function (block) {
      block = block.trim();
      if (!block) return '';
      if (block.match(/^<(h[1-6]|ul|ol|pre|hr|blockquote)/)) return block;
      if (block.match(/<\/(ul|ol|pre|blockquote)>$/)) return block;
      return '<p class="text-zinc-400 leading-relaxed mb-4">' + block + '</p>';
    }).join('\n');

    html = html.replace(/<p class="text-zinc-400 leading-relaxed mb-4">\s*<\/p>/g, '');

    return html;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    var months = [_t('cms.january','January'), _t('cms.february','February'), _t('cms.march','March'), _t('cms.april','April'), _t('cms.may','May'), _t('cms.june','June'), _t('cms.july','July'), _t('cms.august','August'), _t('cms.september','September'), _t('cms.october','October'), _t('cms.november','November'), _t('cms.december','December')];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function getCategoryColor(category) {
    var colors = {
      'Product Guides': { bg: 'bg-yellow-400/10', text: 'text-yellow-400' },
      'Company News': { bg: 'bg-green-400/10', text: 'text-green-400' },
      'B2B Insights': { bg: 'bg-blue-400/10', text: 'text-blue-400' },
      'Industry Trends': { bg: 'bg-purple-400/10', text: 'text-purple-400' }
    };
    return colors[category] || { bg: 'bg-blue-400/10', text: 'text-blue-400' };
  }

  function getBasePath() {
    var path = window.location.pathname;
    if (path.indexOf('/blogs/') !== -1) return '../';
    if (path.indexOf('/products/') !== -1) return '../';
    if (path.indexOf('/about/') !== -1) return '../';
    return './';
  }

  var CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  function cacheGet(key) {
    try {
      var raw = localStorage.getItem('cms-cache:' + key);
      if (!raw) return null;
      var entry = JSON.parse(raw);
      if (Date.now() - entry.t > CACHE_TTL) { localStorage.removeItem('cms-cache:' + key); return null; }
      return entry.d;
    } catch (e) { return null; }
  }

  function cacheSet(key, data) {
    try { localStorage.setItem('cms-cache:' + key, JSON.stringify({ t: Date.now(), d: data })); } catch (e) {}
  }

  function fetchText(url) {
    var cached = cacheGet(url);
    if (cached !== null) return Promise.resolve(cached);
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    }).then(function (text) {
      cacheSet(url, text);
      return text;
    });
  }

  function detectCurrentLang() {
    if (window.i18n && window.i18n.currentLanguage) return window.i18n.currentLanguage;
    var urlParams = new URLSearchParams(window.location.search);
    var urlLang = urlParams.get('lang');
    if (urlLang) return urlLang;
    var storedLang = localStorage.getItem('ns-lang');
    if (storedLang) return storedLang;
    return 'en';
  }

  var currentLang = detectCurrentLang();

  function loadJSONWithLangFallback(primaryPath, lang) {
    var cacheKey = primaryPath + (lang ? ':' + lang : '');
    var cached = cacheGet(cacheKey);
    if (cached !== null) return Promise.resolve(cached);

    if (!lang || lang === 'en') {
      return fetch(primaryPath).then(function (r) { return r.json(); }).then(function (data) {
        cacheSet(cacheKey, data);
        return data;
      });
    }

    var langPath = primaryPath.replace(/(\.\w+)$/, '.' + lang + '$1');

    return fetch(langPath)
      .then(function (r) {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(function (data) {
        cacheSet(cacheKey, data);
        return data;
      })
      .catch(function () {
        return fetch(primaryPath).then(function (r) { return r.json(); }).then(function (data) {
          cacheSet(cacheKey, data);
          return data;
        });
      });
  }

  // ============================================================
  // loadCollectionFromMD — reads .md files from a collection
  // folder. Uses index.json to discover which items exist (via
  // slug/sku/id fields), then fetches each .md file and parses
  // its frontmatter.
  //
  // This is the BRIDGE: CMS writes .md, website reads .md.
  // Falls back to index.json data if .md files aren't available.
  //
  // IMPORTANT: Run `node scripts/build-index.cjs` after CMS edits
  // to regenerate index.json with slug fields from .md files.
  // ============================================================

  function getSlugsFromIndex(index, arrayKey) {
    var items;
    if (Array.isArray(index)) {
      items = index;
    } else {
      items = index[arrayKey] || [];
    }
    var slugs = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      // Try common slug/filename fields
      var slug = item.slug || item.sku || item.id || '';
      if (slug) { slugs.push(slug); continue; }
      // Can't determine slug from JSON data alone
      return null;
    }
    if (slugs.length > 0) return slugs;
    return null;
  }

  function loadCollectionFromMD(folder, arrayKey, sortFn) {
    var basePath = getBasePath() + folder;
    var indexPath = basePath + '/index.json';

    return loadJSONWithLangFallback(indexPath, currentLang).then(function (index) {
      var jsonItems;
      if (Array.isArray(index)) {
        jsonItems = index;
      } else {
        jsonItems = index[arrayKey] || [];
      }

      // Try to get slugs from the index data
      var slugs = getSlugsFromIndex(index, arrayKey);

      // If we have slugs, try to fetch .md files
      if (slugs && slugs.length > 0) {
        var mdPromises = slugs.map(function (slug) {
          var mdPath = basePath + '/' + slug + '.md';
          return fetchText(mdPath).then(function (text) {
            var parsed = parseFrontmatter(text);
            parsed.data.slug = parsed.data.slug || slug;
            parsed.data.sku = parsed.data.sku || slug;
            return parsed.data;
          }).catch(function () {
            // .md file not found — use JSON data for this slug
            return null;
          });
        });

        return Promise.all(mdPromises).then(function (mdItems) {
          // Merge: JSON data as base, .md data overrides on top
          // This preserves fields like price/rating that exist in
          // index.json but not in .md frontmatter.
          var items = [];
          for (var i = 0; i < slugs.length; i++) {
            if (mdItems[i] && i < jsonItems.length) {
              // Merge: start with JSON, overlay .md data
              var merged = {};
              for (var k in jsonItems[i]) merged[k] = jsonItems[i][k];
              for (var m in mdItems[i]) merged[m] = mdItems[i][m];
              items.push(merged);
            } else if (mdItems[i]) {
              items.push(mdItems[i]);
            } else if (i < jsonItems.length) {
              items.push(jsonItems[i]);
            }
          }
          // Filter out archived items
          items = items.filter(function(item) { return !item.archived; });
          if (sortFn) items.sort(sortFn);
          return items;
        });
      }

      // No slugs available — just use JSON data
      if (sortFn) jsonItems.sort(sortFn);
      return jsonItems;
    }).catch(function () {
      return [];
    });
  }

  function renderStars(rating, size) {
    size = size || 4;
    var stars = '<div class="flex items-center gap-1">';
    for (var s = 0; s < 5; s++) {
      stars += s < rating
        ? '<svg class="w-' + size + ' h-' + size + ' text-yellow-400 fill-yellow-400" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
        : '<svg class="w-' + size + ' h-' + size + ' text-zinc-600" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    }
    stars += '</div>';
    return stars;
  }

  // ============================================================
  // BLOG
  // ============================================================
  CMSLoader.loadBlogIndex = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();
    if (container.children.length > 0) return Promise.resolve();

    return loadCollectionFromMD('content/blog', 'posts').then(function (posts) {
      posts.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

      var html = posts.map(function (post) {
        var color = getCategoryColor(post.category);
        return '<article class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-yellow-400/30 transition-colors group">' +
          '<a href="' + getBasePath() + 'blogs/post.html?slug=' + (post.slug || '') + '" class="block">' +
          '<div class="aspect-[16/10] overflow-hidden">' +
          '<img src="' + (post.image || '') + '" alt="' + escapeHtml(post.title || '') + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>' +
          '</div>' +
          '</a>' +
          '<div class="p-5">' +
          '<div class="flex items-center gap-2 mb-3">' +
          '<span class="px-2 py-1 text-xs font-medium rounded ' + color.bg + ' ' + color.text + '">' + escapeHtml(post.category || '') + '</span>' +
          '<span class="text-xs text-zinc-500">' + (post.readTime || '5') + ' ' + _t('cms.minRead','min read') + '</span>' +
          '</div>' +
          '<h3 class="font-oswald text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">' +
          '<a href="' + getBasePath() + 'blogs/post.html?slug=' + (post.slug || '') + '">' + escapeHtml(post.title || '') + '</a>' +
          '</h3>' +
          '<p class="text-sm text-zinc-400 mb-4 line-clamp-3">' + escapeHtml(post.excerpt || '') + '</p>' +
          '<div class="flex items-center gap-3 text-xs text-zinc-500">' +
          '<span>' + formatDate(post.date) + '</span>' +
          '<span class="w-1 h-1 rounded-full bg-zinc-600"></span>' +
          '<span>' + _t('cms.byAuthor','By') + ' ' + escapeHtml(post.author || _t('cms.team','Ningbo Siyang Team')) + '</span>' +
          '</div>' +
          '</div>' +
          '</article>';
      }).join('');

      container.innerHTML = html;
    }).catch(function () {
      tryIndividualPosts(container);
    });
  };

  function tryIndividualPosts(container) {
    var slugs = ['b2b-power-tools-procurement', 'choosing-the-right-power-drill', 'safety-standards'];
    var basePath = getBasePath() + 'content/blog/';
    var promises = slugs.map(function (slug) {
      return fetchText(basePath + slug + '.md').then(function (text) {
        var parsed = parseFrontmatter(text);
        parsed.data.slug = slug;
        return parsed.data;
      }).catch(function () { return null; });
    });

    Promise.all(promises).then(function (results) {
      var posts = results.filter(Boolean);
      posts.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

      var html = posts.map(function (post) {
        var color = getCategoryColor(post.category);
        return '<article class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-yellow-400/30 transition-colors group">' +
          '<a href="' + getBasePath() + 'blogs/post.html?slug=' + (post.slug || '') + '" class="block">' +
          '<div class="aspect-[16/10] overflow-hidden">' +
          '<img src="' + (post.image || '') + '" alt="' + escapeHtml(post.title || '') + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>' +
          '</div>' +
          '</a>' +
          '<div class="p-5">' +
          '<div class="flex items-center gap-2 mb-3">' +
          '<span class="px-2 py-1 text-xs font-medium rounded ' + color.bg + ' ' + color.text + '">' + escapeHtml(post.category || '') + '</span>' +
          '<span class="text-xs text-zinc-500">' + (post.readTime || '5') + ' ' + _t('cms.minRead','min read') + '</span>' +
          '</div>' +
          '<h3 class="font-oswald text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">' +
          '<a href="' + getBasePath() + 'blogs/post.html?slug=' + (post.slug || '') + '">' + escapeHtml(post.title || '') + '</a>' +
          '</h3>' +
          '<p class="text-sm text-zinc-400 mb-4 line-clamp-3">' + escapeHtml(post.excerpt || '') + '</p>' +
          '<div class="flex items-center gap-3 text-xs text-zinc-500">' +
          '<span>' + formatDate(post.date) + '</span>' +
          '<span class="w-1 h-1 rounded-full bg-zinc-600"></span>' +
          '<span>' + _t('cms.byAuthor','By') + ' ' + escapeHtml(post.author || _t('cms.team','Ningbo Siyang Team')) + '</span>' +
          '</div>' +
          '</div>' +
          '</article>';
      }).join('');

      if (html) {
        container.innerHTML = html;
      }
    }).catch(function () {});
  }

  CMSLoader.loadBlogPost = function (slug, containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container || !slug) return Promise.resolve();

    var langSuffix = (currentLang !== 'en') ? '.' + currentLang : '';
    var postPath = getBasePath() + 'content/blog/' + slug + langSuffix + '.md';

    return fetchText(postPath).catch(function () {
      return fetchText(getBasePath() + 'content/blog/' + slug + '.md');
    }).then(function (text) {
      var parsed = parseFrontmatter(text);
      var post = parsed.data;
      if (post.archived) {
        container.innerHTML = '<div class="max-w-2xl mx-auto py-16 text-center"><div class="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-800 flex items-center justify-center"><svg class="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"/></svg></div><h1 class="font-oswald text-3xl font-bold text-white mb-4">Post Unavailable</h1><p class="text-zinc-400 mb-8 max-w-md mx-auto">This blog post is no longer available.</p><a href="./index.html" class="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-yellow-400 text-zinc-900 hover:bg-yellow-300 font-bold text-sm transition-colors">Browse All Posts</a></div>';
        return;
      }
      var bodyHtml = parseMarkdown(parsed.body);

      var heroHtml = '';
      if (post.image) {
        heroHtml = '<div class="aspect-[21/9] rounded-xl overflow-hidden mb-8">' +
          '<img src="' + post.image + '" alt="' + escapeHtml(post.title || '') + '" class="w-full h-full object-cover"/>' +
          '</div>';
      }

      var metaHtml = '<div class="flex flex-wrap items-center gap-3 mb-4">' +
        '<span class="px-3 py-1 text-sm font-medium rounded-full bg-yellow-400/10 text-yellow-400">' + escapeHtml(post.category || '') + '</span>' +
        '<span class="text-sm text-zinc-500">' + formatDate(post.date) + '</span>' +
        '<span class="text-sm text-zinc-500">' + (post.readTime || '5') + ' ' + _t('cms.minRead','min read') + '</span>' +
        '</div>';

      var titleHtml = '<h1 class="font-oswald text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">' + escapeHtml(post.title || '') + '</h1>';

      var authorHtml = '';
      if (post.author) {
        var initials = post.author.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
        authorHtml = '<div class="flex items-center gap-3 mb-8 pb-8 border-b border-zinc-800">' +
          '<div class="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-yellow-400">' + initials + '</div>' +
          '<div>' +
          '<div class="text-sm font-medium text-white">' + escapeHtml(post.author) + '</div>' +
          '<div class="text-xs text-zinc-500">' + escapeHtml(post.authorRole || '') + '</div>' +
          '</div>' +
          '</div>';
      }

      container.innerHTML = heroHtml + metaHtml + titleHtml + authorHtml + '<div class="prose-content">' + bodyHtml + '</div>';

      var pageTitle = document.querySelector('title');
      if (pageTitle && post.title) pageTitle.textContent = post.title + ' \u2013 Ningbo Siyang';
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && post.excerpt) metaDesc.setAttribute('content', post.excerpt);
    }).catch(function () {});
  };

  // ============================================================
  // PRODUCTS
  // ============================================================
  CMSLoader.loadProducts = function (category, containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();
    if (container.children.length > 0) return Promise.resolve();

    return loadCollectionFromMD('content/products', 'products').then(function (products) {
      if (category) {
        products = products.filter(function (p) {
          return p.category && p.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase().replace(/\s+/g, '-');
        });
      }

      var html = products.map(function (product) {
        var badges = '';
        if (product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price || 0)) {
          var discount = Math.round((1 - Number(product.price || 0) / Number(product.compareAtPrice)) * 100);
          badges += '<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-' + discount + '%</span>';
        }
        if (product.isFeatured) {
          badges += '<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">' + _t('cms.featured','Featured') + '</span>';
        }
        var badgeContainer = badges ? '<div class="absolute top-3 left-3 flex flex-col gap-1.5">' + badges + '</div>' : '';

        var priceHtml = '';
        if (product.price && Number(product.price) > 0) {
          priceHtml = '<span class="text-lg font-bold text-white">$' + Number(product.price).toFixed(2) + '</span>';
          if (product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price)) {
            priceHtml += '<span class="text-sm text-zinc-500 line-through ml-2">$' + Number(product.compareAtPrice).toFixed(2) + '</span>';
          }
        } else {
          priceHtml = '<span class="text-sm font-semibold text-yellow-400">' + _t('cms.requestQuote','Request Quote') + '</span>';
        }

        var stockHtml = product.stock > 0
          ? '<span class="text-xs text-green-400 font-medium">&#10003; ' + _t('cms.inStock','In Stock') + '</span>'
          : '<span class="text-xs text-red-400 font-medium">' + _t('cms.outOfStock','Out of Stock') + '</span>';

        var stars = product.rating || 4;
        var starsHtml = '<div class="flex items-center gap-0.5">';
        for (var s = 0; s < 5; s++) {
          starsHtml += s < stars
            ? '<svg class="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
            : '<svg class="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        }
        starsHtml += '</div>';

        return '<div data-id="' + (product.sku || '') + '" class="group relative bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/5 flex flex-col">' +
          '<a href="' + getBasePath() + 'products/product.html?sku=' + (product.sku || '') + '" class="block">' +
          '<div class="relative aspect-square bg-zinc-900 overflow-hidden shrink-0">' +
          '<img src="' + (product.image || (product.images && product.images[0]) || '') + '" alt="' + escapeHtml(product.name || '') + '" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"/>' +
          '<div class="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent opacity-60 group-hover:opacity-35 transition-opacity"></div>' +
          badgeContainer +
          '</div>' +
          '</a>' +
          '<div class="p-4 flex flex-col flex-1">' +
          '<a href="' + getBasePath() + 'products/product.html?sku=' + (product.sku || '') + '" class="block">' +
          '<p class="text-xs text-red-400 uppercase tracking-wider mb-1 font-semibold">' + escapeHtml(product.brand || '') + '</p>' +
          '<h3 class="font-oswald font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-2 mb-1.5 leading-snug">' + escapeHtml(product.name || '') + '</h3>' +
          '<p class="text-xs text-zinc-500 mb-2.5 line-clamp-2 leading-relaxed">' + escapeHtml(product.tagline || product.description || '') + '</p>' +
          '</a>' +
          '<div class="flex items-center gap-2 mb-3">' + starsHtml + '<span class="text-xs text-zinc-500">(' + (product.reviewCount || 0) + ')</span></div>' +
          '<div class="mt-auto">' +
          '<div class="flex items-center gap-2 mb-1">' + priceHtml + '</div>' +
          stockHtml +
          '</div>' +
          '</div>' +
          '</div>';
      }).join('');

      if (html) {
        container.innerHTML = html;
        if (typeof window.initQuoteCart === 'function') {
          window.initQuoteCart();
        }
        if (typeof window.attachCompareCheckbox === 'function') {
          products.forEach(function (product) {
            var cardEl = container.querySelector('[data-id="' + (product.sku || '') + '"]');
            if (cardEl) window.attachCompareCheckbox(cardEl, product);
          });
        }
      }
    }).catch(function () {
      container.innerHTML = '<p class="text-zinc-500 text-center py-8">' + _t('cms.productsUnavailable', 'Products temporarily unavailable.') + '</p>';
    });
  };

  // ============================================================
  // PAGE SETTINGS & SITE SETTINGS
  // ============================================================
  CMSLoader.loadPageSettings = function (pageName) {
    var path = getBasePath() + 'content/pages/' + pageName + '.md';
    return fetchText(path).then(function (text) {
      var parsed = parseFrontmatter(text);
      return parsed.data;
    }).catch(function () { return {}; });
  };

  CMSLoader.loadSiteSettings = function (settingName) {
    var path = getBasePath() + 'content/settings/' + settingName + '.md';
    return fetchText(path).then(function (text) {
      var parsed = parseFrontmatter(text);
      return parsed.data;
    }).catch(function () { return {}; });
  };

  // ============================================================
  // HOMEPAGE
  // ============================================================
  CMSLoader.loadHomepage = function () {
    var embeddedScript = document.getElementById('homepage-data');
    if (embeddedScript) {
      try {
        var data = JSON.parse(embeddedScript.textContent);
        CMSLoader.applyHomepageData(data);
        return Promise.resolve();
      } catch (e) {
        console.warn('[CMSLoader] Failed to parse embedded homepage data', e);
      }
    }
    // Load split homepage files and merge
    var files = ['homepage-hero', 'homepage-products', 'homepage-about', 'homepage-b2b', 'homepage-cta'];
    var promises = files.map(function(name) {
      return CMSLoader.loadPageSettings(name).catch(function() { return {}; });
    });
    // Also try legacy single file as fallback
    promises.push(CMSLoader.loadPageSettings('homepage').catch(function() { return {}; }));
    return Promise.all(promises).then(function(results) {
      var merged = {};
      results.forEach(function(data) {
        if (data && Object.keys(data).length) {
          Object.assign(merged, data);
        }
      });
      CMSLoader.applyHomepageData(merged);
    });
  };

  CMSLoader.applyHomepageData = function (data) {
    if (!data || !Object.keys(data).length) return;

      // ---- Hero ----
      var heroLine1 = document.getElementById('cms-hero-title-line1');
      var heroLine2 = document.getElementById('cms-hero-title-line2');
      if (data.heroTitle && heroLine1 && heroLine2) {
        var parts = data.heroTitle.split(' ');
        if (parts.length > 1) {
          heroLine1.textContent = parts.slice(0, -1).join(' ');
          heroLine2.textContent = parts[parts.length - 1];
        } else {
          heroLine1.textContent = data.heroTitle;
          heroLine2.textContent = '';
        }
      }

      var heroSubtitle = document.getElementById('cms-hero-subtitle');
      if (data.heroSubtitle && heroSubtitle) heroSubtitle.textContent = data.heroSubtitle;

      var heroCta = document.getElementById('cms-hero-cta');
      if (heroCta) {
        if (data.heroCtaText) heroCta.childNodes[0].textContent = data.heroCtaText + ' ';
        if (data.heroCtaLink) heroCta.setAttribute('onclick', "window.location.href='" + data.heroCtaLink + "'");
      }

      // ---- Stats (from list) ----
      if (Array.isArray(data.stats)) {
        data.stats.forEach(function (item, idx) {
          var valueEl = document.getElementById('cms-stat' + (idx + 1) + '-value');
          var labelEl = document.getElementById('cms-stat' + (idx + 1) + '-label');
          if (item.value && valueEl) {
            var suffix = item.value.replace(/[\d.]/g, '');
            var numVal = parseInt(item.value.replace(/[^\d]/g, ''), 10);
            if (!isNaN(numVal)) {
              valueEl.setAttribute('data-count-up', String(numVal));
              valueEl.setAttribute('data-count-suffix', suffix || '');
            }
            valueEl.textContent = '0';
          }
          if (item.label && labelEl) {
            labelEl.textContent = item.label;
          }
        });
      }

      if (typeof window.initCountUp === 'function') {
        window.initCountUp();
      }

      // ---- Section Headings & Descriptions ----
      var sectionMap = [
        { headingId: 'cms-trust-badges-heading', headingKey: 'trustBadgesHeading' },
        { headingId: 'cms-featured-products-heading', headingKey: 'featuredProductsHeading', descId: 'cms-featured-products-desc', descKey: 'featuredProductsDescription' },
        { headingId: 'cms-category-grid-heading', headingKey: 'categoryGridHeading', descId: 'cms-category-grid-desc', descKey: 'categoryGridDescription' },
        { headingId: 'cms-brand-showcase-heading', headingKey: 'brandShowcaseHeading', descId: 'cms-brand-showcase-desc', descKey: 'brandShowcaseDescription' },
        { headingId: 'cms-stats-heading', headingKey: 'statsHeading', descId: 'cms-stats-desc', descKey: 'statsDescription' },
        { headingId: 'cms-testimonials-heading', headingKey: 'testimonialsHeading', descId: 'cms-testimonials-desc', descKey: 'testimonialsDescription' },
        { headingId: 'cms-use-cases-heading', headingKey: 'useCasesHeading', descId: 'cms-use-cases-desc', descKey: 'useCasesDescription' },
        { headingId: 'cms-final-cta-heading', headingKey: 'finalCtaHeading', descId: 'cms-final-cta-desc', descKey: 'finalCtaDescription' }
      ];

      sectionMap.forEach(function (sec) {
        if (data[sec.headingKey]) {
          var h = document.getElementById(sec.headingId);
          if (h) h.textContent = data[sec.headingKey];
        }
        if (sec.descKey && data[sec.descKey]) {
          var d = document.getElementById(sec.descId);
          if (d) d.textContent = data[sec.descKey];
        }
      });

      // ---- Final CTA Button ----
      if (data.finalCtaButtonText) {
        var ctaBtn = document.getElementById('cms-final-cta-button');
        if (ctaBtn) ctaBtn.textContent = data.finalCtaButtonText;
      }

      // ---- Brand Showcase Achievements (from list) ----
      if (Array.isArray(data.achievements)) {
        data.achievements.forEach(function (item, idx) {
          if (item.title) {
            var aTitleEl = document.getElementById('cms-achievement' + (idx + 1) + '-title');
            if (aTitleEl) aTitleEl.textContent = item.title;
          }
          if (item.description) {
            var aDescEl = document.getElementById('cms-achievement' + (idx + 1) + '-desc');
            if (aDescEl) aDescEl.textContent = item.description;
          }
        });
      }

      // ---- Certifications (from list) ----
      if (Array.isArray(data.certifications)) {
        data.certifications.forEach(function (item, idx) {
          if (item.title) {
            var cTitleEl = document.getElementById('cms-cert' + (idx + 1) + '-title');
            if (cTitleEl) cTitleEl.textContent = item.title;
          }
          if (item.description) {
            var cDescEl = document.getElementById('cms-cert' + (idx + 1) + '-desc');
            if (cDescEl) cDescEl.textContent = item.description;
          }
        });
      }

      // ---- Brand CTA ----
      if (data.brandCtaTitle) {
        var bCtaH = document.getElementById('cms-brand-cta-title');
        if (bCtaH) bCtaH.textContent = data.brandCtaTitle;
      }
      if (data.brandCtaDescription) {
        var bCtaD = document.getElementById('cms-brand-cta-desc');
        if (bCtaD) bCtaD.textContent = data.brandCtaDescription;
      }

      // ---- Trust Indicators (from list) ----
      if (Array.isArray(data.trustIndicators)) {
        data.trustIndicators.forEach(function (item, idx) {
          if (item.title) {
            var tTitleEl = document.getElementById('cms-trust-ind' + (idx + 1) + '-title');
            if (tTitleEl) tTitleEl.textContent = item.title;
          }
          if (item.description) {
            var tDescEl = document.getElementById('cms-trust-ind' + (idx + 1) + '-desc');
            if (tDescEl) tDescEl.textContent = item.description;
          }
        });
      }

      // ---- Use Cases (from list) ----
      if (Array.isArray(data.useCases)) {
        data.useCases.forEach(function (item, idx) {
          if (item.title) {
            var uTitleEl = document.getElementById('cms-use-case' + (idx + 1) + '-title');
            if (uTitleEl) uTitleEl.textContent = item.title;
          }
          if (item.description) {
            var uDescEl = document.getElementById('cms-use-case' + (idx + 1) + '-desc');
            if (uDescEl) uDescEl.textContent = item.description;
          }
        });
      }

      // ---- Video Tutorials ----
      if (data.videoTutorialsHeading) {
        var vtH = document.getElementById('cms-video-tutorials-heading');
        if (vtH) vtH.textContent = data.videoTutorialsHeading;
      }
      if (data.videoTutorialsDesc) {
        var vtD = document.getElementById('cms-video-tutorials-desc');
        if (vtD) vtD.textContent = data.videoTutorialsDesc;
      }

      // ---- B2B Section ----
      if (data.b2bHeading) {
        var b2bH = document.getElementById('cms-b2b-heading');
        if (b2bH) b2bH.textContent = data.b2bHeading;
      }
      if (data.b2bDescription) {
        var b2bD = document.getElementById('cms-b2b-desc');
        if (b2bD) b2bD.textContent = data.b2bDescription;
      }
      // ---- B2B Benefits (from list) ----
      if (Array.isArray(data.b2bBenefits)) {
        data.b2bBenefits.forEach(function (item, idx) {
          if (item.title) {
            var bTitleEl = document.getElementById('cms-b2b-benefit' + (idx + 1) + '-title');
            if (bTitleEl) bTitleEl.textContent = item.title;
          }
          if (item.description) {
            var bDescEl = document.getElementById('cms-b2b-benefit' + (idx + 1) + '-desc');
            if (bDescEl) bDescEl.textContent = item.description;
          }
        });
      }

      // ---- FAQ Section ----
      if (data.faqHeading) {
        var faqH = document.getElementById('cms-faq-heading');
        if (faqH) faqH.textContent = data.faqHeading;
      }
      if (data.faqDescription) {
        var faqD = document.getElementById('cms-faq-desc');
        if (faqD) faqD.textContent = data.faqDescription;
      }
      if (data.faqCtaHeading) {
        var faqCtaH = document.getElementById('cms-faq-cta-heading');
        if (faqCtaH) faqCtaH.textContent = data.faqCtaHeading;
      }
      if (data.faqCtaDescription) {
        var faqCtaD = document.getElementById('cms-faq-cta-desc');
        if (faqCtaD) faqCtaD.textContent = data.faqCtaDescription;
      }

      // ---- Footer Brand & Newsletter ----
      if (data.footerBrandDesc) {
        var fbd = document.getElementById('cms-footer-brand-desc');
        if (fbd) fbd.textContent = data.footerBrandDesc;
      }
      if (data.footerNewsletterHeading) {
        var fnh = document.getElementById('cms-footer-newsletter-heading');
        if (fnh) fnh.textContent = data.footerNewsletterHeading;
      }
      if (data.footerNewsletterDesc) {
        var fnd = document.getElementById('cms-footer-newsletter-desc');
        if (fnd) fnd.textContent = data.footerNewsletterDesc;
      }

      // ---- 3D Product Showcase ----
      if (data.viewer3dHeading) {
        var v3H = document.getElementById('cms-3d-heading');
        if (v3H) v3H.textContent = data.viewer3dHeading;
      }
      if (data.viewer3dDesc) {
        var v3D = document.getElementById('cms-3d-desc');
        if (v3D) v3D.textContent = data.viewer3dDesc;
      }
      if (data.splineSceneUrl) {
        var splineContainer = document.getElementById('cms-spline-container');
        var splineFallback = document.getElementById('cms-spline-fallback');
        if (splineContainer && splineFallback) {
          // Remove fallback
          splineFallback.remove();
          // Create Spline viewer element
          var viewer = document.createElement('spline-viewer');
          viewer.setAttribute('url', data.splineSceneUrl);
          viewer.style.width = '100%';
          viewer.style.height = '100%';
          splineContainer.appendChild(viewer);
          // Hide interaction hint after 5 seconds
          var hint = document.getElementById('cms-spline-hint');
          if (hint) {
            setTimeout(function() { hint.style.opacity = '0'; }, 5000);
            // Also hide on first interaction
            splineContainer.addEventListener('pointerdown', function() {
              if (hint) hint.style.opacity = '0';
            }, { once: true });
          }
        }
      }

      // ---- Trust Badges (from list) ----
      if (Array.isArray(data.trustBadges)) {
        data.trustBadges.forEach(function (item, idx) {
          if (item.title) {
            var titleEl = document.getElementById('cms-trust-badge' + (idx + 1) + '-title');
            if (titleEl) titleEl.textContent = item.title;
          }
          if (item.description) {
            var descEl = document.getElementById('cms-trust-badge' + (idx + 1) + '-desc');
            if (descEl) descEl.textContent = item.description;
          }
        });
      }

      // ---- Product Selector ----
      if (data.productSelectorHeading) {
        var psH = document.getElementById('cms-product-selector-heading');
        if (psH) psH.textContent = data.productSelectorHeading;
      }
      if (data.productSelectorDesc) {
        var psD = document.getElementById('cms-product-selector-desc');
        if (psD) psD.textContent = data.productSelectorDesc;
      }

      // ---- Case Studies Heading ----
      if (data.caseStudiesHeading) {
        var csH = document.getElementById('cms-case-studies-heading');
        if (csH) csH.textContent = data.caseStudiesHeading;
      }
    };

  // ============================================================
  // GENERIC PAGE CONTENT LOADER
  // ============================================================
  CMSLoader.loadPageContent = function () {
    // Skip homepage — it has its own dedicated loader
    if (document.getElementById('cms-hero-title-line1')) return;

    var pageName = '';
    var path = window.location.pathname;

    // Detect page from URL
    if (path.indexOf('/about/certifications') !== -1) pageName = 'certifications';
    else if (path.indexOf('/about/team') !== -1) pageName = 'team';
    else if (path.indexOf('/about/safety') !== -1) pageName = 'safety';
    else if (path.indexOf('/about/warranty') !== -1) pageName = 'warranty';
    else if (path.indexOf('/about/faq') !== -1) pageName = 'faq';
    else if (path.indexOf('/about/distributors') !== -1) pageName = 'distributors';
    else if (path.indexOf('/about/downloads') !== -1) pageName = 'downloads';
    else if (path.indexOf('/about/manuals') !== -1) pageName = 'manuals';
    else if (path.indexOf('/about/company') !== -1 || path.indexOf('/about/index') !== -1) pageName = 'about';
    else if (path.indexOf('/about/oem-odm') !== -1) pageName = 'oem-odm';
    else if (path.indexOf('/about/global') !== -1) pageName = 'global';
    else if (path.indexOf('/about/payment-terms') !== -1) pageName = 'payment-terms';
    else if (path.indexOf('/about/brochure') !== -1) pageName = 'brochure';
    else if (path.indexOf('/products/drills-drivers') !== -1) pageName = 'drills-drivers';
    else if (path.indexOf('/products/saws') !== -1) pageName = 'saws';
    else if (path.indexOf('/products/grinders') !== -1) pageName = 'grinders';
    else if (path.indexOf('/products/sanders') !== -1) pageName = 'sanders';
    else if (path.indexOf('/products/impact-tools') !== -1) pageName = 'impact-tools';
    else if (path.indexOf('/products/combo-kits') !== -1) pageName = 'combo-kits';
    else if (path.indexOf('/products/product') !== -1) pageName = 'products';
    else if (path.indexOf('/products/index') !== -1 || path === '/products/' || path.endsWith('/products')) pageName = 'products';
    else if (path.indexOf('/blogs/index') !== -1 || path.indexOf('/blogs/') !== -1 && path.indexOf('/blogs/post') === -1) pageName = 'blog';
    else if (path.indexOf('/blogs/post') !== -1) pageName = 'blog';
    else if (path.indexOf('/contact') !== -1) pageName = 'contact';
    else if (path.indexOf('/privacy') !== -1) pageName = 'privacy';
    else if (path.indexOf('/terms') !== -1) pageName = 'terms';

    if (!pageName) return;

    return CMSLoader.loadPageSettings(pageName).then(function (data) {
      if (!data || !Object.keys(data).length) return;

      var titleEl = document.getElementById('cms-page-title');
      var subtitleEl = document.getElementById('cms-page-subtitle');
      var descEl = document.getElementById('cms-page-description');
      var bodyEl = document.getElementById('cms-page-body');

      if (data.pageTitle && titleEl) {
        titleEl.textContent = data.pageTitle;
      }
      if (data.subtitle && subtitleEl) {
        subtitleEl.textContent = data.subtitle;
      }
      if (data.description && descEl) {
        descEl.textContent = data.description;
      }
      if (data.body && bodyEl) {
        bodyEl.innerHTML = CMSLoader.parseMarkdown(data.body);
      }
      // Also handle title field (used by some pages like about, contact, etc.)
      if (data.title && titleEl && !data.pageTitle) {
        titleEl.textContent = data.title;
      }

      // Update SEO meta tags
      if (data.pageTitle || data.title) {
        document.title = (data.pageTitle || data.title) + ' – Ningbo Siyang';
      }
      if (data.description) {
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.description);
        var ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', data.description);
        var twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc) twDesc.setAttribute('content', data.description);
      }
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && (data.pageTitle || data.title)) {
        ogTitle.setAttribute('content', (data.pageTitle || data.title) + ' – Ningbo Siyang');
      }
      var twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle && (data.pageTitle || data.title)) {
        twTitle.setAttribute('content', (data.pageTitle || data.title) + ' – Ningbo Siyang');
      }
    });
  };

  // ============================================================
  // PRODUCT 3D VIEWER
  // ============================================================
  CMSLoader.loadProduct3D = function (productData) {
    if (!productData) return;

    var section = document.getElementById('product-3d-section');
    if (!section) return;

    var hasSpline = !!productData.splineSceneUrl;
    var hasImages = productData.images && productData.images.length > 0;
    if (!hasSpline && !hasImages) return;

    // Show the section
    section.classList.remove('hidden');

    var container = document.getElementById('product-spline-container');
    var loading = document.getElementById('product-3d-loading');
    var hint = document.getElementById('product-3d-hint');
    var arBtn = document.getElementById('btn-ar');
    var autoSpinBtn = document.getElementById('btn-autospin');
    var autoSpinLabel = document.getElementById('autospin-label');
    var explodedBtn = document.getElementById('btn-exploded');

    if (hasSpline) {
      // ── Spline 3D Viewer ──
      var viewer = document.createElement('spline-viewer');
      viewer.setAttribute('url', productData.splineSceneUrl);
      viewer.style.width = '100%';
      viewer.style.height = '100%';

      var autoSpin = productData.autoSpin !== false;
      if (autoSpin) {
        viewer.setAttribute('loading-animation', 'spin');
      }

      container.appendChild(viewer);

      viewer.addEventListener('load', function() {
        if (loading) loading.style.display = 'none';
      });
      setTimeout(function() {
        if (loading) loading.style.display = 'none';
      }, 5000);

      setTimeout(function() {
        if (hint) hint.style.opacity = '0';
      }, 5000);
      container.addEventListener('pointerdown', function() {
        if (hint) hint.style.opacity = '0';
      }, { once: true });

      var isAutoSpin = autoSpin;
      if (autoSpinBtn) {
        autoSpinBtn.addEventListener('click', function() {
          isAutoSpin = !isAutoSpin;
          if (autoSpinLabel) {
            autoSpinLabel.textContent = 'Auto-Spin: ' + (isAutoSpin ? 'ON' : 'OFF');
          }
          if (isAutoSpin) {
            viewer.style.animation = 'pm-ambient-float 5s ease-in-out infinite';
          } else {
            viewer.style.animation = 'none';
          }
        });
      }

      var isExploded = false;
      if (explodedBtn) {
        explodedBtn.addEventListener('click', function() {
          isExploded = !isExploded;
          explodedBtn.classList.toggle('bg-yellow-400/20');
          explodedBtn.classList.toggle('border');
          explodedBtn.classList.toggle('border-yellow-400/50');
          viewer.dispatchEvent(new CustomEvent('exploded-view', { detail: { exploded: isExploded } }));
        });
      }

      // AR Quick Look
      if (productData.arModelUrl && arBtn) {
        arBtn.classList.remove('hidden');
        arBtn.classList.add('flex');
        arBtn.href = productData.arModelUrl;
        var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (!isIOS && productData.arModelUrl.endsWith('.usdz')) {
          arBtn.classList.add('hidden');
          arBtn.classList.remove('flex');
        }
      }
    } else {
      // ── 360° Image Rotation Viewer ──
      if (loading) loading.style.display = 'none';

      // Build the 360° viewer
      var viewer360 = document.createElement('div');
      viewer360.className = 'pm-360-viewer w-full h-full';

      // Add all images
      var allImages = [];
      if (productData.image) allImages.push(productData.image);
      if (productData.images) {
        productData.images.forEach(function(img) {
          if (allImages.indexOf(img) === -1) allImages.push(img);
        });
      }

      allImages.forEach(function(src, i) {
        var img = document.createElement('img');
        img.src = src;
        img.alt = productData.name || 'Product angle ' + (i + 1);
        img.loading = 'lazy';
        if (i === 0) img.classList.add('pm-360-active');
        viewer360.appendChild(img);
      });

      // Add dot ring
      var ring = document.createElement('div');
      ring.className = 'pm-360-ring';
      viewer360.appendChild(ring);

      // Add drag hint
      var hint360 = document.createElement('div');
      hint360.className = 'pm-360-hint';
      hint360.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg> Drag to rotate 360°';
      viewer360.appendChild(hint360);

      container.appendChild(viewer360);

      // Hide Spline-specific controls, show 360 hint
      if (autoSpinBtn) autoSpinBtn.style.display = 'none';
      if (explodedBtn) explodedBtn.style.display = 'none';

      // Update section description
      var desc = section.querySelector('p');
      if (desc) desc.textContent = 'Click & drag to rotate the product 360°. See every angle.';

      // Initialize the 360° viewer (premium-motion.js handles it)
      setTimeout(function() {
        if (window.ENGINE && window.ENGINE.init360Viewer) {
          window.ENGINE.init360Viewer();
        }
      }, 100);
    }
  };

  // ============================================================
  // PAGE MARKDOWN — renders any page's CMS body into a container
  // ============================================================
  CMSLoader.loadPageMarkdown = function (pageName, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return Promise.resolve();
    return CMSLoader.loadPageSettings(pageName).then(function (data) {
      if (!data || !data.body) return;
      container.innerHTML = '<div class="cms-page-body">' + parseMarkdown(data.body) + '</div>';
      if (data.title) {
        var titleEl = document.getElementById(containerId + '-title');
        if (titleEl) titleEl.textContent = data.title;
      }
    });
  };

  // ============================================================
  // COMPANY INFO
  // ============================================================
  CMSLoader.loadCompanyInfo = function () {
    return CMSLoader.loadSiteSettings('company').then(function (data) {
      if (!data || !Object.keys(data).length) return;

      var selectors = {
        email: '.cms-company-email',
        phone: '.cms-company-phone',
        address: '.cms-company-address',
        companyName: '.cms-company-name',
        founded: '.cms-company-founded',
        whatsapp: '.cms-company-whatsapp',
        youtube: '.cms-company-youtube',
        wechatQR: '.cms-company-wechat-qr'
      };

      Object.keys(selectors).forEach(function (key) {
        if (data[key]) {
          var els = document.querySelectorAll(selectors[key]);
          els.forEach(function (el) {
            if (el.tagName === 'A') {
              if (key === 'email') el.href = 'mailto:' + data[key];
              else if (key === 'phone') el.href = 'tel:' + data[key];
              else if (key === 'whatsapp') el.href = 'https://wa.me/' + data[key].replace(/[^0-9]/g, '');
              else if (key === 'youtube') el.href = data[key];
              else el.href = data[key];
            }
            if (key === 'wechatQR' && el.tagName === 'IMG') {
              el.src = data[key];
            } else if (key !== 'wechatQR' && key !== 'whatsapp' && key !== 'youtube') {
              el.textContent = data[key];
            }
          });
        }
      });
      // Update JSON-LD structured data
      CMSLoader.updateStructuredData(data);

      // ---- Logo ----
      if (data.logoDark) {
        var logoLinks = document.querySelectorAll('.cms-company-logo-link');
        logoLinks.forEach(function (link) {
          var img = link.querySelector('img.cms-company-logo-img');
          if (!img) {
            // Replace the inline SY badge with an <img>
            var badgeDiv = link.querySelector('.relative.w-11');
            var textDiv = link.querySelector('.hidden.sm\\:block');
            if (badgeDiv) {
              img = document.createElement('img');
              img.className = 'cms-company-logo-img h-10 w-auto';
              img.alt = data.logoAlt || 'SY';
              img.src = data.logoDark;
              badgeDiv.replaceWith(img);
            }
            if (textDiv) textDiv.style.display = 'none';
          } else {
            img.src = data.logoDark;
            if (data.logoAlt) img.alt = data.logoAlt;
          }
        });
      }
      if (data.logoAlt) {
        var logoTexts = document.querySelectorAll('.cms-company-logo-text');
        logoTexts.forEach(function (el) {
          el.textContent = data.logoAlt.split(' - ')[0] || data.logoAlt;
        });
      }
      if (data.logoDark) {
        // Update JSON-LD logo references
        var ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
        ldScripts.forEach(function (script) {
          try {
            var ld = JSON.parse(script.textContent);
            if (ld && ld['@graph']) {
              ld['@graph'].forEach(function (item) {
                if (item['@type'] === 'Organization' || item['@type'] === 'LocalBusiness') {
                  if (data.logoDark) item.logo = data.logoDark;
                  if (data.logoDark) item.image = data.logoDark;
                }
              });
              script.textContent = JSON.stringify(ld);
            }
          } catch (e) {}
        });
      }

      // ---- Scroll Animations ----
      if (data.scrollAnimations && typeof data.scrollAnimations === 'object') {
        var saAttrMap = {
          galleryInset: 'data-sa-inset',
          galleryParallaxY: 'data-sa-translate-y',
          galleryInsetX: 'data-sa-inset-x',
          galleryScale: 'data-sa-scale',
          factoryInset: 'data-sa-inset',
          qualityInset: 'data-sa-inset',
          ctaInset: 'data-sa-inset',
          ctaHeadingY: 'data-sa-translate-y',
          ctaButtonY: 'data-sa-translate-y'
        };
        Object.keys(data.scrollAnimations).forEach(function (key) {
          var attr = saAttrMap[key];
          if (!attr) return;
          var el = document.querySelector('[data-sa-cms="' + key + '"]');
          if (el) {
            el.setAttribute(attr, data.scrollAnimations[key]);
          }
        });
        // Re-init scroll animations if the engine is loaded
        if (window.ScrollAnimations && typeof window.ScrollAnimations.init === 'function') {
          window.ScrollAnimations.init();
        }
      }

      // Sync CMS company data into SITE_CONFIG so site-config.js values stay current
      if (typeof mergeCmsSettings === 'function') {
        window.__CMS_DATA = window.__CMS_DATA || {};
        window.__CMS_DATA.settings = window.__CMS_DATA.settings || {};
        window.__CMS_DATA.settings.company = data;
        mergeCmsSettings();
        applySiteConfig();
      }
    });
  };

  // ============================================================
  // STRUCTURED DATA — update JSON-LD from CMS company data
  // ============================================================
  CMSLoader.updateStructuredData = function (companyData) {
    if (!companyData) return;
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(function (script) {
      try {
        var data = JSON.parse(script.textContent);
        if (!data || !data['@graph']) return;
        data['@graph'].forEach(function (item) {
          if (item['@type'] === 'Organization' || item['@type'] === 'LocalBusiness') {
            if (companyData.companyName) item.name = companyData.companyName;
            if (companyData.email) {
              if (item.contactPoint) {
                item.contactPoint.email = companyData.email;
              }
              if (item.email) item.email = companyData.email;
            }
            if (companyData.phone) {
              if (item.contactPoint) {
                item.contactPoint.telephone = companyData.phone;
              }
              if (item.telephone) item.telephone = companyData.phone;
            }
            if (companyData.address && item.address) {
              item.address.streetAddress = companyData.address;
            }
            if (companyData.youtube || companyData.linkedin) {
              var sameAs = [];
              if (companyData.youtube) sameAs.push(companyData.youtube);
              if (companyData.linkedin) sameAs.push(companyData.linkedin);
              item.sameAs = sameAs;
            }
            // Business hours
            if (companyData.businessHours && item.openingHoursSpecification) {
              var parts = companyData.businessHours.match(/(\w+-\w+)\s+(\d+:\d+)-(\d+:\d+)/);
              if (parts) {
                var days = parts[1].split('-');
                var dayMap = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
                item.openingHoursSpecification[0].dayOfWeek = days.map(function (d) { return dayMap[d] || d; });
                item.openingHoursSpecification[0].opens = parts[2];
                item.openingHoursSpecification[0].closes = parts[3];
              }
            }
            // Geo coordinates
            if (companyData.latitude && companyData.longitude && item.geo) {
              item.geo.latitude = parseFloat(companyData.latitude);
              item.geo.longitude = parseFloat(companyData.longitude);
            }
          }
        });
        script.textContent = JSON.stringify(data);
      } catch (e) {
        // Skip malformed JSON-LD
      }
    });
  };

  // ============================================================
  // FOOTER SETTINGS
  // ============================================================
  // ============================================================
  // TEAM MEMBERS — reads index.json (which CMS can regenerate)
  // ============================================================
  CMSLoader.loadTeamMembers = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();
    if (container.children.length > 0) return Promise.resolve();

    return loadCollectionFromMD('content/team', 'members', function (a, b) { return (a.order || 0) - (b.order || 0); }).then(function (members) {
      var html = members.map(function (member) {
        var name = escapeHtml(member.name || '');
        var title = escapeHtml(member.title || '');
        var photo = member.photo || '';
        var bio = escapeHtml(member.bio || '');

        return '<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 text-center hover:border-yellow-400/30 transition-colors">' +
          '<div class="w-24 h-24 mx-auto mb-4 rounded-full bg-zinc-800 overflow-hidden">' +
          '<img src="' + photo + '" alt="' + name + '" class="w-full h-full object-cover" onerror="this.style.display=\'none\'"/>' +
          '</div>' +
          '<h3 class="font-oswald text-lg font-bold text-white mb-1">' + name + '</h3>' +
          '<p class="text-yellow-400 text-sm font-medium mb-3">' + title + '</p>' +
          '<p class="text-zinc-400 text-sm leading-relaxed">' + bio + '</p>' +
          '</div>';
      }).join('');

      container.innerHTML = html;
    }).catch(function () {});
  };

  // ============================================================
  // TESTIMONIALS
  // ============================================================
  CMSLoader.loadTestimonials = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();
    if (container.children.length > 0) return Promise.resolve();

    return loadCollectionFromMD('content/testimonials', 'testimonials', function (a, b) { return (a.order || 0) - (b.order || 0); }).then(function (testimonials) {
      var html = testimonials.map(function (testimonial) {
        var name = escapeHtml(testimonial.name || '');
        var company = escapeHtml(testimonial.company || '');
        var quote = escapeHtml(testimonial.quote || '');
        var avatar = testimonial.avatar || '';
        var rating = testimonial.rating || 5;

        return '<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-yellow-400/30 transition-colors">' +
          renderStars(rating) +
          '<p class="text-zinc-300 italic mb-4 leading-relaxed">"' + quote + '"</p>' +
          '<div class="flex items-center gap-3">' +
          '<div class="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">' +
          '<img src="' + avatar + '" alt="' + name + '" class="w-full h-full object-cover" onerror="this.style.display=\'none\'"/>' +
          '</div>' +
          '<div>' +
          '<p class="text-white font-medium text-sm">' + name + '</p>' +
          '<p class="text-zinc-500 text-xs">' + company + '</p>' +
          '</div>' +
          '</div>' +
          '</div>';
      }).join('');

      container.innerHTML = html;
    }).catch(function () {});
  };

  // ============================================================
  // CERTIFICATIONS
  // ============================================================
  CMSLoader.loadCertifications = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();
    if (container.children.length > 0) return Promise.resolve();

    return loadCollectionFromMD('content/certifications', 'certifications').then(function (certs) {
      var html = certs.map(function (cert) {
        var name = escapeHtml(cert.name || '');
        var issuer = escapeHtml(cert.issuer || '');
        var image = cert.image || '';
        var year = escapeHtml(String(cert.year || ''));

        return '<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-yellow-400/30 transition-colors">' +
          '<div class="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-lg overflow-hidden">' +
          '<img src="' + image + '" alt="' + name + '" class="w-full h-full object-cover" onerror="this.style.display=\'none\'"/>' +
          '</div>' +
          '<h3 class="font-oswald text-lg font-bold text-white mb-1 text-center">' + name + '</h3>' +
          '<p class="text-yellow-400 text-sm text-center mb-1">' + issuer + '</p>' +
          '<p class="text-zinc-500 text-xs text-center">' + year + '</p>' +
          '</div>';
      }).join('');

      container.innerHTML = html;
    }).catch(function () {});
  };

  // ============================================================
  // FAQ
  // ============================================================
  CMSLoader.loadFAQ = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();
    if (container.children.length > 0) return Promise.resolve();

    return loadCollectionFromMD('content/faq', 'faq', function (a, b) { return (a.order || 0) - (b.order || 0); }).then(function (items) {
      var grouped = {};
      items.forEach(function (item) {
        var cat = item.category || 'General';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
      });

      var html = '';
      Object.keys(grouped).forEach(function (category) {
        html += '<div class="mb-8">' +
          '<h2 class="font-oswald text-xl font-bold text-white mb-4">' + escapeHtml(category) + '</h2>' +
          '<div class="space-y-3">';

        grouped[category].forEach(function (item) {
          html += '<details class="bg-zinc-900 rounded-xl border border-zinc-800 group">' +
            '<summary class="flex items-center justify-between p-5 cursor-pointer hover:border-yellow-400/30 transition-colors">' +
            '<span class="font-medium text-white pr-4">' + escapeHtml(item.question || '') + '</span>' +
            '<svg class="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>' +
            '</summary>' +
            '<div class="px-5 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-zinc-800 pt-3">' + escapeHtml(item.answer || '') + '</div>' +
            '</details>';
        });

        html += '</div></div>';
      });

      container.innerHTML = html || '<p class="text-zinc-500">' + _t('cms.noContent', 'No FAQ items available yet.') + '</p>';
    }).catch(function () {});
  };

  // ============================================================
  // DISTRIBUTORS
  // ============================================================
  CMSLoader.loadDistributors = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();
    if (container.children.length > 0) return Promise.resolve();

    return loadCollectionFromMD('content/distributors', 'distributors').then(function (distributors) {
      var grouped = {};
      distributors.forEach(function (d) {
        var region = d.region || 'Other';
        if (!grouped[region]) grouped[region] = [];
        grouped[region].push(d);
      });

      var html = '';
      Object.keys(grouped).forEach(function (region) {
        html += '<div class="mb-10">' +
          '<h2 class="font-oswald text-2xl font-bold text-white mb-6">' + escapeHtml(region) + '</h2>' +
          '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';

        grouped[region].forEach(function (d) {
          var name = escapeHtml(d.companyName || '');
          var country = escapeHtml(d.country || '');
          var contact = escapeHtml(d.contactPerson || '');
          var email = d.email || '';
          var phone = escapeHtml(d.phone || '');
          var website = d.website || '';
          var logo = d.logo || '';

          html += '<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-yellow-400/30 transition-colors">' +
            '<div class="flex items-center gap-4 mb-4">' +
            (logo ? '<img src="' + logo + '" alt="' + name + '" class="w-12 h-12 object-contain" onerror="this.style.display=\'none\'"/>' : '') +
            '<div>' +
            '<h3 class="font-oswald text-lg font-bold text-white">' + name + '</h3>' +
            '<p class="text-yellow-400 text-sm">' + country + '</p>' +
            '</div></div>';

          if (contact) html += '<p class="text-zinc-400 text-sm mb-1">' + _t('cms.contact', 'Contact') + ': ' + contact + '</p>';
          if (email) html += '<a href="mailto:' + escapeHtml(email) + '" class="text-zinc-400 text-sm hover:text-yellow-400 transition-colors block mb-1">' + escapeHtml(email) + '</a>';
          if (phone) html += '<p class="text-zinc-400 text-sm mb-1">' + phone + '</p>';
          if (website) html += '<a href="' + escapeHtml(website) + '" target="_blank" class="text-yellow-400 text-sm hover:text-yellow-300 transition-colors">' + _t('cms.visitWebsite', 'Visit Website') + ' &rarr;</a>';

          html += '</div>';
        });

        html += '</div></div>';
      });

      container.innerHTML = html || '<p class="text-zinc-500">' + _t('cms.noContent', 'No distributors available yet.') + '</p>';
    }).catch(function () {});
  };

  // ============================================================
  // WARRANTY
  // ============================================================
  CMSLoader.loadWarranty = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();
    if (container.children.length > 0) return Promise.resolve();

    return loadCollectionFromMD('content/warranty', 'warranty').then(function (policies) {
      var html = policies.map(function (policy) {
        var title = escapeHtml(policy.title || '');
        var period = escapeHtml(policy.warrantyPeriod || '');
        var description = escapeHtml(policy.description || '');
        var type = policy.warrantyType || 'standard';
        var typeLabel = type === 'brushless_motor' ? 'Brushless Motor' : type === 'extended' ? 'Extended' : 'Standard';
        var typeColor = type === 'brushless_motor' ? 'text-blue-400' : type === 'extended' ? 'text-purple-400' : 'text-green-400';

        var card = '<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-yellow-400/30 transition-colors">' +
          '<div class="flex items-center gap-3 mb-4">' +
          '<span class="px-3 py-1 text-xs font-medium rounded-full bg-zinc-800 ' + typeColor + '">' + typeLabel + '</span>' +
          '<span class="text-zinc-500 text-sm">' + period + '</span>' +
          '</div>' +
          '<h3 class="font-oswald text-xl font-bold text-white mb-3">' + title + '</h3>' +
          '<p class="text-zinc-400 text-sm leading-relaxed mb-4">' + description + '</p>';

        if (policy.exclusions && policy.exclusions.length) {
          card += '<div class="border-t border-zinc-800 pt-4">' +
            '<h4 class="text-sm font-medium text-zinc-300 mb-2">' + _t('cms.exclusions', 'Exclusions') + '</h4>' +
            '<ul class="list-disc list-inside space-y-1">';
          policy.exclusions.forEach(function (ex) {
            card += '<li class="text-zinc-500 text-sm">' + escapeHtml(typeof ex === 'string' ? ex : ex.exclusion || '') + '</li>';
          });
          card += '</ul></div>';
        }

        if (policy.claimProcess) {
          card += '<div class="border-t border-zinc-800 pt-4 mt-4">' +
            '<h4 class="text-sm font-medium text-zinc-300 mb-2">' + _t('cms.claimProcess', 'Claim Process') + '</h4>' +
            '<p class="text-zinc-400 text-sm leading-relaxed">' + escapeHtml(policy.claimProcess) + '</p></div>';
        }

        card += '</div>';
        return card;
      }).join('');

      container.innerHTML = html || '<p class="text-zinc-500">' + _t('cms.noContent', 'No warranty policies available yet.') + '</p>';
    }).catch(function () {});
  };

  // ============================================================
  // SAFETY NOTICES
  // ============================================================
  CMSLoader.loadSafety = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();
    if (container.children.length > 0) return Promise.resolve();

    return loadCollectionFromMD('content/safety', 'safety', function (a, b) {
      var severityOrder = { critical: 0, warning: 1, info: 2 };
      return (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2);
    }).then(function (notices) {
      var html = notices.map(function (notice) {
        var title = escapeHtml(notice.title || '');
        var description = escapeHtml(notice.description || '');
        var severity = notice.severity || 'info';
        var noticeType = escapeHtml(notice.noticeType || '');
        var resolution = escapeHtml(notice.resolution || '');

        var severityColors = {
          critical: { border: 'border-red-500/50', bg: 'bg-red-500/10', text: 'text-red-400', badge: 'bg-red-500' },
          warning: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', text: 'text-yellow-400', badge: 'bg-yellow-500' },
          info: { border: 'border-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500' }
        };
        var colors = severityColors[severity] || severityColors.info;

        var card = '<div class="bg-zinc-900 rounded-xl border ' + colors.border + ' p-6">' +
          '<div class="flex items-center gap-3 mb-4">' +
          '<span class="px-3 py-1 text-xs font-bold rounded ' + colors.badge + ' text-white uppercase">' + escapeHtml(severity) + '</span>' +
          '<span class="text-zinc-500 text-sm">' + noticeType + '</span>' +
          '<span class="text-zinc-600 text-xs ml-auto">' + formatDate(notice.date) + '</span>' +
          '</div>' +
          '<h3 class="font-oswald text-xl font-bold text-white mb-3">' + title + '</h3>' +
          '<p class="text-zinc-400 text-sm leading-relaxed mb-4">' + description + '</p>';

        if (notice.affectedSkus && notice.affectedSkus.length) {
          card += '<div class="mb-4"><p class="text-xs text-zinc-500 mb-1">' + _t('cms.affectedProducts', 'Affected Products') + ':</p><div class="flex flex-wrap gap-2">';
          notice.affectedSkus.forEach(function (sku) {
            card += '<span class="px-2 py-1 text-xs bg-zinc-800 text-zinc-400 rounded">' + escapeHtml(sku) + '</span>';
          });
          card += '</div></div>';
        }

        if (resolution) {
          card += '<div class="border-t border-zinc-800 pt-4">' +
            '<h4 class="text-sm font-medium text-green-400 mb-2">' + _t('cms.resolution', 'Resolution') + '</h4>' +
            '<p class="text-zinc-400 text-sm leading-relaxed">' + resolution + '</p></div>';
        }

        card += '</div>';
        return card;
      }).join('');

      container.innerHTML = html || '<p class="text-zinc-500">' + _t('cms.noContent', 'No safety notices at this time.') + '</p>';
    }).catch(function () {});
  };

  // ============================================================
  // PARTNERS
  // ============================================================
  CMSLoader.loadPartners = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();
    if (container.children.length > 0) return Promise.resolve();

    return loadCollectionFromMD('content/partners', 'partners', function (a, b) { return (a.order || 0) - (b.order || 0); }).then(function (partners) {
      var html = '<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">';

      partners.forEach(function (partner) {
        var name = escapeHtml(partner.name || '');
        var logo = partner.logo || '';

        html += '<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 flex items-center justify-center hover:border-yellow-400/30 transition-colors">' +
          (logo
            ? '<img src="' + logo + '" alt="' + name + '" class="max-h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all" onerror="this.parentElement.innerHTML=\'<span class=\\\'text-zinc-400 text-sm font-medium text-center\\\'>' + name + '</span>\'"/>'
            : '<span class="text-zinc-400 text-sm font-medium text-center">' + name + '</span>') +
          '</div>';
      });

      html += '</div>';
      container.innerHTML = html || '<p class="text-zinc-500">' + _t('cms.noContent', 'No partners listed yet.') + '</p>';
    }).catch(function () {});
  };

  // ============================================================
  // CASE STUDIES
  // ============================================================
  CMSLoader.loadCaseStudies = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();
    if (container.children.length > 0) return Promise.resolve();

    return loadCollectionFromMD('content/case-studies', 'case_studies').then(function (studies) {
      var html = studies.map(function (study) {
        var title = escapeHtml(study.title || '');
        var client = escapeHtml(study.client || '');
        var country = study.country || '';
        var flag = study.countryFlag || '';
        var industry = escapeHtml(study.industry || '');
        var challenge = escapeHtml(study.challenge || '');
        var solution = escapeHtml(study.solution || '');
        var image = study.image || '';
        var testimonial = escapeHtml(study.testimonial || '');
        var testimonialAuthor = escapeHtml(study.testimonialAuthor || '');

        var card = '<div class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-yellow-400/30 transition-colors">';

        if (image) {
          card += '<div class="aspect-[16/9] overflow-hidden">' +
            '<img src="' + image + '" alt="' + title + '" class="w-full h-full object-cover" loading="lazy"/>' +
            '</div>';
        }

        card += '<div class="p-6">' +
          '<div class="flex items-center gap-2 mb-3">' +
          '<span class="text-2xl">' + flag + '</span>' +
          '<span class="text-zinc-500 text-sm">' + country + '</span>' +
          '</div>' +
          '<h3 class="font-oswald text-xl font-bold text-white mb-2">' + title + '</h3>' +
          '<p class="text-yellow-400 text-sm font-medium mb-1">' + client + '</p>' +
          '<p class="text-zinc-500 text-xs mb-4">' + industry + '</p>';

        if (study.results && study.results.length) {
          card += '<div class="grid grid-cols-2 gap-3 mb-4">';
          study.results.forEach(function (result) {
            card += '<div class="bg-zinc-800 rounded-lg p-3">' +
              '<p class="text-yellow-400 font-bold text-sm">' + escapeHtml(typeof result === 'string' ? result : result.result || '') + '</p>' +
              '</div>';
          });
          card += '</div>';
        }

        if (testimonial) {
          card += '<div class="border-t border-zinc-800 pt-4 mt-4">' +
            '<p class="text-zinc-300 italic text-sm mb-2">"' + testimonial + '"</p>';
          if (testimonialAuthor) {
            card += '<p class="text-zinc-500 text-xs">\u2014 ' + testimonialAuthor + '</p>';
          }
          card += '</div>';
        }

        card += '</div></div>';
        return card;
      }).join('');

      container.innerHTML = html || '<p class="text-zinc-500">' + _t('cms.noContent', 'No case studies available yet.') + '</p>';
    }).catch(function () {});
  };

  // ============================================================
  // NAVIGATION — dynamic product categories & main links
  // ============================================================
  CMSLoader.loadNavigation = function () {
    return CMSLoader.loadSiteSettings('navigation').then(function (data) {
      if (!data || !Object.keys(data).length) return;

      var categoriesContainer = document.getElementById('cms-nav-categories');
      if (categoriesContainer && data.categories && data.categories.length) {
        var basePath = getBasePath();
        var catHtml = data.categories.map(function (cat) {
          return '<a href="' + basePath + 'products/index.html?category=' + (cat.slug || '') + '" class="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors group/cat">' +
            '<div class="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0 group-hover/cat:bg-yellow-400/10 transition-colors">' +
            '<svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>' +
            '</div>' +
            '<div>' +
            '<h4 class="text-sm font-semibold text-white group-hover/cat:text-yellow-400 transition-colors mb-0.5">' + escapeHtml(cat.name || '') + '</h4>' +
            '<p class="text-xs text-zinc-400">' + escapeHtml(cat.description || '') + '</p>' +
            '</div></a>';
        }).join('');
        categoriesContainer.innerHTML = catHtml;
      }
    });
  };

  // ============================================================
  // FOOTER FULL — columns, social links, copyright
  // ============================================================
  CMSLoader.loadFooterFull = function () {
    return CMSLoader.loadSiteSettings('footer').then(function (data) {
      if (!data || !Object.keys(data).length) return;

      // Copyright
      var copyright = document.getElementById('cms-footer-copyright');
      if (data.copyright && copyright) copyright.textContent = data.copyright;

      // Badges (from list)
      if (Array.isArray(data.trustBadges)) {
        data.trustBadges.forEach(function (item, idx) {
          var text = item.text || '';
          var el = document.getElementById('cms-footer-badge' + (idx + 1));
          if (text && el) el.textContent = text;
        });
      }

      // Footer columns
      var columnsContainer = document.getElementById('cms-footer-columns');
      if (columnsContainer && data.columns && data.columns.length) {
        var basePath = getBasePath();
        var colHtml = data.columns.map(function (col) {
          var linksHtml = '';
          if (col.links && col.links.length) {
            linksHtml = '<ul class="space-y-2">' + col.links.map(function (link) {
              var href = link.href || 'javascript:void(0)';
              if (href.indexOf('http') !== 0 && href.indexOf('/') === 0) {
                href = basePath + href.slice(1);
              }
              var linkAttrs = href === 'javascript:void(0)' ? ' role="button" title="Coming soon"' : '';
              return '<li><a href="' + escapeHtml(href) + '"' + linkAttrs + ' class="text-sm text-zinc-400 hover:text-yellow-400 transition-colors">' + escapeHtml(link.label || '') + '</a></li>';
            }).join('') + '</ul>';
          }
          return '<div>' +
            '<h3 class="font-oswald text-lg font-semibold text-white mb-4 uppercase tracking-wide">' + escapeHtml(col.title || '') + '</h3>' +
            linksHtml +
            '</div>';
        }).join('');
        columnsContainer.innerHTML = colHtml;
      }

      // Social links
      var socialContainer = document.getElementById('cms-social-links');
      if (socialContainer && data.socialLinks && data.socialLinks.length) {
        var socialHtml = data.socialLinks.map(function (social) {
          var platform = (social.platform || '').toLowerCase();
          var icons = {
            linkedin: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
            youtube: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            facebook: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            twitter: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            instagram: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>',
            wechat: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-2.036 2.84c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.97-.983zm4.072 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.97-.983z"/></svg>'
          };
          var icon = icons[platform] || icons.linkedin;
          var socialHref = social.href || 'javascript:void(0)';
          var socialAttrs = socialHref === 'javascript:void(0)' ? ' role="button" title="Coming soon"' : '';
          return '<a href="' + escapeHtml(socialHref) + '"' + socialAttrs + ' target="_blank" rel="noopener noreferrer" class="w-11 h-11 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-yellow-400 hover:text-zinc-900 transition-colors" aria-label="' + escapeHtml(social.platform || 'Social') + '">' + icon + '</a>';
        }).join('');
        socialContainer.innerHTML = socialHtml;
      }
    });
  };

  // ============================================================
  // MANUALS
  // ============================================================
  CMSLoader.loadManuals = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();
    if (container.children.length > 0) return Promise.resolve();

    return loadCollectionFromMD('content/manuals', 'manuals').then(function (manuals) {
      var grouped = {};
      manuals.forEach(function (m) {
        var lang = m.language || 'en';
        if (!grouped[lang]) grouped[lang] = [];
        grouped[lang].push(m);
      });

      var langLabels = { en: 'English', zh: 'Chinese', ar: 'Arabic', fr: 'French', ru: 'Russian', es: 'Spanish' };

      var html = '';
      Object.keys(grouped).forEach(function (lang) {
        html += '<div class="mb-10">' +
          '<h2 class="font-oswald text-2xl font-bold text-white mb-6">' + (langLabels[lang] || lang) + '</h2>' +
          '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';

        grouped[lang].forEach(function (m) {
          var title = escapeHtml(m.title || '');
          var sku = escapeHtml(m.productSku || '');
          var version = escapeHtml(m.version || '');
          var pages = m.pages || '';
          var file = m.file || '';
          var date = formatDate(m.date);

          html += '<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-yellow-400/30 transition-colors">' +
            '<div class="flex items-start gap-4">' +
            '<div class="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">' +
            '<svg class="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/></svg>' +
            '</div>' +
            '<div class="flex-1 min-w-0">' +
            '<h3 class="font-oswald text-lg font-bold text-white mb-1 truncate">' + title + '</h3>' +
            '<p class="text-yellow-400 text-sm mb-2">' + _t('cms.sku', 'SKU') + ': ' + sku + '</p>';

          if (version) html += '<p class="text-zinc-500 text-xs mb-1">' + _t('cms.version', 'Version') + ': ' + version + '</p>';
          if (pages) html += '<p class="text-zinc-500 text-xs mb-1">' + pages + ' ' + _t('cms.pages', 'pages') + '</p>';
          html += '<p class="text-zinc-600 text-xs mb-3">' + date + '</p>';

          if (file) {
            html += '<a href="' + escapeHtml(file) + '" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-zinc-900 hover:bg-yellow-300 font-semibold text-sm rounded-lg transition-colors">' +
              '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>' +
              _t('cms.download', 'Download PDF') + '</a>';
          }

          html += '</div></div></div>';
        });

        html += '</div></div>';
      });

      container.innerHTML = html || '<p class="text-zinc-500">' + _t('cms.noContent', 'No manuals available yet.') + '</p>';
    }).catch(function () {});
  };

  // ============================================================
  // DOWNLOADS
  // ============================================================
  CMSLoader.loadDownloads = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();
    if (container.children.length > 0) return Promise.resolve();

    return loadCollectionFromMD('content/downloads', 'downloads').then(function (downloads) {
      var grouped = {};
      downloads.forEach(function (d) {
        var cat = d.category || 'Other';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(d);
      });

      var catIcons = {
        'Catalog': { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: '<path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>' },
        'Spec Sheet': { bg: 'bg-green-500/10', text: 'text-green-400', icon: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>' },
        'Manual': { bg: 'bg-red-500/10', text: 'text-red-400', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>' },
        'Certificate': { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: '<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 2.5 12c0 2.844 1.004 5.456 2.673 7.488L12 22l6.827-2.512A12.02 12.02 0 0 0 21.5 12c0-1.543-.296-3.016-.832-4.376a11.955 11.955 0 0 1-3.05-2.64z"/>' },
        'Firmware': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: '<path d="M13 10V3L4 14h7v7l9-11h-7z"/>' }
      };

      var html = '';
      Object.keys(grouped).forEach(function (category) {
        var icon = catIcons[category] || catIcons['Catalog'];

        html += '<div class="mb-10">' +
          '<h2 class="font-oswald text-2xl font-bold text-white mb-6 flex items-center gap-3">' +
          '<span class="w-10 h-10 ' + icon.bg + ' rounded-lg flex items-center justify-center"><svg class="w-5 h-5 ' + icon.text + '" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">' + icon.icon + '</svg></span>' +
          escapeHtml(category) + '</h2>' +
          '<div class="space-y-4">';

        grouped[category].forEach(function (d) {
          var title = escapeHtml(d.title || '');
          var version = escapeHtml(d.version || '');
          var fileSize = escapeHtml(d.fileSize || '');
          var file = d.file || '';
          var date = formatDate(d.date);
          var description = escapeHtml(d.description || '');
          var lang = (d.language || 'en').toUpperCase();

          html += '<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-yellow-400/30 transition-colors">' +
            '<div class="flex items-start justify-between gap-4">' +
            '<div class="flex-1 min-w-0">' +
            '<div class="flex items-center gap-2 mb-2">' +
            '<h3 class="font-oswald text-lg font-bold text-white">' + title + '</h3>' +
            '<span class="px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-400 rounded">' + lang + '</span>' +
            '</div>';

          if (description) html += '<p class="text-zinc-400 text-sm leading-relaxed mb-3">' + description + '</p>';

          var meta = [];
          if (version) meta.push(_t('cms.version', 'Version') + ': ' + version);
          if (fileSize) meta.push(fileSize);
          meta.push(date);
          html += '<p class="text-zinc-500 text-xs">' + meta.join(' &middot; ') + '</p>';

          html += '</div>';

          if (file) {
            html += '<a href="' + escapeHtml(file) + '" target="_blank" class="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-zinc-900 hover:bg-yellow-300 font-semibold text-sm rounded-lg transition-colors">' +
              '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>' +
              _t('cms.download', 'Download') + '</a>';
          }

          html += '</div></div>';
        });

        html += '</div></div>';
      });

      container.innerHTML = html || '<p class="text-zinc-500">' + _t('cms.noContent', 'No downloads available yet.') + '</p>';
    }).catch(function () {});
  };

  // ============================================================
  // RELATED PRODUCTS — for product detail page
  // ============================================================
  CMSLoader.loadRelatedProducts = function (currentSku, containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();

    return loadCollectionFromMD('content/products', 'products').then(function (products) {
      // Filter out archived and current product
      var others = products.filter(function (p) { return p.sku !== currentSku && p.archived !== true; });
      // Prefer products from the same category as the current product
      var currentProduct = products.filter(function (p) { return p.sku === currentSku; })[0];
      var sameCategory = others;
      if (currentProduct && currentProduct.category) {
        sameCategory = others.filter(function (p) { return p.category === currentProduct.category; });
      }
      var related = sameCategory.length >= 3 ? sameCategory.slice(0, 3) : sameCategory.concat(others.filter(function (p) { return sameCategory.indexOf(p) === -1; })).slice(0, 3);

      if (!related.length) {
        // Hide the related products section if none found
        var section = document.getElementById('related-products-section');
        if (section) section.classList.add('hidden');
        return;
      }

      var html = related.map(function (product) {
        var priceHtml = '';
        if (product.price && Number(product.price) > 0) {
          priceHtml = '<span class="text-lg font-bold text-white">$' + Number(product.price).toFixed(2) + '</span>';
        } else {
          priceHtml = '<span class="text-sm font-semibold text-yellow-400">' + _t('cms.requestQuote','Request Quote') + '</span>';
        }

        return '<div class="group relative bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 hover:border-yellow-400/50 transition-all duration-300">' +
          '<div class="relative aspect-square bg-zinc-900 overflow-hidden">' +
          '<img src="' + (product.image || (product.images && product.images[0]) || '') + '" alt="' + escapeHtml(product.name || '') + '" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"/>' +
          '</div>' +
          '<div class="p-4">' +
          '<p class="text-xs text-red-400 uppercase tracking-wider mb-1 font-semibold">' + escapeHtml(product.brand || '') + '</p>' +
          '<h3 class="font-oswald font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-2 mb-2 leading-snug">' + escapeHtml(product.name || '') + '</h3>' +
          '<div class="flex items-center gap-2 mb-2">' + priceHtml + '</div>' +
          '<a href="' + getBasePath() + 'products/product.html?sku=' + (product.sku || '') + '" class="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-zinc-900 hover:bg-yellow-300 font-semibold text-sm rounded-md transition-colors">' + _t('cms.viewProduct', 'View Product') + '</a>' +
          '</div>' +
          '</div>';
      }).join('');

      if (html) {
        container.innerHTML = html;
      }
    }).catch(function () {});
  };

  // ============================================================
  // EXPORTS
  // ============================================================
  CMSLoader.parseFrontmatter = parseFrontmatter;
  CMSLoader.parseMarkdown = parseMarkdown;
  CMSLoader.formatDate = formatDate;

  // ============================================================
  // RELOAD & INIT
  // ============================================================
  CMSLoader.reloadContent = function () {
    CMSLoader.loadHomepage();
    CMSLoader.loadPageContent();
    CMSLoader.loadCompanyInfo();
    CMSLoader.loadNavigation();
    CMSLoader.loadFooterFull();
    if (document.getElementById('cms-blog-index')) {
      CMSLoader.loadBlogIndex('#cms-blog-index');
    }
    // Blog post loading is handled by the inline script in post.html
    // to avoid double-loading conflicts
    if (document.getElementById('cms-products-grid')) {
      var productsGrid = document.getElementById('cms-products-grid');
      var category = productsGrid.getAttribute('data-category') || new URLSearchParams(window.location.search).get('category') || '';
      CMSLoader.loadProducts(category, '#cms-products-grid');
    }
    if (document.getElementById('cms-team-grid')) {
      CMSLoader.loadTeamMembers('#cms-team-grid');
    }
    if (document.getElementById('cms-testimonials-grid')) {
      CMSLoader.loadTestimonials('#cms-testimonials-grid');
    }
    if (document.getElementById('cms-certifications-grid')) {
      CMSLoader.loadCertifications('#cms-certifications-grid');
    }
    if (document.getElementById('cms-faq-grid')) {
      CMSLoader.loadFAQ('#cms-faq-grid');
    }
    if (document.getElementById('cms-distributors-grid')) {
      CMSLoader.loadDistributors('#cms-distributors-grid');
    }
    if (document.getElementById('cms-warranty-grid')) {
      CMSLoader.loadWarranty('#cms-warranty-grid');
    }
    if (document.getElementById('cms-safety-grid')) {
      CMSLoader.loadSafety('#cms-safety-grid');
    }
    if (document.getElementById('cms-partners-grid')) {
      CMSLoader.loadPartners('#cms-partners-grid');
    }
    if (document.getElementById('cms-case-studies-grid')) {
      CMSLoader.loadCaseStudies('#cms-case-studies-grid');
    }
    if (document.getElementById('cms-manuals-grid')) {
      CMSLoader.loadManuals('#cms-manuals-grid');
    }
    if (document.getElementById('cms-downloads-grid')) {
      CMSLoader.loadDownloads('#cms-downloads-grid');
    }
    if (document.getElementById('cms-related-products-grid')) {
      var currentSku = new URLSearchParams(window.location.search).get('sku') || '';
      if (currentSku) {
        CMSLoader.loadRelatedProducts(currentSku, '#cms-related-products-grid');
      }
    }
    // Product detail page — load 3D viewer
    if (window.location.pathname.indexOf('/products/product') !== -1) {
      var productSlug = new URLSearchParams(window.location.search).get('sku') ||
                        new URLSearchParams(window.location.search).get('product');
      if (productSlug) {
        CMSLoader.loadPageSettings(productSlug).then(function(data) {
          if (data) CMSLoader.loadProduct3D(data);
        });
      }
    }
  };

  window.CMSLoader = CMSLoader;

  document.addEventListener('languageChanged', function (e) {
    var newLang = e.detail.lang;
    if (newLang !== currentLang) {
      currentLang = newLang;
      if (typeof CMSLoader.reloadContent === 'function') {
        CMSLoader.reloadContent();
      }
    }
  });

  document.addEventListener('i18nReady', function (e) {
    var detectedLang = e.detail.lang;
    if (detectedLang && detectedLang !== currentLang) {
      currentLang = detectedLang;
      if (typeof CMSLoader.reloadContent === 'function') {
        CMSLoader.reloadContent();
      }
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    loadJsYaml().catch(function() {}).then(function() {
    CMSLoader.loadHomepage();
    CMSLoader.loadPageContent();
    CMSLoader.loadCompanyInfo();
    CMSLoader.loadNavigation();
    CMSLoader.loadFooterFull();
    if (document.getElementById('cms-blog-index')) {
      CMSLoader.loadBlogIndex('#cms-blog-index');
    }
    // Blog post loading is handled by the inline script in post.html
    // to avoid double-loading conflicts
    if (document.getElementById('cms-products-grid')) {
      var productsGrid = document.getElementById('cms-products-grid');
      var category = productsGrid.getAttribute('data-category') || new URLSearchParams(window.location.search).get('category') || '';
      CMSLoader.loadProducts(category, '#cms-products-grid');
    }
    if (document.getElementById('cms-team-grid')) {
      CMSLoader.loadTeamMembers('#cms-team-grid');
    }
    if (document.getElementById('cms-testimonials-grid')) {
      CMSLoader.loadTestimonials('#cms-testimonials-grid');
    }
    if (document.getElementById('cms-certifications-grid')) {
      CMSLoader.loadCertifications('#cms-certifications-grid');
    }
    if (document.getElementById('cms-faq-grid')) {
      CMSLoader.loadFAQ('#cms-faq-grid');
    }
    if (document.getElementById('cms-distributors-grid')) {
      CMSLoader.loadDistributors('#cms-distributors-grid');
    }
    if (document.getElementById('cms-warranty-grid')) {
      CMSLoader.loadWarranty('#cms-warranty-grid');
    }
    if (document.getElementById('cms-safety-grid')) {
      CMSLoader.loadSafety('#cms-safety-grid');
    }
    if (document.getElementById('cms-partners-grid')) {
      CMSLoader.loadPartners('#cms-partners-grid');
    }
    if (document.getElementById('cms-case-studies-grid')) {
      CMSLoader.loadCaseStudies('#cms-case-studies-grid');
    }
    if (document.getElementById('cms-manuals-grid')) {
      CMSLoader.loadManuals('#cms-manuals-grid');
    }
    if (document.getElementById('cms-downloads-grid')) {
      CMSLoader.loadDownloads('#cms-downloads-grid');
    }
    if (document.getElementById('cms-related-products-grid')) {
      var currentSku = new URLSearchParams(window.location.search).get('sku') || '';
      if (currentSku) {
        CMSLoader.loadRelatedProducts(currentSku, '#cms-related-products-grid');
      }
    }
    // Product detail page — load 3D viewer
    if (window.location.pathname.indexOf('/products/product') !== -1) {
      var productSlug = new URLSearchParams(window.location.search).get('sku') ||
                        new URLSearchParams(window.location.search).get('product');
      if (productSlug) {
        CMSLoader.loadPageSettings(productSlug).then(function(data) {
          if (data) CMSLoader.loadProduct3D(data);
        });
      }
    }
    });
  });
})();
