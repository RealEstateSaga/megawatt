import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";

/**
 * CONTACT — black editorial chapter, the final monument.
 * Huge declarative statement, single email, single CTA block.
 */
export default function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [80, -40]);
  const bottomY = useTransform(scrollYProgress, [0, 1], [40, -20]);

  return (
    <section
      id="contact"
      ref={ref}
      data-env="dark"
      className="env-dark relative px-8 md:px-16 py-40 md:py-64 overflow-hidden"
    >
      <motion.div
        className="flex justify-between items-start mb-32 md:mb-48"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: DUR.slow }}
      >
        <span className="text-[11px] tracking-[0.35em] uppercase text-white/50">
          Contact — 05
        </span>
        <span className="hidden md:block text-[11px] tracking-[0.35em] uppercase text-white/50">
          hello@1mw.com
        </span>
      </motion.div>

      <motion.div style={{ y: titleY }}>
        <div className="overflow-hidden">
          <motion.h2
            className="font-display font-bold text-fluid-4xl text-white leading-[0.92] tracking-[-0.04em]"
            initial={{ y: "105%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.3, ease: EASE.cinematic }}
          >
            Start the<br />conversation.
          </motion.h2>
        </div>

        <motion.p
          className="mt-12 md:mt-16 text-fluid-lg text-white/70 max-w-2xl leading-[1.3] tracking-tight"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.25 }}
        >
          One conversation to map your next move.
        </motion.p>
      </motion.div>

      <motion.div
        style={{ y: bottomY }}
        className="mt-32 md:mt-56 grid md:grid-cols-12 gap-12 items-end"
      >
        <motion.div
          className="md:col-span-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, delay: 0.3 }}
        >
          <a
            href="mailto:hello@1mw.com"
            className="font-display text-fluid-2xl text-white tracking-tight leading-none hover:opacity-60 transition-opacity duration-300 inline-block border-b border-white/40 pb-2"
          >
            hello@1mw.com
          </a>
        </motion.div>

        <motion.div
          className="md:col-span-4 md:col-start-9 flex flex-col gap-4 items-start"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, delay: 0.45 }}
        >
          <a
            href="mailto:hello@1mw.com"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-5 text-[12px] tracking-[0.25em] uppercase font-semibold hover:bg-white/85 transition-colors duration-300"
          >
            Start a Project &rarr;
          </a>
          <a
            href="#services"
            className="text-[12px] tracking-[0.25em] uppercase font-semibold text-white/70 hover:text-white border-b border-white/40 pb-1 transition-colors duration-300"
          >
            View Services
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
