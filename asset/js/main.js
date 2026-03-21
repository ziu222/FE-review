
const sampleProducts = [
    {
        id: 1,
        name: "iPhone 15 Pro Max",
        price: 1199,
        oldPrice: 1499,
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png",
        category: "electronics",
        rating: 4.8,
        reviews: 342
    },
    {
        id: 2,
        name: "Samsung Galaxy S24 Ultra",
        price: 1299,
        oldPrice: 1599,
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png",
        category: "electronics",
        rating: 4.7,
        reviews: 287
    },
    {
        id: 3,
        name: "Google Pixel 8 Pro",
        price: 999,
        oldPrice: 1299,
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png",
        category: "electronics",
        rating: 4.6,
        reviews: 215
    },
    {
        id: 4,
        name: "Apple Watch Ultra",
        price: 799,
        oldPrice: 999,
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png",
        category: "wearables",
        rating: 4.9,
        reviews: 412
    },
    {
        id: 5,
        name: "Samsung Galaxy Watch 6",
        price: 399,
        oldPrice: 599,
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png",
        category: "wearables",
        rating: 4.6,
        reviews: 189
    }
];

let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let cart = [];
let hasShownPromotionPopup = false;

// ==================== DATA MANAGEMENT ====================

/**
 * Initialize products from sample data (in-memory only)
 */
function initializeProducts() {
    allProducts = sampleProducts.map((product) => ({ ...product }));
    filteredProducts = [...allProducts];
    console.log("✅ Products initialized from sample data");
}

/**
 * Add a new product and re-render product cards
 */
function addProduct(productData) {
    const nextId = allProducts.length > 0
        ? Math.max(...allProducts.map((p) => Number(p.id) || 0)) + 1
        : 1;

    const productAdded = {
        id: nextId,
        name: productData.name || "New Product",
        price: Number(productData.price) || 0,
        oldPrice: Number(productData.oldPrice) || Number(productData.price) || 0,
        image: productData.image || "https://picsum.photos/seed/new-product/800/600",
        category: productData.category || "electronics",
        rating: Number(productData.rating) || 4.5,
        reviews: Number(productData.reviews) || 0
    };

    allProducts.push(productAdded);
    filteredProducts = [...allProducts];

    renderProductShowcase();
    renderProducts(filteredProducts);
    return productAdded;
}



// ==================== POPUP MANAGEMENT ====================

/**
 * Show promotion popup only once per page load
 */
function showPromotionPopup() {
    if (!hasShownPromotionPopup) {
        const modal = new bootstrap.Modal(document.getElementById("promotionModal"));
        modal.show();
        hasShownPromotionPopup = true;
        console.log(" Promotion popup shown ");
    }
}

// ==================== PRODUCT RENDERING ====================

/**
 * Calculate discount percentage
 */
function calculateDiscount(oldPrice, newPrice) {
    if (!oldPrice || oldPrice <= newPrice) return 0;
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
}

/**
 * Format price with commas (US format)
 */
function formatPrice(price) {
    return price.toLocaleString('en-US');
}

/**
 * Calculate savings
 */
function calculateSavings(oldPrice, newPrice) {
    if (!oldPrice || oldPrice <= newPrice) return 0;
    return oldPrice - newPrice;
}

/**
 * Product image fallback chain
 */
function handleProductImageError(imgEl, productId) {
    const isAlreadyFallback = imgEl.dataset.fallbackStep === "placeholder";
    if (!isAlreadyFallback) {
        imgEl.dataset.fallbackStep = "placeholder";
        imgEl.src = `https://picsum.photos/seed/flagship-${productId}/400/300`;
        return;
    }

    imgEl.onerror = null;
    imgEl.src = "../asset/img/logo.webp";
}



/**
 * Render product showcase section (horizontal scroll)
 */
function renderProductShowcase() {
    const container = document.getElementById("showcaseProducts");
    if (!container) return;

    container.innerHTML = "";

    // Flagship showcase focuses on electronics category
    const showcase = allProducts.filter(p => p.category === "electronics").slice(0, 6);

    showcase.forEach(product => {
        const discount = calculateDiscount(product.oldPrice, product.price);
        const savings = calculateSavings(product.oldPrice, product.price);

        const card = document.createElement("div");
        card.className = "scroll-product-card";
        card.innerHTML = `
            ${discount > 0 ? `<div style="position: absolute; top: 10px; right: 10px; z-index: 10;"><span class="discount-badge">${discount}% OFF</span></div>` : ''}
            <img src="${product.image}" alt="${product.name}" class="scroll-product-img" onerror="handleProductImageError(this, ${product.id})">
            <div class="scroll-product-info">
                <div class="product-title">${product.name}</div>
                <div class="price-group">
                    <span class="product-price-new">$${formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="product-price-old">$${formatPrice(product.oldPrice)}</span>` : ''}
                </div>
                ${savings > 0 ? `<div class="savings">Save $${formatPrice(savings)}</div>` : ''}
            </div>
        `;
        container.appendChild(card);
    });

    console.log(`✅ Rendered ${showcase.length} showcase products`);
}

/**
 * Render products to the DOM
 */
function renderProducts(products) {
    const container = document.getElementById("productContainer");

    if (!container) return;

    container.innerHTML = "";

    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1;">
                <div class="no-products">
                    <i class="fas fa-inbox"></i>
                    <h4>No products found</h4>
                    <p>Try selecting a different category or search term.</p>
                </div>
            </div>
        `;
        return;
    }

    products.forEach(product => {
        const discount = calculateDiscount(product.oldPrice, product.price);
        const savings = calculateSavings(product.oldPrice, product.price);
        const stars = generateStarRating(product.rating);

        const col = document.createElement("div");
        col.className = "product-item";

        const card = document.createElement("div");
        card.className = "card product-card h-100 position-relative";
        card.innerHTML = `
            <!-- Discount Badge -->
            ${discount > 0 ? `<div class="product-discount-badge">-${discount}%</div>` : ''}
            
            <!-- Action Icons (Wishlist & View) -->
            <div class="product-actions">
                <button class="action-btn wishlist-btn" title="Add to Wishlist">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="action-btn view-btn" onclick="viewProduct(${product.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
            
            <!-- Product Image -->
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-card-img product-card-img-crop" onerror="handleProductImageError(this, ${product.id})">
            </div>
            
            <!-- Product Info -->
            <div class="product-card-body">
                <h6 class="product-name">${product.name}</h6>
                
                <!-- Pricing -->
                <div class="product-price-section">
                    <span class="product-price-new">$${formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="product-price-old">$${formatPrice(product.oldPrice)}</span>` : ''}
                </div>
                
                <!-- Rating -->
                <div class="product-rating">
                    <div class="stars">${stars}</div>
                    <span class="review-count">(${product.reviews})</span>
                </div>
            </div>
        `;

        col.appendChild(card);
        container.appendChild(col);
    });

    console.log(`✅ Rendered ${products.length} product(s)`);
}

/**
 * Generate star rating HTML
 */
function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

// ==================== FILTERING ====================

/**
 * Filter products by category
 */
function filterProducts(category) {
    currentCategory = category;

    if (category === 'all') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => product.category === category);
    }

    renderProducts(filteredProducts);
    console.log(`🔍 Filtered by category: ${category} (${filteredProducts.length} products)`);
}

/**
 * Search products by name
 */
function searchProducts(query) {
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product =>
            product.name.toLowerCase().includes(lowerQuery) ||
            product.category.toLowerCase().includes(lowerQuery)
        );
    }

    // Apply current category filter on top of search
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }

    renderProducts(filteredProducts);
    console.log(`🔎 Search: "${query}" (${filteredProducts.length} results)`);
}

// ==================== CART MANAGEMENT ====================

/**
 * View product details (placeholder - will be implemented later)
 */
function viewProduct(productId) {
    console.log(`👁️ View product ${productId}`);
    alert("Product details page coming soon!");
}

// ==================== EVENT LISTENERS ====================

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Category filter buttons
    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", function () {
            document.querySelectorAll(".filter-btn").forEach(btn => {
                btn.classList.remove("active");
            });

            this.classList.add("active");
            const category = this.getAttribute("data-category");
            filterProducts(category);
        });
    });

    // Sidebar category items
    document.querySelectorAll(".category-item").forEach(item => {
        item.addEventListener("click", function () {
            document.querySelectorAll(".category-item").forEach(el => {
                el.classList.remove("active");
            });

            this.classList.add("active");
            const category = this.getAttribute("data-category");
            filterProducts(category);

            // Also update main filter buttons
            document.querySelectorAll(".filter-btn").forEach(btn => {
                btn.classList.remove("active");
                if (btn.getAttribute("data-category") === category) {
                    btn.classList.add("active");
                }
            });
        });
    });

    // Search functionality
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            searchProducts(this.value);
        });
    }

    console.log("✅ Event listeners initialized");
}

// ==================== INITIALIZATION ====================

/**
 * Initialize the application
 */
function initializeApp() {
    console.log("🚀 Initializing ShopHub E-Commerce (MegaMart Style)...");

    // Initialize data
    initializeProducts();

    // Show popup on first visit
    showPromotionPopup();

    // Render product showcase and products
    renderProductShowcase();
    renderProducts(allProducts);

    // Setup event listeners
    initializeEventListeners();

    console.log("✅ ShopHub E-Commerce initialized successfully!");
    console.log(`📦 Total products: ${allProducts.length}`);
}

// ==================== RUN ON PAGE LOAD ====================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export functions for global access
window.viewProduct = viewProduct;
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
window.handleProductImageError = handleProductImageError;
window.addProduct = addProduct;
