import mysql from 'mysql2/promise';

// Extract connection details for better debugging
const dbUrl = process.env.DATABASE_URL || '';

const pool = mysql.createPool({
  uri: dbUrl,
  ssl: {
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test the connection and log any errors
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed!');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      console.error('👉 TIP: Ensure you have added 0.0.0.0/0 to your TiDB Cloud IP Access List.');
    }
  });

export default pool;
