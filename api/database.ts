import pool from './db.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { action, table, page, limit } = req.query;

      if (action === 'tables') {
        const [rows] = await pool.query('SHOW TABLES');
        const tables = (rows as any[]).map(row => Object.values(row)[0]);
        return res.status(200).json(tables);
      }

      if (action === 'schema' && table) {
        const [rows] = await pool.query(`DESCRIBE ??`, [table]);
        return res.status(200).json(rows);
      }

      if (action === 'data' && table) {
        const p = parseInt(page) || 1;
        const l = Math.min(parseInt(limit) || 50, 200);
        const offset = (p - 1) * l;

        const [countResult]: any = await pool.query(`SELECT COUNT(*) as total FROM ??`, [table]);
        const total = countResult[0].total;

        const [rows] = await pool.query(`SELECT * FROM ?? ORDER BY id DESC LIMIT ? OFFSET ?`, [table, l, offset]);
        return res.status(200).json({ rows, total, page: p, limit: l });
      }

      if (action === 'stats') {
        // Get table stats
        const [tableRows] = await pool.query('SHOW TABLES');
        const tableNames = (tableRows as any[]).map(row => Object.values(row)[0] as string);

        const tableStats: any[] = [];
        let totalRows = 0;

        for (const t of tableNames) {
          const [countResult]: any = await pool.query(`SELECT COUNT(*) as cnt FROM ??`, [t]);
          const cnt = countResult[0].cnt;
          totalRows += cnt;
          tableStats.push({ table: t, rows: cnt });
        }

        // Get database size info (works on TiDB/MySQL)
        let dbSizeMB = 0;
        try {
          const [sizeResult]: any = await pool.query(
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
          const [connResult]: any = await pool.query(`SELECT * FROM information_schema.processlist`);
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
      }

      res.status(400).json({ error: 'Invalid action or missing parameters' });
    } catch (error: any) {
      console.error('Database fetch error:', error);
      res.status(500).json({ error: 'Database query failed', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { action, table, query: rawQuery, data } = req.body;

      // Raw SQL query execution
      if (action === 'query' && rawQuery) {
        const [result] = await pool.query(rawQuery);
        return res.status(200).json({ result });
      }

      // Insert a new row
      if (action === 'insert' && table && data) {
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
