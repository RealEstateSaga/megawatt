import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  useScroll,
  useVelocity,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { SPRING, type ScrollIntensity } from "../engine/motion";
import { resolveNarrativeState } from "../content/stateDefinitions";

/**
 * Five narrative states mirror the psychological conversion arc:
 *   intro → framing → mechanism → validation → conversion
 *
 * Thresholds are defined in src/content/stateDefinitions.ts so narrative
 * control lives in the content layer, not in component logic.
 */
export type NarrativeState =
  | "intro"
  | "framing"
  | "mechanism"
  | "validation"
  | "conversion";

interface SiteContextValue {
  /** Raw scroll position MotionValue */
  scrollY: MotionValue<number>;
  /** Spring-smoothed scroll velocity (px/s) */
  scrollVelocity: MotionValue<number>;
  /** Normalized scroll progress 0–1 */
  scrollDepth: MotionValue<number>;
  /** Spring-smoothed mouse X (atmospheric lag) */
  mouseX: MotionValue<number>;
  /** Spring-smoothed mouse Y (atmospheric lag) */
  mouseY: MotionValue<number>;
  /** Current narrative arc state based on scroll depth */
  narrativeState: NarrativeState;
  /** "fast" when velocity > 800 px/s — drives animation energy */
  scrollIntensity: ScrollIntensity;
  /**
   * Motion scale multiplier (0.3–1.0).
   * High velocity → lower scale (snappier, shorter durations).
   * Low velocity → 1.0 (full cinematic timing).
   */
  motionScale: number;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const { scrollY, scrollYProgress } = useScroll();
  const rawVelocity = useVelocity(scrollY);
  const scrollVelocity = useSpring(rawVelocity, { stiffness: 400, damping: 90 });

  // Atmospheric spring mouse — intentionally laggy for a "floating light" feel
  const mouseX = useSpring(0, SPRING.atmospheric);
  const mouseY = useSpring(0, SPRING.atmospheric);

  const [narrativeState, setNarrativeState] = useState<NarrativeState>("intro");
  const [scrollIntensity, setScrollIntensity] = useState<ScrollIntensity>("slow");
  const [motionScale, setMotionScale] = useState(1.0);

  // Track raw mouse position; springs handle smoothing
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  // Derive narrative state from scroll depth using content-layer thresholds
  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      setNarrativeState(resolveNarrativeState(v));
    });
  }, [scrollYProgress]);

  // Derive scroll intensity and motion scale from velocity magnitude
  useEffect(() => {
    return rawVelocity.on("change", (v) => {
      const absV = Math.abs(v);
      setScrollIntensity(absV > 800 ? "fast" : "slow");
      // High velocity → tighter/snappier (scale < 1); slow → full cinematic (1.0)
      setMotionScale(Math.max(0.35, Math.min(1.0, 1 - absV / 6000)));
    });
  }, [rawVelocity]);

  return (
    <SiteContext.Provider
      value={{
        scrollY,
        scrollVelocity,
        scrollDepth: scrollYProgress,
        mouseX,
        mouseY,
        narrativeState,
        scrollIntensity,
        motionScale,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}
