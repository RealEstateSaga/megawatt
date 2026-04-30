import { motion } from "framer-motion";
import { useSite } from "../../context/SiteContext";

/**
 * BackgroundField — paper-like light diffusion. Felt, not seen.
 *
 * Two extremely low-opacity grey orbs that drift slowly. No color shifts.
 * Replaces the previous gold/blue atmospheric glow with restrained
 * editorial dimensionality.
 */
export default function BackgroundField() {
  const { narrativeState } = useSite();

  const isValidation = narrativeState === "validation";
  const driftDuration = isValidation ? 50 : 35;
  const driftRange = isValidation ? 30 : 65;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-[-20%] w-[140%] h-[140%]"
        animate={{ y: [-driftRange, driftRange, -driftRange] }}
        transition={{
          duration: driftDuration,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "loop",
        }}
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(0,0,0,0.018), transparent 68%)",
        }}
      />

      <motion.div
        className="absolute inset-[-20%] w-[140%] h-[140%]"
        animate={{ y: [driftRange * 0.6, -driftRange * 0.6, driftRange * 0.6] }}
        transition={{
          duration: driftDuration * 1.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
          repeatType: "loop",
        }}
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 65% 40%, rgba(80,80,80,0.012), transparent 70%)",
        }}
      />
    </div>
  );
}
