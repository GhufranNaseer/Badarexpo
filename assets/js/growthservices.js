/* =============================================================================
   BADAR EXPO SOLUTIONS - GROWTH SERVICES PAGE JAVASCRIPT (growthservices.js)
   ============================================================================= */

// ========================= GROWTH SERVICES: SCROLL REVEAL =========================
const GsRevealManager = {
    init() {
        this.els = document.querySelectorAll('#gs-page .gs-fade-in');
        if (!this.els.length) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        this.els.forEach(el => io.observe(el));
    }
};

// ========================= GROWTH SERVICES: DASHBOARD & HERO COUNTERS =========================
const GsCounterManager = {
    init() {
        const meetValEl = document.getElementById('meet-val');
        const counterNums = document.querySelectorAll('#gs-page .counter-num');
        if (!meetValEl && !counterNums.length) return;

        const animateCounter = (el, target, suffix = '') => {
            let current = 0;
            const increment = Math.ceil(target / 60);
            const step = () => {
                current += increment;
                if (current < target) {
                    el.textContent = current.toLocaleString() + suffix;
                    requestAnimationFrame(step);
                } else {
                    el.textContent = target.toLocaleString() + suffix;
                }
            };
            step();
        };

        if (meetValEl) {
            const ioDash = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    animateCounter(meetValEl, 8200);
                    ioDash.disconnect();
                }
            }, { threshold: 0.5 });
            ioDash.observe(meetValEl);
        }

        if (counterNums.length > 0) {
            const ioMetrics = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    counterNums.forEach(num => {
                        const target = parseInt(num.getAttribute('data-target'), 10);
                        animateCounter(num, target);
                    });
                    ioMetrics.disconnect();
                }
            }, { threshold: 0.5 });
            ioMetrics.observe(counterNums[0]);
        }
    }
};

// ========================= GROWTH SERVICES: INTERACTIVE FUNNEL SIMULATOR =========================
const GsFunnelManager = {
    init() {
        const funnelTiers = document.querySelectorAll('#gs-page .funnel-tier');
        const funnelTitle = document.getElementById('funnel-title');
        const funnelSubtitle = document.getElementById('funnel-subtitle');
        const funnelIcon = document.getElementById('funnel-icon');
        const funnelDesc = document.getElementById('funnel-desc');
        const funnelTactics = document.getElementById('funnel-tactics');
        if (!funnelTiers.length) return;

        const funnelData = {
            visitors: {
                title: 'Traffic &amp; Impressions',
                subtitle: 'Top of Funnel (TOFU)',
                icon: 'fa-users',
                desc: 'Targeted promotional runs build massive impressions across key industry segments, ensuring the expo attracts maximum initial visibility.',
                tactics: ['Social &amp; Display Campaigns', 'National Press &amp; Media Partners', 'Targeted Industry Email Lists']
            },
            registrations: {
                title: 'Event Registrants',
                subtitle: 'Middle of Funnel (MOFU)',
                icon: 'fa-file-pen',
                desc: 'Onboard leads through customized registration portals and filter target interests, categories, and business scales.',
                tactics: ['Interactive Landing Pages', 'Nurture Emails &amp; Reminders', 'Exhibitor Directory Previews']
            },
            qualified: {
                title: 'Qualified Target Profiles',
                subtitle: 'Middle of Funnel (MOFU)',
                icon: 'fa-filter',
                desc: 'We manual-screen corporate buyer cohorts, matching them with exhibitors based on procurement budgets and product categories.',
                tactics: ['Buyer Capability Audits', 'Matchmaking Questionnaires', 'Exhibitor Catalog Syncing']
            },
            meetings: {
                title: 'B2B Matches Set',
                subtitle: 'Bottom of Funnel (BOFU)',
                icon: 'fa-calendar-check',
                desc: 'We schedule dedicated 1-on-1 matches in VIP Lounges, ensuring clean business talks with pre-arranged agendas.',
                tactics: ['Dedicated Match Lounges', 'SMS Meeting Notifications', 'Assigned Match Managers']
            },
            deals: {
                title: 'Signed Partnerships',
                subtitle: 'Bottom of Funnel (BOFU)',
                icon: 'fa-suitcase',
                desc: 'Convert pre-arranged matches into signed supplier agreements, joint ventures, or direct distribution arrangements.',
                tactics: ['Private Match Lounges', 'Post-event Pipeline Follow-up', 'Deal Valuation Analytics']
            }
        };

        funnelTiers.forEach(tier => {
            tier.addEventListener('click', () => {
                funnelTiers.forEach(t => t.classList.remove('active-tier'));
                tier.classList.add('active-tier');

                const tierKey = tier.getAttribute('data-tier');
                const data = funnelData[tierKey];

                if (data) {
                    funnelTitle.innerHTML = data.title;
                    funnelSubtitle.innerHTML = data.subtitle;
                    funnelIcon.className = "fas " + data.icon;
                    funnelDesc.innerHTML = data.desc;

                    funnelTactics.innerHTML = '';
                    data.tactics.forEach(tactic => {
                        const item = document.createElement('div');
                        item.className = 'funnel-tactic-item';
                        item.innerHTML = '<i class="fas fa-check"></i> ' + tactic;
                        funnelTactics.appendChild(item);
                    });
                }
            });
        });
    }
};

// ========================= GROWTH SERVICES: INTERACTIVE ROI CALCULATOR =========================
const GsRoiCalculator = {
    init() {
        const attendeesSlider = document.getElementById('attendees-slider');
        const attendeesVal = document.getElementById('attendees-val');
        const industrySelect = document.getElementById('industry-select');
        const leadsOut = document.getElementById('leads-out');
        const matchesOut = document.getElementById('matches-out');
        if (!attendeesSlider) return;

        const calculateROI = () => {
            const pool = parseInt(attendeesSlider.value, 10);
            attendeesVal.textContent = pool.toLocaleString();

            const selectOption = industrySelect.options[industrySelect.selectedIndex];
            const multiplier = parseFloat(selectOption.getAttribute('data-mult'));

            const qualRate = 0.08 * multiplier;
            const leads = Math.round(pool * qualRate);
            const matches = Math.round(leads * 0.22);

            leadsOut.innerHTML = '<span>' + leads.toLocaleString() + '</span>';
            matchesOut.innerHTML = '<span>' + matches.toLocaleString() + '</span>';
        };

        attendeesSlider.addEventListener('input', calculateROI);
        industrySelect.addEventListener('change', calculateROI);
        calculateROI(); // Run once initially
    }
};

// ========================= GROWTH SERVICES: FAQ ACCORDION =========================
const GsFaqManager = {
    init() {
        const faqItems = document.querySelectorAll('#gs-page .faq-item');
        if (!faqItems.length) return;

        faqItems.forEach(item => {
            const trigger = item.querySelector('.faq-trigger');
            const content = item.querySelector('.faq-content');

            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('faq-active');

                faqItems.forEach(i => {
                    i.classList.remove('faq-active');
                    i.querySelector('.faq-content').style.maxHeight = null;
                });

                if (!isActive) {
                    item.classList.add('faq-active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });

        // Pre-open the first one
        const firstItem = faqItems[0];
        const firstContent = firstItem.querySelector('.faq-content');
        firstItem.classList.add('faq-active');
        firstContent.style.maxHeight = firstContent.scrollHeight + 'px';
    }
};

// ========================= INITIALIZE ALL MODULES =========================
document.addEventListener('DOMContentLoaded', () => {
    GsRevealManager.init();
    GsCounterManager.init();
    GsFunnelManager.init();
    GsRoiCalculator.init();
    GsFaqManager.init();
});
