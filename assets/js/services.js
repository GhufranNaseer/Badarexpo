/* =============================================================================
   BADAR EXPO SOLUTIONS - SERVICES PAGE JAVASCRIPT (services.js)
   Scoped exclusively to services.html: scroll reveal, capability rail,
   count-up numbers, and the FAQ accordion.
   ============================================================================= */
(function () {
    "use strict";

    /* ---- Scroll reveal ---- */
    var revealEls = document.querySelectorAll(".svcpg-reveal, .svc-reveal");
    if ("IntersectionObserver" in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }

    /* ---- Capability rail: highlight 01/02/03 as each pillar scrolls into view ---- */
    var pillars = document.querySelectorAll(".svcpg-pillar[data-pillar]");
    var railDots = document.querySelectorAll(".svcpg-rail-dot[data-rail]");
    if (pillars.length && railDots.length && "IntersectionObserver" in window) {
        var railObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var idx = entry.target.getAttribute("data-pillar");
                    railDots.forEach(function (dot) {
                        dot.classList.toggle("active", dot.getAttribute("data-rail") === idx);
                    });
                }
            });
        }, { threshold: 0.5 });
        pillars.forEach(function (p) { railObserver.observe(p); });
    }

    /* ---- Count-up numbers (Company Numbers section) ---- */
    var counters = document.querySelectorAll(".svcpg-counter");
    if (counters.length && "IntersectionObserver" in window) {
        var countObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var target = parseInt(el.getAttribute("data-target"), 10) || 0;
                var suffix = el.getAttribute("data-suffix") || "";
                var duration = 1400;
                var start = null;

                function step(ts) {
                    if (!start) start = ts;
                    var progress = Math.min((ts - start) / duration, 1);
                    var eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        el.textContent = target.toLocaleString() + suffix;
                    }
                }
                requestAnimationFrame(step);
                countObserver.unobserve(el);
            });
        }, { threshold: 0.4 });
        counters.forEach(function (c) { countObserver.observe(c); });
    }

    /* ---- FAQ ACCORDION MANAGER ---- */
    var SvcFaqManager = {
        init: function () {
            this.questions = document.querySelectorAll('.svc-faq-q');
            if (!this.questions.length) return;

            this.questions.forEach(function (q) {
                q.addEventListener('click', function () {
                    var item = q.closest('.svc-faq-item');
                    var answer = item.querySelector('.svc-faq-a');
                    var wasActive = item.classList.contains('active');

                    // Collapse all other FAQ items
                    document.querySelectorAll('.svc-faq-item').forEach(function (i) {
                        i.classList.remove('active');
                        var a = i.querySelector('.svc-faq-a');
                        if (a) a.style.maxHeight = null;
                        var btn = i.querySelector('.svc-faq-q');
                        if (btn) btn.setAttribute('aria-expanded', 'false');
                    });

                    // Expand clicked item if it was not already active
                    if (!wasActive) {
                        item.classList.add('active');
                        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
                        q.setAttribute('aria-expanded', 'true');
                    }
                });
            });

            // Open the first FAQ item's answer by default on load
            var firstActiveAnswer = document.querySelector('.svc-faq-item.active .svc-faq-a');
            if (firstActiveAnswer) {
                firstActiveAnswer.style.maxHeight = firstActiveAnswer.scrollHeight + 'px';
            }
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        SvcFaqManager.init();
    });
})();