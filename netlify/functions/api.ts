import express from 'express';
import serverless from 'serverless-http';
import crypto from 'crypto';

// Import all handlers
import assetsHandler from '../../api/assets';
import authHandler from '../../api/auth';
import leadsHandler from '../../api/leads';
import otpHandler from '../../api/otp';
import paymentScreenshotHandler from '../../api/payment-screenshot';
import paymentsHandler from '../../api/payments';
import projectsHandler from '../../api/projects';
import reviewsHandler from '../../api/reviews';
import settingsHandler from '../../api/settings';
import setupHandler from '../../api/setup';
import databaseHandler from '../../api/database';

const app = express();

const SECRET = process.env.VITE_JWT_SECRET || 'acadomix_fallback_secure_key_2026_xYz';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';

// ─── In-Memory Rate Limiter ───────────────────────────────────────────────────
// Tracks failed requests per IP. Automatically clears entries after the window expires.
interface RateEntry { count: number; firstSeen: number; }
const rateLimitStore = new Map<string, RateEntry>();
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const AUTH_LIMIT    = 10;  // max login/otp attempts per window
const GLOBAL_LIMIT  = 200; // max any requests per window

function getIP(req: express.Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
}

function checkRateLimit(key: string, max: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now - entry.firstSeen > RATE_WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, firstSeen: now });
    return true; // allowed
  }
  entry.count++;
  if (entry.count > max) return false; // blocked
  return true;
}

// ─── Token Verification ───────────────────────────────────────────────────────
function verifyToken(token: string): boolean {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

function getToken(req: express.Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.split(' ')[1];
}

function isAdmin(req: express.Request): boolean {
  const token = getToken(req);
  return !!token && verifyToken(token);
}

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow all origins for API (Vite proxy strips origin header in dev, Netlify handles in prod)
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// ─── Global Rate Limit ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const ip = getIP(req);
  if (!checkRateLimit(`global:${ip}`, GLOBAL_LIMIT)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }
  next();
});

// ─── Auth Middleware ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const path = req.path;
  const method = req.method;

  // Always allow OPTIONS (handled by CORS above)
  if (method === 'OPTIONS') return next();

  // Public GETs: projects, settings, reviews (approved only — filtered in handler)
  if (method === 'GET' && (
    path.includes('/projects') ||
    path.includes('/settings') ||
    path.includes('/reviews')
  )) return next();

  // Public: raw image assets by name only (for logos/banners on site)
  if (method === 'GET' && path.includes('/assets') && req.query.asset_name && req.query.raw === 'true') return next();

  // Public POSTs: auth (login), otp, leads (enquiry form), payments (payment submission), reviews (new review)
  if (method === 'POST' && (
    path.includes('/auth') ||
    path.includes('/otp') ||
    path.includes('/leads') ||
    path.includes('/payments') ||
    path.includes('/reviews')
  )) {
    // Rate-limit auth and OTP endpoints
    if (path.includes('/auth') || path.includes('/otp')) {
      const ip = getIP(req);
      if (!checkRateLimit(`auth:${ip}`, AUTH_LIMIT)) {
        return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
      }
    }
    return next();
  }

  // Public PUT: OTP verification (user doesn't have a token yet — they're resetting password)
  if (method === 'PUT' && path.includes('/otp')) {
    const ip = getIP(req);
    if (!checkRateLimit(`auth:${ip}`, AUTH_LIMIT)) {
      return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
    }
    return next();
  }

  // Student ID upload — public PUT (specific prefix only)
  if (method === 'PUT' && path.includes('/assets') && req.body?.asset_name?.startsWith('studentid_')) return next();

  // Everything else requires valid admin token
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  if (!verifyToken(token)) return res.status(403).json({ error: 'Forbidden' });

  next();
});

// ─── Route Adapter ────────────────────────────────────────────────────────────
const adapt = (handler: any) => async (req: express.Request, res: express.Response) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error('[API Error]', err);
    if (!res.headersSent) {
      // Never leak internal error details to client
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// ─── Routes ───────────────────────────────────────────────────────────────────
const router = express.Router();
router.all('/assets',             adapt(assetsHandler));
router.all('/auth',               adapt(authHandler));
router.all('/database',           adapt(databaseHandler));
router.all('/leads',              adapt(leadsHandler));
router.all('/otp',                adapt(otpHandler));
router.all('/payment-screenshot', adapt(paymentScreenshotHandler));
router.all('/payments',           adapt(paymentsHandler));
router.all('/projects',           adapt(projectsHandler));
router.all('/reviews',            adapt(reviewsHandler));
router.all('/settings',           adapt(settingsHandler));
router.all('/setup',              adapt(setupHandler));

app.use('/api', router);
app.use('/.netlify/functions/api', router);

export const handler = serverless(app);
export { app };
