import pool from './db.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }

    const [rows]: any = await pool.query('SELECT screenshot_data, mime_type FROM payments WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = rows[0];
    if (!payment.screenshot_data) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }

    // Parse base64 data url if present
    const base64Data = payment.screenshot_data.includes('base64,') 
      ? payment.screenshot_data.split('base64,')[1] 
      : payment.screenshot_data;
    const imgBuffer = Buffer.from(base64Data, 'base64');
    
    res.setHeader('Content-Type', payment.mime_type || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=604800'); // Cache for 7 days
    return res.status(200).send(imgBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database query failed' });
  }
}
