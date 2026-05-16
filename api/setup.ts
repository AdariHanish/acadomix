import pool from './db.js';

export default async function handler(req: any, res: any) {
  try {
    console.log("Starting database setup...");

    const schemas = [
      `CREATE TABLE IF NOT EXISTS site_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          mini_project_price VARCHAR(100),
          major_project_price VARCHAR(100),
          custom_project_price VARCHAR(100),
          research_paper_price VARCHAR(100),
          plagiarism_removal_price VARCHAR(100),
          admin_password VARCHAR(255),
          security_question VARCHAR(255),
          security_answer VARCHAR(255)
      )`,
      `CREATE TABLE IF NOT EXISTS projects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          year_type VARCHAR(100),
          original_price DECIMAL(10, 2),
          market_price DECIMAL(10, 2),
          our_price DECIMAL(10, 2),
          features TEXT,
          is_popular BOOLEAN DEFAULT FALSE,
          is_trending BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS leads (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          college VARCHAR(255) NOT NULL,
          branch VARCHAR(255),
          project_domain VARCHAR(255),
          budget VARCHAR(100),
          deadline VARCHAR(100),
          phone VARCHAR(20) NOT NULL,
          message TEXT,
          status VARCHAR(50) DEFAULT 'new',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS payments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_name VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          email VARCHAR(255),
          project_name VARCHAR(255),
          amount DECIMAL(10, 2),
          screenshot_data LONGTEXT,
          mime_type VARCHAR(100),
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_name VARCHAR(255) NOT NULL,
          college_name VARCHAR(255),
          year_of_study VARCHAR(100),
          project_name VARCHAR(255),
          project_type VARCHAR(100),
          rating INT,
          experience TEXT,
          pricing_review TEXT,
          date DATE,
          is_approved BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS app_assets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          asset_name VARCHAR(100) NOT NULL UNIQUE,
          mime_type VARCHAR(100),
          data LONGTEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    ];

    for (const schema of schemas) {
      await pool.query(schema);
    }

    // Insert default settings if empty
    const [settings]: any = await pool.query("SELECT COUNT(*) as count FROM site_settings");
    if (settings[0].count === 0) {
      await pool.query(`
        INSERT INTO site_settings (
            mini_project_price, major_project_price, custom_project_price,
            research_paper_price, plagiarism_removal_price, admin_password,
            security_question, security_answer
        ) VALUES (
            '1500', '4500', '4500', '3000', '500', '1234',
            'What is your nick name?', 'lovely'
        )
      `);
    }

    // Insert default projects if empty
    const [projects]: any = await pool.query("SELECT COUNT(*) as count FROM projects");
    if (projects[0].count === 0) {
      const domains = ['website', 'aiml', 'datascience', 'iot', 'research'];
      const bufferProjects = [];

      for (const dom of domains) {
        for (let i = 1; i <= 10; i++) {
          const isMajor = i <= 5;
          const type = isMajor ? 'major' : 'mini';
          const price = isMajor ? 4500 : 1500;
          const market = price + 3000;
          const original = price + 5000;
          
          // 3-trending+popular, 2-popular, 5-normal
          let isPop = false;
          let isTrend = false;
          if (i <= 3) { isPop = true; isTrend = true; }
          else if (i <= 5) { isPop = true; }

          const description = `WHAT IT IS: A high-performance ${dom} project focusing on ${type} scale implementation. HOW IT'S USEFUL: This project helps students master ${dom} concepts while providing a ready-to-submit professional codebase with full documentation.`;

          bufferProjects.push([
            `${dom.toUpperCase()} ${type.toUpperCase()} Project #${i}`,
            description,
            dom,
            type,
            original,
            market,
            price,
            'Clean Code, Documentation, Full Support, No Plagiarism',
            isPop ? 1 : 0,
            isTrend ? 1 : 0
          ]);
        }
      }

      for (const p of bufferProjects) {
        await pool.query(
          `INSERT INTO projects (title, description, category, year_type, original_price, market_price, our_price, features, is_popular, is_trending) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          p
        );
      }
    }

    res.status(200).json({ 
      success: true, 
      message: "Database initialized successfully",
      stats: { projects: projects[0].count, settings: settings[0].count }
    });
  } catch (error: any) {
    console.error("Setup error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code,
      stack: error.stack,
      hint: "Check if your TIDB_PASSWORD and TIDB_HOST are correct in Vercel. Also ensure 0.0.0.0/0 is allowed in TiDB Networking."
    });
  }
}
