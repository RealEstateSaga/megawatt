import { motion } from "framer-motion";
import { copy, type Pillar } from "../../content/copy";

/**
 * Stacking parallax — every pillar is a full-viewport sticky panel.
 * As the user scrolls, the next panel slides up and over the previous one
 * (jomor.design-style). Each panel has a solid background so it visually
 * occludes the one beneath it.
 */
export default function Services() {
  const panels: Array<{
    id: string;
    title: string;
    body: React.ReactNode;
  }> = [
    {
      id: "hero",
      title: copy.hero.h1,
      body: <HeroBody />,
    },
    ...copy.pillars.map((p: Pillar) => ({
      id: p.id,
      title: p.title,
      body: <>{p.body}</>,
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

function HeroBody() {
  const parts = copy.hero.body.split("1MW");
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span style={{ color: "#E11D2E" }}>1MW</span>
          )}
        </span>
      ))}
    </>
  );
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
}: {
  id: string;
  title: string;
  body: React.ReactNode;
  index: number;
  total: number;
}) {
  // Each panel is a tall scroll container; an inner sticky element holds the
  // visible viewport-sized card. As you scroll past the container, the next
  // panel's sticky card slides up and covers this one.
  return (
    <section
      id={id}
      className="relative"
      style={{ height: "100vh" }}
    >
      <div
        className="sticky top-0 h-screen w-full bg-white overflow-hidden"
        style={{ zIndex: index + 1 }}
      >
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
