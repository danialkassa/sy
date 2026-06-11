/**
 * MIGRATION TOOL ONLY — DO NOT USE IN ACTIVE CMS WORKFLOW
 * 
 * This script writes .md files FROM index.json data. It is the OPPOSITE
 * direction of generate-index.js (which writes index.json FROM .md files).
 * Running both scripts can cause data loss — CMS-authored .md files may be
 * overwritten with stale index.json data.
 * 
 * Use cases: Initial data migration, one-time data imports
 * DO NOT run as part of the CMS auto-deploy pipeline.
 */

#!/usr/bin/env node
/**
 * sync-md.cjs — One-time sync: reads index.json and writes .md files
 * with ALL the data from index.json as YAML frontmatter.
 *
 * This ensures .md files have the same data as index.json, including
 * fields like price, rating, stock that were previously only in JSON.
 *
 * Usage:  node scripts/sync-md.cjs
 *
 * After running this, the .md files become the single source of truth.
 * Then run `node scripts/build-index.cjs` to verify that regenerating
 * index.json from .md files produces the same output.
 */

var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');

// ── YAML frontmatter parser (lightweight, no dependencies) ──────────
function parseFrontmatter(text) {
  var match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: text };
  var raw = match[1];
  var body = text.slice(match[0].length);
  var data = parseYaml(raw);
  return { data: data, body: body };
}

function parseYaml(raw) {
  var lines = raw.split(/\r?\n/);

  function getIndent(line) {
    var m = line.match(/^(\s*)/);
    return m ? m[1].length : 0;
  }

  function parseValue(val) {
    if (typeof val !== 'string') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (val === 'null') return null;
    if (/^-?\d+$/.test(val)) return parseInt(val, 10);
    if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);
    if (/^["']/.test(val) && /["']$/.test(val)) return val.slice(1, -1);
    return val;
  }

  function parseLines(lines, startIdx, baseIndent) {
    var obj = {};
    var i = startIdx;
    while (i < lines.length) {
      var line = lines[i];
      if (line.trim() === '') { i++; continue; }
      var indent = getIndent(line);
      if (indent < baseIndent) break;
      var trimmed = line.trim();
      if (trimmed.charAt(0) === '-' && (trimmed.charAt(1) === ' ' || trimmed.length === 1)) break;
      var kvMatch = trimmed.match(/^([\w][\w-]*):\s*(.*)/);
      if (!kvMatch) { i++; continue; }
      var key = kvMatch[1];
      var val = kvMatch[2].trim();
      if (val === '') {
        var peekIdx = i + 1;
        while (peekIdx < lines.length && lines[peekIdx].trim() === '') peekIdx++;
        if (peekIdx < lines.length) {
          var peekLine = lines[peekIdx];
          var peekIndent = getIndent(peekLine);
          var peekTrimmed = peekLine.trim();
          if (peekIndent > indent && peekTrimmed.charAt(0) === '-') {
            var arr = [];
            i = peekIdx;
            while (i < lines.length) {
              var arrLine = lines[i];
              if (arrLine.trim() === '') { i++; continue; }
              if (getIndent(arrLine) < peekIndent) break;
              var arrTrimmed = arrLine.trim();
              if (arrTrimmed.charAt(0) !== '-') break;
              var itemContent = arrTrimmed.slice(1).trim();
              var itemKvMatch = itemContent.match(/^([\w][\w-]*):\s*(.*)/);
              if (itemKvMatch) {
                var itemObj = {};
                itemObj[itemKvMatch[1]] = parseValue(itemKvMatch[2].trim());
                var itemIndent = getIndent(arrLine) + 2;
                i++;
                while (i < lines.length) {
                  var subLine = lines[i];
                  if (subLine.trim() === '') { i++; continue; }
                  if (getIndent(subLine) < itemIndent) break;
                  var subMatch = subLine.trim().match(/^([\w][\w-]*):\s*(.*)/);
                  if (subMatch) itemObj[subMatch[1]] = parseValue(subMatch[2].trim());
                  i++;
                }
                arr.push(itemObj);
              } else if (itemContent === '') {
                var nestedItemIndent = getIndent(arrLine) + 2;
                i++;
                var nestedResult = parseLines(lines, i, nestedItemIndent);
                arr.push(nestedResult.obj);
                i = nestedResult.nextIdx;
              } else {
                arr.push(parseValue(itemContent));
                i++;
              }
            }
            obj[key] = arr;
            continue;
          } else if (peekIndent > indent) {
            var nestedObjResult = parseLines(lines, peekIdx, peekIndent);
            obj[key] = nestedObjResult.obj;
            i = nestedObjResult.nextIdx;
            continue;
          }
        }
        obj[key] = '';
        i++;
        continue;
      }
      obj[key] = parseValue(val);
      i++;
    }
    return { obj: obj, nextIdx: i };
  }

  var parsed = parseLines(lines, 0, 0);
  return parsed.obj;
}

// ── YAML serializer ──────────────────────────────────────────────────
function toYamlValue(val, indent) {
  indent = indent || 0;
  var prefix = '  '.repeat(indent);

  if (val === null || val === undefined) return 'null';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') {
    // Check if string needs quoting
    if (val === '' || val === 'true' || val === 'false' || val === 'null' ||
        /^\d+$/.test(val) || /^[\[\{]/.test(val) || /:/.test(val) ||
        /[#&*!|>'"%@`]/.test(val) || /^\s|\s$/.test(val) ||
        /\n/.test(val)) {
      // Use double-quoted style, escape special chars
      var escaped = val.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      return '"' + escaped + '"';
    }
    return val;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return '\n' + prefix + '[]';
    var lines = '';
    for (var i = 0; i < val.length; i++) {
      if (typeof val[i] === 'object' && val[i] !== null && !Array.isArray(val[i])) {
        // Object in array
        var objKeys = Object.keys(val[i]);
        if (objKeys.length === 0) {
          lines += '\n' + prefix + '-';
        } else {
          lines += '\n' + prefix + '-';
          for (var k = 0; k < objKeys.length; k++) {
            var subIndent = indent + 1;
            var subPrefix = '  '.repeat(subIndent);
            if (k === 0) {
              lines += ' ' + objKeys[k] + ': ' + toYamlValue(val[i][objKeys[k]], subIndent);
            } else {
              lines += '\n' + subPrefix + objKeys[k] + ': ' + toYamlValue(val[i][objKeys[k]], subIndent);
            }
          }
        }
      } else if (typeof val[i] === 'string') {
        lines += '\n' + prefix + '- ' + toYamlValue(val[i], indent);
      } else if (Array.isArray(val[i])) {
        lines += '\n' + prefix + '- ' + toYamlValue(val[i], indent + 1);
      } else {
        lines += '\n' + prefix + '- ' + toYamlValue(val[i], indent);
      }
    }
    return lines;
  }
  if (typeof val === 'object') {
    var keys = Object.keys(val);
    if (keys.length === 0) return '\n' + prefix + '{}';
    var objLines = '';
    for (var j = 0; j < keys.length; j++) {
      var v = val[keys[j]];
      if (typeof v === 'object' && v !== null) {
        objLines += '\n' + prefix + keys[j] + ':' + toYamlValue(v, indent + 1);
      } else {
        objLines += '\n' + prefix + keys[j] + ': ' + toYamlValue(v, indent + 1);
      }
    }
    return objLines;
  }
  return String(val);
}

function dataToFrontmatter(data) {
  var keys = Object.keys(data);
  var yaml = '';
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var val = data[key];
    if (typeof val === 'object' && val !== null) {
      yaml += key + ':' + toYamlValue(val, 1) + '\n';
    } else {
      yaml += key + ': ' + toYamlValue(val, 0) + '\n';
    }
  }
  return '---\n' + yaml + '---\n';
}

// ── Collection definitions ───────────────────────────────────────────
var COLLECTIONS = [
  ['content/products',       'products', 'sku'],       // slug field = sku
  ['content/blog',           'posts',    'slug'],       // slug field = slug
  ['content/testimonials',   'testimonials', null],     // derive slug from name
  ['content/team',           'members',  null],         // derive slug from title
  ['content/faq',            null,       null],         // flat array, derive from question
  ['content/certifications', 'certifications', null],
  ['content/partners',       null,       null],
  ['content/distributors',   null,       null],
  ['content/warranty',       null,       null],
  ['content/safety',         null,       null],
  ['content/manuals',        null,       null],
  ['content/downloads',      null,       null],
  ['content/case-studies',   null,       null],
];

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getSlugFromItem(item, slugField) {
  if (slugField && item[slugField]) return sanitizeSlug(item[slugField]);
  if (item.slug) return sanitizeSlug(item.slug);
  if (item.sku) return sanitizeSlug(item.sku);
  if (item.id) return sanitizeSlug(item.id);
  // Derive from title/name/question/companyName
  var name = item.title || item.name || item.question || item.companyName || '';
  return slugify(name);
}

function sanitizeSlug(slug) {
  // Replace characters that can't be in filenames (/, \, etc.) with dashes
  return slug.replace(/[/\\]/g, '-');
}

function syncCollection(folder, arrayKey, slugField) {
  var fullFolder = path.join(ROOT, folder);
  if (!fs.existsSync(fullFolder)) {
    console.log('  SKIP (folder not found): ' + folder);
    return 0;
  }

  var indexPath = path.join(fullFolder, 'index.json');
  if (!fs.existsSync(indexPath)) {
    console.log('  SKIP (no index.json): ' + folder);
    return 0;
  }

  var indexRaw = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  var items;
  if (Array.isArray(indexRaw)) {
    items = indexRaw;
  } else if (arrayKey && indexRaw[arrayKey]) {
    items = indexRaw[arrayKey];
  } else {
    console.log('  SKIP (no items found): ' + folder);
    return 0;
  }

  // Scan existing .md files and build a lookup map
  // Key = identifying field value (sku, slug, id, etc.), Value = filename
  var existingFiles = {};
  var mdFiles = fs.readdirSync(fullFolder).filter(function(f) {
    return f.endsWith('.md') && f !== 'index.md';
  });

  for (var mi = 0; mi < mdFiles.length; mi++) {
    var mf = mdFiles[mi];
    var mfPath = path.join(fullFolder, mf);
    var mfText = fs.readFileSync(mfPath, 'utf-8');
    var mfParsed = parseFrontmatter(mfText);
    var mfData = mfParsed.data;
    // Index by all possible identifiers
    var mfSlug = mf.replace(/\.md$/, '');
    if (mfData.sku) existingFiles['sku:' + mfData.sku] = mfSlug;
    if (mfData.slug) existingFiles['slug:' + mfData.slug] = mfSlug;
    if (mfData.id) existingFiles['id:' + mfData.id] = mfSlug;
    // Also index by the filename itself
    existingFiles['file:' + mfSlug] = mfSlug;
    // Index by name/title/companyName/question (exact match)
    if (mfData.name) existingFiles['name:' + mfData.name] = mfSlug;
    if (mfData.title) existingFiles['title:' + mfData.title] = mfSlug;
    if (mfData.companyName) existingFiles['companyName:' + mfData.companyName] = mfSlug;
    if (mfData.question) existingFiles['question:' + mfData.question] = mfSlug;
  }

  var written = 0;
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var derivedSlug = getSlugFromItem(item, slugField);
    if (!derivedSlug) {
      console.log('  WARN: Could not determine slug for item ' + i + ' in ' + folder);
      continue;
    }

    // Add slug field if not present
    if (!item.slug) item.slug = derivedSlug;
    if (!item.sku && slugField === 'sku') item.sku = derivedSlug;

    // Try to find existing .md file for this item
    var existingSlug = null;
    if (item.sku && existingFiles['sku:' + item.sku]) existingSlug = existingFiles['sku:' + item.sku];
    if (!existingSlug && item.slug && existingFiles['slug:' + item.slug]) existingSlug = existingFiles['slug:' + item.slug];
    if (!existingSlug && item.id && existingFiles['id:' + item.id]) existingSlug = existingFiles['id:' + item.id];
    if (!existingSlug && item.name && existingFiles['name:' + item.name]) existingSlug = existingFiles['name:' + item.name];
    if (!existingSlug && item.title && existingFiles['title:' + item.title]) existingSlug = existingFiles['title:' + item.title];
    if (!existingSlug && item.companyName && existingFiles['companyName:' + item.companyName]) existingSlug = existingFiles['companyName:' + item.companyName];
    if (!existingSlug && item.question && existingFiles['question:' + item.question]) existingSlug = existingFiles['question:' + item.question];
    if (!existingSlug && existingFiles['file:' + derivedSlug]) existingSlug = existingFiles['file:' + derivedSlug];

    var useSlug = existingSlug || derivedSlug;
    // Update slug field to match the actual filename
    item.slug = useSlug;

    var mdPath = path.join(fullFolder, useSlug + '.md');
    var frontmatter = dataToFrontmatter(item);

    // Check if .md file exists and has body content
    var body = '';
    if (fs.existsSync(mdPath)) {
      var existing = fs.readFileSync(mdPath, 'utf-8');
      var fmMatch = existing.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
      if (fmMatch) {
        body = existing.slice(fmMatch[0].length);
      }
    }

    fs.writeFileSync(mdPath, frontmatter + body, 'utf-8');
    written++;
  }

  console.log('  OK: ' + folder + ' -> ' + written + ' .md files written');
  return written;
}

// ── Main ─────────────────────────────────────────────────────────────
console.log('Syncing index.json data to .md files...\n');

var total = 0;
for (var ci = 0; ci < COLLECTIONS.length; ci++) {
  total += syncCollection(COLLECTIONS[ci][0], COLLECTIONS[ci][1], COLLECTIONS[ci][2]);
}

console.log('\nDone. ' + total + ' .md files synced.');
