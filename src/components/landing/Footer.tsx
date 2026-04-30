import { motion } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";
import logo from "../../assets/1mw-logo.svg";

const navLinks: { label: string; href: string }[] = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <footer
      data-env="dark"
      className="env-dark px-8 md:px-16 pt-24 pb-12 border-t border-white/10"
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Editorial CTA strip */}
        <motion.div
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10 pb-16 mb-16 border-b border-white/15"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, ease: EASE.cinematic }}
        >
          <div className="max-w-2xl">
            <p className="font-display font-semibold text-fluid-2xl text-white leading-[1.0] tracking-[-0.025em] mb-4">
              Tell us what<br />you're building.
            </p>
            <p className="text-[13px] tracking-[0.2em] uppercase text-white/55">
              We'll map the system behind it.
            </p>
          </div>
          <a
            href="mailto:hello@1mw.com"
            className="flex-shrink-0 inline-flex items-center gap-3 bg-white text-black px-8 py-5 text-[12px] tracking-[0.25em] uppercase font-semibold hover:bg-white/85 transition-colors duration-300"
          >
            Get in touch &rarr;
          </a>
        </motion.div>

        {/* Brand + nav */}
        <div className="grid md:grid-cols-12 gap-12 mb-20">
          <div className="md:col-span-5">
            <img
              src={logo}
              alt="1MW"
              className="h-7 w-auto mb-6"
              style={{ filter: "invert(1)" }}
            />
            <p className="text-[13px] text-white/60 leading-[1.6] max-w-sm">
              A marketing and advertising firm spanning data, creativity, media, technology, and AI.
            </p>
          </div>

          <nav className="md:col-span-4 md:col-start-7 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] tracking-[0.2em] uppercase text-white/80 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="md:col-span-3 md:col-start-11 flex flex-col gap-3 items-start">
            <a
              href="mailto:hello@1mw.com"
              className="text-[13px] tracking-[0.1em] text-white/80 hover:text-white transition-colors duration-200"
            >
              hello@1mw.com
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-[11px] tracking-[0.25em] uppercase text-white/45">
            &copy; 2026 1MW
          </p>
          <p className="text-[11px] tracking-[0.25em] uppercase text-white/45">
            Marketing &amp; Advertising
          </p>
        </div>
      </div>
    </footer>
  );
}
