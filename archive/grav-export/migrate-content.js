/**
 * Grav Content Migration Script
 * Reads existing Decap CMS .md files from content/ directory
 * and creates Grav-compatible pages in _grav-export/user/pages/
 *
 * Usage: node _grav-export/migrate-content.js
 * Run from project root (public-website/)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = __dirname;
const CONTENT_SRC = path.join(ROOT, '..', 'content');
const PAGES_DEST = path.join(ROOT, 'user', 'pages');

// Category folder mapping
const CATEGORY_DIRS = {
  'drills-drivers': '02.products/drills-drivers',
  'saws': '02.products/saws',
  'grinders': '02.products/grinders',
  'sanders': '02.products/sanders',
  'impact-tools': '02.products/impact-tools',
  'combo-kits': '02.products/combo-kits',
};

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return { data: {}, body: content };
  const closing = content.indexOf('---', 3);
  if (closing === -1) return { data: {}, body: content };
  const raw = content.slice(3, closing).trim();
  try {
    return { data: yaml.load(raw) || {}, body: content.slice(closing + 3).trim() };
  } catch (e) {
    return { data: {}, body: content };
  }
}

function snakeCase(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

function convertProductFrontmatter(fm) {
  const camelKeys = {
    'compareAtPrice': 'compare_at_price',
    'categoryLabel': 'category_label',
    'userBenefits': 'benefits',
    'topProduct': 'top_product',
    'inStock': 'in_stock',
    'leadTime': 'lead_time',
    'reviewCount': 'review_count',
    'isFeatured': 'featured',
    'isTopProduct': 'top_product',
    'relatedProducts': 'related',
    'splineSceneUrl': 'spline_scene_url',
    'arModelUrl': 'ar_model_url',
    'autoSpin': 'auto_spin',
    'warehouseLocation': 'warehouse_location',
  };

  const result = {};

  for (const [key, value] of Object.entries(fm)) {
    // Skip slug (Grav uses folder name)
    if (key === 'slug' || key === 'archived') continue;

    const newKey = camelKeys[key] || key;

    // Convert specs sub-keys to snake_case
    if (newKey === 'specs' && typeof value === 'object' && value !== null) {
      result[newKey] = {};
      for (const [sk, sv] of Object.entries(value)) {
        const snaked = sk.replace(/([A-Z])/g, '_$1').toLowerCase();
        result[newKey][snaked] = sv;
      }
      continue;
    }

    // Convert compareFields
    if (newKey === 'compareFields' && typeof value === 'object' && value !== null) {
      result['compare_fields'] = {};
      for (const [ck, cv] of Object.entries(value)) {
        const snaked = ck.replace(/([A-Z])/g, '_$1').toLowerCase();
        result['compare_fields'][snaked] = cv;
      }
      continue;
    }

    // Map 'name' to 'title'
    if (newKey === 'name') {
      result['title'] = value;
      continue;
    }

    // Fix image paths: remove ../ prefix
    if (newKey === 'image' && typeof value === 'string') {
      result[newKey] = value.replace(/^(\.\.\/)*images\//, '');
      continue;
    }

    if (newKey === 'images' && Array.isArray(value)) {
      result[newKey] = value.map(v => String(v).replace(/^(\.\.\/)*images\//, ''));
      continue;
    }

    result[newKey] = value;
  }

  // Add taxonomy
  if (result.category) {
    result.taxonomy = { category: [result.category] };
  }
  if (result.brand) {
    result.taxonomy = result.taxonomy || {};
    result.taxonomy.brand = [result.brand];
  }

  // Add visible flag (opposite of archived)
  result.visible = true;

  return result;
}

function toYaml(obj) {
  // Simple YAML emitter for frontmatter
  const lines = ['---'];
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined || value === '') continue;
    if (typeof value === 'boolean' || typeof value === 'number') {
      lines.push(`${key}: ${value}`);
    } else if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        if (typeof item === 'string') {
          lines.push(`  - '${item.replace(/'/g, "''")}'`);
        } else {
          lines.push(`  - ${item}`);
        }
      }
    } else if (typeof value === 'object') {
      lines.push(`${key}:`);
      for (const [sk, sv] of Object.entries(value)) {
        if (sv === null || sv === undefined || sv === '') continue;
        if (typeof sv === 'boolean' || typeof sv === 'number') {
          lines.push(`  ${sk}: ${sv}`);
        } else if (Array.isArray(sv)) {
          lines.push(`  ${sk}:`);
          for (const si of sv) {
            lines.push(`    - '${String(si).replace(/'/g, "''")}'`);
          }
        } else {
          lines.push(`  ${sk}: '${String(sv).replace(/'/g, "''")}'`);
        }
      }
    } else {
      lines.push(`${key}: '${String(value).replace(/'/g, "''")}'`);
    }
  }
  lines.push('---');
  lines.push(''); // content body
  return lines.join('\n');
}

// ===== MIGRATE PRODUCTS =====
console.log('Migrating products...');
const productsDir = path.join(CONTENT_SRC, 'products');
if (fs.existsSync(productsDir)) {
  const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.md') && !/\.[a-z]{2}\.md$/.test(f));
  let count = 0;

  for (const file of files) {
    const filePath = path.join(productsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, body } = parseFrontmatter(content);

    if (!data.sku && !data.name) continue;
    if (data.draft === true || data.archived === true) continue;

    const sku = data.sku || file.replace('.md', '');
    const safeSku = sku.replace(/\//g, '-');
    const category = data.category || 'drills-drivers';
    const categoryDir = CATEGORY_DIRS[category] || '02.products/drills-drivers';

    const skuDir = path.join(PAGES_DEST, categoryDir, safeSku);
    if (!fs.existsSync(skuDir)) fs.mkdirSync(skuDir, { recursive: true });

    const gravFm = convertProductFrontmatter(data);
    const outPath = path.join(skuDir, 'product.md');
    fs.writeFileSync(outPath, toYaml(gravFm));
    count++;
  }
  console.log(`  ${count} products migrated`);
}

// ===== MIGRATE TEAM =====
console.log('Migrating team...');
migrateSimpleCollection('team', '04.about/05.team', 'member', (fm) => ({
  title: fm.name || '',
  position: fm.title || '',
  department: fm.department || '',
  photo: fm.photo || '',
  bio: fm.bio || '',
  email: fm.email || '',
  linkedin: fm.linkedin || '',
  order: fm.order || 0,
  visible: true,
}));

// ===== MIGRATE TESTIMONIALS =====
console.log('Migrating testimonials...');
migrateSimpleCollection('testimonials', '04.about/06.testimonials', 'testimonial', (fm) => ({
  title: fm.name || '',
  position: fm.position || '',
  company: fm.company || '',
  country: fm.country || '',
  quote: fm.quote || '',
  avatar: fm.avatar || '',
  rating: fm.rating || 5,
  order: fm.order || 0,
  visible: true,
}));

// ===== MIGRATE CERTIFICATIONS =====
console.log('Migrating certifications...');
migrateSimpleCollection('certifications', '04.about/02.certifications', 'certification', (fm) => ({
  title: fm.name || '',
  issuer: fm.issuer || '',
  cert_number: fm.cert_number || '',
  image: fm.image || '',
  scope: fm.scope || '',
  year: fm.year || '',
  expiry_date: fm.expiryDate || '',
  verify_url: fm.verifyUrl || '',
  order: fm.order || 0,
  visible: true,
}));

// ===== MIGRATE FAQ =====
console.log('Migrating FAQ...');
migrateSimpleCollection('faq', '04.about/07.faq', 'item', (fm, slug, body) => ({
  title: fm.question || '',
  category: fm.category || '',
  order: fm.order || 0,
  visible: true,
}), true); // include body as content

// ===== MIGRATE DISTRIBUTORS =====
console.log('Migrating distributors...');
migrateSimpleCollection('distributors', '04.about/08.distributors', 'distributor', (fm) => ({
  title: fm.companyName || '',
  country: fm.country || '',
  region: fm.region || '',
  contact_person: fm.contactPerson || '',
  email: fm.email || '',
  phone: fm.phone || '',
  website: fm.website || '',
  logo: fm.logo || '',
  address: fm.address || '',
  product_lines: fm.productLines || '',
  order: fm.order || 0,
  visible: true,
}));

// ===== MIGRATE WARRANTY =====
console.log('Migrating warranty...');
migrateSimpleCollection('warranty', '04.about/09.warranty', 'policy', (fm, slug, body) => ({
  title: fm.title || '',
  warranty_type: fm.warrantyType || 'standard',
  warranty_period: fm.warrantyPeriod || '',
  description: fm.description || '',
  exclusions: fm.exclusions || [],
  claim_process: fm.claimProcess || '',
  visible: true,
}), true);

// ===== MIGRATE SAFETY =====
console.log('Migrating safety...');
migrateSimpleCollection('safety', '04.about/10.safety', 'notice', (fm) => ({
  title: fm.title || '',
  notice_type: fm.noticeType || 'safety advisory',
  severity: fm.severity || 'info',
  description: fm.description || '',
  resolution: fm.resolution || '',
  affected_skus: fm.affectedSkus || [],
  date: fm.date || '',
  visible: true,
}));

// ===== MIGRATE CASE STUDIES =====
console.log('Migrating case studies...');
// Case studies go to their own section - but we don't have a dedicated page;
// They're loaded on homepage. For now, store them.
migrateSimpleCollection('case-studies', '04.about', 'case-study', (fm, slug, body) => ({
  title: fm.title || '',
  client: fm.client || '',
  country: fm.country || '',
  country_flag: fm.countryFlag || '',
  industry: fm.industry || '',
  challenge: fm.challenge || '',
  solution: fm.solution || '',
  results: fm.results || [],
  testimonial: fm.testimonial || '',
  testimonial_author: fm.testimonialAuthor || '',
  image: fm.image || '',
  date: fm.date || '',
  featured: fm.featured || false,
  visible: true,
}), true);

// ===== MIGRATE PARTNERS =====
console.log('Migrating partners...');
// Partners don't have a public page — they're just data for potential display
migrateSimpleCollection('partners', '04.about', 'partner', (fm) => ({
  title: fm.name || '',
  partner_type: fm.partnerType || '',
  logo: fm.logo || '',
  country: fm.country || '',
  website: fm.website || '',
  order: fm.order || 0,
  visible: true,
}));

// ===== MIGRATE MANUALS =====
console.log('Migrating manuals...');
migrateSimpleCollection('manuals', '04.about/14.manuals', 'manual', (fm) => ({
  title: fm.title || '',
  product_sku: fm.productSku || '',
  language: fm.language || 'en',
  file: fm.file || '',
  version: fm.version || '',
  pages: fm.pages || 0,
  date: fm.date || '',
  visible: true,
}));

// ===== MIGRATE DOWNLOADS =====
console.log('Migrating downloads...');
migrateSimpleCollection('downloads', '04.about/13.downloads', 'download', (fm) => ({
  title: fm.title || '',
  category: fm.category || '',
  language: fm.language || 'en',
  file: fm.file || '',
  version: fm.version || '',
  file_size: fm.fileSize || '',
  date: fm.date || '',
  description: fm.description || '',
  visible: true,
}));

function migrateSimpleCollection(srcDir, destDir, filename, converter, includeBody) {
  const srcPath = path.join(CONTENT_SRC, srcDir);
  if (!fs.existsSync(srcPath)) {
    console.log(`  Skipping ${srcDir} — directory not found`);
    return 0;
  }

  const destPath = path.join(PAGES_DEST, destDir);
  if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });

  const files = fs.readdirSync(srcPath).filter(f => f.endsWith('.md') && !/\.[a-z]{2}\.md$/.test(f));
  let count = 0;

  for (const file of files) {
    const filePath = path.join(srcPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, body } = parseFrontmatter(content);

    if (data.draft === true || data.archived === true) continue;

    const slug = data.slug || file.replace('.md', '');
    const itemDir = path.join(destPath, slug);
    if (!fs.existsSync(itemDir)) fs.mkdirSync(itemDir, { recursive: true });

    const converted = converter(data, slug, body);

    let output = toYaml(converted);
    if (includeBody && body && body.trim()) {
      // Replace the empty content line with actual body
      output = output.replace(/\n---\n\n$/, `\n---\n${body}\n`);
    }

    fs.writeFileSync(path.join(itemDir, `${filename}.md`), output);
    count++;
  }

  console.log(`  ${srcDir}: ${count} items migrated`);
  return count;
}

console.log('\nMigration complete!');
console.log(`Output: ${PAGES_DEST}`);
