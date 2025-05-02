require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET;

// Validate environment variables
if (!JWT_SECRET || !process.env.DATABASE_URL) {
  console.error("❌ Missing required environment variables (JWT_SECRET or DATABASE_URL).");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Lazy DB connection confirmation
console.log('✅ Prisma client initialized. Connection will be established on first query.');

// Utility to catch async route errors
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

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

// Rate limiter for signup
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many signup attempts. Try again in 15 minutes.' }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Kawaii API is operational',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Register
app.post('/api/register', signupLimiter, asyncHandler(async (req, res) => {
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
}));

// Login
app.post('/api/login', asyncHandler(async (req, res) => {
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
}));

// Get user
app.get('/api/user', authenticateToken, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ user });
}));

// Mood update
app.post('/api/user/mood', authenticateToken, asyncHandler(async (req, res) => {
  const { mood } = req.body;
  if (!mood) return res.status(400).json({ error: 'Mood is required' });

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { moodToday: mood }
  });

  res.json({ message: 'Mood updated', mood: updated.moodToday });
}));

// Theme update
app.post('/api/user/theme', authenticateToken, asyncHandler(async (req, res) => {
  const { theme } = req.body;
  if (!theme) return res.status(400).json({ error: 'Theme is required' });

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { theme }
  });

  res.json({ message: 'Theme updated', theme: updated.theme });
}));

// Mount routes with try-catch in case of module errors
try {
  app.use('/api/tasks', require('./routes/tasks'));
  app.use('/api/notes', require('./routes/notes'));
  app.use('/api/events', require('./routes/events'));
  app.use('/api/moods', require('./routes/moods'));
} catch (err) {
  console.error('❌ Failed to mount route modules:', err);
}

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Uncaught error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
  } else {
    console.error('❌ Server error:', err);
  }
});

// Handle fatal process-level errors
process.on('uncaughtException', err => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('❌ Unhandled Rejection at:', p, 'reason:', reason);
});
