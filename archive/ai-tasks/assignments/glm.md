# GLM 5.1 — ASSIGNMENT
# Role: Strategic Coordination + Honest UX
#
# YOUR PHASES: Phase 7 (E1, G1 partial)
# YOU RUN: 8th (after Copilot does I1, I3)
#
# ═══════════════════════════════════════════
# BEFORE YOU START:
# ═══════════════════════════════════════════
# 1. Read .ai-tasks/PROGRESS-REBUILD.md to check what's done
# 2. Read .ai-tasks/handoff/conventions.md for code style rules
# 3. Read .ai-tasks/RULES.md for non-negotiable rules
# 4. Read FUNCTIONAL-REBUILD-PLAN.md Section E for full details
# 5. If I1, I3 are not done, STOP and tell user to run Copilot first
#
# ═══════════════════════════════════════════
# PHASE 7: FAKE CHAT → REAL MESSAGING (E1)
# ═══════════════════════════════════════════
#
# E1. REPLACE FAKE CHAT WITH REAL MESSAGING LINKS
# ─────────────────────────────────────────────────
# Files: All 20 HTML files (the chat widget is in every page's footer)
# Current: A button with aria-label="Open chat support" + red "1" badge
#          Clicking does nothing.
# Problem: Deceptive — implies live chat exists when it doesn't.
# Fix:
#   a. Remove the fake chat button entirely from all pages
#   b. Remove the red "1" notification badge
#   c. Replace with a floating action button (FAB) that expands on click:
#      - Button: Yellow circle with message icon (same style as current)
#      - On click: Expands to show 3 options vertically:
#        1. "WhatsApp" → href="https://wa.me/{phone}" (from SITE_CONFIG)
#           Icon: WhatsApp SVG, green color
#        2. "Email Us" → href="mailto:{email}" (from SITE_CONFIG)
#           Icon: Email SVG, yellow color
#        3. "WeChat" → On click shows QR code image
#           Icon: WeChat SVG, green color
#      - Clicking outside the expanded options closes them
#      - The FAB should be in the same position (bottom-right)
#      - On mobile: 56px from bottom-right edges
#      - On desktop: Same position
#   d. Add the FAB HTML to all 20 pages (same location as current chat)
#   e. Add the FAB JavaScript to main.js:
#      - Toggle expand/collapse on click
#      - Close on outside click
#      - Close on Escape key
#      - Use SITE_CONFIG for phone/email links
#
# ═══════════════════════════════════════════
# WHEN DONE:
# ═══════════════════════════════════════════
# 1. Update .ai-tasks/PROGRESS-REBUILD.md
#    - Mark E1 as DONE
# 2. Write to .ai-tasks/HANDOFF-LOG.md
# 3. Tell user: "GLM done. Next: Qwen 3.6 Plus for CMS (H1-H3) — FINAL PHASE"
