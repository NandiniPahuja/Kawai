require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Import routes
const taskRoutes = require('./routes/tasks');
const noteRoutes = require('./routes/notes');
const eventRoutes = require('./routes/events');
const moodRoutes = require('./routes/moods');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize Prisma client
const prisma = new PrismaClient();

// Test database connection
async function testDbConnection() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    console.log('Please check your DATABASE_URL in .env file and ensure your database is running.');
    console.log('If using Neon Tech, verify that your database is active and credentials are correct.');
  }
}

testDbConnection();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'kawaii-secret-key';

// Routes
// Rate limiter for signup endpoint
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many signup attempts from this IP, please try again after 15 minutes.' }
});
// Register new user
app.post('/api/register', signupLimiter, async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    
    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email }
    });
    
    if (userExists) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        theme: 'pastel'
      }
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        theme: newUser.theme
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        theme: user.theme,
        moodToday: user.moodToday
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Protected route example
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        theme: user.theme,
        moodToday: user.moodToday
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
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
}

// User mood update
app.post('/api/user/mood', authenticateToken, async (req, res) => {
  try {
    const { mood } = req.body;
    
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { moodToday: mood }
    });
    
    res.json({
      message: 'Mood updated successfully',
      mood: updatedUser.moodToday
    });
  } catch (error) {
    console.error('Mood update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User theme update
app.post('/api/user/theme', authenticateToken, async (req, res) => {
  try {
    const { theme } = req.body;
    
    if (!theme) {
      return res.status(400).json({ error: 'Theme is required' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { theme }
    });
    
    res.json({
      message: 'Theme updated successfully',
      theme: updatedUser.theme
    });
  } catch (error) {
    console.error('Theme update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register API routes
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/moods', moodRoutes);

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.log('The server will continue running, but please fix the error.');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('The server will continue running, but please fix the error.');
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} in your browser`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port.`);
  } else {
    console.error('Server error:', error);
  }
});