Store.seed();
Auth.requireRole("admin", "admin-login.html");

var ProductAdminPage = (function () {
    var state = {
        products: [],
        filteredProducts: [],
        selectedProductId: null,
        statusFilter: "all",
        categoryFilter: "all",
        shopFilter: "all",
        searchQuery: "",
        minPrice: "",
        maxPrice: "",
        page: 1,
        pageSize: 5
    };

    var els = {};

    function init() {
        cacheDom();
        if (!els.productsTableBody) return;
        bindEvents();
        hydrateCurrentUser();
        refresh();
    }

    function cacheDom() {
        els.topbarAvatar = document.getElementById("topbarAvatar");
        els.topbarUserName = document.getElementById("topbarUserName");
        els.statTotalProducts = document.getElementById("statTotalProducts");
        els.statPendingProducts = document.getElementById("statPendingProducts");
        els.statApprovedProducts = document.getElementById("statApprovedProducts");
        els.statRejectedProducts = document.getElementById("statRejectedProducts");
        els.filterTabs = document.querySelectorAll(".filter-tab");
        els.categoryFilter = document.getElementById("categoryFilter");
        els.shopFilter = document.getElementById("shopFilter");
        els.minPriceInput = document.getElementById("minPriceInput");
        els.maxPriceInput = document.getElementById("maxPriceInput");
        els.productSearchInput = document.getElementById("productSearchInput");
        els.resetFiltersBtn = document.getElementById("resetFiltersBtn");
        els.productsTableBody = document.getElementById("productsTableBody");
        els.emptyState = document.getElementById("emptyState");
        els.paginationInfo = document.getElementById("paginationInfo");
        els.paginationPageLabel = document.getElementById("paginationPageLabel");
        els.prevPageBtn = document.getElementById("prevPageBtn");
        els.nextPageBtn = document.getElementById("nextPageBtn");
        els.previewSubtext = document.getElementById("previewSubtext");
        els.previewStatusBadge = document.getElementById("previewStatusBadge");
        els.previewHeroThumb = document.getElementById("previewHeroThumb");
        els.previewProductName = document.getElementById("previewProductName");
        els.previewProductMeta = document.getElementById("previewProductMeta");
        els.previewPrice = document.getElementById("previewPrice");
        els.previewStock = document.getElementById("previewStock");
        els.previewCategory = document.getElementById("previewCategory");
        els.previewUpdated = document.getElementById("previewUpdated");
        els.previewDescription = document.getElementById("previewDescription");
        els.previewViewBtn = document.getElementById("previewViewBtn");
        els.previewRejectBtn = document.getElementById("previewRejectBtn");
        els.previewApproveBtn = document.getElementById("previewApproveBtn");
        els.productModal = document.getElementById("productModal");
        els.productModalTitle = document.getElementById("productModalTitle");
        els.productModalBody = document.getElementById("productModalBody");
        els.productModalFooter = document.getElementById("productModalFooter");
    }

    function bindEvents() {
        for (var i = 0; i < els.filterTabs.length; i++) {
            els.filterTabs[i].addEventListener("click", onFilterTabClick);
        }

        if (els.categoryFilter) els.categoryFilter.addEventListener("change", onFormFiltersChange);
        if (els.shopFilter) els.shopFilter.addEventListener("change", onFormFiltersChange);
        if (els.minPriceInput) els.minPriceInput.addEventListener("input", onFormFiltersChange);
        if (els.maxPriceInput) els.maxPriceInput.addEventListener("input", onFormFiltersChange);
        if (els.productSearchInput) els.productSearchInput.addEventListener("input", onFormFiltersChange);
        if (els.resetFiltersBtn) els.resetFiltersBtn.addEventListener("click", resetFilters);

        if (els.prevPageBtn) {
            els.prevPageBtn.addEventListener("click", function () {
                if (state.page > 1) {
                    state.page--;
                    renderTable();
                }
            });
        }

        if (els.nextPageBtn) {
            els.nextPageBtn.addEventListener("click", function () {
                var totalPages = Math.max(1, Math.ceil(state.filteredProducts.length / state.pageSize));
                if (state.page < totalPages) {
                    state.page++;
                    renderTable();
                }
            });
        }

        if (els.productsTableBody) {
            els.productsTableBody.addEventListener("click", onTableClick);
        }

        if (els.previewViewBtn) {
            els.previewViewBtn.addEventListener("click", function () {
                var product = getSelectedProduct();
                if (product) openProductModal(product.id);
            });
        }

        if (els.previewApproveBtn) {
            els.previewApproveBtn.addEventListener("click", function () {
                var product = getSelectedProduct();
                if (product) handleApprove(product.id);
            });
        }

        if (els.previewRejectBtn) {
            els.previewRejectBtn.addEventListener("click", function () {
                var product = getSelectedProduct();
                if (product) handleReject(product.id);
            });
        }

        if (els.productModal) {
            els.productModal.addEventListener("click", function (event) {
                if (event.target === els.productModal) {
                    closeProductModal();
                }
            });
        }
    }

    function hydrateCurrentUser() {
        var user = Auth.getCurrentUser();
        if (!user) return;

        if (els.topbarUserName) {
            els.topbarUserName.textContent = user.name || "Admin";
        }

        if (els.topbarAvatar) {
            var source = (user.name || "A").trim();
            els.topbarAvatar.textContent = source ? source.charAt(0).toUpperCase() : "A";
        }
    }

    function refresh() {
        state.products = Store.getProducts();
        populateFilterOptions();
        renderStats();
        applyFilters();
    }

    function populateFilterOptions() {
        populateCategoryOptions();
        populateShopOptions();
    }

    function populateCategoryOptions() {
        if (!els.categoryFilter) return;

        var map = {};
        for (var i = 0; i < state.products.length; i++) {
            map[state.products[i].category] = true;
        }

        var keys = Object.keys(map).sort();
        var html = '<option value="all">All Categories</option>';
        for (var j = 0; j < keys.length; j++) {
            html += '<option value="' + escapeHtml(keys[j]) + '">' + escapeHtml(capitalize(keys[j])) + '</option>';
        }

        els.categoryFilter.innerHTML = html;
        els.categoryFilter.value = state.categoryFilter;
    }

    function populateShopOptions() {
        if (!els.shopFilter) return;

        var shops = {};
        for (var i = 0; i < state.products.length; i++) {
            var product = state.products[i];
            var shop = Store.getShopById(product.shopId);
            shops[product.shopId] = shop ? (shop.shopName || shop.name) : ("Shop #" + product.shopId);
        }

        var html = '<option value="all">All Shops</option>';
        var shopIds = Object.keys(shops).sort(function (a, b) { return Number(a) - Number(b); });
        for (var j = 0; j < shopIds.length; j++) {
            html += '<option value="' + shopIds[j] + '">' + escapeHtml(shops[shopIds[j]]) + '</option>';
        }

        els.shopFilter.innerHTML = html;
        els.shopFilter.value = state.shopFilter;
    }

    function renderStats() {
        var stats = Store.getProductStats ? Store.getProductStats() : { total: 0, pending: 0, approved: 0, rejected: 0 };
        if (els.statTotalProducts) els.statTotalProducts.textContent = stats.total || 0;
        if (els.statPendingProducts) els.statPendingProducts.textContent = stats.pending || 0;
        if (els.statApprovedProducts) els.statApprovedProducts.textContent = stats.approved || 0;
        if (els.statRejectedProducts) els.statRejectedProducts.textContent = stats.rejected || 0;
    }

    function applyFilters() {
        var result = [];
        var search = (state.searchQuery || "").toLowerCase().trim();
        var minPrice = state.minPrice === "" ? null : Number(state.minPrice);
        var maxPrice = state.maxPrice === "" ? null : Number(state.maxPrice);

        for (var i = 0; i < state.products.length; i++) {
            var product = state.products[i];
            var shop = Store.getShopById(product.shopId);
            var shopName = shop ? (shop.shopName || shop.name || "") : "";
            var match = true;

            if (state.statusFilter !== "all" && product.adminStatus !== state.statusFilter) match = false;
            if (match && state.categoryFilter !== "all" && product.category !== state.categoryFilter) match = false;
            if (match && state.shopFilter !== "all" && String(product.shopId) !== String(state.shopFilter)) match = false;
            if (match && minPrice !== null && Number(product.price) < minPrice) match = false;
            if (match && maxPrice !== null && Number(product.price) > maxPrice) match = false;

            if (match && search) {
                var haystack = [product.name, product.category, shopName, String(product.id)].join(" ").toLowerCase();
                if (haystack.indexOf(search) === -1) match = false;
            }

            if (match) result.push(product);
        }

        state.filteredProducts = result;

        var isSelectedInFiltered = false;
        for (var j = 0; j < state.filteredProducts.length; j++) {
            if (state.filteredProducts[j].id === state.selectedProductId) {
                isSelectedInFiltered = true;
                break;
            }
        }

        if (!isSelectedInFiltered) {
            state.selectedProductId = state.filteredProducts.length ? state.filteredProducts[0].id : null;
        }

        var totalPages = Math.max(1, Math.ceil(state.filteredProducts.length / state.pageSize));
        if (state.page > totalPages) state.page = totalPages;
        if (state.page < 1) state.page = 1;

        renderTable();
        renderPreview();
    }

    function renderTable() {
        if (!els.productsTableBody) return;

        if (!state.filteredProducts.length) {
            els.productsTableBody.innerHTML = "";
            if (els.emptyState) els.emptyState.style.display = "block";
            updatePagination(0, 0, 0);
            return;
        }

        if (els.emptyState) els.emptyState.style.display = "none";

        var start = (state.page - 1) * state.pageSize;
        var end = Math.min(start + state.pageSize, state.filteredProducts.length);
        var items = state.filteredProducts.slice(start, end);
        var html = "";

        for (var i = 0; i < items.length; i++) {
            var product = items[i];
            var shop = Store.getShopById(product.shopId);
            var shopName = shop ? (shop.shopName || shop.name) : ("Shop #" + product.shopId);
            var isPending = product.adminStatus === "pending";

            html += '' +
                '<tr data-id="' + product.id + '">' +
                    '<td>#' + product.id + '</td>' +
                    '<td>' +
                        '<div style="display:flex; align-items:center; gap:10px;">' +
                            renderThumb(product.image) +
                            '<div>' +
                                '<div style="font-weight:700; color:#191c1e;">' + escapeHtml(product.name) + '</div>' +
                                '<div style="font-size:12px; color:#7b8190;">' + escapeHtml(trimText(product.description, 48)) + '</div>' +
                            '</div>' +
                        '</div>' +
                    '</td>' +
                    '<td>' + escapeHtml(shopName) + '</td>' +
                    '<td>' + escapeHtml(capitalize(product.category)) + '</td>' +
                    '<td>$' + formatPrice(product.price) + '</td>' +
                    '<td>' + product.stock + '</td>' +
                    '<td><span class="badge ' + getStatusClass(product.adminStatus) + '">' + escapeHtml(capitalize(product.adminStatus)) + '</span></td>' +
                    '<td>' + escapeHtml(formatDateLabel(product.updatedAt || product.submittedAt)) + '</td>' +
                    '<td>' +
                        '<div style="display:flex; gap:6px; flex-wrap:wrap;">' +
                            '<button class="btn-reset" type="button" data-action="view" data-id="' + product.id + '">View</button>' +
                            (isPending ? '<button class="btn-reset" type="button" data-action="approve" data-id="' + product.id + '">Approve</button>' : '') +
                            (isPending ? '<button class="btn-reset" type="button" data-action="reject" data-id="' + product.id + '">Reject</button>' : '') +
                        '</div>' +
                    '</td>' +
                '</tr>';
        }

        els.productsTableBody.innerHTML = html;
        updatePagination(start + 1, end, state.filteredProducts.length);
    }

    function renderPreview() {
        var product = getSelectedProduct();
        if (!product) {
            if (els.previewSubtext) els.previewSubtext.textContent = "No product selected yet.";
            if (els.previewProductName) els.previewProductName.textContent = "Choose a product";
            if (els.previewProductMeta) els.previewProductMeta.textContent = "Select a row to inspect its review details.";
            if (els.previewPrice) els.previewPrice.textContent = "$0";
            if (els.previewStock) els.previewStock.textContent = "-";
            if (els.previewCategory) els.previewCategory.textContent = "-";
            if (els.previewUpdated) els.previewUpdated.textContent = "-";
            if (els.previewDescription) els.previewDescription.textContent = "Product notes and description will appear here once a row is selected.";
            if (els.previewStatusBadge) {
                els.previewStatusBadge.className = "badge badge-pending-review";
                els.previewStatusBadge.textContent = "Pending";
            }
            if (els.previewHeroThumb) {
                els.previewHeroThumb.style.backgroundImage = "none";
                els.previewHeroThumb.innerHTML = '<i class="fa-solid fa-box"></i>';
            }
            setPreviewActionState(false);
            return;
        }

        var shop = Store.getShopById(product.shopId);
        var shopName = shop ? (shop.shopName || shop.name) : ("Shop #" + product.shopId);

        if (els.previewSubtext) els.previewSubtext.textContent = "Product #" + product.id + " from " + shopName;
        if (els.previewProductName) els.previewProductName.textContent = product.name;
        if (els.previewProductMeta) els.previewProductMeta.textContent = shopName + " • " + capitalize(product.category) + " • " + product.reviews + " reviews";
        if (els.previewPrice) els.previewPrice.textContent = "$" + formatPrice(product.price);
        if (els.previewStock) els.previewStock.textContent = product.stock;
        if (els.previewCategory) els.previewCategory.textContent = capitalize(product.category);
        if (els.previewUpdated) els.previewUpdated.textContent = formatDateLabel(product.updatedAt || product.submittedAt);
        if (els.previewDescription) {
            els.previewDescription.textContent = product.description || (product.adminNote ? ("Admin note: " + product.adminNote) : "No description yet.");
        }
        if (els.previewStatusBadge) {
            els.previewStatusBadge.className = "badge " + getStatusClass(product.adminStatus);
            els.previewStatusBadge.textContent = capitalize(product.adminStatus);
        }
        if (els.previewHeroThumb) {
            if (product.image) {
                els.previewHeroThumb.innerHTML = "";
                els.previewHeroThumb.style.backgroundImage = 'url("' + product.image + '")';
                els.previewHeroThumb.style.backgroundSize = "cover";
                els.previewHeroThumb.style.backgroundPosition = "center";
            } else {
                els.previewHeroThumb.style.backgroundImage = "none";
                els.previewHeroThumb.innerHTML = '<i class="fa-solid fa-box"></i>';
            }
        }

        setPreviewActionState(product.adminStatus === "pending");
    }

    function setPreviewActionState(canReview) {
        if (els.previewApproveBtn) {
            els.previewApproveBtn.disabled = !canReview;
            els.previewApproveBtn.style.opacity = canReview ? "1" : "0.55";
        }
        if (els.previewRejectBtn) {
            els.previewRejectBtn.disabled = !canReview;
            els.previewRejectBtn.style.opacity = canReview ? "1" : "0.55";
        }
    }

    function updatePagination(start, end, total) {
        var totalPages = Math.max(1, Math.ceil(total / state.pageSize));
        if (els.paginationInfo) {
            els.paginationInfo.textContent = total ? ("Showing " + start + "-" + end + " of " + total + " products") : "Showing 0-0 of 0 products";
        }
        if (els.paginationPageLabel) {
            els.paginationPageLabel.textContent = "Page " + state.page + " / " + totalPages;
        }
        if (els.prevPageBtn) els.prevPageBtn.disabled = state.page <= 1;
        if (els.nextPageBtn) els.nextPageBtn.disabled = state.page >= totalPages;
    }

    function onFilterTabClick(event) {
        var tab = event.currentTarget;
        state.statusFilter = tab.getAttribute("data-filter") || "all";
        state.page = 1;

        for (var i = 0; i < els.filterTabs.length; i++) {
            els.filterTabs[i].classList.remove("active");
        }
        tab.classList.add("active");
        applyFilters();
    }

    function onFormFiltersChange() {
        state.categoryFilter = els.categoryFilter ? els.categoryFilter.value : "all";
        state.shopFilter = els.shopFilter ? els.shopFilter.value : "all";
        state.searchQuery = els.productSearchInput ? els.productSearchInput.value : "";
        state.minPrice = els.minPriceInput ? els.minPriceInput.value : "";
        state.maxPrice = els.maxPriceInput ? els.maxPriceInput.value : "";
        state.page = 1;
        applyFilters();
    }

    function resetFilters() {
        state.statusFilter = "all";
        state.categoryFilter = "all";
        state.shopFilter = "all";
        state.searchQuery = "";
        state.minPrice = "";
        state.maxPrice = "";
        state.page = 1;

        if (els.categoryFilter) els.categoryFilter.value = "all";
        if (els.shopFilter) els.shopFilter.value = "all";
        if (els.productSearchInput) els.productSearchInput.value = "";
        if (els.minPriceInput) els.minPriceInput.value = "";
        if (els.maxPriceInput) els.maxPriceInput.value = "";

        for (var i = 0; i < els.filterTabs.length; i++) {
            els.filterTabs[i].classList.toggle("active", els.filterTabs[i].getAttribute("data-filter") === "all");
        }

        applyFilters();
    }

    function onTableClick(event) {
        var actionButton = event.target.closest("[data-action]");
        if (actionButton) {
            var action = actionButton.getAttribute("data-action");
            var productId = Number(actionButton.getAttribute("data-id"));
            state.selectedProductId = productId;
            renderPreview();

            if (action === "view") openProductModal(productId);
            if (action === "approve") handleApprove(productId);
            if (action === "reject") handleReject(productId);
            return;
        }

        var row = event.target.closest("tr[data-id]");
        if (row) {
            state.selectedProductId = Number(row.getAttribute("data-id"));
            renderPreview();
        }
    }

    function handleApprove(productId) {
        var product = findProductById(productId);
        if (!product) return;

        if (!window.confirm('Approve "' + product.name + '"?')) return;

        var result = Store.reviewProduct(productId, "approved", "");
        if (!result || !result.success) {
            window.alert(result && result.error ? result.error : "Unable to approve this product.");
            return;
        }

        window.alert("Product approved successfully.");
        refresh();
    }

    function handleReject(productId) {
        var product = findProductById(productId);
        if (!product) return;

        var note = window.prompt('Enter rejection reason for "' + product.name + '":', product.adminNote || "");
        if (note === null) return;
        note = note.trim();

        if (!note) {
            window.alert("A rejection reason is required.");
            return;
        }

        var result = Store.reviewProduct(productId, "rejected", note);
        if (!result || !result.success) {
            window.alert(result && result.error ? result.error : "Unable to reject this product.");
            return;
        }

        window.alert("Product rejected successfully.");
        refresh();
    }

    function openProductModal(productId) {
        var product = findProductById(productId);
        if (!product || !els.productModal) return;

        var shop = Store.getShopById(product.shopId);
        var shopName = shop ? (shop.shopName || shop.name) : ("Shop #" + product.shopId);

        if (els.productModalTitle) {
            els.productModalTitle.textContent = "Product #" + product.id + " details";
        }

        if (els.productModalBody) {
            els.productModalBody.innerHTML = '' +
                '<div style="display:grid; gap:12px;">' +
                    '<div style="display:flex; gap:16px; align-items:flex-start;">' +
                        renderLargeThumb(product.image) +
                        '<div style="flex:1;">' +
                            '<h4 style="margin:0 0 6px; font-size:18px; font-weight:800; color:#191c1e;">' + escapeHtml(product.name) + '</h4>' +
                            '<div style="color:#7b8190; margin-bottom:8px;">' + escapeHtml(shopName) + '</div>' +
                            '<span class="badge ' + getStatusClass(product.adminStatus) + '">' + escapeHtml(capitalize(product.adminStatus)) + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="modal-detail-row"><span>Category</span><strong>' + escapeHtml(capitalize(product.category)) + '</strong></div>' +
                    '<div class="modal-detail-row"><span>Price</span><strong>$' + formatPrice(product.price) + '</strong></div>' +
                    '<div class="modal-detail-row"><span>Stock</span><strong>' + product.stock + '</strong></div>' +
                    '<div class="modal-detail-row"><span>Submitted</span><strong>' + escapeHtml(formatDateLabel(product.submittedAt || product.createdAt)) + '</strong></div>' +
                    '<div class="modal-detail-row"><span>Reviewed by</span><strong>' + escapeHtml(product.reviewedBy || "-") + '</strong></div>' +
                    '<div class="modal-detail-row"><span>Admin note</span><strong>' + escapeHtml(product.adminNote || "-") + '</strong></div>' +
                    '<div style="padding-top:8px; color:#475467; line-height:1.6;">' + escapeHtml(product.description || "No description.") + '</div>' +
                '</div>';
        }

        if (els.productModalFooter) {
            var footerHtml = '<button class="modal-btn close" type="button" id="productModalCloseBtn">Close</button>';
            if (product.adminStatus === "pending") {
                footerHtml += '<button class="modal-btn suspend" type="button" id="productModalRejectBtn">Reject</button>';
                footerHtml += '<button class="modal-btn approve" type="button" id="productModalApproveBtn">Approve</button>';
            }
            els.productModalFooter.innerHTML = footerHtml;

            var closeBtn = document.getElementById("productModalCloseBtn");
            var rejectBtn = document.getElementById("productModalRejectBtn");
            var approveBtn = document.getElementById("productModalApproveBtn");

            if (closeBtn) closeBtn.addEventListener("click", closeProductModal);
            if (rejectBtn) rejectBtn.addEventListener("click", function () { closeProductModal(); handleReject(product.id); });
            if (approveBtn) approveBtn.addEventListener("click", function () { closeProductModal(); handleApprove(product.id); });
        }

        els.productModal.classList.add("show");
    }

    function closeProductModal() {
        if (els.productModal) {
            els.productModal.classList.remove("show");
        }
    }

    function getSelectedProduct() {
        return findProductById(state.selectedProductId);
    }

    function findProductById(productId) {
        for (var i = 0; i < state.products.length; i++) {
            if (state.products[i].id === productId) return state.products[i];
        }
        return null;
    }

    function formatPrice(value) {
        return Number(value || 0).toLocaleString("en-US");
    }

    function formatDateLabel(value) {
        if (!value) return "-";
        return String(value).split("T")[0];
    }

    function trimText(text, maxLength) {
        if (!text) return "";
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength - 3) + "...";
    }

    function capitalize(value) {
        if (!value) return "-";
        var words = String(value).replace(/[-_]+/g, " ").split(" ");
        for (var i = 0; i < words.length; i++) {
            if (words[i]) {
                words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
            }
        }
        return words.join(" ");
    }

    function getStatusClass(status) {
        if (status === "approved") return "badge-approved";
        if (status === "rejected") return "badge-suspended";
        if (status === "suspended") return "badge-suspended";
        return "badge-pending-review";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function renderThumb(image) {
        if (image) {
            return '<div style="width:44px; height:44px; border-radius:10px; overflow:hidden; background:#f5f5f5; flex-shrink:0;"><img src="' + image + '" alt="Product" style="width:100%; height:100%; object-fit:cover;"></div>';
        }
        return '<div style="width:44px; height:44px; border-radius:10px; background:#eef2ff; display:flex; align-items:center; justify-content:center; color:#4f46e5; flex-shrink:0;"><i class="fa-solid fa-box"></i></div>';
    }

    function renderLargeThumb(image) {
        if (image) {
            return '<div style="width:90px; height:90px; border-radius:14px; overflow:hidden; background:#f5f5f5; flex-shrink:0;"><img src="' + image + '" alt="Product" style="width:100%; height:100%; object-fit:cover;"></div>';
        }
        return '<div style="width:90px; height:90px; border-radius:14px; background:#eef2ff; display:flex; align-items:center; justify-content:center; color:#4f46e5; flex-shrink:0;"><i class="fa-solid fa-box-open"></i></div>';
    }

    return {
        init: init,
        closeProductModal: closeProductModal
    };
})();

window.closeProductModal = ProductAdminPage.closeProductModal;

document.addEventListener("DOMContentLoaded", function () {
    ProductAdminPage.init();
});
