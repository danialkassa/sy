# EXACT REPLICATION PROMPT: Decap CMS → Pure HTML/PHP

> **Instruction to the AI reading this:** You are building a pixel-perfect, behavior-perfect clone of Decap CMS (formerly Netlify CMS) using only pure HTML, vanilla JavaScript, and PHP. No React. No Vue. No build steps. No npm. No webpack. The existing `admin/config.yml` is sacred — it is your sole specification document. Every feature, every field, every validation rule, every i18n behavior, every editorial workflow state must be replicated exactly as Decap would behave. Read this prompt fully before writing a single line of code.

---

## 1. PROJECT CONTEXT & CONSTRAINTS

### 1.1 Existing Structure (DO NOT BREAK THIS)

The site is a pure HTML/CSS/JS website. It already works. Your CMS must sit alongside it without breaking any public-facing page.

```
project-root/
├── index.html                    ← Public homepage
├── contact.html                  ← Public contact page
├── products/
│   ├── index.html                ← Public product catalog
│   └── [category].html           ← Public category pages
├── blogs/
│   ├── index.html                ← Public blog index
│   └── post.html                 ← Public blog post template
├── about/
│   └── [various].html            ← Public about pages
├── content/                      ← CMS content storage (Markdown + frontmatter)
│   ├── blog/
│   ├── products/
│   ├── testimonials/
│   ├── team/
│   ├── certifications/
│   ├── faq/
│   ├── partners/
│   ├── distributors/
│   ├── warranty/
│   ├── safety/
│   ├── manuals/
│   ├── downloads/
│   ├── pages/
│   └── settings/
├── images/
│   ├── uploads/                  ← General media uploads
│   ├── products/                 ← Product images
│   ├── blog/                     ← Blog images
│   ├── testimonials/             ← Testimonial avatars
│   ├── certificates/             ← Certification scans
│   ├── distributors/             ← Distributor logos
│   └── uploads/                  ← Generic uploads
├── assets/
│   ├── css/styles.css            ← Compiled Tailwind (DO NOT EDIT)
│   ├── js/                       ← Public site JS
│   └── downloads/                ← PDFs, manuals, spec sheets
├── admin/                        ← YOUR CMS GOES HERE
│   ├── config.yml                ← THE SACRED SPEC (read-only for you)
│   ├── index.html                ← Decap CMS entry point (keep as reference)
│   └── cms-theme.css             ← Optional theme overrides
└── scripts/
    └── generate-index.js         ← Builds JSON indexes from content
```

### 1.2 Hard Constraints

- **NO BUILD STEP.** The admin must work by opening files in a browser or serving via Apache/Nginx.
- **NO DATABASE.** All content is files. The filesystem IS the database.
- **NO FRAMEWORKS.** No React, Vue, Angular, Svelte, Laravel, Symfony, Django, Rails. Pure PHP 7.4+ and vanilla ES6+.
- **NO NODE.JS REQUIRED FOR ADMIN.** The admin panel must run on standard shared hosting.
- **BACKWARD COMPATIBLE.** All existing `content/` files, all existing public HTML pages must continue to work unchanged.
- **SINGLE SOURCE OF TRUTH:** `admin/config.yml` defines everything. If a collection is added there later, the CMS must automatically show it without code changes.

---

## 2. THE SACRED SPEC: admin/config.yml

You must parse and honor EVERY directive in this file. Here is the complete file content. Every line matters:

```yaml
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

publish_mode: editorial_workflow

logo_url: /ningbo-siyang-logo-dark.svg
site_url: http://165.22.250.66
display_url: http://165.22.250.66
show_preview_links: true
search: true
locale: "en"

slug:
  encoding: "unicode"
  clean_accents: true
  sanitize_replacement: "-"

media_folder: "images/uploads"
public_folder: "/images/uploads"

media_library:
  max_file_size: 2048000
  choose_url: false

i18n:
  structure: multiple_files
  locales: ["en", "zh", "ar", "fr", "ru", "es"]
  default_locale: "en"

collections:
  # [PASTE THE ENTIRE COLLECTIONS SECTION FROM THE REAL config.yml]
  # INCLUDING: products, blog, testimonials, team_members, certifications,
  # faq, partners, distributors, warranty, safety, manuals, downloads,
  # pages, settings
  # EVERY FIELD, EVERY WIDGET, EVERY OPTION MUST BE REPLICATED.
```

**You MUST implement support for every widget type used in this config:**
- `string` — text input, with optional `pattern` regex validation
- `text` — textarea
- `markdown` — textarea with optional markdown preview toggle
- `image` — file upload + preview thumbnail, with `media_folder`/`public_folder` override
- `file` — file upload (PDFs etc.), with `media_folder`/`public_folder` override
- `select` — dropdown, with `options` array, `default` value
- `boolean` — toggle switch (NOT a checkbox — a visual toggle)
- `number` — number input, with `min`, `max`, `default`, `step`
- `datetime` — date/time picker
- `list` — repeatable field group. Each item has a remove button. Add button at bottom. Can be simple strings or complex objects (when `field` is an object with sub-fields).
- `object` — nested field group. Display as a collapsible/expandable panel with labeled sub-fields.

---

## 3. ARCHITECTURE SPECIFICATION

### 3.1 File Structure You Will Create

```
admin/
├── config.yml                    ← EXISTING — read only
├── index.html                    ← EXISTING — keep as reference, redirect to your CMS
├── cms-theme.css                 ← EXISTING — keep
├── .htaccess                     ← NEW — protect API + enforce routing
├── login.php                     ← NEW — authentication entry point
├── dashboard.php                 ← NEW — main CMS SPA shell
├── api.php                       ← NEW — single API endpoint (router pattern)
├── lib/
│   ├── YamlParser.php            ← NEW — minimal YAML parser (or use Symfony/Yaml if available, else write one)
│   ├── DecapConfig.php           ← NEW — reads config.yml, exposes collections, fields, i18n, media config
│   ├── ContentStore.php          ← NEW — all file CRUD operations
│   ├── MediaStore.php            ← NEW — image/file upload, delete, listing
│   ├── Auth.php                  ← NEW — session-based authentication
│   ├── I18n.php                  ← NEW — locale management, translation file handling
│   ├── Slugifier.php             ← NEW — slug generation matching Decap rules exactly
│   └── MarkdownSerializer.php    ← NEW — frontmatter + body serialization/deserialization
├── assets/
│   ├── cms.css                   ← NEW — admin UI styles (Decap-like dark/light theme)
│   └── cms.js                    ← NEW — vanilla JS admin application
└── previews/
    ├── blog.html                 ← NEW — optional preview template
    ├── product.html              ← NEW — optional preview template
    └── page.html                 ← NEW — optional preview template
```

### 3.2 The API Router (api.php)

Implement a single `api.php` that accepts `?action=` and responds with JSON. All actions require authentication.

**Required API Actions:**

| Action | Method | Params | Description |
|--------|--------|--------|-------------|
| `login` | POST | `username`, `password` | Authenticate, start session |
| `logout` | POST | — | Destroy session |
| `me` | GET | — | Return current user |
| `config` | GET | — | Return parsed config.yml (safe subset, no secrets) |
| `collections` | GET | — | List all collections |
| `entries` | GET | `collection`, `filter`, `group`, `sort`, `page`, `per_page` | List entries in a collection |
| `entry` | GET | `collection`, `slug` | Get single entry data + frontmatter |
| `entry.save` | POST | `collection`, `slug`, `data` (JSON), `locale`, `status` | Save/create entry |
| `entry.delete` | POST | `collection`, `slug` | Delete entry file(s) |
| `entry.publish` | POST | `collection`, `slug` | Set status to `published` |
| `media.list` | GET | `folder` | List files in a media folder |
| `media.upload` | POST | `file` (multipart), `folder` | Upload file, return public URL |
| `media.delete` | POST | `path` | Delete file from server |
| `index.rebuild` | POST | `collection` | Run generate-index equivalent for one or all collections |
| `search` | GET | `q`, `collection` (optional) | Search across title/name fields |

**Error Response Format (always):**
```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

**Success Response Format (always):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 4. AUTHENTICATION & SESSIONS

### 4.1 Login System

- Store credentials in a PHP file outside web root, or in `admin/.htpasswd`-style but managed by PHP.
- Better: `admin/config/` folder with `users.php` returning an array of hashed passwords.
- Example:
  ```php
  // admin/config/users.php
  return [
    'admin' => '$2y$10$...bcrypt_hash...',
    'editor' => '$2y$10$...bcrypt_hash...',
  ];
  ```
- Session lifetime: 8 hours.
- After login, redirect to `dashboard.php`.
- If not authenticated, any request to `dashboard.php` or `api.php` returns HTTP 401.

### 4.2 Role Simulation (from Decap concept)

Even if single-user initially, architect for:
- `admin` — full access
- `editor` — can create/edit but not delete, cannot change settings
- `publisher` — can change editorial status to `published`

Store role in session. Check on every API action.

---

## 5. CONTENT STORAGE FORMAT (EXACT DECAP COMPATIBILITY)

### 5.1 File Format

Every entry is a **Markdown file with YAML frontmatter**.

```markdown
---
name: "20V Brushless Drill/Driver"
sku: "SY-DD-20V-BL"
category: "Drills & Drivers"
brand: "Siyang Pro"
description: "Professional-grade brushless motor..."
image: "/images/products/sy-dd-20v-bl.jpg"
inStock: true
featured: false
date: "2026-05-15T08:00:00.000Z"
cms_status: "published"
---

# 20V Brushless Drill/Driver

Full markdown body content here...
```

### 5.2 i18n: Multiple Files Structure

When `i18n.structure: multiple_files` (as in the config):

- Each locale gets its OWN file.
- File naming: `{slug}.{locale}.md`
- Example:
  - `content/products/sy-dd-20v-bl.en.md`
  - `content/products/sy-dd-20v-bl.zh.md`
  - `content/products/sy-dd-20v-bl.ar.md`
- The `default_locale` file ALSO exists as the base slug without locale suffix: `{slug}.md` (this is the `en` version).
- Fields with `i18n: false` are WRITTEN TO ALL locale files identically.
- Fields with `i18n: true` are locale-specific.
- When reading, if a locale file is missing, fall back to the default locale file.

### 5.3 Editorial Workflow Status

Because we have `publish_mode: editorial_workflow`, EVERY entry must have a `cms_status` field in frontmatter:

- `draft` — entry is being written, not visible on public site
- `in_review` — entry is pending approval
- `ready` — entry approved, ready to publish
- `published` — entry is live

**Status Transitions:**
```
draft → in_review → ready → published
  ↑       ↓          ↓
  └───────┴──────────┘
```

Users with `editor` role can set: draft, in_review, ready.
Users with `publisher` or `admin` role can set: published (and all others).

The public site should ONLY read entries where `cms_status === 'published'`.

### 5.4 Slug Generation (EXACT DECAP LOGIC)

From config:
```yaml
slug:
  encoding: "unicode"
  clean_accents: true
  sanitize_replacement: "-"
```

Implement exactly:
1. Start with the `slug` template from collection config. Example: `"{{sku}}"` or `"{{slug}}"` or `"{{year}}-{{month}}-{{day}}-{{slug}}"`.
2. Replace template variables with entry field values.
3. If `{{slug}}` is used and no `title` or `name` field exists, use the identifier field.
4. Apply `clean_accents: true` → replace é→e, ñ→n, ü→u, etc.
5. Replace all non-alphanumeric (respecting `encoding: unicode` for CJK/Arabic/Cyrillic) with `sanitize_replacement` (`-`).
6. Collapse multiple replacements into one.
7. Trim from both ends.
8. Lowercase.
9. Ensure unique: if file exists, append `-1`, `-2`, etc.

### 5.5 Commit Message Simulation

Since we are file-based (not git-backed in your implementation), simulate Decap's commit messages by logging to a text file `admin/logs/changes.log`:

```
[2026-06-02 14:30:00] Add products: sy-dd-20v-bl by admin
[2026-06-02 14:35:00] Update blog: my-post by editor
[2026-06-02 14:40:00] Upload image: images/uploads/photo.jpg by admin
```

Use the exact templates from `backend.commit_messages`.

---

## 6. ADMIN UI SPECIFICATION (Decap Visual Replication)

### 6.1 Layout

Replicate Decap's layout exactly:

```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO]    Search...                    [User ▼]  Logout   │ ← Header
├──────────┬──────────────────────────────────────────────────┤
│          │                                                    │
│ Contents │   Collection List View                            │
│ ─────────│   ┌─────────────────────────────────────────────┐  │
│ Products │   │ [+ New Product]  [Filter ▼] [Group ▼] [🔍] │  │
│ Blog     │   ├─────────────────────────────────────────────┤  │
│ Testimo. │   │ ☑ │ Name          │ SKU      │ Status │ Date │  │
│ Team     │   ├───┼───────────────┼──────────┼────────┼──────┤  │
│ Certif.  │   │ ☐ │ Drill/Driver  │ SY-DD-.. │ ✅ Pub │ Jun 1│  │
│ FAQ      │   │ ☐ │ Impact Wrench │ SY-IW-.. │ 🟡 Drf │ Jun 2│  │
│ ...      │   └─────────────────────────────────────────────┘  │
│          │                                                    │
│ Media    │   OR Entry Editor                                  │
│          │   ┌──────────────────────────────────────────────┐ │
│ Settings │   │ Draft ▼  Save  Publish  Delete              │ │
│          │   ├──────────────────────────────────────────────┤ │
│          │   │ [en | zh | ar | fr | ru | es]                │ │
│          │   │                                                │ │
│          │   │ Product Name     [____________________]      │ │
│          │   │ SKU              [____________________]      │ │
│          │   │ Category         [▼ Drills & Drivers]        │ │
│          │   │ Description      [                    ]      │ │
│          │   │                  [                    ]      │ │
│          │   │ Main Photo       [📎 Choose File    ]        │ │
│          │   │                  [🖼️ preview...      ]        │ │
│          │   │                                                │ │
│          │   │ Specifications   [▼ Expand          ]        │ │
│          │   │   Voltage        [____________________]      │ │
│          │   │   Motor Type     [▼ Brushless       ]        │ │
│          │   │   ...                                          │ │
│          │   │                                                │ │
│          │   │ User Benefits    [+ Add Benefit]              │ │
│          │   │   1. [Long battery life              ] [🗑️]  │ │
│          │   │   2. [Brushless motor for durability ] [🗑️]  │ │
│          │   │   3. [_______________________________] [🗑️]  │ │
│          │   └──────────────────────────────────────────────┘ │
│          │                                                    │
└──────────┴────────────────────────────────────────────────────┘
     ↑ Sidebar (collapsible on mobile)
```

### 6.2 Sidebar

- Logo at top uses `logo_url` from config.
- Below logo: search input that filters collections and entries.
- Collections listed in order from `config.yml`.
- Each collection shows `label` (not `name`).
- `label_singular` used in "+ New [Label Singular]" buttons.
- At bottom: Media, Settings (if `settings` collection exists).

### 6.3 List View

- Show entries as a table or cards (Decap uses cards for large screens, compact list for small).
- Columns: derived from `sortable_fields` if present, else show identifier field + status + date.
- Status badge: `published`=green check, `draft`=yellow dot, `in_review`=orange dot, `ready`=blue dot.
- `view_filters`: render as dropdown buttons that filter the list client-side (with API fallback for large datasets).
- `view_groups`: render as group headers in the list.
- Sortable columns: click header to sort ASC/DESC.
- Pagination: 20 entries per page default.
- Search: filter by `identifier_field` or `summary` fields.
- `create: false` on a collection → hide "+ New" button.
- `delete: false` on a collection → hide Delete button in editor.
- `publish: false` on a collection → hide Publish button, status always `published`.

### 6.4 Entry Editor

**Header Bar:**
- Left: Entry title (from identifier field value, live-updating).
- Center: Status dropdown (`draft` → `in_review` → `ready` → `published`).
- Right: "Save" button (primary), "Publish" button (if status can advance), "Delete" button (danger, with confirm modal).

**Language Tabs:**
- If collection has `i18n: true`, show locale tabs: `en | zh | ar | fr | ru | es`.
- The default locale tab is active first.
- Fields with `i18n: false` are shown in ALL tabs but are LINKED — editing in one tab updates all tabs. Visually indicate this with a "🌐 Global" badge.
- Fields with `i18n: true` are per-tab.
- When saving, write the appropriate locale file(s).

**Field Rendering by Widget:**

| Widget | Render As | Validation |
|--------|-----------|------------|
| `string` | `<input type="text">` | `required`, `pattern` regex, `default` prefill |
| `text` | `<textarea rows="4">` | `required`, `default` |
| `markdown` | `<textarea rows="12">` + toggle for "Preview" which renders basic markdown to HTML below | `required`, `default` |
| `image` | `<input type="file" accept="image/*">` + `<img>` preview thumbnail + "Remove" button + "Choose existing" button that opens media modal | `required`, `media_folder`, `public_folder`, `choose_url` |
| `file` | `<input type="file">` + filename display + download link preview + "Remove" button | `required`, `media_folder`, `public_folder` |
| `select` | `<select>` with `<option>` for each item in `options` | `required`, `default` |
| `boolean` | Custom toggle switch (CSS checkbox hack or JS toggle). NOT a native checkbox. Label slides left/right. | `default` |
| `number` | `<input type="number">` | `required`, `min`, `max`, `default`, `step` |
| `datetime` | `<input type="datetime-local">` | `required`, `default`. Store in ISO 8601 format in frontmatter. |
| `list` | Repeatable container. Each item has a drag handle (optional), content field(s), and "🗑️ Remove" button. Bottom has "+ Add [label]" button. If `field` is an object, render sub-fields per item. If `field` is simple, render one input per item. | `required` (at least one item), `min`/`max` items if specified |
| `object` | Collapsible fieldset with legend = label. Contains sub-fields rendered recursively. | Sub-field validations apply |

**Hints:** Every field has a `hint` string. Render as small gray text below the input.

**Required Indication:** If `required !== false`, show a red asterisk * on the label.

### 6.5 Media Modal

When `choose_url: false` (as in config), the media modal shows:
- Upload area (drag & drop + click to select).
- Grid of existing files in the collection's `media_folder` (or default `media_folder`).
- Click to select, double-click to select and close.
- "Delete" button on each thumbnail (with confirm) — only for admin role.

Upload constraints:
- `max_file_size: 2048000` (2MB) — reject larger files with error.
- Images: auto-generate thumbnail preview.
- Files: show icon + filename.

### 6.6 Preview Pane (Optional but Recommended)

A right-side or bottom pane that renders a live preview of the entry.
- Use an `<iframe>` loading a preview template from `admin/previews/`.
- Pass current form data to the iframe via `postMessage` on every change.
- The preview template should be a simplified version of the public site's HTML.
- If no preview template exists for a collection, show a generic preview: render frontmatter as a definition list + markdown body rendered to HTML.

---

## 7. MEDIA HANDLING

### 7.1 Upload Behavior

- Store uploaded files in the folder specified by `media_folder` (or collection-level override).
- Rename files on upload to be web-safe: lowercase, accents cleaned, spaces→hyphens, special chars removed.
- Prevent overwrites: if filename exists, append `-1`, `-2`, etc. before extension.
- Store the `public_folder` path in frontmatter (e.g., `/images/uploads/photo.jpg`).
- Return the public URL in API response.

### 7.2 Folder Structure

```
images/
├── uploads/          ← default uploads
├── products/         ← product images
├── blog/             ← blog images
├── testimonials/     ← testimonial avatars
├── certificates/     ← certification scans
└── distributors/     ← distributor logos
assets/
└── downloads/        ← PDFs, manuals
```

### 7.3 Deletion

When a media file is deleted:
1. Delete the physical file.
2. Scan ALL content files for references to that path.
3. If found, remove/blank the field in those entries and log a warning.
4. Log the deletion to `admin/logs/changes.log`.

---

## 8. INDEX GENERATION (CRITICAL)

The public site reads JSON indexes to render lists (products, blogs, etc.). After ANY content change, the index must be updated.

### 8.1 Behavior

Implement `scripts/generate-index.php` (or update `generate-index.js` to be callable via API).

For each `folder` collection:
1. Scan the collection's folder (e.g., `content/products/`).
2. Read every `.md` file (or `.{locale}.md` for i18n).
3. Extract frontmatter.
4. Filter by `cms_status === 'published'` (unless rebuilding draft indexes too).
5. Build an array of summary objects containing only fields needed by the public site.
6. Write to `content/{collection}/index.json`.
7. Also write `content/{collection}/index.{locale}.json` for each locale if i18n is enabled.

Example `content/products/index.json`:
```json
[
  {
    "name": "20V Brushless Drill/Driver",
    "sku": "SY-DD-20V-BL",
    "category": "Drills & Drivers",
    "image": "/images/products/sy-dd-20v-bl.jpg",
    "inStock": true,
    "featured": true,
    "slug": "sy-dd-20v-bl"
  }
]
```

### 8.2 Trigger

- Call index rebuild automatically after `entry.save`, `entry.publish`, `entry.delete`.
- Also expose a "Rebuild Indexes" button in Settings.
- Show a toast notification: "Indexes rebuilt. 47 products published."

---

## 9. COLLECTION TYPES: FOLDER vs FILES

### 9.1 Folder Collections (e.g., `products`, `blog`)

- Many entries, each is a file.
- `slug` template defines filename.
- `create: true` allows "+ New" button.
- `delete: true` (default) allows deletion.
- `summary` template defines list view display text.

### 9.2 Files Collections (e.g., `pages`, `settings`)

- One file per defined `file` entry in config.
- `delete: false` usually — these are site-wide settings.
- No slug generation — filename is fixed in config.
- Editor opens the single file directly.
- No list view needed (or show as a simple list of fixed links).

---

## 10. SEARCH

Global search (from header):
- Search across ALL collections simultaneously.
- Search in: `identifier_field`, `title`, `name`, `sku`, `summary` fields.
- Return grouped results by collection.
- Highlight matched terms.

---

## 11. SECURITY REQUIREMENTS

### 11.1 API Security

- `api.php` must check session on every request except `login`.
- CSRF token validation on all state-changing POST requests.
- Rate limiting: max 10 login attempts per IP per hour.

### 11.2 File System Security

- NEVER allow path traversal in `slug`, `collection`, or `path` parameters.
- Sanitize ALL user inputs.
- Only allow writing inside `content/` and `images/` and `assets/downloads/`.
- Reject any path containing `..`, `//`, or absolute paths.
- Uploaded files: validate MIME type (whitelist images, PDFs). Reject executable uploads.

### 11.3 PHP Configuration

- `admin/.htaccess` should deny direct access to `lib/`, `config/`, `logs/` folders.
- PHP error display OFF in production.
- Session cookie: `httponly`, `secure` (if HTTPS), `samesite=strict`.

---

## 12. PERFORMANCE REQUIREMENTS

- Admin dashboard first paint < 2 seconds on shared hosting.
- Entry list pagination: never load more than 50 entries at once.
- Image thumbnails in media modal: generate 150x150 cached thumbnails in `images/.thumbs/` to avoid loading full-resolution images.
- YAML parsing: cache parsed `config.yml` to a PHP array file `admin/cache/config.php`. Re-parse only if `config.yml` mtime changes.

---

## 13. ERROR HANDLING & EDGE CASES

Handle these gracefully:
- `config.yml` is malformed → show error page with line number.
- Content file has malformed frontmatter → show warning, attempt to repair, allow raw editing.
- Upload exceeds `max_file_size` → clear error message, prevent save.
- `pattern` validation fails → inline red error below field, prevent save.
- Required field missing → inline error, prevent save.
- Saving while another user (hypothetically) edited the file → show "Conflict detected" with diff view (or at least warn and allow force overwrite).
- Disk full → catch PHP warning, show human error.

---

## 14. MOBILE RESPONSIVENESS

- Sidebar collapses to hamburger menu on screens < 1024px.
- Editor forms stack vertically on mobile.
- Language tabs become a dropdown on mobile.
- Touch-friendly buttons: min 44x44px tap targets.

---

## 15. IMPLEMENTATION ORDER

Build in this order. Do not proceed to next step until previous is complete and tested:

1. **Config Parser** — Read `admin/config.yml`, dump parsed structure to verify accuracy.
2. **Auth** — Login/logout/session.
3. **ContentStore** — Read/write Markdown files with frontmatter.
4. **API Endpoint** — All read-only actions (config, collections, entries, entry).
5. **Dashboard Shell** — HTML/CSS/JS layout, sidebar, routing between list/edit views.
6. **Field Widgets** — Render all widget types from config.
7. **Save/Create/Delete** — Write to filesystem.
8. **i18n** — Language tabs, multiple file writes.
9. **Editorial Workflow** — Status transitions, filtering.
10. **Media** — Upload, modal, deletion.
11. **Index Rebuild** — `generate-index.php` integration.
12. **Preview** — Live preview pane.
13. **Polish** — Search, mobile, error handling, caching, logging.

---

## 16. TESTING CHECKLIST (The AI must verify ALL of these)

- [ ] I can log in at `/admin/login.php`
- [ ] The sidebar shows all 15+ collections from config.yml in the correct order
- [ ] Clicking "Products" shows a list of existing products with correct columns
- [ ] I can click "+ New Product" and see a form with ALL fields from the config
- [ ] The form has language tabs: en, zh, ar, fr, ru, es
- [ ] Fields like `sku` (i18n: false) show a "Global" badge and editing updates all locales
- [ ] Fields like `name` (i18n: true) are per-locale
- [ ] I can upload a product image; it saves to `images/products/` and shows a thumbnail
- [ ] Saving creates `content/products/my-sku.en.md` (and `.zh.md`, `.ar.md`, etc.)
- [ ] The saved file has valid YAML frontmatter + optional markdown body
- [ ] `cms_status: draft` is set by default
- [ ] I can change status to `published` and it updates the file
- [ ] After publishing, `content/products/index.json` is rebuilt automatically
- [ ] The public `products/index.html` renders the new product correctly
- [ ] I can edit the "Homepage" settings under Pages (files collection)
- [ ] I cannot delete the "Homepage" entry (delete: false)
- [ ] Search finds entries by name/sku across collections
- [ ] Logout works and prevents dashboard access
- [ ] Mobile: sidebar collapses, forms are usable

---

## 17. DELIVERABLES SUMMARY

Provide the following files with complete, production-ready code:

1. `admin/login.php`
2. `admin/dashboard.php`
3. `admin/api.php`
4. `admin/lib/YamlParser.php` (or equivalent)
5. `admin/lib/DecapConfig.php`
6. `admin/lib/ContentStore.php`
7. `admin/lib/MediaStore.php`
8. `admin/lib/Auth.php`
9. `admin/lib/I18n.php`
10. `admin/lib/Slugifier.php`
11. `admin/lib/MarkdownSerializer.php`
12. `admin/assets/cms.css`
13. `admin/assets/cms.js`
14. `admin/.htaccess`
15. `scripts/generate-index.php`
16. `admin/config/users.php` (template with instructions)
17. Setup instructions in a comment block at the top of `dashboard.php`

**Every file must be fully functional. No stubs. No TODOs. No placeholder functions.**

---

## 18. FINAL INSTRUCTION

Treat this as a commercial product. The user is a non-technical business owner who needs to edit their website. The UI must be intuitive, errors must be clear, and nothing must break. Decap CMS cost them nothing and worked well — your replacement must work equally well without requiring Node.js, Git, or external APIs.

If any requirement is ambiguous, implement the behavior that most closely matches Decap CMS's actual UI/UX from https://decapcms.org/.

**Begin implementation now.**
