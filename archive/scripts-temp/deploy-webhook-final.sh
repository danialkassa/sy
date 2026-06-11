#!/bin/bash
# Deploy the ACTUAL updated webhook-listener.js (with chown) and test
set -e

SITE_DIR="/var/www/siyang/public"
TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
GITEA_URL="http://localhost:3000"
REPO="admin/b2b"
BRANCH="main"

echo "=== Step 1: Verify updated file has chown ==="
grep -c "chown" "$SITE_DIR/scripts/webhook-listener.js"
echo "chown found in webhook-listener.js"

echo ""
echo "=== Step 2: Push to Gitea ==="
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/scripts/webhook-listener.js?ref=$BRANCH")
SHA=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
CONTENT=$(base64 -w0 "$SITE_DIR/scripts/webhook-listener.js")
RESULT=$(curl -s -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"$CONTENT\",\"sha\":\"$SHA\",\"message\":\"Fix gitPull: discard generated files + chown before/after pull\",\"branch\":\"$BRANCH\"}" \
  "$GITEA_URL/api/v1/repos/$REPO/contents/scripts/webhook-listener.js")
COMMIT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha','FAILED'))")
echo "Pushed: ${COMMIT:0:8}..."

echo ""
echo "=== Step 3: Fix permissions ==="
chown -R www-data:www-data "$SITE_DIR"

echo ""
echo "=== Step 4: Restart webhook service ==="
systemctl restart siyang-webhook
sleep 2
curl -s http://127.0.0.1:3099/health | python3 -c "import sys,json; d=json.load(sys.stdin); print('Service:', d.get('status'))"

echo ""
echo "=== Step 5: Wait for webhook to process the push ==="
sleep 15

echo ""
echo "=== Step 6: Check result ==="
journalctl -u siyang-webhook --since '20 seconds ago' --no-pager -n 15

echo ""
echo "=== Step 7: Health check ==="
curl -s http://127.0.0.1:3099/health | python3 -c "
import sys,json
d=json.load(sys.stdin)
ld=d.get('lastDeploy') or {}
print('Deploy status:', ld.get('status','none'))
print('Steps:', ld.get('steps',{}))
"

echo ""
echo "=== Step 8: If previous failed, trigger another test push ==="
if [ "$(curl -s http://127.0.0.1:3099/health | python3 -c 'import sys,json; d=json.load(sys.stdin); ld=d.get("lastDeploy") or {}; print(ld.get("status","none"))')" != "success" ]; then
  echo "Previous deploy failed, triggering new test..."
  python3 << 'PYEOF'
import base64, json, re, time, urllib.request
token = "79e684becd5f82163d5b0b6b75ba5593ab0db965"
req = urllib.request.Request(
    "http://localhost:3000/api/v1/repos/admin/b2b/contents/admin/welcome.md?ref=main",
    headers={"Authorization": f"token {token}"}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())
content = base64.b64decode(data["content"]).decode()
sha = data["sha"]
ts = str(int(time.time()))
if "<!-- e2e:" in content:
    content = re.sub(r"<!-- e2e:\d+ -->", f"<!-- e2e:{ts} -->", content)
else:
    content = "<!-- e2e:" + ts + " -->\n" + content
encoded = base64.b64encode(content.encode()).decode()
push_data = json.dumps({
    "content": encoded,
    "sha": sha,
    "message": f"Test webhook with chown fix ({ts})",
    "branch": "main"
}).encode()
push_req = urllib.request.Request(
    "http://localhost:3000/api/v1/repos/admin/b2b/contents/admin/welcome.md",
    data=push_data,
    headers={"Authorization": f"token {token}", "Content-Type": "application/json"},
    method="PUT"
)
with urllib.request.urlopen(push_req) as resp:
    result = json.loads(resp.read())
    print(f"Pushed: {result.get('commit',{}).get('sha','?')[:8]}...")
PYEOF
  echo "Waiting 15s..."
  sleep 15
  journalctl -u siyang-webhook --since '20 seconds ago' --no-pager -n 15
  curl -s http://127.0.0.1:3099/health | python3 -c "
import sys,json
d=json.load(sys.stdin)
ld=d.get('lastDeploy') or {}
print('Deploy status:', ld.get('status','none'))
print('Steps:', ld.get('steps',{}))
"
fi
