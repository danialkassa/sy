const fs = require('fs');
const path = require('path');
function* walk(dir, exts) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !['.git','node_modules','archive'].includes(entry.name)) {
      yield* walk(full, exts);
    } else if (entry.isFile() && exts.some(e => entry.name.endsWith(e))) {
      yield full;
    }
  }
}
let broken = 0, total = 0;
const regex = /[^"'\s]*images\/products\/[^"'\s)]+/g;
for (const hf of walk('.', ['.html', '.json', '.js'])) {
  const text = fs.readFileSync(hf, 'utf-8');
  let m;
  while ((m = regex.exec(text)) !== null) {
    total++;
    let p = m[0].replace(/^\.\.\//, '').replace(/^\//, '');
    if (p.startsWith('images/') && !fs.existsSync(p)) {
      broken++;
      console.log('BROKEN: ' + path.relative('.', hf).replace(/\\/g, '/') + ' -> ' + p);
    }
  }
}
console.log('Total product image refs: ' + total + ', Broken: ' + broken);
