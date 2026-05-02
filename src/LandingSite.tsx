import { useEffect, useMemo, useState } from "react";
import StackScroll from "./components/landing/Services";
import SiteFooter from "./components/landing/SiteFooter";
import { copy } from "./content/copy";
import logo from "@/assets/1mw-logo.svg";

export default function LandingSite() {
  const [scrolled, setScrolled] = useState(false);

  // Build id -> label map from the same source the panels render from.
  const sectionLabels = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {
      hero: "Home",
      contact: copy.conversion.title,
    };
    for (const p of copy.pillars) map[p.id] = p.title;
    return map;
  }, []);

  const sectionIds = useMemo(
    () => ["hero", ...copy.pillars.map((p) => p.id), "contact"],
    [],
  );

  const [activeId, setActiveId] = useState<string>("hero");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Detect the section that is most clearly dominant in the viewport.
  // Panels are sticky/full-height, so we pick the one whose top is closest
  // to (but not past) a stable line ~40% down the viewport.
  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    let raf = 0;
    const compute = () => {
      raf = 0;

      if (window.scrollY <= 8) {
        setActiveId((prev) => (prev === "hero" ? prev : "hero"));
        return;
      }

      const viewportLine = window.scrollY + window.innerHeight * 0.4;
      const nonHeroElements = elements.filter((element) => element.id !== "hero");

      let activeIdLocal = nonHeroElements[0]?.id ?? "hero";

      for (const element of nonHeroElements) {
        if (viewportLine >= element.offsetTop) {
          activeIdLocal = element.id;
          continue;
        }

        break;
      }

      setActiveId((prev) => (prev === activeIdLocal ? prev : activeIdLocal));
    };


    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sectionIds]);

  const activeLabel = sectionLabels[activeId] ?? "Home";

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="landing-stack-page">
      <header
        className={`site-header${scrolled ? " site-header--scrolled" : ""}`}
        aria-label="Primary"
      >
        <a className="site-logo-link" href="#hero" onClick={handleHome} aria-label="1MW Marketing home">
          <img src={logo} alt="1MW Marketing" className="site-logo" />
        </a>

        <div
          className="section-pill"
          role="status"
          aria-live="polite"
          aria-label={`Current section: ${activeLabel}`}
          key={activeId}
        >
          {activeLabel}
        </div>

        <nav className="site-nav">
          <a href="#hero" onClick={handleHome} className="site-nav-link">
            HOME
          </a>
          <a href="#contact" onClick={handleContact} className="site-nav-link">
            CONTACT
          </a>
          <a href="mailto:hello@1mw.com" className="site-nav-link">
            HELLO@1MW.COM
          </a>
        </nav>
      </header>

      <StackScroll />

      <SiteFooter />
    </div>
  );
}
