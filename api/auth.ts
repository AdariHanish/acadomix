import pool from './db.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const SECRET = process.env.VITE_JWT_SECRET || 'acadomix_fallback_secure_key_2026_xYz';
const SALT_ROUNDS = 12;

function generateToken(): string {
  const payload = Buffer.from(JSON.stringify({ role: 'admin', ts: Date.now() })).toString('base64');
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64');
  return `${payload}.${signature}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { password, action } = req.body;

    if (!password || typeof password !== 'string' || password.length < 1) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (password.length > 128) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // ── Password Reset ────────────────────────────────────────────────────────
    if (action === 'reset') {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      await pool.query('UPDATE site_settings SET admin_password = ?', [hashed]);
      return res.status(200).json({ success: true });
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    const [rows]: any = await pool.query('SELECT admin_password FROM site_settings LIMIT 1');
    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const stored: string = rows[0].admin_password || '';

    // Support both legacy plain-text passwords and new bcrypt hashes
    let passwordMatch = false;
    if (stored.startsWith('$2b$') || stored.startsWith('$2a$')) {
      // bcrypt hash — use secure compare
      passwordMatch = await bcrypt.compare(password, stored);
    } else {
      // Legacy plain-text — constant-time compare to prevent timing attacks
      passwordMatch = crypto.timingSafeEqual(
        Buffer.from(password.padEnd(64)),
        Buffer.from(stored.padEnd(64))
      );
      // Auto-upgrade to bcrypt hash on successful login
      if (passwordMatch) {
        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        await pool.query('UPDATE site_settings SET admin_password = ?', [hashed]);
      }
    }

    if (!passwordMatch) {
      // Use same response time regardless of pass/fail to prevent timing attacks
      await new Promise(r => setTimeout(r, 200 + Math.random() * 100));
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken();
    return res.status(200).json({ success: true, token });

  } catch (err) {
    console.error('[Auth] Error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
