# Enterprise Website Information & Content Architecture

**Phase 9 · Session 29 · Badar Expo Solutions (BXSS)**

**Scope note:** this document is the entire Phase 9 deliverable. Per the phase
brief, no HTML/CSS/JS was written and no existing file was modified or even
opened for editing — this is architecture only, for a future implementation
phase to build from. `data.txt` was intentionally NOT appended this session
either, since the brief's regression-safety rules say not to modify existing
files; if you'd like the usual session log entry added retroactively, say so
and I'll do it as an explicit, separate action.

---

## 0. Grounding: what already exists (read before anything below)

Three real things already sit in the codebase, unbuilt-on, that this
architecture must slot into rather than compete with:

1. **Two placeholder nav items**: `Industries` and `International Projects`
   are top-level nav items today, both `href="#"` (index.html ~line 160-161).
2. **A structured `Insights` dropdown** already exists in the mega-menu with
   three children: `Media Gallery`, `Blogs`, `News & Updates` (index.html
   ~line 164-168). Note this bundles Gallery and Media into one link today -
   Section 3 below recommends splitting them, since the brief treats them as
   two distinct sections with different content models.
3. **A fully-designed "Featured Insights" card grid already exists on the
   homepage** (`content-insights.php` template part, index.html ~line
   666-750) - 6 cards, each tagged **"Newsroom"**, **"Blog"**, or
   **"Case Study"**. This is real, existing product decisions about content
   taxonomy, not a blank slate - the architecture below treats "Newsroom" as
   the Media section's content type, "Blog" as the Blog section's, and
   "Case Study" as a bridge type connecting Events/Industries/Projects
   (Section 6). Nothing here invents a new taxonomy; it formalizes the one
   already sitting on the homepage.

---

## 1. Industries

### Purpose
Industries answers "does BXSS understand *my* sector?" for a visitor who
arrives industry-first rather than event-first (a textile manufacturer
searching "exhibition management textile Pakistan" doesn't necessarily know
which BXSS event is relevant yet - Industries is the entry point that
doesn't require already knowing the event calendar).

### User goals
- Confirm BXSS has relevant experience in their sector before engaging further.
- See proof (past events, projects, case studies) specific to their industry.
- Get to a relevant event, project, or contact path quickly.

### Business goals
- Capture industry-first search traffic that Events/Projects pages, which
  are event-first or geography-first, don't naturally catch.
- Support sales conversations ("send me your Textile page") with a
  dedicated, linkable asset per sector.
- Build a durable content spine: industries change slowly, so this is the
  lowest-maintenance high-value content type to build first (see Section 9,
  implementation order).

### Content strategy
Two-tier: an **Industries Hub** (grid of every industry, matches the
existing homepage stat "Industries Served Nationwide" and the footer's
existing 8-item industries list) + an **Industry Detail** page per sector,
reusing the exact reusable-template pattern already proven in Phase 1-2
(`event-landing.html`): one master template, duplicated per industry, not
hand-built per page.

### Future scalability
The footer already lists 8 industries (Textile & Fashion, Food & Beverage,
Technology & Innovation, Healthcare & Pharma, Agriculture & Livestock,
Construction & Real Estate, Defence & Security, Education & Training) -
that's the day-one set. This is a *slowly growing, finite* taxonomy (an
enterprise rarely exceeds 20-30 industries even at scale), which is the
key architectural signal: **Industries does not need the Phase 5 Discovery
Engine** (search/filter/sort/pagination) - a plain grid is the right-sized
solution. Over-engineering this with a full discovery UI would be exactly
the kind of unnecessary complexity the project has consistently avoided.

### Navigation position
Stays exactly where it is today - a top-level nav item, not nested under
Services or Insights. It's already correctly positioned; no change
recommended (see Section 10, Navigation Strategy).

### Relationship with Events
One industry → many events (an event's `industry[]` field already exists in
`event-schema.json`, Phase 4). An Industry Detail page's "Related Events"
section queries events where `industry[]` contains this industry - this is
a filtered view into the SAME Phase 5 Discovery Engine dataset, reusable via
the deep-link query-param pattern already built in Phase 6
(`events-calendar.html?industry=Textile`).

### Relationship with International Projects
One industry → many projects (a project can be tagged with one or more
industries it served). Cross-links both directions: Industry Detail shows
"Projects in this Industry"; Project Detail shows its industry tag(s)
linking back.

### Relationship with Blog
One industry → many blog posts (via a shared `industry` taxonomy tag on
blog posts, Section 6). Industry Detail shows "Insights for this Industry."

### Relationship with Gallery
Industry Detail can surface a filtered Gallery album ("Photos from Textile
sector events") - a thin filtered view, not a separate gallery system per
industry.

### Relationship with Media
Loosely coupled - a press release rarely belongs to one industry
exclusively. No dedicated cross-link recommended; if a press release
concerns one industry heavily, it can tag that industry the same way a
blog post would (same taxonomy field), and it'll surface in the "Insights
for this Industry" module without needing a separate mechanism.

### Recommended page types
1. **Industries Hub** (`industries.html`) - grid of every industry (icon/
   photo + name + one-line description + stat), linking to each detail page.
2. **Industry Detail** (reusable template, duplicated per industry - see
   Section 8) - overview, why-BXSS-for-this-industry, related events,
   related projects, related insights, a relevant stat block, CTA.

### Recommended internal navigation
Industries Hub → Industry Detail → (Related Events | Related Projects |
Related Insights) → Event Detail / Project Detail / Blog Post → Contact.
Breadcrumb: `Home / Industries / {Industry Name}`.

### Future expansion strategy
New industries are added by duplicating the Industry Detail template
(exact same pattern as event-landing.html per event) and adding one entry
to the Industries Hub grid + the shared taxonomy list (footer, mega-menu,
event/project/blog tagging options) - no structural change required.

---

## 2. International Projects

### Purpose
Where Events answers "what happened at a specific exhibition" and
Industries answers "does BXSS understand my sector," International
Projects answers "has BXSS delivered work *outside Pakistan* / for
*international clients*" - a distinct trust signal for foreign delegations,
embassies, and cross-border investors, which the existing portfolio images
(china-embassy, vietnam-ambassador, saudi-delegation, pimec-2027-china-
embassy-meeting) show is already a real, photographed part of BXSS's work
that has no dedicated page yet.

### Business goals
- Credential BXSS for international/government-facing opportunities
  distinctly from domestic trade-show work.
- Give embassy/delegation contacts a specific, shareable page rather than
  burying this work inside the general Events portfolio.

### Content structure
Same two-tier pattern as Industries: **Projects Hub** (`international-
projects.html`) + **Project Detail** (reusable template, duplicated per
project). Unlike Industries (a fixed taxonomy), Projects is an *unbounded,
growing list* - every new international engagement adds one project. This
is the architectural signal that Projects, unlike Industries, likely
DOES eventually benefit from the Phase 5 Discovery Engine once the list
grows past roughly 15-20 entries (filterable by country/year/industry) -
but launches as a simple grid, upgrading later without a rebuild (the
Discovery Engine's data-driven design, per Phase 5's own documentation,
was built to accept any dataset shaped like this).

### Relationship with Industries
Many-to-many via a shared `industry[]` tag (a project can span multiple
industries, e.g. a defense-and-technology bilateral expo).

### Relationship with Events
A project may or may not correspond 1:1 with a single Event Detail page -
some international projects ARE events (already covered by the Event
System) with an additional "this was an international delegation/embassy
engagement" framing; others are engagements that never had a public event
page (a private government consultation). Recommend a project record
carries an *optional* `relatedEventId` field, not a required one - Project
and Event are siblings, not parent/child.

### Relationship with Blog
One project → many blog posts/case studies (the "Case Study" tag already on
the homepage's Featured Insights grid is very likely to be, in practice,
project write-ups - Section 6 formalizes this).

### Relationship with Media
Strong relationship - embassy/delegation visits are exactly the kind of
content a Press/Newsroom section covers. A project can reference press
coverage; a press release can reference a project. Both are optional
cross-links, not required.

### Relationship with Gallery
Every project should have a photo set (the existing portfolio images
already prove this content exists) - Project Detail embeds a filtered
Gallery album, same pattern as Industries.

### Future growth
Country/region becomes a natural second navigation facet once the list
grows (a "Projects in the Gulf," "Projects in East Asia" grouping) - this
is a Discovery Engine filter facet addition (data field, not new UI), not
a new page type.

---

## 3. Insights (parent knowledge center)

### Purpose
Insights is the umbrella for BXSS's *thought leadership and news* - it is
not itself a content type, it's a navigational and organizational parent
for three content types that are genuinely different in purpose and cadence:
Gallery (visual proof), Media (press/PR), and Blog (editorial/knowledge).
Treating it as a parent, not a fourth content type, avoids the trap of
building a generic "Insights post" that awkwardly serves three different
purposes.

### Content strategy
Insights itself needs exactly one page: an **Insights Hub**
(`insights.html`) that is essentially a curated cross-section - a few
recent items from each of Gallery/Media/Blog, plus "View All" links into
each. It should visually echo the homepage's existing Featured Insights
card grid (same card component, same tag-badge convention: Newsroom / Blog
/ Case Study) rather than inventing a new card style - continuity with
content the visitor has likely already seen on the homepage.

### Navigation strategy
Insights remains the mega-menu dropdown parent it already is today. Its
three children should be **Gallery, Media, Blog** as three DISTINCT links
(recommend splitting the current combined "Media Gallery" mobile-submenu
entry into two - see Section 10) rather than two, since Gallery (visual
albums) and Media (press/downloads) are different content models with
different fields, and merging them in the UI would force an awkward
shared page later.

### User journey
A visitor reaches Insights one of two ways: (a) top-down, clicking
"Insights" in the nav to browse everything, landing on the Hub; or (b)
bottom-up, arriving at one Blog post or Gallery album from a search engine
or a cross-link from an Event/Industry/Project page, with no need to ever
visit the Hub at all. Both paths must work independently - the Hub is a
convenience for browsers, not a required gateway (matches the "never feel
trapped" principle already established in Phase 5/6).

### Relationship with every other section
Insights (via its three children) is the connective tissue of the whole
site - Section 5 (Internal Linking Strategy) and Section 6 (Relationship
Diagram) cover this in full; the short version: every other section
(Events, Industries, Projects) can surface relevant Insights content, and
every Insights item can reference the Event/Industry/Project it relates to,
but Insights itself has no required dependency on any of them - a Blog post
about "5 Trends in Exhibition Design" needs no event/industry/project
reference at all, and that must remain valid.

---

## 4. Gallery

### Purpose
Visual proof of scale and quality - the single most persuasive content
type for a visitor comparing exhibition companies, and the one with the
most existing raw material already sitting in the codebase
(`assets/images/portfolio/`, `raw-assets/Facebook/` - dozens of
unpublished event photos already exist).

### Content model
- **Albums**: one album per event/project (an album is really just "all
  photos tagged with this eventId or projectId" - not a separately
  authored entity requiring its own metadata beyond a title/cover image).
- **Categories**: Exhibitions, Conferences, Corporate Events, Concerts/
  Entertainment, Government & Delegations - a small, fixed taxonomy (same
  "finite, slow-growing" pattern as Industries) for browsing without an
  album/event context.
- **Images**: reuses the Phase 4 `mediaItem` schema type exactly (`url`,
  `alt`, `caption`, `order`, `featured`) - already defined, no new schema
  needed.
- **Videos**: same `mediaItem` type with a `thumbnailUrl`, already
  supported by Phase 3's `.eds-video-card` component.

### Relationship with Events
Primary relationship - most albums ARE an event's photo set. An Event
Detail page's existing Gallery Preview section (Phase 2) already links
conceptually to "the full gallery" - this phase's Gallery Hub is that
destination, not a new concept.

### Relationship with Projects
Same pattern as Events - a project's photo set is a Gallery album.

### Relationship with Blog
A blog post can embed images from an existing album (via `albumId` +
selected image `id`s) rather than uploading duplicate copies - keeps a
single source of truth for any photo that's used in both a gallery and an
article.

### Future expansion
Video content and a "featured reel" on the homepage are natural additions
once volume justifies it - the `mediaItem` schema already supports video,
so this is a UI addition (a slider/reel component), not a data-model
change.

---

## 5. Media

### Purpose
The formal press/PR function - press releases, media coverage mentions,
and downloadable brand assets for journalists, partners, and government
liaisons. Distinct from Blog (editorial voice, written for prospects) and
Gallery (visual proof, not text) - Media is BXSS speaking in an official,
citable capacity, or being cited by others.

### Content model
- **Press releases**: title, date, body, optional related event/project,
  downloadable PDF version.
- **Media coverage**: external mentions (publication name, logo, headline,
  external link, date) - this is what the existing `.eds-logo-carousel`/
  sponsor-tier component family (Phase 3) is structurally identical to
  ("Media Partner Card" already exists as a named component from Phase 3's
  brief) - direct reuse, not a new component.
- **Downloads / Brand assets**: company profile PDF, logo pack, brand
  guidelines - the Phase 3 `.eds-download-card` component (built for
  event brochures) is structurally identical to a press-kit download card.
- **Logos / PDFs**: files, not page content - live in `assets/` per the
  existing asset-folder convention, referenced by Media content records.

### Relationship with Events
A press release very often IS about an event ("BXSS to Organize IDEAS
2026") - optional `relatedEventId`, same pattern as Projects.

### Relationship with Projects
Same optional relationship, for internationally-newsworthy engagements.

### Relationship with Gallery
A press release can embed 1-2 images from a related Gallery album (same
"reference, don't duplicate" pattern as Blog).

---

## 6. Blog

### Purpose
Editorial and thought-leadership content, written for prospects and
industry peers - "why exhibitions matter," "how to choose a stall
fabricator," sector deep-dives. This is also, per the homepage's existing
tag evidence, home to **Case Studies** - the existing "Case Study" tag
should be modeled as a Blog **category**, not a fourth content type, since
structurally a case study is just a blog post with a required
project/event reference and a more structured body (Challenge/Solution/
Result), not a different page template.

### Knowledge sharing structure
- **Categories** (small, curated, shown in nav/filters): Industry
  Insights, Company News, Case Studies, Event Recaps, How-To/Guides -
  covers the "Newsroom"/"Blog"/"Case Study" tags already in use plus
  reasonable near-term growth, without over-designing a taxonomy that
  doesn't exist yet.
- **Tags**: free-form, unbounded (e.g. "textile," "government," "b2b
  matchmaking") - for cross-cutting discovery separate from the curated
  category list, same distinction already established between `category`
  (controlled) and `tags` (free-form) in the Phase 4 event schema.
- **Authors**: name, photo, title, bio, social links - this is
  *structurally identical* to Phase 3's Speaker Card
  (`.eds-speaker-card`). Recommend reusing that component's data shape
  for authors rather than designing a new one (see Section 7).
- **Related posts**: same-category or shared-tag posts, surfaced at the
  end of a post - reuses `.eds-related-card` (Phase 3/5) exactly as
  Event Detail already does for Related Events.

### SEO readiness (architecture only, not implementation)
Every post needs a `slug`, `metaTitle`, `metaDescription`, and `publishDate`
field in its content model from day one, even though SEO implementation
itself is out of scope (per this phase's own explicit exclusion and every
prior phase's) - retrofitting these fields onto existing content later is
far more costly than reserving the fields now.

### Relationship with Events
A post tagged "Event Recap" references one `relatedEventId`; a general
industry post may reference zero.

### Relationship with Industries
Every post can carry one or more `industry` tags (shared taxonomy with
Events/Projects, Section 1) - powers the "Insights for this Industry"
module on Industry Detail pages.

### Relationship with Projects
Same optional-reference pattern as Events - a "Case Study" category post
should require this reference (structurally, since a case study without a
subject project/event isn't really a case study).

### Discovery Engine reuse (the single biggest architectural win in this
phase)
Once the Blog has more than a handful of posts, it needs exactly the same
capability set Events already has: search, filter by category/tag,
sort by date, load more. **This is the Phase 5 `EdsDiscovery` engine,
unmodified** - it was explicitly built data-driven and documented as
reusable "by any future browsable list (e.g. a future Speakers or Sponsors
directory)" in its own Phase 5 source comments. A Blog Hub is that future
list. No new discovery/search/filter component needs designing - only a
new `EdsEventFields`-equivalent accessor object pointing at Blog post
field names, per the existing pattern.

---

## 7. Navigation blueprint

```
Home
About Us
Services (unchanged)
Events (unchanged - Our Role / Formats / Discover)
Industries                              <- NEW hub, was href="#"
International Projects                  <- NEW hub, was href="#"
Insights                                <- existing dropdown, children updated:
    -> Gallery                          <- split out from "Media Gallery"
    -> Media                            <- split out from "Media Gallery"
    -> Blog                             <- was "Blogs"
    (News & Updates retired as a separate link - it was never a distinct
     content type from Media/Blog; a "news" post is just a Media press
     release or a Blog "Company News" category post, per Section 5/6)
Contact (unchanged)
```

No other structural change to the navbar, mega-menu layout, mobile drawer,
or search overlay is recommended - the existing 3-column mega-menu pattern
(a "dynamic-links" primary column + a "highlight" spotlight column, per
`growthservices.html`'s Services mega-menu) is the correct pattern to
replicate for Insights' own mega-menu content once built, not a new pattern.

---

## 8. Content blueprint (field reference, by section)

| Section | Required fields | Optional fields | Relationships |
|---|---|---|---|
| **Industry** | id, slug, name, description, icon/image | statBlock, longDescription | relatedEventIds[], relatedProjectIds[], relatedPostIds[] (all derived via shared `industry` tag on the other side, not stored on Industry itself) |
| **Project** | id, slug, name, country, year, summary | description, gallery albumId, relatedEventId, industry[] | industry[] (many-to-many), relatedEventId (optional 1:1), press mentions (optional) |
| **Gallery Album** | id, title, coverImage, images[] | relatedEventId, relatedProjectId, category | images[] each = Phase 4 `mediaItem` type (already defined) |
| **Press Release** | id, slug, title, date, body | relatedEventId, relatedProjectId, pdfUrl | optional links to Event/Project |
| **Media Coverage** | id, publicationName, publicationLogo, headline, externalUrl, date | relatedEventId | none required |
| **Blog Post** | id, slug, title, category, author, publishDate, body, metaTitle, metaDescription | relatedEventId, relatedProjectId, industry[], tags[] | author -> Author record (Speaker-Card-shaped); category (controlled); tags (free) |
| **Author** | id, name, photo, title | bio, socialLinks | reuses Phase 3 speaker data shape exactly |

**Reusable content** (defined once, referenced everywhere): Gallery images,
Author records, Industry/Category taxonomies. **Dynamic content** (computed
at render time, never stored): "Related Events for this Industry,"
"Insights for this Project" - always a live query against the shared tag
fields above, never a manually-maintained list, so adding one new tagged
item automatically surfaces everywhere relevant without editing multiple
records.

---

## 9. Relationship diagram (text format)

```
                              ┌───────────┐
                              │  INDUSTRY │  (finite taxonomy, ~8-30 items)
                              └─────┬─────┘
                    industry[] tag  │  industry[] tag
              ┌───────────┬─────────┼─────────┬───────────┐
              ▼           ▼         ▼         ▼           ▼
         ┌────────┐  ┌─────────┐          ┌───────┐  ┌──────────┐
         │ EVENT  │  │ PROJECT │          │ BLOG  │  │  MEDIA   │
         │(Ph. 4) │  │  (new)  │          │ POST  │  │ (new)    │
         └───┬────┘  └────┬────┘          └───┬───┘  └────┬─────┘
             │  relatedEventId (optional, either direction) │
             │◄───────────┘                                 │
             │            optional relatedEventId/ProjectId │
             │◄─────────────────────────────────────────────┘
             │
             │  every one of Event / Project / Blog Post / Media
             │  can reference a GALLERY ALBUM (photos), and vice versa
             ▼
        ┌─────────┐
        │ GALLERY │  (albums keyed by eventId/projectId, or standalone)
        │ ALBUM   │
        └─────────┘

   INSIGHTS (nav parent only, not a content type) sits ABOVE
   Gallery / Media / Blog Post as their shared navigational entry point.

   CONTACT is the universal terminal node - every content type's detail
   page ends in a Contact/CTA, matching the pattern already established
   in Phase 6 (every event page ends the same way).
```

Key principle encoded above: **every cross-section relationship is
optional and bidirectional-by-query, never a required foreign key in the
"wrong" direction.** A Blog post doesn't require an Event; an Event doesn't
require a Blog post. This is what keeps each section independently
publishable (a content editor can write a Blog post with zero Events/
Projects/Industries knowledge) while still surfacing rich cross-links
automatically wherever a tag happens to match.

---

## 10. Future page hierarchy

```
industries.html                          (Hub)
industry-landing.html                    (Reusable template - Phase 1 pattern)
  -> duplicated per industry as needed at implementation time
     (e.g. industry-textile.html, industry-healthcare.html - naming
     mirrors event-landing.html's own eventual per-event duplication
     convention, not invented fresh)

international-projects.html              (Hub)
project-landing.html                     (Reusable template)
  -> duplicated per project

insights.html                            (Hub / cross-section landing)

gallery.html                             (Hub - album grid)
gallery-album.html                       (Reusable template per album)

media.html                               (Hub - press releases + coverage + downloads)
media-release.html                       (Reusable template per press release)

blog.html                                (Hub - Discovery Engine powered, see Section 6)
blog-post.html                           (Reusable template per post)
```

Every Hub + Reusable-Template pair mirrors the exact `events.html` +
`event-landing.html` relationship already established and proven across
Phases 1, 2, and 5 - no new page-relationship pattern is introduced
anywhere in this architecture.

---

## 11. Recommended implementation order

1. **Industries** first - smallest content model (finite taxonomy, no
   Discovery Engine needed), highest immediate SEO/sales value, and every
   other section's `industry[]` tag depends on this taxonomy existing
   first (Events and the future Blog/Project/Media schemas all reference
   it).
2. **Gallery** second - the raw content (photos) already exists in
   `assets/images/portfolio/` and `raw-assets/`; this is the lowest-effort,
   highest-visual-impact section to launch, and Industry/Project detail
   pages (steps 1 and 4) both want to embed Gallery albums, so having
   Gallery live before those benefits their launch too.
3. **Media** third - moderate content volume, reuses Phase 3 download-card
   and logo-carousel components almost entirely as-is.
4. **International Projects** fourth - depends on Industries' taxonomy
   (step 1) and benefits from Gallery being live (step 2) for its photo
   albums.
5. **Blog** last - the largest content-authoring lift (writing posts is a
   content task, not an engineering one) and the one most worth having
   Industries/Projects/Media already live first, since Blog posts are the
   most likely content type to cross-reference all three.

This order also front-loads the lowest-risk, highest-reuse work (Industries,
Gallery) and defers the highest-content-effort, most cross-referencing
section (Blog) to last, when the most other sections exist to link into.

---

## 12. Reusable component strategy

**Directly reusable, zero new components needed:**

| Need | Existing component (Phase 3/5) |
|---|---|
| Industry/Project/Post card grids | `.eds-related-card` + `.eds-events-grid` layout |
| Industry stat blocks | `.eds-achievement-card` / `.eds-info-card` |
| Gallery albums, featured images, video | `.eds-gallery-grid`, `.eds-featured-image`, `.eds-video-card`, `.eds-media-slider` |
| Press/media coverage logos | `.eds-logo-carousel`, `.eds-sponsor-card--media` (already named exactly for this in Phase 3) |
| Brand asset / press-kit downloads | `.eds-download-card` |
| Blog author bio block | `.eds-speaker-card` (same data shape: photo, name, title, bio, socials) |
| Blog/Project/Industry hub search+filter+sort+pagination | `EdsDiscovery` engine (Phase 5) - add a new field-accessor object only |
| Section headers, badges, tags, buttons, empty states, skeletons | Entire Phase 3 utility layer, unchanged |
| Breadcrumbs | `.page-breadcrumb-bar` (global component, Phase 0/6) |

**Genuinely new components required** (none existed before this phase's
content types):

- **Category/Tag filter chips for Blog** - conceptually close to
  `.eds-chip` (Phase 3) but chips there are a generic utility; Blog needs
  a *category* (single-select, like the existing status tabs pattern) vs
  *tag* (multi-select, like chips) distinction reflected in two small,
  new usage patterns - not new CSS, a new *composition* of two things
  that already exist.
- **World/region map with project pins** (International Projects Hub, once
  the list is large enough to warrant a map view alongside the grid) - this
  is the one component with no existing precedent anywhere in Phase 0-8;
  flagged as the single piece of net-new component design a future
  implementation phase should budget real design time for, not treated as
  a trivial reuse.

No existing component is proposed for replacement or duplication anywhere
in this architecture.

---

## 13. Future folder strategy (documentation only, no files created)

Per rules.txt Section 1 (root-level flat HTML files, category-based
`assets/images/` folders), the same conventions extend directly:

```
industries.html, industry-landing.html
international-projects.html, project-landing.html
insights.html
gallery.html, gallery-album.html
media.html, media-release.html
blog.html, blog-post.html

assets/css/  (page + component CSS, same eds-/page-prefix rules as today)
  industries-components.css / industry-landing.css   (if content justifies
     a dedicated component layer, per the eds- vs page-specific split
     already established - decide at implementation time based on actual
     component count, don't pre-build an empty file now)
  gallery.css, media.css, blog.css  (page-specific, per existing convention)

assets/images/
  industries/    <- NEW category folder, same pattern as clients-logo/, portfolio/
  projects/      <- NEW category folder
  press/         <- NEW category folder (logos, headshots for Media)
  blog/          <- NEW category folder (post cover images)

assets/js/
  (new page-specific JS per hub, following the exact events-calendar.js
  pattern: a small dataset-loading + EdsDiscovery.init() wiring file, once
  each section's real data source exists)
```

---

## 14. Developer notes

- **Do not build a generic "Content" or "Post" mega-table/mega-schema**
  covering Industries/Projects/Gallery/Media/Blog as one shape with lots
  of unused optional fields. Section 8's per-type field tables are
  intentionally distinct schemas (matching how `event-schema.json`,
  Phase 4, is its own dedicated schema, not a generic "Content" schema)
  - a shared generic model looks simpler on day one and becomes a mess of
    nullable fields and type-checking by year two.
- **Taxonomy fields (`industry[]`, `category`, `tags[]`) should be
  controlled/shared vocabularies defined once**, not re-typed per content
  type's schema file - mirrors Phase 4's own `statValue.key` convention
  (documented vocabulary, not a hard enum) so a new industry or category
  never requires a schema migration, only a data addition.
- **Every Hub page should launch with an Empty State and a Loading
  Skeleton from day one** (both already exist as reusable Phase 3
  components), even for a section that launches with only 2-3 items -
  matches the precedent already set for Events/Calendar in Phase 5.
- **Author records should be created as their own small reusable list**
  (even if BXSS only has 1-2 blog authors at launch) rather than inlined
  per-post, for the same reason Speakers were modeled as their own entity
  in Phase 4 rather than inlined into Sessions - a real person's bio
  shouldn't need re-entering every time they publish.

---

## 15. Architecture summary (self-review)

✓ **Preserves the existing project** - zero files modified, zero components
  redesigned, zero navigation items removed (one merge - "Media Gallery" -
  is proposed to split into two, which is additive clarity, not a
  redesign).

✓ **Future pages will feel native** - every new page type follows an
  already-proven pattern from this exact project (Hub + Reusable Template
  from Phase 1/2; Discovery Engine from Phase 5; card/badge/button
  components from Phase 3) rather than introducing a new pattern.

✓ **Scalable to hundreds of pages** - Industry/Project/Blog Post are all
  templated-and-duplicated, not hand-built; Blog explicitly gets the
  Discovery Engine specifically because it's the section most likely to
  reach "hundreds."

✓ **Relationships are logical and optional-by-default** - no content type
  requires another to exist, avoiding a fragile publishing order
  dependency, while still surfacing rich, automatic cross-links via shared
  taxonomy tags.

✓ **Consistent with the existing design system** - no new visual language
  proposed anywhere; the one genuinely new component (project map) is
  explicitly flagged as needing real design attention rather than being
  waved through as a trivial reuse.

✓ **Future implementation gets easier, not harder** - the implementation
  order (Section 11) is sequenced so each section's dependencies (shared
  taxonomy, Gallery albums) are already live before the sections that lean
  on them, and every new page type reuses either an existing component
  wholesale or an existing *pattern* (Hub+Template, Discovery Engine) with
  new data behind it.
