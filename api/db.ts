import { createPool } from 'mysql2/promise';

if (!process.env.TIDB_PASSWORD) {
  console.warn('⚠️ Database password not found in environment variables. Connection may fail.');
}

const pool = createPool({
  host: process.env.TIDB_HOST,
  port: Number(process.env.TIDB_PORT) || 4000,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE || 'test',
  ssl: {
    rejectUnauthorized: true  // TiDB Cloud requires SSL verification
  },
  waitForConnections: true,
  connectionLimit: 5,         // Lower limit for Netlify serverless (max ~10 concurrent)
  queueLimit: 50,
  enableKeepAlive: true,      // Keep database connections alive
  keepAliveInitialDelay: 10000, // 10s initial delay
  connectTimeout: 10000,      // 10s timeout for cold starts on Netlify
});

export default pool;
