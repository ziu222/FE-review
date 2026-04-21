// admin-users.js — Users Management Page Logic

Store.seed();

(function () {

    // ── Tab switching ────────────────────────────────────────
    var tabBtns   = document.querySelectorAll(".tab-btn");
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
        });
    }

    // ── Helpers ──────────────────────────────────────────────
    function esc(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function formatDate(dateStr) {
        if (!dateStr) return "—";
        var d = new Date(dateStr);
        return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-GB");
    }

    // ── Data helpers ─────────────────────────────────────────
    function getAllUsers() {
        return Store.getUsers ? Store.getUsers() : (Store.users || []);
    }

    // ── Render Tab 1: Customers ──────────────────────────────
    function renderCustomers() {
        var users     = getAllUsers().filter(function (u) { return u.role === "customer" && u.status !== "banned" && u.status !== "suspended"; });
        var tbody     = document.getElementById("bodyCustomers");
        var emptyMsg  = document.getElementById("emptyCustomers");
        var countEl   = document.getElementById("countCustomers");

        countEl.textContent = users.length;
        tbody.innerHTML = "";

        if (!users.length) { emptyMsg.style.display = ""; return; }
        emptyMsg.style.display = "none";

        users.forEach(function (u, idx) {
            var tr = document.createElement("tr");
            tr.innerHTML =
                "<td>" + (idx + 1) + "</td>" +
                "<td>" + esc(u.name) + "</td>" +
                "<td>" + esc(u.username) + "</td>" +
                "<td>" + esc(u.email) + "</td>" +
                "<td><span class='badge badge-active'>Active</span></td>" +
                "<td>" + formatDate(u.createdAt) + "</td>";
            tbody.appendChild(tr);
        });
    }

    // ── Render Tab 2: Admins ─────────────────────────────────
    function renderAdmins() {
        var users    = getAllUsers().filter(function (u) { return u.role === "admin"; });
        var tbody    = document.getElementById("bodyAdmins");
        var emptyMsg = document.getElementById("emptyAdmins");
        var countEl  = document.getElementById("countAdmins");

        countEl.textContent = users.length;
        tbody.innerHTML = "";

        if (!users.length) { emptyMsg.style.display = ""; return; }
        emptyMsg.style.display = "none";

        users.forEach(function (u, idx) {
            var levelLabel = u.adminLevel === 2 ? "<span class='badge badge-level2'>Super Admin</span>" : "<span class='badge badge-level1'>Staff</span>";
            var tr = document.createElement("tr");
            tr.innerHTML =
                "<td>" + (idx + 1) + "</td>" +
                "<td>" + esc(u.name) + "</td>" +
                "<td>" + esc(u.username) + "</td>" +
                "<td>" + esc(u.email) + "</td>" +
                "<td>" + levelLabel + "</td>" +
                "<td>" + formatDate(u.createdAt) + "</td>";
            tbody.appendChild(tr);
        });
    }

    // ── Render Tab 3: Banned ─────────────────────────────────
    function renderBanned() {
        var users    = getAllUsers().filter(function (u) { return u.status === "banned" || u.status === "suspended" || u.shopStatus === "suspended"; });
        var tbody    = document.getElementById("bodyBanned");
        var emptyMsg = document.getElementById("emptyBanned");
        var countEl  = document.getElementById("countBanned");

        countEl.textContent = users.length;
        tbody.innerHTML = "";

        if (!users.length) { emptyMsg.style.display = ""; return; }
        emptyMsg.style.display = "none";

        users.forEach(function (u, idx) {
            var statusLabel = "<span class='badge badge-banned'>" + esc(u.status || u.shopStatus) + "</span>";
            var tr = document.createElement("tr");
            tr.innerHTML =
                "<td>" + (idx + 1) + "</td>" +
                "<td>" + esc(u.name) + "</td>" +
                "<td>" + esc(u.role) + "</td>" +
                "<td>" + esc(u.email) + "</td>" +
                "<td>" + statusLabel + "</td>";
            tbody.appendChild(tr);
        });
    }

    // ── Create Admin Modal ───────────────────────────────────
    var modal          = document.getElementById("createAdminModal");
    var btnOpen        = document.getElementById("btnCreateAdmin");
    var btnCancel      = document.getElementById("btnCancelCreateAdmin");
    var btnSubmit      = document.getElementById("btnSubmitCreateAdmin");
    var errorEl        = document.getElementById("createAdminError");

    function openModal() {
        document.getElementById("caName").value     = "";
        document.getElementById("caEmail").value    = "";
        document.getElementById("caUsername").value = "";
        document.getElementById("caPassword").value = "";
        document.getElementById("caLevel").value    = "1";
        errorEl.textContent = "";
        errorEl.classList.remove("show");
        modal.classList.add("show");
    }

    function closeModal() {
        modal.classList.remove("show");
    }

    if (btnOpen)   btnOpen.addEventListener("click", openModal);
    if (btnCancel) btnCancel.addEventListener("click", closeModal);

    modal.addEventListener("click", function (e) {
        if (e.target === modal) closeModal();
    });

    if (btnSubmit) {
        btnSubmit.addEventListener("click", function () {
            errorEl.classList.remove("show");

            var data = {
                name:       document.getElementById("caName").value.trim(),
                email:      document.getElementById("caEmail").value.trim(),
                username:   document.getElementById("caUsername").value.trim(),
                password:   document.getElementById("caPassword").value,
                adminLevel: parseInt(document.getElementById("caLevel").value, 10)
            };

            if (!data.name || !data.email || !data.username || !data.password) {
                errorEl.textContent = "All fields are required.";
                errorEl.classList.add("show");
                return;
            }

            var result = Auth.createAdmin(data);

            if (result.error) {
                errorEl.textContent = result.error;
                errorEl.classList.add("show");
                return;
            }

            closeModal();
            renderAdmins();
        });
    }

    // ── Init ─────────────────────────────────────────────────
    renderCustomers();
    renderAdmins();
    renderBanned();

})();
