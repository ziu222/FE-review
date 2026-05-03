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

function renderProducts() {
    const products = getProducts().filter(p => p.adminStatus === "approved");
    const container = document.getElementById("product-list");

    if (!products.length) {
        container.innerHTML = '<p style="text-align:center;padding:60px;color:var(--muted-text);">Chưa có sản phẩm nào.</p>';
        return;
    }

    container.innerHTML = products.map((p, idx) => {
        const price          = Number(p.price);
        const oldPrice       = Number(p.oldPrice);
        const discountPct    = oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
        const inStock        = p.stock > 0;
        const animDelay      = (idx % 8) * 0.05;

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

document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    const cartBtn = document.getElementById("cart-btn");
    if (cartBtn) cartBtn.addEventListener("click", () => window.location.href = "cart.html");
});
