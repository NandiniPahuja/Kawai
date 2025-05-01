const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');

// Middleware to protect routes
router.use(auth);

// GET /moods - Get all mood entries for the logged-in user
router.get('/', async (req, res) => {
  try {
    const { limit } = req.query;
    const userId = req.user.id;
    
    const moods = await prisma.moodEntry.findMany({
      where: { userId },
      orderBy: {
        date: 'desc'
      },
      ...(limit ? { take: parseInt(limit) } : {})
    });
    
    res.json(moods);
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    res.status(500).json({ error: 'Failed to fetch mood entries' });
  }
});

// GET /moods/today - Get today's mood entry if it exists
router.get('/today', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const moodEntry = await prisma.moodEntry.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    if (!moodEntry) {
      return res.status(404).json({ error: 'No mood entry for today' });
    }
    
    res.json(moodEntry);
  } catch (error) {
    console.error('Error fetching today\'s mood:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s mood' });
  }
});

// POST /moods - Create a new mood entry
router.post('/', async (req, res) => {
  try {
    const { mood, note } = req.body;
    const userId = req.user.id;
    
    // Validate mood value
    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({ error: 'Mood must be a value between 1 and 5' });
    }
    
    // Check if user already has a mood entry for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingMood = await prisma.moodEntry.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    let moodEntry;
    
    if (existingMood) {
      // Update existing mood entry
      moodEntry = await prisma.moodEntry.update({
        where: { id: existingMood.id },
        data: { mood, note }
      });
    } else {
      // Create new mood entry
      moodEntry = await prisma.moodEntry.create({
        data: {
          mood,
          note,
          userId
        }
      });
    }
    
    // Also update user's current mood
    await prisma.user.update({
      where: { id: userId },
      data: { moodToday: mood.toString() }
    });
    
    res.status(201).json(moodEntry);
  } catch (error) {
    console.error('Error creating mood entry:', error);
    res.status(500).json({ error: 'Failed to create mood entry' });
  }
});

// GET /moods/stats - Get mood statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const { period } = req.query; // week, month, year
    
    let startDate;
    const now = new Date();
    
    // Calculate start date based on period
    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // Default to last 30 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    }
    
    // Get all mood entries in the period
    const moodEntries = await prisma.moodEntry.findMany({
      where: {
        userId,
        date: {
          gte: startDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Calculate statistics
    const stats = {
      average: 0,
      highest: 0,
      lowest: 5,
      count: moodEntries.length,
      distribution: {
        1: 0, // Very sad
        2: 0, // Sad
        3: 0, // Neutral
        4: 0, // Happy
        5: 0  // Very happy
      }
    };
    
    if (moodEntries.length > 0) {
      let sum = 0;
      
      moodEntries.forEach(entry => {
        sum += entry.mood;
        stats.highest = Math.max(stats.highest, entry.mood);
        stats.lowest = Math.min(stats.lowest, entry.mood);
        stats.distribution[entry.mood]++;
      });
      
      stats.average = sum / moodEntries.length;
    }
    
    res.json({
      stats,
      entries: moodEntries
    });
  } catch (error) {
    console.error('Error fetching mood statistics:', error);
    res.status(500).json({ error: 'Failed to fetch mood statistics' });
  }
});

module.exports = router;