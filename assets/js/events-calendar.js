/* =============================================================================
   EVENT CALENDAR / DISCOVERY PAGE (events-calendar.js)
   ============================================================================= 
   Phase 5: PAGE-SPECIFIC glue only. Holds an in-memory sample dataset
   (shaped per event-schema.json's summary-relevant fields) and wires it to
   EdsDiscovery.init() (event-discovery-components.js). No filtering/
   rendering logic lives here - this file's only job is to provide data and
   DOM selectors, matching the same pattern as every other page-specific JS
   file in the repo (exhibitionmanagement.js, event-landing.js).

   Per Phase 5 scope, no backend/API exists yet - SAMPLE_EVENTS below is the
   stand-in "data source." Swapping it for a real API response later
   requires no change to EdsDiscovery or this file's wiring, only replacing
   how SAMPLE_EVENTS is populated (e.g. an awaited fetch() instead of a
   literal array).
   ============================================================================= */

// ========================= SAMPLE DATASET =========================
const SAMPLE_EVENTS = [
    {
        id: 'evt_2026_trade_summit', slug: 'pakistan-trade-industry-summit-2026',
        name: 'Pakistan International Trade & Industry Summit 2026',
        shortDescription: 'A 3-day trade exhibition and conference for manufacturers, exporters, and investors.',
        category: 'Trade & Industry', industry: ['Textile & Apparel', 'Industrial Machinery', 'Technology & Innovation'],
        city: 'Karachi', country: 'Pakistan',
        startDate: '2026-09-14T10:00:00+05:00', endDate: '2026-09-16T19:00:00+05:00',
        featured: true, registrationStatus: 'open',
        image: 'assets/images/portfolio/exhibition-floor-premium.webp', url: 'event-landing.html'
    },
    {
        id: 'evt_2026_global_sme_summit', slug: 'global-sme-summit-2026',
        name: 'Global SME Summit 2026',
        shortDescription: 'Connecting small and medium enterprises with regional investors and trade bodies.',
        category: 'Business & Finance', industry: ['SME Development', 'Investment', 'Education & Training'],
        city: 'Lahore', country: 'Pakistan',
        startDate: '2026-10-05T09:00:00+05:00', endDate: '2026-10-07T18:00:00+05:00',
        featured: true, registrationStatus: 'open',
        image: 'assets/images/portfolio/global-sme-banner.webp', url: 'events.html'
    },
    {
        id: 'evt_2026_textile_asia_expo', slug: 'textile-asia-expo-2026',
        name: 'Textile Asia Expo 2026',
        shortDescription: 'South Asia\'s leading textile and apparel manufacturing showcase.',
        category: 'Trade & Industry', industry: ['Textile & Apparel'],
        city: 'Karachi', country: 'Pakistan',
        startDate: '2026-11-18T10:00:00+05:00', endDate: '2026-11-20T18:00:00+05:00',
        featured: false, registrationStatus: 'coming-soon',
        image: 'assets/images/portfolio/textile-asia-generated.webp', url: 'textile-asia-expo-2026.html'
    },
    {
        id: 'evt_2026_healthcare_expo', slug: 'healthcare-innovation-expo-2026',
        name: 'Healthcare Innovation Expo 2026',
        shortDescription: 'Medical technology, pharmaceuticals, and hospital infrastructure under one roof.',
        category: 'Healthcare', industry: ['Healthcare & Pharma', 'Medical Technology'],
        city: 'Karachi', country: 'Pakistan',
        startDate: '2026-07-29T10:00:00+05:00', endDate: '2026-08-03T18:00:00+05:00',
        featured: false, registrationStatus: 'open',
        image: 'assets/images/portfolio/service-conferences-seminars.webp', url: 'health-asia-2026.html'
    },
    {
        id: 'evt_2027_itcn_asia', slug: 'itcn-asia-2027',
        name: 'ITCN Asia 2027',
        shortDescription: 'Pakistan\'s largest IT, telecom, and digital transformation exhibition.',
        category: 'Technology', industry: ['Technology & Innovation', 'IT & Digital Trade', 'Telecommunications'],
        city: 'Karachi', country: 'Pakistan',
        startDate: '2027-02-10T10:00:00+05:00', endDate: '2027-02-12T18:00:00+05:00',
        featured: true, registrationStatus: 'coming-soon',
        image: 'assets/images/portfolio/itcn-asia-generated.webp', url: 'itcn-asia-2027.html'
    },
    {
        id: 'evt_2025_construction_expo', slug: 'construction-real-estate-expo-2025',
        name: 'Construction & Real Estate Expo 2025',
        shortDescription: 'Building materials, real estate development, and infrastructure investment.',
        category: 'Construction', industry: ['Construction & Real Estate', 'Construction Materials', 'Real Estate'],
        city: 'Lahore', country: 'Pakistan',
        startDate: '2025-11-05T10:00:00+05:00', endDate: '2025-11-07T18:00:00+05:00',
        featured: false, registrationStatus: 'closed',
        image: 'assets/images/portfolio/b2b-industrial-generated.webp', url: 'events.html'
    },
    {
        id: 'evt_2026_agri_expo', slug: 'pakistan-agriculture-livestock-expo-2026',
        name: 'Pakistan Agriculture & Livestock Expo 2026',
        shortDescription: 'Connecting farmers, livestock breeders, and agri-tech suppliers nationwide.',
        category: 'Agriculture', industry: ['Agriculture & Livestock', 'Food & Beverage'],
        city: 'Karachi', country: 'Pakistan',
        startDate: '2026-09-09T09:00:00+05:00', endDate: '2026-09-11T17:00:00+05:00',
        featured: false, registrationStatus: 'open',
        image: 'assets/images/portfolio/dalfa-cattle-show.webp', url: 'events.html'
    },
    {
        id: 'evt_2025_engineering_fair', slug: 'national-engineering-technology-fair-2025',
        name: 'National Engineering & Technology Fair 2025',
        shortDescription: 'Showcasing engineering innovation across power, telecom, and manufacturing.',
        category: 'Technology', industry: ['Defence & Security', 'Engineering', 'IT & Digital Trade'],
        city: 'Karachi', country: 'Pakistan',
        startDate: '2025-10-12T10:00:00+05:00', endDate: '2025-10-14T18:00:00+05:00',
        featured: false, registrationStatus: 'closed',
        image: 'assets/images/portfolio/ieee-exhibition.webp', url: 'engineering-asia-2025.html'
    },
    {
        id: 'evt_2027_energy_forum', slug: 'global-energy-renewables-forum-2027',
        name: 'Global Energy & Renewables Forum 2027',
        shortDescription: 'Renewable energy, power generation, and sustainability policy for South Asia.',
        category: 'Energy', industry: ['Renewable Energy', 'Power & Utilities'],
        city: 'Islamabad', country: 'Pakistan',
        startDate: '2027-04-20T09:00:00+05:00', endDate: '2027-04-22T18:00:00+05:00',
        featured: false, registrationStatus: 'coming-soon',
        image: 'assets/images/portfolio/service-government-corporate.webp', url: 'oil-gas-asia-2027.html'
    },
    {
        id: 'evt_2026_leadership_summit', slug: 'corporate-leadership-networking-summit-2026',
        name: 'Corporate Leadership Networking Summit 2026',
        shortDescription: 'An executive networking evening for CEOs, investors, and policy leaders.',
        category: 'Corporate & Networking', industry: ['Business & Finance'],
        city: 'Karachi', country: 'Pakistan',
        startDate: '2026-12-03T18:00:00+05:00', endDate: '2026-12-03T22:00:00+05:00',
        featured: false, registrationStatus: 'open',
        image: 'assets/images/portfolio/my-karachi-generated.webp', url: 'events.html'
    }
];

// ========================= FILTER DROPDOWN POPULATION =========================
function populateFilterOptions() {
    const categories = [...new Set(SAMPLE_EVENTS.map((e) => e.category))].sort();
    const industries = [...new Set(SAMPLE_EVENTS.flatMap((e) => e.industry))].sort();
    const cities = [...new Set(SAMPLE_EVENTS.map((e) => e.city))].sort();
    const years = [...new Set(SAMPLE_EVENTS.map((e) => new Date(e.startDate).getFullYear()))].sort();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const fill = (id, items, formatter) => {
        const sel = document.getElementById(id);
        if (!sel) return;
        items.forEach((item) => {
            const opt = document.createElement('option');
            opt.value = formatter ? formatter.value(item) : item;
            opt.textContent = formatter ? formatter.label(item) : item;
            sel.appendChild(opt);
        });
    };

    fill('evc-filter-category', categories);
    fill('evc-filter-industry', industries);
    fill('evc-filter-city', cities);
    fill('evc-filter-year', years);
    fill('evc-filter-month', monthNames.map((name, i) => i), {
        value: (i) => String(i),
        label: (i) => monthNames[i]
    });
}

// ========================= FEATURED EVENTS SECTION =========================
function renderFeaturedEvents() {
    const mount = document.getElementById('evc-featured-mount');
    if (!mount) return;

    const featured = SAMPLE_EVENTS.filter((e) => e.featured).slice(0, 2);
    if (!featured.length) {
        const sec = mount.closest('.evc-featured-sec');
        if (sec) sec.style.display = 'none';
        return;
    }

    mount.innerHTML = featured.map((e) => EdsEventCard.render(e, 'featured')).join('');
}

// ========================= EMPTY STATE COPY =========================
function wireEmptyStateCopy(discoveryInstance) {
    const searchInput = document.getElementById('evc-search-input');
    const titleEl = document.getElementById('evc-empty-title');
    const descEl = document.getElementById('evc-empty-desc');

    if (!titleEl || !descEl || !discoveryInstance) return;

    const updateEmptyCopy = () => {
        const state = discoveryInstance.getState();
        if (state.search) {
            titleEl.textContent = 'No Results Found';
            descEl.textContent = `We couldn't find any events matching "${state.search}". Try a different search term.`;
        } else if (state.filters.lifecycle === 'past') {
            titleEl.textContent = 'No Past Events Yet';
            descEl.textContent = 'This archive will fill up as events are completed.';
        } else {
            titleEl.textContent = 'No Events Found';
            descEl.textContent = 'Try adjusting your filters or clearing them to see all events.';
        }
    };

    if (searchInput) searchInput.addEventListener('input', updateEmptyCopy);
    document.querySelectorAll('#evc-status-tabs .eds-tab').forEach((t) => t.addEventListener('click', updateEmptyCopy));
    document.querySelectorAll('.eds-filter-bar .eds-filter-select').forEach((s) => s.addEventListener('change', updateEmptyCopy));
}

// ========================= INIT =========================
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize discovery if results mount point exists on the current page
    if (!document.getElementById('evc-results-mount')) return;

    populateFilterOptions();
    renderFeaturedEvents();

    const discovery = EdsDiscovery.init({
        data: SAMPLE_EVENTS,
        mount: '#evc-results-mount',
        searchInput: '#evc-search-input',
        searchSuggestions: '#evc-search-suggestions',
        filterSelects: {
            category: '#evc-filter-category',
            industry: '#evc-filter-industry',
            city: '#evc-filter-city',
            year: '#evc-filter-year',
            month: '#evc-filter-month',
            registrationStatus: '#evc-filter-registration'
        },
        filterClear: '#evc-filter-clear',
        sortSelect: '#evc-sort',
        viewPills: '#evc-view-pills .eds-pill',
        statusTabs: '#evc-status-tabs .eds-tab',
        loadMoreBtn: '#evc-load-more',
        loadMoreFill: '#evc-load-more-fill',
        loadMoreProgress: '#evc-load-more-progress',
        resultsCount: '#evc-results-count',
        activeFilters: '#evc-active-filters',
        emptyState: '#evc-empty-state',
        calendarMount: '#evc-calendar-mount',
        timelineMount: '#evc-timeline-mount',
        pageSize: 6,
        defaultSort: 'upcoming-soon',
        defaultView: 'grid'
    });

    if (discovery) wireEmptyStateCopy(discovery);

    // Phase 8: dynamic card chrome (the "Featured" badge, results count)
    // is built as an HTML string by EdsEventCard.render()/renderResults(),
    // so switching language needs an explicit re-render - static
    // [data-i18n] elements update themselves via LanguageManager.applyToDom(),
    // but generated markup doesn't exist yet at that point for the DOM
    // walker to find.
    if (window.LanguageManager && discovery) {
        window.LanguageManager.onChange(() => {
            discovery.refresh();
            renderFeaturedEvents();
        });
    }

    // Search clear button
    const clearBtn = document.getElementById('evc-search-clear');
    const searchInput = document.getElementById('evc-search-input');
    if (clearBtn && searchInput) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.focus();
        });
    }
});
