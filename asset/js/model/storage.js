//Data storage layer using LocalStorage
var Store = (function () {

    var KEYS = {
        products:    "ecshop_products",
        users:       "ecshop_users",
        orders:      "ecshop_orders",
        cart:        "ecshop_cart",
        seeded:      "ecshop_seeded",
        currentUser: "ecshop_currentUser"
    };



    function _get(key) {
        var raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw);
    }

    function _set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function _nextId(key) {
        var items = _get(key) || [];
        if (items.length === 0) return 1;
        var maxId = 0;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id > maxId) maxId = items[i].id;
        }
        return maxId + 1;
    }


    // Seed 
    function seed() {
        if (localStorage.getItem(KEYS.seeded)) return;

        _set(KEYS.products, typeof SEED_PRODUCTS !== "undefined" ? SEED_PRODUCTS : []);
        _set(KEYS.users,    typeof SEED_USERS    !== "undefined" ? SEED_USERS    : []);
        _set(KEYS.orders,   typeof SEED_ORDERS   !== "undefined" ? SEED_ORDERS   : []);
        _set(KEYS.cart, []);

        localStorage.setItem(KEYS.seeded, "true");
        console.log("Store: seed data loaded into LocalStorage");
    }

    function resetAll() {
        localStorage.removeItem(KEYS.products);
        localStorage.removeItem(KEYS.users);
        localStorage.removeItem(KEYS.orders);
        localStorage.removeItem(KEYS.cart);
        localStorage.removeItem(KEYS.seeded);
        localStorage.removeItem(KEYS.currentUser);
        seed();
        console.log("Store: all data reset");
    }


    // PRODUCTS 

    function getProducts() {
        return _get(KEYS.products) || [];
    }

    function getProductById(id) {
        var products = getProducts();
        for (var i = 0; i < products.length; i++) {
            if (products[i].id === id) return products[i];
        }
        return null;
    }

    function getApprovedProducts() {
        var products = getProducts();
        var result = [];

        for (var i = 0; i < products.length; i++) {
            var status = products[i].adminStatus;
            if (!status || status === "approved" || status === "visible") {
                result.push(products[i]);
            }
        }

        return result;
    }

    function getProductsByCategory(category) {
        if (!category || category === "all") return getApprovedProducts();
        var products = getApprovedProducts();
        var result = [];
        for (var i = 0; i < products.length; i++) {
            if (products[i].category === category) result.push(products[i]);
        }
        return result;
    }

    function searchProducts(query) {
        var lower = query.toLowerCase().trim();
        if (!lower) return getApprovedProducts();
        var products = getApprovedProducts();
        var result = [];
        for (var i = 0; i < products.length; i++) {
            var p = products[i];
            if (p.name.toLowerCase().indexOf(lower) !== -1 ||
                p.category.toLowerCase().indexOf(lower) !== -1) {
                result.push(p);
            }
        }
        return result;
    }

    function getProductsByShop(shopId) {
        var products = getProducts();
        var result = [];
        for (var i = 0; i < products.length; i++) {
            if (products[i].shopId === shopId) result.push(products[i]);
        }
        return result;
    }

    function addProduct(data) {
        var products = getProducts();
        var today = new Date().toISOString().split("T")[0];
        var newProduct = {
            id:          _nextId(KEYS.products),
            shopId:      data.shopId      || 0,
            name:        data.name        || "New Product",
            price:       Number(data.price)    || 0,
            oldPrice:    Number(data.oldPrice)  || 0,
            image:       data.image       || "../asset/img/404.png",
            category:    data.category    || "smartphone",
            rating:      Number(data.rating)    || 0,
            reviews:     Number(data.reviews)   || 0,
            stock:       Number(data.stock)     || 0,
            description: data.description || "",
            adminStatus: data.adminStatus || "pending",
            createdAt:   today,
            updatedAt:   today
        };
        products.push(newProduct);
        _set(KEYS.products, products);
        return newProduct;
    }

    function updateProduct(id, data) {
        var products = getProducts();
        for (var i = 0; i < products.length; i++) {
            if (products[i].id === id) {
                // Only update fields that are provided
                var keys = Object.keys(data);
                for (var k = 0; k < keys.length; k++) {
                    products[i][keys[k]] = data[keys[k]];
                }
                _set(KEYS.products, products);
                return products[i];
            }
        }
        return null;
    }

    function deleteProduct(id) {
        var products = getProducts();
        var filtered = [];
        for (var i = 0; i < products.length; i++) {
            if (products[i].id !== id) filtered.push(products[i]);
        }
        if (filtered.length === products.length) return false;
        _set(KEYS.products, filtered);
        return true;
    }


    // User

    function getUsers() {
        return _get(KEYS.users) || [];
    }

    function getUserById(id) {
        var users = getUsers();
        for (var i = 0; i < users.length; i++) {
            if (users[i].id === id) return users[i];
        }
        return null;
    }

    function getUserByEmail(email) {
        var lower = email.toLowerCase().trim();
        var users = getUsers();
        for (var i = 0; i < users.length; i++) {
            if (users[i].email.toLowerCase() === lower) return users[i];
        }
        return null;
    }

    function getUserByUsername(username) {
        var lower = username.toLowerCase().trim();
        var users = getUsers();
        for (var i = 0; i < users.length; i++) {
            if (users[i].username && users[i].username.toLowerCase() === lower) return users[i];
        }
        return null;
    }

    function getShops() {
        var users = getUsers();
        var result = [];
        for (var i = 0; i < users.length; i++) {
            if (users[i].role === "shop") result.push(users[i]);
        }
        return result;
    }

    function getShopById(shopId) {
        var users = getUsers();
        for (var i = 0; i < users.length; i++) {
            if (users[i].id === shopId && users[i].role === "shop") return users[i];
        }
        return null;
    }

    function getCustomers() {
        var users = getUsers();
        var result = [];
        for (var i = 0; i < users.length; i++) {
            if (users[i].role === "customer") result.push(users[i]);
        }
        return result;
    }

    function updateShopStatus(shopId, newStatus) {
        return updateUser(shopId, { shopStatus: newStatus });
    }
//register user
    function addUser(data) {
        var users = getUsers();
        var newUser = {
            id:        _nextId(KEYS.users),
            name:      data.name     || "",
            username:  data.username || "",
            email:     data.email    || "",
            password:  data.password || "",
            role:      data.role     || "customer",
            avatar:    data.avatar   || "",
            createdAt: new Date().toISOString().split("T")[0]
        };
        // If role is shop, add shop-specific fields
        if (newUser.role === "shop") {
            newUser.shopName        = data.shopName        || "";
            newUser.shopDescription = data.shopDescription || "";
            newUser.shopAddress     = data.shopAddress     || "";
            newUser.shopPhone       = data.shopPhone       || "";
            newUser.shopStatus      = data.shopStatus      || "pending";
            newUser.shopAvatar      = data.shopAvatar      || "";
        }
        users.push(newUser);
        _set(KEYS.users, users);
        return newUser;
    }

    function updateUser(id, data) {
        var users = getUsers();
        for (var i = 0; i < users.length; i++) {
            if (users[i].id === id) {
                var keys = Object.keys(data);
                for (var k = 0; k < keys.length; k++) {
                    users[i][keys[k]] = data[keys[k]];
                }
                _set(KEYS.users, users);
                return users[i];
            }
        }
        return null;
    }

    function deleteUser(id) {
        var users = getUsers();
        var filtered = [];
        for (var i = 0; i < users.length; i++) {
            if (users[i].id !== id) filtered.push(users[i]);
        }
        if (filtered.length === users.length) return false;
        _set(KEYS.users, filtered);
        return true;
    }

    function authenticate(identifier, password) {
        var user = getUserByEmail(identifier) || getUserByUsername(identifier);
        if (!user) return null;
        if (user.password !== password) return null;
        // Save logged-in user (without password)
        var session = { id: user.id, name: user.name, email: user.email, role: user.role };
        // If shop, include shopName in session
        if (user.role === "shop") {
            session.shopName = user.shopName;
        }
        _set(KEYS.currentUser, session);
        return session;
    }

    function getCurrentUser() {
        return _get(KEYS.currentUser);
    }

    function logout() {
        localStorage.removeItem(KEYS.currentUser);
    }


    // ── ORDERS ─────────────────────────────────────────────

    function getOrders() {
        return _get(KEYS.orders) || [];
    }

    function getOrderById(id) {
        var orders = getOrders();
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].id === id) return orders[i];
        }
        return null;
    }

    function getOrdersByUser(userId) {
        var orders = getOrders();
        var result = [];
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].userId === userId) result.push(orders[i]);
        }
        return result;
    }

    function getOrdersByStatus(status) {
        var orders = getOrders();
        var result = [];
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].status === status) result.push(orders[i]);
        }
        return result;
    }

    function getOrdersByShop(shopId) {
        var orders = getOrders();
        var result = [];
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].shopId === shopId) result.push(orders[i]);
        }
        return result;
    }

    function addOrder(data) {
        var orders = getOrders();
        var newOrder = {
            id:        _nextId(KEYS.orders),
            userId:    data.userId   || 0,
            shopId:    data.shopId   || 0,
            items:     data.items    || [],
            total:     Number(data.total) || 0,
            status:    "pending",
            createdAt: new Date().toISOString().split("T")[0]
        };
        orders.push(newOrder);
        _set(KEYS.orders, orders);
        return newOrder;
    }

    function updateOrderStatus(id, newStatus) {
        var orders = getOrders();
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].id === id) {
                orders[i].status = newStatus;
                _set(KEYS.orders, orders);
                return orders[i];
            }
        }
        return null;
    }

    function deleteOrder(id) {
        var orders = getOrders();
        var filtered = [];
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].id !== id) filtered.push(orders[i]);
        }
        if (filtered.length === orders.length) return false;
        _set(KEYS.orders, filtered);
        return true;
    }


    // ── CART ───────────────────────────────────────────────

    function getCart() {
        return _get(KEYS.cart) || [];
    }

    function addToCart(productId, qty) {
        var cart = getCart();
        // Check if product already in cart
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].productId === productId) {
                cart[i].qty += qty;
                _set(KEYS.cart, cart);
                return cart[i];
            }
        }
        // New item
        var item = { productId: productId, qty: qty };
        cart.push(item);
        _set(KEYS.cart, cart);
        return item;
    }

    function updateCartQty(productId, qty) {
        var cart = getCart();
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].productId === productId) {
                cart[i].qty = qty;
                _set(KEYS.cart, cart);
                return cart[i];
            }
        }
        return null;
    }

    function removeFromCart(productId) {
        var cart = getCart();
        var filtered = [];
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].productId !== productId) filtered.push(cart[i]);
        }
        if (filtered.length === cart.length) return false;
        _set(KEYS.cart, filtered);
        return true;
    }

    function clearCart() {
        _set(KEYS.cart, []);
    }

    function getCartTotal() {
        var cart = getCart();
        var total = 0;
        for (var i = 0; i < cart.length; i++) {
            var product = getProductById(cart[i].productId);
            if (product) {
                total += product.price * cart[i].qty;
            }
        }
        return total;
    }


    // ── STATS (for admin dashboard) ────────────────────────

    function getTotalRevenue() {
        var orders = getOrders();
        var total = 0;
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].status !== "cancelled") {
                total += orders[i].total;
            }
        }
        return total;
    }

    function getShopRevenue(shopId) {
        var orders = getOrdersByShop(shopId);
        var total = 0;
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].status !== "cancelled") {
                total += orders[i].total;
            }
        }
        return total;
    }

    function getOrderCountByStatus() {
        var orders = getOrders();
        var counts = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
        for (var i = 0; i < orders.length; i++) {
            var s = orders[i].status;
            if (counts[s] !== undefined) counts[s]++;
        }
        return counts;
    }

    function getTopProducts(limit) {
        var orders = getOrders();
        var soldMap = {};
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].status === "cancelled") continue;
            var items = orders[i].items;
            for (var j = 0; j < items.length; j++) {
                var pid = items[j].productId;
                soldMap[pid] = (soldMap[pid] || 0) + items[j].qty;
            }
        }
        // Convert to array and sort
        var arr = [];
        var pids = Object.keys(soldMap);
        for (var k = 0; k < pids.length; k++) {
            var product = getProductById(Number(pids[k]));
            if (product) {
                arr.push({ product: product, sold: soldMap[pids[k]] });
            }
        }
        arr.sort(function (a, b) { return b.sold - a.sold; });
        return arr.slice(0, limit || 5);
    }

    function getProductCountByCategory() {
        var products = getProducts();
        var counts = {};
        for (var i = 0; i < products.length; i++) {
            var cat = products[i].category;
            counts[cat] = (counts[cat] || 0) + 1;
        }
        return counts;
    }


    // Public API 

    return {
        seed:       seed,
        resetAll:   resetAll,

        // Products
        getProducts:            getProducts,
        getApprovedProducts:    getApprovedProducts,
        getProductById:         getProductById,
        getProductsByCategory:  getProductsByCategory,
        getProductsByShop:      getProductsByShop,
        searchProducts:         searchProducts,
        addProduct:             addProduct,
        updateProduct:          updateProduct,
        deleteProduct:          deleteProduct,

        // Users
        getUsers:        getUsers,
        getUserById:     getUserById,
        getUserByEmail:     getUserByEmail,
        getUserByUsername:   getUserByUsername,
        addUser:             addUser,
        updateUser:      updateUser,
        deleteUser:      deleteUser,
        authenticate:    authenticate,
        getCurrentUser:  getCurrentUser,
        logout:          logout,

        // Shops (filtered from users)
        getShops:           getShops,
        getShopById:        getShopById,
        getCustomers:       getCustomers,
        updateShopStatus:   updateShopStatus,

        // Orders
        getOrders:          getOrders,
        getOrderById:       getOrderById,
        getOrdersByUser:    getOrdersByUser,
        getOrdersByShop:    getOrdersByShop,
        getOrdersByStatus:  getOrdersByStatus,
        addOrder:           addOrder,
        updateOrderStatus:  updateOrderStatus,
        deleteOrder:        deleteOrder,

        // Cart
        getCart:        getCart,
        addToCart:      addToCart,
        updateCartQty:  updateCartQty,
        removeFromCart:  removeFromCart,
        clearCart:       clearCart,
        getCartTotal:    getCartTotal,

        // Stats
        getTotalRevenue:          getTotalRevenue,
        getShopRevenue:           getShopRevenue,
        getOrderCountByStatus:    getOrderCountByStatus,
        getTopProducts:           getTopProducts,
        getProductCountByCategory: getProductCountByCategory
    };

})();

// Auto-seed on load
Store.seed();
