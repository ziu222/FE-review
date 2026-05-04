/* about.js — Cinematic scroll animation for EC SHOP About page */
(function () {
    'use strict';

    /* ── Intersection Observer — data-anim reveal ──────────────── */
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
        });
    }, { threshold: 0.15 });

    /* ── Stats observer — triggers counters at 30% visibility ──── */
    var statsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.querySelectorAll('[data-count]').forEach(function (el) {
                if (el.getAttribute('data-count-started') === '1') return;
                var delay = parseInt(
                    (el.closest('[data-delay]') || el).getAttribute('data-delay') || '1', 10
                );
                setTimeout(function () { animateCounter(el); }, (delay - 1) * 150);
            });
            statsObserver.unobserve(entry.target);
        });
    }, { threshold: 0.30 });

    /* ── Counter animation — easeOut cubic, 1500ms ─────────────── */
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function animateCounter(el) {
        el.setAttribute('data-count-started', '1');
        var target   = parseInt(el.getAttribute('data-count'), 10);
        var duration = 1500;
        var startTime = null;

        function step(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            el.textContent = Math.round(easeOut(progress) * target).toLocaleString('en-US');
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString('en-US');
        }
        requestAnimationFrame(step);
    }

    /* ── Init ───────────────────────────────────────────────────── */
    function init() {
        document.querySelectorAll('[data-anim]').forEach(function (el) {
            io.observe(el);
        });
        var statsSection = document.getElementById('about-stats');
        if (statsSection) statsObserver.observe(statsSection);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
