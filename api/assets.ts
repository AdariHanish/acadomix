import pool from './db.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { asset_name, raw } = req.query;
      let query = 'SELECT * FROM app_assets';
      const params: any[] = [];
      if (asset_name) {
        query += ' WHERE asset_name = ?';
        params.push(asset_name);
      }
      const [rows]: any = await pool.query(query, params);
      
      if (asset_name && rows.length > 0 && raw === 'true') {
        const asset = rows[0];
        if (!asset || !asset.data) {
          return res.status(404).json({ error: 'Asset data not found' });
        }
        // Parse base64 data url if present
        const base64Data = asset.data.includes('base64,') 
          ? asset.data.split('base64,')[1] 
          : asset.data;
        const imgBuffer = Buffer.from(base64Data, 'base64');
        res.setHeader('Content-Type', asset.mime_type || 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=604800'); // Cache for 7 days
        return res.status(200).send(imgBuffer);
      }
      
      res.status(200).json(rows);
    } catch (error) {
      console.error(error);
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
  } else if (req.method === 'DELETE') {
    try {
      const { asset_name } = req.query;
      
      if (!asset_name) {
        return res.status(400).json({ error: 'asset_name is required' });
      }
      
      await pool.query('DELETE FROM app_assets WHERE asset_name = ?', [asset_name]);
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Asset delete error:', error);
      res.status(500).json({ error: 'Failed to delete asset' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
