/* =============================================================================
   BADAR EXPO SOLUTIONS - GLOBAL JAVASCRIPT (main.js)
   Architecture: Modular Logic Groups (rules.txt compliant)
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
        this.hideTimeout = null;
        this.breakpoint = 1024;
    },

    bindEvents() {
        // --- Search Overlay Logic ---
        if (this.searchToggle) {
            this.searchToggle.addEventListener('click', () => {
                this.searchOverlay.classList.add('active');
                setTimeout(() => this.searchInput.focus(), 400);
                document.body.style.overflow = 'hidden';
            });
        }

        if (this.searchClose) {
            this.searchClose.addEventListener('click', () => {
                this.searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // --- Mobile Menu Logic ---
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => {
                const isActive = this.navMenu.classList.toggle('mobile-active');
                const icon = this.menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-bars', !isActive);
                    icon.classList.toggle('fa-xmark', isActive);
                }
                document.body.style.overflow = isActive ? 'hidden' : '';
            });
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

            // Mobile Accordion
            trigger.addEventListener('click', () => {
                if (window.innerWidth <= this.breakpoint) {
                    const isAlreadyOpen = trigger.classList.contains('mobile-open');
                    this.triggers.forEach(t => t.classList.remove('mobile-open'));
                    if (!isAlreadyOpen) trigger.classList.add('mobile-open');
                }
            });
        });

        // Dynamic Switcher for Mega Menu Highlights
        document.querySelectorAll('.mega-content .dynamic-links a').forEach(link => {
            link.addEventListener('mouseenter', (e) => this.handleDynamicSwitch(e.currentTarget));
        });

        if (this.wrapper) {
            this.wrapper.addEventListener('mouseenter', () => clearTimeout(this.hideTimeout));
            this.wrapper.addEventListener('mouseleave', () => this.hideMegaMenu());
        }

        // Global Resize Fix
        window.addEventListener('resize', () => {
            if (window.innerWidth > this.breakpoint && this.navMenu.classList.contains('mobile-active')) {
                this.closeMobileMenu();
            }
        });

        // ESC Key Support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchOverlay.classList.contains('active')) {
                this.searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
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
        const newTitle = link.getAttribute('data-title');
        const newDesc = link.getAttribute('data-desc');

        const contentBlock = link.closest('.mega-content');
        if (!contentBlock) return;

        const highlightImg = contentBlock.querySelector('.dynamic-img');
        const highlightTitle = contentBlock.querySelector('.dynamic-title');
        const highlightDesc = contentBlock.querySelector('.dynamic-desc');
        const highlightBox = contentBlock.querySelector('.highlight-content-box');

        if (highlightImg) highlightImg.src = newImage;
        if (highlightTitle) highlightTitle.innerText = newTitle;
        if (highlightDesc) highlightDesc.innerText = newDesc;
    },

    closeMobileMenu() {
        this.navMenu.classList.remove('mobile-active');
        const icon = this.menuToggle.querySelector('i');
        if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-xmark');
        }
        document.body.style.overflow = '';
    }
};

// ========================= STATISTICS COUNTER =========================
const StatsManager = {
    init() {
        this.counters = document.querySelectorAll('.stat-number');
        if (this.counters.length === 0) return;
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startCounting(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => this.observer.observe(counter));
    },

    startCounting(el) {
        const target = +el.getAttribute('data-target');
        const duration = 2000;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuad = (t) => t * (2 - t);
            const currentNumber = Math.floor(easeOutQuad(progress) * target);

            el.innerText = currentNumber;
            if (progress < 1) requestAnimationFrame(update);
            else el.innerText = target;
        };

        requestAnimationFrame(update);
    }
};

// ========================= LANGUAGE MANAGER =========================
const LangManager = {
    init() {
        this.langBtn = document.getElementById('lang-btn');
        this.langList = document.querySelector('.lang-list');
        this.currentLangText = document.getElementById('current-lang');
        this.langOptions = document.querySelectorAll('.lang-list li');
        
        this.bindEvents();
        this.applySavedLanguage();
    },

    bindEvents() {
        if (this.langBtn) {
            this.langBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.langList) this.langList.classList.toggle('show');
            });
        }

        document.addEventListener('click', () => {
            if (this.langList) this.langList.classList.remove('show');
        });

        if (this.langOptions) {
            this.langOptions.forEach(opt => {
                opt.addEventListener('click', (e) => {
                    const lang = e.currentTarget.getAttribute('data-lang');
                    this.switchLanguage(lang);
                });
            });
        }
    },

    switchLanguage(lang) {
        localStorage.setItem('user_lang', lang);
        this.applyLanguage(lang);
    },

    applyLanguage(lang) {
        if (this.currentLangText) this.currentLangText.innerText = lang.toUpperCase();
        if (lang === 'ur' || lang === 'ar') {
            document.body.classList.add('rtl-mode');
            document.body.dir = 'rtl';
        } else {
            document.body.classList.remove('rtl-mode');
            document.body.dir = 'ltr';
        }
    },

    applySavedLanguage() {
        this.applyLanguage(localStorage.getItem('user_lang') || 'en');
    }
};

// ========================= FEATURED INSIGHTS =========================
const InsightsManager = {
    init() {
        this.cards = document.querySelectorAll(".card");
        if (this.cards.length === 0) return;

        // Background tracking removed to keep images still on hover
        console.log("Insights Manager: Static backgrounds initialized.");
    }
};

// ========================= MEDIA GALLERY (PHASE 4.0) =========================
const GalleryManager = {
    init() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightbox-img');
        this.lightboxClose = document.querySelector('.lightbox-close');
        
        if (!this.galleryItems.length) return;

        this.bindEvents();
    },

    bindEvents() {
        // Filtering Logic
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterGallery(btn.getAttribute('data-filter'));
            });
        });

        // Lightbox Open
        this.galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const title = item.querySelector('h4').innerText;
                this.openLightbox(img.src, title);
            });
        });

        // Lightbox Close
        if (this.lightboxClose) {
            this.lightboxClose.addEventListener('click', () => this.closeLightbox());
        }
        if (this.lightbox) {
            this.lightbox.addEventListener('click', (e) => {
                if (e.target === this.lightbox) this.closeLightbox();
            });
        }
    },

    filterGallery(filter) {
        this.galleryItems.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filter === 'all' || filter === category) {
                item.style.display = 'block';
                // Trigger a small animation for entry
                item.style.animation = 'fadeIn 0.5s ease forwards';
            } else {
                item.style.display = 'none';
            }
        });
    },

    openLightbox(src, title) {
        if (!this.lightbox) return;
        this.lightboxImg.src = src;
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scroll
    },

    closeLightbox() {
        if (!this.lightbox) return;
        this.lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scroll
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

// ========================= INITIALIZE ALL MODULES =========================
document.addEventListener('DOMContentLoaded', () => {
    NavManager.init();
    StatsManager.init();
    LangManager.init();
    InsightsManager.init();
    GalleryManager.init();
    ScrollTopManager.init();
});
