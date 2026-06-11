# GPT-5.3 CODEX — CMS ADVANCED, INTERACTIVE TOOLS & VISUAL

**Project:** Ningbo Siyang B2B Power Tools Platform
**Location:** `c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website`
**AI:** GPT-5.3 Codex
**Role:** CMS Advanced Features, Interactive Product Tools, Visual Enhancements
**Working alongside:** GLM 5.1 (Infrastructure + CMS Core) and Qwen 3.6-plus (Translations + SEO)

---

## YOUR DOMAIN — FILES YOU OWN

You are the ONLY AI touching these files. No other AI will modify them.

### New Files You Create
| File | Purpose |
|------|---------|
| `admin/cms-theme.css` | Dark theme CSS matching public site (zinc-950 bg, yellow-400 accent) |
| `admin/previews/product-preview.js` | Product card preview in CMS editor |
| `admin/previews/blog-preview.js` | Blog post preview in CMS editor |
| `admin/previews/homepage-preview.js` | Homepage section preview in CMS editor |
| `admin/widgets/color-swatch.js` | Brand color picker with preset Ningbo Siyang colors |
| `admin/widgets/product-card.js` | Mini product card preview widget for relation fields |
| `assets/js/product-gallery.js` | Multi-image gallery with zoom, thumbnails, lightbox |
| `assets/js/product-compare.js` | Side-by-side product comparison tool |
| `assets/js/product-selector.js` | Guided "What do you need?" product finder |
| `about/distributors.html` | Distributor/agent locator page (Makita gap) |

### Existing Files You Modify
| File | What You Change |
|------|-----------------|
| `admin/index.html` | Register preview templates, custom widgets, editor components, load cms-theme.css |
| `products/product.html` | Add image gallery, comparison link, PDF download button, user benefits section, related products |
| `assets/css/styles.css` | Add RTL overrides, gallery styles, comparison styles, selector styles, distributor page styles |
| `index.html` | Add guided product selector section (optional, after hero) |

### Files You DO NOT Touch (Other AI's Domain)
| File | Owner |
|------|-------|
| `admin/config.yml` | GLM 5.1 |
| `assets/js/i18n.js` | GLM 5.1 |
| `assets/js/search.js` | GLM 5.1 |
| `assets/js/product-filters.js` | GLM 5.1 |
| `assets/translations/*.json` | Qwen 3.6-plus (except en.json which is GLM) |
| `content/products/SY-*.json` | GLM 5.1 |
| `about/warranty.html` | GLM 5.1 |
| `about/safety.html` | GLM 5.1 |
| All HTML `<head>` meta/hreflang tags | Qwen 3.6-plus |

---

## PROJECT CONTEXT

This is a **pure HTML/CSS/JS** B2B power tools website for Ningbo Siyang, a Chinese manufacturer. No React, no framework, no backend. The site uses:
- Tailwind CSS utility classes in HTML
- Dark theme: zinc-950 background, yellow-400 accent
- Fonts: Oswald (headings), Source Sans 3 (body)
- Decap CMS with Gitea backend (self-hosted on DigitalOcean droplet 165.22.250.66)
- Product data loaded from JSON files in `content/products/`
- Blog posts loaded from markdown files in `content/blog/`

**The product detail page** (`products/product.html`) currently:
- Loads product data from JSON via `?sku=` URL parameter
- Shows: name, brand, category, description, specs table, single image
- Has: "Add to Quote" button, Quick Inquiry form
- **MISSING:** Image gallery, zoom, user benefits, related products, PDF downloads, comparison, multiple images

**The CMS admin** (`admin/index.html`) currently:
- Loads Decap CMS with basic config
- Has no custom theme (uses default white/blue Decap styling)
- Has no custom preview templates
- Has no custom widgets or editor components

---

## PHASE 1: CMS THEME — DARK BRANDING

### Task 1.1 — Create `admin/cms-theme.css`

Override Decap CMS default styles to match the Ningbo Siyang public site dark theme. This must be comprehensive — every CMS element should feel like part of the same site.

**CSS overrides needed:**

```css
/* Root / Body */
.nc-root { background: #09090b !important; color: #e4e4e7 !important; }

/* Sidebar */
.nc-sidebar { background: #18181b !important; border-right: 1px solid #27272a !important; }
.nc-sidebar .nc-sidebar-heading { color: #facc15 !important; font-family: 'Oswald', sans-serif !important; }
.nc-sidebar .nc-sidebar-link { color: #a1a1aa !important; }
.nc-sidebar .nc-sidebar-link:hover,
.nc-sidebar .nc-sidebar-link.nc-sidebar-link-active { color: #facc15 !important; background: rgba(250, 204, 21, 0.1) !important; border-left: 3px solid #facc15 !important; }

/* Top Bar */
.nc-topBar { background: #18181b !important; border-bottom: 1px solid #27272a !important; }
.nc-topBar .nc-topBar-button { color: #a1a1aa !important; }
.nc-topBar .nc-topBar-button:hover { color: #facc15 !important; }

/* Content Area */
.nc-entryEditor-container { background: #09090b !important; }
.nc-entryEditor-toolbar { background: #18181b !important; border-bottom: 1px solid #27272a !important; }

/* Cards / List Items */
.nc-collection-list-item { background: #18181b !important; border: 1px solid #27272a !important; color: #e4e4e7 !important; }
.nc-collection-list-item:hover { border-color: #facc15 !important; }

/* Form Fields */
.nc-control { background: #18181b !important; }
.nc-control label { color: #e4e4e7 !important; font-family: 'Source Sans 3', sans-serif !important; }
.nc-control input,
.nc-control textarea,
.nc-control select { background: #09090b !important; border: 1px solid #3f3f46 !important; color: #e4e4e7 !important; border-radius: 0.5rem !important; }
.nc-control input:focus,
.nc-control textarea:focus,
.nc-control select:focus { border-color: #facc15 !important; box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.2) !important; outline: none !important; }
.nc-control input::placeholder,
.nc-control textarea::placeholder { color: #52525b !important; }

/* Hint Text */
.nc-control .nc-hint { color: #71717a !important; }

/* Buttons */
.nc-button-primary { background: #facc15 !important; color: #09090b !important; font-weight: 600 !important; border-radius: 0.5rem !important; }
.nc-button-primary:hover { background: #eab308 !important; }
.nc-button-secondary { background: #27272a !important; color: #e4e4e7 !important; border: 1px solid #3f3f46 !important; border-radius: 0.5rem !important; }
.nc-button-secondary:hover { border-color: #facc15 !important; color: #facc15 !important; }

/* Toggle Switches */
.nc-toggle-input:checked + .nc-toggle-track { background: #facc15 !important; }
.nc-toggle-track { background: #3f3f46 !important; }

/* Markdown Editor */
.nc-markdown-widget { background: #09090b !important; }
.nc-markdown-widget .nc-markdown-editor { background: #09090b !important; color: #e4e4e7 !important; }
.nc-markdown-widget-toolbar { background: #18181b !important; border-bottom: 1px solid #27272a !important; }
.nc-markdown-widget-toolbar button { color: #a1a1aa !important; }
.nc-markdown-widget-toolbar button:hover { color: #facc15 !important; }
.nc-markdown-widget-toolbar button.active { color: #facc15 !important; }

/* Image Widget */
.nc-image-widget { background: #09090b !important; border: 2px dashed #3f3f46 !important; border-radius: 0.5rem !important; }
.nc-image-widget:hover { border-color: #facc15 !important; }

/* Preview Pane */
.nc-preview-pane { background: #09090b !important; }

/* Scrollbar */
::-webkit-scrollbar { width: 8px !important; }
::-webkit-scrollbar-track { background: #18181b !important; }
::-webkit-scrollbar-thumb { background: #3f3f46 !important; border-radius: 4px !important; }
::-webkit-scrollbar-thumb:hover { background: #facc15 !important; }

/* Typography */
h1, h2, h3, h4, h5, h6 { font-family: 'Oswald', sans-serif !important; color: #e4e4e7 !important; }
body, p, span, div, label { font-family: 'Source Sans 3', sans-serif !important; }

/* Login Page */
.nc-loginPage { background: #09090b !important; }
.nc-loginPage .nc-loginPage-button { background: #facc15 !important; color: #09090b !important; font-weight: 700 !important; border-radius: 0.5rem !important; font-family: 'Oswald', sans-serif !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; }

/* Editorial Workflow */
.nc-editorial-workflow .nc-editorial-workflow-card { background: #18181b !important; border: 1px solid #27272a !important; }

/* Search */
.nc-search input { background: #09090b !important; border: 1px solid #3f3f46 !important; color: #e4e4e7 !important; }

/* Filter / Sort */
.nc-filter .nc-filter-control { background: #18181b !important; border: 1px solid #27272a !important; color: #e4e4e7 !important; }
```

**Note:** The exact CSS class names above are representative. You MUST inspect the actual Decap CMS DOM to find the correct class names. Load the CMS in a browser, inspect elements, and target the actual classes used. The visual intent is what matters — dark zinc-950 background, yellow-400 accents, zinc borders, proper typography.

**Acceptance Criteria:**
- [ ] CMS sidebar is dark (zinc-900) with yellow-400 active indicators
- [ ] CMS content area is dark (zinc-950)
- [ ] All form inputs have dark backgrounds with yellow-400 focus rings
- [ ] Primary buttons are yellow-400 with dark text
- [ ] Toggle switches are yellow-400 when active
- [ ] Typography uses Oswald for headings, Source Sans 3 for body
- [ ] Login page has dark background with yellow-400 button
- [ ] Scrollbar matches public site style
- [ ] No white flashes or default blue colors remain

### Task 1.2 — Load `cms-theme.css` in `admin/index.html`

Add the stylesheet link in the `<head>` of `admin/index.html`:
```html
<link rel="stylesheet" href="./cms-theme.css"/>
```

**Acceptance Criteria:**
- [ ] CMS loads with dark theme
- [ ] No console errors from missing CSS

---

## PHASE 2: CUSTOM PREVIEW TEMPLATES

### Task 2.1 — Create `admin/previews/product-preview.js`

A React component that renders a product card exactly as it appears on the public site, inside the CMS preview pane.

**Requirements:**
1. Use `React.createElement` (no JSX — Decap CMS previews use plain React)
2. Read fields from `props.entry.getIn(['data'])`:
   - name, sku, category, brand, description, moq, leadTime, inStock, featured, image
3. Render a card matching the public site's product card style:
   - Dark background (zinc-900)
   - Yellow-400 accent for featured badge
   - Product image at top
   - Name in Oswald font
   - SKU badge
   - Category tag
   - MOQ and lead time
   - In stock / Out of stock indicator
4. If `featured` is true, show a yellow "Featured" badge
5. If `inStock` is false, show "Out of Stock" in red
6. Include the public site's `styles.css` in the preview iframe

**Acceptance Criteria:**
- [ ] Product preview matches public site product card
- [ ] Featured badge shows when toggled on
- [ ] Stock status shows correctly
- [ ] Image displays in preview
- [ ] No console errors

### Task 2.2 — Create `admin/previews/blog-preview.js`

A React component that renders a blog post preview.

**Requirements:**
1. Read fields: title, date, author, category, image, excerpt, body
2. Render:
   - Hero image at top
   - Title in Oswald font
   - Author + date + category meta line
   - Excerpt in italic
   - Body content rendered from markdown
3. Match the public site's blog post layout

**Acceptance Criteria:**
- [ ] Blog preview matches public site blog post
- [ ] Markdown body renders correctly
- [ ] Author and date display properly
- [ ] Cover image shows

### Task 2.3 — Create `admin/previews/homepage-preview.js`

A React component that renders homepage section previews.

**Requirements:**
1. Read fields: heroTitle, heroSubtitle, stat1Label, stat1Value, stat2Label, stat2Value, stat3Label, stat3Value
2. Render a simplified preview of the homepage hero with stats

**Acceptance Criteria:**
- [ ] Homepage preview shows hero text and stats
- [ ] Changes to stats reflect immediately in preview

### Task 2.4 — Register All Previews in `admin/index.html`

Add to `admin/index.html` after CMS initialization:

```html
<script src="./previews/product-preview.js"></script>
<script src="./previews/blog-preview.js"></script>
<script src="./previews/homepage-preview.js"></script>
<script>
  CMS.registerPreviewTemplate("products", ProductPreview);
  CMS.registerPreviewTemplate("blog", BlogPreview);
  CMS.registerPreviewTemplate("pages", HomepagePreview);
</script>
```

Also load the public site's CSS in the preview iframe:
```javascript
CMS.getPreviewStyles().forEach(function(link) {
  // Already loaded by default
});
// Add public site CSS
var previewStyle = document.createElement('link');
previewStyle.rel = 'stylesheet';
previewStyle.href = '/assets/css/styles.css';
document.head.appendChild(previewStyle);
```

**Acceptance Criteria:**
- [ ] All 3 preview templates are registered
- [ ] Preview pane shows styled previews (not raw markdown)
- [ ] No console errors on CMS load

---

## PHASE 3: CUSTOM WIDGETS

### Task 3.1 — Create `admin/widgets/color-swatch.js`

A brand color picker widget with preset Ningbo Siyang colors.

**Requirements:**
1. Shows a row of preset color swatches:
   - `#facc15` (Yellow 400 — primary accent)
   - `#eab308` (Yellow 500 — hover)
   - `#09090b` (Zinc 950 — background)
   - `#18181b` (Zinc 900 — surface)
   - `#27272a` (Zinc 800 — borders)
   - `#3f3f46` (Zinc 700 — input borders)
   - `#a1a1aa` (Zinc 400 — secondary text)
   - `#e4e4e7` (Zinc 200 — primary text)
   - `#ffffff` (White)
2. Clicking a swatch sets the value
3. Also has a text input for custom hex values
4. Shows the selected color as a large preview swatch

**Register:**
```javascript
CMS.registerWidget('color-swatch', ColorSwatchControl, ColorSwatchPreview);
```

**Acceptance Criteria:**
- [ ] Preset color swatches appear
- [ ] Clicking a swatch sets the value
- [ ] Custom hex input works
- [ ] Preview shows selected color

### Task 3.2 — Create `admin/widgets/product-card.js`

A mini product card preview widget for relation fields.

**Requirements:**
1. When a product is selected via a relation widget, show a mini card:
   - Product image thumbnail (50x50)
   - Product name
   - SKU
   - Category
2. If no product selected, show "Select a product"

**Register:**
```javascript
CMS.registerWidget('product-card', ProductCardControl, ProductCardPreview);
```

**Acceptance Criteria:**
- [ ] Mini card shows when product is selected
- [ ] Product details display correctly
- [ ] Empty state shows when no product selected

---

## PHASE 4: CUSTOM EDITOR COMPONENTS

### Task 4.1 — Product Callout Component

Add a "Product Callout" editor component for inserting product references in blog posts.

```javascript
CMS.registerEditorComponent({
  id: "product-callout",
  label: "Product Callout",
  fields: [
    { name: "product", label: "Product", widget: "relation", collection: "products", value_field: "sku", search_fields: ["name", "sku"], display_fields: ["name"] }
  ],
  pattern: /^product-callout (\S+)$/,
  fromBlock: function(match) { return { product: match[1] }; },
  toBlock: function(data) { return "product-callout " + data.product; },
  toPreview: function(data) { return '<div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:16px;margin:16px 0;"><strong style="color:#facc15;">Product: ' + data.product + '</strong></div>'; }
});
```

### Task 4.2 — CTA Button Component

Add a "CTA Button" editor component for inserting styled call-to-action buttons in markdown.

```javascript
CMS.registerEditorComponent({
  id: "cta-button",
  label: "CTA Button",
  fields: [
    { name: "text", label: "Button Text", widget: "string" },
    { name: "url", label: "Link URL", widget: "string" },
    { name: "style", label: "Style", widget: "select", options: ["primary", "secondary"] }
  ],
  pattern: /^cta-button (\S+) (\S+) (\S+)$/,
  fromBlock: function(match) { return { text: match[1], url: match[2], style: match[3] }; },
  toBlock: function(data) { return "cta-button " + data.text + " " + data.url + " " + (data.style || "primary"); },
  toPreview: function(data) { var bg = data.style === "secondary" ? "#27272a" : "#facc15"; var color = data.style === "secondary" ? "#e4e4e7" : "#09090b"; return '<a href="' + data.url + '" style="display:inline-block;background:' + bg + ';color:' + color + ';padding:10px 24px;border-radius:8px;font-weight:600;text-decoration:none;margin:8px 0;">' + data.text + '</a>'; }
});
```

### Task 4.3 — Image Gallery Component

Add an "Image Gallery" editor component for inserting responsive image galleries in markdown.

```javascript
CMS.registerEditorComponent({
  id: "image-gallery",
  label: "Image Gallery",
  fields: [
    { name: "images", label: "Images", widget: "list", field: { name: "image", label: "Image", widget: "image" } },
    { name: "columns", label: "Columns", widget: "number", default: 3, min: 2, max: 4 }
  ],
  pattern: /^image-gallery (.+)$/,
  fromBlock: function(match) { return { images: match[1].split(","), columns: 3 }; },
  toBlock: function(data) { return "image-gallery " + (data.images || []).join(","); },
  toPreview: function(data) { var imgs = (data.images || []); var html = '<div style="display:grid;grid-template-columns:repeat(' + (data.columns || 3) + ',1fr);gap:8px;margin:16px 0;">'; imgs.forEach(function(img) { html += '<img src="' + img + '" style="width:100%;border-radius:8px;object-fit:cover;aspect-ratio:1;" />'; }); html += '</div>'; return html; }
});
```

### Task 4.4 — Quote Block Component

Add a "Quote Block" editor component for inserting styled customer testimonials.

```javascript
CMS.registerEditorComponent({
  id: "quote-block",
  label: "Customer Quote",
  fields: [
    { name: "quote", label: "Quote Text", widget: "text" },
    { name: "name", label: "Customer Name", widget: "string" },
    { name: "company", label: "Company", widget: "string" }
  ],
  pattern: /^quote-block (.+?)\|(.+?)\|(.+)$/,
  fromBlock: function(match) { return { quote: match[1], name: match[2], company: match[3] }; },
  toBlock: function(data) { return "quote-block " + data.quote + "|" + data.name + "|" + data.company; },
  toPreview: function(data) { return '<blockquote style="border-left:3px solid #facc15;padding:16px 20px;margin:16px 0;background:#18181b;border-radius:0 8px 8px 0;"><p style="color:#e4e4e7;font-style:italic;margin:0 0 8px 0;">"' + data.quote + '"</p><cite style="color:#a1a1aa;font-style:normal;">— ' + data.name + ', ' + data.company + '</cite></blockquote>'; }
});
```

### Task 4.5 — Register All Components in `admin/index.html`

Add all editor component registrations to `admin/index.html`:
```html
<script src="./widgets/color-swatch.js"></script>
<script src="./widgets/product-card.js"></script>
<script>
  // Editor components (inline since they're small)
  // Product Callout
  // CTA Button
  // Image Gallery
  // Quote Block
</script>
```

**Acceptance Criteria:**
- [ ] All 4 editor components appear in the markdown toolbar
- [ ] Product Callout inserts a product reference
- [ ] CTA Button inserts a styled button
- [ ] Image Gallery inserts a grid of images
- [ ] Quote Block inserts a styled testimonial
- [ ] All components render correctly in preview

---

## PHASE 5: PRODUCT IMAGE GALLERY (MAKITA GAP — CRITICAL)

### Task 5.1 — Create `assets/js/product-gallery.js`

Build a multi-image gallery with zoom, thumbnails, and lightbox for the product detail page.

**Requirements:**
1. Read `images` array from product JSON data (GLM is extending all 48 products to have `images: [...]` with 3-5 entries)
2. Main image display: Large image area (400x400 on desktop, full-width on mobile)
3. Thumbnail strip: Row of small thumbnails below main image (click to switch)
4. Zoom on hover: CSS `transform: scale(2)` with `transform-origin` following mouse position
5. Lightbox: Click main image to open full-screen lightbox with:
   - Large image display
   - Left/right navigation arrows
   - Close button (X)
   - Click outside to close
   - Keyboard: Escape closes, Left/Right arrows navigate
   - Image counter: "2 of 5"
6. Swipe support on mobile: Touch swipe left/right in lightbox
7. Lazy loading: Images load as needed
8. Fallback: If only 1 image, hide thumbnail strip

**HTML structure to inject into `products/product.html`:**
```html
<div id="product-gallery" class="space-y-3">
  <div class="relative overflow-hidden rounded-lg bg-zinc-900 aspect-square cursor-zoom-in" id="gallery-main">
    <img id="gallery-main-img" src="" alt="" class="w-full h-full object-contain"/>
    <div id="gallery-zoom-lens" class="hidden absolute inset-0 pointer-events-none"></div>
  </div>
  <div id="gallery-thumbnails" class="flex gap-2 overflow-x-auto pb-2">
  </div>
</div>
<div id="gallery-lightbox" class="fixed inset-0 z-[100] bg-black/95 hidden flex items-center justify-center">
  <button id="lightbox-close" class="absolute top-4 right-4 text-white hover:text-yellow-400 z-10">
    <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
  </button>
  <button id="lightbox-prev" class="absolute left-4 text-white hover:text-yellow-400 z-10">
    <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
  </button>
  <button id="lightbox-next" class="absolute right-4 text-white hover:text-yellow-400 z-10">
    <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
  </button>
  <img id="lightbox-img" src="" alt="" class="max-w-[90vw] max-h-[85vh] object-contain"/>
  <div id="lightbox-counter" class="absolute bottom-4 left-1/2 -translate-x-1/2 text-zinc-400 text-sm"></div>
</div>
```

**Acceptance Criteria:**
- [ ] Gallery shows main image with thumbnail strip
- [ ] Clicking thumbnail switches main image
- [ ] Hover zoom works on desktop
- [ ] Clicking main image opens lightbox
- [ ] Lightbox navigation (arrows + keyboard) works
- [ ] Lightbox closes on Escape, X button, or clicking outside
- [ ] Mobile swipe works in lightbox
- [ ] Image counter shows "2 of 5"
- [ ] Single-image products hide thumbnail strip
- [ ] No console errors

### Task 5.2 — Add Gallery CSS to `assets/css/styles.css`

Add gallery-specific styles:

```css
#gallery-main:hover #gallery-main-img {
  transition: transform 0.3s ease;
}
#gallery-main.zoomed #gallery-main-img {
  transform: scale(2);
}
.gallery-thumb {
  width: 64px;
  height: 64px;
  border: 2px solid #27272a;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.2s;
}
.gallery-thumb:hover,
.gallery-thumb.active {
  border-color: #facc15;
}
.gallery-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

**Acceptance Criteria:**
- [ ] Gallery styles match the dark theme
- [ ] Active thumbnail has yellow border
- [ ] Zoom transition is smooth

---

## PHASE 6: PRODUCT COMPARISON TOOL (MAKITA GAP)

### Task 6.1 — Create `assets/js/product-compare.js`

Build a side-by-side product comparison tool.

**Requirements:**
1. "Compare" checkbox on each product card (in category pages and product detail page)
2. Maximum 3 products can be selected for comparison
3. When 2+ products are selected, a floating "Compare (N)" button appears at bottom
4. Clicking "Compare" opens a full-screen overlay with:
   - Side-by-side columns (2 or 3)
   - Each column shows: product image, name, SKU, brand, category
   - Specs table: rows for each spec key, columns for each product
   - Highlight differences: cells with different values get a subtle yellow background
   - User benefits comparison: bullet points side by side
   - MOQ and lead time comparison
   - "Remove" button on each column
5. Comparison state persists in `localStorage` key `ns-compare`
6. Clear all: "Clear Comparison" button

**HTML overlay structure:**
```html
<div id="compare-overlay" class="fixed inset-0 z-[100] bg-zinc-950/98 hidden overflow-y-auto">
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="font-oswald text-2xl font-bold text-white">Product Comparison</h2>
      <div class="flex gap-3">
        <button id="compare-clear" class="text-sm text-zinc-400 hover:text-yellow-400">Clear All</button>
        <button id="compare-close" class="text-zinc-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
    <div id="compare-content" class="overflow-x-auto">
    </div>
  </div>
</div>
```

**Floating compare button:**
```html
<div id="compare-fab" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden">
  <button class="flex items-center gap-2 bg-yellow-400 text-zinc-950 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-yellow-500 transition-colors">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6 0V9a2 2 0 012-2h2a2 2 0 012 2v10m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4"/></svg>
    Compare (<span id="compare-count">0</span>)
  </button>
</div>
```

**Comparison table rendering logic:**
1. Load product JSON for each selected SKU
2. Collect all unique spec keys across products
3. For each spec key: show row with values for each product
4. If values differ across products, highlight the row with `bg-yellow-400/10`
5. Show user benefits as bullet lists in each column

**Acceptance Criteria:**
- [ ] "Compare" checkbox appears on product cards
- [ ] Maximum 3 products can be selected
- [ ] Floating button appears when 2+ products selected
- [ ] Comparison overlay shows side-by-side specs
- [ ] Different spec values are highlighted
- [ ] Products can be removed from comparison
- [ ] "Clear All" removes all products
- [ ] Comparison state persists in localStorage
- [ ] Works on mobile (horizontal scroll for table)

### Task 6.2 — Add Comparison CSS to `assets/css/styles.css`

```css
.compare-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #3f3f46;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}
.compare-checkbox:checked {
  background: #facc15;
  border-color: #facc15;
}
.compare-checkbox:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #09090b;
  font-size: 12px;
  font-weight: bold;
}
.compare-table td.highlight {
  background: rgba(250, 204, 21, 0.1);
}
```

**Acceptance Criteria:**
- [ ] Custom checkbox styling matches dark theme
- [ ] Highlighted cells have subtle yellow background
- [ ] Comparison table is readable on mobile

---

## PHASE 7: GUIDED PRODUCT SELECTOR (MAKITA GAP)

### Task 7.1 — Create `assets/js/product-selector.js`

Build a guided "What do you need to do?" product finder tool.

**Requirements:**
1. Multi-step wizard interface:
   - Step 1: "What type of work?" — Options: Drilling, Cutting, Grinding, Sanding, Fastening, Multiple (combo)
   - Step 2: "Power source?" — Options: Cordless (20V MAX), Corded, No preference
   - Step 3: "Application?" — Options vary by Step 1 selection:
     - Drilling: Wood, Metal, Concrete/Masonry, General Purpose
     - Cutting: Wood, Metal, Tile, Multi-material
     - Grinding: Metal, Stone/Concrete, Sharpening, Surface Prep
     - Sanding: Wood Finishing, Paint Removal, Detail Work, Large Surfaces
     - Fastening: Light Duty, Heavy Duty, Automotive, Construction
     - Combo: Home DIY, Professional, Industrial
   - Step 4: Results — Show top 3 recommended products with "Why this tool?" explanation
2. Each step has Back/Next buttons
3. Progress indicator: "Step 1 of 3"
4. Results link to product detail pages
5. "Start Over" button on results page
6. Mobile responsive: full-screen on mobile

**HTML structure (inject into index.html as a section):**
```html
<section id="product-selector" class="py-20 bg-zinc-900/50">
  <div class="container mx-auto px-4 max-w-3xl">
    <h2 class="font-oswald text-3xl font-bold text-white text-center mb-4">Find the Right Tool</h2>
    <p class="text-zinc-400 text-center mb-8">Tell us what you need and we'll recommend the best tool for the job.</p>
    <div id="selector-wizard" class="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
      <div id="selector-progress" class="flex items-center justify-center gap-2 mb-8">
        <div class="selector-step active" data-step="1">1</div>
        <div class="selector-line"></div>
        <div class="selector-step" data-step="2">2</div>
        <div class="selector-line"></div>
        <div class="selector-step" data-step="3">3</div>
      </div>
      <div id="selector-content">
      </div>
      <div id="selector-nav" class="flex justify-between mt-8">
        <button id="selector-back" class="text-zinc-400 hover:text-yellow-400 transition-colors hidden">Back</button>
        <button id="selector-next" class="bg-yellow-400 text-zinc-950 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors ml-auto">Next</button>
      </div>
    </div>
  </div>
</section>
```

**Product recommendation logic:**
1. Map each combination of (work type, power source, application) to a list of product SKUs
2. Build a recommendation map in JavaScript:
```javascript
var RECOMMENDATIONS = {
  "drilling-cordless-wood": { skus: ["SY-DD-20V-BL", "SY-DD-RHT-18V"], reason: "High-speed cordless drills with multiple clutch settings for precise wood drilling." },
  "drilling-cordless-metal": { skus: ["SY-DD-20V-BL", "SY-DD-RH-DEM"], reason: "Brushless motor delivers consistent torque for metal drilling applications." },
  // ... etc for all combinations
};
```
3. If no exact match, fall back to category-based recommendations

**Acceptance Criteria:**
- [ ] 3-step wizard renders correctly
- [ ] Each step shows relevant options
- [ ] Step 3 options change based on Step 1 selection
- [ ] Results show 3 recommended products
- [ ] "Why this tool?" explanation appears
- [ ] Results link to product detail pages
- [ ] Back/Next navigation works
- [ ] "Start Over" resets the wizard
- [ ] Works on mobile

### Task 7.2 — Add Selector CSS to `assets/css/styles.css`

```css
.selector-step {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  background: #27272a;
  color: #71717a;
  transition: all 0.3s;
}
.selector-step.active {
  background: #facc15;
  color: #09090b;
}
.selector-step.completed {
  background: #22c55e;
  color: white;
}
.selector-line {
  width: 60px;
  height: 2px;
  background: #27272a;
}
.selector-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #27272a;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.selector-option:hover {
  border-color: #facc15;
  background: rgba(250, 204, 21, 0.05);
}
.selector-option.selected {
  border-color: #facc15;
  background: rgba(250, 204, 21, 0.1);
}
```

**Acceptance Criteria:**
- [ ] Step indicators show progress
- [ ] Options have hover and selected states
- [ ] Visual feedback is clear

---

## PHASE 8: PRODUCT DETAIL PAGE ENHANCEMENT

### Task 8.1 — Enhance `products/product.html`

Add the following sections to the product detail page. These are Makita-gap features.

**1. Replace single image with gallery:**
- Remove the current single `<img>` element
- Add the gallery HTML structure (from Phase 5)
- Add `<script src="../assets/js/product-gallery.js"></script>`
- Initialize gallery after product data loads

**2. Add User Benefits section (after description):**
```html
<div id="product-benefits" class="mt-6">
  <h3 class="font-oswald text-lg font-semibold text-white mb-3">Why Choose This Tool</h3>
  <ul id="benefits-list" class="space-y-2">
  </ul>
</div>
```
- Populate from `product.userBenefits` array
- Each benefit as a `<li>` with a checkmark icon

**3. Add PDF Downloads section (after specs table):**
```html
<div id="product-downloads" class="mt-6 bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 hidden">
  <h3 class="font-oswald text-lg font-semibold text-white mb-3">Downloads</h3>
  <div class="space-y-2" id="downloads-list">
  </div>
</div>
```
- Show only if `product.downloads.specSheet` or `product.downloads.manual` exists
- Each download as a link with PDF icon

**4. Add Related Products section (after quick inquiry):**
```html
<div id="related-products" class="mt-10">
  <h3 class="font-oswald text-xl font-semibold text-white mb-4">Related Products</h3>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="related-grid">
  </div>
</div>
```
- Load related products from `product.relatedProducts` array
- Show mini product cards with image, name, SKU, link

**5. Add Compare checkbox (in the product header area):**
```html
<label class="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
  <input type="checkbox" class="compare-checkbox" data-compare-sku=""/>
  <span>Add to comparison</span>
</label>
```

**6. Add Compliance badges (below specs):**
```html
<div id="product-compliance" class="mt-4 flex flex-wrap gap-2">
</div>
```
- Show CE, RoHS, GS, UL, EEC badges based on `product.compliance` object
- Each badge: small pill with icon + text

**Acceptance Criteria:**
- [ ] Gallery replaces single image
- [ ] User Benefits section shows 4-6 benefits
- [ ] PDF Downloads section shows when downloads exist
- [ ] Related Products section shows 2-3 products
- [ ] Compare checkbox is present
- [ ] Compliance badges show correctly
- [ ] All sections are responsive on mobile

---

## PHASE 9: RTL SUPPORT (ARABIC)

### Task 9.1 — Add RTL CSS Overrides to `assets/css/styles.css`

Add comprehensive RTL overrides for Arabic language support.

```css
[dir="rtl"] {
  text-align: right;
}

[dir="rtl"] .flex-row { flex-direction: row-reverse; }
[dir="rtl"] .text-left { text-align: right; }
[dir="rtl"] .text-right { text-align: left; }
[dir="rtl"] .ml-auto { margin-left: 0; margin-right: auto; }
[dir="rtl"] .mr-auto { margin-right: 0; margin-left: auto; }
[dir="rtl"] .pl-4 { padding-left: 0; padding-right: 1rem; }
[dir="rtl"] .pr-4 { padding-right: 0; padding-left: 1rem; }
[dir="rtl"] .border-l { border-left: 0; border-right: 1px solid; }
[dir="rtl"] .border-r { border-right: 0; border-left: 1px solid; }
[dir="rtl"] .rounded-l-lg { border-radius: 0 0.5rem 0.5rem 0; }
[dir="rtl"] .rounded-r-lg { border-radius: 0.5rem 0 0 0.5rem; }
[dir="rtl"] .rotate-45 { transform: rotate(-45deg); }
[dir="rtl"] .-rotate-90 { transform: rotate(90deg); }
[dir="rtl"] .right-0 { right: auto; left: 0; }
[dir="rtl"] .left-0 { left: auto; right: 0; }
[dir="rtl"] .left-1\/2 { left: auto; right: 50%; }
[dir="rtl"] .-translate-x-1\/2 { transform: translateX(50%); }

[dir="rtl"] .dropdown-panel {
  left: auto;
  right: 0;
}

[dir="rtl"] nav svg path[d^="m6 9"] {
  transform: scaleX(-1);
}

[dir="rtl"] .quote-cart-drawer {
  right: auto;
  left: 0;
  transform: translateX(-100%);
}

[dir="rtl"] .quote-cart-drawer.open {
  transform: translateX(0);
}

[dir="rtl"] #messaging-fab {
  right: auto;
  left: 1.5rem;
}

[dir="rtl"] #messaging-fab .fab-options {
  right: auto;
  left: 0;
}
```

**Test these specific elements in RTL:**
- Navigation dropdown alignment
- Quote cart drawer (opens from left instead of right)
- Messaging FAB (positioned on left)
- Product card layout
- Footer columns
- Form labels and inputs
- Breadcrumbs

**Acceptance Criteria:**
- [ ] All text is right-aligned in RTL mode
- [ ] Navigation dropdowns open from correct side
- [ ] Quote cart opens from left in RTL
- [ ] Messaging FAB is on left side in RTL
- [ ] Form labels are on the right in RTL
- [ ] No layout breaks in RTL mode
- [ ] SVG arrows/chevrons are flipped in RTL

---

## PHASE 10: DISTRIBUTOR LOCATOR PAGE (MAKITA GAP)

### Task 10.1 — Create `about/distributors.html`

A page showing Ningbo Siyang's distributor/agent network.

**Page structure:**
1. Hero section: "Global Distribution Network" with subtitle
2. Region filter: Buttons for Asia-Pacific, Europe, North America, Middle East, Africa, South America, All
3. Distributor cards: Grid of cards showing:
   - Company logo (if available)
   - Company name
   - Country (with flag emoji)
   - Contact person
   - Email (mailto link)
   - Phone (tel link)
   - Website (external link)
   - Address
4. "Become a Distributor" CTA section with mailto link

**Data source:** Load from `content/distributors/` markdown files (GLM is creating the CMS collection). For now, create the page with 6 sample distributor entries hardcoded (will be replaced by CMS data later).

**Sample distributors:**
1. Al Sayer Trading Co. — Kuwait — Middle East
2. Euro Tools GmbH — Germany — Europe
3. Pacific Industrial Supply — Australia — Asia-Pacific
4. North American Tool Distributors — USA — North America
5. Sahel Equipment SARL — Senegal — Africa
6. Andina Herramientas — Colombia — South America

**Acceptance Criteria:**
- [ ] Page loads with correct dark theme styling
- [ ] Region filter buttons work
- [ ] Distributor cards show all fields
- [ ] Email and phone links work
- [ ] "Become a Distributor" CTA works
- [ ] Page is linked from About dropdown and footer
- [ ] Responsive on mobile

---

## EXECUTION ORDER

| Priority | Phase | Tasks | Estimated Sub-Tasks |
|----------|-------|-------|---------------------|
| 1 | Phase 1 | CMS Theme (1.1-1.2) | 12 |
| 2 | Phase 2 | Custom Previews (2.1-2.4) | 15 |
| 3 | Phase 3 | Custom Widgets (3.1-3.2) | 8 |
| 4 | Phase 4 | Editor Components (4.1-4.5) | 10 |
| 5 | Phase 5 | Product Gallery (5.1-5.2) | 12 |
| 6 | Phase 6 | Product Comparison (6.1-6.2) | 15 |
| 7 | Phase 7 | Product Selector (7.1-7.2) | 12 |
| 8 | Phase 8 | Product Detail Enhancement (8.1) | 10 |
| 9 | Phase 9 | RTL Support (9.1) | 8 |
| 10 | Phase 10 | Distributor Page (10.1) | 6 |

**Total: ~108 sub-tasks**

---

## NON-NEGOTIABLE RULES

1. **NO SKIP** — Every sub-task must be completed before moving on
2. **NO MINIMAL** — Each feature must be fully implemented, not stubbed
3. **NO COMMENTS** — Do not add comments to code
4. **VERIFY BEFORE COMPLETE** — Test each feature before marking done
5. **NO OTHER AI'S FILES** — Do NOT modify files assigned to GLM 5.1 or Qwen 3.6-plus
6. **DARK THEME CONSISTENCY** — Every element must match the zinc-950/yellow-400 theme
7. **MOBILE FIRST** — Every feature must work on mobile viewport
8. **MAKITA STANDARD** — Every feature must meet or exceed what Makita's website offers
9. **NO FRAMEWORK** — Pure HTML/CSS/JS only. No React in public pages (only in CMS previews which require React)
10. **ACCESSIBLE** — All interactive elements must have keyboard support and ARIA labels

---

## INTEGRATION NOTES

When your work is complete, the following must be true for the other AIs to integrate:

1. **For GLM 5.1:** Your gallery, comparison, and selector scripts must work with the product JSON schema that GLM is defining (with `images` array, `userBenefits`, `relatedProducts`, `compliance`, `downloads` fields). Coordinate on the field names.

2. **For Qwen 3.6-plus:** Your RTL CSS overrides must be in place so Qwen can test Arabic translations in a properly right-to-left layout. Your `data-i18n` elements in the gallery/selector/comparison UI must use keys that exist in the translation files.

3. **Your `admin/index.html` modifications** must not break the CMS loading. Test that the CMS still loads after adding all scripts.

---

**END OF GPT-5.3 CODEX TASK DOCUMENT**
