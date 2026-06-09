# PROMPT: Fix 4 Critical CMS Logic Gaps for Non-Technical Staff Handoff

## CONTEXT

You are working on a B2B power tools website for Ningbo Siyang Power Tools Co., Ltd. The site uses Decap CMS v3.3.3 with a Gitea backend, deployed on DigitalOcean (165.22.250.66, domain: siyang.tools).

**Local path**: `c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website`
**Git installed at**: `C:\Program Files\Git\bin\git.exe`
**Server access**: `ssh root@165.22.250.66`
**Site root on server**: `/var/www/siyang/public/`

The site has been through multiple rounds of fixes. The technical infrastructure works (SEO pre-rendering, editorial workflow, webhook pipeline, homepage split, Quick Edit). But there are **4 logical gaps** that will cause real problems when non-technical staff start using the CMS. You must fix all 4.

---

## GAP 1: Deletion Is Permanent and Dangerous

### The Problem
Non-technical staff CAN delete items through the CMS, but deletion is **irreversible**:
- No undo — once deleted, the .md file is gone from Git
- Deletions bypass editorial workflow — no draft/review step for deletions
- Broken references — deleting a product that other products reference in `relatedProducts` creates broken links
- SEO damage — deleted pages return 404s, no 301 redirects
- `build-html.js` may still reference deleted items in pre-rendered HTML

### What You Must Do

#### 1a. Disable actual deletion on ALL collections
In `admin/config.yml`, change `delete: true` to `delete: false` for every collection. Currently these have `delete: true`:
- products (Full Details)
- blog
- testimonials
- team
- certifications
- faq
- partners
- distributors
- warranty
- safety
- manuals
- downloads
- case_studies

Also set `delete: false` on "products-quick" (Quick Edit) collection.

#### 1b. Add an `archived` boolean field to every collection
Add this as the LAST field in every collection that had `delete: true`:
```yaml
      - label: "Archive This Item"
        name: "archived"
        widget: "boolean"
        default: false
        hint: "Check this to hide this item from the live website. It will NOT be deleted — you can unarchive it later."
```

Also add it to the "products-quick" collection.

#### 1c. Add view_filters for archived items
For each collection that gets the `archived` field, add:
```yaml
    view_filters:
      - label: "Active"
        field: "archived"
        pattern: false
      - label: "Archived"
        field: "archived"
        pattern: true
```

#### 1d. Hide the delete button in CMS
Create `admin/widgets/archive-widget.js`:
```javascript
// Hides the default delete button in Decap CMS to prevent accidental deletion.
// Staff must use the "Archive" toggle instead.
(function() {
  var style = document.createElement('style');
  style.textContent = '.nc-entryEditor-toolbar-deleteButton { display: none !important; }';
  document.head.appendChild(style);
})();
```
Register it in `admin/index.html`:
```html
<script src="widgets/archive-widget.js"></script>
```

#### 1e. Exclude archived items in generate-index.js
In `scripts/generate-index.js`, when iterating over .md files to build index.json, skip any item where `archived: true`:
```javascript
if (data.archived === true) continue;
```

#### 1f. Exclude archived items in cms-loader.js
In `assets/js/cms-loader.js`, in every function that renders collection items, skip archived items:
```javascript
if (itemData.archived) return;
```

Also in the related products rendering, filter out archived SKUs:
```javascript
const activeRelated = relatedSkus.filter(sku => {
  const product = allProducts.find(p => p.sku === sku);
  return product && !product.archived;
});
```

#### 1g. Exclude archived items in build-html.js
In `scripts/build-html.js`, skip any item where `archived: true`:
```javascript
if (item.archived) continue;
```

#### 1h. Show "no longer available" for archived product pages
If someone visits `/products/product.html?sku=SY-DD-20V-BL` and that product is archived, the page should show a friendly notice instead of a broken empty page.

In `cms-loader.js`, in the product detail loading function, when a product is not found or is archived:
```javascript
if (!productData || productData.archived) {
  document.getElementById('product-archived-notice').style.display = 'block';
  document.getElementById('product-detail-content').style.display = 'none';
  return;
}
```

Add the notice HTML to `products/product.html`:
```html
<div id="product-archived-notice" style="display:none; text-align:center; padding:4rem 2rem;">
  <h2>This product is no longer available</h2>
  <p>Check our <a href="/products/">current product lineup</a> or <a href="/contact.html">contact us</a> for alternatives.</p>
</div>
```

---

## GAP 2: Quick Edit Creates Incomplete Products

### The Problem
"Products (Quick Edit)" has only 8 fields. When a non-technical person adds a product using Quick Edit, the live product page will have:
- No specifications (empty specs table)
- No compliance data (no CE/UL badges)
- No trade details (no MOQ, packaging, port)
- No related products
- No downloads

The product page will look broken and unprofessional — empty sections, "undefined" text, missing badges.

### What You Must Do

#### 2a. Add a prominent warning in Quick Edit
In `admin/config.yml`, add a `hint` to the Quick Edit collection's FIRST field:
```yaml
    hint: "⚠️ This is a QUICK EDIT form with only basic fields. After saving, switch to 'Products (Full Details)' to add specifications, compliance, trade details, and more. A product with only these 8 fields will have an INCOMPLETE page on the live site."
```

#### 2b. Add a "Completion Status" field to Quick Edit
Add a read-only-looking field that shows which sections are still empty. This isn't truly read-only in Decap CMS, but we can use a `string` field with a hint:

Add as the LAST field in the Quick Edit collection (after `archived`):
```yaml
      - label: "⚠️ Completion Status"
        name: "completionStatus"
        widget: "string"
        default: "Incomplete — add specs, compliance, and trade details in Full Details"
        hint: "This product page is incomplete. Go to 'Products (Full Details)' to fill in specifications, compliance, trade details, and downloads."
```

#### 2c. Make the product page handle missing fields gracefully
In `assets/js/cms-loader.js`, in the product detail rendering function, add checks for missing data:

For the specifications table — if `specs` is empty or missing, show a message instead of an empty table:
```javascript
if (!product.specs || Object.keys(product.specs).length === 0) {
  specsContainer.innerHTML = '<p class="text-zinc-500 italic">Specifications coming soon. <a href="/contact.html" class="text-yellow-400 underline">Contact us</a> for details.</p>';
} else {
  // render specs table normally
}
```

For compliance badges — if no compliance data, don't render the section:
```javascript
const hasCompliance = product.compliance && Object.values(product.compliance).some(v => v === true);
if (!hasCompliance) {
  complianceSection.style.display = 'none';
}
```

For trade details — if missing, show a contact prompt:
```javascript
if (!product.packaging && !product.port && !product.paymentTerms) {
  tradeDetailsContainer.innerHTML = '<p class="text-zinc-500 italic">Trade details coming soon. <a href="/contact.html" class="text-yellow-400 underline">Contact us</a> for a quote.</p>';
}
```

For related products — if empty, hide the section entirely:
```javascript
if (!product.relatedProducts || product.relatedProducts.length === 0) {
  relatedSection.style.display = 'none';
}
```

For downloads — if empty, hide the section:
```javascript
if (!product.downloads || Object.keys(product.downloads).length === 0) {
  downloadsSection.style.display = 'none';
}
```

#### 2d. Also handle missing fields in build-html.js
The pre-rendering script should also handle incomplete products gracefully. When injecting product data, check for missing fields and provide sensible defaults or skip the section.

---

## GAP 3: No Deploy Confirmation — Staff Can't Tell If Changes Went Live

### The Problem
After an editor publishes content, they have no way to know if it actually went live. The current sync status badge only checks if the webhook Node.js process is running (`/health` returns `{"status":"ok"}`). It does NOT tell the editor:
- When the last deploy happened
- Whether the deploy succeeded or failed
- Whether their specific content change is now live

### What You Must Do

#### 3a. Add deploy tracking to the webhook listener
In `scripts/webhook-listener.js`, add a global variable that tracks the last deploy:
```javascript
let lastDeploy = {
  timestamp: null,
  status: null,    // 'success' or 'failed'
  steps: {},       // { gitPull: 'success', npmInstall: 'success', generateIndex: 'success', buildHtml: 'success' }
  error: null
};
```

Update each pipeline step to record its result:
```javascript
lastDeploy.timestamp = new Date().toISOString();
lastDeploy.steps.gitPull = pullResult.success ? 'success' : 'failed';
lastDeploy.steps.npmInstall = npmResult.success ? 'success' : 'failed';
lastDeploy.steps.generateIndex = regenResult.success ? 'success' : 'failed';
lastDeploy.steps.buildHtml = buildResult.success ? 'success' : 'failed';
lastDeploy.status = (pullResult.success && regenResult.success && buildResult.success) ? 'success' : 'failed';
lastDeploy.error = pullResult.error || regenResult.error || buildResult.error || null;
```

#### 3b. Update the /health endpoint to include deploy info
Change the health endpoint response from:
```javascript
res.end(JSON.stringify({ status: "ok" }));
```
To:
```javascript
res.end(JSON.stringify({
  status: "ok",
  lastDeploy: lastDeploy.timestamp ? {
    timestamp: lastDeploy.timestamp,
    status: lastDeploy.status,
    steps: lastDeploy.steps,
    error: lastDeploy.error
  } : null
}));
```

#### 3c. Update the sync status badge to show deploy info
In `admin/sync-status.js`, update the badge to:
1. Show the last deploy timestamp (e.g., "Last deploy: 2 min ago")
2. Show green if last deploy was successful, red if failed
3. Show which step failed if any
4. Add a "View on Site →" link after successful deploy

Replace the current `checkSyncStatus` function with one that reads the deploy info from `/health` and displays it meaningfully.

#### 3d. Only trigger the pipeline on main branch pushes
In `scripts/webhook-listener.js`, add a check at the start of the `/gitea` handler to skip non-main branch pushes:
```javascript
// Parse the payload to check the ref
let body = {};
try { body = JSON.parse(payload.toString()); } catch(e) {}

// Only process pushes to main branch
const ref = body.ref || '';
if (!ref.endsWith('/main') && !ref.endsWith('/master')) {
  console.log('[webhook] Ignoring push to', ref, '— only processing main branch');
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Ignored — not main branch" }));
  return;
}
```

This prevents draft saves from triggering unnecessary pipeline runs.

---

## GAP 4: CMS Preview Doesn't Match Live Site

### The Problem
When editors preview their changes in the CMS, the preview renders in an iframe with minimal CSS. It looks significantly different from the live site. Editors trust the preview, publish, and are surprised by the result.

### What You Must Do

#### 4a. Load the site's full CSS into CMS previews
In `admin/index.html`, the site CSS is already loaded. But the preview iframes need it too. Add a CSS injection in the preview templates.

Create `admin/previews/preview-styles.js`:
```javascript
// Injects the site's full CSS into CMS preview iframes
window.CMS_PREVIEW_STYLES = `
  @import url('/assets/css/styles.css');
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Source+Sans+3:wght@300;400;600;700&display=swap');

  body {
    background: #09090b;
    color: #e4e4e7;
    font-family: 'Source Sans 3', system-ui, sans-serif;
    padding: 2rem;
  }

  h1, h2, h3 { font-family: 'Oswald', sans-serif; color: #facc15; }
  a { color: #facc15; }
  img { max-width: 100%; border-radius: 8px; }
  .text-zinc-400 { color: #a1a1aa; }
  .text-zinc-500 { color: #71717a; }
  .text-yellow-400 { color: #facc15; }
  .bg-zinc-900 { background: #18181b; }
  .rounded-lg { border-radius: 8px; }
  .grid { display: grid; }
  .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .gap-4 { gap: 1rem; }
  .gap-6 { gap: 1.5rem; }
  .p-4 { padding: 1rem; }
  .p-6 { padding: 1.5rem; }
`;
```

Register it in `admin/index.html` BEFORE the preview templates:
```html
<script src="previews/preview-styles.js"></script>
```

#### 4b. Update each preview template to use the shared styles
For each preview file in `admin/previews/`, wrap the preview HTML in a container and apply the shared styles:

```javascript
// At the top of each preview's createPreview function:
var styles = window.CMS_PREVIEW_STYLES || '';
var html = '<style>' + styles + '</style><div class="preview-container">' + content + '</div>';
```

You don't need to rewrite all 17 preview templates. Just update the 5 most-used ones:
1. `product-preview.js` — Products are the most edited
2. `homepage-preview.js` — Homepage is the most visible
3. `blog-preview.js` — Blog posts are common
4. `settings-preview.js` — Company settings
5. `testimonial-preview.js` — Simple, good test case

For the other 12 previews, just add the CSS injection at the top — don't redesign them.

#### 4c. Add a "Preview may differ from live site" notice
In `admin/cms-theme.css`, add a persistent notice at the top of the preview pane:
```css
.nc-previewPane::before {
  content: "⚠️ Preview is approximate — check the live site after publishing";
  display: block;
  padding: 8px 16px;
  background: #854d0e;
  color: #fef3c7;
  font-size: 13px;
  text-align: center;
  font-weight: 600;
}
```

---

## VERIFICATION CRITERIA

The task is COMPLETE when ALL of these are true:

### Gap 1 — Safe Deletion
1. No collection in `admin/config.yml` has `delete: true`
2. Every collection has an `archived` boolean field
3. Every collection has `view_filters` for Active/Archived
4. The delete button is hidden in the CMS (archive-widget.js loaded)
5. `generate-index.js` excludes archived items from index.json
6. `cms-loader.js` skips archived items when rendering
7. `build-html.js` excludes archived items from pre-rendered HTML
8. Archived product pages show "no longer available" notice
9. Unarchiving an item (toggle `archived: false`) makes it reappear on the site

### Gap 2 — Incomplete Products
10. Quick Edit shows a warning about incomplete products
11. Product page handles missing specs gracefully ("Specifications coming soon")
12. Product page handles missing compliance gracefully (section hidden)
13. Product page handles missing trade details gracefully ("Contact us for a quote")
14. Product page handles missing related products gracefully (section hidden)
15. Product page handles missing downloads gracefully (section hidden)

### Gap 3 — Deploy Confirmation
16. `/health` endpoint returns `lastDeploy` with timestamp, status, steps, and error
17. Sync status badge shows last deploy time and status
18. Sync status badge shows "View on Site →" link after successful deploy
19. Webhook ignores pushes to non-main branches (draft saves don't trigger pipeline)

### Gap 4 — Preview Accuracy
20. CMS preview iframes load the site's CSS
21. Top 5 preview templates use shared styles
22. A "Preview may differ" notice appears above the preview pane

---

## IMPORTANT NOTES

- `admin/config.yml` is ~1400+ lines. Be very careful when editing. Read sections before changing.
- `assets/js/cms-loader.js` is ~2075 lines. Be very careful when editing.
- `scripts/build-html.js` was created by another AI. Read it first to understand its structure.
- `scripts/generate-index.js` uses `js-yaml` for YAML parsing.
- `scripts/webhook-listener.js` runs on port 3099 as a systemd service (`siyang-webhook`).
- The editorial workflow (`publish_mode: editorial_workflow`) is enabled.
- All product `.md` files use flat YAML frontmatter (no nested objects).
- Git is at `C:\Program Files\Git\bin\git.exe` on the Windows machine.
- After making changes locally, commit and push to Gitea, then SSH to server and run the deploy pipeline.
- Do NOT modify the Nginx config, Gitea setup, SSL, or add new npm dependencies.
- Do NOT change the URL structure, routing, or i18n system.
- Do NOT remove or restructure existing content files.
