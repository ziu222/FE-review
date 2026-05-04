const PRODUCT_KEY = "ecshop_products";

function getProducts() {
    return JSON.parse(localStorage.getItem(PRODUCT_KEY)) || [];
}

function renderStars(rating) {
    const full  = Math.floor(rating);
    const half  = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

function renderProducts(products) {
    const container = document.getElementById("product-list");

    if (!products.length) {
        container.innerHTML = '<p style="text-align:center;padding:60px;color:var(--muted-text);">Không tìm thấy sản phẩm nào.</p>';
        return;
    }

    container.innerHTML = products.map((p, idx) => {
        const price       = Number(p.price);
        const oldPrice    = Number(p.oldPrice);
        const discountPct = oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
        const inStock     = p.stock > 0;
        const animDelay   = (idx % 8) * 0.05;

        return `
        <div class="product-card" style="animation-delay:${animDelay}s"
             onclick="goToDetail(event, ${p.id})">

            <div class="product-img-wrap">
                <img src="${p.image}" alt="${p.name}" onerror="this.src='../asset/img/placeholder.png'" />
                ${discountPct > 0 ? `<span class="discount-badge">-${discountPct}%</span>` : ""}
                <span class="category-chip">${p.category}</span>
            </div>

            <div class="card-body">
                <div class="product-name">${p.name}</div>

                <div class="product-rating">
                    <span class="stars">${renderStars(p.rating)}</span>
                    <span>${p.rating} (${p.reviews})</span>
                </div>

                <div class="price-box">
                    <span class="new-price">$${price.toLocaleString("en-US")}</span>
                    ${oldPrice > price ? `<span class="old-price">$${oldPrice.toLocaleString("en-US")}</span>` : ""}
                </div>

                <div class="stock-status ${inStock ? "in-stock" : "out-stock"}">
                    ${inStock ? `<i class="fa-solid fa-circle-check" style="font-size:0.7rem"></i> Còn ${p.stock} sản phẩm` : "Hết hàng"}
                </div>

                <button
                    class="cart-btn"
                    onclick="addToCart(${p.id})"
                    ${!inStock ? "disabled" : ""}
                >
                    <i class="fa-solid fa-cart-shopping"></i>
                    Thêm vào giỏ
                </button>
            </div>

        </div>`;
    }).join("");
}

function goToDetail(event, productId) {
    if (event.target.closest(".cart-btn")) return;
    window.location.href = "product-detail.html?id=" + productId;
}

// ── Filter state ──────────────────────────────────────────
const filterState = { category: "all", sort: "default", search: "" };

let searchDebounce = null;

function applyFilters() {
    let products = getProducts().filter(p => p.adminStatus === "approved");

    if (filterState.search)
        products = products.filter(p =>
            p.name.toLowerCase().includes(filterState.search));

    if (filterState.category !== "all")
        products = products.filter(p => p.category === filterState.category);

    if (filterState.sort === "price-asc")  products.sort((a, b) => a.price - b.price);
    if (filterState.sort === "price-desc") products.sort((a, b) => b.price - a.price);
    if (filterState.sort === "rating")     products.sort((a, b) => b.rating - a.rating);
    if (filterState.sort === "newest")     products.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt));

    renderProducts(products);

    const countEl = document.getElementById("result-count");
    if (countEl) countEl.textContent =
        `Showing ${products.length} product${products.length !== 1 ? "s" : ""}`;
}

// ── Bootstrap event listeners ─────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    Store.seed();
    applyFilters();

    // Category pills
    document.getElementById("filter-cats").addEventListener("click", e => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        document.querySelectorAll("#filter-cats .filter-btn")
            .forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        filterState.category = btn.dataset.cat;
        applyFilters();
    });

    // Sort select
    document.getElementById("filter-sort").addEventListener("change", e => {
        filterState.sort = e.target.value;
        applyFilters();
    });

    // Search input (debounced)
    document.getElementById("filter-search").addEventListener("input", e => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            filterState.search = e.target.value.trim().toLowerCase();
            applyFilters();
        }, 200);
    });

    // Cart button
    const cartBtn = document.getElementById("cart-btn");
    if (cartBtn) cartBtn.addEventListener("click", () => window.location.href = "cart.html");
});
