# 🔴 QWEN 3.6-PLUS — SURGICAL FIX PROMPT

You translated 3 of 4 new i18n groups (compare, gallery, distributors) into all 5 languages.
You did **NOT** translate the `selector` group. That is 39 strings — the entire product wizard UI.
Without these, the "Find the Right Tool" selector displays English in every language.

---

## WHAT YOU MUST TRANSLATE

File: `assets/translations/zh.json` (repeat for `ar.json`, `fr.json`, `ru.json`, `es.json`)

Every key below is currently `===` its English value. Replace each with a proper translation.

### selector.heading (1 key)
```
"heading": "Find the Right Tool"
```

### selector.step labels (7 keys)
```
"subtitle": "Tell us what you need and we'll recommend the best tool for the job."
"step1Question": "What type of work do you need to do?"
"step2Question": "What power source do you prefer?"
"step3Question": "What specific application?"
"resultsHeading": "Recommended Tools"
"viewTopPick": "View Top Pick"
"startOver": "Start Over"
"viewDetails": "View Details"
"back": "Back"
```

### selector work type options (6 keys)
```
"workDrilling": "Drilling"
"workCutting": "Cutting"
"workGrinding": "Grinding"
"workSanding": "Sanding"
"workFastening": "Fastening"
"workCombo": "Multiple (Combo)"
```

### selector power source options (3 keys)
```
"powerCordless": "Cordless (20V MAX)"
"powerCorded": "Corded"
"powerNoPref": "No preference"
```

### selector application options (22 keys)
```
"appWood": "Wood"
"appMetal": "Metal"
"appConcrete": "Concrete/Masonry"
"appGeneral": "General Purpose"
"appTile": "Tile"
"appMultiMaterial": "Multi-material"
"appStone": "Stone/Concrete"
"appSharpening": "Sharpening"
"appSurfacePrep": "Surface Prep"
"appWoodFinishing": "Wood Finishing"
"appPaintRemoval": "Paint Removal"
"appDetailWork": "Detail Work"
"appLargeSurfaces": "Large Surfaces"
"appLightDuty": "Light Duty"
"appHeavyDuty": "Heavy Duty"
"appAutomotive": "Automotive"
"appConstruction": "Construction"
"appHomeDIY": "Home DIY"
"appProfessional": "Professional"
"appIndustrial": "Industrial"
```

---

## VERIFICATION CHECKLIST

Before you mark this complete, verify:

1. **Count**: `Object.keys(json.selector).length === 39`
2. **No English copies**: For EVERY key in `selector`, `json.selector[key] !== en.selector[key]`
3. **All 5 files**: zh.json, ar.json, fr.json, ru.json, es.json — all 5 must pass check #2
4. **JSON validity**: `JSON.parse(fs.readFileSync(...))` must not throw
5. **Ar.RTL safety**: Arabic strings must render correctly with `dir="rtl"` — no Latin-left strings forced into RTL containers

---

## FAILURE DEFINITION

If ANY of these 39 keys is `=== English` in ANY of the 5 files, this task is **not done**. Do not report completion. Do not explain. Just fix it.
