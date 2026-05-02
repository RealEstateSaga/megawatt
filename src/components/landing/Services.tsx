import { copy, type Pillar } from "../../content/copy";
import "./stack.css";

type PanelData = {
  id: string;
  title: string;
  body: React.ReactNode;
};

const toneClasses = ["panel-white", "panel-black", "panel-bone", "panel-red"];

export default function StackScroll() {
  const panels: PanelData[] = [
    {
      id: "hero",
      title: copy.hero.h1,
      body: renderHeroBody(),
    },
    ...copy.pillars.map((pillar: Pillar) => ({
      id: pillar.id,
      title: pillar.title,
      body: pillar.body,
    })),
    {
      id: "contact",
      title: copy.conversion.title,
      body: (
        <>
          {copy.conversion.body}{" "}
          <a className="contact-link" href={`mailto:${copy.conversion.email}`}>
            {copy.conversion.email}
          </a>
        </>
      ),
    },
  ];

  return (
    <main className="stack-main">
      {panels.map((panel, index) => (
        <Panel
          key={panel.id}
          id={panel.id}
          title={panel.title}
          body={panel.body}
          tone={toneClasses[index % toneClasses.length]}
          zIndex={index + 1}
          isLast={index === panels.length - 1}
        />
      ))}
    </main>
  );
}

function Panel({
  id,
  title,
  body,
  tone,
  zIndex,
  isLast,
}: {
  id: string;
  title: string;
  body: React.ReactNode;
  tone: string;
  zIndex: number;
  isLast: boolean;
}) {
  return (
    <>
      <section id={id} className={`panel ${tone}`} style={{ zIndex }}>
        <div className="panel-content">
          <h2 className="panel-title">{title}</h2>
          <p className="panel-body">{body}</p>
        </div>
      </section>
      {!isLast && <div className="spacer" aria-hidden="true" />}
    </>
  );
}

function renderHeroBody(): React.ReactNode {
  const parts = copy.hero.body.split("1MW");
  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 && <span className="brand-mark">1MW</span>}
    </span>
  ));
}
