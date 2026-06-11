# COPILOT / GPT 5.2 CODEX — ASSIGNMENT
# Role: Visual/UX Specialist + B2B Feature Builder
#
# YOUR PHASES: Phase 4 (C1-C3, I2) and Phase 6 (I1, I3)
# YOU RUN: 5th (after KIMI does B1-B3) and 7th
#
# ═══════════════════════════════════════════
# BEFORE YOU START:
# ═══════════════════════════════════════════
# 1. Read .ai-tasks/PROGRESS-REBUILD.md to check what's done
# 2. Read .ai-tasks/handoff/conventions.md for code style rules
# 3. Read .ai-tasks/RULES.md for non-negotiable rules
# 4. Read FUNCTIONAL-REBUILD-PLAN.md Sections C and I for full details
# 5. If B1-B3 are not done, STOP and tell user to run KIMI first
#
# ═══════════════════════════════════════════
# PHASE 4: PRODUCT DETAIL PAGES (C1-C3, I2)
# ═══════════════════════════════════════════
#
# C1. CREATE PRODUCT DETAIL PAGE TEMPLATE
# ─────────────────────────────────────────
# File: products/product.html (NEW FILE)
# Structure:
#   a. Same header/footer as other product pages (copy from grinders.html)
#   b. Breadcrumb: Home > Products > [Category] > [Product Name]
#   c. Hero section: Product name (h1), brand, category
#   d. Two-column layout:
#      Left: Image gallery (main image + 2-3 thumbnails)
#      Right: Specifications table + "Add to Quote" button
#   e. Full description section below
#   f. "Related Products" section: 3 cards from same category
#   g. CTA: "Need bulk pricing? Request a quote" → contact.html#quote-form
# Data loading:
#   a. Read ?sku= parameter from URL
#   b. Fetch content/products/{sku}.json
#   c. If JSON exists: populate all sections
#   d. If JSON doesn't exist: show "Product not found" with link back to catalog
#   e. Use the existing cms-loader.js for JSON fetching
# Scripts: Same as other product pages (main.js, premium-motion.js, anime.min.js, animations.js)
#
# C2. UPDATE PRODUCT CARD LINKS
# ───────────────────────────────
# Files: products/index.html, products/drills-drivers.html, products/grinders.html,
#        products/sanders.html, products/saws.html, products/combo-kits.html,
#        products/impact-tools.html, index.html
# Current: All product card links go to "./index.html"
# Fix:
#   a. For each product card, find the data-quote-sku value
#   b. Change the product name <a href="./index.html"> to href="./product.html?sku={sku}"
#   c. Change the "View details" eye icon link to same product.html?sku={sku}
#   d. Keep the "Add to Quote" button as-is (it uses data-quote-add, not a link)
#   e. For index.html (homepage), use ./products/product.html?sku={sku}
#
# C3. CREATE PRODUCT JSON DATA FILES
# ─────────────────────────────────────
# Files: content/products/dd-1.json, dd-2.json, sw-1.json, etc. (NEW FILES)
# For each product visible on the site, create a JSON file:
#   {
#     "sku": "dd-1",
#     "name": "20V MAX Brushless Drill/Driver",
#     "brand": "Ningbo Siyang Pro",
#     "category": "drills-drivers",
#     "categoryLabel": "Drills & Drivers",
#     "description": "Professional-grade brushless drill driver...",
#     "specs": {
#       "Voltage": "20V",
#       "Motor": "Brushless",
#       "Max Torque": "530 in-lbs",
#       "Speed Settings": "2",
#       "Chuck Size": "1/2\"",
#       "No-Load Speed": "0-450/0-1500 RPM",
#       "Weight": "3.5 lbs (1.6 kg)"
#     },
#     "images": ["../images/istock/10001.jpg"],
#     "inStock": true,
#     "moq": "500 units",
#     "leadTime": "30-45 days"
#   }
# Extract the product data from the existing HTML product cards.
# Each card has: name, brand, description, image, SKU — use those.
# Add reasonable specs based on the product description text.
#
# I2. ADD MOQ & LEAD TIME TO PRODUCT CARDS
# ──────────────────────────────────────────
# Files: products/index.html, all category pages
# Current: Cards show name, description, rating, "In Stock"
# Fix:
#   a. Below the "In Stock" span, add:
#      <span class="text-xs text-zinc-500">MOQ: {moq}</span>
#      <span class="text-xs text-zinc-500">Lead: {leadTime}</span>
#   b. Read MOQ and lead time from data-moq and data-lead-time attributes
#   c. Add these data attributes to each product card div
#   d. Default MOQ: "500 units", default lead time: "30-45 days"
#
# ═══════════════════════════════════════════
# PHASE 6: B2B FEATURES (I1, I3)
# ═══════════════════════════════════════════
#
# I1. ADD OEM/ODM CAPABILITIES PAGE
# ───────────────────────────────────
# File: about/oem-odm.html (NEW FILE)
# Sections:
#   a. Hero: "Your Brand, Our Manufacturing Excellence"
#   b. OEM Services: Custom labeling, packaging, specifications
#   c. ODM Services: Product design, prototyping, testing
#   d. Manufacturing Process: 5-step visual
#   e. MOQ & Lead Times: Table by product category
#   f. Quality Assurance: Certifications, testing
#   g. CTA: "Discuss Your Project" → contact.html#quote-form
# Nav: Add "OEM/ODM" to About dropdown in ALL 20 HTML files
# Style: Same dark theme as other pages
#
# I3. ADD DOWNLOAD CATALOG FUNCTIONALITY
# ────────────────────────────────────────
# File: about/brochure.html
# Current: Page exists but no real download
# Fix:
#   a. Add a prominent download button
#   b. href="/assets/downloads/product-catalog.pdf" download
#   c. If PDF doesn't exist, show "Catalog coming soon — Contact us for a copy"
#   d. Add a form to request catalog by email (mailto: approach)
#
# ═══════════════════════════════════════════
# WHEN DONE:
# ═══════════════════════════════════════════
# 1. Update .ai-tasks/PROGRESS-REBUILD.md
#    - Mark C1-C3, I1-I3 as DONE
# 2. Write to .ai-tasks/HANDOFF-LOG.md
# 3. Tell user: "Copilot done. Next: Qwen 3.6 Plus for blog system (D1-D2)"
