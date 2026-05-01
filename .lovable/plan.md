## Plan

### 1. `src/content/copy.ts` — copy updates

**Hero** — drop the `h3` fragment and merge into `h2` so all three lines render together (h1 + h2 + h3-style sub):
- `h1`: "Marketing & Advertising" (unchanged)
- `h2`: "There is really no mystery as to what people want, the whole idea though, is to serve it up in a way that's unique and different, and better than before."
- `h3`: `"<RED>1MW</RED> is our attempt to do just that."` — render with "1MW" in bright red (`text-destructive` / inline `style={{color:'#E11D2E'}}`).

**Our Story pillar** — swap title/definition order and rewrite outcome:
- `title`: "One Million Watts"
- `definition`: "Story"
- `outcome`: "1MW is a universal measure of power, and the firm carries that same weight. 1MW.com is a highly desirable three-character .com, rare by nature, deliberate by design, that's where it starts. Founded by Mike Wilen, we explore any territory in pursuit of a stronger idea, taking unconventional approaches and making big, bold investments in unexpected places."

**Conversion (final pillar)**:
- `title`: "Let's Connect"
- `definition`: "One Click to Map Your Next Move"
- `outcome`: "hello@1mw.com"
- `email`: "hello@1mw.com"

### 2. `src/components/landing/Services.tsx` — visual fixes

- **Remove the red 1MW wordmark `<motion.img>`** from `HeroPillar`. Keep only h1 + h2 + h3.
- **Always render h3 visible** on Hero (no hover gating) so "1MW is our attempt..." shows beneath h2 with "1MW" highlighted bright red.
- **Tighten inner text spacing, expand outer box padding**:
  - Container: `py-32 md:py-56` (more vertical breathing room around the box content)
  - Inner flex gap between h1 → h2 → h3: `gap-4 md:gap-6` (tight, was `gap-10 md:gap-16`)
- **Text color**: change `text-off` → `text-foreground` (true black under landing-root). Remove `text-light` on the outcome paragraph; use `text-foreground` so all body text is black. Keep group-hover accent color change on h1/h2.
- Apply same spacing rules (`py-32 md:py-56`, `gap-4 md:gap-6`) to `PillarModule` and `ContactPillar`.
- Outcome paragraph remains hover-reveal on desktop / always visible on mobile for non-Hero pillars; Hero's outcome is always visible.

### 3. `src/components/landing/Nav.tsx` — header links

Replace `links` with:
```ts
const links = [
  { label: "ABOUT",        href: "#hero" },        // top of page
  { label: "CONTACT",      href: "#contact" },     // bottom
  { label: "HELLO@1MW.COM", href: "mailto:hello@1mw.com" },
];
```
All caps, three links only.

### 4. `src/components/landing/Footer.tsx` — footer updates

- **Explore links** → replace with: `ABOUT` (`#hero`), `CONTACT` (`#contact`). All caps.
- **Contact links** → `HELLO@1MW.COM` (`mailto:hello@1mw.com`), then add `MIKEWILEN.COM` linking to `https://mikewilen.com` with `target="_blank"` `rel="noopener noreferrer"`.
- **Tagline** under "1MW" heading: change "Marketing designed for growth, and built for performance." → "Marketing & Advertising".

### Files touched
- `src/content/copy.ts`
- `src/components/landing/Services.tsx`
- `src/components/landing/Nav.tsx`
- `src/components/landing/Footer.tsx`
