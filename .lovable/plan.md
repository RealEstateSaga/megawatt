# 1MW Content + UI Refinement

A precision pass focused on simpler copy, cleaner navigation, stronger contrast, and consistent CTAs. No structural redesign — every section keeps its layout and motion.

## 1. Hero (`src/components/landing/Hero.tsx`, `src/content/copy.ts`)

- Replace `hero.subtext` and `hero.subtextFast` with: **"Marketing systems built for growth."**
- Keep "Marketing & Advertising" as `hero.system` label, but raise contrast: change the label class from `text-muted` to a darker tone (`text-[#2A2A2A]`) and remove low-opacity siblings.
- Order on screen stays: `Marketing & Advertising` → `1MW` logo → new tagline. Nothing else.

## 2. Navigation (`src/components/landing/Nav.tsx`)

- Final link list (in order): **About, Services, Work, Process, Contact**.
- Default link color `#111111`, hover `#000000`, font-medium. Remove `text-off/90`.
- Narrative dots: keep five but ensure inactive color is a visible grey (`#BFBFBF` instead of `#E5E5E5`).
- "Start a Project" CTA kept as-is (already high contrast).

## 3. Section labels & headlines (`src/content/copy.ts`, `src/components/landing/Services.tsx`, `src/components/landing/Process.tsx`, `src/components/landing/About.tsx`)

- `reframing.label`: "What We Build" → remove the label entirely (hide the small mono label + divider in `About.tsx`). About headline ("Not a vendor. / A marketing infrastructure.") stays.
- `reframing.supporting` → **"1MW is the marketing and advertising engine behind a connected portfolio of modern brands. Built to create momentum, clarity, and measurable growth."**
- `reframing.cta` stays "See what we build" → keep but link target unchanged.
- `mechanism.label`: "What We Do" → **"Services"**
- `mechanism.headline`: "Six Systems. One Engine." → **"Six systems. One strategy."**
- Add a new `mechanism.intro` field: **"Integrated marketing systems designed to help brands grow with clarity, speed, and measurable performance."** Render it under the headline in `Services.tsx`.
- Process section title in `Process.tsx`: replace "The 1MW *Engagement*" with **"Process"** (single word, same display styling).
- Process intro paragraph (added under title): **"A clear process built to move from strategy to execution without wasted motion."**

## 4. Services pillar CTAs (`src/content/copy.ts`)

- Standardize all six pillar `cta` fields to **"Learn more"**. The arrow is appended in `Services.tsx` already.

## 5. Work / About narrative card (`src/components/landing/Work.tsx`)

- Replace the paragraph with: **"1MW is the marketing and advertising engine behind a connected portfolio of modern brands. Built to create momentum, clarity, and measurable growth."**
- Remove the rarity/domain explanation entirely. Headline "One million watts. / All in." stays.

## 6. Conversion / Contact (`src/components/landing/Contact.tsx`, `src/content/copy.ts`)

- `conversion.label`: "Let's Build It." → **"Start the conversation."**
- `conversion.primary`: → **"One conversation to map what growth could look like."**
- Remove the scroll-intensity alt subline (use single primary copy).

## 7. Footer (`src/components/landing/Footer.tsx`, `src/content/copy.ts`)

- Mini-CTA heading: "Have a project in mind?" → **"Tell us what you're building."**
- Mini-CTA subline: "We'd love to hear from you!" → **"We'll map the system behind it."**
- Nav links list: **About, Services, Work, Process, Contact** (add About + Contact to current list, in that order).
- Bottom-bar tagline: "Strategy. Creative. Technology. All in." → **"Marketing systems built for growth."**
- Link color: `text-off/90` → `text-[#111111]` hover `text-black`. Subdued lines (`text-mid`) on the © row stay (they read as system text, not links).

## 8. Contrast audit — text classes (multiple files)

Replace washed-out classes everywhere on the landing route:

- `text-light` body copy → keep (`#2B2B2B` already meets the spec).
- `text-mid` used as **support copy** stays (`#444444`).
- `text-off/55`, `text-off/70`, `text-off/30`, `text-off/90` → drop opacity, use solid `text-off` or `text-[#2B2B2B]` depending on hierarchy. Specifically:
  - `About.tsx` italic clarification line: `text-off/55` → `text-off/80` (still distinct from primary, but readable).
  - `Work.tsx` italic "All in.": `text-off/55` → `text-off/80`.
  - `Footer.tsx` nav links: `text-off/90` → `text-[#111111]`.
  - `Nav.tsx` links: `text-off/90` → `text-[#111111]`.
- Inline link CTAs that use `text-accent hover:text-mid` (About, Process, Work) → switch to `text-[#111111] hover:text-black` with same underline behavior. (`text-accent` currently maps to a grey tone; the directive wants links to read as solid black.)
- Tertiary contact link (`text-mid` with `border-mid/40`) → `text-[#111111]` with `border-black/40`.
- `ctaConfig.ts` ghost style: `text-light` → `text-[#111111]`; border `black/30` stays.

## 9. Anchor / nav integrity check

Confirm all nav anchors map to existing section IDs in `LandingSite.tsx`:

- `#about` → `About` ✓
- `#services` → `Services` ✓
- `#work` → `Work` ✓
- `#process` → `Process` ✓
- `#contact` → `Contact` ✓

Footer link list will be updated to match this exact set and order.

## Files to edit

- `src/content/copy.ts` — hero, reframing, mechanism, conversion, footer copy + new `mechanism.intro`
- `src/components/landing/Hero.tsx` — label contrast, single subtext
- `src/components/landing/Nav.tsx` — link color tokens, dot inactive color
- `src/components/landing/About.tsx` — remove label row, link contrast, italic opacity
- `src/components/landing/Services.tsx` — render `mechanism.intro`, label color stays via copy change
- `src/components/landing/Work.tsx` — narrative copy, italic opacity, link contrast
- `src/components/landing/Process.tsx` — title "Process", intro paragraph, link contrast
- `src/components/landing/Contact.tsx` — label/primary copy, tertiary link contrast, drop intensity alt
- `src/components/landing/Footer.tsx` — heading/subline, full nav list, tagline, link contrast
- `src/content/ctaConfig.ts` — ghost style text color

## Out of scope

- No layout, motion, or animation changes.
- No new sections; `Stats`/`Testimonials` remain hidden.
- No changes to `BackgroundField`, `Cursor`, `Grain`, `index.css` tokens, or `tailwind.config.ts`.
