# Internationalization (i18n) Architecture

**Phase 7 · Session 27 · Badar Expo Solutions (BXSS)**

This document is the architecture-only deliverable for multilingual support
(English + Urdu now, additional languages later). **Nothing on the live
site changes in this phase** — no translations, no language switching, no
RTL conversion. This is the blueprint a future implementation phase builds
from.

---

## 0. What already exists (read this first)

Before designing anything new, the codebase was audited for existing i18n
groundwork, since building on top of what's there beats inventing a parallel
system. Two real things already exist:

1. **A language switcher UI shell** — `.lang-dropdown` in the topbar
   (`index.html` and every other page, ~line 75), with English / اردو
   (Urdu) / العربية (Arabic) options, plus a mobile equivalent
   (`.mobile-lang-btn`). It is visually complete but functionally inert
   beyond changing the displayed 2-letter code.
2. **A partial RTL stub** — `assets/js/main.js`'s language-dropdown click
   handler toggles a `rtl-mode` class on `<body>` when Urdu/Arabic is
   selected, and `assets/css/navbar.css` (~line 131) has exactly one rule
   for it:
   ```css
   body.rtl-mode { direction: rtl; text-align: right; }
   ```
   This is **not real RTL support** — it flips the document's base
   direction and default text alignment only. None of the site's ~20,000
   lines of page CSS use logical properties, so every hardcoded
   `margin-left`, `padding-right`, `left: 20px`, `flex-direction: row`
   assumption across every page would still render broken if `rtl-mode`
   were actually used today.

**This phase's job**: design the architecture that turns (1) into a real,
data-driven switcher and replaces (2) with a real RTL strategy — without a
wholesale CSS rewrite, and without touching either file yet.

---

## 1. Strategy overview

| Decision | Choice | Why |
|---|---|---|
| URL strategy | Path prefix, **default language unprefixed** | Zero migration cost for existing English URLs (see Section 2) |
| Translation storage | Namespaced JSON per locale, loaded client-side | Matches the site's current static-HTML architecture; maps directly to future CMS string groups (see Section 3) |
| Event *content* translation | Separate from UI translation - lives in the Phase 4 data model, not locale files | An event's name/description is data, not UI chrome (see Section 4) |
| Component integration | `data-i18n` attribute + a small runtime resolver | No component markup changes needed structurally, only text becomes attribute-driven (see Section 5) |
| Language switcher | Reuse the existing `.lang-dropdown` topbar UI | It's already built, already in the right place, already responsive - just needs real logic behind it (see Section 6) |
| RTL strategy | A separate `rtl-overrides.css` override layer, not a rewrite of existing CSS | Matches "do not redesign" - existing LTR CSS stays untouched; RTL is additive (see Section 7) |

---

## 2. URL strategy

**Recommendation: path-prefix, with English unprefixed at the root and
Urdu under `/ur/`.**

```
/                          -> English (default, current site, unchanged)
/about.html                -> English (current URLs, unchanged)
/ur/                       -> Urdu homepage
/ur/about.html             -> Urdu About page
/ur/events-calendar.html   -> Urdu Event Calendar
```

**Why this over the alternatives:**

- **Subdomain** (`ur.badarexpo.com`) — rejected. Requires separate DNS/SSL
  config, splits analytics/session state across origins, and is
  disproportionate infrastructure for a 2-language (soon 3+) static site.
- **Query parameter** (`?lang=ur`) — rejected. Not a "real" URL for
  bookmarking/sharing (a link without the param silently serves the wrong
  language), doesn't cache well at a CDN, and per-page hreflang mapping
  becomes fragile (out of scope this phase, but the architecture shouldn't
  paint SEO into a corner).
- **Prefix-everything** (`/en/`, `/ur/`, no unprefixed root) — considered
  and rejected in favor of leaving English unprefixed. The site has been
  live and cross-linked (Phase 6) for 26+ sessions with unprefixed URLs
  (`events.html`, `event-landing.html`, etc.). Forcing every existing link,
  bookmark, and the entire Phase 6 cross-linking work into `/en/...` for
  zero user benefit is exactly the kind of unnecessary redesign this phase
  is told to avoid. New languages beyond Urdu (Section on future
  languages) simply add their own prefix (`/ar/`, `/fr/`) - the pattern
  scales without touching English's URLs again.

**Practical implementation path** (for the future phase that builds this,
not done now): since the site is static HTML rather than server-rendered,
`/ur/*.html` pages would be generated at build time from the same page
templates + the `ur` locale bundle (Section 3), OR, once a CMS exists
(Phase 13-class future work), a plugin-native equivalent (WordPress:
Polylang/WPML both use exactly this `/ur/` directory convention natively).
Either path arrives at the same URL shape, so choosing it now doesn't lock
in a specific tech choice later.

**Language switcher behavior**: selecting Urdu from `.lang-dropdown` while
on `/services.html` should navigate to `/ur/services.html` (same page, new
language) — not to `/ur/` (homepage). This requires the switcher to know
the current page's slug, which is a trivial runtime lookup (current
`location.pathname`), not a data-modeling concern.

---

## 3. Translation storage architecture

**Recommendation: namespaced JSON files per locale, under `/locales/{lang}/`.**

```
/locales/
  en/
    common.json       (site name, generic actions: loading, read more...)
    nav.json           (every nav/mega-menu/footer label)
    buttons.json        (every CTA button label site-wide)
    forms.json          (form field labels, placeholders, validation text)
    messages.json        (empty states, errors, success states)
    events-ui.json        (event UI CHROME - "Register Now", "Speakers",
                            "Agenda" - NOT event content, see Section 4)
  ur/
    common.json
    nav.json
    buttons.json
    forms.json
    messages.json
    events-ui.json
```

**Why namespaced files instead of one giant `en.json`:**

- **Small, mergeable diffs.** A translator or CMS editor changing the
  "Register Now" button doesn't touch the same file as someone changing
  the footer - fewer merge conflicts in a team workflow.
- **Selective loading.** A page that never shows a form doesn't need
  `forms.json` in its initial payload - each page's script loads only the
  namespaces it actually renders (see Section 5's loader).
- **1:1 mapping to future CMS string groups.** WPML/Polylang organize
  translatable strings into named groups; a headless CMS's "content type"
  boundary maps the same way. Namespacing now means zero restructuring
  when either is adopted.
- **Predictable ownership.** `events-ui.json` only exists because the
  Event Design System (Phase 3) is large enough to deserve its own
  namespace rather than bloating `common.json` - not because every future
  feature needs its own file. New namespaces are added when a feature
  area's string count justifies it, not by default.

The full JSON Schema for a locale bundle is `translation-schema.json`;
`sample-en.json` and `sample-ur.json` are complete, schema-valid example
bundles (see Section 10).

---

## 4. Content classification & translation flow

Not everything that's "text on the page" is translated the same way. Four
distinct categories:

| Category | Examples | Where it lives | How it's translated |
|---|---|---|---|
| **Static UI text** | Nav labels, button text, form labels, empty/error states | `/locales/{lang}/*.json` | Human-translated JSON files (this phase's architecture) |
| **Event content** | Event name, description, speaker bios, FAQ answers | `event-schema.json` data model (Phase 4), extended per-field | See below - NOT a locale JSON file |
| **User-generated / dynamic content** | A future registration confirmation with a person's name interpolated | UI template (locale JSON) + data (API/CMS) combined at render time, e.g. `"confirmationMessage": "Thank you, {{name}}!"` | Template string with `{{}}` interpolation tokens, resolved at render time |
| **Metadata** | `<title>`, meta description, Open Graph tags | Currently hardcoded per-page HTML; in a translated future, one locale-specific `<head>` block per generated page | Same JSON-driven approach as static UI text, scoped to a `meta` namespace per page |

**Why event content is NOT in the locale JSON files**: an event's name,
description, and FAQ answers are *data* (they change per-event, sourced
from a CMS/API per Phase 4), not *UI chrome* (which is the same on every
page regardless of which event is showing). Mixing the two would mean
regenerating locale files every time an event is added - exactly the
scalability problem Phase 4 solved by keeping event data separate from the
page shell.

**Recommended extension to event-schema.json** (documented here as the
recommendation; the schema file itself is intentionally NOT modified this
phase, since this phase is UI/architecture, not data-model work):
every translatable field in the Event schema (`basicInfo.name`,
`basicInfo.description`, `venue.name`, `speaker.bio`, `faq.question`,
`faq.answer`, etc.) would become a `LocalizedString` object instead of a
plain string:

```json
"name": { "en": "Pakistan International Trade & Industry Summit 2026",
          "ur": "پاکستان انٹرنیشنل ٹریڈ اینڈ انڈسٹری سمٹ 2026" }
```

A consuming component reads `event.basicInfo.name[currentLocale]` with a
fallback to `event.basicInfo.name.en` if a translation is missing (never a
blank field). This is a **future Phase 4 extension**, not built now -
flagged here so whoever picks it up doesn't have to rediscover it.

---

## 5. Component integration strategy

**No component's HTML structure changes.** Every component from Phase 1-6
(`.hero-btn`, `.eds-*`, `.elp-*`, `.evtpg-*`, `.evc-*`) keeps its existing
markup, classes, and CSS untouched. Only the *text content* becomes
attribute-driven instead of hardcoded, via a `data-i18n` key:

```html
<!-- BEFORE (current state, every existing page) -->
<a href="#elp-register" class="hero-btn hero-btn-primary">Register Now</a>

<!-- AFTER (future implementation phase) -->
<a href="#elp-register" class="hero-btn hero-btn-primary"
   data-i18n="buttons.registerNow">Register Now</a>
```

The English text stays in the HTML as a fallback (so the page still reads
correctly if JS fails to load or a key is missing) - a small runtime
resolver (`language-manager.js`, architecture-only reference in this
delivery, see Section 9) replaces `textContent` for every `[data-i18n]`
element once the correct locale bundle has loaded, and sets `dir`/`lang`
on `<html>`.

For components whose text comes from JS-generated markup (Phase 5's
`EdsEventCard.render()`, which builds card HTML as a template string), the
same pattern applies one level up: the render function takes a `t()`
(translate) function as a parameter instead of hardcoding English strings
inside the template literal:

```js
// Phase 5 (current): hardcoded English inside the render function
render(event, variant) { ... `<span>...</span>` ... }

// Future: a translate function passed in, defaulting to an
// English-only passthrough so nothing breaks if i18n isn't wired up yet
render(event, variant, t = (key, fallback) => fallback) { ... }
```

This is why Phase 5's `EdsEventFields` accessor pattern (all field access
centralized through one small object, documented in
`event-discovery-components.js`) was a good decision *ahead of this
phase's existence* - the same centralization principle extends naturally
to a translation accessor.

---

## 6. Language switcher

**Recommendation: keep the existing `.lang-dropdown` (topbar) as the
primary switcher.** It's already in the highest-visibility, most
conventional location (top-right utility bar, consistent with how
Web Summit/GITEX/Hannover Messe-class international platforms place theirs),
already responsive (a `.mobile-lang-btn` equivalent exists in the mobile
utility sub-header), and already has the right three-language list
structure. Redesigning its placement would violate this phase's "do not
redesign" instruction for no functional gain.

**What changes (future phase, not now):**
- `data-lang="en"/"ur"/"ar"` list items get real click handlers that (a)
  set a persisted preference (`localStorage` + a cookie for server-side
  future use), (b) navigate to the prefixed/unprefixed equivalent URL
  (Section 2), (c) set `<html lang="..." dir="...">`.
- The Arabic option already exists in the markup (`data-lang="ar"`) even
  though only English/Urdu were requested this phase - the architecture
  below treats "future languages" as a first-class case specifically
  because this option is already sitting in the UI unused. Adding a third
  language later means adding `/locales/ar/*.json` and one line to a
  supported-languages config - never touching a component.
- Footer and sticky-utility-bar switcher placements were considered and
  rejected as *additional* locations: a second switcher risks showing two
  different "current language" states if either falls out of sync, and
  the topbar one is already reachable from every page at every viewport.

---

## 7. RTL strategy

**Recommendation: an additive override layer (`rtl-overrides.css`),
loaded only when `dir="rtl"`, not a rewrite of existing CSS to logical
properties.**

Why not migrate everything to CSS logical properties (`margin-inline-start`
etc.) now, which is the "textbook correct" long-term answer? Because doing
that across ~20,000 lines of existing, working CSS (Phase 0's own audit
counted the codebase at this size) is a redesign-scale rewrite with real
regression risk, explicitly against this phase's brief. The pragmatic,
non-invasive path:

1. **Document root toggle**: `<html lang="ur" dir="rtl">` (native browser
   behavior already handles text direction, form control alignment, and
   default block flow for free - this is *not* the weak point).
2. **`rtl-overrides.css`**: a new, small, purely additive stylesheet
   loaded *after* every other page CSS, containing only `[dir="rtl"] ...`
   scoped rules for the specific properties that don't auto-flip:
   horizontal `margin`/`padding`/`left`/`right`/`float`, `flex-direction`
   on any row-based layout, `text-align: left` hardcodes, and
   transform-based positioning. This file is written incrementally,
   component-by-component, as each is verified in RTL - never as one
   giant speculative pass.
3. **Directional icon mirroring**: NOT all icons flip (a logo, a checkmark,
   or a play button shouldn't). Only icons that encode a *direction*
   (arrows, chevrons like `.hero-btn i.fa-arrow-right`, the countdown's
   "next month" chevron) need it. Recommendation: a dedicated marker class
   (e.g. `.icon-directional`) applied only to those icons going forward,
   flipped via `[dir="rtl"] .icon-directional { transform: scaleX(-1); }`
   - explicit opt-in avoids accidentally mirroring a brand mark.
4. **Component-specific notes** (for the future implementation phase):
   - **Navigation/mega-menu**: dropdown columns reverse order; the
     existing 3-column mega-menu grid (Section 4, growthservices.html
     pattern) just needs `flex-direction`/`grid` handled by the overlay,
     not restructured.
   - **Cards** (`.eds-related-card`, `.eds-event-card--horizontal`):
     image/text-side order should mirror for horizontal variants (image
     currently left, text right → swap in RTL). Grid/vertical card
     variants (standard, compact, featured-vertical) need no change since
     they stack top-to-bottom, which RTL doesn't affect.
   - **Forms**: label/input alignment flips natively via `dir="rtl"` on
     the form (browser default); only custom-styled elements (the
     Phase 5 `.eds-filter-select`'s custom dropdown-arrow background-image
     position) need an explicit override.
   - **Buttons with icons** (`.hero-btn`, `.eds-btn`): icon+label order
     should visually reverse (icon that trails the label in LTR should
     lead it in RTL) - handled by `flex-direction: row-reverse` in the
     overlay, not by editing every button's HTML.
   - **Calendar** (Phase 5's `.eds-calendar-grid`): weekday columns
     (Sun→Sat) reverse order in RTL locales that read calendars
     right-to-left. This is a genuine content decision, not just CSS -
     flagged for the future phase to confirm with the client rather than
     assumed here.
   - **Timeline** (`.eds-discovery-timeline`, `.elp-highlights-list`): the
     vertical connecting line and its `::before` left-offset needs an
     RTL-mirrored `right` offset - a contained, single-selector override.
   - **Tables**: none exist yet in the current component library: if/when
     one is added, the same additive-overlay pattern applies (no
     retroactive work needed now).

---

## 8. Typography strategy

| | Recommendation | Why |
|---|---|---|
| **English** | Keep Inter (current `--font-primary`), unchanged | Already the site's frozen design-system font (Phase 0); no reason to touch it |
| **Urdu body/UI text** | **Noto Naskh Urdu** (or equivalent Naskh-style webfont) | Naskh scripts render closer to the Latin baseline model Inter uses - predictable line-height, works inside tight UI containers (buttons, badges, cards, form fields) where Nastaliq's diagonal flow and larger vertical rhythm cause overflow/clipping issues at small sizes |
| **Urdu editorial/heading treatment (optional)** | Nastaliq webfont (e.g. Noto Nastaliq Urdu or Jameel Noori Nastaliq) for large display headings only | Mirrors the site's *existing* pattern of a secondary display font for specific editorial moments (`--font-display: 'Playfair Display'`, used only for the CEO quote treatment, Session 21 audit) - Nastaliq for Urdu H1/quote treatments would be the equivalent premium touch, not a UI-wide font |
| **Numerals** | Western numerals (0-9), not Eastern Arabic-Indic (٠١٢٣...), even in Urdu UI | Matches current mainstream convention in Pakistani digital products; avoids numeral-conversion logic inside every JS-driven counter/countdown/calendar (Phase 3/5), which would otherwise need locale-aware number formatting for zero UX benefit at this audience |
| **Font pairing (mixed content)** | `font-family: var(--font-primary), 'Noto Naskh Urdu', sans-serif;` as the UI-wide stack | A page in Urdu still shows Latin brand names/numbers (e.g. "BXSS", "2026") in Inter and Urdu script in Noto Naskh Urdu automatically, since the browser's font-fallback engine selects per-character based on the glyphs each font actually contains - no manual language-splitting inside a single string needed |
| **Performance** | `font-display: swap` + subsetting to the Urdu Unicode range only (not the full Noto Naskh Urdu file, which includes glyphs this site will never use) | Keeps the added webfont weight proportional to what's actually rendered; matches the existing site's `&display=swap` convention already used for the Google Fonts Inter import |

---

## 9. Developer architecture (folder structure)

```
/locales/
    en/  common.json  nav.json  buttons.json  forms.json  messages.json  events-ui.json
    ur/  common.json  nav.json  buttons.json  forms.json  messages.json  events-ui.json
    (future: /ar/, /fr/, ... - same 6 namespace files, nothing else changes)

/assets/js/
    language-manager.js   <- architecture reference, delivered this phase,
                              NOT linked from any HTML page yet (see file header)

translation-schema.json    <- JSON Schema for one locale bundle (root of repo,
                               alongside event-schema.json from Phase 4)
sample-en.json              <- schema-valid example bundle
sample-ur.json               <- schema-valid example bundle
i18n-architecture.md          <- this document
```

**Why `/locales/` at the repo root, not under `/assets/`**: translation
files are content, not a static asset in the same sense as an image or a
compiled stylesheet - they change on a different cadence (a translator
edits them, a CMS may sync them, a build step may regenerate them from a
CMS export) and shouldn't be bundled conceptually with `/assets/css` or
`/assets/js`. This mirrors where `event-schema.json`/`sample-event.json`
already live (repo root, not `/assets/`) - i18n content and event content
are siblings in the same "structured data, not static asset" category.

**`language-manager.js`'s role** (delivered this phase as an architecture
reference only - see the file's own header comment for exactly what "not
implemented yet" means in practice): a small loader/resolver with three
responsibilities - (1) fetch the right namespace JSON files for the active
locale, (2) walk the DOM for `[data-i18n]` elements and replace their text,
(3) set `<html lang dir>`. It is intentionally *not* wired into any page's
`<script>` tags yet, and intentionally has no dependency on any specific
page - it's designed to be the one shared file every future page includes,
the same way `main.js` is shared today.

---

## 10. Files delivered this phase

- **`i18n-architecture.md`** - this document.
- **`translation-schema.json`** - JSON Schema (draft 2020-12) for a locale
  bundle: 6 namespaces (common, nav, buttons, forms, messages, events-ui),
  each with defined required/optional keys and a `direction` field
  (`"ltr"`/`"rtl"`) at the bundle root so a consumer never has to hardcode
  which languages are RTL.
- **`sample-en.json`** - a complete, schema-valid English bundle.
- **`sample-ur.json`** - a complete, schema-valid Urdu bundle (real Urdu
  text, to prove the schema and font/RTL reasoning against real content -
  **not wired into the live site**, per this phase's explicit scope).
- **`assets/js/language-manager.js`** - architecture-reference loader/
  resolver, **not linked from any HTML page**.

## 11. Future CMS / API compatibility (self-review checklist)

- **WordPress**: WPML/Polylang both natively use `/xx/` path prefixes and
  per-string translation tables - this architecture's URL and storage
  strategy requires no adaptation, only a one-time import of the JSON
  namespace files into the plugin's string database.
- **Headless CMS**: a `locale` field on any content type + this same
  namespace-JSON shape as the CMS's "UI strings" content type (distinct
  from "Event" content, per Section 4) - direct fit.
- **REST/GraphQL**: `GET /locales/{lang}/{namespace}` maps 1:1 to the file
  structure; GraphQL would expose the same as a `translations(locale, ns)`
  query - no structural change needed either way.
- **Mobile apps**: the same JSON bundles are directly consumable by a
  native app's own i18n system (iOS/Android and React Native/Flutter all
  accept flat or nested key-value JSON) - nothing here is web-specific.
- **Design system preserved**: zero changes to `tokens.css`, zero changes
  to any `eds-`/`elp-`/`evtpg-`/`evc-` component's markup or CSS this
  phase - confirmed by not modifying any of those files in this delivery.
