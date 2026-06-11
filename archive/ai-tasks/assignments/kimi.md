# KIMI 2.6 — ASSIGNMENT
# Role: Engineering Specialist (JS-heavy, quote cart, video)
#
# YOUR PHASES: Phase 3 (B1-B3) and Phase 7 partial (G1)
# YOU RUN: 4th (after DeepSeek does A1-A7)
#
# ═══════════════════════════════════════════
# BEFORE YOU START:
# ═══════════════════════════════════════════
# 1. Read .ai-tasks/PROGRESS-REBUILD.md to check what's done
# 2. Read .ai-tasks/handoff/conventions.md for code style rules
# 3. Read .ai-tasks/RULES.md for non-negotiable rules
# 4. Read FUNCTIONAL-REBUILD-PLAN.md Sections B and G for full details
# 5. If A1-A7 and F1-F2 are not done, STOP and tell user to run DeepSeek first
#
# ═══════════════════════════════════════════
# PHASE 3: QUOTE CART FIXES (B1-B3)
# ═══════════════════════════════════════════
#
# B1. FIX QUOTE CART SUBMISSION FLOW
# ────────────────────────────────────
# File: assets/js/quote-cart.js
# Current: buildMailtoUrl() creates mailto:support@ningbosiyang.com
# Problem: mailto: may not work on all devices, confirmation says "Sent!" prematurely
# Fix:
#   a. Change the "Send Quote Request" button area to show TWO options:
#      Option A: "Open in Email Client" → current mailto: behavior
#      Option B: "Copy Quote Details" → copies text to clipboard
#   b. Change confirmation message to be honest:
#      "Your quote request has been prepared. Send the email that was opened
#       in your email client, or paste the copied text into an email to
#       sales@ningbosiyang.com"
#   c. Add "Copy Quote Details" button that:
#      - Calls buildEmailBody() to get the text
#      - Uses navigator.clipboard.writeText()
#      - Shows "Copied to clipboard!" feedback
#   d. Add fallback: if mailto: fails (detected by 3-second timeout),
#      auto-show the clipboard option
#   e. Use SITE_CONFIG.email as recipient (from site-config.js)
#
# B2. ADD QUOTE CART QUANTITY EDITING
# ────────────────────────────────────
# File: assets/js/quote-cart.js
# Current: +/- buttons only add/subtract 1
# Fix:
#   a. Replace +/- buttons with a number input field
#   b. Attributes: type="number" min="1" max="10000" step="1"
#   c. On input change: update cart in localStorage
#   d. Re-render the drawer content after change
#   e. Keep +/- buttons as secondary controls around the input
#
# B3. ADD QUOTE CART "NOTES" FIELD
# ─────────────────────────────────
# File: assets/js/quote-cart.js
# Current: No notes field in quote drawer
# Fix:
#   a. Add a <textarea> in the quote drawer before the Send button
#   b. Label: "Additional Requirements (MOQ, custom branding, packaging, etc.)"
#   c. Placeholder: "E.g., Need custom packaging, specific plug type, CE marking..."
#   d. Include the notes in buildEmailBody() output
#   e. Include the notes in clipboard copy
#
# ═══════════════════════════════════════════
# PHASE 7: VIDEO FIX (G1)
# ═══════════════════════════════════════════
#
# G1. FIX HERO VIDEO OR REMOVE IT
# ────────────────────────────────
# File: index.html
# Current: <video src="https://cdn.coverr.co/..."> — blocked by CORS
# Fix:
#   a. Remove the <video> element entirely
#   b. Replace with a static hero background image
#   c. Use the existing hero slide image as background
#   d. Keep the hero text overlay exactly as is
#   e. Remove the video error fallback JS (no longer needed)
#
# ═══════════════════════════════════════════
# WHEN DONE:
# ═══════════════════════════════════════════
# 1. Update .ai-tasks/PROGRESS-REBUILD.md
#    - Mark B1-B3, G1 as DONE
# 2. Write to .ai-tasks/HANDOFF-LOG.md
# 3. Tell user: "KIMI done. Next: Copilot/GPT 5.2 for product pages (C1-C3, I2)"
