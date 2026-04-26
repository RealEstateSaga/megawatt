import { useMotionValue, useAnimationFrame, motion } from "framer-motion";

const items = [
  "Brand Strategy", "Web Design", "Motion Design", "Development",
  "UI Systems", "Art Direction", "Digital Campaigns", "Interaction Design",
  "Brand Strategy", "Web Design", "Motion Design", "Development",
  "UI Systems", "Art Direction", "Digital Campaigns", "Interaction Design",
];

export default function Marquee() {
  const x = useMotionValue(0);
  const speed = 0.8;

  useAnimationFrame(() => {
    const current = x.get();
    x.set(current - speed);
    if (current < -1200) x.set(0);
  });

  return (
    <div className="py-8 border-y border-border overflow-hidden bg-surface">
      <motion.div className="flex gap-16 whitespace-nowrap" style={{ x }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="font-mono text-fluid-xs text-muted tracking-widest uppercase flex items-center gap-16">
            {item}
            <span className="text-accent">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
