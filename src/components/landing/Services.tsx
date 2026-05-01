import { motion } from "framer-motion";
import { copy, type Pillar } from "../../content/copy";

/**
 * Stacking parallax (jomor.design style).
 *
 * Each panel has a tall outer wrapper. Inside, the visible content is
 * `sticky top-0 h-screen`. The FIRST panel pins while you scroll its
 * wrapper. When the next wrapper enters the viewport, its sticky child
 * scrolls UP from the bottom of the screen and — thanks to a higher
 * z-index — overlays the previous panel which is still pinned beneath.
 *
 * Key: each panel is its own scroll container slice; siblings do NOT
 * share a sticky context, so they don't release together.
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

const fadeTransition = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

function Panel({
  id,
  title,
  body,
  index,
  total,
}: {
  id: string;
  title: string;
  body: React.ReactNode;
  index: number;
  total: number;
}) {
  const isLast = index === total - 1;

  return (
    // Outer wrapper provides scroll runway. Each wrapper is its own
    // sticky context so panels don't release simultaneously. Higher
    // index = higher z-index, so later panels overlay earlier ones.
    <div
      className="relative"
      style={{
        height: isLast ? "100vh" : "100vh",
        zIndex: index + 1,
      }}
    >
      <motion.section
        id={id}
        className="sticky top-0 h-screen w-full overflow-hidden bg-background"
        initial={{ y: 0 }}
        transition={fadeTransition}
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
      </motion.section>
    </div>
  );
}
