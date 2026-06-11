#!/bin/bash
# ============================================================
# Deploy Ningbo Siyang Public Website to DigitalOcean Droplet
# ============================================================
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh [SSH_USER] [SSH_HOST]
#
# Defaults: SSH_USER=root, SSH_HOST=165.22.250.66
# ============================================================

set -euo pipefail

SSH_USER="${1:-root}"
SSH_HOST="${2:-165.22.250.66}"
REMOTE_DIR="/var/www/siyang/public"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

log "Deploying Ningbo Siyang website to ${SSH_USER}@${SSH_HOST}"

# ============================================================
# 1. Install Nginx if not present
# ============================================================
log "Checking Nginx installation..."
ssh "${SSH_USER}@${SSH_HOST}" '
    if ! command -v nginx &> /dev/null; then
        echo "  Installing Nginx..."
        apt-get update -qq && apt-get install -y nginx
        systemctl enable nginx
        systemctl start nginx
        echo "  Nginx installed"
    else
        echo "  Nginx already installed"
    fi
'

# ============================================================
# 2. Create remote directory
# ============================================================
log "Creating remote directory ${REMOTE_DIR}..."
ssh "${SSH_USER}@${SSH_HOST}" "mkdir -p ${REMOTE_DIR}"

# ============================================================
# 3. Upload website files
# ============================================================
log "Uploading website files..."

# Upload main directories
rsync -avz --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.ai-tasks' \
    --exclude='fix-lang-selector.ps1' \
    "${PROJECT_DIR}/" "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/"

log "Files uploaded"

# ============================================================
# 4. Upload Nginx config
# ============================================================
log "Configuring Nginx..."
scp "${SCRIPT_DIR}/nginx-siyang.conf" \
    "${SSH_USER}@${SSH_HOST}:/etc/nginx/sites-available/siyang"

ssh "${SSH_USER}@${SSH_HOST}" '
    # Enable the site
    ln -sf /etc/nginx/sites-available/siyang /etc/nginx/sites-enabled/siyang

    # Remove default site if it conflicts
    # rm -f /etc/nginx/sites-enabled/default

    # Test Nginx config
    nginx -t 2>&1

    # Reload Nginx
    systemctl reload nginx
    echo "  Nginx configured and reloaded"
'

# ============================================================
# 5. Update Gitea config for reverse proxy
# ============================================================
log "Updating Gitea configuration for reverse proxy..."
ssh "${SSH_USER}@${SSH_HOST}" '
    # Find Gitea config
    GITEA_CONF="/etc/gitea/app.ini"
    if [ ! -f "$GITEA_CONF" ]; then
        # Try Docker path
        GITEA_CONF=$(find / -name "app.ini" -path "*/gitea/*" 2>/dev/null | head -1)
    fi

    if [ -n "$GITEA_CONF" ] && [ -f "$GITEA_CONF" ]; then
        # Update ROOT_URL so Gitea knows its proxied URL
        if grep -q "ROOT_URL" "$GITEA_CONF"; then
            sed -i "s|ROOT_URL.*|ROOT_URL = https://siyang.tools/|" "$GITEA_CONF"
        else
            sed -i "/\[server\]/a ROOT_URL = https://siyang.tools/" "$GITEA_CONF"
        fi

        # Restart Gitea
        systemctl restart gitea 2>/dev/null || docker restart gitea 2>/dev/null || true
        echo "  Gitea config updated"
    else
        echo "  WARNING: Could not find Gitea config. Manual update may be needed."
    fi
'

# ============================================================
# 6. Set permissions
# ============================================================
log "Setting file permissions..."
ssh "${SSH_USER}@${SSH_HOST}" '
    chown -R www-data:www-data '"${REMOTE_DIR}"'
    find '"${REMOTE_DIR}"' -type d -exec chmod 755 {} \;
    find '"${REMOTE_DIR}"' -type f -exec chmod 644 {} \;
    echo "  Permissions set"
'

# ============================================================
# 7. Set up webhook listener service
# ============================================================
log "Setting up webhook listener service..."
ssh "${SSH_USER}@${SSH_HOST}" '
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo "  Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
    echo "  Node.js version: $(node --version)"

    # Copy systemd service file
    cp '"${REMOTE_DIR}"'/scripts/siyang-webhook.service /etc/systemd/system/siyang-webhook.service

    # Generate or reuse webhook secret
    SECRET_FILE=/etc/siyang-webhook-secret
    if [ -f "$SECRET_FILE" ]; then
        WEBHOOK_SECRET=$(cat "$SECRET_FILE")
        echo "  Reusing existing WEBHOOK_SECRET"
    else
        WEBHOOK_SECRET=$(openssl rand -hex 32)
        echo "$WEBHOOK_SECRET" > "$SECRET_FILE"
        chmod 600 "$SECRET_FILE"
        echo "  Generated new WEBHOOK_SECRET — save this for Gitea webhook config:"
        echo "  $WEBHOOK_SECRET"
    fi

    # Set webhook secret in systemd service (replace only the Environment line)
    sed -i "s|Environment=WEBHOOK_SECRET=change-me-in-production|Environment=WEBHOOK_SECRET=$WEBHOOK_SECRET|" /etc/systemd/system/siyang-webhook.service

    # Write webhook secret JS file for admin Regenerate Index button
    echo "window.__WEBHOOK_SECRET = '$WEBHOOK_SECRET';" > '"${REMOTE_DIR}"'/admin/webhook-secret.js

    # Enable and start the service
    systemctl daemon-reload
    systemctl enable siyang-webhook
    systemctl restart siyang-webhook
    echo "  Webhook listener started on port 3099"

    # Auto-register Gitea webhook (if API token is available)
    GITEA_API_TOKEN="${GITEA_API_TOKEN:-}"
    GITEA_BASE_URL="https://siyang.tools"
    if [ -n "$GITEA_API_TOKEN" ]; then
        WEBHOOK_URL="https://siyang.tools/gitea"
        GITEA_API="$GITEA_BASE_URL/api/v1/repos/admin/b2b/hooks"
        echo "  Checking Gitea webhook..."
        existing=$(curl -s -H "Authorization: token $GITEA_API_TOKEN" "$GITEA_API" | grep -c "$WEBHOOK_URL" || true)
        if [ "$existing" -eq 0 ]; then
            curl -s -X POST "$GITEA_API" \
                -H "Authorization: token $GITEA_API_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"type\": \"gitea\",
                    \"config\": {
                        \"url\": \"$WEBHOOK_URL\",
                        \"content_type\": \"json\",
                        \"secret\": \"$WEBHOOK_SECRET\"
                    },
                    \"events\": [\"push\"],
                    \"active\": true
                }" > /dev/null
            echo "  Gitea webhook registered: $WEBHOOK_URL"
        else
            echo "  Gitea webhook already exists"
        fi
    else
        echo "  Skipping Gitea webhook auto-registration (set GITEA_API_TOKEN to enable)"
    fi
'

# ============================================================
# 8. Verify deployment
# ============================================================
log "Verifying deployment..."
HTTP_CODE=$(ssh "${SSH_USER}@${SSH_HOST}" "curl -sL -o /dev/null -w '%{http_code}' http://localhost/" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    log "Website is LIVE at http://${SSH_HOST}/"
else
    warn "Website returned HTTP ${HTTP_CODE} — check Nginx logs: ssh ${SSH_USER}@${SSH_HOST} 'tail -20 /var/log/nginx/error.log'"
fi

GIT_CODE=$(ssh "${SSH_USER}@${SSH_HOST}" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/" 2>/dev/null || echo "000")
if [ "$GIT_CODE" = "200" ]; then
    log "Gitea is accessible at http://${SSH_HOST}:3000/"
else
    warn "Gitea returned HTTP ${GIT_CODE}"
fi

echo ""
echo "============================================================"
log "DEPLOYMENT COMPLETE!"
echo "============================================================"
echo ""
echo "  Website:   http://${SSH_HOST}/"
echo "  CMS Admin: http://${SSH_HOST}/admin/"
echo "  Gitea:     http://${SSH_HOST}:3000/"
echo ""
echo "  Next steps:"
echo "  1. Run setup-gitea-roles.sh on the server to create org/teams/users"
echo "  2. Update admin/config.yml app_id if OAuth app was recreated"
echo "  3. Upload WeChat QR image to /var/www/siyang/public/assets/images/wechat-qr.png"
echo "============================================================"
