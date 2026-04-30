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

  // Single primary statement (no scroll-intensity alt)
  const subline = copy.conversion.primary;

  return (
    <SectionWrapper
      id="contact"
      phase="conversion"
      padding="pt-20 md:pt-28 pb-40 md:pb-56"
      className="px-8 md:px-12 bg-surface/30"
    >
      <div ref={ref} className="max-w-5xl mx-auto text-center">
        {/* Primary statement — monumental CTA headline */}
        <motion.p
          key={scrollIntensity}
          className="font-display text-fluid-3xl text-off leading-[1.05] tracking-tight mb-20 max-w-5xl mx-auto [text-wrap:balance]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.cinematic, ease: EASE.cinematic }}
        >
          {subline}
        </motion.p>

        {/* Email — primary contact, scaled up to replace removed CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.2 }}
        >
          <a
            href="mailto:hello@1mw.com"
            className="font-display text-fluid-xl text-[#111111] hover:text-black transition-colors duration-300 tracking-tight font-medium"
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
