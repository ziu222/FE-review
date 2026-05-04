// wallet.js — EC SHOP Wallet Page

(function () {

    var selectedAmount  = 0;
    var selectedGateway = "";
    var selectedLabel   = "";

    // ── Helpers ───────────────────────────────────────────────

    function fmt(n) {
        return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function fmtDate(iso) {
        var d = new Date(iso);
        return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
             + " " + d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    }

    function showToast(msg) {
        var toast   = document.getElementById("walletToast");
        var msgEl   = document.getElementById("toastMsg");
        if (!toast) return;
        if (msgEl) msgEl.textContent = msg;
        toast.classList.add("show");
        setTimeout(function () { toast.classList.remove("show"); }, 2800);
    }

    function showStep(n) {
        document.querySelectorAll(".deposit-step").forEach(function (el) {
            el.classList.remove("active");
        });
        var step = document.getElementById("step" + n);
        if (step) step.classList.add("active");
    }

    // ── Render ────────────────────────────────────────────────

    function renderBalance() {
        var user = getCurrentUser();
        if (!user) return;
        var bal = Store.getWalletBalance(user.id);
        var display = fmt(bal);

        var heroEl    = document.getElementById("heroBalance");
        var balanceEl = document.getElementById("walletBalance");
        if (heroEl)    heroEl.textContent    = display;
        if (balanceEl) balanceEl.textContent = display;
    }

    function renderHistory() {
        var user = getCurrentUser();
        if (!user) return;
        var txs  = Store.getWalletTransactions(user.id);
        var list = document.getElementById("txList");
        if (!list) return;

        if (!txs || txs.length === 0) {
            list.innerHTML = '<div class="tx-empty"><i class="fa-solid fa-clock-rotate-left"></i>No transactions yet</div>';
            return;
        }

        // Newest first
        var sorted = txs.slice().sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        list.innerHTML = sorted.map(function (tx) {
            var isCredit  = tx.type === "deposit" || tx.type === "refund";
            var iconClass = tx.type === "refund" ? "refund" : (isCredit ? "credit" : "debit");
            var icon      = tx.type === "deposit" ? "fa-arrow-down"
                          : tx.type === "refund"  ? "fa-rotate-left"
                          : "fa-arrow-up";
            var amtSign   = isCredit ? "+" : "-";
            var amtClass  = tx.type === "refund" ? "refund" : (isCredit ? "credit" : "debit");

            return '<div class="tx-item">' +
                '<div class="tx-icon ' + iconClass + '">' +
                    '<i class="fa-solid ' + icon + '"></i>' +
                '</div>' +
                '<div class="tx-meta">' +
                    '<div class="tx-desc">' + tx.description + '</div>' +
                    '<div class="tx-date">' + fmtDate(tx.date) + '</div>' +
                '</div>' +
                '<div class="tx-amount ' + amtClass + '">' + amtSign + fmt(tx.amount) + '</div>' +
            '</div>';
        }).join("");
    }

    // ── Preset buttons ────────────────────────────────────────

    function setupPresets() {
        var presets = document.querySelectorAll(".preset-btn");
        var input   = document.getElementById("topupAmount");

        presets.forEach(function (btn) {
            btn.addEventListener("click", function () {
                presets.forEach(function (b) { b.classList.remove("active"); });
                btn.classList.add("active");
                selectedAmount = Number(btn.dataset.amount);
                if (input) {
                    input.value = selectedAmount;
                    input.classList.remove("error");
                }
            });
        });

        if (input) {
            input.addEventListener("input", function () {
                presets.forEach(function (b) { b.classList.remove("active"); });
                selectedAmount = Number(input.value) || 0;
                input.classList.remove("error");
                // Re-highlight matching preset
                presets.forEach(function (b) {
                    if (Number(b.dataset.amount) === selectedAmount) b.classList.add("active");
                });
            });
        }
    }

    // ── Step navigation ───────────────────────────────────────

    function setupNavigation() {
        // Next button (Step 1 → 2)
        var btnNext = document.getElementById("btnNext");
        if (btnNext) {
            btnNext.addEventListener("click", function () {
                var input = document.getElementById("topupAmount");
                selectedAmount = Number(input ? input.value : 0);

                if (!selectedAmount || selectedAmount <= 0) {
                    if (input) input.classList.add("error");
                    return;
                }

                var displayEl = document.getElementById("displayAmount");
                if (displayEl) displayEl.textContent = fmt(selectedAmount);
                showStep(2);
            });
        }

        // Gateway cards (Step 2 → 3)
        document.querySelectorAll(".gateway-card").forEach(function (card) {
            card.addEventListener("click", function () {
                selectedGateway = card.dataset.gw;
                selectedLabel   = card.dataset.label || card.dataset.gw;

                var header = document.getElementById("qrGwHeader");
                if (header) {
                    header.textContent  = selectedLabel;
                    header.className    = "qr-gw-header " + selectedGateway;
                }

                var qrAmt = document.getElementById("qrAmount");
                if (qrAmt) qrAmt.textContent = fmt(selectedAmount);

                showStep(3);
            });
        });

        // Back (Step 2 → 1)
        var back1 = document.getElementById("back1");
        if (back1) back1.addEventListener("click", function () { showStep(1); });

        // Cancel (Step 3 → 1)
        var cancelBtn = document.getElementById("btnCancelPay");
        if (cancelBtn) cancelBtn.addEventListener("click", function () { resetDeposit(); });
    }

    // ── Confirm payment ───────────────────────────────────────

    function setupConfirm() {
        var btnConfirm = document.getElementById("btnConfirm");
        if (!btnConfirm) return;

        btnConfirm.addEventListener("click", function () {
            var user = getCurrentUser();
            if (!user) return;

            var desc = "Nạp tiền qua " + selectedLabel;
            Store.topUpWallet(user.id, selectedAmount, desc);

            // Refresh UI
            renderBalance();
            renderHistory();
            resetDeposit();

            showToast("Nạp " + fmt(selectedAmount) + " thành công!");
        });
    }

    function resetDeposit() {
        selectedAmount  = 0;
        selectedGateway = "";
        selectedLabel   = "";

        var input = document.getElementById("topupAmount");
        if (input) { input.value = ""; input.classList.remove("error"); }

        document.querySelectorAll(".preset-btn").forEach(function (b) {
            b.classList.remove("active");
        });

        showStep(1);
    }

    // ── Hero "Add Money" scroll ────────────────────────────────

    function setupHeroBtn() {
        var btn = document.getElementById("heroAddBtn");
        if (!btn) return;
        btn.addEventListener("click", function () {
            var card = document.getElementById("depositCard");
            if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    // ── Init ──────────────────────────────────────────────────

    document.addEventListener("DOMContentLoaded", function () {
        var user = getCurrentUser();
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        Store.seed();
        renderBalance();
        renderHistory();
        setupPresets();
        setupNavigation();
        setupConfirm();
        setupHeroBtn();
    });

})();
