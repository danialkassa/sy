#!/bin/bash
# Manual fix: clean git state, pull latest, restart webhook
set -e

SITE_DIR="/var/www/siyang/public"

echo "=== Step 1: Clean git working tree ==="
cd "$SITE_DIR"
git checkout -- .
git clean -fd
echo "Working tree clean"

echo ""
echo "=== Step 2: Pull latest code ==="
git pull --rebase origin main

echo ""
echo "=== Step 3: Fix permissions ==="
chown -R www-data:www-data "$SITE_DIR"

echo ""
echo "=== Step 4: Verify webhook-listener.js has chown ==="
grep -c "chown" "$SITE_DIR/scripts/webhook-listener.js" && echo "chown found in webhook-listener.js" || echo "chown NOT found"

echo ""
echo "=== Step 5: Restart webhook service ==="
systemctl restart siyang-webhook
sleep 2
systemctl status siyang-webhook --no-pager -l | head -5

echo ""
echo "=== Step 6: Run build ==="
cd "$SITE_DIR"
node scripts/generate-index.js
node scripts/build-html.js

echo ""
echo "=== Step 7: Test webhook with a push ==="
TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
# Make a test push
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
    "message": f"Test webhook with updated gitPull code ({ts})",
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

echo "Waiting 15s for webhook..."
sleep 15

echo ""
echo "=== Step 8: Check webhook result ==="
journalctl -u siyang-webhook --since '20 seconds ago' --no-pager -n 15

echo ""
echo "=== Step 9: Health check ==="
curl -s http://127.0.0.1:3099/health | python3 -c "
import sys,json
d=json.load(sys.stdin)
ld=d.get('lastDeploy') or {}
print('Deploy status:', ld.get('status','none'))
print('Steps:', ld.get('steps',{}))
"
