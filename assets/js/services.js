/* =============================================================================
   BADAR EXPO SOLUTIONS - SERVICES PAGE JAVASCRIPT (services.js)
   ============================================================================= */

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

// ========================= INITIALIZE ALL MODULES =========================
document.addEventListener('DOMContentLoaded', () => {
    SvcFaqManager.init();
    SvcRevealManager.init();
    SvcCounterManager.init();
});
