#!/bin/bash
# Rebuild with fixed build-html.js and verify
set -e

SITE_DIR="/var/www/siyang/public"
cd "$SITE_DIR"

echo "=== Reset HTML files ==="
git checkout -- .

echo ""
echo "=== Run build ==="
node scripts/generate-index.js
node scripts/build-html.js

echo ""
echo "=== Verify IDs preserved ==="
echo "--- cms-page-title in team.html ---"
grep -o 'id="cms-page-title"[^>]*>' about/team.html | head -1 || echo "NOT FOUND"

echo "--- cms-page-subtitle in team.html ---"
grep -o 'id="cms-page-subtitle"[^>]*>' about/team.html | head -1 || echo "NOT FOUND"

echo "--- cms-page-body in team.html ---"
grep -o 'id="cms-page-body"[^>]*>' about/team.html | head -1 || echo "NOT FOUND"

echo ""
echo "=== Verify text content replaced ==="
echo "--- Page title text ---"
grep -oP 'id="cms-page-title"[^>]*>\K[^<]+' about/team.html | head -1 || echo "NOT FOUND"

echo "--- Page subtitle text ---"
grep -oP 'id="cms-page-subtitle"[^>]*>\K[^<]+' about/team.html | head -1 || echo "NOT FOUND"

echo ""
echo "=== Verify data-i18n preserved ==="
grep -c 'data-i18n' about/team.html && echo "[PASS] data-i18n attributes preserved" || echo "[FAIL] data-i18n missing"

echo ""
echo "=== Verify all key injections ==="
for container in "cms-testimonials-grid" "cms-case-studies-grid" "cms-partners-grid" "cms-warranty-grid" "cms-safety-grid" "cms-manuals-grid" "cms-downloads-grid"; do
  COUNT=$(grep -rl "CMS-INJECTED:$container" . --include="*.html" 2>/dev/null | wc -l)
  if [ "$COUNT" -gt 0 ]; then
    echo "[PASS] $container injected in $COUNT file(s)"
  else
    echo "[FAIL] $container NOT injected"
  fi
done

echo ""
echo "=== Fix permissions ==="
chown -R www-data:www-data "$SITE_DIR"

echo ""
echo "=== Verify live site ==="
curl -sk https://siyang.tools/about/team.html 2>/dev/null | grep -oP 'id="cms-page-title"[^>]*>[^<]+' | head -1 || echo "Could not verify live"

echo ""
echo "=== DONE ==="
