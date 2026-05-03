// ===== Lấy dữ liệu User (LocalStorage) =====
function getUsers() {
  return JSON.parse(localStorage.getItem("ecshop_users")) || [];
}

// ===== Lưu User (persist) =====
function saveUsers(users) {
  localStorage.setItem("ecshop_users", JSON.stringify(users));
}
// ===== Sign up flow =====

const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const inputs = signupForm.querySelectorAll("input");

    const userName = inputs[0].value.trim();
    const loginName = inputs[1].value.trim();
    const email = inputs[2].value.trim();
    const password = inputs[3].value.trim();

    let users = getUsers();
    // Kiểm tra email đã tồn tại (duplicate check)
    const userExists = users.find(user => user.email === email);
    if (userExists) {
      alert("Email đã tồn tại!");
      return;
    }
console.log(4);
    const newUser = {
      id: users.length > 0
        ? Math.max(...users.map(u => u.id)) + 1
        : 1,
      name: userName,
      username: loginName,
      email: email,
      password: password,
      role: "customer",
      avatar: "",
      createdAt: new Date().toISOString().split("T")[0]
    };

    users.push(newUser);
    saveUsers(users);
    alert("Đăng ký thành công!");

    // Điều hướng sang trang login (redirect)
    window.location.href = "login.html";
  });
}