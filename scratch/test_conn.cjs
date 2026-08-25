require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
  const c = await mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
    port: 4000,
    user: '2r32GhnXE46aPEJ.root',
    password: 'c6JJgBGmkI6pYkWR',
    database: 'test',
    ssl: { rejectUnauthorized: true }
  });

  const [res1] = await c.query("SHOW STATUS LIKE 'Threads_connected'");
  console.log("SHOW STATUS:", res1);

  const [res2] = await c.query("SELECT COUNT(*) as active_conns FROM information_schema.processlist");
  console.log("PROCESSLIST:", res2);

  await c.end();
}
test().catch(console.error);
