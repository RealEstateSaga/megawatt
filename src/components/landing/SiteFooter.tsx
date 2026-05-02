import logo from "@/assets/1mw-logo.svg";

const navigation = {
  nav: [
    { name: "Home", href: "#hero" },
    { name: "Contact", href: "#contact" },
  ],
  network: [
    { name: "MikeWilen.com", href: "https://MikeWilen.com" },
    { name: "MinnesotaTeam.com", href: "https://MinnesotaTeam.com" },
    { name: "NONMLS.com", href: "https://NONMLS.com" },
    { name: "RealEstateHedge.com", href: "https://RealEstateHedge.com" },
  ],
  connect: [
    { name: "hello@1mw.com", href: "mailto:hello@1mw.com" },
  ],
  oneMW: [
    { name: "Marketing & Advertising", href: "#hero" },
  ],
};

const handleAnchor = (href: string) => (e: React.MouseEvent) => {
  if (!href.startsWith("#")) return;
  e.preventDefault();
  if (href === "#hero") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (href === "#contact") {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  } else {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  }
};

function Column({ heading, items }: { heading: string; items: { name: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-sm/6 font-semibold text-gray-900">{heading}</h3>
      <ul role="list" className="mt-6 space-y-4">
        {items.map((item) => {
          const isExternal = /^https?:/.test(item.href);
          const isAnchor = item.href.startsWith("#");
          return (
            <li key={item.name}>
              <a
                href={item.href}
                onClick={isAnchor ? handleAnchor(item.href) : undefined}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-sm/6 text-gray-600 hover:text-gray-900"
              >
                {item.name}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <img alt="1MW Marketing" src={logo} className="h-9" />
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <Column heading="Navigation" items={navigation.nav} />
              <div className="mt-10 md:mt-0">
                <Column heading="Network" items={navigation.network} />
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <Column heading="Connect" items={navigation.connect} />
              <div className="mt-10 md:mt-0">
                <Column heading="1MW" items={navigation.oneMW} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
