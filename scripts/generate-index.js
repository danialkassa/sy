import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function parseValue(raw) {
  const trimmed = raw.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  let str = trimmed;
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1);
  }
  return str;
}

function parseFrontmatter(content) {
  if (!content.startsWith("---")) return null;
  const closing = content.indexOf("---", 3);
  if (closing === -1) return null;
  const raw = content.slice(3, closing).trim();
  const data = {};
  const lines = raw.split("\n");
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = parseValue(line.slice(colonIdx + 1));
    data[key] = val;
  }
  return data;
}

function readMarkdownFiles(dir) {
  const entries = [];
  if (!fs.existsSync(dir)) {
    console.warn(`  Warning: directory not found: ${dir}`);
    return entries;
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const frontmatter = parseFrontmatter(content);
      if (!frontmatter) {
        console.warn(`  Warning: no frontmatter found in ${file}, skipping`);
        continue;
      }
      const slug = path.basename(file, ".md");
      entries.push({ frontmatter, slug });
    } catch (err) {
      console.warn(`  Warning: error reading ${file}: ${err.message}`);
    }
  }
  return entries;
}

function convertPrice(val) {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const num = parseFloat(val.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

function generateBlogIndex(dir) {
  const entries = readMarkdownFiles(dir);
  const posts = entries.map(({ frontmatter: fm, slug }) => ({
    title: fm.title || "",
    slug: slug,
    date: fm.date || "",
    category: fm.category || "",
    excerpt: fm.excerpt || "",
    image: fm.image || "",
    author: fm.author || "",
    readTime: typeof fm.readTime === "number" ? fm.readTime : 0,
  }));
  return { posts };
}

function generateProductsIndex(dir) {
  const entries = readMarkdownFiles(dir);
  const products = entries.map(({ frontmatter: fm, slug }) => ({
    name: fm.name || "",
    sku: fm.sku || "",
    category: fm.category || "",
    price: convertPrice(fm.price),
    compareAtPrice: typeof fm.compareAtPrice === "number" ? fm.compareAtPrice : 0,
    image: fm.image || "",
    brand: fm.brand || "",
    tagline: fm.tagline || fm.description || "",
    stock: fm.inStock === true ? 50 : fm.inStock === false ? 0 : (typeof fm.stock === "number" ? fm.stock : 0),
    rating: typeof fm.rating === "number" ? fm.rating : 4,
    reviewCount: typeof fm.reviewCount === "number" ? fm.reviewCount : 0,
    isFeatured: fm.featured === true,
  }));
  return { products };
}

function writeJson(filePath, data) {
  const json = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(filePath, json, "utf-8");
}

console.log("Generating index files...\n");

const blogDir = path.join(projectRoot, "content", "blog");
const productsDir = path.join(projectRoot, "content", "products");

const blogIndex = generateBlogIndex(blogDir);
writeJson(path.join(blogDir, "index.json"), blogIndex);
console.log(`Blog: processed ${blogIndex.posts.length} post(s)`);

const productsIndex = generateProductsIndex(productsDir);
writeJson(path.join(productsDir, "index.json"), productsIndex);
console.log(`Products: processed ${productsIndex.products.length} product(s)`);

console.log("\nDone.");
