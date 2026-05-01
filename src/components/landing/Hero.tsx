import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";
import { useSite } from "../../context/SiteContext";
import { copy } from "../../content/copy";
import wordmark from "../../assets/1mw-wordmark.svg";


export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollIntensity } = useSite();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Hero content compresses upward as user scrolls into Reframing state
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.96]);

  // Subtext adapts to scroll intensity (behavioral personalization)
  const subtext =
    scrollIntensity === "fast" ? copy.hero.subtextFast : copy.hero.subtext;

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg"
    >
      {/* Structural grid — barely perceptible depth cue */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "90px 90px",
        }}
      />

      {/* ── Primary content — compresses upward on scroll ────────────────── */}
      <motion.div
        className="relative z-20 text-center px-6 max-w-5xl mx-auto"
        style={{ y, opacity, scale }}
      >
        {/* 1MW wordmark — monumental, the only focal point */}
        <h1 className="mb-12 flex justify-center w-full" aria-label="1MW">
          <div className="overflow-hidden leading-none w-full flex justify-center">
            <motion.img
              src={wordmark}
              alt="1MW"
              className="block h-auto mx-auto"
              style={{ width: "min(28vw, 360px)", maxWidth: "100%" }}
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: DUR.cinematic, ease: EASE.cinematic, delay: 0.35 }}
            />
          </div>
        </h1>

        {/* Category subtext — large statement */}
        <motion.p
          key={scrollIntensity}
          className="font-display text-off max-w-none mx-auto leading-[1.0] tracking-tight text-center"
          style={{ fontSize: "clamp(3.5rem, 11vw, 10rem)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.normal, ease: EASE.grounded, delay: 0.85 }}
        >
          {copy.hero.system}
        </motion.p>
      </motion.div>

      {/* ── Subtle scroll cue — implied, not labeled ─────────────────────── */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: DUR.slow }}
      >
        <motion.div
          className="w-px h-14 bg-gradient-to-b from-accent/60 to-transparent mx-auto"
          animate={{ scaleY: [0, 1, 0], opacity: [0, 0.7, 0] }}
          style={{ originY: 0 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </motion.div>
    </section>
  );
}
