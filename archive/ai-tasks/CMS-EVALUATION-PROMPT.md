# Decap CMS Premium UI — Deep Evaluation Prompt

## Context
You are evaluating a complete Decap CMS (v3.3.3) admin customization for the Ningbo Siyang B2B power tools website. The CMS has 15 collections, 17 custom preview templates, an animation engine, and a premium dark zinc theme. The previous review identified and fixed critical issues — this evaluation checks the **quality, depth, and robustness** of the final implementation.

## Evaluation Environment
- **Project root:** `/c/Users/DanielkassaMuruts/Documents/B2B/html1-suite/public-website/admin/`
- **Test suite:** `node admin/_test-suite.cjs` (403 tests, currently all passing)
- **Files to read:** All files in `admin/` — especially `previews/*.js`, `cms-animations.js`, `cms-theme.css`, `index.html`, `config.yml`
- **Public website theme:** Dark zinc (`#09090b`, `#18181b`, `#27272a`) + yellow-400 (`#facc15`) accent. Fonts: Oswald (headings) + Source Sans 3 (body).

## Evaluation Categories (Rate 1-10 each)

### 1. PREVIEW TEMPLATE QUALITY (Visual & Data)

**Read all 17 preview files in `admin/previews/`.**

For EACH preview, evaluate:

- **Visual fidelity:** Does the preview look like it belongs in a premium CMS? Are colors, typography, spacing, and borders consistent with the dark zinc + yellow-400 theme? Is there visual hierarchy (headings prominent, metadata subtle)?
- **Data coverage:** Does the preview display ALL fields from `config.yml` for that collection? Or does it omit critical fields that editors need to see?
- **Empty-state handling:** What happens when every field is missing/undefined? Does it crash, show broken layout, or degrade gracefully with fallbacks?
- **Image handling:** Are images displayed with proper aspect ratios, object-fit, and `onerror` fallbacks? What happens when the image URL is empty or invalid?
- **Draft status visibility:** Is the DRAFT badge prominent and immediately recognizable? Is it positioned correctly (not overlapping critical content)?
- **Date formatting:** Are ISO datetime strings formatted to readable dates (e.g., "June 5, 2026")? Or do they show raw ISO?
- **List/array handling:** For fields that are arrays (tags, categories, benefits, results, etc.), does the preview render them as chips/lists? Or does it show `[object Object]` or raw JSON?
- **Relation field display:** For relation fields (relatedProducts, affectedSkus, productSku), does the preview show meaningful identifiers (SKUs, names) rather than internal IDs?
- **Boolean/toggle display:** For boolean fields (featured, inStock, showTeam, etc.), are they displayed as visual badges rather than raw `true`/`false`?
- **Interactive elements:** If the preview contains links (website, verifyUrl, email, downloads), do they use proper `safeHref()` sanitization? Do they open in new tabs with `rel="noopener noreferrer"`?

**Specific previews to scrutinize:**
- `product-preview.js` — The most complex. Does it show specs, image gallery, compliance badges, related products, downloads, warranty?
- `settings-preview.js` — Contains TWO previews (Navigation + Footer) in one file. Is this clean? Does each render its specific data correctly?
- `company-preview.js` & `oem-odm-preview.js` — Do they show ALL fields including toggles, CTA buttons, social links?
- `homepage-preview.js` — Does it show the CTA button, featured categories, and section toggles?

### 2. ANIMATION ENGINE (Performance & Correctness)

**Read `admin/cms-animations.js` carefully.**

- **Memory safety:** Is there exactly ONE `IntersectionObserver` instance? Is `unobserveAll()` called on route change to prevent leaks?
- **Route detection:** Does the hashchange listener + polling fallback correctly detect Decap CMS route transitions?
- **Debouncing:** Is the mutation handler debounced at 16ms? Does it skip SCRIPT/STYLE nodes?
- **Reduced motion:** Does the `prefers-reduced-motion` handler work bidirectionally (ON → force visible, OFF → restore animations)? Is the Safari `< 14` `addListener()` fallback present?
- **Toast system:** Does `CMSToast` have proper lifecycle management? Is the safety counter present to prevent infinite loops? Can duration `0` be passed explicitly?
- **No dead code:** Confirm that `showSkeletons()`, `removeSkeletons()`, and `skeletonObserver` are completely removed.
- **Batch limits:** Is `maxBatchSize: 50` enforced? Does `animateBatch` slice arrays before processing?

### 3. CSS THEME (Maintainability & Specificity)

**Read `admin/cms-theme.css`.**

- **!important audit:** There are 318 `!important` declarations (reduced from 358). Are the remaining ones ALL necessary for fighting Decap's inline styles? Can any more be safely removed?
- **Selector specificity:** Are there specificity wars? Does the theme rely on overly complex selectors that will break on Decap CMS updates?
- **CSS variables:** Are all used `--*` variables defined in `:root`? Are there hardcoded colors that should use variables?
- **Keyframe animations:** Are there duplicate or unused keyframes? Are animation names collision-safe (`cms-*` prefix)?
- **Responsive design:** Does the CSS handle Decap CMS's responsive layout (sidebar collapse, mobile view)?
- **Glassmorphism:** Are the `backdrop-filter` declarations properly prefixed (`-webkit-`)? Do they have fallback backgrounds for browsers that don't support it?

### 4. CONFIGURATION SCHEMA (Completeness & Consistency)

**Read `admin/config.yml`.**

- **Field coverage:** Does every collection have the fields its preview expects? Are there fields in the preview that don't exist in config (or vice versa)?
- **Summary templates:** Are all 13 folder collection summaries using valid field names? Are they visually informative (two-part labels like `{{sku}} · {{category}}`)?
- **Draft field position:** Is `draft` the FIRST field in every collection? This is critical for UX.
- **Relation field correctness:** Do all relation fields reference valid collections with correct `value_field` and `search_fields`?
- **View filters/groups:** Are view filters and groups correctly configured? Do they reference fields that actually exist?
- **File collections:** Do `pages` (homepage, company, oem-odm) and `settings` (navigation, footer) have correct file paths?
- **i18n conflicts:** Was CMS i18n properly removed to avoid conflict with `assets/js/i18n.js`?

### 5. INDEX.HTML (Integration & Loading)

**Read `admin/index.html`.**

- **Script load order:** Is Decap CMS loaded first, then animations, then previews, then widgets?
- **Preview registrations:** Are all 18 preview templates registered? Are names exactly matching `window.XxxPreview` exports?
- **Dead code:** Are the widget scripts (`color-swatch.js`, `product-card.js`) commented out? Are they still referenced in `config.yml`?
- **Editor components:** Do the 4 editor components (product-callout, cta-button, image-gallery, quote-block) have robust regex patterns for round-trip serialization?
- **Public CSS:** Is `registerPreviewStyle('/assets/css/styles.css')` commented out?
- **Webhook auth:** Does the webhook secret script have an `onerror` fallback?
- **FAB button:** Is the Regenerate Index FAB present with proper state management (loading, success, error, reset)?

### 6. SECURITY & ROBUSTNESS

- **XSS prevention:** Do all previews use the `el()` helper with `createTextNode` (not `innerHTML`)? Are `href` attributes sanitized through `safeHref()`?
- **Null safety:** Does `text()` helper return the fallback for `undefined`, `null`, `''`, and `0`? Wait — does it handle `0` correctly? (Should `text(0, "N/A")` return `"0"` or `"N/A"`?)
- **Image security:** Do `<img>` tags have `onerror` handlers to prevent broken-image icons?
- **JSON safety:** If any widget used JSON parsing, does it have try/catch? (Note: widgets are dead code now.)

### 7. CODE PATTERNS & CONSISTENCY

- **DRY principle:** Are `getData()`, `text()`, and `el()` duplicated in every preview? Is there a shared helper file? Should there be?
- **Naming consistency:** Are all preview exports named `XxxPreview` (not `PreviewXxx` or `xxx_preview`)?
- **Color consistency:** Do all previews use the same palette (`#09090b`, `#18181b`, `#27272a`, `#facc15`, `#e4e4e7`, `#a1a1aa`, `#71717a`)? Or are there hardcoded one-off colors?
- **Border radius consistency:** Are border radii using the CSS vars (`--radius-sm`, `--radius-md`, etc.) or hardcoded pixel values?
- **Font consistency:** Are Oswald and Source Sans 3 used consistently? Or are there stray `sans-serif` fallbacks?

### 8. ACCESSIBILITY

- **Focus styles:** Does the `:focus-visible` selector provide a visible yellow outline on all interactive elements?
- **Reduced motion:** Does the animation engine respect `prefers-reduced-motion`?
- **Color contrast:** Do text colors on dark backgrounds meet WCAG AA? (e.g., `#a1a1aa` on `#18181b` = 4.5:1? Check.)
- **ARIA:** Are toast notifications marked with `role="status"` and `aria-live="polite"`?

## Evaluation Output Format

```markdown
# CMS Evaluation Report

## Overall Score: X/10

## 1. Preview Templates: X/10
| Preview | Data Coverage | Visual Quality | Empty State | Edge Cases | Score |
|---|---|---|---|---|---|
| product | ... | ... | ... | ... | X/10 |
| blog | ... | ... | ... | ... | X/10 |
| ... | ... | ... | ... | ... | ... |

**Critical findings:**
- [ ] ...

## 2. Animation Engine: X/10
**Findings:** ...

## 3. CSS Theme: X/10
**Findings:** ...

## 4. Config Schema: X/10
**Findings:** ...

## 5. Integration: X/10
**Findings:** ...

## 6. Security: X/10
**Findings:** ...

## 7. Code Quality: X/10
**Findings:** ...

## 8. Accessibility: X/10
**Findings:** ...

## Recommendations (Priority Order)
1. **P0** — Critical fix needed
2. **P1** — Should fix before release
3. **P2** — Nice to have
```

## Evaluation Instructions
1. Read ALL files in `admin/previews/`, `admin/cms-animations.js`, `admin/cms-theme.css`, `admin/index.html`, `admin/config.yml`
2. Run `node admin/_test-suite.cjs` and note the results
3. For each category above, score 1-10 with specific evidence
4. List every bug, inconsistency, or missed opportunity you find
5. Be brutally honest — "depth matters, quality work matters"
