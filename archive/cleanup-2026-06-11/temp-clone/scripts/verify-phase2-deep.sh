#!/usr/bin/bash
# Phase 2 Deep Verification: Cross-reference config.yml collections with server state
set -e

SITE_DIR="/var/www/siyang/public"
TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
GITEA_URL="http://localhost:3000"
REPO="admin/b2b"

echo "============================================"
echo "PHASE 2: CMS COLLECTIONS DEEP VERIFICATION"
echo "============================================"

# Get config.yml from Gitea
CONFIG=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/admin/config.yml?ref=main" | python3 -c "import sys,json,base64; print(base64.b64decode(json.load(sys.stdin)['content']).decode())")

echo ""
echo "--- 2.1 Collection: welcome (Editor's Guide) ---"
if echo "$CONFIG" | grep -q "name: \"welcome\""; then
  echo "[PASS] welcome collection defined in config.yml"
  if [ -f "$SITE_DIR/admin/welcome.md" ]; then
    echo "[PASS] admin/welcome.md exists on disk"
    # Check fields
    for field in "title:" "body:"; do
      if grep -q "$field" "$SITE_DIR/admin/welcome.md" 2>/dev/null; then
        echo "  [PASS] Has field: $field"
      else
        echo "  [WARN] Missing field in .md: $field (may be empty/default)"
      fi
    done
  else
    echo "[FAIL] admin/welcome.md MISSING on disk"
  fi
else
  echo "[FAIL] welcome collection NOT in config.yml"
fi

echo ""
echo "--- 2.2 Collection: products ---"
if echo "$CONFIG" | grep -q "name: \"products\""; then
  echo "[PASS] products collection defined"
  if [ -d "$SITE_DIR/content/products" ]; then
    COUNT=$(find "$SITE_DIR/content/products" -name "*.md" | wc -l)
    echo "[PASS] content/products/ exists ($COUNT .md files)"
    # Check a sample for required fields
    SAMPLE=$(find "$SITE_DIR/content/products" -name "*.md" | head -1)
    echo "  Sample: $(basename $SAMPLE)"
    for field in "name:" "sku:" "category:" "description:" "image:"; do
      if grep -q "^$field" "$SAMPLE" 2>/dev/null; then
        echo "  [PASS] Has field: $field"
      else
        echo "  [WARN] Missing field: $field"
      fi
    done
  else
    echo "[FAIL] content/products/ MISSING"
  fi
  # Check media folder
  if [ -d "$SITE_DIR/images/products" ]; then
    echo "[PASS] images/products/ exists"
  else
    echo "[FAIL] images/products/ MISSING"
  fi
else
  echo "[FAIL] products collection NOT in config.yml"
fi

echo ""
echo "--- 2.3 Collection: blog ---"
if echo "$CONFIG" | grep -q "name: \"blog\""; then
  echo "[PASS] blog collection defined"
  if [ -d "$SITE_DIR/content/blog" ]; then
    COUNT=$(find "$SITE_DIR/content/blog" -name "*.md" | wc -l)
    echo "[PASS] content/blog/ exists ($COUNT .md files)"
  else
    echo "[FAIL] content/blog/ MISSING"
  fi
  if [ -d "$SITE_DIR/images/blog" ]; then
    echo "[PASS] images/blog/ exists"
  else
    echo "[FAIL] images/blog/ MISSING"
  fi
else
  echo "[FAIL] blog collection NOT in config.yml"
fi

echo ""
echo "--- 2.4 Collection: testimonials ---"
if echo "$CONFIG" | grep -q "name: \"testimonials\""; then
  echo "[PASS] testimonials collection defined"
  if [ -d "$SITE_DIR/content/testimonials" ]; then
    COUNT=$(find "$SITE_DIR/content/testimonials" -name "*.md" | wc -l)
    echo "[PASS] content/testimonials/ exists ($COUNT .md files)"
  else
    echo "[FAIL] content/testimonials/ MISSING"
  fi
  if [ -d "$SITE_DIR/images/testimonials" ]; then
    echo "[PASS] images/testimonials/ exists"
  else
    echo "[FAIL] images/testimonials/ MISSING"
  fi
else
  echo "[FAIL] testimonials collection NOT in config.yml"
fi

echo ""
echo "--- 2.5 Collection: team_members ---"
if echo "$CONFIG" | grep -q "name: \"team_members\""; then
  echo "[PASS] team_members collection defined"
  if [ -d "$SITE_DIR/content/team" ]; then
    COUNT=$(find "$SITE_DIR/content/team" -name "*.md" | wc -l)
    echo "[PASS] content/team/ exists ($COUNT .md files)"
  else
    echo "[FAIL] content/team/ MISSING"
  fi
  if [ -d "$SITE_DIR/images/team" ]; then
    echo "[PASS] images/team/ exists"
  else
    echo "[FAIL] images/team/ MISSING"
  fi
else
  echo "[FAIL] team_members collection NOT in config.yml"
fi

echo ""
echo "--- 2.6 Collection: certifications ---"
if echo "$CONFIG" | grep -q "name: \"certifications\""; then
  echo "[PASS] certifications collection defined"
  if [ -d "$SITE_DIR/content/certifications" ]; then
    COUNT=$(find "$SITE_DIR/content/certifications" -name "*.md" | wc -l)
    echo "[PASS] content/certifications/ exists ($COUNT .md files)"
  else
    echo "[FAIL] content/certifications/ MISSING"
  fi
  if [ -d "$SITE_DIR/images/certificates" ]; then
    echo "[PASS] images/certificates/ exists"
  else
    echo "[FAIL] images/certificates/ MISSING"
  fi
else
  echo "[FAIL] certifications collection NOT in config.yml"
fi

echo ""
echo "--- 2.7 Collection: faq ---"
if echo "$CONFIG" | grep -q "name: \"faq\""; then
  echo "[PASS] faq collection defined"
  if [ -d "$SITE_DIR/content/faq" ]; then
    COUNT=$(find "$SITE_DIR/content/faq" -name "*.md" | wc -l)
    echo "[PASS] content/faq/ exists ($COUNT .md files)"
  else
    echo "[FAIL] content/faq/ MISSING"
  fi
else
  echo "[FAIL] faq collection NOT in config.yml"
fi

echo ""
echo "--- 2.8 Collection: partners ---"
if echo "$CONFIG" | grep -q "name: \"partners\""; then
  echo "[PASS] partners collection defined"
  if [ -d "$SITE_DIR/content/partners" ]; then
    COUNT=$(find "$SITE_DIR/content/partners" -name "*.md" | wc -l)
    echo "[PASS] content/partners/ exists ($COUNT .md files)"
  else
    echo "[FAIL] content/partners/ MISSING"
  fi
  if [ -d "$SITE_DIR/images/partners" ]; then
    echo "[PASS] images/partners/ exists"
  else
    echo "[FAIL] images/partners/ MISSING"
  fi
else
  echo "[FAIL] partners collection NOT in config.yml"
fi

echo ""
echo "--- 2.9 Collection: distributors ---"
if echo "$CONFIG" | grep -q "name: \"distributors\""; then
  echo "[PASS] distributors collection defined"
  if [ -d "$SITE_DIR/content/distributors" ]; then
    COUNT=$(find "$SITE_DIR/content/distributors" -name "*.md" | wc -l)
    echo "[PASS] content/distributors/ exists ($COUNT .md files)"
  else
    echo "[FAIL] content/distributors/ MISSING"
  fi
  if [ -d "$SITE_DIR/images/distributors" ]; then
    echo "[PASS] images/distributors/ exists"
  else
    echo "[FAIL] images/distributors/ MISSING"
  fi
else
  echo "[FAIL] distributors collection NOT in config.yml"
fi

echo ""
echo "--- 2.10 Collection: warranty ---"
if echo "$CONFIG" | grep -q "name: \"warranty\""; then
  echo "[PASS] warranty collection defined"
  if [ -d "$SITE_DIR/content/warranty" ]; then
    COUNT=$(find "$SITE_DIR/content/warranty" -name "*.md" | wc -l)
    echo "[PASS] content/warranty/ exists ($COUNT .md files)"
  else
    echo "[FAIL] content/warranty/ MISSING"
  fi
else
  echo "[FAIL] warranty collection NOT in config.yml"
fi

echo ""
echo "--- 2.11 Collection: safety ---"
if echo "$CONFIG" | grep -q "name: \"safety\""; then
  echo "[PASS] safety collection defined"
  if [ -d "$SITE_DIR/content/safety" ]; then
    COUNT=$(find "$SITE_DIR/content/safety" -name "*.md" | wc -l)
    echo "[PASS] content/safety/ exists ($COUNT .md files)"
  else
    echo "[FAIL] content/safety/ MISSING"
  fi
else
  echo "[FAIL] safety collection NOT in config.yml"
fi

echo ""
echo "--- 2.12 Collection: manuals ---"
if echo "$CONFIG" | grep -q "name: \"manuals\""; then
  echo "[PASS] manuals collection defined"
  if [ -d "$SITE_DIR/content/manuals" ]; then
    COUNT=$(find "$SITE_DIR/content/manuals" -name "*.md" | wc -l)
    echo "[PASS] content/manuals/ exists ($COUNT .md files)"
  else
    echo "[FAIL] content/manuals/ MISSING"
  fi
  if [ -d "$SITE_DIR/assets/downloads" ]; then
    echo "[PASS] assets/downloads/ exists"
  else
    echo "[FAIL] assets/downloads/ MISSING"
  fi
else
  echo "[FAIL] manuals collection NOT in config.yml"
fi

echo ""
echo "--- 2.13 Collection: downloads ---"
if echo "$CONFIG" | grep -q "name: \"downloads\""; then
  echo "[PASS] downloads collection defined"
  if [ -d "$SITE_DIR/content/downloads" ]; then
    COUNT=$(find "$SITE_DIR/content/downloads" -name "*.md" | wc -l)
    echo "[PASS] content/downloads/ exists ($COUNT .md files)"
  else
    echo "[FAIL] content/downloads/ MISSING"
  fi
else
  echo "[FAIL] downloads collection NOT in config.yml"
fi

echo ""
echo "--- 2.14 Collection: case_studies ---"
if echo "$CONFIG" | grep -q "name: \"case_studies\""; then
  echo "[PASS] case_studies collection defined"
  if [ -d "$SITE_DIR/content/case-studies" ]; then
    COUNT=$(find "$SITE_DIR/content/case-studies" -name "*.md" | wc -l)
    echo "[PASS] content/case-studies/ exists ($COUNT .md files)"
  else
    echo "[FAIL] content/case-studies/ MISSING"
  fi
  if [ -d "$SITE_DIR/images/case-studies" ]; then
    echo "[PASS] images/case-studies/ exists"
  else
    echo "[FAIL] images/case-studies/ MISSING"
  fi
else
  echo "[FAIL] case_studies collection NOT in config.yml"
fi

echo ""
echo "--- 2.15 Collection: pages (file collection) ---"
if echo "$CONFIG" | grep -q "name: \"pages\""; then
  echo "[PASS] pages collection defined"
  PAGE_FILES="content/pages/homepage-hero.md content/pages/homepage-products.md content/pages/homepage-about.md content/pages/homepage-b2b.md content/pages/homepage-cta.md content/pages/oem-odm.md"
  for pf in $PAGE_FILES; do
    if [ -f "$SITE_DIR/$pf" ]; then
      echo "[PASS] $pf exists"
    else
      echo "[FAIL] $pf MISSING"
    fi
  done
else
  echo "[FAIL] pages collection NOT in config.yml"
fi

echo ""
echo "--- 2.16 Collection: settings (file collection) ---"
if echo "$CONFIG" | grep -q "name: \"settings\""; then
  echo "[PASS] settings collection defined"
  SETTINGS_FILES="content/settings/company.md content/settings/navigation.md content/settings/footer.md"
  for sf in $SETTINGS_FILES; do
    if [ -f "$SITE_DIR/$sf" ]; then
      echo "[PASS] $sf exists"
    else
      echo "[FAIL] $sf MISSING"
    fi
  done
else
  echo "[FAIL] settings collection NOT in config.yml"
fi

echo ""
echo "--- 2.17 Global media folders ---"
if [ -d "$SITE_DIR/images/uploads" ]; then
  echo "[PASS] images/uploads/ (global media_folder) exists"
else
  echo "[FAIL] images/uploads/ MISSING"
fi

echo ""
echo "--- 2.18 Config.yml backend settings ---"
echo "Checking backend config..."
if echo "$CONFIG" | grep -q "name: gitea"; then
  echo "[PASS] backend: gitea"
else
  echo "[FAIL] backend NOT gitea"
fi
if echo "$CONFIG" | grep -q "repo: admin/b2b"; then
  echo "[PASS] repo: admin/b2b"
else
  echo "[FAIL] repo NOT admin/b2b"
fi
if echo "$CONFIG" | grep -q "branch: main"; then
  echo "[PASS] branch: main"
else
  echo "[FAIL] branch NOT main"
fi
if echo "$CONFIG" | grep -q "api_root: https://siyang.tools/api/v1"; then
  echo "[PASS] api_root: https://siyang.tools/api/v1"
else
  echo "[FAIL] api_root NOT https://siyang.tools/api/v1"
fi
if echo "$CONFIG" | grep -q "app_id: b44bfe8b"; then
  echo "[PASS] app_id: b44bfe8b"
else
  echo "[FAIL] app_id NOT b44bfe8b"
fi

echo ""
echo "============================================"
echo "PHASE 2 VERIFICATION COMPLETE"
echo "============================================"
