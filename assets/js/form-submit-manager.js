/* =============================================================================
   FORM SUBMIT MANAGER (Phase 21.1)
   ============================================================================= 
   ONE shared submission engine for every lead-generation form on the site
   (contact.html, events.html's inquiry form, exhibitionmanagement.html's
   operations meeting form). Replaces three separate, inconsistent
   implementations (a fake-success alert() on two forms, and a
   localStorage-only "success" on the third - none of which ever
   transmitted data anywhere real).

   HONESTY BY DESIGN: this module never fakes success. If ENDPOINT below
   is empty (no backend exists yet), it shows the visitor an honest
   message explaining the form isn't connected yet and offers the site's
   real phone/email as a fallback - and logs a clear, loud warning for
   whoever wires up the real endpoint later. The moment a real backend
   exists, setting FormSubmitManager.ENDPOINT to that URL is the only
   change needed here - every form on the site starts working immediately,
   no per-page changes required.

   Each page's own script (contact.js / events.js / exhibitionmanagement.js)
   just calls FormSubmitManager.bind(selector, options) once - all loading
   state, validation, timeout handling, double-submit prevention, and
   success/error feedback lives here, once, instead of being duplicated
   three times with three different behaviors as it was before.
   ============================================================================= */

const FormSubmitManager = {
    // ---- CONFIGURATION ----
    // Single point of integration. Empty string = no backend wired up yet.
    // Set this to a real endpoint URL when one exists; nothing else in this
    // file, or in any of the three pages using it, needs to change.
    ENDPOINT: '',

    TIMEOUT_MS: 15000,

    // ---- PUBLIC API ----
    // Binds one form. Call once per form, after DOMContentLoaded.
    // options:
    //   messages: { success, notConfigured, networkError, timeout, serverError, validation }
    //     - each is a { key, fallback } pair resolved via LanguageManager.t()
    //   extraFields: () => ({ ...extra key/value pairs to include in the payload })
    bind(formSelector, options = {}) {
        const form = document.querySelector(formSelector);
        if (!form) return;

        form.removeAttribute('onsubmit');
        form.setAttribute('novalidate', ''); // we call reportValidity() ourselves,
        // so the browser's own bubble still appears but we control timing/state
        // around it (can't show a "submitting" spinner AND let native validation
        // silently block the submit event with no visual feedback of why).

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (form.dataset.submitting === 'true') return; // prevent double submission
            this._handleSubmit(form, options);
        });
    },

    // ---- INTERNAL ----
    async _handleSubmit(form, options) {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        form.dataset.submitting = 'true';
        this._setLoading(form, submitBtn, true);

        if (!this.ENDPOINT) {
            // No real backend configured. Do NOT fake success - tell the
            // visitor plainly, and make this impossible for a developer to
            // miss in the console.
            console.warn(
                '[FormSubmitManager] No submission endpoint configured. ' +
                'Set FormSubmitManager.ENDPOINT in assets/js/form-submit-manager.js ' +
                'before this form can actually deliver messages to Badar Expo Solutions.'
            );
            await this._delay(400); // matches the perceived weight of a real attempt,
            // rather than an instant, suspicious-looking "failure"
            this._setLoading(form, submitBtn, false);
            form.dataset.submitting = 'false';
            this._showFeedback(form, 'notice', this._resolveMessage(options, 'notConfigured',
                "This form isn't connected yet. Please reach us directly by phone or email in the meantime - both are listed below."));
            return;
        }

        const payload = this._buildPayload(form, options);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

        try {
            const response = await fetch(this.ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`server-${response.status}`);
            }

            this._showFeedback(form, 'success', this._resolveMessage(options, 'success',
                'Thank you! Your message has been sent successfully. We will respond shortly.'));
            form.reset();
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                this._showFeedback(form, 'error', this._resolveMessage(options, 'timeout',
                    "That took longer than expected. Please check your connection and try again."));
            } else if (String(err.message || '').startsWith('server-')) {
                this._showFeedback(form, 'error', this._resolveMessage(options, 'serverError',
                    "Something went wrong on our end. Please try again in a moment, or contact us directly."));
            } else {
                this._showFeedback(form, 'error', this._resolveMessage(options, 'networkError',
                    "We couldn't reach our server. Please check your connection and try again."));
            }
        } finally {
            this._setLoading(form, submitBtn, false);
            form.dataset.submitting = 'false';
        }
    },

    _buildPayload(form, options) {
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        if (typeof options.extraFields === 'function') {
            Object.assign(payload, options.extraFields());
        }
        payload.sourcePage = window.location.pathname;
        payload.submittedAt = new Date().toISOString();
        payload.locale = (window.LanguageManager && window.LanguageManager.currentLocale) || 'en';
        return payload;
    },

    _resolveMessage(options, key, fallback) {
        const configured = options.messages && options.messages[key];
        const text = configured || fallback;
        return (window.LanguageManager && typeof window.LanguageManager.t === 'function')
            ? window.LanguageManager.t(`forms.feedback.${key}`, text)
            : text;
    },

    _setLoading(form, submitBtn, isLoading) {
        form.setAttribute('aria-busy', isLoading ? 'true' : 'false');
        if (!submitBtn) return;
        if (isLoading) {
            submitBtn.dataset.originalContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            const sendingLabel = this._resolveMessage({}, 'sending', 'Sending...');
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> ${sendingLabel}`;
        } else {
            submitBtn.disabled = false;
            if (submitBtn.dataset.originalContent) {
                submitBtn.innerHTML = submitBtn.dataset.originalContent;
            }
        }
    },

    _delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    },

    // ---- FEEDBACK TOAST ----
    // One shared toast element, type-aware (success / error / notice), reused
    // across all forms - same visual language across the whole site instead
    // of three different ad-hoc implementations.
    _showFeedback(form, type, message) {
        let toast = document.getElementById('bxss-form-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'bxss-form-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }

        const icons = {
            success: '<i class="fas fa-circle-check bxss-form-toast-icon bxss-form-toast-icon--success" aria-hidden="true"></i>',
            error: '<i class="fas fa-circle-exclamation bxss-form-toast-icon bxss-form-toast-icon--error" aria-hidden="true"></i>',
            notice: '<i class="fas fa-circle-info bxss-form-toast-icon bxss-form-toast-icon--notice" aria-hidden="true"></i>'
        };

        toast.className = `bxss-form-toast bxss-form-toast--${type} bxss-form-toast--visible`;
        toast.innerHTML = `${icons[type] || icons.notice} <div>${message}</div>`;

        clearTimeout(this._hideTimer);
        this._hideTimer = setTimeout(() => {
            toast.classList.remove('bxss-form-toast--visible');
        }, type === 'success' ? 5000 : 7000);

        // Return focus to a sensible place for keyboard/screen-reader users -
        // the first field on success (form was reset, ready for another
        // entry if needed), or the submit button on error (so they can
        // retry immediately without hunting for it).
        if (type === 'success') {
            const firstField = form.querySelector('input, select, textarea');
            if (firstField) firstField.focus();
        } else {
            const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn) submitBtn.focus();
        }
    }
};
