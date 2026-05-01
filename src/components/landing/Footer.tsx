import wordmark from "../../assets/1mw-wordmark.svg";

const navigation = {
  explore: [
    { name: "ABOUT", href: "#hero" },
    { name: "CONTACT", href: "#contact" },
  ],
  contact: [
    { name: "HELLO@1MW.COM", href: "mailto:hello@1mw.com", external: false },
    { name: "MIKEWILEN.COM", href: "https://mikewilen.com", external: true },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <img
            alt="1MW"
            src={wordmark}
            className="h-9 w-auto"
          />
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm/6 font-semibold text-foreground uppercase tracking-wide">
                  Explore
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.explore.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm/6 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm/6 font-semibold text-foreground uppercase tracking-wide">
                  Contact
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.contact.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm/6 text-muted-foreground hover:text-foreground transition-colors font-mono"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm/6 font-semibold text-foreground uppercase tracking-wide">
                  1MW
                </h3>
                <p className="mt-6 text-sm/6 text-muted-foreground">
                  Marketing designed for growth, and built for performance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <p className="text-xs/6 text-muted-foreground font-mono">
            &copy; 2026 1MW
          </p>
        </div>
      </div>
    </footer>
  );
}
