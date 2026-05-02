import StackScroll from "./components/landing/Services";
import logo from "@/assets/1mw-logo.svg";

export default function LandingSite() {
  const navLinks = [
    { label: "Services", href: "#partners" },
    { label: "Work", href: "#campaigns" },
    { label: "Process", href: "#systems" },
    { label: "About", href: "#about" },
  ];

  return (
    <div className="landing-stack-page">
      <header className="site-header" aria-label="Primary">
        <a className="site-logo-link" href="#hero" aria-label="1MW Marketing home">
          <img src={logo} alt="1MW Marketing" className="site-logo" />
        </a>

        <nav className="site-nav">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="site-nav-link">
              {link.label}
            </a>
          ))}
          <a href="mailto:hello@1mw.com" className="site-nav-link">
            HELLO@1MW.COM
          </a>
        </nav>
      </header>

      <StackScroll />

      <footer className="site-footer">
        <div className="site-footer-inner">
          <img src={logo} alt="1MW Marketing" className="site-footer-logo" />
          <nav className="site-footer-nav" aria-label="Footer">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="site-footer-link">
                {link.label}
              </a>
            ))}
          </nav>
          <a href="mailto:hello@1mw.com" className="site-footer-email">
            hello@1mw.com
          </a>
          <div className="site-footer-meta">
            <p>© 2026 1MW</p>
            <p>Marketing designed for growth, and built for performance.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
