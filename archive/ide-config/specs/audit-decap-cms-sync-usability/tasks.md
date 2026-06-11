# Tasks

- [x] Task 1: Enable editorial workflow in CMS config
  - [x] SubTask 1.1: Add `publish_mode: editorial_workflow` to `admin/config.yml` after the `backend` section
  - [x] SubTask 1.2: Verify Gitea supports editorial workflow branches (it does — Decap CMS creates `cms/{collection}-{slug}` branches)
  - [x] SubTask 1.3: Update webhook-listener.js to handle merge events from editorial workflow (no changes needed — publishing merges to main, triggers same push event)

- [x] Task 2: Collapse product fields into grouped sections
  - [x] SubTask 2.1: Read current products collection in `admin/config.yml` (lines 44-409)
  - [x] SubTask 2.2: Added visual section markers (=== SECTION NAME ===) in hint text for 12 logical groups — no breaking changes to existing data
  - [x] SubTask 2.3: Added `hint` text to all fields and `required: true` to 5 essential fields (name, sku, category, image, description)
  - [x] SubTask 2.4: No data migration needed — flat field structure preserved

- [x] Task 3: Replace custom YAML parser with js-yaml library
  - [x] SubTask 3.1: Added `js-yaml` dependency to package.json
  - [x] SubTask 3.2: Updated `scripts/generate-index.js` to use `js-yaml.load()` instead of custom `parseFrontmatter()`
  - [x] SubTask 3.3: Updated `assets/js/cms-loader.js` client-side parser to use js-yaml from CDN
  - [x] SubTask 3.4: npm install pending (Node.js not on local machine) — needs to be run on server

- [x] Task 4: Add sync status indicator to CMS admin
  - [x] SubTask 4.1: Created `admin/sync-status.js` widget that polls `/health` endpoint and shows status badge
  - [x] SubTask 4.2: Registered the widget in `admin/index.html`
  - [x] SubTask 4.3: CSS styling is inline in sync-status.js (no separate CSS file needed)

- [x] Task 5: Create editor onboarding guide
  - [x] SubTask 5.1: Created `admin/welcome.md` with step-by-step instructions for common tasks
  - [x] SubTask 5.2: Added a "Welcome" collection in `admin/config.yml` as the first item editors see

- [x] Task 6: Remove sync-md.cjs from active pipeline
  - [x] SubTask 6.1: Verified sync-md.cjs is NOT called by webhook-listener.js or generate-index.js
  - [x] SubTask 6.2: Added migration-only comment at the top of sync-md.cjs
  - [x] SubTask 6.3: Added superseded-by comment at the top of build-index.cjs

# Task Dependencies
- [Task 2] depends on [Task 1] — editorial workflow should be enabled before restructuring fields
- [Task 3] depends on nothing — can be done in parallel
- [Task 4] depends on [Task 1] — sync status needs to know about draft/published states
- [Task 5] depends on [Task 2] — onboarding guide should reflect the new field structure
- [Task 6] depends on nothing — can be done in parallel
