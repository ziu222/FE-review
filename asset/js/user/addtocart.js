const CART_KEY = "ecshop_cart";

function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(productId) {
    const products = getProducts();
    const cart = getCart();

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartBadge();
    alert("Thêm sản phẩm thành công !!!");
}

function getCartCount() {
    const cart = getCart();

    return cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);
}

function updateCartBadge() {
    const count = getCartCount();
    const badge = document.getElementById("cart-count");

    if (!badge) return;

    badge.innerText = count;

    // Ẩn nếu = 0
    badge.style.display = count > 0 ? "inline-block" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
});