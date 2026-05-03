// ===== Lấy dữ liệu User (LocalStorage) =====
function getUsers() {
  return JSON.parse(localStorage.getItem("ecshop_users")) || [];
}

// ===== User Session (phiên đăng nhập) =====
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("ecshop_currentUser"));
}

function renderUser() {
  const user = getCurrentUser();

  const userBtn     = document.getElementById("userBtn");
  const userContent = document.getElementById("userContent");
  const userMenu    = document.getElementById("userMenu");

  if (!userBtn || !userContent) return;

  if (!user) {
    userContent.innerHTML = '<span class="material-symbols-outlined">person</span>';
    if (userMenu) { userMenu.classList.add("hidden"); userMenu.style.display = ""; }
    userBtn.onclick = () => { window.location.href = "login.html"; };
    return;
  }

  const displayName = user.name || user.username || "User";
  const initial     = displayName.charAt(0).toUpperCase();

  const avatarHtml = user.avatar
    ? `<img src="${user.avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;" alt="${initial}" />`
    : `<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:var(--primary-color,#0f766e);color:#fff;font-size:0.875rem;font-weight:700;flex-shrink:0;">${initial}</span>`;

  userContent.innerHTML = `
    <span style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;">
      ${avatarHtml}
      <span style="font-size:0.875rem;font-weight:600;color:inherit;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${displayName}</span>
      <span class="material-symbols-outlined" style="font-size:1rem;opacity:0.7;">expand_more</span>
    </span>`;

  // Build dropdown
  if (userMenu) {
    userMenu.style.display = "";
    userMenu.innerHTML = `
      <div style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
        <div style="font-weight:700;font-size:0.9rem;">${displayName}</div>
        <div style="font-size:0.75rem;color:#6b7280;margin-top:2px;">${user.email || user.username}</div>
      </div>
      <button onclick="window.location.href='profile.html'"
        class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" style="background:none;border:none;cursor:pointer;">
        <span class="material-symbols-outlined" style="font-size:1rem;vertical-align:middle;margin-right:6px;">account_circle</span>Tài khoản
      </button>
      <button onclick="logout()"
        class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" style="background:none;border:none;cursor:pointer;color:#ef4444;">
        <span class="material-symbols-outlined" style="font-size:1rem;vertical-align:middle;margin-right:6px;">logout</span>Đăng xuất
      </button>`;
    userMenu.classList.add("hidden");
  }

  userBtn.onclick = (e) => {
    e.stopPropagation();
    const menu = document.getElementById("userMenu");
    if (menu) menu.classList.toggle("hidden");
  };
}

document.addEventListener("click", (e) => {
  const menu = document.getElementById("userMenu");
  const btn  = document.getElementById("userBtn");
  if (menu && btn && !btn.contains(e.target)) menu.classList.add("hidden");
});

function logout() {
  localStorage.removeItem("ecshop_currentUser");
  location.reload();
}

// ===== Điều hướng (navigation) =====
const signupTab = document.querySelector(".auth-links span:first-child");
const loginTab = document.querySelector(".auth-links span:last-child");

if (signupTab && loginTab) {
  signupTab.addEventListener("click", () => {
    window.location.href = "signup.html";
  });

  loginTab.addEventListener("click", () => {
    window.location.href = "login.html";
  });
}

// ===== Login flow =====
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const inputs = loginForm.querySelectorAll("input");

    const username = inputs[0].value.trim();
    const password = inputs[1].value.trim();

    let users = getUsers();
    console.log(users);

    const user = users.find(
      user => user.username === username && user.password === password
    );

    if (user) {
      alert("Đăng nhập thành công!");

      // Lưu session (save currentUser)
      localStorage.setItem("ecshop_currentUser", JSON.stringify(user));

      // Điều hướng sau login (redirect)
      window.location.href = "home.html";
    } else {
      alert("Sai tên hoặc mật khẩu!");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderUser();
});