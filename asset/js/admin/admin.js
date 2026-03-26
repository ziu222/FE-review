

var currentUser = Store.getCurrentUser();
if (!currentUser || currentUser.role !== "admin") {
    window.location.href = "admin-login.html";
}


//Log out btn

function handleLogout() {
    Store.logout();
    window.location.href = "admin-login.html";
}
