import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.TIDB_HOST || 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: process.env.TIDB_USER || '2r32GhnXE46aPEJ.root',
  password: process.env.TIDB_PASSWORD || 'c6JJgBGmkI6pYkWR',
  database: process.env.TIDB_DATABASE || 'sys',
  ssl: {
    rejectUnauthorized: false 
  },
  waitForConnections: true,
  connectionLimit: 1, // Keep it low for serverless
  queueLimit: 0
});

export default pool;
