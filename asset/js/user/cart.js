const CART_KEY = "ecshop_cart";

function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderCart() {
    const cart = getCart();
    const container = document.getElementById("cart-items");
    const countLabel = document.getElementById("cart-count-label");

    let totalItems = 0;
    let totalPrice = 0;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-cart-shopping"></i>
                <p>Giỏ hàng của bạn đang trống</p>
                <button class="btn-shop" onclick="window.location.href='product.html'">
                    <i class="fa-solid fa-arrow-left"></i> Tiếp tục mua sắm
                </button>
            </div>`;
        if (countLabel) countLabel.textContent = "0 sản phẩm";
        document.getElementById("total-items").textContent = "0";
        document.getElementById("total-price").textContent = "$0";
        return;
    }

    container.innerHTML = cart.map(item => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
        return cartItem(item);
    }).join("");

    if (countLabel) countLabel.textContent = totalItems + " sản phẩm";
    document.getElementById("total-items").textContent = totalItems;
    document.getElementById("total-price").textContent = "$" + totalPrice.toLocaleString("en-US");
}

function cartItem(item) {
    return `
    <div class="cart-item">
        <img src="${item.image}" class="cart-item-img" onerror="this.src='../asset/img/placeholder.png'" />
        <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">$${Number(item.price).toLocaleString("en-US")}</div>
        </div>
        <div class="qty-controls">
            <button class="qty-btn dec" data-id="${item.id}">−</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn inc" data-id="${item.id}">+</button>
        </div>
        <button class="remove-btn remove" data-id="${item.id}" title="Xóa">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    </div>`;
}

document.getElementById("cart-items").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    if (!id) return;

    let cart = getCart();

    if (btn.classList.contains("inc")) {
        const item = cart.find(i => i.id === id);
        if (item) item.quantity++;
    }

    if (btn.classList.contains("dec")) {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.quantity--;
            if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
        }
    }

    if (btn.classList.contains("remove")) {
        cart = cart.filter(i => i.id !== id);
    }

    saveCart(cart);
    renderCart();
    updateCartBadge();
});

document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    const cartBtn = document.getElementById("cart-btn");
    if (cartBtn) cartBtn.addEventListener("click", () => window.location.href = "cart.html");
});
