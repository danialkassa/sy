#!/bin/bash
# Final Phase 1 verification: end-to-end webhook test + cleanup
set -e

SITE_DIR="/var/www/siyang/public"
TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"
GITEA_URL="http://localhost:3000"
REPO="admin/b2b"

echo "=== Step 1: Clean up backup files ==="
cd "$SITE_DIR"
rm -f admin/cms-theme.css.backup admin/cms-theme.css.disabled
rm -f admin/index-minimal.html admin/index.html.backup admin/index.html.full-backup admin/index.html.with-theme
echo "Backup files cleaned"

echo ""
echo "=== Step 2: Verify git status is clean ==="
git status --short | head -20

echo ""
echo "=== Step 3: End-to-end webhook test ==="
# Make a small change via Gitea API, then verify webhook fires and rebuilds
# First, get current admin/welcome.md content
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$REPO/contents/admin/welcome.md?ref=main")
SHA=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
echo "Current welcome.md SHA: ${SHA:0:8}..."

# Create updated content with a timestamp comment to trigger webhook
UPDATED_CONTENT=$(python3 -c "
import base64, json, sys
resp = json.loads('''$RESPONSE''')
content = base64.b64decode(resp['content']).decode()
# Add a timestamp comment if not present, or update it
import re
import time
ts = str(int(time.time()))
if '<!-- verified:' in content:
    content = re.sub(r'<!-- verified:\d+ -->', f'<!-- verified:{ts} -->', content)
else:
    content = '<!-- verified:' + ts + ' -->\n' + content
print(base64.b64encode(content.encode()).decode())
")

# Push the update
RESULT=$(curl -s -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"content\": \"$UPDATED_CONTENT\",
    \"sha\": \"$SHA\",
    \"message\": \"Phase 1 verify: end-to-end webhook test\",
    \"branch\": \"main\"
  }" \
  "$GITEA_URL/api/v1/repos/$REPO/contents/admin/welcome.md")

COMMIT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha','FAILED'))")
echo "Pushed commit: ${COMMIT:0:8}..."

# Wait for webhook to process
echo "Waiting 10 seconds for webhook to process..."
sleep 10

# Check webhook journal for success
echo ""
echo "=== Step 4: Check webhook result ==="
journalctl -u siyang-webhook --since '30 seconds ago' --no-pager -n 15

echo ""
echo "=== Step 5: Verify /health shows latest deploy ==="
curl -s http://127.0.0.1:3099/health | python3 -c "
import sys,json
d=json.load(sys.stdin)
ld=d.get('lastDeploy',{})
print('Last deploy status:', ld.get('status'))
print('Steps:', ld.get('steps'))
print('Timestamp:', ld.get('timestamp'))
"

echo ""
echo "=== Phase 1 End-to-End Test Complete ==="
