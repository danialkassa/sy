# Project Context

## Project Type
- Pure HTML frontend website — NO backend, NO server-side processing
- All forms use mailto: links (no /api/ endpoints)

## Hosting
- Digital Ocean Droplet IP: 165.22.250.66
- CMS Backend: Gitea (self-hosted on same droplet, running in Docker)
- CMS Auth: Gitea OAuth (client_id: b44bfe8b-1633-41ee-9533-738e78b392a0)
- Gitea Admin: admin / Siyang2026!
- Repository: admin/site (created in Gitea)
- Nginx: Proxies port 80 to Gitea port 3000
- Media: repo-based with max_file_size 2MB (Spaces S3 config commented out)
- Auto-deploy: NOT YET SET UP (webhook listener not configured)
- SSH: BLOCKED by user's corporate VPN — use DigitalOcean Console instead
- No Netlify Identity — removed
- No GitHub — all self-hosted

## Design System
- Dark theme: zinc-950 (#09090b) background
- Accent: yellow-400 (#facc15)
- Text hierarchy: white / zinc-400 / zinc-500
- Cards: zinc-800/zinc-900 with zinc-700 borders
- Fonts: Oswald (headings), Source Sans 3 (body)
- Animation: Anime.js only (GSAP removed — was conflicting)

## File Structure
- 20 HTML pages across root, products/, blogs/, about/, admin/
- 1 CSS file: assets/css/styles.css
- 4 JS files: main.js, animations.js, cms-loader.js, quote-cart.js
- CMS: admin/index.html + admin/config.yml
- Content: content/blog/, content/products/, content/pages/, content/settings/

## Key Business Rules
- Target users: non-technical business owners who edit via Decap CMS
- B2B power tools company based in Ningbo, China
- 6 UN languages planned: en, ar, zh, fr, ru, es
- Quote cart uses mailto (no backend)
- Copyright: 2026 Ningbo Siyang Power Tools Co., Ltd.

## Current CMS Collections
- blog (folder collection, 3 posts)
- products (folder collection, 1 product)
- pages (file collection: homepage, company)
- settings (file collection: navigation, footer)

## Infrastructure
- scripts/generate-index.js — auto-generates index.json from markdown files
- docs/DIGITALOCEAN-DEPLOY.md — full deployment guide (Gitea, OAuth, webhooks, Nginx)
- admin/index.html — includes preview templates for products and blog
- admin/config.yml — Gitea backend with real droplet IP and OAuth app_id

## Important Notes
- Website files are still LOCAL ONLY — not yet pushed to Gitea or deployed to Nginx
- The Nginx config currently proxies ALL traffic to Gitea (not serving static files yet)
- Website deployment should happen BEFORE or alongside Phase 2.1
