# NINGBO SIYANG — SURGICAL TRANSFORMATION PLAN

**Project:** Pure HTML Frontend Website + Decap CMS
**Location:** `c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website`
**Hosting:** Digital Ocean Droplet (165.22.250.66) — NOT Netlify
**CMS Backend:** Gitea (Docker) — self-hosted on same droplet
**Target Users:** Non-technical business owners (content editors)
**Date Created:** 2026-06-01
**Last Updated:** 2026-06-01 (revised after infrastructure setup)
**Estimated Effort:** 2–4 weeks

---

## MANDATORY READING

Before ANY AI starts ANY work, these two documents MUST be read and acknowledged:

1. **[.ai-tasks/RULES.md](.ai-tasks/RULES.md)** — 10 Non-Negotiable Rules (no skip, no minimal, verify before complete, test each part)
2. **[.ai-tasks/PROGRESS.md](.ai-tasks/PROGRESS.md)** — Real-Time Progress Tracker (where every AI is RIGHT NOW)

**No AI may begin work without reading both files. Violations result in work being redone.**

---

## SCOPE SUMMARY

| Metric | Count |
|--------|-------|
| Total Phases | 18 |
| Total Sub-Phases | 87 |
| New Files to Create | ~30 |
| Existing Files to Modify | ~25 |
| Languages | 6 (en, ar, zh, fr, ru, es) |
| Translation Keys | ~235 per language x 6 = ~1,410 translated strings |
| New CMS Collections | 5 |
| CMS Widgets Applied | 14 |
| Custom Preview Templates | 3 |
| Custom Editor Components | 4 |
| Custom Widgets | 2 |

---

## CURRENT PROJECT STATE

### Files Inventory

| Category | Count | Files |
|----------|-------|-------|
| Root HTML pages | 4 | index.html, contact.html, terms.html, privacy.html |
| Product pages | 8 | products/index.html + 7 category pages |
| Blog pages | 2 | blogs/index.html, blogs/post.html |
| About pages | 6 | about/index.html + 5 sub-pages |
| Admin pages | 2 | admin/index.html, admin/config.yml |
| Tool pages | 1 | tools/easing-editor.html |
| CSS files | 1 | assets/css/styles.css |
| JS files | 4 | main.js, animations.js, cms-loader.js, quote-cart.js |
| Content (blog) | 3 | content/blog/*.md |
| Content (products) | 1 | content/products/*.md |
| Content (pages) | 2 | content/pages/*.md |
| Content (settings) | 2 | content/settings/*.md |
| Index JSON | 2 | content/blog/index.json, content/products/index.json |

### Already Completed Fixes

| Fix | Status |
|-----|--------|
| Malformed .././contact.html paths (30 occurrences in 15 files) | DONE |
| Missing index.json files for CMS loader | DONE |
| quote-cart.js /api/ endpoint removed (pure HTML, uses mailto) | DONE |
| GSAP removed from index.html (conflicts with Anime.js) | DONE |
| Copyright year 2025 -> 2026 (all 19 files) | DONE |
| line-clamp-3 CSS class added | DONE |
| Cookie consent data-* attributes on about/ pages | DONE |
| Netlify Identity removed from admin/index.html | DONE |
| CMS config labels/hints made owner-friendly | DONE |
| Gitea backend configured (Docker on 165.22.250.66) | DONE |
| Preview templates registered (product + blog) | DONE |
| generate-index.js created and tested (3 blogs + 1 product) | DONE |
| DigitalOcean deploy guide created | DONE |
| OAuth app created (client_id: b44bfe8b-1633-41ee-9533-738e78b392a0) | DONE |
| admin/config.yml updated with real Gitea credentials | DONE |
| Nginx configured on droplet (proxy to Gitea) | DONE |

### Infrastructure Details

| Component | Details |
|-----------|---------|
| **Droplet IP** | 165.22.250.66 |
| **Gitea** | Docker container on port 3000 |
| **Gitea Admin** | admin / Siyang2026! |
| **Repository** | admin/site |
| **OAuth Client ID** | b44bfe8b-1633-41ee-9533-738e78b392a0 |
| **OAuth Client Secret** | gto_ckwzq6mso5ahzhwxnr5mu56xduai72oazuy6yh2c6z5zvp7u3vcq |
| **Nginx** | Proxies port 80 to Gitea port 3000 |
| **SSH** | NOT accessible from user's corporate VPN — use Console instead |
| **Website** | NOT YET DEPLOYED (files still local only) |

---

## AI TEAM ROSTER

### AI Profiles

| AI | Superpower | Weakness | Best For |
|----|-----------|----------|----------|
| **GLM 5.1** | Intimate codebase knowledge, continuity, surgical precision | Not the strongest at React from scratch | Config, HTML, multi-file coordination, project lead |
| **DeepSeek V4 Pro** | Deep reasoning, complex CSS/JS, algorithmic logic | Less context continuity across sessions | Heavy CSS, complex JS logic, RTL engineering |
| **KIMI 2.6** | Massive context window, document analysis, Chinese mastery | Less precise for surgical code edits | Large-file analysis, QA, cross-referencing |
| **Copilot (GPT 5.2 Codex)** | React/JSX, API integration, iterative IDE development | Needs full project context fed in | React-based CMS previews, custom widgets, editor components |
| **Qwen 3.6 Plus** | Best multilingual, translation accuracy, cultural nuance | Less strong at complex CSS architecture | All 6 language translations, i18n, SEO meta |

### AI Workload Distribution

| AI | Phases Assigned | Sub-Phases | % of Total Work |
|----|----------------|------------|-----------------|
| **GLM 5.1** | 1.1, 1.2, 1.3.1, 1.5, 2.1, 2.3, 2.4, 2.5, 2.6(half), 3.2, 3.6 | ~35 | 40% |
| **Qwen 3.6 Plus** | 1.3.2-1.3.6, 1.6, 2.6(half) | ~20 | 23% |
| **DeepSeek V4 Pro** | 1.4, 3.1 | ~15 | 17% |
| **Copilot (GPT 5.2 Codex)** | 2.2, 2.7, 3.3, 3.4, 3.5 | ~14 | 16% |
| **KIMI 2.6** | Advisory/QA role | ~3 | 4% |

### KIMI 2.6 — Special QA Role

| Role | What KIMI Does |
|------|---------------|
| Pre-flight Checker | Before each phase, feed KIMI the entire project. Ask: "What will break if we change X?" |
| Cross-AI Integration Validator | After each AI finishes, feed combined output to KIMI. Ask: "Find inconsistencies between these outputs" |
| Translation QA | Feed all 6 language JSON files. Ask: "Find missing keys, mismatched placeholders, or culturally inappropriate translations" |
| RTL Regression Checker | After DeepSeek finishes RTL CSS, feed all 20 HTML files + RTL CSS. Ask: "Find elements that break in RTL mode" |
| Final Pre-Launch Audit | Feed entire project before going live. Ask: "Find broken links, missing translations, or CMS config errors" |

---

## SECTION 1: UNITED NATIONS OFFICIAL LANGUAGES

The 6 UN official languages: English (en), Arabic (ar), Chinese (zh), French (fr), Russian (ru), Spanish (es)

### Phase 1.1 — i18n Infrastructure Foundation [GLM 5.1]

| Sub-Phase | Task | Files Affected |
|-----------|------|---------------|
| 1.1.1 | Create `assets/js/i18n.js` — language detection, switching, localStorage persistence, URL param handling (`?lang=zh`) | New file |
| 1.1.2 | Create `assets/translations/` directory with 6 JSON files: `en.json`, `ar.json`, `zh.json`, `fr.json`, `ru.json`, `es.json` | 6 new files |
| 1.1.3 | Define translation key structure — every visible text string on the site mapped to a key (nav items, headings, buttons, labels, footer, etc.) | Translation files |
| 1.1.4 | Add language selector component to header (dropdown with flag icons + language names) | All 20 HTML pages |
| 1.1.5 | Add `<html lang="en" dir="ltr">` dynamic attribute switching (`dir="rtl"` for Arabic) | All 20 HTML pages |

### Phase 1.2 — Translation Key Extraction [GLM 5.1]

| Sub-Phase | Task | Scope |
|-----------|------|-------|
| 1.2.1 | Extract all navigation strings (Home, Products, About Us, Contact, Customer Portal, All Products, etc.) | ~30 keys |
| 1.2.2 | Extract all homepage strings (hero headline, subtitle, stats labels, CTA buttons, section headings) | ~25 keys |
| 1.2.3 | Extract all product page strings (category names, "Add to Quote", "In Stock", "Out of Stock", "Featured", filters) | ~20 keys |
| 1.2.4 | Extract all blog strings ("Read more", "min read", "By", category names, "All Posts") | ~15 keys |
| 1.2.5 | Extract all about strings (page titles, section headings, team labels) | ~20 keys |
| 1.2.6 | Extract all contact strings (form labels, placeholders, validation errors, "Send Message") | ~25 keys |
| 1.2.7 | Extract all footer strings (column headings, trust badges, copyright, social labels) | ~15 keys |
| 1.2.8 | Extract all quote cart strings (drawer title, "Add to Quote", "Send Quote Request", "Your quote cart is empty", form labels, confirmation messages) | ~30 keys |
| 1.2.9 | Extract all cookie consent strings (title, description, "Accept All", "Decline") | ~5 keys |
| 1.2.10 | Extract all terms/privacy page content | ~50 keys per page |

### Phase 1.3 — Translation Population (6 Languages x ~235 keys)

| Sub-Phase | Task | AI Assigned | Notes |
|-----------|------|-------------|-------|
| 1.3.1 | English (en) — baseline | **GLM 5.1** | Source of truth, extract from existing HTML |
| 1.3.2 | Chinese (zh) — Simplified Chinese | **Qwen 3.6 Plus** | Native language of the company — Qwen is Alibaba-built, king of Chinese NLP |
| 1.3.3 | Arabic (ar) — Modern Standard Arabic | **Qwen 3.6 Plus** | Qwen leads SWE-bench multilingual, handles Arabic nuance |
| 1.3.4 | French (fr) — International French | **Qwen 3.6 Plus** | Francophone African market vocabulary |
| 1.3.5 | Russian (ru) — Standard Russian | **Qwen 3.6 Plus** | CIS market, Cyrillic support |
| 1.3.6 | Spanish (es) — International Spanish | **Qwen 3.6 Plus** | Latin American business Spanish |

### Phase 1.4 — RTL Support (Arabic) [DeepSeek V4 Pro]

| Sub-Phase | Task | Files Affected |
|-----------|------|---------------|
| 1.4.1 | Add RTL CSS overrides in `styles.css` — flip flex directions, margins, paddings, text-align, border-radius | styles.css |
| 1.4.2 | Add `[dir="rtl"]` selectors for navigation, dropdowns, mobile menu, quote cart drawer | styles.css |
| 1.4.3 | Fix SVG icon directions (arrows, chevrons) for RTL | All pages with inline SVGs |
| 1.4.4 | Test all 20 pages in RTL mode | QA |

### Phase 1.5 — Dynamic Content Translation [GLM 5.1]

| Sub-Phase | Task | Notes |
|-----------|------|-------|
| 1.5.1 | Update `cms-loader.js` to load language-specific `index.json` files (`content/blog/index.zh.json`, etc.) | cms-loader.js |
| 1.5.2 | Add `i18n` config to Decap CMS `config.yml` for each collection | config.yml |
| 1.5.3 | Create translated content files for existing blog posts (3 posts x 5 languages = 15 new .md files) | content/blog/ |
| 1.5.4 | Create translated content for existing product (1 product x 5 languages = 5 new .md files) | content/products/ |
| 1.5.5 | Translate `index.json` files for each language | content/*/index.{lang}.json |

### Phase 1.6 — SEO and Meta Per Language [Qwen 3.6 Plus]

| Sub-Phase | Task | Files Affected |
|-----------|------|---------------|
| 1.6.1 | Add `<link rel="alternate" hreflang="xx">` tags to all pages for all 6 languages | All 20 HTML pages |
| 1.6.2 | Translate `<title>` and `<meta name="description">` per page per language | All 20 HTML pages |
| 1.6.3 | Translate Open Graph meta tags per language | All 20 HTML pages |
| 1.6.4 | Update `sitemap.xml` with language variants | sitemap.xml |
| 1.6.5 | Create `robots.txt` language-aware rules | robots.txt |

---

## SECTION 2: SURGICAL CMS CUSTOMIZATION

### Phase 2.1 — Missing Collections [GLM 5.1]

| Sub-Phase | Task | Details |
|-----------|------|---------|
| 2.1.1 | Testimonials collection — customer quotes with name, company, quote text, avatar, rating | New folder `content/testimonials/` |
| 2.1.2 | FAQ collection — question/answer pairs with category grouping | New folder `content/faq/` |
| 2.1.3 | Team Members collection — name, role, bio, photo, social links | New folder `content/team/` |
| 2.1.4 | Certifications collection — cert name, issuer, date, badge image, PDF link | New folder `content/certifications/` |
| 2.1.5 | Partners/Distributors collection — company name, country, logo, website | New folder `content/partners/` |

### Phase 2.2 — Advanced Widget Usage [Copilot GPT 5.2 Codex]

| Sub-Phase | Task | Widget Used |
|-----------|------|-------------|
| 2.2.1 | Add Relation widget — link blog posts to products ("Related Products" field) | relation |
| 2.2.2 | Add Relation widget — link products to category pages | relation |
| 2.2.3 | Add List widget — product specifications as repeatable key-value pairs (e.g., "Voltage: 20V", "Weight: 3.5 lbs") | list + object |
| 2.2.4 | Add List widget — product image gallery (multiple images per product) | list + image |
| 2.2.5 | Add List widget — blog post tags | list (simple string) |
| 2.2.6 | Add Object widget — grouped author info (name, role, avatar) inside blog posts | object |
| 2.2.7 | Add Map widget — company location on contact page | map |
| 2.2.8 | Add Color widget — brand color picker in site settings | color |
| 2.2.9 | Add File widget — downloadable PDF brochures, spec sheets, manuals per product | file |
| 2.2.10 | Add Code widget — custom embed code field for blog posts (YouTube, etc.) | code |
| 2.2.11 | Add Number widget with validation — price as number (not string), min/max stock quantity | number |
| 2.2.12 | Add Datetime widget with format — publish date with custom format per locale | datetime |
| 2.2.13 | Add Hidden widget — auto-set layout field for blog posts | hidden |
| 2.2.14 | Add Variable Type Widgets — different fields based on product category | Variable type |

### Phase 2.3 — Collection Display and UX [GLM 5.1]

| Sub-Phase | Task | Config Used |
|-----------|------|-------------|
| 2.3.1 | Add view_filters to Products — filter by category, in stock, on sale, featured | view_filters |
| 2.3.2 | Add view_filters to Blog — filter by category, author | view_filters |
| 2.3.3 | Add view_groups to Products — group by category, brand | view_groups |
| 2.3.4 | Add sortable_fields to all collections — custom sort by title, date, price | sortable_fields |
| 2.3.5 | Add description to every collection — explains what the section is for | description |
| 2.3.6 | Add summary templates to all collections — informative list view | summary |
| 2.3.7 | Add identifier_field to Products — use "name" instead of default "title" | identifier_field |

### Phase 2.4 — Editorial Workflow and Safety [GLM 5.1]

| Sub-Phase | Task | Config Used |
|-----------|------|-------------|
| 2.4.1 | Enable editorial_workflow — Draft -> Review -> Publish | publish_mode |
| 2.4.2 | Add delete: false to Pages and Settings — prevent accidental deletion of critical config | delete |
| 2.4.3 | Add publish: false to Settings — require manual publish for site-wide changes | publish |
| 2.4.4 | Add squash_merges: true — clean commit history when publishing drafts | squash_merges |
| 2.4.5 | Add commit_messages — descriptive Git messages like "Add Product: SY-DD2001 by Li Ming" | commit_messages |
| 2.4.6 | Add field validation with pattern — SKU format, email format, URL format | pattern |
| 2.4.7 | Add required: false with sensible defaults — reduce friction for non-technical owners | required |

### Phase 2.5 — Media Management [GLM 5.1]

| Sub-Phase | Task | Config Used |
|-----------|------|-------------|
| 2.5.1 | Add per-field media_folder — product images go to `images/products/`, blog images to `images/blog/` | media_folder on widget |
| 2.5.2 | Add max_file_size — limit image uploads to 2MB for performance | max_file_size |
| 2.5.3 | Add choose_url: false — prevent external image hotlinking for consistency | choose_url |
| 2.5.4 | Add allow_multiple: false — single image for main product photo | allow_multiple |
| 2.5.5 | Organize existing images into proper subfolders | File reorganization |

### Phase 2.6 — i18n in CMS [Qwen 3.6 Plus + GLM 5.1]

| Sub-Phase | Task | AI | Config Used |
|-----------|------|----|-------------|
| 2.6.1 | Add i18n structure to config.yml | GLM 5.1 | i18n |
| 2.6.2 | Add i18n: true to each collection that needs translation | GLM 5.1 | Per-collection |
| 2.6.3 | Add i18n: true to individual fields that need translation (title, description, body) | GLM 5.1 | Per-field |
| 2.6.4 | Add i18n: false to fields that stay the same (SKU, price, image) | GLM 5.1 | Per-field |
| 2.6.5 | Verify locale-specific field naming and cultural appropriateness | Qwen 3.6 Plus | QA |

### Phase 2.7 — Advanced CMS Features [Copilot GPT 5.2 Codex]

| Sub-Phase | Task | Config Used |
|-----------|------|-------------|
| 2.7.1 | Add slug config with encoding: "unicode" — allows Chinese/Arabic/Russian filenames | slug |
| 2.7.2 | Add slug config with clean_accents: true — French accents normalized | slug |
| 2.7.3 | Add preview_path to collections — preview links point to correct pages | preview_path |
| 2.7.4 | Add extension/format — ensure all content files use consistent markdown format | extension, format |
| 2.7.5 | Add frontmatter_delimiter — explicit `---` delimiter | frontmatter_delimiter |
| 2.7.6 | Add search: true — enable full-text search across collections | search |
| 2.7.7 | Add show_preview_links: true — show/hide preview links in editorial workflow | show_preview_links |

---

## SECTION 3: CMS ADMIN MATCHES PUBLIC WEBSITE

### Phase 3.1 — Custom CMS Theme (CSS Injection) [DeepSeek V4 Pro]

| Sub-Phase | Task | Details |
|-----------|------|---------|
| 3.1.1 | Create `admin/cms-theme.css` — overrides Decap CMS default styles to match Ningbo Siyang branding | New file |
| 3.1.2 | Set background to zinc-950 (#09090b) — matches public site dark theme | CSS override |
| 3.1.3 | Set sidebar to zinc-900 (#18181b) with yellow-400 active indicators | CSS override |
| 3.1.4 | Set accent color to yellow-400 (#facc15) — buttons, links, toggles | CSS override |
| 3.1.5 | Set text colors to white/zinc-400/zinc-500 — matches public site hierarchy | CSS override |
| 3.1.6 | Set card backgrounds to zinc-800/zinc-900 with zinc-700 borders | CSS override |
| 3.1.7 | Set input fields to zinc-900 bg, zinc-700 border, yellow-400 focus ring | CSS override |
| 3.1.8 | Set toggle switches to yellow-400 when active | CSS override |
| 3.1.9 | Set typography — Oswald for headings, Source Sans 3 for body | CSS override |
| 3.1.10 | Set scrollbar styling to match public site (thin, dark, yellow thumb) | CSS override |
| 3.1.11 | Load cms-theme.css in admin/index.html | admin/index.html |

### Phase 3.2 — Custom CMS Logo and Branding [GLM 5.1]

| Sub-Phase | Task | Details |
|-----------|------|---------|
| 3.2.1 | Add custom logo to config.yml — Ningbo Siyang SVG logo on login page | logo config |
| 3.2.2 | Add logo in header — show_in_header: true so logo appears while editing | logo config |
| 3.2.3 | Add site_url — links back to public website | site_url config |
| 3.2.4 | Add display_url — "Back to Website" button in CMS header | display_url config |
| 3.2.5 | Create custom login page background — dark theme with yellow accent | CSS override |

### Phase 3.3 — Custom Preview Templates [Copilot GPT 5.2 Codex]

| Sub-Phase | Task | Details |
|-----------|------|---------|
| 3.3.1 | Create `admin/previews/product-preview.js` — renders product card exactly as it appears on the public site | New file |
| 3.3.2 | Create `admin/previews/blog-preview.js` — renders blog post with hero image, meta, author block | New file |
| 3.3.3 | Create `admin/previews/homepage-preview.js` — renders homepage section previews | New file |
| 3.3.4 | Register all preview templates in admin/index.html via `CMS.registerPreviewTemplate()` | admin/index.html |
| 3.3.5 | Load public site's styles.css in preview pane so previews are pixel-perfect | admin/index.html |

### Phase 3.4 — Custom Widgets [Copilot GPT 5.2 Codex]

| Sub-Phase | Task | Details |
|-----------|------|---------|
| 3.4.1 | Create `admin/widgets/color-swatch.js` — brand color picker with preset Ningbo Siyang colors | New file |
| 3.4.2 | Create `admin/widgets/product-card.js` — mini product card preview widget for relation fields | New file |
| 3.4.3 | Register custom widgets in admin/index.html via `CMS.registerWidget()` | admin/index.html |

### Phase 3.5 — Custom Editor Components [Copilot GPT 5.2 Codex]

| Sub-Phase | Task | Details |
|-----------|------|---------|
| 3.5.1 | Add "Product Callout" editor component — insert a product reference card inside blog posts | registerEditorComponent |
| 3.5.2 | Add "CTA Button" editor component — insert styled CTA buttons in markdown | registerEditorComponent |
| 3.5.3 | Add "Image Gallery" editor component — insert responsive image gallery | registerEditorComponent |
| 3.5.4 | Add "Quote Block" editor component — insert styled customer testimonial | registerEditorComponent |

### Phase 3.6 — CMS Page Structure (Matches Public Site) [GLM 5.1]

| Sub-Phase | Task | Details |
|-----------|------|---------|
| 3.6.1 | Reorganize CMS sidebar to mirror public site nav: Products -> Blog -> About -> Pages -> Settings | Collection order |
| 3.6.2 | Add collection icons via CSS — product icon, blog icon, gear icon for settings | CSS override |
| 3.6.3 | Add "Contact Submissions" collection — stores contact form submissions (if backend supports it) | New collection |
| 3.6.4 | Add "Homepage" as first item in sidebar — most frequently edited page | Collection order |
| 3.6.5 | Add "Quick Links" section in CMS — links to public site pages for reference | Custom widget |

---

## DEPENDENCY MAP

```
Phase 1.1 (i18n infrastructure) [GLM]
    |
    v
Phase 1.2 (extract translation keys) [GLM]
    |
    v
Phase 1.3 (populate translations) [QWEN] <-- can run in parallel for all 6 languages
    |
    +---> Phase 1.4 (RTL support) [DEEPSEEK] <-- must wait for Arabic translations
    +---> Phase 1.5 (dynamic content) [GLM] <-- must wait for 1.1 + 2.6
    +---> Phase 1.6 (SEO meta) [QWEN] <-- must wait for 1.3

Phase 2.1 (new collections) [GLM] <-- independent, can start immediately
    |
    v
Phase 2.2 (advanced widgets) [COPILOT] <-- depends on 2.1
Phase 2.3 (display/UX) [GLM] <-- depends on 2.1
Phase 2.4 (editorial workflow) [GLM] <-- independent
Phase 2.5 (media management) [GLM] <-- independent
Phase 2.6 (i18n in CMS) [QWEN + GLM] <-- depends on 1.1 + 2.1
Phase 2.7 (advanced features) [COPILOT] <-- depends on 2.1-2.6

Phase 3.1 (CMS theme CSS) [DEEPSEEK] <-- independent, can start immediately
    |
    v
Phase 3.2 (logo/branding) [GLM] <-- depends on 3.1
Phase 3.3 (preview templates) [COPILOT] <-- depends on 2.1 + 2.2
Phase 3.4 (custom widgets) [COPILOT] <-- depends on 3.1
Phase 3.5 (editor components) [COPILOT] <-- depends on 3.1
Phase 3.6 (page structure) [GLM] <-- depends on 2.1 + 3.1
```

---

## RECOMMENDED EXECUTION ORDER

| Week | Phases | AI | Focus |
|------|--------|-----|-------|
| Week 1 | 2.1 -> 2.3 -> 2.4 -> 2.5 | GLM 5.1 | CMS structure + editorial workflow |
| Week 1 | 3.1 -> 3.2 | DeepSeek + GLM | CMS visual identity |
| Week 2 | 1.1 -> 1.2 -> 1.3 | GLM + Qwen | i18n infrastructure + all 6 translations |
| Week 2 | 2.2 -> 2.7 | Copilot | Advanced widgets + CMS features |
| Week 2 | 3.3 -> 3.4 -> 3.5 -> 3.6 | Copilot + GLM | CMS previews + custom widgets |
| Week 3 | 1.4 -> 1.5 -> 1.6 | DeepSeek + GLM + Qwen | RTL + dynamic content + SEO |
| Week 3 | 2.5 -> 2.6 -> 2.7 | GLM + Qwen + Copilot | Media + i18n in CMS + advanced features |
| Week 4 | Full QA | KIMI 2.6 | Test all 6 languages x all pages x CMS x mobile |

---

## SMART AI SWITCHING SYSTEM

### How It Works

Instead of manually copying prompts between AIs, use a **Task Queue + Progress Tracker** system. Each task is a self-contained file that any AI can pick up and execute without prior context. The progress tracker shows exactly where every AI is at any moment.

### Directory Structure

```
public-website/
  .ai-tasks/
    RULES.md                     <-- 10 Non-Negotiable Rules (MANDATORY READING)
    PROGRESS.md                  <-- Real-time tracker (where every AI is RIGHT NOW)
    queue/                       <-- Pending tasks (pick up from here)
      001-glm-2.1-collections.md
      002-deepseek-3.1-cms-theme.md
      003-qwen-1.3.2-chinese.md
    done/                        <-- Completed tasks (archive here)
    handoff/                     <-- Cross-AI context files
      project-context.md         <-- Shared project state
      conventions.md             <-- Code style rules
      current-file-state.md     <-- Snapshot of key files
```

### Task File Format

Every task file follows this exact structure so any AI can execute it:

```markdown
# TASK: [phase-number] [short-title]

## Assigned AI
[AI name]

## Depends On
[list of phase numbers that must complete first, or "NONE"]

## Objective
[1-2 sentences: what this task accomplishes]

## Input Files
[list of files the AI must read to understand the context]

## Output Files
[list of files the AI must create or modify]

## Rules
- Follow conventions in .ai-tasks/handoff/conventions.md
- Do NOT modify files outside the Output Files list
- Do NOT add comments to code
- Test by running: [command if applicable]

## Acceptance Criteria
- [ ] [specific measurable outcome 1]
- [ ] [specific measurable outcome 2]
- [ ] [specific measurable outcome 3]

## Context
[Paste relevant code snippets, file contents, or references here
so the AI has everything it needs without reading the entire project]
```

### Handoff Files

These 3 files live in `.ai-tasks/handoff/` and are updated after each phase completes:

**1. `project-context.md`** — The big picture
```markdown
# Project Context
- Pure HTML frontend, no backend
- Hosted on Digital Ocean (NOT Netlify)
- CMS: Decap CMS with test-repo backend (local) / github backend (production)
- Design: Dark theme (zinc-950 bg, yellow-400 accent)
- Fonts: Oswald (headings), Source Sans 3 (body)
- Animation: Anime.js only (no GSAP)
- Quote cart: uses mailto (no /api/ endpoint)
- 20 HTML pages, 4 JS files, 1 CSS file
- Target users: non-technical business owners
```

**2. `conventions.md`** — Code style rules
```markdown
# Code Conventions
- No comments in code
- Use Tailwind utility classes in HTML
- Custom CSS goes in assets/css/styles.css
- JS uses var (not let/const) for IE compat in quote-cart.js
- CMS config uses owner-friendly labels with hint: on every field
- All paths relative (../ for parent directories)
- Copyright: (c) 2026 Ningbo Siyang Power Tools Co., Ltd.
- No backend endpoints (/api/) — pure HTML frontend
```

**3. `current-file-state.md`** — Snapshot of key files
```markdown
# Current File State
Updated after: Phase 2.1

## admin/config.yml
- Backend: test-repo
- Collections: blog, products, pages, settings
- Editorial workflow: not yet enabled

## assets/js/i18n.js
- Status: NOT YET CREATED (Phase 1.1)

## assets/translations/
- Status: NOT YET CREATED (Phase 1.1)
```

### Switching Workflow

```
Step 1: GLM 5.1 creates task file in .ai-tasks/queue/
    |  GLM 5.1 updates PROGRESS.md: sub-phase → IN_PROGRESS
    v
Step 2: User opens the task file in the assigned AI's interface
    |  (User can check PROGRESS.md anytime to see where each AI is)
    v
Step 3: Assigned AI reads the task file + handoff files + RULES.md
    |  (Every AI MUST read RULES.md before starting)
    v
Step 4: Assigned AI executes the task
    |  Assigned AI updates PROGRESS.md: sub-phase → TESTING
    v
Step 5: Assigned AI tests and verifies own work
    |  Assigned AI updates PROGRESS.md: sub-phase → REVIEW
    v
Step 6: Assigned AI writes output files to the project
    |  Assigned AI provides evidence in PROGRESS.md
    v
Step 7: GLM 5.1 verifies the output against RULES.md
    |  GLM 5.1 reads output files, runs grep checks, tests in browser
    |  GLM 5.1 updates PROGRESS.md: sub-phase → COMPLETE (or back to IN_PROGRESS)
    v
Step 8: User moves task file from queue/ to done/
    |  GLM 5.1 updates current-file-state.md
    v
Step 9: GLM 5.1 creates the next task file
    |  GLM 5.1 updates PROGRESS.md: next sub-phase → IN_PROGRESS
    v
Repeat from Step 2
```

### How to Check Where Any AI Is

Open `.ai-tasks/PROGRESS.md` at any time. The **Quick Status Dashboard** at the top shows:

| Column | What It Tells You |
|--------|-------------------|
| AI | Which AI |
| Working On | Current sub-phase (e.g., "1.4.1 RTL CSS overrides") |
| Phase | Which phase |
| Status | IDLE / IN_PROGRESS / TESTING / REVIEW / BLOCKED |
| Last Activity | When the AI last updated its status |

If an AI says "I'm done" but PROGRESS.md still shows IN_PROGRESS, it means the AI has NOT been verified yet. Only GLM 5.1 can change REVIEW → COMPLETE after verification.

### How to Switch AIs Practically

| From | To | How |
|------|----|-----|
| GLM 5.1 (Trae IDE) | DeepSeek V4 Pro | Copy task file from `.ai-tasks/queue/` and paste into DeepSeek chat. Include the handoff files content. |
| GLM 5.1 (Trae IDE) | Qwen 3.6 Plus | Copy task file + `en.json` (source translations) and paste into Qwen chat. |
| GLM 5.1 (Trae IDE) | Copilot (GPT 5.2) | Open VS Code with Copilot enabled. Open the task file. Copilot reads it inline. |
| GLM 5.1 (Trae IDE) | KIMI 2.6 | Copy task file + all relevant project files. Paste into KIMI chat. |
| Any AI | GLM 5.1 | Come back to Trae IDE. Paste the AI's output. I integrate it. |

### Shortcut: One-Command Task Creation

In Trae IDE, tell me (GLM 5.1):

> "Create task for Phase [X.Y]"

I will automatically:
1. Read the current project state
2. Generate the task file with all context baked in
3. Place it in `.ai-tasks/queue/`
4. Tell you which AI to send it to

### Shortcut: One-Command Integration

When you return with output from another AI, tell me:

> "Integrate [AI name] output for Phase [X.Y]"

I will automatically:
1. Read the output files the other AI created
2. Verify they match the project conventions
3. Check for conflicts with existing code
4. Integrate and update `current-file-state.md`
5. Move the task from `queue/` to `done/`

---

## HOSTING NOTES

- **Target:** Digital Ocean Droplet (165.22.250.66)
- **CMS Backend:** Gitea (self-hosted, running in Docker on same droplet)
- **Gitea URL:** http://165.22.250.66 (proxied via Nginx)
- **Gitea Admin:** admin / Siyang2026!
- **Repository:** admin/site (created in Gitea)
- **OAuth App:** Client ID b44bfe8b-1633-41ee-9533-738e78b392a0
- **SSH Access:** BLOCKED by user's corporate VPN — use DigitalOcean Console instead
- **No Netlify Identity:** Removed. Using Gitea OAuth for CMS authentication.
- **No GitHub:** All self-hosted on the droplet.
- **Website files:** Still local only — need to push to Gitea repo and deploy to Nginx
- **Deploy guide:** See docs/DIGITALOCEAN-DEPLOY.md
- **IMPORTANT:** Website deployment (pushing files to Gitea + serving via Nginx) should happen BEFORE or alongside Phase 2.1

---

## DECAP CMS COMPLETE FEATURE REFERENCE

### Backends

| Backend | Use Case |
|---------|----------|
| github | Digital Ocean hosting (our target) |
| gitlab | Self-hosted GitLab |
| bitbucket | Atlassian teams |
| gitea / forgejo | Lightweight self-hosted |
| azure | Enterprise Microsoft |
| git-gateway | Netlify only (NOT for us) |
| test-repo | Local testing only |

### Widgets

| Widget | UI Element | Data Type | Our Usage |
|--------|-----------|-----------|-----------|
| string | Single-line text | string | Titles, names, SKU |
| text | Multi-line textarea | string | Descriptions, summaries |
| markdown | Rich text editor | string | Blog posts, specs |
| richtext | New improved editor (Beta) | string | Future blog editing |
| number | Number input | number | Prices, quantities |
| boolean | Toggle switch | boolean | In stock, featured, on sale |
| select | Dropdown | string | Categories, brands |
| image | Image upload + picker | string (path) | Product photos, covers |
| file | File upload + picker | string (path) | PDFs, documents |
| datetime | Date/time picker | string (formatted) | Publish date |
| color | Color picker | string | Brand colors |
| code | Code editor | string | Embed codes |
| list | Repeatable items | array | Tags, specs, gallery |
| object | Grouped sub-fields | object | Author info, nested data |
| relation | Reference to collection | string | Related products |
| map | Interactive map | GeoJSON string | Company location |
| hidden | Not shown in UI | any | Auto-set values |

### Common Field Options

| Option | Purpose |
|--------|---------|
| required | false = optional field |
| hint | Helper text below field (supports bold, italic, links) |
| pattern | Regex validation + error message |
| default | Pre-filled default value |

### Editorial Workflow Stages

| Stage | Git Action | Owner Sees |
|-------|-----------|------------|
| Draft | Creates branch + PR | "Save" button |
| In Review | PR status updated | "Set status -> In Review" |
| Ready | PR status updated | "Set status -> Ready" |
| Published | PR merged, branch deleted | "Publish" button |

### Collection Display Options

| Feature | Config | Purpose |
|---------|--------|---------|
| summary | `summary: "{{title}} -- {{category}}"` | Custom list view text |
| label_singular | `label_singular: "Blog Post"` | "New Blog Post" not "New Blog Posts" |
| description | `description: "Manage your blog"` | Text below collection name |
| sortable_fields | `sortable_fields: { fields: [title, date] }` | Custom sort options |
| view_filters | `view_filters: [{ label, field, pattern }]` | Quick filter buttons |
| view_groups | `view_groups: [{ label, field }]` | Group entries by field |
| hide | `hide: true` | Hide from sidebar |
| delete | `delete: false` | Prevent deletion |
| identifier_field | `identifier_field: name` | Use different field as title |

### Commit Message Templates

```yaml
backend:
  commit_messages:
    create: "Add {{collection}}: {{slug}}"
    update: "Update {{collection}}: {{slug}}"
    delete: "Remove {{collection}}: {{slug}}"
    uploadMedia: "Upload image: {{path}}"
    deleteMedia: "Remove image: {{path}}"
```

Available tags: {{slug}}, {{path}}, {{collection}}, {{author-login}}, {{author-name}}

### i18n Configuration

```yaml
i18n:
  structure: multiple_files
  locales: ["en", "ar", "zh", "fr", "ru", "es"]
  default_locale: "en"
```

### Slug Options

```yaml
slug:
  encoding: "unicode"
  clean_accents: true
  sanitize_replacement: "_"
```

### Media Library Options

```yaml
media_library:
  max_file_size: 512000
  choose_url: false
  allow_multiple: false
  media_folder: "images/products"
```

### Custom Preview Registration

```javascript
CMS.registerPreviewTemplate("products", ProductPreview);
CMS.registerPreviewTemplate("blog", BlogPreview);
```

### Custom Widget Registration

```javascript
CMS.registerWidget("color-swatch", ColorSwatchControl, ColorSwatchPreview);
```

### Custom Editor Component Registration

```javascript
CMS.registerEditorComponent({
  id: "product-callout",
  label: "Product Callout",
  fields: [{ name: "product", label: "Product", widget: "relation", collection: "products" }],
  pattern: /^product-callout (\S+)$/,
  fromBlock: function(match) { return { product: match[1] }; },
  toBlock: function(data) { return "product-callout " + data.product; },
  toPreview: function(data) { return "<div>Product: " + data.product + "</div>"; }
});
```

---

## END OF DOCUMENT
