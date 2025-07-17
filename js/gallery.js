// Gallery JavaScript for Tiwari Studio

let currentImageIndex = 0;
let galleryImages = [];
let filteredImages = [];

// Initialize gallery
document.addEventListener('DOMContentLoaded', function() {
    initializeGallery();
    loadGalleryImages();
});

function initializeGallery() {
    // Initialize filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            filterGallery(category);
            
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Initialize load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreImages);
    }
    
    // Initialize keyboard navigation for lightbox
    document.addEventListener('keydown', function(e) {
        const lightbox = document.getElementById('lightbox');
        if (lightbox && lightbox.style.display !== 'none') {
            switch(e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    previousImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
            }
        }
    });
    
    // Check URL parameters for category filter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        const filterBtn = document.querySelector(`[data-category="${categoryParam}"]`);
        if (filterBtn) {
            filterBtn.click();
        }
    }
}

async function loadGalleryImages() {
    try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
            galleryImages = await response.json();
            filteredImages = galleryImages;
            renderGallery();
        } else {
            // Fallback to sample images if API fails
            loadSampleImages();
        }
    } catch (error) {
        console.error('Failed to load gallery images:', error);
        loadSampleImages();
    }
}

function loadSampleImages() {
    // Sample images for demonstration
    galleryImages = [
        {
            id: 1,
            title: "Beautiful Wedding",
            description: "Outdoor ceremony with stunning natural lighting",
            category: "wedding",
            imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&q=80"
        },
        {
            id: 2,
            title: "Romantic Pre-Wedding",
            description: "Intimate moments captured in golden hour",
            category: "pre-wedding",
            imageUrl: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=500&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=300&q=80"
        },
        {
            id: 3,
            title: "Expecting Joy",
            description: "Beautiful maternity session celebrating new life",
            category: "maternity",
            imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&q=80"
        },
        {
            id: 4,
            title: "New Arrival",
            description: "Gentle newborn photography with soft lighting",
            category: "baby",
            imageUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=500&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=300&q=80"
        },
        {
            id: 5,
            title: "Fashion Portrait",
            description: "Professional fashion photography with dramatic lighting",
            category: "fashion",
            imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&q=80"
        },
        {
            id: 6,
            title: "Corporate Event",
            description: "Professional event coverage and candid moments",
            category: "freelance",
            imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&q=80"
        },
        {
            id: 7,
            title: "Traditional Ceremony",
            description: "Sacred moments captured with reverence and beauty",
            category: "wedding",
            imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=500&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=300&q=80"
        },
        {
            id: 8,
            title: "Love Story",
            description: "Capturing the chemistry between soulmates",
            category: "pre-wedding",
            imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=300&q=80"
        },
        {
            id: 9,
            title: "Editorial Portrait",
            description: "Stunning portrait with professional styling",
            category: "fashion",
            imageUrl: "https://images.unsplash.com/photo-1534126416832-7c5e9eafd755?w=500&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1534126416832-7c5e9eafd755?w=300&q=80"
        }
    ];
    
    filteredImages = galleryImages;
    renderGallery();
}

function filterGallery(category) {
    if (category === 'all') {
        filteredImages = galleryImages;
    } else {
        filteredImages = galleryImages.filter(img => img.category === category);
    }
    renderGallery();
}

function renderGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = '';
    
    filteredImages.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.dataset.category = image.category;
        galleryItem.innerHTML = `
            <div class="gallery-image">
                <img src="${image.thumbnailUrl || image.imageUrl}" alt="${image.title}" loading="lazy">
                <div class="gallery-overlay">
                    <div class="overlay-content">
                        <h3>${image.title}</h3>
                        <p>${image.description}</p>
                        <button class="view-btn" onclick="openLightbox(${index})">
                            <i class="fas fa-expand"></i>
                            View Full
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        galleryGrid.appendChild(galleryItem);
        
        // Add animation
        setTimeout(() => {
            galleryItem.style.animation = 'fadeInUp 0.6s ease forwards';
        }, index * 100);
    });
}

function openLightbox(index) {
    currentImageIndex = index;
    const image = filteredImages[currentImageIndex];
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    
    lightboxImage.src = image.imageUrl;
    lightboxImage.alt = image.title;
    lightboxTitle.textContent = image.title;
    lightboxDescription.textContent = image.description;
    
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Preload adjacent images
    preloadAdjacentImages();
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
}

function previousImage() {
    if (filteredImages.length === 0) return;
    
    currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
    updateLightboxImage();
}

function nextImage() {
    if (filteredImages.length === 0) return;
    
    currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
    updateLightboxImage();
}

function updateLightboxImage() {
    const image = filteredImages[currentImageIndex];
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    
    lightboxImage.src = image.imageUrl;
    lightboxImage.alt = image.title;
    lightboxTitle.textContent = image.title;
    lightboxDescription.textContent = image.description;
    
    preloadAdjacentImages();
}

function preloadAdjacentImages() {
    const prevIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
    const nextIndex = (currentImageIndex + 1) % filteredImages.length;
    
    // Preload previous image
    if (filteredImages[prevIndex]) {
        const prevImg = new Image();
        prevImg.src = filteredImages[prevIndex].imageUrl;
    }
    
    // Preload next image
    if (filteredImages[nextIndex]) {
        const nextImg = new Image();
        nextImg.src = filteredImages[nextIndex].imageUrl;
    }
}

function contactForBooking() {
    window.location.href = 'booking.html';
}

function downloadImage() {
    const image = filteredImages[currentImageIndex];
    // In a real application, this would request the high-resolution version
    window.open(`mailto:mr.prashants.62@gmail.com?subject=High-Resolution Image Request&body=I would like to request the high-resolution version of "${image.title}".`);
}

function loadMoreImages() {
    // In a real application, this would load more images from the server
    const loadMoreBtn = document.getElementById('load-more-btn');
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    setTimeout(() => {
        loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Photos';
        // For demo, we'll just show a message
        loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> All Photos Loaded';
        loadMoreBtn.disabled = true;
    }, 1000);
}

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.style.display !== 'none') {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swiped left - next image
            nextImage();
        } else {
            // Swiped right - previous image
            previousImage();
        }
    }
}

// Lazy loading for images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('fade-in');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading when gallery is rendered
const originalRenderGallery = renderGallery;
renderGallery = function() {
    originalRenderGallery();
    setupLazyLoading();
};