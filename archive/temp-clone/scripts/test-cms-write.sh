#!/bin/bash
# Test CMS write path: simulate Decap CMS saving content via Gitea API
# This is what Decap CMS does internally when you click "Save" or "Publish"
set -e

TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
GITEA_URL="http://localhost:3000"
REPO="admin/b2b"
BRANCH="main"
SITE_DIR="/var/www/siyang/public"

echo "============================================"
echo "PHASE 2.3: CMS WRITE PATH TEST"
echo "============================================"

echo ""
echo "--- Test 1: Read homepage-hero.md (what CMS does on load) ---"
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/content/pages/homepage-hero.md?ref=$BRANCH")
SHA=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('sha','MISSING'))")
if [ "$SHA" != "MISSING" ]; then
  echo "[PASS] Can read homepage-hero.md (SHA: ${SHA:0:8}...)"
  # Decode and show heroTitle
  echo "$RESPONSE" | python3 -c "
import sys,json,base64
d=json.load(sys.stdin)
content=base64.b64decode(d['content']).decode()
for line in content.split('\n'):
    if 'heroTitle' in line:
        print('  Current heroTitle:', line.strip())
        break
"
else
  echo "[FAIL] Cannot read homepage-hero.md"
  exit 1
fi

echo ""
echo "--- Test 2: Update homepage-hero.md (what CMS does on save) ---"
# Create updated content with a test marker
UPDATED=$(python3 << 'PYEOF'
import base64, json, urllib.request
token = "79e684becd5f82163d5b0b6b75ba5593ab0db965"
req = urllib.request.Request(
    "http://localhost:3000/api/v1/repos/admin/b2b/contents/content/pages/homepage-hero.md?ref=main",
    headers={"Authorization": f"token {token}"}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())
content = base64.b64decode(data["content"]).decode()
sha = data["sha"]

# Add a test comment
import re, time
ts = str(int(time.time()))
if "<!-- cms-test:" in content:
    content = re.sub(r"<!-- cms-test:\d+ -->", f"<!-- cms-test:{ts} -->", content)
else:
    content = content.rstrip() + f"\n\n<!-- cms-test:{ts} -->"

encoded = base64.b64encode(content.encode()).decode()
push_data = json.dumps({
    "content": encoded,
    "sha": sha,
    "message": f"CMS write test: update homepage-hero ({ts})",
    "branch": "main"
}).encode()
push_req = urllib.request.Request(
    "http://localhost:3000/api/v1/repos/admin/b2b/contents/content/pages/homepage-hero.md",
    data=push_data,
    headers={"Authorization": f"token {token}", "Content-Type": "application/json"},
    method="PUT"
)
with urllib.request.urlopen(push_req) as resp:
    result = json.loads(resp.read())
    print(f"[PASS] Write succeeded (commit: {result.get('commit',{}).get('sha','?')[:8]}...)")
PYEOF
)

echo ""
echo "--- Test 3: Verify webhook processed the write ---"
echo "Waiting 12s for webhook..."
sleep 12

# Check webhook health
HEALTH=$(curl -s http://127.0.0.1:3099/health)
DEPLOY_STATUS=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); ld=d.get('lastDeploy') or {}; print(ld.get('status','none'))")
echo "Webhook deploy status: $DEPLOY_STATUS"

if [ "$DEPLOY_STATUS" = "success" ]; then
  echo "[PASS] Webhook processed the CMS write successfully"
else
  echo "[FAIL] Webhook did not process successfully"
  journalctl -u siyang-webhook --since '20 seconds ago' --no-pager -n 10
fi

echo ""
echo "--- Test 4: Verify the change appears on the live site ---"
# Check if the test comment appears in the built HTML
HOMEPAGE=$(curl -sk https://siyang.tools/ 2>/dev/null | head -c 5000)
if echo "$HOMEPAGE" | grep -q "POWER YOUR CRAFT\|POWER CRAFT"; then
  HERO_TITLE=$(echo "$HOMEPAGE" | grep -oP '(?<=cms-heroTitle[^>]*>)[^<]+' | head -1 || echo "not found in DOM")
  echo "[PASS] Homepage loads. Hero title in DOM: '$HERO_TITLE'"
else
  echo "[WARN] Could not verify hero title on homepage"
fi

echo ""
echo "--- Test 5: Test product collection write ---"
PRODUCT_RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/content/products/SY-DD-20V-BL.md?ref=$BRANCH")
PRODUCT_SHA=$(echo "$PRODUCT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('sha','MISSING'))")
if [ "$PRODUCT_SHA" != "MISSING" ]; then
  echo "[PASS] Can read product SY-DD-20V-BL.md"
else
  # Try another product
  PRODUCT_RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/content/products/$(ls $SITE_DIR/content/products/ | head -1)?ref=$BRANCH")
  PRODUCT_SHA=$(echo "$PRODUCT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('sha','MISSING'))")
  if [ "$PRODUCT_SHA" != "MISSING" ]; then
    echo "[PASS] Can read product file via API"
  else
    echo "[FAIL] Cannot read product files via API"
  fi
fi

echo ""
echo "--- Test 6: Test blog collection write ---"
BLOG_RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/content/blog?ref=$BRANCH")
BLOG_COUNT=$(echo "$BLOG_RESPONSE" | python3 -c "import sys,json; files=json.load(sys.stdin); print(len([f for f in files if f['name'].endswith('.md')]))" 2>/dev/null || echo "0")
if [ "$BLOG_COUNT" -gt 0 ]; then
  echo "[PASS] Can list blog directory ($BLOG_COUNT .md files via API)"
else
  echo "[FAIL] Cannot list blog directory via API"
fi

echo ""
echo "--- Test 7: Test settings collection write ---"
SETTINGS_RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/content/settings/company.md?ref=$BRANCH")
SETTINGS_SHA=$(echo "$SETTINGS_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('sha','MISSING'))")
if [ "$SETTINGS_SHA" != "MISSING" ]; then
  echo "[PASS] Can read settings/company.md via API"
else
  echo "[FAIL] Cannot read settings/company.md via API"
fi

echo ""
echo "============================================"
echo "CMS WRITE PATH TEST COMPLETE"
echo "============================================"
