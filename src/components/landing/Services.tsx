import { copy, type Pillar } from "../../content/copy";

const panelTones = [
  "landing-panel-tone-1",
  "landing-panel-tone-2",
  "landing-panel-tone-3",
  "landing-panel-tone-4",
] as const;

export default function Services() {
  const panels = [
    {
      id: "hero",
      title: copy.hero.h1,
      body: renderHeroBody(),
    },
    ...copy.pillars.map((pillar: Pillar) => ({
      id: pillar.id,
      title: pillar.title,
      body: <>{pillar.body}</> as React.ReactNode,
    })),
    {
      id: "contact",
      title: copy.conversion.title,
      body: (
        <>
          {copy.conversion.body}{" "}
          <a
            href={`mailto:${copy.conversion.email}`}
            className="underline transition-opacity hover:opacity-70"
          >
            {copy.conversion.email}
          </a>
        </>
      ),
    },
  ];

  return (
    <div id="services" className="relative">
      {panels.map((panel, index) => (
        <Panel
          key={panel.id}
          id={panel.id}
          title={panel.title}
          body={panel.body}
          index={index}
          isLast={index === panels.length - 1}
        />
      ))}
    </div>
  );
}

function renderHeroBody(): React.ReactNode {
  const parts = copy.hero.body.split("1MW");

  return parts.map((part, index) => (
    <span key={`${part}-${index}`}>
      {part}
      {index < parts.length - 1 && <span className="landing-brand-text">1MW</span>}
    </span>
  ));
}

function Panel({
  id,
  title,
  body,
  index,
  isLast,
}: {
  id: string;
  title: string;
  body: React.ReactNode;
  index: number;
  isLast: boolean;
}) {
  const toneClass = panelTones[index % panelTones.length];

  return (
    <article className={isLast ? "relative h-[120vh]" : "relative h-[185vh]"}>
      <div
        id={id}
        className="sticky top-0 h-screen overflow-hidden"
        style={{ zIndex: index + 1 }}
      >
        <section className={`relative flex h-screen w-full overflow-hidden ${toneClass}`}>
          <div className="flex h-full w-full items-start px-8 pb-10 pt-24 md:px-16 md:pt-28 lg:px-24 lg:pt-32">
            <div className="flex w-full flex-col items-start gap-4 text-left md:gap-6">
              <h2
                className="font-display text-left font-bold leading-[0.95] tracking-[-0.03em]"
                style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}
              >
                {title}
              </h2>

              <p
                className="max-w-7xl text-left font-montserrat font-normal leading-[1.1] tracking-[0em]"
                style={{ fontSize: "clamp(1.4rem, 3vw, 2.4rem)" }}
              >
                {body}
              </p>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
