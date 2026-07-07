// server.js — Express entry point
// Serves static assets from /public and exposes /health for Code Engine probes.

const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8080;

// Trust the Code Engine ingress load balancer so X-Forwarded-For is honoured.
// '1' means trust exactly one upstream proxy (the Code Engine ingress).
app.set('trust proxy', 1);

// ── Cookie parser (no external dep — parse manually) ─────────────────────────
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(pair => {
    const [key, ...rest] = pair.trim().split('=');
    if (key) cookies[key.trim()] = decodeURIComponent(rest.join('=').trim());
  });
  return cookies;
}

// ── Visitor-ID middleware ─────────────────────────────────────────────────────
// Assigns a persistent visitor_id cookie on first visit (180-day TTL).
// The same ID is reused on subsequent requests from the same browser.
app.use((req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  let visitorId = cookies['vid'];

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    // HttpOnly keeps JS from reading it; SameSite=Lax is safe for navigations
    res.setHeader(
      'Set-Cookie',
      `vid=${visitorId}; Max-Age=${60 * 60 * 24 * 180}; Path=/; HttpOnly; SameSite=Lax`
    );
  }

  req.visitorId = visitorId;
  next();
});

// ── JSON request logger ───────────────────────────────────────────────────────
// Emits one structured JSON line per request to stdout so IBM Cloud Logs
// can parse and index every field, including visitor_id for Count Distinct.
app.use((req, res, next) => {
  const startMs = Date.now();

  res.on('finish', () => {
    // Skip health-check noise in logs
    if (req.path === '/health') return;

    const elapsedMs = Date.now() - startMs;
    // x-envoy-external-address is the cleanest single external IP in Code Engine
    // x-forwarded-for is the fallback (first entry), then socket IP as last resort
    const clientIp =
      req.headers['x-envoy-external-address'] ||
      (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim()) ||
      req.socket.remoteAddress;

    const log = {
      timestamp: new Date().toISOString(),
      visitor_id: req.visitorId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: elapsedMs,
      duration_seconds: parseFloat((elapsedMs / 1000).toFixed(3)),
      client_ip: clientIp,
      referrer: req.headers['referer'] || null,
      user_agent: req.headers['user-agent'] || null,
    };

    process.stdout.write(JSON.stringify(log) + '\n');
  });

  next();
});

// ── Health check — required by IBM Cloud Code Engine ─────────────────────────
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve all frontend assets from /public
app.use(express.static(path.join(__dirname, 'public')));

// Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Report page
app.get('/report', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'report.html'));
});

// Workshop page
app.get('/workshop', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'workshop.html'));
});

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), event: 'server_start', port: PORT }));
});
