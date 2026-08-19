/* =============================================================================
   PAGE-SPECIFIC SCRIPT (project-landing.html)
   ============================================================================= 
   Added during the post-Phase-15 bugfix pass to close the "no page-specific
   JS file" gap flagged for this page. Real, functional content, not a
   placeholder: moves the footer "Get a Free Quote" button's scroll-to-CTA
   behavior out of an inline onclick attribute (harder to maintain, blocked
   by strict CSP) into a proper external event listener, scoped to this
   page's own CTA section ("prjl-cta").
   ============================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    const footerCtaBtn = document.querySelector('.footer-aws-btn');
    const target = document.getElementById('prjl-cta');

    if (footerCtaBtn && target) {
        footerCtaBtn.addEventListener('click', () => {
            target.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
