import { copy, type Pillar } from "../../content/copy";
import SectionWrapper from "./SectionWrapper";

/**
 * Unified pillar stack — Hero, all middle pillars, and Contact share the same
 * simple stacked treatment. No animated boxes, no hover reveals — just clean
 * left-aligned typography: a monumental h1 followed by a single combined
 * paragraph that fuses the definition + outcome into one body line.
 */
export default function Services() {
  return (
    <SectionWrapper
      id="services"
      phase="mechanism"
      padding="pt-0 pb-0"
      className="px-0 bg-bg"
      fadeOnScroll={false}
    >
      <div className="w-full">
        <div className="flex flex-col">
          <HeroPillar />

          {copy.pillars.map((pillar) => (
            <PillarModule key={pillar.id} pillar={pillar} />
          ))}

          <ContactPillar />
        </div>
      </div>
    </SectionWrapper>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function HeroPillar() {
  return (
    <section
      id="hero"
      className="relative border-t border-border/50"
    >
      <div className="relative py-32 md:py-56 px-8 md:px-16 lg:px-24 flex flex-col gap-4 md:gap-6 items-start text-left">
        <h1
          className="font-display font-bold text-foreground leading-[0.95] tracking-[-0.03em] text-left"
          style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}
        >
          {copy.hero.h1}
        </h1>

        <p className="font-montserrat font-normal leading-[1.1] tracking-[0em] text-left max-w-7xl text-black"
           style={{ fontSize: "clamp(1.4rem, 3vw, 2.4rem)" }}>
          {copy.hero.h2}{" "}
          <span style={{ color: "#E11D2E" }}>1MW</span>{" "}
          {copy.hero.h3.replace(/^1MW\s*/, "")}
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function PillarModule({ pillar }: { pillar: Pillar }) {
  return (
    <section className="relative border-t border-border/50">
      <div className="relative py-32 md:py-56 px-8 md:px-16 lg:px-24 flex flex-col gap-4 md:gap-6 items-start text-left">
        <h2
          className="font-display font-bold text-foreground leading-[0.95] tracking-[-0.03em] text-left"
          style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}
        >
          {pillar.title}
        </h2>

        <p className="font-montserrat font-normal leading-[1.1] tracking-[0em] text-left max-w-7xl text-black"
           style={{ fontSize: "clamp(1.4rem, 3vw, 2.4rem)" }}>
          {pillar.definition}. {pillar.outcome}
        </p>
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
        <h2
          className="font-display font-bold text-foreground leading-[0.95] tracking-[-0.03em] text-left"
          style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}
        >
          {copy.conversion.title}
        </h2>

        <p className="font-montserrat font-normal leading-[1.1] tracking-[0em] text-left max-w-7xl text-black"
           style={{ fontSize: "clamp(1.4rem, 3vw, 2.4rem)" }}>
          {copy.conversion.definition}.{" "}
          <a
            href={`mailto:${copy.conversion.email}`}
            className="underline hover:text-accent transition-colors"
          >
            {copy.conversion.email}
          </a>
        </p>
      </div>
    </section>
  );
}
