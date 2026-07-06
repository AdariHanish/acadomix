
import mysql from 'mysql2/promise';

async function testConnection() {
  console.log('Testing connection with URL:', process.env.DATABASE_URL);
  try {
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: true
      }
    });
    console.log('Connected successfully!');

    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables:', tables);

    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`Table ${tableName}: ${count[0].count} rows`);
    }

    await connection.end();
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();
