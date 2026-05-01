import { useRef } from "react";
import { motion, useSpring } from "framer-motion";
import { EASE, DUR, SPRING } from "../../engine/motion";
import { copy } from "../../content/copy";
import SectionWrapper from "./SectionWrapper";

/**
 * Final pillar — "One / Click to Map Your Next Move / hello@1mw.com"
 * Matches the unified pillar design used throughout the page.
 */
export default function Contact() {
  const ref = useRef<HTMLAnchorElement>(null);
  const hoverY = useSpring(0, SPRING.medium);
  const hoverScale = useSpring(1, SPRING.medium);

  return (
    <SectionWrapper
      id="contact"
      phase="conversion"
      padding="pt-0 pb-20 md:pb-28"
      className="px-6 md:px-12 bg-bg"
      fadeOnScroll={false}
    >
      <div className="max-w-7xl mx-auto">
        <motion.a
          ref={ref}
          href={`mailto:${copy.conversion.email}`}
          className="group relative block border-t border-border/50 overflow-hidden transition-shadow duration-300 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]"
          style={{ y: hoverY, scale: hoverScale }}
          onMouseEnter={() => { hoverY.set(-3); hoverScale.set(1.005); }}
          onMouseLeave={() => { hoverY.set(0); hoverScale.set(1); }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: DUR.cinematic, ease: EASE.cinematic }}
        >
          <div className="relative py-12 md:py-20 px-2 md:px-0 flex flex-col gap-8 md:gap-12 items-center text-center">
            <h2
              className="font-display text-off group-hover:text-accent transition-colors duration-400 leading-[1.0] tracking-tight text-center"
              style={{ fontSize: "clamp(3.5rem, 11vw, 10rem)" }}
            >
              {copy.conversion.title}
            </h2>

            <p className="font-display text-off text-fluid-xl leading-[1.15] tracking-tight text-center max-w-5xl mx-auto">
              {copy.conversion.definition}
            </p>
          </div>

          <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
            <div className="overflow-hidden">
              <p className="text-fluid-sm text-light leading-relaxed text-center pb-8 md:pb-10 px-6 md:px-12 max-w-5xl mx-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100">
                {copy.conversion.outcome}
              </p>
            </div>
          </div>

          <div className="h-px bg-border/50 mx-0" />
        </motion.a>
      </div>
    </SectionWrapper>
  );
}
