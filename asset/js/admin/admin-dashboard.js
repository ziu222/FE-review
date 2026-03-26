// ============================================================
// admin-dashboard.js — Dashboard Stats & Rendering

(function () {


    function formatCurrency(amount) {
        return "$" + amount.toLocaleString("en-US");
    }

    function formatDate(dateStr) {
        var d = new Date(dateStr);
        var day = String(d.getDate()).padStart(2, "0");
        var month = String(d.getMonth() + 1).padStart(2, "0");
        var year = d.getFullYear();
        return day + "/" + month + "/" + year;
    }


    function renderStatCards() {
        var shops     = Store.getShops();
        var products  = Store.getProducts();
        var orders    = Store.getOrders();
        var customers = Store.getCustomers();
        var revenue   = Store.getTotalRevenue();
        var statusCounts = Store.getOrderCountByStatus();

        document.getElementById("statShops").textContent = shops.length;
        document.getElementById("statProducts").textContent = products.length;
        document.getElementById("statOrders").textContent = orders.length;
        document.getElementById("statRevenue").textContent = formatCurrency(revenue);
        document.getElementById("statCustomers").textContent = customers.length;
        document.getElementById("statPending").textContent = statusCounts.pending;
    }


    //Order status stats

    function renderOrderStatus() {
        var counts = Store.getOrderCountByStatus();
        var total  = Store.getOrders().length;
        var container = document.getElementById("orderStatusList");
        var statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
        var html = "";

        for (var i = 0; i < statuses.length; i++) {
            var s = statuses[i];
            var count = counts[s] || 0;
            var pct = total > 0 ? Math.round((count / total) * 100) : 0;

            html += '<div class="status-item">'
                  +   '<span class="status-dot ' + s + '"></span>'
                  +   '<span class="status-label">' + s + '</span>'
                  +   '<div class="status-bar-track">'
                  +     '<div class="status-bar-fill ' + s + '" style="width:' + pct + '%"></div>'
                  +   '</div>'
                  +   '<span class="status-count">' + count + '</span>'
                  + '</div>';
        }

        container.innerHTML = html;
    }


    // top products

    function renderTopProducts() {
        var topItems = Store.getTopProducts(5);
        var container = document.getElementById("topProductsList");
        var html = "";

        if (topItems.length === 0) {
            container.innerHTML = '<p style="color:#999;font-size:14px;">No sales data yet.</p>';
            return;
        }

        for (var i = 0; i < topItems.length; i++) {
            var item = topItems[i];
            var rankClass = i === 0 ? "gold" : (i === 1 ? "silver" : (i === 2 ? "bronze" : ""));

            html += '<div class="top-product-item">'
                  +   '<span class="top-product-rank ' + rankClass + '">' + (i + 1) + '</span>'
                  +   '<div class="top-product-info">'
                  +     '<div class="top-product-name">' + escapeHtml(item.product.name) + '</div>'
                  +     '<div class="top-product-category">' + escapeHtml(item.product.category) + '</div>'
                  +   '</div>'
                  +   '<span class="top-product-sold">' + item.sold + ' sold</span>'
                  + '</div>';
        }

        container.innerHTML = html;
    }


    //Product category stats

    function renderCategoryBreakdown() {
        var counts = Store.getProductCountByCategory();
        var container = document.getElementById("categoryList");
        var total = Store.getProducts().length;

        var categoryIcons = {
            smartphone: "fa-mobile-screen",
            laptop:     "fa-laptop",
            tablet:     "fa-tablet-screen-button",
            headphone:  "fa-headphones",
            watch:      "fa-clock",
            camera:     "fa-camera",
            speaker:    "fa-volume-high",
            gaming:     "fa-gamepad",
            accessory:  "fa-plug"
        };

        var keys = Object.keys(counts);
        var html = "";

        for (var i = 0; i < keys.length; i++) {
            var cat = keys[i];
            var count = counts[cat];
            var pct = total > 0 ? Math.round((count / total) * 100) : 0;
            var icon = categoryIcons[cat] || "fa-box";

            html += '<div class="category-item">'
                  +   '<div class="category-icon"><i class="fa-solid ' + icon + '"></i></div>'
                  +   '<span class="category-name">' + escapeHtml(cat) + '</span>'
                  +   '<div class="category-bar-track">'
                  +     '<div class="category-bar-fill" style="width:' + pct + '%"></div>'
                  +   '</div>'
                  +   '<span class="category-count">' + count + '</span>'
                  + '</div>';
        }

        container.innerHTML = html;
    }


    // Order table 

    function renderRecentOrders() {
        var orders = Store.getOrders();
        var tbody  = document.getElementById("recentOrdersBody");

        orders.sort(function (a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        var recent = orders.slice(0, 5);

        var html = "";

        for (var i = 0; i < recent.length; i++) {
            var o = recent[i];
            var customer = Store.getUserById(o.userId);
            var shop = Store.getShopById(o.shopId);
            var customerName = customer ? escapeHtml(customer.name) : "Unknown";
            var shopName = shop ? escapeHtml(shop.shopName) : "Unknown";

            html += '<tr>'
                  +   '<td><span class="order-id">#' + o.id + '</span></td>'
                  +   '<td>' + customerName + '</td>'
                  +   '<td>' + shopName + '</td>'
                  +   '<td>' + formatCurrency(o.total) + '</td>'
                  +   '<td><span class="badge badge-' + o.status + '">' + o.status + '</span></td>'
                  +   '<td>' + formatDate(o.createdAt) + '</td>'
                  + '</tr>';
        }

        tbody.innerHTML = html;
    }


    //Nav bar user info

    function renderTopbarUser() {
        var user = Store.getCurrentUser();
        if (!user) return;

        var nameEl = document.getElementById("topbarUserName");
        var avatarEl = document.getElementById("topbarAvatar");

        nameEl.textContent = user.name;
        avatarEl.textContent = user.name.charAt(0).toUpperCase();
    }


    // 

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }


    // khoi tao

    renderTopbarUser();
    renderStatCards();
    renderOrderStatus();
    renderTopProducts();
    renderCategoryBreakdown();
    renderRecentOrders();

})();
