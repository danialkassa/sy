#!/bin/bash
# Push updated build-html.js and webhook-listener.js to Gitea
set -e

TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
GITEA_URL="http://localhost:3000"
REPO="admin/b2b"
BRANCH="main"
SITE_DIR="/var/www/siyang/public"

# Push build-html.js
echo "=== Pushing build-html.js ==="
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/scripts/build-html.js?ref=$BRANCH")
SHA=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
CONTENT=$(base64 -w0 "$SITE_DIR/scripts/build-html.js")
RESULT=$(curl -s -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"$CONTENT\",\"sha\":\"$SHA\",\"message\":\"Add 6 new collection loaders/renderers, fix replaceElementTextById to preserve attributes, fix injectHtmlIntoContainer nesting\",\"branch\":\"$BRANCH\"}" \
  "$GITEA_URL/api/v1/repos/$REPO/contents/scripts/build-html.js")
COMMIT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha','FAILED'))")
echo "build-html.js: ${COMMIT:0:8}..."

# Push webhook-listener.js
echo ""
echo "=== Pushing webhook-listener.js ==="
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/scripts/webhook-listener.js?ref=$BRANCH")
SHA=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
CONTENT=$(base64 -w0 "$SITE_DIR/scripts/webhook-listener.js")
RESULT=$(curl -s -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"$CONTENT\",\"sha\":\"$SHA\",\"message\":\"Fix gitPull: discard generated files + chown before/after pull\",\"branch\":\"$BRANCH\"}" \
  "$GITEA_URL/api/v1/repos/$REPO/contents/scripts/webhook-listener.js")
COMMIT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha','FAILED'))")
echo "webhook-listener.js: ${COMMIT:0:8}..."

echo ""
echo "=== Done - both files pushed to Gitea ==="
