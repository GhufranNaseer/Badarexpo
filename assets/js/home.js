/* =============================================================================
   BADAR EXPO SOLUTIONS - HOMEPAGE JAVASCRIPT (home.js)
   ============================================================================= */

// ========================= NEW SERVICES CAROUSEL MANAGER (STICKY SCROLL) =========================
const ServicesCarouselManager = {
    init() {
        this.track = document.getElementById("services-scroll-track");
        this.wrapper = document.getElementById("svc-cards-wrapper");
        this.cardsContainer = document.getElementById("svc-cards");
        this.dotsContainer = document.getElementById("svc-mobile-dots");
        if (!this.track || !this.cardsContainer) return;

        this.cards = Array.from(this.cardsContainer.children);
        this.targetTranslateX = 0;
        this.currentTranslateX = 0;
        this.rafId = null;
        this._onResize = null;
        this._onScroll = null;
        this._onWrapperScroll = null;

        // Breakpoint matches the CSS @media (min-width: 1025px) rule.
        // Below it, the CSS already switches to a native scroll-snap carousel,
        // so the JS must NOT keep applying its own transform there.
        this.mq = window.matchMedia("(min-width: 1025px)");
        this.isDesktop = this.mq.matches;

        this.buildMobileDots();
        this.setupMode();

        const handleChange = () => {
            this.isDesktop = this.mq.matches;
            this.teardownDesktop();
            this.teardownMobile();
            this.setupMode();
        };
        if (this.mq.addEventListener) {
            this.mq.addEventListener("change", handleChange);
        } else if (this.mq.addListener) {
            // Safari < 14 fallback
            this.mq.addListener(handleChange);
        }
    },

    setupMode() {
        if (this.isDesktop) {
            this.enableDesktop();
        } else {
            this.enableMobile();
        }
    },

    /* ---------- DESKTOP: sticky scroll-jack pan ---------- */
    enableDesktop() {
        this.calculateMaxScroll();

        this._onResize = () => {
            this.calculateMaxScroll();
            this.updateTarget();
        };
        this._onScroll = () => this.updateTarget();
        this._onLoad = () => {
            this.calculateMaxScroll();
            this.updateTarget();
        };

        window.addEventListener("resize", this._onResize);
        window.addEventListener("scroll", this._onScroll, { passive: true });
        window.addEventListener("load", this._onLoad);

        this.updateTarget();
        this.startRender();
    },

    teardownDesktop() {
        if (this._onResize) window.removeEventListener("resize", this._onResize);
        if (this._onScroll) window.removeEventListener("scroll", this._onScroll);
        if (this._onLoad) window.removeEventListener("load", this._onLoad);
        this.stopRender();
        this.cardsContainer.style.transform = "";
        this.currentTranslateX = 0;
        this.targetTranslateX = 0;
    },

    calculateMaxScroll() {
        // Cache absolute layout metrics once during load/resize to avoid layout thrashing on scroll.
        this.trackOffsetTop = this.track.offsetTop;
        this.trackHeight = this.track.offsetHeight;
        // Full scrollable width of the cards minus the visible viewport width (excluding scrollbars)
        this.maxScroll = this.cardsContainer.scrollWidth - document.documentElement.clientWidth;
        if (this.maxScroll < 0) this.maxScroll = 0;
    },

    updateTarget() {
        // Read window.scrollY dynamically instead of calling track.getBoundingClientRect()
        // on every scroll event, which triggers expensive layout calculations.
        const scrollTop = window.scrollY || window.pageYOffset;
        const trackTop = this.trackOffsetTop - scrollTop;

        // The track's available scrolling height minus one viewport
        const totalScrollableHeight = this.trackHeight - window.innerHeight;

        // Calculate progress based on how far the top of the track has moved past the top of the viewport
        let progress = totalScrollableHeight > 0 ? -trackTop / totalScrollableHeight : 0;

        // Clamp progress between 0 and 1
        progress = Math.max(0, Math.min(1, progress));

        // Update the target horizontal translation
        this.targetTranslateX = progress * -this.maxScroll;
    },

    startRender() {
        const loop = () => {
            const diff = this.targetTranslateX - this.currentTranslateX;
            // Linear interpolation (lerp) for buttery smooth momentum
            if (Math.abs(diff) > 0.05) {
                this.currentTranslateX += diff * 0.08;
                this.cardsContainer.style.transform = `translate3d(${this.currentTranslateX}px, 0, 0)`;
            } else if (this.currentTranslateX !== this.targetTranslateX) {
                // Ensure it settles exactly at the pixel-perfect final target
                this.currentTranslateX = this.targetTranslateX;
                this.cardsContainer.style.transform = `translate3d(${this.currentTranslateX}px, 0, 0)`;
            }

            this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);
    },

    stopRender() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = null;
    },

    /* ---------- MOBILE / TABLET: native scroll-snap + progress dots ---------- */
    enableMobile() {
        if (!this.wrapper) return;
        this._onWrapperScroll = () => this.updateActiveDot();
        this.wrapper.addEventListener("scroll", this._onWrapperScroll, { passive: true });
        this.updateActiveDot();
    },

    teardownMobile() {
        if (this.wrapper && this._onWrapperScroll) {
            this.wrapper.removeEventListener("scroll", this._onWrapperScroll);
        }
    },

    buildMobileDots() {
        if (!this.dotsContainer) return;
        this.dotsContainer.innerHTML = "";
        this.cards.forEach((_, i) => {
            const dot = document.createElement("span");
            dot.className = "pfs-dot-mini" + (i === 0 ? " active" : "");
            this.dotsContainer.appendChild(dot);
        });
    },

    updateActiveDot() {
        if (!this.dotsContainer || !this.wrapper || this.cards.length === 0) return;
        const wrapperCenter = this.wrapper.scrollLeft + this.wrapper.clientWidth / 2;
        let closestIndex = 0;
        let closestDistance = Infinity;
        this.cards.forEach((card, i) => {
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            const distance = Math.abs(cardCenter - wrapperCenter);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
            }
        });
        Array.from(this.dotsContainer.children).forEach((dot, i) => {
            dot.classList.toggle("active", i === closestIndex);
        });
    }
};

// ========================= HOME REVEAL ANIMATIONS =========================
const HomeRevealManager = {
    init() {
        this.aboutRevealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    this.aboutRevealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.about-reveal').forEach(el => this.aboutRevealObserver.observe(el));

        this.corporateRevealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    this.corporateRevealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const corporateContainer = document.querySelector('.corporate-services .editorial-container');
        if (corporateContainer) {
            this.corporateRevealObserver.observe(corporateContainer);
        }
    }
};

// ========================= EVENTS SHOWCASE SLIDER =========================
const EventsSliderManager = {
    init() {
        this.slider = document.getElementById('evt-slider');
        this.track = document.getElementById('evt-slider-track');
        if (!this.slider || !this.track) return;

        this.currentEl = document.getElementById('evt-current');
        this.totalEl = document.getElementById('evt-total');
        this.nextBtn = document.getElementById('evt-next');
        this.prevBtn = document.getElementById('evt-prev');

        // Setup Clones (1 Set before, 1 Set after)
        this.originals = Array.from(this.track.querySelectorAll('.evt-card'));
        this.count = this.originals.length;
        this.totalEl.textContent = this.count;

        // ------------------------------------------------------------------
        // BUG FIX: previously each clone was prepended one-by-one inside the
        // forEach loop. Because prepend() always inserts at the very front,
        // repeatedly prepending in forward order (0,1,2,3,4) silently
        // REVERSED the "before" clone set to (4,3,2,1,0). That mismatch is
        // what caused the erratic jumps / wrong slide showing whenever the
        // slider teleported backwards through the loop.
        //
        // Fix: build the "before" and "after" clone sets in two document
        // fragments (in the correct original order) and insert each
        // fragment as a single block. This guarantees both clone sets keep
        // the same 0,1,2,3,4 order as the real slides.
        // ------------------------------------------------------------------
        const beforeFrag = document.createDocumentFragment();
        const afterFrag = document.createDocumentFragment();

        this.originals.forEach(card => {
            const cloneBefore = card.cloneNode(true);
            const cloneAfter = card.cloneNode(true);
            cloneBefore.classList.add('is-clone');
            cloneAfter.classList.add('is-clone');
            beforeFrag.appendChild(cloneBefore);
            afterFrag.appendChild(cloneAfter);
        });

        this.track.insertBefore(beforeFrag, this.track.firstChild);
        this.track.appendChild(afterFrag);

        this.allCards = Array.from(this.track.querySelectorAll('.evt-card'));
        this.realOffset = this.count; // The index where the real slides start

        // Motion State
        this.activeIndex = 0; // Current active real slide (0-4)
        this.targetX = 0;
        this.currentX = 0;
        this.lerp = 0.08; // Smoothness factor

        // Dimensions
        this.updateDimensions();
        window.addEventListener('resize', () => {
            this.updateDimensions();
            // Re-center on the currently active slide after a resize so the
            // slider doesn't drift out of alignment when card sizes change
            // at different breakpoints.
            this.jumpToReal(((this.activeIndex % this.count) + this.count) % this.count);
        });

        // Initial Position
        this.jumpToReal(0);
        this.currentX = this.targetX;
        this.applyTransform();

        // Interaction
        this.allCards.forEach((card, i) => {
            card.addEventListener('click', () => {
                const realIdx = ((i - this.realOffset) % this.count + this.count) % this.count;
                this.jumpToReal(realIdx);
            });
        });

        this.nextBtn.addEventListener('click', () => this.next());
        this.prevBtn.addEventListener('click', () => this.prev());

        // Animation Loop
        this.animate();
    },

    updateDimensions() {
        if (this.allCards.length < 2) return;
        this.slideStep = this.allCards[1].offsetLeft - this.allCards[0].offsetLeft;
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

    // ------------------------------------------------------------------
    // BUG FIX: the previous "seamless teleportation" relied on a single
    // pre-computed pixel value (slideStep * count) to decide when/how far
    // to snap back after looping. Any tiny rounding mismatch between that
    // assumed value and the real rendered layout would accumulate a little
    // more on every loop — which is exactly why a specific slide (e.g.
    // "IEEEP Fair 2025") would drift out of place every few loops, then
    // "self correct" once you went backward and forward again.
    //
    // Fix: next()/prev() now re-anchor activeIndex back into the safe
    // [0, count-1] range IMMEDIATELY (every click), using the REAL,
    // freshly-measured pixel offset between the two DOM cards involved
    // (old clone-set position vs the equivalent slide in the middle set).
    // Because this delta is measured directly from the DOM every time
    // (not assumed from a cached constant), there is no rounding drift —
    // ever — no matter how long you hold down next/prev.
    // ------------------------------------------------------------------
    moveTo(newActiveIndex) {
        this.activeIndex = newActiveIndex;
        let domIndex = this.activeIndex + this.realOffset;
        let card = this.allCards[domIndex];
        this.targetX = -(card.offsetLeft - (this.slider.offsetWidth / 2) + (card.offsetWidth / 2));

        this.allCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        const displayIdx = ((this.activeIndex % this.count) + this.count) % this.count;
        this.currentEl.textContent = displayIdx + 1;

        // Re-anchor if we've wandered into clone territory
        if (this.activeIndex >= this.count || this.activeIndex < 0) {
            const oldDomIndex = domIndex;
            const wrappedIndex = ((this.activeIndex % this.count) + this.count) % this.count;
            const newDomIndex = wrappedIndex + this.realOffset;
            const delta = this.allCards[newDomIndex].offsetLeft - this.allCards[oldDomIndex].offsetLeft;

            // Shift both currentX and targetX by the exact same real delta
            // so the on-screen position doesn't move even a single pixel —
            // only the internal bookkeeping (activeIndex/domIndex) changes.
            this.currentX -= delta;
            this.targetX -= delta;
            this.activeIndex = wrappedIndex;

            this.allCards.forEach(c => c.classList.remove('active'));
            this.allCards[newDomIndex].classList.add('active');
        }

        this.applyTransform();
    },

    next() {
        this.moveTo(this.activeIndex + 1);
    },

    prev() {
        this.moveTo(this.activeIndex - 1);
    },

    applyTransform() {
        this.track.style.transform = `translate3d(${this.currentX}px, 0, 0)`;
    },

    animate() {
        this.currentX += (this.targetX - this.currentX) * this.lerp;
        this.applyTransform();
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

        // ------------------------------------------------------------------
        // BUG FIX: the original code only cloned an "after" set, so the
        // slider could only loop seamlessly going FORWARD. Clicking "prev"
        // from the very first card animated the track into empty space
        // (nothing existed before index 0 in the DOM) before instantly
        // snapping to the last card — a visible glitch.
        //
        // Fix: build BOTH a "before" and an "after" clone set, each in the
        // correct original order via a DocumentFragment (a naive per-item
        // prepend() would silently reverse the "before" set's order — a
        // mistake worth avoiding here too).
        // ------------------------------------------------------------------
        const beforeFrag = document.createDocumentFragment();
        const afterFrag = document.createDocumentFragment();
        this.cards.forEach(card => {
            const cloneBefore = card.cloneNode(true);
            const cloneAfter = card.cloneNode(true);
            cloneBefore.classList.add('is-clone');
            cloneAfter.classList.add('is-clone');
            beforeFrag.appendChild(cloneBefore);
            afterFrag.appendChild(cloneAfter);
        });
        this.track.insertBefore(beforeFrag, this.track.firstChild);
        this.track.appendChild(afterFrag);

        this.allCards = Array.from(this.track.querySelectorAll('.testimonial-card'));
        this.realOffset = this.originalCount; // where the real (non-clone) cards start in the DOM
        this.currentIndex = 0; // always kept within [0, originalCount - 1]
        this.isTransitioning = false;

        this.updateDimensions();
        this.setPositionInstant();

        window.addEventListener('resize', () => {
            this.updateDimensions();
            // BUG FIX: card width is fluid/responsive at some breakpoints
            // (e.g. mobile). The original code recalculated dimensions on
            // resize but never reapplied the transform, so resizing could
            // leave the slider showing a partially cut-off card until the
            // next click. Re-snap instantly (no visible transition) instead.
            this.setPositionInstant();
        });

        this.nextBtn.addEventListener('click', () => this.move(1));
        this.prevBtn.addEventListener('click', () => this.move(-1));

        this.setupEntranceAnimation();
    },

    updateDimensions() {
        if (this.allCards.length < 2) return;
        // BUG FIX: gap was hardcoded to 32, but the CSS changes it to 25px
        // at the 1200px breakpoint — the hardcoded value silently went out
        // of sync with the real layout, causing cards to be mis-positioned
        // (partially cut off) on tablet widths. Read it from the actual
        // computed style instead, so it always matches whatever the CSS
        // currently says, at any breakpoint.
        const trackStyles = getComputedStyle(this.track);
        const parsedGap = parseFloat(trackStyles.columnGap || trackStyles.gap);
        this.gap = Number.isFinite(parsedGap) ? parsedGap : 32;
        this.cardWidth = this.allCards[this.realOffset].offsetWidth;
        this.step = this.cardWidth + this.gap;
    },

    domIndexFor(index) {
        return index + this.realOffset;
    },

    updatePosition() {
        const domIndex = this.domIndexFor(this.currentIndex);
        const x = -(domIndex * this.step);
        this.track.style.transform = `translate3d(${x}px, 0, 0)`;
    },

    setPositionInstant() {
        const restoreTransition = this.track.style.transition || 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        this.track.style.transition = 'none';
        this.updatePosition();
        this.track.offsetHeight; // force reflow
        this.track.style.transition = restoreTransition;
    },

    move(direction) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        this.currentIndex += direction;
        this.updatePosition();

        // Infinite teleport: once the animation finishes, if we've drifted
        // into a clone set, snap (invisibly, no transition) back into the
        // real [0, originalCount-1] range. Because every card — real or
        // clone — has the identical fixed width/gap, this step-based jump
        // is exact with no accumulated drift.
        setTimeout(() => {
            if (this.currentIndex >= this.originalCount) {
                this.currentIndex = 0;
                this.setPositionInstant();
            } else if (this.currentIndex < 0) {
                this.currentIndex = this.originalCount - 1;
                this.setPositionInstant();
            }
            this.isTransitioning = false;
        }, 600);
    },

    setupEntranceAnimation() {
        const observerOptions = { threshold: 0.2 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.allCards.forEach((card, i) => {
                        // BUG FIX: with the new "before" clone set added,
                        // the real cards no longer start at index 0 — they
                        // start at `realOffset`. The original check
                        // (`i < originalCount`) would have staggered the
                        // BEFORE-CLONES instead of the actual visible real
                        // cards. Use the real range explicitly.
                        const isRealCard = i >= this.realOffset && i < this.realOffset + this.originalCount;
                        if (isRealCard) {
                            const staggerIndex = i - this.realOffset;
                            setTimeout(() => {
                                card.style.opacity = "1";
                                card.style.transform = "translateY(0px)";
                            }, staggerIndex * 100);
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
        this.track = document.getElementById('pfs-cards-track');
        this.dotsWrap = document.getElementById('pfs-dots-container');
        this.prevBtn = document.getElementById('pfs-prev-btn');
        this.nextBtn = document.getElementById('pfs-next-btn');

        if (!this.track || !this.prevBtn || !this.nextBtn) return;

        this.cards = Array.from(this.track.querySelectorAll('.pfs-card'));
        this.totalCards = this.cards.length;
        this.current = 0; // current slide index (left-most visible card)

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
        this.prevBtn.style.opacity = this.current === 0 ? '0.35' : '1';
        this.nextBtn.style.opacity = this.current >= this.maxIndex ? '0.35' : '1';
    }
};

// ========================= FEATURED INSIGHTS =========================
const InsightsManager = {
            init() {
                // 1. Scroll Reveal Animation for Cards
                const cards = document.querySelectorAll('.insights-section .card');

                // Mobile pe cards horizontal carousel ki tarah chalti hain (see CSS: max-width:1024px).
                // Wahan hide-then-reveal-on-scroll animation confusing hai: baad wale cards
                // screen se bahar hone ki wajah se invisible reh jaate hain, aur first-time
                // visitor ko pata hi nahi chalta ke swipe karke aur cards dekhi ja sakti hain.
                // Is liye carousel mode mein hum sab cards turant visible kar dete hain —
                // desktop grid ka reveal-on-scroll waisay ka waisay rehta hai.
                const isCarouselMode = window.matchMedia('(max-width: 1024px)').matches;

                if (isCarouselMode) {
                    cards.forEach(card => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                } else {
                    cards.forEach(card => {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(40px)';
                        card.style.transition = 'opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
                    });

                    const observerOptions = {
                        root: null,
                        rootMargin: '0px',
                        threshold: 0.15
                    };

                    const cardObserver = new IntersectionObserver((entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const index = Array.from(cards).indexOf(entry.target);
                                const delay = (index % 3) * 150; // Stagger effect

                                setTimeout(() => {
                                    entry.target.style.opacity = '1';
                                    entry.target.style.transform = 'translateY(0)';
                                }, delay);

                                observer.unobserve(entry.target);
                            }
                        });
                    }, observerOptions);

                    cards.forEach(card => cardObserver.observe(card));
                }

                // 2. Subtle 3D Tilt Effect on Mouse Move (skipped on touch devices)
                const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

                if (!isTouchDevice) {
                    cards.forEach(card => {
                        card.addEventListener('mousemove', (e) => {
                            const rect = card.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;

                            const centerX = rect.width / 2;
                            const centerY = rect.height / 2;

                            const rotateX = ((y - centerY) / centerY) * -5;
                            const rotateY = ((x - centerX) / centerX) * 5;

                            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                            card.style.transition = 'transform 0.1s ease';
                        });

                        card.addEventListener('mouseleave', () => {
                            card.style.transform = '';
                            card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease';
                        });
                    });
                }

                // 3. Click/Tap Toggle logic for touch devices (reveal description on click/tap)
                const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
                if (isTouch) {
                    cards.forEach(card => {
                        card.addEventListener('click', (e) => {
                            // If user clicked the "Read More" link, let it proceed
                            if (e.target.closest('.card-link')) {
                                return;
                            }

                            if (!card.classList.contains('active')) {
                                // Prevent default actions / routing
                                e.preventDefault();
                                e.stopPropagation();

                                // Close all other active cards
                                cards.forEach(c => c.classList.remove('active'));

                                // Open clicked card
                                card.classList.add('active');
                            } else {
                                // Toggle off if clicked again
                                e.preventDefault();
                                card.classList.remove('active');
                            }
                        });
                    });

                    // Close any active card when clicking outside
                    document.addEventListener('click', (e) => {
                        if (!e.target.closest('.card')) {
                            cards.forEach(card => card.classList.remove('active'));
                        }
                    });
                }
            }
        };


// ========================= CLIENTS MARQUEE CENTER-FOCUS =========================
const ClientsMarqueeManager = {
    init() {
        const container = document.getElementById('marquee-container');
        const track = document.getElementById('marquee-track');
        if (!container || !track) return;

        const items = Array.from(track.querySelectorAll('.marquee-item'));
        if (!items.length) return;

        const CHECK_INTERVAL = 90; // ms between real measurements (~11/sec)

        let rafId = null;
        let lastFocused = null;
        let lastCheck = 0;
        let containerLeft = 0;
        let containerRight = 0;
        let containerCenterX = 0;

        const measureContainer = () => {
            const rect = container.getBoundingClientRect();
            containerLeft = rect.left;
            containerRight = rect.right;
            containerCenterX = rect.left + rect.width / 2;
        };

        const setFocused = (newItem) => {
            if (newItem === lastFocused) return;
            if (lastFocused) lastFocused.classList.remove('in-focus');
            if (newItem) newItem.classList.add('in-focus');
            lastFocused = newItem;
        };

        const tick = (now) => {
            rafId = requestAnimationFrame(tick);

            // Nothing moves while paused (e.g. hovering the marquee) — skip all
            // measurement work and leave whatever was already highlighted.
            if (getComputedStyle(track).animationPlayState === 'paused') return;

            if (now - lastCheck < CHECK_INTERVAL) return;
            lastCheck = now;

            let containingItem = null;
            let closestItem = null;
            let closestDist = Infinity;

            for (const item of items) {
                const rect = item.getBoundingClientRect();

                // Skip items fully outside the visible container.
                if (rect.right < containerLeft || rect.left > containerRight) continue;

                // Exact match: this item's box currently spans the center point.
                if (rect.left <= containerCenterX && rect.right >= containerCenterX) {
                    containingItem = item;
                    break;
                }

                const itemCenterX = rect.left + rect.width / 2;
                const dist = Math.abs(itemCenterX - containerCenterX);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestItem = item;
                }
            }

            setFocused(containingItem || closestItem);
        };

        measureContainer();

        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(measureContainer, 150);
        });

        // Respect prefers-reduced-motion: don't bother running the highlight
        // loop if the marquee itself isn't animating.
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            rafId = requestAnimationFrame(tick);
        }

        // Pause the highlight loop when the tab isn't visible, to save battery/CPU.
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = null;
            } else if (!rafId && !prefersReducedMotion) {
                lastCheck = 0;
                rafId = requestAnimationFrame(tick);
            }
        });
    }
};

// ========================= PREMIUM ABOUT US (STORY SECTION) =========================
const StorySectionManager = {
    init() {
        var root = document.getElementById('our-story');
        if (!root) return;

        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        /* ---- generic reveal-on-scroll ---- */
        var revealTargets = root.querySelectorAll('.story-reveal, .story-headline, .story-photo, .story-timeline-wrap');
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

        revealTargets.forEach(function (el) { revealObserver.observe(el); });

        /* ---- count-up stats ---- */
        function easeOutQuad(t) { return t * (2 - t); }

        function animateCount(el, target) {
            if (prefersReducedMotion) {
                el.textContent = target.toLocaleString();
                return;
            }
            var duration = 1600;
            var start = null;

            function step(timestamp) {
                if (start === null) start = timestamp;
                var progress = Math.min((timestamp - start) / duration, 1);
                var eased = easeOutQuad(progress);
                el.textContent = Math.floor(eased * target).toLocaleString();
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    el.textContent = target.toLocaleString();
                }
            }
            window.requestAnimationFrame(step);
        }

        var ledgerRows = root.querySelectorAll('.story-ledger-row[data-count]');
        var countObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var row = entry.target;
                    var target = parseInt(row.getAttribute('data-count'), 10) || 0;
                    var numEl = row.querySelector('.ledger-num');
                    if (numEl) animateCount(numEl, target);
                    countObserver.unobserve(row);
                }
            });
        }, { threshold: 0.4 });

        ledgerRows.forEach(function (row) { countObserver.observe(row); });

        /* ---- subtle photo tilt on pointer devices only ---- */
        var photo = root.querySelector('.story-photo');
        if (photo && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion) {
            var img = photo.querySelector('img');
            photo.addEventListener('mousemove', function (e) {
                var rect = photo.getBoundingClientRect();
                var x = (e.clientX - rect.left) / rect.width - 0.5;
                var y = (e.clientY - rect.top) / rect.height - 0.5;
                img.style.transform = 'scale(1.04) translate(' + (x * -12) + 'px,' + (y * -12) + 'px)';
            });
            photo.addEventListener('mouseleave', function () {
                img.style.transform = '';
            });
        }
    }
};

// ========================= INITIALIZE ALL MODULES =========================
document.addEventListener('DOMContentLoaded', () => {
    ServicesCarouselManager.init();
    HomeRevealManager.init();
    EventsSliderManager.init();
    TestimonialsManager.init();
    PlatformFeaturesManager.init();
    InsightsManager.init();
    ClientsMarqueeManager.init();
    StorySectionManager.init();
});
