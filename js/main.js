document.addEventListener('DOMContentLoaded', () => {
    // Form toggle functionality
    const loginToggle = document.getElementById('loginToggle');
    const signupToggle = document.getElementById('signupToggle');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    loginToggle.addEventListener('click', () => {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginToggle.classList.add('bg-white', 'shadow-sm', 'text-gray-800');
        loginToggle.classList.remove('text-gray-600');
        signupToggle.classList.remove('bg-white', 'shadow-sm', 'text-gray-800');
        signupToggle.classList.add('text-gray-600');
    });

    signupToggle.addEventListener('click', () => {
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        signupToggle.classList.add('bg-white', 'shadow-sm', 'text-gray-800');
        signupToggle.classList.remove('text-gray-600');
        loginToggle.classList.remove('bg-white', 'shadow-sm', 'text-gray-800');
        loginToggle.classList.add('text-gray-600');
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

    // Form submission (prevent default for demo)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('This is a demo. Form submission is not implemented.');
        });
    });
}));