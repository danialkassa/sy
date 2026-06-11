# Tasks

## Phase 1: Translation Files (5 languages)
- [x] Task 1.1: Create `assets/translations/zh.json` (Simplified Chinese) — 235+ keys with professional B2B manufacturing terminology
- [x] Task 1.2: Create `assets/translations/ar.json` (Modern Standard Arabic) — 235+ keys with Western Arabic numerals (0-9)
- [x] Task 1.3: Create `assets/translations/fr.json` (International French) — 235+ keys with formal "vous"
- [x] Task 1.4: Create `assets/translations/ru.json` (Standard Russian) — 235+ keys with formal "Вы"
- [x] Task 1.5: Create `assets/translations/es.json` (International Spanish) — 235+ keys with formal "usted"

## Phase 2: Blog Post Translations
- [x] Task 2.1: Translate 3 blog posts into 5 languages (15 files total)
  - `content/blog/b2b-power-tools-procurement.{zh,ar,fr,ru,es}.md`
  - `content/blog/choosing-the-right-power-drill.{zh,ar,fr,ru,es}.md`
  - `content/blog/safety-standards.{zh,ar,fr,ru,es}.md`
- [x] Task 2.2: Create language-specific blog index JSON files (5 files)
  - `content/blog/index.zh.json`, `index.ar.json`, `index.fr.json`, `index.ru.json`, `index.es.json`

## Phase 3: Product Content Translations
- [x] Task 3.1: Create language-specific product index JSON files (5 files)
  - `content/products/index.zh.json`, `index.ar.json`, `index.fr.json`, `index.ru.json`, `index.es.json`
  - All 49 products translated (names, taglines, categories)

## Phase 4: Testimonials & Case Studies
- [x] Task 4.1: Create `content/testimonials/index.json` with 8 B2B testimonials from UAE, Germany, Brazil, Nigeria, Australia, Russia, Mexico, Indonesia
- [x] Task 4.2: Create `content/case-studies/index.json` with 3 detailed case studies (Gulf Industrial Supplies, Euro Werkzeuge GmbH, StroyInvest LLC)

## Phase 5: International SEO
- [x] Task 5.1: Add hreflang tags to all 22 HTML files `<head>` sections
  - Homepage: `/index.html`
  - Root pages: `/contact.html`, `/terms.html`, `/privacy.html`
  - Product pages: `/products/index.html`, `/products/drills-drivers.html`, `/products/saws.html`, `/products/grinders.html`, `/products/sanders.html`, `/products/impact-tools.html`, `/products/combo-kits.html`, `/products/product.html`
  - Blog pages: `/blogs/index.html`, `/blogs/post.html`
  - About pages: `/about/index.html`, `/about/company.html`, `/about/oem-odm.html`, `/about/certifications.html`, `/about/global.html`, `/about/team.html`, `/about/payment-terms.html`, `/about/brochure.html`
- [x] Task 5.2: Add translated Open Graph locale and title/description meta tags to all 22 HTML files
- [x] Task 5.3: Update `sitemap.xml` with multi-language URL entries (19 pages × 6 language variants = 133 hreflang entries)

## Phase 6: i18n CMS Configuration
- [x] Task 6.1: Add `i18n: true` or `i18n: false` markers to every field in `admin/config.yml` collections

---

# Task Dependencies
- Task 1.x (translation files) must be completed before Task 5.2 (OG tag translations) can begin
- Task 2.x and 3.x (blog/product translations) depend on Task 1.x key structure
- Task 5.1, 5.2, 5.3 (SEO) can proceed in parallel with Phase 2, 3, 4
- Task 6.1 (CMS config) is independent and can be done at any time
- Phase 1 → Phase 2 → Phase 3 is sequential (each phase depends on previous translation keys)
- Phase 4 is independent (creative content, no source dependency)
