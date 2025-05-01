document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        // Redirect to login page if not logged in
        window.location.href = 'index.html';
        return;
    }
    
    // Update user name in the sidebar and welcome message
    if (user && user.fullName) {
        const userNameElement = document.getElementById('userName');
        const welcomeMessage = document.getElementById('welcomeMessage');
        
        if (userNameElement) userNameElement.textContent = user.fullName;
        
        // Set welcome message based on time of day
        if (welcomeMessage) {
            const hour = new Date().getHours();
            let greeting = 'Good Morning';
            let emoji = '☀️';
            
            if (hour >= 12 && hour < 18) {
                greeting = 'Good Afternoon';
                emoji = '🌤️';
            } else if (hour >= 18) {
                greeting = 'Good Evening';
                emoji = '🌙';
            }
            
            welcomeMessage.textContent = `${greeting}, ${user.fullName}! ${emoji}`;
        }
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
    
    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            navItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
            
            // Animate pet when navigation changes
            animatePet();
        });
    });
    
    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const toggleThumb = document.querySelector('.toggle-thumb');
    let isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Apply saved theme preference
    if (isDarkMode && toggleThumb) {
        applyDarkMode();
    }
    
    if (themeToggle && toggleThumb) {
        themeToggle.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            
            if (isDarkMode) {
                applyDarkMode();
            } else {
                applyLightMode();
            }
            
            // Save theme preference
            localStorage.setItem('darkMode', isDarkMode);
        });
    }
    
    function applyDarkMode() {
        toggleThumb.classList.add('dark');
        document.body.style.background = 'linear-gradient(135deg, #424242 0%, #303030 50%, #212121 100%)';
        document.querySelectorAll('.content-card, .sidebar').forEach(el => {
            el.style.backgroundColor = 'rgba(48, 48, 48, 0.8)';
            el.style.color = '#e0e0e0';
        });
        document.querySelectorAll('h1, h2, h3, h4, .text-gray-800').forEach(el => {
            el.style.color = '#e0e0e0';
        });
        document.querySelectorAll('.text-gray-600, .text-gray-700').forEach(el => {
            el.style.color = '#b0b0b0';
        });
    }
    
    function applyLightMode() {
        toggleThumb.classList.remove('dark');
        document.body.style.background = 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e1f5fe 100%)';
        document.querySelectorAll('.content-card, .sidebar').forEach(el => {
            el.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            el.style.color = 'inherit';
        });
        document.querySelectorAll('h1, h2, h3, h4, .text-gray-800').forEach(el => {
            el.style.color = '#1f2937';
        });
        document.querySelectorAll('.text-gray-600, .text-gray-700').forEach(el => {
            el.style.color = '#4b5563';
        });
    }
    
    // Pet animation
    const petCompanion = document.getElementById('petCompanion');
    if (petCompanion) {
        petCompanion.addEventListener('click', animatePet);
    }
    
    function animatePet() {
        if (!petCompanion) return;
        
        // Add bounce animation
        petCompanion.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
        petCompanion.style.transform = 'translateY(-20px)';
        
        // Create sparkle effect
        createSparkle();
        
        // Reset after animation
        setTimeout(() => {
            petCompanion.style.transform = 'translateY(0)';
        }, 500);
    }
    
    function createSparkle() {
        if (!petCompanion) return;
        
        const sparkleCount = 5;
        const petRect = petCompanion.getBoundingClientRect();
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.classList.add('sparkle');
            sparkle.innerHTML = '✨';
            sparkle.style.fontSize = `${Math.random() * 10 + 10}px`;
            sparkle.style.left = `${petRect.left + Math.random() * petRect.width}px`;
            sparkle.style.top = `${petRect.top + Math.random() * petRect.height / 2}px`;
            sparkle.style.opacity = '1';
            sparkle.style.transform = 'translateY(0)';
            sparkle.style.transition = 'all 1s ease';
            
            document.body.appendChild(sparkle);
            
            // Animate and remove sparkle
            setTimeout(() => {
                sparkle.style.opacity = '0';
                sparkle.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    sparkle.remove();
                }, 1000);
            }, 100);
        }
    }
    
    // Initialize React Calendar
    const calendarContainer = document.getElementById('calendarContainer');
    if (calendarContainer && window.React && window.ReactDOM && window.ReactCalendar) {
        const Calendar = window.ReactCalendar.Calendar;
        
        // Sample task data for calendar
        const tasksByDate = {
            '2023-09-15': { count: 3, priority: 'high' },
            '2023-09-18': { count: 2, priority: 'medium' },
            '2023-09-20': { count: 1, priority: 'low' }
        };
        
        // Custom tile content to show task indicators
        const tileContent = ({ date, view }) => {
            if (view !== 'month') return null;
            
            const dateStr = date.toISOString().split('T')[0];
            const tasks = tasksByDate[dateStr];
            
            if (!tasks) return null;
            
            const dotClass = `task-dot task-dot-${tasks.priority}`;
            return React.createElement('div', { className: dotClass });
        };
        
        // Render calendar
        ReactDOM.render(
            React.createElement(Calendar, {
                tileContent: tileContent,
                className: 'rounded-lg border-none shadow-sm',
                onChange: date => console.log('Calendar date changed:', date)
            }),
            calendarContainer
        );
    }
    
    // Load today's tasks
    loadTodayTasks();
    
    // Load important deadlines
    loadImportantDeadlines();
    
    // Load notes
    loadNotes();
    
    // Load weekly overview
    loadWeeklyOverview();
    
    // Initialize mood tracker
    initMoodTracker();
    
    // Initialize modals
    initModals();
    
    // API Functions
    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return null;
        }
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };
        
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            showToast('Error connecting to server', 'error');
            return null;
        }
    }
    
    // Load today's tasks
    async function loadTodayTasks() {
        const container = document.getElementById('todayTasksContainer');
        if (!container) return;
        
        // Clear container
        container.innerHTML = '<div class="flex justify-center items-center h-20"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div></div>';
        
        try {
            const tasks = await fetchWithAuth('/api/tasks/today');
            
            if (!tasks || tasks.length === 0) {
                container.innerHTML = '<div class="text-center text-gray-500 py-4">No tasks for today! 🎉</div>';
                return;
            }
            
            container.innerHTML = '';
            
            tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = `task-item p-3 ${task.status === 'completed' ? 'bg-gray-100' : 'bg-pink-50'} rounded-lg flex items-center`;
                
                const priorityColors = {
                    high: 'bg-red-400',
                    medium: 'bg-yellow-400',
                    low: 'bg-green-400'
                };
                
                taskElement.innerHTML = `
                    <div class="${priorityColors[task.priority] || 'bg-gray-400'} w-3 h-3 rounded-full mr-3"></div>
                    <div class="flex-1">
                        <h4 class="font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}">${task.title}</h4>
                        <p class="text-xs text-gray-500">${formatTimeOfDay(task.timeOfDay)}</p>
                    </div>
                    <input type="checkbox" class="checkbox-pink" ${task.status === 'completed' ? 'checked' : ''} data-task-id="${task.id}">
                `;
                
                container.appendChild(taskElement);
                
                // Add event listener to checkbox
                const checkbox = taskElement.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', () => toggleTaskStatus(task.id, checkbox.checked));
            });
        } catch (error) {
            console.error('Error loading today\'s tasks:', error);
            container.innerHTML = '<div class="text-center text-red-500 py-4">Failed to load tasks</div>';
        }
    }
    
    // Load important deadlines
    async function loadImportantDeadlines() {
        const container = document.getElementById('deadlinesContainer');
        if (!container) return;
        
        // Clear container
        container.innerHTML = '<div class="flex justify-center items-center h-20"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div></div>';
        
        try {
            const deadlines = await fetchWithAuth('/api/tasks/deadlines');
            
            if (!deadlines || deadlines.length === 0) {
                container.innerHTML = '<div class="text-center text-gray-500 py-4">No upcoming deadlines! 🎉</div>';
                return;
            }
            
            container.innerHTML = '';
            
            deadlines.forEach(deadline => {
                const deadlineElement = document.createElement('div');
                deadlineElement.className = 'task-card p-3 rounded-lg';
                
                const daysLeft = getDaysLeft(deadline.dueDate);
                const daysLeftText = daysLeft === 0 ? 'Due today!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
                
                deadlineElement.innerHTML = `
                    <h4 class="font-medium text-gray-800">${deadline.title}</h4>
                    <div class="flex justify-between items-center mt-2">
                        <p class="text-xs ${daysLeft <= 1 ? 'text-red-500 font-bold' : 'text-gray-500'}">${daysLeftText}</p>
                        <p class="text-xs text-gray-500">${formatDate(deadline.dueDate)}</p>
                    </div>
                `;
                
                container.appendChild(deadlineElement);
            });
        } catch (error) {
            console.error('Error loading deadlines:', error);
            container.innerHTML = '<div class="text-center text-red-500 py-4">Failed to load deadlines</div>';
        }
    }
    
    // Load notes
    async function loadNotes() {
        const container = document.getElementById('notesContainer');
        if (!container) return;
        
        // Clear container
        container.innerHTML = '<div class="flex justify-center items-center h-20"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div></div>';
        
        try {
            const notes = await fetchWithAuth('/api/notes?limit=6');
            
            if (!notes || notes.length === 0) {
                container.innerHTML = '<div class="text-center text-gray-500 py-4 col-span-3">No notes yet! Create your first note.</div>';
                return;
            }
            
            container.innerHTML = '';
            
            const noteColors = ['yellow', 'blue', 'green', 'purple'];
            
            notes.forEach((note, index) => {
                const noteElement = document.createElement('div');
                const colorClass = `note-${note.color || noteColors[index % noteColors.length]}`;
                noteElement.className = `note-card p-4 ${colorClass}`;
                
                noteElement.innerHTML = `
                    <h4 class="font-medium text-gray-800 mb-2">${note.title}</h4>
                    <p class="text-sm text-gray-700 mb-3">${note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-500">${formatDate(note.createdAt)}</span>
                        <span class="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">${note.category || 'Note'}</span>
                    </div>
                `;
                
                container.appendChild(noteElement);
                
                // Add click event to view full note
                noteElement.addEventListener('click', () => viewNote(note.id));
            });
        } catch (error) {
            console.error('Error loading notes:', error);
            container.innerHTML = '<div class="text-center text-red-500 py-4 col-span-3">Failed to load notes</div>';
        }
    }
    
    // Load weekly overview
    function loadWeeklyOverview() {
        const container = document.getElementById('weeklyOverviewContainer');
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Get current week dates
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDay);
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Sample data for weekly overview
        const weeklyData = {
            0: { tasks: 3, completed: 1 },
            1: { tasks: 5, completed: 3 },
            2: { tasks: 2, completed: 2 },
            3: { tasks: 4, completed: 1 },
            4: { tasks: 6, completed: 2 },
            5: { tasks: 3, completed: 0 },
            6: { tasks: 1, completed: 0 }
        };
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            
            const isToday = date.toDateString() === today.toDateString();
            const dayData = weeklyData[i] || { tasks: 0, completed: 0 };
            const progress = dayData.tasks > 0 ? (dayData.completed / dayData.tasks) * 100 : 0;
            
            const dayElement = document.createElement('div');
            dayElement.className = `flex flex-col items-center ${isToday ? 'bg-pink-100 rounded-lg p-2' : ''}`;
            
            dayElement.innerHTML = `
                <p class="text-sm font-medium ${isToday ? 'text-pink-800' : 'text-gray-600'}">${days[i]}</p>
                <p class="text-xs text-gray-500">${date.getDate()}</p>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div class="bg-pink-500 h-2 rounded-full" style="width: ${progress}%"></div>
                </div>
                <p class="text-xs text-gray-600 mt-1">${dayData.completed}/${dayData.tasks}</p>
            `;
            
            container.appendChild(dayElement);
        }
    }
    
    // Initialize mood tracker
    function initMoodTracker() {
        const moodEmojis = document.querySelectorAll('.mood-emoji');
        if (!moodEmojis.length) return;
        
        moodEmojis.forEach(emoji => {
            emoji.addEventListener('click', () => {
                // Remove selected class from all emojis
                moodEmojis.forEach(e => e.classList.remove('selected'));
                // Add selected class to clicked emoji
                emoji.classList.add('selected');
                
                // Get mood value
                const moodValue = emoji.getAttribute('data-mood');
                console.log('Selected mood:', moodValue);
                
                // In a real app, you would save this to the server
                // saveMood(moodValue);
            });
        });
    }
    
    // Initialize modals
    function initModals() {
        // Task modal
        const taskModal = document.getElementById('taskModal');
        const taskForm = document.getElementById('taskForm');
        const cancelTaskBtn = document.getElementById('cancelTaskBtn');
        
        // Show task modal when add task button is clicked
        const addTaskBtn = document.querySelector('.content-card button');
        if (addTaskBtn && taskModal) {
            addTaskBtn.addEventListener('click', () => {
                taskModal.classList.remove('hidden');
            });
        }
        
        // Hide task modal when cancel button is clicked
        if (cancelTaskBtn && taskModal) {
            cancelTaskBtn.addEventListener('click', () => {
                taskModal.classList.add('hidden');
            });
        }
        
        // Submit task form
        if (taskForm) {
            taskForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const title = document.getElementById('taskTitle').value;
                const description = document.getElementById('taskDescription').value;
                const dueDate = document.getElementById('taskDueDate').value;
                const priority = document.getElementById('taskPriority').value;
                const isImportant = document.getElementById('taskImportant').checked;
                
                if (!title || !dueDate) {
                    showToast('Please fill in all required fields', 'error');
                    return;
                }
                
                try {
                    const task = await fetchWithAuth('/api/tasks', {
                        method: 'POST',
                        body: JSON.stringify({
                            title,
                            description,
                            dueDate,
                            priority,
                            isImportant
                        })
                    });
                    
                    if (task) {
                        showToast('Task created successfully', 'success');
                        taskModal.classList.add('hidden');
                        taskForm.reset();
                        
                        // Reload tasks
                        loadTodayTasks();
                        loadImportantDeadlines();
                    }
                } catch (error) {
                    console.error('Error creating task:', error);
                    showToast('Failed to create task', 'error');
                }
            });
        }
        
        // Note modal
        const noteModal = document.getElementById('noteModal');
        const noteForm = document.getElementById('noteForm');
        const cancelNoteBtn = document.getElementById('cancelNoteBtn');
        
        // Show note modal when add note button is clicked
        const addNoteBtn = document.querySelector('.content-card:nth-of-type(4) button');
        if (addNoteBtn && noteModal) {
            addNoteBtn.addEventListener('click', () => {
                noteModal.classList.remove('hidden');
            });
        }
        
        // Hide note modal when cancel button is clicked
        if (cancelNoteBtn && noteModal) {
            cancelNoteBtn.addEventListener('click', () => {
                noteModal.classList.add('hidden');
            });
        }
        
        // Note color selection
        const noteColorOptions = document.querySelectorAll('.note-color-option');
        const noteColorInput = document.getElementById('noteColor');
        
        if (noteColorOptions.length && noteColorInput) {
            noteColorOptions.forEach(option => {
                option.addEventListener('click', () => {
                    // Remove border from all options
                    noteColorOptions.forEach(o => o.style.border = 'none');
                    // Add border to selected option
                    option.style.border = '2px solid #ff80ab';
                    // Set color value
                    noteColorInput.value = option.getAttribute('data-color');
                });
            });
            
            // Set default selected color
            noteColorOptions[0].style.border = '2px solid #ff80ab';
        }
        
        // Submit note form
        if (noteForm) {
            noteForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const title = document.getElementById('noteTitle').value;
                const content = document.getElementById('noteContent').value;
                const category = document.getElementById('noteCategory').value;
                const color = document.getElementById('noteColor').value;
                
                if (!title || !content) {
                    showToast('Please fill in all required fields', 'error');
                    return;
                }
                
                try {
                    const note = await fetchWithAuth('/api/notes', {
                        method: 'POST',
                        body: JSON.stringify({
                            title,
                            content,
                            category,
                            color
                        })
                    });
                    
                    if (note) {
                        showToast('Note created successfully', 'success');
                        noteModal.classList.add('hidden');
                        noteForm.reset();
                        
                        // Reload notes
                        loadNotes();
                    }
                } catch (error) {
                    console.error('Error creating note:', error);
                    showToast('Failed to create note', 'error');
                }
            });
        }
    }
    
    // Toggle task status
    async function toggleTaskStatus(taskId, isCompleted) {
        try {
            const result = await fetchWithAuth(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    status: isCompleted ? 'completed' : 'pending'
                })
            });
            
            if (result) {
                showToast(`Task ${isCompleted ? 'completed' : 'reopened'}`, 'success');
                updatePetHappiness();
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            showToast('Failed to update task', 'error');
        }
    }
    
    // View note details
    function viewNote(noteId) {
        console.log('View note:', noteId);
        // In a real app, you would fetch the note details and show them in a modal
    }
    
    // Update pet happiness based on completed tasks
    function updatePetHappiness() {
        const petCompanion = document.getElementById('petCompanion');
        if (!petCompanion) return;
        
        // In a real app, you would calculate this based on actual task completion rate
        const completedTasksCount = document.querySelectorAll('input[type="checkbox"]:checked').length;
        const totalTasksCount = document.querySelectorAll('input[type="checkbox"]').length;
        
        const happinessPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 100;
        
        if (happinessPercentage < 30) {
            petCompanion.style.opacity = '0.6';
            petCompanion.style.transform = 'rotate(-5deg)';
        } else if (happinessPercentage < 70) {
            petCompanion.style.opacity = '0.8';
            petCompanion.style.transform = 'rotate(0deg)';
        } else {
            petCompanion.style.opacity = '1';
            petCompanion.style.transform = 'rotate(0deg) scale(1.05)';
            createSparkle();
        }
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
        if (window.ReactHotToast && window.ReactHotToast.toast) {
            const toast = window.ReactHotToast.toast;
            toast[type](message, {
                duration: 3000,
                position: 'bottom-right',
                style: {
                    background: type === 'success' ? '#9ae6b4' : '#feb2b2',
                    color: '#2d3748',
                    padding: '16px',
                    borderRadius: '12px'
                }
            });
        } else {
            alert(message);
        }
    }
    
    // Helper Functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    function formatTimeOfDay(timeString) {
        if (!timeString) return '';
        
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        
        return `${formattedHour}:${minutes} ${ampm}`;
    }
    
    function getDaysLeft(dateString) {
        const dueDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }
});