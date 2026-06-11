#!/bin/bash
# ============================================================
# Manual Deployment Guide for Ningbo Siyang Website
# ============================================================
# SSH access is blocked from the current machine (likely Fail2ban
# or IP whitelist). Run these commands from YOUR terminal where
# you have SSH access.
# ============================================================

SERVER="165.22.250.66"
USER="root"
REMOTE_DIR="/var/www/siyang/public"

echo "============================================================"
echo "  NINGBO SIYANG — MANUAL DEPLOYMENT"
echo "============================================================"
echo ""
echo "Step 1: Upload website files"
echo "  scp -r . ${USER}@${SERVER}:${REMOTE_DIR}/"
echo ""
echo "  OR use rsync (faster, incremental):"
echo "  rsync -avz --exclude='.git' --exclude='node_modules' --exclude='.ai-tasks' --exclude='scripts' ./ ${USER}@${SERVER}:${REMOTE_DIR}/"
echo ""
echo "Step 2: Install Nginx (if not installed)"
echo "  ssh ${USER}@${SERVER} 'apt-get update && apt-get install -y nginx'"
echo ""
echo "Step 3: Upload Nginx config"
echo "  scp scripts/nginx-siyang.conf ${USER}@${SERVER}:/etc/nginx/sites-available/siyang"
echo "  ssh ${USER}@${SERVER} 'ln -sf /etc/nginx/sites-available/siyang /etc/nginx/sites-enabled/siyang'"
echo ""
echo "Step 4: Test and reload Nginx"
echo "  ssh ${USER}@${SERVER} 'nginx -t && systemctl reload nginx'"
echo ""
echo "Step 5: Set permissions"
echo "  ssh ${USER}@${SERVER} 'chown -R www-data:www-data ${REMOTE_DIR} && find ${REMOTE_DIR} -type d -exec chmod 755 {} \\; && find ${REMOTE_DIR} -type f -exec chmod 644 {} \\;'"
echo ""
echo "Step 6: Set up Gitea roles"
echo "  scp scripts/setup-gitea-roles.sh ${USER}@${SERVER}:/tmp/"
echo "  ssh ${USER}@${SERVER} 'bash /tmp/setup-gitea-roles.sh YOUR_GITEA_ADMIN_TOKEN'"
echo ""
echo "Step 7: Verify"
echo "  curl http://${SERVER}/"
echo "  curl http://${SERVER}/admin/"
echo ""
echo "============================================================"
