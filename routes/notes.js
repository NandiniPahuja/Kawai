const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');

// Middleware to protect routes
router.use(auth);

// GET /notes - Get all notes for the logged-in user
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const userId = req.user.id;
    
    let whereClause = { userId };
    
    // Apply category filter if provided
    if (category) {
      whereClause.category = category;
    }
    
    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// GET /notes/:id - Get a specific note
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const note = await prisma.note.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    if (note.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to access this note' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// POST /notes - Create a new note
router.post('/', async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const note = await prisma.note.create({
      data: {
        title,
        content,
        category,
        userId
      }
    });
    
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PATCH /notes/:id - Update a note
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const userId = req.user.id;
    
    // Check if note exists and belongs to the user
    const existingNote = await prisma.note.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    if (existingNote.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this note' });
    }
    
    // Update the note
    const updatedNote = await prisma.note.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        category
      }
    });
    
    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /notes/:id - Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if note exists and belongs to the user
    const existingNote = await prisma.note.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    if (existingNote.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this note' });
    }
    
    // Delete the note
    await prisma.note.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;