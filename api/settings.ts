import pool from './db.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const [rows]: any = await pool.query('SELECT * FROM site_settings LIMIT 1');
      res.status(200).json(rows[0] || {});
    } catch (error) {
      res.status(500).json({ error: 'Database query failed' });
    }
  } else if (req.method === 'PUT') {
    try {
      const allowedFields = ['mini_project_price', 'major_project_price', 'custom_project_price', 'research_paper_price', 'plagiarism_removal_price', 'admin_password', 'security_question', 'security_answer', 'company_tagline', 'office_location_text', 'office_location_link'];
      
      const [existing]: any = await pool.query('SELECT * FROM site_settings LIMIT 1');
      if (existing.length > 0) {
        // Only update fields that are actually provided in the request body
        const updates: string[] = [];
        const values: any[] = [];
        for (const field of allowedFields) {
          if (req.body[field] !== undefined) {
            updates.push(`${field}=?`);
            values.push(req.body[field]);
          }
        }
        if (updates.length > 0) {
          values.push(existing[0].id);
          await pool.query(
            `UPDATE site_settings SET ${updates.join(', ')} WHERE id=?`,
            values
          );
        }
      } else {
        const fields: string[] = [];
        const placeholders: string[] = [];
        const values: any[] = [];
        for (const field of allowedFields) {
          if (req.body[field] !== undefined) {
            fields.push(field);
            placeholders.push('?');
            values.push(req.body[field]);
          }
        }
        if (fields.length > 0) {
          await pool.query(
            `INSERT INTO site_settings (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
            values
          );
        }
      }
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
