/* =============================================================================
   PAGE SCRIPT: OUR LEADERS & EXECUTIVES (leaders.js)
   Vanilla, dependency-free. Handles scroll reveals + statistic counters.
   Fully respects prefers-reduced-motion.
   ============================================================================= */
(function () {
    "use strict";

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var reveals = document.querySelectorAll(".ldr-reveal");
    var counters = document.querySelectorAll("[data-count-to]");

    function format(value, thousands, suffix) {
        var out = thousands ? value.toLocaleString("en-US") : String(value);
        return out + (suffix || "");
    }

    function runCounter(el) {
        if (el.dataset.counted === "true") return;
        el.dataset.counted = "true";

        var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
        var suffix = el.getAttribute("data-count-suffix") || "";
        var thousands = el.getAttribute("data-count-thousands") === "true";

        if (reduceMotion) {
            el.textContent = format(target, thousands, suffix);
            return;
        }

        var duration = 1100;
        var start = null;

        function step(ts) {
            if (start === null) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = format(Math.round(target * eased), thousands, suffix);
            if (progress < 1) window.requestAnimationFrame(step);
        }

        window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window) || reduceMotion) {
        reveals.forEach(function (el) { el.classList.add("is-visible"); });
        counters.forEach(runCounter);
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            entry.target.querySelectorAll("[data-count-to]").forEach(runCounter);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (el) { observer.observe(el); });
})();
