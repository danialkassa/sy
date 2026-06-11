# QWEN 3.6-PLUS — TRANSLATIONS, SEO & CONTENT

**Project:** Ningbo Siyang B2B Power Tools Platform
**Location:** `c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website`
**AI:** Qwen 3.6-plus
**Role:** Full Multilingual Translation, International SEO, Content Creation
**Working alongside:** GLM 5.1 (Infrastructure + CMS Core) and GPT-5.3 Codex (CMS Advanced + Interactive Tools)

---

## YOUR DOMAIN — FILES YOU OWN

You are the ONLY AI touching these files. No other AI will modify them.

### New Files You Create
| File | Purpose |
|------|---------|
| `assets/translations/zh.json` | Simplified Chinese translations (235+ keys) |
| `assets/translations/ar.json` | Arabic translations (235+ keys) |
| `assets/translations/fr.json` | French translations (235+ keys) |
| `assets/translations/ru.json` | Russian translations (235+ keys) |
| `assets/translations/es.json` | Spanish translations (235+ keys) |
| `content/blog/choosing-cordless-power-tools.zh.md` | Chinese blog post |
| `content/blog/choosing-cordless-power-tools.ar.md` | Arabic blog post |
| `content/blog/choosing-cordless-power-tools.fr.md` | French blog post |
| `content/blog/choosing-cordless-power-tools.ru.md` | Russian blog post |
| `content/blog/choosing-cordless-power-tools.es.md` | Spanish blog post |
| `content/blog/b2b-sourcing-power-tools.zh.md` | Chinese blog post |
| `content/blog/b2b-sourcing-power-tools.ar.md` | Arabic blog post |
| `content/blog/b2b-sourcing-power-tools.fr.md` | French blog post |
| `content/blog/b2b-sourcing-power-tools.ru.md` | Russian blog post |
| `content/blog/b2b-sourcing-power-tools.es.md` | Spanish blog post |
| `content/blog/oem-odm-manufacturing.zh.md` | Chinese blog post |
| `content/blog/oem-odm-manufacturing.ar.md` | Arabic blog post |
| `content/blog/oem-odm-manufacturing.fr.md` | French blog post |
| `content/blog/oem-odm-manufacturing.ru.md` | Russian blog post |
| `content/blog/oem-odm-manufacturing.es.md` | Spanish blog post |
| `content/blog/index.zh.json` | Chinese blog index |
| `content/blog/index.ar.json` | Arabic blog index |
| `content/blog/index.fr.json` | French blog index |
| `content/blog/index.ru.json` | Russian blog index |
| `content/blog/index.es.json` | Spanish blog index |
| `content/products/index.zh.json` | Chinese product index |
| `content/products/index.ar.json` | Arabic product index |
| `content/products/index.fr.json` | French product index |
| `content/products/index.ru.json` | Russian product index |
| `content/products/index.es.json` | Spanish product index |
| `content/testimonials/index.json` | Testimonials data (Makita gap) |
| `content/case-studies/index.json` | Case studies data (Makita gap) |

### Existing Files You Modify (HEAD SECTION ONLY)
| File | What You Change |
|------|-----------------|
| All 22 HTML files — `<head>` section only | Add hreflang tags, alternate language links, translated OG tags |
| `sitemap.xml` | Add language-specific URLs |

### Files You DO NOT Touch (Other AI's Domain)
| File | Owner |
|------|-------|
| `assets/js/i18n.js` | GLM 5.1 |
| `assets/js/search.js` | GLM 5.1 |
| `assets/js/product-filters.js` | GLM 5.1 |
| `assets/translations/en.json` | GLM 5.1 |
| `admin/config.yml` | GLM 5.1 |
| `admin/index.html` | GPT-5.3 Codex |
| `admin/cms-theme.css` | GPT-5.3 Codex |
| `admin/previews/*.js` | GPT-5.3 Codex |
| `admin/widgets/*.js` | GPT-5.3 Codex |
| `products/product.html` body content | GPT-5.3 Codex |
| `assets/css/styles.css` | GPT-5.3 Codex |
| `assets/js/product-gallery.js` | GPT-5.3 Codex |
| `assets/js/product-compare.js` | GPT-5.3 Codex |
| `assets/js/product-selector.js` | GPT-5.3 Codex |
| `about/warranty.html` | GLM 5.1 |
| `about/safety.html` | GLM 5.1 |
| `content/products/SY-*.json` | GLM 5.1 |

---

## PROJECT CONTEXT

This is a **B2B power tools manufacturer website** for Ningbo Siyang, a Chinese company selling to international distributors and wholesalers. The target audience is:
- **Distributors** in the Middle East, Europe, Africa, South America, and Southeast Asia
- **Wholesale buyers** looking for OEM/ODM manufacturing
- **Procurement managers** at construction and industrial companies

**Critical context for translations:**
- This is NOT a consumer/retail site — use professional B2B terminology
- "Quote" not "Price", "Inquiry" not "Order", "Distributor" not "Customer"
- Technical power tool terminology must be accurate in each language
- Arabic must be Modern Standard Arabic (فصحى), not dialectal
- Chinese must be Simplified Chinese (简体中文), not Traditional
- French must be International French, not Canadian French
- Russian must be standard Russian, not Ukrainian
- Spanish must be International Spanish (neutral), not Spain-specific

**The i18n system** (built by GLM 5.1) works as follows:
- Translation files are loaded from `/assets/translations/{lang}.json`
- HTML elements have `data-i18n="key.subkey"` attributes
- The `i18n.js` engine replaces text content with translated strings
- Language is detected from URL param `?lang=zh`, localStorage, or browser settings
- `<html dir="rtl">` is set automatically for Arabic

---

## PHASE 1: TRANSLATION FILES — 5 LANGUAGES

### Task 1.1 — Create `assets/translations/zh.json` (Simplified Chinese)

Translate ALL 235+ keys from `en.json` (created by GLM 5.1) into Simplified Chinese.

**Translation guidelines for Chinese:**
- Use professional B2B manufacturing terminology
- Technical terms: Use standard Chinese engineering terms, NOT transliterations
  - "Brushless motor" → "无刷电机" (not "布拉什莱斯电机")
  - "Torque" → "扭矩" (not "托克")
  - "Chuck" → "夹头" (not "查克")
  - "Cordless" → "无绳" or "充电式" (not "科德莱斯")
  - "Impact driver" → "冲击起子" or "冲击扳手"
  - "Circular saw" → "圆锯"
  - "Angle grinder" → "角磨机"
  - "Orbital sander" → "轨道砂光机"
  - "MOQ" → "最小起订量"
  - "Lead time" → "交货期"
  - "OEM/ODM" → keep as-is (universally understood)
  - "FOB/CIF" → keep as-is (Incoterms)
  - "Quote" → "报价"
  - "Inquiry" → "询价"
- Company name: "宁波思扬" (not transliterated)
- Brand name: "思扬 Pro" (not transliterated)
- Keep technical abbreviations: SKU, RPM, Nm, dB, V, mm, kg
- Do NOT translate: URLs, email addresses, phone numbers, SKU codes

**Key translations to get RIGHT:**

| English | Chinese | Notes |
|---------|---------|-------|
| Request Quote | 请求报价 | NOT "要求价格" |
| Add to Quote | 加入报价单 | NOT "加到引语" |
| Quick Inquiry | 快速询价 | NOT "快速调查" |
| Send Inquiry | 发送询价 | NOT "发送调查" |
| Quote Cart | 报价单 | NOT "引语购物车" |
| Volume Pricing | 阶梯定价 | NOT "音量定价" |
| Lead Time | 交货期 | NOT "领先时间" |
| MOQ | 最小起订量 | NOT "最低订单数量" |
| Brushless | 无刷 | NOT "刷子少的" |
| Cordless | 无绳/充电式 | NOT "没有绳子的" |
| Impact Driver | 冲击起子 | NOT "影响驱动器" |
| Circular Saw | 圆锯 | NOT "圆形锯子" |
| Angle Grinder | 角磨机 | NOT "角度研磨机" |
| Warranty | 质保 | NOT "保证" |
| Safety & Compliance | 安全与合规 | NOT "安全与服从" |
| Distributor | 经销商 | NOT "分配器" |
| Trade Terms | 贸易条款 | NOT "交易术语" |
| Payment Methods | 付款方式 | NOT "支付方法" |
| OEM/ODM Capabilities | OEM/ODM制造能力 | Keep acronyms |
| Certifications & Quality | 认证与质量 | NOT "证书和质量" |

**Acceptance Criteria:**
- [ ] All 235+ keys from en.json are translated
- [ ] Professional B2B manufacturing terminology used throughout
- [ ] Technical terms use standard Chinese engineering vocabulary
- [ ] No machine-translation artifacts (literal translations of idioms)
- [ ] JSON is valid (no syntax errors, proper escaping)
- [ ] Same nested structure as en.json
- [ ] Interpolation syntax `{{variable}}` preserved exactly
- [ ] No HTML tags in translation values

### Task 1.2 — Create `assets/translations/ar.json` (Arabic)

Translate ALL 235+ keys into Modern Standard Arabic (فصحى).

**Translation guidelines for Arabic:**
- Use Modern Standard Arabic ONLY — no dialects (no Egyptian, Levantine, Gulf dialect)
- Technical terms: Use standard Arabic engineering terms
  - "Brushless motor" → "محرك فرشاتي" or "محرك بدون فرش"
  - "Torque" → "عزم الدوران"
  - "Chuck" → "مقبض الحفر" or "فك"
  - "Cordless" → "لا سلكي" or "بالشحن"
  - "Impact driver" → "مفك صدمي" or "دريل صدمي"
  - "Circular saw" → "منشار دائري"
  - "Angle grinder" → "مطحنة زاوية" or "جلاخة زاوية"
  - "MOQ" → "الحد الأدنى للطلب"
  - "Lead time" → "مدة التسليم"
  - "Quote" → "عرض سعر"
  - "Inquiry" → "استفسار"
- Company name: "نينغبو سيانغ" (نينغبو سيانغ لأدوات الطاقة)
- Keep technical abbreviations: SKU, RPM, Nm, dB, V, mm, kg
- Do NOT translate: URLs, email addresses, phone numbers, SKU codes
- Arabic text direction: RTL — but the JSON values are just text strings. The RTL direction is handled by the i18n.js engine setting `<html dir="rtl">`
- Numbers in Arabic: Use Western Arabic numerals (0-9), NOT Eastern Arabic numerals (٠-٩) — this is standard for technical/engineering content in Arabic

**Key translations to get RIGHT:**

| English | Arabic | Notes |
|---------|--------|-------|
| Request Quote | طلب عرض سعر | NOT "طلب اقتباس" |
| Add to Quote | إضافة إلى عرض السعر | NOT "أضف إلى الاقتباس" |
| Quick Inquiry | استفسار سريع | NOT "تحقيق سريع" |
| Send Inquiry | إرسال استفسار | NOT "إرسال تحقيق" |
| Quote Cart | سلة عروض الأسعار | NOT "سلة الاقتباسات" |
| Volume Pricing | تسعير الكميات | NOT "تسعير الحجم" |
| Lead Time | مدة التسليم | NOT "وقت القيادة" |
| MOQ | الحد الأدنى للطلب | NOT "كمية الطلب الدنيا" |
| Brushless | بدون فرش | NOT "بدون فرشاة" |
| Cordless | لا سلكي | NOT "بدون حبل" |
| Impact Driver | مفك صدمي | NOT "سائق التأثير" |
| Warranty | ضمان | NOT "كفالة" |
| Safety & Compliance | السلامة والامتثال | NOT "الأمان والطاعة" |
| Distributor | موزع | NOT "موزع كهرباء" |
| Trade Terms | شروط التجارة | NOT "مصطلحات التجارة" |
| Payment Methods | طرق الدفع | NOT "طرق الدفع" — this one is correct |
| OEM/ODM Capabilities | قدرات التصميم والتصنيع | NOT "قدرات OEM/ODM" — expand the acronyms |

**Acceptance Criteria:**
- [ ] All 235+ keys translated into Modern Standard Arabic
- [ ] No dialectal Arabic (no Egyptian, Gulf, Levantine)
- [ ] Western Arabic numerals (0-9) used, NOT Eastern (٠-٩)
- [ ] Professional B2B terminology throughout
- [ ] Technical terms use standard Arabic engineering vocabulary
- [ ] JSON is valid
- [ ] Same nested structure as en.json

### Task 1.3 — Create `assets/translations/fr.json` (French)

Translate ALL 235+ keys into International French.

**Translation guidelines for French:**
- Use International French — not Canadian French, not African French
- Technical terms: Use standard French engineering terms
  - "Brushless motor" → "moteur sans charbons" or "moteur brushless" (brushless is commonly used in French tool industry)
  - "Torque" → "couple"
  - "Chuck" → "mandrin"
  - "Cordless" → "sans fil" or "sur batterie"
  - "Impact driver" → "visseuse à chocs" or "perceuse à chocs"
  - "Circular saw" → "scie circulaire"
  - "Angle grinder" → "meuleuse d'angle" or "disqueuse"
  - "MOQ" → "quantité minimale de commande" or "QMC"
  - "Lead time" → "délai de livraison"
  - "Quote" → "devis"
  - "Inquiry" → "demande de renseignements"
- Use formal "vous" — never "tu"
- Company name: "Ningbo Siyang" (do not translate Chinese company names in French)
- Keep technical abbreviations: SKU, RPM, Nm, dB, V, mm, kg

**Key translations to get RIGHT:**

| English | French | Notes |
|---------|--------|-------|
| Request Quote | Demander un devis | NOT "Requérir une citation" |
| Add to Quote | Ajouter au devis | NOT "Ajouter à la citation" |
| Quick Inquiry | Demande rapide | NOT "Enquête rapide" |
| Quote Cart | Panier de devis | NOT "Panier de citations" |
| Volume Pricing | Tarification par volume | NOT "Prix du volume" |
| Lead Time | Délai de livraison | NOT "Temps de conduite" |
| MOQ | Quantité minimale de commande | NOT "Ordre minimum" |
| Brushless | Sans charbons / Brushless | Both acceptable |
| Cordless | Sans fil | NOT "Sans corde" |
| Impact Driver | Visseuse à chocs | NOT "Conducteur d'impact" |
| Warranty | Garantie | NOT "Assurance" |
| Safety & Compliance | Sécurité et conformité | NOT "Sûreté et obéissance" |
| Distributor | Distributeur | NOT "Distributeur électrique" |
| Trade Terms | Conditions commerciales | NOT "Termes de commerce" |

**Acceptance Criteria:**
- [ ] All 235+ keys translated into International French
- [ ] Formal "vous" used throughout
- [ ] Professional B2B terminology
- [ ] Technical terms use standard French engineering vocabulary
- [ ] JSON is valid
- [ ] Same nested structure as en.json

### Task 1.4 — Create `assets/translations/ru.json` (Russian)

Translate ALL 235+ keys into Standard Russian.

**Translation guidelines for Russian:**
- Use standard Russian — not Ukrainian, not Belarusian
- Technical terms: Use standard Russian engineering terms
  - "Brushless motor" → "бесщеточный двигатель" or "двигатель бесщеточный"
  - "Torque" → "крутящий момент"
  - "Chuck" → "патрон"
  - "Cordless" → "аккумуляторный" (NOT "беспроводной" which means "wireless")
  - "Impact driver" → "ударный шуруповерт" or "импактный шуруповерт"
  - "Circular saw" → "циркулярная пила"
  - "Angle grinder" → "угловая шлифмашина" or "болгарка" (use formal term)
  - "MOQ" → "минимальная партия заказа" or "МПЗ"
  - "Lead time" → "срок поставки"
  - "Quote" → "коммерческое предложение" or "расчет стоимости"
  - "Inquiry" → "запрос"
- Use formal "Вы" (capitalized) — never "ты"
- Company name: "Ningbo Siyang" (do not transliterate to "Нинбо Сиян" — use English name as-is for international business)
- Keep technical abbreviations: SKU, RPM, Nm, dB, V, mm, kg

**Key translations to get RIGHT:**

| English | Russian | Notes |
|---------|---------|-------|
| Request Quote | Запросить расчёт стоимости | NOT "Запросить цитату" |
| Add to Quote | Добавить в расчёт | NOT "Добавить в цитату" |
| Quick Inquiry | Быстрый запрос | NOT "Быстрое расследование" |
| Quote Cart | Корзина расчётов | NOT "Корзина цитат" |
| Volume Pricing | Оптовое ценообразование | NOT "Ценообразование по объёму" |
| Lead Time | Срок поставки | NOT "Время опережения" |
| MOQ | Минимальная партия заказа | NOT "Минимальный заказ количества" |
| Brushless | Бесщеточный | NOT "Без кисточки" |
| Cordless | Аккумуляторный | NOT "Беспроводной" (means wireless) |
| Impact Driver | Ударный шуруповерт | NOT "Водитель воздействия" |
| Warranty | Гарантия | NOT "Заверение" |
| Safety & Compliance | Безопасность и соответствие | NOT "Безопасность и подчинение" |
| Distributor | Дистрибьютор | NOT "Распределитель" |
| Trade Terms | Условия торговли | NOT "Торговые термины" |

**Acceptance Criteria:**
- [ ] All 235+ keys translated into Standard Russian
- [ ] Formal "Вы" used throughout
- [ ] Professional B2B terminology
- [ ] "Аккумуляторный" for cordless (NOT "беспроводной")
- [ ] "Ударный шуруповерт" for impact driver
- [ ] "Угловая шлифмашина" for angle grinder (formal, not "болгарка")
- [ ] JSON is valid
- [ ] Same nested structure as en.json

### Task 1.5 — Create `assets/translations/es.json` (Spanish)

Translate ALL 235+ keys into International Spanish.

**Translation guidelines for Spanish:**
- Use International Spanish (neutral) — not Spain-specific, not Mexican, not Argentine
- Avoid vosotros (use ustedes), avoid regional slang
- Technical terms: Use standard Spanish engineering terms
  - "Brushless motor" → "motor sin escobillas" or "motor brushless" (brushless is commonly used)
  - "Torque" → "par de apriete" or "torque" (torque is accepted in Latin American engineering)
  - "Chuck" → "portabrocas" or "mandril"
  - "Cordless" → "inalámbrico" or "a batería"
  - "Impact driver" → "atornillador de impacto" or "destornillador de impacto"
  - "Circular saw" → "sierra circular"
  - "Angle grinder" → "amoladora angular" or "esmeriladora angular"
  - "MOQ" → "pedido mínimo" or "cantidad mínima de pedido"
  - "Lead time" → "plazo de entrega"
  - "Quote" → "cotización" or "presupuesto" (use "cotización" for B2B)
  - "Inquiry" → "consulta"
- Use formal "usted" — never "tú" in business context
- Company name: "Ningbo Siyang" (do not translate)
- Keep technical abbreviations: SKU, RPM, Nm, dB, V, mm, kg

**Key translations to get RIGHT:**

| English | Spanish | Notes |
|---------|---------|-------|
| Request Quote | Solicitar cotización | NOT "Solicitar cita" |
| Add to Quote | Agregar a cotización | NOT "Agregar a cita" |
| Quick Inquiry | Consulta rápida | NOT "Investigación rápida" |
| Quote Cart | Carrito de cotizaciones | NOT "Carrito de citas" |
| Volume Pricing | Precios por volumen | NOT "Precios de volumen" |
| Lead Time | Plazo de entrega | NOT "Tiempo de conducción" |
| MOQ | Cantidad mínima de pedido | NOT "Orden mínima de cantidad" |
| Brushless | Sin escobillas / Brushless | Both acceptable |
| Cordless | A batería / Inalámbrico | "A batería" preferred for tools |
| Impact Driver | Atornillador de impacto | NOT "Conductor de impacto" |
| Warranty | Garantía | NOT "Seguridad" |
| Safety & Compliance | Seguridad y cumplimiento | NOT "Seguridad y obediencia" |
| Distributor | Distribuidor | NOT "Repartidor" |
| Trade Terms | Términos comerciales | NOT "Términos de intercambio" |

**Acceptance Criteria:**
- [ ] All 235+ keys translated into International Spanish
- [ ] Formal "usted" used throughout
- [ ] "Cotización" for quote (NOT "cita" which means appointment)
- [ ] "A batería" preferred for cordless tools
- [ ] Professional B2B terminology
- [ ] JSON is valid
- [ ] Same nested structure as en.json

---

## PHASE 2: BLOG POST TRANSLATIONS

### Task 2.1 — Translate All 3 Blog Posts into 5 Languages

The site currently has 3 blog posts in English. Translate each into all 5 languages.

**Blog post 1: "Choosing the Right Cordless Power Tools for Your Business"**
- Source file: `content/blog/choosing-cordless-power-tools.md`
- Target files: `choosing-cordless-power-tools.zh.md`, `.ar.md`, `.fr.md`, `.ru.md`, `.es.md`

**Blog post 2: "B2B Sourcing: How to Evaluate Power Tool Manufacturers"**
- Source file: `content/blog/b2b-sourcing-power-tools.md`
- Target files: `b2b-sourcing-power-tools.zh.md`, `.ar.md`, `.fr.md`, `.ru.md`, `.es.md`

**Blog post 3: "OEM vs ODM: Which Manufacturing Model is Right for You?"**
- Source file: `content/blog/oem-odm-manufacturing.md`
- Target files: `oem-odm-manufacturing.zh.md`, `.ar.md`, `.fr.md`, `.ru.md`, `.es.md`

**Translation requirements:**
1. Read the English source markdown file first
2. Translate the FULL content — title, excerpt, body, all paragraphs
3. Keep the frontmatter structure (--- delimited YAML) intact
4. Translate `title`, `excerpt`, and `category` in frontmatter
5. Keep `date`, `author`, `image` unchanged
6. Add `lang: zh` (or ar, fr, ru, es) to frontmatter
7. Keep markdown formatting (headings, lists, bold, links) intact
8. Keep all URLs and image paths unchanged
9. Translate technical terms accurately (same standards as Phase 1)
10. Blog posts should read naturally in each language — NOT read like translations

**Quality standard:** Each translated blog post should read as if it were originally written in that language by a professional in the power tools industry.

**Acceptance Criteria:**
- [ ] All 3 blog posts translated into all 5 languages = 15 translated files
- [ ] Frontmatter structure preserved
- [ ] Markdown formatting preserved
- [ ] Technical terms are accurate
- [ ] Content reads naturally in each language
- [ ] No untranslated English sentences remain

### Task 2.2 — Create Language-Specific Blog Indexes

Create `content/blog/index.{lang}.json` for each language.

Each index file should contain the same structure as `content/blog/index.json` but with translated `title`, `excerpt`, and `category` fields.

**For each language (5 files):**
```json
[
  {
    "slug": "choosing-cordless-power-tools",
    "title": "[translated title]",
    "excerpt": "[translated excerpt]",
    "date": "2024-01-15",
    "author": "Ningbo Siyang Team",
    "category": "[translated category]",
    "image": "../images/blog/cordless-tools-guide.jpg",
    "lang": "[language code]"
  },
  {
    "slug": "b2b-sourcing-power-tools",
    "title": "[translated title]",
    "excerpt": "[translated excerpt]",
    "date": "2024-02-20",
    "author": "Ningbo Siyang Team",
    "category": "[translated category]",
    "image": "../images/blog/b2b-sourcing.jpg",
    "lang": "[language code]"
  },
  {
    "slug": "oem-odm-manufacturing",
    "title": "[translated title]",
    "excerpt": "[translated excerpt]",
    "date": "2024-03-10",
    "author": "Ningbo Siyang Team",
    "category": "[translated category]",
    "image": "../images/blog/oem-odm.jpg",
    "lang": "[language code]"
  }
]
```

**Acceptance Criteria:**
- [ ] 5 language-specific blog index files created
- [ ] Titles and excerpts are translated
- [ ] Dates, authors, images, slugs are unchanged
- [ ] JSON is valid

---

## PHASE 3: PRODUCT CONTENT TRANSLATIONS

### Task 3.1 — Create Language-Specific Product Indexes

Create `content/products/index.{lang}.json` for each language.

Each index file should contain the same structure as `content/products/index.json` but with translated `name`, `categoryLabel`, and `description` fields.

**For each language (5 files):** Translate the product name, category label, and description for all 48 products. Keep all other fields (sku, brand, image, moq, leadTime, inStock, featured) unchanged.

**Product name translation examples:**

| English | Chinese | Arabic | French | Russian | Spanish |
|---------|---------|--------|--------|---------|---------|
| 20V MAX Brushless Drill/Driver | 20V MAX无刷电钻/起子 | مثقب/مفك 20V MAX بدون فرش | Perceuse/visseuse sans charbons 20V MAX | Аккумуляторная дрель-шуруповерт 20V MAX | Taladro/destornillador sin escobillas 20V MAX |
| 18V Corded Hammer Drill | 18V电锤 | مثقب مطرقي 18V | Perceuse à percussion 18V | Ударная дрель 18V | Taladro percutor 18V |
| 7-1/4" Circular Saw | 7-1/4"圆锯 | منشار دائري 7-1/4" | Scie circulaire 7-1/4" | Циркулярная пила 7-1/4" | Sierra circular 7-1/4" |
| 4-1/2" Angle Grinder | 4-1/2"角磨机 | مطحنة زاوية 4-1/2" | Meuleuse d'angle 4-1/2" | Угловая шлифмашина 4-1/2" | Amoladora angular 4-1/2" |

**Acceptance Criteria:**
- [ ] 5 language-specific product index files created
- [ ] All 48 products have translated names and descriptions
- [ ] Category labels are translated consistently
- [ ] SKU codes and technical specs are unchanged
- [ ] JSON is valid

---

## PHASE 4: TESTIMONIALS & CASE STUDIES (MAKITA GAP)

### Task 4.1 — Create `content/testimonials/index.json`

Create a testimonials data file with 8 realistic B2B testimonials from international distributors.

**Each testimonial structure:**
```json
{
  "id": "test-001",
  "name": "Ahmed Al-Rashid",
  "title": "Procurement Director",
  "company": "Gulf Industrial Supplies",
  "country": "United Arab Emirates",
  "countryFlag": "🇦🇪",
  "avatar": "../images/testimonials/avatar-1.jpg",
  "quote": "We've been distributing Ningbo Siyang products for over 5 years. The quality consistency across batches is remarkable — our return rate is under 0.3%. Their OEM capabilities allowed us to launch our own brand in the GCC market within 6 months.",
  "rating": 5,
  "productCategory": "Drills & Drivers",
  "yearsPartner": 5,
  "featured": true
}
```

**Create 8 testimonials from these regions:**
1. UAE — Ahmed Al-Rashid, Gulf Industrial Supplies — 5 years, drills/drivers
2. Germany — Hans Mueller, Euro Werkzeuge GmbH — 3 years, grinders
3. Brazil — Carlos Santos, Andina Ferramentas — 4 years, combo kits
4. Nigeria — Chidi Okonkwo, Sahel Industrial Equipment — 2 years, impact tools
5. Australia — James Mitchell, Pacific Tool Distributors — 6 years, saws
6. Russia — Dmitri Volkov, StroyInvest LLC — 3 years, cordless range
7. Mexico — Maria Gonzalez, Herramientas Profesionales SA — 2 years, sanders
8. Indonesia — Budi Santoso, PT Karya Teknik — 4 years, full catalog

**Each testimonial must:**
- Be 2-3 sentences long
- Mention specific product categories (NOT generic "great products")
- Include a specific business metric (return rate, time-to-market, revenue growth)
- Sound like a real B2B buyer, not a marketing script
- Reference the distributor's region/market

**Acceptance Criteria:**
- [ ] 8 testimonials created
- [ ] Each has name, title, company, country, quote, rating
- [ ] Quotes mention specific products and metrics
- [ ] Geographic diversity (UAE, Germany, Brazil, Nigeria, Australia, Russia, Mexico, Indonesia)
- [ ] JSON is valid

### Task 4.2 — Create `content/case-studies/index.json`

Create 3 detailed B2B case studies showing how Ningbo Siyang helped distributors succeed.

**Each case study structure:**
```json
{
  "id": "cs-001",
  "title": "How Gulf Industrial Supplies Launched Their Own Brand in 6 Months",
  "client": "Gulf Industrial Supplies",
  "country": "United Arab Emirates",
  "countryFlag": "🇦🇪",
  "industry": "Construction & Industrial Distribution",
  "challenge": "Gulf Industrial Supplies wanted to launch their own private-label power tool brand for the GCC market, but lacked manufacturing capabilities. They needed a partner who could handle everything from design to production while meeting CE and RoHS requirements.",
  "solution": "Ningbo Siyang's OEM team worked closely with Gulf Industrial's product team to design a custom line of 12 cordless tools under the 'GulfPower' brand. Our engineers adapted our proven 20V MAX platform with custom housing colors, logo placement, and Arabic/English packaging.",
  "results": [
    "12 SKUs launched within 6 months of first contact",
    "CE and RoHS certification achieved on first submission",
    "0.3% defect rate across first 10,000 units",
    "35% margin improvement vs. reselling established brands",
    "Expanded to 18 SKUs within 12 months"
  ],
  "testimonial": "Ningbo Siyang's OEM team delivered beyond our expectations. From initial design to first shipment in just 6 months — and zero quality issues. We've since expanded to 18 products and are planning our next line.",
  "testimonialAuthor": "Ahmed Al-Rashid, Procurement Director",
  "image": "../images/case-studies/gulf-industrial.jpg",
  "date": "2024-06-15",
  "featured": true
}
```

**Create 3 case studies:**

1. **Gulf Industrial Supplies (UAE)** — OEM private-label launch
   - Challenge: Wanted own brand, no manufacturing
   - Solution: OEM program with custom 20V platform
   - Results: 12 SKUs in 6 months, 0.3% defect rate, 35% margin improvement

2. **Euro Werkzeuge GmbH (Germany)** — Quality certification for EU market
   - Challenge: Needed GS and TÜV certified grinders for German market
   - Solution: Joint quality program, factory audit, dedicated QC line
   - Results: TÜV certification achieved, 50K+ units sold, expanded to 8 product lines

3. **StroyInvest LLC (Russia)** — Bulk supply with custom specifications
   - Challenge: Needed 20V cordless range with Russian-language manuals and cold-weather battery specs
   - Solution: Custom battery chemistry for -20°C operation, Russian documentation, regional packaging
   - Results: 15K units first year, 98% cold-start reliability, exclusive CIS distribution

**Acceptance Criteria:**
- [ ] 3 case studies created
- [ ] Each has challenge, solution, and measurable results
- [ ] Results include specific numbers (units, percentages, timeframes)
- [ ] Testimonials from real-sounding contacts
- [ ] Geographic and industry diversity
- [ ] JSON is valid

---

## PHASE 5: INTERNATIONAL SEO

### Task 5.1 — Add hreflang Tags to All 22 HTML Files

Add alternate language link tags to the `<head>` section of EVERY HTML file.

**For each page, add these tags in the `<head>`:**
```html
<link rel="alternate" hreflang="en" href="[current-page-url]"/>
<link rel="alternate" hreflang="zh" href="[current-page-url]?lang=zh"/>
<link rel="alternate" hreflang="ar" href="[current-page-url]?lang=ar"/>
<link rel="alternate" hreflang="fr" href="[current-page-url]?lang=fr"/>
<link rel="alternate" hreflang="ru" href="[current-page-url]?lang=ru"/>
<link rel="alternate" hreflang="es" href="[current-page-url]?lang=es"/>
<link rel="alternate" hreflang="x-default" href="[current-page-url]"/>
```

**URL format:** Use the current page's relative path. Since this is a static site on a single domain, the `hreflang` tags point to the same URL with `?lang=` parameters.

**For example, on `products/drills-drivers.html`:**
```html
<link rel="alternate" hreflang="en" href="/products/drills-drivers.html"/>
<link rel="alternate" hreflang="zh" href="/products/drills-drivers.html?lang=zh"/>
<link rel="alternate" hreflang="ar" href="/products/drills-drivers.html?lang=ar"/>
<link rel="alternate" hreflang="fr" href="/products/drills-drivers.html?lang=fr"/>
<link rel="alternate" hreflang="ru" href="/products/drills-drivers.html?lang=ru"/>
<link rel="alternate" hreflang="es" href="/products/drills-drivers.html?lang=es"/>
<link rel="alternate" hreflang="x-default" href="/products/drills-drivers.html"/>
```

**Rules:**
- Add these AFTER the existing `<link rel="canonical">` tag
- The `x-default` points to the English version (no lang param)
- Use absolute paths starting with `/`
- For the homepage (`index.html`), use `/` as the path
- For subdirectory pages, use the correct relative path from root

**All 22 files to update:**
1. `/index.html`
2. `/contact.html`
3. `/terms.html`
4. `/privacy.html`
5. `/products/index.html`
6. `/products/drills-drivers.html`
7. `/products/saws.html`
8. `/products/grinders.html`
9. `/products/sanders.html`
10. `/products/impact-tools.html`
11. `/products/combo-kits.html`
12. `/products/product.html`
13. `/blogs/index.html`
14. `/blogs/post.html`
15. `/about/index.html`
16. `/about/company.html`
17. `/about/oem-odm.html`
18. `/about/certifications.html`
19. `/about/global.html`
20. `/about/team.html`
21. `/about/payment-terms.html`
22. `/about/brochure.html`

**Acceptance Criteria:**
- [ ] All 22 HTML files have 7 hreflang tags each
- [ ] `x-default` points to English version
- [ ] URLs use correct paths for each page
- [ ] No duplicate hreflang values
- [ ] Tags appear after the canonical link

### Task 5.2 — Add Translated OG Tags to All 22 HTML Files

Add Open Graph meta tags for each language in the `<head>` section.

**For each page, add these OG tags:**
```html
<meta property="og:locale" content="en_US"/>
<meta property="og:locale:alternate" content="zh_CN"/>
<meta property="og:locale:alternate" content="ar_SA"/>
<meta property="og:locale:alternate" content="fr_FR"/>
<meta property="og:locale:alternate" content="ru_RU"/>
<meta property="og:locale:alternate" content="es_ES"/>
```

**Also add translated title and description meta tags:**
```html
<meta name="title" lang="en" content="[English title]"/>
<meta name="title" lang="zh" content="[Chinese title]"/>
<meta name="title" lang="ar" content="[Arabic title]"/>
<meta name="title" lang="fr" content="[French title]"/>
<meta name="title" lang="ru" content="[Russian title]"/>
<meta name="title" lang="es" content="[Spanish title]"/>
<meta name="description" lang="en" content="[English description]"/>
<meta name="description" lang="zh" content="[Chinese description]"/>
<meta name="description" lang="ar" content="[Arabic description]"/>
<meta name="description" lang="fr" content="[French description]"/>
<meta name="description" lang="ru" content="[Russian description]"/>
<meta name="description" lang="es" content="[Spanish description]"/>
```

**Title and description translations for each page:**

| Page | English Title | English Description |
|------|--------------|---------------------|
| Homepage | Professional Power Tools Manufacturer | Ningbo Siyang Power Tools — B2B manufacturer of cordless and corded power tools. OEM/ODM capabilities. ISO 9001 certified. Request a quote. |
| Contact | Contact Us | Get in touch with Ningbo Siyang for quotes, product inquiries, and OEM/ODM partnerships. |
| Products | Power Tools Catalog | Browse our complete catalog of professional power tools — drills, saws, grinders, sanders, impact tools, and combo kits. |
| About | About Ningbo Siyang | Learn about Ningbo Siyang Power Tools — 25+ years of manufacturing excellence, ISO 9001 certified, serving 45+ countries. |
| Blog | Industry Insights | B2B insights, industry trends, and technical guides from Ningbo Siyang Power Tools. |

Translate each title and description into all 5 languages using the same quality standards as Phase 1.

**Acceptance Criteria:**
- [ ] All 22 HTML files have OG locale tags
- [ ] All 22 HTML files have translated title meta tags (6 languages each)
- [ ] All 22 HTML files have translated description meta tags (6 languages each)
- [ ] Titles are concise (under 60 characters)
- [ ] Descriptions are informative (under 160 characters)
- [ ] Translations are professional and B2B-appropriate

### Task 5.3 — Update `sitemap.xml` for Multi-Language

Update the sitemap to include language-specific URLs.

**For each page, add 6 URL entries:**
```xml
<url>
  <loc>http://165.22.250.66/[page-path]</loc>
  <xhtml:link rel="alternate" hreflang="en" href="http://165.22.250.66/[page-path]"/>
  <xhtml:link rel="alternate" hreflang="zh" href="http://165.22.250.66/[page-path]?lang=zh"/>
  <xhtml:link rel="alternate" hreflang="ar" href="http://165.22.250.66/[page-path]?lang=ar"/>
  <xhtml:link rel="alternate" hreflang="fr" href="http://165.22.250.66/[page-path]?lang=fr"/>
  <xhtml:link rel="alternate" hreflang="ru" href="http://165.22.250.66/[page-path]?lang=ru"/>
  <xhtml:link rel="alternate" hreflang="es" href="http://165.22.250.66/[page-path]?lang=es"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="http://165.22.250.66/[page-path]"/>
  <changefreq>weekly</changefreq>
  <priority>[0.3-1.0]</priority>
</url>
```

**Priority values:**
- Homepage: 1.0
- Product category pages: 0.8
- Product detail page: 0.7
- About pages: 0.6
- Blog index: 0.7
- Blog posts: 0.6
- Contact: 0.5
- Terms/Privacy: 0.3

**Acceptance Criteria:**
- [ ] Sitemap includes all 22 pages with 6 language variants each
- [ ] hreflang links are present for each URL
- [ ] Priority values are set appropriately
- [ ] XML is valid
- [ ] Sitemap namespace includes xhtml prefix

---

## PHASE 6: i18n CMS CONFIGURATION

### Task 6.1 — Add i18n Field Markers to `admin/config.yml`

**IMPORTANT:** GLM 5.1 is adding the `i18n` top-level config and per-collection `i18n: true` settings. YOUR job is to add `i18n: true` or `i18n: false` to EVERY individual field in every collection.

**Rules:**
- `i18n: true` for: title, name, description, excerpt, body, quote, question, answer, label, subtitle, headline, text, content, bio, address, alt
- `i18n: false` for: sku, price, image (the path), moq, leadTime, inStock, featured, order, rating, date, weight, dimensions, voltage, motor, speed, torque, file (the path), url, email, phone, sort, layout, template

**For the Products collection, mark each field:**
```yaml
fields:
  - label: "Product Name"
    name: "name"
    widget: "string"
    i18n: true
  - label: "SKU"
    name: "sku"
    widget: "string"
    i18n: false
  - label: "Brand"
    name: "brand"
    widget: "string"
    i18n: false
  - label: "Category"
    name: "category"
    widget: "select"
    i18n: false
  - label: "Description"
    name: "description"
    widget: "text"
    i18n: true
  - label: "Main Image"
    name: "image"
    widget: "image"
    i18n: false
  - label: "In Stock"
    name: "inStock"
    widget: "boolean"
    i18n: false
  - label: "MOQ"
    name: "moq"
    widget: "string"
    i18n: false
  - label: "Lead Time"
    name: "leadTime"
    widget: "string"
    i18n: false
```

**Do this for ALL collections:** products, blog, pages, settings, testimonials, team_members, certifications, faq, partners, warranty, safety, manuals, distributors, downloads.

**Acceptance Criteria:**
- [ ] Every field in every collection has `i18n: true` or `i18n: false`
- [ ] Translatable content fields are marked `i18n: true`
- [ ] Technical/structural fields are marked `i18n: false`
- [ ] No field is missing an i18n marker
- [ ] YAML is valid after changes

---

## EXECUTION ORDER

| Priority | Phase | Tasks | Estimated Sub-Tasks |
|----------|-------|-------|---------------------|
| 1 | Phase 1 | Translation Files (1.1-1.5) | 40 (235+ keys × 5 languages) |
| 2 | Phase 2 | Blog Post Translations (2.1-2.2) | 20 (3 posts × 5 languages + 5 indexes) |
| 3 | Phase 3 | Product Content Translations (3.1) | 10 (5 product indexes × 48 products) |
| 4 | Phase 4 | Testimonials & Case Studies (4.1-4.2) | 11 (8 testimonials + 3 case studies) |
| 5 | Phase 5 | International SEO (5.1-5.3) | 25 (22 files × hreflang + OG + sitemap) |
| 6 | Phase 6 | i18n CMS Config (6.1) | 8 (all collections × all fields) |

**Total: ~114 sub-tasks**

---

## NON-NEGOTIABLE RULES

1. **NO MACHINE TRANSLATION ARTIFACTS** — Every translation must read naturally. "Quote" means "报价/cotización/devis" NOT "引语/cita/citation"
2. **NO SKIP** — Every key, every blog post, every product must be translated
3. **PROFESSIONAL B2B TONE** — This is a business-to-business website, not a consumer blog
4. **TECHNICAL ACCURACY** — Power tool terminology must be correct in each language. When in doubt, use the English term (brushless, RPM, Nm) rather than a wrong translation
5. **CULTURAL SENSITIVITY** — Arabic must be MSA, Chinese must be Simplified, French must be International
6. **NO OTHER AI'S FILES** — Do NOT modify files assigned to GLM 5.1 or GPT-5.3 Codex
7. **JSON VALIDATION** — Every JSON file must pass validation before marking complete
8. **NO HTML IN TRANSLATION VALUES** — Translation strings must be plain text only
9. **PRESERVE INTERPOLATION** — `{{variable}}` syntax must be preserved exactly
10. **VERIFY COMPLETENESS** — Compare your translation keys against en.json to ensure nothing is missing

---

## INTEGRATION NOTES

When your work is complete, the following must be true for the other AIs to integrate:

1. **For GLM 5.1:** Your translation files must match the exact key structure of `en.json`. If GLM adds new keys, you must translate them too. Your hreflang tags must be in the `<head>` section only (not touching body content).

2. **For GPT-5.3 Codex:** Your RTL Arabic translations must work with Codex's RTL CSS overrides. The Arabic text must display correctly in right-to-left mode. Your translated product indexes must match the data structure that Codex's gallery/comparison tools expect.

3. **Your `admin/config.yml` i18n field markers** must not conflict with GLM's collection-level i18n settings. Only add `i18n: true/false` to individual fields — GLM is handling the top-level and collection-level i18n config.

---

**END OF QWEN 3.6-PLUS TASK DOCUMENT**
