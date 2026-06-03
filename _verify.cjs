const fs = require('fs');

console.log('=== FINAL VERIFICATION ===\n');
let allPassed = true;
function report(name, pass, detail) {
  const status = pass ? 'PASS' : 'FAIL';
  if (!pass) allPassed = false;
  console.log(status + ': ' + name + (detail ? ' — ' + detail : ''));
}

// 1. Translation files - deep key match
const en = JSON.parse(fs.readFileSync('./assets/translations/en.json', 'utf8'));

function getAllKeys(obj, prefix) {
  prefix = prefix || '';
  let keys = [];
  for (const k in obj) {
    const full = prefix ? prefix + '.' + k : k;
    if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      keys = keys.concat(getAllKeys(obj[k], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const enKeys = getAllKeys(en).sort();
const langs = ['zh', 'ar', 'fr', 'ru', 'es'];

langs.forEach(lang => {
  const tr = JSON.parse(fs.readFileSync('./assets/translations/' + lang + '.json', 'utf8'));
  const trKeys = getAllKeys(tr).sort();
  const match = JSON.stringify(enKeys) === JSON.stringify(trKeys);
  report('Translation [' + lang + '] leaf key match (408)', match, match ? trKeys.length + ' keys' : 'missing: ' + enKeys.filter(k => !trKeys.includes(k)).slice(0, 10).join(', '));
});

// 2. Blog index schema check
const enBlog = JSON.parse(fs.readFileSync('./content/blog/index.json', 'utf8'));
const enBlogKeys = Object.keys(enBlog.posts[0]).sort();

langs.forEach(lang => {
  try {
    const bl = JSON.parse(fs.readFileSync('./content/blog/index.' + lang + '.json', 'utf8'));
    if (!bl.posts || !Array.isArray(bl.posts)) {
      report('Blog index [' + lang + ']', false, 'no posts array');
      return;
    }
    if (bl.posts.length !== 3) {
      report('Blog index [' + lang + ']', false, bl.posts.length + ' entries (expected 3)');
      return;
    }
    const blKeys = Object.keys(bl.posts[0]).sort();
    const match = JSON.stringify(enBlogKeys) === JSON.stringify(blKeys);
    report('Blog index [' + lang + '] schema match', match, match ? blKeys.length + ' fields' : 'expected: ' + enBlogKeys.join(', ') + ' got: ' + blKeys.join(', '));
  } catch(e) {
    report('Blog index [' + lang + ']', false, e.message);
  }
});

// 3. Product index schema check
const enProd = JSON.parse(fs.readFileSync('./content/products/index.json', 'utf8'));
const enProdKeys = Object.keys(enProd.products[0]).sort();

langs.forEach(lang => {
  try {
    const pl = JSON.parse(fs.readFileSync('./content/products/index.' + lang + '.json', 'utf8'));
    report('Product index [' + lang + '] count', pl.products && pl.products.length === 48, pl.products ? pl.products.length + ' products' : 'no products array');
    if (pl.products && pl.products.length === 48) {
      const plKeys = Object.keys(pl.products[0]).sort();
      const match = JSON.stringify(enProdKeys) === JSON.stringify(plKeys);
      report('Product index [' + lang + '] schema match', match, match ? plKeys.length + ' fields' : 'expected: ' + enProdKeys.length + ' got: ' + plKeys.length);
    }
  } catch(e) {
    report('Product index [' + lang + ']', false, e.message);
  }
});

// 4. Blog post files
const blogFiles = fs.readdirSync('./content/blog/').filter(f => f.match(/\.(zh|ar|fr|ru|es)\.md$/));
report('Blog post translations', blogFiles.length === 15, blogFiles.length + ' files (expected 15)');

// 5. Testimonials
const tl = JSON.parse(fs.readFileSync('./content/testimonials/index.json', 'utf8'));
const tlFields = ['id','name','title','company','country','countryFlag','quote','rating','productCategory','yearsPartner'];
const tlBad = tl.filter(t => tlFields.some(f => t[f] === undefined));
report('Testimonials', tl.length === 8 && tlBad.length === 0, tl.length + ' entries');

// 6. Case studies
const cs = JSON.parse(fs.readFileSync('./content/case-studies/index.json', 'utf8'));
const csFields = ['id','title','client','country','challenge','solution','results','testimonial','testimonialAuthor'];
const csBad = cs.filter(c => csFields.some(f => c[f] === undefined));
report('Case studies', cs.length === 3 && csBad.length === 0, cs.length + ' entries');

// 7. HTML files - hreflang + OG
const htmlFiles = [
  'index.html','contact.html','terms.html','privacy.html',
  'products/index.html','products/drills-drivers.html','products/saws.html',
  'products/grinders.html','products/sanders.html','products/impact-tools.html',
  'products/combo-kits.html','products/product.html',
  'blogs/index.html','blogs/post.html',
  'about/index.html','about/company.html','about/oem-odm.html',
  'about/certifications.html','about/global.html','about/team.html',
  'about/payment-terms.html','about/brochure.html'
];

let totalHl = 0, totalOg = 0;
htmlFiles.forEach(f => {
  try {
    const c = fs.readFileSync('./' + f, 'utf8');
    const hl = (c.match(/hreflang/g) || []).length;
    const og = (c.match(/og:locale/g) || []).length;
    totalHl += hl;
    totalOg += og;
  } catch(e) {}
});
report('HTML hreflang tags total', totalHl === 154, totalHl + ' (expected 154)');
report('HTML OG locale tags total', totalOg === 132, totalOg + ' (expected 132)');

// 8. Sitemap
const sm = fs.readFileSync('./sitemap.xml', 'utf8');
report('Sitemap xhtml namespace', sm.includes('xmlns:xhtml'));
const xhtmlCount = (sm.match(/<xhtml:link/g) || []).length;
report('Sitemap xhtml:link entries', xhtmlCount === 133, xhtmlCount);

// 9. CMS config i18n
const yaml = fs.readFileSync('./admin/config.yml', 'utf8');
const i18nCount = yaml.split('\n').filter(l => l.includes('i18n:')).length;
report('CMS config i18n markers', i18nCount >= 100, i18nCount + ' markers');

console.log('\n=== ' + (allPassed ? 'ALL PASS' : 'SOME FAILURES') + ' ===');
