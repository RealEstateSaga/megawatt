import { motion } from "framer-motion";
import { copy, type Pillar } from "../../content/copy";

/**
 * Unified pillar stack — Hero, all middle pillars, and Contact share the same
 * simple stacked treatment. No background boxes, no hover reveals — just clean
 * left-aligned typography with smooth fade-up transitions on scroll.
 */
export default function Services() {
  return (
    <section id="services" className="bg-bg">
      <div className="flex flex-col">
        <HeroPillar />

        {copy.pillars.map((pillar) => (
          <PillarModule key={pillar.id} pillar={pillar} />
        ))}

        <ContactPillar />
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const fadeTransition = {
  duration: 0.9,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

function FadeIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-15% 0px -10% 0px" }}
      transition={{ ...fadeTransition, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function HeroPillar() {
  const body = copy.hero.body;
  const parts = body.split("1MW");

  return (
    <section
      id="hero"
      className="relative border-t border-border/50"
    >
      <div className="relative py-32 md:py-56 px-8 md:px-16 lg:px-24 flex flex-col gap-4 md:gap-6 items-start text-left">
        <FadeIn>
          <h1
            className="font-display font-bold text-foreground leading-[0.95] tracking-[-0.03em] text-left"
            style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}
          >
            {copy.hero.h1}
          </h1>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p
            className="font-montserrat font-normal leading-[1.1] tracking-[0em] text-left max-w-7xl text-black"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2.4rem)" }}
          >
            {parts.map((part, i) => (
              <span key={i}>
                {part}
                {i < parts.length - 1 && (
                  <span style={{ color: "#E11D2E" }}>1MW</span>
                )}
              </span>
            ))}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function PillarModule({ pillar }: { pillar: Pillar }) {
  return (
    <section className="relative border-t border-border/50">
      <div className="relative py-32 md:py-56 px-8 md:px-16 lg:px-24 flex flex-col gap-4 md:gap-6 items-start text-left">
        <FadeIn>
          <h2
            className="font-display font-bold text-foreground leading-[0.95] tracking-[-0.03em] text-left"
            style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}
          >
            {pillar.title}
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p
            className="font-montserrat font-normal leading-[1.1] tracking-[0em] text-left max-w-7xl text-black"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2.4rem)" }}
          >
            {pillar.body}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function ContactPillar() {
  return (
    <section
      id="contact"
      className="relative border-t border-b border-border/50"
    >
      <div className="relative py-32 md:py-56 px-8 md:px-16 lg:px-24 flex flex-col gap-4 md:gap-6 items-start text-left">
        <FadeIn>
          <h2
            className="font-display font-bold text-foreground leading-[0.95] tracking-[-0.03em] text-left"
            style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}
          >
            {copy.conversion.title}
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p
            className="font-montserrat font-normal leading-[1.1] tracking-[0em] text-left max-w-7xl text-black"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2.4rem)" }}
          >
            {copy.conversion.body}{" "}
            <a
              href={`mailto:${copy.conversion.email}`}
              className="underline hover:text-accent transition-colors"
            >
              {copy.conversion.email}
            </a>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
