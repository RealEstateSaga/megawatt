import { useRef } from "react";
import { motion, useSpring } from "framer-motion";
import { EASE, DUR, SPRING } from "../../engine/motion";
import { copy } from "../../content/copy";
import { useMotionIntensity } from "../../hooks/useMotionIntensity";
import SectionWrapper from "./SectionWrapper";

/**
 * STATE 3: MECHANISM
 *
 * Objective: Explain system capability through structured fragments.
 * Experience: Three system pillars as interactive modules, not cards.
 * Hover: depth lift + directional lighting shift.
 * Scroll: spacing increases slightly, creating breathing effect.
 * No click dependency — hover to explore is sufficient.
 */
export default function Services() {
  const { enterDuration, staggerDelay, enterDistance } = useMotionIntensity();

  return (
    <SectionWrapper
      id="services"
      phase="mechanism"
      padding="py-48 md:py-72"
      className="px-6 md:px-12 bg-surface/50"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-24 md:mb-32 grid md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <motion.div
              className="font-mono text-fluid-xs text-accent tracking-[0.3em] uppercase mb-8 flex items-center gap-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: DUR.normal, ease: EASE.cinematic }}
            >
              <div className="h-px w-12 bg-accent/30" />
              {copy.mechanism.label}
            </motion.div>

            <div className="overflow-hidden">
              <motion.h2
                className="font-display text-fluid-3xl text-off leading-tight tracking-tight"
                initial={{ y: "105%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: DUR.cinematic, ease: EASE.cinematic, delay: 0.08 }}
              >
                {copy.mechanism.headline}
              </motion.h2>
            </div>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <motion.p
              className="text-fluid-sm text-light leading-relaxed"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.2 }}
            >
              {copy.mechanism.intro}
            </motion.p>
          </div>
        </div>

        {/* Three pillars */}
        <div className="flex flex-col gap-px">
          {copy.mechanism.pillars.map((pillar, i) => (
            <PillarModule
              key={pillar.id}
              pillar={pillar}
              index={i}
              enterDuration={enterDuration}
              staggerDelay={staggerDelay}
              enterDistance={enterDistance}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

function PillarModule({
  pillar,
  index,
  enterDuration,
  staggerDelay,
  enterDistance,
}: {
  pillar: typeof copy.mechanism.pillars[number];
  index: number;
  enterDuration: number;
  staggerDelay: number;
  enterDistance: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Hover micro-depth via spring (no cursor tracking)
  const hoverY = useSpring(0, SPRING.medium);
  const hoverScale = useSpring(1, SPRING.medium);

  return (
    <motion.div
      ref={ref}
      className="group relative border-t border-border/50 overflow-hidden transition-shadow duration-300 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]"
      style={{ y: hoverY, scale: hoverScale }}
      onMouseEnter={() => { hoverY.set(-3); hoverScale.set(1.005); }}
      onMouseLeave={() => { hoverY.set(0); hoverScale.set(1); }}
      initial={{ opacity: 0, y: enterDistance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: enterDuration,
        delay: index * staggerDelay * 2,
        ease: EASE.cinematic,
      }}
    >
      <div className="relative py-16 md:py-24 px-2 md:px-0 grid md:grid-cols-12 gap-8 md:gap-12 items-center">
        {/* Number — monumental */}
        <div className="md:col-span-2">
          <span
            className="font-display font-bold text-mid/70 leading-none block"
            style={{ fontSize: "clamp(4rem, 8vw, 8rem)" }}
          >
            {pillar.number}
          </span>
        </div>

        {/* Title */}
        <div className="md:col-span-3">
          <h3 className="font-display text-fluid-xl text-off group-hover:text-accent transition-colors duration-400 leading-[1.05] tracking-tight">
            {pillar.title}
          </h3>
        </div>

        {/* Definition + Outcome */}
        <div className="md:col-span-4">
          <p className="text-fluid-sm text-light leading-relaxed mb-4">
            {pillar.definition}
          </p>
          <p
            className="font-display text-accent tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-400 font-semibold leading-snug"
            style={{ fontSize: "clamp(1.2rem, 2vw, 2rem)" }}
          >
            &rarr; {pillar.outcome}
          </p>
        </div>

        {/* Tags + CTA */}
        <div className="md:col-span-3 flex flex-col items-start md:items-end gap-3">
          <div className="flex flex-wrap gap-1.5 justify-start md:justify-end">
            {pillar.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] text-mid border border-border px-2 py-0.5 tracking-wider uppercase group-hover:border-accent group-hover:text-accent transition-colors duration-400"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Contextual CTA — revealed on hover */}
          <a
            href="#contact"
            className="font-mono text-[10px] text-mid hover:text-accent tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 font-semibold"
          >
            {pillar.cta} &rarr;
          </a>
        </div>
      </div>

      {/* Bottom separator */}
      <div className="h-px bg-border/50 mx-0" />
    </motion.div>
  );
}
