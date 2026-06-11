# Decap CMS Sync & Non-Technical Usability Audit Spec

## Why
The Decap CMS integration has a complex multi-step sync pipeline (CMS → Git → Webhook → Git Pull → Index Regeneration → Frontend Load). This audit identifies exactly where the pipeline works, where it breaks, and whether a non-technical person can actually manage the website without developer help.

## What Changes
- **BREAKING**: Expose the sync pipeline gaps that make content editing unreliable for non-technical users
- Add missing auto-sync step between Gitea push and live site update
- Simplify product collection (109 fields → grouped sections with collapsible UI)
- Add editor onboarding guide and field-level help
- Fix the index.json ↔ .md bidirectional sync gap

## Impact
- Affected specs: Content Management, Sync Pipeline, Editor UX
- Affected code: `scripts/webhook-listener.js`, `scripts/generate-index.js`, `assets/js/cms-loader.js`, `admin/config.yml`

---

## HONEST AUDIT: What Decap CMS Actually Does Here

### The Sync Pipeline (Step by Step)

```
1. Editor opens https://siyang.tools/admin/
2. Decap CMS loads from unpkg CDN (v3.3.3)
3. CMS authenticates via Gitea OAuth
4. Editor edits content in CMS UI
5. Editor clicks "Save"
6. CMS commits .md file to Gitea repo (admin/b2b, branch: main)
   ─── GAP 1: Content is in Git but NOT on the live site yet ───
7. Gitea fires webhook to https://siyang.tools/gitea (POST)
8. webhook-listener.js receives the push event
9. webhook-listener.js runs `git pull origin main` in the project directory
   ─── GAP 2: git pull only works if the server's local repo is properly configured ───
10. webhook-listener.js runs `node generate-index.js`
11. generate-index.js reads ALL .md files, parses frontmatter, writes index.json
    ─── GAP 3: If generate-index.js fails, the index.json is stale ───
12. Frontend loads: cms-loader.js fetches index.json, then fetches each .md file
13. cms-loader.js parses frontmatter client-side and renders content
```

### What Actually Works
- CMS admin panel loads and authenticates correctly
- CMS writes .md files to Gitea repo (confirmed by config.yml backend section)
- Webhook listener auto-registers with Gitea during deploy.sh
- git pull + index regeneration runs on webhook trigger
- Frontend reads both index.json AND individual .md files (merge strategy)

### What's Broken or Fragile

#### GAP 1: No visual feedback after Save
When an editor clicks "Save" in the CMS, the CMS shows "Saving..." then "Saved". But the content does NOT appear on the live site for 5-30 seconds (webhook latency + git pull + index regeneration). The editor has NO WAY to know when their changes are actually live. They must open a new tab and refresh the site manually.

#### GAP 2: git pull can fail silently
If the server's local repo has merge conflicts, uncommitted changes, or credential issues, `git pull origin main` fails. The webhook listener logs the error but the editor never sees it. Content appears "saved" in CMS but never goes live.

#### GAP 3: index.json can be stale
The `generate-index.js` script parses YAML frontmatter with a CUSTOM PARSER (not a library). If the CMS writes YAML that the custom parser can't handle (e.g., special characters, deeply nested objects, multiline strings with edge cases), the index.json will be incomplete or wrong. The frontend then shows stale or missing content.

#### GAP 4: Bidirectional sync doesn't exist
`sync-md.cjs` writes .md files FROM index.json. `generate-index.js` writes index.json FROM .md files. These are OPPOSITE directions. If someone edits index.json directly (or a script modifies it), running sync-md.cjs will overwrite the CMS-authored .md files. There's no conflict resolution.

#### GAP 5: No draft/publish workflow
Decap CMS supports `publish_mode: editorial_workflow` which gives draft → review → publish states. The current config.yml does NOT enable this. Every "Save" goes directly to the main branch. A non-technical person can accidentally publish broken content with no review step.

#### GAP 6: CMS preview ≠ live site
The CMS has 17 preview templates, but they render inside the Decap CMS iframe with limited CSS and no dynamic JS (no GSAP animations, no scroll effects, no i18n). The preview looks significantly different from the live site. An editor cannot trust the preview.

---

## HONEST AUDIT: Can a Non-Technical Person Edit the Website?

### What They CAN Do (Easy)
| Task | Difficulty | Why |
|------|-----------|-----|
| Change company phone/email | Easy | Simple text fields in Settings → Company |
| Edit homepage hero text | Easy | A few text fields in Pages → Homepage |
| Add a blog post | Easy-Medium | ~17 fields, mostly text + markdown editor |
| Change footer links | Easy | Simple list widget in Settings → Footer |
| Edit testimonials | Medium | ~12 fields per testimonial |
| Edit FAQ items | Medium | ~8 fields per FAQ |

### What They CANNOT Do Without Help (Hard)
| Task | Difficulty | Why |
|------|-----------|-----|
| Add a new product | Very Hard | **109 fields** across 8 sections. Requires SKU, category, pricing, specs, compliance, images, related products, downloads |
| Edit homepage sections | Hard | **37 sections** in one form. Overwhelming scroll. Easy to accidentally change wrong section |
| Manage navigation | Medium-Hard | Nested structure with category slugs that must match product categories exactly |
| Upload images correctly | Medium | Must know correct folder paths (/images/products/ vs /images/istock/). No visual folder browser |
| Fix broken sync | Impossible | If git pull fails or index.json is stale, only a developer can fix it |

### The 109-Field Product Problem
A product has these field groups:
1. Basic Info (8 fields): name, sku, category, brand, price, moq, leadTime, isFeatured
2. Description (3 fields): tagline, description (markdown), userBenefits
3. Images (4 fields): main photo, gallery (list), video, arModel
4. Specifications (20+ fields): power, voltage, speed, torque, chuck, weight, dimensions, etc.
5. Compliance (6 fields): ce, ul, gs, rohs, reach, other
6. Trade Details (6 fields): moq, leadTime, packaging, port, paymentTerms, supplyAbility
7. Related Products (2 fields): relatedProducts list, compareFields
8. Downloads (3 fields): specSheet, manual, additionalDocs

A non-technical person will be overwhelmed. They need:
- Collapsible field groups (Decap CMS supports this with `collapsed: true`)
- Required vs optional field distinction (most fields are optional but look equally important)
- Inline help text explaining what each field does
- A "Quick Add" mode that only shows the essential fields

---

## ADDED Requirements

### Requirement: Editorial Workflow
The system SHALL enable `publish_mode: editorial_workflow` in `admin/config.yml` so editors can save drafts, submit for review, and publish — instead of every save going directly to the main branch.

#### Scenario: Editor saves draft
- **WHEN** a non-technical editor clicks "Save" in the CMS
- **THEN** the content is saved as a draft in a new branch, NOT published to the live site
- **AND** the editor sees a "Draft" status badge

#### Scenario: Editor publishes content
- **WHEN** an editor clicks "Publish" on a draft
- **THEN** the content is merged to main branch
- **AND** the webhook triggers, git pull runs, index regenerates
- **AND** the content appears on the live site within 30 seconds

### Requirement: Product Field Groups with Collapsible Sections
The products collection in `admin/config.yml` SHALL organize its 109 fields into collapsible field groups using `types: [object]` with `collapsed: true`, so editors see 8 section headers instead of 109 individual fields.

#### Scenario: Editor adds a new product
- **WHEN** an editor clicks "Add Product" in the CMS
- **THEN** they see 8 collapsed sections: "Basic Info", "Description", "Images", "Specifications", "Compliance", "Trade Details", "Related Products", "Downloads"
- **AND** only "Basic Info" is expanded by default
- **AND** required fields are marked with asterisks and have hint text

### Requirement: Sync Status Indicator
The CMS admin panel SHALL show a sync status indicator that tells the editor whether their changes are live, pending, or failed.

#### Scenario: Editor saves content
- **WHEN** an editor saves content and the webhook processes successfully
- **THEN** a green "Live" badge appears next to the collection entry
- **WHEN** the webhook fails
- **THEN** a red "Sync Failed" badge appears with a "Retry" button

### Requirement: Index Regeneration Reliability
The `generate-index.js` script SHALL use a proper YAML parsing library (e.g., `js-yaml`) instead of a custom parser to prevent frontmatter parsing failures.

#### Scenario: CMS writes complex YAML
- **WHEN** the CMS saves a product with multiline descriptions, special characters, or deeply nested objects
- **THEN** generate-index.js correctly parses the frontmatter and generates accurate index.json
- **AND** no data is lost or corrupted

### Requirement: Editor Onboarding Guide
The system SHALL provide an in-CMS welcome page that explains the editing workflow with screenshots and step-by-step instructions for common tasks.

#### Scenario: New editor opens CMS
- **WHEN** a new editor logs into the CMS for the first time
- **THEN** they see a welcome page with links to: "How to add a product", "How to edit the homepage", "How to add a blog post", "How to change company info"

## MODIFIED Requirements

### Requirement: CMS Backend Configuration
The `admin/config.yml` backend section SHALL remain Gitea-based but with `publish_mode: editorial_workflow` added to enable draft/review/publish workflow.

## REMOVED Requirements

### Requirement: Bidirectional sync-md.cjs
**Reason**: The `sync-md.cjs` script creates a dangerous bidirectional sync that can overwrite CMS-authored content. It should only be used for initial data migration, not as part of the regular CMS workflow.
**Migration**: Remove sync-md.cjs from the webhook pipeline. Keep the script available as a one-time migration tool only.
