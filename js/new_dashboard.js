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
            
            // Here you would typically load the corresponding content
            // For now, we'll just animate the pet
            animatePet();
        });
    });
    
    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const toggleThumb = document.querySelector('.toggle-thumb');
    let isDarkMode = false;
    
    if (themeToggle && toggleThumb) {
        themeToggle.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            
            if (isDarkMode) {
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
            } else {
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
            
            // Save theme preference (would be sent to server in a real app)
            localStorage.setItem('darkMode', isDarkMode);
            
            // Animate pet when theme changes
            animatePet();
        });
        
        // Load saved theme preference
        if (localStorage.getItem('darkMode') === 'true') {
            themeToggle.click();
        }
    }
    
    // Pet Companion Animation
    const petCompanion = document.getElementById('petCompanion');
    let isAnimating = false;
    
    function animatePet() {
        if (isAnimating || !petCompanion) return;
        isAnimating = true;
        
        // Using Framer Motion for animation
        const animation = {
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
            transition: { duration: 0.6 }
        };
        
        // Apply animation using Framer Motion
        try {
            const { animate: motionAnimate } = window.Motion;
            motionAnimate(petCompanion, animation, {
                onComplete: () => {
                    isAnimating = false;
                }
            });
        } catch (error) {
            console.error('Framer Motion animation error:', error);
            isAnimating = false;
        }
    }
    
    if (petCompanion) {
        petCompanion.addEventListener('click', animatePet);
        // Initial animation
        setTimeout(animatePet, 1000);
    }
    
    // Task checkbox functionality
    const taskCheckboxes = document.querySelectorAll('.checkbox-pink');
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const taskElement = checkbox.closest('.task-card');
            
            if (checkbox.checked) {
                // Mark task as completed
                taskElement.style.opacity = '0.7';
                taskElement.querySelector('h4').style.textDecoration = 'line-through';
                
                // Update progress
                updateTaskProgress();
                
                // Show confetti for completed task
                showConfetti();
            } else {
                // Mark task as active
                taskElement.style.opacity = '1';
                taskElement.querySelector('h4').style.textDecoration = 'none';
                
                // Update progress
                updateTaskProgress();
            }
        });
    });
    
    // Update task progress
    function updateTaskProgress() {
        const totalTasks = taskCheckboxes.length;
        const completedTasks = document.querySelectorAll('.checkbox-pink:checked').length;
        
        if (totalTasks > 0) {
            const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
            const progressBar = document.querySelector('.bg-pink-400');
            const progressText = document.querySelector('.bg-pink-400').nextElementSibling;
            
            if (progressBar) progressBar.style.width = `${progressPercentage}%`;
            if (progressText) progressText.textContent = `${progressPercentage}%`;
            
            // Update pet happiness based on task completion
            updatePetHappiness(progressPercentage);
            
            // Show confetti if all tasks completed
            if (completedTasks === totalTasks && totalTasks > 0) {
                showConfetti(true);
            }
        }
    }
    
    // Update pet happiness based on completed tasks
    function updatePetHappiness(progressPercentage) {
        if (!petCompanion) return;
        
        // Update pet appearance based on happiness
        if (progressPercentage < 30) {
            petCompanion.style.opacity = '0.7';
            petCompanion.style.transform = 'rotate(-5deg)';
        } else if (progressPercentage < 70) {
            petCompanion.style.opacity = '0.85';
            petCompanion.style.transform = 'rotate(0deg)';
        } else {
            petCompanion.style.opacity = '1';
            petCompanion.style.transform = 'rotate(0deg) scale(1.05)';
        }
    }
    
    // Simple confetti effect
    function showConfetti(fullScreen = false) {
        // Create confetti elements
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = '9999';
        document.body.appendChild(confettiContainer);
        
        // Number of confetti pieces
        const count = fullScreen ? 200 : 30;
        
        // Create confetti pieces
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 5 + 5}px`;
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.borderRadius = '50%';
            
            // Set initial position
            if (fullScreen) {
                confetti.style.top = `${Math.random() * 100}%`;
                confetti.style.left = `${Math.random() * 100}%`;
            } else {
                // Position around the last checked checkbox
                const lastChecked = document.querySelector('.checkbox-pink:checked:not([data-animated])');
                if (lastChecked) {
                    const rect = lastChecked.getBoundingClientRect();
                    confetti.style.top = `${rect.top + window.scrollY - 20 + Math.random() * 40}px`;
                    confetti.style.left = `${rect.left + window.scrollX - 20 + Math.random() * 40}px`;
                    lastChecked.setAttribute('data-animated', 'true');
                } else {
                    confetti.style.top = '50%';
                    confetti.style.left = '50%';
                }
            }
            
            // Add animation
            confetti.animate([
                { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
                { transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 + 50}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 1000 + 1000,
                easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
            });
            
            confettiContainer.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
                if (confettiContainer.childElementCount === 0) {
                    confettiContainer.remove();
                }
            }, Math.random() * 1000 + 1000);
        }
    }
    
    function getRandomColor() {
        const colors = [
            '#ffb6c1', // Light pink
            '#add8e6', // Light blue
            '#90ee90', // Light green
            '#ffffe0', // Light yellow
            '#e6e6fa', // Lavender
            '#ffc0cb', // Pink
            '#87cefa'  // Light sky blue
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Mood tracker functionality
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all mood buttons
            moodButtons.forEach(b => b.classList.remove('scale-125', 'border-2', 'border-pink-300'));
            
            // Add active class to clicked button
            btn.classList.add('scale-125', 'border-2', 'border-pink-300');
            
            // Get selected mood
            const mood = btn.getAttribute('data-mood');
            
            // Save mood (would be sent to server in a real app)
            localStorage.setItem('currentMood', mood);
            
            // Animate pet when mood changes
            animatePet();
            
            // Show toast notification
            showToast(`Mood updated to ${mood}! 💖`);
        });
    });
    
    // Simple toast notification
    function showToast(message) {
        try {
            // Use react-hot-toast if available
            if (window.toast) {
                window.toast.success(message, {
                    style: {
                        background: '#ffb6c1',
                        color: '#4a4a4a',
                        borderRadius: '10px',
                        padding: '16px'
                    },
                    iconTheme: {
                        primary: '#ff80ab',
                        secondary: '#ffffff'
                    }
                });
                return;
            }
        } catch (error) {
            console.log('Toast library not available, using fallback');
        }
        
        // Fallback toast implementation
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.backgroundColor = '#ffb6c1';
        toast.style.color = '#4a4a4a';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '10px';
        toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        toast.style.zIndex = '9999';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            
            // Remove toast from DOM after animation
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Initialize calendar if React Calendar is available
    try {
        if (window.ReactCalendar && window.React && window.ReactDOM) {
            const calendarContainer = document.getElementById('calendar-container');
            if (calendarContainer) {
                // Sample events for the calendar
                const events = [
                    { date: new Date(2023, new Date().getMonth(), 15), title: 'Project Deadline', type: 'deadline' },
                    { date: new Date(2023, new Date().getMonth(), 20), title: 'Team Meeting', type: 'meeting' },
                    { date: new Date(2023, new Date().getMonth(), 25), title: 'Presentation', type: 'presentation' }
                ];
                
                // Render React Calendar
                const Calendar = window.ReactCalendar.Calendar;
                const e = window.React.createElement;
                
                class CalendarApp extends window.React.Component {
                    constructor(props) {
                        super(props);
                        this.state = {
                            date: new Date(),
                        };
                    }
                    
                    onChange = date => this.setState({ date });
                    
                    tileContent = ({ date, view }) => {
                        if (view === 'month') {
                            const event = events.find(event => 
                                event.date.getDate() === date.getDate() && 
                                event.date.getMonth() === date.getMonth() && 
                                event.date.getFullYear() === date.getFullYear()
                            );
                            
                            if (event) {
                                let color = '#ffb6c1';
                                if (event.type === 'meeting') color = '#90ee90';
                                if (event.type === 'presentation') color = '#add8e6';
                                
                                return e('div', { 
                                    style: { 
                                        position: 'relative',
                                        height: '100%',
                                        width: '100%'
                                    } 
                                }, [
                                    e('div', { 
                                        style: { 
                                            position: 'absolute',
                                            bottom: '2px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: '80%',
                                            height: '4px',
                                            backgroundColor: color,
                                            borderRadius: '2px'
                                        }
                                    })
                                ]);
                            }
                        }
                        return null;
                    };
                    
                    render() {
                        return e(Calendar, {
                            onChange: this.onChange,
                            value: this.state.date,
                            tileContent: this.tileContent,
                            className: 'rounded-xl overflow-hidden'
                        });
                    }
                }
                
                window.ReactDOM.render(e(CalendarApp), calendarContainer);
            }
        }
    } catch (error) {
        console.error('Error initializing calendar:', error);
        const calendarContainer = document.getElementById('calendar-container');
        if (calendarContainer) {
            calendarContainer.innerHTML = '<p class="text-center text-gray-500">Calendar could not be loaded</p>';
        }
    }
    
    // Initialize task progress
    updateTaskProgress();
});