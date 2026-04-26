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
            <br />
            <span className="italic text-off/30">All in.</span>
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
          <div
            className="relative p-10 md:p-16 lg:p-20 flex flex-col gap-8"
            style={{
              background:
                "linear-gradient(135deg, rgba(26,26,46,0.4) 0%, transparent 60%)",
            }}
          >
            <p className="font-display text-fluid-xl text-off leading-relaxed max-w-4xl">
              One megawatt — one million watts — is a universal benchmark for
              power. The domain 1MW.com carries that same sense of scale and
              rarity. As a three-character .com, it is among the most
              sought-after pieces of digital real estate in existence: a name
              that signals power, progress, and precision.
            </p>
            <p className="text-fluid-sm text-light/80 leading-relaxed max-w-3xl">
              That is the standard 1MW holds itself to. Founded by Mike Wilen,
              the firm was built to bring that same force to shaping ideas,
              solving complex challenges, and delivering results that move the
              needle.
            </p>
            <p className="font-display text-fluid-lg italic text-accent leading-tight">
              One million watts. All in.
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
          <p className="font-mono text-fluid-xs text-muted">
            Every engagement starts with one conversation.
          </p>
          <a
            href="#contact"
            className="font-mono text-fluid-xs text-accent hover:text-off transition-colors duration-300 tracking-widest uppercase border-b border-accent/40 hover:border-off pb-1"
          >
            Start yours &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  );
}
