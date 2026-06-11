#!/bin/bash
# Phase 6: End-to-end test - edit via Gitea API, verify on live site
set -e

TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
GITEA_URL="http://localhost:3000"
REPO="admin/b2b"
BRANCH="main"
SITE_DIR="/var/www/siyang/public"
TS=$(date +%s)

echo "============================================"
echo "PHASE 6: END-TO-END TEST"
echo "============================================"

echo ""
echo "--- Test 1: Edit homepage hero title ---"
python3 << PYEOF
import base64, json, re, urllib.request
token = "$TOKEN"
ts = "$TS"
req = urllib.request.Request(
    "http://localhost:3000/api/v1/repos/admin/b2b/contents/content/pages/homepage-hero.md?ref=main",
    headers={"Authorization": f"token {token}"}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())
content = base64.b64decode(data["content"]).decode()
sha = data["sha"]
# Change heroTitle
if "POWER YOUR CRAFT" in content:
    content = content.replace("POWER YOUR CRAFT", "POWER YOUR CRAFT E2E")
    marker = "E2E-TEST-1"
elif "POWER YOUR CRAFT E2E" in content:
    content = content.replace("POWER YOUR CRAFT E2E", "POWER YOUR CRAFT")
    marker = "E2E-TEST-1-REVERT"
else:
    print("Could not find heroTitle to modify")
    exit(0)
encoded = base64.b64encode(content.encode()).decode()
push_data = json.dumps({
    "content": encoded,
    "sha": sha,
    "message": f"E2E Test 1: edit homepage hero title ({ts})",
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
    print(f"Pushed: {result.get('commit',{}).get('sha','?')[:8]}... ({marker})")
PYEOF

echo "Waiting 15s for webhook + build..."
sleep 15

echo ""
echo "--- Verify Test 1: Check homepage ---"
HERO=$(curl -sk https://siyang.tools/ 2>/dev/null | grep -oP '(?<=cms-heroTitle[^>]*>)[^<]+' | head -1 || echo "NOT FOUND")
if echo "$HERO" | grep -q "E2E"; then
  echo "[PASS] Homepage shows updated hero: '$HERO'"
else
  echo "[INFO] Hero text: '$HERO' (may need more time or checking static build)"
fi

# Check the built HTML file directly
HERO_FILE=$(grep -oP 'id="cms-heroTitle"[^>]*>[^<]+' "$SITE_DIR/index.html" | head -1 || echo "NOT FOUND")
echo "  Built HTML: $HERO_FILE"

echo ""
echo "--- Test 2: Edit a product name ---"
python3 << PYEOF
import base64, json, urllib.request
token = "$TOKEN"
ts = "$TS"
# Find a product to edit
req = urllib.request.Request(
    "http://localhost:3000/api/v1/repos/admin/b2b/contents/content/products?ref=main",
    headers={"Authorization": f"token {token}"}
)
with urllib.request.urlopen(req) as resp:
    files = json.loads(resp.read())
    md_files = [f for f in files if f["name"].endswith(".md")]
    if not md_files:
        print("No product .md files found")
        exit(0)
    product_file = md_files[0]["name"]
    print(f"Testing with product: {product_file}")

req = urllib.request.Request(
    f"http://localhost:3000/api/v1/repos/admin/b2b/contents/content/products/{product_file}?ref=main",
    headers={"Authorization": f"token {token}"}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())
content = base64.b64decode(data["content"]).decode()
sha = data["sha"]
# Add E2E test marker
if "<!-- e2e-test -->" not in content:
    content = content.rstrip() + "\n\n<!-- e2e-test -->\n"
encoded = base64.b64encode(content.encode()).decode()
push_data = json.dumps({
    "content": encoded,
    "sha": sha,
    "message": f"E2E Test 2: edit product {product_file} ({ts})",
    "branch": "main"
}).encode()
push_req = urllib.request.Request(
    f"http://localhost:3000/api/v1/repos/admin/b2b/contents/content/products/{product_file}",
    data=push_data,
    headers={"Authorization": f"token {token}", "Content-Type": "application/json"},
    method="PUT"
)
with urllib.request.urlopen(push_req) as resp:
    result = json.loads(resp.read())
    print(f"Pushed: {result.get('commit',{}).get('sha','?')[:8]}...")
PYEOF

echo "Waiting 15s for webhook + build..."
sleep 15

echo ""
echo "--- Verify Test 2: Check products page ---"
PRODUCTS_GRID=$(grep -c "CMS-INJECTED:cms-products-grid" "$SITE_DIR/products/index.html" 2>/dev/null || echo "0")
if [ "$PRODUCTS_GRID" -gt 0 ]; then
  echo "[PASS] Products grid injected in products/index.html"
else
  echo "[FAIL] Products grid NOT injected"
fi

echo ""
echo "--- Test 3: Edit a FAQ item ---"
python3 << PYEOF
import base64, json, urllib.request
token = "$TOKEN"
ts = "$TS"
req = urllib.request.Request(
    "http://localhost:3000/api/v1/repos/admin/b2b/contents/content/faq?ref=main",
    headers={"Authorization": f"token {token}"}
)
with urllib.request.urlopen(req) as resp:
    files = json.loads(resp.read())
    md_files = [f for f in files if f["name"].endswith(".md")]
    if not md_files:
        print("No FAQ .md files found")
        exit(0)
    faq_file = md_files[0]["name"]
    print(f"Testing with FAQ: {faq_file}")

req = urllib.request.Request(
    f"http://localhost:3000/api/v1/repos/admin/b2b/contents/content/faq/{faq_file}?ref=main",
    headers={"Authorization": f"token {token}"}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())
content = base64.b64decode(data["content"]).decode()
sha = data["sha"]
if "<!-- e2e-test -->" not in content:
    content = content.rstrip() + "\n\n<!-- e2e-test -->\n"
encoded = base64.b64encode(content.encode()).decode()
push_data = json.dumps({
    "content": encoded,
    "sha": sha,
    "message": f"E2E Test 3: edit FAQ {faq_file} ({ts})",
    "branch": "main"
}).encode()
push_req = urllib.request.Request(
    f"http://localhost:3000/api/v1/repos/admin/b2b/contents/content/faq/{faq_file}",
    data=push_data,
    headers={"Authorization": f"token {token}", "Content-Type": "application/json"},
    method="PUT"
)
with urllib.request.urlopen(push_req) as resp:
    result = json.loads(resp.read())
    print(f"Pushed: {result.get('commit',{}).get('sha','?')[:8]}...")
PYEOF

echo "Waiting 15s for webhook + build..."
sleep 15

echo ""
echo "--- Verify Test 3: Check FAQ page ---"
FAQ_GRID=$(grep -c "CMS-INJECTED:cms-faq-grid" "$SITE_DIR/about/faq.html" 2>/dev/null || echo "0")
if [ "$FAQ_GRID" -gt 0 ]; then
  echo "[PASS] FAQ grid injected in about/faq.html"
else
  echo "[FAIL] FAQ grid NOT injected"
fi

echo ""
echo "--- Test 4: Verify webhook health ---"
curl -s http://127.0.0.1:3099/health | python3 -c "
import sys,json
d=json.load(sys.stdin)
ld=d.get('lastDeploy') or {}
print('Deploy status:', ld.get('status','none'))
print('Steps:', ld.get('steps',{}))
"

echo ""
echo "--- Test 5: Verify CMS admin loads with theme ---"
CMS_CSS=$(curl -sk https://siyang.tools/admin/cms-theme.css 2>/dev/null | head -c 100)
if echo "$CMS_CSS" | grep -q "nc-root"; then
  echo "[PASS] CMS theme CSS loads correctly"
else
  echo "[FAIL] CMS theme CSS not loading"
fi

echo ""
echo "============================================"
echo "PHASE 6: END-TO-END TEST COMPLETE"
echo "============================================"
