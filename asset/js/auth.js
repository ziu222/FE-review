// Shared authentication/session helpers
var Auth = (function () {
    var CURRENT_USER_KEY = "ecshop_currentUser";

    function _readSession() {
        var raw = localStorage.getItem(CURRENT_USER_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function _writeSession(session) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session));
    }

    function authenticate(identifier, password) {
        if (typeof Store === "undefined") return null;

        var user = Store.getUserByEmail(identifier) || Store.getUserByUsername(identifier);
        if (!user) return null;
        if (user.password !== password) return null;

        var session = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        if (user.role === "shop") {
            session.shopName = user.shopName;
        }

        _writeSession(session);
        return session;
    }

    function getCurrentUser() {
        return _readSession();
    }

    function logout() {
        localStorage.removeItem(CURRENT_USER_KEY);
    }

    function requireRole(role, redirectPath) {
        var currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== role) {
            window.location.href = redirectPath || "admin-login.html";
            return false;
        }
        return true;
    }

    return {
        authenticate: authenticate,
        getCurrentUser: getCurrentUser,
        logout: logout,
        requireRole: requireRole
    };
})();
