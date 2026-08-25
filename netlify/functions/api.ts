import express from 'express';
import serverless from 'serverless-http';

// Import all existing Vercel handlers
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

import crypto from 'crypto';

const app = express();

const SECRET = process.env.VITE_JWT_SECRET || 'acadomix_fallback_secure_key_2026_xYz';

function verifyToken(token: string) {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64');
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

// Parse bodies first so middleware can read req.body
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Global Security Middleware
app.use((req, res, next) => {
  // 1. Allow all GETs and OPTIONS
  if (req.method === 'GET' || req.method === 'OPTIONS') return next();
  
  // 2. Allow public auth/leads/payments/reviews POST endpoints
  const isPublicPost = req.method === 'POST' && (
    req.path.includes('/auth') || 
    req.path.includes('/leads') || 
    req.path.includes('/otp') ||
    req.path.includes('/payments') || 
    req.path.includes('/reviews')
  );
  if (isPublicPost) return next();

  // 3. Allow public student ID asset uploads (must start with studentid_)
  const isStudentIdUpload = req.method === 'PUT' && req.path.includes('/assets') && req.body?.asset_name?.startsWith('studentid_');
  if (isStudentIdUpload) return next();
  
  // 4. Everything else requires a valid Admin JWT
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!verifyToken(token)) {
    return res.status(403).json({ error: 'Forbidden: Invalid token signature' });
  }
  
  next();
});

// Helper to adapt Express req/res to Vercel-like handler
const adaptHandler = (handler: any) => {
  return async (req: express.Request, res: express.Response) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
};

const router = express.Router();

// Mount all routes
router.all('/assets', adaptHandler(assetsHandler));
router.all('/auth', adaptHandler(authHandler));
router.all('/database', adaptHandler(databaseHandler));
router.all('/leads', adaptHandler(leadsHandler));
router.all('/otp', adaptHandler(otpHandler));
router.all('/payment-screenshot', adaptHandler(paymentScreenshotHandler));
router.all('/payments', adaptHandler(paymentsHandler));
router.all('/projects', adaptHandler(projectsHandler));
router.all('/reviews', adaptHandler(reviewsHandler));
router.all('/settings', adaptHandler(settingsHandler));
router.all('/setup', adaptHandler(setupHandler));

// Mount router on multiple possible base paths to handle Netlify rewrites safely
app.use('/api', router);
app.use('/.netlify/functions/api', router);

export const handler = serverless(app);
export { app };
