// core/auth.js — Auth dùng chung cho mọi role (Admin / Shop / Customer)
var Auth = (function () {

    var CURRENT_USER_KEY = "ecshop_currentUser";

    var ROLE_CONFIG = {
        admin: {
            loginPage: "admin/login.html"
        },
        shop: {
            loginPage:   "shop/login.html",
            waitingPage: "shop/waiting.html",
            blockedPage: "shop/suspended.html"
        },
        customer: {
            loginPage: "customer/login.html"
        }
    };

    // ── Private (internal) ───────────────────────────────────

    function _readSession() {
        try {
            var raw = localStorage.getItem(CURRENT_USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function _writeSession(session) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session));
    }

    // ── Public API ───────────────────────────────────────────

    // Đăng nhập — trả về { success, session } hoặc { error }
    function authenticate(identifier, password) {
        if (typeof Store === "undefined") return { error: "Store not available" };

        var user = Store.getUserByEmail(identifier) || Store.getUserByUsername(identifier);
        if (!user)                      return { error: "Tài khoản không tồn tại" };
        if (user.password !== password) return { error: "Mật khẩu không đúng" };

    // Shop: check shopStatus trước khi cho login
        if (user.role === "shop") {
            if (user.shopStatus === "pending")   return { error: "pending" };
            if (user.shopStatus === "suspended") return { error: "suspended" };
        }

        var session = {
            id:         user.id,
            username:   user.username,
            name:       user.name,
            email:      user.email,
            role:       user.role,
            adminLevel: user.adminLevel  || 1,
            shopId:     user.shopId      || null,
            shopStatus: user.shopStatus  || null,
            loginAt:    new Date().toISOString()
        };

        _writeSession(session);
        return { success: true, session: session };
    }

    // Lấy user hiện tại (current session)
    function getCurrentUser() {
        return _readSession();
    }

    // Đăng xuất + auto redirect về đúng login page theo role
    function logout(redirectPath) {
        var user = getCurrentUser();
        localStorage.removeItem(CURRENT_USER_KEY);

        if (redirectPath) {
            window.location.href = redirectPath;
            return;
        }

        if (user && ROLE_CONFIG[user.role]) {
            window.location.href = ROLE_CONFIG[user.role].loginPage;
            return;
        }

        window.location.href = "admin/login.html";
    }

    // Tầng 1 — Page guard (route protection)
    function requireRole(role, redirectPath) {
        var user = getCurrentUser();

        if (!user || user.role !== role) {
            var fallback = ROLE_CONFIG[role] ? ROLE_CONFIG[role].loginPage : "admin/login.html";
            window.location.href = redirectPath || fallback;
            return false;
        }

    // Shop: check thêm shopStatus mỗi lần load page (pending/suspended)
        if (role === "shop") {
            if (user.shopStatus === "pending") {
                window.location.href = ROLE_CONFIG.shop.waitingPage;
                return false;
            }
            if (user.shopStatus === "suspended") {
                window.location.href = ROLE_CONFIG.shop.blockedPage;
                return false;
            }
        }

        return true;
    }

    // Tầng 2 — Action guard (return true/false, caller tự xử lý UI)
    function requireLevel(minLevel) {
        var user = getCurrentUser();
        if (!user) return false;
        return (user.adminLevel || 1) >= minLevel;
    }

    function isSuperAdmin() {
        return requireLevel(2);
    }

    // Đăng ký customer — auto login sau khi tạo (better UX)
    function registerCustomer(data) {
        if (typeof Store === "undefined") return { error: "Store not available" };
        if (Store.getUserByEmail(data.email))       return { error: "Email đã được sử dụng" };
        if (Store.getUserByUsername(data.username)) return { error: "Username đã được sử dụng" };
        if (!data.password || data.password.length < 6) return { error: "Mật khẩu tối thiểu 6 ký tự" };

        Store.addUser({
            name:     data.name,
            email:    data.email,
            username: data.username,
            password: data.password,
            role:     "customer",
            status:   "active"
        });

        return authenticate(data.username, data.password);
    }

    // Đăng ký shop — KHÔNG auto login, chờ admin duyệt
    function registerShop(data) {
        if (typeof Store === "undefined") return { error: "Store not available" };
        if (Store.getUserByEmail(data.email))       return { error: "Email đã được sử dụng" };
        if (Store.getUserByUsername(data.username)) return { error: "Username đã được sử dụng" };
        if (!data.shopName)                         return { error: "Tên shop không được trống" };
        if (!data.password || data.password.length < 6) return { error: "Mật khẩu tối thiểu 6 ký tự" };

        Store.addUser({
            name:       data.name,
            email:      data.email,
            username:   data.username,
            password:   data.password,
            role:       "shop",
            shopName:   data.shopName,
            shopStatus: "pending"
        });

        return { success: true, pending: true };
    }

    // Tạo admin mới — chỉ Super Admin được gọi
    function createAdmin(data) {
        if (!isSuperAdmin()) return { error: "Không có quyền tạo admin" };
        if (typeof Store === "undefined") return { error: "Store not available" };
        if (Store.getUserByEmail(data.email))       return { error: "Email đã được sử dụng" };
        if (Store.getUserByUsername(data.username)) return { error: "Username đã được sử dụng" };
        if (!data.password || data.password.length < 6) return { error: "Mật khẩu tối thiểu 6 ký tự" };

        Store.addUser({
            name:       data.name,
            email:      data.email,
            username:   data.username,
            password:   data.password,
            role:       "admin",
            adminLevel: data.adminLevel || 1
        });

        return { success: true };
    }

    return {
        authenticate:     authenticate,
        getCurrentUser:   getCurrentUser,
        logout:           logout,
        requireRole:      requireRole,
        requireLevel:     requireLevel,
        isSuperAdmin:     isSuperAdmin,
        registerCustomer: registerCustomer,
        registerShop:     registerShop,
        createAdmin:      createAdmin
    };

})();
