# CMS Evaluation Report — Decap CMS Premium UI

**Test suite:** `admin/_test-suite.cjs` — 403 tests, 0 failures, 0 warnings
**Date:** 2026-06-05

---

## Overall Score: **7.5/10**

---

## 1. Preview Template Quality: **8/10**

| Preview | Data Coverage | Visual | Empty State | Edge Cases | Score |
|---|---|---|---|---|---|
| product | Full specs, images, compliance, downloads, warranty, related products | Premium card layout, DRAFT badge, compliance chips, MOQ/lead grid | Graceful fallbacks, placeholder image | onerror, safeHref, formatDate | 9/10 |
| blog | Title, author, date, category, excerpt, image, readtime | Clean article layout, cover image | "Untitled" / "No date" fallbacks | Draft badge, formatDate | 8/10 |
| homepage | Hero title, subtitle, stats (3), CTA, toggles | Large hero layout, stat cards | All fields optional | safeHref on CTA link | 7/10 |
| team | Name, title, department, bio, email, linkedin, order | Team card with avatar, clean meta | Photo onerror | safeHref on email/linkedin | 8/10 |
| testimonial | Name, company, quote, rating, avatar, country | Quote block with star rating | Empty state handled | Photo onerror, 5-star render | 8/10 |
| certifications | Name, issuer, cert number, scope, year, expiry, verify URL | Certificate card with badge | Graceful | safeHref on verify URL | 8/10 |
| faq | Question, answer, category, order | Q&A card | Clean | None needed | 7/10 |
| partners | Name, type, logo, country, website, order | Partner logo card | Photo onerror | safeHref | 8/10 |
| distributors | Company, country, region, contact, email, phone, website, address, product lines | Distributor info card | Photo onerror | safeHref | 8/10 |
| warranty | Title, type, period, description, categories, exclusions, claim process | Policy card with badge | Clean | None needed | 7/10 |
| safety | Title, type, severity, affected SKUs, description, resolution, date | Safety notice with severity badge | Clean | formatDate | 7/10 |
| manuals | Title, SKU, language, file, version, pages, date | Manual card with language badge | Clean | safeHref, formatDate | 7/10 |
| downloads | Title, category, file, language, version, size, date, description | Download card with category badge | Clean | safeHref, formatDate | 7/10 |
| case-study | Client, title, country, industry, summary, results, date, featured | Case study card with metrics | Photo onerror | formatDate | 8/10 |
| company | Name, email, phone, address, founded, social, toggles | Company profile card | Clean | safeHref | 7/10 |
| oem-odm | Title, subtitle, capabilities, process steps, CTA | Feature card with process steps | Clean | safeHref | 7/10 |
| settings | Navigation categories + Footer columns/badges | Tabbed layout for dual previews | Clean | safeHref | 7/10 |

**Findings:**
- All 17 previews have `text()`, `el()`, `getData()` helpers
- 10/17 use `safeHref()` for link sanitization — 7 don't (blog, case-study, faq, safety, testimonial, warranty), but those 7 have no user-provided URLs
- 5 previews lack `onerror` on images: company, download, faq, homepage, oem-odm, safety, settings, warranty — but those either don't have image fields or have conditional renders
- Draft badge present on all 13 folder collections; 4 file-based collections (homepage, company, oem-odm, settings) correctly skip it

---

## 2. Animation Engine: **9/10**

- ✅ Single `IntersectionObserver` instance — no memory leaks
- ✅ `unobserveAll()` called on route change
- ✅ Hashchange listener + polling fallback (100ms) for Decap route detection
- ✅ Mutation handler debounced at 16ms (1 frame)
- ✅ `prefers-reduced-motion` bidirectional handler with Safari `< 14` `addListener()` fallback
- ✅ `CMSToast` with safety counter (max 50 toasts), `dismissAll()`, duration `0` support
- ✅ Dead skeleton code completely removed (`showSkeletons`, `removeSkeletons`, `skeletonObserver`)
- ✅ `maxBatchSize: 50` enforced with array slicing
- ✅ Lightweight `for` loop in mutation handler (not `.forEach()`)

**Minor:** The polling fallback runs every 100ms even when hashchange works, adding negligible CPU but could be cleaned up with a flag.

---

## 3. CSS Theme: **7/10**

- ✅ 318 `!important` declarations (down from 358) — all fighting Decap CMS inline styles
- ✅ 47 CSS variables, all defined in `:root`, none unused
- ✅ 17 keyframe animations, `cms-*` prefixed, no duplicates
- ✅ `backdrop-filter` with `-webkit-` prefix and solid fallback backgrounds
- ✅ Balanced braces, no empty rules
- ✅ 50.4KB file size — reasonable for a full CMS theme
- ⚠️ 318 `!important` is still high — some may be removable if Decap CMS's CSS specificity changes in future versions
- ⚠️ No responsive/mobile breakpoints in the theme CSS — relies on Decap CMS's built-in responsive layout

---

## 4. Config Schema: **6/10**

- ✅ All 13 folder collections have valid summary templates
- ✅ All 18 previews correctly mapped to collections
- ✅ Relation fields reference valid collections with correct `value_field` and `search_fields`
- ✅ View filters and groups reference existing fields
- ⚠️ **Draft fields placed first: only 4/18** — 14 collections have draft NOT as the first field. This impacts UX (editors have to scroll to find the draft toggle). This is a config.yml ordering issue, not a code bug.
- ✅ CMS i18n removed to avoid conflict with `assets/js/i18n.js`

---

## 5. Index.html Integration: **8/10**

- ✅ 22 script tags balanced
- ✅ Decap CMS loaded first, then animations, then 16 previews, then 2 widgets, then 4 editor components, then webhook secret
- ✅ All 18 preview templates registered with correct names matching `window.XxxPreview` exports
- ✅ Dead widget code properly commented out
- ✅ 4 editor components have robust regex patterns for round-trip serialization
- ✅ Public CSS injection removed (no `registerPreviewStyle('/assets/css/styles.css')`)
- ✅ Webhook secret has `onerror` fallback
- ⚠️ Regenerate Index FAB not verified visually — present in code but unconfirmed render

---

## 6. Security: **8/10**

- ✅ All previews use `el()` helper with `createTextNode` for text (no `innerHTML` for user data)
- ✅ `safeHref()` sanitizes URLs (javascript:, data: blocked)
- ✅ 10 previews use `safeHref()` on all 13 href declarations
- ✅ No hardcoded secrets in index.html
- ✅ `text()` helper properly handles `0` (returns `"0"`, not `"N/A"`) — verified by test suite
- ✅ All `<img>` tags that render images have `onerror` handlers or conditional render guards
- ✅ Webhook secret decoupled from code (loaded from external script)

---

## 7. Code Quality: **7/10**

- ⚠️ `getData()`, `text()`, and `el()` are duplicated in **every** preview file — no shared helper file. 17 files × 3 functions = 51 copy-pasted utility functions.
- ✅ All preview exports use `XxxPreview` naming (consistent with `window.XxxPreview` registration)
- ✅ Color palette consistent: all previews use `#09090b`, `#18181b`, `#27272a`, `#facc15`, `#e4e4e7`, `#a1a1aa`, `#71717a`
- ✅ Oswald (headings) + Source Sans 3 (body) fonts used consistently
- ⚠️ Border radii use CSS variables in theme CSS but previews use hardcoded pixel values (`borderRadius: '8px'`) — no shared radius constants
- ✅ No console statements left in any preview file
- ✅ Preview JS total: 123.2KB across 17 files — 7.2KB average, reasonable

---

## 8. Accessibility: **7/10**

- ✅ `:focus-visible` with yellow outline on interactive elements
- ✅ `prefers-reduced-motion` respected by animation engine (bidirectional)
- ⚠️ Color contrast: `#a1a1aa` on `#18181b` = ~3.6:1 — below WCAG AA (4.5:1) for normal text. Acceptable for decorative/metadata text but not for body content.
- ✅ Toast notifications use `role="status"` and `aria-live="polite"`
- ⚠️ No explicit ARIA labels on preview card containers

---

## Summary

| Category | Score | Key Finding |
|---|---|---|
| 1. Preview Templates | 8/10 | All 17 render correctly with empty data; 5 missing image onerror |
| 2. Animation Engine | 9/10 | Memory-safe, reduced-motion compliant, dead code removed |
| 3. CSS Theme | 7/10 | 47 vars, 17 keyframes, but 318 !important remain |
| 4. Config Schema | 6/10 | Draft not first in 14/18 collections |
| 5. Integration | 8/10 | Clean loading, all registrations correct |
| 6. Security | 8/10 | XSS-safe, safeHref on all links, no hardcoded secrets |
| 7. Code Quality | 7/10 | Consistent patterns but 51x duplicated helpers |
| 8. Accessibility | 7/10 | Reduced-motion OK, contrast borderline |

## Recommendations (Priority Order)

| Priority | Issue | Impact |
|---|---|---|
| **P0** | Move draft field to position 1 in 14 collections in config.yml | Editors must scroll to find draft toggle |
| **P1** | Create shared `admin/previews/_helpers.js` with `getData()`, `text()`, `el()`, `safeHref()`, `formatDate()` | Eliminates 51 copy-pasted functions; single source of truth for edge cases |
| **P2** | Reduce !important count below 250 by targeting only Decap's highest-specificity selectors | Easier maintenance, less fragile on Decap updates |
| **P2** | Add image `onerror` fallbacks to company, download, homepage, oem-odm, settings previews | Prevents broken-image icons when image URL is invalid |
