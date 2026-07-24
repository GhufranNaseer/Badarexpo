/* =============================================================================
   BADAR EXPO SOLUTIONS - GLOBAL JAVASCRIPT (main.js)
   ============================================================================= */

// ========================= NAVIGATION & MEGA MENU =========================
const NavManager = {
    init() {
        this.cacheDOM();
        this.bindEvents();
    },

    cacheDOM() {
        this.wrapper = document.getElementById('shared-mega-menu');
        this.contents = document.querySelectorAll('.mega-content');
        this.triggers = document.querySelectorAll('.dropdown');
        this.navbar = document.querySelector('.navbar');
        this.menuToggle = document.getElementById('mobile-menu-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.searchToggle = document.getElementById('search-toggle');
        this.searchClose = document.getElementById('search-close');
        this.searchOverlay = document.getElementById('search-overlay');
        this.searchInput = document.getElementById('search-input');

        // Language dropdown (was present in HTML/CSS but had NO JS wiring at all
        // in the original code  the button did nothing when clicked).
        this.langBtn = document.getElementById('lang-btn');
        this.langList = document.querySelector('.lang-list');
        this.langItems = document.querySelectorAll('.lang-list li');
        this.currentLangText = document.getElementById('current-lang');

        this.hideTimeout = null;
        this.breakpoint = 1024;
        this.backdrop = document.getElementById('menu-backdrop');
    },

    bindEvents() {
        // --- Search Overlay Logic ---
        if (this.searchToggle && this.searchOverlay) {
            this.searchToggle.addEventListener('click', () => {
                this.searchOverlay.classList.add('active');
                setTimeout(() => this.searchInput && this.searchInput.focus(), 400);
                document.body.style.overflow = 'hidden';
            });
        }

        if (this.searchClose && this.searchOverlay) {
            this.searchClose.addEventListener('click', () => {
                this.searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // --- Mobile Menu Logic ---
        if (this.menuToggle && this.navMenu) {
            this.menuToggle.addEventListener('click', () => {
                // Set top exactly at navbar bottom before opening
                const navBottom = this.navbar.getBoundingClientRect().bottom;
                this.navMenu.style.top = navBottom + 'px';

                const isActive = this.navMenu.classList.toggle('mobile-active');
                const icon = this.menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-bars', !isActive);
                    icon.classList.toggle('fa-xmark', isActive);
                }
                document.body.style.overflow = isActive ? 'hidden' : '';
                if (this.backdrop) this.backdrop.classList.toggle('active', isActive);
            });
        }

        // Close drawer when backdrop is tapped
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.closeMobileMenu());
        }

        // --- Mega Menu Triggers & Dynamic Content ---
        this.triggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', () => {
                if (window.innerWidth > this.breakpoint) {
                    this.showMegaMenu(trigger.getAttribute('data-target'));
                }
            });

            trigger.addEventListener('mouseleave', () => {
                if (window.innerWidth > this.breakpoint) this.hideMegaMenu();
            });

            // Mobile Accordion & Desktop Parent Navigation
            const dropdownLink = trigger.querySelector('a');
            if (dropdownLink) {
                dropdownLink.addEventListener('click', (e) => {
                    if (window.innerWidth <= this.breakpoint) {
                        e.preventDefault();
                        e.stopPropagation();
                        const isAlreadyOpen = trigger.classList.contains('mobile-open');
                        this.triggers.forEach(t => t.classList.remove('mobile-open'));
                        if (!isAlreadyOpen) trigger.classList.add('mobile-open');
                    }
                });
            } else {
                trigger.addEventListener('click', () => {
                    if (window.innerWidth <= this.breakpoint) {
                        const isAlreadyOpen = trigger.classList.contains('mobile-open');
                        this.triggers.forEach(t => t.classList.remove('mobile-open'));
                        if (!isAlreadyOpen) trigger.classList.add('mobile-open');
                    }
                });
            }
        });

        // Dynamic Switcher for Mega Menu Highlights
        document.querySelectorAll('.mega-content .dynamic-links a').forEach(link => {
            link.addEventListener('mouseenter', (e) => this.handleDynamicSwitch(e.currentTarget));
        });

        if (this.wrapper) {
            this.wrapper.addEventListener('mouseenter', () => clearTimeout(this.hideTimeout));
            this.wrapper.addEventListener('mouseleave', () => this.hideMegaMenu());
        }

        // --- Language Dropdown Logic (newly added  previously non-functional) ---
        if (this.langBtn && this.langList) {
            this.langBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Reset fixed positioning styles that might have been applied by mobile menu button
                this.langList.style.position = "";
                this.langList.style.top = "";
                this.langList.style.left = "";
                this.langList.style.right = "";
                this.langList.style.zIndex = "";
                this.langList.style.display = "";
                this.langList.classList.toggle('show');
            });

            this.langItems.forEach(item => {
                item.addEventListener('click', () => {
                    const langCode = item.getAttribute('data-lang');
                    if (this.currentLangText) this.currentLangText.textContent = langCode.toUpperCase();
                    document.body.classList.toggle('rtl-mode', langCode === 'ur' || langCode === 'ar');
                    this.langList.classList.remove('show');
                });
            });
        }

        // Close mega menu / language dropdown on outside click (helps on touch devices)
        document.addEventListener('click', (e) => {
            if (this.langList && this.langBtn &&
                !this.langList.contains(e.target) && !this.langBtn.contains(e.target)) {
                this.langList.classList.remove('show');
            }
        });

        // Global Resize Fix
        window.addEventListener('resize', () => {
            if (window.innerWidth > this.breakpoint && this.navMenu && this.navMenu.classList.contains('mobile-active')) {
                this.closeMobileMenu();
            }
            // Also make sure a lingering mega menu doesn't get stuck open
            // when resizing down into the mobile breakpoint.
            if (window.innerWidth <= this.breakpoint) {
                this.hideMegaMenu();
            }
        });

        // ESC Key Support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.searchOverlay && this.searchOverlay.classList.contains('active')) {
                    this.searchOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
                if (this.langList) this.langList.classList.remove('show');
            }
        });
    },

    showMegaMenu(targetId) {
        if (!this.wrapper) return;
        clearTimeout(this.hideTimeout);
        this.wrapper.classList.add('active');
        this.contents.forEach(c => c.classList.remove('active'));
        const target = document.getElementById(`content-${targetId}`);
        if (target) target.classList.add('active');
    },

    hideMegaMenu() {
        this.hideTimeout = setTimeout(() => {
            if (this.wrapper) this.wrapper.classList.remove('active');
            this.contents.forEach(c => c.classList.remove('active'));
        }, 200);
    },

    handleDynamicSwitch(link) {
        const newImage = link.getAttribute('data-image');
        if (!newImage) return;
        const newTitle = link.getAttribute('data-title');
        const newDesc = link.getAttribute('data-desc');

        const contentBlock = link.closest('.mega-content');
        if (!contentBlock) return;

        const highlightImg = contentBlock.querySelector('.dynamic-img');
        const highlightTitle = contentBlock.querySelector('.dynamic-title');
        const highlightDesc = contentBlock.querySelector('.dynamic-desc');

        if (highlightImg) highlightImg.src = newImage;
        if (highlightTitle) highlightTitle.innerText = newTitle;
        if (highlightDesc) highlightDesc.innerText = newDesc;
    },

    closeMobileMenu() {
        if (!this.navMenu) return;
        this.navMenu.classList.remove('mobile-active');
        if (this.backdrop) this.backdrop.classList.remove('active');
        if (this.menuToggle) {
            const icon = this.menuToggle.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-xmark');
            }
        }
        document.body.style.overflow = '';
    }
};

// ========================= STATISTICS COUNTER =========================
const StatsManager = {
    init() {
        const statBoxes = document.querySelectorAll(".stat-box");
        if (!statBoxes.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const counter = entry.target.querySelector(".counter");
                    if (!counter) return;
                    const target = +counter.getAttribute("data-target");

                    entry.target.classList.add("active");

                    let count = 0;
                    const speed = target / 120;

                    const updateCounter = () => {
                        count += speed;
                        if (count < target) {
                            if (target === 420) {
                                counter.innerHTML = Math.floor(count) + "%";
                            } else if (target === 21200) {
                                counter.innerHTML = (count / 1000).toFixed(1) + "K";
                            } else if (target === 110) {
                                counter.innerHTML = Math.floor(count) + "X";
                            } else if (target === 16000000) {
                                counter.innerHTML = Math.floor(count / 1000000) + "M";
                            } else {
                                counter.innerHTML = Math.floor(count);
                            }
                            requestAnimationFrame(updateCounter);
                        } else {
                            if (target === 420) {
                                counter.innerHTML = "420%";
                            } else if (target === 21200) {
                                counter.innerHTML = "21.2K";
                            } else if (target === 110) {
                                counter.innerHTML = "110X";
                            } else if (target === 16000000) {
                                counter.innerHTML = "16M";
                            } else {
                                counter.innerHTML = target;
                            }
                        }
                    };

                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        statBoxes.forEach((box) => observer.observe(box));
    }
};



// ========================= SCROLL TO TOP MANAGER =========================
const ScrollTopManager = {
    init() {
        this.btn = document.getElementById('scrollTopBtn');
        if (!this.btn) return;

        this.bindEvents();
    },

    bindEvents() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                this.btn.classList.add('show');
            } else {
                this.btn.classList.remove('show');
            }
        });

        this.btn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
};

// ========================= WHAT WE DO SPLIT SHOWCASE & MOBILE SCROLLSTACK =========================
const SplitServiceManager = {
    init() {
        this.section = document.getElementById('services');
        if (!this.section) return;

        // Desktop elements
        this.navBtns = document.querySelectorAll('.split-nav-btn');
        this.dynamicImg = document.getElementById('dynamic-img');
        this.dynamicLabel = document.getElementById('dynamic-label');
        this.dynamicHeadline = document.getElementById('dynamic-headline');
        this.dynamicDesc = document.getElementById('dynamic-desc');
        this.panelContent = document.querySelector('.split-visuals .panel-content');

        // Mobile ScrollStack elements
        this.stackCards = Array.from(document.querySelectorAll('.split-stack-card'));

        this.mq = window.matchMedia("(min-width: 1024px)");
        this.isDesktop = this.mq.matches;

        this.activeIndex = 0;
        this.bindEvents();

        // Run once initially
        this.handleResize();
        this.handleScroll();
    },

    bindEvents() {
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

        // Desktop Click Event
        if (this.navBtns.length) {
            this.navBtns.forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    if (this.isDesktop) {
                        const sectionTop = this.section.getBoundingClientRect().top + window.scrollY;
                        const maxScroll = this.section.offsetHeight - window.innerHeight;
                        const total = this.navBtns.length;
                        const segmentHeight = maxScroll / total;
                        const targetScroll = sectionTop + (segmentHeight * index) + (segmentHeight / 2);

                        window.scrollTo({
                            top: targetScroll,
                            behavior: 'smooth'
                        });
                    } else {
                        this.activateTab(index);
                    }
                });
            });
        }
    },

    handleResize() {
        this.isDesktop = this.mq.matches;
        if (this.isDesktop) {
            // Reset mobile card transforms
            this.stackCards.forEach(card => {
                card.style.transform = '';
                card.style.opacity = '';
                card.style.filter = '';
            });
        }
    },

    handleScroll() {
        if (this.isDesktop) {
            this.handleDesktopScroll();
        } else {
            this.handleMobileScroll();
        }
    },

    /* ---------- DESKTOP: sticky scroll-jacked tabs ---------- */
    handleDesktopScroll() {
        if (!this.navBtns.length || !this.section) return;

        const rect = this.section.getBoundingClientRect();
        const maxScroll = rect.height - window.innerHeight;
        const scrollTop = -rect.top;

        if (scrollTop >= 0 && scrollTop <= maxScroll) {
            let progress = scrollTop / maxScroll;
            progress = Math.max(0, Math.min(1, progress));

            const total = this.navBtns.length;
            let index = Math.floor(progress * total);
            if (index >= total) index = total - 1;

            this.activateTab(index);
        } else if (scrollTop < 0) {
            this.activateTab(0);
        } else if (scrollTop > maxScroll) {
            this.activateTab(this.navBtns.length - 1);
        }
    },

    activateTab(index) {
        if (index === this.activeIndex) return;
        this.activeIndex = index;

        const targetBtn = this.navBtns[index];
        if (!targetBtn || !this.dynamicImg || !this.panelContent) return;

        this.navBtns.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');

        const newImg = targetBtn.getAttribute('data-img');
        const newLabel = targetBtn.getAttribute('data-label');
        const newHeadline = targetBtn.getAttribute('data-headline');
        const newDesc = targetBtn.getAttribute('data-desc');

        this.dynamicImg.classList.add('fading-out');
        this.panelContent.classList.add('fading-out');

        setTimeout(() => {
            this.dynamicImg.src = newImg;
            this.dynamicLabel.innerText = newLabel;
            this.dynamicHeadline.innerText = newHeadline;
            this.dynamicDesc.innerText = newDesc;

            const removeFade = () => {
                this.dynamicImg.classList.remove('fading-out');
                this.panelContent.classList.remove('fading-out');
            };

            if (this.dynamicImg.complete) {
                removeFade();
            } else {
                this.dynamicImg.onload = removeFade;
                setTimeout(removeFade, 100);
            }
        }, 400);
    },

    /* ---------- MOBILE / TABLET: sticky scroll-stacking cards ---------- */
    handleMobileScroll() {
        if (!this.stackCards.length) return;

        const pinPoint = 120; // Matches top: 120px in CSS

        this.stackCards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const cardHeight = rect.height;

            if (rect.top <= pinPoint) {
                const scrolledDistance = pinPoint - rect.top;
                const progress = Math.max(0, Math.min(1, scrolledDistance / cardHeight));

                // Scale down and dim the card as it scrolls past
                const scale = 1 - (progress * 0.05); // scale down to 0.95
                const opacity = 1 - (progress * 0.4); // dim opacity to 0.6
                const brightness = 1 - (progress * 0.3); // brightness to 0.7

                card.style.transform = `scale(${scale})`;
                card.style.opacity = opacity;
                card.style.filter = `brightness(${brightness})`;
            } else {
                card.style.transform = 'scale(1)';
                card.style.opacity = '1';
                card.style.filter = 'brightness(1)';
            }
        });
    }
};

// ========================= INITIALIZE ALL MODULES =========================

document.addEventListener('DOMContentLoaded', () => {
    NavManager.init();
    StatsManager.init();
    ScrollTopManager.init();
    SplitServiceManager.init();
});
