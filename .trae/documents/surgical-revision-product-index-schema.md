# Surgical Revision: Product Index Schema Alignment

## Problem
All 5 product index JSON files have **inconsistent schemas** — each was created with different field names and missing fields compared to the English source.

### Current (broken) schemas:
| Field | en | zh | ar | fr | ru | es |
|-------|----|----|----|----|----|----|
| sku | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| name | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| brand | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| category | ✅ (slug) | ✅ (translated) | ✅ (translated) | ✅ (translated) | ✅ (translated) | ✅ (translated) |
| categoryLabel | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| description | ✅ | ❌ (has "description" but no other fields) | ❌ | ❌ | ❌ | ❌ |
| image | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| moq | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| leadTime | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| inStock | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| featured | ✅ | ✅ (named "featured") | ✅ (named "isFeatured") | ✅ (named "isFeatured") | ✅ (named "isFeatured") | ✅ (named "isFeatured") |
| compliance | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| warranty | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| userBenefits | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Target schema (match en.json):
```json
{
  "sku": "SY-XXX",
  "name": "Translated Name",
  "brand": "Ningbo Siyang / Ningbo Siyang Pro",
  "category": "english-slug",
  "categoryLabel": "Translated Label",
  "description": "Translated description",
  "image": "path",
  "moq": "XXX units",
  "leadTime": "XX-XX days",
  "inStock": true,
  "featured": false,
  "compliance": "CE, ROHS, EEC",
  "warranty": "1 year standard",
  "userBenefits": "Translated user benefits"
}
```

## Fix Steps
1. Read all 48 products from `content/products/index.json` (English source)
2. For each language (zh, ar, fr, ru, es):
   - Read existing translated file
   - Map translated fields to correct English schema keys
   - Fill missing fields from English source (non-translatable fields)
   - Ensure `category` stays as English slug (drills-drivers, grinders, etc.)
   - Ensure `categoryLabel` is translated
   - Ensure `name`, `description`, `userBenefits`, `categoryLabel` are translated
   - Ensure `brand`, `compliance`, `warranty` are copied from English source
   - Ensure `featured` (NOT `isFeatured`), `inStock`, `sku`, `image`, `moq`, `leadTime` are preserved

3. Write corrected files

## Execution
- Launch 5 parallel sub-agents, one per language
- Each sub-agent reads the English `index.json` and its own translated file
- Each sub-agent writes a corrected file with the full 14-field schema
