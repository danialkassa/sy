#!/bin/bash
# Push updated webhook-listener.js to Gitea and deploy to server
set -e

GITEA_URL="http://localhost:3000"
TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
REPO="admin/b2b"
BRANCH="main"
SITE_DIR="/var/www/siyang/public"

# Get current SHA of webhook-listener.js
echo "=== Getting current SHA ==="
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" \
  "$GITEA_URL/api/v1/repos/$REPO/contents/scripts/webhook-listener.js?ref=$BRANCH")
SHA=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])" 2>/dev/null || echo "")
if [ -z "$SHA" ]; then
  echo "ERROR: Could not get SHA"
  echo "$RESPONSE"
  exit 1
fi
echo "Current SHA: $SHA"

# Read local file and base64 encode
CONTENT=$(base64 -w0 "$SITE_DIR/scripts/webhook-listener.js")

# Push to Gitea
echo "=== Pushing updated webhook-listener.js ==="
RESULT=$(curl -s -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"content\": \"$CONTENT\",
    \"sha\": \"$SHA\",
    \"message\": \"Fix webhook gitPull: use --rebase with fallback to reset --hard\",
    \"branch\": \"$BRANCH\"
  }" \
  "$GITEA_URL/api/v1/repos/$REPO/contents/scripts/webhook-listener.js")

COMMIT_SHA=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha','FAILED'))" 2>/dev/null || echo "FAILED")
if [ "$COMMIT_SHA" = "FAILED" ]; then
  echo "ERROR: Push failed"
  echo "$RESULT"
  exit 1
fi
echo "SUCCESS! Commit: $COMMIT_SHA"

# Restart webhook service to pick up changes
echo "=== Restarting webhook service ==="
systemctl restart siyang-webhook
sleep 2
systemctl status siyang-webhook --no-pager -l | head -5

# Verify webhook is healthy
echo "=== Health check ==="
curl -s http://127.0.0.1:3099/health | python3 -c "import sys,json; d=json.load(sys.stdin); print('Status:', d.get('status'))"
