document.addEventListener('DOMContentLoaded', () => {
    // Form toggle functionality
    const loginToggle = document.getElementById('loginToggle');
    const signupToggle = document.getElementById('signupToggle');
    const signupForm = document.getElementById('signupForm');
    
    // Status message element for displaying errors/success
    const statusMessage = document.createElement('div');
    statusMessage.classList.add('mt-4', 'p-3', 'rounded', 'text-center');
    signupForm.parentNode.insertBefore(statusMessage, signupForm.nextSibling);
    
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
        window.location.href = 'index.html';
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
    
    // Signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsChecked = document.getElementById('terms').checked;
        
        if (!fullName || !email || !password || !confirmPassword) {
            showMessage('Please fill in all fields', true);
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', true);
            return;
        }
        
        if (!termsChecked) {
            showMessage('Please agree to the Terms and Conditions', true);
            return;
        }
        
        // Password strength validation
        const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        if (!passwordStrengthRegex.test(password)) {
            showMessage('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.', true);
            return;
        }
        
        try {
            // Mock API implementation for demo purposes
            // In a real application, this would be a fetch to the server
            // const response = await fetch('/api/register', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ fullName, email, password })
            // });
            // const data = await response.json();
            
            // Simulate API response
            const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
            const mockUser = {
                id: Math.floor(Math.random() * 1000),
                fullName: fullName,
                email: email
            };
            
            // Store token in localStorage
            localStorage.setItem('token', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
            
            showMessage('Registration successful! Redirecting...');
            
            // Redirect to dashboard after successful registration
            setTimeout(() => {
                // Show pet animation on successful registration
                animate();
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
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
        document.querySelector('.signup-card').innerHTML = `
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