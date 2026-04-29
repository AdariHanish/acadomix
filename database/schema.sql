-- ═══════════════════════════════════════════════════════════
-- Acadomix - Final Database Schema (Clean & Optimized)
-- ═══════════════════════════════════════════════════════════

-- Clean start (Optional: uncomment if you want to wipe data)
-- DROP TABLE IF EXISTS reviews;
-- DROP TABLE IF EXISTS payments;
-- DROP TABLE IF EXISTS projects;
-- DROP TABLE IF EXISTS leads;
-- DROP TABLE IF EXISTS app_assets;
-- DROP TABLE IF EXISTS site_settings;

-- 1. Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    college VARCHAR(200) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    project_domain VARCHAR(100) NOT NULL,
    budget VARCHAR(50) NOT NULL,
    deadline VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    message TEXT,
    status ENUM('new', 'contacted', 'in_progress', 'completed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    year_type VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features TEXT,
    is_popular TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    screenshot_data LONGBLOB,
    mime_type VARCHAR(50),
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. App Assets Table (For Logo and QR Code)
CREATE TABLE IF NOT EXISTS app_assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_name VARCHAR(50) UNIQUE NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    data LONGBLOB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    college_name VARCHAR(200) NOT NULL,
    year_of_study VARCHAR(50) NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    rating INT NOT NULL,
    experience TEXT,
    pricing_review TEXT,
    is_approved TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Site Settings Table (Dynamic Pricing)
CREATE TABLE IF NOT EXISTS site_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════

-- Initial Pricing
INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES 
('mini_project_price', '999'),
('major_project_price', '1999'),
('custom_project_price', '4999');

-- Sample AI/ML Projects
INSERT INTO projects (title, description, category, year_type, price, features, is_popular) VALUES
('Face Recognition UI', 'Real-time face detection and recognition dashboard.', 'aiml', 'major', 2199, 'Camera Feed,User DB,Profile Match', 1),
('Object Detection Visualizer', 'YOLO-based object detection with visual feedback.', 'aiml', 'major', 1999, 'Real-time,Bounding Boxes,Export', 1),
('MNIST Digit Canvas', 'Draw and recognize digits using CNN.', 'aiml', 'mini', 1199, 'Canvas,Live Prediction,Graphs', 1);

-- Sample Data Science Projects
INSERT INTO projects (title, description, category, year_type, price, features, is_popular) VALUES
('Global Climate Dashboard', 'Visualization of global temperature trends.', 'datascience', 'major', 2499, 'Maps,Trends,CSV Export', 1),
('E-Commerce Analytics', 'Business intelligence for online stores.', 'datascience', 'major', 2199, 'Revenue Stats,Customer Segments', 0);

-- Sample Reviews
INSERT INTO reviews (student_name, college_name, year_of_study, project_name, rating, experience, pricing_review, is_approved) VALUES
('Sravani Koppula', 'GVPCE (A)', '4th Year', 'Face Recognition UI', 5, 'The dashboard was amazing and my internal guide loved it!', 'Affordable for a major project.', 1),
('Teja Varma', 'GITAM University', '4th Year', 'Object Detection Visualizer', 5, 'Perfect execution and documentation.', 'Worth every rupee.', 1);