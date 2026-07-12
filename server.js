// server.js — Express entry point
// Serves static assets from /public and exposes /health for Code Engine probes.

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

// ── IP Geolocation ────────────────────────────────────────────────────────────
// Looks up an IP via ip-api.com (free tier: 45 req/min).
// Returns an object with geo fields, or null if the IP is private/unroutable.
const PRIVATE_IP_RE = /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1$|fc|fd)/;

function geoLookup(ip) {
  if (!ip || PRIVATE_IP_RE.test(ip)) return Promise.resolve(null);
  return new Promise(resolve => {
    const url = `https://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city,lat,lon,isp,org`;
    https.get(url, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const d = JSON.parse(body);
          if (d.status !== 'success') return resolve(null);
          resolve({
            geo_country: d.country || null,
            geo_country_code: d.countryCode || null,
            geo_region: d.regionName || null,
            geo_city: d.city || null,
            geo_lat: d.lat ?? null,
            geo_lon: d.lon ?? null,
            geo_isp: d.isp || null,
            geo_org: d.org || null,
          });
        } catch { resolve(null); }
      });
      res.on('error', () => resolve(null));
    }).on('error', () => resolve(null));
  });
}

const app = express();
const PORT = process.env.PORT || 8080;

// Trust the Code Engine ingress load balancer so X-Forwarded-For is honoured.
// '1' means trust exactly one upstream proxy (the Code Engine ingress).
app.set('trust proxy', 1);

// ── Old URL redirect ──────────────────────────────────────────────────────────
// Any request arriving on the raw Code Engine hostname is permanently redirected
// to the canonical Cloudflare domain. Path and query string are preserved.
const CANONICAL_HOST = 'corpay.mhm-ibm.net';
const CE_HOST_RE = /\.codeengine\.appdomain\.cloud$/i;

app.use((req, res, next) => {
  if (CE_HOST_RE.test(req.hostname)) {
    const redirectUrl = `https://${CANONICAL_HOST}${req.originalUrl}`;
    return res.redirect(301, redirectUrl);
  }
  next();
});

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
    // Cloudflare injects CF-Connecting-IP with the real visitor IP.
    // This is the most reliable source when traffic is proxied through Cloudflare.
    // Fall back to first x-forwarded-for entry, then socket address.
    const xForwardedFor = req.headers['x-forwarded-for'];
    const xForwardedForFirst = xForwardedFor
      ? xForwardedFor.split(',')[0].trim()
      : null;
    const clientIp =
      req.headers['cf-connecting-ip'] ||
      xForwardedForFirst ||
      req.socket.remoteAddress;

    const baseLog = {
      timestamp: new Date().toISOString(),
      visitor_id: req.visitorId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: elapsedMs,
      duration_seconds: parseFloat((elapsedMs / 1000).toFixed(3)),
      client_ip: clientIp,
      cf_connecting_ip: req.headers['cf-connecting-ip'] || null,
      cf_ipcountry: req.headers['cf-ipcountry'] || null,
      cf_ray: req.headers['cf-ray'] || null,
      x_forwarded_for: xForwardedFor || null,
      referrer: req.headers['referer'] || null,
      user_agent: req.headers['user-agent'] || null,
    };

    // Fire geo lookup after response is sent — does not affect response time.
    geoLookup(clientIp).then(geo => {
      process.stdout.write(JSON.stringify({ ...baseLog, ...geo }) + '\n');
    });
  });

  next();
});

// ── Health check — required by IBM Cloud Code Engine ─────────────────────────
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ── Debug: echo all request headers (temporary — remove after IP is confirmed) ─
app.get('/debug/headers', (req, res) => {
  res.json({
    headers: req.headers,
    x_forwarded_for: req.headers['x-forwarded-for'] || null,
    x_forwarded_for_first: (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || null,
    socket_remote_address: req.socket.remoteAddress,
  });
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

// ── Safety nets ───────────────────────────────────────────────────────────────
// Prevent unhandled rejections / exceptions from crashing the process and
// triggering Code Engine's high-restart-rate alarm.
process.on('unhandledRejection', (reason) => {
  process.stderr.write(JSON.stringify({ timestamp: new Date().toISOString(), event: 'unhandledRejection', reason: String(reason) }) + '\n');
});

process.on('uncaughtException', (err) => {
  process.stderr.write(JSON.stringify({ timestamp: new Date().toISOString(), event: 'uncaughtException', error: err.message, stack: err.stack }) + '\n');
});
