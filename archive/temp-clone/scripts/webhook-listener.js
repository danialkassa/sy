import http from "http";
import { execSync } from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// ============================================================
// Configuration
// ============================================================

const PORT = process.env.WEBHOOK_PORT || 3099;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "change-me-in-production";
const GIT_REPO_PATH = process.env.GIT_REPO_PATH || projectRoot;

let lastDeploy = {
  timestamp: null,
  status: null,
  steps: {},
  error: null
};

function recordDeploy(pullResult, npmResult, regenResult, buildResult) {
  lastDeploy.timestamp = new Date().toISOString();
  lastDeploy.steps.gitPull = pullResult.success ? "success" : "failed";
  lastDeploy.steps.npmInstall = npmResult ? (npmResult.success ? "success" : "failed") : "skipped";
  lastDeploy.steps.generateIndex = regenResult.success ? "success" : "failed";
  lastDeploy.steps.buildHtml = buildResult.success ? "success" : "failed";
  lastDeploy.status = (pullResult.success && regenResult.success && buildResult.success) ? "success" : "failed";
  lastDeploy.error = pullResult.error || (npmResult && npmResult.error) || regenResult.error || buildResult.error || null;
}

// ============================================================
// Regenerate index files
// ============================================================

function regenerateIndex() {
  try {
    const result = execSync(`node "${path.join(__dirname, "generate-index.js")}"`, {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 30000,
    });
    return { success: true, output: result.trim() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function npmInstall() {
  try {
    const result = execSync("npm install --production", {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 60000,
    });
    return { success: true, output: result.trim() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function buildHtml() {
  try {
    const result = execSync(`node "${path.join(__dirname, "build-html.js")}"`, {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 60000,
    });
    return { success: true, output: result.trim() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ============================================================
// Git pull (if deployed on server)
// ============================================================

function gitPull() {
  try {
    // Discard any local changes (generated HTML/JSON files) before pulling
    // These are regenerated after pull, so it's safe to discard them
    try {
      execSync("git checkout -- .", { cwd: GIT_REPO_PATH, encoding: "utf-8", timeout: 10000 });
    } catch (e) {
      // If checkout fails, try harder reset
      try {
        execSync("git reset --hard HEAD", { cwd: GIT_REPO_PATH, encoding: "utf-8", timeout: 10000 });
      } catch (e2) { /* ignore */ }
    }
    // Clean untracked files (like backup files)
    try {
      execSync("git clean -fd", { cwd: GIT_REPO_PATH, encoding: "utf-8", timeout: 10000 });
    } catch (e) { /* ignore */ }

    // Now pull with rebase
    const result = execSync("git pull --rebase origin main", {
      cwd: GIT_REPO_PATH,
      encoding: "utf-8",
      timeout: 30000,
    });

    // Fix file ownership after git operations (git creates files as root)
    try {
      execSync("chown -R www-data:www-data .", { cwd: GIT_REPO_PATH, encoding: "utf-8", timeout: 10000 });
    } catch (e) { /* ignore - may not be needed on all systems */ }

    return { success: true, output: result.trim() };
  } catch (err) {
    // If rebase still fails, force reset to origin/main
    console.error("[webhook] git pull --rebase failed, resetting to origin/main:", err.message);
    try {
      execSync("git fetch origin main", { cwd: GIT_REPO_PATH, encoding: "utf-8", timeout: 15000 });
      execSync("git reset --hard origin/main", { cwd: GIT_REPO_PATH, encoding: "utf-8", timeout: 15000 });
      // Fix ownership after reset
      try {
        execSync("chown -R www-data:www-data .", { cwd: GIT_REPO_PATH, encoding: "utf-8", timeout: 10000 });
      } catch (e) { /* ignore */ }
      return { success: true, output: "reset to origin/main after rebase failure" };
    } catch (resetErr) {
      return { success: false, error: `pull failed: ${err.message}; reset failed: ${resetErr.message}` };
    }
  }
}

// ============================================================
// Verify Gitea webhook signature
// ============================================================

function verifySignature(payload, signature) {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// ============================================================
// HTTP Server
// ============================================================

const server = http.createServer((req, res) => {
  // Health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "ok",
      service: "siyang-webhook",
      lastDeploy: lastDeploy.timestamp ? {
        timestamp: lastDeploy.timestamp,
        status: lastDeploy.status,
        steps: lastDeploy.steps,
        error: lastDeploy.error
      } : null
    }));
    return;
  }

  // Manual trigger (requires admin session or secret)
  if (req.method === "POST" && req.url === "/regenerate") {
    // Verify authorization: either shared secret header or localhost
    const authHeader = req.headers["authorization"] || "";
    // Use x-real-ip (set by Nginx from $remote_addr) — can't be spoofed by client
    // x-forwarded-for is checked second as it can be spoofed
    const clientIp = req.headers["x-real-ip"] || req.socket.remoteAddress || "";
    const isLocal = clientIp === "127.0.0.1" || clientIp === "::1" || clientIp === "::ffff:127.0.0.1";
    const hasSecret = authHeader === `Bearer ${WEBHOOK_SECRET}`;
    const secretIsDefault = !WEBHOOK_SECRET || WEBHOOK_SECRET === "change-me-in-production";
    const referer = req.headers["referer"] || "";
    const isSameOrigin = referer.startsWith("https://siyang.tools") || referer.startsWith("http://localhost");

    if (!isLocal && !hasSecret && !(secretIsDefault && isSameOrigin)) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forbidden" }));
      return;
    }

    console.log("[webhook] Manual regenerate triggered");
    const pullResult = { success: true, output: "manual trigger — no git pull" };
    const npmResult = npmInstall();
    console.log("[webhook] npm install:", npmResult.success ? "SUCCESS" : "FAILED");
    const regenResult = regenerateIndex();
    console.log("[webhook] Regeneration:", regenResult.success ? "SUCCESS" : "FAILED");
    const buildResult = buildHtml();
    console.log("[webhook] HTML build:", buildResult.success ? "SUCCESS" : "FAILED");
    recordDeploy(pullResult, npmResult, regenResult, buildResult);
    const result = { npm: npmResult, regenerate: regenResult, build: buildResult, success: npmResult.success && regenResult.success && buildResult.success };
    res.writeHead(result.success ? 200 : 500, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
    return;
  }

  // Gitea webhook
  if (req.method === "POST" && req.url === "/gitea") {
    const chunks = [];
    req.on("data", (chunk) => { chunks.push(chunk); });
    req.on("end", () => {
      const payload = Buffer.concat(chunks);
      const signature = req.headers["x-gitea-signature"] || req.headers["x-hub-signature-256"] || "";

      // Parse payload to check branch
      let body = {};
      try { body = JSON.parse(payload.toString()); } catch(e) {}
      const ref = body.ref || "";
      if (!ref.endsWith("/main") && !ref.endsWith("/master")) {
        console.log("[webhook] Ignoring push to", ref, "— only processing main branch");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Ignored — not main branch", ref }));
        return;
      }

      // Verify signature (skip if secret is default)
      if (WEBHOOK_SECRET !== "change-me-in-production") {
        if (!verifySignature(payload, signature.replace("sha256=", ""))) {
          console.log("[webhook] Invalid signature — rejected");
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid signature" }));
          return;
        }
      }

      console.log("[webhook] Gitea push received — pulling and regenerating");

      // Pull latest changes
      const pullResult = gitPull();
      if (!pullResult.success) {
        console.error("[webhook] Git pull failed:", pullResult.error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "git pull failed", details: pullResult.error, output: pullResult.output }));
        return;
      }
      console.log("[webhook] Git pull:", pullResult.output);

      // Install dependencies
      const npmResult = npmInstall();
      console.log("[webhook] npm install:", npmResult.success ? "SUCCESS" : "FAILED");

      // Regenerate index files
      const regenResult = regenerateIndex();
      console.log("[webhook] Regeneration:", regenResult.success ? "SUCCESS" : "FAILED");

      // Build pre-rendered HTML files
      const buildResult = buildHtml();
      console.log("[webhook] HTML build:", buildResult.success ? "SUCCESS" : "FAILED");

      recordDeploy(pullResult, npmResult, regenResult, buildResult);
      const allSuccess = pullResult.success && npmResult.success && regenResult.success && buildResult.success;
      res.writeHead(allSuccess ? 200 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ pull: pullResult, npm: npmResult, regenerate: regenResult, build: buildResult }));
    });
    return;
  }

  // 404 for everything else
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Siyang Webhook Listener running on port ${PORT}`);
  console.log(`  GET  /health       — health check`);
  console.log(`  POST /regenerate   — manual regenerate (Bearer token or localhost)`);
  console.log(`  POST /gitea        — Gitea webhook (signature verified)`);
  console.log(`  Repo: ${GIT_REPO_PATH}`);
});
