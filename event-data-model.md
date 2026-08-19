# Event Data Architecture & Content Model

**Phase 4 · Session 25 · Badar Expo Solutions (BXSS)**

This document explains the data architecture behind every event on the site —
what it looks like, why it's shaped this way, and how it connects to the
Phase 3 Event Design System (EDS) components. The formal machine-readable
definition is `event-schema.json` (JSON Schema, draft 2020-12); a fully
populated, schema-valid example is `sample-event.json`. Read this document
first, then treat those two files as the source of truth for exact field
names/types.

---

## 1. Why a schema-first approach

The UI (Phase 1–3) is finished and frozen. This phase asks: what data would
have to exist for that UI to render *any* event, not just the one demo event
from Phase 2? Answering that in JSON Schema — rather than jumping straight to
a database table or a WordPress field group — keeps the model:

- **Storage-agnostic.** The same shape works whether the eventual backend is
  WordPress/ACF, a headless CMS, a Laravel or Node API, a flat JSON file, or a
  mobile app's local cache.
- **Machine-validatable.** `event-schema.json` can be run through any
  standard JSON Schema validator (as done for `sample-event.json` in this
  session) — a future API can validate incoming/outgoing event payloads
  automatically, catching bad data before it ever reaches a component.
- **Self-documenting.** Every field in the schema carries a `description`
  explaining what it's for and, where relevant, which EDS component consumes
  it — so this markdown file and the schema never drift apart the way
  separate prose docs and code tend to.

## 2. Top-level object structure

```
Event
├── id, slug                    (identity)
├── basicInfo                   (name, subtitle, category, tags, ...)
├── status                      (publishStatus, lifecycleStatus, registrationStatus)
├── timing                      (dates, timezone, countdown, recurring)
├── venue                       (name, address, coordinates, amenities, hotels, images)
├── organizer                   (name, logo, contact, social links)
├── hero                        (optional overrides for the hero component)
├── speakers[]                  (1 event → many speakers)
├── sponsors[]                  (1 event → many sponsors, tier as a field not a array-per-tier)
├── agenda.days[].sessions[]    (1 event → many days → many sessions)
├── registration                (capacity, pricing placeholder, CTA)
├── statistics[]                (generic key/label/value list)
├── gallery.images[] / videos[] (1 event → many media items)
├── faqs[]                      (1 event → many FAQs)
├── testimonials[]              (1 event → many testimonials)
└── relatedEvents[]             (references to OTHER event ids, not embedded objects)
```

Only `id`, `slug`, `basicInfo`, `status`, `timing`, and `venue` are required
at the root. Everything else defaults to an empty array/object — the UI's
Empty State component (Phase 3, `.eds-empty-state`) is specifically there so
a missing `speakers[]` or `agenda` never breaks the layout.

## 3. Required vs. optional fields (quick reference)

| Section | Required fields | Notes |
|---|---|---|
| Root | `id`, `slug`, `basicInfo`, `status`, `timing`, `venue` | Minimum to render a valid event card + hero |
| `basicInfo` | `name` | Everything else (subtitle, category, tags...) optional |
| `status` | `publishStatus` | `lifecycleStatus`/`registrationStatus` optional but recommended |
| `timing` | `startDate`, `endDate`, `timezone` | `countdownEnabled` defaults `true` |
| `venue` | `name`, `city`, `country` | `coordinates`/`mapEmbedUrl` optional — see Section 6 |
| `organizer` | `name` | Everything else optional |
| `speaker` (each) | `id`, `name` | `bio`/`photo`/`socialLinks` optional |
| `sponsor` (each) | `id`, `name`, `tier` | `tier` is required since it drives the rendered modifier class |
| `session` (each) | `id`, `time`, `title`, `type` | `speakerIds`/`location` optional |
| `faq` (each) | `id`, `question`, `answer` | `category`/`priority` optional |
| `testimonial` (each) | `id`, `name`, `review` | `rating`/`photo` optional |

Full per-field types/enums/descriptions live in `event-schema.json` — this
table is the "can I skip this field" cheat sheet, not a replacement for it.

## 4. Relationships (how "many" is modeled)

Per the brief: *one event → many speakers, sponsors, sessions, FAQs, images,
testimonials, related events.* Every one of those is a **plain JSON array on
the event object itself** — not a separate join table, because this is a
document-shaped model, not a relational one (see Section 8 for what changes
if/when a real relational database is introduced).

Two relationships are deliberately **not** simple arrays:

- **`sessions` → `speakers`**: a session references speakers by
  `speakerIds: string[]`, matching `id` values in the event's own
  `speakers[]` array, instead of duplicating speaker data inline. This is the
  one true many-to-many in the model (a session can have multiple speakers; a
  speaker can appear in multiple sessions) — normalizing it here avoids
  editing a speaker's bio in five different places if they speak five times.
- **`relatedEvents`**: references *other event ids*, not embedded event
  objects. A related-event card needs another event's summary data (name,
  image, date) — that should be resolved by whatever's serving the data
  (e.g. `GET /events/{id}?include=relatedEvents` expanding the ids into
  summaries), not duplicated into every event that links to it. This is what
  keeps the model scalable to hundreds/thousands of events: adding an event
  never requires updating every other event that might reference it.

## 5. Naming conventions

- **camelCase** for every field name (`registrationStatus`, not
  `registration_status` or `RegistrationStatus`) — matches the JS/JSON
  convention already used throughout `event-components.js`.
- **IDs are prefixed by type**: `evt_`, `spk_` (speaker), `spn_` (sponsor),
  `ses_` (session), `faq_`, `test_` (testimonial) — see `sample-event.json`.
  This is a convention, not a schema constraint (the schema only requires
  `id` to be a string), so it's safe for a real database to use UUIDs or
  auto-increment ints instead, as long as consuming code doesn't assume the
  prefix format.
- **Booleans read as an affirmative question**: `featured`, `countdownEnabled`,
  `isRecurring` — never `notFeatured` or `disabled`.
- **Enums are lowercase-kebab where multi-word**: `"sold-out"`, `"coming-soon"`,
  `"trade-show"` — matches the CSS modifier naming already established in
  Phase 3 (`.eds-badge--danger`, `.eds-sponsor-card--premium`), even though
  the enum *value* itself isn't the CSS class name (see Section 6's mapping
  tables for the actual value→class translation).

## 6. Component data mapping

How each EDS component (Phase 3) consumes this data. "Field" = the JSON path;
"Attribute/Class" = what the component actually reads.

### Hero
| Field | Component hook |
|---|---|
| `hero.title` ?? `basicInfo.name` | `<h1>` text |
| `hero.subtitle` ?? `basicInfo.subtitle` | `.eds-hero-content p` / subtitle line |
| `hero.backgroundImage.url` | `.eds-hero` background or `.eds-hero-bg-img` src |
| `hero.cta[]` | `.eds-cta-group` — one `.eds-btn--{style}` per item |
| `hero.statistics[]` | `.eds-hero-stats` — one `.eds-hero-stat` per item |
| `status.registrationStatus` (or `hero.badge` override) | `.eds-badge--{mapped}` — see status mapping below |
| `timing.startDate` | `data-countdown-date` on `[data-eds-countdown]` |

### Status → Badge style mapping
| `registrationStatus` value | `.eds-badge--*` modifier |
|---|---|
| `open` | `--success` |
| `waitlist`, `coming-soon` | `--warning` |
| `closed`, `sold-out` | `--danger` |

### Speakers
| Field | Component hook |
|---|---|
| `speakers[]` | `.eds-speaker-grid` children |
| `speaker.featured === true` | render with `.eds-speaker-card--featured` instead of default |
| `speaker.order` | sort key before rendering the grid |
| `speaker.bio` present | render `.eds-speaker-card--detail` with expandable bio |

### Sponsors
| `sponsor.tier` value | `.eds-sponsor-card--*` modifier |
|---|---|
| `title`, `platinum` | `--premium` |
| `gold`, `silver` | *(no modifier — base `.eds-sponsor-card`, sized via `.eds-sponsor-logos-lg`/default in the tier wrapper)* |
| `partner` | `--partner` |
| `supporter` | `--supporter` |
| `government` | `--government` |
| `media` | `--media` |

Group `sponsors[]` by `tier` at render time into one `.eds-sponsor-tier`
block per tier present — do not render an empty tier heading if no sponsor
has that tier.

### Agenda
| Field | Component hook |
|---|---|
| `agenda.days[]` | one `.eds-tab` + `.eds-tab-panel` pair per day (Day Switch Navigation) |
| `session.type` | `.eds-timeline-item--{type}` (values match exactly: `session`/`workshop`/`panel`/`break`/`networking`) |
| `session.speakerIds[]` | resolve against `speakers[]` to render speaker name/photo inline if desired |

### Venue
| Field | Component hook |
|---|---|
| `venue.mapEmbedUrl` | `<iframe src>` inside `.eds-map-placeholder`; if `null`, render `.eds-map-placeholder-empty` instead |
| `venue.amenities[]` | `.eds-info-card--compact` per item, using `amenity.icon` as the Font Awesome class |
| `venue.nearbyHotels[]` | Hotel Recommendation Card — reuse `.eds-info-card` |

### Statistics
| Field | Component hook |
|---|---|
| `statistics[].value` | `data-target` on `[data-eds-counter]` |
| `statistics[].suffix` / `prefix` | `data-suffix` / `data-prefix` |
| `statistics[].label` | `.eds-stat-label` text |

Recommended (not enforced) `key` vocabulary for `statistics[].key`, so
different events stay comparable: `visitors`, `exhibitors`, `countries`,
`speakers`, `sessions`, `sponsors`, `areaSqm`, `expectedAttendance`. A CMS
editor can add any other `key` value freely — the schema doesn't constrain
it, only the convention does.

### Gallery / FAQ / Testimonials / Related Events
| Field | Component hook |
|---|---|
| `gallery.images[].featured === true` | eligible for `.eds-featured-image` (2x2 grid span) |
| `faqs[]` | `.eds-accordion` — group by `faq.category` first if using Category Tabs |
| `testimonials[].rating` present | render `.eds-rating`; if `null`, omit the rating block entirely |
| `relatedEvents[].relationType` | filters which `.eds-related-card--*` modifier to use (`featured`/`past`; `upcoming`/`similar`/`recommended` render as the default card) |

## 7. Recommended folder organization (if/when data moves to files)

Not required for Phase 4 (no backend exists yet), but documented for
whichever future phase introduces one:

```
/data/
  /events/
    pakistan-trade-industry-summit-2026.json   (one file per event, named by slug)
    ...
  /event-series/
    trade-summit.json    (shared "series" metadata for recurring events,
                           referenced by timing.recurring.parentSeriesId)
```

A flat-file JSON store like this is a valid "database" for this schema at
small-to-medium scale, and maps directly onto a real database migration
later (each event JSON file → one row in an `events` table with the nested
arrays split into `speakers`, `sponsors`, `sessions`, `faqs`, `testimonials`
child tables, foreign-keyed to `events.id`).

## 8. Future CMS / API integration notes

- **WordPress/ACF**: `basicInfo`, `status`, `timing`, `venue`, `organizer`,
  `hero`, `registration` map to a single ACF Field Group on an `event` Custom
  Post Type. `speakers`, `sponsors`, `agenda.days[].sessions`, `faqs`,
  `testimonials`, `gallery.images` each map to an ACF Repeater (or, if
  speakers/sponsors are reused across events, a `speaker`/`sponsor` CPT with
  a Relationship field instead of a repeater — recommended once the same
  speaker appears across 2+ events, to avoid re-entering their bio each
  time).
- **Headless CMS** (Contentful/Sanity/Strapi-style): this schema maps almost
  directly to a content type definition — `speaker`/`sponsor`/`session` are
  natural candidates for their own content types with a reference field back
  to `event`, again once the same speaker/sponsor recurs across events.
- **REST API**: `GET /events/{slug}` returning this exact JSON shape is the
  simplest correct implementation. `GET /events?status=published&featured=true`
  etc. for listing/filtering (out of scope to build now — Phase 4 is the data
  shape, not the query layer).
- **GraphQL**: every array field here (`speakers`, `sponsors`, `sessions`,
  `faqs`, `testimonials`) is a natural GraphQL list field; `relatedEvents`
  is a natural place to demonstrate GraphQL's relationship-resolution
  strength (resolve `relatedEvents[].eventId` into full `Event` objects only
  when the client's query actually asks for them).
- **Mobile app**: since the schema has no dependency on HTML/DOM, a mobile
  client can consume the identical JSON and render native components from
  the same fields — nothing in this model is web-specific.

## 9. Files in this phase

**New files:**
- `event-schema.json` — the formal JSON Schema (draft 2020-12), validated
  successfully against `sample-event.json` with zero errors before delivery.
- `sample-event.json` — a complete, schema-valid example event (the same
  "Pakistan International Trade & Industry Summit 2026" demo content
  introduced in Phase 2, now expressed as structured data instead of HTML).
- `event-data-model.md` — this document.

**Modified files:** `rules.txt`, `website_structure.txt`, `data.txt`
(registry entries only — see Session 25).

**Explicitly not touched:** any HTML/CSS/JS file, `event-landing.html`,
`event-components.css/js`, or any other existing page/component. This phase
is data architecture only, per the brief.
