import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { copy, type Pillar } from "../../content/copy";
import "./stack.css";

type PanelData = {
  id: string;
  title: string;
  body: React.ReactNode;
};

export default function StackScroll() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          zIndex={index + 1}
          isLast={index === panels.length - 1}
          showScrollHint={index === 0}
        />
      ))}

      {showTop && (
        <button
          type="button"
          className="back-to-top"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ChevronUp size={28} strokeWidth={2.5} />
        </button>
      )}
    </main>
  );
}

function Panel({
  id,
  title,
  body,
  zIndex,
  isLast,
  showScrollHint,
}: {
  id: string;
  title: string;
  body: React.ReactNode;
  zIndex: number;
  isLast: boolean;
  showScrollHint: boolean;
}) {
  return (
    <>
      <section id={id} className="panel panel-white" style={{ zIndex }}>
        {showScrollHint && (
          <div className="scroll-hint" aria-hidden="true">
            <ChevronDown size={32} strokeWidth={2.5} />
          </div>
        )}
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
