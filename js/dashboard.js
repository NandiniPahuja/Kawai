document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        // Redirect to login page if not logged in
        window.location.href = 'index.html';
        return;
    }
    
    // Add user name to header if available
    if (user && user.fullName) {
        const headerDiv = document.querySelector('header div');
        const welcomeText = document.createElement('p');
        welcomeText.classList.add('text-sm', 'text-gray-600', 'mt-1');
        welcomeText.textContent = `Welcome, ${user.fullName}!`;
        headerDiv.appendChild(welcomeText);
    }
    
    // Add logout button to header
    const header = document.querySelector('header');
    const logoutBtn = document.createElement('button');
    logoutBtn.classList.add('py-2', 'px-4', 'bg-pink-200', 'text-pink-800', 'rounded-full', 'hover:bg-pink-300', 'transition-colors', 'text-sm', 'font-medium');
    logoutBtn.textContent = 'Logout';
    header.appendChild(logoutBtn);
    
    // Logout functionality
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
    
    // Update pet happiness based on completed tasks
    function updatePetHappiness() {
        const completedTasks = document.querySelectorAll('.routine-checkbox:checked').length;
        const totalTasks = document.querySelectorAll('.routine-checkbox').length;
        
        const petHappiness = Math.min(100, Math.max(50, (completedTasks / totalTasks) * 100));
        
        // Update pet appearance based on happiness
        const petCompanion = document.getElementById('petCompanion');
        if (petHappiness < 60) {
            petCompanion.style.opacity = '0.7';
            petCompanion.style.transform = 'rotate(-5deg)';
        } else {
            petCompanion.style.opacity = '1';
            petCompanion.style.transform = 'rotate(0deg)';
        }
    }
    
    // Initialize pet happiness
    updatePetHappiness();
});