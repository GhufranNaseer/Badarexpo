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
        const counters = document.querySelectorAll(".counter");
        const statBoxes = document.querySelectorAll(".stat-box");
        if (!statBoxes.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const counter = entry.target.querySelector(".counter");
                    const target = +counter.getAttribute("data-target");

                    entry.target.classList.add("active");

                    let count = 0;
                    const speed = target / 120;

                    const updateCounter = () => {
                        count += speed;
                        if (count < target) {
                            // FORMATTING Logic from Developer
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
                            // FINAL VALUES
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

// ========================= EVENTS SHOWCASE SLIDER =========================
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

// ========================= PLATFORM FEATURES SHOWCASE =========================
const PlatformFeaturesManager = {
    init() {
        this.track      = document.getElementById('pfs-cards-track');
        this.dotsWrap   = document.getElementById('pfs-dots-container');
        this.prevBtn    = document.getElementById('pfs-prev-btn');
        this.nextBtn    = document.getElementById('pfs-next-btn');

        if (!this.track || !this.prevBtn || !this.nextBtn) return;

        this.cards      = Array.from(this.track.querySelectorAll('.pfs-card'));
        this.totalCards = this.cards.length;
        this.current    = 0; // current slide index (left-most visible card)

        this.calcPerView();
        this.buildDots();
        this.updateUI();

        // Button events
        this.prevBtn.addEventListener('click', () => this.slide(-1));
        this.nextBtn.addEventListener('click', () => this.slide(1));

        // Recalculate on resize
        window.addEventListener('resize', () => {
            this.calcPerView();
            // Clamp current so we never show blank space after resize
            const maxIdx = this.totalCards - this.perView;
            if (this.current > maxIdx) this.current = Math.max(0, maxIdx);
            this.buildDots();
            this.updateUI();
        });
    },

    // ---- How many full cards are visible at once? ----
    calcPerView() {
        const w = window.innerWidth;
        if (w <= 768) {
            this.perView = 1;
        } else if (w <= 1200) {
            this.perView = 2;
        } else {
            this.perView = 4;
        }
        // Max steps we can scroll
        this.maxIndex = Math.max(0, this.totalCards - this.perView);
    },

    // ---- Pixel width of one card + its gap (gap = 24px from CSS) ----
    getCardStep() {
        if (!this.cards[0]) return 0;
        const gap = 24;
        return this.cards[0].getBoundingClientRect().width + gap;
    },

    // ---- Build one dot per "page" ----
    buildDots() {
        if (!this.dotsWrap) return;
        this.dotsWrap.innerHTML = '';

        // Number of distinct pages = maxIndex + 1
        const pageCount = this.maxIndex + 1;
        for (let i = 0; i < pageCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'pfs-dot';
            dot.addEventListener('click', () => { this.current = i; this.updateUI(); });
            this.dotsWrap.appendChild(dot);
        }
    },

    // ---- Move by direction (-1 or +1) ----
    slide(dir) {
        this.current = Math.max(0, Math.min(this.maxIndex, this.current + dir));
        this.updateUI();
    },

    // ---- Apply transform + sync dots + toggle button states ----
    updateUI() {
        const step = this.getCardStep();
        this.track.style.transform = `translateX(-${this.current * step}px)`;

        // Dots
        const dots = this.dotsWrap ? this.dotsWrap.querySelectorAll('.pfs-dot') : [];
        dots.forEach((d, i) => d.classList.toggle('pfs-dot-active', i === this.current));

        // Button opacity hints
        this.prevBtn.style.opacity = this.current === 0           ? '0.35' : '1';
        this.nextBtn.style.opacity = this.current >= this.maxIndex ? '0.35' : '1';
    }
};

// ========================= WHAT WE DO SPLIT SHOWCASE =========================
const SplitServiceManager = {
    init() {
        this.section = document.getElementById('services');
        this.navBtns = document.querySelectorAll('.split-nav-btn');
        this.dynamicImg = document.getElementById('dynamic-img');
        this.dynamicLabel = document.getElementById('dynamic-label');
        this.dynamicHeadline = document.getElementById('dynamic-headline');
        this.dynamicDesc = document.getElementById('dynamic-desc');
        this.panelContent = document.querySelector('.split-visuals .panel-content');
        
        if (!this.navBtns.length || !this.dynamicImg || !this.section) return;

        this.activeIndex = 0;
        this.bindEvents();
    },

    activateTab(index) {
        if (index === this.activeIndex) return;
        this.activeIndex = index;

        const targetBtn = this.navBtns[index];
        if (!targetBtn) return;

        // Remove active class from all
        this.navBtns.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        
        // Get data attributes
        const newImg = targetBtn.getAttribute('data-img');
        const newLabel = targetBtn.getAttribute('data-label');
        const newHeadline = targetBtn.getAttribute('data-headline');
        const newDesc = targetBtn.getAttribute('data-desc');

        // Fade out elements
        this.dynamicImg.classList.add('fading-out');
        this.panelContent.classList.add('fading-out');

        setTimeout(() => {
            // Update content
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

    bindEvents() {
        // Scroll Event for Desktop Sticky Section
        window.addEventListener('scroll', () => {
            if (window.innerWidth < 992) return;

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
        }, { passive: true });

        // Click Event
        this.navBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (window.innerWidth >= 992) {
                    const sectionTop = this.section.getBoundingClientRect().top + window.scrollY;
                    const maxScroll = this.section.offsetHeight - window.innerHeight;
                    const total = this.navBtns.length;
                    
                    // Scroll to the exact middle of the segment to ensure it activates
                    const segmentHeight = maxScroll / total;
                    const targetScroll = sectionTop + (segmentHeight * index) + (segmentHeight / 2);
                    
                    window.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                    });
                } else {
                    // Mobile behavior: just activate directly without scrolling
                    this.activateTab(index);
                }
            });
        });
    }
};

// ========================= EVENTS PAGE: OUR ROLE TAB SWITCHER =========================
// WHY: The "Our Role" section on events.html needs a lightweight tab/visual
// swap (Owned / Co-Organized / Managed) independent of the homepage's mega
// menu dynamic-switch logic. Guarded with an early return so this module is
// silently skipped on every page other than events.html.
const EventRoleManager = {
    init() {
        this.tabs = document.querySelectorAll('#evtpg-role-tabs .evtpg-role-tab');
        this.images = document.querySelectorAll('.evtpg-role-visual img[data-role-img]');
        this.badge = document.getElementById('evtpg-role-badge');
        if (!this.tabs.length) return;

        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.activateRole(tab));
        });
    },

    activateRole(tab) {
        const role = tab.getAttribute('data-role');
        const badgeText = tab.getAttribute('data-badge');

        this.tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        this.images.forEach(img => {
            img.classList.toggle('active', img.getAttribute('data-role-img') === role);
        });

        if (this.badge) this.badge.textContent = badgeText;
    }
};

// ========================= EVENTS PAGE: FLAGSHIP PORTFOLIO FILTER =========================
// WHY: Lets visitors narrow the Flagship Events grid on events.html by
// category (Exhibitions / Corporate / Government / Sports & Culture) without
// a page reload. Guarded the same way as EventRoleManager above.
const EventsFilterManager = {
    init() {
        this.filterBtns = document.querySelectorAll('#evtpg-filter-bar .evtpg-filter-btn');
        this.cards = document.querySelectorAll('#evtpg-flagship-grid .evtpg-flagship-card');
        if (!this.filterBtns.length) return;

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.applyFilter(btn));
        });
    },

    applyFilter(btn) {
        const filter = btn.getAttribute('data-filter');

        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.cards.forEach(card => {
            const matches = filter === 'all' || card.getAttribute('data-category') === filter;
            card.classList.toggle('evtpg-hidden', !matches);
        });
    }
};

// ========================= EVENTS PAGE: FAQ ACCORDION =========================
// WHY: Manages the expansion and contraction of FAQ items on events.html.
// Performs smooth height transitions and rotates indicators.
const FaqAccordionManager = {
    init() {
        this.headers = document.querySelectorAll('.evtpg-faq-question');
        if (!this.headers.length) return;

        this.headers.forEach(header => {
            header.addEventListener('click', () => this.toggleAccordion(header));
        });
    },

    toggleAccordion(header) {
        const item = header.closest('.evtpg-faq-item');
        const answer = item.querySelector('.evtpg-faq-answer');
        const icon = header.querySelector('.faq-toggle-icon i');
        const isOpen = item.classList.contains('active');

        // Close all other items
        document.querySelectorAll('.evtpg-faq-item').forEach(i => {
            i.classList.remove('active');
            const a = i.querySelector('.evtpg-faq-answer');
            if (a) a.style.maxHeight = null;
            const iconInner = i.querySelector('.faq-toggle-icon i');
            if (iconInner) {
                iconInner.classList.remove('fa-minus');
                iconInner.classList.add('fa-plus');
            }
        });

        if (!isOpen) {
            item.classList.add('active');
            if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
            if (icon) {
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            }
        }
    }
};

// ========================= SERVICES PAGE: FAQ ACCORDION =========================
// WHY: Manages the expansion/contraction of FAQ accordion items specifically on services.html.
// It performs smooth height transition animations and opens the first item by default.
const SvcFaqManager = {
    init() {
        this.questions = document.querySelectorAll('.svc-faq-q');
        if (!this.questions.length) return;

        this.questions.forEach(q => {
            q.addEventListener('click', () => {
                const item = q.closest('.svc-faq-item');
                const answer = item.querySelector('.svc-faq-a');
                const wasActive = item.classList.contains('active');

                // Collapse all other FAQ items
                document.querySelectorAll('.svc-faq-item').forEach(i => {
                    i.classList.remove('active');
                    const a = i.querySelector('.svc-faq-a');
                    if (a) a.style.maxHeight = null;
                });

                // Expand clicked item if it was not already active
                if (!wasActive) {
                    item.classList.add('active');
                    if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });

        // Open the first FAQ item's answer by default on load
        const firstActiveAnswer = document.querySelector('.svc-faq-item.active .svc-faq-a');
        if (firstActiveAnswer) {
            firstActiveAnswer.style.maxHeight = firstActiveAnswer.scrollHeight + 'px';
        }
    }
};

// ========================= SERVICES PAGE: SCROLL REVEAL =========================
// WHY: Monitors elements with .svc-reveal class on services.html.
// Adds the .svc-in class to trigger CSS transitions when elements enter the viewport.
const SvcRevealManager = {
    init() {
        this.revealElements = document.querySelectorAll('.svc-reveal');
        if (!this.revealElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('svc-in');
                    observer.unobserve(entry.target); // Trigger animation only once
                }
            });
        }, { threshold: 0.15 });

        this.revealElements.forEach(el => observer.observe(el));
    }
};

// ========================= SERVICES PAGE: NUMBERS COUNTER =========================
// WHY: Animates statistics counters (e.g. 150+ Events, 5000+ Exhibitors) on services.html
// to count up smoothly from 0 to their target value when they scroll into view.
const SvcCounterManager = {
    init() {
        this.counters = document.querySelectorAll('.svc-counter');
        if (!this.counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = +el.getAttribute('data-target');
                const suffix = el.getAttribute('data-suffix') || '+';
                let count = 0;
                const speed = Math.max(target / 100, 0.05);

                const update = () => {
                    count += speed;
                    if (count < target) {
                        el.textContent = (target < 10 ? count.toFixed(1) : Math.floor(count)) + suffix;
                        requestAnimationFrame(update);
                    } else {
                        el.textContent = target + suffix;
                    }
                };
                update();
                observer.unobserve(el); // Animate only once
            });
        }, { threshold: 0.4 });

        this.counters.forEach(c => observer.observe(c));
    }
};

// ========================= CONSTRUCTION & DESIGN: SCROLL REVEAL =========================
// WHY: Monitors elements with .cd-reveal class on construction-design.html.
// Adds the .cd-in class to trigger CSS transitions when elements enter the viewport.
const CdRevealManager = {
    init() {
        this.els = document.querySelectorAll('.cd-reveal');
        if (!this.els.length) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('cd-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        this.els.forEach(el => observer.observe(el));
    }
};

// ========================= CONSTRUCTION & DESIGN: HERO COUNTERS =========================
// WHY: Animates statistics counters (e.g. 250+ Projects) on construction-design.html
// to count up smoothly from 0 to their target value when they scroll into view.
const CdCounterManager = {
    init() {
        this.counters = document.querySelectorAll('[cd-count]');
        if (!this.counters.length) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = +el.getAttribute('cd-count');
                let count = 0;
                const speed = Math.max(target / 90, 0.5);
                const update = () => {
                    count += speed;
                    if (count < target) {
                        el.textContent = Math.floor(count);
                        requestAnimationFrame(update);
                    } else {
                        el.textContent = target;
                    }
                };
                update();
                observer.unobserve(el);
            });
        }, { threshold: 0.4 });
        this.counters.forEach(c => observer.observe(c));
    }
};

// ========================= CONSTRUCTION & DESIGN: FAQ ACCORDION =========================
// WHY: Manages the expansion/contraction of FAQ accordion items on construction-design.html.
// Performs smooth height transitions and rotates indicators.
const CdFaqManager = {
    init() {
        this.items = document.querySelectorAll('.cd-faq-item');
        if (!this.items.length) return;
        this.items.forEach(item => {
            const q = item.querySelector('.cd-faq-q');
            const a = item.querySelector('.cd-faq-a');
            q.addEventListener('click', () => {
                const isOpen = item.classList.contains('cd-active');
                this.items.forEach(i => {
                    i.classList.remove('cd-active');
                    i.querySelector('.cd-faq-a').style.maxHeight = null;
                });
                if (!isOpen) {
                    item.classList.add('cd-active');
                    a.style.maxHeight = a.scrollHeight + 'px';
                }
            });
        });
        const firstAnswer = document.querySelector('.cd-faq-item.cd-active .cd-faq-a');
        if (firstAnswer) firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
    }
};

// ========================= CONSTRUCTION & DESIGN: BEFORE / AFTER DRAG SLIDER =========================
// WHY: Manages the interactive drag action for before-and-after image frame comparison.
const CdBeforeAfterManager = {
    init() {
        this.frame = document.getElementById('cdBaFrame');
        this.beforeWrap = document.getElementById('cdBaBeforeWrap');
        this.handle = document.getElementById('cdBaHandle');
        if (!this.frame) return;
        this.dragging = false;
        this.bindEvents();
    },
    bindEvents() {
        const move = (clientX) => {
            const rect = this.frame.getBoundingClientRect();
            let pct = ((clientX - rect.left) / rect.width) * 100;
            pct = Math.max(0, Math.min(100, pct));
            this.beforeWrap.style.width = pct + '%';
            this.handle.style.left = pct + '%';
        };

        this.frame.addEventListener('mousedown', (e) => { this.dragging = true; move(e.clientX); });
        window.addEventListener('mouseup', () => this.dragging = false);
        window.addEventListener('mousemove', (e) => { if (this.dragging) move(e.clientX); });

        this.frame.addEventListener('touchstart', (e) => { this.dragging = true; move(e.touches[0].clientX); }, { passive: true });
        window.addEventListener('touchend', () => this.dragging = false);
        window.addEventListener('touchmove', (e) => { if (this.dragging) move(e.touches[0].clientX); }, { passive: true });
    }
};

// ========================= GROWTH SERVICES: SCROLL REVEAL =========================
const GsRevealManager = {
    init() {
        this.els = document.querySelectorAll('#gs-page .gs-fade-in');
        if (!this.els.length) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        this.els.forEach(el => io.observe(el));
    }
};

// ========================= GROWTH SERVICES: DASHBOARD & HERO COUNTERS =========================
const GsCounterManager = {
    init() {
        const meetValEl = document.getElementById('meet-val');
        const counterNums = document.querySelectorAll('#gs-page .counter-num');
        if (!meetValEl && !counterNums.length) return;

        const animateCounter = (el, target, suffix = '') => {
            let current = 0;
            const increment = Math.ceil(target / 60);
            const step = () => {
                current += increment;
                if (current < target) {
                    el.textContent = current.toLocaleString() + suffix;
                    requestAnimationFrame(step);
                } else {
                    el.textContent = target.toLocaleString() + suffix;
                }
            };
            step();
        };

        if (meetValEl) {
            const ioDash = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    animateCounter(meetValEl, 8200);
                    ioDash.disconnect();
                }
            }, { threshold: 0.5 });
            ioDash.observe(meetValEl);
        }

        if (counterNums.length > 0) {
            const ioMetrics = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    counterNums.forEach(num => {
                        const target = parseInt(num.getAttribute('data-target'), 10);
                        animateCounter(num, target);
                    });
                    ioMetrics.disconnect();
                }
            }, { threshold: 0.5 });
            ioMetrics.observe(counterNums[0]);
        }
    }
};

// ========================= GROWTH SERVICES: INTERACTIVE FUNNEL SIMULATOR =========================
const GsFunnelManager = {
    init() {
        const funnelTiers = document.querySelectorAll('#gs-page .funnel-tier');
        const funnelTitle = document.getElementById('funnel-title');
        const funnelSubtitle = document.getElementById('funnel-subtitle');
        const funnelIcon = document.getElementById('funnel-icon');
        const funnelDesc = document.getElementById('funnel-desc');
        const funnelTactics = document.getElementById('funnel-tactics');
        if (!funnelTiers.length) return;

        const funnelData = {
            visitors: {
                title: 'Traffic &amp; Impressions',
                subtitle: 'Top of Funnel (TOFU)',
                icon: 'fa-users',
                desc: 'Targeted promotional runs build massive impressions across key industry segments, ensuring the expo attracts maximum initial visibility.',
                tactics: ['Social &amp; Display Campaigns', 'National Press &amp; Media Partners', 'Targeted Industry Email Lists']
            },
            registrations: {
                title: 'Event Registrants',
                subtitle: 'Middle of Funnel (MOFU)',
                icon: 'fa-file-pen',
                desc: 'Onboard leads through customized registration portals and filter target interests, categories, and business scales.',
                tactics: ['Interactive Landing Pages', 'Nurture Emails &amp; Reminders', 'Exhibitor Directory Previews']
            },
            qualified: {
                title: 'Qualified Target Profiles',
                subtitle: 'Middle of Funnel (MOFU)',
                icon: 'fa-filter',
                desc: 'We manual-screen corporate buyer cohorts, matching them with exhibitors based on procurement budgets and product categories.',
                tactics: ['Buyer Capability Audits', 'Matchmaking Questionnaires', 'Exhibitor Catalog Syncing']
            },
            meetings: {
                title: 'B2B Matches Set',
                subtitle: 'Bottom of Funnel (BOFU)',
                icon: 'fa-calendar-check',
                desc: 'We schedule dedicated 1-on-1 matches in VIP Lounges, ensuring clean business talks with pre-arranged agendas.',
                tactics: ['Dedicated Match Lounges', 'SMS Meeting Notifications', 'Assigned Match Managers']
            },
            deals: {
                title: 'Signed Partnerships',
                subtitle: 'Bottom of Funnel (BOFU)',
                icon: 'fa-suitcase',
                desc: 'Convert pre-arranged matches into signed supplier agreements, joint ventures, or direct distribution arrangements.',
                tactics: ['Private Match Lounges', 'Post-event Pipeline Follow-up', 'Deal Valuation Analytics']
            }
        };

        funnelTiers.forEach(tier => {
            tier.addEventListener('click', () => {
                funnelTiers.forEach(t => t.classList.remove('active-tier'));
                tier.classList.add('active-tier');

                const tierKey = tier.getAttribute('data-tier');
                const data = funnelData[tierKey];

                if (data) {
                    funnelTitle.innerHTML = data.title;
                    funnelSubtitle.innerHTML = data.subtitle;
                    funnelIcon.className = "fas " + data.icon;
                    funnelDesc.innerHTML = data.desc;
                    
                    funnelTactics.innerHTML = '';
                    data.tactics.forEach(tactic => {
                        const item = document.createElement('div');
                        item.className = 'funnel-tactic-item';
                        item.innerHTML = '<i class="fas fa-check"></i> ' + tactic;
                        funnelTactics.appendChild(item);
                    });
                }
            });
        });
    }
};

// ========================= GROWTH SERVICES: INTERACTIVE ROI CALCULATOR =========================
const GsRoiCalculator = {
    init() {
        const attendeesSlider = document.getElementById('attendees-slider');
        const attendeesVal = document.getElementById('attendees-val');
        const industrySelect = document.getElementById('industry-select');
        const leadsOut = document.getElementById('leads-out');
        const matchesOut = document.getElementById('matches-out');
        if (!attendeesSlider) return;

        const calculateROI = () => {
            const pool = parseInt(attendeesSlider.value, 10);
            attendeesVal.textContent = pool.toLocaleString();

            const selectOption = industrySelect.options[industrySelect.selectedIndex];
            const multiplier = parseFloat(selectOption.getAttribute('data-mult'));

            const qualRate = 0.08 * multiplier;
            const leads = Math.round(pool * qualRate);
            const matches = Math.round(leads * 0.22);

            leadsOut.innerHTML = '<span>' + leads.toLocaleString() + '</span>';
            matchesOut.innerHTML = '<span>' + matches.toLocaleString() + '</span>';
        };

        attendeesSlider.addEventListener('input', calculateROI);
        industrySelect.addEventListener('change', calculateROI);
        calculateROI(); // Run once initially
    }
};

// ========================= GROWTH SERVICES: FAQ ACCORDION =========================
const GsFaqManager = {
    init() {
        const faqItems = document.querySelectorAll('#gs-page .faq-item');
        if (!faqItems.length) return;

        faqItems.forEach(item => {
            const trigger = item.querySelector('.faq-trigger');
            const content = item.querySelector('.faq-content');
            
            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('faq-active');
                
                faqItems.forEach(i => {
                    i.classList.remove('faq-active');
                    i.querySelector('.faq-content').style.maxHeight = null;
                });
                
                if (!isActive) {
                    item.classList.add('faq-active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });
        
        // Pre-open the first one
        const firstItem = faqItems[0];
        const firstContent = firstItem.querySelector('.faq-content');
        firstItem.classList.add('faq-active');
        firstContent.style.maxHeight = firstContent.scrollHeight + 'px';
    }
};

// ========================= EXHIBITION MANAGEMENT: HERO INTERACTIVE FLOOR MAP =========================
const EmFloorMapManager = {
    init() {
        const mapZones = document.querySelectorAll('#em-page .map-zone');
        const tickerLog = document.getElementById('tickerLog');
        const zoneInfoText = document.getElementById('zoneInfoText');
        if (!mapZones.length || !tickerLog || !zoneInfoText) return;

        const zoneData = {
            stage: {
                log: "CONNECTED: PLENARY STAGE MONITORS ACTIVE",
                desc: "Primary auditorium setup for international summits and panels. Active audio-visual link monitoring enabled with 12-channel line array calibration."
            },
            halla: {
                log: "CONNECTED: EXHIBITION PAVILION A SIGNAL OK",
                desc: "Allotment grid for tech pavilions and country booths. Displays live crowd density maps and smart climate sensors feedback."
            },
            hallb: {
                log: "CONNECTED: EXHIBITION PAVILION B SYSTEM OK",
                desc: "Heavy industrial and logistics booths grid. Supports machinery setups, reinforced load capacities, and automated guide loops."
            },
            lounge: {
                log: "CONNECTED: VIP LOUNGE ACCESS SECURE",
                desc: "Restricted matchmaking chamber for diplomatic summits and B2B delegate agendas. Features soundproofing and secure network bridges."
            }
        };

        mapZones.forEach(zone => {
            zone.addEventListener('mouseenter', () => {
                mapZones.forEach(z => z.classList.remove('active'));
                zone.classList.add('active');

                const zoneKey = zone.getAttribute('data-zone');
                const info = zoneData[zoneKey];
                if (info) {
                    tickerLog.textContent = info.log;
                    zoneInfoText.textContent = info.desc;
                }
            });
        });
    }
};

// ========================= EXHIBITION MANAGEMENT: INTERACTIVE OPERATIONS LIFECYCLE =========================
const EmLifecycleManager = {
    init() {
        const lifecycleNodes = document.querySelectorAll('#em-page .lifecycle-node');
        const lifecycleIcon = document.getElementById('lifecycleIcon');
        const lifecycleTitle = document.getElementById('lifecycleTitle');
        const lifecycleDesc = document.getElementById('lifecycleDesc');
        const lifecycleTask = document.getElementById('lifecycleTask');
        const lifecycleTech = document.getElementById('lifecycleTech');
        if (!lifecycleNodes.length) return;

        const stepDetails = {
            "1": {
                title: "1. Client Brief & Requirements Consultation",
                icon: "fa-comments",
                desc: "Initial consult meetings to define event scope, space grids, thematic zones, visitor targets, and budgetary constraints.",
                task: "Consultation & Scope",
                tech: "BXSS Client Portal"
            },
            "2": {
                title: "2. Floor Plan Blueprint Designing",
                icon: "fa-drafting-compass",
                desc: "Drafting CAD layout blueprints detailing coordinator stands, emergency exits, electrical lines, and catering zones.",
                task: "AutoCAD Space Grid Layouts",
                tech: "CAD Floor Mapper"
            },
            "3": {
                title: "3. Government & Regulatory Approvals",
                icon: "fa-file-shield",
                desc: "Managing legal clearance files, structural safety audit certificates, police protocol logs, and health board stamps.",
                task: "NOCs & Permit Clearance",
                tech: "BXSS Regulatory Portal"
            },
            "4": {
                title: "4. Custom Stall Construction & Fabrication",
                icon: "fa-hammer",
                desc: "In-house manufacturing of custom wood booths, branded octanorms, and hanging signs at our state-of-the-art facility.",
                task: "Stall Build & Graphics",
                tech: "BXSS Production Workshop"
            },
            "5": {
                title: "5. Smart Visitor Registration Portal",
                icon: "fa-user-plus",
                desc: "Designing visitor landing portals and barcode badge printing systems to ensure smooth check-in.",
                task: "Pre-Reg Database Synced",
                tech: "BXSS Ticket Engine"
            },
            "6": {
                title: "6. Venue Shell Setup & Branding",
                icon: "fa-palette",
                desc: "Mounting custom banners, entrance panels, directional kiosks, safety guidelines, and registration desks.",
                task: "Venue Dress-up",
                tech: "Print Production Center"
            },
            "7": {
                title: "7. Audio-Visual & Systems Sound Rehearsal",
                icon: "fa-volume-high",
                desc: "Sound tuning for keynotes, testing LED walls, calibrating projection arrays, and setting translation lines.",
                task: "Live Cue Direction",
                tech: "Event Command Dashboard"
            },
            "8": {
                title: "8. Continuous Monitoring",
                icon: "fa-desktop",
                desc: "Tracking live stats including entrance queue volumes, network bandwidth usage, VIP safety statuses, and booth request sheets.",
                task: "Traffic Monitoring",
                tech: "Sensors Feed Hub"
            },
            "9": {
                title: "9. Pipeline Business Reporting",
                icon: "fa-chart-pie",
                desc: "Delivering structural audit files, visitor count records, media placement reports, and exhibitor pipeline reviews.",
                task: "Data Analysis",
                tech: "Analytics Reporter"
            }
        };

        lifecycleNodes.forEach(node => {
            node.addEventListener('click', () => {
                lifecycleNodes.forEach(n => n.classList.remove('active'));
                node.classList.add('active');

                const step = node.getAttribute('data-step');
                const details = stepDetails[step];
                if (details) {
                    lifecycleIcon.innerHTML = '<i class="fas ' + details.icon + '"></i>';
                    lifecycleTitle.textContent = details.title;
                    lifecycleDesc.textContent = details.desc;
                    lifecycleTask.textContent = details.task;
                    lifecycleTech.textContent = details.tech;
                }
            });
        });
    }
};

// ========================= EXHIBITION MANAGEMENT: EVENT CONTROL PANEL INTERACTIVE LOGS =========================
const EmControlPanelLogManager = {
    init() {
        const consoleTabs = document.querySelectorAll('#em-page .console-tab');
        const consoleTeamTitle = document.getElementById('consoleTeamTitle');
        const consoleTeamDesc = document.getElementById('consoleTeamDesc');
        const consoleTeamStatus = document.getElementById('consoleTeamStatus');
        const consoleTeamTasks = document.getElementById('consoleTeamTasks');
        const consoleTeamLogs = document.getElementById('consoleTeamLogs');
        const consoleTeamLead = document.getElementById('consoleTeamLead');
        if (!consoleTabs.length) return;

        const divisionData = {
            ops: {
                title: "Operations Control Team",
                desc: "Manages floor logistics, exhibitor support requests, and coordinator assignments.",
                status: "Active",
                lead: "Kamran Ahmed",
                tasks: [
                    "Pre-event floor mapping and exhibitor booth placement verification.",
                    "On-site coordinator tracking and zone task allocation.",
                    "Exhibitor technical request escalation and logistics solving."
                ],
                logs: [
                    { time: "[14:32:05]", text: "Floor sweep completed in Pavilion Hall A." },
                    { time: "[14:35:12]", text: "Exhibitor booth B24 electrical supply restored." },
                    { time: "[14:40:00]", text: "Visitor traffic reporting optimal." }
                ]
            },
            tech: {
                title: "Technical & AV Division",
                desc: "Maintains network links, audio calibrations, screen projections, and translation lines.",
                status: "Monitoring",
                lead: "Imran Qureshi",
                tasks: [
                    "12-channel line array calibration and sound check verification.",
                    "Direct live streaming server link configuration and backup routing.",
                    "On-stage projection screen sync and lighting controller sweeps."
                ],
                logs: [
                    { time: "[14:41:20]", text: "Plenary Stage screen projection synced." },
                    { time: "[14:44:05]", text: "Dual translation channels activated and checked." },
                    { time: "[14:45:00]", text: "Main server backup line reporting online status." }
                ]
            },
            reg: {
                title: "Visitor Registration Control",
                desc: "Maintains printer links, entrance scans, fast-check lines, and badges.",
                status: "Synchronized",
                lead: "Sana Malik",
                tasks: [
                    "Fast check-in printer calibrations and ticket rolls.",
                    "Real-time ticket server database syncing across entry nodes.",
                    "Pre-registered VIP check-in protocols monitoring."
                ],
                logs: [
                    { time: "[14:42:01]", text: "Entrance node scanner 4 recalibrated." },
                    { time: "[14:45:10]", text: "VIP registration desk reporting zero bottleneck." },
                    { time: "[14:45:55]", text: "Database sync complete. Total arrivals: 3,142." }
                ]
            },
            sec: {
                title: "Security & Protocol Division",
                desc: "Zoning gate locks, VIP escorts, bag screening, and fire safety protocols.",
                status: "Secured",
                lead: "Major (R) Tariq",
                tasks: [
                    "Coordinate VIP entry sweeps and personal security detail routing.",
                    "Main entrance gate screening checks monitoring.",
                    "Fire route clearance audits and emergency egress paths check."
                ],
                logs: [
                    { time: "[14:30:15]", text: "VIP transport escort unit 2 dispatched to gate 1." },
                    { time: "[14:42:40]", text: "Egress zone A cleared of supplier logistics." },
                    { time: "[14:46:12]", text: "All gate monitors reporting zero structural breaches." }
                ]
            },
            speaker: {
                title: "Speaker Coordination Desk",
                desc: "Speaker green rooms, panel schedules, stage rehearsals, and mics.",
                status: "Standby",
                lead: "Ayesha Khan",
                tasks: [
                    "Speaker presentation file transfers and formatting sweeps.",
                    "Rehearsal scheduling and wireless lapel microphone tests.",
                    "Backstage queue coordination during pane-swaps."
                ],
                logs: [
                    { time: "[14:35:10]", text: "Keynote presentation loaded onto server." },
                    { time: "[14:44:02]", text: "Speaker lapel mic 3 tested. Frequency: Clean." },
                    { time: "[14:47:00]", text: "Panel 2 speakers gathered in Green Room 1." }
                ]
            },
            support: {
                title: "Visitor Support Desk",
                desc: "Floor coordinators, information desks, maps, and digital help portals.",
                status: "Active",
                lead: "Faisal Shah",
                tasks: [
                    "Interactive kiosk feedback monitoring and diagnostics.",
                    "Onsite coordinator support updates coordination.",
                    "Medical support teams standby coordination."
                ],
                logs: [
                    { time: "[14:31:05]", text: "Interactive kiosk 3 restarted. Software: Sync." },
                    { time: "[14:40:50]", text: "Floor steward team 2 relocated to Hall B." },
                    { time: "[14:47:15]", text: "Incident queue reporting zero active complaints." }
                ]
            }
        };

        consoleTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                consoleTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const teamKey = tab.getAttribute('data-team');
                const data = divisionData[teamKey];

                if (data) {
                    consoleTeamTitle.innerHTML = data.title;
                    consoleTeamDesc.textContent = data.desc;
                    consoleTeamStatus.textContent = data.status;
                    consoleTeamLead.textContent = data.lead;

                    // Set tasks
                    consoleTeamTasks.innerHTML = '';
                    data.tasks.forEach(t => {
                        const li = document.createElement('li');
                        li.textContent = t;
                        consoleTeamTasks.appendChild(li);
                    });

                    // Set logs
                    consoleTeamLogs.innerHTML = '';
                    data.logs.forEach(l => {
                        const entry = document.createElement('div');
                        entry.className = 'log-entry';
                        entry.innerHTML = '<span class="log-time">' + l.time + '</span><span class="log-text">' + l.text + '</span>';
                        consoleTeamLogs.appendChild(entry);
                    });
                }
            });
        });
    }
};

// ========================= EXHIBITION MANAGEMENT: LIVE VISITOR JOURNEY FLOW PROGRESS =========================
const EmVisitorJourneyManager = {
    init() {
        const journeyNodes = document.querySelectorAll('#em-page .journey-node');
        const journeyProgress = document.getElementById('journeyProgress');
        const journeyDetail = document.getElementById('journeyDetail');
        if (!journeyNodes.length || !journeyProgress || !journeyDetail) return;

        const journeyTexts = [
            {
                title: "Step 1: Main Venue Entrance",
                desc: "Visual signages, bag checks, queue control stanchions, and digital directional boards manage the initial massive influx of attendees at venue gates."
            },
            {
                title: "Step 2: Fast-Track Registration Check-in",
                desc: "Attendees use scanned QR code passes at printer kiosks to automatically print their credentials in less than 8 seconds, avoiding lines."
            },
            {
                title: "Step 3: Central Networking Hubs",
                desc: "Coordinators guide visitors into central networking plazas and matching lounges to kick-start initial trade conversations."
            },
            {
                title: "Step 4: Summit Conference Auditoriums",
                desc: "Sound stewards manage theater seating for plenary keynotes, panels, and tech summits, coordinating lighting cues for entry/exit."
            },
            {
                title: "Step 5: Exhibition Pavilions",
                desc: "Floor wardens supervise structural grid walks, keeping exit pathways clear and coordinating exhibitors' logistic needs."
            },
            {
                title: "Step 6: Private Matchmaking Rooms",
                desc: "Protocol executives seat pre-scheduled buyers and sellers for 1-on-1 deals in private VIP suites, managing timing limits."
            },
            {
                title: "Step 7: Exit & Data Surveys",
                desc: "Staff direct the checkout process, collecting digital survey feedback and distributing post-show folders."
            }
        ];

        const updateJourney = (idx) => {
            journeyNodes.forEach((node, nIdx) => {
                node.classList.remove('active', 'passed');
                if (nIdx === idx) {
                    node.classList.add('active');
                } else if (nIdx < idx) {
                    node.classList.add('passed');
                }
            });

            // Update line progress
            const isMobile = window.innerWidth <= 768;
            const pct = (idx / (journeyNodes.length - 1)) * 100;
            
            if (isMobile) {
                journeyProgress.style.height = pct + '%';
                journeyProgress.style.width = '2px';
            } else {
                journeyProgress.style.width = pct + '%';
                journeyProgress.style.height = '2px';
            }

            // Update detail card
            const info = journeyTexts[idx];
            if (info) {
                journeyDetail.innerHTML = '<h4>' + info.title + '</h4><p>' + info.desc + '</p>';
            }
        };

        journeyNodes.forEach(node => {
            node.addEventListener('click', () => {
                const idx = parseInt(node.getAttribute('data-index'), 10);
                updateJourney(idx);
            });
        });

        // Automatically animate the journey timeline on interval
        let currentJourneyIndex = 0;
        const journeyInterval = setInterval(() => {
            currentJourneyIndex = (currentJourneyIndex + 1) % journeyNodes.length;
            updateJourney(currentJourneyIndex);
        }, 6000);

        // Cancel auto-animation if user clicks a step
        journeyNodes.forEach(node => {
            node.addEventListener('click', () => {
                clearInterval(journeyInterval);
            });
        });
    }
};

// ========================= EXHIBITION MANAGEMENT: CORPORATE SOLUTIONS TAB SELECTION =========================
const EmCorporateSolutionsManager = {
    init() {
        const corpBtns = document.querySelectorAll('#em-page .corp-tab-btn');
        const corpPanes = document.querySelectorAll('#em-page .corp-pane');
        if (!corpBtns.length) return;

        corpBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                corpBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const tabKey = btn.getAttribute('data-corp');
                corpPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.getAttribute('id') === 'pane-' + tabKey) {
                        pane.classList.add('active');
                    }
                });
            });
        });
    }
};

// ========================= EXHIBITION MANAGEMENT: STATISTICS KPI ANIMATIONS =========================
const EmKpiCounterManager = {
    init() {
        const kpiVals = document.querySelectorAll('#em-page .kpi-val');
        if (!kpiVals.length) return;
        
        const animateKPI = (el) => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            const suffix = el.getAttribute('data-suffix') || '';
            const format = el.getAttribute('data-format') || '';
            let current = 0;
            const increment = Math.ceil(target / 100);
            
            const step = () => {
                current += increment;
                if (current < target) {
                    if (format === 'million') {
                        el.textContent = (current / 1000000).toFixed(1) + suffix;
                    } else {
                        el.textContent = current.toLocaleString() + suffix;
                    }
                    requestAnimationFrame(step);
                } else {
                    if (format === 'million') {
                        el.textContent = (target / 1000000).toFixed(1) + suffix;
                    } else {
                        el.textContent = target.toLocaleString() + suffix;
                    }
                }
            };
            step();
        };

        const ioKPI = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                kpiVals.forEach(val => animateKPI(val));
                ioKPI.disconnect();
            }
        }, { threshold: 0.2 });
        ioKPI.observe(kpiVals[0]);
    }
};

// ========================= EXHIBITION MANAGEMENT: FAQ ACCORDION =========================
const EmFaqManager = {
    init() {
        const faqItems = document.querySelectorAll('#em-page .faq-item');
        if (!faqItems.length) return;

        faqItems.forEach(item => {
            const trigger = item.querySelector('.faq-trigger');
            const content = item.querySelector('.faq-content');
            
            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('faq-active');
                
                faqItems.forEach(i => {
                    i.classList.remove('faq-active');
                    i.querySelector('.faq-content').style.maxHeight = null;
                });
                
                if (!isActive) {
                    item.classList.add('faq-active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });
        
        // Pre-open first FAQ
        const firstFaq = faqItems[0];
        if (firstFaq) {
            const firstFaqContent = firstFaq.querySelector('.faq-content');
            if (firstFaqContent) {
                firstFaq.classList.add('faq-active');
                firstFaqContent.style.maxHeight = firstFaqContent.scrollHeight + 'px';
            }
        }
    }
};

// ========================= INITIALIZE ALL MODULES =========================
document.addEventListener('DOMContentLoaded', () => {
    NavManager.init();
    StatsManager.init();
    LangManager.init();
    InsightsManager.init();
    ScrollTopManager.init();
    ServicesCarouselManager.init();
    EventsSliderManager.init();
    TestimonialsManager.init();
    PlatformFeaturesManager.init();
    SplitServiceManager.init();
    EventRoleManager.init();
    EventsFilterManager.init();
    FaqAccordionManager.init();
    
    // Services Page specific initializations (from services.html)
    SvcFaqManager.init();
    SvcRevealManager.init();
    SvcCounterManager.init();

    // Construction & Design Page specific initializations (from construction-design.html)
    CdRevealManager.init();
    CdCounterManager.init();
    CdFaqManager.init();
    CdBeforeAfterManager.init();

    // Growth Services Page specific initializations (from growthservices.html)
    GsRevealManager.init();
    GsCounterManager.init();
    GsFunnelManager.init();
    GsRoiCalculator.init();
    GsFaqManager.init();

    // Exhibition Management Page specific initializations (from exhibitionmanagement.html)
    EmFloorMapManager.init();
    EmLifecycleManager.init();
    EmControlPanelLogManager.init();
    EmVisitorJourneyManager.init();
    EmCorporateSolutionsManager.init();
    EmKpiCounterManager.init();
    EmFaqManager.init();
});
