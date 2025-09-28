// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializePage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start carousel
    startCarousel();
});

// Safe JSON parser to avoid HTML error pages causing crashes
async function jsonSafe(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
        // Attempt to parse JSON error payload; if HTML, throw with status
        if (contentType.includes('application/json')) {
            const err = await response.json().catch(() => null);
            const message = (err && (err.error || err.message)) || `HTTP ${response.status}`;
            throw new Error(message);
        }
        throw new Error(`HTTP ${response.status}`);
    }
    if (contentType.includes('application/json')) {
        return response.json();
    }
    // Fallback: try JSON, else throw to surface unexpected content type
    try { return await response.json(); } catch (_) { throw new Error('Unexpected non-JSON response'); }
}

// Robust API base and fetch wrapper
const BASE_URL = (window.ENV && window.ENV.API_BASE) ? window.ENV.API_BASE : 'http://localhost:3000';

async function apiFetch(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, options);
    if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`API ${res.status} at ${path}: ${errText.slice(0,250)}`);
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return res.json();
    }
    return res.text();
}

function initializePage() {
    // Show home section by default
    showSection('home');
    
    // Set active navigation link
    setActiveNavLink('home');
}

function setupEventListeners() {
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            showSection(targetSection);
            setActiveNavLink(targetSection);
        });
    });

    // Mobile hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });

    // Auth forms
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const workshopSignupForm = document.getElementById('workshop-signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (workshopSignupForm) {
        workshopSignupForm.addEventListener('submit', handleWorkshopSignup);
    }

    // Module enrollment buttons
    const enrollButtons = document.querySelectorAll('[onclick^="enrollModule"]');
    enrollButtons.forEach(button => {
        button.addEventListener('click', function() {
            const moduleId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            handleModuleEnrollment(moduleId);
        });
    });

    // Workshop signup buttons
    const workshopButtons = document.querySelectorAll('[onclick^="openWorkshopSignup"]');
    workshopButtons.forEach(button => {
        button.addEventListener('click', function() {
            const workshopId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            openWorkshopSignup(workshopId);
        });
    });

    // Close modal when clicking outside
    const modal = document.getElementById('workshop-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeWorkshopModal();
            }
        });
    }
}

function showSection(sectionId) {
    // Check authentication for modules access
    if (sectionId === 'modules' && !checkModuleAccess()) {
        return;
    }
    
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
}

function setActiveNavLink(activeId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
        }
    });
}

// Module category switching
function showModuleCategory(category) {
    // Hide all module categories
    const categories = document.querySelectorAll('.module-category');
    categories.forEach(cat => {
        cat.classList.remove('active');
    });

    // Show target category
    const targetCategory = document.getElementById(`${category}-modules`);
    if (targetCategory) {
        targetCategory.classList.add('active');
    }

    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === category) {
            btn.classList.add('active');
        }
    });
}

// Auth form switching
function showAuthForm(formType) {
    // Hide all auth forms
    const authForms = document.querySelectorAll('.auth-form');
    authForms.forEach(form => {
        form.classList.remove('active');
    });

    // Show target form
    const targetForm = document.getElementById(`${formType}-form`);
    if (targetForm) {
        targetForm.classList.add('active');
    }

    // Update tab buttons
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase().replace(' ', '') === formType) {
            tab.classList.add('active');
        }
    });
}

// Carousel functionality
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');

function startCarousel() {
    if (slides.length === 0) return;
    
    // Auto-advance carousel every 4 seconds
    setInterval(() => {
        nextSlide();
    }, 4000);
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(currentSlideIndex + 1);
}

function currentSlide(n) {
    showSlide(n);
}

function showSlide(n) {
    currentSlideIndex = n - 1;
    
    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Show current slide
    if (slides[currentSlideIndex]) {
        slides[currentSlideIndex].classList.add('active');
    }
    
    // Update dots
    dots.forEach(dot => {
        dot.classList.remove('active');
    });
    
    if (dots[currentSlideIndex]) {
        dots[currentSlideIndex].classList.add('active');
    }
}

// Form handlers
async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const age = document.getElementById('signup-age').value;
    const password = document.getElementById('signup-password').value;
    
    try {
        const response = await fetch(`${window.ENV.API_BASE}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, age: parseInt(age), password })
        });
        
        const data = await jsonSafe(response);
        
        if (data.success) {
            // Store token and user data
            localStorage.setItem('entropy_token', data.token);
            localStorage.setItem('entropy_user', JSON.stringify(data.data));
            
            showNotification('Account created successfully! Welcome to Entropy Productions!', 'success');
            
            // Reset form
            e.target.reset();
            
            // Update navigation and redirect to modules
            updateNavigationForLoggedInUser();
            setTimeout(() => {
                showSection('modules');
                setActiveNavLink('modules');
                loadModules();
                loadMyLearning();
            }, 2000);
        } else {
            showNotification(data.error || 'Signup failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(String(error.message || error), 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${window.ENV.API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await jsonSafe(response);
        
        if (data.success) {
            // Store token and user data
            localStorage.setItem('entropy_token', data.token);
            localStorage.setItem('entropy_user', JSON.stringify(data.data));
            
            showNotification('Welcome back! You are now logged in.', 'success');
            
            // Reset form
            e.target.reset();
            
            // Update navigation and redirect to modules
            updateNavigationForLoggedInUser();
            setTimeout(() => {
                showSection('modules');
                setActiveNavLink('modules');
                loadModules();
                loadMyLearning();
            }, 1500);
        } else {
            showNotification(data.error || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification(String(error.message || error), 'error');
    }
}

async function handleModuleEnrollment(moduleId) {
    const token = localStorage.getItem('entropy_token');
    
    if (!token) {
        showNotification('Please log in to enroll in modules.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${window.ENV.API_BASE}/modules/enroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ moduleId: parseInt(moduleId) })
        });
        
        const data = await jsonSafe(response);
        
        if (data.success) {
            showNotification(`Successfully enrolled in ${data.data.module.title}!`, 'success');
            loadModules(); // Refresh modules display
        } else {
            showNotification(data.error || 'Enrollment failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Enrollment error:', error);
        showNotification(String(error.message || error), 'error');
    }
}

function openWorkshopSignup(workshopId) {
    const modal = document.getElementById('workshop-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Store workshop ID for form submission
        modal.setAttribute('data-workshop-id', workshopId);
    }
}

function closeWorkshopModal() {
    const modal = document.getElementById('workshop-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        const form = document.getElementById('workshop-signup-form');
        if (form) {
            form.reset();
        }
    }
}

function handleWorkshopSignup(e) {
    e.preventDefault();
    
    const modal = document.getElementById('workshop-modal');
    const workshopId = modal.getAttribute('data-workshop-id');
    
    const name = document.getElementById('workshop-name').value;
    const email = document.getElementById('workshop-email').value;
    const experience = document.getElementById('workshop-experience').value;
    
    // Simulate workshop signup
    showNotification(`Successfully signed up for ${workshopId.replace('-', ' ')}! You'll receive a confirmation email shortly.`, 'success');
    
    // Close modal and reset form
    closeWorkshopModal();
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(45deg, #7800a4, #ffdab9)' : 'linear-gradient(45deg, #ff6b6b, #ee5a52)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Add CSS for notifications
const notificationStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        transition: background-color 0.3s ease;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading states to buttons
function addLoadingState(button, text = 'Loading...') {
    const originalText = button.textContent;
    button.textContent = text;
    button.disabled = true;
    button.classList.add('loading');
    button.style.opacity = '0.8';
    
    return () => {
        button.textContent = originalText;
        button.disabled = false;
        button.classList.remove('loading');
        button.style.opacity = '1';
    };
}

// Enhanced button click animations
function addButtonClickAnimation(button) {
    button.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
}

// Add click animations to all buttons
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        addButtonClickAnimation(button);
    });
});

// Enhanced form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateAge(age) {
    const ageNum = parseInt(age);
    return ageNum >= 13 && ageNum <= 19;
}

// Add form validation to signup form
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('signup-email').value;
        const age = document.getElementById('signup-age').value;
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        if (!validateAge(age)) {
            showNotification('You must be between 13 and 19 years old to join.', 'error');
            return;
        }
        
        // If validation passes, proceed with signup
        handleSignup(e);
    });
}

// Add form validation to login form
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // If validation passes, proceed with login
        handleLogin(e);
    });
}

// Add form validation to workshop signup form
const workshopSignupForm = document.getElementById('workshop-signup-form');
if (workshopSignupForm) {
    workshopSignupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('workshop-email').value;
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // If validation passes, proceed with workshop signup
        handleWorkshopSignup(e);
    });
}

// Enhanced intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Staggered animation based on element type and index
            const delay = entry.target.classList.contains('module-card') ? 
                (Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100) : 0;
            
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
                entry.target.classList.add('animate-in');
            }, delay);
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.module-card, .workshop-card, .thread, .showcase-item, .creator-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px) scale(0.95)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        observer.observe(el);
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Close modal with Escape key
    if (e.key === 'Escape') {
        const modal = document.getElementById('workshop-modal');
        if (modal && modal.style.display === 'block') {
            closeWorkshopModal();
        }
    }
    
    // Navigate sections with arrow keys (for accessibility)
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const sections = ['home', 'about', 'modules', 'workshops', 'community', 'signup'];
        const currentSection = document.querySelector('.section.active');
        if (currentSection) {
            const currentIndex = sections.indexOf(currentSection.id);
            let newIndex;
            
            if (e.key === 'ArrowLeft') {
                newIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
            } else {
                newIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
            }
            
            showSection(sections[newIndex]);
            setActiveNavLink(sections[newIndex]);
        }
    }
});

// Add touch/swipe support for mobile carousel
let touchStartX = 0;
let touchEndX = 0;

const carouselContainer = document.querySelector('.carousel-container');
if (carouselContainer) {
    carouselContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    carouselContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            nextSlide();
        } else {
            // Swipe right - previous slide
            previousSlide();
        }
    }
}

function previousSlide() {
    currentSlideIndex = currentSlideIndex > 0 ? currentSlideIndex - 1 : slides.length - 1;
    showSlide(currentSlideIndex + 1);
}

// Add performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll events
const debouncedScrollHandler = debounce(() => {
    // Add any scroll-based functionality here
}, 100);

window.addEventListener('scroll', debouncedScrollHandler);

// API Integration Functions
let modulesData = {};

// Load modules from API
async function loadModules() {
    try {
        const data = await apiFetch('/api/entropy');
        if (typeof data === 'string') {
            console.error('Expected JSON but got string:', data);
            showNotification('Server error while loading modules', 'error');
            return;
        }
        console.log('Modules:', data);
        if (data.success) {
            modulesData = data.data;
            updateModulesDisplay();
        } else {
            console.error('Failed to load modules:', data.error);
        }
    } catch (error) {
        console.error('Error loading modules:', error);
        showNotification('Unable to load modules — check console for details', 'error');
    }
}

// Update modules display with API data
function updateModulesDisplay() {
    // Update Design modules
    const designModules = modulesData.Design || [];
    const designContainer = document.getElementById('design-modules');
    if (designContainer && designModules.length > 0) {
        updateModuleCategory(designContainer, designModules);
    }
    
    // Update Filmmaking modules
    const filmmakingModules = modulesData.Filmmaking || [];
    const filmmakingContainer = document.getElementById('filmmaking-modules');
    if (filmmakingContainer && filmmakingModules.length > 0) {
        updateModuleCategory(filmmakingContainer, filmmakingModules);
    }
    
    // Update Music modules
    const musicModules = modulesData.Music || [];
    const musicContainer = document.getElementById('music-modules');
    if (musicContainer && musicModules.length > 0) {
        updateModuleCategory(musicContainer, musicModules);
    }
}

// Update a specific module category container
function updateModuleCategory(container, modules) {
    const modulesGrid = container.querySelector('.modules-grid');
    if (!modulesGrid) return;
    
    modulesGrid.innerHTML = '';
    
    modules.forEach(module => {
        const moduleCard = createModuleCard(module);
        modulesGrid.appendChild(moduleCard);
    });
}

// Create a module card element
function createModuleCard(module) {
    const card = document.createElement('div');
    card.className = 'module-card';
    
    const iconMap = {
        'Design': 'fas fa-paint-brush',
        'Filmmaking': 'fas fa-film',
        'Music': 'fas fa-music'
    };
    
    const icon = iconMap[module.category] || 'fas fa-book';
    
    card.innerHTML = `
        <div class="module-preview">
            <i class="${icon}"></i>
        </div>
        <h3>${module.title}</h3>
        <p>${module.description}</p>
        <div class="module-details">
            <span class="duration"><i class="fas fa-clock"></i> ${module.duration}</span>
            <span class="level"><i class="fas fa-signal"></i> ${module.level}</span>
            <span class="enrolled"><i class="fas fa-users"></i> ${module.enrolled} enrolled</span>
        </div>
        <div class="module-video">
            <iframe src="${module.videoUrl}" frameborder="0" allowfullscreen></iframe>
        </div>
        <button class="btn btn-primary" onclick="handleModuleEnrollment(${module.id})">Enroll Now</button>
    `;
    
    return card;
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('entropy_token') !== null;
}

// Get current user data
function getCurrentUser() {
    const userData = localStorage.getItem('entropy_user');
    return userData ? JSON.parse(userData) : null;
}

// Logout function
function logout() {
    localStorage.removeItem('entropy_token');
    localStorage.removeItem('entropy_user');
    updateNavigationForLoggedOutUser();
    showNotification('You have been logged out.', 'success');
    showSection('home');
    setActiveNavLink('home');
    myLearningData = { enrolled: [], completed: [], progress: {} };
}

// My Learning functionality
let myLearningData = {
    enrolled: [],
    completed: [],
    progress: {}
};

// Update navigation for logged in user
function updateNavigationForLoggedInUser() {
    const myLearningNav = document.getElementById('mylearning-nav');
    const signupNav = document.getElementById('signup-nav');
    const logoutNav = document.getElementById('logout-nav');
    
    if (myLearningNav) myLearningNav.style.display = 'block';
    if (signupNav) signupNav.style.display = 'none';
    if (logoutNav) logoutNav.style.display = 'block';
}

// Update navigation for logged out user
function updateNavigationForLoggedOutUser() {
    const myLearningNav = document.getElementById('mylearning-nav');
    const signupNav = document.getElementById('signup-nav');
    const logoutNav = document.getElementById('logout-nav');
    
    if (myLearningNav) myLearningNav.style.display = 'none';
    if (signupNav) signupNav.style.display = 'block';
    if (logoutNav) logoutNav.style.display = 'none';
}

// Load user's learning data
async function loadMyLearning() {
    const token = localStorage.getItem('entropy_token');
    
    if (!token) {
        updateNavigationForLoggedOutUser();
        return;
    }
    
    try {
        const response = await fetch(`${window.ENV.API_BASE}/modules`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await jsonSafe(response);
        
        if (data.success) {
            myLearningData.enrolled = data.data.enrolledModules || [];
            myLearningData.completed = data.data.completedModules || [];
            myLearningData.progress = data.data.progress || {};
            
            updateMyLearningDisplay();
            updateLearningStats();
        } else {
            console.error('Failed to load learning data:', data.error);
        }
    } catch (error) {
        console.error('Error loading learning data:', error);
    }
}

// Update My Learning display
function updateMyLearningDisplay() {
    updateEnrolledModules();
    updateCompletedModules();
    updateRecommendedModules();
}

// Update enrolled modules display
function updateEnrolledModules() {
    const enrolledGrid = document.getElementById('enrolled-grid');
    if (!enrolledGrid) return;
    
    if (myLearningData.enrolled.length === 0) {
        enrolledGrid.innerHTML = `
            <div class="no-courses">
                <i class="fas fa-graduation-cap"></i>
                <h3>No courses enrolled yet</h3>
                <p>Start your learning journey by enrolling in a course!</p>
                <button class="btn btn-primary" onclick="showSection('modules')">Browse Courses</button>
            </div>
        `;
        return;
    }
    
    enrolledGrid.innerHTML = '';
    
    myLearningData.enrolled.forEach(moduleId => {
        const module = findModuleById(moduleId);
        if (module) {
            const learningCard = createLearningCard(module, 'enrolled');
            enrolledGrid.appendChild(learningCard);
        }
    });
}

// Update completed modules display
function updateCompletedModules() {
    const completedGrid = document.getElementById('completed-grid');
    if (!completedGrid) return;
    
    if (myLearningData.completed.length === 0) {
        completedGrid.innerHTML = `
            <div class="no-courses">
                <i class="fas fa-trophy"></i>
                <h3>No completed courses yet</h3>
                <p>Complete your enrolled courses to see them here!</p>
            </div>
        `;
        return;
    }
    
    completedGrid.innerHTML = '';
    
    myLearningData.completed.forEach(moduleId => {
        const module = findModuleById(moduleId);
        if (module) {
            const learningCard = createLearningCard(module, 'completed');
            completedGrid.appendChild(learningCard);
        }
    });
}

// Update recommended modules display
function updateRecommendedModules() {
    const recommendedGrid = document.getElementById('recommended-grid');
    if (!recommendedGrid) return;
    
    // Simple recommendation logic based on enrolled courses
    const enrolledCategories = myLearningData.enrolled.map(id => {
        const module = findModuleById(id);
        return module ? module.category : null;
    }).filter(Boolean);
    
    const recommendedModules = Object.values(modulesData).flat().filter(module => 
        !myLearningData.enrolled.includes(module.id) && 
        !myLearningData.completed.includes(module.id) &&
        enrolledCategories.includes(module.category)
    ).slice(0, 3);
    
    if (recommendedModules.length === 0) {
        recommendedGrid.innerHTML = `
            <div class="no-courses">
                <i class="fas fa-lightbulb"></i>
                <h3>No recommendations yet</h3>
                <p>Complete some courses to get personalized recommendations!</p>
            </div>
        `;
        return;
    }
    
    recommendedGrid.innerHTML = '';
    
    recommendedModules.forEach(module => {
        const learningCard = createLearningCard(module, 'recommended');
        recommendedGrid.appendChild(learningCard);
    });
}

// Find module by ID
function findModuleById(moduleId) {
    return Object.values(modulesData).flat().find(module => module.id === moduleId);
}

// Create learning card
function createLearningCard(module, type) {
    const card = document.createElement('div');
    card.className = 'learning-card';
    
    const progress = myLearningData.progress[module.id] || 0;
    const isCompleted = type === 'completed' || progress >= 100;
    
    let actionsHTML = '';
    if (type === 'enrolled') {
        if (isCompleted) {
            actionsHTML = `
                <button class="btn btn-complete" onclick="markAsCompleted(${module.id})">
                    <i class="fas fa-check"></i> Mark Complete
                </button>
            `;
        } else {
            actionsHTML = `
                <button class="btn btn-continue" onclick="continueModule(${module.id})">
                    <i class="fas fa-play"></i> Continue
                </button>
                <button class="btn btn-complete" onclick="markAsCompleted(${module.id})">
                    <i class="fas fa-check"></i> Complete
                </button>
            `;
        }
    } else if (type === 'recommended') {
        actionsHTML = `
            <button class="btn btn-primary" onclick="handleModuleEnrollment(${module.id})">
                <i class="fas fa-plus"></i> Enroll
            </button>
        `;
    } else if (type === 'completed') {
        actionsHTML = `
            <button class="btn btn-secondary" onclick="reviewModule(${module.id})">
                <i class="fas fa-eye"></i> Review
            </button>
        `;
    }
    
    card.innerHTML = `
        <div class="learning-card-header">
            <div>
                <h3 class="learning-card-title">${module.title}</h3>
                <span class="learning-card-category">${module.category}</span>
            </div>
        </div>
        <p class="learning-card-description">${module.description}</p>
        ${type === 'enrolled' ? `
            <div class="learning-card-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${progress}% Complete</div>
            </div>
        ` : ''}
        <div class="learning-card-actions">
            ${actionsHTML}
        </div>
    `;
    
    return card;
}

// Update learning stats
function updateLearningStats() {
    const enrolledCount = document.getElementById('enrolled-count');
    const completedCount = document.getElementById('completed-count');
    const progressPercentage = document.getElementById('progress-percentage');
    
    if (enrolledCount) enrolledCount.textContent = myLearningData.enrolled.length;
    if (completedCount) completedCount.textContent = myLearningData.completed.length;
    
    if (progressPercentage && myLearningData.enrolled.length > 0) {
        const totalProgress = myLearningData.enrolled.reduce((sum, moduleId) => {
            return sum + (myLearningData.progress[moduleId] || 0);
        }, 0);
        const avgProgress = Math.round(totalProgress / myLearningData.enrolled.length);
        progressPercentage.textContent = `${avgProgress}%`;
    } else if (progressPercentage) {
        progressPercentage.textContent = '0%';
    }
}

// Show learning category
function showLearningCategory(category) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.learning-tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update category display
    const categories = document.querySelectorAll('.learning-category');
    categories.forEach(cat => cat.classList.remove('active'));
    
    const targetCategory = document.getElementById(`${category}-modules`);
    if (targetCategory) {
        targetCategory.classList.add('active');
    }
}

// Mark module as completed
async function markAsCompleted(moduleId) {
    const token = localStorage.getItem('entropy_token');
    
    if (!token) {
        showNotification('Please log in to complete modules.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${window.ENV.API_BASE}/modules/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ moduleId })
        });
        
        const data = await jsonSafe(response);
        
        if (data.success) {
            showNotification('Module marked as completed!', 'success');
            loadMyLearning(); // Refresh learning data
        } else {
            showNotification(data.error || 'Failed to complete module.', 'error');
        }
    } catch (error) {
        console.error('Complete module error:', error);
        showNotification(String(error.message || error), 'error');
    }
}

// Continue module
function continueModule(moduleId) {
    showNotification('Continue learning feature coming soon!', 'info');
}

// Review completed module
function reviewModule(moduleId) {
    showNotification('Review feature coming soon!', 'info');
}

// Check authentication for modules access
function checkModuleAccess() {
    if (!isLoggedIn()) {
        showNotification('Please sign up or log in to access learning modules.', 'error');
        showSection('signup');
        setActiveNavLink('signup');
        return false;
    }
    return true;
}

// Initialize app with API data
document.addEventListener('DOMContentLoaded', function() {
    // Load modules from API
    loadModules();
    
    // Check if user is already logged in
    if (isLoggedIn()) {
        const user = getCurrentUser();
        if (user) {
            console.log('User logged in:', user.name);
            updateNavigationForLoggedInUser();
            loadMyLearning();
        }
    }
});

