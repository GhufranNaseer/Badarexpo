/**
 * BADAR EXPO - Main Global Logic (Polished & Responsive)
 * Consolidates Navbar, Mega-Menu, and Language Switching
 */

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
        this.hideTimeout = null;
        this.breakpoint = 1024; // Unified Breakpoint
    },

    bindEvents() {
        // Mobile Menu Toggle
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => {
                const isActive = this.navMenu.classList.toggle('mobile-active');
                const icon = this.menuToggle.querySelector('i');
                icon.classList.toggle('fa-bars', !isActive);
                icon.classList.toggle('fa-xmark', isActive);
                
                // Prevent body scroll when menu is open
                document.body.style.overflow = isActive ? 'hidden' : '';
            });
        }

        // Mega Menu Triggers
        this.triggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', () => {
                if (window.innerWidth > this.breakpoint) {
                    const targetId = trigger.getAttribute('data-target');
                    this.showMegaMenu(targetId);
                }
            });
            
            trigger.addEventListener('mouseleave', () => {
                if (window.innerWidth > this.breakpoint) {
                    this.hideMegaMenu();
                }
            });

            // Mobile click support for dropdowns (Accordion behavior)
            trigger.addEventListener('click', (e) => {
                if (window.innerWidth <= this.breakpoint) {
                    const isAlreadyOpen = trigger.classList.contains('mobile-open');
                    
                    // Close all other dropdowns first
                    this.triggers.forEach(t => t.classList.remove('mobile-open'));
                    
                    // If it wasn't open, open it now
                    if (!isAlreadyOpen) {
                        trigger.classList.add('mobile-open');
                    }
                }
            });
        });

        if (this.wrapper) {
            this.wrapper.addEventListener('mouseenter', () => clearTimeout(this.hideTimeout));
            this.wrapper.addEventListener('mouseleave', () => this.hideMegaMenu());
        }

        // Dynamic Content Switcher (Mega Menu Highlights)
        document.querySelectorAll('.mega-content .dynamic-links a').forEach(link => {
            link.addEventListener('mouseenter', (e) => this.handleDynamicSwitch(e.currentTarget));
        });
        
        // Close mobile menu on resize if screen becomes large
        window.addEventListener('resize', () => {
            if (window.innerWidth > this.breakpoint && this.navMenu.classList.contains('mobile-active')) {
                this.closeMobileMenu();
            }
        });
    },

    showMegaMenu(targetId) {
        clearTimeout(this.hideTimeout);
        this.wrapper.classList.add('active');
        this.contents.forEach(c => c.classList.remove('active'));
        const target = document.getElementById(`content-${targetId}`);
        if (target) target.classList.add('active');
    },

    hideMegaMenu() {
        this.hideTimeout = setTimeout(() => {
            this.wrapper.classList.remove('active');
            this.contents.forEach(c => c.classList.remove('active'));
        }, 200);
    },

    closeMobileMenu() {
        this.navMenu.classList.remove('mobile-active');
        const icon = this.menuToggle.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-xmark');
        document.body.style.overflow = '';
    },

    handleDynamicSwitch(link) {
        const newImage = link.getAttribute('data-image');
        const newTitle = link.getAttribute('data-title');
        const newDesc = link.getAttribute('data-desc');

        const contentBlock = link.closest('.mega-content');
        const highlightImg = contentBlock.querySelector('.dynamic-img');
        const highlightTitle = contentBlock.querySelector('.dynamic-title');
        const highlightDesc = contentBlock.querySelector('.dynamic-desc');
        const highlightBox = contentBlock.querySelector('.highlight-content-box');

        if (!highlightImg || !highlightBox) return;

        highlightBox.style.opacity = '0';
        highlightBox.style.transform = 'translateY(5px)';

        setTimeout(() => {
            highlightImg.src = newImage;
            highlightTitle.innerText = newTitle;
            highlightDesc.innerText = newDesc;
            highlightBox.style.opacity = '1';
            highlightBox.style.transform = 'translateY(0)';
        }, 150);
    }
};

// --- LANGUAGE SELECTION LOGIC ---
const LangManager = {
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.applySavedLanguage();
    },

    cacheDOM() {
        this.langBtn = document.getElementById('lang-btn');
        this.langList = document.querySelector('.lang-list');
        this.currentLangText = document.getElementById('current-lang');
        this.langOptions = document.querySelectorAll('.lang-list li');
    },

    bindEvents() {
        // Toggle language list on click (for mobile support)
        if (this.langBtn) {
            this.langBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.langList.classList.toggle('show');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (this.langList) this.langList.classList.remove('show');
        });

        if (this.langOptions) {
            this.langOptions.forEach(opt => {
                opt.addEventListener('click', (e) => {
                    const lang = e.target.getAttribute('data-lang');
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
        if (this.currentLangText) {
            this.currentLangText.innerText = lang.toUpperCase();
        }

        if (lang === 'ur' || lang === 'ar') {
            document.body.classList.add('rtl-mode');
            document.body.dir = 'rtl';
        } else {
            document.body.classList.remove('rtl-mode');
            document.body.dir = 'ltr';
        }
    },

    applySavedLanguage() {
        const savedLang = localStorage.getItem('user_lang') || 'en';
        this.applyLanguage(savedLang);
    }
};

// --- INITIALIZE ALL ---
document.addEventListener('DOMContentLoaded', () => {
    NavManager.init();
    LangManager.init();
});
