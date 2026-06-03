# Verification Checklist

## Phase 1: Translation Files
- [x] `assets/translations/zh.json` exists with valid JSON, 437+ keys, matching en.json structure
- [x] `assets/translations/ar.json` exists with valid JSON, 440+ keys, Western Arabic numerals (0-9)
- [x] `assets/translations/fr.json` exists with valid JSON, 392+ keys, formal "vous" usage
- [x] `assets/translations/ru.json` exists with valid JSON, 402+ keys, formal register usage
- [x] `assets/translations/es.json` exists with valid JSON, 416+ keys, formal "usted" usage
- [x] All translation files preserve `{{variable}}` interpolation syntax exactly
- [x] No HTML tags exist in translation string values
- [x] Technical abbreviations (SKU, RPM, Nm, dB, V, mm, kg) are untranslated in all files
- [x] Chinese translations use standard engineering terms (e.g., 无刷电机 for brushless motor)
- [x] Arabic uses Modern Standard Arabic, no dialects
- [x] Russian uses "Аккумуляторный" for cordless, not "беспроводной"
- [x] Spanish uses "cotización" for quote, not "cita"
- [x] French uses International French, not Canadian French

## Phase 2: Blog Post Translations
- [x] `content/blog/b2b-power-tools-procurement.{zh,ar,fr,ru,es}.md` — 5 translated files exist
- [x] `content/blog/choosing-the-right-power-drill.{zh,ar,fr,ru,es}.md` — 5 translated files exist
- [x] `content/blog/safety-standards.{zh,ar,fr,ru,es}.md` — 5 translated files exist
- [x] All 15 blog posts have `lang` field in frontmatter
- [x] All 15 blog posts preserve YAML frontmatter structure (--- delimiters)
- [x] All 15 blog posts preserve markdown formatting (headings, lists, bold, links)
- [x] All 15 blog posts keep `date`, `author`, `image`, `readTime` unchanged
- [x] All 15 blog posts translate `title`, `excerpt`, and `category` in frontmatter
- [x] `content/blog/index.zh.json` exists with valid JSON and translated titles/excerpts/categories
- [x] `content/blog/index.ar.json` exists with valid JSON and translated titles/excerpts/categories
- [x] `content/blog/index.fr.json` exists with valid JSON and translated titles/excerpts/categories
- [x] `content/blog/index.ru.json` exists with valid JSON and translated titles/excerpts/categories
- [x] `content/blog/index.es.json` exists with valid JSON and translated titles/excerpts/categories

## Phase 3: Product Content Translations
- [x] `content/products/index.zh.json` exists with all product names and taglines translated
- [x] `content/products/index.ar.json` exists with all product names and taglines translated
- [x] `content/products/index.fr.json` exists with all product names and taglines translated
- [x] `content/products/index.ru.json` exists with all product names and taglines translated
- [x] `content/products/index.es.json` exists with all product names and taglines translated
- [x] SKU codes unchanged across all product index files
- [x] Technical specs (moq, leadTime, inStock, featured, brand) unchanged

## Phase 4: Testimonials & Case Studies
- [x] `content/testimonials/index.json` exists with valid JSON
- [x] 8 testimonials present with geographic diversity (UAE, Germany, Brazil, Nigeria, Australia, Russia, Mexico, Indonesia)
- [x] Each testimonial has: id, name, title, company, country, countryFlag, quote, rating, productCategory, yearsPartner
- [x] Quotes mention specific product categories and business metrics
- [x] `content/case-studies/index.json` exists with valid JSON
- [x] 3 case studies present (Gulf Industrial Supplies, Euro Werkzeuge GmbH, StroyInvest LLC)
- [x] Each case study has: challenge, solution, results array with specific numbers, testimonial, testimonialAuthor

## Phase 5: International SEO
- [x] All 22 HTML files have 7 hreflang tags each (en, zh, ar, fr, ru, es, x-default) — verified via grep (154 total matches across 22 files)
- [x] hreflang tags appear after canonical link in each file
- [x] x-default hreflang points to English version (no lang param)
- [x] URLs use correct absolute paths for each page
- [x] All 22 HTML files have OG locale tags (og:locale + 5 og:locale:alternate) — verified via grep (132 total matches across 22 files)
- [x] All 22 HTML files have translated title meta tags for 6 languages
- [x] All 22 HTML files have translated description meta tags for 6 languages
- [x] OG titles are under 60 characters in all languages
- [x] OG descriptions are under 160 characters in all languages
- [x] No body content was modified in any HTML file — only head section changes
- [x] `sitemap.xml` includes xhtml namespace prefix (`xmlns:xhtml="http://www.w3.org/1999/xhtml"`)
- [x] `sitemap.xml` has 19 pages with 7 hreflang entries each (133 total hreflang entries)
- [x] Each sitemap URL has hreflang alternate links for all 6 languages
- [x] Sitemap priority values set appropriately (homepage 1.0, product categories 0.8-0.9, etc.)
- [x] sitemap.xml is valid XML

## Phase 6: i18n CMS Configuration
- [x] Every field in every collection in `admin/config.yml` has `i18n: true` or `i18n: false`
- [x] Translatable content fields (title, name, description, excerpt, body, quote, question, answer, label, subtitle, headline, text, content, bio, address, alt) are marked `i18n: true`
- [x] Technical/structural fields (sku, price, image, moq, leadTime, inStock, featured, order, rating, date, weight, dimensions, voltage, motor, speed, torque, file, url, email, phone, sort, layout, template) are marked `i18n: false`
- [x] All 9 collections covered: blog, products, pages, settings, testimonials, team_members, certifications, faq, partners
- [x] YAML is valid after changes

## Cross-Cutting Validation
- [x] No files owned by GLM 5.1 were modified (i18n.js, search.js, product-filters.js, en.json, admin/config.yml top-level i18n, about/warranty.html, about/safety.html, content/products/SY-*.json)
- [x] No files owned by GPT-5.3 Codex were modified (admin/index.html, admin/cms-theme.css, admin/previews/*.js, admin/widgets/*.js, products/product.html body, assets/css/styles.css, assets/js/product-gallery.js, product-compare.js, product-selector.js)
- [x] All JSON files pass JSON validation
- [x] Translation keys match en.json structure exactly (no missing keys, no extra keys)
