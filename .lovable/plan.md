## Plan

Tightening the existing pillar stack to feel like the **wemakewebsites.com** reference: heavier H1 weight, wider text fields, and a true full-bleed canvas. Fixing two copy items along the way.

### 1. `src/content/copy.ts` — copy fixes

- **Hero** — keep `h3` as its own field again (currently merged): `"<RED>1MW</RED> is our attempt to do just that."` so it renders as a true h3 line.
- **Partnerships pillar** — rename:
  - `title`: `"Collaborations"`
  - `definition`: `"Public Relations"`
  - (outcome unchanged)

### 2. `src/components/landing/Services.tsx` — bolder + wider + full-bleed

**Bolder H1s (all monumental titles — Hero, every Pillar, Contact):**
- Add `font-extrabold` (Tailwind `800`, already loaded in `Montserrat:wght@…800`) to the h1/h2 monumental titles.
- Tighten tracking further with `tracking-[-0.03em]` to match the wemakewebsites compressed feel.

**Wider text — make it span like the reference site:**
- Container padding currently `px-6 md:px-12 lg:px-16` → reduce to `px-4 md:px-8 lg:px-10` so headlines push closer to the viewport edge.
- Definition / outcome paragraphs: `max-w-5xl` → `max-w-7xl` (and remove caps where the sentence is short enough to breathe naturally).
- Bump h1 scale ceiling: `clamp(3.5rem, 11vw, 10rem)` → `clamp(4rem, 13vw, 14rem)` so it actually fills the row at 1526px viewport like the reference.
- Bump h2/h3 scale: keep `text-fluid-xl` but raise its ceiling in `index.css` (see step 4) so secondary lines also feel monumental.

**Hero h3 restored:**
- Render `copy.hero.h3` as its own line again, with `<span style={{color:'#E11D2E'}}>1MW</span>` parsed from the `<RED>…</RED>` marker (or just hardcode the JSX as today, but driven by the `h3` field).

### 3. `src/LandingSite.tsx` / `SectionWrapper` — true full-bleed

- The Services `SectionWrapper` currently has `px-6 md:px-12 lg:px-16` on the outer wrapper. Switch the wrapper to `px-0` and let each pillar own its own inner padding — this lets the top/bottom borders run edge-to-edge like wemakewebsites' full-width sections.

### 4. `src/index.css` — scale up fluid utilities for big-canvas feel

Raise the ceilings only (mobile minimums unchanged so it still pops on small screens):
```
.text-fluid-xl  { font-size: clamp(1.75rem, 5vw, 6rem); }   /* was 4vw, 5rem */
.text-fluid-3xl { font-size: clamp(2rem, 12vw, 12rem); }    /* was 10vw, 10rem */
```

### What's intentionally NOT changing

- No new sections, work grid, services list, or culture page from the reference site — your structure (Hero → 18 pillars → Story → Let's Connect) stays intact.
- Animation, hover-reveal, and scroll behavior unchanged.
- Nav and Footer untouched (already finalized last round).

### Files touched

- `src/content/copy.ts`
- `src/components/landing/Services.tsx`
- `src/components/landing/SectionWrapper.tsx` (padding only on the Services instance, via prop already in use)
- `src/index.css`
