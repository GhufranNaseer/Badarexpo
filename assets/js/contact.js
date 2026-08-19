/* =============================================================================
   BADAR EXPO SOLUTIONS - CONTACT PAGE JAVASCRIPT (contact.js)
   ============================================================================= */

// ========================= CONTACT PAGE: FAQ ACCORDION =========================
// WHY: Manages the expansion and contraction of FAQ items on contact.html.
// Performs smooth height transitions and rotates indicators.
const ContactFaqManager = {
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
        const wasActive = item.classList.contains('active');

        // Close all other items
        document.querySelectorAll('.evtpg-faq-item').forEach(i => {
            i.classList.remove('active');
            const a = i.querySelector('.evtpg-faq-answer');
            if (a) a.style.maxHeight = null;
            const btn = i.querySelector('.evtpg-faq-question');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });

        // Expand clicked item if it was not already active
        if (!wasActive) {
            item.classList.add('active');
            if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
            header.setAttribute('aria-expanded', 'true');
        }
    },

    // Open the first FAQ item's answer by default on load (matches
    // services.html's SvcFaqManager behavior).
    openDefault() {
        const firstActiveAnswer = document.querySelector('.evtpg-faq-item.active .evtpg-faq-answer');
        if (firstActiveAnswer) {
            firstActiveAnswer.style.maxHeight = firstActiveAnswer.scrollHeight + 'px';
        }
    }
};

// ========================= CONTACT PAGE: FORM HANDLER =========================
// WHY: Contact page submission logic now lives entirely in
// assets/js/form-submit-manager.js, shared with events.html and
// exhibitionmanagement.html's forms (Phase 21.1) - this replaces the old,
// page-specific fake-success implementation (localStorage only, never
// reached the business) with the real, honest, shared submission engine.

// ========================= INITIALIZE ALL MODULES =========================
document.addEventListener('DOMContentLoaded', () => {
    ContactFaqManager.init();
    ContactFaqManager.openDefault();

    if (typeof FormSubmitManager !== 'undefined') {
        FormSubmitManager.bind('#bxssContactForm', {
            messages: {
                success: 'Thank you! Your message has been sent to Badar Expo Solutions. We will respond shortly.'
            }
        });
    }
});
