const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kawaii-secret-key');
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};