import pool from './db.js';
import crypto from 'crypto';

const SECRET = process.env.VITE_JWT_SECRET || 'acadomix_fallback_secure_key_2026_xYz';

function isAdmin(req: any): boolean {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return false;
  const token = header.split(' ')[1];
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    
    // Expiry check (24 hours)
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (data.exp && Date.now() > data.exp) return false;
    if (data.ts && Date.now() - data.ts > 24 * 60 * 60 * 1000) return false;
    
    return true;
  } catch {
    return false;
  }
}

function sanitize(val: unknown, maxLen = 255): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, maxLen);
}

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    // Public: Track page view
    try {
      const { visitor_id, page, referrer } = req.body || {};
      if (!visitor_id || typeof visitor_id !== 'string') {
        return res.status(400).json({ error: 'visitor_id is required' });
      }

      const safeVisitorId = sanitize(visitor_id, 64);
      const safePage = sanitize(page || '/', 200);
      const safeReferrer = sanitize(referrer || '', 500);

      await pool.query(
        'INSERT INTO page_views (visitor_id, page, referrer) VALUES (?, ?, ?)',
        [safeVisitorId, safePage, safeReferrer]
      );

      res.status(201).json({ success: true });
    } catch (err) {
      // Table might not exist yet if setup hasn't run; handle gracefully
      console.error('[Analytics error]', err);
      res.status(200).json({ success: false });
    }
  } else if (req.method === 'GET') {
    // Admin only: Get visitor stats
    if (!isAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // 1. Total views
      const [totalViewsRes]: any = await pool.query('SELECT COUNT(*) as total FROM page_views');
      const totalViews = totalViewsRes[0]?.total || 0;

      // 2. Unique visitors
      const [uniqueVisitorsRes]: any = await pool.query('SELECT COUNT(DISTINCT visitor_id) as total FROM page_views');
      const uniqueVisitors = uniqueVisitorsRes[0]?.total || 0;

      // 3. Today's views
      const [todayViewsRes]: any = await pool.query(
        'SELECT COUNT(*) as total FROM page_views WHERE created_at >= CURDATE()'
      );
      const todayViews = todayViewsRes[0]?.total || 0;

      // 4. Today's unique visitors
      const [todayUniqueRes]: any = await pool.query(
        'SELECT COUNT(DISTINCT visitor_id) as total FROM page_views WHERE created_at >= CURDATE()'
      );
      const todayUnique = todayUniqueRes[0]?.total || 0;

      // 5. Views in the last 7 days grouped by date
      const [historyRes]: any = await pool.query(`
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, COUNT(*) as views, COUNT(DISTINCT visitor_id) as visitors
        FROM page_views
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
        ORDER BY date ASC
      `);

      // 6. Top pages
      const [topPagesRes]: any = await pool.query(`
        SELECT page, COUNT(*) as count
        FROM page_views
        GROUP BY page
        ORDER BY count DESC
        LIMIT 5
      `);

      res.status(200).json({
        totalViews,
        uniqueVisitors,
        todayViews,
        todayUnique,
        history: historyRes || [],
        topPages: topPagesRes || [],
      });
    } catch (err) {
      console.error('[Analytics GET error]', err);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
