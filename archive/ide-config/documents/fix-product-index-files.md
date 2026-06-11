# Fix Product Index Files & Category Translation

## Issues to Fix

### Critical: Product index files missing 47 products
- `content/products/index.{zh,ar,fr,ru,es}.json` each contain only 1 product (SY-DD-20V-BL)
- Must include all 48 products from `content/products/SY-*.json` files

### Medium: Category labels not translated
- `category` field kept as English (e.g., "Drills & Drivers")
- Plan requires category labels translated in all 5 languages

---

## Step 1: Read all 48 source product files
- Read all 48 `content/products/SY-*.json` files to extract `name`, `sku`, `category`, `tagline`, `image`, `brand`, `moq`, `leadTime`, `isFeatured`
- Build a master product list with all fields

## Step 2: Translate all 48 products into 5 languages
- Translate `name` and `tagline` for each product into:
  - **zh** (Simplified Chinese) — professional engineering terms
  - **ar** (Modern Standard Arabic) — فصحى, Western numerals
  - **fr** (International French) — formal register
  - **ru** (Standard Russian) — formal, "Аккумуляторный" for cordless
  - **es** (International Spanish) — neutral, "a batería" for cordless

## Step 3: Translate category labels into 5 languages
- "Drills & Drivers" → 钻/起子机 / مثاقب ومفكات / Perceuses & Visseuses / Дрели и Шуруповерты / Taladros y Destornilladores
- "Saws" → 锯类工具 / مناشير / Scies / Пилы / Sierras
- "Grinders" → 磨光机 / آلات طحن / Meuleuses / Шлифмашины / Amoladoras
- "Sanders" → 砂光机 / آلات صنفرة / Ponceuses / Шлифовальные машины / Lijadoras
- "Impact Tools" → 冲击工具 / أدوات الصدمات / Outils d'impact / Ударные инструменты / Herramientas de Impacto
- "Combo Kits" → 组合套件 / مجموعات الأدوات / Kits Combinés / Комбинированные наборы / Kits de Herramientas

## Step 4: Write 5 product index JSON files
- `content/products/index.zh.json` — 48 products, Chinese names/taglines/categories
- `content/products/index.ar.json` — 48 products, Arabic names/taglines/categories
- `content/products/index.fr.json` — 48 products, French names/taglines/categories
- `content/products/index.ru.json` — 48 products, Russian names/taglines/categories
- `content/products/index.es.json` — 48 products, Spanish names/taglines/categories
- Keep `sku`, `image`, `brand`, `moq`, `leadTime`, `isFeatured` unchanged

## Step 5: Verify
- Validate all 5 JSON files
- Confirm 48 products per file
- Confirm category fields are translated
- Confirm technical fields unchanged

## Execution Strategy
- Use a sub-agent to read all 48 source files, translate, and write all 5 index files in a single pass
- Process all 5 languages in parallel with separate sub-agents for performance
