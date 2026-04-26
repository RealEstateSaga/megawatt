import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSite } from "../../context/SiteContext";
import type { NarrativeState } from "../../context/SiteContext";
import { EASE, DUR } from "../../engine/motion";

interface SectionWrapperProps {
  children: ReactNode;
  id?: string;
  className?: string;
  /**
   * The narrative phase this section belongs to.
   * Determines whether fade-on-scroll is applied at all — validation
   * sections are more static, intro/mechanism sections have full fade.
   */
  phase?: NarrativeState;
  /**
   * Override standard padding. Default: py-32 md:py-48
   */
  padding?: string;
  /**
   * Whether to apply the standard fade-out-on-scroll effect.
   * Default: true (all phases except validation)
   */
  fadeOnScroll?: boolean;
}

/**
 * SectionWrapper — canonical section primitive for all narrative state blocks.
 *
 * Responsibilities:
 *   - Consistent vertical padding
 *   - Fade-in when entering viewport
 *   - Optional fade-out when leaving (creates sense of "deeper layer")
 *   - Passes narrative context to children via useSite() (children call it directly)
 *
 * "Each section should be treated as a stateful narrative block rather than
 *  a static component." — Design spec
 */
export default function SectionWrapper({
  children,
  id,
  className = "",
  phase = "intro",
  padding = "py-32 md:py-48",
  fadeOnScroll = true,
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const { narrativeState } = useSite();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Validation phase is deliberately more static — less opacity animation
  const isValidation = phase === "validation";
  const isActive = narrativeState === phase;

  // Fade in as section enters; fade out very slightly as it exits
  // Validation sections stay fully opaque longer for "grounded" feel
  const opacity = useTransform(
    scrollYProgress,
    isValidation ? [0, 0.15, 1] : [0, 0.2, 0.8, 1],
    isValidation ? [0, 1, 1]   : [0, 1, 1, 0.85],
  );

  // Subtle upward drift as section exits — creates "compressed into background" feel
  const y = useTransform(
    scrollYProgress,
    fadeOnScroll ? [0, 0.2, 0.8, 1] : [0, 1],
    fadeOnScroll ? [24, 0, 0, -16]  : [0, 0],
  );

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`relative ${padding} ${className}`}
      style={{ opacity, y }}
      data-narrative-phase={phase}
      data-active={isActive ? "true" : undefined}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: DUR.slow, ease: EASE.cinematic }}
    >
      {children}
    </motion.section>
  );
}
