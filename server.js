require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Check required env vars
if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  throw new Error("Missing required environment variables (JWT_SECRET or DATABASE_URL).");
}

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

// Test DB connection
(async () => {
  try {
    // No need to explicitly connect, Prisma does this lazily
    // await prisma.$connect(); 
    console.log('Prisma client initialized. Connection will be established on first query.');
  } catch (err) {
    console.error('❌ Error during initial Prisma setup (though connection is lazy):', err);
  }
})();

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Kawai API is operational',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Rate limiter
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many signup attempts. Try again in 15 minutes.' }
});

// Register
app.post('/api/register', signupLimiter, async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ error: 'All fields required' });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, email, password: hashed, theme: 'pastel' }
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'User registered',
      user: { id: user.id, fullName: user.fullName, email: user.email, theme: user.theme },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      user: { id: user.id, fullName: user.fullName, email: user.email, theme: user.theme, moodToday: user.moodToday },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected user route
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mood update
app.post('/api/user/mood', authenticateToken, async (req, res) => {
  try {
    const { mood } = req.body;
    if (!mood) return res.status(400).json({ error: 'Mood is required' });

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { moodToday: mood }
    });

    res.json({ message: 'Mood updated', mood: updated.moodToday });
  } catch (err) {
    console.error('Mood update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Theme update
app.post('/api/user/theme', authenticateToken, async (req, res) => {
  try {
    const { theme } = req.body;
    if (!theme) return res.status(400).json({ error: 'Theme is required' });

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { theme }
    });

    res.json({ message: 'Theme updated', theme: updated.theme });
  } catch (err) {
    console.error('Theme update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mount other route modules
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/events', require('./routes/events'));
app.use('/api/moods', require('./routes/moods'));

// Global error handling
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} in use. Use a different one.`);
  } else {
    console.error('Server error:', err);
  }
});
