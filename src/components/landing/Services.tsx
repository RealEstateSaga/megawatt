import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { copy, type Pillar } from "../../content/copy";

/**
 * Stacking parallax.
 *
 * Each panel gets extra scroll runway so the next section can rise from the
 * bottom of the viewport and cover the current one.
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
    <div id="services" className="relative bg-background">
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
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const sheetY = useTransform(
    scrollYProgress,
    isLast ? [0, 0.35, 1] : [0, 0.3, 0.65, 1],
    ["100%", "0%", "0%", "0%"]
  );

  return (
    <section
      ref={ref}
      id={id}
      className="relative"
      style={{
        height: isLast ? "100vh" : "200vh",
      }}
    >
      <motion.div
        className="sticky top-0 h-screen w-full overflow-hidden bg-background"
        style={{ zIndex: index + 1, y: sheetY }}
      >
        <div className="flex h-full w-full items-start px-8 pb-10 pt-24 md:px-16 md:pt-28 lg:px-24 lg:pt-32">
          <div className="flex w-full flex-col items-start gap-4 text-left md:gap-6">
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
              className="max-w-7xl font-montserrat text-left font-normal leading-[1.1] tracking-[0em] text-foreground"
              style={{ fontSize: "clamp(1.4rem, 3vw, 2.4rem)" }}
            >
              {body}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
