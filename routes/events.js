const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');

// Middleware to protect routes
router.use(auth);

// GET /events - Get all events for the logged-in user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const events = await prisma.event.findMany({
      where: { userId },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /events/:id - Get a specific event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        tasks: true
      }
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to access this event' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /events - Create a new event
router.post('/', async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ error: 'Title, start date, and end date are required' });
    }
    
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId
      }
    });
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PATCH /events/:id - Update an event
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate } = req.body;
    const userId = req.user.id;
    
    // Check if event exists and belongs to the user
    const existingEvent = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (existingEvent.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }
    
    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      }
    });
    
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /events/:id - Delete an event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if event exists and belongs to the user
    const existingEvent = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (existingEvent.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }
    
    // Delete the event
    await prisma.event.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;