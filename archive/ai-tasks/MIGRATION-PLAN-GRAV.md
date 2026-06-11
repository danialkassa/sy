# GRAV CMS MIGRATION PLAN
## Ningbo Siyang Power Tools — From Broken Decap CMS to Grav

**Date:** 2026-06-10
**Estimated time:** 4 hours
**Risk level:** LOW — content already in `.md` format, no data conversion needed

---

## RULES OF THIS MIGRATION

1. **No skipping.** Every step must be verified before moving to the next.
2. **No claiming without proving.** After each step, I show the output or explain the error.
3. **Brutal honesty.** If something doesn't work, I say so immediately.
4. **Depth over speed.** Every template, every blueprint, every route must work.
5. **Preserve all 14 JS modules.** They're standalone and functional.
6. **Preserve both CSS files.** Identical styling must be maintained.
7. **Two-pass verification.** Build → test → fix → test again.

---

## STEP 0: PRE-FLIGHT — VERIFY THE STARTING STATE

### 0.1 Verify PHP availability
```bash
php -v
```
**Required:** PHP 8.1+ with these extensions: `curl`, `dom`, `gd`, `json`, `mbstring`, `openssl`, `session`, `simplexml`, `xml`, `zip`
**What to do if missing:** Stop. Inform me which extensions are missing. Do not proceed.

### 0.2 Verify Composer availability
```bash
composer --version
```
**If missing:** Install from https://getcomposer.org

### 0.3 Verify Nginx is running
```bash
nginx -v
```
**If missing:** We'll install it during deployment.

### 0.4 Inventory what we're keeping vs discarding

| KEPT | DISCARDED |
|---|---|
| `content/**/*.md` (128 files) | `admin/` (entire Decap CMS directory) |
| `assets/css/*.css` (2 files) | `scripts/` (build pipeline, webhook listener) |
| `assets/js/*.js` (14 files) | `.ai-tasks/` (AI coordination logs) |
| `assets/translations/*.json` (6 files) | `.trae/` (spec documents) |
| `images/` (all product/category/blog images) | `.vscode/` |
| `assets/images/` (wechat-qr.png) | `supamode-scrape/` |
| `favicon.ico`, `manifest.json`, `robots.txt`, `sitemap.xml` | All `.ps1` PowerShell scripts |
| `default-og-image.png` | All `contact*.html`, `index*.html` scraped variants |
| SVG logos (4 files) | `tools/` |
| | `content/products/*.json` (Grav generates pages from .md) |
| | `content/*/index.json` (Grav uses folder structure) |
| | `package.json` (Grav uses Composer) |
| | `content/settings/` (absorbed into Grav config) |

---

## STEP 1: INSTALL GRAV

### 1.1 Create the Grav project
```bash
cd C:\Users\DanielkassaMuruts\Documents\B2B\html1-suite
mv public-website public-website-DECAP-BACKUP
composer create-project getgrav/grav public-website
```

**Verify:** `public-website/index.php` exists.
**Verify:** Running `php -S localhost:8000` in `public-website/` shows Grav default page at http://localhost:8000

### 1.2 Install Admin Plugin
```bash
cd public-website
bin/gpm install admin
```

**Verify:** http://localhost:8000/admin shows login screen.

### 1.3 Create initial admin user
```bash
bin/plugin login newuser --user=siyang-admin --password=<STRONG-PASSWORD> --email=sales@ningbosiyang.com --fullname="Ningbo Siyang Admin" --state=enabled
```

**Verify:** Can log into /admin with these credentials.

---

## STEP 2: THEME CREATION

### 2.1 Create the Siyang theme structure
Create directory structure:
```
user/themes/siyang/
├── siyang.yaml           (theme metadata + config)
├── siyang.php            (theme class, minimal)
├── blueprints.yaml        (theme options blueprint)
├── templates/
│   ├── default.html.twig  (base layout — the shared header/footer shell)
│   ├── home.html.twig     (homepage — complex multi-section layout)
│   ├── products.html.twig (product listing grid)
│   ├── product.html.twig  (single product detail)
│   ├── blog.html.twig     (blog listing)
│   ├── post.html.twig     (single blog post)
│   ├── about.html.twig    (generic about sub-page)
│   ├── team.html.twig     (team grid page)
│   ├── faq.html.twig      (FAQ accordion page)
│   ├── contact.html.twig  (contact form page)
│   ├── error.html.twig    (404 page)
│   └── partials/
│       ├── header.html.twig
│       ├── footer.html.twig
│       ├── nav.html.twig
│       ├── product-card.html.twig
│       ├── blog-card.html.twig
│       ├── testimonial-card.html.twig
│       ├── team-card.html.twig
│       └── meta.html.twig
├── blueprints/
│   ├── product.yaml
│   ├── blog_post.yaml
│   ├── team_member.yaml
│   ├── testimonial.yaml
│   ├── certification.yaml
│   ├── faq_item.yaml
│   ├── distributor.yaml
│   ├── warranty.yaml
│   ├── case_study.yaml
│   ├── partner.yaml
│   ├── safety_notice.yaml
│   ├── manual.yaml
│   ├── download.yaml
│   └── page.yaml
├── css/
│   └── (copied from assets/css/)
├── js/
│   └── (copied from assets/js/)
├── images/
│   └── (symlinked or copied from images/)
└── languages/
    ├── en.yaml
    ├── zh.yaml
    ├── ar.yaml
    ├── fr.yaml
    ├── ru.yaml
    └── es.yaml
```

### 2.2 siyang.yaml — Theme configuration
```yaml
name: Siyang
version: 1.0.0
description: Custom theme for Ningbo Siyang Power Tools B2B website
icon: wrench
author:
  name: Ningbo Siyang Team
  email: sales@ningbosiyang.com
```

---

## STEP 3: CONTENT MIGRATION — EXACT MAPPINGS

### 3.1 Product migration (48 products → 48 Grav pages)

**Source:** `content/products/SY-*.md`
**Target:** `user/pages/02.products/{category}/{sku}/product.md`

Each `.md` file gets copied and frontmatter adjusted:

**Current frontmatter (example SY-DD-20V-BL.md):**
```yaml
---
name: 20V MAX Brushless Drill/Driver
sku: SY-DD-20V-BL
category: drills-drivers
price: 0
compareAtPrice: 0
image: ../images/istock/10001.jpg
images:
  - ../images/istock/10001.jpg
brand: Ningbo Siyang Pro
...
---
```

**Becomes Grav frontmatter:**
```yaml
---
title: '20V MAX Brushless Drill/Driver'
sku: SY-DD-20V-BL
category: drills-drivers
price: 0
compare_at_price: 0
image: istock/10001.jpg
images:
  - istock/10001.jpg
  - istock/10002.jpg
brand: 'Ningbo Siyang Pro'
tagline: 'Professional-grade brushless drill driver...'
description: 'Professional-grade brushless drill driver...'
benefits:
  - 'Brushless motor delivers 57% more runtime'
  - '530 in-lbs of torque handles demanding industrial fastening'
specs:
  voltage: '20V MAX'
  motor_type: Brushless
  max_torque: '530 in-lbs (60 Nm)'
  no_load_speed_low: '0-450 RPM'
  no_load_speed_high: '0-1500 RPM'
  chuck_size: '1/2" (13mm)'
  weight_tool_only: '3.5 lbs (1.6 kg)'
  weight_with_battery: '4.2 lbs (1.9 kg)'
  overall_length: '7-5/8" (194mm)'
compliance: 'CE, ROHS, EEC'
in_stock: true
stock: 50
rating: 4
review_count: 0
featured: true
top_product: false
moq: '500 units'
lead_time: '30-45 days'
warranty: '1 year standard, 2 year brushless motor'
related:
  - SY-DD-RHT-18V
  - SY-IT-DRV-20V
  - SY-CK-6PC-20V
downloads:
  spec_sheet: '/downloads/spec-sheets/SY-DD-20V-BL.pdf'
  manual: '/downloads/manuals/SY-DD-20V-BL.pdf'
spline_scene_url: ''
ar_model_url: ''
auto_spin: true
compare_fields:
  power: ''
  voltage: '20V MAX'
  no_load_speed: '0-1500 RPM'
  disc_size: ''
  weight: '3.5 lbs'
  price_range: 'Contact for Quote'
  certifications: 'CE, ROHS, EEC'
  moq: '500 units'
taxonomy:
  category: [drills-drivers]
  brand: [Ningbo Siyang Pro]
visible: true
---
```

**CRITICAL CHANGES:**
- `name` → `title` (Grav's primary title field)
- Snake_case all multi-word keys (Grav convention)
- Remove `../images/` prefix — Grav resolves images from theme directory
- Add `taxonomy` for category/brand filtering
- Add `visible: true` (replaces `archived: false` logic)
- `compareFields` key renamed from camelCase to snake_case for consistency

**Folder structure per product:**
```
user/pages/02.products/
├── drills-drivers/
│   ├── SY-DD-20V-BL/
│   │   └── product.md
│   ├── SY-DD-RHT-18V/
│   │   └── product.md
│   └── ...
├── saws/
│   ├── SY-SW-CIR-714/
│   │   └── product.md
│   └── ...
├── grinders/
├── sanders/
├── impact-tools/
├── combo-kits/
└── products.md          (listing page — the catalog)
```

**Why this structure:** Grav routing follows folder hierarchy.
- `/products/drills-drivers` lists products in that category
- `/products/drills-drivers/SY-DD-20V-BL` shows the product detail
- The `products.md` listing page collects all child pages

### 3.2 Blog migration (3 posts × eventual multilingual)

**Source:** `content/blog/*.md` (English only)
**Target:** `user/pages/03.blog/{slug}/post.md`

**Frontmatter conversion:**
```yaml
---
title: 'The Complete Guide to B2B Power Tools Procurement'
date: '2024-12-10'
category: 'B2B Insights'
tags: [power-tools, b2b, procurement, sourcing]
author: 'Li Ming'
author_role: 'Content Team'
image: blog/10005.jpg
excerpt: 'Everything you need to know about sourcing power tools...'
read_time: 6
featured: false
taxonomy:
  category: [B2B Insights]
---
```

**Markdown body:** Kept as-is (it's the article content).

### 3.3 Team members

**Source:** `content/team/*.md` (3 files)
**Target:** `user/pages/04.about/05.team/{slug}/member.md`

```yaml
---
title: 'Chen Wei'
position: 'CEO & Founder'
department: Leadership
photo: team/chen-wei.jpg
bio: 'Over 25 years of experience in power tool manufacturing...'
order: 1
---
```

### 3.4 Testimonials

**Source:** `content/testimonials/*.md` (3 files)
**Target:** `user/pages/04.about/06.testimonials/` (or included on homepage via modular pages)

```yaml
---
title: 'Ahmed Hassan'
company: 'Gulf Tools Trading'
country: UAE
quote: "We've been importing from Siyang for 8 years..."
avatar: ''
rating: 5
order: 2
---
```

### 3.5 Certifications, FAQ, Distributors, Warranty, etc.

Each collection follows the same pattern:
- Move .md to appropriate Grav page folder
- Rename title field
- Snake_case keys
- Add taxonomy where applicable

**FAQ gets special treatment** — they become modular sub-pages under `04.about/07.faq/`:

```yaml
---
title: 'Can I visit your factory?'
category: 'Company & Factory'
order: 6
---
Answer text goes here as Markdown body.
```

Grav renders the body, and the Twig template builds the accordion from `page.children`.

### 3.6 Homepage — the most complex page

The current homepage uses 5 split `.md` files (homepage-hero.md, homepage-products.md, etc.) loaded by `cms-loader.js`. In Grav, these become **a single page with complex frontmatter**:

**Target:** `user/pages/01.home/home.md`

```yaml
---
title: 'Ningbo Siyang — Professional Power Tools Manufacturer'
template: home
hero:
  title: 'POWER YOUR CRAFT'
  subtitle: 'Professional Power Tools Since 1998'
  cta_text: 'Request Quote'
  cta_link: '/contact'
  slides:
    - image: istock/10001.jpg
    - image: istock/10013.jpg
    - image: istock/10025.jpg
stats:
  - value: '500K+'
    label: 'Customers Worldwide'
  - value: '45+'
    label: 'Countries Served'
  - value: '25+'
    label: 'Years Experience'
  - value: '99%'
    label: 'Quality Rate'
  - value: '24/7'
    label: 'Support Available'
  - value: '98%'
    label: 'On-Time Delivery'
trust_badges:
  - title: 'Warranty'
    description: 'Industry-leading warranty protection'
  - title: 'Global Shipping'
    description: 'Reliable worldwide logistics'
  - title: 'Fast Delivery'
    description: '30-45 day standard lead time'
  - title: 'Quality Assurance'
    description: 'ISO 9001:2015 certified processes'
  - title: '24/7 Support'
    description: 'Dedicated account manager'
  - title: 'Easy Returns'
    description: 'Hassle-free warranty claims'
sections:
  featured_products_heading: 'FEATURED TOOLS'
  featured_products_desc: 'Our most popular professional-grade power tools'
  category_grid_heading: 'SHOP BY CATEGORY'
  category_grid_desc: 'Find the right tool for every job'
  testimonials_heading: 'WHAT OUR CLIENTS SAY'
  case_studies_heading: 'SUCCESS STORIES'
  b2b_heading: 'BUILT FOR BUSINESS'
  b2b_description: 'Volume pricing, dedicated support, and customized solutions'
b2b_benefits:
  - title: 'Volume Pricing'
    description: 'Competitive rates for bulk and container orders'
  - title: 'Dedicated Account Manager'
    description: 'Personal support for your procurement needs'
  - title: 'Flexible Delivery'
    description: 'Custom scheduling for large orders'
  - title: 'Custom Quotes'
    description: 'Tailored pricing for your exact requirements'
  - title: 'Priority Support'
    description: '24/7 dedicated technical support line'
  - title: 'Easy Reordering'
    description: 'Streamlined procurement process'
use_cases:
  - title: 'Construction & Framing'
    description: 'Heavy-duty drills and impact tools'
  - title: 'Woodworking & Carpentry'
    description: 'Precision saws and sanders'
  - title: 'Metal Fabrication'
    description: 'Angle grinders and cutting tools'
  - title: 'Plumbing & Installation'
    description: 'Compact drills and wrenches'
  - title: 'Home Renovation'
    description: 'Versatile combo kits'
  - title: 'Maintenance & Repair'
    description: 'Reliable tools for facility upkeep'
  - title: 'Automotive'
    description: 'Impact wrenches and specialty tools'
featured_categories:
  - drills-drivers
  - saws
  - grinders
  - sanders
  - impact-tools
  - combo-kits
visible: true
---
```

### 3.7 Settings pages — absorbed into Grav config

| Old file | New location |
|---|---|
| `content/settings/company.md` | `user/config/site.yaml` under `custom.company` |
| `content/settings/footer.md` | `user/themes/siyang/siyang.yaml` under `footer` |
| `content/settings/navigation.md` | `user/themes/siyang/siyang.yaml` under `navigation` |

### 3.8 Page content migration

Each `content/pages/*.md` becomes a Grav page:

| Old file | New Grav page |
|---|---|
| `about.md` | `04.about/about.md` |
| `contact.md` | `05.contact/contact.md` |
| `privacy.md` | `06.privacy/privacy.md` |
| `terms.md` | `07.terms/terms.md` |
| `oem-odm.md` | `04.about/04.oem-odm/oem-odm.md` |
| `global.md` | `04.about/03.global/global.md` |
| `certifications.md` | `04.about/02.certifications/certifications.md` |
| `payment-terms.md` | `04.about/08.payment-terms/payment-terms.md` |
| `brochure.md` | `04.about/09.brochure/brochure.md` |
| `blog.md` | `03.blog/blog.md` |
| `products.md` | `02.products/products.md` |

---

## STEP 4: BLUEPRINT CREATION

### 4.1 Product blueprint (`user/themes/siyang/blueprints/product.yaml`)

```yaml
title: Product
'@extends':
  type: default
  context: blueprints://pages

form:
  fields:
    tabs:
      type: tabs
      active: 1
      fields:

        basic:
          type: tab
          title: Basic Info
          fields:
            header.title:
              type: text
              label: Product Name
              validate:
                required: true
            header.sku:
              type: text
              label: SKU
              validate:
                required: true
                pattern: '^SY-[A-Z]{2,3}-.+$'
                message: 'Must match pattern SY-XX-YY-ZZZ'
            header.category:
              type: select
              label: Category
              options:
                drills-drivers: 'Drills & Drivers'
                saws: Saws
                grinders: Grinders
                sanders: Sanders
                impact-tools: 'Impact Tools'
                combo-kits: 'Combo Kits'
              validate:
                required: true
            header.brand:
              type: select
              label: Brand
              options:
                'Ningbo Siyang': 'Ningbo Siyang'
                'Ningbo Siyang Pro': 'Ningbo Siyang Pro'
                'Ningbo Siyang Industrial': 'Ningbo Siyang Industrial'
                'Siyang Trade': 'Siyang Trade'
            header.tagline:
              type: textarea
              label: Tagline
            header.description:
              type: textarea
              label: Description
              validate:
                required: true
            header.benefits:
              type: list
              label: User Benefits
              fields:
                .value:
                  type: text

        pricing:
          type: tab
          title: Pricing & Stock
          fields:
            header.price:
              type: number
              label: 'Price (USD)'
              default: 0
              help: 'Enter 0 to show "Contact for Quote"'
            header.compare_at_price:
              type: number
              label: 'Compare At Price'
              default: 0
            header.in_stock:
              type: toggle
              label: 'In Stock'
              default: true
            header.stock:
              type: number
              label: 'Stock Quantity'
              default: 0
            header.moq:
              type: text
              label: 'Minimum Order Quantity'
              default: '500 units'
            header.lead_time:
              type: text
              label: 'Lead Time'
              default: '30-45 days'
            header.warranty:
              type: text
              label: Warranty
              default: '1 year standard'

        media:
          type: tab
          title: Images & 3D
          fields:
            header.image:
              type: filepicker
              label: 'Main Product Photo'
              folder: 'products/'
              preview_images: true
            header.images:
              type: list
              label: 'Additional Images'
              fields:
                .value:
                  type: filepicker
                  folder: 'products/'
            header.spline_scene_url:
              type: url
              label: '3D Viewer Scene URL (Spline)'
            header.ar_model_url:
              type: url
              label: 'AR Model URL (USDZ/GLB)'
            header.auto_spin:
              type: toggle
              label: '3D Auto-Spin'
              default: true

        specs:
          type: tab
          title: Specifications
          fields:
            header.specs.voltage:
              type: text
              label: Voltage
            header.specs.motor_type:
              type: select
              label: 'Motor Type'
              options:
                '': ''
                Brushless: Brushless
                Brushed: Brushed
                Universal: Universal
            header.specs.max_torque:
              type: text
              label: 'Max Torque'
            header.specs.no_load_speed_low:
              type: text
              label: 'No-Load Speed (Low)'
            header.specs.no_load_speed_high:
              type: text
              label: 'No-Load Speed (High)'
            header.specs.chuck_size:
              type: text
              label: 'Chuck Size'
            header.specs.weight_tool_only:
              type: text
              label: 'Weight (Tool Only)'
            header.specs.weight_with_battery:
              type: text
              label: 'Weight (With Battery)'
            header.specs.overall_length:
              type: text
              label: 'Overall Length'
            header.specs.sound_power:
              type: text
              label: 'Sound Power Level'
            header.specs.vibration_level:
              type: text
              label: 'Vibration Level'
            header.specs.battery_platform:
              type: text
              label: 'Battery Platform'
            header.specs.led_work_light:
              type: text
              label: 'LED Work Light'
            header.specs.belt_hook:
              type: text
              label: 'Belt Hook'
            header.specs.clutch_settings:
              type: text
              label: 'Clutch Settings'
            header.specs.disc_blade_diameter:
              type: text
              label: 'Disc/Blade Diameter'
            header.specs.arbor_size:
              type: text
              label: 'Arbor Size'
            header.specs.max_cutting_depth:
              type: text
              label: 'Max Cutting Depth'
            header.specs.pad_size:
              type: text
              label: 'Pad Size'
            header.specs.ipm:
              type: text
              label: 'Impacts Per Minute'
            header.specs.switch_type:
              type: text
              label: 'Switch Type'
            header.specs.aux_handle:
              type: text
              label: 'Auxiliary Handle'

        compliance:
          type: tab
          title: Compliance & Relations
          fields:
            header.compliance:
              type: text
              label: Compliance
              default: 'CE, ROHS, EEC'
            header.related:
              type: list
              label: 'Related SKUs'
              fields:
                .value:
                  type: text

        marketing:
          type: tab
          title: Marketing
          fields:
            header.rating:
              type: number
              label: 'Rating (1-5)'
              default: 4
              validate:
                min: 1
                max: 5
            header.review_count:
              type: number
              label: 'Review Count'
              default: 0
            header.featured:
              type: toggle
              label: 'Featured Product'
              default: false
            header.top_product:
              type: toggle
              label: 'Top Product'
              default: false

        settings:
          type: tab
          title: Page Settings
          fields:
            header.visible:
              type: toggle
              label: Visible
              default: true
            header.taxonomy.category:
              type: select
              label: 'Category (taxonomy)'
              options:
                drills-drivers: 'Drills & Drivers'
                saws: Saws
                grinders: Grinders
                sanders: Sanders
                impact-tools: 'Impact Tools'
                combo-kits: 'Combo Kits'
            header.taxonomy.brand:
              type: text
              label: 'Brand (taxonomy)'
```

Repeat similar blueprints for: blog_post, team_member, testimonial, certification, faq_item, distributor, warranty, case_study, partner, safety_notice, manual, download, page.

### 4.2 Blog post blueprint

```yaml
title: 'Blog Post'
'@extends':
  type: default
  context: blueprints://pages

form:
  fields:
    tabs:
      type: tabs
      active: 1
      fields:
        content:
          type: tab
          title: Content
          fields:
            header.title:
              type: text
              label: Title
              validate:
                required: true
            header.date:
              type: date
              label: 'Publish Date'
              validate:
                required: true
            header.category:
              type: select
              label: Category
              options:
                'B2B Insights': 'B2B Insights'
                'Industry Trends': 'Industry Trends'
                'Product Spotlight': 'Product Spotlight'
                'Company News': 'Company News'
                'Technical Guides': 'Technical Guides'
            header.tags:
              type: list
              label: Tags
              fields:
                .value:
                  type: text
            header.author:
              type: text
              label: Author
              default: 'Ningbo Siyang Team'
            header.author_role:
              type: text
              label: 'Author Role'
            header.image:
              type: filepicker
              label: 'Cover Image'
              folder: 'blog/'
            header.excerpt:
              type: textarea
              label: Excerpt
              validate:
                required: true
            header.read_time:
              type: number
              label: 'Reading Time (min)'
              default: 5
            header.featured:
              type: toggle
              label: Featured
              default: false
            header.visible:
              type: toggle
              label: Visible
              default: true
            header.taxonomy.category:
              type: select
              label: 'Category (taxonomy)'
              options:
                'B2B Insights': 'B2B Insights'
                'Industry Trends': 'Industry Trends'
                'Product Spotlight': 'Product Spotlight'
                'Company News': 'Company News'
                'Technical Guides': 'Technical Guides'
```

(Similar structure for team_member, testimonial, certification, faq_item, distributor, warranty, case_study, partner, safety_notice, manual, download blueprints — each with fields matching their frontmatter schema.)

---

## STEP 5: TEMPLATE CREATION (Twig)

### 5.1 Base template (`templates/default.html.twig`)

This replaces the duplicated header/footer across 258 HTML files.

```twig
{% set theme_config = theme_config() %}
{% set site = config.site %}
{% set company = site.custom.company %}

<!DOCTYPE html>
<html lang="{{ grav.language.getActive ?: 'en' }}" dir="{{ grav.language.getActive == 'ar' ? 'rtl' : 'ltr' }}">
<head>
    {% include 'partials/meta.html.twig' %}
    {% block stylesheets %}
        <link rel="stylesheet" href="{{ url('theme://css/styles.css') }}">
        <link rel="stylesheet" href="{{ url('theme://css/premium-motion.css') }}">
    {% endblock %}
</head>
<body class="bg-zinc-950 text-zinc-100 font-source antialiased">
    {% include 'partials/header.html.twig' %}

    <main>
        {% block content %}{% endblock %}
    </main>

    {% include 'partials/footer.html.twig' %}

    {% block javascripts %}
        <script src="{{ url('theme://js/site-config.js') }}"></script>
        <script src="{{ url('theme://js/i18n.js') }}"></script>
        <script src="{{ url('theme://js/main.js') }}"></script>
        <script src="{{ url('theme://js/search.js') }}"></script>
        <script src="{{ url('theme://js/quote-cart.js') }}"></script>
        <script src="{{ url('theme://js/product-selector.js') }}"></script>
        <script src="{{ url('theme://js/product-filters.js') }}"></script>
        <script src="{{ url('theme://js/product-compare.js') }}"></script>
        <script src="{{ url('theme://js/product-gallery.js') }}"></script>
    {% endblock %}
</body>
</html>
```

### 5.2 Header partial (`templates/partials/header.html.twig`)

Extract from existing index.html lines ~50-204. Replace hardcoded values with Grav config:

```twig
<header class="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <a href="{{ home_url }}" class="flex items-center gap-2">
                <img src="{{ url('theme://images/sy-logo-dark.svg') }}" alt="{{ company.name }}" class="h-8">
            </a>
            <!-- Desktop Nav -->
            <nav class="hidden lg:flex items-center gap-6">
                {% for item in theme_config.navigation.primary %}
                    {% if item.children %}
                        <div class="relative group">
                            <button class="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors">
                                {{ item.label }}
                                <svg class="w-4 h-4"><path d="M6 9l6 6 6-6"/></svg>
                            </button>
                            <div class="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                {% for child in item.children %}
                                    <a href="{{ child.url }}" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 first:rounded-t-xl last:rounded-b-xl">
                                        {{ child.label }}
                                    </a>
                                {% endfor %}
                            </div>
                        </div>
                    {% else %}
                        <a href="{{ item.url }}" class="text-sm text-zinc-400 hover:text-white transition-colors">{{ item.label }}</a>
                    {% endif %}
                {% endfor %}
            </nav>
            <!-- Actions: Search, Quote Cart, Language -->
            <div class="flex items-center gap-3">
                {% include 'partials/lang-switcher.html.twig' %}
                <button data-search-open class="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <svg class="w-5 h-5 text-zinc-400">...</svg>
                </button>
                <button onclick="quoteCart.toggle()" class="relative w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <svg class="w-5 h-5 text-zinc-400">...</svg>
                    <span id="quote-header-badge" class="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-zinc-900 text-xs font-bold rounded-full flex items-center justify-center hidden">0</span>
                </button>
            </div>
        </div>
    </div>
</header>
```

### 5.3 Homepage template (`templates/home.html.twig`)

```twig
{% extends 'default.html.twig' %}

{% block content %}
    {% set page = page.header %}

    {# HERO SECTION #}
    <section class="relative h-screen min-h-[600px] overflow-hidden">
        <div class="absolute inset-0">
            {% for slide in page.hero.slides %}
                <div class="hero-slide absolute inset-0 transition-opacity duration-1000 {% if loop.first %}opacity-100{% else %}opacity-0{% endif %}">
                    <img src="{{ url('theme://images/' ~ slide.image) }}" class="w-full h-full object-cover">
                </div>
            {% endfor %}
            <div class="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent"></div>
        </div>
        <div class="relative max-w-7xl mx-auto px-4 h-full flex items-center">
            <div class="max-w-2xl">
                <h1 class="font-oswald text-6xl md:text-8xl font-bold text-white leading-none mb-4">
                    <span id="cms-hero-title-line1">{{ page.hero.title|split(' ')|slice(0, -1)|join(' ') }}</span><br>
                    <span id="cms-hero-title-line2" class="text-yellow-400">{{ page.hero.title|split(' ')|last }}</span>
                </h1>
                <p id="cms-hero-subtitle" class="text-xl text-zinc-400 mb-8">{{ page.hero.subtitle }}</p>
                <a href="{{ page.hero.cta_link }}" class="inline-flex items-center px-8 py-4 bg-yellow-400 text-zinc-900 font-bold rounded-md hover:bg-yellow-300 transition">
                    {{ page.hero.cta_text }}
                </a>
            </div>
        </div>
        {# Hero dots/toggles #}
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {% for i in 0..(page.hero.slides|length - 1) %}
                <button onclick="goToSlide({{ i }})" class="hero-dot rounded-full transition-all {{ loop.first ? 'w-16 bg-yellow-400' : 'w-4 bg-white/40' }} h-1"></button>
            {% endfor %}
        </div>
    </section>

    {# TRUST BADGES #}
    <section class="py-16 bg-zinc-900">
        <div class="max-w-7xl mx-auto px-4">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {% for badge in page.trust_badges %}
                    <div class="text-center">
                        <h3 class="font-oswald text-lg font-bold text-white mb-1">{{ badge.title }}</h3>
                        <p class="text-sm text-zinc-400">{{ badge.description }}</p>
                    </div>
                {% endfor %}
            </div>
        </div>
    </section>

    {# FEATURED PRODUCTS — loaded from Grav collection #}
    <section class="py-20">
        <div class="max-w-7xl mx-auto px-4">
            <h2 class="font-oswald text-4xl font-bold text-white text-center mb-2">{{ page.sections.featured_products_heading|default('FEATURED TOOLS') }}</h2>
            <p class="text-zinc-400 text-center mb-12">{{ page.sections.featured_products_desc }}</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {% set featured = grav.page.collection({
                    items: {
                        '@page': '/products',
                        'filter': {'featured': true}
                    }
                }) %}
                {% for product in featured %}
                    {% include 'partials/product-card.html.twig' with {product: product} %}
                {% endfor %}
            </div>
        </div>
    </section>

    {# CATEGORY GRID #}
    <section class="py-20 bg-zinc-900">
        <div class="max-w-7xl mx-auto px-4">
            <h2 class="font-oswald text-4xl font-bold text-white text-center mb-2">{{ page.sections.category_grid_heading }}</h2>
            <p class="text-zinc-400 text-center mb-12">{{ page.sections.category_grid_desc }}</p>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {% set categories = {
                    'drills-drivers': {name: 'Drills & Drivers', icon: 'drill'},
                    'saws': {name: 'Saws', icon: 'saw'},
                    'grinders': {name: 'Grinders', icon: 'grinder'},
                    'sanders': {name: 'Sanders', icon: 'sander'},
                    'impact-tools': {name: 'Impact Tools', icon: 'impact'},
                    'combo-kits': {name: 'Combo Kits', icon: 'combo'}
                } %}
                {% for slug, cat in categories %}
                    <a href="{{ url('/products/' ~ slug) }}" class="flex flex-col items-center p-6 bg-zinc-800 rounded-xl border border-zinc-700 hover:border-yellow-400/50 transition group">
                        <span class="text-3xl mb-3">{{ cat.icon }}</span>
                        <span class="font-oswald text-sm font-bold text-white group-hover:text-yellow-400 transition">{{ cat.name }}</span>
                    </a>
                {% endfor %}
            </div>
        </div>
    </section>

    {# B2B BENEFITS #}
    <section class="py-20">
        <div class="max-w-7xl mx-auto px-4">
            <h2 class="font-oswald text-4xl font-bold text-white text-center mb-2">{{ page.b2b_heading }}</h2>
            <p class="text-zinc-400 text-center mb-12">{{ page.b2b_description }}</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {% for benefit in page.b2b_benefits %}
                    <div class="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-yellow-400/30 transition">
                        <h3 class="font-oswald text-lg font-bold text-white mb-2">{{ benefit.title }}</h3>
                        <p class="text-sm text-zinc-400">{{ benefit.description }}</p>
                    </div>
                {% endfor %}
            </div>
        </div>
    </section>

    {# STATS #}
    <section class="py-20 bg-zinc-900">
        <div class="max-w-7xl mx-auto px-4">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                {% for stat in page.stats %}
                    <div class="text-center">
                        <div class="font-oswald text-4xl font-bold text-yellow-400 mb-1">{{ stat.value }}</div>
                        <div class="text-sm text-zinc-400">{{ stat.label }}</div>
                    </div>
                {% endfor %}
            </div>
        </div>
    </section>

    {# TESTIMONIALS #}
    <section class="py-20">
        <div class="max-w-7xl mx-auto px-4">
            <h2 class="font-oswald text-4xl font-bold text-white text-center mb-12">{{ page.sections.testimonials_heading }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="cms-testimonials-grid">
                {% for testimonial in grav.page.collection({'items': {'@page': '/about/testimonials'}}) %}
                    {% include 'partials/testimonial-card.html.twig' %}
                {% endfor %}
            </div>
        </div>
    </section>

    {# CTA #}
    <section class="py-20 bg-zinc-900">
        <div class="max-w-4xl mx-auto text-center px-4">
            <h2 class="font-oswald text-4xl font-bold text-white mb-4">{{ page.sections.final_cta_heading|default('Ready to Get Started?') }}</h2>
            <p class="text-zinc-400 mb-8">{{ page.sections.final_cta_desc|default('Contact our sales team for a custom quote.') }}</p>
            <a href="/contact" class="inline-flex items-center px-8 py-4 bg-yellow-400 text-zinc-900 font-bold rounded-md hover:bg-yellow-300 transition">
                Request a Quote
            </a>
        </div>
    </section>
{% endblock %}
```

### 5.4 Product card partial (`templates/partials/product-card.html.twig`)

```twig
{% set p = product.header %}
{% set base = product.url %}
<div class="group relative bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 hover:border-yellow-400/50 transition-all duration-300 flex flex-col">
    <a href="{{ product.url }}" class="block">
        <div class="relative aspect-square bg-zinc-900 overflow-hidden shrink-0">
            <img src="{{ url('theme://images/' ~ p.image) }}" alt="{{ p.title }}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent opacity-60 group-hover:opacity-35 transition-opacity"></div>
            {% if p.featured %}
                <div class="absolute top-3 left-3"><span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Featured</span></div>
            {% endif %}
        </div>
    </a>
    <div class="p-4 flex flex-col flex-1">
        <a href="{{ product.url }}" class="block">
            <p class="text-xs text-red-400 uppercase tracking-wider mb-1 font-semibold">{{ p.brand }}</p>
            <h3 class="font-oswald font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-2 mb-1.5 leading-snug">{{ p.title }}</h3>
            <p class="text-xs text-zinc-500 mb-2.5 line-clamp-2">{{ p.tagline }}</p>
        </a>
        <div class="flex items-center gap-2 mb-3">
            {% for i in 1..5 %}
                <svg class="w-3.5 h-3.5 {{ i <= p.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600' }}" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
            {% endfor %}
            <span class="text-xs text-zinc-500">({{ p.review_count }})</span>
        </div>
        <div class="mt-auto">
            {% if p.price > 0 %}
                <span class="text-lg font-bold text-white">${{ p.price|number_format(2) }}</span>
            {% else %}
                <span class="text-sm font-semibold text-yellow-400">Request Quote</span>
            {% endif %}
        </div>
    </div>
</div>
```

### 5.5 Product detail template (`templates/product.html.twig`)

```twig
{% extends 'default.html.twig' %}

{% set p = page.header %}

{% block content %}
<section class="py-12">
    <div class="max-w-7xl mx-auto px-4">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-zinc-500 mb-8">
            <a href="/" class="hover:text-white">Home</a>
            <span>/</span>
            <a href="/products" class="hover:text-white">Products</a>
            <span>/</span>
            <a href="/products/{{ p.category }}" class="hover:text-white">{{ p.category|replace({'-': ' '})|title }}</a>
            <span>/</span>
            <span class="text-yellow-400">{{ p.title }}</span>
        </nav>

        <!-- Product Detail Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Image Gallery -->
            <div id="product-main-image">
                <div class="relative aspect-square bg-zinc-900 rounded-xl overflow-hidden">
                    <img src="{{ url('theme://images/' ~ p.image) }}" alt="{{ p.title }}" class="w-full h-full object-contain" id="gallery-main-img">
                </div>
                {% if p.images|length > 1 %}
                <div class="flex gap-2 mt-4 overflow-x-auto pb-2" id="gallery-thumbnails">
                    {% for img in p.images %}
                        <button class="w-20 h-20 rounded-lg overflow-hidden border-2 {{ loop.first ? 'border-yellow-400' : 'border-zinc-700' }} flex-shrink-0">
                            <img src="{{ url('theme://images/' ~ img) }}" class="w-full h-full object-cover">
                        </button>
                    {% endfor %}
                </div>
                {% endif %}
            </div>

            <!-- Product Info -->
            <div>
                <p class="text-xs text-red-400 uppercase tracking-wider mb-2">{{ p.brand }}</p>
                <h1 class="font-oswald text-4xl font-bold text-white mb-4">{{ p.title }}</h1>
                <p class="text-zinc-400 mb-6">{{ p.description }}</p>

                <!-- Pricing -->
                <div class="flex items-center gap-4 mb-6">
                    {% if p.price > 0 %}
                        <span class="text-3xl font-bold text-white">${{ p.price|number_format(2) }}</span>
                        {% if p.compare_at_price > p.price %}
                            <span class="text-lg text-zinc-500 line-through">${{ p.compare_at_price|number_format(2) }}</span>
                        {% endif %}
                    {% else %}
                        <span class="text-lg font-semibold text-yellow-400">Contact for Quote</span>
                    {% endif %}
                    <span class="text-sm {{ p.in_stock ? 'text-green-400' : 'text-red-400' }}">{{ p.in_stock ? '✓ In Stock' : 'Out of Stock' }}</span>
                </div>

                <!-- SKU & Trade Info -->
                <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                    <div><span class="text-xs text-zinc-500">SKU</span><p class="text-white font-medium">{{ p.sku }}</p></div>
                    <div><span class="text-xs text-zinc-500">MOQ</span><p class="text-white font-medium">{{ p.moq }}</p></div>
                    <div><span class="text-xs text-zinc-500">Lead Time</span><p class="text-white font-medium">{{ p.lead_time }}</p></div>
                    <div><span class="text-xs text-zinc-500">Warranty</span><p class="text-white font-medium">{{ p.warranty }}</p></div>
                </div>

                <!-- Add to Quote -->
                <button data-quote-add
                        data-quote-sku="{{ p.sku }}"
                        data-quote-name="{{ p.title }}"
                        data-quote-brand="{{ p.brand }}"
                        data-quote-image="{{ url('theme://images/' ~ p.image) }}"
                        class="w-full py-3 bg-yellow-400 text-zinc-900 font-bold rounded-md hover:bg-yellow-300 transition mb-4">
                    Request Quote
                </button>

                <!-- User Benefits -->
                {% if p.benefits %}
                <div class="mt-6">
                    <h3 class="font-oswald text-lg font-bold text-white mb-3">Key Benefits</h3>
                    <ul class="space-y-2">
                        {% for benefit in p.benefits %}
                            <li class="text-sm text-zinc-400 flex items-start gap-2">
                                <span class="text-yellow-400 mt-0.5">✓</span>
                                {{ benefit }}
                            </li>
                        {% endfor %}
                    </ul>
                </div>
                {% endif %}
            </div>
        </div>

        <!-- Specs Table -->
        {% if p.specs %}
        <div class="mt-16">
            <h2 class="font-oswald text-3xl font-bold text-white mb-8">Technical Specifications</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {% for key, value in p.specs %}
                    {% if value %}
                    <div class="flex justify-between p-3 bg-zinc-900 rounded border border-zinc-800">
                        <span class="text-sm text-zinc-400">{{ key|replace({'_': ' '})|title }}</span>
                        <span class="text-sm text-white font-medium">{{ value }}</span>
                    </div>
                    {% endif %}
                {% endfor %}
            </div>
        </div>
        {% endif %}

        <!-- Related Products -->
        {% if p.related %}
        <div class="mt-16">
            <h2 class="font-oswald text-3xl font-bold text-white mb-8">Related Products</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {% for sku in p.related %}
                    {% set related = grav.page.find('/products/' ~ p.category ~ '/' ~ sku) %}
                    {% if related %}
                        {% include 'partials/product-card.html.twig' with {product: related} %}
                    {% endif %}
                {% endfor %}
            </div>
        </div>
        {% endif %}
    </div>
</section>
{% endblock %}

{% block javascripts %}
    {{ parent() }}
    <script src="{{ url('theme://js/product-gallery.js') }}"></script>
{% endblock %}
```

### 5.6 Blog listing template (`templates/blog.html.twig`)

```twig
{% extends 'default.html.twig' %}

{% block content %}
<section class="py-12">
    <div class="max-w-7xl mx-auto px-4">
        <h1 class="font-oswald text-5xl font-bold text-white mb-4">{{ page.title }}</h1>
        <p class="text-zinc-400 mb-12">{{ page.header.description }}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="cms-blog-index">
            {% for post in page.children.visible %}
                {% set p = post.header %}
                <article class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-yellow-400/30 transition group">
                    <a href="{{ post.url }}" class="block">
                        <div class="aspect-[16/10] overflow-hidden">
                            {% if p.image %}
                                <img src="{{ url('theme://images/' ~ p.image) }}" alt="{{ p.title }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                            {% endif %}
                        </div>
                    </a>
                    <div class="p-5">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="px-2 py-1 text-xs font-medium rounded bg-yellow-400/10 text-yellow-400">{{ p.category }}</span>
                            <span class="text-xs text-zinc-500">{{ p.read_time }} min read</span>
                        </div>
                        <h3 class="font-oswald text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition">
                            <a href="{{ post.url }}">{{ p.title }}</a>
                        </h3>
                        <p class="text-sm text-zinc-400 mb-4 line-clamp-3">{{ p.excerpt }}</p>
                        <div class="flex items-center gap-3 text-xs text-zinc-500">
                            <span>{{ p.date|date('M d, Y') }}</span>
                            <span class="w-1 h-1 rounded-full bg-zinc-600"></span>
                            <span>By {{ p.author }}</span>
                        </div>
                    </div>
                </article>
            {% endfor %}
        </div>
    </div>
</section>
{% endblock %}
```

### 5.7 Blog post template (`templates/post.html.twig`)

```twig
{% extends 'default.html.twig' %}

{% set p = page.header %}

{% block content %}
<article class="py-12">
    <div class="max-w-3xl mx-auto px-4">
        <!-- Hero image -->
        {% if p.image %}
        <div class="aspect-[21/9] rounded-xl overflow-hidden mb-8">
            <img src="{{ url('theme://images/' ~ p.image) }}" alt="{{ p.title }}" class="w-full h-full object-cover">
        </div>
        {% endif %}

        <!-- Meta -->
        <div class="flex flex-wrap items-center gap-3 mb-4">
            <span class="px-3 py-1 text-sm font-medium rounded-full bg-yellow-400/10 text-yellow-400">{{ p.category }}</span>
            <span class="text-sm text-zinc-500">{{ p.date|date('M d, Y') }}</span>
            <span class="text-sm text-zinc-500">{{ p.read_time }} min read</span>
        </div>

        <!-- Title -->
        <h1 class="font-oswald text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{{ p.title }}</h1>

        <!-- Author -->
        <div class="flex items-center gap-3 mb-8 pb-8 border-b border-zinc-800">
            <div class="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-yellow-400">
                {{ p.author|slice(0,2)|upper }}
            </div>
            <div>
                <div class="text-sm font-medium text-white">{{ p.author }}</div>
                <div class="text-xs text-zinc-500">{{ p.author_role }}</div>
            </div>
        </div>

        <!-- Content -->
        <div class="prose prose-invert prose-yellow max-w-none">
            {{ page.content|markdown }}
        </div>
    </div>
</article>
{% endblock %}
```

---

## STEP 6: ASSET MIGRATION

### 6.1 CSS files
```bash
cp assets/css/styles.css user/themes/siyang/css/styles.css
cp assets/css/premium-motion.css user/themes/siyang/css/premium-motion.css
```

**Verify:** Both files load without 404 when viewing any page.

### 6.2 JavaScript files — needs minor modifications

**Each JS file MUST be checked for path references.** The original code uses relative paths (`../content/products/index.json`). In Grav, these become absolute paths or theme-relative paths.

**search.js — PATH FIX REQUIRED:**

Old:
```javascript
fetch(base + 'content/products/index.json')
```

New (Grav):
```javascript
fetch('/products.json')  // Grav provides collection JSON endpoints
```

Or better — we embed the product data as a `<script>` tag in the base template:
```twig
<script>
    window.__PRODUCT_DATA = {{ grav.page.collection({'items': {'@page': '/products'}})|json_encode|raw }};
</script>
```

Then `search.js` reads `window.__PRODUCT_DATA` instead of fetching JSON.

**i18n.js — PATH FIX REQUIRED:**

Old: Fetches `assets/translations/{lang}.json`
New: Fetch from `/user/themes/siyang/languages/{lang}.json` (or `/user/languages/{lang}.json`)

Better approach: Render translations server-side in Grav:
```twig
<script>
    window.__TRANSLATIONS = {
        {% for lang in ['en','zh','ar','fr','ru','es'] %}
            "{{ lang }}": {{ theme.language(lang)|json_encode|raw }}{{ not loop.last ? ',' : '' }}
        {% endfor %}
    };
</script>
```

### 6.3 JavaScript files that work as-is (no changes):
- `animations.js` — CSS class toggling, no fetch()
- `gsap-animations.js` — purely visual, no data dependencies
- `premium-motion.js` — visual only
- `scroll-animations.js` — visual only

### 6.4 JavaScript files that need minor path fixes:
- `search.js` — fetch path for product index
- `cms-loader.js` — **ENTIRE FILE REMOVED** (Grav replaces all its functionality)
- `main.js` — hero carousel stays, language selector may conflict with Grav's
- `product-selector.js` — recommendation logic is hardcoded in JS, works as-is
- `product-filters.js` — reads `data-filter-*` attributes, works as-is
- `product-compare.js` — sessionStorage-based, works as-is
- `product-gallery.js` — DOM-based, works as-is
- `quote-cart.js` — localStorage-based, works as-is

### 6.5 Image migration
```bash
cp -r images/istock user/themes/siyang/images/istock
cp -r images/unsplach user/themes/siyang/images/unsplach
cp -r images/products user/themes/siyang/images/products
cp images/blog/* user/themes/siyang/images/blog/
cp assets/images/wechat-qr.png user/themes/siyang/images/
cp *.svg user/themes/siyang/images/   # logos
cp favicon.ico user/themes/siyang/images/
cp default-og-image.png user/themes/siyang/images/
```

---

## STEP 7: MULTI-LANGUAGE SETUP

### 7.1 Configure Grav for 6 languages

`user/config/system.yaml`:
```yaml
languages:
  supported:
    - en
    - zh
    - ar
    - fr
    - ru
    - es
  default_lang: en
  translations: true
  translations_fallback: true
  session_store_active: true
  home_redirect:
    include_lang: true
    include_route: false
```

### 7.2 Convert translation JSON → Grav YAML

**Script approach:**
```bash
# For each translation file, convert JSON to Grav language YAML format
```

**Example `user/themes/siyang/languages/en.yaml`:**
```yaml
SITE:
  NAME: 'Ningbo Siyang Power Tools'
  TAGLINE: 'Professional Power Tools Since 1998'
NAV:
  HOME: Home
  PRODUCTS: Products
  ABOUT: About
  CONTACT: Contact
  REQUEST_QUOTE: 'Request Quote'
HERO:
  HEADLINE: 'POWER YOUR CRAFT'
  SUBTITLE: 'Professional Power Tools Since 1998'
  CTA: 'Request Quote'
# ... (all ~800 keys from en.json)
```

The Twig templates then use: `{{ 'NAV.HOME'|t }}` instead of `data-i18n="nav.home"`.

### 7.3 Create language switcher partial

```twig
{# templates/partials/lang-switcher.html.twig #}
{% set supported = ['en','zh','ar','fr','ru','es'] %}
{% set flags = {en: '🇺🇸', zh: '🇨🇳', ar: '🇸🇦', fr: '🇫🇷', ru: '🇷🇺', es: '🇪🇸'} %}
{% set names = {en: 'EN', zh: 'ZH', ar: 'AR', fr: 'FR', ru: 'RU', es: 'ES'} %}

<div class="relative" id="lang-selector">
    <button class="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
        <span>{{ flags[grav.language.getActive ?: 'en'] }}</span>
        <span>{{ names[grav.language.getActive ?: 'en'] }}</span>
    </button>
    <div class="absolute top-full right-0 mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl hidden dropdown-panel">
        {% for lang in supported %}
            <a href="{{ url('/') }}{{ lang != 'en' ? lang : '' }}" class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-800 {{ grav.language.getActive == lang ? 'text-yellow-400' : 'text-zinc-400' }}">
                <span>{{ flags[lang] }}</span>
                <span>{{ names[lang] }}</span>
            </a>
        {% endfor %}
    </div>
</div>
```

---

## STEP 8: NGINX CONFIGURATION

### 8.1 Updated Nginx config for Grav

```nginx
server {
    listen 443 ssl http2;
    server_name siyang.tools www.siyang.tools;

    root /var/www/siyang/public;
    index index.php index.html;

    # Grav: try PHP first, then static files
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Admin panel
    location /admin {
        try_files $uri $uri/ /admin/index.php?$query_string;
    }

    # PHP processing
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Static assets — aggressive caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to sensitive files
    location ~ /(\.git|\.htaccess|composer\.(json|lock)|vendor|user/config|user/data|user/accounts) {
        deny all;
    }

    # Grav-specific: deny access to user/data
    location ~ ^/user/(data|config|accounts)/ {
        deny all;
    }

    ssl_certificate /etc/letsencrypt/live/siyang.tools/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/siyang.tools/privkey.pem;
}
```

**Key changes from old Nginx config:**
- Removed Gitea proxy (no longer needed)
- Removed webhook proxy (no longer needed)
- Added PHP-FPM handling
- Added Grav security rules
- Kept same SSL certificates
- Kept same static asset caching

---

## STEP 9: SEO PRESERVATION

### 9.1 Copy existing SEO files
```bash
cp robots.txt user/pages/robots.txt   # or move to root
cp sitemap.xml user/pages/sitemap.xml  # Grav regenerates this via plugin
```

### 9.2 Install Sitemap plugin
```bash
bin/gpm install sitemap
```

### 9.3 Meta tags partial (`templates/partials/meta.html.twig`)

```twig
{% set p = page.header %}
<title>{% if p.title %}{{ p.title }} – {% endif %}{{ site.title|default('Ningbo Siyang') }}</title>
<meta name="description" content="{{ p.description|default('Professional power tools manufacturer since 1998. OEM/ODM, B2B wholesale.') }}">
<meta property="og:title" content="{{ p.title|default(site.title) }}">
<meta property="og:description" content="{{ p.description|default('') }}">
<meta property="og:image" content="{{ url('theme://images/default-og-image.png') }}">
<meta property="og:type" content="{% if page.template == 'product' %}product{% else %}website{% endif %}">
<meta property="og:url" content="{{ page.url(true, true) }}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{{ page.url(true, true) }}">
{% for lang in ['zh','ar','fr','ru','es'] %}
<link rel="alternate" hreflang="{{ lang }}" href="{{ page.url(true, true) }}/{{ lang }}">
{% endfor %}
<link rel="alternate" hreflang="x-default" href="{{ page.url(true, true) }}">
```

---

## STEP 10: VERIFICATION CHECKLIST

After each step, verify:

**Step 1 (Install):**
- [ ] `php -v` shows 8.1+
- [ ] Grav default page loads at localhost:8000
- [ ] `/admin` shows login

**Step 2 (Theme):**
- [ ] Theme appears in Grav admin → Themes
- [ ] Set as default, homepage shows (even if empty)

**Step 3 (Content):**
- [ ] All 48 products visible in admin → Pages
- [ ] All 3 blog posts visible
- [ ] Homepage loads with all sections
- [ ] Product detail page loads with specs
- [ ] Blog post loads with article content

**Step 4 (Blueprints):**
- [ ] Admin → Pages → Add → "Product" form appears with all tabs
- [ ] Create a test product, verify it saves

**Step 5 (Templates):**
- [ ] Homepage hero section renders
- [ ] Product cards render with correct images
- [ ] Specs table renders
- [ ] Blog cards render
- [ ] FAQ accordion works
- [ ] Contact form renders

**Step 6 (Assets):**
- [ ] `styles.css` loads (check browser DevTools → Network)
- [ ] `premium-motion.css` loads
- [ ] All JS files load without 404
- [ ] No console errors

**Step 7 (Translations):**
- [ ] Switch to Arabic → page re-renders RTL
- [ ] Switch to Chinese → nav labels change
- [ ] All 6 languages working

**Step 8 (Nginx):**
- [ ] `nginx -t` passes
- [ ] Site loads on https://siyang.tools
- [ ] Admin loads on https://siyang.tools/admin

**Step 9 (SEO):**
- [ ] View Source → meta tags present
- [ ] hreflang tags present
- [ ] canonical URL correct
- [ ] og:image resolves
- [ ] sitemap.xml accessible

---

## WHAT GETS SIMPLER (things we DELETE)

| Before (Decap CMS) | After (Grav) |
|---|---|
| Gitea server required | Nothing extra — Grav is the CMS |
| Webhook listener (3099) | Removed |
| generate-index.js (500 lines) | Removed — Grav does this natively |
| build-html.js (900 lines) | Removed — Grav renders on the fly |
| sync-status.js | Removed — no sync needed |
| Dual-lane content pipeline | Single lane — content IS live |
| 18 custom preview templates (JS) | Built-in previews from blueprints |
| 4 custom editor components | Built-in editor components |
| Admin theme CSS (50KB, 318 !important) | Grav's built-in admin UI |
| cms-loader.js (55KB, 1800 lines) | Removed entirely |
| 258 duplicated HTML files | ~15 Twig templates |
| JSON-to-MD synchronization bugs | Content IS the source of truth |
| Webhook secret management | Removed |

---

## BUDGET

| Task | Time |
|---|---|
| Step 1: Install Grav + Admin | 15 min |
| Step 2: Create theme structure | 15 min |
| Step 3: Content migration (48 products, blog, team, etc.) | 45 min |
| Step 4: Blueprint creation | 30 min |
| Step 5: Template creation (Twig) | 90 min |
| Step 6: Asset migration + JS path fixes | 30 min |
| Step 7: Multi-language | 20 min |
| Step 8: Nginx config | 10 min |
| Step 9: SEO | 10 min |
| Step 10: Verification end-to-end | 15 min |
| **TOTAL** | **~4 hours** |

---

## RISK ASSESSMENT

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Path references in image URLs break | Medium | Low | Bulk find-replace `../images/` to theme path |
| i18n.js conflicts with Grav's language system | Medium | Medium | Render translations server-side, deprecate i18n.js |
| Product JS modules reference old CMS IDs | Low | Low | IDs preserved in Twig templates (e.g., `#cms-products-grid`) |
| search.js can't find product data | Medium | Medium | Embed product JSON server-side in `<script>` tag |
| Grav routing doesn't match old URL structure | Low | Medium | Preserve URL structure via folder hierarchy (02.products, 03.blog, etc.) |
| PHP version too old on server | Low | High | Check BEFORE starting; upgrade if needed |
| Missing PHP extensions | Low | High | Check BEFORE starting; install via apt |

---

**Ready to begin Step 1. Say "go" and I start executing.**
