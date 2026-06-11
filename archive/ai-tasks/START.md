# SMART AI SWITCHING SYSTEM — Functional Rebuild
#
# HOW IT WORKS:
# 1. You open ANY of the 5 AIs
# 2. You paste ONE line: "Read .ai-tasks/START.md and execute your assignment"
# 3. The AI reads START.md → finds its name → reads its assignment file
# 4. The AI checks PROGRESS-REBUILD.md to see what's already done
# 5. The AI does its tasks → updates PROGRESS-REBUILD.md
# 6. When done, the AI writes a handoff note in HANDOFF-LOG.md
# 7. You open the NEXT AI → same one-line instruction
# 8. The next AI reads progress → picks up where the previous left off
#
# YOU NEVER NEED TO:
# - Manually explain what each AI should do
# - Remember which phase we're on
# - Copy-paste code between AIs
# - Track what's done vs not done
#
# YOU ONLY NEED TO:
# - Open the AI
# - Paste: "Read .ai-tasks/START.md and execute your assignment"
# - Review the result
# - Move to the next AI
#
# AI EXECUTION ORDER (follows the Functional Rebuild Plan phases):
#
# PHASE 1 (Foundation):
#   1. Qwen 3.6 Plus  → J1, J2 (site config system)
#   2. DeepSeek V4 Pro → F1, F2 (navigation fix)
#
# PHASE 2 (Contact Page):
#   3. DeepSeek V4 Pro → A1-A7 (contact page functionality)
#
# PHASE 3 (Quote Cart):
#   4. KIMI 2.6 → B1-B3 (quote cart fixes)
#
# PHASE 4 (Product System):
#   5. Copilot/GPT 5.2 → C1-C3, I2 (product detail pages + MOQ)
#
# PHASE 5 (Blog System):
#   6. Qwen 3.6 Plus → D1-D2 (blog routing)
#
# PHASE 6 (B2B Features):
#   7. Copilot/GPT 5.2 → I1, I3 (OEM/ODM + catalog)
#
# PHASE 7 (Cleanup):
#   8. GLM 5.1 → E1, G1 (chat → messaging, video fix)
#
# PHASE 8 (CMS):
#   9. Qwen 3.6 Plus → H1-H3 (CMS testing + collections)
