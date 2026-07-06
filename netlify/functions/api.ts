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

const app = express();

// Increase JSON payload limit for base64 images
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

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
