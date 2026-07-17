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

// ========================= CONTACT PAGE: FORM HANDLER =========================
// WHY: Binds the submit event of the contact form, prevents default postback,
// shows a success alert, and resets the form. Replaces legacy inline onsubmit.
const ContactFormManager = {
    init() {
        this.form = document.querySelector('.cntpg-form');
        if (!this.form) return;

        this.form.removeAttribute('onsubmit'); // Remove inline handler if present
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for contacting Badar Expo Solutions. Your request has been logged successfully!');
            this.form.reset();
        });
    }
};

// ========================= INITIALIZE ALL MODULES =========================
document.addEventListener('DOMContentLoaded', () => {
    ContactFaqManager.init();
    ContactFormManager.init();
});
