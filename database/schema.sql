-- Acadomix Database Schema - UPDATED PRICING


-- Drop existing tables to recreate with new prices
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS leads;

-- Create leads table
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

-- Create projects table
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

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    screenshot_path VARCHAR(255),
    screenshot_data LONGBLOB,
    mime_type VARCHAR(50),
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create assets table for sensitive images
CREATE TABLE IF NOT EXISTS app_assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_name VARCHAR(50) UNIQUE NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    data LONGBLOB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Create reviews table
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

-- Create site_settings table for dynamic pricing and other configs
CREATE TABLE IF NOT EXISTS site_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed initial pricing settings
INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES 
('mini_project_price', '999'),
('major_project_price', '1999'),
('custom_project_price', '4999');

-- ═══════════════════════════════════════════════════════════
-- INSERT SAMPLE PROJECTS WITH 999-ENDING PRICING
-- ═══════════════════════════════════════════════════════════

-- ══════════════════════ AI/ML ══════════════════════
INSERT INTO projects (title, description, category, year_type, price, features, is_popular) VALUES
('Face Recognition UI', 'Modern dashboard UI for a face recognition system with real-time visual feedback', 'aiml', 'major', 2199, 'Real-time Camera Feed,Canvas Overlays,User Dashboard,Profile Settings', 1),
('Object Detection Visualizer', 'Interactive web interface showing YOLO-based bounding boxes and detection results', 'aiml', 'major', 1999, 'Image Upload,Bounding Box Rendering,Confidence Scores,Export Results', 1),
('MNIST Digit Canvas', 'Drawing pad interface for digit recognition with live chart feedback', 'aiml', 'mini', 1199, 'Drawing Canvas,Smoothing Filter,Prediction Chart,Documentation', 1),
('Sentiment Meter', 'Text analysis tool with visual gauge showing positive/negative sentiment', 'aiml', 'mini', 1499, 'Text Input,Sentiment Gauge,Word Frequency,History Panel', 0),
('Iris Classifier UI', 'Responsive input form for botanical parameters with animated result card', 'aiml', 'mini', 999, 'Input Validation,Animated Result,Clean Layout,Documentation', 0),
('Fake News Detector UI', 'Clean interface for submitting headlines and viewing credibility scores', 'aiml', 'major', 1799, 'Input Form,Score Meter,Source Badge,Explanation Card', 0),
('Pose Estimation Display', 'Skeleton overlay visualization for human pose estimation models', 'aiml', 'major', 2399, 'Camera Feed,Skeleton Overlay,Joint Tracking,Dark UI', 0);

-- ══════════════════════ DATA SCIENCE ══════════════════════
INSERT INTO projects (title, description, category, year_type, price, features, is_popular) VALUES
('Global Climate Dashboard', 'Interactive visualization showing temperature trends and climate indicators', 'datascience', 'major', 2499, 'Interactive Maps,Multi-series Charts,Yearly Comparisons,Data Tables', 1),
('Olympic History Explorer', 'Infographic-style dashboard exploring historical Olympic performance data', 'datascience', 'major', 1999, 'Interactive Timeline,Country Comparisons,Medal Tally,Filters', 1),
('E-Commerce Sales Insights', 'Business dashboard for tracking revenue, products, and customer trends', 'datascience', 'major', 2199, 'KPI Cards,Category Filters,Monthly Trends,Clean Charts', 1),
('Stock Market Tracker', 'Real-time price visualization with candlestick charts and indicators', 'datascience', 'major', 2799, 'Candlestick Charts,EMA/SMA,Watchlist UI,Price Alerts', 0),
('IPL Stats Dashboard', 'Cricket analytics platform with player comparisons and match statistics', 'datascience', 'mini', 1499, 'Player Cards,Match Stats,Season Filter,Bar Charts', 0),
('COVID-19 Tracker UI', 'Clean dashboard for tracking health metrics and vaccine distribution', 'datascience', 'mini', 1199, 'Daily Stats,Heat Map,Country Filter,Documentation', 0),
('HR Analytics Report', 'Employee data visualization showing attrition and performance trends', 'datascience', 'major', 1999, 'Attrition Chart,Department Filter,KPIs,Comparison View', 0);

-- ══════════════════════ FRONTEND ══════════════════════
INSERT INTO projects (title, description, category, year_type, price, features, is_popular) VALUES
('NexGen Portfolio Website', 'Premium portfolio with 3D tilt effects, GSAP animations, and dark mode', 'frontend', 'major', 1999, 'GSAP Animations,3D Tilt,Dark Mode,SEO Optimized', 1),
('Modern E-Commerce Storefront', 'Stunning product catalog UI with cart, wishlist, and checkout animations', 'frontend', 'major', 2499, 'Product Grid,Cart,Wishlist,Responsive Design', 1),
('Food Delivery App UI', 'Mobile-first restaurant ordering interface with order tracking animations', 'frontend', 'major', 2199, 'Menu Filters,Order Tracking,Smooth Animations,Responsive', 1),
('SaaS Landing Page', 'Conversion-optimized landing page with feature sections and pricing table', 'frontend', 'mini', 1199, 'Hero Section,Pricing Table,Testimonials,Contact Form', 0),
('Minimalist Blog UI', 'Reading-focused blog interface with dark mode and typography emphasis', 'frontend', 'mini', 999, 'Reading Mode,Post Cards,Dark Mode,Mobile Ready', 0),
('Admin Dashboard UI', 'Modern analytics dashboard with sidebar, charts, tables, and KPI cards', 'frontend', 'major', 1799, 'Sidebar Nav,Charts,Data Tables,KPI Cards', 0),
('Travel Agency Website', 'Visually rich travel booking site with destination cards and gallery', 'frontend', 'major', 1999, 'Destination Cards,Gallery,Search Bar,Animated Cards', 0);

-- ══════════════════════ CYBERSECURITY ══════════════════════
INSERT INTO projects (title, description, category, year_type, price, features, is_popular) VALUES
('SecureVault PW Generator', 'Advanced client-side password generator with entropy meter and history', 'cybersecurity', 'major', 1799, 'Strength Meter,Clipboard API,History,Export Options', 1),
('Vulnerability Scanner Dashboard', 'Frontend UI showing severity levels, scan reports, and remediation tips', 'cybersecurity', 'major', 2199, 'Scan Reports,Severity Filter,PDF Export UI,Clean Dark UI', 1),
('Phishing Awareness Portal', 'Interactive quiz-based portal with cybersecurity training modules', 'cybersecurity', 'mini', 1499, 'Quiz System,Scenario Training,Progress Tracker,Certificate', 1),
('Network Monitor UI', 'Visualization dashboard for live network traffic with status indicators', 'cybersecurity', 'major', 2399, 'Live Graphs,Device Cards,Threat Levels,Clean Layout', 0),
('Hash Generator Tool', 'Browser-side MD5/SHA-256 hashing tool for text and file inputs', 'cybersecurity', 'mini', 999, 'Multiple Algorithms,File Support,Instant Results,Documentation', 0),
('Steganography Explorer', 'UI for hiding and extracting messages from images using browser APIs', 'cybersecurity', 'major', 1999, 'Image Upload,Message Embed,Extraction UI,Documentation', 0),
('Cyber Threat News Monitor', 'Dashboard aggregating cybersecurity alerts with categorized severity cards', 'cybersecurity', 'mini', 1199, 'News Grid,Severity Labels,Filter Panel,Dark Theme', 0);

-- ══════════════════════ PYTHON ══════════════════════
INSERT INTO projects (title, description, category, year_type, price, features, is_popular) VALUES
('PDF Suite UI', 'Modern interface for merging, splitting, and converting PDF documents', 'python', 'major', 1999, 'Drag and Drop,File Preview,Batch Processing,Clean Design', 1),
('Weather Hub', 'Interactive weather forecast interface with animated weather icons', 'python', 'major', 1799, 'Animated Icons,7-Day Forecast,Location Search,Hourly Details', 1),
('Unit Conversion Pro', 'Comprehensive multi-domain converter with live results and history', 'python', 'mini', 1199, 'Multi-Domain,Real-time Results,History,Clean Icons', 1),
('Inventory Tracker UI', 'Desktop-like inventory management interface for small businesses', 'python', 'major', 2199, 'Item Grid,Stock Alerts,Search Filter,Reports', 0),
('Scientific Calculator', 'Calculator UI with scientific mode, history, and keyboard support', 'python', 'mini', 999, 'Scientific Mode,Keyboard Support,History,Theme Toggle', 0),
('Expense Tracker', 'Personal finance dashboard tracking income, expenses, and savings', 'python', 'mini', 1399, 'Charts,Category Tags,Monthly View,Export CSV', 0),
('Pomodoro Timer App', 'Productivity timer with sessions, custom intervals, and sound alerts', 'python', 'mini', 999, 'Custom Timer,Session Log,Sound Alerts,Progress Ring', 0);

-- ══════════════════════ TESTIMONIALS (VISAKHAPATNAM COLLEGES) ══════════════════════

INSERT INTO reviews (student_name, college_name, year_of_study, project_name, rating, experience, pricing_review, is_approved) VALUES
('Sravani Koppula', 'Gayatri Vidya Parishad College of Engineering', '4th Year', 'Face Recognition UI', 5, 'Face Recognition UI project was clean and impressive. My internal guide appreciated the real-time dashboard!', 'Worth every rupee at ₹2199. The features felt premium for the cost.', 1),
('Teja Varma Dantuluri', 'GITAM Institute of Technology', '4th Year', 'Object Detection Visualizer', 5, 'The Object Detection Visualizer worked perfectly with YOLO results. Presentation went smoothly!', 'At ₹1999, it was affordable compared to others offering similar projects.', 1),
('Harika Pothina', 'Anil Neerukonda Institute of Technology and Sciences', '3rd Year', 'MNIST Digit Canvas', 5, 'MNIST Digit Canvas was simple yet powerful. The live prediction chart made it stand out.', '₹1199 is a great deal for a mini AI project with documentation.', 1),
('Sai Kiran Ganta', 'Vignan''s Institute of Information Technology', '4th Year', 'Global Climate Dashboard', 5, 'Global Climate Dashboard looked professional. The interactive maps impressed my panel.', '₹2499 felt reasonable for a major-level dashboard with advanced visuals.', 1),
('Likitha Chintala', 'Raghu Engineering College', '4th Year', 'Olympic History Explorer', 5, 'Olympic History Explorer had amazing visuals. My viva went confidently because of the dashboard.', 'Totally worth ₹1999 for a data-rich major project.', 1),
('Praneeth Reddy Kolli', 'Gayatri Vidya Parishad College of Engineering', '3rd Year', 'E-Commerce Sales Insights', 5, 'E-Commerce Sales Insights helped me understand KPIs clearly. Very neat UI!', '₹2199 is fair considering the dashboard quality and clean charts.', 1),
('Deepika Vempati', 'GITAM Institute of Technology', '4th Year', 'NexGen Portfolio Website', 5, 'NexGen Portfolio Website looked premium with animations and dark mode. Loved the design!', 'Just ₹1999 for a premium portfolio — excellent value.', 1),
('Abhinav Chowdary Muppala', 'Anil Neerukonda Institute of Technology and Sciences', '4th Year', 'Modern E-Commerce Storefront', 5, 'Modern E-Commerce Storefront felt like a real startup product. Faculty appreciated the responsiveness.', '₹2499 felt justified for such a complete frontend experience.', 1),
('Keerthana Alluri', 'Vignan''s Institute of Information Technology', '3rd Year', 'Food Delivery App UI', 5, 'Food Delivery App UI was smooth and mobile-friendly. Great support team!', '₹2199 is reasonable for a major frontend project with animations.', 1),
('Rohith Kumar Sunkara', 'Raghu Engineering College', '4th Year', 'SecureVault PW Generator', 5, 'SecureVault Password Generator had strong features and a clean interface. Excellent documentation.', '₹1799 is affordable for a cybersecurity major project.', 1),
('Navya Sri Bhamidipati', 'Gayatri Vidya Parishad College of Engineering', '4th Year', 'Vulnerability Scanner Dashboard', 5, 'Vulnerability Scanner Dashboard looked industry-level. The dark UI was impressive.', 'Worth ₹2199 considering the detailed reports and UI quality.', 1),
('Vamsi Krishna Yeluri', 'GITAM Institute of Technology', '3rd Year', 'Phishing Awareness Portal', 5, 'Phishing Awareness Portal was interactive and engaging. The quiz module was appreciated by my HOD.', '₹1499 is budget-friendly for an interactive cybersecurity mini project.', 1),
('Sindhu Priya Mandava', 'Anil Neerukonda Institute of Technology and Sciences', '4th Year', 'PDF Suite UI', 5, 'PDF Suite UI saved me a lot of time. Drag and drop feature worked flawlessly.', '₹1999 felt totally worth it for a professional Python UI project.', 1),
('Charan Tej Kothapalli', 'Vignan''s Institute of Information Technology', '3rd Year', 'Weather Hub', 5, 'Weather Hub had smooth animations and accurate forecast UI. Presentation went great!', '₹1799 is very reasonable for a feature-rich major project.', 1),
('Divya Lakshmi Pilla', 'Raghu Engineering College', '4th Year', 'Unit Conversion Pro', 5, 'Unit Conversion Pro was simple yet professional. Clean icons and live results made it impressive.', '₹1199 is a steal for such a clean and useful mini project.', 1);

SELECT 'Database setup complete with updated 999-ending pricing and Visakhapatnam testimonials!' AS Status;
SELECT COUNT(*) AS 'Total Projects' FROM projects;
SELECT COUNT(*) AS 'Total Reviews' FROM reviews;