import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");

// ============================================================
// Helpers
// ============================================================

function parseFrontmatter(content) {
  if (!content.startsWith("---")) return { data: {}, body: content };
  const closing = content.indexOf("---", 3);
  if (closing === -1) return { data: {}, body: content };
  const raw = content.slice(3, closing).trim();
  try {
    return { data: yaml.load(raw) || {}, body: content.slice(closing + 3).trim() };
  } catch (e) {
    console.error("[build-html] YAML parse error:", e.message);
    return { data: {}, body: content };
  }
}

function readMarkdownFiles(dir, opts = {}) {
  const entries = [];
  if (!fs.existsSync(dir)) return entries;
  const files = fs.readdirSync(dir).filter((f) => {
    if (!f.endsWith(".md")) return false;
    if (/\.[a-z]{2}\.md$/.test(f)) return false; // skip translations
    if (opts.filter && !opts.filter(f)) return false;
    return true;
  });
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = parseFrontmatter(content);
      const slug = file.replace(/\.md$/, "");
      if (parsed.data.draft === true || parsed.data.draft === "true") continue;
      if (parsed.data.archived === true || parsed.data.archived === "true") continue;
      entries.push({ data: parsed.data, slug, body: parsed.body });
    } catch (err) {
      console.warn(`  Warning: error reading ${file}: ${err.message}`);
    }
  }
  return entries;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replaceTextById(html, id, newText) {
  if (newText === undefined || newText === null || newText === "") return html;
  const escaped = escapeHtml(newText);
  // Try replacing content in element with this id
  // Pattern: id="ID" ...>CONTENT</tag>
  const regex = new RegExp(`(<[^>]*?id=["']${id}["'][^>]*?>)([^<]*?)(</[^>]*?>)`, "g");
  let replaced = false;
  html = html.replace(regex, (match, open, content, close) => {
    replaced = true;
    return open + escaped + close;
  });
  if (!replaced) {
    // Try empty element: id="ID" ...></tag>
    const emptyRegex = new RegExp(`(<[^>]*?id=["']${id}["'][^>]*?>)(</[^>]*?>)`, "g");
    html = html.replace(emptyRegex, (match, open, close) => {
      return open + escaped + close;
    });
  }
  return html;
}

function replaceElementTextById(html, id, text) {
  if (!text) return html;
  const escaped = escapeHtml(text);
  // Match the opening tag with the ID, preserve all attributes, only replace text content
  const pattern = new RegExp(`(<\\w+[^>]*?id=["']${id}["'][^>]*?>)[\\s\\S]*?(</[^>]*?>)`, "g");
  return html.replace(pattern, `$1${escaped}$2`);
}

function injectIntoElementById(html, id, innerHtml) {
  if (!innerHtml) return html;
  // Find the opening tag with the ID
  const openTagRegex = new RegExp(`<([^\\s>]+)\\s[^>]*?id=["']${id}["'][^>]*?>`, "g");
  const openMatch = openTagRegex.exec(html);
  if (!openMatch) return html;
  const tagName = openMatch[1];
  const afterOpenTag = html.substring(openMatch.index + openMatch[0].length);
  // Find matching closing tag by counting nesting depth
  let depth = 1;
  let closeIndex = -1;
  const tagRegex = new RegExp(`</?${tagName}(?:\\s[^>]*?)?>`, "g");
  let m;
  while ((m = tagRegex.exec(afterOpenTag)) !== null) {
    if (m[0].startsWith("</")) {
      depth--;
      if (depth === 0) { closeIndex = m.index; break; }
    } else if (!m[0].endsWith("/>")) {
      depth++;
    }
  }
  if (closeIndex === -1) return html;
  const injectPos = openMatch.index + openMatch[0].length;
  const before = html.substring(0, injectPos);
  const after = afterOpenTag.substring(closeIndex);
  return before + innerHtml + after;
}

function parseMarkdown(md) {
  if (!md) return "";
  let html = md
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*?<\/li>\n?)+/gs, "<ul>$&</ul>");
  const paragraphs = html.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  return paragraphs.map(p => {
    if (p.startsWith("<h") || p.startsWith("<ul") || p.startsWith("<li")) return p;
    return `<p>${p}</p>`;
  }).join("\n");
}

function replaceAttributeById(html, id, attr, newValue) {
  if (newValue === undefined || newValue === null) return html;
  const regex = new RegExp(`(<[^>]*?id=["']${id}["'][^>]*?\\s${attr}=["'])[^"']*(["'])`, "g");
  return html.replace(regex, `$1${escapeHtml(newValue)}$2`);
}

function injectBetweenMarkers(html, markerName, injection) {
  const startMarker = `<!-- CMS-INJECTED:${markerName} -->`;
  const endMarker = `<!-- END-CMS-INJECTED:${markerName} -->`;
  const fullInjection = startMarker + "\n" + injection + "\n" + endMarker;
  if (html.includes(startMarker)) {
    const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, "g");
    return html.replace(regex, fullInjection);
  }
  // Try to inject before </body> or at the end
  if (html.includes("</body>")) {
    return html.replace("</body>", fullInjection + "\n</body>");
  }
  return html + "\n" + fullInjection;
}

function injectScriptJson(html, id, data) {
  const json = JSON.stringify(data, null, 2);
  const script = `<script type="application/json" id="${id}">\n${json}\n</script>`;
  return injectBetweenMarkers(html, id, script);
}

function injectHtmlIntoContainer(html, containerId, innerHtml) {
  const startMarker = `<!-- CMS-INJECTED:${containerId} -->`;
  const endMarker = `<!-- END-CMS-INJECTED:${containerId} -->`;
  const fullInjection = startMarker + "\n" + innerHtml + "\n" + endMarker;
  if (html.includes(startMarker)) {
    const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, "g");
    return html.replace(regex, fullInjection);
  }
  // Find the container opening tag and determine its tag name
  const openTagRegex = new RegExp(`<([^\\s>]+)\\s[^>]*?id=["']${containerId}["'][^>]*?>`, "g");
  const openMatch = openTagRegex.exec(html);
  if (!openMatch) {
    console.warn(`  Could not find container #${containerId}`);
    return html;
  }
  const tagName = openMatch[1]; // e.g., "div"
  const afterOpenTag = html.substring(openMatch.index + openMatch[0].length);
  // Find the matching closing tag by counting nesting depth
  let depth = 1;
  let closeIndex = -1;
  const tagRegex = new RegExp(`</?${tagName}(?:\\s[^>]*?)?>`, "g");
  tagRegex.lastIndex = 0;
  let m;
  while ((m = tagRegex.exec(afterOpenTag)) !== null) {
    if (m[0].startsWith("</")) {
      depth--;
      if (depth === 0) {
        closeIndex = m.index;
        break;
      }
    } else if (!m[0].endsWith("/>")) {
      depth++;
    }
  }
  if (closeIndex === -1) {
    console.warn(`  Could not find closing tag for #${containerId}`);
    return html;
  }
  const injectPos = openMatch.index + openMatch[0].length;
  const before = html.substring(0, injectPos);
  const after = afterOpenTag.substring(closeIndex);
  return before + "\n" + fullInjection + "\n" + after;
}

// ============================================================
// Content Loaders
// ============================================================

function loadHomepageData() {
  // Try new split files first
  const files = [
    "content/pages/homepage-hero.md",
    "content/pages/homepage-products.md",
    "content/pages/homepage-about.md",
    "content/pages/homepage-b2b.md",
    "content/pages/homepage-cta.md",
  ];
  let merged = {};
  let foundAny = false;
  for (const relPath of files) {
    const filePath = path.join(projectRoot, relPath);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const data = parseFrontmatter(content).data;
      if (data && Object.keys(data).length) {
        merged = { ...merged, ...data };
        foundAny = true;
      }
    }
  }
  // Fallback to legacy single file
  if (!foundAny) {
    const legacyPath = path.join(projectRoot, "content/pages/homepage.md");
    if (fs.existsSync(legacyPath)) {
      const content = fs.readFileSync(legacyPath, "utf-8");
      merged = parseFrontmatter(content).data;
    }
  }
  return merged;
}

function loadProductsData() {
  const dir = path.join(projectRoot, "content/products");
  const entries = readMarkdownFiles(dir);
  return entries.map(({ data, slug }) => ({
    name: data.name || "",
    sku: data.sku || slug,
    category: data.category || "",
    categoryLabel: data.categoryLabel || data.category || "",
    price: typeof data.price === "number" ? data.price : 0,
    compareAtPrice: typeof data.compareAtPrice === "number" ? data.compareAtPrice : 0,
    image: data.image || (Array.isArray(data.images) && data.images[0] ? data.images[0] : ""),
    images: Array.isArray(data.images) ? data.images : [],
    brand: data.brand || "",
    tagline: data.tagline || data.description || "",
    description: data.description || "",
    userBenefits: Array.isArray(data.userBenefits) ? data.userBenefits : [],
    specs: data.specs || {},
    compliance: data.compliance || {},
    stock: data.inStock === true ? 50 : data.inStock === false ? 0 : 0,
    inStock: data.inStock !== false,
    rating: typeof data.rating === "number" ? data.rating : 4,
    reviewCount: typeof data.reviewCount === "number" ? data.reviewCount : 0,
    isFeatured: data.featured === true || data.isFeatured === true,
    isTopProduct: data.isTopProduct === true,
    moq: data.moq || "",
    leadTime: data.leadTime || "",
    warranty: data.warranty || "",
    relatedProducts: Array.isArray(data.relatedProducts) ? data.relatedProducts : [],
    downloads: data.downloads || {},
    featured: data.featured === true || data.isFeatured === true,
  }));
}

function loadBlogData() {
  const dir = path.join(projectRoot, "content/blog");
  const entries = readMarkdownFiles(dir);
  return entries.map(({ data, slug }) => ({
    title: data.title || "",
    slug,
    date: data.date || "",
    category: data.category || "",
    excerpt: data.excerpt || "",
    image: data.image || "",
    author: data.author || "",
    authorRole: data.authorRole || "",
    readTime: typeof data.readTime === "number" ? data.readTime : 5,
    body: data.body || "",
  }));
}

function loadTeamData() {
  const dir = path.join(projectRoot, "content/team");
  const entries = readMarkdownFiles(dir);
  return entries.map(({ data }) => ({
    name: data.name || "",
    title: data.title || "",
    photo: data.photo || "",
    bio: data.bio || "",
    order: typeof data.order === "number" ? data.order : 99,
  })).sort((a, b) => a.order - b.order);
}

function loadTestimonialsData() {
  const dir = path.join(projectRoot, "content/testimonials");
  const entries = readMarkdownFiles(dir);
  return entries.map(({ data }) => ({
    name: data.name || "",
    company: data.company || "",
    quote: data.quote || "",
    avatar: data.avatar || "",
    rating: typeof data.rating === "number" ? data.rating : 5,
    order: typeof data.order === "number" ? data.order : 99,
  })).sort((a, b) => a.order - b.order);
}

function loadCertificationsData() {
  const dir = path.join(projectRoot, "content/certifications");
  const entries = readMarkdownFiles(dir);
  return entries.map(({ data }) => ({
    name: data.name || "",
    issuer: data.issuer || "",
    image: data.image || "",
    year: data.year || "",
  }));
}

function loadFAQData() {
  const dir = path.join(projectRoot, "content/faq");
  const entries = readMarkdownFiles(dir);
  return entries.map(({ data }) => ({
    question: data.question || "",
    answer: data.answer || "",
    category: data.category || "General",
    order: typeof data.order === "number" ? data.order : 99,
  })).sort((a, b) => a.order - b.order);
}

function loadDistributorsData() {
  const dir = path.join(projectRoot, "content/distributors");
  const entries = readMarkdownFiles(dir);
  return entries.map(({ data }) => ({
    companyName: data.companyName || "",
    country: data.country || "",
    region: data.region || "Other",
    contactPerson: data.contactPerson || "",
    email: data.email || "",
    phone: data.phone || "",
    website: data.website || "",
    logo: data.logo || "",
    address: data.address || "",
  }));
}

function loadPartnersData() {
  const dir = path.join(projectRoot, "content/partners");
  const entries = readMarkdownFiles(dir);
  return entries.map(({ data }) => ({
    name: data.name || "",
    partnerType: data.partnerType || "",
    logo: data.logo || "",
    country: data.country || "",
    website: data.website || "",
    order: typeof data.order === "number" ? data.order : 99,
  })).sort((a, b) => a.order - b.order);
}

function loadCaseStudiesData() {
  const dir = path.join(projectRoot, "content/case-studies");
  const entries = readMarkdownFiles(dir);
  return entries.map(({ data, slug }) => ({
    title: data.title || "",
    slug,
    client: data.client || "",
    country: data.country || "",
    countryFlag: data.countryFlag || "",
    industry: data.industry || "",
    challenge: data.challenge || "",
    solution: data.solution || "",
    results: Array.isArray(data.results) ? data.results : [],
    testimonial: data.testimonial || "",
    testimonialAuthor: data.testimonialAuthor || "",
    image: data.image || "",
    date: data.date || "",
    featured: data.featured === true,
  }));
}

function loadWarrantyData() {
  const dir = path.join(projectRoot, "content/warranty");
  const entries = readMarkdownFiles(dir);
  return entries.map(({ data, slug }) => ({
    title: data.title || "",
    slug,
    warrantyType: data.warrantyType || "",
    warrantyPeriod: data.warrantyPeriod || "",
    applicableCategories: Array.isArray(data.applicableCategories) ? data.applicableCategories : [],
    description: data.description || "",
    exclusions: Array.isArray(data.exclusions) ? data.exclusions : [],
    claimProcess: data.claimProcess || "",
  }));
}

function loadSafetyData() {
  const dir = path.join(projectRoot, "content/safety");
  const entries = readMarkdownFiles(dir);
  return entries.map(({ data, slug }) => ({
    title: data.title || "",
    slug,
    noticeType: data.noticeType || "",
    severity: data.severity || "info",
    affectedSkus: Array.isArray(data.affectedSkus) ? data.affectedSkus : [],
    description: data.description || "",
    resolution: data.resolution || "",
    date: data.date || "",
  }));
}

function loadManualsData() {
  const dir = path.join(projectRoot, "content/manuals");
  const entries = readMarkdownFiles(dir);
  return entries.map(({ data, slug }) => ({
    title: data.title || "",
    slug,
    productSku: data.productSku || "",
    language: data.language || "en",
    file: data.file || "",
    version: data.version || "",
    pages: data.pages || "",
    date: data.date || "",
  }));
}

function loadDownloadsData() {
  const dir = path.join(projectRoot, "content/downloads");
  const entries = readMarkdownFiles(dir);
  return entries.map(({ data, slug }) => ({
    title: data.title || "",
    slug,
    category: data.category || "",
    file: data.file || "",
    language: data.language || "en",
    version: data.version || "",
    fileSize: data.fileSize || "",
    date: data.date || "",
    description: data.description || "",
  }));
}

function loadCompanyData() {
  const filePath = path.join(projectRoot, "content/settings/company.md");
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(content).data;
}

function loadPageData(pageName) {
  const filePath = path.join(projectRoot, `content/pages/${pageName}.md`);
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(content).data;
}

// ============================================================
// Renderers
// ============================================================

function renderStars(rating, size) {
  size = size || 4;
  let stars = '<div class="flex items-center gap-1">';
  for (let s = 0; s < 5; s++) {
    stars += s < rating
      ? `<svg class="w-${size} h-${size} text-yellow-400 fill-yellow-400" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
      : `<svg class="w-${size} h-${size} text-zinc-600" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }
  stars += "</div>";
  return stars;
}

function buildProductCard(product, basePath = "./") {
  const sku = escapeHtml(product.sku || "");
  const name = escapeHtml(product.name || "");
  const brand = escapeHtml(product.brand || "");
  const tagline = escapeHtml(product.tagline || product.description || "");
  const image = escapeHtml(product.image || (product.images && product.images[0]) || "");
  const rating = product.rating || 4;
  const reviewCount = product.reviewCount || 0;

  let badges = "";
  if (product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price || 0)) {
    const discount = Math.round((1 - Number(product.price || 0) / Number(product.compareAtPrice)) * 100);
    badges += `<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-${discount}%</span>`;
  }
  if (product.isFeatured) {
    badges += `<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Featured</span>`;
  }
  const badgeContainer = badges ? `<div class="absolute top-3 left-3 flex flex-col gap-1.5">${badges}</div>` : "";

  let priceHtml = "";
  if (product.price && Number(product.price) > 0) {
    priceHtml = `<span class="text-lg font-bold text-white">$${Number(product.price).toFixed(2)}</span>`;
    if (product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price)) {
      priceHtml += `<span class="text-sm text-zinc-500 line-through ml-2">$${Number(product.compareAtPrice).toFixed(2)}</span>`;
    }
  } else {
    priceHtml = `<span class="text-sm font-semibold text-yellow-400">Request Quote</span>`;
  }

  const stockHtml = product.stock > 0
    ? `<span class="text-xs text-green-400 font-medium">&#10003; In Stock</span>`
    : `<span class="text-xs text-red-400 font-medium">Out of Stock</span>`;

  return `<div data-id="${sku}" class="group relative bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/5 flex flex-col">
    <a href="${basePath}products/product.html?sku=${encodeURIComponent(sku)}" class="block">
      <div class="relative aspect-square bg-zinc-900 overflow-hidden shrink-0">
        <img src="${image}" alt="${name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"/>
        <div class="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent opacity-60 group-hover:opacity-35 transition-opacity"></div>
        ${badgeContainer}
      </div>
    </a>
    <div class="p-4 flex flex-col flex-1">
      <a href="${basePath}products/product.html?sku=${encodeURIComponent(sku)}" class="block">
        <p class="text-xs text-red-400 uppercase tracking-wider mb-1 font-semibold">${brand}</p>
        <h3 class="font-oswald font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-2 mb-1.5 leading-snug">${name}</h3>
        <p class="text-xs text-zinc-500 mb-2.5 line-clamp-2 leading-relaxed">${tagline}</p>
      </a>
      <div class="flex items-center gap-2 mb-3">${renderStars(rating, 3.5)}<span class="text-xs text-zinc-500">(${reviewCount})</span></div>
      <div class="mt-auto">
        <div class="flex items-center gap-2 mb-1">${priceHtml}</div>
        ${stockHtml}
      </div>
    </div>
  </div>`;
}

function buildBlogCard(post, basePath = "./") {
  const title = escapeHtml(post.title || "");
  const slug = escapeHtml(post.slug || "");
  const excerpt = escapeHtml(post.excerpt || "");
  const image = escapeHtml(post.image || "");
  const author = escapeHtml(post.author || "Ningbo Siyang Team");
  const date = post.date || "";
  const readTime = post.readTime || 5;
  const category = post.category || "";

  const colorMap = {
    "Product Guides": { bg: "bg-yellow-400/10", text: "text-yellow-400" },
    "Company News": { bg: "bg-green-400/10", text: "text-green-400" },
    "B2B Insights": { bg: "bg-blue-400/10", text: "text-blue-400" },
    "Industry Trends": { bg: "bg-purple-400/10", text: "text-purple-400" },
    "Technical Guides": { bg: "bg-yellow-400/10", text: "text-yellow-400" },
  };
  const color = colorMap[category] || { bg: "bg-blue-400/10", text: "text-blue-400" };

  return `<article class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-yellow-400/30 transition-colors group">
    <a href="${basePath}blogs/post.html?slug=${encodeURIComponent(slug)}" class="block">
      <div class="aspect-[16/10] overflow-hidden">
        <img src="${image}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
      </div>
    </a>
    <div class="p-5">
      <div class="flex items-center gap-2 mb-3">
        <span class="px-2 py-1 text-xs font-medium rounded ${color.bg} ${color.text}">${escapeHtml(category)}</span>
        <span class="text-xs text-zinc-500">${readTime} min read</span>
      </div>
      <h3 class="font-oswald text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
        <a href="${basePath}blogs/post.html?slug=${encodeURIComponent(slug)}">${title}</a>
      </h3>
      <p class="text-sm text-zinc-400 mb-4 line-clamp-3">${excerpt}</p>
      <div class="flex items-center gap-3 text-xs text-zinc-500">
        <span>${date}</span>
        <span class="w-1 h-1 rounded-full bg-zinc-600"></span>
        <span>By ${author}</span>
      </div>
    </div>
  </article>`;
}

function buildTeamCard(member) {
  const name = escapeHtml(member.name || "");
  const title = escapeHtml(member.title || "");
  const photo = escapeHtml(member.photo || "");
  const bio = escapeHtml(member.bio || "");
  return `<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 text-center hover:border-yellow-400/30 transition-colors">
    <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-zinc-800 overflow-hidden">
      <img src="${photo}" alt="${name}" class="w-full h-full object-cover" onerror="this.style.display='none'"/>
    </div>
    <h3 class="font-oswald text-lg font-bold text-white mb-1">${name}</h3>
    <p class="text-yellow-400 text-sm font-medium mb-3">${title}</p>
    <p class="text-zinc-400 text-sm leading-relaxed">${bio}</p>
  </div>`;
}

function buildTestimonialCard(t) {
  const name = escapeHtml(t.name || "");
  const company = escapeHtml(t.company || "");
  const quote = escapeHtml(t.quote || "");
  const avatar = escapeHtml(t.avatar || "");
  const rating = t.rating || 5;
  return `<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-yellow-400/30 transition-colors">
    ${renderStars(rating)}
    <p class="text-zinc-300 italic mb-4 leading-relaxed">"${quote}"</p>
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
        <img src="${avatar}" alt="${name}" class="w-full h-full object-cover" onerror="this.style.display='none'"/>
      </div>
      <div>
        <p class="text-white font-medium text-sm">${name}</p>
        <p class="text-zinc-500 text-xs">${company}</p>
      </div>
    </div>
  </div>`;
}

function buildCertificationCard(cert) {
  const name = escapeHtml(cert.name || "");
  const issuer = escapeHtml(cert.issuer || "");
  const image = escapeHtml(cert.image || "");
  const year = escapeHtml(String(cert.year || ""));
  return `<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-yellow-400/30 transition-colors">
    <div class="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-lg overflow-hidden">
      <img src="${image}" alt="${name}" class="w-full h-full object-cover" onerror="this.style.display='none'"/>
    </div>
    <h3 class="font-oswald text-lg font-bold text-white mb-1 text-center">${name}</h3>
    <p class="text-yellow-400 text-sm text-center mb-1">${issuer}</p>
    <p class="text-zinc-500 text-xs text-center">${year}</p>
  </div>`;
}

function buildFAQItem(item) {
  const question = escapeHtml(item.question || "");
  const answer = escapeHtml(item.answer || "");
  return `<details class="bg-zinc-900 rounded-xl border border-zinc-800 group">
    <summary class="flex items-center justify-between p-5 cursor-pointer hover:border-yellow-400/30 transition-colors">
      <span class="font-medium text-white pr-4">${question}</span>
      <svg class="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
    </summary>
    <div class="px-5 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-zinc-800 pt-3">${answer}</div>
  </details>`;
}

function buildDistributorCard(d) {
  const name = escapeHtml(d.companyName || "");
  const country = escapeHtml(d.country || "");
  const contact = escapeHtml(d.contactPerson || "");
  const email = d.email || "";
  const phone = escapeHtml(d.phone || "");
  const website = d.website || "";
  const logo = d.logo || "";
  let html = `<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-yellow-400/30 transition-colors">
    <div class="flex items-center gap-4 mb-4">`;
  if (logo) {
    html += `<img src="${escapeHtml(logo)}" alt="${name}" class="w-12 h-12 object-contain" onerror="this.style.display='none'"/>`;
  }
  html += `<div>
      <h3 class="font-oswald text-lg font-bold text-white">${name}</h3>
      <p class="text-yellow-400 text-sm">${country}</p>
    </div></div>`;
  if (contact) html += `<p class="text-zinc-400 text-sm mb-1">Contact: ${contact}</p>`;
  if (email) html += `<a href="mailto:${escapeHtml(email)}" class="text-zinc-400 text-sm hover:text-yellow-400 transition-colors block mb-1">${escapeHtml(email)}</a>`;
  if (phone) html += `<p class="text-zinc-400 text-sm mb-1">${phone}</p>`;
  if (website) html += `<a href="${escapeHtml(website)}" target="_blank" class="text-yellow-400 text-sm hover:text-yellow-300 transition-colors">Visit Website &rarr;</a>`;
  html += `</div>`;
  return html;
}

function buildPartnerCard(p) {
  const name = escapeHtml(p.name || "");
  const logo = escapeHtml(p.logo || "");
  const country = escapeHtml(p.country || "");
  const partnerType = escapeHtml(p.partnerType || "");
  const website = p.website || "";
  let html = `<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 text-center hover:border-yellow-400/30 transition-colors">`;
  if (logo) {
    html += `<div class="h-16 flex items-center justify-center mb-4"><img src="${logo}" alt="${name}" class="max-h-12 object-contain" onerror="this.style.display='none'"/></div>`;
  }
  html += `<h3 class="font-oswald text-lg font-bold text-white mb-1">${name}</h3>`;
  if (partnerType) html += `<p class="text-yellow-400 text-sm mb-1">${partnerType}</p>`;
  if (country) html += `<p class="text-zinc-500 text-xs mb-2">${country}</p>`;
  if (website) html += `<a href="${escapeHtml(website)}" target="_blank" class="text-yellow-400 text-sm hover:text-yellow-300 transition-colors">Visit Website &rarr;</a>`;
  html += `</div>`;
  return html;
}

function buildCaseStudyCard(cs) {
  const title = escapeHtml(cs.title || "");
  const client = escapeHtml(cs.client || "");
  const country = escapeHtml(cs.country || "");
  const countryFlag = cs.countryFlag || "";
  const industry = escapeHtml(cs.industry || "");
  const image = escapeHtml(cs.image || "");
  const results = Array.isArray(cs.results) ? cs.results : [];
  let html = `<div class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-yellow-400/30 transition-colors">`;
  if (image) {
    html += `<div class="aspect-[16/9] overflow-hidden"><img src="${image}" alt="${title}" class="w-full h-full object-cover" loading="lazy"/></div>`;
  }
  html += `<div class="p-6">`;
  html += `<div class="flex items-center gap-2 mb-3">`;
  if (countryFlag) html += `<span class="text-xl">${countryFlag}</span>`;
  if (country) html += `<span class="text-zinc-400 text-sm">${country}</span>`;
  html += `</div>`;
  html += `<h3 class="font-oswald text-xl font-bold text-white mb-2">${title}</h3>`;
  if (client) html += `<p class="text-yellow-400 text-sm mb-2">${client}</p>`;
  if (industry) html += `<p class="text-zinc-500 text-xs mb-3">${industry}</p>`;
  if (results.length > 0) {
    html += `<ul class="space-y-1">`;
    results.forEach(r => { html += `<li class="text-zinc-400 text-sm flex items-start gap-2"><span class="text-yellow-400 mt-1">&#10003;</span>${escapeHtml(r)}</li>`; });
    html += `</ul>`;
  }
  html += `</div></div>`;
  return html;
}

function buildWarrantyCard(w) {
  const title = escapeHtml(w.title || "");
  const warrantyType = escapeHtml(w.warrantyType || "");
  const warrantyPeriod = escapeHtml(w.warrantyPeriod || "");
  const description = escapeHtml(w.description || "");
  const exclusions = Array.isArray(w.exclusions) ? w.exclusions : [];
  const claimProcess = escapeHtml(w.claimProcess || "");
  const typeLabels = { standard: "Standard Warranty", brushless_motor: "Brushless Motor Warranty", extended: "Extended Warranty" };
  const typeLabel = typeLabels[w.warrantyType] || warrantyType;
  const typeColors = { standard: "text-green-400", brushless_motor: "text-blue-400", extended: "text-purple-400" };
  const typeColor = typeColors[w.warrantyType] || "text-yellow-400";
  let html = `<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-yellow-400/30 transition-colors">`;
  html += `<div class="flex items-center gap-3 mb-4">`;
  html += `<div class="w-10 h-10 bg-yellow-400/10 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg></div>`;
  html += `<div><h3 class="font-oswald text-lg font-bold text-white">${title}</h3>`;
  html += `<p class="${typeColor} text-sm">${typeLabel}</p></div></div>`;
  if (warrantyPeriod) html += `<p class="text-white font-semibold mb-3">${warrantyPeriod}</p>`;
  if (description) html += `<p class="text-zinc-400 text-sm mb-4">${description}</p>`;
  if (exclusions.length > 0) {
    html += `<div class="mb-3"><p class="text-zinc-500 text-xs uppercase tracking-wider mb-2">Exclusions</p><ul class="space-y-1">`;
    exclusions.forEach(e => { html += `<li class="text-zinc-500 text-sm flex items-start gap-2"><span class="text-red-400">&times;</span>${escapeHtml(e)}</li>`; });
    html += `</ul></div>`;
  }
  if (claimProcess) html += `<p class="text-zinc-400 text-sm"><strong class="text-white">Claims:</strong> ${claimProcess}</p>`;
  html += `</div>`;
  return html;
}

function buildSafetyCard(s) {
  const title = escapeHtml(s.title || "");
  const noticeType = escapeHtml(s.noticeType || "");
  const severity = s.severity || "info";
  const description = escapeHtml(s.description || "");
  const resolution = escapeHtml(s.resolution || "");
  const date = s.date || "";
  const severityColors = { info: "border-blue-400/50 bg-blue-400/5", warning: "border-yellow-400/50 bg-yellow-400/5", critical: "border-red-400/50 bg-red-400/5" };
  const severityBadge = { info: "bg-blue-400/10 text-blue-400", warning: "bg-yellow-400/10 text-yellow-400", critical: "bg-red-400/10 text-red-400" };
  const borderClass = severityColors[severity] || severityColors.info;
  const badgeClass = severityBadge[severity] || severityBadge.info;
  let html = `<div class="rounded-xl border ${borderClass} p-6">`;
  html += `<div class="flex items-center gap-3 mb-4">`;
  html += `<span class="px-2 py-1 text-xs font-medium rounded ${badgeClass}">${escapeHtml(noticeType)}</span>`;
  html += `<span class="px-2 py-1 text-xs font-medium rounded ${badgeClass}">${severity.toUpperCase()}</span>`;
  if (date) html += `<span class="text-zinc-500 text-xs ml-auto">${date}</span>`;
  html += `</div>`;
  html += `<h3 class="font-oswald text-lg font-bold text-white mb-2">${title}</h3>`;
  if (description) html += `<p class="text-zinc-400 text-sm mb-4">${description}</p>`;
  if (resolution) html += `<div class="bg-zinc-900/50 rounded-lg p-4"><p class="text-sm"><strong class="text-white">Resolution:</strong> <span class="text-zinc-400">${resolution}</span></p></div>`;
  html += `</div>`;
  return html;
}

function buildManualCard(m) {
  const title = escapeHtml(m.title || "");
  const language = escapeHtml(m.language || "en");
  const file = escapeHtml(m.file || "");
  const version = escapeHtml(m.version || "");
  const pages = m.pages || "";
  const date = m.date || "";
  const langLabels = { en: "English", zh: "Chinese", ar: "Arabic", fr: "French", ru: "Russian", es: "Spanish" };
  const langLabel = langLabels[m.language] || language;
  let html = `<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-yellow-400/30 transition-colors">`;
  html += `<div class="flex items-start gap-4">`;
  html += `<div class="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center shrink-0"><svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg></div>`;
  html += `<div class="flex-1"><h3 class="font-oswald text-lg font-bold text-white mb-1">${title}</h3>`;
  html += `<div class="flex items-center gap-3 text-sm text-zinc-500">`;
  html += `<span>${langLabel}</span>`;
  if (version) html += `<span>v${version}</span>`;
  if (pages) html += `<span>${pages} pages</span>`;
  html += `</div>`;
  if (date) html += `<p class="text-zinc-500 text-xs mt-1">${date}</p>`;
  html += `</div></div>`;
  if (file) html += `<a href="${file}" target="_blank" class="mt-4 inline-flex items-center gap-2 text-yellow-400 text-sm hover:text-yellow-300 transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download PDF</a>`;
  html += `</div>`;
  return html;
}

function buildDownloadCard(d) {
  const title = escapeHtml(d.title || "");
  const category = escapeHtml(d.category || "");
  const file = escapeHtml(d.file || "");
  const language = escapeHtml(d.language || "en");
  const version = escapeHtml(d.version || "");
  const fileSize = escapeHtml(d.fileSize || "");
  const date = d.date || "";
  const description = escapeHtml(d.description || "");
  const langLabels = { en: "English", zh: "Chinese", ar: "Arabic", fr: "French", ru: "Russian", es: "Spanish" };
  const langLabel = langLabels[d.language] || language;
  const catIcons = { Catalog: "book-open", "Spec Sheet": "file-text", Manual: "file", Certificate: "award", Firmware: "cpu" };
  let html = `<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-yellow-400/30 transition-colors">`;
  html += `<div class="flex items-start gap-4">`;
  html += `<div class="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center shrink-0"><svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div>`;
  html += `<div class="flex-1"><h3 class="font-oswald text-lg font-bold text-white mb-1">${title}</h3>`;
  html += `<div class="flex items-center gap-3 text-sm text-zinc-500 flex-wrap">`;
  html += `<span class="px-2 py-0.5 bg-yellow-400/10 text-yellow-400 text-xs rounded">${category}</span>`;
  html += `<span>${langLabel}</span>`;
  if (version) html += `<span>v${version}</span>`;
  if (fileSize) html += `<span>${fileSize}</span>`;
  html += `</div>`;
  if (description) html += `<p class="text-zinc-400 text-sm mt-2">${description}</p>`;
  if (date) html += `<p class="text-zinc-500 text-xs mt-1">${date}</p>`;
  html += `</div></div>`;
  if (file) html += `<a href="${file}" target="_blank" class="mt-4 inline-flex items-center gap-2 text-yellow-400 text-sm hover:text-yellow-300 transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download</a>`;
  html += `</div>`;
  return html;
}

// ============================================================
// HTML Processors
// ============================================================

function processHomepage(html, data) {
  if (!data || !Object.keys(data).length) return html;

  // Hero
  if (data.heroTitle) {
    const parts = data.heroTitle.split(" ");
    if (parts.length > 1) {
      html = replaceTextById(html, "cms-hero-title-line1", parts.slice(0, -1).join(" "));
      html = replaceTextById(html, "cms-hero-title-line2", parts[parts.length - 1]);
    } else {
      html = replaceTextById(html, "cms-hero-title-line1", data.heroTitle);
      html = replaceTextById(html, "cms-hero-title-line2", "");
    }
  }
  html = replaceTextById(html, "cms-hero-subtitle", data.heroSubtitle);
  html = replaceTextById(html, "cms-hero-cta", data.heroCtaText);

  // Stats
  if (Array.isArray(data.stats)) {
    data.stats.forEach((item, idx) => {
      if (item.value) {
        const suffix = item.value.replace(/[\d.]/g, "");
        const numVal = parseInt(item.value.replace(/[^\d]/g, ""), 10);
        if (!isNaN(numVal)) {
          html = replaceAttributeById(html, `cms-stat${idx + 1}-value`, "data-count-up", String(numVal));
          html = replaceAttributeById(html, `cms-stat${idx + 1}-value`, "data-count-suffix", suffix || "");
        }
        html = replaceTextById(html, `cms-stat${idx + 1}-value`, item.value);
      }
      if (item.label) {
        html = replaceTextById(html, `cms-stat${idx + 1}-label`, item.label);
      }
    });
  }

  // Section headings & descriptions
  const sectionMap = [
    { headingId: "cms-trust-badges-heading", headingKey: "trustBadgesHeading" },
    { headingId: "cms-featured-products-heading", headingKey: "featuredProductsHeading", descId: "cms-featured-products-desc", descKey: "featuredProductsDescription" },
    { headingId: "cms-category-grid-heading", headingKey: "categoryGridHeading", descId: "cms-category-grid-desc", descKey: "categoryGridDescription" },
    { headingId: "cms-brand-showcase-heading", headingKey: "brandShowcaseHeading", descId: "cms-brand-showcase-desc", descKey: "brandShowcaseDescription" },
    { headingId: "cms-stats-heading", headingKey: "statsHeading", descId: "cms-stats-desc", descKey: "statsDescription" },
    { headingId: "cms-testimonials-heading", headingKey: "testimonialsHeading", descId: "cms-testimonials-desc", descKey: "testimonialsDescription" },
    { headingId: "cms-use-cases-heading", headingKey: "useCasesHeading", descId: "cms-use-cases-desc", descKey: "useCasesDescription" },
    { headingId: "cms-video-tutorials-heading", headingKey: "videoTutorialsHeading", descId: "cms-video-tutorials-desc", descKey: "videoTutorialsDesc" },
  ];

  sectionMap.forEach((sec) => {
    if (data[sec.headingKey]) html = replaceTextById(html, sec.headingId, data[sec.headingKey]);
    if (sec.descKey && data[sec.descKey]) html = replaceTextById(html, sec.descId, data[sec.descKey]);
  });

  // Trust badges
  if (Array.isArray(data.trustBadges)) {
    data.trustBadges.forEach((item, idx) => {
      if (item.title) html = replaceTextById(html, `cms-trust-badge${idx + 1}-title`, item.title);
      if (item.description) html = replaceTextById(html, `cms-trust-badge${idx + 1}-desc`, item.description);
    });
  }

  // Achievements
  if (Array.isArray(data.achievements)) {
    data.achievements.forEach((item, idx) => {
      if (item.title) html = replaceTextById(html, `cms-achievement${idx + 1}-title`, item.title);
      if (item.description) html = replaceTextById(html, `cms-achievement${idx + 1}-desc`, item.description);
    });
  }

  // Certifications
  if (Array.isArray(data.certifications)) {
    data.certifications.forEach((item, idx) => {
      if (item.title) html = replaceTextById(html, `cms-cert${idx + 1}-title`, item.title);
      if (item.description) html = replaceTextById(html, `cms-cert${idx + 1}-desc`, item.description);
    });
  }

  // Brand CTA
  html = replaceTextById(html, "cms-brand-cta-title", data.brandCtaTitle);
  html = replaceTextById(html, "cms-brand-cta-desc", data.brandCtaDescription);

  // Trust indicators
  if (Array.isArray(data.trustIndicators)) {
    data.trustIndicators.forEach((item, idx) => {
      if (item.title) html = replaceTextById(html, `cms-trust-ind${idx + 1}-title`, item.title);
      if (item.description) html = replaceTextById(html, `cms-trust-ind${idx + 1}-desc`, item.description);
    });
  }

  // Use cases
  if (Array.isArray(data.useCases)) {
    data.useCases.forEach((item, idx) => {
      if (item.title) html = replaceTextById(html, `cms-use-case${idx + 1}-title`, item.title);
      if (item.description) html = replaceTextById(html, `cms-use-case${idx + 1}-desc`, item.description);
    });
  }

  // B2B section
  html = replaceTextById(html, "cms-b2b-heading", data.b2bHeading);
  html = replaceTextById(html, "cms-b2b-desc", data.b2bDescription);
  if (Array.isArray(data.b2bBenefits)) {
    data.b2bBenefits.forEach((item, idx) => {
      if (item.title) html = replaceTextById(html, `cms-b2b-benefit${idx + 1}-title`, item.title);
      if (item.description) html = replaceTextById(html, `cms-b2b-benefit${idx + 1}-desc`, item.description);
    });
  }

  // FAQ section
  html = replaceTextById(html, "cms-faq-heading", data.faqHeading);
  html = replaceTextById(html, "cms-faq-desc", data.faqDescription);
  html = replaceTextById(html, "cms-faq-cta-heading", data.faqCtaHeading);
  html = replaceTextById(html, "cms-faq-cta-desc", data.faqCtaDescription);

  // Final CTA
  html = replaceTextById(html, "cms-final-cta-heading", data.finalCtaHeading);
  html = replaceTextById(html, "cms-final-cta-desc", data.finalCtaDescription);
  html = replaceTextById(html, "cms-final-cta-button", data.finalCtaButtonText);

  // 3D viewer
  html = replaceTextById(html, "cms-3d-heading", data.viewer3dHeading);
  html = replaceTextById(html, "cms-3d-desc", data.viewer3dDesc);

  // Product selector
  html = replaceTextById(html, "cms-product-selector-heading", data.productSelectorHeading);
  html = replaceTextById(html, "cms-product-selector-desc", data.productSelectorDesc);

  // Case studies heading
  html = replaceTextById(html, "cms-case-studies-heading", data.caseStudiesHeading);

  // Footer
  html = replaceTextById(html, "cms-footer-brand-desc", data.footerBrandDesc);
  html = replaceTextById(html, "cms-footer-newsletter-heading", data.footerNewsletterHeading);
  html = replaceTextById(html, "cms-footer-newsletter-desc", data.footerNewsletterDesc);

  // SEO meta
  if (data.pageTitle) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(data.pageTitle)}</title>`);
  }
  if (data.description) {
    html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeHtml(data.description)}"`);
  }

  // Inject homepage data JSON for cms-loader to use
  html = injectScriptJson(html, "homepage-data", data);

  return html;
}

function processProductPage(html, products) {
  // Inject all products as JSON
  html = injectScriptJson(html, "cms-product-data", { products });

  // Update title fallback
  const firstProduct = products[0];
  if (firstProduct && firstProduct.name) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(firstProduct.name)} – Ningbo Siyang</title>`);
  }

  // Inject product names into the page for SEO (comma-separated list in a noscript tag)
  const productNames = products.slice(0, 20).map((p) => p.name).filter(Boolean).join(", ");
  if (productNames) {
    const noscript = `<noscript><p style="position:absolute;left:-9999px">Products: ${escapeHtml(productNames)}</p></noscript>`;
    html = injectBetweenMarkers(html, "product-seo-noscript", noscript);
  }

  return html;
}

function processBlogPostPage(html, posts) {
  // Inject all posts as JSON
  html = injectScriptJson(html, "cms-blog-data", { posts });

  // Update title fallback
  const firstPost = posts[0];
  if (firstPost && firstPost.title) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(firstPost.title)} – Ningbo Siyang</title>`);
  }

  return html;
}

function processCompanyInfo(html, data) {
  if (!data || !Object.keys(data).length) return html;

  // Replace text in elements with cms-company-* classes
  const mapping = {
    ".cms-company-email": data.email,
    ".cms-company-phone": data.phone,
    ".cms-company-address": data.address,
    ".cms-company-name": data.companyName,
    ".cms-company-founded": data.founded,
  };

  Object.entries(mapping).forEach(([selector, value]) => {
    if (!value) return;
    const escaped = escapeHtml(value);
    // For each selector, find elements in the HTML string and replace their text content
    // This is a simplified approach - we look for the class and replace text until closing tag
    const className = selector.replace(".", "");
    const regex = new RegExp(`(<[^>]*?class=["'][^"']*?${className}[^"']*?["'][^>]*?>)([^<]*?)(</[^>]*?>)`, "g");
    html = html.replace(regex, (match, open, content, close) => {
      return open + escaped + close;
    });
  });

  // Update JSON-LD with company info
  if (data.companyName || data.email || data.phone) {
    html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (match, jsonContent) => {
      try {
        const ld = JSON.parse(jsonContent);
        if (ld && ld["@graph"]) {
          ld["@graph"].forEach((item) => {
            if (item["@type"] === "Organization" || item["@type"] === "LocalBusiness") {
              if (data.companyName) item.name = data.companyName;
              if (data.email) {
                if (item.contactPoint) item.contactPoint.email = data.email;
                if (item.email) item.email = data.email;
              }
              if (data.phone) {
                if (item.contactPoint) item.contactPoint.telephone = data.phone;
                if (item.telephone) item.telephone = data.phone;
              }
              if (data.address && item.address) {
                item.address.streetAddress = data.address;
              }
            }
          });
        }
        return `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
      } catch (e) {
        return match;
      }
    });
  }

  return html;
}

function processCollectionPage(filePath, containerId, itemsHtml, opts = {}) {
  const fullPath = path.join(projectRoot, filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`  File not found: ${filePath}`);
    return;
  }
  let html = fs.readFileSync(fullPath, "utf-8");
  html = injectHtmlIntoContainer(html, containerId, itemsHtml);
  if (opts.companyData) {
    html = processCompanyInfo(html, opts.companyData);
  }
  if (!dryRun) {
    fs.writeFileSync(fullPath, html, "utf-8");
  }
  console.log(`  ${filePath}: injected ${containerId}`);
}

// ============================================================
// Main
// ============================================================

function main() {
  console.log("Building pre-rendered HTML...\n");
  if (dryRun) console.log("*** DRY RUN — no files will be written ***\n");

  // Load all content
  const homepageData = loadHomepageData();
  const products = loadProductsData();
  const blogPosts = loadBlogData();
  const teamMembers = loadTeamData();
  const testimonials = loadTestimonialsData();
  const certifications = loadCertificationsData();
  const faqItems = loadFAQData();
  const distributors = loadDistributorsData();
  const partners = loadPartnersData();
  const caseStudies = loadCaseStudiesData();
  const warrantyItems = loadWarrantyData();
  const safetyItems = loadSafetyData();
  const manuals = loadManualsData();
  const downloads = loadDownloadsData();
  const companyData = loadCompanyData();

  console.log(`Loaded content:`);
  console.log(`  Homepage fields: ${Object.keys(homepageData).length}`);
  console.log(`  Products: ${products.length}`);
  console.log(`  Blog posts: ${blogPosts.length}`);
  console.log(`  Team members: ${teamMembers.length}`);
  console.log(`  Testimonials: ${testimonials.length}`);
  console.log(`  Certifications: ${certifications.length}`);
  console.log(`  FAQ items: ${faqItems.length}`);
  console.log(`  Distributors: ${distributors.length}`);
  console.log(`  Partners: ${partners.length}`);
  console.log(`  Case studies: ${caseStudies.length}`);
  console.log(`  Warranty items: ${warrantyItems.length}`);
  console.log(`  Safety items: ${safetyItems.length}`);
  console.log(`  Manuals: ${manuals.length}`);
  console.log(`  Downloads: ${downloads.length}`);
  console.log(`  Company fields: ${Object.keys(companyData).length}`);
  console.log();

  // Process index.html
  console.log("Processing index.html...");
  let indexHtml = fs.readFileSync(path.join(projectRoot, "index.html"), "utf-8");
  indexHtml = processHomepage(indexHtml, homepageData);
  indexHtml = processCompanyInfo(indexHtml, companyData);
  if (!dryRun) fs.writeFileSync(path.join(projectRoot, "index.html"), indexHtml, "utf-8");
  console.log("  index.html: done");

  // Process products/product.html
  console.log("Processing products/product.html...");
  let productHtml = fs.readFileSync(path.join(projectRoot, "products/product.html"), "utf-8");
  productHtml = processProductPage(productHtml, products);
  productHtml = processCompanyInfo(productHtml, companyData);
  if (!dryRun) fs.writeFileSync(path.join(projectRoot, "products/product.html"), productHtml, "utf-8");
  console.log("  products/product.html: done");

  // Process blogs/post.html
  console.log("Processing blogs/post.html...");
  let postHtml = fs.readFileSync(path.join(projectRoot, "blogs/post.html"), "utf-8");
  postHtml = processBlogPostPage(postHtml, blogPosts);
  postHtml = processCompanyInfo(postHtml, companyData);
  if (!dryRun) fs.writeFileSync(path.join(projectRoot, "blogs/post.html"), postHtml, "utf-8");
  console.log("  blogs/post.html: done");

  // Process collection pages
  console.log("Processing collection pages...");

  // Products grid on products/index.html
  const productCards = products.map((p) => buildProductCard(p, "./")).join("\n");
  processCollectionPage("products/index.html", "cms-products-grid", productCards, { companyData });

  // Category pages
  const categories = ["drills-drivers", "saws", "grinders", "sanders", "impact-tools", "combo-kits"];
  categories.forEach((cat) => {
    const catProducts = products.filter((p) => p.category === cat);
    const catCards = catProducts.map((p) => buildProductCard(p, "./")).join("\n");
    processCollectionPage(`products/${cat}.html`, "cms-products-grid", catCards, { companyData });
  });

  // Blog index
  const blogCards = blogPosts.map((p) => buildBlogCard(p, "./")).join("\n");
  processCollectionPage("blogs/index.html", "cms-blog-index", blogCards, { companyData });

  // Team page
  const teamCards = teamMembers.map(buildTeamCard).join("\n");
  processCollectionPage("about/team.html", "cms-team-grid", teamCards, { companyData });

  // Testimonials (homepage only - about/index.html has no testimonials container)
  const testimonialCards = testimonials.map(buildTestimonialCard).join("\n");
  processCollectionPage("index.html", "cms-testimonials-grid", testimonialCards, { companyData });

  // Certifications
  const certCards = certifications.map(buildCertificationCard).join("\n");
  processCollectionPage("about/certifications.html", "cms-certifications-grid", certCards, { companyData });

  // FAQ
  const faqHtml = faqItems.map(buildFAQItem).join("\n");
  processCollectionPage("about/faq.html", "cms-faq-grid", faqHtml, { companyData });

  // Distributors
  const distCards = distributors.map(buildDistributorCard).join("\n");
  processCollectionPage("about/distributors.html", "cms-distributors-grid", distCards, { companyData });

  // Partners
  const partnerCards = partners.map(buildPartnerCard).join("\n");
  processCollectionPage("about/company.html", "cms-partners-grid", partnerCards, { companyData });

  // Case Studies (homepage and OEM/ODM page)
  const caseStudyCards = caseStudies.map(buildCaseStudyCard).join("\n");
  processCollectionPage("index.html", "cms-case-studies-grid", caseStudyCards, { companyData });
  processCollectionPage("about/oem-odm.html", "cms-case-studies-grid", caseStudyCards, { companyData });

  // Warranty
  const warrantyCards = warrantyItems.map(buildWarrantyCard).join("\n");
  processCollectionPage("about/warranty.html", "cms-warranty-grid", warrantyCards, { companyData });

  // Safety
  const safetyCards = safetyItems.map(buildSafetyCard).join("\n");
  processCollectionPage("about/safety.html", "cms-safety-grid", safetyCards, { companyData });

  // Manuals
  const manualCards = manuals.map(buildManualCard).join("\n");
  processCollectionPage("about/manuals.html", "cms-manuals-grid", manualCards, { companyData });

  // Downloads
  const downloadCards = downloads.map(buildDownloadCard).join("\n");
  processCollectionPage("about/downloads.html", "cms-downloads-grid", downloadCards, { companyData });

  // Process individual content pages (title, subtitle, description, body)
  console.log("Processing content pages...");
  const contentPages = [
    { html: "about/oem-odm.html", md: "oem-odm" },
    { html: "about/warranty.html", md: "warranty" },
    { html: "about/manuals.html", md: "manuals" },
    { html: "about/faq.html", md: "faq" },
    { html: "about/downloads.html", md: "downloads" },
    { html: "about/payment-terms.html", md: "payment-terms" },
    { html: "about/safety.html", md: "safety" },
    { html: "about/distributors.html", md: "distributors" },
    { html: "about/team.html", md: "team" },
    { html: "about/certifications.html", md: "certifications" },
    { html: "about/global.html", md: "global" },
    { html: "about/brochure.html", md: "brochure" },
    { html: "about/company.html", md: "about" },
    { html: "about/index.html", md: "about" },
    { html: "contact.html", md: "contact" },
    { html: "privacy.html", md: "privacy" },
    { html: "terms.html", md: "terms" },
    { html: "blogs/index.html", md: "blog" },
    { html: "products/index.html", md: "products" },
    { html: "products/drills-drivers.html", md: "drills-drivers" },
    { html: "products/saws.html", md: "saws" },
    { html: "products/grinders.html", md: "grinders" },
    { html: "products/sanders.html", md: "sanders" },
    { html: "products/impact-tools.html", md: "impact-tools" },
    { html: "products/combo-kits.html", md: "combo-kits" },
  ];

  for (const page of contentPages) {
    const mdPath = path.join(projectRoot, `content/pages/${page.md}.md`);
    const htmlPath = path.join(projectRoot, page.html);
    if (!fs.existsSync(mdPath) || !fs.existsSync(htmlPath)) continue;
    const mdContent = fs.readFileSync(mdPath, "utf-8");
    const { data, body } = parseFrontmatter(mdContent);
    if (!data || !Object.keys(data).length) continue;

    let html = fs.readFileSync(htmlPath, "utf-8");
    let modified = false;

    if (data.pageTitle || data.title) {
      html = replaceElementTextById(html, "cms-page-title", data.pageTitle || data.title);
      modified = true;
    }
    if (data.subtitle) {
      html = replaceElementTextById(html, "cms-page-subtitle", data.subtitle);
      modified = true;
    }
    if (data.description) {
      html = replaceElementTextById(html, "cms-page-description", data.description);
      modified = true;
    }
    if (body) {
      const bodyHtml = parseMarkdown(body);
      if (bodyHtml) {
        html = injectIntoElementById(html, "cms-page-body", bodyHtml);
        modified = true;
      }
    }

    if (modified) {
      if (!dryRun) fs.writeFileSync(htmlPath, html, "utf-8");
      console.log(`  ${page.html}: injected page content`);
    }
  }

  console.log("\nBuild complete!");
}

main();
