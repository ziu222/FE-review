// ============================================================
// admin-dashboard.js — Dashboard Stats & Rendering

(function () {

    var financeState = {
        timeRange: "week",
        shopFilter: "all",
        dateFrom: null,
        dateTo: null,
        page: 1,
        pageSize: 10,
        shopsLoaded: false,
        _cachedOrders: []
    };

    var revenueChartInstance = null;
    var trendChartInstance = null;


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

    function getDateRange(range) {
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (range === "today") {
            return { dateFrom: today.toISOString(), dateTo: now.toISOString() };
        }

        if (range === "week") {
            var weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return { dateFrom: weekAgo.toISOString(), dateTo: now.toISOString() };
        }

        if (range === "month") {
            var monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return { dateFrom: monthAgo.toISOString(), dateTo: now.toISOString() };
        }

        if (range === "year") {
            var yearAgo = new Date(today);
            yearAgo.setFullYear(today.getFullYear() - 1);
            return { dateFrom: yearAgo.toISOString(), dateTo: now.toISOString() };
        }

        return { dateFrom: null, dateTo: null };
    }

    function syncFinanceDateRange() {
        var range = getDateRange(financeState.timeRange);
        financeState.dateFrom = range.dateFrom;
        financeState.dateTo = range.dateTo;
    }

    function getFinanceFilters() {
        return {
            shopId: financeState.shopFilter,
            dateFrom: financeState.dateFrom,
            dateTo: financeState.dateTo
        };
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

    function renderFinanceStats(filters) {
        var summary = Store.getFinanceSummary(filters);

        document.getElementById("financeTotalRevenue").textContent = formatCurrency(summary.totalRevenue);
        document.getElementById("financePaidOrders").textContent = summary.paidOrders;
        document.getElementById("financeAvgOrder").textContent = formatCurrency(summary.avgOrderValue);
        document.getElementById("financeActiveShops").textContent = summary.activeShops;
    }

    function groupOrdersByPeriod(orders, range) {
        var totals = {};

        for (var i = 0; i < orders.length; i++) {
            var order = orders[i];
            var date = new Date(order.createdAt);
            var key;

            if (range === "year" || range === "all") {
                key = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
            } else {
                key = date.toISOString().slice(0, 10);
            }

            totals[key] = (totals[key] || 0) + (Number(order.total) || 0);
        }

        var labels = Object.keys(totals).sort();
        return {
            labels: labels,
            values: labels.map(function (label) {
                return totals[label];
            })
        };
    }

    function renderTrendChart(orders, timeRange) {
        var canvas = document.getElementById("revenueTrendChart");
        if (!canvas || typeof Chart === "undefined") return;

        if (trendChartInstance) {
            trendChartInstance.destroy();
        }

        var grouped = groupOrdersByPeriod(orders, timeRange);

        trendChartInstance = new Chart(canvas.getContext("2d"), {
            type: "line",
            data: {
                labels: grouped.labels,
                datasets: [{
                    label: "Revenue",
                    data: grouped.values,
                    borderColor: "rgba(0, 76, 76, 1)",
                    backgroundColor: "rgba(0, 76, 76, 0.1)",
                    tension: 0.35,
                    fill: true,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        ticks: {
                            callback: function (value) {
                                return "$" + Number(value).toLocaleString("en-US");
                            }
                        }
                    }
                }
            }
        });
    }

    function renderRevenueChart(data) {
        var canvas = document.getElementById("revenueByShopChart");
        if (!canvas || typeof Chart === "undefined") return;

        if (revenueChartInstance) {
            revenueChartInstance.destroy();
        }

        revenueChartInstance = new Chart(canvas.getContext("2d"), {
            type: "bar",
            data: {
                labels: data.map(function (item) { return item.shopName; }),
                datasets: [{
                    data: data.map(function (item) { return item.revenue; }),
                    backgroundColor: "rgba(0, 76, 76, 0.75)",
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        ticks: {
                            callback: function (value) {
                                return "$" + Number(value).toLocaleString("en-US");
                            }
                        }
                    }
                }
            }
        });
    }

    function renderRevenueByShop(filters) {
        var rows = Store.getRevenueByShop(filters);
        var tbody = document.getElementById("financeRevenueBody");

        if (!tbody) return;

        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="table-empty">No delivered revenue found for the selected filters.</td></tr>';
            renderRevenueChart([]);
            return;
        }

        var html = "";
        for (var i = 0; i < rows.length; i++) {
            html += "<tr>"
                + '<td>' + escapeHtml(rows[i].shopName || "Unknown") + '</td>'
                + '<td>' + rows[i].orderCount + '</td>'
                + '<td>' + formatCurrency(rows[i].revenue) + '</td>'
                + '<td>' + rows[i].percentage.toFixed(1) + '%</td>'
                + "</tr>";
        }

        tbody.innerHTML = html;
        renderRevenueChart(rows);
    }

    function renderTransactions(orders, filters) {
        var tbody = document.getElementById("financeTransactionsBody");
        var info = document.getElementById("financePaginationInfo");
        var pageLabel = document.getElementById("financePaginationPage");
        var prevBtn = document.getElementById("financePrevPage");
        var nextBtn = document.getElementById("financeNextPage");
        var totalPages = Math.max(1, Math.ceil(orders.length / financeState.pageSize));

        if (financeState.page > totalPages) {
            financeState.page = totalPages;
        }

        var start = (financeState.page - 1) * financeState.pageSize;
        var pageOrders = orders.slice(start, start + financeState.pageSize);

        if (pageOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No transactions found for the selected filters.</td></tr>';
        } else {
            var html = "";
            for (var i = 0; i < pageOrders.length; i++) {
                var order = pageOrders[i];
                var customer = Store.getUserById(Store.getOrderCustomerId(order));
                var shop = Store.getShopById(order.shopId);

                html += "<tr>"
                    + '<td><span class="order-id">#' + order.id + '</span></td>'
                    + '<td>' + escapeHtml(customer ? customer.name : "Unknown") + '</td>'
                    + '<td>' + escapeHtml(shop ? (shop.shopName || shop.name) : "Unknown") + '</td>'
                    + '<td>' + ((order.items && order.items.length) || 0) + '</td>'
                    + '<td>' + formatCurrency(Number(order.total) || 0) + '</td>'
                    + '<td>' + formatDate(order.createdAt) + '</td>'
                    + "</tr>";
            }
            tbody.innerHTML = html;
        }

        if (orders.length === 0) {
            info.textContent = "Showing 0-0 of 0";
        } else {
            info.textContent = "Showing " + (start + 1) + "-" + (start + pageOrders.length) + " of " + orders.length;
        }

        pageLabel.textContent = "Page " + financeState.page + " / " + totalPages;
        prevBtn.disabled = financeState.page <= 1;
        nextBtn.disabled = financeState.page >= totalPages;
    }

    function exportFinanceCsv(orders) {
        var header = ["Order ID", "Customer", "Shop", "Items", "Total", "Status", "Date"];
        var rows = [];

        for (var i = 0; i < orders.length; i++) {
            var order = orders[i];
            var customer = Store.getUserById(Store.getOrderCustomerId(order));
            var shop = Store.getShopById(order.shopId);

            rows.push([
                "#" + order.id,
                customer ? customer.name : "Unknown",
                shop ? (shop.shopName || shop.name) : "Unknown",
                (order.items && order.items.length) || 0,
                "$" + (Number(order.total) || 0),
                order.status,
                order.createdAt ? order.createdAt.split("T")[0] : ""
            ]);
        }

        var allRows = [header].concat(rows);
        var csvLines = [];

        for (var j = 0; j < allRows.length; j++) {
            var cells = [];
            for (var k = 0; k < allRows[j].length; k++) {
                cells.push('"' + String(allRows[j][k]).replace(/"/g, '""') + '"');
            }
            csvLines.push(cells.join(","));
        }

        var blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = "transactions-" + new Date().toISOString().split("T")[0] + ".csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function populateFinanceShopFilter() {
        var select = document.getElementById("financeShopFilter");
        var revenueRows = Store.getRevenueByShop({ shopId: "all", dateFrom: null, dateTo: null });
        var options = ['<option value="all">All Shops</option>'];

        for (var i = 0; i < revenueRows.length; i++) {
            options.push('<option value="' + revenueRows[i].shopId + '">' + escapeHtml(revenueRows[i].shopName) + '</option>');
        }

        select.innerHTML = options.join("");
        select.value = financeState.shopFilter;
        financeState.shopsLoaded = true;
    }

    function refreshFinance() {
        var filters = getFinanceFilters();
        var orders  = Store.getTransactions(filters);
        financeState._cachedOrders = orders;
        renderFinanceStats(filters);
        renderRevenueByShop(filters);
        renderTrendChart(orders, financeState.timeRange);
        renderTransactions(orders, filters);
    }

    function bindFinanceEvents() {
        var timeRange = document.getElementById("financeTimeRange");
        var shopFilter = document.getElementById("financeShopFilter");
        var exportBtn = document.getElementById("btnExportFinanceCsv");
        var prevBtn = document.getElementById("financePrevPage");
        var nextBtn = document.getElementById("financeNextPage");

        syncFinanceDateRange();
        timeRange.value = financeState.timeRange;

        timeRange.addEventListener("change", function () {
            financeState.timeRange = this.value;
            financeState.page = 1;
            syncFinanceDateRange();
            refreshFinance();
        });

        shopFilter.addEventListener("change", function () {
            financeState.shopFilter = this.value;
            financeState.page = 1;
            refreshFinance();
        });

        exportBtn.addEventListener("click", function () {
            exportFinanceCsv(financeState._cachedOrders || []);
        });

        prevBtn.addEventListener("click", function () {
            if (financeState.page <= 1) return;
            financeState.page -= 1;
            renderTransactions(financeState._cachedOrders, getFinanceFilters());
        });

        nextBtn.addEventListener("click", function () {
            var totalPages = Math.max(1, Math.ceil(
                (financeState._cachedOrders || []).length / financeState.pageSize
            ));
            if (financeState.page >= totalPages) return;
            financeState.page += 1;
            renderTransactions(financeState._cachedOrders, getFinanceFilters());
        });
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

            if (tab === "finance") {
                if (!financeState.shopsLoaded) {
                    populateFinanceShopFilter();
                }
                refreshFinance();
            }

            if (tab === "reports") {
                renderReportsTab();
            }
        }

        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener("click", function () {
                activateTab(this.getAttribute("data-tab"));
            });
        }

        activateTab("overview");
    }


    //Nav bar user info

    function renderTopbarUser() {
        var user = Auth.getCurrentUser();
        if (!user) return;

        var nameEl = document.getElementById("topbarUserName");
        var avatarEl = document.getElementById("topbarAvatar");

        nameEl.textContent = user.name;
        avatarEl.textContent = user.name.charAt(0).toUpperCase();
    }

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
    renderReportsTab();
    bindDashboardTabs();
    bindFinanceEvents();
    bindReportActions();

})();
