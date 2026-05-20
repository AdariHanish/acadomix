import pool from './db.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      const [rows]: any = await pool.query('SELECT admin_password FROM site_settings LIMIT 1');
      if (rows.length > 0 && rows[0].admin_password === password) {
        res.status(200).json({ success: true });
      } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Authentication failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
