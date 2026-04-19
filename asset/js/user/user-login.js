// ===== LẤY DỮ LIỆU USER =====
function getUsers() {
  return JSON.parse(localStorage.getItem("ecshop_users")) || [];
}

// ===== USER SESSION =====
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function renderUser() {
  const user = getCurrentUser();

  const userBtn = document.getElementById("userBtn");
  const userContent = document.getElementById("userContent");
  const userMenu = document.getElementById("userMenu");

  if (!userBtn || !userContent || !userMenu) return;
  userMenu.classList.add("hidden");

  if (!user) {
    userContent.textContent = "person";
    userContent.classList.add("material-symbols-outlined");

    userBtn.onclick = () => {
      window.location.href = "login.html";
    };

    return;
  }

  userBtn.onclick = (e) => {
    e.stopPropagation();
    userMenu.classList.toggle("hidden");
  };

  
  if (user.avatar) {
    userContent.innerHTML = "";

    const img = document.createElement("img");
    img.src = user.avatar;
    img.className = "w-8 h-8 rounded-full object-cover";

    userContent.appendChild(img);
    userContent.classList.remove("material-symbols-outlined");
  } else {
    userContent.textContent = "person";
    userContent.classList.add("material-symbols-outlined");
  }
}

document.addEventListener("click", () => {
  const menu = document.getElementById("userMenu");
  if (menu) menu.classList.add("hidden");
});

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

// ===== LOGIN =====
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

      // lưu session
      localStorage.setItem("currentUser", JSON.stringify(user));

      // chuyển trang (bạn có thể đổi)
      window.location.href = "home.html";
    } else {
      alert("Sai tên hoặc mật khẩu!");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderUser();
});