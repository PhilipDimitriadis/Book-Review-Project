const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bookreviewdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to bookreviewdb successfully!');
        connection.release();
    } catch (error) {
        console.error('Error connecting to MySQL database:', error);
        process.exit(1);
    }
}

testConnection();

app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password] // Note: In production, hash the password!
        );

        res.status(201).json({
            id: result.insertId,
            username,
            email,
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'Username or email already exists' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.use(express.urlencoded({ extended: true }));

app.post('/api/login/access-token', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ detail: 'Username and password are required' });
        }

        const [rows] = await pool.execute(
            'SELECT id, username, email FROM users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ detail: 'Invalid username or password' });
        }

        res.json({
            access_token: `token_${rows[0].id}_${Date.now()}`, // Simple token for development
            token_type: 'bearer'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const [rows] = await pool.execute('SELECT id, username, email FROM users WHERE email = ? AND password = ?', [email, password]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.json({
            user: rows[0],
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
      SELECT r.*, u.username 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      ORDER BY r.created_at DESC
    `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/reviews/book/:bookId', async (req, res) => {
    try {
        const { bookId } = req.params;
        const [rows] = await pool.execute(`
      SELECT r.*, u.username 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.external_book_id = ? 
      ORDER BY r.created_at DESC
    `, [bookId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/reviews/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await pool.execute(`
      SELECT r.*, u.username 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.user_id = ? 
      ORDER BY r.created_at DESC
    `, [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const { external_book_id, book_title, book_author, user_id, rating, comment } = req.body;

        if (!external_book_id || !user_id || !rating) {
            return res.status(400).json({ error: 'External book ID, user ID, and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Check if user already reviewed this book
        const [existing] = await pool.execute(
            'SELECT id FROM reviews WHERE external_book_id = ? AND user_id = ?',
            [external_book_id, user_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'You have already reviewed this book' });
        }

        const [result] = await pool.execute(
            'INSERT INTO reviews (external_book_id, book_title, book_author, user_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)',
            [external_book_id, book_title, book_author, user_id, rating, comment]
        );

        res.status(201).json({
            id: result.insertId,
            external_book_id,
            book_title,
            book_author,
            user_id,
            rating,
            comment,
            message: 'Review created successfully'
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const [result] = await pool.execute(
            'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
            [rating, comment, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json({ message: 'Review updated successfully' });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/books/:bookId/stats', async (req, res) => {
    try {
        const { bookId } = req.params;

        const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as review_count,
        ROUND(AVG(rating), 1) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_stars,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_stars,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_stars,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_stars,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_stars
      FROM reviews 
      WHERE external_book_id = ?
    `, [bookId]);

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching book stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/favorites/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await pool.execute(`
      SELECT f.*, u.username 
      FROM favorites f 
      JOIN users u ON f.user_id = u.id 
      WHERE f.user_id = ? 
      ORDER BY f.created_at DESC
    `, [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/favorites', async (req, res) => {
    try {
        const { user_id, external_book_id, book_title, book_author } = req.body;

        if (!user_id || !external_book_id) {
            return res.status(400).json({ error: 'User ID and book ID are required' });
        }

        const [existing] = await pool.execute(
            'SELECT id FROM favorites WHERE user_id = ? AND external_book_id = ?',
            [user_id, external_book_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Book already in favorites' });
        }

        const [result] = await pool.execute(
            'INSERT INTO favorites (user_id, external_book_id, book_title, book_author) VALUES (?, ?, ?, ?)',
            [user_id, external_book_id, book_title, book_author]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Book added to favorites'
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/favorites/:userId/:bookId', async (req, res) => {
    try {
        const { userId, bookId } = req.params;

        const [result] = await pool.execute(
            'DELETE FROM favorites WHERE user_id = ? AND external_book_id = ?',
            [userId, bookId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        res.json({ message: 'Book removed from favorites' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'User & Reviews API server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`User & Reviews API server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await pool.end();
    process.exit(0);
});