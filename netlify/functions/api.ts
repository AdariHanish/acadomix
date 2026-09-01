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
import analyticsHandler from '../../api/analytics';

const app = express();

const SECRET = process.env.VITE_JWT_SECRET || 'acadomix_fallback_secure_key_2026_xYz';

// ─── In-Memory Rate Limiter ───────────────────────────────────────────────────
// Tracks requests per IP key. Automatically clears entries after the window expires.
interface RateEntry { count: number; firstSeen: number; }
const rateLimitStore = new Map<string, RateEntry>();
const RATE_WINDOW_MS   = 15 * 60 * 1000; // 15 minutes
const AUTH_LIMIT       = 8;   // max login/otp attempts per 15 min
const SUBMISSION_LIMIT = 25;  // max leads/payments/reviews per 15 min
const ANALYTICS_LIMIT  = 120; // max analytics pings per 15 min
const GLOBAL_LIMIT     = 400; // max total requests per 15 min

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

// ─── Token Verification (24-Hour Expiry) ───────────────────────────────────────
function verifyToken(token: string): boolean {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;

    // Check expiration
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (data.exp && Date.now() > data.exp) return false;
    if (data.ts && Date.now() - data.ts > 24 * 60 * 60 * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

function getToken(req: express.Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.split(' ')[1];
}

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow requests from acadomix domains, netlify deploy previews, or local dev
  const isAllowed = !origin || 
    origin.includes('localhost') || 
    origin.includes('127.0.0.1') || 
    origin.includes('acadomix') || 
    origin.includes('netlify.app');

  res.setHeader('Access-Control-Allow-Origin', isAllowed && origin ? origin : '*');
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
  const ip = getIP(req);

  // Always allow OPTIONS (handled by CORS above)
  if (method === 'OPTIONS') return next();

  // Public GETs: projects, settings, reviews
  if (method === 'GET' && (
    path.includes('/projects') ||
    path.includes('/settings') ||
    path.includes('/reviews')
  )) return next();

  // Public: image/public assets by name (logos, banners, qr codes, etc.)
  if (method === 'GET' && path.includes('/assets') && req.query.asset_name) return next();

  // Public POST: Analytics tracking
  if (method === 'POST' && path.includes('/analytics')) {
    if (!checkRateLimit(`analytics:${ip}`, ANALYTICS_LIMIT)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    return next();
  }

  // Public POSTs: auth (login), otp, leads (enquiry form), payments (payment submission), reviews (new review)
  if (method === 'POST' && (
    path.includes('/auth') ||
    path.includes('/otp') ||
    path.includes('/leads') ||
    path.includes('/payments') ||
    path.includes('/reviews')
  )) {
    // Stricter rate-limit for auth and OTP
    if (path.includes('/auth') || path.includes('/otp')) {
      if (!checkRateLimit(`auth:${ip}`, AUTH_LIMIT)) {
        return res.status(429).json({ error: 'Too many authentication attempts. Try again in 15 minutes.' });
      }
    } else {
      // General form submissions
      if (!checkRateLimit(`submission:${ip}`, SUBMISSION_LIMIT)) {
        return res.status(429).json({ error: 'Too many submissions. Please wait a few minutes before trying again.' });
      }
    }
    return next();
  }

  // Public PUT: OTP verification (user resetting password)
  if (method === 'PUT' && path.includes('/otp')) {
    if (!checkRateLimit(`auth:${ip}`, AUTH_LIMIT)) {
      return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
    }
    return next();
  }

  // Student ID upload — public PUT (specific prefix only)
  if (method === 'PUT' && path.includes('/assets') && req.body?.asset_name?.startsWith('studentid_')) return next();

  // Everything else (admin routes: /database, /leads GET/PUT/DELETE, /reviews PUT/DELETE, /analytics GET, etc.) requires valid admin token
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  if (!verifyToken(token)) return res.status(403).json({ error: 'Forbidden or session expired. Please log in again.' });

  next();
});

// ─── Route Adapter ────────────────────────────────────────────────────────────
const adapt = (handler: any) => async (req: express.Request, res: express.Response) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error('[API Error]', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// ─── Routes ───────────────────────────────────────────────────────────────────
const router = express.Router();
router.all('/analytics',          adapt(analyticsHandler));
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
