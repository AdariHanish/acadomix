const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('');
        console.log('⚠️  Please make sure:');
        console.log('   1. MySQL is running');
        console.log('   2. Database "acadomix" exists');
        console.log('   3. Password in server/config/db.js is correct');
        console.log('   4. Run the schema.sql file to create tables');
        console.log('');
    }
}
testConnection();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
// Removed static uploads for Vercel compatibility


// Multer configuration for file uploads - Using memory storage for Vercel
const storage = multer.memoryStorage();


const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ==================== AUTH ROUTES ====================
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Use environment variables for admin credentials
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
            return res.json({ success: true, token, message: 'Login successful' });
        }

        res.status(401).json({ success: false, error: 'Invalid credentials' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

app.get('/api/admin/verify', authenticateToken, (req, res) => {
    res.json({ success: true, user: req.user });
});

// Diagnostic Endpoint to check DB Connection on Vercel
app.get('/api/test-db', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT 1 as connected');
        connection.release();
        res.json({
            success: true,
            message: 'Successfully connected to database!',
            env_check: {
                host: process.env.DB_HOST ? 'Present' : 'MISSING',
                user: process.env.DB_USER ? 'Present' : 'MISSING',
                db: process.env.DB_NAME ? 'Present' : 'MISSING'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            tip: 'Check your Vercel Environment Variables and Aiven IP allowlist.'
        });
    }
});

// Asset Configuration Endpoint (to hide sensitive image URLs)
app.get('/api/assets-config', (req, res) => {
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.json({
        logo: '/api/assets/logo',
        qr_code: '/api/assets/qr_code'
    });
});

// Dynamic Asset Serving Endpoint (from DB)
app.get('/api/assets/:name', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT data, mime_type FROM app_assets WHERE asset_name = ?',
            [req.params.name]
        );

        if (rows.length === 0) {
            // Fallback to local file if DB is empty
            const filePath = path.join(__dirname, '../public/images', req.params.name === 'logo' ? 'logo.png' : 'qr-code.png');
            if (fs.existsSync(filePath)) {
                return res.sendFile(filePath);
            }
            return res.status(404).send('Asset not found');
        }

        const asset = rows[0];
        res.set('Content-Type', asset.mime_type);
        res.set('Cache-Control', 'public, max-age=2592000'); // Cache for 30 days
        res.send(asset.data);
    } catch (error) {
        console.error('Error serving asset:', error);
        res.status(500).send('Server Error');
    }
});

// ==================== LEADS ROUTES ====================
app.post('/api/leads', async (req, res) => {
    try {
        const { name, college, branch, project_domain, budget, deadline, phone, message } = req.body;

        if (!name || !college || !branch || !project_domain || !budget || !deadline || !phone) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }

        const [result] = await pool.execute(
            'INSERT INTO leads (name, college, branch, project_domain, budget, deadline, phone, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, college, branch, project_domain, budget, deadline, phone, message || '']
        );

        console.log('📬 New lead received:', name);
        res.json({ success: true, id: result.insertId, message: 'Form submitted successfully!' });
    } catch (error) {
        console.error('Lead submission error:', error);
        res.status(500).json({ error: 'Failed to submit form. Please try again.' });
    }
});

app.get('/api/leads', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM leads ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

app.put('/api/leads/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['new', 'contacted', 'in_progress', 'completed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await pool.execute('UPDATE leads SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating lead status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

app.delete('/api/leads/:id', authenticateToken, async (req, res) => {
    try {
        await pool.execute('DELETE FROM leads WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});

// ==================== PROJECTS ROUTES ====================
app.get('/api/projects', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM projects ORDER BY is_popular DESC, created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
    try {
        const { title, description, category, year_type, price, features, is_popular } = req.body;

        if (!title || !category || !year_type || !price) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        // Convert to 1 or 0 for MySQL
        const popularValue = is_popular === true || is_popular === 'true' || is_popular === 1 ? 1 : 0;

        const [result] = await pool.execute(
            'INSERT INTO projects (title, description, category, year_type, price, features, is_popular) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description || '', category, year_type, price, features || '', popularValue]
        );

        console.log('📁 New project added:', title);
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error adding project:', error);
        res.status(500).json({ error: 'Failed to add project' });
    }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { title, description, category, year_type, price, features, is_popular } = req.body;
        await pool.execute(
            'UPDATE projects SET title=?, description=?, category=?, year_type=?, price=?, features=?, is_popular=? WHERE id=?',
            [title, description, category, year_type, price, features, is_popular ? 1 : 0, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        await pool.execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// ==================== PAYMENTS ROUTES ====================
app.post('/api/payments', upload.single('screenshot'), async (req, res) => {
    try {
        const { student_name, phone, project_name, amount } = req.body;

        if (!student_name || !phone || !project_name || !amount) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const screenshot_path = req.file ? req.file.originalname : null;
        const screenshot_data = req.file ? req.file.buffer : null;
        const mime_type = req.file ? req.file.mimetype : null;

        const [result] = await pool.execute(
            'INSERT INTO payments (student_name, phone, project_name, amount, screenshot_path, screenshot_data, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [student_name, phone, project_name, amount, screenshot_path, screenshot_data, mime_type]
        );

        console.log('💳 New payment received from:', student_name);
        res.json({ success: true, id: result.insertId, message: 'Payment submitted for verification!' });
    } catch (error) {
        console.error('Error submitting payment:', error);
        res.status(500).json({ error: 'Failed to submit payment' });
    }
});

app.get('/api/payments', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM payments ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

app.put('/api/payments/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'verified', 'rejected'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await pool.execute('UPDATE payments SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

app.get('/api/payment-screenshot/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT screenshot_data, mime_type FROM payments WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0 || !rows[0].screenshot_data) {
            return res.status(404).send('Screenshot not found');
        }

        const payment = rows[0];
        res.set('Content-Type', payment.mime_type);
        res.send(payment.screenshot_data);
    } catch (error) {
        console.error('Error serving payment screenshot:', error);
        res.status(500).send('Server Error');
    }
});

// ==================== REVIEWS ROUTES ====================
app.post('/api/reviews', async (req, res) => {
    try {
        const { student_name, college_name, year_of_study, project_name, rating, experience, pricing_review } = req.body;

        if (!student_name || !college_name || !year_of_study || !project_name || !rating || !experience) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const [result] = await pool.execute(
            'INSERT INTO reviews (student_name, college_name, year_of_study, project_name, rating, experience, pricing_review, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [student_name, college_name, year_of_study, project_name, parseInt(rating), experience, pricing_review || '', 0]
        );

        console.log('⭐ New review received from:', student_name);
        res.json({ success: true, id: result.insertId, message: 'Review submitted! Will be visible after approval.' });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

// Admin manual review submission (approved by default)
app.post('/api/reviews/admin', authenticateToken, async (req, res) => {
    try {
        const { student_name, college_name, year_of_study, project_name, rating, experience } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO reviews (student_name, college_name, year_of_study, project_name, rating, experience, is_approved) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [student_name, college_name, year_of_study, project_name, parseInt(rating), experience]
        );
        
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error adding admin review:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

app.get('/api/reviews/all', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM reviews ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

app.put('/api/reviews/:id/approve', authenticateToken, async (req, res) => {
    try {
        const { is_approved } = req.body;
        const approvedValue = is_approved === true || is_approved === 'true' || is_approved === 1 ? 1 : 0;

        await pool.execute('UPDATE reviews SET is_approved = ? WHERE id = ?', [approvedValue, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Failed to update review' });
    }
});

app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
    try {
        await pool.execute('DELETE FROM reviews WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

// ==================== STATS ROUTES ====================
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const [leads] = await pool.execute('SELECT COUNT(*) as count FROM leads');
        const [payments] = await pool.execute('SELECT COUNT(*) as count FROM payments WHERE status = "verified"');
        const [projects] = await pool.execute('SELECT COUNT(*) as count FROM projects');
        const [reviews] = await pool.execute('SELECT COUNT(*) as count FROM reviews WHERE is_approved = 1');
        const [pendingPayments] = await pool.execute('SELECT COUNT(*) as count FROM payments WHERE status = "pending"');
        const [newLeads] = await pool.execute('SELECT COUNT(*) as count FROM leads WHERE status = "new"');

        res.json({
            totalLeads: leads[0].count,
            verifiedPayments: payments[0].count,
            totalProjects: projects[0].count,
            approvedReviews: reviews[0].count,
            pendingPayments: pendingPayments[0].count,
            newLeads: newLeads[0].count
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ==================== SETTINGS ROUTES ====================
app.get('/api/settings', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT setting_key, setting_value FROM site_settings');
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.put('/api/settings', authenticateToken, async (req, res) => {
    try {
        const settings = req.body;
        
        for (const [key, value] of Object.entries(settings)) {
            await pool.execute(
                'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
                [key, String(value)]
            );
        }
        
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Database error while updating settings',
            details: error.message 
        });
    }
});

// ==================== SERVE HTML PAGES ====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/login.html'));
});

// Handle 404 - redirect to home
app.use((req, res) => {
    res.redirect('/');
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server and Export for Vercel Serverless
// Start server locally OR export for Vercel
if (require.main === module) {
    app.listen(PORT, () => {
        console.log('');
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║              🌐 Acadomix is LIVE!                         ║');
        console.log('║                                                           ║');
        console.log(`║   Local:  http://localhost:${PORT}                          ║`);
        console.log('║   Admin:  http://localhost:${PORT}/admin                    ║');
        console.log('║                                                           ║');
        console.log('║     ─────────────────────────────────────────────────     ║');
        console.log('║     📧 Email:    acadomix@gmail.com                       ║');
        console.log('║     📱 WhatsApp: 8897492936                               ║');
        console.log('║                                                           ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('');
    });
}

module.exports = app;
