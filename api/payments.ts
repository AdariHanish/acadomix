import pool from './db.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SCREENSHOT_SIZE = 4 * 1024 * 1024; // 4MB base64 character limit

function sanitize(val: unknown, maxLen = 500): string {
  if (val === null || val === undefined) return '';
  return String(val).replace(/<[^>]*>/g, '').trim().slice(0, maxLen);
}

function sanitizePhone(val: unknown): string {
  return String(val || '').replace(/[^\d+\- ()]/g, '').trim().slice(0, 20);
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    // Admin only — protected by middleware
    try {
      const [rows] = await pool.query(
        'SELECT id, student_name, college, phone, email, project_name, amount, mime_type, status, created_at FROM payments ORDER BY created_at DESC'
      );
      // NOTE: screenshot_data (potentially large base64) is NOT returned in list — fetch individually when needed
      res.status(200).json(rows);
    } catch {
      res.status(500).json({ error: 'Database query failed' });
    }

  } else if (req.method === 'POST') {
    try {
      const { student_name, college, phone, email, project_name, amount, screenshot_data, mime_type } = req.body;

      if (!student_name || !phone || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate mime type
      if (mime_type && !ALLOWED_MIME_TYPES.includes(mime_type)) {
        return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
      }

      // Validate screenshot size
      if (screenshot_data && screenshot_data.length > MAX_SCREENSHOT_SIZE) {
        return res.status(400).json({ error: 'Screenshot too large. Max 4MB.' });
      }

      // Validate amount is numeric
      const safeAmount = parseFloat(String(amount));
      if (isNaN(safeAmount) || safeAmount < 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const [result]: any = await pool.query(
        `INSERT INTO payments (student_name, college, phone, email, project_name, amount, screenshot_data, mime_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sanitize(student_name, 100),
          sanitize(college, 200),
          sanitizePhone(phone),
          sanitize(email, 200),
          sanitize(project_name, 200),
          safeAmount,
          screenshot_data || null,
          sanitize(mime_type, 50),
        ]
      );
      res.status(201).json({ id: result.insertId, status: 'pending' });
    } catch {
      res.status(500).json({ error: 'Failed to create payment' });
    }

  } else if (req.method === 'PUT') {
    // Admin only — protected by middleware
    try {
      const { id, status } = req.body;
      const allowedStatuses = ['pending', 'verified', 'rejected'];
      if (!id || !allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      await pool.query('UPDATE payments SET status=? WHERE id=?', [status, Number(id)]);
      res.status(200).json({ success: true });
    } catch {
      res.status(500).json({ error: 'Failed to update payment' });
    }

  } else if (req.method === 'DELETE') {
    // Admin only — protected by middleware
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID required' });
      await pool.query('DELETE FROM payments WHERE id = ?', [Number(id)]);
      res.status(200).json({ success: true });
    } catch {
      res.status(500).json({ error: 'Failed to delete payment' });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
