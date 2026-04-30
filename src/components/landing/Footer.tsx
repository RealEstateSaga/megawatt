import { motion } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";
import logo from "../../assets/1mw-logo.svg";

const navLinks: { label: string; href: string }[] = [
  { label: "1MW", href: "#" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

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
              Tell us what you're building.
            </p>
            <p className="font-mono text-fluid-xs text-mid">
              We'll map the system behind it.
            </p>
          </div>
          <a
            href="mailto:hello@1mw.com"
            className="flex-shrink-0 text-fluid-xs bg-black text-white px-6 py-3 tracking-wide uppercase font-semibold hover:bg-mid transition-colors duration-300"
          >
            Get in touch &rarr;
          </a>
        </motion.div>

        {/* Brand block */}
        <div className="mb-20">
          <div
            className="font-display font-bold text-off leading-none mb-8 tracking-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 4rem)" }}
          >
            1MW
          </div>
          <nav className="flex flex-wrap items-center gap-x-10 gap-y-3 mb-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[#111111] hover:text-black transition-colors duration-200 tracking-wide font-sans font-medium uppercase"
                style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)" }}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="mailto:hello@1mw.com"
            className="font-mono text-fluid-xs text-[#111111] hover:text-black transition-colors duration-200 font-medium"
          >
            hello@1mw.com
          </a>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-fluid-xs text-mid">
            &copy; 2026 1MW. All rights reserved.
          </p>
          <p className="font-mono text-fluid-xs text-mid">
            1MW is a marketing and advertising engine built to create momentum, clarity, and measurable growth.
          </p>
        </div>
      </div>
    </footer>
  );
}
