import pool from './db.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const [rows]: any = await pool.query('SELECT * FROM site_settings LIMIT 1');
      const settings = rows[0] || {};
      
      // CRITICAL SECURITY FIX: Omit sensitive fields from public GET request
      delete settings.admin_password;
      delete settings.security_question;
      delete settings.security_answer;

      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Database query failed' });
    }
  } else if (req.method === 'PUT') {
    try {
      const allowedFields = [
        'mini_project_price', 'major_project_price', 'custom_project_price',
        'research_paper_price', 'plagiarism_removal_price',
        'security_question', 'security_answer',
        'company_tagline', 'office_location_text', 'office_location_link',
        'admin_phone', 'offer_active', 'offer_reason', 'offer_end_time',
        'original_mini_price', 'original_major_price', 'original_custom_price'
      ];
      // admin_password is intentionally excluded — use POST /api/auth with action='reset'

      const maxLengths: Record<string, number> = {
        company_tagline: 200, office_location_text: 300, office_location_link: 500,
        admin_phone: 20, offer_reason: 200, security_question: 200, security_answer: 200,
      };

      const [existing]: any = await pool.query('SELECT * FROM site_settings LIMIT 1');
      if (existing.length > 0) {
        const updates: string[] = [];
        const values: any[] = [];
        for (const field of allowedFields) {
          if (req.body[field] !== undefined) {
            let value = req.body[field];
            // Apply length limit for string fields
            if (typeof value === 'string' && maxLengths[field]) {
              value = value.slice(0, maxLengths[field]);
            }
            updates.push(`${field}=?`);
            values.push(value);
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
