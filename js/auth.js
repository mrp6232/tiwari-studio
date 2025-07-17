// Authentication JavaScript for Tiwari Studio

// API Base URL
const API_BASE = '';

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Initialize login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Initialize register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Initialize logout functionality
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', handleLogout);
    });
}

async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
            const user = await response.json();
            handleAuthSuccess(user);
        } else {
            handleAuthFailure();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        handleAuthFailure();
    }
}

function handleAuthSuccess(user) {
    // Update UI for authenticated user
    updateUserUI(user);
    
    // Redirect to admin if user is admin and on login page
    if (user.role === 'admin' && window.location.pathname.includes('login.html')) {
        window.location.href = '/admin.html';
    }
}

function handleAuthFailure() {
    // Update UI for unauthenticated user
    clearUserUI();
    
    // Redirect to login if trying to access protected pages
    const protectedPages = ['/admin.html', '/admin'];
    if (protectedPages.some(page => window.location.pathname.includes(page))) {
        window.location.href = '/login.html';
    }
}

function updateUserUI(user) {
    // Update navigation for logged-in user
    const loginLink = document.querySelector('a[href="login.html"]');
    if (loginLink) {
        loginLink.textContent = user.fullName;
        loginLink.href = user.role === 'admin' ? '/admin.html' : '#';
        
        // Add logout option
        const navMenu = loginLink.closest('.nav-menu');
        if (navMenu && !document.querySelector('.logout-link')) {
            const logoutItem = document.createElement('li');
            logoutItem.className = 'nav-item';
            logoutItem.innerHTML = '<a href="#" class="nav-link logout-link" onclick="handleLogout(event)">Logout</a>';
            navMenu.appendChild(logoutItem);
        }
    }
}

function clearUserUI() {
    // Reset navigation for logged-out user
    const loginLink = document.querySelector('a[href="/admin.html"], a[href="#"]');
    if (loginLink && loginLink.textContent !== 'Login') {
        loginLink.textContent = 'Login';
        loginLink.href = 'login.html';
    }
    
    // Remove logout link
    const logoutLink = document.querySelector('.logout-link');
    if (logoutLink) {
        logoutLink.closest('.nav-item').remove();
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
    submitBtn.disabled = true;
    
    // Clear previous errors
    clearAuthErrors();
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Success
            showAuthSuccess('login', 'Login successful! Redirecting...');
            
            // Redirect based on user role
            setTimeout(() => {
                if (result.user.role === 'admin') {
                    window.location.href = '/admin.html';
                } else {
                    window.location.href = '/index.html';
                }
            }, 1500);
        } else {
            // Error
            showAuthError('login', result.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAuthError('login', 'Network error. Please try again.');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate passwords match
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match');
        return;
    }
    
    const registerData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: password,
        fullName: formData.get('fullName')
    };
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;
    
    // Clear previous errors
    clearAuthErrors();
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Success
            showAuthSuccess('register', 'Registration successful! Redirecting to login...');
            
            // Redirect to login
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            // Error
            showAuthError('register', result.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAuthError('register', 'Network error. Please try again.');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleLogout(event) {
    if (event) {
        event.preventDefault();
    }
    
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            // Clear user UI and redirect
            clearUserUI();
            window.location.href = '/index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Still redirect on error
        window.location.href = '/index.html';
    }
}

function showAuthSuccess(type, message) {
    const successDiv = document.getElementById(`${type}-success`);
    if (successDiv) {
        successDiv.querySelector('p').textContent = message;
        successDiv.style.display = 'block';
        
        // Hide form
        const form = document.getElementById(`${type}-form`);
        if (form) {
            form.style.display = 'none';
        }
    }
}

function showAuthError(type, message) {
    const errorDiv = document.getElementById(`${type}-error`);
    if (errorDiv) {
        errorDiv.querySelector(`#${type}-error-message`).textContent = message;
        errorDiv.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (field) {
        field.style.borderColor = '#e74c3c';
        field.classList.add('error');
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearAuthErrors() {
    // Clear error messages
    const errorDivs = document.querySelectorAll('.error-alert');
    errorDivs.forEach(div => {
        div.style.display = 'none';
    });
    
    // Clear field errors
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => {
        msg.textContent = '';
        msg.style.display = 'none';
    });
    
    // Clear field error styles
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.style.borderColor = '';
        field.classList.remove('error');
    });
}

// Utility function to check if user is admin
function isAdmin() {
    return new Promise((resolve) => {
        fetch('/api/auth/user')
            .then(response => response.json())
            .then(user => resolve(user.role === 'admin'))
            .catch(() => resolve(false));
    });
}

// Export functions for use in other scripts
window.authUtils = {
    checkAuthStatus,
    handleLogout,
    isAdmin,
    showAuthError,
    showAuthSuccess
};