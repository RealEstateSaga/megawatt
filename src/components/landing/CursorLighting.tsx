import { motion, useMotionTemplate, useTransform } from "framer-motion";
import { useSite } from "../../context/SiteContext";

/**
 * Global cursor lighting field.
 *
 * A radial gradient that follows the mouse with atmospheric lag (via springs
 * in SiteContext). The color temperature shifts continuously with scroll depth:
 *   intro/framing  → warm gold   (201, 169, 110)
 *   mechanism       → electric blue (79, 142, 255)
 *   validation      → cool neutral  (130, 130, 145)
 *   conversion      → warm gold   (201, 169, 110)
 *
 * Opacity fades in from the top and fades out near the footer so it feels
 * intentional rather than persistent.
 */
export default function CursorLighting() {
  const { mouseX, mouseY, scrollDepth } = useSite();

  // Color channels transition with scroll depth (continuous, not stepwise)
  const r = useTransform(
    scrollDepth,
    [0, 0.1, 0.3, 0.55, 0.78, 1],
    [201, 201, 79, 130, 201, 201],
  );
  const g = useTransform(
    scrollDepth,
    [0, 0.1, 0.3, 0.55, 0.78, 1],
    [169, 169, 142, 130, 169, 169],
  );
  const b = useTransform(
    scrollDepth,
    [0, 0.1, 0.3, 0.55, 0.78, 1],
    [110, 110, 255, 145, 110, 110],
  );

  // Fade in after scroll starts; fade out near end
  const opacity = useTransform(scrollDepth, [0, 0.04, 0.92, 1], [0.3, 1, 1, 0]);

  const background = useMotionTemplate`radial-gradient(650px circle at ${mouseX}px ${mouseY}px, rgba(${r},${g},${b},0.07), transparent 65%)`;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[50]"
      aria-hidden="true"
      style={{ opacity, background }}
    />
  );
}
