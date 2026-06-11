#!/bin/bash
# Clean git state and do end-to-end webhook test with new code
set -e

SITE_DIR="/var/www/siyang/public"
TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
GITEA_URL="http://localhost:3000"
REPO="admin/b2b"

echo "=== Step 1: Clean git working tree ==="
cd "$SITE_DIR"
git checkout -- .
git clean -fd
git status --short
echo "Git working tree clean"

echo ""
echo "=== Step 2: Verify webhook service is running with new code ==="
curl -s http://127.0.0.1:3099/health | python3 -c "import sys,json; d=json.load(sys.stdin); print('Service:', d.get('status'))"

echo ""
echo "=== Step 3: Trigger a push via Gitea API ==="
# Get current welcome.md SHA
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/admin/welcome.md?ref=main")
SHA=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
echo "Current SHA: ${SHA:0:8}..."

# Decode content and add timestamp
UPDATED_CONTENT=$(python3 << 'PYEOF'
import base64, json, re, time
import urllib.request
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
# Now push
push_data = json.dumps({
    "content": encoded,
    "sha": sha,
    "message": f"Phase 1 e2e test: webhook pipeline verification ({ts})",
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
)

echo ""
echo "=== Step 4: Wait for webhook to process ==="
sleep 12

echo ""
echo "=== Step 5: Check webhook result ==="
journalctl -u siyang-webhook --since '20 seconds ago' --no-pager -n 20

echo ""
echo "=== Step 6: Check /health ==="
curl -s http://127.0.0.1:3099/health | python3 -c "
import sys,json
d=json.load(sys.stdin)
ld=d.get('lastDeploy') or {}
print('Deploy status:', ld.get('status','none'))
print('Steps:', ld.get('steps',{}))
"
