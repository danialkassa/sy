# Ningbo Siyang Website & Decap CMS — Production Readiness Plan

## Summary

This plan fixes all issues identified in the codebase audit to bring the Ningbo Siyang B2B power tools website and Decap CMS to production readiness. The work is split into **two tracks** (CMS and Website) across **5 phases**, with each phase building on the previous one. Hosting is on DigitalOcean (165.22.250.66) with Gitea as the Git backend for Decap CMS.

**Current state:** The architecture is solid — 15 CMS collections, 49 products, 6-language i18n, Nginx + SSL + webhook auto-deploy — but the site has critical gaps: wrong domain in SEO files, missing images/PDFs, placeholder links, no 404 page, console.logs in production JS, and empty alt attributes.

---

## Phase 1: CMS Foundation (Decap CMS)

**Goal:** Fix all CMS configuration issues so content editors can work reliably.

### 1.1 Fix `admin/config.yml` — Domain & Copyright
- **File:** `admin/config.yml`
- **What:** Update `site_domain` and `display_url` from `siyang.tools` to the correct production domain. Update footer copyright default from `© 2025` to `© 2026`.
- **Why:** CMS preview links and display URL must match the live domain. Outdated copyright looks unprofessional.
- **How:** Edit lines 8, 22, 23 to use correct domain. Edit line 1368 to update copyright year.

### 1.2 Fix `admin/config.yml` — Product image paths
- **File:** `admin/config.yml`
- **What:** Product `image` and `images` fields currently point to `media_folder: "/images/products"` but product markdown files reference `../images/istock/10001.jpg`. Align the config so the media_folder matches where images actually live, or update product content to use the correct path.
- **Why:** Editors uploading images through CMS will save to `/images/products/` but existing products reference `/images/istock/` — this creates confusion.
- **How:** Add a comment in config.yml noting the istock path convention, and update the `media_folder` for product images to `/images` (broader scope) so both paths work. Alternatively, keep `/images/products` and plan to migrate istock images there later.

### 1.3 Fix `admin/index.html` — Missing preview registrations
- **File:** `admin/index.html`
- **What:** Lines 46-47 register `NavigationPreview` and `FooterPreview` but these preview JS files don't exist in `admin/previews/`. Either create them or remove the registrations.
- **Why:** Missing preview files cause console errors in the CMS admin panel.
- **How:** Create minimal `admin/previews/navigation-preview.js` and `admin/previews/footer-preview.js` that export simple HTML previews.

### 1.4 Fix `admin/webhook-secret.js` — Security
- **File:** `admin/webhook-secret.js`
- **What:** This file contains `window.__WEBHOOK_SECRET` which is client-visible. The secret is exposed to anyone who views the admin page source.
- **Why:** Security risk — anyone can trigger index regeneration.
- **How:** This is acceptable for the admin panel (which is already behind Gitea OAuth), but add a comment noting this is intentional. The Nginx config already restricts `/admin/` access. No code change needed, just document the decision.

### 1.5 Verify CMS collections completeness
- **What:** All 15 collections are defined with proper fields. No changes needed.
- **Why:** Confirm no collections are missing or incomplete.
- **How:** Read-through verification only. All collections (products, blog, testimonials, team_members, certifications, faq, partners, distributors, warranty, safety, manuals, downloads, case_studies, pages, settings) are complete.

---

## Phase 2: Website Critical Fixes

**Goal:** Fix all blocking issues that prevent the website from being production-ready.

### 2.1 Fix `robots.txt` — Wrong domain
- **File:** `robots.txt`
- **What:** Sitemap URL references `https://ningbosiyang.com/sitemap.xml` but the site is at `https://siyang.tools`.
- **Why:** Search engines will try to crawl the wrong domain.
- **How:** Change line 8 from `https://ningbosiyang.com/sitemap.xml` to `https://siyang.tools/sitemap.xml`.

### 2.2 Fix `sitemap.xml` — Wrong domain + incomplete
- **File:** `sitemap.xml`
- **What:** All URLs use `ningbosiyang.com` instead of `siyang.tools`. Only 4 URLs are listed (homepage, contact, privacy, terms) — missing all product, about, and blog pages.
- **Why:** SEO critical — search engines can't discover most of the site.
- **How:**
  1. Replace all `ningbosiyang.com` with `siyang.tools`
  2. Add all product category pages: `/products/`, `/products/drills-drivers.html`, `/products/saws.html`, `/products/grinders.html`, `/products/sanders.html`, `/products/impact-tools.html`, `/products/combo-kits.html`
  3. Add all about pages: `/about/`, `/about/company.html`, `/about/team.html`, `/about/certifications.html`, `/about/faq.html`, `/about/distributors.html`, `/about/oem-odm.html`, `/about/warranty.html`, `/about/safety.html`, `/about/downloads.html`, `/about/manuals.html`, `/about/brochure.html`, `/about/global.html`, `/about/payment-terms.html`
  4. Add blog pages: `/blogs/`, `/blogs/b2b-power-tools-procurement.html`, `/blogs/choosing-the-right-power-drill.html`, `/blogs/safety-standards.html`
  5. Add contact page: `/contact.html`
  6. Include hreflang alternates for all pages

### 2.3 Fix placeholder `href="#"` links
- **Files:** `index.html`, `products/product.html`, `assets/js/cms-loader.js`, `assets/js/search.js`, `assets/js/product-selector.js`, `assets/js/quote-cart.js`
- **What:** Multiple links use `href="#"` or empty `href` for: WeChat QR tooltips, breadcrumbs, social media links, AR viewer, download buttons, category navigation.
- **Why:** Broken links hurt UX and SEO. Users clicking them get no response or jump to page top.
- **How:**
  - WeChat QR: Change `href="#"` to `href="javascript:void(0)"` with `role="button"` (these are tooltip triggers, not navigation)
  - Breadcrumbs: Set proper `href` values based on current page context
  - Social media links: Either link to real profiles or hide the icons if no profile exists yet
  - AR viewer: Show a "Coming Soon" badge or hide the button if no AR model URL exists
  - Download buttons: Disable with visual styling if no PDF exists, or hide entirely
  - Category navigation: Use proper category URLs like `/products/drills-drivers.html`

### 2.4 Fix missing `alt` attributes on images
- **Files:** All HTML files in root, `/products/`, `/about/`, `/blogs/`, and JS files that dynamically create images
- **What:** ~20+ images have empty or missing `alt` attributes, especially QR code images, SVG icons, and dynamically generated product images.
- **Why:** Accessibility fail (WCAG 2.1 AA) and SEO penalty.
- **How:**
  - QR code images: `alt="WeChat QR Code — scan to add Ningbo Siyang on WeChat"`
  - SVG decorative icons: `alt=""` with `role="presentation"` (decorative, not meaningful)
  - Product images (dynamic): Use product name as alt text, e.g., `alt="${product.name}"`
  - Quote cart product images: `alt="${product.name} thumbnail"`

### 2.5 Create `404.html` error page
- **File:** `404.html` (new file)
- **What:** Create a custom 404 page matching the site's design with: logo, "Page Not Found" message, search bar, link to homepage, link to products, link to contact.
- **Why:** Default Nginx 404 is ugly and doesn't match site design. Users need navigation help.
- **How:** Create a minimal HTML page using the same CSS framework (Tailwind classes), dark theme, with the site header/footer pattern. Add `try_files $uri $uri/ $uri.html /404.html =404;` to Nginx config.

### 2.6 Remove `console.log` statements from production JS
- **Files:** `assets/js/main.js`, `assets/js/premium-motion.js`, `assets/js/gsap-animations.js`, `assets/js/cms-loader.js`
- **What:** Remove or guard all `console.log` statements in client-facing JS files.
- **Why:** Console logs in production expose internal logic and can slow down the page.
- **How:** Either remove them entirely, or wrap in `if (window.DEBUG)` guard. Keep `console.error` for actual error handling.

---

## Phase 3: Website Content & Assets

**Goal:** Populate all missing content so the site looks complete and professional.

### 3.1 Upload product images
- **Directory:** `images/products/`
- **What:** Currently only `.gitkeep`. Need actual product photos for all 49 products.
- **Why:** Product pages show broken images without these.
- **How:** This is a manual task — the business needs to provide product photos. In the meantime, the existing `images/istock/` images serve as placeholders (products already reference them in markdown). Ensure the CMS loader handles both paths.

### 3.2 Upload WeChat QR code image
- **File:** `assets/images/wechat-qr.png` (referenced in site-config.js)
- **What:** The WeChat QR code image is referenced but doesn't exist in the project.
- **Why:** WeChat contact button shows a broken image.
- **How:** Add the actual QR code image to `assets/images/wechat-qr.png`. This is a manual task requiring the business to provide the image.

### 3.3 Upload team, testimonial, partner, distributor, blog images
- **Directories:** `images/team/`, `images/testimonials/`, `images/partners/`, `images/distributors/`, `images/blog/`, `images/case-studies/`, `images/certificates/`
- **What:** All directories contain only `.gitkeep` files.
- **Why:** About pages, testimonial sections, and blog posts show broken or missing images.
- **How:** Manual task — business provides photos. CMS can also be used to upload them once the admin panel is live.

### 3.4 Upload PDF files (spec sheets, manuals, catalogs)
- **Directory:** `assets/downloads/`
- **What:** Currently only `.gitkeep`. Product markdown references PDFs like `/downloads/spec-sheets/SY-DD-20V-BL.pdf` which don't exist.
- **Why:** Download buttons on product pages lead to 404 errors.
- **How:** Manual task — business provides PDFs. In the meantime, hide or disable download buttons when no PDF exists (see Phase 2.3).

### 3.5 Fix duplicate/invalid product entry
- **File:** `content/products/sy-dd2001.md`
- **What:** This product doesn't follow the `SY-TT-VV-XXX` SKU naming convention used by all other 48 products.
- **Why:** Inconsistent naming breaks the product URL pattern and search.
- **How:** Either rename to follow the convention (e.g., `SY-DD-CRD-2001.md`) or delete if it's a test entry. Update any references.

### 3.6 Consolidate site-config.js with CMS settings
- **Files:** `assets/js/site-config.js`, `content/settings/company.md`
- **What:** Phone, email, address, etc. are hardcoded in `site-config.js` AND also stored in CMS `company.md`. These can diverge.
- **Why:** Dual source of truth leads to inconsistencies.
- **How:** Make `site-config.js` load values from the CMS company settings at runtime. The CMS loader already fetches `content/settings/company.md` — extend it to populate `SITE_CONFIG` fields from the CMS data, with the hardcoded values as fallback defaults.

---

## Phase 4: Infrastructure & Deployment

**Goal:** Harden the deployment pipeline for production reliability.

### 4.1 Update Nginx config — Add 404 page, CSP headers, security
- **File:** `scripts/nginx-siyang.conf`
- **What:**
  1. Add `error_page 404 /404.html;` directive
  2. Add Content-Security-Policy header
  3. Add Permissions-Policy header
  4. Add Strict-Transport-Security header (HSTS)
  5. Ensure the `/admin/` location serves config.yml with correct MIME type (already done)
- **Why:** Security best practices and proper error handling.
- **How:**
  ```
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://siyang.tools;" always;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
  error_page 404 /404.html;
  ```

### 4.2 Update deploy script — Add 404.html handling
- **File:** `scripts/deploy.sh`
- **What:** Ensure the deploy script copies the 404.html and verifies it's accessible.
- **Why:** The 404 page needs to be deployed along with the rest of the site.
- **How:** No changes needed — the rsync already uploads all files including 404.html. Just verify Nginx config serves it.

### 4.3 Update webhook service — Production secret
- **File:** `scripts/siyang-webhook.service`
- **What:** The default `WEBHOOK_SECRET=change-me-in-production` is a placeholder. The deploy script generates a real secret and writes it, but the service file template should document this.
- **Why:** Security — the default secret must never be used in production.
- **How:** Add a comment in the service file noting that deploy.sh replaces this value. No code change needed — the deploy script already handles this correctly.

### 4.4 Update `setup-gitea-roles.sh` — Fix OAuth redirect URI
- **File:** `scripts/setup-gitea-roles.sh`
- **What:** Line 148 has `redirect_uri: "http://165.22.250.66/admin/"` but the site uses HTTPS at `https://siyang.tools/admin/`.
- **Why:** OAuth callback will fail if the redirect URI doesn't match the CMS admin URL.
- **How:** Change `http://165.22.250.66/admin/` to `https://siyang.tools/admin/`.

### 4.5 Add Gzip compression to Nginx
- **File:** `scripts/nginx-siyang.conf`
- **What:** No gzip configuration exists. Large HTML, CSS, and JS files are served uncompressed.
- **Why:** Performance — gzip typically reduces text file sizes by 60-80%.
- **How:** Add gzip configuration block:
  ```
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
  gzip_min_length 256;
  gzip_vary on;
  ```

---

## Phase 5: Final Verification & Polish

**Goal:** Verify everything works end-to-end and polish remaining details.

### 5.1 Verify CMS workflow end-to-end
- **What:** Log into Decap CMS at `/admin/`, create/edit/delete a product, blog post, and testimonial. Verify the webhook triggers, git pull happens, and index regenerates.
- **Why:** The entire content pipeline must work before going live.
- **How:** Manual testing on the staging/production server.

### 5.2 Verify all pages load without console errors
- **What:** Open every page in the browser and check the console for JavaScript errors.
- **Why:** Hidden JS errors can break functionality.
- **How:** Manual browser testing. Check: `/`, `/products/`, `/products/drills-drivers.html`, `/products/product.html?sku=SY-DD-20V-BL`, `/about/company.html`, `/about/team.html`, `/blogs/`, `/contact.html`, `/privacy.html`, `/terms.html`.

### 5.3 Verify i18n works for all 6 languages
- **What:** Switch between EN, ZH, AR, FR, RU, ES on the homepage and verify translations load correctly. Verify RTL layout works for Arabic.
- **Why:** Multilingual support is a key feature for this B2B site.
- **How:** Manual browser testing with `?lang=zh`, `?lang=ar`, etc.

### 5.4 Verify SEO meta tags
- **What:** Check that all pages have correct `<title>`, `<meta description>`, Open Graph tags, hreflang links, and structured data (JSON-LD).
- **Why:** SEO visibility depends on correct meta tags.
- **How:** Use browser dev tools or an SEO auditing tool. Verify domain is `siyang.tools` everywhere.

### 5.5 Verify mobile responsiveness
- **What:** Test all key pages on mobile viewport (375px, 768px, 1024px).
- **Why:** B2B buyers often browse on mobile.
- **How:** Manual testing with Chrome DevTools responsive mode.

### 5.6 Performance check
- **What:** Run Lighthouse audit on the homepage and a product page.
- **Why:** Performance affects SEO ranking and user experience.
- **How:** Chrome DevTools Lighthouse tab. Target: Performance > 80, Accessibility > 90, SEO > 90.

---

## Assumptions & Decisions

1. **Domain:** The production domain is `siyang.tools` (matching the Nginx config and CMS backend). The `ningbosiyang.com` references in sitemap/robots are errors to be fixed.
2. **Product images:** The `images/istock/` directory contains stock placeholder images that products currently reference. Real product photos need to be uploaded separately (manual business task).
3. **No build step:** The site is pure static HTML + JS with no bundler. This is intentional for simplicity. No build/bundle step will be added in this plan.
4. **No test framework:** Adding automated tests is out of scope for this plan. The site is static HTML and testing is manual.
5. **Decap CMS version:** Using v3.3.3 from CDN. No upgrade planned.
6. **Gitea backend:** Already deployed and configured on the same DigitalOcean droplet.
7. **SSL:** Already configured via Let's Encrypt/Certbot (visible in Nginx config).

---

## File Change Summary

| File | Phase | Action |
|------|-------|--------|
| `admin/config.yml` | 1 | Edit: domain, copyright year, image path comments |
| `admin/previews/navigation-preview.js` | 1 | Create: minimal preview template |
| `admin/previews/footer-preview.js` | 1 | Create: minimal preview template |
| `robots.txt` | 2 | Edit: fix sitemap domain |
| `sitemap.xml` | 2 | Rewrite: fix domain, add all pages |
| `index.html` | 2 | Edit: fix href="#" links, add alt attributes |
| `products/product.html` | 2 | Edit: fix href="#" links, add alt attributes |
| `assets/js/cms-loader.js` | 2 | Edit: fix href="#" links, add alt attributes, remove console.log |
| `assets/js/main.js` | 2 | Edit: remove console.log |
| `assets/js/premium-motion.js` | 2 | Edit: remove console.log |
| `assets/js/gsap-animations.js` | 2 | Edit: remove console.log |
| `assets/js/search.js` | 2 | Edit: fix href="#" links |
| `assets/js/product-selector.js` | 2 | Edit: fix href="#" links |
| `assets/js/quote-cart.js` | 2 | Edit: fix alt attributes |
| `404.html` | 2 | Create: custom error page |
| `content/products/sy-dd2001.md` | 3 | Edit: rename SKU or delete |
| `assets/js/site-config.js` | 3 | Edit: load from CMS with fallback |
| `scripts/nginx-siyang.conf` | 4 | Edit: add 404, CSP, HSTS, gzip |
| `scripts/setup-gitea-roles.sh` | 4 | Edit: fix OAuth redirect URI |

---

## Verification Steps

After all phases are complete:
1. Deploy to DigitalOcean using `scripts/deploy.sh`
2. Verify CMS login at `https://siyang.tools/admin/`
3. Verify all pages load at `https://siyang.tools/`
4. Verify 404 page appears for invalid URLs
5. Verify sitemap at `https://siyang.tools/sitemap.xml`
6. Verify robots.txt at `https://siyang.tools/robots.txt`
7. Run Lighthouse audit — target scores: Performance > 80, Accessibility > 90, SEO > 90
8. Test CMS content creation workflow end-to-end
