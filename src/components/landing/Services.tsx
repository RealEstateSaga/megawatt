import { motion } from "framer-motion";
import { copy, type Pillar } from "../../content/copy";

/**
 * Stacking parallax (jomor.design-style).
 *
 * Each panel is a tall scroll container (200vh). Inside, a sticky child pins
 * for one full viewport, then the next panel scrolls up over the top of it.
 * Solid white backgrounds occlude the panel beneath.
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
          isLast={i === panels.length - 1}
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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeTransition = {
  duration: 0.9,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

function Panel({
  id,
  title,
  body,
  index,
  isLast,
}: {
  id: string;
  title: string;
  body: React.ReactNode;
  index: number;
  isLast: boolean;
}) {
  // Outer section is 200vh (100vh of "pinned" scroll + 100vh for the next
  // panel to slide over). Last panel is just 100vh — nothing to cover it.
  return (
    <section
      id={id}
      className="relative"
      style={{
        height: isLast ? "100vh" : "200vh",
        zIndex: index + 1,
      }}
    >
      <div className="sticky top-0 h-screen w-full bg-white overflow-hidden">
        <div className="h-full w-full px-8 md:px-16 lg:px-24 flex flex-col justify-center gap-4 md:gap-6 items-start text-left">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15% 0px -10% 0px" }}
            transition={fadeTransition}
            className="font-display font-bold text-foreground leading-[0.95] tracking-[-0.03em] text-left"
            style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}
          >
            {title}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15% 0px -10% 0px" }}
            transition={{ ...fadeTransition, delay: 0.15 }}
            className="font-montserrat font-normal leading-[1.1] tracking-[0em] text-left max-w-7xl text-black"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2.4rem)" }}
          >
            {body}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
