import 'dotenv/config';
import { app } from './netlify/functions/api.js';
import pool from './api/db.js';

const PORT = 3001;

app.listen(PORT, async () => {
  console.log(`[local-server] API running on http://localhost:${PORT}`);
  try {
    await pool.query('SELECT 1');
    console.log('[local-server] Successfully connected to the database.');
  } catch (err) {
    console.error('[local-server] Failed to connect to the database:', err);
  }
});
