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
    userBtn.classList.remove("user-btn--logged-in");
    userContent.innerHTML = '<span class="material-symbols-outlined">person</span>';
    if (userMenu) { userMenu.classList.add("hidden"); userMenu.style.display = ""; }
    userBtn.onclick = () => { window.location.href = "login.html"; };
    return;
  }

  const displayName = user.name || user.username || "User";
  const initial     = displayName.charAt(0).toUpperCase();

  const avatarInner = user.avatar
    ? `<img src="${user.avatar}" alt="${initial}" />`
    : initial;

  userBtn.classList.add("user-btn--logged-in");
  userContent.innerHTML = `
    <span class="user-avatar">${avatarInner}</span>
    <span class="user-display-name">${displayName}</span>
    <span class="material-symbols-outlined" style="font-size:1rem;opacity:0.55;flex-shrink:0;transition:transform 0.2s;" id="userChevron">expand_more</span>`;

  if (userMenu) {
    userMenu.style.display = "";
    userMenu.innerHTML = `
      <div class="udm-profile">
        <div class="udm-avatar-wrap">
          <div class="udm-big-avatar">${avatarInner}</div>
          <span class="udm-online"></span>
        </div>
        <div class="udm-info">
          <div class="udm-name">${displayName}</div>
          <div class="udm-email">${user.email || user.username || ""}</div>
        </div>
      </div>
      <div class="udm-divider"></div>
      <button class="udm-item" onclick="window.location.href='profile.html'">
        <span class="material-symbols-outlined udm-icon">account_circle</span>
        View Profile
      </button>
      <button class="udm-item" onclick="window.location.href='cart.html'">
        <span class="material-symbols-outlined udm-icon">shopping_cart</span>
        My Cart
      </button>
      <div class="udm-divider"></div>
      <button class="udm-item udm-item--danger" onclick="logout()">
        <span class="material-symbols-outlined udm-icon">logout</span>
        Sign Out
      </button>`;
    userMenu.classList.add("hidden");
  }

  userBtn.onclick = (e) => {
    e.stopPropagation();
    const menu     = document.getElementById("userMenu");
    const chevron  = document.getElementById("userChevron");
    if (!menu) return;
    const isOpen = menu.classList.toggle("hidden") === false;
    if (chevron) chevron.style.transform = isOpen ? "rotate(180deg)" : "rotate(0deg)";
  };
}

document.addEventListener("click", (e) => {
  const menu    = document.getElementById("userMenu");
  const btn     = document.getElementById("userBtn");
  const chevron = document.getElementById("userChevron");
  if (menu && btn && !btn.contains(e.target)) {
    menu.classList.add("hidden");
    if (chevron) chevron.style.transform = "rotate(0deg)";
  }
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