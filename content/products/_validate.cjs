const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname);
const indexPath = path.join(dir, 'index.json');

let content = fs.readFileSync(indexPath, 'utf8');
if (content.endsWith('\\n')) {
  content = content.slice(0, -2) + '\n';
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('Fixed trailing literal');
}

const d = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
console.log('Valid JSON: true');
console.log('Total products:', d.products.length);

const fields = ['sku','name','brand','category','categoryLabel','description','image','moq','leadTime','inStock','featured','compliance','warranty','userBenefits'];
const missing = d.products.flatMap(p => fields.filter(f => p[f] === undefined));
console.log('Missing fields:', missing.length === 0 ? 'None' : missing.join(', '));
console.log('Featured count:', d.products.filter(p => p.featured).length);
