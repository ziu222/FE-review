// ============================================================
// admin-common.js - Shared Admin Logic
// ============================================================
// Loaded on every admin page (except login)
// Handles: auth guard, sidebar, logout
// ============================================================

// -- Auth Guard -------------------------------------------------
// If not logged in or not admin, redirect to login

var currentUser = Store.getCurrentUser();
if (!currentUser || currentUser.role !== "admin") {
    window.location.href = "login.html";
}


// -- Logout -----------------------------------------------------

function handleLogout() {
    Store.logout();
    window.location.href = "login.html";
}
