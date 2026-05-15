import pool from './db.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { asset_name } = req.query;
      let query = 'SELECT * FROM app_assets';
      const params: any[] = [];
      if (asset_name) {
        query += ' WHERE asset_name = ?';
        params.push(asset_name);
      }
      const [rows]: any = await pool.query(query, params);
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Database query failed' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { asset_name, data, mime_type } = req.body;
      
      // Use REPLACE INTO for an atomic, single-query update
      await pool.query(
        'REPLACE INTO app_assets (asset_name, data, mime_type) VALUES (?, ?, ?)',
        [asset_name, data, mime_type]
      );
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Asset upload error:', error);
      res.status(500).json({ error: 'Failed to update asset' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
