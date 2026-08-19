/* =============================================================================
   GALLERY HUB (gallery.html) - Phase 13
   ============================================================================= 
   PAGE-SPECIFIC glue only, matching the exact pattern established by
   events-calendar.js (Phase 5): a sample dataset + wiring to
   EdsDiscovery.init(). No filtering/rendering logic lives here.

   The one difference from events-calendar.js: this call passes
   fieldAccessors: EdsAlbumFields and cardRenderer: EdsAlbumCard.render
   (both new this session, event-discovery-components.js) - proving the
   engine documented since Phase 5 as reusable for "any future browsable
   list" genuinely works with a dataset shaped nothing like an event.
   ============================================================================= */

// ========================= SAMPLE ALBUM DATASET =========================
// Field names match EdsAlbumFields' expectations (title, coverImage,
// images[], albumDate, category, industry[], country, featured, url).
// Only the China album has a real detail page; the other 5 cross-link into
// whichever real page (Industry/Event/Project Hub) is most relevant -
// same "link to what's real" convention already established for
// SAMPLE_EVENTS in events-calendar.js (Phase 5).
const SAMPLE_ALBUMS = [
    {
        id: 'alb_china_delegation', slug: 'china-trade-delegation',
        title: 'China Trade Delegation Partnership',
        description: 'Photos from the multi-day China trade delegation program.',
        category: 'China Trade Delegation Partnership',
        industry: ['Trade & Industry'],
        country: 'China',
        albumDate: '2025-11-10T00:00:00+05:00',
        featured: true,
        coverImage: 'assets/images/portfolio/china-embassy.webp',
        images: [
            { url: 'assets/images/portfolio/china-embassy.webp', caption: 'Delegation meeting' },
            { url: 'assets/images/portfolio/saudi-delegation.webp', caption: 'Delegation visit' },
            { url: 'assets/images/portfolio/service-government-corporate.webp', caption: 'Corporate meeting' }
        ],
        url: 'gallery-album.html'
    },
    {
        id: 'alb_textile_asia', slug: 'textile-asia-expo-2026',
        title: 'Textile Asia Expo 2026',
        description: 'Exhibition floor photos from Textile Asia Expo.',
        category: 'Textile Asia Expo 2026',
        industry: ['Textile & Apparel'],
        country: 'Pakistan',
        albumDate: '2026-11-18T00:00:00+05:00',
        featured: true,
        coverImage: 'assets/images/portfolio/textile-asia-generated.webp',
        images: [
            { url: 'assets/images/portfolio/textile-asia-generated.webp', caption: 'Exhibition floor' },
            { url: 'assets/images/portfolio/ieee-booth.webp', caption: 'Exhibitor booth' }
        ],
        url: 'textile-asia-expo-2026.html'
    },
    {
        id: 'alb_trade_summit', slug: 'pakistan-trade-summit-2026',
        title: 'Pakistan International Trade & Industry Summit 2026',
        description: 'Highlights from the Trade & Industry Summit.',
        category: 'Pakistan International Trade & Industry Summit 2026',
        industry: ['Trade & Industry', 'Industrial Machinery'],
        country: 'Pakistan',
        albumDate: '2026-09-14T00:00:00+05:00',
        featured: false,
        coverImage: 'assets/images/portfolio/exhibition-floor-premium.webp',
        images: [
            { url: 'assets/images/portfolio/exhibition-floor-premium.webp', caption: 'Exhibition floor' },
            { url: 'assets/images/portfolio/ieee-kiosk.webp', caption: 'Information kiosk' }
        ],
        url: 'event-landing.html'
    },
    {
        id: 'alb_engineering_fair', slug: 'national-engineering-technology-fair-2025',
        title: 'National Engineering & Technology Fair 2025',
        description: 'Engineering and technology exhibits.',
        category: 'National Engineering & Technology Fair 2025',
        industry: ['Engineering', 'IT & Digital Trade'],
        country: 'Pakistan',
        albumDate: '2025-10-12T00:00:00+05:00',
        featured: false,
        coverImage: 'assets/images/portfolio/ieee-exhibition.webp',
        images: [
            { url: 'assets/images/portfolio/ieee-exhibition.webp', caption: 'Exhibition hall' }
        ],
        url: 'engineering-asia-2025.html'
    },
    {
        id: 'alb_dalfa_cattle', slug: 'agriculture-livestock-expo-2026',
        title: 'Pakistan Agriculture & Livestock Expo',
        description: 'Livestock and agri-tech exhibits.',
        category: 'Pakistan Agriculture & Livestock Expo 2026',
        industry: ['Agriculture & Livestock'],
        country: 'Pakistan',
        albumDate: '2026-09-09T00:00:00+05:00',
        featured: false,
        coverImage: 'assets/images/portfolio/dalfa-cattle-show.webp',
        images: [
            { url: 'assets/images/portfolio/dalfa-cattle-show.webp', caption: 'Livestock show' }
        ],
        url: 'events-calendar.html?industry=Agriculture%20%26%20Livestock'
    },
    {
        id: 'alb_saudi_delegation', slug: 'saudi-delegation-visit',
        title: 'Saudi Delegation Visit',
        description: 'Governor House Karachi delegation visit.',
        category: 'Saudi Delegation Visit',
        industry: ['Trade & Industry'],
        country: 'Saudi Arabia',
        albumDate: '2025-10-09T00:00:00+05:00',
        featured: false,
        coverImage: 'assets/images/portfolio/saudi-delegation.webp',
        images: [
            { url: 'assets/images/portfolio/saudi-delegation.webp', caption: 'Delegation visit' }
        ],
        url: 'international-projects.html'
    }
];

// ========================= FILTER DROPDOWN POPULATION =========================
function populateGalleryFilters() {
    const events = [...new Set(SAMPLE_ALBUMS.map((a) => a.category))].sort();
    const industries = [...new Set(SAMPLE_ALBUMS.flatMap((a) => a.industry))].sort();
    const countries = [...new Set(SAMPLE_ALBUMS.map((a) => a.country))].sort();
    const years = [...new Set(SAMPLE_ALBUMS.map((a) => new Date(a.albumDate).getFullYear()))].sort();

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

    fill('gal-filter-event', events);
    fill('gal-filter-industry', industries);
    fill('gal-filter-country', countries);
    fill('gal-filter-year', years);
}

// ========================= EMPTY STATE COPY =========================
function wireGalleryEmptyStateCopy(discoveryInstance) {
    const searchInput = document.getElementById('gal-search-input');
    const titleEl = document.getElementById('gal-empty-title');
    const descEl = document.getElementById('gal-empty-desc');

    const update = () => {
        const state = discoveryInstance.getState();
        if (state.search) {
            titleEl.textContent = 'No Albums Found';
            descEl.textContent = `We couldn't find any albums matching "${state.search}".`;
        } else {
            titleEl.textContent = 'No Albums Found';
            descEl.textContent = 'Try adjusting your filters or clearing them to see all albums.';
        }
    };

    searchInput.addEventListener('input', update);
    document.querySelectorAll('.eds-filter-bar .eds-filter-select').forEach((s) => s.addEventListener('change', update));
}

// ========================= INIT =========================
document.addEventListener('DOMContentLoaded', () => {
    populateGalleryFilters();

    const discovery = EdsDiscovery.init({
        data: SAMPLE_ALBUMS,
        fieldAccessors: EdsAlbumFields,
        cardRenderer: EdsAlbumCard.render,
        gridClassName: 'eds-masonry-grid',
        mount: '#gal-results-mount',
        searchInput: '#gal-search-input',
        searchSuggestions: '#gal-search-suggestions',
        filterSelects: {
            category: '#gal-filter-event',
            industry: '#gal-filter-industry',
            city: '#gal-filter-country',
            year: '#gal-filter-year'
        },
        filterClear: '#gal-filter-clear',
        sortSelect: '#gal-sort',
        loadMoreBtn: '#gal-load-more',
        loadMoreFill: '#gal-load-more-fill',
        loadMoreProgress: '#gal-load-more-progress',
        resultsCount: '#gal-results-count',
        activeFilters: '#gal-active-filters',
        emptyState: '#gal-empty-state',
        pageSize: 6,
        defaultSort: 'upcoming-soon',
        defaultView: 'grid'
    });

    if (discovery) wireGalleryEmptyStateCopy(discovery);

    const clearBtn = document.getElementById('gal-search-clear');
    const searchInput = document.getElementById('gal-search-input');
    if (clearBtn && searchInput) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.focus();
        });
    }
});
