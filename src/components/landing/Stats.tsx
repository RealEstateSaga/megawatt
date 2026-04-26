import { motion } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";
import { copy } from "../../content/copy";
import SectionWrapper from "./SectionWrapper";

/**
 * STATE 4: VALIDATION — Proof Layer
 *
 * Objective: Establish credibility and reduce abstraction.
 * Experience: Visual tone is stable and much less animated than prior sections.
 * Motion: Minimal — almost static compared to Mechanism.
 * "Feels grounded, factual, confident."
 * Content: Short proof statements + outcome metrics.
 */
export default function Stats() {
  return (
    <SectionWrapper
      id="validation"
      phase="validation"
      padding="py-32 md:py-48"
      className="px-6 md:px-12 border-t border-border/40"
      fadeOnScroll={false}
    >
      <div className="max-w-7xl mx-auto">
        {/* State label */}
        <motion.div
          className="font-mono text-fluid-xs text-accent/40 tracking-[0.3em] uppercase mb-20 flex items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          // Validation: slow, minimal entrance — grounded feel
          transition={{ duration: DUR.cinematic, ease: EASE.grounded }}
        >
          <div className="h-px w-12 bg-accent/20" />
          {copy.validation.label}
        </motion.div>

        <div className="grid md:grid-cols-12 gap-16 md:gap-0">
          {/* Left — proof statements (no animation beyond fade-in) */}
          <div className="md:col-span-6">
            <div className="flex flex-col gap-5">
              {copy.validation.statements.map((statement, i) => (
                <motion.p
                  key={i}
                  className="font-display text-fluid-lg text-off/70 leading-snug tracking-tight"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  // Intentionally slow and sequential — no Y movement
                  transition={{
                    duration: DUR.cinematic,
                    ease: EASE.grounded,
                    delay: i * 0.18,
                  }}
                >
                  {statement}
                </motion.p>
              ))}
            </div>
          </div>

          {/* Right — metrics grid */}
          <div className="md:col-span-5 md:col-start-8">
            <div className="grid grid-cols-2 gap-8">
              {copy.validation.metrics.map((metric, i) => (
                <motion.div
                  key={metric.label}
                  className="border-t border-border/30 pt-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  // Static reveal — no movement, just opacity
                  transition={{
                    duration: DUR.drift,
                    ease: EASE.grounded,
                    delay: i * 0.12,
                  }}
                >
                  <div className="font-display text-fluid-2xl text-off mb-2 leading-none">
                    {metric.value}
                  </div>
                  <p className="font-mono text-[10px] text-muted tracking-widest uppercase">
                    {metric.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
