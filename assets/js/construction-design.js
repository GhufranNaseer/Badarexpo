/* =============================================================================
   BADAR EXPO SOLUTIONS - CONSTRUCTION DESIGN PAGE JAVASCRIPT (construction-design.js)
   ============================================================================= */

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

// ========================= INITIALIZE ALL MODULES =========================
document.addEventListener('DOMContentLoaded', () => {
    CdRevealManager.init();
    CdCounterManager.init();
    CdFaqManager.init();
    CdBeforeAfterManager.init();
});
