import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.TIDB_HOST || 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: process.env.TIDB_USER || '2r32GhnXE46aPEJ.root',
  password: process.env.TIDB_PASSWORD || 'c6JJgBGmkI6pYkWR',
  database: process.env.TIDB_DATABASE || 'test',
  ssl: {
    // Try with rejectUnauthorized: false if true fails
    rejectUnauthorized: false 
  },
  connectTimeout: 10000, // 10 seconds
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Improved debug logging
pool.getConnection()
  .then(conn => {
    console.log('✅ Connection established');
    conn.release();
  })
  .catch(err => {
    console.error('❌ CONNECTION ERROR:', err);
  });

export default pool;
