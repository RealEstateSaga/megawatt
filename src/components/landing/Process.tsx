import { useRef } from "react";
import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion";
import { EASE, DUR, SPRING } from "../engine/motion";

const steps = [
  {
    number: "01",
    title: "Discovery",
    description:
      "Deep-dive into your business, audience, and competitive landscape. We audit everything before we design anything.",
  },
  {
    number: "02",
    title: "Strategy",
    description:
      "Positioning, architecture, and a creative brief that makes every subsequent decision obvious.",
  },
  {
    number: "03",
    title: "Design",
    description:
      "Interface systems, motion principles, and visual language — refined until it's undeniable.",
  },
  {
    number: "04",
    title: "Build",
    description:
      "Production engineering with obsessive attention to performance, accessibility, and code quality.",
  },
  {
    number: "05",
    title: "Launch",
    description:
      "Coordinated go-live with QA across all devices, browsers, and network conditions.",
  },
];

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" ref={ref} className="py-32 md:py-48 px-6 md:px-12 bg-surface">
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
            How We Work
          </motion.div>
          <motion.h2
            className="font-display text-fluid-3xl text-off leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.1 }}
          >
            The 1MW
            <br />
            <span className="italic text-accent">Process</span>
          </motion.h2>
        </div>

        <div className="relative flex flex-col gap-0">
          {/* Animated timeline line */}
          <div className="absolute left-[19px] md:left-[23px] top-0 bottom-0 w-px bg-border">
            <motion.div
              className="absolute top-0 left-0 w-full bg-accent"
              style={{ height: lineHeight }}
            />
          </div>

          {steps.map((step, i) => (
            <StepItem key={step.number} step={step} index={i} />
          ))}
        </div>

        {/* Inline contextual CTA */}
        <motion.div
          className="mt-16 ml-[calc(19px+2rem)] md:ml-[calc(23px+4rem)] border-l border-accent/30 pl-4"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.normal, ease: EASE.cinematic, delay: 0.3 }}
        >
          <p className="font-mono text-fluid-xs text-muted mb-2">
            Curious how this maps to your project?
          </p>
          <a
            href="#contact"
            className="font-mono text-fluid-xs text-accent hover:text-off transition-colors duration-200 tracking-widest uppercase border-b border-accent/40 hover:border-off pb-0.5"
          >
            Walk through scope with us &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function StepItem({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });

  // Micro-depth: subtle lift on hover via springs
  const y = useSpring(0, SPRING.medium);
  const scale = useSpring(1, SPRING.medium);

  return (
    <motion.div
      ref={ref}
      className="flex gap-8 md:gap-16 pb-16 last:pb-0 group cursor-none"
      style={{ y, scale }}
      onMouseEnter={() => { y.set(-4); scale.set(1.01); }}
      onMouseLeave={() => { y.set(0); scale.set(1); }}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: DUR.slow, delay: index * 0.06, ease: EASE.cinematic }}
    >
      {/* Step dot */}
      <div className="relative flex-shrink-0 mt-1">
        <motion.div
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-surface z-10 relative group-hover:bg-bg transition-colors duration-300"
          animate={inView ? { borderColor: "#c9a96e" } : {}}
          transition={{ duration: DUR.normal, delay: 0.3 }}
        >
          <span className="font-mono text-[10px] text-accent">{step.number}</span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="pt-2">
        <h3 className="font-display text-fluid-xl text-off mb-3 group-hover:text-accent transition-colors duration-300">
          {step.title}
        </h3>
        <p className="text-fluid-sm text-light leading-relaxed max-w-md">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}
