# GLM 5.1 — INFRASTRUCTURE, CMS CORE & NEW FEATURES

**Project:** Ningbo Siyang B2B Power Tools Platform
**Location:** `c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website`
**AI:** GLM 5.1 (You)
**Role:** Project Lead — Infrastructure, CMS Backbone, Gap-Closing Features
**Working alongside:** GPT-5.3 Codex (CMS Advanced + Interactive Tools) and Qwen 3.6-plus (Translations + SEO)

---

## YOUR DOMAIN — FILES YOU OWN

You are the ONLY AI touching these files. No other AI will modify them.

### New Files You Create
| File | Purpose |
|------|---------|
| `assets/js/i18n.js` | Language detection, switching, localStorage, URL param handling |
| `assets/js/search.js` | Client-side full-text search across products |
| `assets/js/product-filters.js` | Product category page filtering (voltage, brushless, etc.) |
| `about/warranty.html` | Warranty information page (Makita gap) |
| `about/safety.html` | Safety & compliance page (Makita gap) |
| `content/testimonials/index.json` | Testimonials index for CMS loader |
| `content/faq/index.json` | FAQ index for CMS loader |
| `content/team/index.json` | Team members index for CMS loader |
| `content/certifications/index.json` | Certifications index for CMS loader |
| `content/partners/index.json` | Partners index for CMS loader |

### Existing Files You Modify
| File | What You Change |
|------|-----------------|
| `admin/config.yml` | Add collections, editorial workflow, media management, i18n structure |
| `admin/index.html` | Add logo config, site_url, display_url, branding |
| `assets/js/cms-loader.js` | Add language-specific content loading |
| `assets/js/site-config.js` | Add i18n-related config (default language, available languages) |
| `content/products/SY-*.json` | All 48 product JSON files — add detailed specs (15-20 per product) |
| `content/products/index.json` | Update product index with new fields |
| `content/blog/index.json` | Update blog index with new fields |
| `content/settings/navigation.md` | Add warranty, safety links |
| `content/settings/footer.md` | Add warranty badge |
| `sitemap.xml` | Add new pages |
| `robots.txt` | Add language-aware rules |

### Files You DO NOT Touch (Other AI's Domain)
| File | Owner |
|------|-------|
| `admin/cms-theme.css` | GPT-5.3 Codex |
| `admin/previews/*.js` | GPT-5.3 Codex |
| `admin/widgets/*.js` | GPT-5.3 Codex |
| `products/product.html` | GPT-5.3 Codex (gallery, comparison, PDF) |
| `assets/css/styles.css` | GPT-5.3 Codex (RTL, gallery, comparison styles) |
| `assets/translations/ar.json` | Qwen 3.6-plus |
| `assets/translations/zh.json` | Qwen 3.6-plus |
| `assets/translations/fr.json` | Qwen 3.6-plus |
| `assets/translations/ru.json` | Qwen 3.6-plus |
| `assets/translations/es.json` | Qwen 3.6-plus |
| All HTML `<head>` sections (meta/hreflang) | Qwen 3.6-plus |

---

## PHASE 1: i18n INFRASTRUCTURE

### Task 1.1 — Create `assets/js/i18n.js`

Build the complete internationalization engine. This is the foundation for all 6 languages.

**Requirements:**
1. Language detection priority: URL param `?lang=zh` > localStorage `ns-lang` > browser `navigator.language` > default `en`
2. Language switching: function `setLanguage(lang)` that:
   - Sets `localStorage.setItem('ns-lang', lang)`
   - Updates `<html lang="..." dir="...">` attributes (`dir="rtl"` for Arabic only)
   - Dispatches custom event `document.dispatchEvent(new CustomEvent('languageChanged', {detail: {lang}}))`
   - Calls `applyTranslations()` to update all `data-i18n` elements
3. Translation loading: function `loadTranslations(lang)` that:
   - Fetches `/assets/translations/${lang}.json`
   - Caches in memory object `window.__i18n_cache = {}`
   - Returns the translation map
4. Translation application: function `applyTranslations()` that:
   - Finds all elements with `data-i18n="key.subkey"` attributes
   - Replaces `textContent` with the translated string
   - For `data-i18n-placeholder="key"` → updates `placeholder` attribute
   - For `data-i18n-title="key"` → updates `title` attribute
   - For `data-i18n-aria="key"` → updates `aria-label` attribute
5. Translation key lookup: function `t(key, fallback)` that:
   - Navigates nested keys like `nav.products.label`
   - Returns fallback if key not found
   - Supports interpolation: `t('cart.items', {count: 5})` → "5 items in cart"
6. Available languages config:
```javascript
var SUPPORTED_LANGUAGES = [
  {code: 'en', name: 'English', dir: 'ltr', flag: '🇺🇸'},
  {code: 'zh', name: '中文', dir: 'ltr', flag: '🇨🇳'},
  {code: 'ar', name: 'العربية', dir: 'rtl', flag: '🇸🇦'},
  {code: 'fr', name: 'Français', dir: 'ltr', flag: '🇫🇷'},
  {code: 'ru', name: 'Русский', dir: 'ltr', flag: '🇷🇺'},
  {code: 'es', name: 'Español', dir: 'ltr', flag: '🇪🇸'}
];
```
7. Initialize on DOMContentLoaded: detect language, load translations, apply
8. Expose globally: `window.i18n = { setLanguage, t, loadTranslations, applyTranslations, currentLanguage }`

**Acceptance Criteria:**
- [ ] `i18n.js` loads and initializes without errors
- [ ] `?lang=zh` URL param sets language to Chinese
- [ ] `<html dir="rtl">` is set when Arabic is selected
- [ ] `data-i18n` elements update their text content
- [ ] Language persists across page navigation via localStorage
- [ ] `languageChanged` event fires when language switches

### Task 1.2 — Create `assets/translations/en.json` (English Source of Truth)

Extract EVERY visible text string from the website into a structured JSON file. This is the master template that Qwen will translate into 5 other languages.

**Structure (use nested objects, NOT flat keys):**
```json
{
  "nav": {
    "home": "Home",
    "products": "Products",
    "productsAll": "All Products",
    "productsAllDesc": "Browse our complete catalog",
    "drillsDrivers": "Drills & Drivers",
    "drillsDriversDesc": "Cordless & corded drills",
    "saws": "Saws",
    "sawsDesc": "Circular, miter & jigsaws",
    "grinders": "Grinders",
    "grindersDesc": "Angle & bench grinders",
    "sanders": "Sanders",
    "sandersDesc": "Orbital, detail & belt sanders",
    "impactTools": "Impact Tools",
    "impactToolsDesc": "Impact drivers & wrenches",
    "comboKits": "Combo Kits",
    "comboKitsDesc": "Multi-tool combo sets",
    "about": "About",
    "aboutCompany": "Company Profile",
    "aboutOemOdm": "OEM/ODM Capabilities",
    "aboutCertifications": "Certifications & Quality",
    "aboutGlobal": "Global Presence",
    "aboutTeam": "Our Team",
    "aboutPaymentTerms": "Payment & Trade Terms",
    "aboutBrochure": "Company Brochure",
    "requestQuote": "Request Quote"
  },
  "hero": {
    "headline": "POWER YOUR CRAFT",
    "subtitle": "Professional Power Tools Since 1998",
    "cta": "Request Quote",
    "secondaryCta": "Explore Products"
  },
  "stats": {
    "customers": "Customers Worldwide",
    "customersValue": "500K+",
    "countries": "Countries Served",
    "countriesValue": "45+",
    "years": "Years of Excellence",
    "yearsValue": "25"
  },
  "products": {
    "addToQuote": "Add to Quote",
    "addedToQuote": "Added!",
    "viewDetails": "View Details",
    "inStock": "In Stock",
    "outOfStock": "Out of Stock",
    "featured": "Featured",
    "moq": "MOQ",
    "leadTime": "Lead Time",
    "specifications": "Specifications",
    "description": "Description",
    "userBenefits": "User Benefits",
    "relatedProducts": "Related Products",
    "downloadSpecSheet": "Download Spec Sheet",
    "quickInquiry": "Quick Inquiry",
    "quickInquiryDesc": "Have a question about this product? Send us a quick inquiry.",
    "inquiryName": "Your name",
    "inquiryEmail": "Business email",
    "inquiryMessage": "Your question or requirements...",
    "sendInquiry": "Send Inquiry",
    "inquirySent": "Inquiry sent! We'll respond within 24 hours.",
    "fillAllFields": "Please fill in all fields.",
    "compare": "Compare",
    "filterBy": "Filter by",
    "sortBy": "Sort by",
    "sortName": "Name",
    "sortNewest": "Newest",
    "voltage": "Voltage",
    "motorType": "Motor Type",
    "brushless": "Brushless",
    "brushed": "Brushed",
    "cordless": "Cordless",
    "corded": "Corded",
    "allCategories": "All Categories",
    "all": "All"
  },
  "categories": {
    "drillsDrivers": "Drills & Drivers",
    "saws": "Saws",
    "grinders": "Grinders",
    "sanders": "Sanders",
    "impactTools": "Impact Tools",
    "comboKits": "Combo Kits"
  },
  "blog": {
    "readMore": "Read more",
    "minRead": "min read",
    "by": "By",
    "allPosts": "All Posts",
    "categories": "Categories",
    "latestPosts": "Latest Posts",
    "relatedPosts": "Related Posts",
    "backToBlog": "Back to Blog",
    "sharePost": "Share this post",
    "publishedOn": "Published on"
  },
  "about": {
    "companyTitle": "Company Profile",
    "oemOdmTitle": "OEM/ODM Capabilities",
    "certificationsTitle": "Certifications & Quality",
    "globalTitle": "Global Presence",
    "teamTitle": "Our Team",
    "paymentTitle": "Payment & Trade Terms",
    "brochureTitle": "Company Brochure",
    "warrantyTitle": "Warranty Information",
    "safetyTitle": "Safety & Compliance"
  },
  "contact": {
    "title": "Contact Us",
    "subtitle": "Get in touch with our team for quotes, support, and inquiries",
    "callUs": "Call Us",
    "emailUs": "Email Us",
    "visitUs": "Visit Us",
    "businessHours": "Business Hours",
    "getDirections": "Get Directions",
    "scheduleCall": "Schedule a Call",
    "closedHolidays": "Closed on Chinese public holidays",
    "cstTimezone": "China Standard Time, UTC+8",
    "name": "Your Name",
    "email": "Business Email",
    "subject": "Subject",
    "message": "Your Message",
    "sendMessage": "Send Message",
    "sending": "Sending...",
    "sent": "Your email client will open with a pre-filled message to our sales team.",
    "validationName": "Please enter your name",
    "validationEmail": "Please enter a valid email address",
    "validationMessage": "Please enter your message",
    "quoteFormTitle": "Request a Quote",
    "quoteFormDesc": "Tell us about your requirements and we'll prepare a custom quote."
  },
  "footer": {
    "products": "Products",
    "company": "Company",
    "resources": "Resources",
    "connect": "Connect With Us",
    "tradeResources": "Trade Resources",
    "downloadCatalog": "Download Catalog",
    "getTradeUpdates": "Get Trade Updates",
    "businessEmail": "Business email",
    "copyright": "© 2026 Ningbo Siyang Power Tools Co., Ltd.",
    "terms": "Terms of Service",
    "privacy": "Privacy Policy",
    "secureInquiries": "Secure Inquiries"
  },
  "trust": {
    "iso9001": "ISO 9001",
    "ceCertified": "CE Certified",
    "sgsVerified": "SGS Verified",
    "rohs": "RoHS"
  },
  "quoteCart": {
    "title": "Quote Cart",
    "empty": "Your quote cart is empty",
    "emptyDesc": "Browse our products and add items to request a quote.",
    "browseProducts": "Browse Products",
    "quantity": "Qty",
    "remove": "Remove",
    "notes": "Additional Requirements",
    "notesPlaceholder": "MOQ, custom branding, packaging requirements...",
    "sendQuote": "Send Quote Request",
    "copyQuote": "Copy Quote Details",
    "copied": "Copied!",
    "sentViaEmail": "Your quote request has been prepared. Please send the email that was opened, or paste the copied text to sales@ningbosiyang.com",
    "itemAdded": "Added to quote cart",
    "totalItems": "items in cart"
  },
  "messaging": {
    "fabLabel": "Contact Us",
    "whatsapp": "WhatsApp",
    "email": "Email Us",
    "wechat": "WeChat",
    "wechatQRTitle": "Scan to connect on WeChat"
  },
  "search": {
    "placeholder": "Search products, SKUs...",
    "noResults": "No products found",
    "resultsFor": "Results for",
    "clearSearch": "Clear search"
  },
  "warranty": {
    "title": "Warranty Information",
    "subtitle": "Our commitment to quality and customer satisfaction",
    "standardWarranty": "Standard Warranty",
    "standardWarrantyDesc": "Every Ningbo Siyang product is warranted to be free of defects from workmanship and materials for the period of ONE YEAR from the date of original purchase.",
    "motorWarranty": "Brushless Motor Warranty",
    "motorWarrantyDesc": "Brushless motors are warranted for TWO YEARS from the date of original purchase, covering defects in motor windings, bearings, and electronic speed controllers.",
    "exclusions": "Warranty Exclusions",
    "exclusion1": "Repairs made or attempted by unauthorized service centers",
    "exclusion2": "Damage from normal wear and tear, abuse, misuse, or improper maintenance",
    "exclusion3": "Use of non-genuine batteries or chargers with cordless tools",
    "exclusion4": "Alterations or modifications to the original product",
    "exclusion5": "Consumable parts including bits, blades, brushes, belts, and accessories",
    "claimProcess": "How to File a Warranty Claim",
    "claim1": "Contact our support team at sales@ningbosiyang.com with your order number",
    "claim2": "Provide photos of the defect and a description of the issue",
    "claim3": "Our team will assess the claim within 3 business days",
    "claim4": "Approved claims receive replacement or repair at our discretion",
    "contactWarranty": "For warranty inquiries, contact our team"
  },
  "safety": {
    "title": "Safety & Compliance",
    "subtitle": "Product safety information and regulatory compliance",
    "generalSafety": "General Safety Guidelines",
    "safety1": "Always wear appropriate personal protective equipment (safety glasses, hearing protection, dust mask)",
    "safety2": "Read and understand the instruction manual before operating any power tool",
    "safety3": "Keep work areas clean and well-lit",
    "safety4": "Disconnect power before adjusting, cleaning, or servicing tools",
    "safety5": "Keep children and untrained persons away from power tools",
    "safety6": "Store tools in a dry, secure place out of reach of children",
    "compliance": "Regulatory Compliance",
    "complianceCE": "CE Marking — All products comply with EU Machinery Directive 2006/42/EC",
    "complianceRoHS": "RoHS — Products comply with Restriction of Hazardous Substances Directive",
    "complianceISO": "ISO 9001:2015 — Quality management system certified by SGS",
    "complianceGS": "GS Mark — Selected products carry Geprüfte Sicherheit (Tested Safety) certification",
    "recalls": "Product Safety Notices",
    "recallsDesc": "There are currently no active safety recalls for Ningbo Siyang products.",
    "recallsContact": "If you believe your product may be affected, contact us immediately at sales@ningbosiyang.com"
  },
  "cookieConsent": {
    "title": "Cookie Notice",
    "description": "We use cookies to improve your experience. By continuing, you agree to our cookie policy.",
    "acceptAll": "Accept All",
    "decline": "Decline"
  }
}
```

**You must extract approximately 235+ keys covering EVERY visible string on the site.** Walk through each page systematically:
- index.html (hero, stats, product expertise, testimonials, CTA sections)
- All product category pages (filters, cards, empty states)
- products/product.html (detail page labels)
- blogs/index.html and blogs/post.html
- about/ pages (company, oem-odm, certifications, global, team, payment-terms, brochure)
- contact.html (all form labels, cards, validation)
- terms.html and privacy.html
- Header (nav, trust bar, language selector)
- Footer (all columns, trade resources)
- Quote cart drawer
- Messaging FAB
- Search overlay

**Acceptance Criteria:**
- [ ] `en.json` contains 235+ translation keys
- [ ] Every key is organized in logical nested groups
- [ ] No HTML tags in translation values (plain text only)
- [ ] No duplicate keys
- [ ] All interpolation points use `{{variable}}` syntax

### Task 1.3 — Add Language Selector to Header

Add a language dropdown to the top bar of ALL 22 HTML pages.

**Location:** In the top bar (`<div class="hidden md:block bg-zinc-900">`), after the trust badges and `|` separator, before the Terms link.

**HTML to insert:**
```html
<div class="relative group" id="lang-selector">
  <button class="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-yellow-400 transition-colors" aria-label="Select language">
    <span id="current-lang-flag">🇺🇸</span>
    <span id="current-lang-name">EN</span>
    <svg class="w-3 h-3 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="dropdown-panel hidden absolute top-full right-0 mt-1 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl shadow-black/50 overflow-hidden z-50">
    <div class="py-1" id="lang-options">
    </div>
  </div>
</div>
```

**JavaScript (in i18n.js):** Populate `#lang-options` from `SUPPORTED_LANGUAGES` array. On click, call `setLanguage(code)` and update `#current-lang-flag` and `#current-lang-name`.

**Also add to mobile nav:** Same language selector as a simple list of links below the nav items in the mobile hamburger menu.

**Acceptance Criteria:**
- [ ] Language selector appears in top bar on all 22 pages
- [ ] Language selector appears in mobile nav on all 22 pages
- [ ] Clicking a language updates the UI (after translations are loaded)
- [ ] Current language is highlighted in the dropdown
- [ ] Dropdown closes when clicking outside

### Task 1.4 — Add `data-i18n` Attributes to HTML Elements

Go through ALL 22 HTML pages and add `data-i18n="key"` attributes to every visible text element that should be translatable. This is tedious but essential.

**Rules:**
- Navigation links: `data-i18n="nav.home"`, `data-i18n="nav.products"`, etc.
- Headings: `data-i18n="hero.headline"`, `data-i18n="contact.title"`, etc.
- Buttons: `data-i18n="products.addToQuote"`, `data-i18n="contact.sendMessage"`, etc.
- Labels: `data-i18n="contact.name"`, `data-i18n="contact.email"`, etc.
- Placeholders: `data-i18n-placeholder="contact.name"`, `data-i18n-placeholder="contact.email"`, etc.
- Alt text: `data-i18n-aria="..."` for aria-labels
- Trust badges: `data-i18n="trust.iso9001"`, etc.
- Footer: `data-i18n="footer.products"`, etc.

**Do NOT add data-i18n to:**
- Product names (loaded from JSON dynamically)
- Blog titles (loaded from markdown dynamically)
- Copyright year
- SVG paths

**Acceptance Criteria:**
- [ ] Every visible static text string has a `data-i18n` attribute
- [ ] Every form input placeholder has a `data-i18n-placeholder` attribute
- [ ] Every aria-label has a `data-i18n-aria` attribute
- [ ] No duplicate `data-i18n` keys on the same page
- [ ] All keys match the structure in `en.json`

---

## PHASE 2: CMS COLLECTIONS & CONFIGURATION

### Task 2.1 — Add Missing CMS Collections to `admin/config.yml`

The current config has: blog, products, pages, settings, testimonials, team_members, certifications, faq, partners.

**Add these NEW collections:**

1. **Warranty Collection** — `content/warranty/`
   - Fields: title, warranty period, description, exclusions (list), claim process (markdown)
   - view_filters by warranty type (standard, motor, extended)

2. **Safety Notices Collection** — `content/safety/`
   - Fields: title, notice type (select: safety advisory, recall, compliance update), affected SKUs (string), description (markdown), date (datetime), severity (select: info, warning, critical)
   - view_filters by notice type and severity

3. **Product Manuals Collection** — `content/manuals/`
   - Fields: title, product SKU (relation to products), language (select: en, zh, ar, fr, ru, es), PDF file (file widget), version (string), date (datetime)
   - view_filters by language

4. **Distributors Collection** — `content/distributors/`
   - Fields: company name, country (select with 50+ countries), region (select: Asia-Pacific, Europe, North America, Middle East, Africa, South America), contact person, email, phone, website, logo (image), address (text)
   - view_filters by country and region
   - view_groups by region

5. **Downloads Collection** — `content/downloads/`
   - Fields: title, category (select: Catalog, Spec Sheet, Manual, Certificate, Firmware), file (file widget), language (select), version (string), date (datetime), description (text)
   - view_filters by category and language

**For EACH collection:**
- `create: true`
- `slug: "{{slug}}"`
- `summary` template showing key fields
- `label_singular` for proper grammar
- `description` explaining what the section is for (owner-friendly)
- `sortable_fields` with relevant fields
- `view_filters` for quick filtering
- `view_groups` where applicable
- Every field has `hint:` with owner-friendly explanation
- Every field has appropriate `required: true/false`

**Acceptance Criteria:**
- [ ] All 5 new collections appear in CMS sidebar
- [ ] Each collection has proper fields, widgets, hints
- [ ] View filters work for each collection
- [ ] Creating a new entry in each collection works
- [ ] No YAML syntax errors

### Task 2.2 — Add Editorial Workflow to `admin/config.yml`

Add the following to the config:

```yaml
publish_mode: editorial_workflow

backend:
  name: gitea
  repo: admin/site
  branch: main
  api_root: http://165.22.250.66/api/v1
  base_url: http://165.22.250.66
  auth_endpoint: /login/oauth/authorize
  site_domain: 165.22.250.66
  app_id: b44bfe8b-1633-41ee-9533-738e78b392a0
  squash_merges: true
  commit_messages:
    create: "Add {{collection}}: {{slug}}"
    update: "Update {{collection}}: {{slug}}"
    delete: "Remove {{collection}}: {{slug}}"
    uploadMedia: "Upload image: {{path}}"
    deleteMedia: "Remove image: {{path}}"
```

**Also add to each collection:**
- Pages and Settings: `delete: false` (prevent accidental deletion of critical config)
- Settings: `publish: false` (require manual publish for site-wide changes)

**Add field validation:**
- Products SKU: `pattern: ['^[A-Z]{2}-[A-Z]{1,3}-[A-Z0-9-]+$', 'SKU must follow format: SY-DD-20V-BL']`
- All email fields: `pattern: ['^[^@]+@[^@]+\\.[^@]+$', 'Please enter a valid email address']`
- All URL fields: `pattern: ['^https?://.+', 'Please enter a valid URL starting with http:// or https://']`

**Acceptance Criteria:**
- [ ] Editorial workflow shows Draft → In Review → Published
- [ ] Commit messages are descriptive
- [ ] Pages and Settings cannot be deleted
- [ ] SKU validation rejects invalid formats
- [ ] Email validation rejects invalid formats

### Task 2.3 — Add Media Management to `admin/config.yml`

Add per-field `media_folder` and `media_library` config:

```yaml
media_library:
  max_file_size: 2048000
  choose_url: false
```

For product image field:
```yaml
- label: "Main Product Photo"
  name: "image"
  widget: "image"
  media_folder: "images/products"
  public_folder: "/images/products"
  choose_url: false
  hint: "Upload or choose the main product image. Use a square photo for best results."
```

For blog cover image:
```yaml
- label: "Cover Image"
  name: "image"
  widget: "image"
  media_folder: "images/blog"
  public_folder: "/images/blog"
  choose_url: false
```

For testimonial avatars:
```yaml
- label: "Customer Photo"
  name: "avatar"
  widget: "image"
  media_folder: "images/testimonials"
  public_folder: "/images/testimonials"
  choose_url: false
```

For certificate images:
```yaml
- label: "Certificate Image"
  name: "image"
  widget: "image"
  media_folder: "images/certificates"
  public_folder: "/images/certificates"
  choose_url: false
```

For PDF downloads:
```yaml
- label: "PDF File"
  name: "file"
  widget: "file"
  media_folder: "assets/downloads"
  public_folder: "/assets/downloads"
  choose_url: false
```

**Acceptance Criteria:**
- [ ] Product images upload to `images/products/`
- [ ] Blog images upload to `images/blog/`
- [ ] Testimonial avatars upload to `images/testimonials/`
- [ ] Certificate images upload to `images/certificates/`
- [ ] PDF files upload to `assets/downloads/`
- [ ] External URL option is disabled (`choose_url: false`)
- [ ] Max file size is 2MB

### Task 2.4 — Add CMS Display & UX Enhancements

Add to existing collections in `admin/config.yml`:

**Products collection:**
```yaml
view_filters:
  - label: "In Stock"
    field: "inStock"
    pattern: true
  - label: "Out of Stock"
    field: "inStock"
    pattern: false
  - label: "Featured"
    field: "featured"
    pattern: true
  - label: "Drills & Drivers"
    field: "category"
    pattern: "Drills & Drivers"
  - label: "Saws"
    field: "category"
    pattern: "Saws"
  - label: "Grinders"
    field: "category"
    pattern: "Grinders"
  - label: "Sanders"
    field: "category"
    pattern: "Sanders"
  - label: "Impact Tools"
    field: "category"
    pattern: "Impact Tools"
  - label: "Combo Kits"
    field: "category"
    pattern: "Combo Kits"
view_groups:
  - label: "By Category"
    field: "category"
  - label: "By Brand"
    field: "brand"
sortable_fields:
  fields: ["name", "sku", "category"]
identifier_field: "name"
```

**Blog collection:**
```yaml
view_filters:
  - label: "B2B Insights"
    field: "category"
    pattern: "B2B Insights"
  - label: "Industry Trends"
    field: "category"
    pattern: "Industry Trends"
  - label: "Product Spotlight"
    field: "category"
    pattern: "Product Spotlight"
  - label: "Company News"
    field: "category"
    pattern: "Company News"
  - label: "Technical Guides"
    field: "category"
    pattern: "Technical Guides"
sortable_fields:
  fields: ["title", "date"]
```

**Acceptance Criteria:**
- [ ] Products can be filtered by category, stock status, featured
- [ ] Products can be grouped by category or brand
- [ ] Blog can be filtered by category
- [ ] Sort options work for all collections
- [ ] Product list shows product name (not SKU) as identifier

### Task 2.5 — Add CMS Branding & Page Structure

**In `admin/config.yml`, add:**
```yaml
logo_url: /ningbo-siyang-logo-dark.svg
site_url: http://165.22.250.66
display_url: http://165.22.250.66
```

**In `admin/index.html`, add:**
- Custom login page background (dark theme with yellow accent)
- "Back to Website" button in CMS header
- Link to public site homepage

**Reorganize CMS sidebar collection order:**
1. Homepage (most frequently edited)
2. Products
3. Blog Posts
4. Testimonials
5. Team Members
6. Certifications
7. FAQ
8. Partners & Clients
9. Distributors
10. Warranty
11. Safety Notices
12. Product Manuals
13. Downloads
14. Pages
15. Site Settings

**Acceptance Criteria:**
- [ ] Ningbo Siyang logo appears on CMS login page
- [ ] "Back to Website" link works
- [ ] Collections are ordered by editing frequency
- [ ] CMS sidebar matches the public site navigation structure

---

## PHASE 3: PRODUCT DATA ENHANCEMENT (MAKITA GAP)

This is the BIGGEST content task. Currently each product JSON has 6-7 specs. Makita has 15-25. You must extend ALL 48 product JSON files.

### Task 3.1 — Extend Product JSON Schema

**Current schema (example: SY-DD-20V-BL.json):**
```json
{
  "sku": "SY-DD-20V-BL",
  "name": "20V MAX Brushless Drill/Driver",
  "brand": "Ningbo Siyang Pro",
  "category": "drills-drivers",
  "categoryLabel": "Drills & Drivers",
  "description": "Professional-grade brushless drill driver...",
  "specs": {
    "Voltage": "20V MAX",
    "Motor": "Brushless",
    "Max Torque": "530 in-lbs",
    "Speed Settings": "2",
    "Chuck Size": "1/2\"",
    "No-Load Speed": "0-450/0-1500 RPM",
    "Weight": "3.5 lbs (1.6 kg)"
  },
  "images": ["../images/istock/10001.jpg"],
  "inStock": true,
  "moq": "500 units",
  "leadTime": "30-45 days"
}
```

**New extended schema (Makita-level detail):**
```json
{
  "sku": "SY-DD-20V-BL",
  "name": "20V MAX Brushless Drill/Driver",
  "brand": "Ningbo Siyang Pro",
  "category": "drills-drivers",
  "categoryLabel": "Drills & Drivers",
  "description": "Professional-grade brushless drill driver with 2-speed gearbox and 1/2 inch metal chuck. Delivers 530 in-lbs of max torque for demanding industrial applications. The brushless motor provides up to 57% more runtime over brushed motors, while the all-metal transmission and gear case ensure maximum durability on the jobsite.",
  "userBenefits": [
    "Brushless motor delivers up to 57% more runtime over brushed motors",
    "2-speed gearbox (0-450/0-1500 RPM) for versatile drilling and fastening",
    "1/2 inch single-sleeve ratcheting metal chuck for superior bit retention",
    "LED light with 20-second delay illuminates the work area",
    "Ergonomic handle design reduces fatigue during extended use",
    "All-metal transmission and gear case for maximum durability"
  ],
  "specs": {
    "Voltage": "20V MAX",
    "Motor Type": "Brushless",
    "Max Torque": "530 in-lbs (60 Nm)",
    "Speed Settings": "2",
    "No-Load Speed (Low)": "0-450 RPM",
    "No-Load Speed (High)": "0-1500 RPM",
    "Chuck Size": "1/2\" (13mm)",
    "Chuck Type": "Single-sleeve ratcheting metal",
    "Drilling Capacity (Wood)": "1-1/2\" (38mm)",
    "Drilling Capacity (Metal)": "1/2\" (13mm)",
    "Clutch Settings": "24",
    "Weight (Tool Only)": "3.5 lbs (1.6 kg)",
    "Weight (With Battery)": "4.2 lbs (1.9 kg)",
    "Overall Length": "7-5/8\" (194mm)",
    "Sound Power Level (LWA)": "95 dB(A)",
    "Sound Pressure Level (LPA)": "84 dB(A)",
    "Vibration Level (Drilling)": "2.5 m/s²",
    "Vibration Level (Impact)": "4.0 m/s²",
    "LED Work Light": "Yes, with 20-second delay",
    "Belt Hook": "Yes, adjustable",
    "Battery Platform": "Siyang 20V MAX"
  },
  "images": [
    "../images/istock/10001.jpg",
    "../images/istock/10002.jpg",
    "../images/istock/10003.jpg"
  ],
  "relatedProducts": ["SY-DD-RH-DEM", "SY-IT-DRV-20V", "SY-CK-6PC-20V"],
  "downloads": {
    "specSheet": "/assets/downloads/SY-DD-20V-BL-specs.pdf",
    "manual": "/assets/downloads/SY-DD-20V-BL-manual.pdf"
  },
  "compliance": {
    "ce": true,
    "rohs": true,
    "gs": false,
    "ul": false,
    "eec": true
  },
  "inStock": true,
  "featured": false,
  "moq": "500 units",
  "leadTime": "30-45 days",
  "warranty": "1 year standard, 2 year brushless motor"
}
```

**New fields to add to ALL 48 products:**
1. `userBenefits` — Array of 4-6 bullet points explaining WHY a buyer should choose this product
2. Extended `specs` — 15-20 specs per product (add: drilling capacity, clutch settings, weight with battery, overall length, sound levels, vibration levels, LED light, belt hook, battery platform, etc.)
3. `images` — Array of 3-5 image paths (even if pointing to same stock photo for now, structure must support multiple)
4. `relatedProducts` — Array of 2-3 SKU strings for cross-sell
5. `downloads` — Object with `specSheet` and `manual` paths (can be empty strings for now)
6. `compliance` — Object with boolean flags for CE, RoHS, GS, UL, EEC
7. `featured` — Boolean for homepage feature
8. `warranty` — String describing warranty coverage

**Category-specific specs to add:**

**Drills & Drivers:** Drilling capacity (wood/metal), clutch settings, chuck type, weight with battery, overall length, sound levels, vibration levels, LED light, belt hook, battery platform

**Saws:** Blade diameter, arbor size, max cutting depth (at 90°/45°), no-load speed, bevel capacity, table size (for miter/table saws), weight, cord length, sound levels, blade included

**Grinders:** Disc diameter, arbor size, no-load speed, spindle thread, wheel type, switch type (paddle/trigger/lock-on), weight, cord length, sound levels, vibration levels, auxiliary handle

**Sanders:** Pad size, orbit diameter, orbits per minute, dust collection, dust bag included, pad type (hook & loop), weight, cord length, sound levels

**Impact Tools:** Max torque, impacts per minute, drive size, speed settings, mode settings, LED light, belt hook, weight with battery, overall length, sound levels, vibration levels, battery platform

**Combo Kits:** Number of tools, tools included (list), batteries included, charger included, case type, total weight, battery platform

**Acceptance Criteria:**
- [ ] All 48 product JSON files have 15-20 specs each
- [ ] All products have `userBenefits` array with 4-6 items
- [ ] All products have `images` array with 3+ entries
- [ ] All products have `relatedProducts` with 2-3 SKUs
- [ ] All products have `compliance` object
- [ ] All products have `featured` boolean
- [ ] All products have `warranty` string
- [ ] Category-specific specs are present and relevant
- [ ] No product has fewer than 15 specs
- [ ] JSON is valid (no syntax errors)

### Task 3.2 — Update `content/products/index.json`

Update the product index to include the new fields so product listing pages can display them:
- Add `featured` field
- Add `compliance` summary (e.g., "CE, RoHS")
- Add `userBenefits` (first item only, as a short benefit)
- Add `warranty` field

**Acceptance Criteria:**
- [ ] index.json includes new fields for all 48 products
- [ ] Product listing pages can access featured/compliance data

---

## PHASE 4: NEW PAGES (MAKITA GAPS)

### Task 4.1 — Create `about/warranty.html`

Full warranty information page. Use the same dark theme, same header/footer, same messaging FAB as other about/ pages.

**Page structure:**
1. Hero section: "Warranty Information" with subtitle
2. Standard Warranty section: 1-year warranty description
3. Brushless Motor Warranty section: 2-year motor warranty
4. Warranty Exclusions section: Bulleted list of 5 exclusions
5. How to File a Claim section: 4-step process
6. Contact CTA: "For warranty inquiries, contact our team" with email link

**Use the translation keys from `en.json` under `warranty.*`**

**Acceptance Criteria:**
- [ ] Page loads with correct styling
- [ ] All sections render properly
- [ ] Contact email link works (mailto:)
- [ ] Page is linked from footer and about dropdown

### Task 4.2 — Create `about/safety.html`

Safety & compliance page.

**Page structure:**
1. Hero section: "Safety & Compliance" with subtitle
2. General Safety Guidelines section: 6 safety rules
3. Regulatory Compliance section: CE, RoHS, ISO 9001, GS mark descriptions
4. Product Safety Notices section: "No active recalls" message + contact info
5. CTA: Contact for safety inquiries

**Use the translation keys from `en.json` under `safety.*`**

**Acceptance Criteria:**
- [ ] Page loads with correct styling
- [ ] All sections render properly
- [ ] Safety notices section shows current status
- [ ] Page is linked from footer and about dropdown

### Task 4.3 — Add Warranty & Safety Links to Navigation

Add links to the new pages in:
- About dropdown menu (desktop)
- Mobile navigation
- Footer "Company" column

**Acceptance Criteria:**
- [ ] "Warranty" link appears in About dropdown
- [ ] "Safety" link appears in About dropdown
- [ ] Both links work from all 22 pages
- [ ] Links appear in mobile nav

---

## PHASE 5: CLIENT-SIDE SEARCH (MAKITA GAP)

### Task 5.1 — Create `assets/js/search.js`

Build a client-side full-text search engine for the product catalog.

**Requirements:**
1. Load product data from `content/products/index.json`
2. Build a search index on page load (index: name, sku, category, description, brand)
3. Search function: `searchProducts(query)` returns matching products
4. Fuzzy matching: handle typos (e.g., "dril" matches "drill")
5. SKU exact match: "SY-DD" returns all products starting with that prefix
6. Category match: "grinder" returns all grinders
7. Search UI: overlay that appears when user clicks search icon in header
8. Results display: product cards with name, SKU, category, image
9. Each result links to `product.html?sku={sku}`
10. Keyboard support: Escape closes search, Enter selects first result
11. Debounced input: 300ms delay before searching
12. Empty state: "No products found for '{query}'"
13. Mobile responsive: full-screen overlay on mobile

**Search overlay HTML structure:**
```html
<div id="search-overlay" class="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur hidden">
  <div class="container mx-auto px-4 pt-20 max-w-2xl">
    <div class="relative">
      <input type="text" id="search-input" class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none" placeholder="Search products, SKUs..." data-i18n-placeholder="search.placeholder"/>
      <button id="search-close" class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div id="search-results" class="mt-4 space-y-2 max-h-[60vh] overflow-y-auto"></div>
  </div>
</div>
```

**Add search icon to header:** A magnifying glass icon in the main nav area (before the Request Quote button) that opens the search overlay on click.

**Acceptance Criteria:**
- [ ] Search icon appears in header on all pages
- [ ] Clicking search icon opens overlay
- [ ] Typing "drill" returns all drill products
- [ ] Typing "SY-DD" returns all products with that SKU prefix
- [ ] Typing "grinder" returns all grinder products
- [ ] Results link to correct product detail pages
- [ ] Escape key closes overlay
- [ ] Search works on mobile
- [ ] Debounce prevents excessive re-rendering

---

## PHASE 6: PRODUCT FILTERS (MAKITA GAP)

### Task 6.1 — Create `assets/js/product-filters.js`

Add filtering capability to all product category pages.

**Filter options per category:**

**Drills & Drivers:**
- Voltage: 12V, 18V/20V, Corded
- Motor: Brushless, Brushed
- Type: Drill/Driver, Hammer Drill, Rotary Hammer, Impact Driver

**Saws:**
- Type: Circular, Miter, Jig, Reciprocating, Table, Band, Oscillating
- Blade Size: Various
- Power: Cordless, Corded

**Grinders:**
- Type: Angle, Bench, Die, Straight
- Disc Size: 4.5", 6", 7", 8"
- Power: Cordless, Corded

**Sanders:**
- Type: Orbital, Detail, Belt, Disc, Planer
- Power: Cordless, Corded

**Impact Tools:**
- Type: Impact Driver, Impact Wrench
- Drive Size: 1/4", 3/8", 1/2", 3/4"
- Power: Cordless, Corded

**Combo Kits:**
- Piece Count: 2pc, 3pc, 4pc, 5pc, 6pc, 8pc
- Voltage: 12V, 18V/20V

**Filter UI:** Horizontal bar above product grid with dropdown selects and toggle buttons. On mobile: collapsible filter panel.

**Implementation:**
1. Read `data-filter-*` attributes from product cards
2. Build filter UI dynamically based on available values
3. On filter change: hide/show product cards with CSS classes
4. Show count: "Showing X of Y products"
5. "Clear All Filters" button
6. Persist filter state in URL params: `?voltage=20v&motor=brushless`

**Add filter data attributes to product cards in all category pages:**
```html
<div class="product-card" 
     data-filter-voltage="20v" 
     data-filter-motor="brushless" 
     data-filter-type="drill-driver"
     data-filter-power="cordless">
```

**Acceptance Criteria:**
- [ ] Filter bar appears on all 6 product category pages + products/index.html
- [ ] Filters are category-specific (drills show voltage, saws show blade size)
- [ ] Selecting a filter hides non-matching products
- [ ] "Showing X of Y" count updates
- [ ] "Clear All" resets all filters
- [ ] Filter state persists in URL
- [ ] Filters work on mobile

---

## PHASE 7: DYNAMIC CONTENT TRANSLATION

### Task 7.1 — Update `assets/js/cms-loader.js`

Modify the CMS loader to support language-specific content:

1. When `i18n.currentLanguage` is not `en`, try loading `content/blog/index.{lang}.json` first
2. Fall back to `content/blog/index.json` (English) if language file doesn't exist
3. Same for products: `content/products/index.{lang}.json` → fallback to English
4. For individual blog posts: `content/blog/{slug}.{lang}.md` → fallback to English
5. For individual products: `content/products/{sku}.{lang}.json` → fallback to English

**Acceptance Criteria:**
- [ ] Blog listing shows translated posts when available
- [ ] Product listing shows translated products when available
- [ ] Falls back to English when translation doesn't exist
- [ ] No errors when language file is missing

### Task 7.2 — Add i18n Structure to `admin/config.yml`

Add the i18n configuration:

```yaml
i18n:
  structure: multiple_files
  locales: ["en", "zh", "ar", "fr", "ru", "es"]
  default_locale: "en"
```

For each collection that needs translation (blog, products, testimonials, faq, distributors, downloads, manuals):
```yaml
i18n: true
```

For individual fields:
- Translatable fields (title, name, description, excerpt, body, quote, question, answer): `i18n: true`
- Non-translatable fields (sku, price, image, moq, leadTime, inStock, featured, order, rating): `i18n: false`

**Acceptance Criteria:**
- [ ] i18n config is present in config.yml
- [ ] Each collection has `i18n: true` where appropriate
- [ ] Each field has `i18n: true` or `i18n: false`
- [ ] CMS shows language tabs for translatable collections
- [ ] Non-translatable fields are shared across languages

---

## PHASE 8: SITE DEPLOYMENT

### Task 8.1 — Deploy to DigitalOcean

Push all files to the Gitea repository and configure Nginx to serve them.

**Steps:**
1. Initialize git repo in the public-website directory
2. Add Gitea remote: `http://165.22.250.66/admin/site.git`
3. Commit all files
4. Push to Gitea
5. Configure Nginx on the droplet to serve static files from the repo
6. Verify the site loads at `http://165.22.250.66`
7. Verify CMS loads at `http://165.22.250.66/admin/`

**Acceptance Criteria:**
- [ ] Site loads at the droplet IP
- [ ] All pages are accessible
- [ ] CMS admin panel loads
- [ ] Gitea OAuth login works

---

## EXECUTION ORDER

| Priority | Phase | Tasks | Estimated Sub-Tasks |
|----------|-------|-------|---------------------|
| 1 | Phase 1 | i18n Infrastructure (1.1-1.4) | 15 |
| 2 | Phase 2 | CMS Collections & Config (2.1-2.5) | 25 |
| 3 | Phase 3 | Product Data Enhancement (3.1-3.2) | 50 (48 products + index) |
| 4 | Phase 4 | New Pages (4.1-4.3) | 8 |
| 5 | Phase 5 | Client-Side Search (5.1) | 6 |
| 6 | Phase 6 | Product Filters (6.1) | 8 |
| 7 | Phase 7 | Dynamic Content Translation (7.1-7.2) | 5 |
| 8 | Phase 8 | Site Deployment (8.1) | 3 |

**Total: ~120 sub-tasks**

---

## NON-NEGOTIABLE RULES

1. **NO SKIP** — Every sub-task must be completed before moving on
2. **NO MINIMAL** — Each fix must be fully implemented, not stubbed
3. **NO COMMENTS** — Do not add comments to code
4. **VERIFY BEFORE COMPLETE** — Test each feature before marking done
5. **NO PLACEHOLDER** — If a feature can't work without real data, build the mechanism and use configurable defaults
6. **CONFIG OVER HARDCODE** — All business data from site-config.js
7. **HONEST UX** — Never show a button/link that implies functionality that doesn't exist
8. **TEST ON MOBILE** — Every feature must work on mobile viewport
9. **NO OTHER AI'S FILES** — Do NOT modify files assigned to GPT-5.3 Codex or Qwen 3.6-plus
10. **MAKITA STANDARD** — Every feature must meet or exceed what Makita's website offers

---

## INTEGRATION NOTES

When your work is complete, the following must be true for the other AIs to integrate:

1. **For GPT-5.3 Codex:** Your extended product JSON schema (with `images` array, `userBenefits`, `relatedProducts`, `downloads`, `compliance`) must be in place so Codex can build the gallery, comparison, and PDF download UI against real data structures.

2. **For Qwen 3.6-plus:** Your `en.json` with 235+ keys must be complete so Qwen can translate it into 5 languages. Your i18n.js must be working so Qwen can test translations.

3. **Your `admin/config.yml`** must have all collections, editorial workflow, media management, and i18n structure in place before Codex adds advanced widgets and Qwen adds i18n field markers.

---

**END OF GLM 5.1 TASK DOCUMENT**
