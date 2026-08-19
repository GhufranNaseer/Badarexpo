/* =============================================================================
   BLOG HUB (blog.html) - Phase 15
   ============================================================================= 
   PAGE-SPECIFIC glue only, matching the exact pattern established by
   events-calendar.js (Phase 5), gallery.js (Phase 13), and media.js
   (Phase 14): a sample dataset + wiring to EdsDiscovery.init(). No
   filtering/rendering logic lives here.
   Uses fieldAccessors: EdsBlogFields and cardRenderer: EdsBlogCard.render
   (both new this session, event-discovery-components.js) - the FOURTH
   dataset shape proving the engine's genuine reusability.
   ============================================================================= */

// ========================= SAMPLE BLOG POST DATASET =========================
// The first two posts mirror the homepage's real "Featured Insights"
// content ("Blog" and "Case Study" tagged cards, live since Phase 0)
// rather than inventing new copy for those two specifically - same
// continuity principle used throughout the Insights ecosystem. The post
// with slug 'b2b-exhibitions-industrial-growth' is the one with a full
// detail page (blog-post.html) this session; the rest cross-link into
// whichever real page is most relevant, same "link to what's real"
// convention as every prior Discovery-powered hub.
const SAMPLE_POSTS = [
    {
        id: 'post_b2b_exhibitions', slug: 'b2b-exhibitions-industrial-growth',
        title: "The Strategic Role of B2B Exhibitions in Boosting Pakistan's Industrial Growth",
        excerpt: 'Exploring how high-impact B2B forums organized by Badar Expo act as catalysts for export growth and industrial innovation in Pakistan.',
        category: 'Knowledge Articles',
        industry: ['Trade & Industry'],
        tags: ['B2B', 'exhibitions', 'export growth'],
        author: 'Ayesha Khan',
        readingTime: 6,
        publishDate: '2026-02-18T00:00:00+05:00',
        featured: true,
        coverImage: 'assets/images/portfolio/global-sme-banner.webp',
        url: 'blog-post.html'
    },
    {
        id: 'post_textile_case_study', slug: 'textile-asia-case-study',
        title: 'Empowering the Textile Sector: Insights from the 20th Textile Asia International Expo',
        excerpt: 'A deep dive into how Textile Asia 2024 provided local manufacturers with international exposure and access to cutting-edge machinery.',
        category: 'Case Studies',
        industry: ['Textile & Apparel'],
        tags: ['textile', 'case study', 'B2B matchmaking'],
        author: 'Ayesha Khan',
        readingTime: 5,
        publishDate: '2026-11-25T00:00:00+05:00',
        featured: true,
        coverImage: 'assets/images/portfolio/textile-asia-generated.webp',
        url: 'textile-asia-expo-2026.html'
    },
    {
        id: 'post_two_decades', slug: 'two-decades-of-exhibition-delivery',
        title: 'Badar Expo Solutions Marks Two Decades of Nationwide Exhibition Delivery',
        excerpt: "From a single Karachi trade fair in 2000 to 1,500+ events across 50 industries, here's what two decades of exhibition management in Pakistan looks like.",
        category: 'Company News',
        industry: [],
        tags: ['company news', 'anniversary'],
        author: 'Badar Expo Editorial Team',
        readingTime: 4,
        publishDate: '2024-08-15T00:00:00+05:00',
        featured: false,
        coverImage: 'assets/images/portfolio/global-sme-banner.webp',
        url: 'insights.html'
    },
    {
        id: 'post_event_recap_summit', slug: 'trade-summit-2026-recap',
        title: 'Event Recap: Pakistan International Trade & Industry Summit 2026',
        excerpt: 'A look back at the exhibitors, delegations, and B2B meetings from this year\'s flagship trade summit.',
        category: 'Event Updates',
        industry: ['Trade & Industry', 'Industrial Machinery'],
        tags: ['event recap', 'trade summit'],
        author: 'Badar Expo Editorial Team',
        readingTime: 4,
        publishDate: '2026-09-20T00:00:00+05:00',
        featured: false,
        coverImage: 'assets/images/portfolio/exhibition-floor-premium.webp',
        url: 'event-landing.html'
    },
    {
        id: 'post_booking_guide', slug: 'exhibition-space-booking-checklist',
        title: '5 Things to Check Before Booking Exhibition Space',
        excerpt: 'A practical checklist for first-time exhibitors - from stall size to logistics access - before signing a booking agreement.',
        category: 'Guides',
        industry: [],
        tags: ['guide', 'exhibitors', 'stall booking'],
        author: 'Ayesha Khan',
        readingTime: 5,
        publishDate: '2026-05-10T00:00:00+05:00',
        featured: false,
        coverImage: 'assets/images/portfolio/service-conferences-seminars.webp',
        url: 'exhibitionmanagement.html'
    },
    {
        id: 'post_2027_calendar', slug: 'bxss-2027-event-calendar-announcement',
        title: 'Badar Expo Announces Its 2027 Event Calendar',
        excerpt: 'A first look at next year\'s flagship exhibitions, conferences, and international delegation programs.',
        category: 'Announcements',
        industry: [],
        tags: ['announcement', '2027', 'calendar'],
        author: 'Badar Expo Editorial Team',
        readingTime: 3,
        publishDate: '2026-12-01T00:00:00+05:00',
        featured: false,
        coverImage: 'assets/images/portfolio/ieee-exhibition.webp',
        url: 'events-calendar.html'
    }
];

// ========================= FILTER DROPDOWN POPULATION =========================
function populateBlogFilters() {
    const categories = [...new Set(SAMPLE_POSTS.map((p) => p.category))].sort();
    const industries = [...new Set(SAMPLE_POSTS.flatMap((p) => p.industry))].sort();
    const years = [...new Set(SAMPLE_POSTS.map((p) => new Date(p.publishDate).getFullYear()))].sort();

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

    fill('blg-filter-category', categories);
    fill('blg-filter-industry', industries);
    fill('blg-filter-year', years);
}

// ========================= EMPTY STATE COPY =========================
function wireBlogEmptyStateCopy(discoveryInstance) {
    const searchInput = document.getElementById('blg-search-input');
    const titleEl = document.getElementById('blg-empty-title');
    const descEl = document.getElementById('blg-empty-desc');

    const update = () => {
        const state = discoveryInstance.getState();
        if (state.search) {
            titleEl.textContent = 'No Articles Found';
            descEl.textContent = `We couldn't find any articles matching "${state.search}".`;
        } else {
            titleEl.textContent = 'No Articles Found';
            descEl.textContent = 'Try adjusting your filters or clearing them to see all articles.';
        }
    };

    searchInput.addEventListener('input', update);
    document.querySelectorAll('.eds-filter-bar .eds-filter-select').forEach((s) => s.addEventListener('change', update));
}

// ========================= INIT =========================
document.addEventListener('DOMContentLoaded', () => {
    populateBlogFilters();

    const discovery = EdsDiscovery.init({
        data: SAMPLE_POSTS,
        fieldAccessors: EdsBlogFields,
        cardRenderer: EdsBlogCard.render,
        mount: '#blg-results-mount',
        searchInput: '#blg-search-input',
        searchSuggestions: '#blg-search-suggestions',
        filterSelects: {
            category: '#blg-filter-category',
            industry: '#blg-filter-industry',
            year: '#blg-filter-year'
        },
        filterClear: '#blg-filter-clear',
        sortSelect: '#blg-sort',
        loadMoreBtn: '#blg-load-more',
        loadMoreFill: '#blg-load-more-fill',
        loadMoreProgress: '#blg-load-more-progress',
        resultsCount: '#blg-results-count',
        activeFilters: '#blg-active-filters',
        emptyState: '#blg-empty-state',
        pageSize: 6,
        defaultSort: 'upcoming-soon',
        defaultView: 'grid'
    });

    if (discovery) wireBlogEmptyStateCopy(discovery);

    const clearBtn = document.getElementById('blg-search-clear');
    const searchInput = document.getElementById('blg-search-input');
    if (clearBtn && searchInput) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.focus();
        });
    }
});
