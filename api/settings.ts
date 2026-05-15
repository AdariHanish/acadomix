import pool from './db';

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
      const { mini_project_price, major_project_price, custom_project_price, research_paper_price, plagiarism_removal_price, admin_password, security_question, security_answer } = req.body;
      
      const [existing]: any = await pool.query('SELECT id FROM site_settings LIMIT 1');
      if (existing.length > 0) {
        await pool.query(
          `UPDATE site_settings SET mini_project_price=?, major_project_price=?, custom_project_price=?, research_paper_price=?, plagiarism_removal_price=?, admin_password=?, security_question=?, security_answer=? WHERE id=?`,
          [mini_project_price, major_project_price, custom_project_price, research_paper_price, plagiarism_removal_price, admin_password, security_question, security_answer, existing[0].id]
        );
      } else {
        await pool.query(
          `INSERT INTO site_settings (mini_project_price, major_project_price, custom_project_price, research_paper_price, plagiarism_removal_price, admin_password, security_question, security_answer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [mini_project_price, major_project_price, custom_project_price, research_paper_price, plagiarism_removal_price, admin_password, security_question, security_answer]
        );
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
