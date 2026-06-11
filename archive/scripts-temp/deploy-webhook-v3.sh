#!/bin/bash
# Deploy webhook v3 (with chown) and test
set -e

GITEA_URL="http://localhost:3000"
TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
REPO="admin/b2b"
BRANCH="main"
SITE_DIR="/var/www/siyang/public"

# First fix permissions immediately
chown -R www-data:www-data "$SITE_DIR"
echo "Permissions fixed"

# Push updated webhook-listener.js to Gitea
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/scripts/webhook-listener.js?ref=$BRANCH")
SHA=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
CONTENT=$(base64 -w0 "$SITE_DIR/scripts/webhook-listener.js")
RESULT=$(curl -s -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"$CONTENT\",\"sha\":\"$SHA\",\"message\":\"Fix gitPull: add chown after git ops to prevent EACCES\",\"branch\":\"$BRANCH\"}" \
  "$GITEA_URL/api/v1/repos/$REPO/contents/scripts/webhook-listener.js")
COMMIT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha','FAILED'))")
echo "Pushed: ${COMMIT:0:8}..."

# Wait for webhook
echo "Waiting 15s for webhook..."
sleep 15

# Check result
echo "=== Journal ==="
journalctl -u siyang-webhook --since '20 seconds ago' --no-pager -n 20

echo ""
echo "=== Health ==="
curl -s http://127.0.0.1:3099/health | python3 -c "
import sys,json
d=json.load(sys.stdin)
ld=d.get('lastDeploy') or {}
print('Deploy status:', ld.get('status','none'))
print('Steps:', ld.get('steps',{}))
"

# Restart service with latest code
echo ""
systemctl restart siyang-webhook
sleep 2
echo "Service restarted"
