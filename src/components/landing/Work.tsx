import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";

/**
 * WORK / 1MW — black editorial chapter.
 * Oversized declarative statement + brand narrative paragraph.
 */
export default function Work() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const bodyY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      id="work"
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
          Work — 03
        </span>
        <span className="hidden md:block text-[11px] tracking-[0.35em] uppercase text-white/50">
          1MW.com
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
            One million watts.
          </motion.h2>
        </div>
      </motion.div>

      <motion.div
        style={{ y: bodyY }}
        className="mt-32 md:mt-56 grid md:grid-cols-12 gap-12 items-end"
      >
        <motion.p
          className="md:col-span-7 text-fluid-base text-white/80 leading-[1.6] max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.2 }}
        >
          1MW.com is a highly desirable three-character .com, rare by nature, deliberate by design. A megawatt is a universal measure of power, and the firm carries that same weight. Founded by Mike Wilen, 1MW is a marketing and advertising firm spanning data, creativity, media, technology, and AI. The consortium explores any territory in pursuit of a stronger idea, taking unconventional approaches and making big, bold investments in unexpected places.
        </motion.p>

        <motion.div
          className="md:col-span-4 md:col-start-9 flex flex-col gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, delay: 0.4 }}
        >
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/50">
            Every engagement starts with one conversation.
          </p>
          <a
            href="#contact"
            className="self-start text-[12px] tracking-[0.25em] uppercase font-semibold text-white border-b border-white pb-1 hover:opacity-60 transition-opacity duration-300"
          >
            Start yours &rarr;
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
