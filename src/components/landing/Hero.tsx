import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE, DUR } from "../engine/motion";
import { useSite } from "../context/SiteContext";
import { copy } from "../content/copy";

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
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245,245,240,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,245,240,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "90px 90px",
        }}
      />

      {/* ── Primary content — compresses upward on scroll ────────────────── */}
      <motion.div
        className="relative z-20 text-center px-6 max-w-5xl mx-auto"
        style={{ y, opacity, scale }}
      >
        {/* System label — minimal, mono, above the headline */}
        <motion.p
          className="font-mono text-fluid-xs text-muted tracking-[0.3em] uppercase mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.2 }}
        >
          {copy.hero.system}
        </motion.p>

        {/* "1MW" — the only focal point */}
        <h1 className="font-display leading-[0.88] tracking-[-0.02em] text-off mb-10"
            style={{ fontSize: "clamp(6rem, 22vw, 18rem)" }}>
          <div className="overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: DUR.cinematic, ease: EASE.cinematic, delay: 0.35 }}
            >
              1MW
            </motion.span>
          </div>
        </h1>

        {/* Category subtext — single sentence, swaps by intensity */}
        <motion.p
          key={scrollIntensity}
          className="font-mono text-fluid-sm text-light/60 max-w-lg mx-auto leading-relaxed tracking-wide"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.normal, ease: EASE.grounded, delay: 0.85 }}
        >
          {subtext}
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
