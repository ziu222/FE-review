// ===== LẤY DỮ LIỆU USER =====
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

// ===== LƯU USER =====
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// ===== USER SESSION =====
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function renderUser() {
  const userBtn = document.getElementById("userBtn");
  const userContent = document.getElementById("userContent");
  if (!userBtn) return;

  const user = getCurrentUser();

  if (user) {
    userContent.textContent = user.firstName;
    userContent.classList.remove("material-symbols-outlined");
    userBtn.onclick = toggleMenu;
  } else {
    userContent.textContent = "person";
    userContent.classList.add("material-symbols-outlined");
    userBtn.onclick = () => {
      window.location.href = "login.html";
    };
  }
}

function toggleMenu() {
  const userBtn = document.getElementById("userBtn");
  let menu = document.getElementById("userMenu");

  if (menu) {
    menu.remove();
    return;
  }

  menu = document.createElement("div");
  menu.id = "userMenu";
  menu.className = "absolute right-0 mt-2 w-32 bg-white shadow rounded";

  menu.innerHTML = `
    <button onclick="logout()" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
      Đăng xuất
    </button>
  `;

  userBtn.appendChild(menu);
}
function logout() {
  localStorage.removeItem("currentUser");
  location.reload();
}

// ===== CHUYỂN TRANG =====
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

// ===== SIGN UP =====
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const inputs = signupForm.querySelectorAll("input");

    const firstName = inputs[0].value.trim();
    const lastName = inputs[1].value.trim();
    const email = inputs[2].value.trim();
    const password = inputs[3].value.trim();

    let users = getUsers();

    // kiểm tra email tồn tại
    const userExists = users.find(user => user.email === email);
    if (userExists) {
      alert("Email đã tồn tại!");
      return;
    }

    // tạo user mới
    const newUser = {
      firstName,
      lastName,
      email,
      password
    };

    users.push(newUser);
    saveUsers(users);

    alert("Đăng ký thành công!");

    // chuyển sang login
    window.location.href = "login.html";
  });
}

// ===== LOGIN =====
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const inputs = loginForm.querySelectorAll("input");

    const email = inputs[0].value.trim();
    const password = inputs[1].value.trim();

    let users = getUsers();

    const user = users.find(
      user => user.email === email && user.password === password
    );

    if (user) {
      alert("Đăng nhập thành công!");

      // lưu session
      localStorage.setItem("currentUser", JSON.stringify(user));

      // chuyển trang (bạn có thể đổi)
      window.location.href = "home.html";
    } else {
      alert("Sai email hoặc mật khẩu!");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderUser();
});