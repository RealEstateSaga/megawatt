import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";

const steps = [
  { number: "01", title: "Audit",    description: "We assess your current marketing infrastructure, channels, tools, and competitive position before recommending anything." },
  { number: "02", title: "Strategy", description: "Positioning, channel architecture, and a coordinated plan that aligns every moving part to a single business objective." },
  { number: "03", title: "Build",    description: "Websites, cloud systems, CRM platforms, and creative assets — engineered for performance and long-term adaptability." },
  { number: "04", title: "Activate", description: "Campaigns, automation workflows, and media systems deployed across the channels that drive qualified growth." },
  { number: "05", title: "Optimize", description: "Continuous performance tracking, testing, and refinement aligned to revenue outcomes, not vanity metrics." },
];

/**
 * PROCESS — white editorial chapter.
 * Sequential timeline as oversized vertical rhythm.
 */
export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const headerY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      id="process"
      ref={ref}
      data-env="light"
      className="env-light relative px-8 md:px-16 py-40 md:py-64"
    >
      <motion.div
        style={{ y: headerY }}
        className="flex justify-between items-start mb-32 md:mb-48"
      >
        <div>
          <motion.span
            className="text-[11px] tracking-[0.35em] uppercase text-black/50 mb-12 block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: DUR.normal }}
          >
            Process — 04
          </motion.span>
          <div className="overflow-hidden">
            <motion.h2
              className="font-display font-bold text-fluid-3xl text-black leading-[0.95] tracking-[-0.035em]"
              initial={{ y: "105%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: EASE.cinematic }}
            >
              How we work.
            </motion.h2>
          </div>
        </div>

        <motion.p
          className="hidden md:block max-w-sm text-fluid-sm text-black/65 leading-[1.55] mt-24"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, delay: 0.25 }}
        >
          A clear process built to move from strategy to execution without wasted motion.
        </motion.p>
      </motion.div>

      <div>
        {steps.map((step, i) => (
          <StepRow key={step.number} step={step} index={i} />
        ))}
      </div>
    </section>
  );
}

function StepRow({ step, index }: { step: (typeof steps)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const numY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <motion.div
      ref={ref}
      className="group relative border-t border-black/15 py-16 md:py-24 grid md:grid-cols-12 gap-8 md:gap-12 items-start"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: index * 0.05 }}
    >
      <motion.div style={{ y: numY }} className="md:col-span-3">
        <span className="font-display font-light text-[clamp(4.5rem,11vw,10rem)] text-black/85 leading-none tracking-[-0.04em] block">
          {step.number}
        </span>
      </motion.div>

      <div className="md:col-span-5">
        <h3 className="font-display font-semibold text-fluid-2xl text-black leading-[1.0] tracking-[-0.025em]">
          {step.title}
        </h3>
      </div>

      <div className="md:col-span-4">
        <p className="text-fluid-sm text-black/65 leading-[1.6]">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}
