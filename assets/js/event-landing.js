/* =============================================================================
   REUSABLE EVENT LANDING PAGE TEMPLATE (event-landing.js)
   Page-specific JS for event-landing.html only. Follows the same module
   pattern as exhibitionmanagement.js: named, prefixed manager objects
   ("Elp" = Event Landing Page) with an .init() method, initialized together
   in one DOMContentLoaded listener at the bottom (rules.txt Section 5).
   ============================================================================= */

// ========================= FAQ ACCORDION =========================
const ElpFaqManager = {
    init() {
        const faqItems = document.querySelectorAll('#elp-page .elp-faq-item');
        if (!faqItems.length) return;

        faqItems.forEach((item) => {
            const trigger = item.querySelector('.elp-faq-trigger');
            const content = item.querySelector('.elp-faq-content');
            if (!trigger || !content) return;

            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('elp-faq-active');

                faqItems.forEach((i) => {
                    i.classList.remove('elp-faq-active');
                    const c = i.querySelector('.elp-faq-content');
                    if (c) c.style.maxHeight = null;
                });

                if (!isActive) {
                    item.classList.add('elp-faq-active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });

        // Pre-open the first FAQ, matching exhibitionmanagement.js's UX pattern
        const firstItem = faqItems[0];
        const firstContent = firstItem.querySelector('.elp-faq-content');
        if (firstContent) {
            firstItem.classList.add('elp-faq-active');
            firstContent.style.maxHeight = firstContent.scrollHeight + 'px';
        }
    }
};

// ========================= SCHEDULE DAY TABS =========================
const ElpScheduleManager = {
    init() {
        const tabs = document.querySelectorAll('#elp-page .elp-schedule-tab');
        const panels = document.querySelectorAll('#elp-page .elp-schedule-panel');
        if (!tabs.length || !panels.length) return;

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const day = tab.getAttribute('data-day');

                tabs.forEach((t) => {
                    t.classList.remove('elp-schedule-tab-active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('elp-schedule-tab-active');
                tab.setAttribute('aria-selected', 'true');

                panels.forEach((panel) => {
                    const isMatch = panel.getAttribute('data-day-panel') === day;
                    panel.hidden = !isMatch;
                    panel.classList.toggle('elp-schedule-panel-active', isMatch);
                });
            });
        });
    }
};

// ========================= TESTIMONIAL SLIDER =========================
const ElpTestimonialManager = {
    currentIndex: 0,
    slides: [],

    init() {
        this.slides = document.querySelectorAll('#elp-page .elp-testi-slide');
        const prevBtn = document.getElementById('elp-testi-prev');
        const nextBtn = document.getElementById('elp-testi-next');
        if (!this.slides.length || !prevBtn || !nextBtn) return;

        prevBtn.addEventListener('click', () => this.show(this.currentIndex - 1));
        nextBtn.addEventListener('click', () => this.show(this.currentIndex + 1));
    },

    show(index) {
        const total = this.slides.length;
        this.currentIndex = (index + total) % total;

        this.slides.forEach((slide, i) => {
            slide.classList.toggle('elp-testi-slide-active', i === this.currentIndex);
        });
    }
};

// ========================= EVENT STATS COUNTER =========================
// Generic version of main.js's StatsManager pattern (same IntersectionObserver
// + requestAnimationFrame approach), rewritten to use data-target/data-suffix
// attributes instead of hardcoded magic numbers, since every duplicated event
// page will have different stat values.
const ElpStatsManager = {
    init() {
        const statBoxes = document.querySelectorAll('#elp-page .elp-stat-box');
        if (!statBoxes.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const counter = entry.target.querySelector('.elp-stat-num');
                if (!counter) return;

                const target = Number(counter.getAttribute('data-target')) || 0;
                const suffix = counter.getAttribute('data-suffix') || '';
                const speed = Math.max(target / 100, 1);
                let count = 0;

                const update = () => {
                    count += speed;
                    if (count < target) {
                        counter.textContent = Math.floor(count) + suffix;
                        requestAnimationFrame(update);
                    } else {
                        counter.textContent = target + suffix;
                    }
                };

                update();
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.4 });

        statBoxes.forEach((box) => observer.observe(box));
    }
};

// ========================= COUNTDOWN TIMER (Phase 2) =========================
const ElpCountdownManager = {
    init() {
        const wrapper = document.getElementById('elp-countdown');
        if (!wrapper) return;

        const targetDate = new Date(wrapper.getAttribute('data-countdown-date'));
        if (isNaN(targetDate.getTime())) return;

        const daysEl = document.getElementById('elp-cd-days');
        const hoursEl = document.getElementById('elp-cd-hours');
        const minsEl = document.getElementById('elp-cd-mins');
        const secsEl = document.getElementById('elp-cd-secs');
        if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

        const pad = (n) => String(Math.max(n, 0)).padStart(2, '0');

        // Declared before tick() so the first synchronous tick() call below can
        // reference it. Previously `const timerId` sat AFTER tick(), so an
        // already-expired event reached clearInterval(timerId) while timerId was
        // still in the temporal dead zone and threw
        // "Cannot access 'timerId' before initialization".
        let timerId = null;

        const tick = () => {
            const diff = targetDate.getTime() - Date.now();

            if (diff <= 0) {
                daysEl.textContent = '00';
                hoursEl.textContent = '00';
                minsEl.textContent = '00';
                secsEl.textContent = '00';
                if (timerId) clearInterval(timerId);
                const cdSec = wrapper.closest('.elp-countdown-sec');
                if (cdSec) {
                    let notice = cdSec.querySelector('.elp-countdown-notice');
                    if (!notice) {
                        notice = document.createElement('p');
                        notice.className = 'elp-countdown-notice';
                        notice.style.marginTop = '1rem';
                        notice.style.color = '#e2e8f0';
                        notice.style.fontSize = '0.95rem';
                        notice.style.textAlign = 'center';
                        notice.textContent = 'This event has concluded.';
                        cdSec.appendChild(notice);
                    }
                }
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((diff / (1000 * 60)) % 60);
            const secs = Math.floor((diff / 1000) % 60);

            daysEl.textContent = pad(days);
            hoursEl.textContent = pad(hours);
            minsEl.textContent = pad(mins);
            secsEl.textContent = pad(secs);
        };

        tick();
        timerId = setInterval(tick, 1000);
    }
};

// ========================= STICKY CTA (Phase 2) =========================
// Shows the fixed bottom bar once the visitor has scrolled past the hero
// section, using the same IntersectionObserver approach as the rest of the
// site's scroll-driven interactions (main.js StatsManager, this file's own
// ElpStatsManager) rather than a scroll-event listener.
const ElpStickyCtaManager = {
    init() {
        const stickyBar = document.getElementById('elp-sticky-cta');
        const heroSection = document.getElementById('elp-hero-top');
        if (!stickyBar || !heroSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                stickyBar.classList.toggle('elp-sticky-cta-visible', !entry.isIntersecting);
                stickyBar.setAttribute('aria-hidden', entry.isIntersecting ? 'true' : 'false');
            });
        }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' });

        observer.observe(heroSection);
    }
};

// ========================= INITIALIZE ALL MODULES =========================
document.addEventListener('DOMContentLoaded', () => {
    ElpFaqManager.init();
    ElpScheduleManager.init();
    ElpTestimonialManager.init();
    ElpStatsManager.init();
    ElpCountdownManager.init();
    ElpStickyCtaManager.init();
});
