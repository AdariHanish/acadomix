import pool from './db.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Database query failed' });
    }
  } else if (req.method === 'POST') {
    try {
      const { student_name, phone, email, project_name, amount, screenshot_data, mime_type } = req.body;
      const [result]: any = await pool.query(
        `INSERT INTO payments (student_name, phone, email, project_name, amount, screenshot_data, mime_type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [student_name, phone, email, project_name, amount, screenshot_data, mime_type]
      );
      res.status(201).json({ id: result.insertId, ...req.body, status: 'pending' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create payment' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, status } = req.body;
      await pool.query('UPDATE payments SET status=? WHERE id=?', [status, id]);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update payment' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await pool.query('DELETE FROM payments WHERE id = ?', [id]);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete payment' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
