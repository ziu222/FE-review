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

  const userBtn    = document.getElementById("userBtn");
  const userContent = document.getElementById("userContent");
  const userMenu   = document.getElementById("userMenu");

  if (!userBtn || !userContent) return;

  if (!user) {
    // Not logged in: person icon → login page
    userContent.innerHTML = '<span class="material-symbols-outlined">person</span>';
    if (userMenu) userMenu.classList.add("hidden");
    userBtn.onclick = () => { window.location.href = "login.html"; };
    return;
  }

  // Logged in: show initials avatar, click → profile (placeholder)
  const initial = (user.name || user.username || "U").charAt(0).toUpperCase();

  if (user.avatar) {
    userContent.innerHTML = `<img src="${user.avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" alt="${initial}" />`;
  } else {
    userContent.innerHTML = `<span style="
      display:inline-flex;align-items:center;justify-content:center;
      width:32px;height:32px;border-radius:50%;
      background:var(--primary-color);color:#fff;
      font-size:0.875rem;font-weight:700;font-family:inherit;
    ">${initial}</span>`;
  }

  // Hide old dropdown — profile page will handle account actions
  if (userMenu) userMenu.style.display = "none";

  userBtn.onclick = () => { window.location.href = "profile.html"; };
}

document.addEventListener("click", () => {
  const menu = document.getElementById("userMenu");
  if (menu) menu.classList.add("hidden");
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