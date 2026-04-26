// ============================================================
// main.js - Customer Home Page Logic

var allProducts = [];
var filteredProducts = [];
var currentCategory = "all";
var hasShownPromotionPopup = false;


// -- Init -------------------------------------------------------

function initializeApp() {
    // Customer pages should only show products that were approved by admin.
    allProducts = Store.getApprovedProducts ? Store.getApprovedProducts() : Store.getProducts();
    filteredProducts = allProducts.slice();

    showPromotionPopup();
    renderProducts(allProducts);
    initializeEventListeners();

    console.log("ShopHub E-Commerce initialized successfully!");
    console.log("Total products: " + allProducts.length);
}


// -- Promotion Modal --------------------------------------------

function showPromotionPopup() {
    if (hasShownPromotionPopup) return;
    var el = document.getElementById("promotionModal");
    if (!el) return;
    var modal = new bootstrap.Modal(el);
    modal.show();
    hasShownPromotionPopup = true;
}


// -- Price Helpers ----------------------------------------------

function calculateDiscount(oldPrice, newPrice) {
    if (!oldPrice || oldPrice <= newPrice) return 0;
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
}

function formatPrice(price) {
    return price.toLocaleString("en-US");
}


// -- Image Fallback ---------------------------------------------

function handleProductImageError(imageEl) {
    if (!imageEl) return;
    if (imageEl.dataset.fallbackApplied === "1") return;
    imageEl.dataset.fallbackApplied = "1";
    imageEl.src = "../asset/img/404.png";
}


// -- Star Rating ------------------------------------------------

function generateStarRating(rating) {
    var stars = "";
    var full = Math.floor(rating);
    var hasHalf = rating % 1 !== 0;

    for (var i = 0; i < full; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalf) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    var empty = 5 - Math.ceil(rating);
    for (var j = 0; j < empty; j++) {
        stars += '<i class="far fa-star"></i>';
    }
    return stars;
}


// -- Render Products --------------------------------------------

function renderProducts(products) {
    var container = document.getElementById("productContainer");
    if (!container) return;

    container.innerHTML = "";

    if (products.length === 0) {
        container.innerHTML =
            '<div style="grid-column: 1 / -1;">' +
                '<div class="no-products">' +
                    '<i class="fas fa-inbox"></i>' +
                    '<h4>No products found</h4>' +
                    '<p>Try selecting a different category or search term.</p>' +
                '</div>' +
            '</div>';
        return;
    }

    for (var i = 0; i < products.length; i++) {
        var product = products[i];
        var discount = calculateDiscount(product.oldPrice, product.price);
        var stars = generateStarRating(product.rating);

        var col = document.createElement("div");
        col.className = "product-item";

        var card = document.createElement("div");
        card.className = "card product-card h-100 position-relative";
        card.innerHTML =
            (discount > 0 ? '<div class="product-discount-badge">-' + discount + '%</div>' : '') +
            '<div class="product-actions">' +
                '<button class="action-btn wishlist-btn" title="Add to Wishlist">' +
                    '<i class="fas fa-heart"></i>' +
                '</button>' +
                '<button class="action-btn view-btn" onclick="viewProduct(' + product.id + ')" title="View Details">' +
                    '<i class="fas fa-eye"></i>' +
                '</button>' +
            '</div>' +
            '<div class="product-image-wrapper">' +
                '<img src="' + product.image + '" alt="' + product.name + '" class="product-card-img product-card-img-crop" onerror="handleProductImageError(this)">' +
            '</div>' +
            '<div class="product-card-body">' +
                '<h6 class="product-name">' + product.name + '</h6>' +
                '<div class="product-price-section">' +
                    '<span class="product-price-new">$' + formatPrice(product.price) + '</span>' +
                    (product.oldPrice ? '<span class="product-price-old">$' + formatPrice(product.oldPrice) + '</span>' : '') +
                '</div>' +
                '<div class="product-rating">' +
                    '<div class="stars">' + stars + '</div>' +
                    '<span class="review-count">(' + product.reviews + ')</span>' +
                '</div>' +
            '</div>';

        col.appendChild(card);
        container.appendChild(col);
    }
}


// -- Filter & Search --------------------------------------------

function filterProducts(category) {
    currentCategory = category;

    if (category === "all") {
        filteredProducts = allProducts.slice();
    } else {
        filteredProducts = Store.getProductsByCategory(category);
    }

    renderProducts(filteredProducts);
}

function searchProducts(query) {
    var results = Store.searchProducts(query);

    if (currentCategory !== "all") {
        var filtered = [];
        for (var i = 0; i < results.length; i++) {
            if (results[i].category === currentCategory) filtered.push(results[i]);
        }
        results = filtered;
    }

    filteredProducts = results;
    renderProducts(filteredProducts);
}


// -- View Product -----------------------------------------------

function viewProduct(productId) {
    var toastEl = document.getElementById("comingSoonToast");
    if (toastEl && window.bootstrap) {
        bootstrap.Toast.getOrCreateInstance(toastEl).show();
    }
}


// -- Event Listeners --------------------------------------------

function initializeEventListeners() {
    // Category sidebar clicks
    var categoryItems = document.querySelectorAll(".category-item");
    for (var i = 0; i < categoryItems.length; i++) {
        categoryItems[i].addEventListener("click", function () {
            for (var j = 0; j < categoryItems.length; j++) {
                categoryItems[j].classList.remove("active");
            }
            this.classList.add("active");

            var category = this.getAttribute("data-category");
            filterProducts(category);

            // Sync filter buttons
            var filterBtns = document.querySelectorAll(".filter-btn");
            for (var k = 0; k < filterBtns.length; k++) {
                filterBtns[k].classList.remove("active");
                if (filterBtns[k].getAttribute("data-category") === category) {
                    filterBtns[k].classList.add("active");
                }
            }
        });
    }

    // Filter button clicks
    var filterBtns = document.querySelectorAll(".filter-btn");
    for (var i = 0; i < filterBtns.length; i++) {
        filterBtns[i].addEventListener("click", function () {
            for (var j = 0; j < filterBtns.length; j++) {
                filterBtns[j].classList.remove("active");
            }
            this.classList.add("active");

            var category = this.getAttribute("data-category");
            filterProducts(category);
        });
    }

    // Search input
    var searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            searchProducts(this.value);
        });
    }
}


// -- Start ------------------------------------------------------

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
} else {
    initializeApp();
}

// Expose to global (for onclick handlers in HTML)
window.viewProduct = viewProduct;
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
window.handleProductImageError = handleProductImageError;
