const fs = require('fs');
const path = require('path');

const BASE = process.cwd();

// Map of unsplach real filenames -> products/ equivalents
const unsplachToProducts = {
  '10072.jpeg': '10072.jpeg',
  '10072-2.jpeg': '10072-2.jpeg',
  '10072-3.jpeg': '10072-3.jpeg',
  '10077.jpeg': '10077.jpeg',
  '10077-2.jpeg': '10077-2.jpeg',
  '10077-3.jpeg': '10077-3.jpeg',
  '10053.jpeg': '10053.jpeg',
  '10053-2.jpeg': '10053-2.jpeg',
  '10053-3.jpeg': '10053-3.jpeg'
};

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

const regex = /((?:\.\.\/)*)(images\/unsplach\/[^\/]+\/)([\w\-\.]+)/g;

for (const hf of walk(BASE, ['.html', '.json', '.js', '.md'])) {
  const rel = path.relative(BASE, hf).replace(/\\/g, '/');
  let text = fs.readFileSync(hf, 'utf-8');
  let original = text;

  text = text.replace(regex, function(match, prefix, pathPart, filename) {
    const mapped = unsplachToProducts[filename];
    if (mapped) {
      totalReplacements++;
      return prefix + 'images/products/' + mapped;
    }
    // For unknown files, replace with a random real product image
    totalReplacements++;
    return prefix + 'images/products/10034.webp';
  });

  if (text !== original) {
    fs.writeFileSync(hf, text, 'utf-8');
    totalFiles++;
    console.log('  ' + rel);
  }
}

console.log('\nFixed ' + totalFiles + ' files with ' + totalReplacements + ' replacements.');
