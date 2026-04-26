import { motion, useTransform, useMotionTemplate } from "framer-motion";
import { useSite } from "../context/SiteContext";

/**
 * BackgroundField — passive ambient atmospheric layer.
 *
 * Sits behind all content (z-0). Distinct from CursorLighting (which is
 * cursor-reactive). This layer drifts slowly and shifts color with narrative
 * state, creating the sense of moving through different "atmospheric zones."
 *
 * Layers:
 *   1. Primary field — large central radial that drifts vertically
 *   2. Secondary field — smaller offset glow, slightly out of phase
 *
 * "Background gradients are not static; they behave like low-intensity
 *  atmospheric fields." — Design spec
 */
export default function BackgroundField() {
  const { scrollDepth, narrativeState } = useSite();

  // Continuous color channels derived from scroll depth (mirrors CursorLighting palette)
  const r = useTransform(scrollDepth, [0, 0.1, 0.3, 0.58, 0.82, 1], [201, 180, 60, 100, 201, 201]);
  const g = useTransform(scrollDepth, [0, 0.1, 0.3, 0.58, 0.82, 1], [169, 155, 100, 100, 169, 169]);
  const b = useTransform(scrollDepth, [0, 0.1, 0.3, 0.58, 0.82, 1], [110, 100, 200, 115, 110, 110]);

  // Validation state → reduced drift amplitude — feels stable and credible
  const isValidation = narrativeState === "validation";
  const driftDuration = isValidation ? 30 : 20;
  const driftRange = isValidation ? 40 : 110;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Primary drifting field — large, slow, central */}
      <motion.div
        className="absolute inset-[-20%] w-[140%] h-[140%]"
        animate={{ y: [-driftRange, driftRange, -driftRange] }}
        transition={{
          duration: driftDuration,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "loop",
        }}
      >
        <PrimaryGlow r={r} g={g} b={b} />
      </motion.div>

      {/* Secondary field — smaller, offset, phase-shifted */}
      <motion.div
        className="absolute inset-[-20%] w-[140%] h-[140%]"
        animate={{ y: [driftRange * 0.6, -driftRange * 0.6, driftRange * 0.6] }}
        transition={{
          duration: driftDuration * 1.3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
          repeatType: "loop",
        }}
      >
        <SecondaryGlow r={r} g={g} b={b} />
      </motion.div>
    </div>
  );
}

// Each glow is its own component so useMotionTemplate runs inside the component
function PrimaryGlow({
  r, g, b,
}: {
  r: ReturnType<typeof useTransform<number, number>>;
  g: ReturnType<typeof useTransform<number, number>>;
  b: ReturnType<typeof useTransform<number, number>>;
}) {
  const bg = useMotionTemplate`radial-gradient(ellipse 70% 55% at 50% 50%, rgba(${r},${g},${b},0.028), transparent 68%)`;
  return <motion.div className="absolute inset-0" style={{ background: bg }} />;
}

function SecondaryGlow({
  r, g, b,
}: {
  r: ReturnType<typeof useTransform<number, number>>;
  g: ReturnType<typeof useTransform<number, number>>;
  b: ReturnType<typeof useTransform<number, number>>;
}) {
  const bg = useMotionTemplate`radial-gradient(ellipse 50% 40% at 65% 40%, rgba(${r},${g},${b},0.018), transparent 70%)`;
  return <motion.div className="absolute inset-0" style={{ background: bg }} />;
}
