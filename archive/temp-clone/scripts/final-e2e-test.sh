#!/bin/bash
# Final end-to-end test with the new webhook code
set -e

TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
GITEA_URL="http://localhost:3000"
REPO="admin/b2b"
SITE_DIR="/var/www/siyang/public"

echo "=== Restarting webhook service ==="
systemctl restart siyang-webhook
sleep 2

echo "=== Service status ==="
curl -s http://127.0.0.1:3099/health | python3 -c "import sys,json; d=json.load(sys.stdin); print('Service:', d.get('status'))"

echo ""
echo "=== Trigger test push ==="
python3 << 'PYEOF'
import base64, json, re, time, urllib.request
token = "79e684becd5f82163d5b0b6b75ba5593ab0db965"
req = urllib.request.Request(
    "http://localhost:3000/api/v1/repos/admin/b2b/contents/content/pages/homepage-hero.md?ref=main",
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
    content = content.rstrip() + f"\n\n<!-- e2e:{ts} -->"
encoded = base64.b64encode(content.encode()).decode()
push_data = json.dumps({
    "content": encoded,
    "sha": sha,
    "message": f"Final e2e test with chown fix ({ts})",
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
    print(f"Pushed: {result.get('commit',{}).get('sha','?')[:8]}...")
PYEOF

echo "Waiting 15s for webhook..."
sleep 15

echo ""
echo "=== Webhook journal ==="
journalctl -u siyang-webhook --since '20 seconds ago' --no-pager -n 15

echo ""
echo "=== Health check ==="
curl -s http://127.0.0.1:3099/health | python3 -c "
import sys,json
d=json.load(sys.stdin)
ld=d.get('lastDeploy') or {}
print('Deploy status:', ld.get('status','none'))
print('Steps:', ld.get('steps',{}))
"

echo ""
echo "=== Verify live site ==="
curl -sk https://siyang.tools/ 2>/dev/null | grep -oP '(?<=cms-heroTitle[^>]*>)[^<]+' | head -1 || echo "Could not extract hero title"
