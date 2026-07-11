/* =============================================================================
   BADAR EXPO SOLUTIONS - EVENTS PAGE JAVASCRIPT (events.js)
   ============================================================================= */

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

// ========================= INITIALIZE ALL MODULES =========================
document.addEventListener('DOMContentLoaded', () => {
    EventRoleManager.init();
    EventsFilterManager.init();
    FaqAccordionManager.init();
});
