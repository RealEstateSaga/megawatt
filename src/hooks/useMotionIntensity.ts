import { useSite } from "../context/SiteContext";
import { DUR, type ScrollIntensity } from "../engine/motion";

/**
 * useMotionIntensity — maps scroll speed and narrative state to motion parameters.
 *
 * Consuming components use this to adapt animation duration, stagger timing,
 * and amplitude without re-implementing the logic per component.
 *
 * "Scroll velocity modifies motion intensity:
 *   slow scroll reduces motion amplitude and increases clarity.
 *   fast scroll increases motion energy and blur suppression."
 *    — Design spec
 */
export interface MotionIntensity {
  /** "slow" or "fast" based on velocity threshold */
  intensity: ScrollIntensity;
  /** True when scrolling fast — use for energetic variants */
  isEnergetic: boolean;
  /** Duration multiplier: fast→0.45×, slow→1× */
  durationScale: number;
  /** Stagger delay in seconds: fast→0.04s, slow→0.08s */
  staggerDelay: number;
  /** Animation distance in px: fast→16px, slow→32px */
  enterDistance: number;
  /** Duration for entrance animations, pre-scaled */
  enterDuration: number;
}

export function useMotionIntensity(): MotionIntensity {
  const { scrollIntensity } = useSite();
  const isEnergetic = scrollIntensity === "fast";

  const durationScale = isEnergetic ? 0.45 : 1;
  const staggerDelay = isEnergetic ? 0.04 : 0.08;
  const enterDistance = isEnergetic ? 12 : 24;
  const enterDuration = isEnergetic ? DUR.fast : DUR.slow;

  return {
    intensity: scrollIntensity,
    isEnergetic,
    durationScale,
    staggerDelay,
    enterDistance,
    enterDuration,
  };
}
