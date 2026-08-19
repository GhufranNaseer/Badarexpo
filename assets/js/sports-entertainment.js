/* =============================================================================
   PAGE SCRIPT: SPORTS & ENTERTAINMENT (sports-entertainment.js)
   Vanilla, dependency-free. Scroll reveals only - no other interaction on this
   page needs JavaScript. Fully respects prefers-reduced-motion.
   ============================================================================= */
(function () {
    "use strict";

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var reveals = document.querySelectorAll(".bse-reveal");

    if (!reveals.length) return;

    if (!("IntersectionObserver" in window) || reduceMotion) {
        reveals.forEach(function (el) { el.classList.add("is-visible"); });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (el) { observer.observe(el); });
})();
