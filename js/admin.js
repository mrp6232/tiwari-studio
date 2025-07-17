// Admin Dashboard JavaScript

let currentUser = null;
let allBookings = [];
let allUsers = [];
let allGalleryImages = [];
let allFrames = [];

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadDashboardData();
});

// Authentication check
async function checkAdminAuth() {
    try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
            const user = await response.json();
            if (user.role === 'admin') {
                currentUser = user;
                document.getElementById('admin-username').textContent = user.fullName || user.username;
            } else {
                // Redirect non-admin users
                window.location.href = '/login.html';
            }
        } else {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login.html';
    }
}

// Load all dashboard data
async function loadDashboardData() {
    showLoading();
    try {
        await Promise.all([
            loadBookings(),
            loadUsers(),
            loadGalleryImages(),
            loadFrames()
        ]);
        updateDashboardStats();
        populateRecentBookings();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    } finally {
        hideLoading();
    }
}

// Section navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName + '-section').classList.add('active');
    
    // Add active class to clicked nav link
    event.target.closest('.nav-link').classList.add('active');
    
    // Load section-specific data
    switch(sectionName) {
        case 'bookings':
            populateBookingsTable();
            break;
        case 'users':
            populateUsersTable();
            break;
        case 'gallery':
            populateGalleryGrid();
            break;
        case 'frames':
            populateFramesTable();
            break;
    }
}

// Load bookings data
async function loadBookings() {
    try {
        const response = await fetch('/api/admin/bookings');
        if (response.ok) {
            allBookings = await response.json();
        } else {
            throw new Error('Failed to load bookings');
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        allBookings = [];
    }
}

// Load users data
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
            allUsers = await response.json();
        } else {
            throw new Error('Failed to load users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        allUsers = [];
    }
}

// Load gallery images
async function loadGalleryImages() {
    try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
            allGalleryImages = await response.json();
        } else {
            throw new Error('Failed to load gallery images');
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
        allGalleryImages = [];
    }
}

// Load frames data
async function loadFrames() {
    try {
        const response = await fetch('/api/frames');
        if (response.ok) {
            allFrames = await response.json();
        } else {
            throw new Error('Failed to load frames');
        }
    } catch (error) {
        console.error('Error loading frames:', error);
        allFrames = [];
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    document.getElementById('total-bookings').textContent = allBookings.length;
    document.getElementById('total-users').textContent = allUsers.filter(u => u.role === 'customer').length;
    document.getElementById('pending-bookings').textContent = allBookings.filter(b => b.status === 'pending').length;
    document.getElementById('total-gallery').textContent = allGalleryImages.length;
}

// Populate recent bookings table
function populateRecentBookings() {
    const tbody = document.querySelector('#recent-bookings-table tbody');
    const recentBookings = allBookings.slice(0, 5);
    
    tbody.innerHTML = recentBookings.map(booking => `
        <tr>
            <td>${booking.full_name}</td>
            <td>${formatServiceType(booking.service_type)}</td>
            <td>${formatDate(booking.event_date)}</td>
            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
        </tr>
    `).join('');
}

// Populate bookings table
function populateBookingsTable() {
    const tbody = document.querySelector('#bookings-table tbody');
    
    tbody.innerHTML = allBookings.map(booking => `
        <tr>
            <td>#${booking.id}</td>
            <td>${booking.full_name}</td>
            <td>${booking.email}</td>
            <td>${booking.phone}</td>
            <td>${formatServiceType(booking.service_type)}</td>
            <td>${formatDate(booking.event_date)}</td>
            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            <td>
                <button class="btn-small btn-primary" onclick="viewBookingDetails(${booking.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-small btn-success" onclick="updateBookingStatus(${booking.id}, 'confirmed')">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-small btn-danger" onclick="updateBookingStatus(${booking.id}, 'cancelled')">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Populate users table
function populateUsersTable() {
    const tbody = document.querySelector('#users-table tbody');
    
    tbody.innerHTML = allUsers.map(user => `
        <tr>
            <td>#${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.full_name}</td>
            <td><span class="role-badge role-${user.role}">${user.role}</span></td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <button class="btn-small btn-primary" onclick="viewUserDetails(${user.id})">
                    <i class="fas fa-eye"></i>
                </button>
                ${user.role !== 'admin' ? `
                    <button class="btn-small btn-warning" onclick="toggleUserRole(${user.id})">
                        <i class="fas fa-user-cog"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Populate gallery grid
function populateGalleryGrid() {
    const grid = document.getElementById('gallery-grid');
    
    grid.innerHTML = allGalleryImages.map(image => `
        <div class="admin-gallery-item">
            <div class="gallery-item-image">
                <img src="${image.image_url}" alt="${image.title}" loading="lazy">
                <div class="gallery-item-overlay">
                    <button class="btn-small btn-danger" onclick="deleteGalleryImage(${image.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="gallery-item-info">
                <h4>${image.title}</h4>
                <p class="category-tag">${image.category}</p>
                <p class="description">${image.description || 'No description'}</p>
            </div>
        </div>
    `).join('');
}

// Populate frames table
function populateFramesTable() {
    const tbody = document.querySelector('#frames-table tbody');
    
    tbody.innerHTML = allFrames.map(frame => `
        <tr>
            <td>#${frame.id}</td>
            <td>${frame.name}</td>
            <td>${frame.material}</td>
            <td>₹${frame.basePrice}</td>
            <td>${frame.stock}</td>
            <td>
                ${frame.popular ? '<span class="badge-popular">Popular</span>' : ''}
                ${frame.premium ? '<span class="badge-premium">Premium</span>' : ''}
                ${frame.new ? '<span class="badge-new">New</span>' : ''}
            </td>
            <td>
                <button class="btn-small btn-primary" onclick="editFrame(${frame.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-small btn-danger" onclick="deleteFrame(${frame.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Booking details modal
function viewBookingDetails(bookingId) {
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const detailsHTML = `
        <div class="booking-details-grid">
            <div class="detail-group">
                <label>Booking ID:</label>
                <span>#${booking.id}</span>
            </div>
            <div class="detail-group">
                <label>Client Name:</label>
                <span>${booking.full_name}</span>
            </div>
            <div class="detail-group">
                <label>Email:</label>
                <span>${booking.email}</span>
            </div>
            <div class="detail-group">
                <label>Phone:</label>
                <span>${booking.phone}</span>
            </div>
            <div class="detail-group">
                <label>Service Type:</label>
                <span>${formatServiceType(booking.service_type)}</span>
            </div>
            <div class="detail-group">
                <label>Event Date:</label>
                <span>${formatDate(booking.event_date)}</span>
            </div>
            <div class="detail-group">
                <label>Event Time:</label>
                <span>${booking.event_time}</span>
            </div>
            <div class="detail-group">
                <label>Location:</label>
                <span>${booking.location || 'Not specified'}</span>
            </div>
            <div class="detail-group">
                <label>Guest Count:</label>
                <span>${booking.guest_count || 'Not specified'}</span>
            </div>
            <div class="detail-group">
                <label>Budget Range:</label>
                <span>${booking.budget_range || 'Not specified'}</span>
            </div>
            <div class="detail-group full-width">
                <label>Special Requests:</label>
                <span>${booking.special_requests || 'None'}</span>
            </div>
            <div class="detail-group">
                <label>Status:</label>
                <select id="booking-status-select">
                    <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
        </div>
    `;
    
    document.getElementById('booking-details').innerHTML = detailsHTML;
    document.getElementById('booking-modal').style.display = 'flex';
    document.getElementById('booking-modal').dataset.bookingId = bookingId;
}

// Close booking modal
function closeBookingModal() {
    document.getElementById('booking-modal').style.display = 'none';
}

// Update booking status
async function updateBookingStatus(bookingId, newStatus) {
    if (!bookingId && !newStatus) {
        // Called from modal
        const modal = document.getElementById('booking-modal');
        bookingId = modal.dataset.bookingId;
        newStatus = document.getElementById('booking-status-select').value;
    }
    
    try {
        showLoading();
        const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            await loadBookings();
            populateBookingsTable();
            updateDashboardStats();
            closeBookingModal();
            showNotification('Booking status updated successfully', 'success');
        } else {
            throw new Error('Failed to update booking status');
        }
    } catch (error) {
        console.error('Error updating booking status:', error);
        showNotification('Error updating booking status', 'error');
    } finally {
        hideLoading();
    }
}

// Filter bookings
function filterBookings() {
    const statusFilter = document.getElementById('status-filter').value;
    const serviceFilter = document.getElementById('service-filter').value;
    
    let filteredBookings = allBookings;
    
    if (statusFilter !== 'all') {
        filteredBookings = filteredBookings.filter(b => b.status === statusFilter);
    }
    
    if (serviceFilter !== 'all') {
        filteredBookings = filteredBookings.filter(b => b.service_type === serviceFilter);
    }
    
    const tbody = document.querySelector('#bookings-table tbody');
    tbody.innerHTML = filteredBookings.map(booking => `
        <tr>
            <td>#${booking.id}</td>
            <td>${booking.full_name}</td>
            <td>${booking.email}</td>
            <td>${booking.phone}</td>
            <td>${formatServiceType(booking.service_type)}</td>
            <td>${formatDate(booking.event_date)}</td>
            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            <td>
                <button class="btn-small btn-primary" onclick="viewBookingDetails(${booking.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-small btn-success" onclick="updateBookingStatus(${booking.id}, 'confirmed')">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-small btn-danger" onclick="updateBookingStatus(${booking.id}, 'cancelled')">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Show/hide gallery image form
function showAddImageForm() {
    document.getElementById('add-image-form').style.display = 'block';
}

function hideAddImageForm() {
    document.getElementById('add-image-form').style.display = 'none';
    document.getElementById('gallery-form').reset();
}

// Add gallery image
document.getElementById('gallery-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('image-title').value,
        description: document.getElementById('image-description').value,
        category: document.getElementById('image-category').value,
        imageUrl: document.getElementById('image-url').value
    };
    
    try {
        showLoading();
        const response = await fetch('/api/admin/gallery', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            await loadGalleryImages();
            populateGalleryGrid();
            hideAddImageForm();
            showNotification('Gallery image added successfully', 'success');
        } else {
            throw new Error('Failed to add gallery image');
        }
    } catch (error) {
        console.error('Error adding gallery image:', error);
        showNotification('Error adding gallery image', 'error');
    } finally {
        hideLoading();
    }
});

// Refresh functions
async function refreshBookings() {
    showLoading();
    await loadBookings();
    populateBookingsTable();
    updateDashboardStats();
    hideLoading();
    showNotification('Bookings refreshed', 'success');
}

async function refreshUsers() {
    showLoading();
    await loadUsers();
    populateUsersTable();
    updateDashboardStats();
    hideLoading();
    showNotification('Users refreshed', 'success');
}

async function refreshGallery() {
    showLoading();
    await loadGalleryImages();
    populateGalleryGrid();
    updateDashboardStats();
    hideLoading();
    showNotification('Gallery refreshed', 'success');
}

async function refreshFrames() {
    showLoading();
    await loadFrames();
    populateFramesTable();
    hideLoading();
    showNotification('Frames refreshed', 'success');
}

// Logout function
async function handleLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            window.location.href = '/login.html';
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error logging out', 'error');
    }
}

// Utility functions
function formatServiceType(serviceType) {
    const serviceNames = {
        'wedding': 'Wedding Photography',
        'pre-wedding': 'Pre-Wedding Shoot',
        'maternity': 'Maternity Photography',
        'baby': 'Baby Welcome Photography',
        'fashion': 'Fashion Photography',
        'freelance': 'Event Photography'
    };
    return serviceNames[serviceType] || serviceType;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}