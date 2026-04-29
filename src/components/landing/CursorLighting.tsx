import { motion, useMotionTemplate, useTransform } from "framer-motion";
import { useSite } from "../../context/SiteContext";

/**
 * Global cursor lighting — tonal compression on a paper field.
 *
 * Instead of illumination, the cursor introduces a subtle darkening
 * radial — like moving a precision lens across paper. Felt, not glowing.
 */
export default function CursorLighting() {
  const { mouseX, mouseY, scrollDepth } = useSite();

  const opacity = useTransform(scrollDepth, [0, 0.04, 0.92, 1], [0.35, 1, 1, 0]);

  const background = useMotionTemplate`radial-gradient(520px circle at ${mouseX}px ${mouseY}px, rgba(0,0,0,0.04), transparent 60%)`;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[50]"
      aria-hidden="true"
      style={{ opacity, background }}
    />
  );
}
