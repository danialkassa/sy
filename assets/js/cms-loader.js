(function () {
  var _t = function(key, fallback) {
    if (typeof i18n !== 'undefined' && i18n.t) { var val = i18n.t(key); return val && val !== key ? val : fallback; }
    return fallback;
  };

  var CMSLoader = {};

  function parseFrontmatter(text) {
    var result = { data: {}, body: text };
    var match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!match) return result;
    result.body = text.slice(match[0].length);
    var raw = match[1];
    var data = {};
    var lines = raw.split(/\r?\n/);
    var i = 0;
    while (i < lines.length) {
      var line = lines[i];
      var kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
      if (kvMatch) {
        var key = kvMatch[1];
        var val = kvMatch[2].trim();
        if (val === '' || val === '|' || val === '>') {
          if (val === '|' || val === '>') {
            var multiline = [];
            i++;
            while (i < lines.length && (lines[i].match(/^\s{2,}/) || lines[i] === '')) {
              multiline.push(lines[i].replace(/^\s{2,}/, ''));
              i++;
            }
            data[key] = multiline.join('\n').trim();
            continue;
          }
          if (i + 1 < lines.length && lines[i + 1].match(/^\s*-\s/)) {
            var arr = [];
            i++;
            while (i < lines.length && lines[i].match(/^\s*-\s/)) {
              var itemLine = lines[i].replace(/^\s*-\s*/, '');
              var objMatch = itemLine.match(/^(\w[\w-]*):\s*(.*)/);
              if (objMatch) {
                var obj = {};
                obj[objMatch[1]] = parseValue(objMatch[2].trim());
                i++;
                while (i < lines.length && lines[i].match(/^\s{2,}(\w[\w-]*):\s*(.*)/)) {
                  var nestedMatch = lines[i].match(/^\s{2,}(\w[\w-]*):\s*(.*)/);
                  obj[nestedMatch[1]] = parseValue(nestedMatch[2].trim());
                  i++;
                }
                arr.push(obj);
              } else {
                arr.push(parseValue(itemLine));
                i++;
              }
            }
            data[key] = arr;
            continue;
          }
          data[key] = '';
          i++;
          continue;
        }
        data[key] = parseValue(val);
      }
      i++;
    }
    result.data = data;
    return result;
  }

  function parseValue(val) {
    if (typeof val !== 'string') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (val === 'null') return null;
    if (/^-?\d+$/.test(val)) return parseInt(val, 10);
    if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);
    if (/^["']/.test(val) && /["']$/.test(val)) return val.slice(1, -1);
    if (/^\[.*\]$/.test(val)) {
      var inner = val.slice(1, -1).trim();
      if (inner === '') return [];
      return inner.split(',').map(function (s) { return parseValue(s.trim()); });
    }
    return val;
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

    html = html.replace(/^(\d+)\.\s+(.+)$/gm, '⌴OL⌴$1⌴⌴$2');
    html = html.replace(/^[-*+]\s+(.+)$/gm, '⌴UL⌴$1');

    html = html.replace(/(⌴UL⌴[^\n]*(\n⌴UL⌴[^\n]*)*)/g, function (block) {
      var items = block.split(/\n?⌴UL⌴/).filter(function (s) { return s.trim(); });
      var lis = items.map(function (item) { return '<li class="text-zinc-400 leading-relaxed">' + item.trim() + '</li>'; }).join('');
      return '<ul class="list-disc list-inside space-y-1 my-4">' + lis + '</ul>';
    });

    html = html.replace(/(⌴OL⌴\d+⌴⌴[^\n]*(\n⌴OL⌴\d+⌴⌴[^\n]*)*)/g, function (block) {
      var items = block.split(/\n?⌴OL⌴\d+⌴⌴/).filter(function (s) { return s.trim(); });
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
    return './';
  }

  function fetchText(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
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

  function getLangAwarePath(basePath, lang) {
    if (lang && lang !== 'en') {
      var langPath = basePath.replace(/(\.\w+)$/, '.' + lang + '$1');
      return langPath;
    }
    return basePath;
  }

  function loadJSONWithLangFallback(primaryPath, lang) {
    if (!lang || lang === 'en') {
      return fetch(primaryPath).then(function (r) { return r.json(); });
    }

    var langPath = primaryPath.replace(/(\.\w+)$/, '.' + lang + '$1');

    return fetch(langPath)
      .then(function (r) {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .catch(function () {
        return fetch(primaryPath).then(function (r) { return r.json(); });
      });
  }

  CMSLoader.loadBlogIndex = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();

    var indexPath = getBasePath() + 'content/blog/index.json';

    return loadJSONWithLangFallback(indexPath, currentLang).then(function (index) {
      var posts = index.posts || [];
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
    var slugs = ['angle-grinder-guide', 'distribution-expansion-sea', 'bulk-ordering-benefits', 'ip-ratings-explained', 'cordless-future-lithium-brushless', 'iso-9001-supply-chain'];
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
      if (pageTitle && post.title) pageTitle.textContent = post.title + ' – Ningbo Siyang';
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && post.excerpt) metaDesc.setAttribute('content', post.excerpt);
    }).catch(function () {});
  };

  CMSLoader.loadProducts = function (category, containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();

    var indexPath = getBasePath() + 'content/products/index.json';

    return loadJSONWithLangFallback(indexPath, currentLang).then(function (index) {
      var products = index.products || [];
      if (category) {
        products = products.filter(function (p) {
          return p.category && p.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase().replace(/\s+/g, '-');
        });
      }

      var html = products.map(function (product) {
        var badges = '';
        if (product.compareAtPrice && product.compareAtPrice > product.price) {
          var discount = Math.round((1 - product.price / product.compareAtPrice) * 100);
          badges += '<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-' + discount + '%</span>';
        }
        if (product.isFeatured) {
          badges += '<span class="bg-yellow-400 text-zinc-900 text-xs font-bold px-2 py-1 rounded">' + _t('cms.featured','Featured') + '</span>';
        }
        var badgeContainer = badges ? '<div class="absolute top-3 left-3 flex flex-col gap-1.5">' + badges + '</div>' : '';

        var priceHtml = '<span class="text-lg font-bold text-white">$' + product.price.toFixed(2) + '</span>';
        if (product.compareAtPrice && product.compareAtPrice > product.price) {
          priceHtml += '<span class="text-sm text-zinc-500 line-through ml-2">$' + product.compareAtPrice.toFixed(2) + '</span>';
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
          '<div class="relative aspect-square bg-zinc-900 overflow-hidden shrink-0">' +
          '<img src="' + (product.image || '') + '" alt="' + escapeHtml(product.name || '') + '" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"/>' +
          '<div class="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent opacity-60 group-hover:opacity-35 transition-opacity"></div>' +
          badgeContainer +
          '<div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-900/90 to-transparent opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">' +
          '<button data-quote-add data-quote-sku="' + (product.sku || '') + '" data-quote-name="' + escapeHtml(product.name || '') + '" data-quote-brand="' + escapeHtml(product.brand || '') + '" data-quote-image="' + (product.image || '') + '" class="w-full bg-yellow-400 text-zinc-900 hover:bg-yellow-300 font-semibold text-sm h-11 rounded-md flex items-center justify-center gap-2"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>' + _t('cms.addToQuote','Add to Quote') + '</button>' +
          '</div>' +
          '</div>' +
          '<div class="p-4 flex flex-col flex-1">' +
          '<p class="text-xs text-yellow-400/80 uppercase tracking-wider mb-1 font-semibold">' + escapeHtml(product.brand || '') + '</p>' +
          '<h3 class="font-oswald font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-2 mb-1.5 leading-snug">' + escapeHtml(product.name || '') + '</h3>' +
          '<p class="text-xs text-zinc-500 mb-2.5 line-clamp-2 leading-relaxed">' + escapeHtml(product.tagline || product.description || '') + '</p>' +
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
      }
    }).catch(function () {
      tryIndividualProducts(container, category);
    });
  };

  function tryIndividualProducts(container, category) {
    var basePath = getBasePath() + 'content/products/';
    var knownSlugs = ['drills-drivers', 'saws', 'grinders', 'sanders', 'impact-tools', 'combo-kits'];
    var promises = knownSlugs.map(function (slug) {
      return fetchText(basePath + slug + '.md').then(function (text) {
        var parsed = parseFrontmatter(text);
        parsed.data._slug = slug;
        return parsed.data;
      }).catch(function () { return null; });
    });

    Promise.all(promises).then(function (results) {
      var products = results.filter(Boolean);
      if (category) {
        products = products.filter(function (p) {
          return p.category && p.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase().replace(/\s+/g, '-');
        });
      }

      var html = products.map(function (product) {
        var badges = '';
        if (product.compareAtPrice && product.compareAtPrice > product.price) {
          var discount = Math.round((1 - product.price / product.compareAtPrice) * 100);
          badges += '<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-' + discount + '%</span>';
        }
        if (product.isFeatured) {
          badges += '<span class="bg-yellow-400 text-zinc-900 text-xs font-bold px-2 py-1 rounded">' + _t('cms.featured','Featured') + '</span>';
        }
        var badgeContainer = badges ? '<div class="absolute top-3 left-3 flex flex-col gap-1.5">' + badges + '</div>' : '';

        var priceHtml = '<span class="text-lg font-bold text-white">$' + Number(product.price).toFixed(2) + '</span>';
        if (product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price)) {
          priceHtml += '<span class="text-sm text-zinc-500 line-through ml-2">$' + Number(product.compareAtPrice).toFixed(2) + '</span>';
        }

        var stockHtml = product.stock > 0
          ? '<span class="text-xs text-green-400 font-medium">&#10003; ' + _t('cms.inStock','In Stock') + '</span>'
          : '<span class="text-xs text-red-400 font-medium">' + _t('cms.outOfStock','Out of Stock') + '</span>';

        return '<div data-id="' + (product.sku || '') + '" class="group relative bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/5 flex flex-col">' +
          '<div class="relative aspect-square bg-zinc-900 overflow-hidden shrink-0">' +
          '<img src="' + (product.image || '') + '" alt="' + escapeHtml(product.name || '') + '" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"/>' +
          '<div class="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent opacity-60 group-hover:opacity-35 transition-opacity"></div>' +
          badgeContainer +
          '<div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-900/90 to-transparent opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">' +
          '<button data-quote-add data-quote-sku="' + (product.sku || '') + '" data-quote-name="' + escapeHtml(product.name || '') + '" data-quote-brand="' + escapeHtml(product.brand || '') + '" data-quote-image="' + (product.image || '') + '" class="w-full bg-yellow-400 text-zinc-900 hover:bg-yellow-300 font-semibold text-sm h-11 rounded-md flex items-center justify-center gap-2"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>' + _t('cms.addToQuote','Add to Quote') + '</button>' +
          '</div>' +
          '</div>' +
          '<div class="p-4 flex flex-col flex-1">' +
          '<p class="text-xs text-yellow-400/80 uppercase tracking-wider mb-1 font-semibold">' + escapeHtml(product.brand || '') + '</p>' +
          '<h3 class="font-oswald font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-2 mb-1.5 leading-snug">' + escapeHtml(product.name || '') + '</h3>' +
          '<p class="text-xs text-zinc-500 mb-2.5 line-clamp-2 leading-relaxed">' + escapeHtml(product.tagline || product.description || '') + '</p>' +
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
      }
    }).catch(function () {});
  }

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

  CMSLoader.parseFrontmatter = parseFrontmatter;
  CMSLoader.parseMarkdown = parseMarkdown;
  CMSLoader.formatDate = formatDate;

  CMSLoader.loadHomepage = function () {
    return CMSLoader.loadPageSettings('homepage').then(function (data) {
      if (!data || !Object.keys(data).length) return;

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

      var statMap = [
        { valueId: 'cms-stat1-value', labelId: 'cms-stat1-label', valueKey: 'stat1Value', labelKey: 'stat1Label' },
        { valueId: 'cms-stat2-value', labelId: 'cms-stat2-label', valueKey: 'stat2Value', labelKey: 'stat2Label' },
        { valueId: 'cms-stat3-value', labelId: 'cms-stat3-label', valueKey: 'stat3Value', labelKey: 'stat3Label' }
      ];

      statMap.forEach(function (stat) {
        var valueEl = document.getElementById(stat.valueId);
        var labelEl = document.getElementById(stat.labelId);
        if (data[stat.valueKey] && valueEl) {
          var rawVal = data[stat.valueKey];
          var suffix = rawVal.replace(/[\d.]/g, '');
          var numVal = parseInt(rawVal.replace(/[^\d]/g, ''), 10);
          if (!isNaN(numVal)) {
            valueEl.setAttribute('data-count-up', String(numVal));
            valueEl.setAttribute('data-count-suffix', suffix || '');
          }
          valueEl.textContent = '0';
        }
        if (data[stat.labelKey] && labelEl) {
          labelEl.textContent = data[stat.labelKey];
        }
      });

      if (typeof window.initCountUp === 'function') {
        window.initCountUp();
      }
    });
  };

  CMSLoader.loadCompanyInfo = function () {
    return CMSLoader.loadPageSettings('company').then(function (data) {
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
            } else if (key !== 'wechatQR') {
              el.textContent = data[key];
            }
          });
        }
      });
    });
  };

  CMSLoader.loadFooterSettings = function () {
    return CMSLoader.loadSiteSettings('footer').then(function (data) {
      if (!data || !Object.keys(data).length) return;

      var copyright = document.getElementById('cms-footer-copyright');
      if (data.copyright && copyright) copyright.textContent = data.copyright;

      ['badge1', 'badge2', 'badge3', 'badge4'].forEach(function (key) {
        var el = document.getElementById('cms-footer-' + key);
        if (data[key] && el) el.textContent = data[key];
      });
    });
  };

  CMSLoader.loadTeamMembers = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();

    var indexPath = getBasePath() + 'content/team/index.json';

    return loadJSONWithLangFallback(indexPath, currentLang).then(function (index) {
      var members = index.members || [];
      members.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

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

  CMSLoader.loadTestimonials = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();

    var indexPath = getBasePath() + 'content/testimonials/index.json';

    return loadJSONWithLangFallback(indexPath, currentLang).then(function (index) {
      var testimonials = index.testimonials || [];
      testimonials.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

      var html = testimonials.map(function (testimonial) {
        var name = escapeHtml(testimonial.name || '');
        var company = escapeHtml(testimonial.company || '');
        var quote = escapeHtml(testimonial.quote || '');
        var avatar = testimonial.avatar || '';
        var rating = testimonial.rating || 5;

        var stars = '<div class="flex items-center gap-1 mb-4">';
        for (var s = 0; s < 5; s++) {
          stars += s < rating
            ? '<svg class="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
            : '<svg class="w-4 h-4 text-zinc-600" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        }
        stars += '</div>';

        return '<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-yellow-400/30 transition-colors">' +
          stars +
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

  CMSLoader.loadCertifications = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return Promise.resolve();

    var indexPath = getBasePath() + 'content/certifications/index.json';

    return loadJSONWithLangFallback(indexPath, currentLang).then(function (index) {
      var certs = index.certifications || [];

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

  CMSLoader.reloadContent = function () {
    CMSLoader.loadHomepage();
    CMSLoader.loadCompanyInfo();
    CMSLoader.loadFooterSettings();
    if (document.getElementById('cms-blog-index')) {
      CMSLoader.loadBlogIndex('#cms-blog-index');
    }
    if (document.getElementById('cms-blog-post')) {
      var slug = new URLSearchParams(window.location.search).get('slug');
      if (slug) {
        CMSLoader.loadBlogPost(slug, '#cms-blog-post');
      }
    }
    if (document.getElementById('cms-products-grid')) {
      var category = new URLSearchParams(window.location.search).get('category') || '';
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
    CMSLoader.loadHomepage();
    CMSLoader.loadCompanyInfo();
    CMSLoader.loadFooterSettings();
    if (document.getElementById('cms-blog-index')) {
      CMSLoader.loadBlogIndex('#cms-blog-index');
    }
    if (document.getElementById('cms-blog-post')) {
      var slug = new URLSearchParams(window.location.search).get('slug');
      if (slug) {
        CMSLoader.loadBlogPost(slug, '#cms-blog-post');
      }
    }
    if (document.getElementById('cms-products-grid')) {
      var category = new URLSearchParams(window.location.search).get('category') || '';
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
  });
})();
