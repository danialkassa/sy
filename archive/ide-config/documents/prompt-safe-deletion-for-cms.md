# PROMPT: Make CMS Deletion Safe for Non-Technical Users

## CONTEXT

You are working on a B2B power tools website for Ningbo Siyang Power Tools Co., Ltd. The site uses Decap CMS v3.3.3 with a Gitea backend, deployed on DigitalOcean (165.22.250.66, domain: siyang.tools).

**Local path**: `c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website`
**Git installed at**: `C:\Program Files\Git\bin\git.exe`
**Server access**: `ssh root@165.22.250.66`
**Site root on server**: `/var/www/siyang/public/`

## THE PROBLEM

Non-technical staff CAN delete items (products, blog posts, testimonials, FAQ, etc.) through the CMS, but deletion is **dangerous and irreversible**:

1. **No undo** — Once deleted, the .md file is removed from Git. Only a developer can restore it via `git revert`
2. **Deletions bypass editorial workflow** — New/edited items go through Draft → Review → Publish, but **deletions go straight to main branch** with no review step
3. **Broken references** — If you delete Product A that Product B lists as "relatedProducts", Product B shows a broken link
4. **SEO damage** — Deleted pages return 404s. Search engines penalize sites with many 404s. No 301 redirects are set up
5. **Build script doesn't clean up** — `build-html.js` may still reference deleted items in pre-rendered HTML
6. **No confirmation or warning** — The CMS delete button just says "Delete". No warning about consequences

## WHAT YOU MUST IMPLEMENT

### 1. Add "Archived" Status Instead of Deletion

**The safest approach**: Instead of truly deleting items, add an `archived` field that hides them from the live site while preserving the data.

#### Changes to `admin/config.yml`:

For EVERY collection that currently has `delete: true`, make these changes:

**a) Disable actual deletion:**
Change `delete: true` to `delete: false` for all collections.

**b) Add an `archived` boolean field to each collection:**
Add this as the LAST field in every collection:
```yaml
      - label: "Archive This Item"
        name: "archived"
        widget: "boolean"
        default: false
        hint: "Check this to hide this item from the live website. The item is NOT deleted — it can be unarchived later."
```

Collections to update (all currently have `delete: true`):
- Products (Full Details) — name: "products"
- Blog Posts — name: "blog"
- Testimonials — name: "testimonials"
- Team Members — name: "team"
- Certifications — name: "certifications"
- FAQ — name: "faq"
- Partners — name: "partners"
- Distributors — name: "distributors"
- Warranty — name: "warranty"
- Safety — name: "safety"
- Manuals — name: "manuals"
- Downloads — name: "downloads"
- Case Studies — name: "case_studies"

Also add the `archived` field to "Products (Quick Edit)" collection (name: "products-quick").

**c) Add a view filter for archived items:**
For each collection, add a `view_filters` block that lets editors toggle between active and archived:
```yaml
    view_filters:
      - label: "Active Items"
        field: "archived"
        pattern: false
      - label: "Archived Items"
        field: "archived"
        pattern: true
      - label: "All Items"
        field: ""
        pattern: ""
```

### 2. Update `scripts/generate-index.js` to Exclude Archived Items

When generating `index.json`, skip any `.md` file where `archived: true` appears in the frontmatter.

Find the section where each collection's items are processed and add a filter:
```javascript
// After parsing frontmatter, check if archived
if (data.archived === true) {
  continue; // Skip archived items
}
```

This ensures archived items don't appear in search results, product listings, or related product suggestions.

### 3. Update `assets/js/cms-loader.js` to Skip Archived Items

In every `load*` function that renders collection items, add a check:
```javascript
// After parsing frontmatter from .md file
if (itemData.archived) {
  return; // Skip archived items
}
```

This is a safety net — even if an archived item somehow makes it into the index, the loader won't render it.

### 4. Update `scripts/build-html.js` to Exclude Archived Items

In the pre-rendering build script, skip any item where `archived: true`:
```javascript
// When iterating over items for pre-rendering
if (item.archived) continue;
```

### 5. Add a New "Archived Items" Collection in `admin/config.yml`

Create a READ-ONLY collection that shows all archived items so editors can find and unarchive them:

```yaml
  - name: "archived"
    label: "Archived Items"
    files: []  # This will be a virtual collection
```

**BETTER APPROACH**: Since Decap CMS doesn't support virtual collections across folders, instead rely on the `view_filters` added in step 1c. Editors switch to "Archived Items" filter in any collection to see and unarchive items.

### 6. Handle Related Product References

When a product is archived, other products may still reference it in their `relatedProducts` array. Update `cms-loader.js` to filter out archived SKUs from related products:

In the `loadRelatedProducts` function (or wherever related products are rendered):
```javascript
// Filter out archived related products
const activeRelated = relatedSkus.filter(sku => {
  const product = allProducts.find(p => p.sku === sku);
  return product && !product.archived;
});
```

### 7. Add SEO-Safe 404 Handling for Deleted/Archived Pages

If a product page was previously live at `/products/product.html?sku=SY-DD-20V-BL` and gets archived, search engines will still try to crawl it. The page will load but show no product data.

Update `products/product.html` (or the cms-loader logic) to detect when a product is archived and show a proper message:
```html
<div id="product-archived-notice" style="display:none; text-align:center; padding:4rem 2rem;">
  <h2>This product is no longer available</h2>
  <p>Check our <a href="/products/">current product lineup</a> or <a href="/contact.html">contact us</a> for alternatives.</p>
</div>
```

In cms-loader.js, when a product SKU is not found (or is archived), show this notice instead of a broken page.

### 8. Add a Custom Delete-Prevention Widget

Create `admin/widgets/archive-widget.js` that replaces the default delete button with an "Archive" button:

```javascript
// This widget adds a custom "Archive" button to the CMS editor toolbar
// that sets archived: true instead of deleting the item
(function() {
  // CSS to hide the default delete button
  var style = document.createElement('style');
  style.textContent = `
    .nc-entryEditor-toolbar-deleteButton { display: none !important; }
  `;
  document.head.appendChild(style);
})();
```

Register this in `admin/index.html`:
```html
<script src="widgets/archive-widget.js"></script>
```

This hides the delete button entirely, forcing editors to use the "Archive" toggle instead.

## VERIFICATION CRITERIA

The task is COMPLETE when ALL of these are true:

1. **No collection has `delete: true`** — All collections have `delete: false`
2. **Every collection has an `archived` boolean field** — Last field in each collection
3. **Every collection has `view_filters`** — Active / Archived / All
4. **`generate-index.js` excludes archived items** — Running the script produces index.json without archived items
5. **`cms-loader.js` skips archived items** — Archived products don't appear in listings or related products
6. **`build-html.js` excludes archived items** — Pre-rendered HTML doesn't include archived content
7. **Archived product pages show "no longer available" notice** — Not a broken empty page
8. **Default delete button is hidden in CMS** — Editors can only archive, not delete
9. **An archived item can be unarchived** — Toggle `archived: false` in CMS, item reappears on site
10. **Related products filter out archived SKUs** — No broken links in related products section

## IMPORTANT NOTES

- The `admin/config.yml` is ~1400 lines. Be very careful when editing it.
- The `cms-loader.js` is ~2075 lines. Be very careful when editing it.
- The `build-html.js` was recently created by another AI. Read it first to understand its structure.
- The `generate-index.js` uses `js-yaml` for YAML parsing.
- All product `.md` files use flat YAML frontmatter (no nested objects).
- The editorial workflow (`publish_mode: editorial_workflow`) is enabled. Archiving an item should go through the same draft → review → publish flow.
- Git is at `C:\Program Files\Git\bin\git.exe` on the Windows machine.
- After making changes locally, commit and push to Gitea. Then SSH to server and run the deploy pipeline.
- Do NOT modify the Nginx config, Gitea setup, or SSL configuration.
- Do NOT add new npm dependencies.
