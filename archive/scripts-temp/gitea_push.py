import base64, json, urllib.request

API = 'http://localhost:3000/api/v1/repos/admin/b2b/contents'
TOKEN = '79e684becd5f82163d5b0b6b75ba5593ab0db965'
BRANCH = 'main'

def api_get(path):
    req = urllib.request.Request(API + '/' + path, headers={'Authorization': 'token ' + TOKEN})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def api_put(path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(API + '/' + path, data=body, method='PUT', headers={
        'Authorization': 'token ' + TOKEN,
        'Content-Type': 'application/json'
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def push_file(local_path, repo_path):
    with open(local_path, 'rb') as f:
        content_b64 = base64.b64encode(f.read()).decode()

    try:
        info = api_get(repo_path)
        sha = info['sha']
        print('  Current SHA for ' + repo_path + ': ' + sha)
    except Exception as e:
        print('  Could not get SHA for ' + repo_path + ': ' + str(e))
        sha = None

    data = {
        'content': content_b64,
        'message': 'Update ' + repo_path,
        'branch': BRANCH,
    }
    if sha:
        data['sha'] = sha

    result = api_put(repo_path, data)
    commit_sha = result.get('commit', {}).get('sha', '?')
    print('  Pushed ' + repo_path + ' successfully (commit: ' + str(commit_sha)[:8] + ')')

# Step 1: Update index.html on disk
index_path = '/var/www/siyang/public/admin/index.html'
with open(index_path, 'r') as f:
    content = f.read()
new_content = content.replace('cms-theme.css?v=4', 'cms-theme.css?v=5')
with open(index_path, 'w') as f:
    f.write(new_content)
print('Updated index.html on disk: cms-theme.css?v=4 -> cms-theme.css?v=5')

# Step 2: Push all three files
files = [
    ('/var/www/siyang/public/admin/cms-theme.css', 'admin/cms-theme.css'),
    ('/var/www/siyang/public/admin/config.yml', 'admin/config.yml'),
    ('/var/www/siyang/public/admin/index.html', 'admin/index.html'),
]

for local_path, repo_path in files:
    print('Pushing ' + repo_path + '...')
    push_file(local_path, repo_path)

print('All done!')
