#!/bin/bash
# ============================================================================
# Ningbo Siyang — Grav CMS Deployment Script
# Run on DigitalOcean Droplet (165.22.250.66) as root or sudo user
# ============================================================================
set -e

GRAV_DIR="/var/www/siyang"
EXPORT_DIR="/root/siyang-grav-export"
DOMAIN="siyang.tools"
ADMIN_USER="siyang-admin"
ADMIN_PASS=$(openssl rand -base64 16)
ADMIN_EMAIL="sales@ningbosiyang.com"

echo "=== Siyang Grav CMS Deployment ==="
echo ""

# Step 1: Install PHP + extensions
echo "[1/8] Installing PHP 8.2..."
apt-get update -qq
apt-get install -y -qq php8.2 php8.2-fpm php8.2-cli php8.2-curl php8.2-dom php8.2-gd php8.2-json php8.2-mbstring php8.2-xml php8.2-zip php8.2-opcache nginx certbot python3-certbot-nginx
systemctl enable php8.2-fpm
systemctl start php8.2-fpm
echo "  PHP: $(php -v | head -1)"

# Step 2: Install Composer
echo "[2/8] Installing Composer..."
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php --install-dir=/usr/local/bin --filename=composer --quiet
php -r "unlink('composer-setup.php');"
echo "  Composer: $(composer --version)"

# Step 3: Backup old site
echo "[3/8] Backing up old site..."
if [ -d "$GRAV_DIR" ]; then
    mv "$GRAV_DIR" "${GRAV_DIR}-backup-$(date +%Y%m%d-%H%M%S)"
fi

# Step 4: Install Grav
echo "[4/8] Installing Grav CMS..."
cd /var/www
composer create-project getgrav/grav siyang --quiet
cd "$GRAV_DIR"
echo "  Grav installed at $GRAV_DIR"

# Step 5: Install Admin plugin
echo "[5/8] Installing Admin plugin..."
bin/gpm install admin --quiet
echo "  Admin plugin installed"

# Step 6: Deploy Siyang theme + content
echo "[6/8] Deploying Siyang theme and content..."
if [ ! -d "$EXPORT_DIR" ]; then
    echo "  ERROR: Export directory not found at $EXPORT_DIR"
    echo "  Upload _grav-export/ to /root/siyang-grav-export/ first"
    exit 1
fi

# Copy theme
cp -r "$EXPORT_DIR/user/themes/siyang" "$GRAV_DIR/user/themes/"

# Copy content pages
cp -r "$EXPORT_DIR/user/pages/"* "$GRAV_DIR/user/pages/"

# Copy config
cp "$EXPORT_DIR/user/config/site.yaml" "$GRAV_DIR/user/config/"
cp "$EXPORT_DIR/user/config/system.yaml" "$GRAV_DIR/user/config/"

# Copy SEO files to web root
cp "$EXPORT_DIR/robots.txt" "$GRAV_DIR/" 2>/dev/null || true
cp "$EXPORT_DIR/sitemap.xml" "$GRAV_DIR/" 2>/dev/null || true
cp "$EXPORT_DIR/manifest.json" "$GRAV_DIR/" 2>/dev/null || true

echo "  Theme, content, and config deployed"

# Step 7: Set permissions
echo "[7/8] Setting permissions..."
chown -R www-data:www-data "$GRAV_DIR"
chmod -R 755 "$GRAV_DIR"
chmod -R 775 "$GRAV_DIR/user/data" "$GRAV_DIR/user/config" "$GRAV_DIR/user/accounts" "$GRAV_DIR/user/pages" "$GRAV_DIR/cache" "$GRAV_DIR/logs" "$GRAV_DIR/images"
echo "  Permissions set"

# Step 8: Create admin user
echo "[8/8] Creating admin user..."
cd "$GRAV_DIR"
bin/plugin login newuser \
    --user="$ADMIN_USER" \
    --password="$ADMIN_PASS" \
    --email="$ADMIN_EMAIL" \
    --fullname="Ningbo Siyang Admin" \
    --state=enabled 2>/dev/null

echo ""
echo "============================================"
echo "  DEPLOYMENT COMPLETE"
echo "============================================"
echo ""
echo "  Admin URL:  https://$DOMAIN/admin"
echo "  Username:   $ADMIN_USER"
echo "  Password:   $ADMIN_PASS"
echo ""
echo "  Store these credentials securely!"
echo ""
echo "============================================"
echo ""
echo "  NEXT STEPS:"
echo "  1. Update Nginx config:"
echo "     cp $EXPORT_DIR/nginx/siyang-grav.conf /etc/nginx/sites-available/siyang"
echo "     nginx -t && systemctl reload nginx"
echo ""
echo "  2. Stop old webhook listener:"
echo "     systemctl stop siyang-webhook"
echo "     systemctl disable siyang-webhook"
echo ""
echo "  3. Visit https://$DOMAIN/admin and activate the Siyang theme"
echo "     Themes → Siyang → Activate"
echo ""
echo "  4. Visit https://$DOMAIN to verify the site"
echo ""
