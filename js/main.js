document.addEventListener('DOMContentLoaded', () => {
    // Form toggle functionality
    const loginToggle = document.getElementById('loginToggle');
    const signupToggle = document.getElementById('signupToggle');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    // Status message element for displaying errors/success
    const statusMessage = document.createElement('div');
    statusMessage.classList.add('mt-4', 'p-3', 'rounded', 'text-center');
    loginForm.parentNode.insertBefore(statusMessage, loginForm.nextSibling);
    
    // Function to show status messages
    const showMessage = (message, isError = false) => {
        statusMessage.textContent = message;
        statusMessage.classList.remove('bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
        if (isError) {
            statusMessage.classList.add('bg-red-100', 'text-red-800');
        } else {
            statusMessage.classList.add('bg-green-100', 'text-green-800');
        }
        statusMessage.classList.remove('hidden');
        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, 5000);
    };

    loginToggle.addEventListener('click', () => {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginToggle.classList.add('bg-white', 'shadow-sm', 'text-gray-800');
        loginToggle.classList.remove('text-gray-600');
        signupToggle.classList.remove('bg-white', 'shadow-sm', 'text-gray-800');
        signupToggle.classList.add('text-gray-600');
    });

    signupToggle.addEventListener('click', () => {
        window.location.href = 'signup.html';
    });

    // Pet animation with Framer Motion
    const pet = document.getElementById('pet');
    let isAnimating = false;

    // Create animation with Framer Motion
    const animate = () => {
        if (isAnimating) return;
        isAnimating = true;
        
        // Using Framer Motion for animation
        const animation = {
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
            transition: { duration: 0.6 }
        };
        
        // Apply animation using Framer Motion
        const { animate: motionAnimate } = window.Motion;
        motionAnimate(pet, animation, {
            onComplete: () => {
                isAnimating = false;
            }
        });
    };

    pet.addEventListener('click', animate);

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showMessage('Please fill in all fields', true);
            return;
        }
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                showMessage(data.error || 'Login failed', true);
                return;
            }
            
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showMessage('Login successful! Redirecting...');
            
            // Redirect to dashboard after successful login
            setTimeout(() => {
                // Show pet animation on successful login
                animate();
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            }, 1500);
        } catch (error) {
            console.error('Login error:', error);
            showMessage('An error occurred. Please try again.', true);
        }
    });
    
    // Signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!fullName || !email || !password || !confirmPassword) {
            showMessage('Please fill in all fields', true);
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', true);
            return;
        }
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fullName, email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                showMessage(data.error || 'Registration failed', true);
                return;
            }
            
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showMessage('Registration successful! Redirecting...');
            
            // Redirect or update UI for registered user
            setTimeout(() => {
                document.querySelector('.login-card').innerHTML = `
                    <div class="text-center p-8">
                        <div class="text-3xl font-bold text-gray-800 mb-4">Welcome, ${data.user.fullName}!</div>
                        <p class="text-gray-600 mb-6">Your account has been created successfully.</p>
                        <button id="logoutBtn" class="py-2 px-6 bg-pink-200 text-pink-800 rounded-full hover:bg-pink-300 transition-colors">
                            Logout
                        </button>
                    </div>
                `;
                
                document.getElementById('logoutBtn').addEventListener('click', () => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.reload();
                });
                
                // Show pet animation on successful registration
                animate();
            }, 1500);
        } catch (error) {
            console.error('Registration error:', error);
            showMessage('An error occurred. Please try again.', true);
        }
    });
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (token && user) {
        document.querySelector('.login-card').innerHTML = `
            <div class="text-center p-8">
                <div class="text-3xl font-bold text-gray-800 mb-4">Welcome back, ${user.fullName}!</div>
                <p class="text-gray-600 mb-6">You are already logged in.</p>
                <button id="logoutBtn" class="py-2 px-6 bg-pink-200 text-pink-800 rounded-full hover:bg-pink-300 transition-colors">
                    Logout
                </button>
            </div>
        `;
        
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
        });
    }
});