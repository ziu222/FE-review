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

    let totalItems = 0;
    let totalPrice = 0;

    container.innerHTML = "";

    cart.forEach(item => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;

        container.innerHTML += cartItem(item);
    });

    document.getElementById("total-items").innerText = totalItems;
    document.getElementById("total-price").innerText = "$" + totalPrice;
}

function cartItem(item) {
    return `
    <div class="flex items-center gap-4 border-b pb-4">

      <img src="${item.image}" class="w-20 h-20 object-cover rounded" />

      <div class="flex-1">
        <h3 class="font-semibold">${item.name}</h3>
        <p class="text-gray-500 text-sm">$${item.price}</p>
      </div>

      <div class="flex items-center gap-2">
        <button class="dec px-2 bg-gray-200 rounded" data-id="${item.id}">-</button>
        <span>${item.quantity}</span>
        <button class="inc px-2 bg-gray-200 rounded" data-id="${item.id}">+</button>
      </div>

      <button class="remove text-red-500" data-id="${item.id}"><i class="fa-solid fa-x"></i></button>

    </div>
  `;
}

document.getElementById("cart-items").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    if (!id) return;

    let cart = getCart();

    if (e.target.classList.contains("inc")) {
        const item = cart.find(i => i.id === id);
        if (item) item.quantity++;
    }

    if (e.target.classList.contains("dec")) {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.quantity--;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== id);
            }
        }
    }

    if (btn.classList.contains("remove")) {
        cart = cart.filter(i => i.id !== id);
    }

    saveCart(cart);
    renderCart();
});

document.getElementById("back").addEventListener("click", function () {
    window.location.href = "product.html";
});

document.addEventListener("DOMContentLoaded", renderCart);