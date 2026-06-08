import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const dryRun = process.argv.includes("--dry-run");
let orphanCount = 0;
let writeCount = 0;
let draftCount = 0;

// ============================================================
// YAML Frontmatter Parser (uses js-yaml)
// ============================================================

function parseFrontmatter(content) {
  if (!content.startsWith("---")) return null;
  const closing = content.indexOf("---", 3);
  if (closing === -1) return null;
  const raw = content.slice(3, closing).trim();
  try {
    return yaml.load(raw);
  } catch (e) {
    console.error("[generate-index] YAML parse error:", e.message);
    return null;
  }
}

// ============================================================
// File reader
// ============================================================

function readMarkdownFiles(dir, lang) {
  const entries = [];
  if (!fs.existsSync(dir)) {
    console.warn(`  Warning: directory not found: ${dir}`);
    return entries;
  }
  const suffix = lang && lang !== "en" ? `.${lang}.md` : ".md";
  const excludeSuffix = lang && lang !== "en" ? null : /\.[a-z]{2}\.md$/;
  const files = fs.readdirSync(dir).filter((f) => {
    if (!f.endsWith(suffix)) return false;
    // When generating default (en), skip multilingual files
    if (excludeSuffix && excludeSuffix.test(f)) return false;
    return true;
  });
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const frontmatter = parseFrontmatter(content);
      if (!frontmatter) {
        console.warn(`  Warning: no frontmatter found in ${file}, skipping`);
        continue;
      }
      // Strip .md and optional language suffix to get clean slug
      // e.g. "SY-DD2001.ar.md" → "SY-DD2001", "my-post.md" → "my-post"
      const slug = file.replace(/\.md$/, "").replace(/\.[a-z]{2}$/, "");
      // Skip draft items — they exist in CMS but are hidden from the website
      if (frontmatter.draft === true || frontmatter.draft === "true") {
        draftCount++;
        continue;
      }
      entries.push({ frontmatter, slug });
    } catch (err) {
      console.warn(`  Warning: error reading ${file}: ${err.message}`);
    }
  }
  return entries;
}

function writeJson(filePath, data) {
  const json = JSON.stringify(data, null, 2) + "\n";
  if (dryRun) {
    writeCount++;
    return;
  }
  fs.writeFileSync(filePath, json, "utf-8");
  writeCount++;
}

function convertPrice(val) {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const num = parseFloat(val.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

function numOr(val, fallback) {
  return typeof val === "number" ? val : fallback;
}

function strOr(val, fallback) {
  return typeof val === "string" && val ? val : fallback;
}

// ============================================================
// Collection Index Generators
// ============================================================

function generateBlogIndex(dir) {
  const entries = readMarkdownFiles(dir);
  const posts = entries.map(({ frontmatter: fm, slug }) => ({
    title: fm.title || "",
    slug,
    date: fm.date || "",
    category: fm.category || "",
    excerpt: fm.excerpt || "",
    image: fm.image || "",
    author: fm.author || "",
    readTime: numOr(fm.readTime, 0),
  }));
  return { posts };
}

const CATEGORY_LABEL_MAP = {
  "drills-drivers": "Drills & Drivers",
  "saws": "Saws",
  "grinders": "Grinders",
  "sanders": "Sanders",
  "impact-tools": "Impact Tools",
  "combo-kits": "Combo Kits"
};

function generateProductsIndex(dir) {
  // Products are stored as .md files (source of truth)
  // Individual .json files are auto-generated for product.html
  const products = [];
  const mdSkus = new Set();

  // Read .md files — primary source
  const mdEntries = readMarkdownFiles(dir);
  for (const { frontmatter: fm, slug } of mdEntries) {
    const sku = fm.sku || slug;
    mdSkus.add(sku);
    const product = {
      name: fm.name || "",
      sku,
      category: fm.category || "",
      categoryLabel: CATEGORY_LABEL_MAP[fm.category] || fm.categoryLabel || fm.category || "",
      price: convertPrice(fm.price),
      compareAtPrice: numOr(fm.compareAtPrice, 0),
      image: fm.image || (Array.isArray(fm.images) && fm.images[0] ? fm.images[0] : ""),
      images: Array.isArray(fm.images) ? fm.images : [],
      brand: fm.brand || "",
      tagline: fm.tagline || fm.description || "",
      description: fm.description || "",
      userBenefits: Array.isArray(fm.userBenefits) ? fm.userBenefits : [],
      specs: fm.specs || {},
      compliance: fm.compliance || {},
      stock: fm.inStock === true ? 50 : fm.inStock === false ? 0 : numOr(fm.stock, 0),
      inStock: fm.inStock !== false,
      rating: numOr(fm.rating, 4),
      reviewCount: numOr(fm.reviewCount, 0),
      isFeatured: fm.featured === true || fm.isFeatured === true,
      isTopProduct: fm.isTopProduct === true,
      featured: fm.featured === true,
      moq: fm.moq || "",
      leadTime: fm.leadTime || "",
      warranty: fm.warranty || "",
      relatedProducts: Array.isArray(fm.relatedProducts) ? fm.relatedProducts : [],
      downloads: fm.downloads || {},
    };
    products.push(product);

    // Also write individual .json file so product.html can read it
    // .md is the source of truth — always regenerate .json from .md
    // Sanitize SKU for filename (replace / with - to avoid path issues)
    const safeSku = sku.replace(/\//g, "-");
    const jsonPath = path.join(dir, `${safeSku}.json`);
    writeJson(jsonPath, product);
  }

  // Clean up orphaned .json files that have no matching published .md
  if (fs.existsSync(dir)) {
    // Build set of safe SKUs (with / replaced by -) for comparison
    const safeMdSkus = new Set([...mdSkus].map((s) => s.replace(/\//g, "-")));
    // Also build set of draft SKUs so we can give a clearer log message
    const draftSkus = new Set();
    const allMdFiles = fs.readdirSync(dir).filter((f) => f.endsWith(".md") && !/\.[a-z]{2}\.md$/.test(f));
    for (const mdFile of allMdFiles) {
      const mdContent = fs.readFileSync(path.join(dir, mdFile), "utf-8");
      const fm = parseFrontmatter(mdContent);
      if (fm && (fm.draft === true || fm.draft === "true")) {
        const draftSku = (fm.sku || mdFile.replace(/\.md$/, "")).replace(/\//g, "-");
        draftSkus.add(draftSku);
      }
    }
    // Match any .json that looks like an auto-generated product file (SKU-based name)
    // Exclude index.json and index.*.json (collection indexes, not product files)
    const jsonFiles = fs.readdirSync(dir).filter(
      (f) => f.endsWith(".json") && f !== "index.json" && !f.startsWith("index.")
    );
    for (const file of jsonFiles) {
      const sku = file.replace(".json", "");
      if (!safeMdSkus.has(sku)) {
        const orphanPath = path.join(dir, file);
        const reason = draftSkus.has(sku) ? "draft" : "no matching .md";
        if (dryRun) {
          console.log(`    [DRY RUN] Would remove ${file} (${reason})`);
        } else {
          fs.unlinkSync(orphanPath);
          console.log(`    Removed ${file} (${reason})`);
        }
        orphanCount++;
      }
    }
  }

  return { products };
}

function generateTeamIndex(dir) {
  const entries = readMarkdownFiles(dir);
  const members = entries.map(({ frontmatter: fm, slug }) => ({
    name: fm.name || "",
    title: fm.title || "",
    photo: fm.photo || "",
    bio: fm.bio || "",
    order: numOr(fm.order, 99),
  }));
  members.sort((a, b) => a.order - b.order);
  return { members };
}

function generateTestimonialsIndex(dir) {
  const entries = readMarkdownFiles(dir);
  const testimonials = entries.map(({ frontmatter: fm, slug }) => ({
    name: fm.name || "",
    company: fm.company || "",
    quote: fm.quote || "",
    avatar: fm.avatar || "",
    rating: numOr(fm.rating, 5),
    order: numOr(fm.order, 99),
  }));
  testimonials.sort((a, b) => a.order - b.order);
  return { testimonials };
}

function generateCertificationsIndex(dir) {
  const entries = readMarkdownFiles(dir);
  const certifications = entries.map(({ frontmatter: fm, slug }) => ({
    name: fm.name || "",
    issuer: fm.issuer || "",
    image: fm.image || "",
    year: fm.year || "",
  }));
  return { certifications };
}

function generateFAQIndex(dir) {
  const entries = readMarkdownFiles(dir);
  const faq = entries.map(({ frontmatter: fm, slug }) => ({
    question: fm.question || "",
    answer: fm.answer || "",
    category: fm.category || "",
    order: numOr(fm.order, 99),
  }));
  faq.sort((a, b) => a.order - b.order);
  return faq;
}

function generatePartnersIndex(dir) {
  const entries = readMarkdownFiles(dir);
  const partners = entries.map(({ frontmatter: fm, slug }) => ({
    name: fm.name || "",
    logo: fm.logo || "",
    website: fm.website || "",
    order: numOr(fm.order, 99),
  }));
  partners.sort((a, b) => a.order - b.order);
  return partners;
}

function generateDistributorsIndex(dir) {
  const entries = readMarkdownFiles(dir);
  const distributors = entries.map(({ frontmatter: fm, slug }) => ({
    companyName: fm.companyName || "",
    country: fm.country || "",
    region: fm.region || "",
    contactPerson: fm.contactPerson || "",
    email: fm.email || "",
    phone: fm.phone || "",
    website: fm.website || "",
    logo: fm.logo || "",
    address: fm.address || "",
  }));
  return distributors;
}

function generateWarrantyIndex(dir) {
  const entries = readMarkdownFiles(dir);
  const warranty = entries.map(({ frontmatter: fm, slug }) => ({
    title: fm.title || "",
    warrantyType: fm.warrantyType || "standard",
    warrantyPeriod: fm.warrantyPeriod || "",
    description: fm.description || "",
    exclusions: Array.isArray(fm.exclusions) ? fm.exclusions : [],
    claimProcess: fm.claimProcess || "",
  }));
  return warranty;
}

function generateSafetyIndex(dir) {
  const entries = readMarkdownFiles(dir);
  const safety = entries.map(({ frontmatter: fm, slug }) => ({
    title: fm.title || "",
    noticeType: fm.noticeType || "advisory",
    severity: fm.severity || "info",
    description: fm.description || "",
    resolution: fm.resolution || "",
    affectedSkus: Array.isArray(fm.affectedSkus) ? fm.affectedSkus : [],
    date: fm.date || "",
  }));
  return safety;
}

function generateManualsIndex(dir) {
  const entries = readMarkdownFiles(dir);
  const manuals = entries.map(({ frontmatter: fm, slug }) => ({
    title: fm.title || "",
    productSku: fm.productSku || "",
    language: fm.language || "en",
    file: fm.file || "",
    version: fm.version || "",
    pages: numOr(fm.pages, 0),
    date: fm.date || "",
  }));
  return manuals;
}

function generateDownloadsIndex(dir) {
  const entries = readMarkdownFiles(dir);
  const downloads = entries.map(({ frontmatter: fm, slug }) => ({
    title: fm.title || "",
    category: fm.category || "",
    language: fm.language || "en",
    file: fm.file || "",
    version: fm.version || "",
    fileSize: fm.fileSize || "",
    date: fm.date || "",
    description: fm.description || "",
  }));
  return downloads;
}

function generateCaseStudiesIndex(dir) {
  const entries = readMarkdownFiles(dir);
  const case_studies = entries.map(({ frontmatter: fm, slug }) => ({
    id: fm.id || slug,
    title: fm.title || "",
    client: fm.client || "",
    country: fm.country || "",
    countryFlag: fm.countryFlag || "",
    industry: fm.industry || "",
    challenge: fm.challenge || "",
    solution: fm.solution || "",
    results: Array.isArray(fm.results) ? fm.results : [],
    testimonial: fm.testimonial || "",
    testimonialAuthor: fm.testimonialAuthor || "",
    image: fm.image || "",
    date: fm.date || "",
    featured: fm.featured === true,
  }));
  return case_studies;
}

// ============================================================
// Main — Generate all index files
// ============================================================

console.log("Generating index files from .md frontmatter...\n");
if (dryRun) console.log("*** DRY RUN — no files will be written or deleted ***\n");

const collections = [
  { name: "Blog",          dir: "blog",          fn: generateBlogIndex,          key: "posts" },
  { name: "Products",      dir: "products",      fn: generateProductsIndex,      key: "products" },
  { name: "Team",          dir: "team",          fn: generateTeamIndex,          key: "members" },
  { name: "Testimonials",  dir: "testimonials",  fn: generateTestimonialsIndex,  key: "testimonials" },
  { name: "Certifications", dir: "certifications", fn: generateCertificationsIndex, key: "certifications" },
  { name: "FAQ",           dir: "faq",           fn: generateFAQIndex,           key: null },
  { name: "Partners",      dir: "partners",      fn: generatePartnersIndex,      key: null },
  { name: "Distributors",  dir: "distributors",  fn: generateDistributorsIndex,  key: null },
  { name: "Warranty",      dir: "warranty",      fn: generateWarrantyIndex,      key: null },
  { name: "Safety",        dir: "safety",        fn: generateSafetyIndex,        key: null },
  { name: "Manuals",       dir: "manuals",       fn: generateManualsIndex,       key: null },
  { name: "Downloads",     dir: "downloads",     fn: generateDownloadsIndex,     key: null },
  { name: "Case Studies",  dir: "case-studies",  fn: generateCaseStudiesIndex,   key: null },
];

let totalEntries = 0;

for (const col of collections) {
  const dirPath = path.join(projectRoot, "content", col.dir);
  const data = col.fn(dirPath);

  // Determine count
  const count = col.key ? data[col.key].length : data.length;
  totalEntries += count;

  // Write index.json (default/English)
  const outPath = path.join(dirPath, "index.json");
  writeJson(outPath, data);
  console.log(`  ${col.name}: ${count} entr${count === 1 ? "y" : "ies"} → ${path.relative(projectRoot, outPath)}`);

  // Generate multilingual index files for languages that have .md files
  const supportedLangs = ["ar", "es", "fr", "ru", "zh"];
  for (const lang of supportedLangs) {
    const langFiles = fs.readdirSync(dirPath).filter((f) => f.endsWith(`.${lang}.md`));
    if (langFiles.length === 0) continue;

    const langData = col.fn(dirPath, lang);
    const langCount = col.key ? langData[col.key].length : langData.length;
    if (langCount === 0) continue;

    const langOutPath = path.join(dirPath, `index.${lang}.json`);
    writeJson(langOutPath, langData);
    totalEntries += langCount;
    console.log(`  ${col.name} (${lang.toUpperCase()}): ${langCount} entr${langCount === 1 ? "y" : "ies"} → ${path.relative(projectRoot, langOutPath)}`);
  }
}

console.log(`\nTotal: ${totalEntries} entries across ${collections.length} collections`);
console.log(`Files ${dryRun ? "would be " : ""}written: ${writeCount}`);
if (draftCount > 0) {
  console.log(`Draft (hidden): ${draftCount} item${draftCount === 1 ? "" : "s"}`);
}
if (orphanCount > 0) {
  console.log(`Orphans ${dryRun ? "would be " : ""}cleaned up: ${orphanCount} file${orphanCount === 1 ? "" : "s"}`);
}
console.log("Done.");
