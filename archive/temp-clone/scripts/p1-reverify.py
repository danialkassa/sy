import json
import urllib.request
import base64

TOKEN = "79e684becd5f82163d5b0b6b75ba5593ab0db965"
API = "http://localhost:3000/api/v1/repos/admin/b2b/contents/content/pages/homepage-hero.md"

# Get current file
req = urllib.request.Request(API, headers={"Authorization": f"token {TOKEN}"})
resp = urllib.request.urlopen(req)
file_data = json.loads(resp.read())
sha = file_data["sha"]
current = base64.b64decode(file_data["content"]).decode()

# Toggle between two values
if "POWER YOUR CRAFT" in current:
    new = current.replace("POWER YOUR CRAFT", "POWER YOUR CRAFT")
    # No change needed, just add a space to trigger commit
    new = current.replace("heroTitle:", "heroTitle: ")
    new = new.replace("heroTitle:  ", "heroTitle: ")
else:
    new = current

# Add a comment to force a change
new = current + "\n" if not current.endswith("\n") else current.rstrip("\n") + "\n\n"
# Actually, let's just update the subtitle slightly and back
if "Since 1998" in current:
    new = current.replace("Since 1998", "Since 1998")
else:
    new = current

# Simplest: just re-commit with same content
data = json.dumps({
    "content": base64.b64encode(current.encode()).decode(),
    "sha": sha,
    "message": "Phase 1 re-verification: test webhook fires on push",
    "branch": "main"
}).encode("utf-8")

req = urllib.request.Request(API, data=data, headers={"Authorization": f"token {TOKEN}", "Content-Type": "application/json"}, method="PUT")
try:
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    print(f"Push OK. Commit: {result['commit']['sha'][:8]}")
except urllib.error.HTTPError as e:
    err = json.loads(e.read())
    print(f"Push FAILED: {err.get('message', str(e))}")
