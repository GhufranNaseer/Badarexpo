/* =============================================================================
   MEDIA CENTER HUB (media.html) - Phase 14
   ============================================================================= 
   PAGE-SPECIFIC glue only, matching the exact pattern established by
   events-calendar.js (Phase 5) and gallery.js (Phase 13): a sample dataset
   + wiring to EdsDiscovery.init(). No filtering/rendering logic lives here.
   Uses fieldAccessors: EdsMediaFields and cardRenderer: EdsMediaCard.render
   (both new this session, event-discovery-components.js) - the third
   dataset shape proving the engine's genuine reusability.
   ============================================================================= */

// ========================= SAMPLE MEDIA DATASET =========================
// The first item mirrors the homepage's real "Featured Insights" content
// (Newsroom-tagged IDEAS 2024 story, Session 32) rather than inventing new
// copy - same continuity principle used throughout the Insights ecosystem.
const SAMPLE_MEDIA = [
    {
        id: 'med_ideas_2024', slug: 'ideas-2024-press-release',
        title: "Pakistan's Premier Defense Exhibition IDEAS 2024 Successfully Organized by Badar Expo",
        description: 'IDEAS 2024 brought together global defense industry leaders, showcasing Pakistan\'s growing capabilities in defense production and international collaboration.',
        category: 'Press Release',
        publishDate: '2024-12-05T00:00:00+05:00',
        featured: true,
        coverImage: 'assets/images/portfolio/ideas-exhibition.webp',
        url: 'media-detail.html'
    },
    {
        id: 'med_itcn_2024', slug: 'itcn-asia-2024-news',
        title: 'ITCN Asia 2024: Badar Expo Sets New Benchmark for Tech Exhibitions in the Region',
        description: 'As the largest tech event in Pakistan, ITCN Asia 2024 facilitated millions in investment and digital transformation across the regional IT landscape.',
        category: 'News',
        publishDate: '2024-11-20T00:00:00+05:00',
        featured: true,
        coverImage: 'assets/images/portfolio/ieee-exhibition.webp',
        url: 'events-calendar.html'
    },
    {
        id: 'med_china_delegation', slug: 'china-delegation-announcement',
        title: 'Badar Expo Announces Partnership with Chinese Embassy for Trade Delegation Program',
        description: 'A multi-day trade delegation program connecting Chinese manufacturers with Pakistani importers, organized in partnership with the Chinese Embassy in Karachi.',
        category: 'Announcement',
        publishDate: '2025-11-01T00:00:00+05:00',
        featured: false,
        coverImage: 'assets/images/portfolio/china-embassy.webp',
        url: 'project-landing.html'
    },
    {
        id: 'med_20_years', slug: 'badar-expo-two-decades',
        title: 'Badar Expo Solutions Marks Two Decades of Nationwide Exhibition Delivery',
        description: "From a single Karachi trade fair in 2000 to 1,500+ events across 50 industries, here's what two decades of exhibition management in Pakistan looks like.",
        category: 'News',
        publishDate: '2024-08-15T00:00:00+05:00',
        featured: false,
        coverImage: 'assets/images/portfolio/global-sme-banner.webp',
        url: 'insights.html'
    },
    {
        id: 'med_textile_coverage', slug: 'textile-asia-media-coverage',
        title: 'Empowering the Textile Sector: Media Coverage from the 20th Textile Asia International Expo',
        description: 'Press and media coverage of Textile Asia Expo, highlighting BXSS-organized B2B matchmaking and international machinery showcases.',
        category: 'Media Coverage',
        publishDate: '2026-11-20T00:00:00+05:00',
        featured: false,
        coverImage: 'assets/images/portfolio/textile-asia-generated.webp',
        url: 'industry-landing.html'
    },
    {
        id: 'med_brand_kit', slug: 'brand-guidelines-2026',
        title: 'Badar Expo Solutions Brand Guidelines 2026',
        description: 'Official brand guidelines document covering logo usage, color palette, and typography standards.',
        category: 'Corporate Document',
        publishDate: '2026-01-10T00:00:00+05:00',
        featured: false,
        coverImage: 'assets/images/logo/favicon.webp',
        url: 'media.html'
    }
];

// ========================= FILTER DROPDOWN POPULATION =========================
function populateMediaFilters() {
    const categories = [...new Set(SAMPLE_MEDIA.map((m) => m.category))].sort();
    const years = [...new Set(SAMPLE_MEDIA.map((m) => new Date(m.publishDate).getFullYear()))].sort();

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

    fill('med-filter-category', categories);
    fill('med-filter-year', years);
}

// ========================= EMPTY STATE COPY =========================
function wireMediaEmptyStateCopy(discoveryInstance) {
    const searchInput = document.getElementById('med-search-input');
    const titleEl = document.getElementById('med-empty-title');
    const descEl = document.getElementById('med-empty-desc');

    const update = () => {
        const state = discoveryInstance.getState();
        if (state.search) {
            titleEl.textContent = 'No Results Found';
            descEl.textContent = `We couldn't find any media matching "${state.search}".`;
        } else {
            titleEl.textContent = 'No Media Found';
            descEl.textContent = 'Try adjusting your filters or clearing them to see all media.';
        }
    };

    searchInput.addEventListener('input', update);
    document.querySelectorAll('.eds-filter-bar .eds-filter-select').forEach((s) => s.addEventListener('change', update));
}

// ========================= INIT =========================
document.addEventListener('DOMContentLoaded', () => {
    populateMediaFilters();

    const discovery = EdsDiscovery.init({
        data: SAMPLE_MEDIA,
        fieldAccessors: EdsMediaFields,
        cardRenderer: EdsMediaCard.render,
        mount: '#med-results-mount',
        searchInput: '#med-search-input',
        searchSuggestions: '#med-search-suggestions',
        filterSelects: {
            category: '#med-filter-category',
            year: '#med-filter-year'
        },
        filterClear: '#med-filter-clear',
        sortSelect: '#med-sort',
        loadMoreBtn: '#med-load-more',
        loadMoreFill: '#med-load-more-fill',
        loadMoreProgress: '#med-load-more-progress',
        resultsCount: '#med-results-count',
        activeFilters: '#med-active-filters',
        emptyState: '#med-empty-state',
        pageSize: 6,
        defaultSort: 'newest',
        defaultView: 'grid'
    });

    if (discovery) wireMediaEmptyStateCopy(discovery);

    const clearBtn = document.getElementById('med-search-clear');
    const searchInput = document.getElementById('med-search-input');
    if (clearBtn && searchInput) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.focus();
        });
    }
});
