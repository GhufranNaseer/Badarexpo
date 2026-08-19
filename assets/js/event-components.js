/* =============================================================================
   EVENT DESIGN SYSTEM (EDS) - event-components.js
   ============================================================================= 
   Phase 3: generic, multi-instance-safe JS modules for the EDS component
   library (event-components.css). Every module here queries by data
   attribute / class, never by a single hardcoded #id, so any number of
   accordions, tabs, sliders, countdowns, or counters can exist on one page
   at once - required for a real component library where a future CMS may
   render N instances of the same block.

   This file does NOT replace assets/js/event-landing.js (Phase 1/2's
   page-specific, ID-based script for event-landing.html). That file is
   left untouched this phase. A future integration session can decide
   whether event-landing.html should migrate to consume this library
   instead - out of scope here (see data.txt Session 24).

   Each module exposes an .init() method and is initialized once, together,
   at the bottom of this file - same convention as every other page-specific
   JS file in the repo (exhibitionmanagement.js, event-landing.js).
   ============================================================================= */

// ========================= ACCORDION =========================
// Powers FAQ, Speaker Detail bios, or any other collapsible content.
// Usage: wrap any number of .eds-accordion-item elements in a container
// with [data-eds-accordion]. Each item needs a .eds-accordion-trigger and
// a .eds-accordion-content. Add data-eds-accordion-exclusive="false" on the
// container to allow multiple items open at once (default: exclusive/one-open).
const EdsAccordion = {
    init() {
        const containers = document.querySelectorAll('[data-eds-accordion]');
        if (!containers.length) return;

        containers.forEach((container) => {
            const exclusive = container.getAttribute('data-eds-accordion-exclusive') !== 'false';
            const items = container.querySelectorAll('.eds-accordion-item');

            items.forEach((item) => {
                const trigger = item.querySelector('.eds-accordion-trigger');
                const content = item.querySelector('.eds-accordion-content');
                if (!trigger || !content) return;

                trigger.addEventListener('click', () => {
                    const isActive = item.classList.contains('eds-accordion-active');

                    if (exclusive) {
                        items.forEach((i) => {
                            i.classList.remove('eds-accordion-active');
                            const c = i.querySelector('.eds-accordion-content');
                            if (c) c.style.maxHeight = null;
                        });
                    }

                    if (!isActive) {
                        item.classList.add('eds-accordion-active');
                        content.style.maxHeight = content.scrollHeight + 'px';
                    } else {
                        item.classList.remove('eds-accordion-active');
                        content.style.maxHeight = null;
                    }
                });
            });

            // Optionally pre-open the first item: opt-in via
            // data-eds-accordion-open-first="true" (kept opt-in, unlike the
            // page-specific FAQ scripts, since not every accordion instance
            // on a component-heavy page should default-open).
            if (container.getAttribute('data-eds-accordion-open-first') === 'true' && items.length) {
                const firstTrigger = items[0].querySelector('.eds-accordion-trigger');
                if (firstTrigger) firstTrigger.click();
            }
        });
    }
};

// ========================= TABS =========================
// Powers Day Switch Navigation, FAQ Category Tabs, or any tabbed panel set.
// Usage: a container with [data-eds-tabs] holding .eds-tab buttons
// (each with data-eds-tab-target="panel-id") and a sibling/descendant set
// of .eds-tab-panel elements (each with a matching id).
const EdsTabs = {
    init() {
        const containers = document.querySelectorAll('[data-eds-tabs]');
        if (!containers.length) return;

        containers.forEach((container) => {
            const tabs = container.querySelectorAll('.eds-tab');
            const panelGroupSelector = container.getAttribute('data-eds-tabs-panels');
            const panelGroup = panelGroupSelector ? document.querySelector(panelGroupSelector) : container;
            if (!tabs.length || !panelGroup) return;

            const panels = panelGroup.querySelectorAll('.eds-tab-panel');

            tabs.forEach((tab) => {
                tab.addEventListener('click', () => {
                    const targetId = tab.getAttribute('data-eds-tab-target');

                    tabs.forEach((t) => {
                        t.classList.remove('eds-tab--active');
                        t.setAttribute('aria-selected', 'false');
                    });
                    tab.classList.add('eds-tab--active');
                    tab.setAttribute('aria-selected', 'true');

                    panels.forEach((panel) => {
                        const isMatch = panel.id === targetId;
                        panel.classList.toggle('eds-tab-panel--active', isMatch);
                        panel.hidden = !isMatch;
                    });
                });
            });
        });
    }
};

// ========================= ANIMATED COUNTER =========================
// Powers Statistics Card / Animated Counter. Usage: any element with
// [data-eds-counter] plus data-target (required), data-suffix and
// data-prefix (optional). No hardcoded numbers - fully data-driven so a
// CMS/API can populate data-target dynamically per event.
const EdsCounter = {
    init() {
        const counters = document.querySelectorAll('[data-eds-counter]');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const el = entry.target;
                const target = Number(el.getAttribute('data-target')) || 0;
                const suffix = el.getAttribute('data-suffix') || '';
                const prefix = el.getAttribute('data-prefix') || '';
                const speed = Math.max(target / 100, 1);
                let count = 0;

                const update = () => {
                    count += speed;
                    if (count < target) {
                        el.textContent = prefix + Math.floor(count) + suffix;
                        requestAnimationFrame(update);
                    } else {
                        el.textContent = prefix + target + suffix;
                    }
                };

                update();
                observer.unobserve(el);
            });
        }, { threshold: 0.4 });

        counters.forEach((el) => observer.observe(el));
    }
};

// ========================= COUNTDOWN BLOCK =========================
// Powers the Countdown Block hero component. Usage: a wrapper with
// [data-eds-countdown] and data-countdown-date="ISO date string", plus four
// descendants carrying [data-eds-cd="days|hours|mins|secs"]. Supports any
// number of countdown instances on one page (e.g. a "related events" list
// each showing their own mini countdown).
const EdsCountdown = {
    init() {
        const wrappers = document.querySelectorAll('[data-eds-countdown]');
        if (!wrappers.length) return;

        wrappers.forEach((wrapper) => {
            const targetDate = new Date(wrapper.getAttribute('data-countdown-date'));
            if (isNaN(targetDate.getTime())) return;

            const daysEl = wrapper.querySelector('[data-eds-cd="days"]');
            const hoursEl = wrapper.querySelector('[data-eds-cd="hours"]');
            const minsEl = wrapper.querySelector('[data-eds-cd="mins"]');
            const secsEl = wrapper.querySelector('[data-eds-cd="secs"]');
            if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

            const pad = (n) => String(Math.max(n, 0)).padStart(2, '0');

            const tick = () => {
                const diff = targetDate.getTime() - Date.now();

                if (diff <= 0) {
                    [daysEl, hoursEl, minsEl, secsEl].forEach((el) => { el.textContent = '00'; });
                    clearInterval(timerId);
                    return;
                }

                daysEl.textContent = pad(Math.floor(diff / (1000 * 60 * 60 * 24)));
                hoursEl.textContent = pad(Math.floor((diff / (1000 * 60 * 60)) % 24));
                minsEl.textContent = pad(Math.floor((diff / (1000 * 60)) % 60));
                secsEl.textContent = pad(Math.floor((diff / 1000) % 60));
            };

            tick();
            const timerId = setInterval(tick, 1000);
        });
    }
};

// ========================= SLIDER =========================
// Powers Media Slider and Testimonial-style carousels. Usage: a wrapper
// with [data-eds-slider] containing .eds-media-slide children and,
// optionally, .eds-btn-icon[data-eds-slider-prev] / [data-eds-slider-next]
// controls and/or .eds-media-slider-dot navigation dots.
const EdsSlider = {
    init() {
        const sliders = document.querySelectorAll('[data-eds-slider]');
        if (!sliders.length) return;

        sliders.forEach((slider) => {
            const track = slider.querySelector('.eds-media-slider-track, .eds-testi-track');
            const slides = slider.querySelectorAll('.eds-media-slide, .eds-testimonial-card');
            if (!track || !slides.length) return;

            let index = 0;

            const render = () => {
                track.style.transform = `translateX(-${index * 100}%)`;

                slider.querySelectorAll('.eds-media-slider-dot').forEach((dot, i) => {
                    dot.setAttribute('aria-current', i === index ? 'true' : 'false');
                });
            };

            const goTo = (i) => {
                index = (i + slides.length) % slides.length;
                render();
            };

            const prevBtn = slider.querySelector('[data-eds-slider-prev]');
            const nextBtn = slider.querySelector('[data-eds-slider-next]');
            if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
            if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));

            slider.querySelectorAll('.eds-media-slider-dot').forEach((dot, i) => {
                dot.addEventListener('click', () => goTo(i));
            });

            render();
        });
    }
};

// ========================= STICKY CTA =========================
// Powers the Sticky Registration CTA. Usage: the bar itself carries
// [data-eds-sticky-cta], and data-eds-sticky-trigger holds a CSS selector
// for the element (usually the hero) that, once scrolled out of view,
// reveals the bar.
const EdsStickyCta = {
    init() {
        const bars = document.querySelectorAll('[data-eds-sticky-cta]');
        if (!bars.length) return;

        bars.forEach((bar) => {
            const triggerSelector = bar.getAttribute('data-eds-sticky-trigger');
            const triggerEl = triggerSelector ? document.querySelector(triggerSelector) : null;
            if (!triggerEl) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    bar.classList.toggle('eds-sticky-cta--visible', !entry.isIntersecting);
                    bar.setAttribute('aria-hidden', entry.isIntersecting ? 'true' : 'false');
                });
            }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' });

            observer.observe(triggerEl);
        });
    }
};

// ========================= FILTER CHIPS =========================
// Powers the Filter Chip utility component. Usage: a container of
// .eds-chip buttons with aria-pressed="false"; toggling is purely visual
// here (aria-pressed state) - wiring chips to an actual filtered list is
// left to the page/CMS template that consumes this component, since the
// filtering logic depends entirely on what's being filtered.
const EdsChips = {
    init() {
        const chips = document.querySelectorAll('.eds-chip');
        if (!chips.length) return;

        chips.forEach((chip) => {
            chip.addEventListener('click', () => {
                const pressed = chip.getAttribute('aria-pressed') === 'true';
                chip.setAttribute('aria-pressed', String(!pressed));
            });
        });
    }
};

// ========================= SKELETON HELPER =========================
// Not auto-initialized (there's nothing to bind on page load) - exposed as
// a small utility any future dynamic-data script can call once real content
// has loaded, to swap a skeleton placeholder for real markup.
const EdsSkeleton = {
    reveal(container) {
        if (!container) return;
        container.querySelectorAll('.eds-skeleton').forEach((el) => el.classList.add('eds-skeleton--done'));
    }
};

// ========================= LIGHTBOX (added post-Phase-13 bugfix pass) =========================
// Generic, multi-instance, data-attribute-driven, matching every other module
// in this file. Any image anywhere on the site carrying data-full-src (with
// an optional data-caption) becomes clickable and opens in a full-screen
// viewer - this is the script gallery-album.html's images were built for
// since Phase 13 but that didn't exist yet at the time (that phase was
// explicitly scoped as "architecture only" for this piece, per its own
// brief). One shared overlay element is created once and reused for every
// image on the page, not rebuilt per click.
const EdsLightbox = {
    init() {
        const images = document.querySelectorAll('[data-full-src]');
        const videos = document.querySelectorAll('[data-youtube-id]');
        if (!images.length && !videos.length) return;

        let overlay = document.querySelector('.eds-lightbox-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'eds-lightbox-overlay';
            overlay.innerHTML = `
                <button class="eds-lightbox-close" type="button" aria-label="Close">
                    <i class="fas fa-xmark" aria-hidden="true"></i>
                </button>
                <img class="eds-lightbox-img" src="" alt="">
                <div class="eds-lightbox-video-wrap"></div>
                <p class="eds-lightbox-caption"></p>`;
            document.body.appendChild(overlay);
        }

        const imgEl = overlay.querySelector('.eds-lightbox-img');
        const videoWrap = overlay.querySelector('.eds-lightbox-video-wrap');
        const captionEl = overlay.querySelector('.eds-lightbox-caption');
        const closeBtn = overlay.querySelector('.eds-lightbox-close');

        const openImage = (src, caption) => {
            imgEl.hidden = false;
            videoWrap.hidden = true;
            videoWrap.innerHTML = '';
            imgEl.src = src;
            imgEl.alt = caption || '';
            captionEl.textContent = caption || '';
            captionEl.hidden = !caption;
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        };

        // Phase 18: video mode - lazy-creates the YouTube iframe only at
        // the moment the lightbox opens (never on page load, never just
        // because a card exists on the page), satisfying "lazy-load video
        // embeds / prevent unnecessary loading". A youtubeId that's empty
        // or carries the PLACEHOLDER- prefix (this project's own
        // documented convention for demo video entries awaiting real
        // client footage) shows a friendly "coming soon" state instead of
        // a broken iframe - the "gracefully handle unavailable videos"
        // requirement implemented as a real fallback, not assumed away.
        const openVideo = (youtubeId, caption) => {
            imgEl.hidden = true;
            videoWrap.hidden = false;

            const isPlaceholder = !youtubeId || youtubeId.indexOf('PLACEHOLDER') === 0;
            if (isPlaceholder) {
                videoWrap.innerHTML = `
                    <div class="eds-video-unavailable">
                        <i class="fas fa-video-slash" aria-hidden="true"></i>
                        <h3>Video Coming Soon</h3>
                        <p>Footage for this event is being finalized and will be available here shortly.</p>
                    </div>`;
            } else {
                videoWrap.innerHTML = `
                    <iframe src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0"
                        title="${caption || 'Event video'}" frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen loading="lazy"></iframe>`;
            }

            captionEl.textContent = caption || '';
            captionEl.hidden = !caption;
            overlay.classList.add('active');
            overlay.classList.add('eds-lightbox-overlay--video');
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        };

        const close = () => {
            overlay.classList.remove('active', 'eds-lightbox-overlay--video');
            document.body.style.overflow = '';
            // Tear down the iframe on close so a playing video actually
            // stops (removing the element is the only reliable way to
            // stop a YouTube embed's audio/playback), not just visually
            // hidden while still playing off-screen.
            videoWrap.innerHTML = '';
        };

        images.forEach((img) => {
            if (img.dataset.edsLightboxBound) return;
            img.dataset.edsLightboxBound = 'true';
            img.classList.add('eds-lightbox-trigger');
            img.setAttribute('role', 'button');
            img.setAttribute('tabindex', '0');
            const activate = () => openImage(img.getAttribute('data-full-src'), img.getAttribute('data-caption'));
            img.addEventListener('click', activate);
            img.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
            });
        });

        videos.forEach((el) => {
            if (el.dataset.edsLightboxBound) return;
            el.dataset.edsLightboxBound = 'true';
            const activate = () => openVideo(el.getAttribute('data-youtube-id'), el.getAttribute('data-caption'));
            el.addEventListener('click', activate);
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
            });
        });

        if (this._boundGlobalEvents) return;
        this._boundGlobalEvents = true;
        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) close();
        });
    }
};

// ========================= INITIALIZE ALL MODULES =========================
document.addEventListener('DOMContentLoaded', () => {
    EdsAccordion.init();
    EdsTabs.init();
    EdsCounter.init();
    EdsCountdown.init();
    EdsSlider.init();
    EdsStickyCta.init();
    EdsChips.init();
    EdsLightbox.init();
});
