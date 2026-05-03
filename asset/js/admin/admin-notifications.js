// admin-notifications.js — Quản lý Notifications (Manual send + History)

Store.seed();

(function () {

    // ── Tab switching (chuyển tab) ───────────────────────────
    var tabBtns   = document.querySelectorAll(".filter-tab[data-tab]");
    var tabPanels = document.querySelectorAll(".tab-panel");

    for (var i = 0; i < tabBtns.length; i++) {
        tabBtns[i].addEventListener("click", function () {
            var target = this.dataset.tab;
            for (var j = 0; j < tabBtns.length; j++) {
                tabBtns[j].classList.remove("active");
                tabPanels[j].classList.remove("active");
            }
            this.classList.add("active");
            document.getElementById("panel-" + target).classList.add("active");
            if (target === "history") renderHistory();
        });
    }

    // ── Helpers (tiện ích) ───────────────────────────────────
    function formatDate(iso) {
        if (!iso) return "—";
        var d = new Date(iso);
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
            " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    }

    function showToast(msg) {
        var el = document.getElementById("toastMsg");
        el.textContent = msg;
        el.classList.add("show");
        setTimeout(function () { el.classList.remove("show"); }, 3000);
    }

    function showError(id, msg) {
        var el = document.getElementById(id);
        el.textContent = msg;
        el.classList.add("show");
    }

    function clearError(id) {
        var el = document.getElementById(id);
        el.textContent = "";
        el.classList.remove("show");
    }

    // ── Populate specific recipient lists (list người nhận cụ thể) ──
    function populateSpecificList(listId, role) {
        var select = document.getElementById(listId);
        select.innerHTML = "";
        var users = Store.getUsers().filter(function (u) {
            return u.role === role && u.status !== "banned";
        });
        users.forEach(function (u) {
            var opt = document.createElement("option");
            opt.value = u.id;
            opt.textContent = (u.name || u.username) + " (" + u.email + ")";
            select.appendChild(opt);
        });
    }

    populateSpecificList("cSpecificList", "customer");
    populateSpecificList("sSpecificList", "shop");

    // ── Recipient toggle ─────────────────────────────────────
    document.getElementById("cRecipient").addEventListener("change", function () {
        document.getElementById("cSpecificWrap").style.display =
            this.value === "specific" ? "" : "none";
    });
    document.getElementById("sRecipient").addEventListener("change", function () {
        document.getElementById("sSpecificWrap").style.display =
            this.value === "specific" ? "" : "none";
    });

    // ── Send logic 
    function sendNotification(config) {
        // config: { recipientSelectId, specificListId, typeId, titleId, messageId, errorId, targetRole }
        clearError(config.errorId);

        var recipient = document.getElementById(config.recipientSelectId).value;
        var type      = document.getElementById(config.typeId).value;
        var title     = document.getElementById(config.titleId).value.trim();
        var message   = document.getElementById(config.messageId).value.trim();

        if (!title) {
            showError(config.errorId, "Title is required.");
            return;
        }
        if (!message) {
            showError(config.errorId, "Message is required.");
            return;
        }

        var batchId = "batch_" + Date.now();
        var sentBy  = Auth.getCurrentUser() ? Auth.getCurrentUser().username : "admin";
        var count   = 0;

        if (recipient === "all") {
            Store.addNotification({
                targetRole: config.targetRole,
                targetId:   "all",
                type:       type,
                title:      title,
                message:    message,
                sentBy:     sentBy,
                source:     "manual",
                batchId:    batchId
            });
            count = 1;
        } else {
            var select = document.getElementById(config.specificListId);
            var selected = Array.prototype.filter.call(select.options, function (o) { return o.selected; });
            if (!selected.length) {
                showError(config.errorId, "Please select at least one recipient.");
                return;
            }
            selected.forEach(function (opt) {
                Store.addNotification({
                    targetRole: config.targetRole,
                    targetId:   parseInt(opt.value, 10),
                    type:       type,
                    title:      title,
                    message:    message,
                    sentBy:     sentBy,
                    source:     "manual",
                    batchId:    batchId
                });
            });
            count = selected.length;
        }

        // Reset form
        document.getElementById(config.recipientSelectId).value = "all";
        document.getElementById(config.specificListId).selectedIndex = -1;
        document.getElementById(config.typeId).value = "info";
        document.getElementById(config.titleId).value = "";
        document.getElementById(config.messageId).value = "";
        document.getElementById(config.specificListId).closest
            && (document.getElementById(config.specificListId).parentElement.style.display = "none");

        showToast("Sent successfully to " + (recipient === "all" ? "all " + config.targetRole + "s" : count + " recipient" + (count > 1 ? "s" : "")) + ".");
    }

    document.getElementById("cSendBtn").addEventListener("click", function () {
        sendNotification({
            recipientSelectId: "cRecipient",
            specificListId:    "cSpecificList",
            typeId:            "cType",
            titleId:           "cTitle",
            messageId:         "cMessage",
            errorId:           "cError",
            targetRole:        "customer"
        });
    });

    document.getElementById("sSendBtn").addEventListener("click", function () {
        sendNotification({
            recipientSelectId: "sRecipient",
            specificListId:    "sSpecificList",
            typeId:            "sType",
            titleId:           "sTitle",
            messageId:         "sMessage",
            errorId:           "sError",
            targetRole:        "shop"
        });
    });

    // ── History
    var histRoleFilter = document.getElementById("histRoleFilter");
    var histTypeFilter = document.getElementById("histTypeFilter");
    var histDateFrom   = document.getElementById("histDateFrom");
    var histDateTo     = document.getElementById("histDateTo");

    document.getElementById("histResetBtn").addEventListener("click", function () {
        histRoleFilter.value = "all";
        histTypeFilter.value = "all";
        histDateFrom.value   = "";
        histDateTo.value     = "";
        renderHistory();
    });

    [histRoleFilter, histTypeFilter, histDateFrom, histDateTo].forEach(function (el) {
        el.addEventListener("change", renderHistory);
    });

    function renderHistory() {
        var tbody = document.getElementById("historyBody");
        var empty = document.getElementById("historyEmpty");
        var role  = histRoleFilter.value;
        var type  = histTypeFilter.value;
        var from  = histDateFrom.value ? new Date(histDateFrom.value) : null;
        var to    = histDateTo.value   ? new Date(histDateTo.value + "T23:59:59") : null;

        // Only show manual notifications, group by batchId
        var all = Store.getNotifications().filter(function (n) { return n.source === "manual"; });

        // Apply filters on raw records before grouping
        if (role !== "all") all = all.filter(function (n) { return n.targetRole === role; });
        if (type !== "all") all = all.filter(function (n) { return n.type === type; });
        if (from) all = all.filter(function (n) { return new Date(n.createdAt) >= from; });
        if (to)   all = all.filter(function (n) { return new Date(n.createdAt) <= to; });

        // Group by batchId — keep one representative record per batch
        var seen  = {};
        var batches = [];
        all.forEach(function (n) {
            var key = n.batchId || ("solo_" + n.id);
            if (!seen[key]) {
                seen[key] = { rep: n, count: 0, hasAll: false };
                batches.push(seen[key]);
            }
            seen[key].count++;
            if (n.targetId === "all") seen[key].hasAll = true;
        });

        tbody.innerHTML = "";
        if (!batches.length) {
            empty.style.display = "";
            return;
        }
        empty.style.display = "none";

        var typeBadge = { info: "badge-info", promo: "badge-promo", warning: "badge-warning" };

        batches.forEach(function (b, idx) {
            var n    = b.rep;
            var recipients = b.hasAll
                ? "All " + n.targetRole + "s"
                : b.count + " user" + (b.count > 1 ? "s" : "");
            var badgeClass = typeBadge[n.type] || "badge-info";
            var tr = document.createElement("tr");
            tr.innerHTML =
                "<td>" + (idx + 1) + "</td>" +
                "<td>" + escHtml(n.title) + "</td>" +
                "<td><span class='badge " + badgeClass + "'>" + escHtml(n.type) + "</span></td>" +
                "<td><span class='badge badge-level1'>" + escHtml(n.targetRole) + "</span></td>" +
                "<td>" + escHtml(recipients) + "</td>" +
                "<td>" + escHtml(n.sentBy || "admin") + "</td>" +
                "<td>" + formatDate(n.createdAt) + "</td>";
            tbody.appendChild(tr);
        });
    }

    function escHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

})();
