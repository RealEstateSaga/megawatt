import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";
import { copy } from "../../content/copy";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Editorial parallax — slow, weighted layer displacement
  const wordY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const labelY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const subY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      id="hero"
      data-env="light"
      className="env-light relative min-h-[110vh] flex flex-col justify-between overflow-hidden px-8 md:px-16 pt-40 pb-16"
    >
      {/* Top label — system / category */}
      <motion.div
        style={{ y: labelY, opacity }}
        className="relative z-10 flex justify-between items-start"
      >
        <motion.p
          className="text-[12px] tracking-[0.35em] uppercase font-medium text-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.3 }}
        >
          {copy.hero.system}
        </motion.p>
        <motion.p
          className="hidden md:block text-[12px] tracking-[0.35em] uppercase font-medium text-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.4 }}
        >
          Est. — Mike Wilen
        </motion.p>
      </motion.div>

      {/* Center: monumental wordmark */}
      <motion.div
        style={{ y: wordY, opacity }}
        className="relative z-10 flex-1 flex items-center justify-center"
      >
        <div className="overflow-hidden">
          <motion.h1
            className="font-display text-fluid-5xl font-bold tracking-[-0.06em] text-black leading-none select-none"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.4, ease: EASE.cinematic, delay: 0.45 }}
            aria-label="1MW"
          >
            1MW
          </motion.h1>
        </div>
      </motion.div>

      {/* Bottom: supporting statement — left-aligned editorial */}
      <motion.div
        style={{ y: subY, opacity }}
        className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
      >
        <motion.p
          className="font-display text-fluid-lg text-black max-w-xl leading-[1.15] tracking-tight"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 1.0 }}
        >
          Marketing systems<br />built for growth.
        </motion.p>

        <motion.div
          className="flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase text-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.slow, delay: 1.4 }}
        >
          <span>Scroll</span>
          <span className="block w-12 h-px bg-black/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
