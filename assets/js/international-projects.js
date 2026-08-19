/* =============================================================================
   PAGE-SPECIFIC SCRIPT (international-projects.html)
   ============================================================================= 
   Added during the post-Phase-15 bugfix pass to close the "no page-specific
   JS file" gap flagged for this page. Real, functional content, not a
   placeholder: moves the footer "Get a Free Quote" button's navigation
   out of an inline onclick attribute (harder to maintain, blocked by
   strict CSP) into a proper external event listener. This page has no
   on-page CTA section of its own (it's a Hub page), so the button takes
   the visitor to contact.html - same behavior as before, just no longer
   inline.
   ============================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    const footerCtaBtn = document.querySelector('.footer-aws-btn');

    if (footerCtaBtn) {
        footerCtaBtn.addEventListener('click', () => {
            window.location.href = 'contact.html';
        });
    }
});
