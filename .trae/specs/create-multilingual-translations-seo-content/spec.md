# Multilingual Translations, SEO & Content Creation Spec

## Why
The Ningbo Siyang B2B Power Tools Platform currently only supports English. To serve international distributors and wholesalers in the Middle East, Europe, Africa, South America, and Southeast Asia, the platform needs full multilingual support with professional B2B translations, international SEO configuration, and localized content.

## What Changes
- **5 translation JSON files** created for Simplified Chinese, Arabic, French, Russian, and Spanish
- **15 blog post translations** created (3 posts × 5 languages)
- **5 blog index JSON files** created for language-specific blog listings
- **5 product index JSON files** created for language-specific product listings
- **Testimonials and case studies data files** created
- **22 HTML files** updated with hreflang tags and translated Open Graph meta tags in `<head>` sections only
- **sitemap.xml** updated with multi-language URL entries
- **No changes to body content** of HTML files — only `<head>` section modifications

## Impact
- Affected specs: Internationalization (i18n), International SEO, Multilingual Content
- Affected code: 
  - New files: `assets/translations/{zh,ar,fr,ru,es}.json`
  - New files: `content/blog/*.{zh,ar,fr,ru,es}.md`
  - New files: `content/blog/index.{zh,ar,fr,ru,es}.json`
  - New files: `content/products/index.{zh,ar,fr,ru,es}.json`
  - New files: `content/testimonials/index.json`
  - New files: `content/case-studies/index.json`
  - Modified files: 22 HTML files (`<head>` section only)
  - Modified files: `sitemap.xml`

## ADDED Requirements

### Requirement: Translation File Structure
The system SHALL provide translation files in JSON format at `/assets/translations/{lang}.json` for each supported language (zh, ar, fr, ru, es), maintaining the exact same nested key structure as the English translation file.

#### Scenario: Translation file loaded
- **WHEN** a user visits the site with `?lang=zh` parameter
- **THEN** the i18n engine loads `/assets/translations/zh.json` and replaces all `data-i18n` attribute values with Chinese translations

### Requirement: Blog Post Translations
The system SHALL provide language-specific blog post markdown files with translated frontmatter (title, excerpt, category) and body content, with `lang` field added to frontmatter.

#### Scenario: Chinese blog post accessed
- **WHEN** a user navigates to a blog post with `?lang=zh`
- **THEN** the Chinese version of the blog post is displayed with properly translated content

### Requirement: Product Index Translations
The system SHALL provide language-specific product index JSON files with translated product names, category labels, and descriptions while keeping technical fields (sku, brand, image, moq, leadTime) unchanged.

#### Scenario: Product catalog viewed in Russian
- **WHEN** a user views the product catalog with `?lang=ru`
- **THEN** all 48 products display with Russian-translated names and descriptions

### Requirement: International SEO
The system SHALL include hreflang tags and Open Graph locale meta tags in the `<head>` section of every HTML page to enable search engines to serve the correct language version.

#### Scenario: Search engine indexes site
- **WHEN** a search engine crawler visits `/products/drills-drivers.html`
- **THEN** it finds hreflang tags for all 6 languages (en, zh, ar, fr, ru, es) plus x-default

### Requirement: Multilingual Sitemap
The system SHALL provide a sitemap.xml with language-specific URL entries including hreflang alternate links for each page.

#### Scenario: Sitemap submitted to Google Search Console
- **WHEN** Google crawls `/sitemap.xml`
- **THEN** it finds all 22 pages with 6 language variants each (132 URL entries total)

### Requirement: Testimonials Data
The system SHALL provide a testimonials JSON file with 8 B2B testimonials from geographically diverse distributors (UAE, Germany, Brazil, Nigeria, Australia, Russia, Mexico, Indonesia), each including specific product mentions and business metrics.

### Requirement: Case Studies Data
The system SHALL provide a case studies JSON file with 3 detailed B2B case studies showing OEM/ODM success stories with measurable results (units sold, defect rates, timeframes, margin improvements).

## MODIFIED Requirements

### Requirement: Existing HTML Files
All 22 existing HTML files SHALL be modified to add hreflang tags and translated Open Graph meta tags in the `<head>` section only. No body content changes are permitted.

#### Scenario: HTML head section updated
- **WHEN** hreflang tags are added to `index.html`
- **THEN** 7 `<link rel="alternate" hreflang="...">` tags are added after the canonical link

### Requirement: Sitemap XML
The existing sitemap.xml SHALL be updated to include language-specific URLs with hreflang alternate links using the `xhtml:` namespace prefix.

## REMOVED Requirements
None — all existing functionality remains intact.
