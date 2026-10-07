# Thenuka Sri Lanka — Implementation Plan

## Product direction
A single-page, cinematic Sri Lankan travel discovery experience for international visitors. The page is intentionally static-first: all visitor-facing interactions work without a backend, while search, itinerary generation, weather, and availability are isolated as demo adapters ready for real APIs later.

## Design system
- **Design Movement:** editorial luxury travel meets observatory-grade digital cartography — deep, quiet surfaces with luminous natural imagery and restrained gold instrumentation.
- **Core Principles:** 1) atmosphere before information, 2) editorial storytelling over grids, 3) every interaction reveals a next layer, 4) premium restraint with useful motion.
- **Color Philosophy:** obsidian and midnight create a dark stage for landscape imagery; emerald and ocean blue carry the island’s living systems; warm gold marks guidance, craft and high-intent actions; ivory keeps reading humane.
- **Layout Paradigm:** a vertical cinematic journey punctuated by offset editorial compositions, horizontal rails, sticky visual stages and a constellation-style map instead of a standard centered card grid.
- **Signature Elements:** a gold coordinate line, glass navigation capsule, and island constellation nodes that echo the brand’s wordmark mark.
- **Interaction Philosophy:** hover states feel like a lens focusing; clicks move the visitor deeper into the island; drag/reorder interactions make planning tactile; reduced-motion mode keeps the same hierarchy without motion.
- **Animation:** slow ambient drift, 0.7–1.0s reveal easing, parallax kept subtle, transform/opacity prioritized over layout changes, and IntersectionObserver-triggered reveals to avoid a heavy runtime.
- **Typography System:** `DM Sans` for utility/UI and `Cormorant Garamond` for emotional display titles. Labels use uppercase letter spacing; titles use tight leading and generous negative space.
- **Brand Essence:** a cinematic digital gateway to Sri Lanka for curious, design-conscious international travelers. Personality: **luminous, discerning, alive**.
- **Brand Voice:** calm, evocative, specific. Example lines: “Follow the light inland.” and “The island is not one destination. It is a sequence of awakenings.”
- **Wordmark & Logo:** compact island silhouette nested inside a split-ring compass mark, paired with a spaced uppercase wordmark and a gold coordinate accent.
- **Signature Brand Color:** Ceylon Gold `#D7B86A`.

## Technical approach
- Plain HTML5, CSS3 and ES6 modules-free JavaScript for a zero-build static deliverable.
- `index.html` contains semantic sections, SEO metadata, JSON-LD and accessible controls.
- `styles.css` owns the entire visual system, responsive breakpoints, reduced-motion overrides, glass surfaces and cinematic layout.
- `script.js` owns the canvas starfield, nav state, custom cursor, reveal observers, destination/map selection, AI itinerary demo, journey builder, smart search demo, gallery lightbox, counters, modal menu and ambient audio toggle.
- Local image assets under `assets/` are loaded lazily where possible. The visual system uses CSS gradients and SVG for fallback depth, so no image is required for core comprehension.
- `manus-routes.json` declares the one-page route to the Webdev host.
- `app.config.ts` contains a durable project logo URL for platform metadata.

## Page structure
1. Fixed cinematic shell + progress bar.
2. Hero: “Enter the island” with CTA pair, coordinate readout, 3D-feeling island silhouette and canvas atmosphere.
3. Editorial intro + animated statistics.
4. Discover categories rail.
5. Destinations: featured destination stage and selectable destination rail.
6. Map room: interactive constellation map, node details, demo travel/weather data.
7. Luxury stays: accommodation cards with availability-only CTA.
8. Experiences: “Not just a holiday” editorial rail.
9. Thenuka AI: preference chips, day/style controls, generated demo itinerary and route line.
10. Build my journey: add/reorder destinations with computed route stats.
11. Gallery: category filters and full-screen image lightbox.
12. Culture + taste editorial panels.
13. Search surface with recommendation cards.
14. Footer: “See you in Sri Lanka.” and ownership credit.

## Boundaries and placeholders
- Live prices, live availability, live weather, maps API and real AI responses are not claimed. UI copy marks demo data where needed.
- Search and AI itinerary functions are intentionally pure client-side adapters so a real API can replace the marked functions later.
- The “3D map” is a GPU-light interactive SVG/DOM treatment with depth, glow and focus animations. It keeps the site usable without WebGL while reserving a clean upgrade path for Three.js terrain.
