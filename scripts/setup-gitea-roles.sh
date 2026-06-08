#!/bin/bash
# ============================================================
# Gitea Organization, Teams & Users Setup Script
# For Ningbo Siyang CMS (Decap CMS + Gitea backend)
# ============================================================
# Run this on the Gitea server (165.22.250.66) after deployment.
# Prerequisites: Gitea installed, admin token available.
#
# Usage:
#   chmod +x setup-gitea-roles.sh
#   ./setup-gitea-roles.sh <ADMIN_TOKEN>
# ============================================================

set -euo pipefail

GITEA_URL="http://localhost:3000"
API_URL="${GITEA_URL}/api/v1"
TOKEN="${1:?Usage: $0 <ADMIN_TOKEN>}"
ORG_NAME="siyang-cms"
REPO_NAME="site"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[SETUP]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; }

# ============================================================
# 1. Create Organization
# ============================================================
log "Creating organization: ${ORG_NAME}"

ORG_RESPONSE=$(curl -s -X POST "${API_URL}/orgs" \
  -H "Authorization: token ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'"${ORG_NAME}"'",
    "full_name": "Ningbo Siyang CMS",
    "description": "Content management for the Ningbo Siyang public website",
    "visibility": "private"
  }' 2>/dev/null) || true

if echo "$ORG_RESPONSE" | grep -q '"id"'; then
  log "Organization '${ORG_NAME}' created (ID: $(echo "$ORG_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2))"
elif echo "$ORG_RESPONSE" | grep -q '"message":"organization already exists"'; then
  warn "Organization '${ORG_NAME}' already exists, skipping"
else
  warn "Organization response: $(echo "$ORG_RESPONSE" | head -c 200)"
fi

# ============================================================
# 2. Create Teams with Permissions
# ============================================================
log "Creating teams..."

# --- Admin Team (owner-level: full repo admin, settings, user management) ---
ADMIN_TEAM=$(curl -s -X POST "${API_URL}/orgs/${ORG_NAME}/teams" \
  -H "Authorization: token ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "admin",
    "description": "Full administrative access — can edit all collections including site settings and pages",
    "permission": "admin",
    "units": ["repo.code", "repo.issues", "repo.pulls", "repo.releases"]
  }' 2>/dev/null) || true
log "  Team 'admin' created"

# --- Editor Team (write-level: can edit content, but not settings) ---
EDITOR_TEAM=$(curl -s -X POST "${API_URL}/orgs/${ORG_NAME}/teams" \
  -H "Authorization: token ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "editor",
    "description": "Content editor — can edit products, blog, testimonials, team, distributors, warranty, safety, manuals, downloads",
    "permission": "write",
    "units": ["repo.code", "repo.issues", "repo.pulls", "repo.releases"]
  }' 2>/dev/null) || true
log "  Team 'editor' created"

# --- Translator Team (write-level: can only edit i18n-enabled collections) ---
TRANSLATOR_TEAM=$(curl -s -X POST "${API_URL}/orgs/${ORG_NAME}/teams" \
  -H "Authorization: token ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "translator",
    "description": "Translator — can edit translated content in products, blog, testimonials, team, FAQ, distributors, warranty, safety, downloads",
    "permission": "write",
    "units": ["repo.code", "repo.pulls"]
  }' 2>/dev/null) || true
log "  Team 'translator' created"

# ============================================================
# 3. Create/Migrate Repository under Organization
# ============================================================
log "Ensuring repository ${ORG_NAME}/${REPO_NAME} exists..."

REPO_RESPONSE=$(curl -s "${API_URL}/repos/${ORG_NAME}/${REPO_NAME}" \
  -H "Authorization: token ${TOKEN}" 2>/dev/null) || true

if echo "$REPO_RESPONSE" | grep -q '"id"'; then
  warn "Repository '${ORG_NAME}/${REPO_NAME}' already exists, skipping"
else
  log "Creating repository ${ORG_NAME}/${REPO_NAME}..."
  curl -s -X POST "${API_URL}/orgs/${ORG_NAME}/repos" \
    -H "Authorization: token ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "'"${REPO_NAME}"'",
      "description": "Ningbo Siyang public website — managed via Decap CMS",
      "private": false,
      "auto_init": true,
      "default_branch": "main"
    }' 2>/dev/null > /dev/null
  log "  Repository created"
fi

# ============================================================
# 4. Add Repository to Teams
# ============================================================
log "Adding repository to teams..."

for TEAM_NAME in admin editor translator; do
  curl -s -X PUT "${API_URL}/teams/${TEAM_NAME}/repos/${ORG_NAME}/${REPO_NAME}" \
    -H "Authorization: token ${TOKEN}" 2>/dev/null > /dev/null || true
  log "  Added ${ORG_NAME}/${REPO_NAME} to team '${TEAM_NAME}'"
done

# ============================================================
# 5. Create OAuth2 Application for Decap CMS
# ============================================================
log "Creating OAuth2 application for Decap CMS..."

# Get the admin user ID for the OAuth app
ADMIN_UID=$(curl -s "${API_URL}/user" \
  -H "Authorization: token ${TOKEN}" 2>/dev/null | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

OAUTH_RESPONSE=$(curl -s -X POST "${API_URL}/user/applications/oauth2" \
  -H "Authorization: token ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Decap CMS",
    "redirect_uri": "https://siyang.tools/admin/",
    "confidential_client": false
  }' 2>/dev/null) || true

if echo "$OAUTH_RESPONSE" | grep -q '"client_id"'; then
  CLIENT_ID=$(echo "$OAUTH_RESPONSE" | grep -o '"client_id":"[^"]*"' | head -1 | cut -d'"' -f4)
  CLIENT_SECRET=$(echo "$OAUTH_RESPONSE" | grep -o '"client_secret":"[^"]*"' | head -1 | cut -d'"' -f4)
  log "  OAuth2 app created!"
  log "  Client ID:     ${CLIENT_ID}"
  log "  Client Secret:  ${CLIENT_SECRET}"
  log ""
  log "  >>> Update admin/config.yml with:"
  log "      app_id: ${CLIENT_ID}"
  echo ""
else
  warn "OAuth2 app may already exist or creation failed"
  warn "Response: $(echo "$OAUTH_RESPONSE" | head -c 300)"
fi

# ============================================================
# 6. Create Sample Users
# ============================================================
log "Creating sample users..."

create_user() {
  local USERNAME="$1"
  local EMAIL="$2"
  local FULLNAME="$3"
  local PASSWORD="$4"
  local TEAM="$5"

  log "  Creating user: ${USERNAME}..."
  USER_RESPONSE=$(curl -s -X POST "${API_URL}/admin/users" \
    -H "Authorization: token ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "'"${USERNAME}"'",
      "email": "'"${EMAIL}"'",
      "full_name": "'"${FULLNAME}"'",
      "password": "'"${PASSWORD}"'",
      "must_change_password": true,
      "send_notify": true,
      "visibility": "private"
    }' 2>/dev/null) || true

  if echo "$USER_RESPONSE" | grep -q '"id"'; then
    log "    User '${USERNAME}' created"
  elif echo "$USER_RESPONSE" | grep -q '"message":"user already exists"'; then
    warn "    User '${USERNAME}' already exists, skipping creation"
  else
    warn "    User creation response: $(echo "$USER_RESPONSE" | head -c 200)"
  fi

  # Add user to team
  log "    Adding ${USERNAME} to team '${TEAM}'..."
  curl -s -X PUT "${API_URL}/teams/${TEAM}/members/${USERNAME}" \
    -H "Authorization: token ${TOKEN}" 2>/dev/null > /dev/null || true
  log "    Done"
}

# Admin user
create_user "siyang-admin" "admin@ningbosiyang.com" "Siyang Admin" "Siyang@Admin2026!" "admin"

# Editor user
create_user "siyang-editor" "editor@ningbosiyang.com" "Content Editor" "Siyang@Editor2026!" "editor"

# Translator user
create_user "siyang-translator" "translator@ningbosiyang.com" "Translator" "Siyang@Trans2026!" "translator"

# ============================================================
# 7. Summary
# ============================================================
echo ""
echo "============================================================"
log "SETUP COMPLETE!"
echo "============================================================"
echo ""
echo "Organization:  ${ORG_NAME}"
echo "Repository:    ${ORG_NAME}/${REPO_NAME}"
echo ""
echo "Teams & Roles:"
echo "  admin       — Full access (products, blog, settings, pages, ALL)"
echo "  editor      — Content access (products, blog, team, distributors, etc.)"
echo "  translator  — i18n content only (translations for products, blog, FAQ, etc.)"
echo ""
echo "Users:"
echo "  siyang-admin      → admin team"
echo "  siyang-editor     → editor team"
echo "  siyang-translator  → translator team"
echo ""
echo "All users must change password on first login."
echo ""
echo "CMS Admin Panel: http://165.22.250.66/admin/"
echo "============================================================"
