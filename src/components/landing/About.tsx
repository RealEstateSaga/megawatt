import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";
import { copy } from "../../content/copy";
import SectionWrapper from "./SectionWrapper";

/**
 * STATE 2: REFRAMING
 *
 * Objective: Change how the user understands marketing.
 * Experience: Scroll feels like entering a deeper layer of the system.
 * Motion: Minimal but directional — parallax resistance.
 * Message: "Marketing is no longer messaging. It is engineered attention systems."
 */
export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // Directional parallax — creates "weighted" scroll feel
  const leftY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const rightY = useTransform(scrollYProgress, [0, 1], [25, -25]);

  return (
    <SectionWrapper id="about" phase="framing" padding="py-40 md:py-64" className="px-6 md:px-12">
      <div ref={ref} className="max-w-7xl mx-auto">
        {/* State label */}
        <motion.div
          className="font-mono text-fluid-xs text-accent tracking-[0.3em] uppercase mb-16 flex items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, ease: EASE.cinematic }}
        >
          <div className="h-px w-12 bg-accent/30" />
          {copy.reframing.label}
        </motion.div>

        <div className="grid md:grid-cols-12 gap-12 md:gap-0 items-start">
          {/* Left — primary conceptual statement */}
          <motion.div className="md:col-span-7" style={{ y: leftY }}>
            {/* Primary statement — large, clip reveal */}
            <div className="overflow-hidden mb-6">
              <motion.h2
                className="font-display text-fluid-3xl text-off leading-[1.05] tracking-tight"
                initial={{ y: "105%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: DUR.cinematic, ease: EASE.cinematic }}
              >
                {copy.reframing.statement}
              </motion.h2>
            </div>

            <div className="overflow-hidden">
              <motion.h2
                className="font-display text-fluid-3xl text-off/55 leading-[1.05] tracking-tight italic"
                initial={{ y: "105%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: DUR.cinematic,
                  ease: EASE.cinematic,
                  delay: 0.12,
                }}
              >
                {copy.reframing.clarification}
              </motion.h2>
            </div>
          </motion.div>

          {/* Right — supporting context + CTA */}
          <motion.div
            className="md:col-span-4 md:col-start-9"
            style={{ y: rightY }}
          >
            <motion.p
              className="text-fluid-sm text-light leading-relaxed mb-10"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.2 }}
            >
              {copy.reframing.supporting}
            </motion.p>

            {/* Soft inline CTA — ghost style, framing state */}
            <motion.div
              className="border-l border-accent/25 pl-4"
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: DUR.normal, ease: EASE.cinematic, delay: 0.35 }}
            >
              <a
                href="#services"
                className="font-mono text-fluid-xs text-accent hover:text-mid transition-colors duration-300 tracking-widest uppercase font-semibold"
              >
                {copy.reframing.cta} &rarr;
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
