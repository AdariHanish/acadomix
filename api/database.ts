import pool from './db.js';

const ALLOWED_TABLES = new Set([
  'leads',
  'reviews',
  'payments',
  'projects',
  'site_settings',
  'app_assets',
  'page_views',
]);

function isAllowedTable(table: unknown): boolean {
  return typeof table === 'string' && ALLOWED_TABLES.has(table.toLowerCase());
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { action, table, page, limit } = req.query;

      if (action === 'tables') {
        const [rows] = await pool.query('SHOW TABLES');
        const tables = (rows as any[])
          .map(row => Object.values(row)[0] as string)
          .filter(t => ALLOWED_TABLES.has(t.toLowerCase()));
        return res.status(200).json(tables);
      }

      if (action === 'schema' && table) {
        if (!isAllowedTable(table)) {
          return res.status(400).json({ error: 'Invalid or restricted table' });
        }
        const [rows] = await pool.query(`DESCRIBE ??`, [table]);
        return res.status(200).json(rows);
      }

      if (action === 'data' && table) {
        if (!isAllowedTable(table)) {
          return res.status(400).json({ error: 'Invalid or restricted table' });
        }
        const conn = await pool.getConnection();
        try {
          const p = parseInt(page) || 1;
          const l = Math.min(parseInt(limit) || 50, 200);
          const offset = (p - 1) * l;

          const [countResult]: any = await conn.query(`SELECT COUNT(*) as total FROM ??`, [table]);
          const total = countResult[0].total;

          const [rows] = await conn.query(`SELECT * FROM ?? ORDER BY id DESC LIMIT ? OFFSET ?`, [table, l, offset]);
          return res.status(200).json({ rows, total, page: p, limit: l });
        } finally {
          conn.release();
        }
      }

      if (action === 'stats') {
        const conn = await pool.getConnection();
        try {
          // Get table stats for allowed tables only
          const [tableRows] = await conn.query('SHOW TABLES');
          const tableNames = (tableRows as any[])
            .map(row => Object.values(row)[0] as string)
            .filter(t => ALLOWED_TABLES.has(t.toLowerCase()));

          let counts: Record<string, number> = {};
          if (tableNames.length > 0) {
            const selectClauses = tableNames.map(t => `(SELECT COUNT(*) FROM \`${t}\`) as \`${t}\``).join(', ');
            const [countResult]: any = await conn.query(`SELECT ${selectClauses}`);
            counts = countResult[0] || {};
          }

          const tableStats = tableNames.map(t => ({ table: t, rows: Number(counts[t]) || 0 }));
          const totalRows = tableStats.reduce((sum, item) => sum + item.rows, 0);

          // Get database size info (works on TiDB/MySQL)
          let dbSizeMB = 0;
          try {
            const [sizeResult]: any = await conn.query(
              `SELECT SUM(data_length + index_length) / 1024 / 1024 AS size_mb 
               FROM information_schema.tables 
               WHERE table_schema = DATABASE()`
            );
            dbSizeMB = parseFloat(sizeResult[0]?.size_mb) || 0;
          } catch {
            dbSizeMB = 0;
          }

          // Get connection info
          let activeConnections = 0;
          let connectionDetails = [];
          try {
            const [connResult]: any = await conn.query(`SELECT * FROM information_schema.processlist`);
            activeConnections = connResult.length;
            connectionDetails = connResult;
          } catch {
            activeConnections = 0;
          }

          return res.status(200).json({
            totalTables: tableNames.length,
            totalRows,
            dbSizeMB: dbSizeMB.toFixed(2),
            activeConnections,
            connectionDetails,
            tableStats,
          });
        } finally {
          conn.release();
        }
      }

      res.status(400).json({ error: 'Invalid action or missing parameters' });
    } catch (error: any) {
      console.error('Database fetch error:', error);
      res.status(500).json({ error: 'Database query failed', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { action, table, query: rawQuery, data } = req.body;

      // Safe query execution (SELECT / SHOW / DESCRIBE / EXPLAIN only)
      if (action === 'query' && rawQuery) {
        const trimmed = String(rawQuery).trim();
        const allowedStart = /^(SELECT|SHOW|DESCRIBE|EXPLAIN)\s+/i;
        const dangerousWords = /\b(DROP|TRUNCATE|GRANT|REVOKE|ALTER\s+USER|CREATE\s+USER|SHUTDOWN)\b/i;

        if (!allowedStart.test(trimmed) || dangerousWords.test(trimmed)) {
          return res.status(400).json({ 
            error: 'Restricted query. Only read-only queries (SELECT, SHOW, DESCRIBE, EXPLAIN) are permitted through query console.' 
          });
        }

        const [result] = await pool.query(trimmed);
        return res.status(200).json({ result });
      }

      // Insert a new row
      if (action === 'insert' && table && data) {
        if (!isAllowedTable(table)) {
          return res.status(400).json({ error: 'Invalid or restricted table' });
        }

        const cols = Object.keys(data);
        const vals = Object.values(data);
        const placeholders = cols.map(() => '?').join(', ');
        const colNames = cols.map(c => `\`${c}\``).join(', ');

        const [result]: any = await pool.query(
          `INSERT INTO ?? (${colNames}) VALUES (${placeholders})`,
          [table, ...vals]
        );
        return res.status(201).json({ success: true, insertId: result.insertId });
      }

      // Update a row
      if (action === 'update' && table && data && req.body.id !== undefined) {
        if (!isAllowedTable(table)) {
          return res.status(400).json({ error: 'Invalid or restricted table' });
        }

        const id = req.body.id;
        const cols = Object.keys(data);
        const vals = Object.values(data);
        const setClause = cols.map(c => `\`${c}\` = ?`).join(', ');

        await pool.query(
          `UPDATE ?? SET ${setClause} WHERE id = ?`,
          [table, ...vals, id]
        );
        return res.status(200).json({ success: true });
      }

      res.status(400).json({ error: 'Invalid action or missing parameters' });
    } catch (error: any) {
      console.error('Database execution error:', error);
      res.status(500).json({ error: 'Database query failed', details: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { table, id } = req.query;
      if (!table || !id) {
        return res.status(400).json({ error: 'Table name and row ID are required' });
      }
      if (!isAllowedTable(table)) {
        return res.status(400).json({ error: 'Invalid or restricted table' });
      }
      await pool.query(`DELETE FROM ?? WHERE id = ?`, [table, id]);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Database delete error:', error);
      res.status(500).json({ error: 'Delete failed', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
