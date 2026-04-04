// ============================================================
// admin-products.js — Products Review Page Logic

(function () {

    // ------------------------------------------------------------
    // Page state
    // ------------------------------------------------------------
 
    var filters = {
        status: "all",
        category: "all",
        shopId: "all",
        searchText: "",
        minPrice: "",
        maxPrice: "",
        selectedProductId: null,
        currentPage: 1,
        itemsPerPage: 5
    };



    function formatCurrency(amount) {
        return "$" + Number(amount || 0).toLocaleString("en-US");
    }

    function formatDate(dateStr) {
        if (!dateStr) return "-";

        var date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric"
        });
    }

    function escapeHtml(text) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(text == null ? "" : String(text)));
        return div.innerHTML;
    }

    function toTitleCase(text) {
        if (!text) return "-";

        return String(text)
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, function (char) {
                return char.toUpperCase();
            });
    }

    function getProductStatus(product) {
      
        if (!product || !product.adminStatus) return "approved";
        if (product.adminStatus === "visible") return "approved";
        if (product.adminStatus === "flagged") return "pending";
        if (product.adminStatus === "hidden") return "rejected";
        return product.adminStatus;
    }

    function getStatusLabel(status) {
        if (status === "pending") return "Pending";
        if (status === "rejected") return "Rejected";
        return "Approved";
    }

    function getStatusClass(status) {
        if (status === "pending") return "badge-pending-review";
        if (status === "rejected") return "badge-rejected";
        return "badge-approved";
    }

    function getStatusPriority(status) {
        if (status === "pending") return 0;
        if (status === "rejected") return 1;
        return 2;
    }

    function getStockClass(stock) {
        if (stock <= 0) return "stock-out";
        if (stock <= 5) return "stock-low";
        return "stock-ok";
    }

    function getStockLabel(stock) {
        if (stock <= 0) return "Out of stock";
        if (stock <= 5) return stock + " left";
        return stock + " in stock";
    }

    function getCategoryIcon(category) {
        var iconMap = {
            smartphone: "fa-mobile-screen-button",
            wearables: "fa-watch-smart",
            laptops: "fa-laptop",
            audio: "fa-headphones",
            cameras: "fa-camera"
        };

        return iconMap[category] || "fa-box-open";
    }

    function getThumbClass(category) {
        var classMap = {
            smartphone: "thumb-blue",
            wearables: "thumb-orange",
            laptops: "thumb-violet",
            audio: "thumb-dark",
            cameras: "thumb-orange"
        };

        return classMap[category] || "thumb-blue";
    }

    function getShortDescription(product) {
        var text = product.description || "No description";
        if (text.length <= 56) return text;
        return text.slice(0, 56) + "...";
    }


   
    function ensureAdminFieldsExist() {
        var products = Store.getProducts();

        for (var i = 0; i < products.length; i++) {
            var product = products[i];
            var updates = {};
            var normalizedStatus = getProductStatus(product);

            if (!product.adminStatus || product.adminStatus !== normalizedStatus) {
                updates.adminStatus = normalizedStatus;
            }

            if (!product.updatedAt) {
                updates.updatedAt = product.createdAt || new Date().toISOString().split("T")[0];
            }

            if (Object.keys(updates).length > 0) {
                Store.updateProduct(product.id, updates);
            }
        }
    }


 

    function renderTopbarUser() {
        var user = Store.getCurrentUser();
        if (!user) return;

        document.getElementById("topbarUserName").textContent = user.name;
        document.getElementById("topbarAvatar").textContent = user.name.charAt(0).toUpperCase();
    }




    function renderStats() {
        var products = Store.getProducts();
        var totalProducts = products.length;
        var pendingProducts = 0;
        var approvedProducts = 0;
        var rejectedProducts = 0;

        for (var i = 0; i < products.length; i++) {
            var status = getProductStatus(products[i]);

            if (status === "pending") pendingProducts++;
            else if (status === "rejected") rejectedProducts++;
            else approvedProducts++;
        }

        document.getElementById("statTotalProducts").textContent = totalProducts;
        document.getElementById("statPendingProducts").textContent = pendingProducts;
        document.getElementById("statApprovedProducts").textContent = approvedProducts;
        document.getElementById("statRejectedProducts").textContent = rejectedProducts;
    }


    function renderFilterOptions() {
        var categorySelect = document.getElementById("categoryFilter");
        var shopSelect = document.getElementById("shopFilter");
        var products = Store.getProducts();
        var shops = Store.getShops();
        var seenCategories = {};
        var categoryHtml = '<option value="all">All Categories</option>';
        var shopHtml = '<option value="all">All Shops</option>';

        for (var i = 0; i < products.length; i++) {
            var category = products[i].category;

            if (!seenCategories[category]) {
                seenCategories[category] = true;
                categoryHtml += '<option value="' + escapeHtml(category) + '">' + escapeHtml(toTitleCase(category)) + '</option>';
            }
        }

        for (var j = 0; j < shops.length; j++) {
            shopHtml += '<option value="' + shops[j].id + '">' + escapeHtml(shops[j].shopName) + '</option>';
        }

        categorySelect.innerHTML = categoryHtml;
        shopSelect.innerHTML = shopHtml;

        categorySelect.value = filters.category;
        shopSelect.value = filters.shopId;
    }




    function getFilteredProducts() {
        var allProducts = Store.getProducts().slice();
        var matchedProducts = [];

        // Pending items should appear first because they need review.
        allProducts.sort(function (a, b) {
            var aPriority = getStatusPriority(getProductStatus(a));
            var bPriority = getStatusPriority(getProductStatus(b));

            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }

            return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
        });

        for (var i = 0; i < allProducts.length; i++) {
            var product = allProducts[i];
            var shop = Store.getShopById(product.shopId);
            var shopName = shop ? shop.shopName : "";
            var productStatus = getProductStatus(product);
            var searchTarget = (product.name + " " + product.category + " " + shopName).toLowerCase();

            if (filters.status !== "all" && productStatus !== filters.status) continue;
            if (filters.category !== "all" && product.category !== filters.category) continue;
            if (filters.shopId !== "all" && String(product.shopId) !== String(filters.shopId)) continue;
            if (filters.minPrice !== "" && Number(product.price) < Number(filters.minPrice)) continue;
            if (filters.maxPrice !== "" && Number(product.price) > Number(filters.maxPrice)) continue;

            if (filters.searchText) {
                if (searchTarget.indexOf(filters.searchText.toLowerCase()) === -1) continue;
            }

            matchedProducts.push(product);
        }

        return matchedProducts;
    }




    function renderProductsTable() {
        var filteredProducts = getFilteredProducts();
        var tableBody = document.getElementById("productsTableBody");
        var emptyState = document.getElementById("emptyState");
        var html = "";
        var selectedStillExists = false;
        var totalPages = Math.max(1, Math.ceil(filteredProducts.length / filters.itemsPerPage));

        if (filters.currentPage > totalPages) {
            filters.currentPage = totalPages;
        }

        if (filteredProducts.length === 0) {
            tableBody.innerHTML = "";
            emptyState.style.display = "block";
            filters.selectedProductId = null;
            renderPreview(null);
            renderPagination(0, 0, 0, 1);
            return;
        }

        emptyState.style.display = "none";

        var startIndex = (filters.currentPage - 1) * filters.itemsPerPage;
        var endIndex = startIndex + filters.itemsPerPage;
        var currentPageProducts = filteredProducts.slice(startIndex, endIndex);

        for (var i = 0; i < currentPageProducts.length; i++) {
            var product = currentPageProducts[i];
            var shop = Store.getShopById(product.shopId);
            var status = getProductStatus(product);
            var isSelected = product.id === filters.selectedProductId;

            if (isSelected) {
                selectedStillExists = true;
            }

            html += '<tr data-id="' + product.id + '" class="' + (isSelected ? 'is-selected' : '') + '">';
            html += '  <td class="order-id">#' + product.id + '</td>';
            html += '  <td>';
            html += '      <div class="product-cell">';
            html += '          <div class="product-thumb ' + getThumbClass(product.category) + '"><i class="fa-solid ' + getCategoryIcon(product.category) + '"></i></div>';
            html += '          <div>';
            html += '              <div class="product-name">' + escapeHtml(product.name) + '</div>';
            html += '              <div class="product-meta">' + escapeHtml(getShortDescription(product)) + '</div>';
            html += '          </div>';
            html += '      </div>';
            html += '  </td>';
            html += '  <td>' + escapeHtml(shop ? shop.shopName : 'Unknown Shop') + '</td>';
            html += '  <td><span class="category-pill">' + escapeHtml(toTitleCase(product.category)) + '</span></td>';
            html += '  <td class="price-text">' + formatCurrency(product.price) + '</td>';
            html += '  <td><span class="stock-text ' + getStockClass(product.stock) + '">' + getStockLabel(product.stock) + '</span></td>';
            html += '  <td><span class="badge ' + getStatusClass(status) + '">' + getStatusLabel(status) + '</span></td>';
            html += '  <td>' + formatDate(product.updatedAt || product.createdAt) + '</td>';
            html += '  <td><div class="row-actions">' + buildActionButtons(product) + '</div></td>';
            html += '</tr>';
        }

        tableBody.innerHTML = html;

        if (!selectedStillExists) {
            filters.selectedProductId = currentPageProducts[0].id;
        }

        highlightSelectedRow();
        renderPreview(Store.getProductById(filters.selectedProductId));
        renderPagination(filteredProducts.length, startIndex + 1, startIndex + currentPageProducts.length, totalPages);
    }

    function buildActionButtons(product) {
        var status = getProductStatus(product);
        var html = "";

        html += '<button class="action-btn-sm view" type="button" data-id="' + product.id + '" data-action="view" title="View detail">';
        html += '    <i class="fa-solid fa-eye"></i>';
        html += '</button>';

        if (status !== "approved") {
            html += '<button class="action-btn-sm approve" type="button" data-id="' + product.id + '" data-action="approved" title="Approve product">';
            html += '    <i class="fa-solid fa-check"></i>';
            html += '</button>';
        }

        if (status !== "rejected") {
            html += '<button class="action-btn-sm suspend" type="button" data-id="' + product.id + '" data-action="rejected" title="Reject product">';
            html += '    <i class="fa-solid fa-ban"></i>';
            html += '</button>';
        }

        return html;
    }

    function highlightSelectedRow() {
        var rows = document.querySelectorAll("#productsTableBody tr");

        for (var i = 0; i < rows.length; i++) {
            var rowId = Number(rows[i].getAttribute("data-id"));
            var isSelected = rowId === filters.selectedProductId;
            rows[i].classList.toggle("is-selected", isSelected);
        }
    }

    function renderPagination(totalItems, startItem, endItem, totalPages) {
        var paginationBar = document.getElementById("paginationBar");
        var paginationInfo = document.getElementById("paginationInfo");
        var paginationPageLabel = document.getElementById("paginationPageLabel");
        var prevPageBtn = document.getElementById("prevPageBtn");
        var nextPageBtn = document.getElementById("nextPageBtn");

        if (totalItems === 0) {
            paginationBar.style.display = "none";
            paginationInfo.textContent = "Showing 0-0 of 0 products";
            paginationPageLabel.textContent = "Page 1 / 1";
            prevPageBtn.disabled = true;
            nextPageBtn.disabled = true;
            return;
        }

        paginationBar.style.display = "flex";
        paginationInfo.textContent = "Showing " + startItem + "-" + endItem + " of " + totalItems + " products";
        paginationPageLabel.textContent = "Page " + filters.currentPage + " / " + totalPages;
        prevPageBtn.disabled = filters.currentPage === 1;
        nextPageBtn.disabled = filters.currentPage === totalPages;
    }


  

    function renderPreview(product) {
        var statusBadge = document.getElementById("previewStatusBadge");
        var previewThumb = document.getElementById("previewHeroThumb");
        var previewName = document.getElementById("previewProductName");
        var previewMeta = document.getElementById("previewProductMeta");
        var previewPrice = document.getElementById("previewPrice");
        var previewStock = document.getElementById("previewStock");
        var previewCategory = document.getElementById("previewCategory");
        var previewUpdated = document.getElementById("previewUpdated");
        var previewDescription = document.getElementById("previewDescription");
        var previewSubtext = document.getElementById("previewSubtext");
        var viewButton = document.getElementById("previewViewBtn");
        var rejectButton = document.getElementById("previewRejectBtn");
        var approveButton = document.getElementById("previewApproveBtn");

        if (!product) {
            statusBadge.className = "badge badge-pending-review";
            statusBadge.textContent = "No selection";
            previewThumb.innerHTML = '<i class="fa-solid fa-box-open"></i>';
            previewName.textContent = "Choose a product";
            previewMeta.textContent = "The detail preview updates from the selected row.";
            previewPrice.textContent = "$0";
            previewStock.textContent = "-";
            previewStock.className = "";
            previewCategory.textContent = "-";
            previewUpdated.textContent = "-";
            previewDescription.textContent = "Product notes and description will appear here once a row is selected.";
            previewSubtext.textContent = "No product matches the current filters.";
            viewButton.disabled = true;
            rejectButton.disabled = true;
            approveButton.disabled = true;
            return;
        }

        var shop = Store.getShopById(product.shopId);
        var status = getProductStatus(product);

        statusBadge.className = "badge " + getStatusClass(status);
        statusBadge.textContent = getStatusLabel(status);
        previewThumb.innerHTML = '<i class="fa-solid ' + getCategoryIcon(product.category) + '"></i>';
        previewName.textContent = product.name;
        previewMeta.textContent = (shop ? shop.shopName : "Unknown Shop") + " • " + toTitleCase(product.category) + " • #" + product.id;
        previewPrice.textContent = formatCurrency(product.price);
        previewStock.textContent = getStockLabel(product.stock);
        previewStock.className = getStockClass(product.stock);
        previewCategory.textContent = toTitleCase(product.category);
        previewUpdated.textContent = formatDate(product.updatedAt || product.createdAt);
        previewDescription.textContent = product.description || "No description available for this product.";

        if (status === "pending") {
            previewSubtext.textContent = "This upload is waiting for admin review before it can go live.";
        } else if (status === "rejected") {
            previewSubtext.textContent = "This product was rejected and should be edited by the shop before resubmission.";
        } else {
            previewSubtext.textContent = "This product is approved and can appear on the storefront.";
        }

        viewButton.disabled = false;
        rejectButton.disabled = status === "rejected";
        approveButton.disabled = status === "approved";
        rejectButton.textContent = "Reject";
        approveButton.textContent = "Approve";
    }




    function openProductModal(productId) {
        var product = Store.getProductById(productId);
        if (!product) return;

        var shop = Store.getShopById(product.shopId);
        var status = getProductStatus(product);
        var modal = document.getElementById("productModal");
        var modalBody = document.getElementById("productModalBody");
        var modalFooter = document.getElementById("productModalFooter");

        filters.selectedProductId = product.id;
        highlightSelectedRow();
        renderPreview(product);

        document.getElementById("productModalTitle").textContent = "Product Detail • #" + product.id;

        modalBody.innerHTML = ''
            + '<div class="modal-product-hero">'
            + '    <img class="modal-product-image" src="' + escapeHtml(product.image || "../asset/img/404.png") + '" alt="Product image" onerror="this.onerror=null;this.src=\'../asset/img/404.png\';">'
            + '    <div>'
            + '        <div class="modal-product-name">' + escapeHtml(product.name) + '</div>'
            + '        <div class="modal-product-subtext">'
            +              escapeHtml(shop ? shop.shopName : 'Unknown Shop') + ' • '
            +              escapeHtml(toTitleCase(product.category)) + ' • '
            +              formatCurrency(product.price)
            + '        </div>'
            + '        <div class="modal-status-row">'
            + '            <span class="badge ' + getStatusClass(status) + '">' + getStatusLabel(status) + '</span>'
            + '            <span class="stock-text ' + getStockClass(product.stock) + '">' + getStockLabel(product.stock) + '</span>'
            + '            <span class="modal-inline-note">Rating: ' + Number(product.rating || 0).toFixed(1) + ' • ' + Number(product.reviews || 0) + ' reviews</span>'
            + '        </div>'
            + '    </div>'
            + '</div>'
            + '<div class="modal-detail-row">'
            + '    <span class="modal-detail-label">Shop</span>'
            + '    <span class="modal-detail-value">' + escapeHtml(shop ? shop.shopName : 'Unknown Shop') + '</span>'
            + '</div>'
            + '<div class="modal-detail-row">'
            + '    <span class="modal-detail-label">Category</span>'
            + '    <span class="modal-detail-value">' + escapeHtml(toTitleCase(product.category)) + '</span>'
            + '</div>'
            + '<div class="modal-detail-row">'
            + '    <span class="modal-detail-label">Price</span>'
            + '    <span class="modal-detail-value">' + formatCurrency(product.price) + '</span>'
            + '</div>'
            + '<div class="modal-detail-row">'
            + '    <span class="modal-detail-label">Old Price</span>'
            + '    <span class="modal-detail-value">' + (product.oldPrice ? formatCurrency(product.oldPrice) : '—') + '</span>'
            + '</div>'
            + '<div class="modal-detail-row">'
            + '    <span class="modal-detail-label">Created</span>'
            + '    <span class="modal-detail-value">' + formatDate(product.createdAt) + '</span>'
            + '</div>'
            + '<div class="modal-detail-row">'
            + '    <span class="modal-detail-label">Updated</span>'
            + '    <span class="modal-detail-value">' + formatDate(product.updatedAt || product.createdAt) + '</span>'
            + '</div>'
            + '<div class="modal-product-desc">' + escapeHtml(product.description || 'No description available.') + '</div>';

        modalFooter.innerHTML = ''
            + '<button class="modal-btn close" type="button" onclick="closeProductModal()">Close</button>'
            + '<button class="modal-btn suspend" type="button" data-modal-action="rejected" data-id="' + product.id + '"' + (status === "rejected" ? ' disabled' : '') + '>Reject</button>'
            + '<button class="modal-btn approve" type="button" data-modal-action="approved" data-id="' + product.id + '"' + (status === "approved" ? ' disabled' : '') + '>Approve</button>';

        modal.classList.add("show");
    }

    window.closeProductModal = function () {
        document.getElementById("productModal").classList.remove("show");
    };



    function updateProductStatus(productId, newStatus) {
        Store.updateProduct(productId, {
            adminStatus: newStatus,
            updatedAt: new Date().toISOString().split("T")[0]
        });

        renderEverything();
    }

    function resetAllFilters() {
        filters.status = "all";
        filters.category = "all";
        filters.shopId = "all";
        filters.searchText = "";
        filters.minPrice = "";
        filters.maxPrice = "";
        filters.currentPage = 1;

        document.getElementById("categoryFilter").value = "all";
        document.getElementById("shopFilter").value = "all";
        document.getElementById("productSearchInput").value = "";
        document.getElementById("minPriceInput").value = "";
        document.getElementById("maxPriceInput").value = "";

        var tabs = document.querySelectorAll(".filter-tab");
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.toggle("active", tabs[i].getAttribute("data-filter") === "all");
        }

        renderProductsTable();
    }

    function renderEverything() {
        renderFilterOptions();
        renderStats();
        renderProductsTable();
    }


    // ------------------------------------------------------------
    // Event listeners
    // ------------------------------------------------------------

    function bindEvents() {
        var tabs = document.querySelectorAll(".filter-tab");

        for (var i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener("click", function () {
                for (var j = 0; j < tabs.length; j++) {
                    tabs[j].classList.remove("active");
                }

                this.classList.add("active");
                filters.status = this.getAttribute("data-filter") || "all";
                filters.currentPage = 1;
                renderProductsTable();
            });
        }

        document.getElementById("categoryFilter").addEventListener("change", function () {
            filters.category = this.value;
            filters.currentPage = 1;
            renderProductsTable();
        });

        document.getElementById("shopFilter").addEventListener("change", function () {
            filters.shopId = this.value;
            filters.currentPage = 1;
            renderProductsTable();
        });

        document.getElementById("productSearchInput").addEventListener("input", function () {
            filters.searchText = this.value.trim();
            filters.currentPage = 1;
            renderProductsTable();
        });

        document.getElementById("minPriceInput").addEventListener("input", function () {
            filters.minPrice = this.value.trim();
            filters.currentPage = 1;
            renderProductsTable();
        });

        document.getElementById("maxPriceInput").addEventListener("input", function () {
            filters.maxPrice = this.value.trim();
            filters.currentPage = 1;
            renderProductsTable();
        });

        document.getElementById("resetFiltersBtn").addEventListener("click", function () {
            resetAllFilters();
        });

        document.getElementById("prevPageBtn").addEventListener("click", function () {
            if (filters.currentPage > 1) {
                filters.currentPage--;
                renderProductsTable();
            }
        });

        document.getElementById("nextPageBtn").addEventListener("click", function () {
            var totalItems = getFilteredProducts().length;
            var totalPages = Math.max(1, Math.ceil(totalItems / filters.itemsPerPage));

            if (filters.currentPage < totalPages) {
                filters.currentPage++;
                renderProductsTable();
            }
        });

        document.getElementById("productsTableBody").addEventListener("click", function (event) {
            var actionButton = event.target.closest("button[data-action]");
            if (actionButton) {
                var productId = Number(actionButton.getAttribute("data-id"));
                var action = actionButton.getAttribute("data-action");

                filters.selectedProductId = productId;

                if (action === "view") {
                    openProductModal(productId);
                    return;
                }

                updateProductStatus(productId, action);
                return;
            }

            var clickedRow = event.target.closest("tr[data-id]");
            if (clickedRow) {
                filters.selectedProductId = Number(clickedRow.getAttribute("data-id"));
                highlightSelectedRow();
                renderPreview(Store.getProductById(filters.selectedProductId));
            }
        });

        document.getElementById("previewViewBtn").addEventListener("click", function () {
            if (filters.selectedProductId) {
                openProductModal(filters.selectedProductId);
            }
        });

        document.getElementById("previewRejectBtn").addEventListener("click", function () {
            if (!filters.selectedProductId) return;
            updateProductStatus(filters.selectedProductId, "rejected");
        });

        document.getElementById("previewApproveBtn").addEventListener("click", function () {
            if (!filters.selectedProductId) return;
            updateProductStatus(filters.selectedProductId, "approved");
        });

        document.getElementById("productModal").addEventListener("click", function (event) {
            if (event.target === this) {
                closeProductModal();
                return;
            }

            var modalActionButton = event.target.closest("button[data-modal-action]");
            if (!modalActionButton) return;

            var productId = Number(modalActionButton.getAttribute("data-id"));
            var action = modalActionButton.getAttribute("data-modal-action");

            updateProductStatus(productId, action);
            closeProductModal();
        });
    }



    ensureAdminFieldsExist();
    renderTopbarUser();
    bindEvents();
    renderEverything();

})();