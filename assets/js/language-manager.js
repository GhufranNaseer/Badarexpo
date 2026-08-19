/* =============================================================================
   LANGUAGE MANAGER (language-manager.js)
   =============================================================================
   Phase 8: ACTIVE implementation of the Phase 7 i18n architecture. Loaded on
   every page (linked after main.js, before mobile-mega-menu.js - see any
   page's <head>/script order).

   IMPLEMENTATION NOTE (deviation from the Phase 7 doc, made explicitly
   during this phase - documented here and in data.txt Session 28): Phase 7
   recommended a /en/ /ur/ URL-prefix strategy for a FUTURE build-time/CMS
   setup. This phase's brief explicitly forbids "duplicated HTML" and
   "duplicated layouts" - generating a full parallel /ur/*.html page set
   would BE that duplication. So this implementation instead does IN-PLACE
   client-side switching: same URL, the DOM's [data-i18n] text and the
   <html lang/dir> attributes update live. This is upgrade-compatible with
   the URL-prefix approach later (the bundle-loading and t() resolution
   logic below stays identical either way) without being a redesign now.

   Reads: /locales/{lang}/{namespace}.json (7 namespaces, matches
   translation-schema.json). Writes: <html lang dir>, [data-i18n] element
   text, [data-i18n-placeholder] attributes, localStorage (persisted
   preference), body.rtl-mode (kept for backward compatibility with any
   CSS still targeting the old stub class - see i18n-architecture.md
   Section 0).
   ============================================================================= */

const LanguageManager = {
    NAMESPACES: ['common', 'nav', 'buttons', 'forms', 'messages', 'eventsUi', 'pages'],
    SUPPORTED_LOCALES: ['en', 'ur'], // 'ar' intentionally not enabled yet -
    // the switcher UI already lists it (data-lang="ar"); adding real
    // support later is just an /locales/ar/ folder + this array, per
    // i18n-architecture.md Section 6.
    DEFAULT_LOCALE: 'en',
    STORAGE_KEY: 'bxss-locale',

    currentLocale: null,
    currentBundle: null,
    listeners: [],

    // ---- locale resolution ----
    getStoredLocale() {
        try {
            return window.localStorage.getItem(this.STORAGE_KEY);
        } catch (e) {
            return null; // localStorage can throw in some privacy modes
        }
    },

    resolveInitialLocale() {
        const stored = this.getStoredLocale();
        if (stored && this.SUPPORTED_LOCALES.includes(stored)) return stored;

        const browserLang = (navigator.language || '').slice(0, 2);
        if (this.SUPPORTED_LOCALES.includes(browserLang)) return browserLang;

        return this.DEFAULT_LOCALE;
    },

    // ---- loading ----
    async loadBundle(locale) {
        const results = await Promise.all(
            this.NAMESPACES.map((ns) =>
                fetch(`locales/${locale}/${ns}.json`)
                    .then((r) => (r.ok ? r.json() : {}))
                    .catch(() => ({}))
            )
        );

        const bundle = {};
        this.NAMESPACES.forEach((ns, i) => { bundle[ns] = results[i]; });
        return bundle;
    },

    // ---- key resolution with fallback ----
    // "buttons.registerNow" -> bundle.buttons.registerNow. Falls back to
    // the caller-supplied fallback (usually the English text already
    // sitting in the HTML) so a missing key NEVER renders blank.
    t(key, fallbackText) {
        if (!this.currentBundle) return fallbackText !== undefined ? fallbackText : key;

        const value = key.split('.').reduce(
            (obj, part) => (obj && typeof obj === 'object' ? obj[part] : undefined),
            this.currentBundle
        );

        if (typeof value === 'string') return value;
        return fallbackText !== undefined ? fallbackText : key;
    },

    // Interpolation helper for strings containing {{token}} placeholders
    // (e.g. messages.noResultsFoundDesc - see translation-schema.json).
    interpolate(str, vars) {
        if (!vars) return str;
        return Object.keys(vars).reduce((result, key) => {
            const escapedKey = key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            return result.replace(new RegExp(`{{\\s*${escapedKey}\\s*}}`, 'g'), vars[key]);
        }, str);
    },

    // ---- DOM application ----
    applyToDom(root = document) {
        root.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (el.dataset.i18nFallback === undefined) {
                el.dataset.i18nFallback = el.textContent;
            }
            el.textContent = this.t(key, el.dataset.i18nFallback);
        });

        root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (el.dataset.i18nPlaceholderFallback === undefined) {
                el.dataset.i18nPlaceholderFallback = el.getAttribute('placeholder') || '';
            }
            el.setAttribute('placeholder', this.t(key, el.dataset.i18nPlaceholderFallback));
        });

        root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
            const key = el.getAttribute('data-i18n-aria-label');
            if (el.dataset.i18nAriaFallback === undefined) {
                el.dataset.i18nAriaFallback = el.getAttribute('aria-label') || '';
            }
            el.setAttribute('aria-label', this.t(key, el.dataset.i18nAriaFallback));
        });
    },

    // ---- document-level attributes ----
    applyDocumentAttributes(locale, direction) {
        document.documentElement.setAttribute('lang', locale);
        document.documentElement.setAttribute('dir', direction);

        // Keeps the pre-existing body.rtl-mode stub (main.js/navbar.css,
        // see i18n-architecture.md Section 0) working for anything still
        // referencing it, while rtl-overrides.css (Phase 8) keys off the
        // more standard [dir="rtl"] attribute selector for everything new.
        document.body.classList.toggle('rtl-mode', direction === 'rtl');
    },

    // ---- persistence ----
    persistLocale(locale) {
        try {
            window.localStorage.setItem(this.STORAGE_KEY, locale);
        } catch (e) {
            // Persistence is a nice-to-have, not required for the current
            // session to function correctly in the selected language.
        }
    },

    // ---- subscribe to locale changes (used by pages with dynamic,
    // JS-rendered content - e.g. events-calendar.js re-rendering event
    // cards with translated chrome text after a language switch) ----
    onChange(callback) {
        this.listeners.push(callback);
    },

    notifyListeners() {
        this.listeners.forEach((cb) => {
            try { cb(this.currentLocale, this.currentBundle); } catch (e) { /* one bad listener shouldn't break the rest */ }
        });
    },

    // ---- public entry point (called once, on page load) ----
    async init() {
        const locale = this.resolveInitialLocale();
        await this.setLocale(locale, { persist: false, silent: true });
        this.wireSwitcherActiveState();
    },

    // ---- core switch logic (in-place, no navigation - see file header) ----
    async setLocale(locale, { persist = true, silent = false } = {}) {
        if (!this.SUPPORTED_LOCALES.includes(locale)) return;

        this.currentBundle = await this.loadBundle(locale);
        this.currentLocale = locale;

        const direction = (locale === 'ur' || locale === 'ar') ? 'rtl' : 'ltr';
        this.applyDocumentAttributes(locale, direction);
        this.applyToDom();

        if (persist) this.persistLocale(locale);
        this.wireSwitcherActiveState();
        if (!silent) this.notifyListeners();
    },

    async switchTo(locale) {
        await this.setLocale(locale, { persist: true, silent: false });
    },

    // ---- reflect the active language in the switcher UI itself ----
    // Only #current-lang needs setting directly - mobile-mega-menu.js
    // already has a MutationObserver syncing #mobile-current-lang from it
    // (see that file, "Keep the mobile label in sync"), so duplicating
    // that here would just fight the existing, working mechanism.
    wireSwitcherActiveState() {
        const currentLangText = document.getElementById('current-lang');
        if (currentLangText) currentLangText.textContent = this.currentLocale.toUpperCase();

        document.querySelectorAll('.lang-list li').forEach((item) => {
            item.classList.toggle('active-lang', item.getAttribute('data-lang') === this.currentLocale);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    LanguageManager.init();
});
