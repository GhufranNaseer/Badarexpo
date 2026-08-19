/* =============================================================================
   EVENT DISCOVERY COMPONENTS (event-discovery-components.js)
   ============================================================================= 
   Phase 5: a generic, data-driven discovery engine. Takes an array of event
   summary objects (field names match the Phase 4 schema - see
   event-schema.json / event-data-model.md) and a set of DOM hooks, and
   handles search, faceted filtering, sorting, pagination, calendar month
   rendering, and timeline rendering entirely client-side.

   This module has NO dependency on events-calendar.html specifically - any
   future page (a "Speakers Directory", a "Sponsors Directory", anything
   with a browsable list) can reuse EdsDiscovery.init() against a
   differently-shaped dataset by adjusting the field-accessor functions at
   the top of this file.

   Does not implement a backend/search API (per Phase 5 scope) - all
   filtering happens against the in-memory `data` array passed to init().
   Swapping this for a real API later only requires replacing the
   `getFilteredSortedEvents()` internals with a fetch call; every other
   function (rendering, DOM wiring) stays the same, since they only ever
   consume the already-filtered/sorted array.
   ============================================================================= */

// ========================= FIELD ACCESSORS =========================
// Centralized so the rest of the engine never hardcodes a field path -
// change these 8 functions to point this engine at a different dataset
// shape without touching any rendering/filtering logic below.
const EdsEventFields = {
    id: (e) => e.id,
    slug: (e) => e.slug,
    name: (e) => e.name,
    shortDescription: (e) => e.shortDescription || '',
    category: (e) => e.category || '',
    industry: (e) => e.industry || [],
    city: (e) => e.city || '',
    country: (e) => e.country || '',
    startDate: (e) => e.startDate,
    endDate: (e) => e.endDate,
    featured: (e) => !!e.featured,
    registrationStatus: (e) => e.registrationStatus || 'open',
    image: (e) => e.image || '',
    url: (e) => e.url || '#'
};

// ========================= LIFECYCLE HELPERS =========================
function edsGetLifecycleStatus(event, now) {
    const start = new Date(EdsEventFields.startDate(event));
    const end = new Date(EdsEventFields.endDate(event));
    if (now < start) return 'upcoming';
    if (now > end) return 'past';
    return 'ongoing';
}

function edsFormatDateRange(event) {
    const start = new Date(EdsEventFields.startDate(event));
    const end = new Date(EdsEventFields.endDate(event));
    const opts = { month: 'short', day: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', opts);
    const endStr = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
    return `${startStr} – ${endStr}`;
}

// ========================= CARD RENDERING =========================
const EdsEventCard = {
    render(event, variant) {
        const name = EdsEventFields.name(event);
        const img = EdsEventFields.image(event);
        const url = EdsEventFields.url(event);
        const city = EdsEventFields.city(event);
        const category = EdsEventFields.category(event);
        const dateRange = edsFormatDateRange(event);
        const featured = EdsEventFields.featured(event);
        const desc = EdsEventFields.shortDescription(event);

        const featuredLabel = (typeof LanguageManager !== 'undefined') ? LanguageManager.t('eventsUi.featured', 'Featured') : 'Featured';
        const badges = featured
            ? `<span class="eds-badge eds-badge--danger eds-badge--on-dark">${featuredLabel}</span>`
            : '';

        const metaRow = `
      <div class="eds-event-card-meta">
        <span><i class="fas fa-calendar-days"></i> ${dateRange}</span>
        <span><i class="fas fa-location-dot"></i> ${city}</span>
        ${category ? `<span><i class="fas fa-tag"></i> ${category}</span>` : ''}
      </div>`;

        const descBlock = variant === 'horizontal' && desc
            ? `<p class="eds-event-card-desc">${desc}</p>`
            : '';

        return `
      <a href="${url}" class="eds-related-card eds-event-card eds-event-card--${variant}" data-event-id="${EdsEventFields.id(event)}">
        <div style="position:relative;">
          ${badges ? `<div class="eds-event-card-badges">${badges}</div>` : ''}
          <img src="${img}" alt="${name}" loading="lazy">
        </div>
        <div class="eds-related-card-body">
          <h3 class="eds-event-card-title">${name}</h3>
          ${descBlock}
          ${metaRow}
        </div>
      </a>`;
    }
};

// ========================= DISCOVERY ENGINE =========================
// ========================= ALBUM FIELD ACCESSORS (Phase 13) =========================
// Same centralization principle as EdsEventFields - the Gallery system's
// "swap the accessor object, reuse everything else" proof point for the
// fieldAccessors/cardRenderer options added to EdsDiscovery.init() this
// session. startDate/endDate both resolve to the album's single date so
// the engine's (event-oriented) lifecycle/sort machinery never has to
// special-case "this dataset has no date range."
const EdsAlbumFields = {
    id: (a) => a.id,
    slug: (a) => a.slug,
    name: (a) => a.title,
    shortDescription: (a) => a.description || '',
    category: (a) => a.category || '',
    industry: (a) => a.industry || [],
    city: (a) => a.country || '',
    country: (a) => a.country || '',
    startDate: (a) => a.albumDate,
    endDate: (a) => a.albumDate,
    featured: (a) => !!a.featured,
    registrationStatus: () => '',
    image: (a) => a.coverImage,
    imageCount: (a) => (a.images ? a.images.length : (a.imageCount || 0)),
    url: (a) => a.url || '#'
};

// ========================= ALBUM CARD RENDERING (Phase 13) =========================
// Reusable Gallery/Album card - deliberately a NEW component (not a reuse of
// EdsEventCard) since an album's meta row (image count, related event/
// industry tag) is genuinely different content from an event's (date range,
// city, category) even though the outer card shell is visually identical to
// .eds-related-card. Lightbox-ready: every rendered <img> here (and every
// image inside an album detail grid, see gallery-album.html) carries
// data-full-src/data-caption attributes for a FUTURE lightbox script to
// read - no lightbox JS exists yet (Phase 13 is architecture-only for that
// per the brief), so these attributes are inert until one does.
const EdsAlbumCard = {
    render(album) {
        const title = EdsAlbumFields.name(album);
        const img = EdsAlbumFields.image(album);
        const url = EdsAlbumFields.url(album);
        const country = EdsAlbumFields.country(album);
        const count = EdsAlbumFields.imageCount(album);
        const featured = EdsAlbumFields.featured(album);

        const badge = featured
            ? '<span class="eds-badge eds-badge--danger eds-badge--on-dark">Featured</span>'
            : '';

        return `
      <a href="${url}" class="eds-related-card eds-album-card" data-album-id="${EdsAlbumFields.id(album)}">
        <div style="position:relative;">
          ${badge ? `<div class="eds-event-card-badges">${badge}</div>` : ''}
          <img src="${img}" alt="${title}" loading="lazy">
          <span class="eds-album-count"><i class="fas fa-images" aria-hidden="true"></i> ${count}</span>
        </div>
        <div class="eds-related-card-body">
          ${country ? `<span class="eds-related-card-date"><i class="fas fa-location-dot" aria-hidden="true"></i> ${country}</span>` : ''}
          <h3>${title}</h3>
        </div>
      </a>`;
    }
};

// ========================= MEDIA FIELD ACCESSORS (Phase 14) =========================
// Third dataset the engine has now been proven against (events, albums,
// media items) - same centralization principle as EdsEventFields/
// EdsAlbumFields.
const EdsMediaFields = {
    id: (m) => m.id,
    slug: (m) => m.slug,
    name: (m) => m.title,
    shortDescription: (m) => m.description || '',
    category: (m) => m.category || '',
    industry: () => [],
    city: () => '',
    country: () => '',
    startDate: (m) => m.publishDate,
    endDate: (m) => m.publishDate,
    featured: (m) => !!m.featured,
    registrationStatus: () => '',
    image: (m) => m.coverImage,
    url: (m) => m.url || '#'
};

// ========================= MEDIA CARD RENDERING (Phase 14) =========================
// Reusable Media Center card - new component (not a reuse of EdsEventCard/
// EdsAlbumCard) since a media item's meta row (category badge + publish
// date) is different content again, even though the outer card shell is
// visually identical to .eds-related-card, same design language across all
// three card types.
const EdsMediaCard = {
    render(media) {
        const title = EdsMediaFields.name(media);
        const img = EdsMediaFields.image(media);
        const url = EdsMediaFields.url(media);
        const category = EdsMediaFields.category(media);
        const date = new Date(EdsMediaFields.startDate(media));
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const featured = EdsMediaFields.featured(media);

        const badge = featured
            ? '<span class="eds-badge eds-badge--danger eds-badge--on-dark">Featured</span>'
            : '';

        return `
      <a href="${url}" class="eds-related-card eds-media-card" data-media-id="${EdsMediaFields.id(media)}">
        <div style="position:relative;">
          ${badge ? `<div class="eds-event-card-badges">${badge}</div>` : ''}
          <img src="${img}" alt="${title}" loading="lazy">
        </div>
        <div class="eds-related-card-body">
          <h3>${title}</h3>
          <div class="eds-event-card-meta">
            ${category ? `<span><i class="fas fa-tag" aria-hidden="true"></i> ${category}</span>` : ''}
            <span><i class="fas fa-calendar-days" aria-hidden="true"></i> ${dateStr}</span>
          </div>
        </div>
      </a>`;
    }
};

// ========================= BLOG FIELD ACCESSORS (Phase 15) =========================
// Fourth dataset the engine has now been proven against (events, albums,
// media items, blog posts) - same centralization principle as
// EdsEventFields/EdsAlbumFields/EdsMediaFields. tags[] is a SEPARATE field
// from category (controlled taxonomy) vs. tags (free-form) - see
// site-information-architecture.md Section 6 for why the distinction
// matters and shouldn't be collapsed into one field.
const EdsBlogFields = {
    id: (p) => p.id,
    slug: (p) => p.slug,
    name: (p) => p.title,
    shortDescription: (p) => p.excerpt || '',
    category: (p) => p.category || '',
    industry: (p) => p.industry || [],
    tags: (p) => p.tags || [],
    author: (p) => p.author || '',
    city: (p) => '',
    country: (p) => '',
    startDate: (p) => p.publishDate,
    endDate: (p) => p.publishDate,
    featured: (p) => !!p.featured,
    registrationStatus: () => '',
    image: (p) => p.coverImage,
    readingTime: (p) => p.readingTime || 0,
    url: (p) => p.url || '#'
};

// ========================= BLOG CARD RENDERING (Phase 15) =========================
// Reusable Blog Card - a NEW component (not a reuse of any prior card)
// since a post's meta row (category + author + reading time) is different
// content again, even though the outer card shell is the same familiar
// .eds-related-card visual language shared by every card family site-wide.
const EdsBlogCard = {
    render(post) {
        const title = EdsBlogFields.name(post);
        const img = EdsBlogFields.image(post);
        const url = EdsBlogFields.url(post);
        const category = EdsBlogFields.category(post);
        const author = EdsBlogFields.author(post);
        const readingTime = EdsBlogFields.readingTime(post);
        const featured = EdsBlogFields.featured(post);
        const date = new Date(EdsBlogFields.startDate(post));
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const badge = featured
            ? '<span class="eds-badge eds-badge--danger eds-badge--on-dark">Featured</span>'
            : '';

        return `
      <a href="${url}" class="eds-related-card eds-blog-card" data-post-id="${EdsBlogFields.id(post)}">
        <div style="position:relative;">
          ${badge ? `<div class="eds-event-card-badges">${badge}</div>` : ''}
          <img src="${img}" alt="${title}" loading="lazy">
        </div>
        <div class="eds-related-card-body">
          <span class="eds-related-card-date">${category} &middot; ${dateStr}</span>
          <h3>${title}</h3>
          <div class="eds-event-card-meta">
            ${author ? `<span><i class="fas fa-user" aria-hidden="true"></i> ${author}</span>` : ''}
            ${readingTime ? `<span><i class="fas fa-clock" aria-hidden="true"></i> ${readingTime} min read</span>` : ''}
          </div>
        </div>
      </a>`;
    }
};

// ========================= VIDEO FIELD ACCESSORS (Phase 18) =========================
// Fifth dataset the engine has now been proven against (events, albums,
// media, blog posts, videos) - same centralization principle as every
// other EdsXFields object. A video's "date" is its recording/publish
// date (startDate/endDate both resolve to it, same convention as
// EdsAlbumFields/EdsMediaFields - no date-range concept needed here).
const EdsVideoFields = {
    id: (v) => v.id,
    slug: (v) => v.slug,
    name: (v) => v.title,
    shortDescription: (v) => v.description || '',
    category: (v) => v.category || '',
    industry: (v) => v.industry || [],
    city: (v) => v.location || '',
    country: (v) => v.location || '',
    startDate: (v) => v.recordedDate,
    endDate: (v) => v.recordedDate,
    featured: (v) => !!v.featured,
    registrationStatus: () => '',
    image: (v) => v.thumbnail,
    youtubeId: (v) => v.youtubeId || '',
    year: (v) => v.recordedDate ? new Date(v.recordedDate).getFullYear() : '',
    url: (v) => v.eventUrl || '#'
};

// ========================= VIDEO CARD RENDERING (Phase 18) =========================
// Reusable Video Card - per the brief's explicit spec: thumbnail, event
// name, location, year, short description, Watch Video CTA. Clicking the
// card opens EdsLightbox in video mode (event-components.js, extended
// this session) rather than navigating away - a video card's job is to
// play the video in place, not send the visitor to a new page. The
// thumbnail is the real portfolio image already on file for that event
// (not a YouTube-hosted thumbnail image), so the card always renders a
// real, meaningful photo even for a video whose YouTube ID is still a
// placeholder pending real client footage.
const EdsVideoCard = {
    render(video) {
        const title = EdsVideoFields.name(video);
        const img = EdsVideoFields.image(video);
        const location = EdsVideoFields.city(video);
        const year = EdsVideoFields.year(video);
        const category = EdsVideoFields.category(video);
        const featured = EdsVideoFields.featured(video);
        const youtubeId = EdsVideoFields.youtubeId(video);
        const desc = EdsVideoFields.shortDescription(video);
        const eventUrl = EdsVideoFields.url(video);

        const badge = featured
            ? '<span class="eds-badge eds-badge--danger eds-badge--on-dark">Featured</span>'
            : '';

        return `
      <div class="eds-related-card eds-video-card" data-video-id="${EdsVideoFields.id(video)}"
           data-youtube-id="${youtubeId}" data-caption="${title}" role="button" tabindex="0"
           aria-label="Play video: ${title}">
        <div style="position:relative;">
          ${badge ? `<div class="eds-event-card-badges">${badge}</div>` : ''}
          <img src="${img}" alt="${title}" loading="lazy">
          <span class="eds-video-play-overlay" aria-hidden="true"><i class="fas fa-play"></i></span>
        </div>
        <div class="eds-related-card-body">
          <span class="eds-related-card-date">${category}${location ? ' &middot; ' + location : ''}${year ? ' &middot; ' + year : ''}</span>
          <h3>${title}</h3>
          ${desc ? `<p class="eds-video-card-desc">${desc}</p>` : ''}
          <div class="eds-video-card-actions">
            <span class="eds-link-arrow eds-video-watch-cta">Watch Video <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
            ${eventUrl && eventUrl !== '#' ? `<a href="${eventUrl}" class="eds-video-event-link" onclick="event.stopPropagation()">View Event</a>` : ''}
          </div>
        </div>
      </div>`;
    }
};

const EdsDiscovery = {
    init(options) {
        // ---- generic dataset support (Phase 13): any dataset shape works by
        // passing fieldAccessors/cardRenderer - defaults preserve the exact
        // original event-only behavior, so events-calendar.js (Phase 5)
        // needs zero changes. This is what the Phase 5/9 documentation always
        // claimed ("reusable by any future browsable list") but the engine
        // didn't actually support until this session revealed the gap while
        // building the Gallery system. ----
        const fields = options.fieldAccessors || EdsEventFields;
        const cardRenderer = options.cardRenderer || EdsEventCard.render;

        const state = {
            data: options.data || [],
            now: options.now || new Date(),
            search: '',
            filters: { category: '', industry: '', city: '', year: '', month: '', lifecycle: '', featured: '', registrationStatus: '' },
            sort: options.defaultSort || 'upcoming-soon',
            view: options.defaultView || 'grid',
            visibleCount: options.pageSize || 9,
            pageSize: options.pageSize || 9,
            calendarCursor: options.now ? new Date(options.now) : new Date()
        };

        const els = {
            mount: document.querySelector(options.mount),
            searchInput: options.searchInput ? document.querySelector(options.searchInput) : null,
            searchSuggestions: options.searchSuggestions ? document.querySelector(options.searchSuggestions) : null,
            filterSelects: options.filterSelects || {},
            sortSelect: options.sortSelect ? document.querySelector(options.sortSelect) : null,
            viewPills: options.viewPills ? document.querySelectorAll(options.viewPills) : [],
            loadMoreBtn: options.loadMoreBtn ? document.querySelector(options.loadMoreBtn) : null,
            loadMoreFill: options.loadMoreFill ? document.querySelector(options.loadMoreFill) : null,
            loadMoreProgress: options.loadMoreProgress ? document.querySelector(options.loadMoreProgress) : null,
            resultsCount: options.resultsCount ? document.querySelector(options.resultsCount) : null,
            activeFilters: options.activeFilters ? document.querySelector(options.activeFilters) : null,
            emptyState: options.emptyState ? document.querySelector(options.emptyState) : null,
            calendarMount: options.calendarMount ? document.querySelector(options.calendarMount) : null,
            timelineMount: options.timelineMount ? document.querySelector(options.timelineMount) : null,
            statusTabs: options.statusTabs ? document.querySelectorAll(options.statusTabs) : []
        };

        if (!els.mount) return null;

        // ---- filtering + sorting ----
        function getFilteredSortedEvents() {
            let list = state.data.filter((e) => {
                const lifecycle = edsGetLifecycleStatus(e, state.now);

                if (state.search) {
                    const haystack = [
                        fields.name(e),
                        fields.city(e),
                        fields.category(e),
                        ...(fields.industry(e) || [])
                    ].join(' ').toLowerCase();
                    if (!haystack.includes(state.search.toLowerCase())) return false;
                }

                if (state.filters.category && fields.category(e) !== state.filters.category) return false;
                if (state.filters.industry && !(fields.industry(e) || []).includes(state.filters.industry)) return false;
                if (state.filters.city && fields.city(e) !== state.filters.city) return false;
                if (state.filters.year && String(new Date(fields.startDate(e)).getFullYear()) !== state.filters.year) return false;
                if (state.filters.month && String(new Date(fields.startDate(e)).getMonth()) !== state.filters.month) return false;
                if (state.filters.lifecycle && lifecycle !== state.filters.lifecycle) return false;
                if (state.filters.featured === 'true' && !fields.featured(e)) return false;
                if (state.filters.registrationStatus && fields.registrationStatus(e) !== state.filters.registrationStatus) return false;

                return true;
            });

            switch (state.sort) {
                case 'upcoming-soon':
                    list.sort((a, b) => new Date(fields.startDate(a)) - new Date(fields.startDate(b)));
                    break;
                case 'newest':
                    list.sort((a, b) => new Date(fields.startDate(b)) - new Date(fields.startDate(a)));
                    break;
                case 'alphabetical':
                    list.sort((a, b) => fields.name(a).localeCompare(fields.name(b)));
                    break;
                case 'featured':
                    list.sort((a, b) => Number(fields.featured(b)) - Number(fields.featured(a)));
                    break;
                // 'most-popular' intentionally not implemented - no popularity
                // signal exists in the data model yet (Phase 4 has no view/
                // registration-count field). Selecting it falls back to
                // upcoming-soon order rather than throwing, so the control
                // can ship now and be wired up once that data exists.
                default:
                    list.sort((a, b) => new Date(fields.startDate(a)) - new Date(fields.startDate(b)));
            }

            return list;
        }

        // ---- rendering: grid / list / compact ----
        function renderResults() {
            const filtered = getFilteredSortedEvents();
            const visible = filtered.slice(0, state.visibleCount);

            if (els.resultsCount) {
                const suffix = (typeof LanguageManager !== 'undefined')
                    ? LanguageManager.t(filtered.length === 1 ? 'eventsUi.eventFoundSuffix' : 'eventsUi.eventsFoundSuffix', filtered.length === 1 ? 'event found' : 'events found')
                    : `event${filtered.length === 1 ? '' : 's'} found`;
                els.resultsCount.innerHTML = `<strong>${filtered.length}</strong> ${suffix}`;
            }

            if (!filtered.length) {
                els.mount.innerHTML = '';
                els.mount.hidden = true;
                if (els.emptyState) els.emptyState.hidden = false;
                if (els.loadMoreBtn) els.loadMoreBtn.style.display = 'none';
                renderActiveFilters();
                return;
            }

            if (els.emptyState) els.emptyState.hidden = true;
            els.mount.hidden = false;

            if (state.view === 'timeline' && els.timelineMount) {
                renderTimeline(filtered);
            } else if (state.view === 'compact') {
                els.mount.className = 'eds-events-compact-list';
                els.mount.innerHTML = visible.map((e) => cardRenderer(e, 'compact')).join('');
            } else if (state.view === 'list') {
                els.mount.className = 'eds-events-list';
                els.mount.innerHTML = visible.map((e) => cardRenderer(e, 'horizontal')).join('');
            } else {
                els.mount.className = options.gridClassName || 'eds-events-grid';
                els.mount.innerHTML = visible.map((e) => cardRenderer(e, 'standard')).join('');
            }

            // Load More visibility + progress
            if (els.loadMoreBtn) {
                const hasMore = state.visibleCount < filtered.length;
                els.loadMoreBtn.style.display = hasMore ? '' : 'none';
                if (els.loadMoreFill) {
                    const pct = Math.min(100, (visible.length / filtered.length) * 100);
                    els.loadMoreFill.style.width = pct + '%';
                }
                if (els.loadMoreProgress) {
                    els.loadMoreProgress.textContent = `Showing ${visible.length} of ${filtered.length}`;
                }
            }

            if (els.calendarMount) renderCalendar(filtered);
            renderActiveFilters();
        }

        // ---- timeline (grouped by month) ----
        function renderTimeline(list) {
            const groups = {};
            list.forEach((e) => {
                const d = new Date(fields.startDate(e));
                const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                if (!groups[key]) groups[key] = [];
                groups[key].push(e);
            });

            const html = Object.keys(groups).map((monthLabel) => `
        <div class="eds-discovery-timeline-group">
          <div class="eds-discovery-timeline-month">${monthLabel}</div>
          <div class="eds-discovery-timeline-items">
            ${groups[monthLabel].map((e) => cardRenderer(e, 'horizontal')).join('')}
          </div>
        </div>
      `).join('');

            els.timelineMount.innerHTML = `<div class="eds-discovery-timeline">${html}</div>`;
        }

        // ---- calendar (month grid) ----
        function renderCalendar(filtered) {
            const cursor = state.calendarCursor;
            const year = cursor.getFullYear();
            const month = cursor.getMonth();

            const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const firstDay = new Date(year, month, 1);
            const startOffset = firstDay.getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();

            const eventsByDay = {};
            filtered.forEach((e) => {
                const start = new Date(fields.startDate(e));
                const end = new Date(fields.endDate(e));
                if (start.getFullYear() > year || (start.getFullYear() === year && start.getMonth() > month)) return;
                if (end.getFullYear() < year || (end.getFullYear() === year && end.getMonth() < month)) return;

                const rangeStart = (start.getFullYear() === year && start.getMonth() === month) ? start.getDate() : 1;
                const rangeEnd = (end.getFullYear() === year && end.getMonth() === month) ? end.getDate() : daysInMonth;

                for (let d = rangeStart; d <= rangeEnd; d++) {
                    if (!eventsByDay[d]) eventsByDay[d] = [];
                    eventsByDay[d].push(e);
                }
            });

            let cellsHtml = '';

            for (let i = startOffset - 1; i >= 0; i--) {
                cellsHtml += `<div class="eds-calendar-day eds-calendar-day--outside"><span class="eds-calendar-day-num">${daysInPrevMonth - i}</span></div>`;
            }

            const today = state.now;
            for (let d = 1; d <= daysInMonth; d++) {
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
                const dayEvents = eventsByDay[d] || [];
                const dots = dayEvents.slice(0, 2).map((e) =>
                    `<span class="eds-calendar-event-dot" data-event-id="${fields.id(e)}" title="${fields.name(e)}">${fields.name(e)}</span>`
                ).join('');
                const more = dayEvents.length > 2 ? `<span class="eds-calendar-day-more">+${dayEvents.length - 2} more</span>` : '';

                cellsHtml += `
          <div class="eds-calendar-day${isToday ? ' eds-calendar-day--today' : ''}">
            <span class="eds-calendar-day-num">${d}</span>
            <div class="eds-calendar-day-events">${dots}${more}</div>
          </div>`;
            }

            const totalCells = startOffset + daysInMonth;
            const trailing = (7 - (totalCells % 7)) % 7;
            for (let d = 1; d <= trailing; d++) {
                cellsHtml += `<div class="eds-calendar-day eds-calendar-day--outside"><span class="eds-calendar-day-num">${d}</span></div>`;
            }

            els.calendarMount.innerHTML = `
        <div class="eds-calendar">
          <div class="eds-calendar-header">
            <span class="eds-calendar-month-label">${monthLabel}</span>
            <div class="eds-calendar-nav">
              <button class="eds-btn-icon eds-btn-icon--sm" data-eds-cal-prev aria-label="Previous month"><i class="fas fa-chevron-left"></i></button>
              <button class="eds-btn-icon eds-btn-icon--sm" data-eds-cal-next aria-label="Next month"><i class="fas fa-chevron-right"></i></button>
            </div>
          </div>
          <div class="eds-calendar-weekdays">
            ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => `<div class="eds-calendar-weekday">${d}</div>`).join('')}
          </div>
          <div class="eds-calendar-grid">${cellsHtml}</div>
        </div>`;

            const prevBtn = els.calendarMount.querySelector('[data-eds-cal-prev]');
            const nextBtn = els.calendarMount.querySelector('[data-eds-cal-next]');
            if (prevBtn) prevBtn.addEventListener('click', () => { state.calendarCursor = new Date(year, month - 1, 1); renderResults(); });
            if (nextBtn) nextBtn.addEventListener('click', () => { state.calendarCursor = new Date(year, month + 1, 1); renderResults(); });
        }

        // ---- active filter chips ----
        function renderActiveFilters() {
            if (!els.activeFilters) return;

            const labels = { category: 'Category', industry: 'Industry', city: 'City', year: 'Year', month: 'Month', lifecycle: 'Status', featured: 'Featured', registrationStatus: 'Registration' };
            const chips = [];

            Object.keys(state.filters).forEach((key) => {
                const val = state.filters[key];
                if (!val) return;
                chips.push(`<span class="eds-active-filter-chip" data-filter-key="${key}">${labels[key]}: ${val}<button aria-label="Remove filter"><i class="fas fa-xmark"></i></button></span>`);
            });

            els.activeFilters.innerHTML = chips.join('');

            els.activeFilters.querySelectorAll('.eds-active-filter-chip button').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const key = btn.closest('.eds-active-filter-chip').getAttribute('data-filter-key');
                    state.filters[key] = '';
                    if (els.filterSelects[key]) {
                        const sel = document.querySelector(els.filterSelects[key]);
                        if (sel) sel.value = '';
                    }
                    state.visibleCount = state.pageSize;
                    renderResults();
                });
            });

            const bar = els.mount.closest('[data-eds-discovery]') || document;
            const filterBar = bar.querySelector('.eds-filter-bar');
            if (filterBar) {
                filterBar.classList.toggle('eds-filter-bar--has-active', chips.length > 0);
            }
        }

        // ---- wiring ----
        if (els.searchInput) {
            els.searchInput.addEventListener('input', () => {
                state.search = els.searchInput.value.trim();
                state.visibleCount = state.pageSize;
                els.searchInput.closest('.eds-search')?.classList.toggle('eds-search--has-value', !!state.search);
                renderSearchSuggestions();
                renderResults();
            });
        }

        function renderSearchSuggestions() {
            if (!els.searchSuggestions) return;
            const wrap = els.searchInput.closest('.eds-search');

            if (!state.search) {
                wrap?.classList.remove('eds-search--active');
                return;
            }

            const matches = state.data.filter((e) =>
                fields.name(e).toLowerCase().includes(state.search.toLowerCase())
            ).slice(0, 5);

            wrap?.classList.add('eds-search--active');

            if (!matches.length) {
                els.searchSuggestions.innerHTML = `<div class="eds-search-no-results">No events match "${state.search}"</div>`;
                return;
            }

            els.searchSuggestions.innerHTML = matches.map((e) => {
                const name = fields.name(e);
                const idx = name.toLowerCase().indexOf(state.search.toLowerCase());
                const highlighted = idx >= 0
                    ? name.slice(0, idx) + '<strong>' + name.slice(idx, idx + state.search.length) + '</strong>' + name.slice(idx + state.search.length)
                    : name;
                return `<div class="eds-search-suggestion" data-event-url="${fields.url(e)}">
          <i class="fas fa-magnifying-glass"></i>
          <span class="eds-search-suggestion-text">${highlighted}</span>
          <span class="eds-search-suggestion-meta">${fields.city(e)}</span>
        </div>`;
            }).join('');

            els.searchSuggestions.querySelectorAll('.eds-search-suggestion').forEach((el) => {
                el.addEventListener('click', () => { window.location.href = el.getAttribute('data-event-url'); });
            });
        }

        if (els.searchInput) {
            document.addEventListener('click', (evt) => {
                const wrap = els.searchInput.closest('.eds-search');
                if (wrap && !wrap.contains(evt.target)) wrap.classList.remove('eds-search--active');
            });
        }

        Object.keys(els.filterSelects).forEach((key) => {
            const sel = document.querySelector(els.filterSelects[key]);
            if (!sel) return;
            sel.addEventListener('change', () => {
                state.filters[key] = sel.value;
                state.visibleCount = state.pageSize;
                sel.classList.toggle('eds-filter-select--active', !!sel.value);
                renderResults();
            });
        });

        if (els.sortSelect) {
            els.sortSelect.addEventListener('change', () => {
                state.sort = els.sortSelect.value;
                renderResults();
            });
        }

        els.viewPills.forEach((pill) => {
            pill.addEventListener('click', () => {
                els.viewPills.forEach((p) => p.classList.remove('eds-pill--active'));
                pill.classList.add('eds-pill--active');
                state.view = pill.getAttribute('data-eds-view');

                const isCalendar = state.view === 'calendar';
                const isTimeline = state.view === 'timeline';
                if (els.mount) els.mount.style.display = (isCalendar || isTimeline) ? 'none' : '';
                if (els.calendarMount) els.calendarMount.style.display = isCalendar ? '' : 'none';
                if (els.timelineMount) els.timelineMount.style.display = isTimeline ? '' : 'none';

                renderResults();
            });
        });

        els.statusTabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                els.statusTabs.forEach((t) => t.classList.remove('eds-tab--active'));
                tab.classList.add('eds-tab--active');
                state.filters.lifecycle = tab.getAttribute('data-eds-status') || '';
                state.visibleCount = state.pageSize;
                renderResults();
            });
        });

        if (els.loadMoreBtn) {
            els.loadMoreBtn.addEventListener('click', () => {
                state.visibleCount += state.pageSize;
                renderResults();
            });
        }

        if (options.filterClear) {
            const clearBtn = document.querySelector(options.filterClear);
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    Object.keys(state.filters).forEach((k) => { state.filters[k] = ''; });
                    Object.values(els.filterSelects).forEach((sel) => {
                        const el = document.querySelector(sel);
                        if (el) { el.value = ''; el.classList.remove('eds-filter-select--active'); }
                    });
                    state.search = '';
                    if (els.searchInput) els.searchInput.value = '';
                    state.visibleCount = state.pageSize;
                    renderResults();
                });
            }
        }

        // ---- URL query param support (Phase 6: deep-link filters from
        // anywhere on the site - footer category links, mega-menu
        // "Upcoming Events"/"Past Events" links, a future "View Similar
        // Events" link from an event detail page - all just build a URL
        // like events-calendar.html?industry=X&status=upcoming rather than
        // needing their own bespoke filtering logic) ----
        function applyUrlParams() {
            const params = new URLSearchParams(window.location.search);

            Object.keys(els.filterSelects).forEach((key) => {
                const val = params.get(key);
                if (!val) return;
                const sel = document.querySelector(els.filterSelects[key]);
                if (!sel) return;
                // Case-insensitive match since a deep link's casing (e.g.
                // from a footer href written by hand) may not exactly match
                // the dataset-derived option value.
                const match = Array.from(sel.options).find((o) => o.value.toLowerCase() === val.toLowerCase());
                if (match) {
                    sel.value = match.value;
                    state.filters[key] = match.value;
                    sel.classList.add('eds-filter-select--active');
                }
            });

            const statusParam = params.get('status');
            if (statusParam && els.statusTabs.length) {
                const tab = Array.from(els.statusTabs).find((t) => t.getAttribute('data-eds-status') === statusParam);
                if (tab) {
                    els.statusTabs.forEach((t) => t.classList.remove('eds-tab--active'));
                    tab.classList.add('eds-tab--active');
                    state.filters.lifecycle = statusParam;
                }
            }

            const searchParam = params.get('q');
            if (searchParam && els.searchInput) {
                els.searchInput.value = searchParam;
                state.search = searchParam;
                els.searchInput.closest('.eds-search')?.classList.add('eds-search--has-value');
            }
        }
        applyUrlParams();

        renderResults();

        return {
            refresh: renderResults,
            getState: () => state
        };
    }
};
