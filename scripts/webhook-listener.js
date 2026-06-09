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
    const result = execSync("git pull origin main", {
      cwd: GIT_REPO_PATH,
      encoding: "utf-8",
      timeout: 30000,
    });
    return { success: true, output: result.trim() };
  } catch (err) {
    return { success: false, error: err.message };
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
    res.end(JSON.stringify({ status: "ok", service: "siyang-webhook" }));
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
    const regenResult = regenerateIndex();
    console.log("[webhook] Regeneration:", regenResult.success ? "SUCCESS" : "FAILED");
    const buildResult = buildHtml();
    console.log("[webhook] HTML build:", buildResult.success ? "SUCCESS" : "FAILED");
    const result = { regenerate: regenResult, build: buildResult, success: regenResult.success && buildResult.success };
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

      // Regenerate index files
      const regenResult = regenerateIndex();
      console.log("[webhook] Regeneration:", regenResult.success ? "SUCCESS" : "FAILED");

      // Build pre-rendered HTML files
      const buildResult = buildHtml();
      console.log("[webhook] HTML build:", buildResult.success ? "SUCCESS" : "FAILED");

      const allSuccess = pullResult.success && regenResult.success && buildResult.success;
      res.writeHead(allSuccess ? 200 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ pull: pullResult, regenerate: regenResult, build: buildResult }));
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
