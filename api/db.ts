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
    rejectUnauthorized: false 
  },
  waitForConnections: true,
  connectionLimit: 20, 
  queueLimit: 0,
  enableKeepAlive: true
});

export default pool;
