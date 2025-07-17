const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Database configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'tiwari-studio-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize database tables
async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role VARCHAR(20) DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                service_type VARCHAR(50) NOT NULL,
                event_date DATE NOT NULL,
                event_time TIME NOT NULL,
                location VARCHAR(255),
                guest_count INTEGER,
                special_requests TEXT,
                budget_range VARCHAR(50),
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS gallery_images (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                description TEXT,
                category VARCHAR(50) NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                thumbnail_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS frames (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                material VARCHAR(50) NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                base_price DECIMAL(10,2) NOT NULL,
                stock INTEGER DEFAULT 0,
                is_popular BOOLEAN DEFAULT false,
                is_premium BOOLEAN DEFAULT false,
                is_new BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS frame_sizes (
                id SERIAL PRIMARY KEY,
                frame_id INTEGER REFERENCES frames(id) ON DELETE CASCADE,
                size_name VARCHAR(20) NOT NULL,
                price DECIMAL(10,2) NOT NULL
            )
        `);

        // Create admin user if doesn't exist
        const adminExists = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
        if (adminExists.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(`
                INSERT INTO users (username, email, password, full_name, role) 
                VALUES ($1, $2, $3, $4, $5)
            `, ['admin', 'admin@tiwaristudio.com', hashedPassword, 'Administrator', 'admin']);
            console.log('Admin user created: username=admin, password=admin123');
        }

        // Insert sample gallery images
        const galleryExists = await pool.query('SELECT COUNT(*) FROM gallery_images');
        if (parseInt(galleryExists.rows[0].count) === 0) {
            const sampleImages = [
                ['Beautiful Wedding', 'Outdoor ceremony with stunning natural lighting', 'wedding', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80'],
                ['Romantic Pre-Wedding', 'Intimate moments captured in golden hour', 'pre-wedding', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=500&q=80'],
                ['Expecting Joy', 'Beautiful maternity session celebrating new life', 'maternity', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80'],
                ['New Arrival', 'Gentle newborn photography with soft lighting', 'baby', 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=500&q=80'],
                ['Fashion Portrait', 'Professional fashion photography with dramatic lighting', 'fashion', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=80'],
                ['Corporate Event', 'Professional event coverage and candid moments', 'freelance', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&q=80']
            ];

            for (const [title, description, category, imageUrl] of sampleImages) {
                await pool.query(`
                    INSERT INTO gallery_images (title, description, category, image_url, thumbnail_url)
                    VALUES ($1, $2, $3, $4, $5)
                `, [title, description, category, imageUrl, imageUrl]);
            }
        }

        // Insert sample frames
        const framesExists = await pool.query('SELECT COUNT(*) FROM frames');
        if (parseInt(framesExists.rows[0].count) === 0) {
            const sampleFrames = [
                ['Classic Wooden Frame', 'Premium handcrafted wooden frame perfect for wedding portraits', 'wood', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', 2500, 50, true, false, false],
                ['Modern Metal Frame', 'Sleek aluminum frame with contemporary design', 'metal', 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80', 1800, 30, false, false, false],
                ['Vintage Gold Frame', 'Ornate gold-finished frame for special memories', 'vintage', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80', 3500, 20, false, true, false],
                ['Crystal Clear Acrylic', 'Premium acrylic glass with modern aesthetics', 'acrylic', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80', 2200, 25, false, false, true]
            ];

            for (const [name, description, material, imageUrl, basePrice, stock, isPopular, isPremium, isNew] of sampleFrames) {
                const result = await pool.query(`
                    INSERT INTO frames (name, description, material, image_url, base_price, stock, is_popular, is_premium, is_new)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
                `, [name, description, material, imageUrl, basePrice, stock, isPopular, isPremium, isNew]);

                const frameId = result.rows[0].id;
                
                // Add sizes for each frame
                const sizes = [
                    ['8x10', basePrice],
                    ['12x16', basePrice + 700],
                    ['16x20', basePrice + 1500]
                ];

                for (const [sizeName, price] of sizes) {
                    await pool.query(`
                        INSERT INTO frame_sizes (frame_id, size_name, price)
                        VALUES ($1, $2, $3)
                    `, [frameId, sizeName, price]);
                }
            }
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

function requireAdmin(req, res, next) {
    if (req.session && req.session.userId && req.session.userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
}

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;

        // Validate input
        if (!username || !email || !password || !fullName) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(`
            INSERT INTO users (username, email, password, full_name, role)
            VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, full_name, role
        `, [username, email, hashedPassword, fullName, 'customer']);

        const user = result.rows[0];

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Find user
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create session
        req.session.userId = user.id;
        req.session.userRole = user.role;

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.json({ message: 'Logout successful' });
    });
});

app.get('/api/auth/user', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, full_name, role FROM users WHERE id = $1',
            [req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            role: user.role
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Gallery routes
app.get('/api/gallery', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM gallery_images ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Gallery fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Frames routes
app.get('/api/frames', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT f.*, 
                   json_agg(json_build_object('size', fs.size_name, 'price', fs.price)) as sizes
            FROM frames f
            LEFT JOIN frame_sizes fs ON f.id = fs.frame_id
            GROUP BY f.id
            ORDER BY f.created_at DESC
        `);
        
        const frames = result.rows.map(frame => ({
            id: frame.id,
            name: frame.name,
            description: frame.description,
            material: frame.material,
            imageUrl: frame.image_url,
            basePrice: parseFloat(frame.base_price),
            stock: frame.stock,
            popular: frame.is_popular,
            premium: frame.is_premium,
            new: frame.is_new,
            sizes: frame.sizes.filter(size => size.size !== null)
        }));
        
        res.json(frames);
    } catch (error) {
        console.error('Frames fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Booking routes
app.post('/api/bookings', async (req, res) => {
    try {
        const {
            fullName, email, phone, serviceType, eventDate, eventTime,
            location, guestCount, specialRequests, budgetRange
        } = req.body;

        const userId = req.session && req.session.userId ? req.session.userId : null;

        const result = await pool.query(`
            INSERT INTO bookings (user_id, full_name, email, phone, service_type, event_date, event_time, location, guest_count, special_requests, budget_range)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
        `, [userId, fullName, email, phone, serviceType, eventDate, eventTime, location, guestCount, specialRequests, budgetRange]);

        res.status(201).json({
            message: 'Booking submitted successfully',
            booking: result.rows[0]
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin routes
app.get('/api/admin/bookings', requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, u.username, u.email as user_email
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            ORDER BY b.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Admin bookings fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, username, email, full_name, role, created_at
            FROM users
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Admin users fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', requireAuth, requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Initialize database and start server
initializeDatabase().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Admin credentials: username=admin, password=admin123');
    });
});

module.exports = app;