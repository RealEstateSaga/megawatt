import { motion } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";

/**
 * ABOUT — "One million watts. All in."
 *
 * Replaces the prior Selected Work grid with a single full-width
 * narrative card describing the firm.
 */
export default function Work() {
  return (
    <section id="work" className="py-32 md:py-48 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <motion.div
            className="font-mono text-fluid-xs text-accent tracking-widest uppercase mb-4 flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DUR.normal, ease: EASE.cinematic }}
          >
            <div className="h-px w-8 bg-accent" />
            About
          </motion.div>
          <motion.h2
            className="font-display text-fluid-3xl text-off leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.1 }}
          >
            One million watts.
          </motion.h2>
        </div>

        {/* Single full-width narrative card */}
        <motion.div
          className="relative border border-border overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, ease: EASE.cinematic }}
        >
          <div className="relative p-10 md:p-16 lg:p-20 flex flex-col gap-6 text-left">
            <p
              className="text-off/90 leading-[1.4] font-light"
              style={{ fontSize: "clamp(1.3rem, 2vw, 2rem)", maxWidth: "65ch" }}
            >
              1MW.com is a highly desirable three-character .com, rare by nature, deliberate by design. A megawatt is a universal measure of power, and the firm carries that same weight. Founded by Mike Wilen, 1MW is a marketing and advertising firm spanning data, creativity, media, technology, and AI. The consortium explores any territory in pursuit of a stronger idea, taking unconventional approaches and making big, bold investments in unexpected places.
            </p>
          </div>
        </motion.div>

        {/* Contextual CTA */}
        <motion.div
          className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="font-mono text-fluid-xs text-mid">
            Every engagement starts with one conversation.
          </p>
          <a
            href="#contact"
            className="font-mono text-fluid-xs text-[#111111] hover:text-black transition-colors duration-300 tracking-widest uppercase border-b border-black/40 hover:border-black pb-1 font-semibold"
          >
            Start yours &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  );
}
