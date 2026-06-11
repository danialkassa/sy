#!/bin/bash
# Phase 1 & 2 Comprehensive Verification Script
set -e

GITEA_URL="http://localhost:3000"
TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
REPO="admin/b2b"
BRANCH="main"
SITE_DIR="/var/www/siyang/public"

echo "============================================"
echo "PHASE 1: WEBHOOK PIPELINE VERIFICATION"
echo "============================================"

echo ""
echo "--- 1.1 Webhook Listener Service ---"
if systemctl is-active --quiet siyang-webhook; then
  echo "[PASS] siyang-webhook service is active"
else
  echo "[FAIL] siyang-webhook service is NOT active"
  systemctl status siyang-webhook --no-pager -l 2>/dev/null || true
fi

echo ""
echo "--- 1.2 /health Endpoint (local) ---"
HEALTH=$(curl -s http://127.0.0.1:3099/health 2>/dev/null || echo "FAILED")
if echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null | grep -q "ok"; then
  echo "[PASS] Webhook /health returns OK: $HEALTH"
else
  echo "[FAIL] Webhook /health not returning OK: $HEALTH"
fi

echo ""
echo "--- 1.3 /health Endpoint (via HTTPS/Nginx) ---"
HEALTH_HTTPS=$(curl -sk https://siyang.tools/health 2>/dev/null || echo "FAILED")
if echo "$HEALTH_HTTPS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null | grep -q "ok"; then
  echo "[PASS] HTTPS /health returns OK: $HEALTH_HTTPS"
else
  echo "[FAIL] HTTPS /health not returning OK: $HEALTH_HTTPS"
fi

echo ""
echo "--- 1.4 Docker → Webhook Connectivity ---"
DOCKER_TEST=$(docker exec gitea wget -qO- http://172.17.0.1:3099/health 2>/dev/null || echo "FAILED")
if echo "$DOCKER_TEST" | grep -q "ok"; then
  echo "[PASS] Docker container can reach webhook at 172.17.0.1:3099"
else
  echo "[FAIL] Docker container cannot reach webhook: $DOCKER_TEST"
fi

echo ""
echo "--- 1.5 Gitea Webhook Configuration ---"
WEBHOOKS=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/hooks" 2>/dev/null || echo "[]")
WH_COUNT=$(echo "$WEBHOOKS" | python3 -c "import sys,json; hooks=json.load(sys.stdin); print(len([h for h in hooks if h.get('type')=='gitea']))" 2>/dev/null || echo "0")
if [ "$WH_COUNT" -ge 1 ]; then
  echo "[PASS] Found $WH_COUNT gitea webhook(s)"
  echo "$WEBHOOKS" | python3 -c "
import sys,json
hooks=json.load(sys.stdin)
for h in hooks:
    if h.get('type')=='gitea':
        cfg=h.get('config',{})
        print(f\"  ID={h['id']} URL={cfg.get('url','?')} Active={h.get('active',False)} Events={h.get('events',[])} BranchFilter={h.get('branch_filter','')}\")
" 2>/dev/null || true
else
  echo "[FAIL] No gitea webhooks found"
fi

echo ""
echo "--- 1.6 Gitea Webhook Allowlist ---"
ALLOWED=$(docker exec gitea cat /data/gitea/conf/app.ini 2>/dev/null | grep -A2 "\[webhook\]" | grep "ALLOWED_HOST_LIST" || echo "NOT FOUND")
if echo "$ALLOWED" | grep -q "172.17.0.1"; then
  echo "[PASS] Gitea webhook allowlist includes 172.17.0.1: $ALLOWED"
else
  echo "[FAIL] Gitea webhook allowlist missing 172.17.0.1: $ALLOWED"
fi

echo ""
echo "--- 1.7 CMS Version in Gitea Repo ---"
CMS_FILE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/admin/index.html?ref=$BRANCH" 2>/dev/null || echo "{}")
CMS_CONTENT=$(echo "$CMS_FILE" | python3 -c "import sys,json,base64; c=json.load(sys.stdin).get('content',''); print(base64.b64decode(c).decode())" 2>/dev/null || echo "FAILED")
CMS_VER=$(echo "$CMS_CONTENT" | grep -oP 'decap-cms@\K[0-9.]+' || echo "NOT FOUND")
if [ "$CMS_VER" = "3.8.4" ]; then
  echo "[PASS] Gitea repo has Decap CMS v3.8.4"
else
  echo "[FAIL] Gitea repo has Decap CMS v$CMS_VER (expected 3.8.4)"
fi

echo ""
echo "--- 1.8 CMS Version on Server Disk ---"
SERVER_VER=$(grep -oP 'decap-cms@\K[0-9.]+' "$SITE_DIR/admin/index.html" 2>/dev/null || echo "NOT FOUND")
if [ "$SERVER_VER" = "3.8.4" ]; then
  echo "[PASS] Server disk has Decap CMS v3.8.4"
else
  echo "[FAIL] Server disk has Decap CMS v$SERVER_VER (expected 3.8.4)"
fi

echo ""
echo "--- 1.9 File Permissions ---"
OWNER=$(stat -c '%U:%G' "$SITE_DIR" 2>/dev/null || echo "UNKNOWN")
if echo "$OWNER" | grep -q "www-data"; then
  echo "[PASS] Site dir owned by www-data: $OWNER"
else
  echo "[FAIL] Site dir NOT owned by www-data: $OWNER"
fi

echo ""
echo "--- 1.10 CMS Theme CSS Status ---"
if [ -f "$SITE_DIR/admin/cms-theme.css.disabled" ]; then
  echo "[PASS] cms-theme.css is disabled (cms-theme.css.disabled exists)"
elif [ -f "$SITE_DIR/admin/cms-theme.css" ]; then
  echo "[WARN] cms-theme.css is ACTIVE - may cause opacity:0 issues"
else
  echo "[INFO] cms-theme.css does not exist (clean state)"
fi

echo ""
echo "============================================"
echo "PHASE 2: CMS COLLECTIONS VERIFICATION"
echo "============================================"

echo ""
echo "--- 2.1 Content Directories ---"
COLLECTIONS="products blog testimonials team certifications faq partners distributors warranty safety manuals downloads case-studies pages settings"
for col in $COLLECTIONS; do
  DIR="$SITE_DIR/content/$col"
  if [ -d "$DIR" ]; then
    COUNT=$(find "$DIR" -name "*.md" | wc -l)
    echo "[PASS] content/$col exists ($COUNT .md files)"
  else
    echo "[FAIL] content/$col MISSING"
  fi
done

echo ""
echo "--- 2.2 Media Folders ---"
MEDIA_FOLDERS="images/products images/blog images/testimonials images/team images/certificates images/partners images/distributors images/case-studies assets/downloads images/uploads"
for mf in $MEDIA_FOLDERS; do
  DIR="$SITE_DIR/$mf"
  if [ -d "$DIR" ]; then
    COUNT=$(find "$DIR" -type f | wc -l)
    echo "[PASS] $mf exists ($COUNT files)"
  else
    echo "[FAIL] $mf MISSING"
  fi
done

echo ""
echo "--- 2.3 Page Files (file collections) ---"
PAGE_FILES="content/pages/homepage-hero.md content/pages/homepage-products.md content/pages/homepage-about.md content/pages/homepage-b2b.md content/pages/homepage-cta.md content/pages/oem-odm.md"
for pf in $PAGE_FILES; do
  if [ -f "$SITE_DIR/$pf" ]; then
    echo "[PASS] $pf exists"
  else
    echo "[FAIL] $pf MISSING"
  fi
done

echo ""
echo "--- 2.4 Settings Files (file collections) ---"
SETTINGS_FILES="content/settings/company.md content/settings/navigation.md content/settings/footer.md"
for sf in $SETTINGS_FILES; do
  if [ -f "$SITE_DIR/$sf" ]; then
    echo "[PASS] $sf exists"
  else
    echo "[FAIL] $sf MISSING"
  fi
done

echo ""
echo "--- 2.5 Welcome File ---"
if [ -f "$SITE_DIR/admin/welcome.md" ]; then
  echo "[PASS] admin/welcome.md exists"
else
  echo "[FAIL] admin/welcome.md MISSING"
fi

echo ""
echo "--- 2.6 Config.yml in Gitea Repo ---"
CONFIG_FILE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/admin/config.yml?ref=$BRANCH" 2>/dev/null || echo "{}")
CONFIG_SHA=$(echo "$CONFIG_FILE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('sha','MISSING'))" 2>/dev/null || echo "MISSING")
if [ "$CONFIG_SHA" != "MISSING" ]; then
  echo "[PASS] admin/config.yml exists in Gitea (SHA: ${CONFIG_SHA:0:8}...)"
else
  echo "[FAIL] admin/config.yml NOT in Gitea repo"
fi

echo ""
echo "--- 2.7 Collection Field Validation (spot check products) ---"
PRODUCT_SAMPLE=$(find "$SITE_DIR/content/products" -name "*.md" | head -1)
if [ -n "$PRODUCT_SAMPLE" ]; then
  echo "Checking: $PRODUCT_SAMPLE"
  # Check for required fields
  for field in "name:" "sku:" "category:" "description:" "image:"; do
    if grep -q "$field" "$PRODUCT_SAMPLE"; then
      echo "  [PASS] Has field: $field"
    else
      echo "  [WARN] Missing field: $field"
    fi
  done
else
  echo "[FAIL] No product .md files found"
fi

echo ""
echo "--- 2.8 Gitea OAuth App ---"
OAUTH=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/applications/oauth2" 2>/dev/null || echo "[]")
OAUTH_COUNT=$(echo "$OAUTH" | python3 -c "import sys,json; apps=json.load(sys.stdin); print(len([a for a in apps if a.get('client_id','')=='b44bfe8b-1633-41ee-9533-738e78b392a0']))" 2>/dev/null || echo "0")
if [ "$OAUTH_COUNT" -ge 1 ]; then
  echo "[PASS] OAuth2 app b44bfe8b exists in Gitea"
else
  echo "[FAIL] OAuth2 app b44bfe8b NOT found in Gitea"
fi

echo ""
echo "--- 2.9 Nginx Proxy Config for Gitea API ---"
NGINX_CONFIG=$(cat /etc/nginx/sites-enabled/siyang 2>/dev/null || echo "NOT FOUND")
if echo "$NGINX_CONFIG" | grep -q "/api/v1"; then
  echo "[PASS] Nginx proxies /api/v1 to Gitea"
else
  echo "[FAIL] Nginx missing /api/v1 proxy"
fi
if echo "$NGINX_CONFIG" | grep -q "/login/oauth"; then
  echo "[PASS] Nginx proxies /login/oauth to Gitea"
else
  echo "[FAIL] Nginx missing /login/oauth proxy"
fi

echo ""
echo "============================================"
echo "VERIFICATION COMPLETE"
echo "============================================"
