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
      padding="pt-6 md:pt-8 pb-20 md:pb-28"
      className="px-6 md:px-12 bg-surface/50"
    >
      <div className="max-w-7xl mx-auto">
        {/* Centered intro statement */}
        <div className="mb-10 md:mb-14 max-w-5xl mx-auto text-center">
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
          {/* Showcase / experimental large pillar */}
          <ShowcasePillar
            enterDuration={enterDuration}
            enterDistance={enterDistance}
          />
          {copy.mechanism.pillars.map((pillar, i) => (
            <PillarModule
              key={pillar.id}
              pillar={pillar}
              index={i + 1}
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
      <div className="relative py-10 md:py-12 px-2 md:px-0 grid md:grid-cols-12 gap-y-4 gap-x-12 items-center">
        {/* Title */}
        <div className="md:col-span-5">
          <h3 className="font-display text-fluid-xl text-off group-hover:text-accent transition-colors duration-400 leading-[1.05] tracking-tight">
            {pillar.title}
          </h3>
        </div>

        {/* Definition */}
        <div className="md:col-span-7">
          <p className="text-fluid-sm text-light leading-relaxed">
            {pillar.definition}
          </p>
        </div>

      </div>

      {/* Outcome — always visible on mobile, hover-revealed on desktop */}
      <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
        <div className="overflow-hidden">
          <p
            className="font-display text-accent tracking-tight text-center font-semibold leading-snug pb-8 md:pb-10 px-6 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100"
            style={{ fontSize: "clamp(1.2rem, 1.9vw, 1.9rem)" }}
          >
            &rarr; {pillar.outcome}
          </p>
        </div>
      </div>

      {/* Bottom separator */}
      <div className="h-px bg-border/50 mx-0" />
    </motion.div>
  );
}

function ShowcasePillar({
  enterDuration,
  enterDistance,
}: {
  enterDuration: number;
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
      viewport={{ once: true }}
      transition={{ duration: enterDuration, ease: EASE.cinematic }}
    >
      <div className="relative py-12 md:py-20 px-2 md:px-0 flex flex-col gap-8 md:gap-12">
        {/* Monumental header — matches hero "Marketing & Advertising" size */}
        <h3
          className="font-display text-off group-hover:text-accent transition-colors duration-400 leading-[1.0] tracking-tight text-center"
          style={{ fontSize: "clamp(3.5rem, 11vw, 10rem)" }}
        >
          Strategy &amp; Intelligence
        </h3>

        {/* Subheader — matches pillar title size (Full-Spectrum Marketing) */}
        <p className="font-display text-off text-fluid-xl leading-[1.05] tracking-tight text-center">
          Turning data complexity into clarity.
        </p>

        {/* Full-width definition at standard pillar text size */}
        <p className="text-fluid-sm text-light leading-relaxed w-full text-center max-w-none">
          Aligns marketing, creative, and media execution into a single coordinated system built around your business objectives.
        </p>
      </div>

      {/* Bottom separator */}
      <div className="h-px bg-border/50 mx-0" />
    </motion.div>
  );
}
