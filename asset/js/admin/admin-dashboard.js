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

    function getTodayKey() {
        var now = new Date();
        return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
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
            var customer = Store.getUserById(Store.getOrderCustomerId(o));
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

    function renderFinanceTab() {
        var orders = Store.getOrders();
        var shops = Store.getShops();
        var todayKey = getTodayKey();
        var totalRevenue = 0;
        var todayRevenue = 0;
        var activeShops = 0;
        var financeRows = [];

        for (var i = 0; i < shops.length; i++) {
            var shop = shops[i];
            if (shop.shopStatus === "active") {
                activeShops++;
            }

            var shopOrders = Store.getOrdersByShop(shop.id);
            var validOrderCount = 0;
            for (var x = 0; x < shopOrders.length; x++) {
                if (shopOrders[x].status !== "cancelled") {
                    validOrderCount++;
                }
            }

            financeRows.push({
                shopName: shop.shopName,
                ownerName: shop.name,
                status: shop.shopStatus || "pending",
                orders: validOrderCount,
                revenue: Store.getShopRevenue(shop.id)
            });
        }

        for (var j = 0; j < orders.length; j++) {
            var order = orders[j];
            if (order.status !== "cancelled") {
                totalRevenue += order.total;

                var orderDateKey = new Date(order.createdAt).toISOString().slice(0, 10);
                if (orderDateKey === todayKey) {
                    todayRevenue += order.total;
                }
            }
        }

        financeRows.sort(function (a, b) {
            return b.revenue - a.revenue;
        });

        document.getElementById("financeTotalRevenue").textContent = formatCurrency(totalRevenue);
        document.getElementById("financeTodayRevenue").textContent = formatCurrency(todayRevenue);
        document.getElementById("financeActiveShops").textContent = activeShops;

        var tbody = document.getElementById("financeTableBody");
        if (financeRows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No shop data yet.</td></tr>';
            return;
        }

        var html = "";
        for (var k = 0; k < financeRows.length; k++) {
            var row = financeRows[k];
            html += "<tr>"
                + '<td>' + escapeHtml(row.shopName || "Unknown") + '</td>'
                + '<td>' + escapeHtml(row.ownerName || "Unknown") + '</td>'
                + '<td><span class="badge badge-' + row.status + '">' + row.status + '</span></td>'
                + '<td>' + row.orders + '</td>'
                + '<td>' + formatCurrency(row.revenue) + '</td>'
                + "</tr>";
        }
        tbody.innerHTML = html;
    }

    function renderReportsTab() {
        var orders = Store.getOrders();
        var customers = Store.getCustomers();
        var shops = Store.getShops();
        var products = Store.getProducts();
        var statusCounts = Store.getOrderCountByStatus();
        var summaryBody = document.getElementById("reportSummaryBody");

        var metrics = [
            { label: "Total Customers", value: customers.length },
            { label: "Total Shops", value: shops.length },
            { label: "Total Products", value: products.length },
            { label: "Total Orders", value: orders.length },
            { label: "Pending Orders", value: statusCounts.pending || 0 },
            { label: "Delivered Orders", value: statusCounts.delivered || 0 },
            { label: "Cancelled Orders", value: statusCounts.cancelled || 0 },
            { label: "Total Revenue", value: formatCurrency(Store.getTotalRevenue()) }
        ];

        var html = "";
        for (var i = 0; i < metrics.length; i++) {
            html += "<tr>"
                + '<td>' + escapeHtml(String(metrics[i].label)) + '</td>'
                + '<td>' + escapeHtml(String(metrics[i].value)) + '</td>'
                + "</tr>";
        }
        summaryBody.innerHTML = html;
    }

    function exportOrdersCsv() {
        var orders = Store.getOrders();
        var rows = [["Order ID", "Customer", "Shop", "Total", "Status", "Created At"]];

        for (var i = 0; i < orders.length; i++) {
            var order = orders[i];
            var customer = Store.getUserById(Store.getOrderCustomerId(order));
            var shop = Store.getShopById(order.shopId);

            rows.push([
                order.id,
                customer ? customer.name : "Unknown",
                shop ? shop.shopName : "Unknown",
                order.total,
                order.status,
                formatDate(order.createdAt)
            ]);
        }

        var csvContent = "";
        for (var j = 0; j < rows.length; j++) {
            var csvRow = [];
            for (var k = 0; k < rows[j].length; k++) {
                var cell = String(rows[j][k]).replace(/"/g, '""');
                csvRow.push('"' + cell + '"');
            }
            csvContent += csvRow.join(",") + "\n";
        }

        var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        var link = document.createElement("a");
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "orders-report.csv");
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function bindReportActions() {
        var exportBtn = document.getElementById("btnExportCsv");
        var printBtn = document.getElementById("btnPrintReport");

        if (exportBtn) {
            exportBtn.addEventListener("click", exportOrdersCsv);
        }

        if (printBtn) {
            printBtn.addEventListener("click", function () {
                window.print();
            });
        }
    }

    function bindDashboardTabs() {
        var buttons = document.querySelectorAll(".dashboard-tab-btn");
        var panels = {
            overview: document.getElementById("tabOverview"),
            finance: document.getElementById("tabFinance"),
            reports: document.getElementById("tabReports")
        };

        function activateTab(tab) {
            for (var key in panels) {
                if (Object.prototype.hasOwnProperty.call(panels, key)) {
                    var panel = panels[key];
                    if (!panel) continue;
                    panel.classList.toggle("active", key === tab);
                }
            }

            for (var i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                button.classList.toggle("active", button.getAttribute("data-tab") === tab);
            }
        }

        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener("click", function () {
                activateTab(this.getAttribute("data-tab"));
            });
        }
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
    renderFinanceTab();
    renderReportsTab();
    bindDashboardTabs();
    bindReportActions();

})();
