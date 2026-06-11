@echo off
echo ============================================
echo  Deploy to siyang.tools and push to Gitea
echo ============================================
echo.

REM Step 1: SCP all updated files
echo [1/4] Uploading files via SCP...

scp "content\settings\company.md" root@siyang.tools:/var/www/siyang/public/content/settings/company.md
scp "content\team\ceo.md" root@siyang.tools:/var/www/siyang/public/content/team/ceo.md
scp "content\team\sales-director.md" root@siyang.tools:/var/www/siyang/public/content/team/sales-director.md
scp "images\contact\wechat.jpg" root@siyang.tools:/var/www/siyang/public/images/contact/wechat.jpg
scp "images\contact\whatsApp.png" root@siyang.tools:/var/www/siyang/public/images/contact/whatsApp.png
scp "images\team\myphoto.png" root@siyang.tools:/var/www/siyang/public/images/team/myphoto.png
scp "images\team\romeo.jpg" root@siyang.tools:/var/www/siyang/public/images/team/romeo.jpg
scp "images\factory.jpg" root@siyang.tools:/var/www/siyang/public/images/factory.jpg
scp "images\warehouse.jpg" root@siyang.tools:/var/www/siyang/public/images/warehouse.jpg
scp "images\showroom.jpg" root@siyang.tools:/var/www/siyang/public/images/showroom.jpg
scp "images\quality-lab.jpg" root@siyang.tools:/var/www/siyang/public/images/quality-lab.jpg
scp ".gitignore" root@siyang.tools:/var/www/siyang/public/.gitignore

echo.
echo [2/4] Git add, commit, and push to Gitea...

ssh root@siyang.tools "cd /var/www/siyang/public && git add -A && git status && git commit -m 'Update real contact info, team photos, and business images' && git -c http.extraHeader='Authorization: token 79e684becd5f82163d5b0b6b75ba5593ab0db965' push http://localhost:3000/admin/b2b.git main"

echo.
echo [3/4] Verifying push...

ssh root@siyang.tools "cd /var/www/siyang/public && git log --oneline -3"

echo.
echo [4/4] Fixing permissions...

ssh root@siyang.tools "chown -R www-data:www-data /var/www/siyang/public/"

echo.
echo ============================================
echo  Deployment complete!
echo ============================================
pause
