// ============================================================
// admin-login.js - Admin Login Page Logic
// ============================================================
// Depends on: storage.js
// ============================================================

// If already logged in as admin, go to dashboard
var currentUser = Store.getCurrentUser();
if (currentUser && currentUser.role === "admin") {
    window.location.href = "dashboard.html";
}


// -- Toggle password visibility ---------------------------------

var toggleBtn = document.getElementById("togglePassword");
var passwordInput = document.getElementById("password");

toggleBtn.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleBtn.textContent = "Hide";
    } else {
        passwordInput.type = "password";
        toggleBtn.textContent = "Show";
    }
});


// -- Handle login form submit -----------------------------------

var loginForm = document.getElementById("loginForm");
var loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;

    // Hide previous error
    loginError.classList.remove("show");

    // Try to authenticate
    var session = Store.authenticate(email, password);

    if (!session) {
        loginError.textContent = "Wrong email or password. Please try again.";
        loginError.classList.add("show");
        return;
    }

    if (session.role !== "admin") {
        Store.logout();
        loginError.textContent = "You do not have admin access.";
        loginError.classList.add("show");
        return;
    }

    // Login success — redirect to dashboard
    window.location.href = "dashboard.html";
});
