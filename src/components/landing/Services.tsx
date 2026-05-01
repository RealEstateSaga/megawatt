import { copy, type Pillar } from "../../content/copy";

/**
 * Stacking parallax (jomor.design style).
 *
 * Every panel is a direct sibling with `position: sticky; top: 0; height: 100vh`
 * inside ONE parent. As you scroll, panel N pins at the top. When panel N+1
 * reaches the top of the viewport, it slides UP from the bottom and — because
 * it has a higher z-index — covers panel N which is still pinned beneath it.
 *
 * Requirements for this to work:
 *   1. Parent must NOT have `overflow: hidden` or any overflow value other
 *      than `visible` — otherwise sticky breaks.
 *   2. Each sibling must be exactly 100vh so the next one starts exactly
 *      one viewport later.
 *   3. z-index must increase per panel so later ones overlay earlier ones.
 *   4. No transforms / will-change on ancestors (creates a containing block
 *      that breaks sticky).
 */
export default function Services() {
  const panels = [
    {
      id: "hero",
      title: copy.hero.h1,
      body: renderHeroBody(),
    },
    ...copy.pillars.map((p: Pillar) => ({
      id: p.id,
      title: p.title,
      body: <>{p.body}</> as React.ReactNode,
    })),
    {
      id: "contact",
      title: copy.conversion.title,
      body: (
        <>
          {copy.conversion.body}{" "}
          <a
            href={`mailto:${copy.conversion.email}`}
            className="underline hover:opacity-70 transition-opacity"
          >
            {copy.conversion.email}
          </a>
        </>
      ),
    },
  ];

  if (typeof window !== "undefined") {
    setTimeout(() => {
      const s = document.getElementById("services");
      if (!s) return;
      // eslint-disable-next-line no-console
      console.log("[parallax-debug] #services height:", s.getBoundingClientRect().height,
        "body.scrollHeight:", document.body.scrollHeight,
        "innerHeight:", window.innerHeight,
        "children:", s.children.length);
      [...s.children].forEach((c, i) => {
        const r = (c as HTMLElement).getBoundingClientRect();
        const cs = getComputedStyle(c as HTMLElement);
        // eslint-disable-next-line no-console
        console.log(`  child[${i}]`, c.tagName, "h:", r.height, "pos:", cs.position, "top:", cs.top, "z:", cs.zIndex);
      });
      let p: HTMLElement | null = s.parentElement;
      while (p && p !== document.body) {
        const cs = getComputedStyle(p);
        if (cs.overflow !== "visible" || cs.transform !== "none" || cs.contain !== "none") {
          // eslint-disable-next-line no-console
          console.log("[parallax-debug] ancestor", p.tagName, p.className, "overflow:", cs.overflow, "transform:", cs.transform, "contain:", cs.contain);
        }
        p = p.parentElement;
      }
    }, 500);
  }

  return (
    <div id="services" className="relative">
      {panels.map((panel, i) => (
        <Panel
          key={panel.id}
          id={panel.id}
          title={panel.title}
          body={panel.body}
          index={i}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function renderHeroBody(): React.ReactNode {
  const parts = copy.hero.body.split("1MW");
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && <span style={{ color: "#E11D2E" }}>1MW</span>}
    </span>
  ));
}

/* ────────────────────────────────────────────────────────────────────── */

function Panel({
  id,
  title,
  body,
  index,
}: {
  id: string;
  title: string;
  body: React.ReactNode;
  index: number;
}) {
  return (
    <section
      id={id}
      className="sticky top-0 h-screen w-full overflow-hidden bg-background"
      style={{ zIndex: index + 1 }}
    >
      <div className="flex h-full w-full items-start px-8 pb-10 pt-24 md:px-16 md:pt-28 lg:px-24 lg:pt-32">
        <div className="flex w-full flex-col items-start gap-4 text-left md:gap-6">
          <h2
            className="font-display font-bold text-foreground leading-[0.95] tracking-[-0.03em] text-left"
            style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}
          >
            {title}
          </h2>

          <p
            className="max-w-7xl font-montserrat text-left font-normal leading-[1.1] tracking-[0em] text-foreground"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2.4rem)" }}
          >
            {body}
          </p>
        </div>
      </div>
    </section>
  );
}
