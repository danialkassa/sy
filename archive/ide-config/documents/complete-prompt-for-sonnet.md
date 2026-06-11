# COMPLETE PROMPT: Fix Ningbo Siyang B2B Website & Decap CMS for Production

## CONTEXT

You are working on a B2B power tools company website for **Ningbo Siyang Power Tools Co., Ltd.** The site is a static HTML website with **Decap CMS** (v3.3.3) for content management, backed by **Gitea** as the Git backend, deployed on a **DigitalOcean droplet** (165.22.250.66, domain: siyang.tools).

**Git repo**: `admin/b2b` on Gitea at `https://siyang.tools/api/v1`
**Latest commit**: `8a9b9e3` — Production readiness fixes
**Local path**: `c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website`
**Git installed at**: `C:\Program Files\Git\bin\git.exe`
**Server access**: `ssh root@165.22.250.66`

---

## THE PROBLEM (BE BRUTALLY HONEST)

Previous work over 3+ days has NOT achieved a production-ready website. The core issues remain:

### 1. CONTENT IS CLIENT-SIDE RENDERED — SEO IS BROKEN
The entire website content (products, homepage, about pages, blog) is loaded via JavaScript (`cms-loader.js`) AFTER the page loads. This means:
- Search engines see EMPTY pages (Google does NOT execute JavaScript reliably for indexing)
- The `<h1>`, product names, descriptions — NONE of it exists in the HTML source
- Social media crawlers (Facebook, Twitter, LinkedIn) see empty pages — broken Open Graph previews
- First Contentful Paint is terrible — users see a blank page while JS loads and parses 48+ markdown files

**This is the #1 blocking issue. The site is invisible to search engines.**

### 2. THE CMS LOADER IS 2000+ LINES OF SPAGHETTI JS
`assets/js/cms-loader.js` is a monolithic 2075-line file that:
- Fetches `index.json` files for 13+ collections
- Then fetches individual `.md` files for each item
- Parses YAML frontmatter client-side
- Manually builds HTML strings with string concatenation
- Has 21+ `load*` functions, each doing DOM manipulation
- Has no error recovery — if one fetch fails, the page is broken
- Is impossible for a non-technical person to debug

### 3. NON-TECHNICAL PEOPLE CANNOT USE THE CMS
- Product form has 109 fields (section markers were added but it's still overwhelming)
- Homepage has 37 sections in ONE form
- CMS preview doesn't match the live site (renders in iframe without real CSS/JS)
- No visual feedback that changes are actually live
- Editorial workflow is enabled but the sync status badge only checks if the webhook service is running — NOT if the content is actually deployed

### 4. MISSING CRITICAL CONTENT
- `/images/products/` — EMPTY (only .gitkeep). Products reference `/images/istock/` stock photos
- `/images/team/` — EMPTY
- `/images/testimonials/` — EMPTY
- `/images/blog/` — EMPTY
- `/images/partners/` — EMPTY
- `/assets/downloads/` — EMPTY (no PDF spec sheets or manuals)
- `/assets/images/wechat-qr.png` — MISSING (referenced but doesn't exist)

### 5. THE SYNC PIPELINE IS FRAGILE
The pipeline is: CMS → Gitea commit → Webhook → git pull → generate-index.js → index.json → Frontend loads

Problems:
- `generate-index.js` was just replaced with js-yaml but `npm install` hasn't been run on the server properly
- If git pull fails (merge conflicts, credential issues), content never goes live and nobody knows
- The sync status badge only checks `/health` (is the webhook service running?) — NOT whether content is actually up to date
- `sync-md.cjs` and `generate-index.js` go in opposite directions — running both causes data loss

---

## WHAT YOU MUST DO

### PRIORITY 1: FIX SEO — Pre-render Content into HTML (CRITICAL)

The site MUST work without JavaScript for search engines. You have two options:

**Option A: Build-time static generation (RECOMMENDED)**
Create a Node.js build script that:
1. Reads all `.md` files from `content/`
2. Parses YAML frontmatter with `js-yaml`
3. Injects the content into the HTML templates
4. Writes the final HTML files with content baked in
5. The JS `cms-loader.js` still runs for dynamic features (filters, search, cart) but the page has content even without JS

This means:
- `index.html` should have the hero text, product names, descriptions etc. IN THE HTML
- `products/product.html` should have product data IN THE HTML (as JSON in a `<script type="application/json">` tag that cms-loader reads)
- Search engines see full content
- Social crawlers see full content
- The build script runs as part of the webhook pipeline (after git pull, before index generation)

**Option B: Server-side rendering with Nginx**
Not feasible with the current static setup. Skip this.

**YOU MUST IMPLEMENT OPTION A.** Create a `scripts/build-html.js` script that pre-renders content into HTML files.

### PRIORITY 2: SIMPLIFY THE CMS FOR NON-TECHNICAL USERS

#### 2a. Restructure the Products Collection
The products collection in `admin/config.yml` has 109 flat fields. Restructure it using Decap CMS `field_groups` or nested `object` widgets. BUT — this would break all 48 existing product `.md` files.

**The correct approach**: Keep the flat field structure (don't nest into objects) but:
1. Split the products collection into TWO collections:
   - "Products (Quick Edit)" — shows only: name, sku, category, price, image, description, isFeatured, inStock (8 fields)
   - "Products (Full Details)" — shows all 109 fields with section markers
2. Both collections point to the same `folder: "content/products"` and the same `.md` files
3. Non-technical users use "Quick Edit" for simple changes
4. Power users use "Full Details" for complete product management

#### 2b. Split the Homepage into Multiple Files
The homepage has 37 sections in one form. Split `content/pages/homepage.md` into:
- `content/pages/homepage-hero.md` — Hero section only
- `content/pages/homepage-products.md` — Featured products section
- `content/pages/homepage-about.md` — About/brand section
- `content/pages/homepage-b2b.md` — B2B section
- `content/pages/homepage-cta.md` — Final CTA section

Update `admin/config.yml` to create separate collection entries for each, all in the same folder.

#### 2c. Fix the CMS Preview
The CMS preview templates in `admin/previews/` render in an iframe with minimal CSS. Update them to:
1. Load the site's actual CSS (`/assets/css/styles.css`)
2. Use the same Tailwind classes as the live site
3. Show a realistic preview of how the content will look

### PRIORITY 3: FIX THE SYNC PIPELINE

#### 3a. Make the Build Script Part of the Pipeline
Update `scripts/webhook-listener.js` to run the full pipeline:
1. `git pull origin main`
2. `npm install` (in case package.json changed)
3. `node scripts/generate-index.js` (regenerate index.json)
4. `node scripts/build-html.js` (pre-render content into HTML) ← NEW
5. Report success/failure

#### 3b. Improve the Sync Status Badge
Update `admin/sync-status.js` to:
1. After the editor saves content, show a "Publishing..." spinner
2. Poll `/health` until the pipeline completes
3. Show "Live" (green) when done, "Failed" (red) with error details if it fails
4. Add a "View on Site" button that opens the live page in a new tab

#### 3c. Add Pipeline Error Notifications
If `git pull` or `generate-index.js` or `build-html.js` fails:
1. Log the error to a file (`/var/log/siyang-deploy.log`)
2. The `/health` endpoint should return the last error
3. The sync status badge should show the error message

### PRIORITY 4: ADD MISSING CONTENT PLACEHOLDERS

Since we can't get real product photos yet, create proper placeholder images:
1. Generate SVG placeholder images for products (with product name text)
2. Create a placeholder WeChat QR code image
3. Create placeholder team member avatars
4. Create placeholder blog post images
5. These should look professional, not like broken images

---

## KEY FILES AND THEIR CURRENT STATE

### Project Structure
```
public-website/
├── admin/
│   ├── config.yml          # Decap CMS config (~1400 lines, 15 collections + welcome)
│   ├── index.html          # CMS admin entry point
│   ├── cms-theme.css       # Dark theme for CMS
│   ├── sync-status.js      # Sync status badge (NEW)
│   ├── welcome.md          # Editor onboarding guide (NEW)
│   ├── previews/           # 15+ preview templates
│   └── widgets/            # 4 custom widgets
├── assets/
│   ├── css/styles.css      # Main CSS (~189 lines, CSS variables + Tailwind)
│   ├── js/
│   │   ├── cms-loader.js   # 2075 lines — THE MONSTER FILE
│   │   ├── main.js         # Site initialization
│   │   ├── site-config.js  # Company config with CMS merge (NEW)
│   │   ├── i18n.js         # 6-language support
│   │   ├── search.js       # Client-side search
│   │   ├── quote-cart.js   # B2B quote cart
│   │   ├── product-compare.js
│   │   ├── product-filters.js
│   │   ├── product-gallery.js
│   │   ├── product-selector.js
│   │   ├── premium-motion.js
│   │   └── gsap-animations.js
│   ├── translations/       # 6 language JSON files (en, zh, ar, fr, ru, es)
│   └── downloads/          # EMPTY (only .gitkeep)
├── content/
│   ├── products/           # 48 product .md files + index.json
│   ├── blog/               # 18 .md files (3 posts x 6 languages) + index.json
│   ├── pages/              # homepage.md + other pages
│   ├── settings/           # company.md, navigation.md, footer.md
│   ├── testimonials/       # 3 .md files
│   ├── team/               # 3 .md files
│   ├── certifications/     # 3 .md files
│   ├── faq/                # 7 .md files
│   ├── partners/           # 3 .md files
│   ├── distributors/       # 3 .md files
│   ├── warranty/           # 2 .md files
│   ├── safety/             # 1 .md file
│   ├── manuals/            # 1 .md file
│   ├── downloads/          # 1 .md file
│   └── case_studies/       # 3 .md files
├── images/
│   ├── istock/             # Stock placeholder images (EXISTING)
│   ├── products/           # EMPTY (.gitkeep only)
│   ├── blog/               # EMPTY
│   ├── team/               # EMPTY
│   ├── testimonials/       # EMPTY
│   ├── partners/           # EMPTY
│   ├── distributors/       # EMPTY
│   ├── certificates/       # EMPTY
│   └── case-studies/       # EMPTY
├── scripts/
│   ├── deploy.sh           # Full deployment script (rsync + nginx + gitea setup)
│   ├── nginx-siyang.conf   # Nginx config (with HSTS, gzip, CSP, 404)
│   ├── webhook-listener.js # Node.js webhook server on port 3099
│   ├── siyang-webhook.service  # systemd service file
│   ├── setup-gitea-roles.sh    # Gitea OAuth + webhook setup
│   ├── generate-index.js   # Generates index.json from .md files (uses js-yaml)
│   ├── build-index.cjs     # DEPRECATED — superseded by generate-index.js
│   ├── sync-md.cjs         # MIGRATION ONLY — writes .md from index.json
│   └── fix-encoding.js     # UTF-8 encoding fixer
├── about/                  # 14 about page HTML files
├── blogs/                  # Blog listing + post template HTML
├── products/               # Product listing + detail template HTML
├── index.html              # Homepage (820 lines)
├── contact.html            # Contact page
├── privacy.html            # Privacy policy
├── terms.html              # Terms of service
├── 404.html                # Custom 404 page (NEW)
├── robots.txt              # Fixed — uses siyang.tools
├── sitemap.xml             # Fixed — uses siyang.tools, 28 pages with hreflang
├── package.json            # js-yaml dependency
└── .gitignore
```

### Backend Configuration (admin/config.yml first 25 lines)
```yaml
backend:
  name: gitea
  repo: admin/b2b
  branch: main
  api_root: https://siyang.tools/api/v1
  base_url: https://siyang.tools
  auth_endpoint: /api/v1/auth
  site_domain: siyang.tools

publish_mode: editorial_workflow

media_folder: /images
public_folder: /images

locale: en
slug:
  encoding: unicode
  clean_accents: false
  sanitize_replacement: "-"
```

### Sample Product (content/products/SY-DD-20V-BL.md — first 50 lines)
```yaml
---
name: "20V Brushless Drill Driver"
sku: "SY-DD-20V-BL"
category: "drills-drivers"
brand: "Siyang"
price: 0
moq: 500
leadTime: "30-45 days"
isFeatured: true
inStock: true
image: "../images/istock/10001.jpg"
images:
  - "../images/istock/10001.jpg"
  - "../images/istock/10002.jpg"
  - "../images/istock/10003.jpg"
tagline: "Professional-grade 20V brushless drill driver for demanding applications"
description: |
  The SY-DD-20V-BL delivers exceptional performance with its advanced brushless motor technology...
userBenefits:
  - "50% longer runtime than brushed motors"
  - "Compact ergonomic design reduces fatigue"
  - "All-metal gear case for maximum durability"
specs:
  power: "20V"
  voltage: "20V DC"
  noLoadSpeed: "0-450 / 0-1800 RPM"
  maxTorque: "60 Nm"
  chuckCapacity: "13mm (1/2\")"
  weight: "1.8 kg"
  dimensions: "215 x 75 x 230 mm"
compliance:
  ce: true
  ul: false
  gs: true
  rohs: true
  reach: true
  other: ""
packaging: "Color box + blow mold case"
port: "Ningbo"
paymentTerms: "T/T, L/C"
supplyAbility: "50000 units/month"
relatedProducts:
  - "SY-DD-20V-CR"
  - "SY-DD-CRD-2001"
compareFields:
  - name: "Power"
    value: "20V"
  - name: "Max Torque"
    value: "60 Nm"
  - name: "Speed"
    value: "0-1800 RPM"
rating: 4.8
reviews: 156
warranty: "2 years"
---
```

### CMS Loader Architecture (assets/js/cms-loader.js)
The file is 2075 lines. Key functions:
- `loadCollectionFromMD(collection, containerSelector, renderFn)` — Fetches index.json, then each .md file, parses frontmatter, calls renderFn
- `loadHomepage()` — Loads homepage.md and updates 37+ DOM sections
- `loadProducts()` — Loads product listing page
- `loadBlogIndex()` / `loadBlogPost()` — Blog pages
- `loadCompanyInfo()` — Company settings → DOM
- `loadNavigation()` / `loadFooterFull()` — Nav and footer
- `loadTestimonials()`, `loadTeamMembers()`, `loadCertifications()`, `loadFAQ()`, etc.
- `parseFrontmatter(text)` — Uses jsYaml.load() to parse YAML frontmatter

The initialization flow (lines 2007-2075):
1. `DOMContentLoaded` event fires
2. `loadJsYaml()` loads js-yaml from CDN
3. Then calls all the load functions in sequence
4. Each load function fetches .md files via `fetch()` and updates the DOM

### Server Infrastructure
- **DigitalOcean droplet**: 165.22.250.66
- **OS**: Ubuntu (likely 22.04 or 24.04)
- **Nginx**: Serves static files, reverse-proxies Gitea (port 3000)
- **Gitea**: Runs in Docker container, repo at `admin/b2b`
- **Webhook listener**: Node.js service on port 3099 (systemd: `siyang-webhook`)
- **SSL**: Let's Encrypt/Certbot
- **Site root**: `/var/www/siyang/public/`

### Nginx Config Highlights
```nginx
server {
    listen 443 ssl http2;
    server_name siyang.tools;

    # Security headers (HSTS, CSP, X-Frame-Options, etc.)
    # Gzip compression enabled
    # error_page 404 /404.html

    location / {
        root /var/www/siyang/public;
        try_files $uri $uri/ $uri.html =404;
    }

    location /admin/ {
        # Serves CMS admin
    }

    location /api/ {
        # Proxies to Gitea
    }

    location /gitea {
        # Webhook endpoint (proxies to port 3099)
    }
}
```

---

## STEP-BY-STEP IMPLEMENTATION PLAN

### Step 1: Create `scripts/build-html.js` (SEO Pre-rendering)
This is the most critical step. Create a Node.js script that:
1. Reads all `.md` files from `content/` directories
2. Parses YAML frontmatter using `js-yaml`
3. For each HTML template page, injects the corresponding content
4. Writes the final HTML with content baked in
5. Keeps the `cms-loader.js` script tags so dynamic features still work
6. The cms-loader checks if content is already in the DOM — if yes, skip fetching

Specific files to pre-render:
- `index.html` — Inject homepage hero text, stats, featured product names, testimonial quotes, etc.
- `products/product.html` — Inject product data as `<script type="application/json" id="product-data">` that cms-loader reads first
- `blogs/post.html` — Inject blog post data as JSON
- All about pages — Inject their respective content

### Step 2: Update `cms-loader.js` to Use Pre-rendered Content
Modify the loader to:
1. Check if content already exists in the DOM (from pre-rendering)
2. If yes, use it directly — skip the `fetch()` call
3. If no, fall back to fetching .md files (for development/local use)
4. This means the page works with OR without JavaScript

### Step 3: Split Products Collection in `admin/config.yml`
Add a second "Products (Quick Edit)" collection:
```yaml
  - name: "products-quick"
    label: "Products (Quick Edit)"
    label_singular: "Product"
    folder: "content/products"
    create: false
    delete: false
    identifier_field: sku
    summary: "{{sku}} — {{name}}"
    fields:
      - {label: "Product Name", name: "name", widget: "string", required: true}
      - {label: "SKU", name: "sku", widget: "string", required: true}
      - {label: "Category", name: "category", widget: "select", required: true, options: [drills-drivers, saws, grinders, sanders, impact-tools, combo-kits]}
      - {label: "Price", name: "price", widget: "number", required: true, hint: "Enter 0 for 'Contact for Quote'"}
      - {label: "Main Photo", name: "image", widget: "image", required: true}
      - {label: "Description", name: "description", widget: "markdown", required: true}
      - {label: "Featured", name: "isFeatured", widget: "boolean", default: false}
      - {label: "In Stock", name: "inStock", widget: "boolean", default: true}
```

### Step 4: Split Homepage into Multiple Files
1. Split `content/pages/homepage.md` into 5 separate files
2. Update `admin/config.yml` pages collection to have separate entries
3. Update `cms-loader.js` `loadHomepage()` to fetch from multiple files
4. Update `scripts/build-html.js` to handle multiple homepage content files

### Step 5: Update Webhook Pipeline
Update `scripts/webhook-listener.js` to run the full pipeline:
```javascript
async function deployPipeline() {
  const steps = [
    { name: 'git-pull', cmd: 'git pull origin main' },
    { name: 'npm-install', cmd: 'npm install --production' },
    { name: 'generate-index', cmd: 'node scripts/generate-index.js' },
    { name: 'build-html', cmd: 'node scripts/build-html.js' },  // NEW
  ];
  // Run each step, log results, return success/failure
}
```

### Step 6: Improve Sync Status Badge
Update `admin/sync-status.js` to:
1. Show "Publishing..." after save
2. Poll `/health` for pipeline completion
3. Show "Live" or "Failed" with details
4. Add "View on Site" button

### Step 7: Create Placeholder Images
Create SVG placeholder images for:
1. Products: `images/products/placeholder.svg` (generic product silhouette with "Product Photo" text)
2. Team: `images/team/placeholder.svg` (person silhouette)
3. Blog: `images/blog/placeholder.svg` (article illustration)
4. WeChat QR: `assets/images/wechat-qr.png` (placeholder QR code)

### Step 8: Deploy and Verify
1. Run `npm install` on the server
2. Run `node scripts/generate-index.js`
3. Run `node scripts/build-html.js`
4. Copy updated Nginx config
5. Restart services
6. Verify with `curl` that HTML source contains actual content
7. Test CMS workflow end-to-end

---

## VERIFICATION CRITERIA

The task is COMPLETE when ALL of these are true:

1. **SEO**: `curl -s https://siyang.tools/ | grep "<h1"` returns actual hero text (not empty)
2. **SEO**: `curl -s https://siyang.tools/products/product.html?sku=SY-DD-20V-BL | grep "20V Brushless"` returns product name in HTML
3. **CMS**: A non-technical person can add/edit a product using the "Quick Edit" form (8 fields)
4. **CMS**: A non-technical person can edit the homepage hero section without scrolling through 37 sections
5. **SYNC**: After saving in CMS, the content appears on the live site within 60 seconds
6. **SYNC**: The sync status badge shows "Publishing..." → "Live" (green) after saving
7. **SYNC**: If the pipeline fails, the badge shows "Failed" with the error message
8. **IMAGES**: Product pages show placeholder images (not broken image icons)
9. **PERFORMANCE**: Lighthouse SEO score > 90 (currently would be very low due to client-side rendering)
10. **ACCESSIBILITY**: Lighthouse Accessibility score > 90

---

## IMPORTANT NOTES

- The site uses **Tailwind CSS** classes throughout all HTML files
- The site supports **6 languages** (en, zh, ar, fr, ru, es) with RTL for Arabic
- The `cms-loader.js` file is 2075 lines — be very careful when editing it
- The `admin/config.yml` is ~1400 lines — be very careful when editing it
- All product `.md` files use flat YAML frontmatter (no nested objects) — don't change this
- The Gitea Docker container is on port 3000, proxied through Nginx at `/api/`
- The webhook listener runs on port 3099 as a systemd service
- The deploy script uses rsync (Linux only) — on Windows use SCP or run from the server
- Git is installed at `C:\Program Files\Git\bin\git.exe` on the Windows machine
- SSH access: `ssh root@165.22.250.66`
- Site root on server: `/var/www/siyang/public/`

---

## WHAT NOT TO DO

- Do NOT switch to a different CMS or framework
- Do NOT add a build step that requires Webpack/Vite/Parcel (keep it simple)
- Do NOT change the Gitea backend configuration
- Do NOT modify the Nginx reverse proxy setup for Gitea
- Do NOT delete any existing content files
- Do NOT change the URL structure or routing
- Do NOT add authentication to the public website
- Do NOT remove the i18n/translation system
