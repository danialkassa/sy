# QWEN 3.6 PLUS — ASSIGNMENT
# Role: Systematic Infrastructure + CMS Expert
#
# YOUR PHASES: Phase 1 (J1-J2), Phase 5 (D1-D2), Phase 8 (H1-H3)
# YOU RUN: 1st (foundation), 6th (blog), 9th (CMS)
#
# ═══════════════════════════════════════════
# BEFORE YOU START (PHASE 1):
# ═══════════════════════════════════════════
# 1. Read .ai-tasks/PROGRESS-REBUILD.md to check what's done
# 2. Read .ai-tasks/handoff/conventions.md for code style rules
# 3. Read .ai-tasks/RULES.md for non-negotiable rules
# 4. Read FUNCTIONAL-REBUILD-PLAN.md Sections J, D, H for full details
# 5. You are FIRST — nothing needs to be done before you start
#
# ═══════════════════════════════════════════
# PHASE 1: SITE CONFIGURATION (J1-J2)
# ═══════════════════════════════════════════
#
# J1. CREATE SITE CONFIGURATION FILE
# ─────────────────────────────────────
# File: assets/js/site-config.js (NEW FILE)
# Contents:
#   var SITE_CONFIG = {
#     companyName: 'Ningbo Siyang',
#     phone: '+86-574-XXXX-XXXX',
#     phoneDisplay: '+86 574 XXXX XXXX',
#     email: 'sales@ningbosiyang.com',
#     address: 'Ningbo Industrial Zone, Zhejiang 315000, China',
#     whatsapp: '+8657488888888',
#     wechatQR: '/assets/images/wechat-qr.png',
#     socialLinks: {
#       facebook: '',
#       twitter: '',
#       linkedin: '',
#       wechat: '/assets/images/wechat-qr.png'
#     },
#     businessHours: 'Mon-Fri: 8:00 AM - 5:00 PM (CST, UTC+8)',
#     moq: { default: '500 units' },
#     leadTime: { default: '30-45 days', custom: '60-90 days' }
#   };
# IMPORTANT:
#   - Use var, not const/let (for maximum browser compatibility)
#   - Phone/email use placeholder XXXX — owner replaces via CMS later
#   - This file must be loaded BEFORE other scripts
#
# J2. UPDATE ALL PAGES TO USE SITE_CONFIG
# ──────────────────────────────────────────
# Files: All 20 HTML files
# Changes:
#   a. Add <script src="[path]site-config.js"></script> to every page
#      - Root pages: ./assets/js/site-config.js
#      - Subdirectory pages: ../assets/js/site-config.js
#   b. Place it BEFORE main.js in the script loading order
#   c. Add a loader function at the end of main.js:
#      function applySiteConfig() {
#        if (typeof SITE_CONFIG === 'undefined') return;
#        document.querySelectorAll('[data-site-phone]').forEach(function(el) {
#          el.textContent = SITE_CONFIG.phoneDisplay;
#          if (el.tagName === 'A') el.href = 'tel:' + SITE_CONFIG.phone;
#        });
#        document.querySelectorAll('[data-site-email]').forEach(function(el) {
#          el.textContent = SITE_CONFIG.email;
#          if (el.tagName === 'A') el.href = 'mailto:' + SITE_CONFIG.email;
#        });
#        document.querySelectorAll('[data-site-address]').forEach(function(el) {
#          el.textContent = SITE_CONFIG.address;
#        });
#        document.querySelectorAll('[data-site-hours]').forEach(function(el) {
#          el.textContent = SITE_CONFIG.businessHours;
#        });
#        document.querySelectorAll('[data-site-company]').forEach(function(el) {
#          el.textContent = SITE_CONFIG.companyName;
#        });
#      }
#      applySiteConfig();
#   d. Do NOT replace all hard-coded values in HTML yet — just add the
#      mechanism. Other AIs will use data-site-* attributes in their work.
#   e. But DO replace the phone number in the top bar of all pages:
#      Change the hard-coded "+86 574 8888 8888" to use data-site-phone
#
# ═══════════════════════════════════════════
# PHASE 5: BLOG SYSTEM (D1-D2)
# ═══════════════════════════════════════════
# (Run this AFTER Copilot finishes C1-C3)
#
# D1. FIX BLOG POST LINKS
# ─────────────────────────
# File: blogs/index.html
# Current: All blog cards link to post.html
# Fix:
#   a. Each blog card should link to post.html?slug={slug}
#   b. The slug comes from the blog's frontmatter
#   c. Read content/blog/index.json to get the slugs
#   d. Update each card's href to include ?slug= parameter
#
# D2. MAKE post.html LOAD DYNAMIC CONTENT
# ─────────────────────────────────────────
# File: blogs/post.html
# Current: Static HTML with one hardcoded blog post
# Fix:
#   a. Add JavaScript at the bottom that:
#      - Reads ?slug= from URL
#      - Fetches content/blog/{slug}.md
#      - Parses frontmatter (between --- delimiters)
#      - Renders markdown body to HTML
#      - Populates: title, date, author, category, featured image, body
#      - If slug not found: shows "Post not found" with link to blog index
#   b. Use the existing cms-loader.js for markdown parsing
#   c. Update page <title> and meta tags from frontmatter
#   d. Add proper structured data (JSON-LD) for the blog post
#
# ═══════════════════════════════════════════
# PHASE 8: CMS (H1-H3)
# ═══════════════════════════════════════════
# (Run this LAST, after all other phases are done)
#
# H1. VERIFY CMS ADMIN ACCESS
# ─────────────────────────────
# Steps:
#   a. Ensure the site is deployed on DigitalOcean
#   b. Navigate to http://165.22.250.66/admin/
#   c. Click "Login with Gitea"
#   d. Verify OAuth redirect works
#   e. If it fails: debug the OAuth callback URL
#   f. Document any issues found
#
# H2. TEST CMS CONTENT EDITING
# ──────────────────────────────
# Steps:
#   a. In CMS dashboard, click "Products" collection
#   b. Edit an existing product → Save → verify markdown updates
#   c. Click "Blog" → "New Post" → Fill in → Save → verify .md created
#   d. Test image upload in CMS
#   e. Document any issues found
#
# H3. ADD MISSING CMS COLLECTIONS
# ─────────────────────────────────
# File: admin/config.yml
# Add these collections:
#   1. testimonials — name, company, quote, avatar, rating (1-5)
#   2. team_members — name, title, photo, bio, order
#   3. certifications — name, issuer, cert_number, image, year
#   4. faq — question, answer, category, order
#   5. partners — name, logo, website, order
# Each collection needs: name, label, folder, create, slug, fields
#
# ═══════════════════════════════════════════
# WHEN DONE (each phase):
# ═══════════════════════════════════════════
# 1. Update .ai-tasks/PROGRESS-REBUILD.md
#    - Mark completed tasks as DONE
# 2. Write to .ai-tasks/HANDOFF-LOG.md
# 3. After Phase 1: "Qwen Phase 1 done. Next: DeepSeek for navigation (F1-F2)"
# 4. After Phase 5: "Qwen Phase 5 done. Next: Copilot for B2B features (I1, I3)"
# 5. After Phase 8: "ALL PHASES COMPLETE. Site is functional."
