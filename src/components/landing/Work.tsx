import { useRef } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";

const projects = [
  {
    number: "01",
    title: "Nexus Capital",
    category: "Brand Identity + Web",
    year: "2024",
    tags: ["Finance", "B2B", "Design System"],
    color: "#1a1a2e",
    accent: "#c9a96e",
    outcome: "+280% qualified leads in 60 days.",
  },
  {
    number: "02",
    title: "Lumina Health",
    category: "Digital Platform",
    year: "2024",
    tags: ["Health", "SaaS", "Motion"],
    color: "#0a1628",
    accent: "#4f8eff",
    outcome: "340% increase in user activation.",
  },
  {
    number: "03",
    title: "Arc Architecture",
    category: "Portfolio + Studio Site",
    year: "2023",
    tags: ["Architecture", "Editorial", "3D"],
    color: "#1a1207",
    accent: "#c9a96e",
    outcome: "Won FWA Site of the Day within a week of launch.",
  },
];

export default function Work() {
  return (
    <section id="work" className="py-32 md:py-48 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <motion.div
            className="font-mono text-fluid-xs text-accent tracking-widest uppercase mb-4 flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DUR.normal, ease: EASE.cinematic }}
          >
            <div className="h-px w-8 bg-accent" />
            Selected Work
          </motion.div>
          <motion.h2
            className="font-display text-fluid-3xl text-off leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.1 }}
          >
            Projects That
            <br />
            <span className="italic text-off/30">Define Categories</span>
          </motion.h2>
        </div>

        <div className="flex flex-col gap-4">
          {projects.map((p, i) => (
            <ProjectRow key={p.number} project={p} index={i} />
          ))}
        </div>

        {/* Contextual CTA */}
        <motion.div
          className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="font-mono text-fluid-xs text-muted">
            Every project above started with a single conversation.
          </p>
          <a
            href="#contact"
            className="font-mono text-fluid-xs text-accent hover:text-off transition-colors duration-300 tracking-widest uppercase border-b border-accent/40 hover:border-off pb-1"
          >
            Start yours &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function ProjectRow({
  project,
  index,
}: {
  project: (typeof projects)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Local mouse MotionValues for per-card lighting — more precise than global
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(550px at ${mouseX}px ${mouseY}px, ${project.accent}10, transparent 70%)`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      className="group relative border border-border hover:border-accent/30 transition-all duration-500 overflow-hidden"
      data-cursor="view"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: DUR.slow, delay: index * 0.1, ease: EASE.cinematic }}
    >
      {/* Mouse-reactive per-card lighting */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background }}
      />

      <div
        className="relative p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
        style={{
          background: `linear-gradient(135deg, ${project.color}40 0%, transparent 60%)`,
        }}
      >
        <div className="flex items-center gap-8">
          <span className="font-mono text-fluid-xs text-muted">{project.number}</span>
          <div>
            <h3 className="font-display text-fluid-2xl text-off mb-1 group-hover:text-accent transition-colors duration-300">
              {project.title}
            </h3>
            <p className="font-mono text-fluid-xs text-light">{project.category}</p>
            {/* Outcome — visible on hover, contextual proof point */}
            <motion.p
              className="font-mono text-[10px] text-accent mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
            >
              {project.outcome}
            </motion.p>
          </div>
        </div>

        <div className="flex items-center gap-8 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] text-muted border border-muted/20 px-2 py-0.5 tracking-wider uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="font-mono text-fluid-xs text-muted">{project.year}</span>
          <motion.div
            className="w-10 h-10 border border-border flex items-center justify-center group-hover:border-accent group-hover:text-accent text-light transition-all duration-300"
            whileHover={{ rotate: 45 }}
          >
            &rarr;
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
