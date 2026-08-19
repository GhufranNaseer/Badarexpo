# Event Design System (EDS) — Component Library Documentation

**Phase 3 · Session 24 · Badar Expo Solutions (BXSS)**

This is the reference documentation for `assets/css/event-components.css` and
`assets/js/event-components.js` — a standalone, reusable component library for
event-related UI, built on top of the finalized site design system
(`tokens.css`, `navbar.css`). It does **not** replace or modify
`event-landing.html` / `event-landing.css` / `event-landing.js` (Phase 1–2);
those are left untouched. This library exists so future event pages, an event
calendar, a CMS, or a WordPress theme can all pull from one shared source
instead of copy-pasting page-specific CSS.

---

## 1. How this fits together

```
tokens.css / navbar.css   →  global design tokens (color, radius, shadow, spacing, motion)
        ↓
event-components.css      →  THIS LIBRARY. Reusable "eds-" components.
event-components.js       →  THIS LIBRARY. Generic, multi-instance JS modules.
        ↓
event-landing.html (etc.) →  a PAGE that could consume the library (not yet
                              wired up — see "Migration" section at the end)
```

Every component is namespaced `eds-` and lives inside a `.eds-scope` wrapper
class (not an `#id`), specifically so multiple components, or multiple
instances of the *same* component, can appear on one page without collision —
required for "an event calendar with 50 event cards" or "a CMS block with 3
FAQ accordions" to work correctly.

## 2. Component categories (what's in the library)

| # | Category | Components |
|---|----------|------------|
| 1 | Hero | Event Hero, Hero Statistics, Event Status Badge, Countdown Block, Hero CTA Group, Breadcrumb, Hero Background Overlay |
| 2 | Status/Badge/Tag (utility, used by every other category) | Badge, Status Label, Category/Industry Tag, Filter Chip |
| 3 | Information | Event Overview Card, Key Information Grid, Important Dates / Location / Quick Facts / Registration Status / Contact Cards (all `.eds-info-card`), Organizer Card, Download Brochure Card |
| 4 | Statistics | Statistics Card, Animated Counter, Achievement Card, Industry/Participation Numbers (usage patterns of the same 2 components) |
| 5 | Speakers | Speaker Card, Featured Speaker Card, Speaker Detail Card, Speaker Social Links, Speaker Grid |
| 6 | Sponsors | Sponsor Card + tier modifiers (Premium/Partner/Supporter/Government/Media), Logo Carousel |
| 7 | Schedule | Agenda List, Timeline Item + type modifiers (Session/Workshop/Panel/Break/Networking), Day Switch Navigation (= Tabs) |
| 8 | Venue | Venue Card, Map Placeholder, Transportation/Parking/Hotel/Nearby Facilities (usage patterns of Info Card) |
| 9 | Gallery | Gallery Grid, Gallery Card, Featured Image, Video Preview Card, Media Slider |
| 10 | Testimonials | Testimonial Card, Company Testimonial, Video Testimonial Placeholder, Rating Block |
| 11 | Registration | Registration CTA Card, Sticky Registration CTA, Benefit Card, Pricing Placeholder, Registration Steps, Confirmation Card |
| 12 | FAQ | Accordion, Category Tabs (= Tabs), Question Card |
| 13 | Contact | Contact/Support/Sales Cards (usage patterns of Info Card), Inquiry CTA |
| 14 | Related Events | Related Event Card + Featured/Upcoming/Past modifiers |
| 15 | Utility | Buttons, Icon Buttons, Navigation Pills, Tabs, Pagination, Section Divider, Alert/Notice Box, Empty State, Loading Skeleton, Success/Error State |

**Why some named components share one CSS block:** many items in the original
brief describe the *same visual shape with different content* — e.g. a
"Government Partner Card" and a "Media Partner Card" are both a logo tile,
just smaller and grouped differently than a "Premium Sponsor Card." Building
5 near-identical CSS blocks for that would violate the brief's own "avoid
duplicate CSS" instruction. Instead, one base component + BEM modifier
classes covers the full named list — see each section below for exactly which
modifier maps to which named component.

## 3. Reusability strategy

1. **One base component per shape, modifiers for variants.** `.eds-info-card`
   alone backs 6 of the named "Information Components." `.eds-sponsor-card`
   backs all 6 sponsor/partner variants. `.eds-timeline-item` backs all 5
   schedule item types.
2. **No component assumes a fixed item count.** Grids use `auto-fit`/`auto-fill`
   so 1 or 100 items render correctly with the same markup.
3. **No text lives in CSS.** Nothing is hardcoded via `content: "..."` with
   real copy (the only `content` usage is the quotation marks on
   `.eds-testimonial-quote` and the auto-numbering on `.eds-step`, both purely
   decorative/structural, not data).
4. **State = class or data-attribute, never inline style.** A CMS/template
   engine can drive every visual state (active tab, open accordion, sponsor
   tier, event status) by toggling a class or attribute.
5. **JS is instance-safe.** Every module in `event-components.js` uses
   `querySelectorAll` + data-attributes, not a single hardcoded `#id` — unlike
   `event-landing.js` (Phase 1–2), which is intentionally page-specific and
   ID-based since it only ever runs on one page.

## 4. How future pages/CMS will consume these components

**Static HTML page (today):** link `tokens.css` → `event-components.css` →
copy the markup pattern from this doc for each section you need, in any
order.

**Future event calendar:** the calendar's individual event cards can reuse
`.eds-related-card` (it's already a generic "event summary" card — name aside,
its markup has no dependency on being in a "Related Events" section).

**Future CMS/WordPress (per rules.txt Section 13):**
- Each component category maps naturally to an ACF Flexible Content layout
  or a Gutenberg block — e.g. "Speaker Grid" → repeater field of
  `{photo, name, title, linkedin_url, website_url}`, rendered through the
  `.eds-speaker-card` markup.
- `.eds-info-card` variants (dates/location/registration status/contact) all
  take the same 3 fields (`icon`, `label`, `value`) — one ACF field group
  could power all of them.
- `.eds-badge`/`.eds-tag` variants map to a simple `select` field
  (`open|closed|sold-out|coming-soon` → `--success|--danger|--warning|--neutral`).
- `.eds-empty-state` and `.eds-skeleton` exist specifically so a
  WordPress/API-backed page never shows a broken layout while a field is
  empty or a request is in flight.

---

## 5. Component reference

Each entry: the markup pattern, required classes, and any JS/data-attribute
hooks. Icons shown are Font Awesome (already loaded site-wide).

### 5.1 Hero

**Event Hero + Overlay + Breadcrumb**
```html
<div class="eds-scope">
  <div class="eds-container"><nav class="eds-breadcrumb">
    <a href="#">Home</a><span class="eds-crumb-sep">/</span>
    <a href="#">Events</a><span class="eds-crumb-sep">/</span>
    <span class="eds-crumb-current">Event Name</span>
  </nav></div>

  <section class="eds-hero" style="--eds-hero-bg:url('/path/to/image.jpg')">
    <div class="eds-overlay"></div>
    <div class="eds-hero-content">
      <span class="eds-badge eds-badge--success eds-badge--on-dark">
        <span class="eds-badge-dot"></span> Registration Open
      </span>
      <h1>Event Name</h1>
      <p>One or two sentence description.</p>
      <div class="eds-hero-stats">
        <div class="eds-hero-stat"><span class="eds-hero-stat-num">300+</span><span class="eds-hero-stat-label">Exhibitors</span></div>
      </div>
      <div class="eds-cta-group">
        <a href="#" class="eds-btn eds-btn--primary">Register Now</a>
        <a href="#" class="eds-btn eds-btn--outline-on-dark">Learn More</a>
      </div>
    </div>
  </section>
</div>
```
Use `<img class="eds-hero-bg-img">` instead of the `style="--eds-hero-bg"`
inline var if your template engine renders `<img>` tags more easily than
inline CSS custom properties — both are supported.

**Event Status Badge** — see Section 5.2 (Badge system); status just uses
`.eds-badge--success|warning|danger|neutral`.

**Countdown Block**
```html
<div class="eds-countdown" data-eds-countdown data-countdown-date="2026-09-14T10:00:00+05:00">
  <div class="eds-countdown-box"><span class="eds-countdown-num" data-eds-cd="days">00</span><span class="eds-countdown-label">Days</span></div>
  <div class="eds-countdown-box"><span class="eds-countdown-num" data-eds-cd="hours">00</span><span class="eds-countdown-label">Hours</span></div>
  <div class="eds-countdown-box"><span class="eds-countdown-num" data-eds-cd="mins">00</span><span class="eds-countdown-label">Minutes</span></div>
  <div class="eds-countdown-box"><span class="eds-countdown-num" data-eds-cd="secs">00</span><span class="eds-countdown-label">Seconds</span></div>
</div>
```
Add `.eds-countdown--on-light` if placing it outside a dark hero.

### 5.2 Status / Badge / Tag / Chip
```html
<span class="eds-badge eds-badge--success"><span class="eds-badge-dot"></span> Registration Open</span>
<span class="eds-badge eds-badge--danger">Sold Out</span>
<span class="eds-tag">Textile &amp; Apparel</span>
<button class="eds-chip" aria-pressed="false">Track: Manufacturing</button>
```
Add `.eds-badge--on-dark` when placing a badge over a dark/photo background.

### 5.3 Information
```html
<div class="eds-info-grid">
  <div class="eds-info-card">
    <div class="eds-info-icon"><i class="fas fa-calendar-days"></i></div>
    <div class="eds-info-body">
      <span class="eds-info-label">Dates</span>
      <span class="eds-info-value">Sep 14–16, 2026</span>
    </div>
  </div>
  <!-- repeat .eds-info-card for Venue / Category / Entry / Registration Status / Contact -->
</div>
```
This one card, repeated, is the "Important Dates Card," "Location Card,"
"Quick Facts Card," "Registration Status Card," and "Contact Card" from the
brief — differentiated only by icon + label + value content.

**Event Overview Card**
```html
<div class="eds-overview-card">
  <div class="eds-overview-media"><img src="..." alt=""></div>
  <div class="eds-overview-body">
    <span class="eds-badge-label">About the Event</span>
    <h2 class="eds-section-title">Event Name</h2>
    <p>Description paragraph.</p>
    <div class="eds-organizer-card">
      <img src="logo.png" class="eds-organizer-logo" alt="">
      <div><span class="eds-info-label">Organized by</span><span class="eds-info-value">Company Name</span></div>
    </div>
    <div class="eds-fact-row">
      <div class="eds-fact"><span class="eds-fact-num">6th</span><span class="eds-fact-label">Edition</span></div>
    </div>
  </div>
</div>
```

**Download Brochure Card**
```html
<div class="eds-download-card">
  <div style="display:flex;align-items:center;gap:16px;">
    <div class="eds-download-card-icon"><i class="fas fa-file-pdf"></i></div>
    <div><p class="eds-download-card-title">Event Brochure</p><p class="eds-download-card-meta">PDF · 2.4 MB</p></div>
  </div>
  <a href="#" class="eds-btn eds-btn--primary eds-btn--sm">Download</a>
</div>
```

### 5.4 Statistics
```html
<div class="eds-stats-grid">
  <div class="eds-stat-card">
    <span class="eds-stat-num" data-eds-counter data-target="300" data-suffix="+">0</span>
    <span class="eds-stat-label">Exhibitors</span>
  </div>
</div>
```
`data-target` accepts any number; `data-suffix`/`data-prefix` are optional
strings (`"+"`, `"K"`, `"$"`, etc.) — fully dynamic-data friendly, no
hardcoded thresholds anywhere in the JS.

**Achievement Card**
```html
<div class="eds-achievement-card">
  <div class="eds-achievement-icon"><i class="fas fa-trophy"></i></div>
  <div><div class="eds-achievement-num">PKR 4.2B+</div><div class="eds-achievement-label">Trade Facilitated</div></div>
</div>
```

### 5.5 Speakers
```html
<div class="eds-speaker-grid">
  <article class="eds-speaker-card">
    <div class="eds-speaker-photo"><img src="..." alt="Speaker Name"></div>
    <h3 class="eds-speaker-name">Speaker Name</h3>
    <p class="eds-speaker-title">Title, Organization</p>
    <div class="eds-speaker-socials">
      <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
    </div>
  </article>
</div>
```
**Featured Speaker Card:** add `eds-speaker-card--featured` and place it as
a direct child of `.eds-speaker-grid` — it spans the full row automatically.

**Speaker Detail Card:** add `eds-speaker-card--detail`, include a
`.eds-speaker-bio` block and a `.eds-speaker-bio-toggle` button, then wrap
the card in a container with `data-eds-accordion` so `EdsAccordion` handles
the expand/collapse (reusing the same JS module as FAQ, not a new one).

### 5.6 Sponsors / Partners
```html
<div class="eds-sponsor-tier">
  <span class="eds-sponsor-tier-label">Platinum Sponsors</span>
  <div class="eds-sponsor-logos">
    <div class="eds-sponsor-card eds-sponsor-card--premium"><img src="logo.png" alt="Sponsor Name"></div>
  </div>
</div>
```
Modifier → named component: `--premium` = Premium Sponsor Card, `--partner`
= Partner Card, `--supporter` = Supporter Card, `--government` = Government
Partner Card, `--media` = Media Partner Card. No modifier = plain Sponsor
Card.

**Logo Carousel** (for long sponsor/partner lists):
```html
<div class="eds-logo-carousel">
  <div class="eds-logo-carousel-track">
    <img src="a.png" alt=""> <img src="b.png" alt=""> <!-- duplicate the full set once so the loop is seamless -->
    <img src="a.png" alt="" aria-hidden="true"> <img src="b.png" alt="" aria-hidden="true">
  </div>
</div>
```

### 5.7 Schedule
```html
<div class="eds-tabs-nav" data-eds-tabs data-eds-tabs-panels="#agenda-panels">
  <button class="eds-tab eds-tab--active" data-eds-tab-target="day-1" aria-selected="true">Day 1</button>
  <button class="eds-tab" data-eds-tab-target="day-2" aria-selected="false">Day 2</button>
</div>
<div id="agenda-panels">
  <div class="eds-tab-panel eds-tab-panel--active" id="day-1">
    <div class="eds-agenda-list">
      <div class="eds-timeline-item eds-timeline-item--panel">
        <span class="eds-timeline-time">10:00 AM</span>
        <div class="eds-timeline-body">
          <h3>Session Title</h3>
          <p>Room / speaker detail.</p>
          <span class="eds-badge eds-badge--danger eds-timeline-type">Panel Discussion</span>
        </div>
      </div>
    </div>
  </div>
  <div class="eds-tab-panel" id="day-2" hidden>...</div>
</div>
```
Timeline item type → modifier: Session `--session`, Workshop `--workshop`,
Panel Discussion `--panel`, Break `--break`, Networking Session
`--networking`. This is also the "Day Switch Navigation" component — it's
just `.eds-tabs` used with day labels.

### 5.8 Venue
```html
<div class="eds-venue-card">
  <div class="eds-map-placeholder">
    <iframe src="https://www.google.com/maps?q=...&output=embed" loading="lazy" title="Venue map"></iframe>
  </div>
  <div>
    <h2 class="eds-section-title">Venue Name</h2>
    <div class="eds-info-grid">
      <div class="eds-info-card eds-info-card--compact"><div class="eds-info-icon"><i class="fas fa-square-parking"></i></div><div class="eds-info-body"><span class="eds-info-value">On-site parking</span></div></div>
    </div>
  </div>
</div>
```
Before a real map embed URL exists, replace the `<iframe>` with:
```html
<div class="eds-map-placeholder-empty"><i class="fas fa-map-location-dot"></i><span>Map coming soon</span></div>
```

### 5.9 Gallery
```html
<div class="eds-gallery-grid">
  <div class="eds-gallery-card eds-featured-image"><img src="..." alt=""></div>
  <div class="eds-gallery-card"><img src="..." alt=""></div>
  <div class="eds-gallery-card eds-video-card"><img src="..." alt=""><span class="eds-video-play"><i class="fas fa-play"></i></span></div>
</div>
```
**Media Slider:**
```html
<div class="eds-media-slider" data-eds-slider>
  <div class="eds-media-slider-track">
    <div class="eds-media-slide"><img src="..." alt=""></div>
    <div class="eds-media-slide"><img src="..." alt=""></div>
  </div>
  <div class="eds-media-slider-nav">
    <button class="eds-media-slider-dot" aria-current="true"></button>
    <button class="eds-media-slider-dot" aria-current="false"></button>
  </div>
</div>
```

### 5.10 Testimonials
```html
<div data-eds-slider>
  <div class="eds-testi-track">
    <blockquote class="eds-testimonial-card">
      <p class="eds-testimonial-quote">Quote text.</p>
      <footer class="eds-testimonial-author"><span class="eds-testimonial-name">Name</span><span class="eds-testimonial-role">Title, Company</span></footer>
    </blockquote>
  </div>
</div>
```
Add `eds-testimonial-card--company` + `.eds-testimonial-company-logo` for
the Company Testimonial variant. **Rating Block:**
```html
<div class="eds-rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star eds-rating-star--empty"></i></div>
```

### 5.11 Registration
```html
<div class="eds-register-card">
  <span class="eds-badge eds-badge--success eds-badge--on-dark">Registration Open</span>
  <h2>Ready to Attend?</h2>
  <p>Event dates &amp; venue.</p>
  <div class="eds-cta-group" style="justify-content:center">
    <a href="#" class="eds-btn eds-btn--primary">Register Now</a>
  </div>
</div>
```
**Sticky Registration CTA:**
```html
<div class="eds-sticky-cta" data-eds-sticky-cta data-eds-sticky-trigger="#hero-section-id">
  <div class="eds-container eds-sticky-cta-row">
    <div><span class="eds-sticky-cta-name">Event Name</span><span class="eds-sticky-cta-date">Sep 14–16, 2026</span></div>
    <a href="#" class="eds-btn eds-btn--primary eds-btn--sm">Register Now</a>
  </div>
</div>
```
**Registration Steps:**
```html
<ol class="eds-steps">
  <li class="eds-step"><h3>Register Online</h3><p>Fill the form in under 2 minutes.</p></li>
  <li class="eds-step"><h3>Get Confirmation</h3><p>Receive your e-badge by email.</p></li>
</ol>
```
**Confirmation Card:**
```html
<div class="eds-confirmation-card"><div class="eds-confirmation-icon"><i class="fas fa-check"></i></div><h3>You're Registered!</h3><p>Confirmation sent to your email.</p></div>
```

### 5.12 FAQ
```html
<div class="eds-accordion" data-eds-accordion data-eds-accordion-open-first="true">
  <div class="eds-accordion-item">
    <button class="eds-accordion-trigger"><h3>Question?</h3><i class="fas fa-chevron-down"></i></button>
    <div class="eds-accordion-content"><div class="eds-accordion-content-inner">Answer.</div></div>
  </div>
</div>
```
Category Tabs above an accordion group reuse `.eds-tabs-nav` (Section 5.7).

### 5.13 Contact
Reuses `.eds-info-card` (Section 5.3) for Contact/Support/Sales cards.
**Inquiry CTA:**
```html
<div class="eds-inquiry-cta"><p>Have a question?</p><a href="#" class="eds-link-arrow">Contact Us <i class="fas fa-arrow-right"></i></a></div>
```

### 5.14 Related Events
```html
<div class="eds-related-grid">
  <a href="#" class="eds-related-card eds-related-card--featured">
    <img src="..." alt="">
    <div class="eds-related-card-body"><span class="eds-related-card-date">Nov 2026</span><h3>Event Name</h3></div>
  </a>
</div>
```
`--featured` / `--past` are the only two modifiers needed; "Upcoming Event
Card" is simply a related card with no modifier (upcoming is the default
assumption unless marked `--past`).

### 5.15 Utility
```html
<!-- Buttons -->
<a class="eds-btn eds-btn--primary">Primary</a>
<a class="eds-btn eds-btn--outline">Outline</a>
<button class="eds-btn-icon"><i class="fas fa-arrow-left"></i></button>

<!-- Pills -->
<div class="eds-pills"><a class="eds-pill eds-pill--active">All</a><a class="eds-pill">Speakers</a></div>

<!-- Pagination -->
<nav class="eds-pagination">
  <button class="eds-page-link" aria-disabled="true">‹</button>
  <button class="eds-page-link eds-page-link--active">1</button>
  <button class="eds-page-link">2</button>
  <button class="eds-page-link">›</button>
</nav>

<!-- Divider -->
<hr class="eds-divider">

<!-- Alert -->
<div class="eds-alert eds-alert--info"><i class="fas fa-circle-info"></i><div><strong>Note</strong>Full agenda will be published soon.</div></div>

<!-- Empty State -->
<div class="eds-empty-state"><i class="fas fa-calendar-xmark"></i><h3>No Sessions Yet</h3><p>The agenda for this day hasn't been published.</p></div>

<!-- Loading Skeleton -->
<div class="eds-skeleton eds-skeleton--image"></div>
<div class="eds-skeleton eds-skeleton--text"></div>
<div class="eds-skeleton eds-skeleton--text eds-skeleton--text-sm"></div>

<!-- Success / Error State -->
<div class="eds-state eds-state--success"><div class="eds-state-icon"><i class="fas fa-check"></i></div><h3>Registration Complete</h3><p>Check your email for confirmation.</p></div>
```

---

## 6. Files in this phase

**New files:**
- `assets/css/event-components.css` — the full component library (~2,170 lines)
- `assets/js/event-components.js` — 7 generic modules: `EdsAccordion`, `EdsTabs`, `EdsCounter`, `EdsCountdown`, `EdsSlider`, `EdsStickyCta`, `EdsChips`, plus the `EdsSkeleton.reveal()` helper
- `event-design-system.md` — this document

**Modified files:** `rules.txt`, `website_structure.txt`, `data.txt` (registry
entries only — see Session 24).

**Explicitly NOT modified:** `event-landing.html`, `event-landing.css`,
`event-landing.js`, or any other existing page. Per the Phase 3 brief, this
session is components only.

## 7. Migration path (future session, not done now)

`event-landing.html` currently uses its own local `elp-` styles
(Phase 1–2). A future session could refactor it to consume this `eds-`
library instead — removing duplication between the two files. That was
deliberately not done here, since the Phase 3 brief explicitly says "Do not
modify previous layouts unnecessarily" and "Do not create another event
page." Flagging it here so the decision is visible next time this project
picks up.
