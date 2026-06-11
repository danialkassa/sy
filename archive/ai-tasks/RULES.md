# NON-NEGOTIABLE RULES

**These rules apply to ALL AIs working on this project. No exceptions. No shortcuts. No skipping.**

---

## RULE 1: NO SKIP

Every sub-phase in the surgical plan MUST be executed. There are 87 sub-phases and every single one will be completed.

- A sub-phase is NOT complete until ALL its acceptance criteria pass
- If a sub-phase seems unnecessary, DISCUSS it first — do not silently skip it
- If a sub-phase is blocked, mark it as BLOCKED with a reason — do not skip it
- "We'll do it later" is not acceptable. Either do it now or formally defer with a written reason

## RULE 2: NO MINIMAL

Every task must be done COMPLETELY, not minimally.

- "Good enough" is NOT good enough
- If the task says "Add language selector to all 20 HTML pages" — it means ALL 20, not 18
- If the task says "Add hint to every field" — it means EVERY field, not most fields
- If the task says "Translate all 235 keys" — it means ALL 235, not 200
- Partial completion = INCOMPLETE. Mark it as such. Do not claim it is done.
- A field without a hint when the plan says it needs one = INCOMPLETE
- A page without the language selector when the plan says all pages = INCOMPLETE

## RULE 3: VERIFY BEFORE CLAIMING COMPLETE

No sub-phase may be marked as COMPLETE until it has been VERIFIED.

### Verification Checklist (must pass ALL):

- [ ] Every output file listed in the task actually exists on disk
- [ ] Every output file contains the expected content (not empty, not placeholder)
- [ ] No syntax errors in any modified file (valid HTML, valid CSS, valid JS, valid YAML)
- [ ] No broken references (links, paths, imports all resolve)
- [ ] No regressions (features that worked before still work)
- [ ] Cross-file consistency (e.g., CSS class used in HTML must exist in CSS)
- [ ] The acceptance criteria from the task file ALL pass
- [ ] A second read-through of every modified file confirms correctness

### Verification Method:

1. Read every output file after writing it
2. Grep for broken references
3. Run the local server and visually check if applicable
4. Only THEN mark the sub-phase as COMPLETE

## RULE 4: TEST EACH PART

Every component must be tested in isolation BEFORE integration.

- If you create a JS file, test it loads without errors
- If you create a CSS class, test it renders correctly
- If you modify an HTML page, open it in the browser
- If you create a CMS collection, verify it appears in the admin panel
- If you create a translation file, verify all keys are present and valid JSON

### Testing Protocol:

1. Write the code
2. Save the file
3. Read it back to confirm it saved correctly
4. Run the local server (if applicable)
5. Check the browser console for errors
6. Verify the specific feature works
7. Verify surrounding features still work (no regression)
8. Record test results in the progress tracker

## RULE 5: NO PLACEHOLDERS

No placeholder content is allowed in production code.

- NO "TODO" comments
- NO "FIXME" comments
- NO "placeholder" text
- NO "Lorem ipsum"
- NO empty functions with "will implement later"
- NO fake data in translation files

If you cannot complete real content, mark the sub-phase as BLOCKED — do not fill it with placeholders.

## RULE 6: NO SILENT FAILURES

If something goes wrong, REPORT it immediately.

- If a file fails to save, say so
- If a CSS override doesn't work, say so
- If a translation key can't be translated accurately, say so
- If a CMS widget doesn't behave as expected, say so
- Do NOT silently skip a broken step and move on
- Do NOT mark a broken implementation as COMPLETE

## RULE 7: ONE SUB-PHASE AT A TIME

Each AI works on ONE sub-phase at a time. Complete it fully before moving to the next.

- No parallel sub-phases within the same file (causes conflicts)
- No starting Phase 1.4.2 before 1.4.1 is verified complete
- No jumping ahead to "more interesting" tasks
- Follow the dependency map — always

## RULE 8: HANDOFF INTEGRITY

When switching between AIs, the handoff must be complete and accurate.

- The progress tracker must be updated BEFORE handing off
- The current-file-state.md must reflect reality (not hopes)
- Any issues found during verification must be documented
- The next AI must be able to pick up EXACTLY where the previous AI left off
- No assumptions — if something is unclear, ASK

## RULE 9: EVIDENCE-BASED COMPLETION

Every COMPLETE status must be backed by evidence.

- "I added the CSS class" → Show the grep result confirming it exists
- "I translated all keys" → Show the key count matching the source
- "I fixed all 20 pages" → Show the grep result confirming 20 matches
- "No errors in console" → Show the test result
- No COMPLETE status without evidence. Period.

## RULE 10: THE PROGRESS TRACKER IS LAW

The progress tracker (.ai-tasks/PROGRESS.md) is the single source of truth.

- If it says a sub-phase is IN_PROGRESS, someone is working on it
- If it says COMPLETE, it has been verified with evidence
- If it says BLOCKED, there is a documented reason
- If it says PENDING, nobody has started it yet
- No AI may change another AI's status without their output being verified
- GLM 5.1 is the only AI authorized to change COMPLETE status after verification

---

## VIOLATION CONSEQUENCES

| Violation | Action |
|-----------|--------|
| Skipping a sub-phase | Sub-phase must be redone from scratch |
| Minimal implementation | Must be completed fully before moving on |
| Claiming complete without verification | Status reverted to IN_PROGRESS, must re-verify |
| No testing | Must test and document results before proceeding |
| Placeholders | Must replace with real content immediately |
| Silent failure | Must report, fix, and re-verify |
| Parallel sub-phases causing conflicts | Both must be redone sequentially |
| Inaccurate handoff | Must re-audit all work since last accurate handoff |
| No evidence for completion | Status reverted to IN_PROGRESS until evidence provided |

---

## STATUS DEFINITIONS

| Status | Meaning | Who Can Set It |
|--------|---------|---------------|
| PENDING | Not started yet | Any AI (to claim the task) |
| IN_PROGRESS | Currently being worked on | The AI assigned to this phase |
| TESTING | Code written, currently being tested | The AI assigned to this phase |
| BLOCKED | Cannot proceed, documented reason | The AI assigned (with reason) |
| REVIEW | Done, awaiting GLM 5.1 verification | The AI assigned (after self-test) |
| COMPLETE | Verified with evidence by GLM 5.1 | GLM 5.1 ONLY |

---

## APPLIES TO

- GLM 5.1 (project lead)
- DeepSeek V4 Pro
- KIMI 2.6
- Copilot (GPT 5.2 Codex)
- Qwen 3.6 Plus
- Any future AI added to the team
