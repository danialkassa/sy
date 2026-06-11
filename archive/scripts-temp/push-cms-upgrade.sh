#!/bin/bash
cd /var/www/siyang/public
git add admin/index.html
git config user.email "admin@siyang.tools"
git config user.name "Admin"
git commit -m "Upgrade Decap CMS from v3.3.3 to v3.8.4 - fixes DRAFT_MEDIA_FILES bug"
git push origin main
echo "Pushed CMS upgrade to Gitea"
