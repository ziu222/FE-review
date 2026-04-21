// admin-common.js — Page guard + logout for all protected admin pages
// Loaded as the 3rd script (after storage.js + auth.js) on every admin page
// Login pages MUST NOT load this file

(function () {
    // Tầng 1: guard — chạy trước khi DOM parse
    Auth.requireRole("admin", "admin-login.html");

    document.addEventListener("DOMContentLoaded", function () {

        // Bind logout button — không dùng onclick="" trong HTML
        var logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                Auth.logout("admin-login.html");
            });
        }

        // Hiện tên + avatar của admin đang login
        var user = Auth.getCurrentUser();
        var topbarName   = document.getElementById("topbarUserName");
        var topbarAvatar = document.getElementById("topbarAvatar");

        if (user) {
            if (topbarName)   topbarName.textContent   = user.name || user.username || "Admin";
            if (topbarAvatar) topbarAvatar.textContent = (user.name || user.username || "A").charAt(0).toUpperCase();
        }

        // Ẩn/hiện các element theo permission level
        var isSuperAdmin  = Auth.isSuperAdmin();
        var level2Els     = document.querySelectorAll("[data-permission='level2']");
        for (var i = 0; i < level2Els.length; i++) {
            level2Els[i].style.display = isSuperAdmin ? "" : "none";
        }
    });
})();
