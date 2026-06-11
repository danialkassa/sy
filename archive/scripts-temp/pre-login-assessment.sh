#!/bin/bash
# PRE-LOGIN ASSESSMENT - Full evaluation before admin login
set -e

TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
GITEA_URL="http://localhost:3000"
REPO="admin/b2b"
BRANCH="main"
SITE_DIR="/var/www/siyang/public"

echo "============================================"
echo "PRE-LOGIN ASSESSMENT"
echo "============================================"

echo ""
echo "=== 1. CMS ADMIN PAGE ==="
# Check admin page loads
ADMIN_HTML=$(curl -sk https://siyang.tools/admin/ 2>/dev/null)
if echo "$ADMIN_HTML" | grep -q "decap-cms"; then
  echo "[PASS] Admin page loads"
else
  echo "[FAIL] Admin page NOT loading"
fi

# Check CMS version
CMS_VER=$(echo "$ADMIN_HTML" | grep -oP 'decap-cms@\K[0-9.]+')
if [ "$CMS_VER" = "3.8.4" ]; then
  echo "[PASS] Decap CMS v3.8.4"
else
  echo "[FAIL] Decap CMS v$CMS_VER (expected 3.8.4)"
fi

# Check theme CSS loads
THEME_CSS=$(curl -sk https://siyang.tools/admin/cms-theme.css 2>/dev/null | head -c 200)
if echo "$THEME_CSS" | grep -q "nc-root"; then
  echo "[PASS] Dark theme CSS loads"
else
  echo "[FAIL] Dark theme CSS NOT loading"
fi

# Check no opacity:0 in theme
THEME_FULL=$(curl -sk https://siyang.tools/admin/cms-theme.css 2>/dev/null)
if echo "$THEME_FULL" | grep -q "opacity.*0"; then
  echo "[WARN] Theme contains opacity:0 - may hide editor forms!"
else
  echo "[PASS] No opacity:0 in theme (safe)"
fi

# Check js-yaml loads
JSYAML=$(curl -sk -o /dev/null -w "%{http_code}" https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js 2>/dev/null)
if [ "$JSYAML" = "200" ] || [ "$JSYAML" = "304" ]; then
  echo "[PASS] js-yaml CDN accessible"
else
  echo "[WARN] js-yaml CDN returned HTTP $JSYAML"
fi

# Check sync-status.js loads
SYNC_STATUS=$(curl -sk -o /dev/null -w "%{http_code}" https://siyang.tools/admin/sync-status.js 2>/dev/null)
if [ "$SYNC_STATUS" = "200" ]; then
  echo "[PASS] sync-status.js loads"
else
  echo "[FAIL] sync-status.js HTTP $SYNC_STATUS"
fi

# Check archive-widget.js loads
ARCHIVE_WIDGET=$(curl -sk -o /dev/null -w "%{http_code}" https://siyang.tools/admin/widgets/archive-widget.js 2>/dev/null)
if [ "$ARCHIVE_WIDGET" = "200" ]; then
  echo "[PASS] archive-widget.js loads"
else
  echo "[FAIL] archive-widget.js HTTP $ARCHIVE_WIDGET"
fi

echo ""
echo "=== 2. OAUTH / LOGIN ==="
# Check Gitea OAuth endpoint
OAUTH_RESP=$(curl -sk -o /dev/null -w "%{http_code}" "https://siyang.tools/login/oauth/authorize?client_id=b44bfe8b-1633-41ee-9533-738e78b392a0&response_type=code&redirect_uri=https://siyang.tools/admin/" 2>/dev/null)
if [ "$OAUTH_RESP" = "302" ] || [ "$OAUTH_RESP" = "303" ]; then
  echo "[PASS] OAuth authorize endpoint redirects (HTTP $OAUTH_RESP)"
else
  echo "[FAIL] OAuth authorize returned HTTP $OAUTH_RESP (expected redirect)"
fi

# Check Gitea API proxy
API_RESP=$(curl -sk -o /dev/null -w "%{http_code}" "https://siyang.tools/api/v1/repos/admin/b2b" -H "Authorization: token $TOKEN" 2>/dev/null)
if [ "$API_RESP" = "200" ]; then
  echo "[PASS] Gitea API proxy works"
else
  echo "[FAIL] Gitea API proxy HTTP $API_RESP"
fi

# Check config.yml loads
CONFIG_RESP=$(curl -sk -o /dev/null -w "%{http_code}" https://siyang.tools/admin/config.yml 2>/dev/null)
if [ "$CONFIG_RESP" = "200" ]; then
  echo "[PASS] config.yml loads"
else
  echo "[FAIL] config.yml HTTP $CONFIG_RESP"
fi

# Verify config.yml backend settings
CONFIG_CONTENT=$(curl -sk https://siyang.tools/admin/config.yml 2>/dev/null)
if echo "$CONFIG_CONTENT" | grep -q "name: gitea"; then
  echo "[PASS] Backend: gitea"
else
  echo "[FAIL] Backend not gitea"
fi
if echo "$CONFIG_CONTENT" | grep -q "repo: admin/b2b"; then
  echo "[PASS] Repo: admin/b2b"
else
  echo "[FAIL] Repo not admin/b2b"
fi
if echo "$CONFIG_CONTENT" | grep -q "branch: main"; then
  echo "[PASS] Branch: main"
else
  echo "[FAIL] Branch not main"
fi
if echo "$CONFIG_CONTENT" | grep -q "api_root: https://siyang.tools/api/v1"; then
  echo "[PASS] API root: https://siyang.tools/api/v1"
else
  echo "[FAIL] API root incorrect"
fi
if echo "$CONFIG_CONTENT" | grep -q "app_id: b44bfe8b"; then
  echo "[PASS] OAuth app_id: b44bfe8b"
else
  echo "[FAIL] OAuth app_id incorrect"
fi

# Check no editorial_workflow (causes issues)
if echo "$CONFIG_CONTENT" | grep -q "publish_mode: editorial_workflow"; then
  echo "[WARN] editorial_workflow is enabled - may cause save issues"
else
  echo "[PASS] No editorial_workflow (direct commit mode)"
fi

echo ""
echo "=== 3. COLLECTION INTEGRITY ==="
# Count collections in config.yml
COL_COUNT=$(echo "$CONFIG_CONTENT" | grep -c "^  - name:" || true)
echo "Collections in config.yml: $COL_COUNT"

# Check each collection has content
for col in products blog testimonials team certifications faq partners distributors warranty safety manuals downloads case-studies; do
  DIR="$SITE_DIR/content/$col"
  if [ -d "$DIR" ]; then
    COUNT=$(find "$DIR" -name "*.md" | wc -l)
    echo "[PASS] $col: $COUNT .md files"
  else
    echo "[FAIL] $col: directory missing"
  fi
done

# Check file collections
for f in admin/welcome.md content/pages/homepage-hero.md content/settings/company.md content/settings/navigation.md content/settings/footer.md; do
  if [ -f "$SITE_DIR/$f" ]; then
    echo "[PASS] $f exists"
  else
    echo "[FAIL] $f MISSING"
  fi
done

echo ""
echo "=== 4. MEDIA FOLDERS ==="
for mf in images/products images/blog images/testimonials images/team images/certificates images/partners images/distributors images/case-studies assets/downloads images/uploads; do
  if [ -d "$SITE_DIR/$mf" ]; then
    COUNT=$(find "$SITE_DIR/$mf" -type f | wc -l)
    echo "[PASS] $mf ($COUNT files)"
  else
    echo "[FAIL] $mf MISSING"
  fi
done

echo ""
echo "=== 5. BUILD OUTPUT ==="
# Check key HTML files have CMS injections
for page in "index.html:cms-heroTitle" "index.html:cms-testimonials-grid" "index.html:cms-case-studies-grid" "about/company.html:cms-partners-grid" "about/warranty.html:cms-warranty-grid" "about/safety.html:cms-safety-grid" "about/manuals.html:cms-manuals-grid" "about/downloads.html:cms-downloads-grid" "about/oem-odm.html:cms-case-studies-grid" "about/faq.html:cms-faq-grid" "about/distributors.html:cms-distributors-grid" "about/team.html:cms-team-grid" "about/certifications.html:cms-certifications-grid" "products/index.html:cms-products-grid" "blogs/index.html:cms-blog-index"; do
  FILE="${page%%:*}"
  ID="${page##*:}"
  if [ -f "$SITE_DIR/$FILE" ]; then
    if grep -q "$ID" "$SITE_DIR/$FILE" 2>/dev/null; then
      echo "[PASS] $FILE has $ID"
    else
      echo "[FAIL] $FILE missing $ID"
    fi
  else
    echo "[FAIL] $FILE not found"
  fi
done

# Check IDs are preserved (not stripped by replaceElementTextById)
echo ""
echo "--- ID preservation check ---"
for page in about/team.html about/faq.html about/warranty.html; do
  if grep -q 'id="cms-page-title"' "$SITE_DIR/$page" 2>/dev/null; then
    echo "[PASS] $page: cms-page-title ID preserved"
  else
    echo "[FAIL] $page: cms-page-title ID LOST (replaceElementTextById bug)"
  fi
done

echo ""
echo "=== 6. WEBHOOK PIPELINE ==="
# Service status
if systemctl is-active --quiet siyang-webhook; then
  echo "[PASS] siyang-webhook service active"
else
  echo "[FAIL] siyang-webhook service NOT active"
fi

# Health endpoint
HEALTH=$(curl -s http://127.0.0.1:3099/health 2>/dev/null || echo "{}")
HEALTH_STATUS=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','unknown'))" 2>/dev/null || echo "error")
if [ "$HEALTH_STATUS" = "ok" ]; then
  echo "[PASS] Webhook health: ok"
else
  echo "[FAIL] Webhook health: $HEALTH_STATUS"
fi

# Last deploy
LAST_DEPLOY=$(echo "$HEALTH" | python3 -c "import sys,json; ld=json.load(sys.stdin).get('lastDeploy',{}); print(ld.get('status','none'))" 2>/dev/null || echo "unknown")
echo "Last deploy status: $LAST_DEPLOY"

# HTTPS health
HTTPS_HEALTH=$(curl -sk https://siyang.tools/health 2>/dev/null || echo "{}")
HTTPS_STATUS=$(echo "$HTTPS_HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','unknown'))" 2>/dev/null || echo "error")
if [ "$HTTPS_STATUS" = "ok" ]; then
  echo "[PASS] HTTPS /health: ok"
else
  echo "[FAIL] HTTPS /health: $HTTPS_STATUS"
fi

echo ""
echo "=== 7. GITEA BACKEND ==="
# Gitea container running
if docker ps | grep -q gitea; then
  echo "[PASS] Gitea container running"
else
  echo "[FAIL] Gitea container NOT running"
fi

# Gitea API accessible
GITEA_API=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO" 2>/dev/null)
if [ "$GITEA_API" = "200" ]; then
  echo "[PASS] Gitea API accessible"
else
  echo "[FAIL] Gitea API HTTP $GITEA_API"
fi

# Webhook configured
WEBHOOKS=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/hooks" 2>/dev/null)
WH_ACTIVE=$(echo "$WEBHOOKS" | python3 -c "
import sys,json
hooks=json.load(sys.stdin)
for h in hooks:
    if h.get('type')=='gitea' and h.get('active'):
        cfg=h.get('config',{})
        print(f'  ID={h[\"id\"]} URL={cfg.get(\"url\",\"?\")} BranchFilter={h.get(\"branch_filter\",\"\")}')
" 2>/dev/null || echo "  None found")
echo "Active webhooks:"
echo "$WH_ACTIVE"

# Webhook allowlist
ALLOWED=$(docker exec gitea cat /data/gitea/conf/app.ini 2>/dev/null | grep "ALLOWED_HOST_LIST" || echo "NOT FOUND")
echo "Webhook allowlist: $ALLOWED"

echo ""
echo "=== 8. FILE PERMISSIONS ==="
OWNER=$(stat -c '%U:%G' "$SITE_DIR" 2>/dev/null)
echo "Site dir owner: $OWNER"
if echo "$OWNER" | grep -q "www-data"; then
  echo "[PASS] Correct ownership"
else
  echo "[FAIL] Wrong ownership (should be www-data:www-data)"
fi

# Check admin dir permissions
ADMIN_OWNER=$(stat -c '%U:%G' "$SITE_DIR/admin" 2>/dev/null)
echo "Admin dir owner: $ADMIN_OWNER"

echo ""
echo "=== 9. INDEX.JSON FILES ==="
for col in products blog testimonials team certifications faq partners distributors warranty safety manuals downloads case-studies; do
  IDX="$SITE_DIR/content/$col/index.json"
  if [ -f "$IDX" ]; then
    COUNT=$(python3 -c "import json; d=json.load(open('$IDX')); items=d if isinstance(d,list) else d.get(list(d.keys())[0],[]); print(len(items))" 2>/dev/null || echo "?")
    echo "[PASS] $col/index.json ($COUNT entries)"
  else
    echo "[FAIL] $col/index.json MISSING"
  fi
done

echo ""
echo "=== 10. POTENTIAL ISSUES ==="
# Check for .disabled files
DISABLED=$(find "$SITE_DIR/admin" -name "*.disabled" 2>/dev/null | head -5)
if [ -n "$DISABLED" ]; then
  echo "[WARN] Disabled files found: $DISABLED"
else
  echo "[PASS] No .disabled files in admin/"
fi

# Check for backup files
BACKUPS=$(find "$SITE_DIR/admin" -name "*.backup" -o -name "*.bak" 2>/dev/null | head -5)
if [ -n "$BACKUPS" ]; then
  echo "[WARN] Backup files found: $BACKUPS"
else
  echo "[PASS] No backup files in admin/"
fi

# Check git status (should be clean after build)
cd "$SITE_DIR"
CHANGES=$(git status --short 2>/dev/null | head -10 || echo "git error")
if [ -z "$CHANGES" ]; then
  echo "[PASS] Git working tree clean"
else
  echo "[WARN] Uncommitted changes:"
  echo "$CHANGES"
fi

# Check disk space
DISK=$(df -h "$SITE_DIR" | tail -1 | awk '{print $5}')
echo "Disk usage: $DISK"

echo ""
echo "============================================"
echo "PRE-LOGIN ASSESSMENT COMPLETE"
echo "============================================"
