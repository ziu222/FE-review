const PRODUCT_KEY = "ecshop_products";
const CART_KEY = "ecshop_cart";

function getProducts() {
    return JSON.parse(localStorage.getItem(PRODUCT_KEY)) || [];
}
function renderProducts() {
    const products = getProducts();
    const container = document.getElementById("product-list");

    let html = "";

    products.forEach(p => {
        const price = Number(p.price);
        const oldPrice = Number(p.oldPrice);
        const discountPercent = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
        console.log(discountPercent);
        html += `
            <div class="product-card">

                <span class="category">${p.category}</span>

                <img src="${p.image}" />
                ${discountPercent > 0 ? `<span class="badge">-${discountPercent}%</span>` : ""}

                <div class="product-name">${p.name}</div>

                <div class="rating">
                    ⭐ ${p.rating} (${p.reviews})
                </div>

                <div class="price-box">
                    <span class="new-price">$${p.price}</span>
                    ${p.oldPrice ?
                `<span class="old-price">$${p.oldPrice}</span>`
                : ""}
                </div>

                <p class="stock">Stock: ${p.stock}</p>

                <button 
                    onclick="addToCart(${p.id})" 
                    class="cart-btn"
                    ${p.stock === 0 ? "disabled" : ""}
                >
                    🛒 Add to Cart
                </button>

            </div>
        `;
    });

    container.innerHTML = html;
}
document.addEventListener("DOMContentLoaded", renderProducts);