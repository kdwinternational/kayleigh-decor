// Kayleigh Decor Warehouse - Main JavaScript
// Handle all interactive functionality for the e-commerce site

class KayleighDecorStore {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('kayleighCart')) || [];
        this.init();
    }

    init() {
        this.initMobileMenu();
        this.initCart();
        this.initShippingCalculator();
        this.initProductFilters();
        this.initEnquiryForms();
        this.initSmoothScroll();
        this.updateCartDisplay();
    }

    // Mobile Menu Toggle
    initMobileMenu() {
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.getElementById('navMenu');

        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
    }

    // Cart Management
    initCart() {
        // Load cart from localStorage
        this.updateCartDisplay();
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
                leadTime: product.leadTime || 14
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showCartNotification(product.name);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }

    saveCart() {
        localStorage.setItem('kayleighCart', JSON.stringify(this.cart));
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');
        const cartItems = document.getElementById('cartItems');
        
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (cartCount) {
            cartCount.textContent = totalItems;
        }

        if (cartTotal) {
            cartTotal.textContent = `R${totalPrice.toFixed(2)}`;
        }

        if (cartItems) {
            this.renderCartItems(cartItems);
        }
    }

    renderCartItems(container) {
        if (this.cart.length === 0) {
            container.innerHTML = '<p class="text-center">Your cart is empty</p>';
            return;
        }

        container.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" width="50" height="50">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="lead-time">Lead time: ${item.leadTime} working days</p>
                    <p class="price">R${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="store.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="store.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-btn" onclick="store.removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    showCartNotification(productName) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${productName} added to cart</span>
            </div>
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

    // Shipping Calculator
    initShippingCalculator() {
        const shippingForm = document.getElementById('shippingCalculator');
        if (shippingForm) {
            shippingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculateShipping();
            });
        }
    }

    async calculateShipping() {
        const postcodeInput = document.getElementById('deliveryPostcode');
        const resultDiv = document.getElementById('shippingResult');
        
        if (!postcodeInput || !resultDiv) return;
        
        const postcode = postcodeInput.value.trim();
        
        if (!postcode || postcode.length !== 4 || !/^\d{4}$/.test(postcode)) {
            resultDiv.innerHTML = '<p class="error">Please enter a valid 4-digit South African postcode</p>';
            return;
        }

        resultDiv.innerHTML = '<p class="loading">Calculating delivery cost...</p>';

        try {
            // Cache shipping calculations to reduce API calls
            const cacheKey = `shipping_${postcode}`;
            let shippingData = localStorage.getItem(cacheKey);
            
            if (!shippingData) {
                // Calculate distance using simple formula (since we can't use external APIs without CORS)
                const distance = this.calculateApproximateDistance(postcode);
                const cost = this.calculateShippingCost(distance);
                
                shippingData = {
                    distance: distance,
                    cost: cost,
                    postcode: postcode
                };
                
                // Cache for 24 hours
                localStorage.setItem(cacheKey, JSON.stringify(shippingData));
                localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
            } else {
                shippingData = JSON.parse(shippingData);
                
                // Check if cache is older than 24 hours
                const timestamp = localStorage.getItem(`${cacheKey}_timestamp`);
                if (Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) {
                    localStorage.removeItem(cacheKey);
                    localStorage.removeItem(`${cacheKey}_timestamp`);
                    // Recalculate
                    return this.calculateShipping();
                }
            }

            this.displayShippingResult(shippingData, resultDiv);
            
        } catch (error) {
            resultDiv.innerHTML = '<p class="error">Unable to calculate shipping. Please contact us directly.</p>';
            console.error('Shipping calculation error:', error);
        }
    }

    calculateApproximateDistance(postcode) {
        // Simplified distance calculation based on South African postcode regions
        // This is a rough approximation for demo purposes
        const eastLondonPostcode = 5201;
        const inputPostcode = parseInt(postcode);
        
        // Calculate approximate distance based on postcode difference
        // This is not geographically accurate but gives a reasonable estimate
        const baseDistance = Math.abs(inputPostcode - eastLondonPostcode);
        
        // Adjust for different regions
        if (postcode.startsWith('8')) {
            // Western Cape - much further
            return Math.max(baseDistance * 8, 800);
        } else if (postcode.startsWith('2')) {
            // Gauteng - far but major route
            return Math.max(baseDistance * 6, 600);
        } else if (postcode.startsWith('4')) {
            // KZN - moderate distance
            return Math.max(baseDistance * 3, 300);
        } else if (postcode.startsWith('6')) {
            // Other Eastern Cape areas
            return Math.max(baseDistance * 2, 100);
        } else {
            // Default calculation
            return Math.max(baseDistance * 5, 200);
        }
    }

    calculateShippingCost(distance) {
        if (distance <= 40) {
            return 0; // Free local delivery
        } else if (distance <= 100) {
            return distance * 8; // R8 per km for regional
        } else if (distance <= 400) {
            return distance * 6; // R6 per km for long distance
        } else {
            const cost = distance * 5; // R5 per km for very long distance
            return Math.min(cost, 1200); // Cap at R1200
        }
    }

    displayShippingResult(data, container) {
        const cost = data.cost;
        const distance = data.distance;
        
        let html = `
            <div class="shipping-result">
                <div class="result-header">
                    <h4>Delivery to ${data.postcode}</h4>
                    <p class="distance">Approximate distance: ${Math.round(distance)} km from East London</p>
                </div>
        `;
        
        if (cost === 0) {
            html += `
                <div class="cost-free">
                    <i class="fas fa-truck"></i>
                    <span class="cost">FREE DELIVERY</span>
                    <p class="note">Local delivery area</p>
                </div>
            `;
        } else {
            html += `
                <div class="cost-calculated">
                    <i class="fas fa-truck"></i>
                    <span class="cost">R${cost.toFixed(2)}</span>
                    <p class="note">Delivery cost</p>
                </div>
            `;
        }
        
        html += `
                <div class="delivery-options">
                    <p><strong>Alternative:</strong></p>
                    <p><i class="fas fa-store"></i> Free collection from our East London factory</p>
                    <p class="factory-address">66a Fleet Street, Quigney, East London</p>
                </div>
                <div class="delivery-time">
                    <p><strong>Estimated delivery time:</strong></p>
                    <p>${this.getDeliveryTime(distance)}</p>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    getDeliveryTime(distance) {
        if (distance <= 40) {
            return '2-5 working days';
        } else if (distance <= 100) {
            return '3-7 working days';
        } else if (distance <= 400) {
            return '5-10 working days';
        } else {
            return '7-14 working days';
        }
    }

    // Product Filters
    initProductFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const sortSelect = document.getElementById('productSort');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.dataset.filter;
                this.filterProducts(filter);
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.sortProducts(sortSelect.value);
            });
        }
    }

    filterProducts(filter) {
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            const category = product.dataset.category;
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                product.style.display = 'block';
                product.classList.add('fade-in');
            } else {
                product.style.display = 'none';
                product.classList.remove('fade-in');
            }
        });
    }

    sortProducts(sortBy) {
        const container = document.querySelector('.products-grid');
        const products = Array.from(container.querySelectorAll('.product-card'));
        
        products.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                case 'price-high':
                    return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                case 'name':
                    return a.dataset.name.localeCompare(b.dataset.name);
                case 'lead-time':
                    return parseInt(a.dataset.leadtime) - parseInt(b.dataset.leadtime);
                default:
                    return 0;
            }
        });
        
        // Re-append sorted products
        products.forEach(product => container.appendChild(product));
    }

    // Enquiry Forms
    initEnquiryForms() {
        const enquiryForms = document.querySelectorAll('.enquiry-form');
        
        enquiryForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEnquirySubmission(form);
            });
        });
    }

    async handleEnquirySubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Simulate form submission (replace with actual endpoint)
            await this.simulateFormSubmission(data);
            
            this.showEnquirySuccess(form);
            form.reset();
            
        } catch (error) {
            this.showEnquiryError(form);
            console.error('Enquiry submission error:', error);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async simulateFormSubmission(data) {
        // Simulate API call delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success 90% of the time
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Simulated error'));
                }
            }, 2000);
        });
    }

    showEnquirySuccess(form) {
        const successMessage = document.createElement('div');
        successMessage.className = 'enquiry-success';
        successMessage.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h4>Enquiry Sent Successfully!</h4>
                <p>We'll get back to you within 24 hours via WhatsApp or email.</p>
            </div>
        `;
        
        form.parentNode.insertBefore(successMessage, form);
        form.style.display = 'none';
        
        setTimeout(() => {
            successMessage.remove();
            form.style.display = 'block';
        }, 5000);
    }

    showEnquiryError(form) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'enquiry-error';
        errorMessage.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-circle"></i>
                <h4>Something went wrong</h4>
                <p>Please try again or contact us directly on WhatsApp: 084 219 1002</p>
            </div>
        `;
        
        form.parentNode.insertBefore(errorMessage, form);
        
        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
    }

    // Smooth Scrolling
    initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Utility Methods
    formatPrice(price) {
        return `R${parseFloat(price).toFixed(2)}`;
    }

    formatLeadTime(days) {
        if (days <= 7) {
            return `${days} working days`;
        } else if (days <= 14) {
            return '1-2 weeks';
        } else if (days <= 21) {
            return '2-3 weeks';
        } else {
            return '3+ weeks';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }
}

// Product Database (Mock Data)
const productDatabase = {
    'motorised-blinds': [
        {
            id: 'MB-001',
            name: 'Motorised Roller Blind - Premium White',
            price: 1299.00,
            image: 'images/products/motorised-blind-white.jpg',
            category: 'motorised-blinds',
            leadTime: 14,
            description: 'Smart motorised blind with remote control and app integration',
            features: ['Remote Control', 'App Control', 'Voice Control', '2-Year Warranty']
        },
        {
            id: 'MB-002',
            name: 'Motorised Venetian Blind - Wood Effect',
            price: 1599.00,
            image: 'images/products/motorised-venetian.jpg',
            category: 'motorised-blinds',
            leadTime: 16,
            description: 'Automated venetian blinds with real wood effect finish',
            features: ['Tilt Control', 'Remote Operation', 'Battery Powered', 'Easy Install']
        }
    ],
    'manual-blinds': [
        {
            id: 'MNB-001',
            name: 'Manual Venetian Blind - Wood Effect',
            price: 599.00,
            image: 'images/products/venetian-blind-wood.jpg',
            category: 'manual-blinds',
            leadTime: 10,
            description: 'Classic wooden venetian blind with easy tilt control',
            features: ['Real Wood Effect', 'Easy Tilt', 'Child Safe', 'Multiple Finishes']
        },
        {
            id: 'MNB-002',
            name: 'Roller Blind - Block Out',
            price: 399.00,
            image: 'images/products/roller-blind-blackout.jpg',
            category: 'manual-blinds',
            leadTime: 8,
            description: 'Manual roller blind with complete light blocking',
            features: ['Block Out Fabric', 'Chain Operated', 'Easy Install', 'Multiple Colors']
        }
    ],
    'curtains': [
        {
            id: 'CU-001',
            name: 'Custom Block-Out Curtains - Charcoal',
            price: 899.00,
            image: 'images/products/curtains-charcoal.jpg',
            category: 'curtains',
            leadTime: 12,
            description: 'Premium block-out curtains with thermal insulation',
            features: ['Thermal Lining', 'Block Out', 'Custom Sizing', 'Machine Washable']
        },
        {
            id: 'CU-002',
            name: 'Sheer Curtains - White',
            price: 599.00,
            image: 'images/products/sheer-curtains-white.jpg',
            category: 'curtains',
            leadTime: 10,
            description: 'Elegant sheer curtains for privacy with natural light',
            features: ['Sheer Fabric', 'Privacy Filter', 'Lightweight', 'Easy Care']
        }
    ],
    'flooring': [
        {
            id: 'FL-001',
            name: 'Luxury Vinyl Plank - Oak Effect',
            price: 149.99,
            image: 'images/products/vinyl-plank-oak.jpg',
            category: 'flooring',
            leadTime: 7,
            description: 'Waterproof vinyl planks with authentic oak wood effect',
            features: ['Waterproof', 'Click-Lock', 'Scratch Resistant', 'Underlay Attached']
        },
        {
            id: 'FL-002',
            name: 'Laminate Flooring - Walnut',
            price: 129.99,
            image: 'images/products/laminate-walnut.jpg',
            category: 'flooring',
            leadTime: 7,
            description: 'Durable laminate flooring with walnut wood finish',
            features: ['Durable Surface', 'Easy Install', 'Moisture Resistant', 'Realistic Wood Grain']
        }
    ],
    'wallpaper': [
        {
            id: 'WP-001',
            name: 'Modern Geometric Wallpaper - Gold',
            price: 299.99,
            image: 'images/products/wallpaper-geometric-gold.jpg',
            category: 'wallpaper',
            leadTime: 10,
            description: 'Metallic geometric wallpaper with modern design',
            features: ['Vinyl Wallpaper', 'Paste-the-Wall', 'Washable', 'Metallic Accents']
        },
        {
            id: 'WP-002',
            name: 'Floral Wallpaper - Vintage Rose',
            price: 249.99,
            image: 'images/products/wallpaper-floral-rose.jpg',
            category: 'wallpaper',
            leadTime: 10,
            description: 'Vintage rose floral wallpaper for classic interiors',
            features: ['Traditional Pattern', 'Easy Application', 'Fade Resistant', 'Pattern Repeat 52cm']
        }
    ],
    'headboards': [
        {
            id: 'HB-001',
            name: 'Upholstered Headboard - Linen Grey',
            price: 2499.00,
            image: 'images/products/headboard-linen-grey.jpg',
            category: 'headboards',
            leadTime: 21,
            description: 'Custom upholstered headboard with deep button tufting',
            features: ['Premium Linen', 'Deep Tufting', 'Custom Sizing', 'Professional Installation']
        },
        {
            id: 'HB-002',
            name: 'Wooden Headboard - Oak Finish',
            price: 1899.00,
            image: 'images/products/headboard-oak.jpg',
            category: 'headboards',
            leadTime: 18,
            description: 'Solid wood headboard with natural oak finish',
            features: ['Solid Wood', 'Natural Finish', 'Classic Design', 'Easy Assembly']
        }
    ],
    'pedestals': [
        {
            id: 'PD-001',
            name: 'Bedside Pedestal - Modern White',
            price: 699.00,
            image: 'images/products/pedestal-modern-white.jpg',
            category: 'pedestals',
            leadTime: 14,
            description: 'Modern white bedside pedestal with soft-close drawer',
            features: ['Soft-Close Drawer', 'Open Shelf', 'Cable Management', 'Easy Assembly']
        },
        {
            id: 'PD-002',
            name: 'Pedestal - Oak Effect',
            price: 599.00,
            image: 'images/products/pedestal-oak.jpg',
            category: 'pedestals',
            leadTime: 12,
            description: 'Contemporary pedestal with oak effect finish',
            features: ['Oak Effect', 'Storage Drawer', 'Sturdy Construction', 'Modern Design']
        }
    ],
    'sofas': [
        {
            id: 'SF-001',
            name: '3-Seater Fabric Sofa - Navy Blue',
            price: 8999.00,
            image: 'images/products/sofa-navy-3seater.jpg',
            category: 'sofas',
            leadTime: 28,
            description: 'Quality 3-seater sofa with removable covers',
            features: ['Removable Covers', 'Quality Foam', 'Solid Frame', '5-Year Warranty']
        },
        {
            id: 'SF-002',
            name: 'L-Shape Corner Sofa - Grey',
            price: 12999.00,
            image: 'images/products/sofa-grey-lshape.jpg',
            category: 'sofas',
            leadTime: 35,
            description: 'Spacious L-shape sofa perfect for family living',
            features: ['L-Shape Design', 'Premium Fabric', 'Large Seating', 'Professional Delivery']
        }
    ],
    'scatter-cushions': [
        {
            id: 'SC-001',
            name: 'Decorative Scatter Cushions - Set of 2',
            price: 399.99,
            image: 'images/products/scatter-cushions-set.jpg',
            category: 'scatter-cushions',
            leadTime: 5,
            description: 'Set of 2 decorative scatter cushions with feather inserts',
            features: ['Feather Inserts', 'Removable Covers', 'Set of 2', 'Multiple Designs']
        },
        {
            id: 'SC-002',
            name: 'Velvet Cushions - Luxury Set',
            price: 599.99,
            image: 'images/products/velvet-cushions-luxury.jpg',
            category: 'scatter-cushions',
            leadTime: 7,
            description: 'Luxury velvet cushion set for sophisticated interiors',
            features: ['Premium Velvet', 'Rich Colors', 'Plush Filling', 'Designer Patterns']
        }
    ],
    'security-gates': [
        {
            id: 'SG-001',
            name: 'Retractable Security Gate - White',
            price: 3499.00,
            image: 'images/products/security-gate-white.jpg',
            category: 'security-gates',
            leadTime: 14,
            description: 'Retractable security gate with multi-point locking',
            features: ['Multi-Point Locking', 'Powder-Coated Steel', 'Smooth Operation', 'Professional Install']
        },
        {
            id: 'SG-002',
            name: 'Fixed Security Gate - Bronze',
            price: 2899.00,
            image: 'images/products/security-gate-bronze.jpg',
            category: 'security-gates',
            leadTime: 12,
            description: 'Fixed security gate with decorative bronze finish',
            features: ['Decorative Design', 'Heavy Duty', 'Bronze Finish', 'Custom Sizing']
        }
    ]
};

// Initialize the store when DOM is loaded
let store;

document.addEventListener('DOMContentLoaded', () => {
    store = new KayleighDecorStore();
    
    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        .cart-notification {
            position: fixed;
            top: 100px;
            right: 2rem;
            background: var(--kayleigh-success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 1001;
        }
        
        .cart-notification.show {
            transform: translateX(0);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .enquiry-success, .enquiry-error {
            background: var(--kayleigh-beige);
            padding: 2rem;
            border-radius: 8px;
            margin: 1rem 0;
            text-align: center;
        }
        
        .success-content i {
            color: var(--kayleigh-success);
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        
        .error-content i {
            color: var(--kayleigh-danger);
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        
        .shipping-result {
            background: var(--kayleigh-beige);
            padding: 1.5rem;
            border-radius: 8px;
            margin-top: 1rem;
        }
        
        .cost-free {
            text-align: center;
            color: var(--kayleigh-success);
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        .cost-calculated {
            text-align: center;
            color: var(--kayleigh-black);
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        .delivery-options, .delivery-time {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--kayleigh-gold);
        }
        
        .factory-address {
            font-style: italic;
            color: var(--kayleigh-light-grey);
        }
        
        .notification {
            position: fixed;
            top: 100px;
            right: 2rem;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 1001;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-info { background: var(--kayleigh-gold); }
        .notification-success { background: var(--kayleigh-success); }
        .notification-error { background: var(--kayleigh-danger); }
        
        @media (max-width: 768px) {
            .cart-notification, .notification {
                right: 1rem;
                left: 1rem;
                transform: translateY(-100%);
            }
            
            .cart-notification.show, .notification.show {
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});

// Make store globally available for inline event handlers
window.store = store;
