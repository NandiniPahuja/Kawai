const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');

// Middleware to protect routes
router.use(auth);

// GET /tasks - Get all tasks for the logged-in user
router.get('/', async (req, res) => {
  try {
    const { filter, dueToday } = req.query;
    const userId = req.user.id;
    
    let whereClause = { userId };
    
    // Apply filters if provided
    if (filter === 'completed') {
      whereClause.status = 'completed';
    } else if (filter === 'pending') {
      whereClause.status = 'pending';
    }
    
    // Filter for tasks due today
    if (dueToday === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      whereClause.dueDate = {
        gte: today,
        lt: tomorrow
      };
    }
    
    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: {
        dueDate: 'asc'
      }
    });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /tasks/today - Get all tasks due today for the logged-in user
router.get('/today', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        dueDate: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: {
        timeOfDay: 'asc'
      }
    });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching today\'s tasks:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s tasks' });
  }
});

// GET /tasks/deadlines - Get important tasks with upcoming deadlines
router.get('/deadlines', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get date 7 days from now
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        isImportant: true,
        dueDate: {
          gte: today,
          lte: nextWeek
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching deadline tasks:', error);
    res.status(500).json({ error: 'Failed to fetch deadline tasks' });
  }
});

// GET /tasks/weekly - Get tasks grouped by day for the current week
router.get('/weekly', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get the start of the current week (Monday)
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const diff = currentDay === 0 ? 6 : currentDay - 1; // Adjust for starting week on Monday
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        dueDate: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });
    
    // Group tasks by day of the week
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const groupedTasks = {};
    
    weekdays.forEach(day => {
      groupedTasks[day] = {
        count: 0,
        tasks: []
      };
    });
    
    tasks.forEach(task => {
      const taskDate = new Date(task.dueDate);
      const dayIndex = taskDate.getDay() === 0 ? 6 : taskDate.getDay() - 1; // Adjust for starting week on Monday
      const dayName = weekdays[dayIndex];
      
      groupedTasks[dayName].count++;
      groupedTasks[dayName].tasks.push(task);
    });
    
    res.json(groupedTasks);
  } catch (error) {
    console.error('Error fetching weekly tasks:', error);
    res.status(500).json({ error: 'Failed to fetch weekly tasks' });
  }
});

// POST /tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, status, timeOfDay, isImportant, eventId } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!title || !dueDate) {
      return res.status(400).json({ error: 'Title and due date are required' });
    }
    
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        status: status || 'pending',
        timeOfDay,
        isImportant: isImportant || false,
        userId,
        eventId
      }
    });
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /tasks/:id - Update a task
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, status, timeOfDay, isImportant, eventId } = req.body;
    const userId = req.user.id;
    
    // Check if task exists and belongs to the user
    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (existingTask.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }
    
    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
        timeOfDay,
        isImportant,
        eventId
      }
    });
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if task exists and belongs to the user
    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (existingTask.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }
    
    // Delete the task
    await prisma.task.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;