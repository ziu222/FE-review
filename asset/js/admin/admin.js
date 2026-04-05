

var currentUser = Auth.getCurrentUser();
if (!currentUser || currentUser.role !== "admin") {
    window.location.href = "admin-login.html";
}


//Log out btn

function handleLogout() {
    Auth.logout();
    window.location.href = "admin-login.html";
}
