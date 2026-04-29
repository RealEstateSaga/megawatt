import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { EASE, DUR, SPRING } from "../../engine/motion";
import { useSite } from "../../context/SiteContext";
import { copy } from "../../content/copy";
import { ctaClasses } from "../../content/ctaConfig";
import SectionWrapper from "./SectionWrapper";

/**
 * STATE 5: CONVERSION FIELD
 *
 * Objective: Capture intent without interrupting flow.
 * CTAs are not centralized — they're distributed. This is the final exit.
 * CTA intensity increases with scroll depth: soft → neutral → direct.
 * "No interaction should ever break readability."
 */
export default function Contact() {
  const { scrollIntensity } = useSite();
  const ref = useRef<HTMLDivElement>(null);

  // Local scroll progress within the section drives CTA pulse intensity
  const { scrollYProgress: sectionProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  // No glow in lightfield mode — keep transform reference for layout parity only
  const ctaGlow = useTransform(sectionProgress, [0, 1], [0, 0]);

  // Subline based on scroll intensity
  const subline =
    scrollIntensity === "fast"
      ? "We deliver measurable outcomes — revenue, activation, and category position."
      : copy.conversion.primary;

  return (
    <SectionWrapper
      id="contact"
      phase="conversion"
      padding="py-40 md:py-64"
      className="px-6 md:px-12 bg-surface/30 border-t border-border/40"
    >
      <div ref={ref} className="max-w-5xl mx-auto text-center">
        {/* Section label */}
        <motion.div
          className="font-mono text-fluid-xs text-accent tracking-[0.3em] uppercase mb-12 flex items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.normal }}
        >
          <div className="h-px w-8 bg-accent" />
          {copy.conversion.label}
          <div className="h-px w-8 bg-accent" />
        </motion.div>

        {/* Primary statement */}
        <motion.p
          key={scrollIntensity}
          className="font-display text-fluid-2xl text-off leading-tight mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.cinematic, ease: EASE.cinematic }}
        >
          {subline}
        </motion.p>

        {/* Three contextual actions — distributed intensity */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.2 }}
        >
          {/* Primary action — direct, editorial */}
          <motion.div>
            <MagneticLink href={copy.conversion.actions[0].href} className={ctaClasses("direct")}>
              {copy.conversion.actions[0].label}
              <motion.span
                className="inline-block ml-2"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                &rarr;
              </motion.span>
            </MagneticLink>
          </motion.div>

          {/* Secondary action — outline */}
          <MagneticLink href={copy.conversion.actions[1].href} className={ctaClasses("outline")}>
            {copy.conversion.actions[1].label}
          </MagneticLink>

          {/* Tertiary action — ghost / text only */}
          <a
            href={copy.conversion.actions[2].href}
            className="font-mono text-fluid-xs text-mid hover:text-off transition-colors duration-300 tracking-widest uppercase border-b border-mid/40 hover:border-off pb-0.5 font-semibold"
          >
            {copy.conversion.actions[2].label}
          </a>
        </motion.div>

        {/* Availability signal */}
        <motion.div
          className="inline-flex items-center gap-2 font-mono text-fluid-xs text-mid"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
          {copy.conversion.availability}
        </motion.div>

        {/* Email — always visible as a fallback */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.65 }}
        >
          <a
            href="mailto:hello@1mw.com"
            className="font-mono text-fluid-xs text-light hover:text-off transition-colors duration-300 tracking-wider font-medium"
          >
            hello@1mw.com
          </a>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

function MagneticLink({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(0, SPRING.loose);
  const y = useSpring(0, SPRING.loose);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.35);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.35);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={`inline-flex items-center ${className}`}
    >
      {children}
    </motion.a>
  );
}
