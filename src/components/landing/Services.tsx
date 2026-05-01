import { useRef } from "react";
import { motion, useSpring } from "framer-motion";
import { EASE, DUR, SPRING } from "../../engine/motion";
import { copy, type Pillar } from "../../content/copy";
import { useMotionIntensity } from "../../hooks/useMotionIntensity";
import wordmark from "../../assets/1mw-wordmark.svg";
import SectionWrapper from "./SectionWrapper";

/**
 * Unified pillar stack — Hero, all middle pillars, and Contact share the same
 * animated box treatment so the whole page is one continuous narrative.
 *
 * Each pillar:
 *   h1 (monumental title) + h2 (definition) + h3 (hover-revealed body).
 * On mobile the body is always visible so it pops as the user scrolls.
 */
export default function Services() {
  const { enterDuration, staggerDelay, enterDistance } = useMotionIntensity();

  return (
    <SectionWrapper
      id="services"
      phase="mechanism"
      padding="pt-0 pb-32 md:pb-48"
      className="px-6 md:px-12 lg:px-16 bg-bg"
      fadeOnScroll={false}
    >
      <div className="w-full">
        <div className="flex flex-col gap-px">
          {/* First pillar — Hero (logo + h1 + h2 + h3) */}
          <HeroPillar
            enterDuration={enterDuration}
            enterDistance={enterDistance}
          />

          {/* Middle pillars */}
          {copy.pillars.map((pillar, i) => (
            <PillarModule
              key={pillar.id}
              pillar={pillar}
              index={i + 1}
              enterDuration={enterDuration}
              staggerDelay={staggerDelay}
              enterDistance={enterDistance}
            />
          ))}

          {/* Final pillar — Contact (mailto link) */}
          <ContactPillar
            enterDuration={enterDuration}
            enterDistance={enterDistance}
          />
        </div>
      </div>
    </SectionWrapper>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function HeroPillar({
  enterDuration,
  enterDistance,
}: {
  enterDuration: number;
  enterDistance: number;
}) {
  const hoverY = useSpring(0, SPRING.medium);
  const hoverScale = useSpring(1, SPRING.medium);

  return (
    <motion.div
      id="hero"
      className="group relative border-t border-border/50 overflow-hidden transition-shadow duration-300 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]"
      style={{ y: hoverY, scale: hoverScale }}
      onMouseEnter={() => { hoverY.set(-3); hoverScale.set(1.005); }}
      onMouseLeave={() => { hoverY.set(0); hoverScale.set(1); }}
      initial={{ opacity: 0, y: enterDistance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: enterDuration, ease: EASE.cinematic }}
    >
      <div className="relative py-24 md:py-40 px-2 md:px-0 flex flex-col gap-10 md:gap-16 items-center text-center">
        {/* 1MW red wordmark — visual anchor above H1 */}
        <motion.img
          src={wordmark}
          alt="1MW"
          className="block h-auto mx-auto"
          style={{ width: "min(28vw, 360px)", maxWidth: "100%" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.cinematic, ease: EASE.cinematic, delay: 0.2 }}
        />

        {/* h1 — monumental title */}
        <h1
          className="font-display text-off group-hover:text-accent transition-colors duration-400 leading-[1.0] tracking-tight text-center"
          style={{ fontSize: "clamp(3.5rem, 11vw, 10rem)" }}
        >
          {copy.hero.h1}
        </h1>

        {/* h2 — definition */}
        <p className="font-display text-off text-fluid-xl leading-[1.15] tracking-tight text-center max-w-5xl mx-auto">
          {copy.hero.h2}
        </p>
      </div>

      {/* h3 — hover-revealed on desktop, always visible on mobile */}
      <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
        <div className="overflow-hidden">
          <p className="text-fluid-sm text-light leading-relaxed text-center pb-16 md:pb-24 px-6 md:px-12 max-w-5xl mx-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100">
            {copy.hero.h3}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

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
      <div className="relative py-24 md:py-40 px-2 md:px-0 flex flex-col gap-10 md:gap-16 items-center text-center">
        <h2
          className="font-display text-off group-hover:text-accent transition-colors duration-400 leading-[1.0] tracking-tight text-center"
          style={{ fontSize: "clamp(3.5rem, 11vw, 10rem)" }}
        >
          {pillar.title}
        </h2>

        <p className="font-display text-off text-fluid-xl leading-[1.15] tracking-tight text-center max-w-5xl mx-auto">
          {pillar.definition}
        </p>
      </div>

      <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
        <div className="overflow-hidden">
          <p className="text-fluid-sm text-light leading-relaxed text-center pb-16 md:pb-24 px-6 md:px-12 max-w-5xl mx-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100">
            {pillar.outcome}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function ContactPillar({
  enterDuration,
  enterDistance,
}: {
  enterDuration: number;
  enterDistance: number;
}) {
  const hoverY = useSpring(0, SPRING.medium);
  const hoverScale = useSpring(1, SPRING.medium);

  return (
    <motion.a
      id="contact"
      href={`mailto:${copy.conversion.email}`}
      className="group relative block border-t border-b border-border/50 overflow-hidden transition-shadow duration-300 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]"
      style={{ y: hoverY, scale: hoverScale }}
      onMouseEnter={() => { hoverY.set(-3); hoverScale.set(1.005); }}
      onMouseLeave={() => { hoverY.set(0); hoverScale.set(1); }}
      initial={{ opacity: 0, y: enterDistance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: enterDuration, ease: EASE.cinematic }}
    >
      <div className="relative py-24 md:py-40 px-2 md:px-0 flex flex-col gap-10 md:gap-16 items-center text-center">
        <h2
          className="font-display text-off group-hover:text-accent transition-colors duration-400 leading-[1.0] tracking-tight text-center"
          style={{ fontSize: "clamp(3.5rem, 11vw, 10rem)" }}
        >
          {copy.conversion.title}
        </h2>

        <p className="font-display text-off text-fluid-xl leading-[1.15] tracking-tight text-center max-w-5xl mx-auto">
          {copy.conversion.definition}
        </p>
      </div>

      <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
        <div className="overflow-hidden">
          <p className="text-fluid-sm text-light leading-relaxed text-center pb-16 md:pb-24 px-6 md:px-12 max-w-5xl mx-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100">
            {copy.conversion.outcome}
          </p>
        </div>
      </div>
    </motion.a>
  );
}
