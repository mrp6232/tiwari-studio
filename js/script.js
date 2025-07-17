// Tiwari Studio - Main JavaScript File

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeSmoothScrolling();
    initializeFormValidation();
    initializeAnimations();
    setMinimumDate();
    
    // Initialize page-specific functionality
    if (document.getElementById('booking-form')) {
        initializeBookingForm();
    }
    
    if (document.getElementById('quick-contact-form')) {
        initializeQuickContactForm();
    }
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Animate hamburger bars
            const bars = hamburger.querySelectorAll('.bar');
            bars.forEach((bar, index) => {
                if (hamburger.classList.contains('active')) {
                    if (index === 0) bar.style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                    if (index === 1) bar.style.opacity = '0';
                    if (index === 2) bar.style.transform = 'rotate(45deg) translate(-5px, -6px)';
                } else {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                }
            });
        });
    }

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                const bars = hamburger.querySelectorAll('.bar');
                bars.forEach(bar => {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                });
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
        }
    });
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                const offsetTop = targetElement.offsetTop - 70; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Form validation utilities
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[\(\)\-\.]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
}

function validateName(name) {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + '-error');
    
    if (field) {
        field.style.borderColor = '#e74c3c';
        field.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + '-error');
    
    if (field) {
        field.style.borderColor = '#e9ecef';
        field.style.boxShadow = 'none';
    }
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

// General form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    clearError(this.id);
                    this.classList.remove('error');
                }
            });
        });
    });
}

function validateField(field) {
    const fieldId = field.id;
    const fieldValue = field.value.trim();
    const fieldType = field.type;
    const isRequired = field.hasAttribute('required');
    
    // Clear previous errors
    clearError(fieldId);
    
    // Check if required field is empty
    if (isRequired && !fieldValue) {
        showError(fieldId, 'This field is required');
        field.classList.add('error');
        return false;
    }
    
    // Skip validation for empty non-required fields
    if (!fieldValue && !isRequired) {
        return true;
    }
    
    // Validate based on field type or name
    switch (fieldType) {
        case 'email':
            if (!validateEmail(fieldValue)) {
                showError(fieldId, 'Please enter a valid email address');
                field.classList.add('error');
                return false;
            }
            break;
            
        case 'tel':
            if (!validatePhone(fieldValue)) {
                showError(fieldId, 'Please enter a valid phone number (minimum 10 digits)');
                field.classList.add('error');
                return false;
            }
            break;
            
        case 'text':
            if (fieldId.includes('Name') || fieldId.includes('name')) {
                if (!validateName(fieldValue)) {
                    showError(fieldId, 'Please enter a valid name (letters only, minimum 2 characters)');
                    field.classList.add('error');
                    return false;
                }
            }
            break;
            
        case 'date':
            const selectedDate = new Date(fieldValue);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showError(fieldId, 'Please select a future date');
                field.classList.add('error');
                return false;
            }
            break;
            
        case 'checkbox':
            if (isRequired && !field.checked) {
                showError(fieldId, 'You must agree to the terms and conditions');
                field.classList.add('error');
                return false;
            }
            break;
    }
    
    return true;
}

// Set minimum date for date inputs to today
function setMinimumDate() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        input.setAttribute('min', today);
    });
}

// Booking form specific functionality
function initializeBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    const successMessage = document.getElementById('success-message');
    
    if (!bookingForm) return;
    
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateBookingForm()) {
            submitBookingForm();
        }
    });
    
    // Service type change handler
    const serviceType = document.getElementById('serviceType');
    if (serviceType) {
        serviceType.addEventListener('change', function() {
            updateServiceInformation(this.value);
        });
    }
}

function validateBookingForm() {
    const requiredFields = [
        'fullName',
        'email', 
        'mobile',
        'serviceType',
        'preferredDate',
        'terms'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function submitBookingForm() {
    const form = document.getElementById('booking-form');
    const successMessage = document.getElementById('success-message');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Show loading state
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual submission logic)
    setTimeout(() => {
        // Hide form and show success message
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Reset button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        
        // Send confirmation email simulation
        sendConfirmationEmail();
        
    }, 2000);
}

function sendConfirmationEmail() {
    // In a real application, this would make an API call to send an email
    console.log('Confirmation email sent');
}

function resetForm() {
    const form = document.getElementById('booking-form');
    const successMessage = document.getElementById('success-message');
    
    // Reset form
    form.reset();
    
    // Clear all errors
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });
    
    // Remove error classes
    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
        field.style.borderColor = '#e9ecef';
        field.style.boxShadow = 'none';
    });
    
    // Show form and hide success message
    form.style.display = 'block';
    successMessage.style.display = 'none';
    
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateServiceInformation(serviceType) {
    // This function could update pricing, duration options, etc. based on selected service
    const durationSelect = document.getElementById('duration');
    
    if (!durationSelect) return;
    
    // Clear existing options
    durationSelect.innerHTML = '<option value="">Select duration</option>';
    
    let options = [];
    
    switch (serviceType) {
        case 'pre-wedding':
            options = [
                { value: '2-hours', text: '2 Hours' },
                { value: '4-hours', text: '4 Hours' },
                { value: '6-hours', text: '6 Hours' }
            ];
            break;
            
        case 'wedding':
            options = [
                { value: '6-hours', text: '6 Hours' },
                { value: 'full-day', text: 'Full Day (12 Hours)' },
                { value: 'multiple-days', text: 'Multiple Days' }
            ];
            break;
            
        case 'videography':
            options = [
                { value: '4-hours', text: '4 Hours' },
                { value: '6-hours', text: '6 Hours' },
                { value: 'full-day', text: 'Full Day' }
            ];
            break;
            
        case 'baby-welcome':
            options = [
                { value: '1-hour', text: '1 Hour' },
                { value: '2-hours', text: '2 Hours' },
                { value: '3-hours', text: '3 Hours' }
            ];
            break;
            
        case 'freelance':
            options = [
                { value: '2-hours', text: '2 Hours' },
                { value: '4-hours', text: '4 Hours' },
                { value: '6-hours', text: '6 Hours' },
                { value: 'full-day', text: 'Full Day' }
            ];
            break;
            
        default:
            options = [
                { value: '2-hours', text: '2 Hours' },
                { value: '4-hours', text: '4 Hours' },
                { value: '6-hours', text: '6 Hours' },
                { value: 'full-day', text: 'Full Day' }
            ];
    }
    
    // Add options to select
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        durationSelect.appendChild(optionElement);
    });
}

// Quick contact form functionality
function initializeQuickContactForm() {
    const quickContactForm = document.getElementById('quick-contact-form');
    
    if (!quickContactForm) return;
    
    quickContactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateQuickContactForm()) {
            submitQuickContactForm();
        }
    });
}

function validateQuickContactForm() {
    const requiredFields = ['quick-name', 'quick-email', 'quick-message'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function submitQuickContactForm() {
    const form = document.getElementById('quick-contact-form');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Show loading state
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        // Reset form
        form.reset();
        
        // Show success message
        submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        submitButton.style.background = '#27ae60';
        
        // Reset button after 3 seconds
        setTimeout(() => {
            submitButton.innerHTML = originalButtonText;
            submitButton.style.background = '';
            submitButton.disabled = false;
        }, 3000);
        
    }, 1500);
}

// Animation and scroll effects
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .contact-item, .info-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        observer.observe(el);
    });
    
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const hero = document.querySelector('.hero');
        if (hero) {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            hero.style.transform = `translateY(${parallax}px)`;
        }
    });
}

// Utility functions
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

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // In production, you might want to send this to an error reporting service
});

// Make functions globally available
window.resetForm = resetForm;
window.validateField = validateField;

// Service Worker registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment the next line if you add a service worker
        // navigator.serviceWorker.register('/sw.js');
    });
}

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}
