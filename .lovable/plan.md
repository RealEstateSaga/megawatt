## 1MW Lightfield Inversion — Implementation Plan

Goal: convert the landing site from dark cinematic to a white precision system. Preserve narrative structure, sections, motion architecture, and conversion flow. Touch tokens first so the change cascades, then retune the handful of components with hardcoded color literals.

### Scope
Landing site only (`.landing-root` scope). The `/dashboard` (leadpro) surfaces stay untouched.

---

### 1. Typography — Montserrat globally

**`src/index.css`**
- Swap the Google Fonts import: replace Inter / Playfair Display / JetBrains Mono with `Montserrat:wght@300;400;500;600;700;800` (keep JetBrains Mono only if we want to retain mono labels, otherwise drop it).
- Update `body` font-family to Montserrat.

**`tailwind.config.ts`**
- `fontFamily.sans` → Montserrat
- `fontFamily.display` → Montserrat (700/800 used inline via `font-bold`/`font-extrabold`) — replaces Playfair Display so the existing `font-display` classes inherit Montserrat without rewriting every component.
- `fontFamily.mono` → keep Montserrat too, with `tracking-widest uppercase` carrying the "label" feel (current mono labels lose the typewriter look, which matches the editorial brief).
- Apply slightly tighter default tracking on display headings via inline `tracking-tight` (already mostly present).

### 2. Color tokens — invert the landing palette

**`src/index.css` `.landing-root` block**
```
--background: 0 0% 100%;          /* #FFFFFF */
--foreground: 0 0% 0%;             /* #000 */
--card:       0 0% 100%;
--card-foreground: 0 0% 0%;
--muted:      0 0% 90%;            /* #E5E5E5 borders */
--muted-foreground: 0 0% 29%;      /* #4A4A4A */
--accent:     0 0% 0%;             /* black-as-accent for CTAs */
--accent-foreground: 0 0% 100%;
--border:     0 0% 90%;            /* #E5E5E5 */
--input:      0 0% 90%;
--ring:       0 0% 0%;
```

**`tailwind.config.ts`** raw landing palette (these are referenced as `bg-bg`, `text-off`, `text-light`, `text-mid`, `bg-surface`, `text-accent` across every component — inverting them propagates the change everywhere):
- `bg`      → `#FFFFFF`
- `surface` → `#FAFAF8`
- `mid`     → `#7A7A7A`  (tertiary text)
- `light`   → `#4A4A4A`  (secondary text — replaces previous `#c4c4c4`)
- `off`     → `#000000`  (primary text — replaces previous off-white)
- `accent`  → `#000000`  (CTAs render as black-on-white)
- `blue`    → keep but unused

**`body:has(.landing-root)`** → background `#FFFFFF` (replace `#080808`).

**Selection color** in `.landing-root ::selection` → black background, white text.

### 3. Ambient layers — paper diffusion, not glow

**`src/components/landing/BackgroundField.tsx`**
- Remove the gold/blue/purple `r,g,b` interpolations.
- Replace both glows with a single static-channel paper diffusion: `rgba(0,0,0,0.018)` primary, `rgba(80,80,80,0.012)` secondary.
- Reduce drift amplitude by ~40% and slow durations to 35s/45s for "felt, not seen" movement.

**`src/components/landing/CursorLighting.tsx`** — tonal compression instead of illumination
- Replace radial gold/blue gradient with a soft *darkening* radial: `radial-gradient(520px circle at ..., rgba(0,0,0,0.04), transparent 60%)`.
- Drop the scroll-driven color channels; keep only opacity fade-in.

**`src/components/landing/Cursor.tsx`**
- Inner dot: remove `mix-blend-difference`; switch to solid black (`bg-black`).
- Outer ring border: `rgba(0,0,0,0.35)` default, `rgba(0,0,0,0.7)` on hover. Drop the gold ring.
- "View" label color → black.

**`src/components/landing/Grain.tsx`**
- Lower opacity from `0.035` to `0.02` and invert grain values toward dark specks on white (data RGB → ~30, alpha ~14) so it reads like paper texture.

### 4. Section-level retune (hardcoded literals)

**`Hero.tsx`**
- Grid lines: change `rgba(245,245,240,...)` → `rgba(0,0,0,0.5)` with the same `opacity-[0.018]` wrapper, so the structural grid reads on white.
- Scroll cue gradient `from-accent/60` continues to work since accent is now black.
- Wrapper `bg-bg` continues to work (now white).

**`Nav.tsx`**
- Scrolled state: `bg-bg/80 backdrop-blur-xl` works (white translucent).
- Narrative dots inactive color hardcoded `#1a1a1a` → change to `#E5E5E5`; active hardcoded `#c9a96e` → `#000`.
- "Start a Project" pill (`bg-accent text-bg`) automatically becomes black-on-white. Hover `hover:bg-off` → also black; change hover to `hover:bg-mid` (`#7A7A7A`) for soft charcoal transition per the spec.
- Mobile menu burger lines `bg-off` → now black, fine.
- Mobile menu overlay `bg-bg` → white, links `text-off` → black, fine.

**`Services.tsx`**
- Per-pillar lighting `rgba(201,169,110,0.06)` → `rgba(0,0,0,0.04)` (tonal compression on hover).
- Backgrounds `bg-surface/50` (now near-white) — fine.
- Border tokens already `border-border` → light grey.

**`Process.tsx`**
- Step dot border animates to `#c9a96e` → change to `#000`.
- Section `bg-surface` → light off-white, fine.

**`Marquee.tsx`**
- Background `bg-surface`, accent diamond `text-accent` (now black), fine — automatically reads as a clean editorial divider.

**`Contact.tsx`**
- Primary CTA glow `rgba(201,169,110,...)` → drop entirely; replace with subtle scale/elevation only (or `rgba(0,0,0,0.08)` shadow). Spec says "no glow."
- Availability pulse dot keeps green `bg-green-500/70` (a credible signal even on white).

**`Footer.tsx`**
- "Get in touch" pill (`bg-accent text-bg`) becomes black-on-white. Hover → `hover:bg-mid`.
- Borders/text inherit tokens — fine.

**`About.tsx` / `Work.tsx` / `Testimonials.tsx`** — only token-driven colors, no literals to retune.

### 5. CTA system — editorial buttons

Centralize in **`src/content/ctaConfig.ts`** (`ctaClasses`):
- `direct` → `bg-black text-white px-6 py-3 font-medium tracking-wide hover:bg-mid transition-colors duration-300`
- `outline` → `border border-black text-black px-6 py-3 font-medium tracking-wide hover:bg-mid/10 transition-colors duration-300`
- Remove gradient/glow/pulse modifiers.

Inline pill CTAs in Nav and Footer adopt the same direct style.

### 6. Motion calm-down

Per the spec ("reduce motion intensity by ~25%"), in **`src/engine/motion.ts`**:
- Bump base durations ~25% (e.g., `DUR.normal` from `0.6s` → `0.75s`, `DUR.slow` `0.9s` → `1.1s`, `DUR.cinematic` keeps similar).
- Reduce default `enterDistance` in `useMotionIntensity` by ~25%.

(I'll confirm exact current values when implementing; I have not opened that file yet.)

### 7. QA pass

After implementation, visit `/`, scroll through every section at desktop (1525px) and a 390px mobile viewport, and verify:
- No black backgrounds left, no gold/blue tinting in ambient layers.
- All text readable (primary black, secondary `#4A4A4A`, tertiary `#7A7A7A`).
- CTAs are black-on-white with charcoal hover.
- Cursor reads as a tonal-compression lens, not a glow.
- Mobile spacing is uncramped.

---

### Files I expect to edit
- `src/index.css` (font import, `.landing-root` tokens, body bg, selection)
- `tailwind.config.ts` (palette, fontFamily)
- `src/components/landing/BackgroundField.tsx`
- `src/components/landing/CursorLighting.tsx`
- `src/components/landing/Cursor.tsx`
- `src/components/landing/Grain.tsx`
- `src/components/landing/Hero.tsx`
- `src/components/landing/Nav.tsx`
- `src/components/landing/Services.tsx`
- `src/components/landing/Process.tsx`
- `src/components/landing/Contact.tsx`
- `src/components/landing/Footer.tsx`
- `src/content/ctaConfig.ts`
- `src/engine/motion.ts`

### Out of scope
- `/dashboard` (leadpro) and any `.leadpro-root` styling.
- Copy changes — only visual system inversion.
- Removing Stats/Testimonials (already hidden).

Approve this and I'll implement straight through.