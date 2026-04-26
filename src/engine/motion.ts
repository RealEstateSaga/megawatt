/**
 * Motion Engine — single source of truth for all animation configuration.
 * "Limit effects, increase precision" — every animated element uses these presets.
 */

export const EASE = {
  // Cinematic: slow in, sharp out — hero entrances, slow-scroll state
  cinematic: [0.16, 1, 0.3, 1] as [number, number, number, number],
  // Expressive: snappy spring feel — hover states, fast-scroll state
  expressive: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  // Grounded: near-linear — validation/proof sections, credibility signals
  grounded: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  // Drift: ultra slow — atmospheric parallax, background layers
  drift: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
} as const;

export const DUR = {
  instant: 0.15,
  fast: 0.3,
  normal: 0.55,
  slow: 0.85,
  cinematic: 1.1,
  drift: 2.2,
} as const;

export type ScrollIntensity = "slow" | "fast";

/**
 * Entrance variant factory — adapts to scroll intensity context.
 * Slow scroll = cinematic feel. Fast scroll = punchy and immediate.
 */
export function enterVariants(
  intensity: ScrollIntensity = "slow",
  axis: "y" | "x" = "y",
  distance = 32,
) {
  const duration = intensity === "fast" ? DUR.fast : DUR.slow;
  const ease = intensity === "fast" ? EASE.expressive : EASE.cinematic;
  const hidden = axis === "y"
    ? { opacity: 0, y: distance }
    : { opacity: 0, x: distance };
  const visible = axis === "y"
    ? { opacity: 1, y: 0, transition: { duration, ease } }
    : { opacity: 1, x: 0, transition: { duration, ease } };
  return { hidden, visible };
}

/**
 * Stagger container variants.
 */
export function staggerContainer(staggerChildren = 0.07, delayChildren = 0) {
  return {
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren } },
  };
}

/**
 * Shared spring configs.
 */
export const SPRING = {
  // Tight: cursor dot, fast UI feedback
  tight: { stiffness: 600, damping: 35 },
  // Medium: cursor ring, hover states
  medium: { stiffness: 300, damping: 25 },
  // Loose: magnetic buttons, parallax fields
  loose: { stiffness: 120, damping: 18 },
  // Atmospheric: cursor lighting, background drift
  atmospheric: { stiffness: 60, damping: 16 },
} as const;
