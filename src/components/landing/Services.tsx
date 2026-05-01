import { useRef } from "react";
import { motion, useSpring } from "framer-motion";
import { EASE, SPRING } from "../../engine/motion";
import { copy, type Pillar } from "../../content/copy";
import { useMotionIntensity } from "../../hooks/useMotionIntensity";
import SectionWrapper from "./SectionWrapper";

/**
 * Unified pillar stack — Hero, all middle pillars, and Contact share the same
 * animated box treatment so the whole page is one continuous narrative.
 *
 * Each pillar:
 *   h1 (monumental title) + h2 (definition) + h3 (hover-revealed body).
 * On mobile the body is always visible so it pops as the user scrolls.
 *
 * Spacing rules:
 *   - py-32 md:py-56   → generous vertical breathing room around each box
 *   - gap-4 md:gap-6   → tight spacing BETWEEN h1 / h2 / h3 lines
 */
export default function Services() {
  const { enterDuration, staggerDelay, enterDistance } = useMotionIntensity();

  return (
    <SectionWrapper
      id="services"
      phase="mechanism"
      padding="pt-0 pb-32 md:pb-48"
      className="px-0 bg-bg"
      fadeOnScroll={false}
    >
      <div className="w-full">
        <div className="flex flex-col gap-px">
          {/* First pillar — Hero (h1 + h2 + h3, no logo) */}
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
      <div className="relative py-32 md:py-56 px-4 md:px-8 lg:px-10 flex flex-col gap-4 md:gap-6 items-center text-center">
        {/* h1 — monumental title */}
        <h1
          className="font-display font-extrabold text-foreground group-hover:text-accent transition-colors duration-400 leading-[0.95] tracking-[-0.03em] text-center"
          style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}
        >
          {copy.hero.h1}
        </h1>

        {/* h2 — definition */}
        <p className="font-display text-foreground text-fluid-xl leading-[1.15] tracking-[-0.02em] text-center max-w-7xl mx-auto">
          {copy.hero.h2}
        </p>

        {/* h3 — always visible on Hero, "1MW" highlighted bright red */}
        <p className="font-display text-foreground text-fluid-xl leading-[1.15] tracking-[-0.02em] text-center max-w-7xl mx-auto">
          <span style={{ color: "#E11D2E" }}>1MW</span> {copy.hero.h3.replace(/^1MW\s*/, "")}
        </p>
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
      <div className="relative py-32 md:py-56 px-4 md:px-8 lg:px-10 flex flex-col gap-4 md:gap-6 items-center text-center">
        <h2
          className="font-display font-extrabold text-foreground group-hover:text-accent transition-colors duration-400 leading-[0.95] tracking-[-0.03em] text-center"
          style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}
        >
          {pillar.title}
        </h2>

        <p className="font-display text-foreground text-fluid-xl leading-[1.15] tracking-[-0.02em] text-center max-w-7xl mx-auto">
          {pillar.definition}
        </p>

        {/* h3 — hover-revealed on desktop, always visible on mobile.
            Lives inside the same flex column so spacing stays consistent. */}
        <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out w-full">
          <div className="overflow-hidden">
            <p className="text-fluid-sm text-foreground leading-relaxed text-center max-w-7xl mx-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100">
              {pillar.outcome}
            </p>
          </div>
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
      <div className="relative py-32 md:py-56 px-2 md:px-0 flex flex-col gap-4 md:gap-6 items-center text-center">
        <h2
          className="font-display text-foreground group-hover:text-accent transition-colors duration-400 leading-[1.0] tracking-tight text-center"
          style={{ fontSize: "clamp(3.5rem, 11vw, 10rem)" }}
        >
          {copy.conversion.title}
        </h2>

        <p className="font-display text-foreground text-fluid-xl leading-[1.15] tracking-tight text-center max-w-5xl mx-auto">
          {copy.conversion.definition}
        </p>

        <p className="font-display text-foreground text-fluid-xl leading-[1.15] tracking-tight text-center max-w-5xl mx-auto">
          {copy.conversion.outcome}
        </p>
      </div>
    </motion.a>
  );
}
