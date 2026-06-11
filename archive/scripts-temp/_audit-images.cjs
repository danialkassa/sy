const fs = require('fs');
const path = require('path');

const BASE = path.normalize('c:/Users/DanielkassaMuruts/Documents/B2B/html1-suite/public-website');

const realProducts = new Set([
  'images/products/10034.webp', 'images/products/10034-2.webp', 'images/products/10034-3.webp'
]);
const realDrillCloseup = new Set([
  'images/unsplach/drill-closeup/10072.jpeg', 'images/unsplach/drill-closeup/10072-2.jpeg',
  'images/unsplach/drill-closeup/10072-3.jpeg', 'images/unsplach/drill-closeup/10077.jpeg',
  'images/unsplach/drill-closeup/10077-2.jpeg', 'images/unsplach/drill-closeup/10077-3.jpeg'
]);
const realDrillHome = new Set([
  'images/unsplach/drill-home/10002.jpeg', 'images/unsplach/drill-home/10006.jpeg',
  'images/unsplach/drill-home/10029.webp', 'images/unsplach/drill-home/10030.webp',
  'images/unsplach/drill-home/10037.jpeg', 'images/unsplach/drill-home/10042.jpeg',
  'images/unsplach/drill-home/10043.jpeg', 'images/unsplach/drill-home/10051.jpeg',
  'images/unsplach/drill-home/10053.jpeg', 'images/unsplach/drill-home/10065.jpeg',
  'images/unsplach/drill-home/10067.jpeg', 'images/unsplach/drill-home/10070.jpeg',
  'images/unsplach/drill-home/10071.jpeg', 'images/unsplach/drill-home/10093.jpeg',
  'images/unsplach/drill-home/10097.jpeg', 'images/unsplach/drill-home/10108.jpg',
  'images/unsplach/drill-home/10112.jpg'
]);

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'temp-b2b-clone' && entry.name !== '.git' && entry.name !== 'node_modules') {
      yield* walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      yield full;
    }
  }
}

const issues = [];
const allRefs = [];

for (const hf of Array.from(walk(BASE))) {
  const rel = path.relative(BASE, hf).replace(/\\/g, '/');
  const text = fs.readFileSync(hf, 'utf-8');
  const refs = [...text.matchAll(/src=["']([^"']*(?:images\/products|images\/unsplach)[^"']*)["']/gi)];
  for (const m of refs) {
    const src = m[1];
    const clean = src.split('?')[0].split('#')[0];
    const resolved = path.relative(BASE, path.resolve(path.dirname(hf), clean)).replace(/\\/g, '/');

    let isReal = false;
    if (resolved.startsWith('images/products/')) {
      isReal = realProducts.has(resolved);
    } else if (resolved.startsWith('images/unsplach/drill-closeup/')) {
      isReal = realDrillCloseup.has(resolved);
    } else if (resolved.startsWith('images/unsplach/drill-home/')) {
      isReal = realDrillHome.has(resolved);
    }

    allRefs.push({file: rel, src, resolved, isReal});
    if (!isReal && (resolved.startsWith('images/products/') || resolved.startsWith('images/unsplach/'))) {
      issues.push({file: rel, src, resolved});
    }
  }
}

console.log('TOTAL IMAGE REFERENCES:');
console.log('  products: ' + allRefs.filter(r => r.resolved.startsWith('images/products/')).length);
console.log('  drill-closeup: ' + allRefs.filter(r => r.resolved.startsWith('images/unsplach/drill-closeup/')).length);
console.log('  drill-home: ' + allRefs.filter(r => r.resolved.startsWith('images/unsplach/drill-home/')).length);
console.log('  istock: ' + allRefs.filter(r => r.resolved.startsWith('images/istock/')).length);
console.log('  other: ' + allRefs.filter(r => !r.resolved.match(/products|unsplach|istock/)).length);

console.log('\nFAKE / NON-REAL PRODUCT REFERENCES (' + issues.length + '):');
for (const issue of issues) {
  console.log('  ' + issue.file + ' -> ' + issue.src + ' (resolved: ' + issue.resolved + ')');
}

const realProductList = Array.from(realProducts);
const realCloseupList = Array.from(realDrillCloseup);
const realHomeList = Array.from(realDrillHome);

console.log('\nREAL PRODUCTS AVAILABLE:');
console.log('  products: ' + realProductList.join(', '));
console.log('  drill-closeup: ' + realCloseupList.join(', '));
console.log('  drill-home: ' + realHomeList.join(', '));
