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
      padding="pt-12 md:pt-16 pb-24 md:pb-32"
      className="px-6 md:px-12 bg-surface/50"
    >
      <div className="max-w-7xl mx-auto">
        {/* Centered intro statement */}
        <div className="mb-16 md:mb-20 max-w-5xl mx-auto text-center">
          <motion.p
            className="font-display text-fluid-2xl text-off leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DUR.cinematic, ease: EASE.cinematic }}
          >
            {copy.mechanism.intro}
          </motion.p>
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
      <div className="relative py-10 md:py-12 px-2 md:px-0 grid md:grid-cols-12 gap-y-4 gap-x-12 items-start">
        {/* Title + small numeric label */}
        <div className="md:col-span-5">
          <span className="font-mono text-fluid-xs text-mid tracking-[0.3em] uppercase block mb-3">
            {pillar.number}
          </span>
          <h3 className="font-display text-fluid-xl text-off group-hover:text-accent transition-colors duration-400 leading-[1.05] tracking-tight">
            {pillar.title}
          </h3>
        </div>

        {/* Definition + Outcome */}
        <div className="md:col-span-5">
          <p className="text-fluid-sm text-light leading-relaxed mb-4">
            {pillar.definition}
          </p>
          <p
            className="font-display text-accent tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-400 font-semibold leading-snug"
            style={{ fontSize: "clamp(1.1rem, 1.6vw, 1.6rem)" }}
          >
            &rarr; {pillar.outcome}
          </p>
        </div>

        {/* Tags */}
        <div className="md:col-span-2 flex flex-col items-start md:items-end gap-5">
          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            {pillar.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-fluid-xs text-mid border border-border px-3 py-1 tracking-wider uppercase group-hover:border-accent group-hover:text-accent transition-colors duration-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom separator */}
      <div className="h-px bg-border/50 mx-0" />
    </motion.div>
  );
}
