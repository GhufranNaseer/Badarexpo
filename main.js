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

// ========================= NEW SERVICES CAROUSEL MANAGER (STICKY SCROLL) =========================
const ServicesCarouselManager = {
    init() {
        this.track = document.getElementById("services-scroll-track");
        this.cardsContainer = document.getElementById("svc-cards");
        if (!this.track || !this.cardsContainer) return;

        this.targetTranslateX = 0;
        this.currentTranslateX = 0;
        
        // Calculate the maximum horizontal scroll distance
        this.calculateMaxScroll();

        this.bindEvents();
        
        // Start the continuous render loop for smooth lerp
        this.render();
    },

    calculateMaxScroll() {
        // Full scrollable width of the cards minus the visible viewport width
        this.maxScroll = this.cardsContainer.scrollWidth - window.innerWidth;
        if (this.maxScroll < 0) this.maxScroll = 0;
    },

    bindEvents() {
        window.addEventListener("resize", () => {
            this.calculateMaxScroll();
            this.updateTarget();
        });

        window.addEventListener("scroll", () => {
            this.updateTarget();
        }, { passive: true });
    },

    updateTarget() {
        const trackRect = this.track.getBoundingClientRect();
        
        // The track's available scrolling height minus one viewport
        const totalScrollableHeight = trackRect.height - window.innerHeight;
        
        // Calculate progress based on how far the top of the track has moved past the top of the viewport
        let progress = -trackRect.top / totalScrollableHeight;
        
        // Clamp progress between 0 and 1
        progress = Math.max(0, Math.min(1, progress));
        
        // Update the target horizontal translation
        this.targetTranslateX = progress * -this.maxScroll;
    },
    
    render() {
        // Linear interpolation (lerp) for buttery smooth momentum
        // 0.08 is the easing factor. Lower = smoother/slower, Higher = snappier
        this.currentTranslateX += (this.targetTranslateX - this.currentTranslateX) * 0.08;
        
        // Only update the DOM if the difference is noticeable (optimizes performance)
        if (Math.abs(this.targetTranslateX - this.currentTranslateX) > 0.05) {
            this.cardsContainer.style.transform = `translate3d(${this.currentTranslateX}px, 0, 0)`;
        }
        
        // Loop recursively
        requestAnimationFrame(this.render.bind(this));
    }
};

// ========================= EVENTS SHOWCASE SLIDER MANAGER (PREMIUM LERP & INFINITE) =========================
/**
 * Logic: Triple-cloned track with Lerp (Linear Interpolation) for buttery motion.
 * Direction is always preserved. Teleportation happens silently in virtual space.
 */
const EventsSliderManager = {
    init() {
        this.slider = document.getElementById('evt-slider');
        this.track  = document.getElementById('evt-slider-track');
        if (!this.slider || !this.track) return;

        this.currentEl = document.getElementById('evt-current');
        this.totalEl   = document.getElementById('evt-total');
        this.nextBtn   = document.getElementById('evt-next');
        this.prevBtn   = document.getElementById('evt-prev');

        // 1. Setup Clones (1 Set before, 1 Set after)
        this.originals = Array.from(this.track.querySelectorAll('.evt-card'));
        this.count     = this.originals.length;
        this.totalEl.textContent = this.count;

        // Clone originals twice to create [Clone Set][Real Set][Clone Set]
        this.originals.forEach(card => {
            const cloneBefore = card.cloneNode(true);
            const cloneAfter  = card.cloneNode(true);
            cloneBefore.classList.add('is-clone');
            cloneAfter.classList.add('is-clone');
            this.track.prepend(cloneBefore);
            this.track.append(cloneAfter);
        });

        this.allCards = Array.from(this.track.querySelectorAll('.evt-card'));
        this.realOffset = this.count; // The index where the real slides start
        
        // 2. Motion State
        this.activeIndex = 0; // Current active real slide (0-4)
        this.targetX     = 0;
        this.currentX    = 0;
        this.lerp        = 0.08; // Smoothness factor (0.05 - 0.1)
        
        // 3. Dimensions
        this.updateDimensions();
        window.addEventListener('resize', () => this.updateDimensions());

        // 4. Initial Position
        this.jumpToReal(0);
        this.currentX = this.targetX;
        this.applyTransform();

        // 5. Interaction
        this.allCards.forEach((card, i) => {
            card.addEventListener('click', () => {
                // Map any clone click to its real index counterpart
                const realIdx = ((i - this.realOffset) % this.count + this.count) % this.count;
                this.jumpToReal(realIdx);
            });
        });

        this.nextBtn.addEventListener('click', () => this.next());
        this.prevBtn.addEventListener('click', () => this.prev());

        // 6. Animation Loop
        this.animate();
    },

    updateDimensions() {
        // Calculate the width of one full set of slides
        // We assume all slides + gaps are equal. 
        // More robust: calculate distance between first and second slide
        if (this.allCards.length < 2) return;
        this.slideStep = this.allCards[1].offsetLeft - this.allCards[0].offsetLeft;
        this.fullSetWidth = this.slideStep * this.count;
    },

    jumpToReal(index) {
        this.activeIndex = index;
        const domIndex = index + this.realOffset;
        const card = this.allCards[domIndex];
        
        // Target: Center the card in the slider window
        this.targetX = -(card.offsetLeft - (this.slider.offsetWidth / 2) + (card.offsetWidth / 2));
        
        // Update UI
        this.allCards.forEach(c => c.classList.remove('active'));
        this.allCards[domIndex].classList.add('active');
        this.currentEl.textContent = this.activeIndex + 1;
    },

    next() {
        this.activeIndex++;
        // If we go past the real set, we just keep incrementing activeIndex
        // The teleport logic in animate() will handle the wrap-around
        const domIndex = this.activeIndex + this.realOffset;
        const card = this.allCards[domIndex];
        this.targetX = -(card.offsetLeft - (this.slider.offsetWidth / 2) + (card.offsetWidth / 2));
        
        // Wrap logic for index display only
        const displayIdx = (this.activeIndex % this.count + this.count) % this.count;
        this.currentEl.textContent = displayIdx + 1;
        
        // Update active class (find real matching card)
        this.allCards.forEach(c => c.classList.remove('active'));
        this.allCards[domIndex].classList.add('active');
    },

    prev() {
        this.activeIndex--;
        const domIndex = this.activeIndex + this.realOffset;
        const card = this.allCards[domIndex];
        this.targetX = -(card.offsetLeft - (this.slider.offsetWidth / 2) + (card.offsetWidth / 2));
        
        const displayIdx = (this.activeIndex % this.count + this.count) % this.count;
        this.currentEl.textContent = displayIdx + 1;

        this.allCards.forEach(c => c.classList.remove('active'));
        this.allCards[domIndex].classList.add('active');
    },

    applyTransform() {
        this.track.style.transform = `translate3d(${this.currentX}px, 0, 0)`;
    },

    animate() {
        // Interpolation
        this.currentX += (this.targetX - this.currentX) * this.lerp;
        this.applyTransform();

        // 7. SEAMLESS TELEPORTATION
        // If we've drifted into the start clones (left side)
        if (this.targetX > -this.slideStep * (this.realOffset - 1)) {
            this.targetX  -= this.fullSetWidth;
            this.currentX -= this.fullSetWidth;
            this.activeIndex += this.count;
        }
        // If we've drifted into the end clones (right side)
        else if (this.targetX < -this.slideStep * (this.realOffset + this.count)) {
            this.targetX  += this.fullSetWidth;
            this.currentX += this.fullSetWidth;
            this.activeIndex -= this.count;
        }

        requestAnimationFrame(() => this.animate());
    }
};

// ========================= TESTIMONIALS MANAGER (INFINITE CAROUSEL) =========================
const TestimonialsManager = {
    init() {
        this.track = document.getElementById('testi-track');
        this.prevBtn = document.getElementById('testi-prev');
        this.nextBtn = document.getElementById('testi-next');
        if (!this.track) return;

        this.cards = Array.from(this.track.querySelectorAll('.testimonial-card'));
        this.originalCount = this.cards.length;
        
        // 1. Clone set for infinite effect
        this.cards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('is-clone');
            this.track.appendChild(clone);
        });

        this.allCards = Array.from(this.track.querySelectorAll('.testimonial-card'));
        this.currentIndex = 0;
        this.isTransitioning = false;

        // 2. Dimensions
        this.updateDimensions();
        window.addEventListener('resize', () => this.updateDimensions());

        // 3. Navigation
        this.nextBtn.addEventListener('click', () => this.move(1));
        this.prevBtn.addEventListener('click', () => this.move(-1));

        // 4. Initial Entrance Animation (Intersection Observer)
        this.setupEntranceAnimation();
    },

    updateDimensions() {
        if (this.allCards.length < 2) return;
        this.cardWidth = this.allCards[0].offsetWidth;
        this.gap = 32; // from CSS
        this.step = this.cardWidth + this.gap;
    },

    move(direction) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        this.currentIndex += direction;
        this.updatePosition();

        // 5. Infinite Teleport Logic
        setTimeout(() => {
            // If we reached the start of the cloned set (moving forward)
            if (this.currentIndex >= this.originalCount) {
                this.currentIndex = 0;
                this.track.style.transition = 'none';
                this.updatePosition();
                // Force reflow
                this.track.offsetHeight;
                this.track.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
            }
            // If we moved before the first real card (moving backward)
            if (this.currentIndex < 0) {
                this.currentIndex = this.originalCount - 1;
                this.track.style.transition = 'none';
                this.updatePosition();
                this.track.offsetHeight;
                this.track.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
            }
            this.isTransitioning = false;
        }, 600);
    },

    updatePosition() {
        const x = -(this.currentIndex * this.step);
        this.track.style.transform = `translate3d(${x}px, 0, 0)`;
    },

    setupEntranceAnimation() {
        const observerOptions = { threshold: 0.2 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.allCards.forEach((card, i) => {
                        if (i < this.originalCount) { // Only animate first set
                            setTimeout(() => {
                                card.style.opacity = "1";
                                card.style.transform = "translateY(0px)";
                            }, i * 100);
                        } else {
                            card.style.opacity = "1";
                            card.style.transform = "translateY(0px)";
                        }
                    });
                    observer.disconnect();
                }
            });
        }, observerOptions);

        this.allCards.forEach(card => {
            card.style.opacity = "0";
            card.style.transform = "translateY(40px)";
            card.style.transition = "all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)";
            observer.observe(card);
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
    ServicesCarouselManager.init();
    EventsSliderManager.init();
    TestimonialsManager.init();
});
