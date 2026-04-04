// ===== LẤY DỮ LIỆU USER =====
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

// ===== LƯU USER =====
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
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
      window.location.href = "https://www.facebook.com/";
    } else {
      alert("Sai email hoặc mật khẩu!");
    }
  });
}