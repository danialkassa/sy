const fs = require('fs');
const path = require('path');

const BASE = process.cwd();

const REAL_IN_PRODUCTS = new Set([
  '10034.webp', '10034-2.webp', '10034-3.webp',
  '10072.jpeg', '10072-2.jpeg', '10072-3.jpeg',
  '10077.jpeg', '10077-2.jpeg', '10077-3.jpeg',
  '10002.jpeg', '10006.jpeg', '10029.webp', '10030.webp',
  '10037.jpeg', '10042.jpeg', '10043.jpeg', '10051.jpeg',
  '10053.jpeg', '10053-2.jpeg', '10053-3.jpeg',
  '10065.jpeg', '10067.jpeg', '10070.jpeg', '10071.jpeg',
  '10093.jpeg', '10097.jpeg', '10108.jpg', '10112.jpg'
]);

const realImages = Array.from(REAL_IN_PRODUCTS);
const istockImages = fs.readdirSync(path.join(BASE, 'images/products'))
  .filter(f => f.startsWith('istock-'));
const allRealImages = [...realImages, ...istockImages];

function pickRealForId(id) {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return allRealImages[hash % allRealImages.length];
}

function* walk(dir, exts) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'temp-b2b-clone' && entry.name !== '.git' && entry.name !== 'node_modules' && entry.name !== 'archive') {
      yield* walk(full, exts);
    } else if (entry.isFile() && exts.some(e => entry.name.endsWith(e))) {
      yield full;
    }
  }
}

let totalFiles = 0;
let totalReplacements = 0;

// Match any unsplach reference with optional relative prefix
const regex = /((?:\.\.\/)*)(images\/unsplach\/[^\/]+\/)(\d+(?:-\d+)?)\.(\w+)/g;

for (const hf of walk(BASE, ['.html', '.json', '.js', '.md'])) {
  const rel = path.relative(BASE, hf).replace(/\\/g, '/');
  let text = fs.readFileSync(hf, 'utf-8');
  let original = text;

  text = text.replace(regex, function(match, prefix, pathPart, id, ext) {
    const fullname = id + '.' + ext;
    if (pathPart.includes('drill-closeup') && ['10072.jpeg','10072-2.jpeg','10072-3.jpeg','10077.jpeg','10077-2.jpeg','10077-3.jpeg'].includes(fullname)) {
      return match; // keep real closeup images
    }
    if (pathPart.includes('drill-home') && REAL_IN_PRODUCTS.has(fullname)) {
      return match; // keep real drill-home images
    }
    // Replace with a real image in products/
    const replacement = pickRealForId(id);
    totalReplacements++;
    return prefix + 'images/products/' + replacement;
  });

  if (text !== original) {
    fs.writeFileSync(hf, text, 'utf-8');
    totalFiles++;
  }
}

console.log('Fixed ' + totalFiles + ' files with ' + totalReplacements + ' replacements.');

// Rebuild all index.json files
console.log('\nRebuilding index files...');
const productsDir = path.join(BASE, 'content/products');
const jsonFiles = fs.readdirSync(productsDir)
  .filter(f => f.endsWith('.json') && !f.startsWith('index'));

const products = [];
for (const f of jsonFiles) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(productsDir, f), 'utf-8'));
    products.push(data);
  } catch (e) {}
}

fs.writeFileSync(path.join(productsDir, 'index.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(productsDir, 'index.ar.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(productsDir, 'index.es.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(productsDir, 'index.fr.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(productsDir, 'index.ru.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(productsDir, 'index.zh.json'), JSON.stringify(products, null, 2));
console.log('Rebuilt ' + products.length + ' products');
