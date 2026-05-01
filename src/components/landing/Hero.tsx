import { useRef } from "react";
import { motion } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";
import wordmark from "../../assets/1mw-wordmark.svg";


export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);

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

      {/* ── Pillar-style block: logo + h1 + h2 + h3 hover-revealed ───────── */}
      <motion.div
        className="group relative z-20 px-6 md:px-12 max-w-7xl mx-auto w-full"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.cinematic, ease: EASE.cinematic }}
      >
        <div className="relative py-12 md:py-20 flex flex-col gap-8 md:gap-12 items-center text-center">
          {/* 1MW wordmark */}
          <h1 className="flex justify-center w-full" aria-label="1MW">
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

          {/* Title — h1 monumental */}
          <motion.p
            className="font-display text-off group-hover:text-accent transition-colors duration-400 leading-[1.0] tracking-tight text-center"
            style={{ fontSize: "clamp(3.5rem, 11vw, 10rem)" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DUR.cinematic, ease: EASE.cinematic, delay: 0.2 }}
          >
            Marketing &amp; Advertising
          </motion.p>

          {/* Definition — h2 */}
          <motion.p
            className="font-display text-off text-fluid-xl leading-[1.15] tracking-tight text-center max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DUR.cinematic, ease: EASE.cinematic, delay: 0.35 }}
          >
            Creative that delivers.
          </motion.p>
        </div>

        {/* h3 hover-revealed body */}
        <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
          <div className="overflow-hidden">
            <p className="text-fluid-sm text-light leading-relaxed text-center pb-8 md:pb-10 px-6 md:px-12 max-w-5xl mx-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100">
              There is really no mystery as to what people want, the whole idea though, is to serve it up in a way that's unique and different, and better than before. 1MW is our attempt to do just that.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Subtle scroll cue ────────────────────────────────────────────── */}
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
