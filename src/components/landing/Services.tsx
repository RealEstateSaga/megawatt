import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";
import { copy } from "../../content/copy";

/**
 * SERVICES — white editorial chapter.
 * Stacked narrative blocks (not cards): massive numeral, large title,
 * descriptor, single CTA. No grid. No iconography.
 */
export default function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const headerY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      id="services"
      ref={ref}
      data-env="light"
      className="env-light relative px-8 md:px-16 py-40 md:py-64"
    >
      {/* Chapter header */}
      <motion.div
        style={{ y: headerY }}
        className="flex justify-between items-start mb-32 md:mb-48"
      >
        <div>
          <motion.span
            className="text-[11px] tracking-[0.35em] uppercase text-black/50 mb-12 block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: DUR.normal }}
          >
            Services — 02
          </motion.span>
          <div className="overflow-hidden">
            <motion.h2
              className="font-display font-bold text-fluid-3xl text-black leading-[0.95] tracking-[-0.035em]"
              initial={{ y: "105%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: EASE.cinematic }}
            >
              Six systems.<br />One strategy.
            </motion.h2>
          </div>
        </div>

        <motion.p
          className="hidden md:block max-w-sm text-fluid-sm text-black/65 leading-[1.55] mt-24"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, delay: 0.25 }}
        >
          {copy.mechanism.intro}
        </motion.p>
      </motion.div>

      {/* Editorial pillar stack */}
      <div>
        {copy.mechanism.pillars.map((pillar, i) => (
          <PillarRow key={pillar.id} pillar={pillar} index={i} />
        ))}
      </div>
    </section>
  );
}

function PillarRow({
  pillar,
  index,
}: {
  pillar: typeof copy.mechanism.pillars[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const numY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <motion.div
      ref={ref}
      className="group relative border-t border-black/15 py-14 md:py-20 grid md:grid-cols-12 gap-8 md:gap-12 items-start"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: index * 0.06 }}
    >
      {/* Massive numeral */}
      <motion.div style={{ y: numY }} className="md:col-span-3">
        <span className="font-display font-light text-[clamp(4rem,9vw,8rem)] text-black/85 leading-none tracking-[-0.04em] block">
          {pillar.number}
        </span>
      </motion.div>

      {/* Title */}
      <div className="md:col-span-5">
        <h3 className="font-display font-semibold text-fluid-xl text-black leading-[1.05] tracking-[-0.02em]">
          {pillar.title}
        </h3>
      </div>

      {/* Descriptor + CTA */}
      <div className="md:col-span-4 flex flex-col gap-6">
        <p className="text-fluid-sm text-black/65 leading-[1.55]">
          {pillar.definition}
        </p>
        <a
          href="#contact"
          className="self-start text-[12px] tracking-[0.25em] uppercase font-semibold text-black border-b border-black pb-1 hover:opacity-60 transition-opacity duration-300"
        >
          Learn more &rarr;
        </a>
      </div>
    </motion.div>
  );
}
