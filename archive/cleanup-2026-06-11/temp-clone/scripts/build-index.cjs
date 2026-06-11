/**
 * NOTE: This script is superseded by generate-index.js
 * generate-index.js is the active index builder used by the webhook pipeline.
 * This file is kept for reference/backup only.
 */

#!/usr/bin/env node
/**
 * build-index.cjs — Regenerates index.json files from .md frontmatter
 * for all CMS collections.
 *
 * Usage:  node scripts/build-index.cjs
 *
 * This script reads every .md file in each content collection folder,
 * parses the YAML frontmatter, and writes an index.json file that the
 * website (cms-loader.js) uses to discover and render content.
 *
 * Run this after CMS edits to sync .md → index.json.
 */

const fs = require('fs');
const path = require('path');

// ── YAML frontmatter parser (lightweight, no dependencies) ──────────
function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: text };
  const raw = match[1];
  const body = text.slice(match[0].length);
  const data = parseYaml(raw);
  return { data, body };
}

function parseYaml(raw) {
  const lines = raw.split(/\r?\n/);
  const result = {};
  let i = 0;

  function getIndent(line) {
    const m = line.match(/^(\s*)/);
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
    if (/^\[.*\]$/.test(val)) {
      const inner = val.slice(1, -1).trim();
      if (inner === '') return [];
      return inner.split(',').map(function(s) { return parseValue(s.trim()); });
    }
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

      // Block scalar
      var bsMatch = trimmed.match(/^([\w][\w-]*):\s*([|>])\s*$/);
      if (bsMatch) {
        var bsKey = bsMatch[1];
        var multiLines = [];
        i++;
        while (i < lines.length) {
          var bsLine = lines[i];
          if (bsLine.trim() === '') { multiLines.push(''); i++; continue; }
          if (getIndent(bsLine) <= indent) break;
          multiLines.push(bsLine.replace(/^\s{2,}/, '').replace(/^  /, ''));
          i++;
        }
        obj[bsKey] = multiLines.join('\n').replace(/\n+$/, '');
        continue;
      }

      // Sequence item
      if (trimmed.charAt(0) === '-' && (trimmed.charAt(1) === ' ' || trimmed.length === 1)) {
        break;
      }

      // Key-value
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
            // Array
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
                  if (subMatch) {
                    var subVal = subMatch[2].trim();
                    if (subVal === '') {
                      var subPeekIdx = i + 1;
                      while (subPeekIdx < lines.length && lines[subPeekIdx].trim() === '') subPeekIdx++;
                      if (subPeekIdx < lines.length && getIndent(lines[subPeekIdx]) > getIndent(subLine)) {
                        var subResult = parseLines(lines, subPeekIdx, getIndent(lines[subPeekIdx]));
                        itemObj[subMatch[1]] = subResult.obj;
                        i = subResult.nextIdx;
                        continue;
                      }
                      itemObj[subMatch[1]] = '';
                    } else {
                      itemObj[subMatch[1]] = parseValue(subVal);
                    }
                  }
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
          } else {
            obj[key] = '';
          }
        } else {
          obj[key] = '';
        }
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

// ── Collection definitions ───────────────────────────────────────────
// Each entry: [folder, arrayKey]
// arrayKey = the key used in index.json (e.g., "products", "posts")
// For collections where index.json is a flat array, arrayKey = null
var COLLECTIONS = [
  ['content/products',       'products'],
  ['content/blog',           'posts'],
  ['content/testimonials',   'testimonials'],
  ['content/team',           'members'],
  ['content/faq',            null],
  ['content/certifications', 'certifications'],
  ['content/partners',       null],
  ['content/distributors',   null],
  ['content/warranty',       null],
  ['content/safety',         null],
  ['content/manuals',        null],
  ['content/downloads',      null],
  ['content/case-studies',   null],
];

var ROOT = path.resolve(__dirname, '..');

function deepMerge(target, source) {
  // Merge source into target. Source values win over target values.
  // Nested objects are merged recursively. Arrays are replaced entirely.
  var result = {};
  // Start with all target keys
  var keys = Object.keys(target);
  for (var i = 0; i < keys.length; i++) result[keys[i]] = target[keys[i]];
  // Merge source keys
  var sKeys = Object.keys(source);
  for (var j = 0; j < sKeys.length; j++) {
    var key = sKeys[j];
    if (
      result[key] && typeof result[key] === 'object' && !Array.isArray(result[key]) &&
      source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function buildCollection(folder, arrayKey) {
  var fullFolder = path.join(ROOT, folder);

  if (!fs.existsSync(fullFolder)) {
    console.log('  SKIP (folder not found): ' + folder);
    return;
  }

  var files = fs.readdirSync(fullFolder)
    .filter(function(f) {
      if (!f.endsWith('.md') || f === 'index.md') return false;
      // Exclude language variants like .ar.md, .zh.md, .fr.md, etc.
      if (/\.[a-z]{2}\.md$/.test(f)) return false;
      return true;
    })
    .sort();

  if (files.length === 0) {
    console.log('  SKIP (no .md files): ' + folder);
    return;
  }

  // Read existing index.json (if it exists) for merge
  var indexPath = path.join(fullFolder, 'index.json');
  var existingItems = [];
  var existingBySlug = {};
  if (fs.existsSync(indexPath)) {
    try {
      var existingRaw = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      if (Array.isArray(existingRaw)) {
        existingItems = existingRaw;
      } else if (arrayKey && existingRaw[arrayKey]) {
        existingItems = existingRaw[arrayKey];
      }
      // Index existing items by slug/sku for quick lookup
      for (var ei = 0; ei < existingItems.length; ei++) {
        var exItem = existingItems[ei];
        var exSlug = exItem.slug || exItem.sku || exItem.id || '';
        if (exSlug) existingBySlug[exSlug] = exItem;
      }
    } catch (e) {
      console.log('  WARN: Could not parse existing index.json for ' + folder);
    }
  }

  var items = [];

  for (var fi = 0; fi < files.length; fi++) {
    var file = files[fi];
    var slug = file.replace(/\.md$/, '');
    var filePath = path.join(fullFolder, file);
    var text = fs.readFileSync(filePath, 'utf-8');
    var parsed = parseFrontmatter(text);
    var data = parsed.data;

    // Add slug/sku if not present in frontmatter
    if (!data.slug) data.slug = slug;
    if (!data.sku) data.sku = slug;

    // Merge with existing data: existing data as base, .md data overrides
    var existingItem = existingBySlug[slug] || existingBySlug[data.sku] || existingBySlug[data.slug] || null;
    if (existingItem) {
      data = deepMerge(existingItem, data);
    }

    items.push(data);
  }

  // Build the index.json structure
  var indexData;
  if (arrayKey) {
    indexData = {};
    indexData[arrayKey] = items;
  } else {
    indexData = items;
  }

  // Write index.json
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2) + '\n', 'utf-8');

  console.log('  OK: ' + folder + ' -> ' + items.length + ' items written to index.json');
}

// ── Main ─────────────────────────────────────────────────────────────
console.log('Building index.json files from .md frontmatter...\n');

for (var ci = 0; ci < COLLECTIONS.length; ci++) {
  buildCollection(COLLECTIONS[ci][0], COLLECTIONS[ci][1]);
}

console.log('\nDone.');
