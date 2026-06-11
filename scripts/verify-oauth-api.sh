#!/bin/bash
# Verify API proxy and OAuth2 app
TOKEN="79e684becd5f82163d5b0b6b75ba5593ab0db965"

echo "=== API Proxy Test ==="
curl -sk "https://siyang.tools/api/v1/repos/admin/b2b" \
  -H "Authorization: token $TOKEN" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print('Repo:', d.get('full_name','?'))
    print('Branch:', d.get('default_branch','?'))
    print('API proxy: WORKING')
except:
    print('API proxy: FAILED')
"

echo ""
echo "=== OAuth2 App Search ==="
# Try different Gitea API endpoints for OAuth2 apps
for endpoint in "/api/v1/applications/oauth2" "/api/v1/admin/applications/oauth2"; do
    echo "Trying: $endpoint"
    curl -s -H "Authorization: token $TOKEN" "http://localhost:3000$endpoint" | head -c 200
    echo ""
done

echo ""
echo "=== Direct Gitea DB check for OAuth2 ==="
docker exec gitea sh -c "cat /data/gitea/conf/app.ini | grep -A5 oauth2 || echo 'No oauth2 section in app.ini'"

echo ""
echo "=== Test OAuth authorize endpoint ==="
curl -sk -o /dev/null -w "HTTP %{http_code}" "https://siyang.tools/login/oauth/authorize?client_id=b44bfe8b-1633-41ee-9533-738e78b392a0&response_type=code&redirect_uri=https://siyang.tools/admin/"
echo ""
