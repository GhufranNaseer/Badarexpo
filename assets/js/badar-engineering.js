/* =============================================================================
   PAGE SCRIPT: BADAR ENGINEERING LEGACY (badar-engineering.js)
   Vanilla, dependency-free. Handles scroll reveals, statistic counters and the
   automation panel's meter fills. Fully respects prefers-reduced-motion.
   ============================================================================= */
(function () {
    "use strict";

    /* -------------------------------------------------------------------------
       FAQ ACCORDION
       Mirrors the site's existing FAQ behaviour (services.js SvcFaqManager):
       one item open at a time, max-height transition, aria-expanded kept in
       sync, and the first item pre-opened on load.
       ---------------------------------------------------------------------- */
    var FaqManager = {
        init: function () {
            var questions = document.querySelectorAll(".bec-faq-q");
            if (!questions.length) return;

            questions.forEach(function (q) {
                q.addEventListener("click", function () {
                    var item = q.closest(".bec-faq-item");
                    var answer = item.querySelector(".bec-faq-a");
                    var wasActive = item.classList.contains("active");

                    document.querySelectorAll(".bec-faq-item").forEach(function (i) {
                        i.classList.remove("active");
                        var a = i.querySelector(".bec-faq-a");
                        if (a) a.style.maxHeight = null;
                        var btn = i.querySelector(".bec-faq-q");
                        if (btn) btn.setAttribute("aria-expanded", "false");
                    });

                    if (!wasActive) {
                        item.classList.add("active");
                        if (answer) answer.style.maxHeight = answer.scrollHeight + "px";
                        q.setAttribute("aria-expanded", "true");
                    }
                });
            });

            function resize() {
                var open = document.querySelector(".bec-faq-item.active .bec-faq-a");
                if (open) open.style.maxHeight = open.scrollHeight + "px";
            }

            resize();

            // Re-measure once webfonts land and on resize, so a panel opened
            // before Inter/Font Awesome finish loading never ends up clipped.
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(resize);
            }
            window.addEventListener("resize", resize);
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { FaqManager.init(); });
    } else {
        FaqManager.init();
    }

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var reveals = document.querySelectorAll(".bec-reveal");
    var counters = document.querySelectorAll("[data-count-to]");
    var meters = document.querySelectorAll(".bec-meter span[data-fill]");

    function format(value, suffix) {
        return String(value) + (suffix || "");
    }

    function runCounter(el) {
        if (el.dataset.counted === "true") return;
        el.dataset.counted = "true";

        var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
        var suffix = el.getAttribute("data-count-suffix") || "";

        if (reduceMotion) {
            el.textContent = format(target, suffix);
            return;
        }

        var duration = 1100;
        var start = null;

        function step(ts) {
            if (start === null) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = format(Math.round(target * eased), suffix);
            if (progress < 1) window.requestAnimationFrame(step);
        }

        window.requestAnimationFrame(step);
    }

    function fillMeter(el) {
        if (el.dataset.filled === "true") return;
        el.dataset.filled = "true";
        el.style.width = (el.getAttribute("data-fill") || "0") + "%";
    }

    function activate(el) {
        el.classList.add("is-visible");
        el.querySelectorAll("[data-count-to]").forEach(runCounter);
        el.querySelectorAll(".bec-meter span[data-fill]").forEach(fillMeter);
    }

    if (!("IntersectionObserver" in window) || reduceMotion) {
        reveals.forEach(function (el) { el.classList.add("is-visible"); });
        counters.forEach(runCounter);
        meters.forEach(fillMeter);
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            activate(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (el) { observer.observe(el); });
})();
