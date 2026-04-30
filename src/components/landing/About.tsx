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
    <SectionWrapper id="about" phase="framing" padding="pt-40 md:pt-64 pb-20 md:pb-32" className="px-6 md:px-12">
      <div ref={ref} className="max-w-7xl mx-auto">
        {/* State label removed for cleaner hierarchy */}

        <div className="grid md:grid-cols-12 gap-12 md:gap-0 items-start">
          {/* Left — primary conceptual statement */}
          <motion.div className="md:col-span-7" style={{ y: leftY }}>
            {/* Primary statement — large, clip reveal */}
            <div className="overflow-hidden mb-6">
              <motion.h2
                className="font-display text-fluid-2xl text-off leading-[1.0] tracking-tight"
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
                className="font-display text-fluid-2xl text-off/80 leading-[1.0] tracking-tight italic"
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

          {/* Right column intentionally empty — supporting copy and CTA removed for momentum */}
        </div>
      </div>
    </SectionWrapper>
  );
}
