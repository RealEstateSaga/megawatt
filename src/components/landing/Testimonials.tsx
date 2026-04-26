import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE, DUR } from "../engine/motion";
import { copy } from "../content/copy";

const testimonials = copy.validation.testimonials;

export default function Testimonials() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a - 1 + testimonials.length) % testimonials.length);
  const next = () => setActive((a) => (a + 1) % testimonials.length);

  return (
    <section className="py-32 md:py-48 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 flex items-end justify-between flex-wrap gap-6">
          <div>
            <motion.div
              className="font-mono text-fluid-xs text-accent tracking-widest uppercase mb-4 flex items-center gap-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: DUR.normal }}
            >
              <div className="h-px w-8 bg-accent" />
              Client Voices
            </motion.div>
            <motion.h2
              className="font-display text-fluid-3xl text-off leading-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.1 }}
            >
              Proof, Not
              <br />
              <span className="italic text-off/30">Promises</span>
            </motion.h2>
          </div>

          {/* Dot navigation */}
          <div className="flex gap-2 items-center">
            <button
              onClick={prev}
              className="w-8 h-8 border border-border flex items-center justify-center text-light hover:border-accent hover:text-accent transition-colors duration-200 font-mono text-xs"
              aria-label="Previous"
            >
              &#8592;
            </button>
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`h-px transition-all duration-400 ${
                  i === active ? "bg-accent w-16" : "bg-border w-8"
                }`}
              />
            ))}
            <button
              onClick={next}
              className="w-8 h-8 border border-border flex items-center justify-center text-light hover:border-accent hover:text-accent transition-colors duration-200 font-mono text-xs"
              aria-label="Next"
            >
              &#8594;
            </button>
          </div>
        </div>

        {/* Testimonial — drag to navigate */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="relative"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) next();
              else if (info.offset.x > 60) prev();
            }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: DUR.normal, ease: EASE.cinematic }}
          >
            {/* Decorative quote mark */}
            <div className="font-display text-[100px] md:text-[140px] text-border leading-none select-none absolute -top-6 left-0 pointer-events-none">
              "
            </div>

            <blockquote className="font-display text-fluid-xl text-off leading-relaxed max-w-3xl mb-10 pt-8 pl-6">
              {testimonials[active].quote}
            </blockquote>

            <div className="flex items-center justify-between flex-wrap gap-6 pl-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent flex items-center justify-center font-mono text-xs text-bg font-bold flex-shrink-0">
                  {testimonials[active].logo}
                </div>
                <div>
                  <p className="text-off font-medium text-fluid-sm">
                    {testimonials[active].author}
                  </p>
                  <p className="text-muted font-mono text-fluid-xs">
                    {testimonials[active].title}
                  </p>
                </div>
              </div>

              {/* Metric callout — proof signal */}
              <div className="border border-accent/20 px-4 py-2">
                <p className="font-mono text-fluid-xs text-accent tracking-widest">
                  {testimonials[active].metric}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe hint for mobile */}
        <p className="font-mono text-[10px] text-muted mt-8 ml-6 tracking-widest md:hidden">
          Drag to navigate
        </p>
      </div>
    </section>
  );
}
