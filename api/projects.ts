import pool from './db.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
      res.status(200).json(rows);
    } catch (error: any) {
      console.error('Projects fetch error:', error);
      res.status(500).json({ error: 'Database query failed', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description, category, year_type, original_price, market_price, our_price, features, is_popular, is_trending } = req.body;
      const [result]: any = await pool.query(
        `INSERT INTO projects (title, description, category, year_type, original_price, market_price, our_price, features, is_popular, is_trending)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, category, year_type, original_price, market_price, our_price, features, is_popular ? 1 : 0, is_trending ? 1 : 0]
      );
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create project' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, title, description, category, year_type, original_price, market_price, our_price, features, is_popular, is_trending } = req.body;
      await pool.query(
        `UPDATE projects SET title=?, description=?, category=?, year_type=?, original_price=?, market_price=?, our_price=?, features=?, is_popular=?, is_trending=? WHERE id=?`,
        [title, description, category, year_type, original_price, market_price, our_price, features, is_popular ? 1 : 0, is_trending ? 1 : 0, id]
      );
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update project' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await pool.query('DELETE FROM projects WHERE id = ?', [id]);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete project' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
