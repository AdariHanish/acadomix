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
          team_members TEXT,
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

    // FORCE RESET PROJECTS (to ensure 50+ are present)
    const [projectsCount]: any = await pool.query("SELECT COUNT(*) as count FROM projects");
    if (projectsCount[0].count < 50) {
      await pool.query("DELETE FROM projects"); // Clear old ones
      const domains = ['website', 'aiml', 'datascience', 'iot', 'research'];
      const bufferProjects = [];

      for (const dom of domains) {
        for (let i = 1; i <= 10; i++) {
          const isMajor = i <= 5;
          const type = isMajor ? 'major' : 'mini';
          const price = isMajor ? 4500 : 1500;
          const market = price + 3000;
          const original = price + 5000;
          let isPop = i <= 3;
          let isTrend = i <= 3;
          const description = `WHAT IT IS: A high-performance ${dom} project focusing on ${type} scale implementation. HOW IT'S USEFUL: This project helps students master ${dom} concepts while providing a ready-to-submit professional codebase with full documentation.`;

          bufferProjects.push([`${dom.toUpperCase()} ${type.toUpperCase()} Project #${i}`, description, dom, type, original, market, price, 'Clean Code, Documentation, Full Support, No Plagiarism', isPop ? 1 : 0, isTrend ? 1 : 0]);
        }
      }

      for (const p of bufferProjects) {
        await pool.query(`INSERT INTO projects (title, description, category, year_type, original_price, market_price, our_price, features, is_popular, is_trending) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, p);
      }
    }

    // SEED 60 TESTIMONIALS
    const [revCount]: any = await pool.query("SELECT COUNT(*) as count FROM reviews");
    if (revCount[0].count < 10) {
      const girlNames = ['Sravani', 'Anusha', 'Priyanka', 'Keerthi', 'Deepika', 'Sindhu', 'Mounika', 'Lavanya', 'Sneha', 'Jyothi', 'Kavya', 'Divya', 'Sai Lakshmi', 'Harshitha', 'Yamini', 'Bhargavi', 'Tejaswi', 'Ramya', 'Vani', 'Swathi', 'Prathyusha', 'Amulya', 'Meghana', 'Sireesha', 'Pujitha', 'Sandhya', 'Vineela', 'Alekhya', 'Navya', 'Jhansi', 'Manasa', 'Pavani', 'Reshma', 'Thriveni', 'Prasanna', 'Radha', 'Gayatri', 'Hemalatha', 'Usha', 'Sushma', 'Rohini', 'Bhavya', 'Likhitha', 'Pallavi', 'Saritha', 'Tulasi', 'Aparna', 'Revathi', 'Madhavi', 'Laxmi', 'Indu', 'Jyothshna', 'Hema', 'Roopa', 'Sowjanya'];
      const boyNames = ['Hanish', 'Rahul', 'Kiran', 'Sandeep', 'Mahesh'];
      const colleges = ['GVP', 'GVP Womens', 'Vignan', 'Raghu', 'AU', 'GITAM', 'Avanthi', 'ANITS'];
      const types = ['Mini Project', 'Major Project', 'Research Paper'];
      
      const seedReviews = [];
      // 55 Girl Reviews
      for (let i = 0; i < 55; i++) {
        seedReviews.push([girlNames[i] || `Student ${i}`, colleges[i % colleges.length], 'Final Year', 'Acadomix Service', types[i % types.length], 5, 'The project was delivered on time and the support was excellent. WHAT IT IS: A great learning experience. HOW IT\'S USEFUL: Helped me score full marks.', 'Reasonable', '2024-05-15', 1]);
      }
      // 5 Boy Reviews
      for (let i = 0; i < 5; i++) {
        seedReviews.push([boyNames[i], colleges[i % colleges.length], '3rd Year', 'Acadomix Service', types[i % types.length], 5, 'Best quality code and documentation I have seen so far.', 'Premium quality', '2024-05-15', 1]);
      }

      for (const r of seedReviews) {
        await pool.query(`INSERT INTO reviews (student_name, college_name, year_of_study, project_name, project_type, rating, experience, pricing_review, date, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, r);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: "Database seeded successfully with 50+ projects and 60 testimonials",
      stats: { projects: projectsCount[0].count, reviews: revCount[0].count }
    });
  } catch (error: any) {
    console.error("Setup error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
