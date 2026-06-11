# Grav CMS Installation Guide
## Ningbo Siyang Power Tools — Migration from Decap CMS to Grav

### Prerequisites

You need SSH access to your DigitalOcean Droplet (165.22.250.66).

---

### Step 1: Install PHP 8.2+ and extensions

```bash
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-curl php8.2-dom php8.2-gd php8.2-json php8.2-mbstring php8.2-xml php8.2-zip php8.2-opcache
sudo systemctl enable php8.2-fpm
sudo systemctl start php8.2-fpm
```

Verify: `php -v` shows 8.2+

---

### Step 2: Install Composer

```bash
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
php -r "unlink('composer-setup.php');"
```

Verify: `composer --version`

---

### Step 3: Backup the old site

```bash
sudo mv /var/www/siyang /var/www/siyang-DECAP-BACKUP
```

---

### Step 4: Install Grav

```bash
cd /var/www
composer create-project getgrav/grav siyang
cd siyang
```

Verify: `ls index.php` shows the file exists.

---

### Step 5: Install Admin Plugin

```bash
cd /var/www/siyang
bin/gpm install admin
```

---

### Step 6: Set permissions

```bash
cd /var/www/siyang
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
sudo chmod -R 775 user/data user/config user/accounts user/pages cache logs
```

---

### Step 7: Copy the Siyang theme and content

Upload the `_grav-export/` directory from this project to the server, then:

```bash
# Copy theme
cp -r /path/to/_grav-export/user/themes/siyang /var/www/siyang/user/themes/

# Copy content pages
cp -r /path/to/_grav-export/user/pages/* /var/www/siyang/user/pages/

# Copy configuration
cp /path/to/_grav-export/user/config/site.yaml /var/www/siyang/user/config/
cp /path/to/_grav-export/user/config/system.yaml /var/www/siyang/user/config/

# Copy images (if not already in theme)
# Product images should go to: user/themes/siyang/images/
```

---

### Step 8: Run the content migration script (optional)

If you want to migrate the existing content from the old CMS:

```bash
cd /var/www/siyang
# Copy the migration script
cp /path/to/_grav-export/migrate-content.js ./

# Install js-yaml dependency
npm install js-yaml

# Run migration (points at old content/ directory)
node migrate-content.js
```

---

### Step 9: Create admin user

```bash
cd /var/www/siyang
bin/plugin login newuser \
  --user=siyang-admin \
  --password=YOUR-STRONG-PASSWORD \
  --email=sales@ningbosiyang.com \
  --fullname="Ningbo Siyang Admin" \
  --state=enabled
```

---

### Step 10: Update Nginx config

```bash
# Stop the old webhook listener
sudo systemctl stop siyang-webhook
sudo systemctl disable siyang-webhook

# Replace Nginx config
sudo cp /path/to/_grav-export/nginx/siyang-grav.conf /etc/nginx/sites-available/siyang

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

### Step 11: Enable the Siyang theme

1. Go to https://siyang.tools/admin
2. Login with your admin credentials
3. Go to Themes → Siyang → Activate

---

### Step 12: Verify the site

Visit https://siyang.tools — you should see the homepage with:
- Hero slider
- Trust badges
- Featured products
- Category grid
- B2B benefits
- Stats section
- Testimonials
- Product selector wizard
- Footer

Then check:
- /products — product listing
- /products/drills-drivers/SY-DD-20V-BL — product detail
- /blog — blog listing
- /blog/choosing-the-right-power-drill — blog post
- /about/oem-odm — OEM/ODM page
- /about/faq — FAQ page
- /contact — contact page
- /admin — CMS admin panel

---

### Troubleshooting

**Site shows 500 error:**
```bash
sudo chown -R www-data:www-data /var/www/siyang
sudo chmod -R 775 /var/www/siyang/user/data
sudo chmod -R 775 /var/www/siyang/cache
sudo chmod -R 775 /var/www/siyang/logs
```

**Admin shows 404:**
```bash
cd /var/www/siyang
bin/gpm install admin  # reinstall
```

**Theme not showing:**
```bash
ls /var/www/siyang/user/themes/siyang/  # verify files exist
```

**Images broken:**
```bash
# Image paths in .md files should be like: istock/10001.jpg
# These resolve to: user/themes/siyang/images/istock/10001.jpg
ls /var/www/siyang/user/themes/siyang/images/istock/
```

**PHP memory limit:**
Edit `/etc/php/8.2/fpm/php.ini`:
```
memory_limit = 256M
upload_max_filesize = 256M
post_max_size = 256M
```
Then: `sudo systemctl restart php8.2-fpm`

---

### What was removed

- Gitea git server (no longer needed)
- Decap CMS admin panel (replaced by Grav Admin)
- webhook-listener.js (no longer needed)
- generate-index.js (replaced by Grav's native page system)
- build-html.js (replaced by Twig templates)
- cms-loader.js (replaced by Grav's content loading)
- All 258 duplicated HTML files (replaced by ~15 Twig templates)
- All .json product files (replaced by .md files with Grav frontmatter)
- sync-status.js (content is live — no sync needed)
