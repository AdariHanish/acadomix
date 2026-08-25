import pool from './db.js';

// ─── Sanitization helpers ──────────────────────────────────────────────────────
function sanitize(val: unknown, maxLen = 500): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/<[^>]*>/g, '')        // Strip HTML tags
    .replace(/['"`;\\]/g, '')       // Strip SQL-friendly special chars (already parameterized, but defense-in-depth)
    .trim()
    .slice(0, maxLen);
}

function sanitizePhone(val: unknown): string {
  return String(val || '').replace(/[^\d+\- ()]/g, '').trim().slice(0, 20);
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    // Protected by middleware — admin only
    try {
      const [rows] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
      res.status(200).json(rows);
    } catch {
      res.status(500).json({ error: 'Database query failed' });
    }

  } else if (req.method === 'POST') {
    try {
      const { name, college, branch, project_domain, budget, deadline, phone, message } = req.body;

      // Required field validation
      if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
      }

      const [result]: any = await pool.query(
        `INSERT INTO leads (name, college, branch, project_domain, budget, deadline, phone, message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sanitize(name, 100),
          sanitize(college, 200),
          sanitize(branch, 100),
          sanitize(project_domain, 100),
          sanitize(budget, 50),
          sanitize(deadline, 50),
          sanitizePhone(phone),
          sanitize(message, 2000),
        ]
      );
      res.status(201).json({ id: result.insertId, status: 'new' });
    } catch {
      res.status(500).json({ error: 'Failed to create lead' });
    }

  } else if (req.method === 'PUT') {
    // Admin only — protected by middleware
    try {
      const { id, status } = req.body;
      const allowedStatuses = ['new', 'contacted', 'converted', 'closed'];
      if (!id || !allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      await pool.query('UPDATE leads SET status=? WHERE id=?', [status, Number(id)]);
      res.status(200).json({ success: true });
    } catch {
      res.status(500).json({ error: 'Failed to update lead' });
    }

  } else if (req.method === 'DELETE') {
    // Admin only — protected by middleware
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID required' });
      await pool.query('DELETE FROM leads WHERE id = ?', [Number(id)]);
      res.status(200).json({ success: true });
    } catch {
      res.status(500).json({ error: 'Failed to delete lead' });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
