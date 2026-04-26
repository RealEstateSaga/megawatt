import { motion } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";

const footerLinks = {
  Studio: ["About", "Services", "Work", "Process"],
  Connect: ["Twitter/X", "LinkedIn", "Dribbble", "GitHub"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 md:px-12 pt-20 pb-12 bg-bg">
      <div className="max-w-7xl mx-auto">
        {/* Mini CTA — final contextual conversion point */}
        <motion.div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-16 mb-16 border-b border-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, ease: EASE.cinematic }}
        >
          <div>
            <p className="font-display text-fluid-xl text-off mb-1">
              Have a project in mind?
            </p>
            <p className="font-mono text-fluid-xs text-muted">
              We're selective. That's the point.
            </p>
          </div>
          <a
            href="#contact"
            className="flex-shrink-0 font-mono text-fluid-xs bg-accent text-bg px-6 py-3 tracking-widest uppercase hover:bg-off transition-colors duration-300"
          >
            Get in touch &rarr;
          </a>
        </motion.div>

        {/* Links grid */}
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <p className="font-display text-2xl text-off font-bold mb-4">1MW</p>
            <p className="font-mono text-fluid-xs text-muted leading-relaxed">
              Premium creative studio.
              <br />
              Building digital futures.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="font-mono text-fluid-xs text-accent tracking-widest uppercase mb-4">
                {category}
              </p>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-mono text-fluid-xs text-muted hover:text-off transition-colors duration-200 tracking-wide"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-fluid-xs text-muted">
            &copy; 2025–2026 1MW Studio. All rights reserved.
          </p>
          <p className="font-mono text-fluid-xs text-muted">
            Crafted with obsession. Deployed with precision.
          </p>
        </div>
      </div>
    </footer>
  );
}
