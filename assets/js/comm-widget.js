/* =============================================================================
   COMMUNICATION WIDGET (Phase 17)
   ============================================================================= 
   GLOBAL script, loaded on every page (like main.js/language-manager.js).
   Two small, independent modules:

   1. CommWidget - the WhatsApp FAB + expand panel. Built so a future
      channel is additive: add another <button class="comm-widget-channel-btn">
      inside the existing panel markup and, if it needs its own click
      logic, one more line in bindChannelButtons() - nothing here needs
      restructuring.

   2. StickyCtaAwareness - watches the Event System's sticky CTA bar
      (.elp-sticky-cta / .eds-sticky-cta, Phase 1/5) and lifts this widget
      above it when that bar is visible, so the two never overlap on
      Event Detail pages. Pages without a sticky CTA bar simply never
      trigger this - inert elsewhere, not a per-page conditional.
   ============================================================================= */

const CommWidget = {
    WHATSAPP_NUMBER: '923000777297', // wa.me format: country code + number,
    // no leading zero/plus/dashes. Updated to Badar Expo mobile hotline (+92-300-0777-297).

    init() {
        this.fab = document.getElementById('comm-widget-toggle');
        this.panel = document.getElementById('comm-widget-panel');
        this.closeBtn = document.getElementById('comm-widget-close');
        this.whatsappLink = document.getElementById('comm-widget-whatsapp-link');
        if (!this.fab || !this.panel) return;

        this.buildWhatsAppLink();
        this.bindEvents();
        this.scheduleAppearance();

        // Re-build the pre-filled message if the visitor switches language
        // after the widget has already appeared (LanguageManager, Phase 8).
        if (window.LanguageManager && typeof window.LanguageManager.onChange === 'function') {
            window.LanguageManager.onChange(() => this.buildWhatsAppLink());
        }
    },

    // Shows the FAB shortly after the page has settled, rather than
    // instantly on load - the "smooth appearance" the brief asked for,
    // without tying visibility to scroll position the way .scroll-top-btn
    // does (a persistent contact option should stay reachable throughout
    // the visit, not just after scrolling, per the brief's own framing of
    // this as a communication channel rather than a utility button).
    scheduleAppearance() {
        window.setTimeout(() => {
            this.fab.classList.add('comm-widget-fab--visible');
        }, 700);
    },

    buildWhatsAppLink() {
        const locale = (window.LanguageManager && window.LanguageManager.currentLocale) || 'en';
        const message = locale === 'ur'
            ? 'السلام علیکم، مجھے بدر ایکسپو کی خدمات کے بارے میں معلومات چاہییں۔'
            : "Hi, I'd like to know more about Badar Expo Solutions' services.";
        const url = `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        if (this.whatsappLink) this.whatsappLink.setAttribute('href', url);
    },

    open() {
        this.panel.classList.add('comm-widget-panel--open');
        this.panel.setAttribute('aria-hidden', 'false');
        this.fab.setAttribute('aria-expanded', 'true');
        this.fab.classList.add('comm-widget-fab--open');
        // Move focus into the panel for keyboard/screen-reader users -
        // the close button is the safest first stop (always present,
        // unlike channel buttons which vary in number).
        if (this.closeBtn) this.closeBtn.focus();
    },

    close(returnFocus = true) {
        this.panel.classList.remove('comm-widget-panel--open');
        this.panel.setAttribute('aria-hidden', 'true');
        this.fab.setAttribute('aria-expanded', 'false');
        this.fab.classList.remove('comm-widget-fab--open');
        if (returnFocus) this.fab.focus();
    },

    bindEvents() {
        this.fab.addEventListener('click', () => {
            const isOpen = this.panel.classList.contains('comm-widget-panel--open');
            if (isOpen) this.close(false); else this.open();
        });

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Escape closes the panel, matching the existing convention
        // already used by the search overlay and lightbox (Phase 13).
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.panel.classList.contains('comm-widget-panel--open')) {
                this.close();
            }
        });

        // Click outside closes the panel.
        document.addEventListener('click', (e) => {
            if (!this.panel.classList.contains('comm-widget-panel--open')) return;
            const widget = document.getElementById('comm-widget');
            if (widget && !widget.contains(e.target)) this.close(false);
        });
    }
};

// ========================= STICKY CTA COLLISION AVOIDANCE =========================
const StickyCtaAwareness = {
    init() {
        this.bar = document.querySelector('.elp-sticky-cta, .eds-sticky-cta');
        this.widget = document.getElementById('comm-widget');
        if (!this.bar || !this.widget) return;

        const update = () => this.measure();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    },

    measure() {
        const isVisible = this.bar.classList.contains('elp-sticky-cta-visible')
            || this.bar.classList.contains('eds-sticky-cta--visible');
        const lift = isVisible ? this.bar.getBoundingClientRect().height : 0;
        this.widget.style.setProperty('--comm-widget-lift', `${lift}px`);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    CommWidget.init();
    StickyCtaAwareness.init();
});
