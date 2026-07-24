/* =============================================================================
   ABOUT US PAGE — SCOPED SCRIPT (bxabout)
   Scroll reveal, creed hover-backdrop swap, and the testimonial spotlight
   rotator. Fully self-contained; touches nothing outside #bxabout.
   ============================================================================= */
(function () {
    "use strict";

    var root = document.getElementById("bxabout");
    if (!root) return;

    /* ---- Scroll reveal ---- */
    var revealEls = root.querySelectorAll(".ba-reveal");
    if ("IntersectionObserver" in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-in");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add("is-in"); });
    }

    /* ---- Chapter Two: hovering a creed row swaps the ambient backdrop ---- */
    var creedRows = root.querySelectorAll(".ba-creed-row[data-creed-target]");
    var creedBgImgs = root.querySelectorAll(".ba-creed-bg img[data-creed-bg]");
    creedRows.forEach(function (row) {
        row.addEventListener("mouseenter", function () {
            var target = row.getAttribute("data-creed-target");
            creedBgImgs.forEach(function (img) {
                img.classList.toggle("ba-active", img.getAttribute("data-creed-bg") === target);
            });
        });
    });

    /* ---- Chapter Seven: testimonial spotlight rotator ---- */
    var trustQuotes = root.querySelectorAll(".ba-trust-quote[data-trust]");
    var trustDots = root.querySelectorAll(".ba-trust-dot[data-trust-dot]");
    var trustIndex = 0;
    var trustTimer = null;

    function showTrust(index) {
        trustIndex = index;
        trustQuotes.forEach(function (q) {
            q.classList.toggle("ba-active", q.getAttribute("data-trust") === String(index));
        });
        trustDots.forEach(function (d) {
            d.classList.toggle("ba-active", d.getAttribute("data-trust-dot") === String(index));
        });
    }

    function nextTrust() {
        var next = (trustIndex + 1) % trustQuotes.length;
        showTrust(next);
    }

    if (trustQuotes.length > 1) {
        trustTimer = setInterval(nextTrust, 6000);
        trustDots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                clearInterval(trustTimer);
                showTrust(parseInt(dot.getAttribute("data-trust-dot"), 10));
                trustTimer = setInterval(nextTrust, 6000);
            });
        });
    }
})();
