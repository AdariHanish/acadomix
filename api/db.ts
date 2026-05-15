import mysql from 'mysql2/promise';

// Discrete variables are much more reliable on Vercel than one long URI
const dbConfig = {
  host: process.env.TIDB_HOST || 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: process.env.TIDB_USER || '2r32GhnXE46aPEJ.root',
  password: process.env.TIDB_PASSWORD || '2R4qAiCxEDIvPSjZ',
  database: process.env.TIDB_DATABASE || 'test',
  ssl: {
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Use DATABASE_URL only if discrete variables are missing
const pool = process.env.DATABASE_URL && !process.env.TIDB_HOST
  ? mysql.createPool({ uri: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } })
  : mysql.createPool(dbConfig);

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ Connected to TiDB Cloud successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ TiDB Connection Error:', err.message);
  });

export default pool;
