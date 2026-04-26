import { motion } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";
import logo from "../../assets/1mw-logo.svg";

const navLinks = ["About", "Services", "Work", "Process"];

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
              We work with brands that are serious about growth.
            </p>
          </div>
          <a
            href="#contact"
            className="flex-shrink-0 font-mono text-fluid-xs bg-accent text-bg px-6 py-3 tracking-widest uppercase hover:bg-off transition-colors duration-300"
          >
            Get in touch &rarr;
          </a>
        </motion.div>

        {/* Brand block */}
        <div className="mb-16">
          <img src={logo} alt="1MW" className="h-6 w-auto mb-4" />
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-3">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="font-mono text-fluid-xs text-light hover:text-off transition-colors duration-200 tracking-wide"
              >
                {link}
              </a>
            ))}
          </nav>
          <a
            href="mailto:hello@1mw.com"
            className="font-mono text-fluid-xs text-muted hover:text-off transition-colors duration-200"
          >
            hello@1mw.com
          </a>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-fluid-xs text-muted">
            &copy; 2025–2026 1MW Marketing. All rights reserved.
          </p>
          <p className="font-mono text-fluid-xs text-muted">
            Crafted with obsession. Deployed with precision.
          </p>
        </div>
      </div>
    </footer>
  );
}
