#!/bin/bash
# Deploy updated webhook-listener.js v2 and test
set -e

GITEA_URL="http://localhost:3000"
TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
REPO="admin/b2b"
BRANCH="main"
SITE_DIR="/var/www/siyang/public"

# Get current SHA
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/scripts/webhook-listener.js?ref=$BRANCH")
SHA=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
echo "Current SHA: ${SHA:0:8}..."

# Read local file and base64 encode
CONTENT=$(base64 -w0 "$SITE_DIR/scripts/webhook-listener.js")

# Push to Gitea
RESULT=$(curl -s -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"$CONTENT\",\"sha\":\"$SHA\",\"message\":\"Fix gitPull: discard generated files before pull, add fallback reset\",\"branch\":\"$BRANCH\"}" \
  "$GITEA_URL/api/v1/repos/$REPO/contents/scripts/webhook-listener.js")

COMMIT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha','FAILED'))")
echo "Pushed: ${COMMIT:0:8}..."

# Wait for webhook to fire and process
echo "Waiting 15 seconds for webhook..."
sleep 15

# Check journal
echo "=== Webhook journal ==="
journalctl -u siyang-webhook --since '20 seconds ago' --no-pager -n 20

# Check health
echo ""
echo "=== Health check ==="
curl -s http://127.0.0.1:3099/health | python3 -c "
import sys,json
d=json.load(sys.stdin)
ld=d.get('lastDeploy') or {}
print('Status:', ld.get('status','none'))
print('Steps:', ld.get('steps',{}))
"

# Restart service to pick up the new code
echo ""
echo "=== Restarting service with updated code ==="
systemctl restart siyang-webhook
sleep 2
curl -s http://127.0.0.1:3099/health | python3 -c "import sys,json; d=json.load(sys.stdin); print('Service:', d.get('status'))"
