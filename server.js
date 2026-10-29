/**
 * Production server (Railway).
 *
 * Serves the built SPA from dist/ and proxies /api/unsplash/* to Unsplash with
 * the access key attached. The key only ever exists in this server process
 * (a Railway service variable), never in the client bundle — which is the whole
 * reason the browser talks to this path instead of api.unsplash.com directly.
 *
 * Run locally with: UNSPLASH_ACCESS_KEY=... npm run build && npm start
 */
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DIST_DIR = resolve(fileURLToPath(new URL("./dist", import.meta.url)));
const PORT = Number(process.env.PORT ?? 8080);
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY ?? "";
const UNSPLASH_API = "https://api.unsplash.com";
const PROXY_PREFIX = "/api/unsplash";
const UPSTREAM_TIMEOUT_MS = 10_000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

async function proxyUnsplash(req, res, url) {
  if (!UNSPLASH_ACCESS_KEY) {
    sendJson(res, 503, { error: "UNSPLASH_ACCESS_KEY is not configured" });
    return;
  }

  // Only the photo endpoints this app uses, so this cannot act as an open proxy.
  const upstreamPath = url.pathname.slice(PROXY_PREFIX.length);
  if (!upstreamPath.startsWith("/photos/")) {
    sendJson(res, 404, { error: "Unknown Unsplash endpoint" });
    return;
  }

  try {
    const upstream = await fetch(`${UNSPLASH_API}${upstreamPath}${url.search}`, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    const payload = Buffer.from(await upstream.arrayBuffer());
    res.writeHead(upstream.status, {
      "content-type": upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(payload);
  } catch (error) {
    console.error("Unsplash proxy failed:", error instanceof Error ? error.message : error);
    sendJson(res, 502, { error: "Unsplash request failed" });
  }
}

function resolveWithinDist(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const candidate = normalize(join(DIST_DIR, decoded));
  if (candidate !== DIST_DIR && !candidate.startsWith(DIST_DIR + sep)) return null;
  return candidate;
}

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function streamFile(req, res, filePath, pathname) {
  const info = await stat(filePath).catch(() => null);

  const headers = {
    "content-type": MIME_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream",
    // Vite fingerprints filenames in /assets, so they are safe to cache forever.
    "cache-control": pathname.startsWith("/assets/")
      ? "public, max-age=31536000, immutable"
      : "no-cache",
  };

  // Link unfurlers (Slack, iMessage, Discord) fetch the preview image and are
  // happier with a declared length than a chunked body; HEAD also gets one.
  if (info) {
    headers["content-length"] = String(info.size);
    headers["last-modified"] = info.mtime.toUTCString();
  }

  res.writeHead(200, headers);

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  createReadStream(filePath)
    .on("error", () => res.destroy())
    .pipe(res);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (url.pathname === PROXY_PREFIX || url.pathname.startsWith(`${PROXY_PREFIX}/`)) {
    await proxyUnsplash(req, res, url);
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { allow: "GET, HEAD" });
    res.end();
    return;
  }

  const requested = resolveWithinDist(url.pathname);
  if (requested && (await isFile(requested)) && !requested.endsWith(sep)) {
    await streamFile(req, res, requested, url.pathname);
    return;
  }

  // Missing files 404 instead of silently returning the app shell, so a broken
  // asset reference is visible rather than masked as HTML.
  if (extname(url.pathname)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const indexHtml = join(DIST_DIR, "index.html");
  if (await isFile(indexHtml)) {
    await streamFile(req, res, indexHtml, url.pathname);
    return;
  }

  res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
  res.end("dist/index.html is missing — run `npm run build` before starting the server.");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Pixa Machine listening on :${PORT} — Unsplash key ${UNSPLASH_ACCESS_KEY ? "configured" : "NOT configured"}`
  );
});
