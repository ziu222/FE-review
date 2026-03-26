// ============================================================
// admin-login.js - Admin Login Page Logic


var currentUser = Store.getCurrentUser();
if (currentUser && currentUser.role === "admin") {
    window.location.href = "dashboard.html";
}




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


// login submit
var loginForm = document.getElementById("loginForm");
var loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var identifier = document.getElementById("identifier").value.trim();
    var password = document.getElementById("password").value;

    // Hide previous error
    loginError.classList.remove("show");


    var session = Store.authenticate(identifier, password);

    if (!session) {
        loginError.textContent = "Wrong username/email or password. Please try again.";
        loginError.classList.add("show");
        return;
    }

    if (session.role !== "admin") {
        Store.logout();
        loginError.textContent = "You do not have admin access.";
        loginError.classList.add("show");
        return;
    }

    // direct to dashboard
    window.location.href = "dashboard.html";
});
