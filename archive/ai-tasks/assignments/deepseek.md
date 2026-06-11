# DEEPSEEK V4 PRO — ASSIGNMENT
# Role: Information Architecture + Contact Page Specialist
#
# YOUR PHASES: Phase 1 (F1-F2) and Phase 2 (A1-A7)
# YOU RUN: 2nd (after Qwen does J1-J2) and 3rd
#
# ═══════════════════════════════════════════
# BEFORE YOU START:
# ═══════════════════════════════════════════
# 1. Read .ai-tasks/PROGRESS-REBUILD.md to check what's done
# 2. Read .ai-tasks/handoff/conventions.md for code style rules
# 3. Read .ai-tasks/RULES.md for non-negotiable rules
# 4. Read FUNCTIONAL-REBUILD-PLAN.md Sections F and A for full details
# 5. If J1-J2 are not done yet, STOP and tell the user to run Qwen first
#
# ═══════════════════════════════════════════
# PHASE 1: NAVIGATION FIX (F1-F2)
# ═══════════════════════════════════════════
#
# F1. RESTRUCTURE NAVIGATION — ALL 20 HTML FILES
# ─────────────────────────────────────────
# Current desktop nav: Home | Products ▼ | About ▼ | Contact Us | Get a Quote
# Target desktop nav:  Home | Products ▼ | About ▼ | Contact | Request Quote
#
# Exact changes per file:
#   a. Top bar: Remove "Support" link (redundant)
#   b. Top bar: Keep phone number, add email next to it
#   c. Main nav: "Contact Us" → "Contact"
#   d. Main nav: "Get a Quote" → "Request Quote"
#   e. "Request Quote" href → contact.html#quote-form
#   f. Mobile nav: Same label changes
#   g. Mobile nav: Same href changes
#
# Files to modify (20 total):
#   - index.html (paths: ./contact.html)
#   - contact.html, privacy.html, terms.html (paths: ./contact.html)
#   - products/*.html (7 files, paths: ../contact.html)
#   - about/*.html (6 files, paths: ../contact.html)
#   - blogs/*.html (2 files, paths: ../contact.html)
#
# F2. ADD ANCHOR SECTIONS TO CONTACT PAGE
# ─────────────────────────────────────────
# File: contact.html
#   a. Add id="contact-info" to the contact cards section div
#   b. Add id="quote-form" to the quote request form section
#   c. Add id="office-location" to the map/directions section
#   d. Verify: contact.html#quote-form scrolls to form on load
#
# ═══════════════════════════════════════════
# PHASE 2: CONTACT PAGE FUNCTIONALITY (A1-A7)
# ═══════════════════════════════════════════
#
# A1. FIX CONTACT FORM SUBMISSION
# ──────────────────────────────
# File: contact.html
# Current: <form action="/contact" method="post">
# Fix:
#   a. Remove action="/contact" and method="post"
#   b. Add id="contact-form" to the form
#   c. Add onsubmit="return handleContactSubmit(event)"
#   d. Add JS function handleContactSubmit(e) that:
#      - e.preventDefault()
#      - Validates: name not empty, email has @, message not empty
#      - Shows inline error below each invalid field
#      - Builds mailto: with subject "Contact Form: {subject}"
#      - Body includes name, email, and message
#      - Uses SITE_CONFIG.email as recipient (from site-config.js)
#      - Opens via window.location.href = mailtoUrl
#      - Shows success message after 1 second
#      - Disables button during send, re-enables after
#   e. If SITE_CONFIG is not available (J1 not done), use fallback email
#
# A2. FIX "CALL US" CARD
# ──────────────────────
# File: contact.html
# Current: <a href="tel:+8657488888888">
# Fix:
#   a. Replace hard-coded phone with data-site-phone attribute
#   b. The site-config.js loader (J2) will populate this
#   c. If J2 not done yet, keep the tel: link but add a comment:
#      <!-- TODO: Replace with real phone number via SITE_CONFIG -->
#
# A3. FIX "EMAIL US" CARD
# ───────────────────────
# File: contact.html
# Current: <a href="mailto:support@ningbosiyang.com">
# Fix:
#   a. Replace hard-coded email with data-site-email attribute
#   b. If J2 not done, keep mailto: link with TODO comment
#
# A4. FIX "VISIT US" CARD
# ───────────────────────
# File: contact.html
# Current: Shows address text only
# Fix:
#   a. Add "Get Directions" link below address
#   b. href="https://www.google.com/maps/search/Ningbo+Siyang+Power+Tools+Ningbo+China"
#   c. target="_blank" rel="noopener noreferrer"
#   d. Add a placeholder map image (gray rectangle with "Map" text)
#
# A5. FIX "BUSINESS HOURS" CARD
# ─────────────────────────────
# File: contact.html
# Current: "Mon-Fri: 8:00 AM - 5:00 PM (CST)"
# Fix:
#   a. Add "(China Standard Time, UTC+8)" after hours
#   b. Add "Closed on Chinese public holidays" line
#   c. Add "Schedule a Call" link → mailto: with subject "Call Schedule Request"
#
# A6. FIX NEWSLETTER SUBSCRIBE
# ────────────────────────────
# Files: contact.html, index.html (footer)
# Current: <form action="#subscribe"> or no action
# Fix:
#   a. Remove <form> wrapper
#   b. Keep input + button
#   c. On button click: build mailto: with subject "Newsletter Subscription"
#      and body "Please add {email} to the Ningbo Siyang newsletter."
#   d. Show "Subscription request sent!" message
#
# A7. FIX SOCIAL MEDIA LINKS
# ──────────────────────────
# Files: All 20 HTML files (footer section)
# Current: facebook.com/ningbosiyang, twitter.com/ningbosiyang, linkedin.com/company/ningbosiyang
# Fix:
#   a. Remove Facebook, Twitter, LinkedIn icons (likely fake accounts)
#   b. Add WeChat icon → on click shows QR code image in a modal/tooltip
#   c. Add WhatsApp icon → href="https://wa.me/{phone}" (uses SITE_CONFIG)
#   d. If no real social accounts exist, having WeChat + WhatsApp is better
#      than 3 broken Western social links for a Chinese manufacturer
#
# ═══════════════════════════════════════════
# WHEN DONE:
# ═══════════════════════════════════════════
# 1. Update .ai-tasks/PROGRESS-REBUILD.md
#    - Mark F1, F2, A1-A7 as DONE
#    - Add notes about any issues found
# 2. Write to .ai-tasks/HANDOFF-LOG.md:
#    - What you completed
#    - What the next AI (KIMI 2.6) needs to know
#    - Any blockers or issues
# 3. Tell the user: "DeepSeek done. Next: KIMI 2.6 for quote cart (B1-B3)"
