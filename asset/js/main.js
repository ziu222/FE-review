//Anh add thêm ảnh nha em làm biếng quá :DDD
//Local Storage cua products 
const sampleProducts = [
    {
        id: 1,
        name: "iPhone 15 Pro Max",
        price: 1199,
        oldPrice: 1499,
    image: "../asset/img/home/ip15PM.webp",
        category: "smartphone",
        rating: 4.8,
        reviews: 342
    },
    {
        id: 2,
        name: "Samsung Galaxy S24 Ultra",
        price: 1299,
        oldPrice: 1599,
    image: "https://cdn2.fptshop.com.vn/unsafe/512x0/filters:format(webp):quality(75)/2024_1_27_638419500119790990_samsung-galaxy-s24-ultra-xam-4.png",
        category: "smartphone",
        rating: 4.7,
        reviews: 287
    },
    {
        id: 3,
        name: "Google Pixel 8 Pro",
        price: 999,
        oldPrice: 1299,
    image: "../asset/img/home/pixel8.png",
        category: "smartphone",
        rating: 4.6,
        reviews: 215
    },
    {
        id: 4,
        name: "Apple Watch Ultra",
        price: 799,
        oldPrice: 999,
        image: "https://cdn.tgdd.vn/Products/Images/7077/329717/s16/apple-watch-ultra-2-gps-cellular-49mm-vien-titanium-day-ocean-den-650x650.png",
        category: "wearables",
        rating: 4.9,
        reviews: 412
    },
    {
        id: 5,
        name: "Samsung Galaxy Watch 6",
        price: 399,
        oldPrice: 599,
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/m/sm-r930_003_l_perspective_graphite_2_1.png",
        category: "wearables",
        rating: 4.6,
        reviews: 189
    },
    {
        id: 6,
        name: "Dell XPS 15",
        price: 1699,
        oldPrice: 1999,
        image: "../asset/img/home/ip15PM.png",
        category: "laptops",
        rating: 4.7,
        reviews: 226
    },
    {
        id: 7,
        name: "MacBook Air M3",
        price: 1399,
        oldPrice: 1599,
        image: "../asset/img/home/ip15PM.webp",
        category: "laptops",
        rating: 4.8,
        reviews: 378
    },
    {
        id: 8,
        name: "ASUS ROG Zephyrus G14",
        price: 1499,
        oldPrice: 1799,
        image: "../asset/img/home/ip15PM.webp",
        category: "laptops",
        rating: 4.7,
        reviews: 244
    },
    {
        id: 9,
        name: "Sony WH-1000XM5",
        price: 329,
        oldPrice: 399,
        image: "../asset/img/home/ip15PM.webp",
        category: "audio",
        rating: 4.8,
        reviews: 512
    },
    {
        id: 10,
        name: "Bose QuietComfort Ultra",
        price: 349,
        oldPrice: 429,
        image: "../asset/img/home/ip15PM.webp",
        category: "audio",
        rating: 4.7,
        reviews: 294
    },
    {
        id: 11,
        name: "JBL Charge 5",
        price: 149,
        oldPrice: 199,
        image: "../asset/img/home/ip15PM.webp",
        category: "audio",
        rating: 4.5,
        reviews: 318
    },
    {
        id: 12,
        name: "Canon EOS R50",
        price: 879,
        oldPrice: 999,
        image: "../asset/img/home/ip15PM.webp",
        category: "cameras",
        rating: 4.6,
        reviews: 141
    },
    {
        id: 13,
        name: "Sony Alpha A7 IV",
        price: 2299,
        oldPrice: 2599,
        image: "../asset/img/home/ip15PM.webp",
        category: "cameras",
        rating: 4.9,
        reviews: 187
    },
    {
        id: 14,
        name: "GoPro HERO12 Black",
        price: 399,
        oldPrice: 499,
        image: "../asset/img/home/ip15PM.webp",
        category: "cameras",
        rating: 4.6,
        reviews: 263
    },
    {
        id: 15,
        name: "PlayStation 5 Slim",
        price: 499,
        oldPrice: 599,
        image: "../asset/img/home/ip15PM.webp",
        category: "gaming",
        rating: 4.8,
        reviews: 640
    },
    {
        id: 16,
        name: "Xbox Series X",
        price: 489,
        oldPrice: 569,
        image: "../asset/img/home/ip15PM.webp",
        category: "gaming",
        rating: 4.7,
        reviews: 472
    },
    {
        id: 17,
        name: "Nintendo Switch OLED",
        price: 329,
        oldPrice: 379,
        image: "../asset/img/home/ip15PM.webp",
        category: "gaming",
        rating: 4.8,
        reviews: 558
    },
    {
        id: 18,
        name: "Anker 737 Power Bank",
        price: 139,
        oldPrice: 179,
        image: "../asset/img/home/ip15PM.webp",
        category: "smartphone",
        rating: 4.5,
        reviews: 203
    },
    {
        id: 19,
        name: "Logitech MX Master 3S",
        price: 99,
        oldPrice: 129,
        image: "../asset/img/home/ip15PM.webp",
        category: "smartphone",
        rating: 4.7,
        reviews: 431
    },
    {
        id: 20,
        name: "Kindle Paperwhite 11th Gen",
        price: 149,
        oldPrice: 189,
        image: "../asset/img/home/ip15PM.webp",
        category: "smartphone",
        rating: 4.6,
        reviews: 356
    }
];

let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let cart = [];
let hasShownPromotionPopup = false;


function initializeProducts() {
    allProducts = sampleProducts.map((product) => ({ ...product }));
    filteredProducts = [...allProducts];
    console.log("✅ Products initialized from sample data");
}

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
        category: productData.category || "smartphone",
        rating: Number(productData.rating) || 4.5,
        reviews: Number(productData.reviews) || 0
    };

    allProducts.push(productAdded);
    filteredProducts = [...allProducts];

    renderProductShowcase();
    renderProducts(filteredProducts);
    return productAdded;
}




function showPromotionPopup() {
    if (!hasShownPromotionPopup) {
        const modal = new bootstrap.Modal(document.getElementById("promotionModal"));
        modal.show();
        hasShownPromotionPopup = true;
        console.log(" Promotion popup shown ");
    }
}


function calculateDiscount(oldPrice, newPrice) {
    if (!oldPrice || oldPrice <= newPrice) return 0;
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
}

function formatPrice(price) {
    return price.toLocaleString('en-US');
}

function calculateSavings(oldPrice, newPrice) {
    if (!oldPrice || oldPrice <= newPrice) return 0;
    return oldPrice - newPrice;
}

// function check link file img chan loopback
function handleProductImageError(imageEl) {
    if (!imageEl) return;
    if (imageEl.dataset.fallbackApplied === "1") return;

    imageEl.dataset.fallbackApplied = "1";
    imageEl.src = "../asset/img/404.png";
}


function renderProductShowcase() {
    const container = document.getElementById("showcaseProducts");
    if (!container) return;

    container.innerHTML = "";

    const showcase = allProducts.filter(p => p.category === "smartphone").slice(0, 6);

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
            ${discount > 0 ? `<div class="product-discount-badge">-${discount}%</div>` : ''}
            
            <div class="product-actions">
                <button class="action-btn wishlist-btn" title="Add to Wishlist">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="action-btn view-btn" onclick="viewProduct(${product.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
            
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-card-img product-card-img-crop" onerror="handleProductImageError(this, ${product.id})">
            </div>
            
            <div class="product-card-body">
                <h6 class="product-name">${product.name}</h6>
                
                <div class="product-price-section">
                    <span class="product-price-new">$${formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="product-price-old">$${formatPrice(product.oldPrice)}</span>` : ''}
                </div>
                
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

    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }

    renderProducts(filteredProducts);
    console.log(`🔎 Search: "${query}" (${filteredProducts.length} results)`);
}


function viewProduct(productId) {
    console.log(`👁️ View product ${productId}`);
    alert("Product details page coming soon!");
}


function initializeEventListeners() {
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

    document.querySelectorAll(".category-item").forEach(item => {
        item.addEventListener("click", function () {
            document.querySelectorAll(".category-item").forEach(el => {
                el.classList.remove("active");
            });

            this.classList.add("active");
            const category = this.getAttribute("data-category");
            filterProducts(category);

            document.querySelectorAll(".filter-btn").forEach(btn => {
                btn.classList.remove("active");
                if (btn.getAttribute("data-category") === category) {
                    btn.classList.add("active");
                }
            });
        });
    });

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            searchProducts(this.value);
        });
    }

    console.log("Event listeners initialized");
}


function initializeApp() {
    console.log(" Initializing ShopHub E-Commerce (MegaMart Style)...");

    initializeProducts();

    showPromotionPopup();

    renderProductShowcase();
    renderProducts(allProducts);

    initializeEventListeners();

    console.log("✅ ShopHub E-Commerce initialized successfully!");
    console.log(`📦 Total products: ${allProducts.length}`);
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

window.viewProduct = viewProduct;
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
window.handleProductImageError = handleProductImageError;
window.addProduct = addProduct;
