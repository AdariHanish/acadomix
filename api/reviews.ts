import pool from './db.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
      // Convert tinyint to boolean for frontend compatibility
      const formatted = (rows as any[]).map(row => ({ ...row, is_approved: !!row.is_approved }));
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
      res.status(200).json(formatted);
    } catch (error) {
      res.status(500).json({ error: 'Database query failed' });
    }
  } else if (req.method === 'POST') {
    try {
      // SECURITY: Destructure only allowed fields — prevent injection of is_approved or other fields
      const { student_name, college_name, year_of_study, project_name, project_type, rating, experience, pricing_review, date } = req.body;
      
      // Validate required fields
      if (!student_name || !college_name || !project_name || !rating || !experience) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Clamp rating to valid range
      const safeRating = Math.min(5, Math.max(1, Number(rating) || 5));

      const [result]: any = await pool.query(
        // is_approved is ALWAYS hardcoded to 0 (false) — no user input can ever override this
        `INSERT INTO reviews (student_name, college_name, year_of_study, project_name, project_type, rating, experience, pricing_review, date, is_approved)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [student_name, college_name, year_of_study, project_name, project_type, safeRating, experience, pricing_review, date]
      );
      res.status(201).json({ id: result.insertId, is_approved: false });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create review' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, is_approved } = req.body;
      await pool.query('UPDATE reviews SET is_approved=? WHERE id=?', [is_approved ? 1 : 0, id]);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update review' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete review' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
