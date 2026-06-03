# DigitalOcean Deployment Guide — Gitea + Decap CMS + Auto-Deploy

## Overview

This document contains all server-side commands to set up:
1. **Gitea** — self-hosted Git service on your Droplet
2. **Gitea OAuth App** — for Decap CMS login
3. **DigitalOcean Spaces** — for media file storage (optional)
4. **Webhook listener** — auto-deploy on content changes
5. **Nginx** — serve the static site

---

## PREREQUISITES

- A running DigitalOcean Droplet (Ubuntu 22.04+ recommended)
- SSH access to the droplet: `ssh root@your-droplet-ip`
- Domain pointing to droplet IP (ningbosiyang.com)
- Your local repo at `c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website`

---

## STEP 1: Install Gitea on the Droplet

SSH into your droplet:

```bash
ssh root@your-droplet-ip
```

Run these commands:

```bash
sudo apt update && sudo apt install -y git sqlite3 nginx curl wget

GITEA_VERSION="1.23.0"
wget -O /tmp/gitea "https://dl.gitea.io/gitea/${GITEA_VERSION}/gitea-${GITEA_VERSION}-linux-amd64"
chmod +x /tmp/gitea
mv /tmp/gitea /usr/local/bin/gitea

adduser --system --shell /bin/bash --gecos 'Git Version Control' --disabled-password --home /var/lib/gitea git
mkdir -p /var/lib/gitea/{custom,data,log,repositories,run}
chown -R git:git /var/lib/gitea
```

Create Gitea systemd service:

```bash
cat > /etc/systemd/system/gitea.service << 'EOF'
[Unit]
Description=Gitea
After=network.target

[Service]
Type=simple
User=git
ExecStart=/usr/local/bin/gitea web --config /var/lib/gitea/custom/conf/app.ini
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable gitea
systemctl start gitea
systemctl status gitea
```

Verify Gitea is running:

```bash
curl -I http://localhost:3000
```

You should see `HTTP/1.1 200 OK`.

---

## STEP 2: Create Repository in Gitea

Open your browser and go to: `http://your-droplet-ip:3000`

1. Click "Sign Up" → Create an admin account (this will be YOUR login)
2. After signing up, click "+" → "New Repository"
3. Name it: `site`
4. Set visibility: Private (recommended)
5. Click "Create repository"

The repo URL will be: `git@your-droplet-ip:your-username/site.git`

---

## STEP 3: Push Local Repo to Gitea

On your LOCAL machine (Windows PowerShell):

```bash
cd c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website

git init
git add .
git commit -m "Initial commit: Ningbo Siyang public website"
git remote add origin git@your-droplet-ip:your-username/site.git
git push -u origin main
```

---

## STEP 4: Create OAuth Application in Gitea

In Gitea web UI:

1. Go to: `http://your-droplet-ip:3000/user/settings/applications`
2. Click "Create New OAuth2 Application"
3. Fill in:
   - Application Name: `Decap CMS`
   - Redirect URI: `http://ningbosiyang.com/admin/` (or `http://localhost:3000/admin/` for local testing)
4. Click "Create Application"

**SAVE these values** — you need them for config.yml:

| Value | Where It Goes |
|-------|---------------|
| Client ID | Goes into Gitea OAuth setup |
| Client Secret | Store as env var, NOT in code |

---

## STEP 5: Configure Nginx for Static Site

```bash
cat > /etc/nginx/sites-available/ningbosiyang.com << 'EOF'
server {
    listen 80;
    server_name ningbosiyang.com www.ningbosiyang.com;
    root /var/www/site/public-website;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /admin {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

ln -sf /etc/nginx/sites-available/ningbosiyang.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## STEP 6: Deploy Script (Auto-Pull on Push)

Create the deploy script on the droplet:

```bash
mkdir -p /var/www/site
cat > /var/www/site/deploy.sh << 'DEPLOY_EOF'
#!/bin/bash
cd /var/www/site/repo
git pull origin main
node scripts/generate-index.js
cp -r * /var/www/site/public-website/
echo "$(date): Deploy complete" >> /var/log/deploy.log
DEPLOY_EOF

chmod +x /var/www/site/deploy.sh
```

Clone the repo to deploy directory:

```bash
cd /var/www/site
git clone git@your-droplet-ip:your-username/site.git repo
```

---

## STEP 7: Webhook Listener (Node.js)

```bash
npm install -g pm2
cat > /var/www/site/webhook.js << 'WEBHOOK_EOF'
const http = require('http');
const { execSync } = require('child_process');

const PORT = 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'change-me-to-random-string';

http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404);
    return res.end('Not found');
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const payload = JSON.parse(body);
      console.log(new Date().toISOString(), 'Webhook received:', payload.ref);

      execSync('/var/www/site/deploy.sh', { stdio: 'inherit' });

      res.writeHead(200);
      res.end(JSON.stringify({ status: 'deployed' }));
    } catch (e) {
      console.error(e);
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}).listen(PORT, () => {
  console.log(`Webhook listener on port ${PORT}`);
});
WEBHOOK_EOF
```

Start webhook listener with pm2:

```bash
cd /var/www/site
pm2 start webhook.js --name webhook
pm2 save
pm2 startup
```

---

## STEP 8: Register Webhook in Gitea

In Gitea web UI:

1. Go to your `site` repository
2. Settings → Webhooks → Add Webhook
3. URL: `http://your-droplet-ip:9000/webhook`
4. HTTP Method: POST
5. Content Type: JSON
6. Secret: same as WEBHOOK_SECRET above
7. Trigger On: Push events
8. Active: checked
9. Save

---

## STEP 9: DigitalOcean Spaces (Optional but Recommended)

In DigitalOcean control panel:

1. Create a Space (S3-compatible bucket)
2. Name it: `site-media`
3. Region: choose closest to your users (e.g., nyc3)
4. Generate Access Keys (Settings → Access Keys)

Store keys as environment variables on the droplet:

```bash
cat >> ~/.profile << 'ENV_EOF'

export DO_SPACES_KEY="your-access-key"
export DO_SPACES_SECRET="your-secret-key"
export DO_SPACES_BUCKET="site-media"
export DO_SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"
export DO_SPACES_REGION="us-east-1"
ENVEOF
source ~/.profile
```

Then uncomment the S3 media_library section in admin/config.yml.

---

## STEP 10: Update Local config.yml with Real Values

After completing Steps 4 and 9, update `admin/config.yml` locally:

Replace placeholder values with real ones:

```yaml
backend:
  name: gitea
  repo: git@your-real-droplet-ip:your-gitea-username/site.git
  branch: main
  api_root: http://your-real-droplet-ip:3000/api/v1
  base_url: http://your-real-droplet-ip:3000
  auth_endpoint: /login/oauth/authorize
  site_domain: ningbosiyang.com
```

---

## TEST CHECKLIST

### Local Testing (Before Deploy)

- [ ] Run `node scripts/generate-index.js` — verify blog/index.json and products/index.json are correct
- [ ] Open `admin/index.html` — should show CMS interface (test-repo mode)
- [ ] Check all HTML pages render correctly in browser
- [ ] Verify no broken links or missing images

### Droplet Testing (After Deploy)

```bash
# Test Gitea is accessible
curl -I http://localhost:3000

# Test nginx serves the site
curl -I http://localhost/

# Test webhook endpoint
curl -X POST http://localhost:9000/webhook -H "Content-Type: application/json" -d '{"ref":"refs/heads/main"}'

# Test deploy script runs without error
/var/www/site/deploy.sh
```

### CMS Testing (After Full Setup)

- [ ] Open `https://ningbosiyang.com/admin/`
- [ ] Log in via Gitea OAuth
- [ ] Create a new blog post
- [ ] Upload an image
- [ ] Publish the post
- [ ] Check that a commit appears in Gitea
- [ ] Check that the blog page shows the new post after deploy

---

## ROLLBACK PLAN

If anything breaks:

### Quick Rollback (Revert Last Deploy)

```bash
# On droplet
cd /var/www/site/repo
git log --oneline -5
git revert HEAD
/var/www/site/deploy.sh
```

### Full Rollback (Restore Previous State)

```bash
# On droplet
systemctl stop gitea nginx
pm2 stop webhook

# Remove everything installed by this guide
apt remove -y gitea 2>/dev/null
rm -rf /var/lib/gitea /var/www/site /etc/nginx/sites-available/ningbosiyang.com

# Restore from backup (if you made one)
# Or re-push the original state from local machine
```

### Config Rollback

If admin/config.yml breaks the CMS:

```bash
# The .bak files were created before any changes
cp admin/config.yml.bak admin/config.yml
```

---

## SECURITY NOTES

- Change the WEBHOOK_SECRET to a random string
- Use HTTPS (Let's Encrypt) for production — run: `certbot --nginx -d ningbosiyang.com`
- Never commit secrets to the repo (use environment variables)
- Restrict Gitea access to trusted IPs only (in Gitea settings)
- Keep Gitea updated: periodically download newer version
