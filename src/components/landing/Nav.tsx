import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSite, type NarrativeState } from "../../context/SiteContext";
import { EASE, DUR } from "../../engine/motion";
import logo from "../../assets/1mw-wordmark.svg";

const links: { label: string; href: string }[] = [
  { label: "1MW", href: "#" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

// Five dots map to five narrative states
const NARRATIVE_ORDER: NarrativeState[] = [
  "intro",
  "framing",
  "mechanism",
  "validation",
  "conversion",
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { narrativeState } = useSite();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-[500] px-6 md:px-12 h-16 flex items-center justify-between transition-all duration-500 ${
          scrolled ? "bg-bg/80 backdrop-blur-xl border-b border-border" : ""
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.2 }}
      >
        {/* Logo */}
        <a href="#" aria-label="1MW home" className="flex items-center">
          <img src={logo} alt="1MW" className="h-6 w-auto" />
        </a>

        {/* Desktop links — right aligned, generous spacing */}
        <div className="hidden md:flex items-center gap-12 lg:gap-14 ml-auto mr-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[#111111] hover:text-black transition-colors duration-200 tracking-wide uppercase font-sans font-medium"
              style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side: narrative indicator + CTA */}
        <div className="hidden md:flex items-center gap-6">
          {/* Narrative state dots — subtle progress signal */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {NARRATIVE_ORDER.map((state) => (
              <motion.div
                key={state}
                className="rounded-full"
                animate={{
                  width: state === narrativeState ? 16 : 4,
                  height: 4,
                  backgroundColor:
                    state === narrativeState ? "#000000" : "#BFBFBF",
                }}
                transition={{ duration: 0.4, ease: EASE.cinematic }}
              />
            ))}
          </div>

          <a
            href="#contact"
            className="text-fluid-xs bg-black text-white px-5 py-2 tracking-wide uppercase font-semibold hover:bg-mid transition-colors duration-300"
          >
            Start a Project
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <motion.span
            className="block h-px w-6 bg-off"
            animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
          />
          <motion.span
            className="block h-px w-6 bg-off"
            animate={open ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.span
            className="block h-px w-6 bg-off"
            animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
          />
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[400] bg-bg flex flex-col items-center justify-center gap-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: DUR.normal }}
          >
            {links.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="font-display text-4xl text-off"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, ease: EASE.cinematic }}
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
