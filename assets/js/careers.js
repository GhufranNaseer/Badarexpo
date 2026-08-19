/* =============================================================================
   PAGE SCRIPT: CAREERS (careers.js)
   Vanilla, dependency-free.

   Carried over from the approved prototype: scroll reveal, application modal
   (open/close, Escape, focus trap), file-input state, and frontend-only form
   validation with the demo confirmation.

   NOT carried over: the prototype navbar scroll state and prototype burger
   menu - the repository navbar (navbar.js / main.js / mobile-mega-menu.js)
   owns that behaviour on this page.

   Smooth in-page scrolling is handled here rather than with a global
   html{scroll-behavior:smooth}, which would have leaked onto every page.
   ============================================================================= */
(function () {
    "use strict";

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---- smooth scroll for this page's own anchors ---- */
    document.querySelectorAll('.crs-page a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (e) {
            var id = link.getAttribute("href");
            if (!id || id === "#") return;
            var target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        });
    });

    /* ---- scroll reveal ---- */
    var reveals = document.querySelectorAll(".crs-reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
        reveals.forEach(function (el) { el.classList.add("is-in"); });
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                en.target.classList.add("is-in");
                io.unobserve(en.target);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -60px" });
        reveals.forEach(function (el) { io.observe(el); });
    }

    /* ---- application modal ---- */
    var modal = document.getElementById("crsModal");
    var form = document.getElementById("crsForm");
    var success = document.getElementById("crsSuccess");
    if (!modal || !form || !success) return;

    var lastFocus = null;

    function openModal() {
        lastFocus = document.activeElement;
        modal.classList.add("is-open");
        document.body.style.overflow = "hidden";
        var first = modal.querySelector("input, select, button");
        if (first) first.focus();
    }

    function closeModal() {
        var wasSubmitted = success.style.display === "block";
        modal.classList.remove("is-open");
        document.body.style.overflow = "";
        form.style.display = "";
        success.style.display = "";
        // After a completed submission, start the next one from a clean form.
        if (wasSubmitted) {
            form.reset();
            FILE_INPUTS.forEach(resetFile);
        }
        form.querySelectorAll(".crs-field.is-invalid").forEach(function (f) {
            f.classList.remove("is-invalid");
        });
        if (lastFocus) lastFocus.focus();
    }

    document.querySelectorAll("[data-open-modal]").forEach(function (b) {
        b.addEventListener("click", openModal);
    });
    document.querySelectorAll("[data-close-modal]").forEach(function (b) {
        b.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (e) {
        if (!modal.classList.contains("is-open")) return;
        if (e.key === "Escape") { closeModal(); return; }
        if (e.key !== "Tab") return;

        var f = modal.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, label.crs-file');
        var list = Array.prototype.filter.call(f, function (el) { return el.offsetParent !== null; });
        if (!list.length) return;

        var first = list[0], last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* ---- file inputs: filename display + remove/replace + size/type guard ----
       5 MB cap, checked here because a frontend prototype has no server to
       reject an oversized upload. */
    var MAX_BYTES = 5 * 1024 * 1024;

    var FILE_INPUTS = [
        {
            input: "crsCv", label: "crsFileLabel", text: "crsFileText", clear: "crsCvClear",
            placeholder: "Choose a file (PDF, DOC, DOCX)",
            types: ["pdf", "doc", "docx"], required: true
        },
        {
            input: "crsDoc", label: "crsDocLabel", text: "crsDocText", clear: "crsDocClear",
            placeholder: "Choose a file (PDF, DOC, DOCX, JPG, PNG)",
            types: ["pdf", "doc", "docx", "jpg", "jpeg", "png"], required: false
        }
    ];

    function extOf(name) {
        var i = name.lastIndexOf(".");
        return i < 0 ? "" : name.slice(i + 1).toLowerCase();
    }

    function fileIsValid(cfg) {
        var input = document.getElementById(cfg.input);
        if (!input) return true;
        var f = input.files && input.files[0];
        if (!f) return !cfg.required;
        return cfg.types.indexOf(extOf(f.name)) !== -1 && f.size <= MAX_BYTES;
    }

    function resetFile(cfg) {
        var input = document.getElementById(cfg.input);
        var label = document.getElementById(cfg.label);
        var text = document.getElementById(cfg.text);
        var clear = document.getElementById(cfg.clear);
        if (!input) return;
        input.value = "";
        if (text) text.textContent = cfg.placeholder;
        if (label) label.classList.remove("has-file");
        if (clear) clear.hidden = true;
    }

    FILE_INPUTS.forEach(function (cfg) {
        var input = document.getElementById(cfg.input);
        var label = document.getElementById(cfg.label);
        var text = document.getElementById(cfg.text);
        var clear = document.getElementById(cfg.clear);
        if (!input) return;

        input.addEventListener("change", function () {
            var f = input.files && input.files[0];
            if (f) {
                text.textContent = f.name;
                label.classList.add("has-file");
                if (clear) clear.hidden = false;
            } else {
                resetFile(cfg);
            }
            var field = input.closest(".crs-field");
            if (field) field.classList.remove("is-invalid");
        });

        if (clear) {
            clear.addEventListener("click", function () {
                resetFile(cfg);
                var field = input.closest(".crs-field");
                if (field) field.classList.remove("is-invalid");
                if (label) label.focus();
            });
        }
    });

    /* ---- validation (frontend prototype only - nothing is submitted) ---- */
    var PK_PHONE = /^(?:\+?92|0)?3\d{9}$/;          // mobile: +92 3xx xxxxxxx / 03xx xxxxxxx
    var PK_LANDLINE = /^(?:\+?92|0)?\d{9,11}$/;     // landline / other Pakistan formats
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function markField(el, valid) {
        var field = el.closest(".crs-field");
        if (field) field.classList.toggle("is-invalid", !valid);
    }

    function validate() {
        var firstBad = null;

        // Required text / select / textarea fields, in visual order.
        var required = [
            ["crsName", function (v) { return v.trim().length > 1; }],
            ["crsEmail", function (v) { return EMAIL.test(v.trim()); }],
            ["crsPhone", function (v) {
                var d = v.replace(/[\s()-]/g, "");
                return PK_PHONE.test(d) || PK_LANDLINE.test(d);
            }],
            ["crsCity", function (v) { return v.trim().length > 1; }],
            ["crsArea", function (v) { return v !== ""; }],
            ["crsSkills", function (v) { return v.trim().length > 2; }],
            ["crsNotice", function (v) { return v !== ""; }],
            ["crsQualification", function (v) { return v !== ""; }]
        ];

        required.forEach(function (pair) {
            var el = document.getElementById(pair[0]);
            if (!el) return;
            var valid = pair[1](el.value);
            markField(el, valid);
            if (!valid && !firstBad) firstBad = el;
        });

        // Optional URLs - only validated when the user actually typed something.
        ["crsLinkedin", "crsPortfolio"].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            var v = el.value.trim();
            var valid = true;
            if (v !== "") {
                try {
                    var u = new URL(v);
                    valid = (u.protocol === "http:" || u.protocol === "https:");
                    if (valid && id === "crsLinkedin") valid = /linkedin\./i.test(u.hostname);
                } catch (err) { valid = false; }
            }
            markField(el, valid);
            if (!valid && !firstBad) firstBad = el;
        });

        // Files
        FILE_INPUTS.forEach(function (cfg) {
            var el = document.getElementById(cfg.input);
            if (!el) return;
            var valid = fileIsValid(cfg);
            markField(el, valid);
            if (!valid && !firstBad) firstBad = document.getElementById(cfg.label) || el;
        });

        // Consent
        var consent = document.getElementById("crsConsent");
        if (consent) {
            markField(consent, consent.checked);
            if (!consent.checked && !firstBad) firstBad = consent;
        }

        if (firstBad) {
            if (typeof firstBad.focus === "function") firstBad.focus();
            if (typeof firstBad.scrollIntoView === "function") {
                firstBad.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
            }
            return false;
        }
        return true;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validate()) return;
        form.style.display = "none";
        success.style.display = "block";
        success.scrollIntoView({ block: "nearest" });
        var btn = success.querySelector("button");
        if (btn) btn.focus();
    });

    form.addEventListener("input", function (e) {
        var field = e.target.closest(".crs-field");
        if (field) field.classList.remove("is-invalid");
    });

    form.addEventListener("change", function (e) {
        var field = e.target.closest(".crs-field");
        if (field) field.classList.remove("is-invalid");
    });
})();
