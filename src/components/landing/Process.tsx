import { useRef } from "react";
import { motion, useSpring } from "framer-motion";
import { EASE, DUR, SPRING } from "../../engine/motion";
import SectionWrapper from "./SectionWrapper";

const steps = [
  {
    number: "01",
    title: "Audit",
    description:
      "We assess your current marketing infrastructure, channels, tools, and competitive position before recommending anything.",
  },
  {
    number: "02",
    title: "Strategy",
    description:
      "Positioning, channel architecture, and a coordinated plan that aligns every moving part to a single business objective.",
  },
  {
    number: "03",
    title: "Build",
    description:
      "Websites, cloud systems, CRM platforms, and creative assets — engineered for performance and long-term adaptability.",
  },
  {
    number: "04",
    title: "Activate",
    description:
      "Campaigns, automation workflows, and media systems deployed across the channels that drive qualified growth.",
  },
  {
    number: "05",
    title: "Optimize",
    description:
      "Continuous performance tracking, testing, and refinement aligned to revenue outcomes, not vanity metrics.",
  },
];

export default function Process() {
  return (
    <SectionWrapper
      id="process"
      phase="mechanism"
      padding="pt-6 md:pt-8 pb-20 md:pb-28"
      className="px-6 md:px-12 bg-surface"
    >
      <div className="max-w-7xl mx-auto">
        {/* Centered intro statement */}
        <div className="mb-10 md:mb-14 max-w-5xl mx-auto text-center">
          <motion.p
            className="font-display text-fluid-2xl text-off leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DUR.cinematic, ease: EASE.cinematic }}
          >
            A clear process built to move from strategy to execution without wasted motion.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-px">
          {steps.map((step, i) => (
            <StepModule key={step.number} step={step} index={i} />
          ))}
        </div>

        {/* Inline contextual CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.normal, ease: EASE.cinematic, delay: 0.2 }}
        >
          <p className="font-mono text-fluid-xs text-mid mb-2">
            What's next?
          </p>
          <a
            href="#contact"
            className="font-mono text-fluid-xs text-[#111111] hover:text-black transition-colors duration-200 tracking-widest uppercase border-b border-black/40 hover:border-black pb-0.5 font-semibold"
          >
            Start The Conversation &rarr;
          </a>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

function StepModule({ step, index }: { step: (typeof steps)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const hoverY = useSpring(0, SPRING.medium);
  const hoverScale = useSpring(1, SPRING.medium);

  return (
    <motion.div
      ref={ref}
      className="group relative border-t border-border/50 overflow-hidden transition-shadow duration-300 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]"
      style={{ y: hoverY, scale: hoverScale }}
      onMouseEnter={() => { hoverY.set(-3); hoverScale.set(1.005); }}
      onMouseLeave={() => { hoverY.set(0); hoverScale.set(1); }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: DUR.slow, delay: index * 0.06, ease: EASE.cinematic }}
    >
      <div className="relative py-10 md:py-12 px-2 md:px-0 grid md:grid-cols-12 gap-y-4 gap-x-12 items-center">
        {/* Title + numeric label */}
        <div className="md:col-span-5">
          <span className="font-mono text-fluid-xs text-mid tracking-[0.3em] uppercase block mb-3">
            {step.number}
          </span>
          <h3 className="font-display text-fluid-xl text-off group-hover:text-accent transition-colors duration-400 leading-[1.05] tracking-tight">
            {step.title}
          </h3>
        </div>

        {/* Description */}
        <div className="md:col-span-7">
          <p className="text-fluid-sm text-light leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      <div className="h-px bg-border/50 mx-0" />
    </motion.div>
  );
}
