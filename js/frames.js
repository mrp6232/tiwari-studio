// Frames JavaScript for Tiwari Studio

let inquiryCart = [];
let selectedFrame = null;

// Initialize frames functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeFrames();
    loadFrames();
});

function initializeFrames() {
    // Initialize category filter buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const material = this.dataset.material;
            filterFrames(material);
            
            // Update active button
            categoryButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Initialize modal close handlers
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeFrameModal();
        }
    });
    
    // Initialize keyboard navigation
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('frame-modal');
        if (modal && modal.style.display !== 'none') {
            if (e.key === 'Escape') {
                closeFrameModal();
            }
        }
    });
    
    // Check URL parameters for material filter
    const urlParams = new URLSearchParams(window.location.search);
    const materialParam = urlParams.get('material');
    if (materialParam) {
        const filterBtn = document.querySelector(`[data-material="${materialParam}"]`);
        if (filterBtn) {
            filterBtn.click();
        }
    }
}

async function loadFrames() {
    try {
        const response = await fetch('/api/frames');
        if (response.ok) {
            const frames = await response.json();
            renderFrames(frames);
        } else {
            // Fallback to sample frames
            loadSampleFrames();
        }
    } catch (error) {
        console.error('Failed to load frames:', error);
        loadSampleFrames();
    }
}

function loadSampleFrames() {
    const sampleFrames = [
        {
            id: 1,
            name: "Classic Wooden Frame",
            description: "Premium handcrafted wooden frame perfect for wedding portraits",
            material: "wood",
            sizes: [
                { size: "8x10", price: 2500 },
                { size: "12x16", price: 3200 },
                { size: "16x20", price: 4000 }
            ],
            imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
            stock: 50,
            popular: true
        },
        {
            id: 2,
            name: "Modern Metal Frame",
            description: "Sleek aluminum frame with contemporary design",
            material: "metal",
            sizes: [
                { size: "10x12", price: 1800 },
                { size: "16x20", price: 2400 },
                { size: "20x24", price: 3000 }
            ],
            imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80",
            stock: 30
        },
        {
            id: 3,
            name: "Vintage Gold Frame",
            description: "Ornate gold-finished frame for special memories",
            material: "vintage",
            sizes: [
                { size: "16x20", price: 3500 },
                { size: "20x24", price: 4200 },
                { size: "24x30", price: 5000 }
            ],
            imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80",
            stock: 20,
            premium: true
        },
        {
            id: 4,
            name: "Crystal Clear Acrylic",
            description: "Premium acrylic glass with modern aesthetics",
            material: "acrylic",
            sizes: [
                { size: "8x10", price: 2200 },
                { size: "11x14", price: 2800 },
                { size: "16x20", price: 3400 }
            ],
            imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80",
            stock: 25,
            new: true
        },
        {
            id: 5,
            name: "Rustic Wooden Frame",
            description: "Reclaimed pine wood with natural character",
            material: "wood",
            sizes: [
                { size: "12x16", price: 2800 },
                { size: "16x20", price: 3400 },
                { size: "20x24", price: 4100 }
            ],
            imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&q=80",
            stock: 35
        },
        {
            id: 6,
            name: "Elegant Silver Frame",
            description: "Polished silver finish with clean lines",
            material: "metal",
            sizes: [
                { size: "8x10", price: 2100 },
                { size: "11x14", price: 2600 },
                { size: "16x20", price: 3200 }
            ],
            imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
            stock: 40
        }
    ];
    
    renderFrames(sampleFrames);
}

function renderFrames(frames) {
    const framesGrid = document.getElementById('frames-grid');
    if (!framesGrid) return;
    
    framesGrid.innerHTML = '';
    
    frames.forEach((frame, index) => {
        const frameCard = document.createElement('div');
        frameCard.className = 'frame-card';
        frameCard.dataset.material = frame.material;
        
        let badge = '';
        if (frame.popular) badge = '<div class="frame-badge">Popular</div>';
        else if (frame.premium) badge = '<div class="frame-badge premium">Premium</div>';
        else if (frame.new) badge = '<div class="frame-badge new">New</div>';
        
        const lowestPrice = frame.sizes ? Math.min(...frame.sizes.map(s => s.price)) : frame.price;
        
        frameCard.innerHTML = `
            <div class="frame-image">
                <img src="${frame.imageUrl}" alt="${frame.name}" loading="lazy">
                <div class="frame-overlay">
                    <button class="quick-view-btn" onclick="openFrameModal(${frame.id})">
                        <i class="fas fa-eye"></i>
                        Quick View
                    </button>
                </div>
                ${badge}
            </div>
            <div class="frame-info">
                <h3>${frame.name}</h3>
                <p class="frame-material">${frame.description}</p>
                <div class="frame-sizes">
                    ${frame.sizes ? frame.sizes.map(s => `<span class="size-tag">${s.size}</span>`).join('') : ''}
                </div>
                <div class="frame-price">
                    <span class="price">₹${lowestPrice.toLocaleString()}</span>
                    <span class="price-note">Starting from</span>
                </div>
                <div class="frame-actions">
                    <button class="btn btn-primary btn-small" onclick="addToInquiry(${frame.id})">
                        <i class="fas fa-plus"></i>
                        Add to Inquiry
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="customizeFrame(${frame.id})">
                        <i class="fas fa-cog"></i>
                        Customize
                    </button>
                </div>
            </div>
        `;
        
        framesGrid.appendChild(frameCard);
        
        // Add animation
        setTimeout(() => {
            frameCard.style.animation = 'fadeInUp 0.6s ease forwards';
        }, index * 100);
    });
    
    // Store frames data globally
    window.framesData = frames;
}

function filterFrames(material) {
    const frameCards = document.querySelectorAll('.frame-card');
    
    frameCards.forEach(card => {
        if (material === 'all' || card.dataset.material === material) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.6s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

function openFrameModal(frameId) {
    const frame = window.framesData.find(f => f.id === frameId);
    if (!frame) return;
    
    selectedFrame = frame;
    
    const modal = document.getElementById('frame-modal');
    const modalImage = document.getElementById('modal-frame-image');
    const modalTitle = document.getElementById('modal-frame-title');
    const modalMaterial = document.getElementById('modal-frame-material');
    const modalSizeOptions = document.getElementById('modal-size-options');
    
    modalImage.src = frame.imageUrl;
    modalImage.alt = frame.name;
    modalTitle.textContent = frame.name;
    modalMaterial.textContent = frame.description;
    
    // Populate size options
    modalSizeOptions.innerHTML = '';
    if (frame.sizes) {
        frame.sizes.forEach(size => {
            const sizeOption = document.createElement('div');
            sizeOption.className = 'size-option';
            sizeOption.innerHTML = `
                <div class="size-info">
                    <span class="size-name">${size.size}"</span>
                    <span class="size-price">₹${size.price.toLocaleString()}</span>
                </div>
                <button class="btn btn-small btn-outline" onclick="selectFrameSize('${size.size}', ${size.price})">
                    Select
                </button>
            `;
            modalSizeOptions.appendChild(sizeOption);
        });
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeFrameModal() {
    const modal = document.getElementById('frame-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    selectedFrame = null;
}

function selectFrameSize(size, price) {
    // Update selected frame with chosen size and price
    if (selectedFrame) {
        selectedFrame.selectedSize = size;
        selectedFrame.selectedPrice = price;
        
        // Add to inquiry
        addToInquiryFromModal();
    }
}

function addToInquiry(frameId) {
    const frame = window.framesData.find(f => f.id === frameId);
    if (!frame) return;
    
    // Use lowest price if no size selected
    const price = frame.selectedPrice || (frame.sizes ? frame.sizes[0].price : frame.price);
    const size = frame.selectedSize || (frame.sizes ? frame.sizes[0].size : 'Standard');
    
    const inquiryItem = {
        id: frame.id,
        name: frame.name,
        size: size,
        price: price,
        quantity: 1,
        imageUrl: frame.imageUrl
    };
    
    // Check if item already exists in cart
    const existingItemIndex = inquiryCart.findIndex(item => 
        item.id === inquiryItem.id && item.size === inquiryItem.size
    );
    
    if (existingItemIndex > -1) {
        inquiryCart[existingItemIndex].quantity += 1;
    } else {
        inquiryCart.push(inquiryItem);
    }
    
    updateInquiryCart();
    showAddToCartNotification(frame.name);
}

function addToInquiryFromModal() {
    if (selectedFrame) {
        addToInquiry(selectedFrame.id);
        closeFrameModal();
    }
}

function customizeFrame(frameId) {
    // In a real application, this would open a customization interface
    window.location.href = `mailto:mr.prashants.62@gmail.com?subject=Custom Frame Request&body=I would like to customize frame ID: ${frameId}. Please contact me to discuss custom options.`;
}

function updateInquiryCart() {
    const cartCount = document.getElementById('cart-count');
    const cartToggle = document.getElementById('cart-toggle');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    // Update cart count
    const totalItems = inquiryCart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Show/hide cart toggle
    if (totalItems > 0) {
        cartToggle.style.display = 'flex';
    } else {
        cartToggle.style.display = 'none';
    }
    
    // Update cart items
    cartItems.innerHTML = '';
    let total = 0;
    
    inquiryCart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.imageUrl}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Size: ${item.size}</p>
                <div class="cart-item-controls">
                    <button onclick="updateItemQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateItemQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <div class="cart-item-price">
                <span>₹${itemTotal.toLocaleString()}</span>
                <button class="remove-item" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = total.toLocaleString();
}

function updateItemQuantity(index, change) {
    inquiryCart[index].quantity += change;
    
    if (inquiryCart[index].quantity <= 0) {
        inquiryCart.splice(index, 1);
    }
    
    updateInquiryCart();
}

function removeFromCart(index) {
    inquiryCart.splice(index, 1);
    updateInquiryCart();
}

function toggleInquiryCart() {
    const cart = document.getElementById('inquiry-cart');
    const isVisible = cart.style.display === 'block';
    cart.style.display = isVisible ? 'none' : 'block';
}

function submitInquiry() {
    if (inquiryCart.length === 0) {
        alert('Your inquiry cart is empty. Please add some frames first.');
        return;
    }
    
    // Prepare inquiry data
    const inquiryData = {
        items: inquiryCart,
        total: inquiryCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date().toISOString()
    };
    
    // Create email content
    const emailSubject = 'Frame Inquiry from Tiwari Studio Website';
    let emailBody = 'Dear Tiwari Studio,\n\nI am interested in the following frames:\n\n';
    
    inquiryCart.forEach(item => {
        emailBody += `- ${item.name} (${item.size}) x ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString()}\n`;
    });
    
    emailBody += `\nTotal Estimated Cost: ₹${inquiryData.total.toLocaleString()}\n\n`;
    emailBody += 'Please contact me with more details about availability, customization options, and final pricing.\n\n';
    emailBody += 'Thank you!';
    
    // Open email client
    const mailtoLink = `mailto:mr.prashants.62@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    
    // Show success message
    showInquirySuccess();
}

function showInquirySuccess() {
    // Clear cart
    inquiryCart = [];
    updateInquiryCart();
    toggleInquiryCart();
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'inquiry-success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <h3>Inquiry Sent!</h3>
            <p>Your frame inquiry has been prepared. Please check your email client to send it.</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function showAddToCartNotification(frameName) {
    const notification = document.createElement('div');
    notification.className = 'add-to-cart-notification';
    notification.innerHTML = `
        <i class="fas fa-check"></i>
        <span>${frameName} added to inquiry</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function contactForCustom() {
    window.location.href = `mailto:mr.prashants.62@gmail.com?subject=Custom Frame Consultation&body=I would like to discuss custom frame options. Please contact me to schedule a consultation.`;
}

// Lazy loading for frame images
function setupFrameLazyLoading() {
    const images = document.querySelectorAll('.frame-card img[loading="lazy"]');
    
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

// Initialize lazy loading when frames are rendered
const originalRenderFrames = renderFrames;
renderFrames = function(frames) {
    originalRenderFrames(frames);
    setupFrameLazyLoading();
};