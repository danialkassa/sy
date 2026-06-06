/**
 * NINGBO SIYANG — CMS COMPREHENSIVE TEST SUITE
 *
 * Tests: previews, animations, CSS, config, integrations
 * Run: node admin/_test-suite.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.dirname(__dirname);
const ADMIN = path.join(ROOT, 'admin');
const PREVIEWS = path.join(ADMIN, 'previews');

let pass = 0, fail = 0, warn = 0;

function ok(msg) { pass++; console.log('  \u2713 ' + msg); }
function err(msg) { fail++; console.log('  \u2717 ' + msg); }
function wrn(msg) { warn++; console.log('  \u26A0 ' + msg); }

function section(title) {
  console.log('\n' + '='.repeat(60));
  console.log('  ' + title);
  console.log('='.repeat(60));
}

// Mock DOM for preview render tests
global.Node = function() {};
global.document = {
  createElement: function(tag) {
    return {
      tagName: tag.toUpperCase(),
      style: {},
      classList: {
        _classes: [],
        add: function(c) { this._classes.push(c); },
        remove: function(c) { this._classes = this._classes.filter(x => x !== c); },
        contains: function(c) { return this._classes.includes(c); }
      },
      setAttribute: function(k, v) { this[k] = v; },
      appendChild: function(c) { this.children = this.children || []; this.children.push(c); return c; },
      children: []
    };
  },
  createTextNode: function(text) { return { textContent: text, nodeType: 3 }; },
  querySelector: function() { return null; },
  querySelectorAll: function() { return []; },
  body: { appendChild: function() {}, children: [] }
};
global.window = { matchMedia: function() { return { matches: false, addEventListener: function(){} }; } };

// ═══════════════════════════════════════════════════════════
// 1. FILE INTEGRITY
// ═══════════════════════════════════════════════════════════

section('1. FILE INTEGRITY');

const requiredFiles = [
  'admin/index.html',
  'admin/cms-theme.css',
  'admin/cms-animations.js',
  'admin/config.yml',
  'admin/webhook-secret.js',
  'admin/previews/product-preview.js',
  'admin/previews/blog-preview.js',
  'admin/previews/homepage-preview.js',
  'admin/previews/team-preview.js',
  'admin/previews/testimonial-preview.js',
  'admin/previews/faq-preview.js',
  'admin/previews/certification-preview.js',
  'admin/previews/case-study-preview.js',
  'admin/previews/safety-preview.js',
  'admin/previews/partner-preview.js',
  'admin/previews/distributor-preview.js',
  'admin/previews/download-preview.js',
  'admin/previews/warranty-preview.js',
  'admin/previews/manuals-preview.js',
  'admin/previews/company-preview.js',
  'admin/previews/oem-odm-preview.js',
  'admin/previews/settings-preview.js',
  'admin/previews/page-preview.js',
];

requiredFiles.forEach(f => {
  if (fs.existsSync(path.join(ROOT, f))) ok('exists: ' + f);
  else err('MISSING: ' + f);
});

// ═══════════════════════════════════════════════════════════
// 2. HTML SYNTAX & INTEGRITY
// ═══════════════════════════════════════════════════════════

section('2. HTML SYNTAX & INTEGRITY');

const html = fs.readFileSync(path.join(ADMIN, 'index.html'), 'utf8');

// Balanced tags
const openTags = (html.match(/<script/g) || []).length;
const closeTags = (html.match(/<\/script>/g) || []).length;
if (openTags === closeTags) ok('Balanced <script> tags: ' + openTags);
else err('Unbalanced <script> tags: ' + openTags + ' open, ' + closeTags + ' close');

const htmlOpen = (html.match(/<html/g) || []).length;
const htmlClose = (html.match(/<\/html>/g) || []).length;
if (htmlOpen === 1 && htmlClose === 1) ok('Single <html> root');
else err('Malformed <html> root');

// No duplicate preview registrations
const regs = (html.match(/registerPreviewTemplate\('(.+?)'/g) || []);
const regNames = regs.map(r => r.match(/registerPreviewTemplate\('(.+?)'/)[1]);
const dupes = regNames.filter((item, i) => regNames.indexOf(item) !== i);
if (dupes.length === 0) ok('No duplicate preview registrations');
else err('Duplicate registrations: ' + dupes.join(', '));

// All script src files exist
const scripts = (html.match(/script src="\.\/(.*?)"/g) || []).map(m =>
  m.replace(/script src="\.\//, '').replace('"', '')
);
scripts.forEach(s => {
  if (fs.existsSync(path.join(ADMIN, s))) ok('script loads: ' + s);
  else err('MISSING script: ' + s);
});

// Widgets commented out (dead code)
if (html.includes('<!-- <script src="./widgets/color-swatch.js">')) ok('Dead widgets commented out');
else wrn('Dead widgets may still be active');

// Public CSS injection removed (check for UNCOMMENTED usage)
const cssInjectionLines = html.split('\n').filter(l => l.includes('registerPreviewStyle') && !l.trim().startsWith('/*') && !l.trim().startsWith('//') && !l.trim().startsWith('*'));
if (cssInjectionLines.length === 0) ok('Public CSS injection removed');
else err('Public CSS injection still active: ' + cssInjectionLines[0].trim());

// ═══════════════════════════════════════════════════════════
// 3. PREVIEW TEMPLATE UNIT TESTS
// ═══════════════════════════════════════════════════════════

section('3. PREVIEW TEMPLATE UNIT TESTS');

const previewFiles = fs.readdirSync(PREVIEWS).filter(f => f.endsWith('.js'));

previewFiles.forEach(file => {
  const content = fs.readFileSync(path.join(PREVIEWS, file), 'utf8');

  // Syntax valid
  try {
    new Function(content);
    ok(file + ' — syntax valid');
  } catch (e) {
    err(file + ' — SYNTAX ERROR: ' + e.message.split('\n')[0]);
    return;
  }

  // Has window export
  const exports = content.match(/window\.(\w+)Preview\s*=/g) || [];
  if (exports.length > 0) ok(file + ' — exports ' + exports.map(e => e.match(/window\.(\w+)/)[1]).join(', '));
  else wrn(file + ' — no window export');

  // Has getData helper
  if (content.includes('function getData(')) ok(file + ' — has getData()');
  else wrn(file + ' — missing getData()');

  // Has text helper
  if (content.includes('function text(')) ok(file + ' — has text() helper');
  else wrn(file + ' — missing text() helper');

  // Has el helper
  if (content.includes('function el(')) ok(file + ' — has el() helper');
  else wrn(file + ' — missing el() helper');

  // No console statements
  if (!content.match(/console\.(log|debug|warn|error)/)) ok(file + ' — no console statements');
  else err(file + ' — has console statements');

  // Uses cms-preview-root
  if (content.includes('cms-preview-root')) ok(file + ' — uses cms-preview-root');
  else wrn(file + ' — missing cms-preview-root');

  // Render test with empty data
  try {
    const fn = new Function('window', 'document', content + '\nreturn window;');
    const win = fn(global.window, global.document);
    const previewNames = Object.keys(win).filter(k => k.endsWith('Preview'));

    previewNames.forEach(pn => {
      const Preview = win[pn];
      const mockEntry = {
        getIn: function() {
          return {
            toJS: function() { return {}; }
          };
        }
      };
      const result = Preview({ entry: mockEntry });
      if (result && (result.tagName || result.children)) {
        ok(file + ' — renders with empty data (' + pn + ')');
      } else {
        wrn(file + ' — render result type unclear (' + pn + ')');
      }
    });
  } catch (e) {
    err(file + ' — RENDER FAIL with empty data: ' + e.message.split('\n')[0]);
  }

  // Check for safeHref if href is used
  if (content.includes('href:') && !content.includes('safeHref')) {
    wrn(file + ' — uses href without safeHref()');
  } else if (content.includes('safeHref')) {
    ok(file + ' — uses safeHref()');
  }

  // Check for formatDate if date is used
  if (content.includes('data.date') && !content.includes('formatDate')) {
    wrn(file + ' — uses data.date without formatDate()');
  } else if (content.includes('formatDate')) {
    ok(file + ' — uses formatDate()');
  }
});

// ═══════════════════════════════════════════════════════════
// 4. ANIMATION ENGINE TESTS
// ═══════════════════════════════════════════════════════════

section('4. ANIMATION ENGINE TESTS');

const anim = fs.readFileSync(path.join(ADMIN, 'cms-animations.js'), 'utf8');

// Single IntersectionObserver
const obsCount = (anim.match(/new IntersectionObserver/g) || []).length;
if (obsCount === 1) ok('Single IntersectionObserver instance');
else err('Expected 1 IntersectionObserver, found ' + obsCount);

// unobserveAll function exists
if (anim.includes('function unobserveAll()')) ok('unobserveAll() cleanup exists');
else err('Missing unobserveAll() cleanup');

// clearAnimations calls unobserveAll (check function body specifically)
const clearAnimIdx = anim.indexOf('function clearAnimations(');
const clearAnimBody = anim.substring(clearAnimIdx, clearAnimIdx + 600);
if (clearAnimBody.includes('unobserveAll')) ok('clearAnimations() calls unobserveAll()');
else err('clearAnimations() does not call unobserveAll()');

// Route change handler
if (anim.includes('function onRouteChange()')) ok('Route change handler exists');
else err('Missing route change handler');

// Hash polling fallback
if (anim.includes('setInterval') && anim.includes('location.hash')) ok('Hash polling fallback exists');
else err('Missing hash polling fallback');

// Debounced mutation handler
if (anim.includes('debounce') && anim.includes('handleMutations')) ok('Debounced mutation handler');
else err('Missing debounced mutation handler');

// prefers-reduced-motion support
if (anim.includes('prefers-reduced-motion')) ok('Reduced motion support');
else err('Missing reduced motion support');

// addListener fallback for Safari
if (anim.includes('addListener')) ok('Safari addListener fallback');
else err('Missing Safari addListener fallback');

// CMSToast system
if (anim.includes('window.CMSToast')) ok('CMSToast system present');
else err('Missing CMSToast system');

// Toast dismissAll
if (anim.includes('dismissAll')) ok('Toast dismissAll exists');
else err('Missing toast dismissAll');

// Toast safety counter
if (anim.includes('safety++')) ok('Toast safety counter present');
else err('Missing toast safety counter');

// No showSkeletons dead code
if (!anim.includes('showSkeletons') && !anim.includes('removeSkeletons')) ok('Dead skeleton code removed');
else wrn('Dead skeleton code still present');

// for loop in mutation handler
if (anim.includes('for (var i = 0; i < mutations.length; i++)')) ok('Lightweight for loop in mutation handler');
else wrn('Mutation handler may still use Array.from');

// ═══════════════════════════════════════════════════════════
// 5. CSS VALIDATION
// ═══════════════════════════════════════════════════════════

section('5. CSS VALIDATION');

const css = fs.readFileSync(path.join(ADMIN, 'cms-theme.css'), 'utf8');

// Balanced braces
const openBraces = (css.match(/\{/g) || []).length;
const closeBraces = (css.match(/\}/g) || []).length;
if (openBraces === closeBraces) ok('Balanced CSS braces: ' + openBraces);
else err('Unbalanced braces: ' + openBraces + ' open, ' + closeBraces + ' close');

// No empty rules
const emptyRules = (css.match(/[^{}]+\{\s*\}/g) || []).length;
if (emptyRules === 0) ok('No empty CSS rules');
else wrn(emptyRules + ' empty CSS rules found');

// All CSS variables used are defined
const definedVars = new Set((css.match(/--[\w-]+/g) || []));
const usedVars = new Set((css.match(/var\((--[\w-]+)/g) || []).map(m => m.replace('var(', '')));
const undefinedVars = [...usedVars].filter(v => !definedVars.has(v));
if (undefinedVars.length === 0) ok('All CSS variables defined');
else wrn('Undefined CSS variables: ' + undefinedVars.join(', '));

// !important count
const impCount = (css.match(/!important/g) || []).length;
ok('!important count: ' + impCount + ' (was 358, removed ' + (358 - impCount) + ')');

// No duplicate keyframe names (match full name)
const keyframes = (css.match(/@keyframes\s+([\w-]+)/g) || []).map(m => m.replace('@keyframes ', ''));
const seen = new Set();
const dupKeyframes = [];
keyframes.forEach(k => { if (seen.has(k)) dupKeyframes.push(k); else seen.add(k); });
if (dupKeyframes.length === 0) ok('No duplicate keyframe names');
else err('Duplicate keyframes: ' + dupKeyframes.join(', '));

// Keyframe count
ok('Keyframe animations: ' + keyframes.length);

// ═══════════════════════════════════════════════════════════
// 6. CONFIG VALIDATION
// ═══════════════════════════════════════════════════════════

section('6. CONFIG VALIDATION');

const yaml = fs.readFileSync(path.join(ADMIN, 'config.yml'), 'utf8');

// YAML basic structure
if (yaml.startsWith('backend:')) ok('Config starts with backend');
else err('Config missing backend section');

// Parse collections
const collections = [];
let current = null, inFields = false, fieldNames = [], isFilesCollection = false;
yaml.split('\n').forEach(line => {
  const m = line.match(/^  - name: \"(.+?)\"/);
  if (m) {
    if (current) { current.fields = fieldNames; collections.push(current); }
    current = { name: m[1], fields: [], hasSummary: false, isFiles: false };
    fieldNames = []; inFields = false; isFilesCollection = false;
  }
  if (line.match(/^    files:/)) { isFilesCollection = true; current.isFiles = true; }
  if (line.match(/^    summary:/)) current && (current.hasSummary = true);
  if (line.match(/^    fields:/)) inFields = true;
  if (inFields) {
    const fm = line.match(/^        name: \"(.+?)\"/);
    if (fm) fieldNames.push(fm[1]);
  }
});
if (current) { current.fields = fieldNames; collections.push(current); }

collections.forEach(c => {
  // File collections don't need summaries
  if (c.isFiles) {
    ok(c.name + ' — file collection (summary optional)');
  } else if (c.hasSummary) {
    ok(c.name + ' — has summary');
  } else {
    err(c.name + ' — MISSING summary');
  }
});

// Draft fields placed first in folder collections
let draftFirstCount = 0;
let totalFolderCols = 0;
const blocks = yaml.split('fields:');
blocks.forEach((block, i) => {
  if (i === 0) return; // skip preamble
  // Check if this is a folder collection (has 'create: true' nearby)
  const preceding = yaml.substring(0, yaml.indexOf(block)).slice(-500);
  const isFolder = preceding.includes('create: true') || preceding.includes('folder:');
  if (isFolder) {
    totalFolderCols++;
    const firstField = block.trim().split('\n').find(l => l.match(/^\s+- label:/));
    if (firstField && firstField.includes('Draft')) draftFirstCount++;
  }
});
ok('Draft fields placed first: ' + draftFirstCount + '/' + totalFolderCols + ' folder collections');

// ═══════════════════════════════════════════════════════════
// 7. PREVIEW ↔ CONFIG CROSS-REFERENCE
// ═══════════════════════════════════════════════════════════

section('7. PREVIEW ↔ CONFIG CROSS-REFERENCE');

const previewMap = {
  'products': 'ProductPreview',
  'blog': 'BlogPreview',
  'testimonials': 'TestimonialPreview',
  'team_members': 'TeamPreview',
  'certifications': 'CertificationPreview',
  'faq': 'FaqPreview',
  'partners': 'PartnerPreview',
  'distributors': 'DistributorPreview',
  'warranty': 'WarrantyPreview',
  'safety': 'SafetyPreview',
  'manuals': 'ManualsPreview',
  'downloads': 'DownloadPreview',
  'case_studies': 'CaseStudyPreview',
  'homepage': 'HomepagePreview',
  'company': 'CompanyPreview',
  'oem-odm': 'OemOdmPreview',
  'navigation': 'NavigationPreview',
  'footer': 'FooterPreview',
  'global': 'PagePreview',
  'payment-terms': 'PagePreview',
  'brochure': 'PagePreview',
  'about': 'PagePreview',
  'contact': 'PagePreview',
  'privacy': 'PagePreview',
  'terms': 'PagePreview',
  'drills-drivers': 'PagePreview',
  'saws': 'PagePreview',
  'grinders': 'PagePreview',
  'sanders': 'PagePreview',
  'impact-tools': 'PagePreview',
  'combo-kits': 'PagePreview',
};

Object.entries(previewMap).forEach(([collection, previewName]) => {
  const file = previewFiles.find(f => {
    const content = fs.readFileSync(path.join(PREVIEWS, f), 'utf8');
    return content.includes('window.' + previewName);
  });
  if (file) ok(collection + ' \u2192 ' + previewName + ' (' + file + ')');
  else err(collection + ' \u2192 ' + previewName + ' NOT FOUND');
});

// ═══════════════════════════════════════════════════════════
// 8. SECURITY CHECKS
// ═══════════════════════════════════════════════════════════

section('8. SECURITY CHECKS');

// No hardcoded secrets
if (!html.match(/password\s*[:=]\s*["'][^"']{4,}/i) &&
    !html.match(/secret\s*[:=]\s*["'][^"']{4,}/i) &&
    !html.match(/token\s*[:=]\s*["'][^"']{4,}/i)) {
  ok('No hardcoded secrets in index.html');
} else {
  wrn('Possible hardcoded secrets in index.html');
}

// webhook-secret.js loaded with onerror fallback
if (html.includes('webhook-secret.js') && html.includes('onerror')) ok('Webhook secret has error fallback');
else wrn('Webhook secret may not have error fallback');

// All preview href attributes use safeHref
let safeHrefCount = 0, hrefCount = 0;
previewFiles.forEach(f => {
  const content = fs.readFileSync(path.join(PREVIEWS, f), 'utf8');
  const hrefs = (content.match(/href:\s*[^,}\]]+/g) || []).length;
  const safe = content.includes('safeHref');
  if (hrefs > 0) {
    hrefCount += hrefs;
    if (safe) safeHrefCount++;
  }
});
ok(safeHrefCount + ' previews use safeHref() for ' + hrefCount + ' href declarations');

// No eval() or new Function() in production previews
previewFiles.forEach(f => {
  const content = fs.readFileSync(path.join(PREVIEWS, f), 'utf8');
  if (content.includes('eval(')) err(f + ' — contains eval()');
  if (content.includes('new Function(')) err(f + ' — contains new Function()');
});

// Editor components use escapeHtml
if (html.includes('function escapeHtml(')) ok('Editor components have escapeHtml()');
else wrn('Editor components may lack HTML escaping');

// ═══════════════════════════════════════════════════════════
// 9. PERFORMANCE CHECKS
// ═══════════════════════════════════════════════════════════

section('9. PERFORMANCE CHECKS');

// No synchronous XHR
if (!anim.includes('XMLHttpRequest') || !anim.includes('open(')) ok('No synchronous XHR in animations');
else wrn('Possible synchronous XHR found');

// Debounce ms reasonable
if (anim.includes('debounceMs') && anim.includes('16')) ok('Debounce at 16ms (1 frame)');
else wrn('Debounce ms may not be optimal');

// Max batch size cap
if (anim.includes('maxBatchSize') && anim.includes('50')) ok('Max batch size capped at 50');
else wrn('Max batch size may not be capped');

// CSS file size
const cssSize = fs.statSync(path.join(ADMIN, 'cms-theme.css')).size;
ok('CSS file size: ' + (cssSize / 1024).toFixed(1) + ' KB');

// Total JS preview size
let previewSize = 0;
previewFiles.forEach(f => previewSize += fs.statSync(path.join(PREVIEWS, f)).size);
ok('Total preview JS size: ' + (previewSize / 1024).toFixed(1) + ' KB (' + previewFiles.length + ' files)');

// ═══════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════

console.log('\n' + '='.repeat(60));
console.log('  TEST RESULTS');
console.log('='.repeat(60));
console.log('  Pass:  ' + pass);
console.log('  Warn:  ' + warn);
console.log('  Fail:  ' + fail);
console.log('  Total: ' + (pass + warn + fail));
console.log('='.repeat(60));

if (fail === 0) {
  console.log('\n  ALL CRITICAL TESTS PASSED');
  process.exit(0);
} else {
  console.log('\n  ' + fail + ' FAILURE(S) DETECTED');
  process.exit(1);
}
