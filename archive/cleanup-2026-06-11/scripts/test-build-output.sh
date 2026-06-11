#!/bin/bash
# Run actual build on server and verify output
set -e

SITE_DIR="/var/www/siyang/public"

echo "=== Step 1: Reset HTML files to remove old CMS markers ==="
cd "$SITE_DIR"
# Reset all HTML files from git to get clean state
git checkout -- index.html products/ blogs/ about/ contact.html privacy.html terms.html

echo ""
echo "=== Step 2: Run build ==="
node scripts/generate-index.js
node scripts/build-html.js

echo ""
echo "=== Step 3: Verify key injections ==="
echo "--- index.html testimonials ---"
grep -c "CMS-INJECTED:cms-testimonials-grid" index.html && echo "[PASS] Testimonials injected in index.html" || echo "[FAIL] No testimonials in index.html"

echo "--- index.html case studies ---"
grep -c "CMS-INJECTED:cms-case-studies-grid" index.html && echo "[PASS] Case studies injected in index.html" || echo "[FAIL] No case studies in index.html"

echo "--- about/company.html partners ---"
grep -c "CMS-INJECTED:cms-partners-grid" about/company.html && echo "[PASS] Partners injected in about/company.html" || echo "[FAIL] No partners in about/company.html"

echo "--- about/warranty.html warranty ---"
grep -c "CMS-INJECTED:cms-warranty-grid" about/warranty.html && echo "[PASS] Warranty injected" || echo "[FAIL] No warranty"

echo "--- about/safety.html safety ---"
grep -c "CMS-INJECTED:cms-safety-grid" about/safety.html && echo "[PASS] Safety injected" || echo "[FAIL] No safety"

echo "--- about/manuals.html manuals ---"
grep -c "CMS-INJECTED:cms-manuals-grid" about/manuals.html && echo "[PASS] Manuals injected" || echo "[FAIL] No manuals"

echo "--- about/downloads.html downloads ---"
grep -c "CMS-INJECTED:cms-downloads-grid" about/downloads.html && echo "[PASS] Downloads injected" || echo "[FAIL] No downloads"

echo "--- about/oem-odm.html case studies ---"
grep -c "CMS-INJECTED:cms-case-studies-grid" about/oem-odm.html && echo "[PASS] Case studies in OEM/ODM" || echo "[FAIL] No case studies in OEM/ODM"

echo ""
echo "=== Step 4: Verify content pages ---"
for page in about/team.html about/certifications.html about/global.html about/brochure.html; do
  if grep -q "CMS-INJECTED:cms-page-content" "$page" 2>/dev/null || grep -q "cms-page-title" "$page" 2>/dev/null; then
    echo "[PASS] $page has CMS content"
  else
    echo "[WARN] $page may not have CMS content"
  fi
done

echo ""
echo "=== Step 5: Fix permissions ==="
chown -R www-data:www-data "$SITE_DIR"

echo ""
echo "=== Step 6: Verify live site ==="
echo "--- Homepage hero title ---"
curl -sk https://siyang.tools/ 2>/dev/null | grep -oP 'cms-heroTitle[^>]*>[^<]+' | head -1 || echo "Could not extract"

echo "--- Partners page ---"
curl -sk https://siyang.tools/about/company.html 2>/dev/null | grep -c "CMS-INJECTED:cms-partners-grid" && echo "[PASS] Partners visible on live site" || echo "[FAIL] Partners not on live site"

echo "--- Warranty page ---"
curl -sk https://siyang.tools/about/warranty.html 2>/dev/null | grep -c "CMS-INJECTED:cms-warranty-grid" && echo "[PASS] Warranty visible on live site" || echo "[FAIL] Warranty not on live site"

echo ""
echo "=== BUILD VERIFICATION COMPLETE ==="
