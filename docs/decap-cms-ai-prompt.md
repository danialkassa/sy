---
title: Decap CMS — AI Implementation Prompt
created: 2026-06-01
---

Complete prompt for another AI to configure Decap CMS (Netlify CMS) for a local repo hosted on DigitalOcean
--------------------------------------------------------------------------------

You are an expert DevOps + frontend engineer with experience configuring Decap CMS (Netlify CMS), self-hosted Git services, and static-site deployments on DigitalOcean. The repo is local and the site is hosted on a DigitalOcean Droplet (no GitHub/GitLab account). Your goal: make Decap CMS fully functional for this site without breaking existing content. Work non-destructively, commit changes to the local repo, and provide commands the human can run on their Droplet or local machine. Produce code, config changes, and step-by-step deployment/run instructions.

Environment & constraints (assume these unless you ask otherwise):
- Site root (repo) contains `admin/`, `content/`, `images/`, `assets/` (as in the workspace). Key files: `admin/config.yml`, `admin/index.html`, `assets/js/cms-loader.js`, `content/*`, `content/products/index.json`, `content/blog/index.json`.
- Hosting: DigitalOcean Droplet (SSH access available).
- Storage: DigitalOcean Spaces available (preferred for media) OR repo-based uploads if Spaces not available.
- No external Git provider (GitHub/GitLab) — set up a self-hosted Git service on the Droplet (Gitea recommended) so Decap CMS can commit to a repo via OAuth.
- All edits must be safe and reversible; create branches or new files where appropriate and include exact commands to test locally and on the Droplet.

Deliverables
1. Infrastructure tasks (server-side) — commands and exact config files:
   - Install and configure Gitea on the Droplet, create a repo for the site, and push the local repo to that Gitea remote.
   - Create an OAuth application in Gitea for Decap CMS and produce client_id / client_secret.
   - Optionally (preferred): Provision DigitalOcean Spaces and an access key/secret, and create a Space bucket `site-media` for CMS uploads.
   - Provide a small webhook listener or deploy script on the Droplet that:
     - On push/merge to `main` (or configured branch), pulls the repo and copies generated site files to the web root (or runs a build script if needed).
     - Include instructions to register repo webhook in Gitea to call this listener.
   - Provide systemd unit or simple `nginx` + `supervisor` instructions to run the webhook listener or deploy script securely.

2. CMS configuration edits to make `admin/` functional:
   - Update `admin/config.yml` backend to use Gitea OAuth. Provide the exact `backend:` block example and explain any required fields. Example:
     backend:
       name: github
       repo: your/repo
       branch: main
     (But for self-hosted Gitea, use the `git-gateway` or `gitlab`-style config compatible with Decap — implement `backend: {name: git, repo: <ssh-or-http-url>, branch: main}` if necessary.) Provide the actual block that works with Decap and Gitea (or explain the adapter to use).
   - Configure the media library to use DigitalOcean Spaces via an S3-compatible adapter OR keep `media_folder: "images/uploads"` if the user prefers repo uploads. Provide both options with exact config snippets for `admin/config.yml`.
   - Add a secure auth backend (OAuth) configuration in `admin/index.html` as needed (Decap init snippet with `config` pointing to `admin/config.yml` and OAuth redirect settings).
   - Register preview templates in `admin/index.html` that mirror `assets/js/cms-loader.js` rendering for `blog`, `products`, and `pages`. Provide sample JS to register preview templates that load the same rendering logic (or a minimal preview that uses `CMSLoader.parseMarkdown` and frontmatter).

3. Frontend changes / helper scripts:
   - Add or update a Node.js script `scripts/generate-index.js` that:
     - Reads `content/blog/*.md` and `content/products/*.md` and produces updated `content/blog/index.json` and `content/products/index.json` accordingly.
     - Run this script automatically on content commits by adding a Git hook (server-side hook in Gitea repo, or a small CI/deploy step).
     - Provide the exact `generate-index.js` file content and one-line commands to run it.
   - If `about/`, `contact.html`, `terms.html` etc. should become editable, provide a safe migration plan:
     - Create `content/pages/*.md` files with frontmatter fields mapping to current content, do not delete original HTML yet. Show example `content/pages/company.md` and template rendering instructions.

4. Security & workflows:
   - Configure OAuth flow for editors to log in to Decap using Gitea OAuth app.
   - Recommend PR vs direct commit workflow; implement PR flow by default (Decap should create PRs on content edit) and provide exact config to enable PR workflow.
   - If using repo-based media uploads, warn about repo bloat and provide a small script to sync large files to Spaces instead.

5. Tests & verification:
   - Steps to test locally:
     - How to run a local static server to open `admin/index.html` and simulate login flow (or test in a browser after Gitea OAuth created).
     - Test uploading an image from the admin, creating a draft blog post, and ensuring a commit or PR appears in Gitea.
     - Test that `blogs/index.html` and `products/index.html` render updated content after generating `index.json`.
   - Steps to test on the Droplet (commands to run with `ssh`).

6. Output expectations:
   - Provide the precise file diffs/patches for changes to `admin/config.yml`, `admin/index.html` (preview registration), `scripts/generate-index.js`, and any helper system files (webhook, systemd unit).
   - Provide exact shell commands to run on local machine and Droplet (e.g., install Gitea, create repo, push, configure Space, create OAuth app, create webhooks).
   - Provide commit messages for each change (e.g., "chore(admin): configure Gitea backend and Spaces media", "feat(scripts): add generate-index script and hook").

7. Constraints for the AI doing the work:
   - Do not delete or overwrite existing content files; create new files or add safe edits. If replacing a file, create a backup file with `.bak` suffix.
   - If the chosen approach introduces secrets (OAuth client secret, Spaces credentials), do not commit secrets to the repo. Instead, write instructions and show where to store them (Droplet environment variables, `.env` excluded via `.gitignore`).
   - Provide rollback instructions and how to remove the changes.

Concrete commands & examples the AI must produce (sample list to include in the result):
- Gitea install (on Ubuntu) example commands:
```bash
# on Droplet
sudo apt update
sudo apt install -y git sqlite3 nginx
wget -O /tmp/gitea https://dl.gitea.io/gitea/latest/gitea-1.XX.X-linux-amd64
sudo mv /tmp/gitea /usr/local/bin/gitea
sudo chmod +x /usr/local/bin/gitea
# create user, folders, systemd unit, start service (include full commands in your output)
```
- DigitalOcean Spaces S3 config snippet for `admin/config.yml` media library (example using `s3` adapter):
```yaml
media_folder: "images/uploads"
public_folder: "/images/uploads"
media_library:
  name: s3
  config:
    endpoint: "nyc3.digitaloceanspaces.com"
    region: "us-east-1"
    bucket: "my-space-name"
    accessKeyId: "DO_SPACES_KEY"    # instruct to use env var instead of plain text
    secretAccessKey: "DO_SPACES_SECRET"
    acl: "public-read"
```
- Example `admin/config.yml` `backend` block for self-hosted Gitea (show either `git` or `git-gateway` pattern that works with Decap — include fallback instructions to use `test-repo` for local-only testing):
```yaml
backend:
  name: git
  repo: "ssh://git@my-droplet-ip:/home/git/repos/site.git"
  branch: "main"
```
Or, if OAuth via Gitea is needed, show `backend: { name: git-gateway, ... }` and how to configure Git Gateway if installed.

- Example `generate-index.js` (Node.js script) that you must create and include in the patch.

- Example preview registration to add to `admin/index.html`:
```html
<script>
  Decap.registerPreviewTemplate('blog', function(entry, widgetFor) {
    const data = entry.toJS().data;
    document.getElementById('preview-root').innerHTML = /* build preview HTML using data and Decap's markdown parser */;
  });
</script>
```

Final instruction to the AI you:
- Produce a single patch (diff) or list of file changes I can apply to my repo. For server-side installs and secrets, produce step-by-step commands and exact places to copy secrets (ENV variables, not committed). Run the `generate-index.js` locally and verify that `content/blog/index.json` and `content/products/index.json` are correct. Provide the test steps and expected results. If any step requires human input (OAuth app creation, Spaces key), pause and print the exact form fields to fill and where to paste values.

Finish by summarizing the minimal set of changes you would apply automatically (files changed) and a one-paragraph rollback plan.

