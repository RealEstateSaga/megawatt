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
    <section id="work" className="py-48 md:py-72 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
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

      </div>
    </section>
  );
}
