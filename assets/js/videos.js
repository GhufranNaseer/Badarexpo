/* =============================================================================
   VIDEO SHOWCASE HUB (videos.html) - Phase 18
   ============================================================================= 
   PAGE-SPECIFIC glue only, matching the exact pattern established by
   events-calendar.js, gallery.js, media.js, and blog.js: a sample dataset
   + wiring to EdsDiscovery.init(). No filtering/rendering logic lives here.
   Uses fieldAccessors: EdsVideoFields and cardRenderer: EdsVideoCard.render
   (both new this session) - the FIFTH dataset shape proving the engine's
   genuine reusability.

   HONESTY NOTE: every youtubeId below uses the PLACEHOLDER- prefix (see
   EdsLightbox.openVideo(), event-components.js) - this project has no
   real client-provided video footage to embed yet, so every card
   correctly shows the graceful "Video Coming Soon" state when clicked,
   rather than a fabricated/unverifiable external YouTube ID pretending to
   be real event footage. To go live with a real video, a client simply
   replaces one youtubeId value below with the real YouTube video ID
   (removing the PLACEHOLDER- prefix) - no other code changes needed.
   ============================================================================= */

const SAMPLE_VIDEOS = [
    {
        id: 'vid_trade_summit', slug: 'pakistan-trade-summit-2026-highlights',
        title: 'Pakistan Trade & Industry Summit 2026 - Highlights',
        description: 'A recap of exhibitors, delegations, and keynote moments from the flagship summit.',
        category: 'Event Recap',
        industry: ['Trade & Industry'],
        location: 'Karachi',
        recordedDate: '2026-09-16T00:00:00+05:00',
        featured: true,
        thumbnail: 'assets/images/portfolio/exhibition-floor-premium.webp',
        youtubeId: 'PLACEHOLDER-trade-summit-2026',
        eventUrl: 'event-landing.html'
    },
    {
        id: 'vid_textile_asia', slug: 'textile-asia-expo-2026-highlights',
        title: 'Textile Asia Expo 2026 - Exhibition Floor Highlights',
        description: 'Mills, buyers, and machinery demos from the exhibition floor.',
        category: 'Event Recap',
        industry: ['Textile & Apparel'],
        location: 'Karachi',
        recordedDate: '2026-11-20T00:00:00+05:00',
        featured: true,
        thumbnail: 'assets/images/portfolio/textile-asia-generated.webp',
        youtubeId: 'PLACEHOLDER-textile-asia-2026',
        eventUrl: 'textile-asia-expo-2026.html'
    },
    {
        id: 'vid_itcn_asia', slug: 'itcn-asia-2027-highlights',
        title: 'ITCN Asia 2027 - Opening Ceremony',
        description: 'Highlights from the opening keynote and exhibition floor walkthrough.',
        category: 'Opening Ceremony',
        industry: ['IT & Digital Trade'],
        location: 'Karachi',
        recordedDate: '2027-02-12T00:00:00+05:00',
        featured: false,
        thumbnail: 'assets/images/portfolio/itcn-asia-generated.webp',
        youtubeId: 'PLACEHOLDER-itcn-asia-2027',
        eventUrl: 'itcn-asia-2027.html'
    },
    {
        id: 'vid_china_delegation', slug: 'china-trade-delegation-recap',
        title: 'China Trade Delegation Partnership - Recap',
        description: 'Behind the scenes of the multi-day delegation program with the Chinese Embassy.',
        category: 'Delegation Visit',
        industry: ['Trade & Industry'],
        location: 'Karachi',
        recordedDate: '2025-11-12T00:00:00+05:00',
        featured: false,
        thumbnail: 'assets/images/portfolio/china-embassy.webp',
        youtubeId: 'PLACEHOLDER-china-delegation-2025',
        eventUrl: 'project-landing.html'
    },
    {
        id: 'vid_engineering_asia', slug: 'engineering-asia-2025-highlights',
        title: 'Engineering Asia 2025 - Show Floor Highlights',
        description: 'Live machinery demonstrations and engineering keynote sessions.',
        category: 'Event Recap',
        industry: ['Engineering'],
        location: 'Karachi',
        recordedDate: '2025-10-14T00:00:00+05:00',
        featured: false,
        thumbnail: 'assets/images/portfolio/ieee-exhibition.webp',
        youtubeId: 'PLACEHOLDER-engineering-asia-2025',
        eventUrl: 'engineering-asia-2025.html'
    },
    {
        id: 'vid_health_asia', slug: 'health-asia-2026-highlights',
        title: 'Health Asia 2026 - Exhibition Preview',
        description: 'A first look at medical technology and hospital infrastructure exhibits.',
        category: 'Event Preview',
        industry: ['Healthcare & Pharma'],
        location: 'Karachi',
        recordedDate: '2026-07-30T00:00:00+05:00',
        featured: false,
        thumbnail: 'assets/images/portfolio/service-conferences-seminars.webp',
        youtubeId: 'PLACEHOLDER-health-asia-2026',
        eventUrl: 'health-asia-2026.html'
    }
];

// ========================= FILTER DROPDOWN POPULATION =========================
function populateVideoFilters() {
    const events = [...new Set(SAMPLE_VIDEOS.map((v) => v.title))].sort();
    const industries = [...new Set(SAMPLE_VIDEOS.flatMap((v) => v.industry))].sort();
    const years = [...new Set(SAMPLE_VIDEOS.map((v) => new Date(v.recordedDate).getFullYear()))].sort();

    const fill = (id, items) => {
        const sel = document.getElementById(id);
        if (!sel) return;
        items.forEach((item) => {
            const opt = document.createElement('option');
            opt.value = item;
            opt.textContent = item;
            sel.appendChild(opt);
        });
    };

    fill('vid-filter-event', events);
    fill('vid-filter-industry', industries);
    fill('vid-filter-year', years);
}

// ========================= EMPTY STATE COPY =========================
function wireVideoEmptyStateCopy(discoveryInstance) {
    const searchInput = document.getElementById('vid-search-input');
    const titleEl = document.getElementById('vid-empty-title');
    const descEl = document.getElementById('vid-empty-desc');

    const update = () => {
        const state = discoveryInstance.getState();
        if (state.search) {
            titleEl.textContent = 'No Videos Found';
            descEl.textContent = `We couldn't find any videos matching "${state.search}".`;
        } else {
            titleEl.textContent = 'No Videos Found';
            descEl.textContent = 'Try adjusting your filters or clearing them to see all videos.';
        }
    };

    searchInput.addEventListener('input', update);
    document.querySelectorAll('.eds-filter-bar .eds-filter-select').forEach((s) => s.addEventListener('change', update));
}

// ========================= INIT =========================
document.addEventListener('DOMContentLoaded', () => {
    populateVideoFilters();

    const discovery = EdsDiscovery.init({
        data: SAMPLE_VIDEOS,
        fieldAccessors: EdsVideoFields,
        cardRenderer: EdsVideoCard.render,
        mount: '#vid-results-mount',
        searchInput: '#vid-search-input',
        searchSuggestions: '#vid-search-suggestions',
        filterSelects: {
            category: '#vid-filter-event',
            industry: '#vid-filter-industry',
            year: '#vid-filter-year'
        },
        filterClear: '#vid-filter-clear',
        sortSelect: '#vid-sort',
        loadMoreBtn: '#vid-load-more',
        loadMoreFill: '#vid-load-more-fill',
        loadMoreProgress: '#vid-load-more-progress',
        resultsCount: '#vid-results-count',
        activeFilters: '#vid-active-filters',
        emptyState: '#vid-empty-state',
        pageSize: 6,
        defaultSort: 'upcoming-soon',
        defaultView: 'grid'
    });

    if (discovery) wireVideoEmptyStateCopy(discovery);

    // Videos rendered by the Discovery engine are dynamic markup created
    // after EdsLightbox.init() already ran once on DOMContentLoaded - so
    // each re-render needs the lightbox re-initialized to pick up the new
    // [data-youtube-id] cards, same "regenerate markup, re-run once-only
    // init" pattern already used by gallery.js/blog.js when the language
    // switches.
    if (window.LanguageManager && discovery) {
        window.LanguageManager.onChange(() => {
            discovery.refresh();
            if (window.EdsLightbox) window.EdsLightbox.init();
        });
    }
    if (discovery && window.EdsDiscovery) {
        // Re-bind the lightbox to newly-rendered cards after every filter/
        // sort/search/load-more action (the mount's innerHTML is replaced
        // each time, per event-discovery-components.js's renderResults()).
        const mount = document.getElementById('vid-results-mount');
        if (mount && window.MutationObserver) {
            const observer = new MutationObserver(() => {
                if (window.EdsLightbox) window.EdsLightbox.init();
            });
            observer.observe(mount, { childList: true });
        }
    }

    const clearBtn = document.getElementById('vid-search-clear');
    const searchInput = document.getElementById('vid-search-input');
    if (clearBtn && searchInput) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.focus();
        });
    }
});
