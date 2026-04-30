import { useMotionValue, useAnimationFrame, motion } from "framer-motion";

const items = [
  "Strategy", "Web Design", "Cloud Infrastructure", "Performance Marketing",
  "SEO", "Paid Media", "CRM & Automation", "Email Marketing",
  "Systems Integration", "AI",
];

/**
 * Editorial divider marquee — sits between the white Hero and the dark About.
 * Black bar with white type creates the first environmental inversion.
 */
export default function Marquee() {
  const x = useMotionValue(0);
  const speed = 0.6;

  useAnimationFrame(() => {
    const current = x.get();
    x.set(current - speed);
    if (current < -1600) x.set(0);
  });

  const loop = [...items, ...items, ...items];

  return (
    <div
      data-env="dark"
      className="env-dark py-10 overflow-hidden"
    >
      <motion.div className="flex gap-20 whitespace-nowrap" style={{ x }}>
        {loop.map((item, i) => (
          <span
            key={i}
            className="text-[13px] tracking-[0.3em] uppercase text-white flex items-center gap-20 font-medium"
          >
            {item}
            <span className="text-white/40">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
