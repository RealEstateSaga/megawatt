# Unify scroll, add breathing room, restructure Hero & pillars

## 1. Connect Hero into the pillar stack (no more independent header)

Right now `Hero` is a standalone full-screen `<section>` and `Services` renders the pillar list separately. That's why the Hero "acts independently" and there's a visual gap before the first pillar.

- Make the Hero render as the **first item in the same pillar list** (same border-t, same hover lift, same group hover-reveal).
- Remove Hero's `min-h-screen` full-viewport behavior so it sits flush against "Collective" exactly like every other pillar transition.
- Move the 1MW red wordmark into the Hero pillar's body (above the H1), keep the subtle scroll cue.

Result: scrolling from the wordmark → "Marketing & Advertising" → "Expertise" → … → "Our Story" → "One" is one continuous, identical-looking stack.

## 2. Connect "Our Story" → "One" (close the gap)

`Contact.tsx` is a separate `SectionWrapper` with its own padding, which causes the gap after "Our Story". Fix:

- Render the "One / Click to Map Your Next Move / hello@1mw.com" block as the **final item inside the same pillar list** in `Services.tsx` (still a mailto link), instead of a separate `Contact` section.
- Remove the `<Contact />` import from `LandingSite.tsx`.

## 3. Restructure Hero copy

In `src/content/copy.ts` `copy.hero`:

- **H1:** `Marketing & Advertising` (was H2)
- **H2:** `There is really no mystery as to what people want, the whole idea though, is to serve it up in a way that's unique and different, and better than before.`
- **H3 (hover-reveal / mobile-visible):** `1MW is our attempt to do just that.`

The 1MW red wordmark stays as the visual logo above the H1 (not as H1 itself anymore).

## 4. Update two pillars

In `src/content/copy.ts`:

- Replace `collective` pillar with:
  - title: `Expertise`
  - definition: `Best of the Best`
  - outcome: `We partner with the best in the industry to ensure our clients are at the cutting edge of now and next.`
  - (rename id to `expertise`)

- Replace `identification` pillar with:
  - title: `Audience`
  - definition: `Persona Modeling`
  - outcome: `Uncovering the who, what, and where with real-world audience models, compiling segmentations and target profiles, rooted in behaviors and context.`
  - (rename id to `audience`)

## 5. Breathing room — much more vertical space

Currently each pillar uses `py-12 md:py-20` (≈ 48–80px). Bump to:

- Pillar inner padding: `py-24 md:py-40` (≈ 96–160px top & bottom)
- Gap between H1 and H2: `gap-10 md:gap-16` (was `gap-8 md:gap-12`)
- Hover-revealed body bottom padding: `pb-16 md:pb-24` (was `pb-8 md:pb-10`)
- Section wrapper: `pt-0 pb-32 md:pb-48` for the bottom of the stack

## 6. Wider container — boxes near page edges

Today: `max-w-7xl` (1280px) wraps the pillar list, and inner text is `max-w-5xl` (1024px).

Change to:

- Pillar list outer wrapper: drop `max-w-7xl mx-auto`. Use full width with horizontal page padding `px-6 md:px-12 lg:px-16` so boxes stretch nearly to the page edges (leaving ~48–64px of breathing room on desktop so the hover shadow can be enjoyed).
- Inner text (`H2` definition + `H3` body) keeps `max-w-5xl mx-auto` so reading width stays comfortable while the **boxes themselves go wide**.

Confirming the answer to your question: yes, today the boxes are constrained to 1280px (max-w-7xl) and the inner text is 1024px (max-w-5xl). After this change, boxes will span almost the full viewport width while text stays readable.

## Files to edit

- `src/content/copy.ts` — Hero restructure (h1/h2/h3 fields), update Collective → Expertise, Identification → Audience.
- `src/components/landing/Hero.tsx` — refactor into a pillar-shaped block (no min-h-screen), wordmark above H1.
- `src/components/landing/Services.tsx` — render Hero pillar first and Contact pillar last in the same stack; widen container; bump padding.
- `src/components/landing/Contact.tsx` — delete (logic merged into Services as final pillar).
- `src/LandingSite.tsx` — remove `<Hero />` and `<Contact />` as separate sections; only `<Services />` renders the unified stack (or keep `<Hero />` as a thin wrapper if cleaner — final decision at implementation).

## Technical notes

- The Hero pillar will reuse the exact `PillarModule` component so hover-lift, shadow, border-t, and grid-rows H3 reveal are byte-identical to other pillars.
- The 1MW wordmark image stays in the Hero pillar above the H1, keeping its existing slide-up entrance animation.
- The scroll cue (animated vertical line) stays at the bottom of the first pillar.
- `copy.hero` shape changes from `{ title, body }` to `{ h1, h2, h3 }` — Hero component updated accordingly.
- Pillar `id` rename (`collective`→`expertise`, `identification`→`audience`) is safe because nothing else references those ids.
