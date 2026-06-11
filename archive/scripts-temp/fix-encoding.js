/**
 * Fix character encoding mojibake in content files.
 * Dry-run by default. Pass --write to apply changes.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const dryRun = !process.argv.includes("--write");
const replacements = [
  // Triple-encoded em-dash (most common in this project)
  { from: /ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“/g, to: "–" },
  // Double-encoded em-dash
  { from: /Ã¢â‚¬â€œ/g, to: "–" },
  // Right single quote
  { from: /Ã¢â‚¬â„¢/g, to: "'" },
  // Left double quote
  { from: /Ã¢â‚¬Å“/g, to: '"' },
  // Right double quote
  { from: /Ã¢â‚¬Â/g, to: '"' },
  // Ellipsis
  { from: /ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦/g, to: "…" },
  // En-dash variations
  { from: /Ã¢â‚¬â€/g, to: "—" },
  // Common other patterns
  { from: /ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â/g, to: '"' },
];

function fixFile(filePath) {
  const original = fs.readFileSync(filePath, "utf-8");
  let fixed = original;
  let count = 0;

  for (const { from, to } of replacements) {
    const matches = fixed.match(from);
    if (matches) {
      count += matches.length;
      fixed = fixed.replace(from, to);
    }
  }

  if (count > 0) {
    if (dryRun) {
      console.log(`[DRY-RUN] Would fix ${count} issues in ${filePath}`);
    } else {
      fs.writeFileSync(filePath, fixed, "utf-8");
      console.log(`[FIXED] ${count} issues in ${filePath}`);
    }
    return count;
  }
  return 0;
}

function walkDir(dir, extensions, callback) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, extensions, callback);
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      callback(fullPath);
    }
  }
}

console.log(`Mode: ${dryRun ? "DRY-RUN (pass --write to apply)" : "APPLY"}`);
console.log("Scanning content/ and *.html files...\n");

let totalFiles = 0;
let totalIssues = 0;

// Fix content markdown files
walkDir(path.join(projectRoot, "content"), [".md"], (filePath) => {
  const count = fixFile(filePath);
  if (count > 0) {
    totalFiles++;
    totalIssues += count;
  }
});

// Fix HTML files
walkDir(projectRoot, [".html"], (filePath) => {
  const count = fixFile(filePath);
  if (count > 0) {
    totalFiles++;
    totalIssues += count;
  }
});

console.log(`\n${dryRun ? "Would fix" : "Fixed"} ${totalIssues} issues across ${totalFiles} files.`);
if (dryRun && totalIssues > 0) {
  console.log("Run with --write to apply changes.");
}
