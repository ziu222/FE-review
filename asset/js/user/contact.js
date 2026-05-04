var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
    });
}, { threshold: 0.15 });
document.querySelectorAll('[data-anim]').forEach(function (el) { io.observe(el); });

document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var toast = document.getElementById('contactToast');
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 3000);
    e.target.reset();
});
