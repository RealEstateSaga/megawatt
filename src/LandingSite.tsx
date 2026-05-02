import { useEffect, useState } from "react";
import StackScroll from "./components/landing/Services";
import SiteFooter from "./components/landing/SiteFooter";
import logo from "@/assets/1mw-logo.svg";

export default function LandingSite() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
