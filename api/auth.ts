import pool from './db.js';
import crypto from 'crypto';

const SECRET = process.env.VITE_JWT_SECRET || 'acadomix_fallback_secure_key_2026_xYz';

function generateToken() {
  const payload = Buffer.from(JSON.stringify({ role: 'admin', timestamp: Date.now() })).toString('base64');
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64');
  return `${payload}.${signature}`;
}

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      const [rows]: any = await pool.query('SELECT admin_password FROM site_settings LIMIT 1');
      if (rows.length > 0 && rows[0].admin_password === password) {
        const token = generateToken();
        res.status(200).json({ success: true, token });
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
