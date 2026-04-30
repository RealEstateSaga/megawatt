import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE, DUR } from "../../engine/motion";
import logo from "../../assets/1mw-logo.svg";

const links: { label: string; href: string }[] = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [onDark, setOnDark] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Detect whether nav sits over a dark editorial section to invert color.
  useEffect(() => {
    const detect = () => {
      const probeY = 32; // nav midline
      const probeX = window.innerWidth / 2;
      const els = document.elementsFromPoint(probeX, probeY);
      const section = els.find((el) =>
        el instanceof HTMLElement && el.dataset.env
      ) as HTMLElement | undefined;
      setOnDark(section?.dataset.env === "dark");
    };
    detect();
    window.addEventListener("scroll", detect, { passive: true });
    window.addEventListener("resize", detect);
    return () => {
      window.removeEventListener("scroll", detect);
      window.removeEventListener("resize", detect);
    };
  }, []);

  const fg = onDark ? "text-white" : "text-black";
  const chromeBg = scrolled
    ? onDark
      ? "bg-black/70 backdrop-blur-xl border-b border-white/10"
      : "bg-white/80 backdrop-blur-xl border-b border-black/10"
    : "";

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-[500] px-8 md:px-16 h-20 flex items-center justify-between transition-colors duration-500 ${chromeBg}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: DUR.slow, ease: EASE.cinematic, delay: 0.2 }}
      >
        {/* Left: brand */}
        <a
          href="#"
          aria-label="1MW home"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex items-center transition-colors duration-300 ${fg}`}
        >
          <img
            src={logo}
            alt="1MW"
            className="h-6 w-auto"
            style={{ filter: onDark ? "invert(1)" : "none" }}
          />
        </a>

        {/* Right-anchored navigation — desktop */}
        <div className={`hidden md:flex items-center gap-12 ${fg}`}>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] tracking-[0.2em] uppercase font-medium hover:opacity-60 transition-opacity duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile menu toggle */}
        <button
          className={`md:hidden flex flex-col gap-1.5 p-2 ${fg}`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <motion.span
            className="block h-px w-7 bg-current"
            animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
          />
          <motion.span
            className="block h-px w-7 bg-current"
            animate={open ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.span
            className="block h-px w-7 bg-current"
            animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
          />
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[400] bg-white flex flex-col items-start justify-center gap-8 px-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.normal }}
          >
            {links.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="font-display text-5xl text-black tracking-tight"
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
