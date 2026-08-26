import pool from './db.js';
import crypto from 'crypto';

const SECRET = process.env.VITE_JWT_SECRET || 'acadomix_fallback_secure_key_2026_xYz';

function sanitize(val: unknown, maxLen = 1000): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '')                           // Strip all HTML
    .replace(/javascript:/gi, '')                      // Remove JS URIs
    .trim()
    .slice(0, maxLen);
}

function isAdmin(req: any): boolean {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return false;
  const token = header.split(' ')[1];
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      if (isAdmin(req)) {
        // Admin: return all reviews
        const [rows] = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
        const formatted = (rows as any[]).map(row => ({
          ...row,
          is_approved: row.is_approved === 1 || row.is_approved === true,
          visible_in_home: row.visible_in_home === 1 || row.visible_in_home === true
        }));
        res.status(200).json(formatted);
      } else {
        // Public: only return approved reviews
        const [rows] = await pool.query('SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC');
        const formatted = (rows as any[]).map(row => ({
          ...row,
          is_approved: true,
          visible_in_home: row.visible_in_home === 1 || row.visible_in_home === true
        }));
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
        res.status(200).json(formatted);
      }
    } catch (error) {
      console.error('Reviews query error:', error);
      res.status(500).json({ error: 'Database query failed' });
    }

  } else if (req.method === 'POST') {
    try {
      const { student_name, college_name, year_of_study, project_name, project_type, rating, experience, pricing_review, date } = req.body;

      if (!student_name || !college_name || !project_name || !rating || !experience) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const safeRating = Math.min(5, Math.max(1, Number(rating) || 5));

      const [result]: any = await pool.query(
        `INSERT INTO reviews (student_name, college_name, year_of_study, project_name, project_type, rating, experience, pricing_review, date, is_approved, visible_in_home)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
        [
          sanitize(student_name, 100),
          sanitize(college_name, 200),
          sanitize(year_of_study, 20),
          sanitize(project_name, 200),
          sanitize(project_type, 100),
          safeRating,
          sanitize(experience, 2000),
          sanitize(pricing_review, 500),
          sanitize(date, 30),
        ]
      );
      res.status(201).json({ id: result.insertId, is_approved: false, visible_in_home: false });
    } catch {
      res.status(500).json({ error: 'Failed to create review' });
    }

  } else if (req.method === 'PUT') {
    // Admin only — protected by middleware
    try {
      const { id, is_approved, visible_in_home } = req.body;
      if (!id) return res.status(400).json({ error: 'ID required' });

      if (is_approved !== undefined && visible_in_home !== undefined) {
        await pool.query('UPDATE reviews SET is_approved=?, visible_in_home=? WHERE id=?', [is_approved ? 1 : 0, visible_in_home ? 1 : 0, Number(id)]);
      } else if (is_approved !== undefined) {
        await pool.query('UPDATE reviews SET is_approved=? WHERE id=?', [is_approved ? 1 : 0, Number(id)]);
      } else if (visible_in_home !== undefined) {
        await pool.query('UPDATE reviews SET visible_in_home=? WHERE id=?', [visible_in_home ? 1 : 0, Number(id)]);
      }
      res.status(200).json({ success: true });
    } catch {
      res.status(500).json({ error: 'Failed to update review' });
    }

  } else if (req.method === 'DELETE') {
    // Admin only — protected by middleware
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID required' });
      await pool.query('DELETE FROM reviews WHERE id = ?', [Number(id)]);
      res.status(200).json({ success: true });
    } catch {
      res.status(500).json({ error: 'Failed to delete review' });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
