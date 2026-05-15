import pool from './db';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Database query failed' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, college, branch, project_domain, budget, deadline, phone, message } = req.body;
      const [result]: any = await pool.query(
        `INSERT INTO leads (name, college, branch, project_domain, budget, deadline, phone, message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, college, branch, project_domain, budget, deadline, phone, message]
      );
      res.status(201).json({ id: result.insertId, ...req.body, status: 'new' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create lead' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, status } = req.body;
      await pool.query('UPDATE leads SET status=? WHERE id=?', [status, id]);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update lead' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await pool.query('DELETE FROM leads WHERE id = ?', [id]);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete lead' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
