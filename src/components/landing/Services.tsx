import { copy, type Pillar } from "../../content/copy";

/**
 * Stacking parallax (jomor.design style).
 *
 * Every panel is a direct sibling with `position: sticky; top: 0; height: 100vh`
 * inside ONE parent. As you scroll, panel N pins at the top. When panel N+1
 * reaches the top of the viewport, it slides UP from the bottom and — because
 * it has a higher z-index — covers panel N which is still pinned beneath it.
 *
 * Visual differentiation (alternating bg/text colors) is REQUIRED — without it
 * the overlay effect is invisible because every sheet looks identical.
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

  return (
    <div id="services" className="relative">
      {panels.map((panel, i) => (
        <Panel
          key={panel.id}
          id={panel.id}
          title={panel.title}
          body={panel.body}
          index={i}
          total={panels.length}
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

// Alternating sheet palette so each panel sliding up over the previous
// is clearly visible. Keep brand red for the hero accent text.
const palette: { bg: string; fg: string }[] = [
  { bg: "#FFFFFF", fg: "#0A0A0A" }, // white / near-black
  { bg: "#0A0A0A", fg: "#FFFFFF" }, // near-black / white
  { bg: "#F2F2EE", fg: "#0A0A0A" }, // bone / near-black
  { bg: "#E11D2E", fg: "#FFFFFF" }, // brand red / white
];

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
  total: number;
}) {
  const colors = palette[index % palette.length];

  return (
    <section
      id={id}
      className="sticky top-0 h-screen w-full overflow-hidden"
      style={{
        zIndex: index + 1,
        backgroundColor: colors.bg,
        color: colors.fg,
      }}
    >
      <div className="flex h-full w-full items-start px-8 pb-10 pt-24 md:px-16 md:pt-28 lg:px-24 lg:pt-32">
        <div className="flex w-full flex-col items-start gap-4 text-left md:gap-6">
          <h2
            className="font-display font-bold leading-[0.95] tracking-[-0.03em] text-left"
            style={{
              fontSize: "clamp(4rem, 13vw, 14rem)",
              color: "inherit",
            }}
          >
            {title}
          </h2>

          <p
            className="max-w-7xl font-montserrat text-left font-normal leading-[1.1] tracking-[0em]"
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
              color: "inherit",
            }}
          >
            {body}
          </p>
        </div>
      </div>
    </section>
  );
}
