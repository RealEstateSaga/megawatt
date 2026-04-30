import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";
import { copy } from "../../content/copy";

/**
 * ABOUT — black editorial chapter.
 * Oversized declarative type, asymmetric layout, slow parallax.
 */
export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const headlineY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const supportY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      id="about"
      ref={ref}
      data-env="dark"
      className="env-dark relative px-8 md:px-16 py-40 md:py-64 overflow-hidden"
    >
      {/* Chapter index — top-right */}
      <motion.div
        className="flex justify-between items-start mb-32 md:mb-48"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: DUR.slow }}
      >
        <span className="text-[11px] tracking-[0.35em] uppercase text-white/50">
          About — 01
        </span>
        <span className="hidden md:block text-[11px] tracking-[0.35em] uppercase text-white/50">
          The Reframe
        </span>
      </motion.div>

      {/* Monumental statement */}
      <motion.div style={{ y: headlineY }} className="max-w-[1600px]">
        <div className="overflow-hidden">
          <motion.h2
            className="font-display font-bold text-fluid-4xl text-white leading-[0.92] tracking-[-0.04em]"
            initial={{ y: "105%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.3, ease: EASE.cinematic }}
          >
            {copy.reframing.statement}
          </motion.h2>
        </div>
        <div className="overflow-hidden mt-2 md:mt-4">
          <motion.h2
            className="font-display font-bold text-fluid-4xl text-white/60 leading-[0.92] tracking-[-0.04em] italic"
            initial={{ y: "105%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.3, ease: EASE.cinematic, delay: 0.15 }}
          >
            {copy.reframing.clarification}
          </motion.h2>
        </div>
      </motion.div>

      {/* Supporting paragraph — far right column, dramatic offset */}
      <motion.div
        style={{ y: supportY }}
        className="mt-32 md:mt-56 grid md:grid-cols-12"
      >
        <motion.p
          className="md:col-start-7 md:col-span-6 text-fluid-base text-white/75 leading-[1.55] max-w-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.3 }}
        >
          1MW is the marketing and advertising engine behind a connected portfolio of modern brands. Built to create momentum, clarity, and measurable growth.
        </motion.p>
      </motion.div>
    </section>
  );
}
