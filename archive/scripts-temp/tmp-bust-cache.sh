#!/bin/bash
# Update index.html to bust CSS cache
sed -i 's|cms-theme.css"|cms-theme.css?v=4"|g' /var/www/siyang/public/admin/index.html
grep cms-theme /var/www/siyang/public/admin/index.html
