#!/bin/bash
# Rebuild with updated build-html.js (new collections + ID preservation fix)
set -e

SITE_DIR="/var/www/siyang/public"
cd "$SITE_DIR"

echo "=== Reset HTML files (keep build-html.js) ==="
git checkout -- index.html products/ blogs/ about/ contact.html privacy.html terms.html

echo ""
echo "=== Verify build-html.js has new loaders ==="
grep -c "loadPartnersData\|loadCaseStudiesData\|loadWarrantyData" scripts/build-html.js && echo "New loaders present" || echo "MISSING new loaders"

echo ""
echo "=== Run build ==="
node scripts/generate-index.js 2>&1 | tail -5
node scripts/build-html.js 2>&1 | tail -40

echo ""
echo "=== Verify key injections ==="
for container in "cms-testimonials-grid" "cms-case-studies-grid" "cms-partners-grid" "cms-warranty-grid" "cms-safety-grid" "cms-manuals-grid" "cms-downloads-grid"; do
  COUNT=$(grep -rl "CMS-INJECTED:$container" . --include="*.html" 2>/dev/null | wc -l)
  if [ "$COUNT" -gt 0 ]; then
    echo "[PASS] $container injected in $COUNT file(s)"
  else
    echo "[FAIL] $container NOT injected"
  fi
done

echo ""
echo "=== Verify IDs preserved ==="
grep -o 'id="cms-page-title"[^>]*>' about/team.html | head -1

echo ""
echo "=== Fix permissions ==="
chown -R www-data:www-data "$SITE_DIR"

echo ""
echo "=== DONE ==="
