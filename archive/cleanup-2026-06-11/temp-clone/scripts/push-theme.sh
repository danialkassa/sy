#!/bin/bash
# Push admin files to Gitea and fix permissions
set -e

TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
GITEA_URL="http://localhost:3000"
REPO="admin/b2b"
BRANCH="main"
SITE_DIR="/var/www/siyang/public"

# Fix permissions
chown -R www-data:www-data "$SITE_DIR"

# Push admin/index.html
echo "=== Pushing admin/index.html ==="
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/admin/index.html?ref=$BRANCH")
SHA=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
CONTENT=$(base64 -w0 "$SITE_DIR/admin/index.html")
RESULT=$(curl -s -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"$CONTENT\",\"sha\":\"$SHA\",\"message\":\"Re-enable dark CMS theme (scoped to #nc-root, no opacity:0)\",\"branch\":\"$BRANCH\"}" \
  "$GITEA_URL/api/v1/repos/$REPO/contents/admin/index.html")
COMMIT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha','FAILED'))")
echo "admin/index.html: ${COMMIT:0:8}..."

# Push admin/cms-theme.css (check if it exists in repo)
echo ""
echo "=== Pushing admin/cms-theme.css ==="
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/admin/cms-theme.css?ref=$BRANCH")
EXISTING=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sha','MISSING'))" 2>/dev/null || echo "MISSING")
CONTENT=$(base64 -w0 "$SITE_DIR/admin/cms-theme.css")

if [ "$EXISTING" = "MISSING" ]; then
  # Create new file
  RESULT=$(curl -s -X POST \
    -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"$CONTENT\",\"message\":\"Add dark CMS theme (scoped to #nc-root, no opacity:0, no bare selectors)\",\"branch\":\"$BRANCH\"}" \
    "$GITEA_URL/api/v1/repos/$REPO/contents/admin/cms-theme.css")
else
  # Update existing file
  RESULT=$(curl -s -X PUT \
    -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"$CONTENT\",\"sha\":\"$EXISTING\",\"message\":\"Update dark CMS theme (scoped to #nc-root, no opacity:0)\",\"branch\":\"$BRANCH\"}" \
    "$GITEA_URL/api/v1/repos/$REPO/contents/admin/cms-theme.css")
fi
COMMIT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha','FAILED'))")
echo "admin/cms-theme.css: ${COMMIT:0:8}..."

# Remove the disabled file if it exists
rm -f "$SITE_DIR/admin/cms-theme.css.disabled"

echo ""
echo "=== Done ==="
