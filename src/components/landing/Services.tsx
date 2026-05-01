import { useRef } from "react";
import { motion, useSpring } from "framer-motion";
import { EASE, DUR, SPRING } from "../../engine/motion";
import { copy, type Pillar } from "../../content/copy";
import { useMotionIntensity } from "../../hooks/useMotionIntensity";
import SectionWrapper from "./SectionWrapper";

/**
 * Unified pillar stack — all sections share the same animated box.
 * h1 (monumental title) + h2 (definition) + h3 (hover-revealed body).
 * On mobile the body is always visible so it pops as the user scrolls.
 */
export default function Services() {
  const { enterDuration, staggerDelay, enterDistance } = useMotionIntensity();

  return (
    <SectionWrapper
      id="services"
      phase="mechanism"
      padding="pt-0 pb-20 md:pb-28"
      className="px-6 md:px-12 bg-bg"
      fadeOnScroll={false}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-px">
          {copy.pillars.map((pillar, i) => (
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
  pillar: Pillar;
  index: number;
  enterDuration: number;
  staggerDelay: number;
  enterDistance: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        duration: enterDuration,
        delay: Math.min(index * staggerDelay, 0.3),
        ease: EASE.cinematic,
      }}
    >
      <div className="relative py-12 md:py-20 px-2 md:px-0 flex flex-col gap-8 md:gap-12 items-center text-center">
        {/* h1 — monumental title */}
        <h2
          className="font-display text-off group-hover:text-accent transition-colors duration-400 leading-[1.0] tracking-tight text-center"
          style={{ fontSize: "clamp(3.5rem, 11vw, 10rem)" }}
        >
          {pillar.title}
        </h2>

        {/* h2 — definition */}
        <p className="font-display text-off text-fluid-xl leading-[1.15] tracking-tight text-center max-w-5xl mx-auto">
          {pillar.definition}
        </p>
      </div>

      {/* h3 — body, visible on mobile, hover-revealed on desktop */}
      <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
        <div className="overflow-hidden">
          <p className="text-fluid-sm text-light leading-relaxed text-center pb-8 md:pb-10 px-6 md:px-12 max-w-5xl mx-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100">
            {pillar.outcome}
          </p>
        </div>
      </div>

      <div className="h-px bg-border/50 mx-0" />
    </motion.div>
  );
}
