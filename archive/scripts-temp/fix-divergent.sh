#!/bin/bash
# Fix divergent branches and configure git for clean pulls
set -e

SITE_DIR="/var/www/siyang/public"

echo "=== Current git status ==="
cd "$SITE_DIR"
git status
echo ""
git log --oneline -5
echo ""
echo "=== Remote log ==="
git fetch origin
git log --oneline origin/main -5

echo ""
echo "=== Resetting local branch to match origin/main ==="
# The API push is the source of truth, so we reset to origin/main
git reset --hard origin/main

echo ""
echo "=== Configuring pull strategy ==="
git config pull.rebase true

echo ""
echo "=== Verify current state ==="
git log --oneline -3
echo ""
grep -oP 'decap-cms@\K[0-9.]+' admin/index.html

echo ""
echo "=== Running build to update site ==="
cd "$SITE_DIR"
node scripts/generate-index.js
node scripts/build-html.js

echo ""
echo "=== DONE ==="
