/* =============================================================================
   MOBILE FULL-CANVAS MEGA MENU
   Jab mobile view (<=1024px) par "Services" / "Events" / "Insights" jaise
   dropdown nav-item par tap karte hain, to header (logo/topbar) waisa hi
   rehta hai aur neeche wala menu canvas is desktop mega-menu ka data
   (images + titles + descriptions) full screen panel mein dikhata hai.
   ============================================================================= */
(function () {
    "use strict";

    var MOBILE_BREAKPOINT = 1024;

    var panel = document.getElementById("mobileMegaPanel");
    var panelBody = document.getElementById("mmpBody");
    var panelTitle = document.getElementById("mmpTitle");
    var backBtn = document.getElementById("mmpBack");
    var navToggle = document.getElementById("mobile-menu-toggle");
    var dropdownItems = document.querySelectorAll(".nav-item.dropdown[data-target]");

    if (!panel || !panelBody) return;

    function isMobile() {
        return window.innerWidth <= MOBILE_BREAKPOINT;
    }

    /* Desktop "#content-XXX" mega-content ko mobile-friendly cards mein convert karta hai */
    function buildPanelContent(target) {
        var source = document.getElementById("content-" + target);
        panelBody.innerHTML = "";
        if (!source) return;

        /* Insights jaisa simple card layout (image + h4 + p, no data-title links) */
        var insightCards = source.querySelectorAll(":scope > .insight-card");
        if (insightCards.length) {
            insightCards.forEach(function (card) {
                var img = card.querySelector("img");
                var h4 = card.querySelector("h4");
                var p = card.querySelector("p");

                var item = document.createElement("a");
                item.href = "#";
                item.className = "mmp-item";

                var imgHtml = img ? '<img src="' + img.getAttribute("src") + '" alt="">' : "";
                var titleHtml = h4 ? h4.textContent.trim() : "";
                var descHtml = p ? p.innerHTML : "";

                item.innerHTML =
                    imgHtml +
                    '<div class="mmp-item-text">' +
                    '<p class="mmp-item-title">' + titleHtml + '</p>' +
                    (descHtml ? '<p class="mmp-item-desc">' + descHtml + '</p>' : "") +
                    '</div>';
                panelBody.appendChild(item);
            });
            return;
        }

        /* Services / Events jaisa column-based layout (data-title, data-desc, data-image) */
        var columns = source.querySelectorAll(":scope > .column.dynamic-links");
        columns.forEach(function (col) {
            var h4 = col.querySelector("h4");
            var section = document.createElement("div");
            section.className = "mmp-section";

            if (h4) {
                var sectionTitle = document.createElement("p");
                sectionTitle.className = "mmp-section-title";
                sectionTitle.textContent = h4.textContent.trim();
                section.appendChild(sectionTitle);
            }

            var links = col.querySelectorAll("a[data-title]");
            links.forEach(function (link) {
                var item = document.createElement("a");
                item.href = link.getAttribute("href") || "#";
                item.className = "mmp-item";

                var title = link.getAttribute("data-title") || link.textContent.trim();
                var desc = link.getAttribute("data-desc") || "";
                var img = link.getAttribute("data-image");

                item.innerHTML =
                    (img ? '<img src="' + img + '" alt="">' : "") +
                    '<div class="mmp-item-text">' +
                    '<p class="mmp-item-title">' + title + '</p>' +
                    (desc ? '<p class="mmp-item-desc">' + desc + '</p>' : "") +
                    '</div>';
                section.appendChild(item);
            });

            panelBody.appendChild(section);
        });

        /* Right-hand "highlight" box (agar ho) - description + image ke sath */
        var highlight = source.querySelector(".column.highlight .highlight-content-box");
        if (highlight) {
            var himg = highlight.querySelector("img");
            var hstrong = highlight.querySelector("strong");
            var hp = highlight.querySelector("p");

            var box = document.createElement("div");
            box.className = "mmp-highlight";
            box.innerHTML =
                (himg ? '<img src="' + himg.getAttribute("src") + '" alt="">' : "") +
                '<div class="mmp-highlight-body">' +
                (hstrong ? "<strong>" + hstrong.textContent + "</strong>" : "") +
                (hp ? "<p>" + hp.innerHTML + "</p>" : "") +
                "</div>";
            panelBody.appendChild(box);
        }
    }

    function getItemLabel(item) {
        var span = item.querySelector("span");
        if (span) {
            return span.childNodes[0] && span.childNodes[0].nodeValue
                ? span.childNodes[0].nodeValue.trim()
                : span.textContent.trim();
        }
        return item.textContent.trim();
    }

    function openPanel(target, label) {
        buildPanelContent(target);
        panelTitle.textContent = label;
        
        // Dynamically set top position using navbar bottom rect so it doesn't overlap header
        var navbar = document.querySelector(".navbar");
        if (navbar && panel) {
            var navBottom = navbar.getBoundingClientRect().bottom;
            panel.style.top = navBottom + "px";
        }
        
        panel.classList.add("open");
    }

    function closePanel() {
        panel.classList.remove("open");
    }

    dropdownItems.forEach(function (item) {
        item.addEventListener(
            "click",
            function (e) {
                if (!isMobile()) return; // desktop pe purana hover mega-menu hi chalega
                var target = item.getAttribute("data-target");
                if (!target || !document.getElementById("content-" + target)) return;

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation(); // purana accordion-toggle handler override

                openPanel(target, getItemLabel(item));
            },
            true /* capture phase - header/logo ko touch kiye bagair sab se pehle chalega */
        );
    });

    if (backBtn) {
        backBtn.addEventListener("click", closePanel);
    }

    /* Hamburger dobara tap ho ya menu band ho to mega panel bhi reset ho jaye */
    if (navToggle) {
        navToggle.addEventListener("click", closePanel);
    }

    window.addEventListener("resize", function () {
        if (!isMobile()) closePanel();
    });

    /* Mobile sub-header language button -> reuse existing topbar language dropdown/logic */
    var mobileLangBtn = document.getElementById("mobile-lang-btn");
    var realLangBtn = document.getElementById("lang-btn");
    var mobileLangLabel = document.getElementById("mobile-current-lang");
    var realLangLabel = document.getElementById("current-lang");

    if (mobileLangBtn && realLangBtn) {
        mobileLangBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            realLangBtn.click(); // reuse existing dropdown open/close logic
 
            var list = document.querySelector(".lang-list");
            if (list && isMobile()) {
                var rect = mobileLangBtn.getBoundingClientRect();
                var isRTL = document.body.classList.contains("rtl-mode");
                
                list.style.position = "fixed";
                list.style.top = rect.bottom + 8 + "px";
                
                if (isRTL) {
                    // In RTL mode, align the list's right edge to the button's right edge
                    list.style.left = "auto";
                    list.style.right = (window.innerWidth - rect.right) + "px";
                } else {
                    // In LTR mode, align the list's left edge to the button's left edge
                    list.style.left = rect.left + "px";
                    list.style.right = "auto";
                }
                
                list.style.zIndex = "10002"; // Higher than main menu (2000)
                list.style.display = "block";
            }
        });
    }

    /* Keep the mobile label in sync whenever the real language label changes */
    if (realLangLabel && mobileLangLabel && window.MutationObserver) {
        var syncLabel = function () {
            mobileLangLabel.textContent =
                realLangLabel.textContent === "EN" ? "English" : realLangLabel.textContent;
        };
        syncLabel();
        new MutationObserver(syncLabel).observe(realLangLabel, {
            childList: true,
            characterData: true,
            subtree: true,
        });
    }
})();
