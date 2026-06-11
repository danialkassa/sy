#!/bin/bash
# Push admin/index.html (v3.8.4) to Gitea via API
set -e

GITEA_URL="http://localhost:3000"
TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
REPO="admin/b2b"
FILEPATH="admin/index.html"
BRANCH="main"

# Get current file SHA
echo "=== Getting current file SHA ==="
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" \
  "$GITEA_URL/api/v1/repos/$REPO/contents/$FILEPATH?ref=$BRANCH")

SHA=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])" 2>/dev/null || echo "")
if [ -z "$SHA" ]; then
  echo "ERROR: Could not get SHA. Response:"
  echo "$RESPONSE"
  exit 1
fi
echo "Current SHA: $SHA"

# Read the local file and base64 encode it
CONTENT=$(base64 -w0 /var/www/siyang/public/admin/index.html)

# Update the file via API
echo "=== Pushing v3.8.4 to Gitea ==="
RESULT=$(curl -s -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"content\": \"$CONTENT\",
    \"sha\": \"$SHA\",
    \"message\": \"Upgrade Decap CMS from v3.3.3 to v3.8.4 - fixes DRAFT_MEDIA_FILES bug\",
    \"branch\": \"$BRANCH\"
  }" \
  "$GITEA_URL/api/v1/repos/$REPO/contents/$FILEPATH")

# Check if successful
COMMIT_SHA=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha','FAILED'))" 2>/dev/null || echo "FAILED")
if [ "$COMMIT_SHA" = "FAILED" ]; then
  echo "ERROR: Push failed. Response:"
  echo "$RESULT"
  exit 1
fi

echo "SUCCESS! Commit SHA: $COMMIT_SHA"
echo "v3.8.4 is now persisted in the Gitea repo."
