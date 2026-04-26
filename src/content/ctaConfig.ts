import type { NarrativeState } from "../context/SiteContext";

/**
 * CTA Configuration — intensity rules by narrative state.
 *
 * CTA intensity increases as scroll depth increases:
 *   intro/framing  → soft invitation (ghost-style, understated)
 *   mechanism      → neutral availability (outline)
 *   validation     → assertive (filled, more visible)
 *   conversion     → direct action (maximum contrast)
 *
 * "No interaction should ever break readability."
 */
export type CTAStyle = "ghost" | "outline" | "filled" | "direct";
export type CTAIntensity = "soft" | "mid" | "high" | "direct";

export interface CTADefinition {
  label: string;
  href: string;
  style: CTAStyle;
  intensity: CTAIntensity;
  /** Whether this CTA is primary (most prominent) */
  primary: boolean;
}

export const CTA_BY_STATE: Record<NarrativeState, CTADefinition> = {
  intro: {
    label: "See how it works",
    href: "#services",
    style: "ghost",
    intensity: "soft",
    primary: false,
  },
  framing: {
    label: "Explore the system",
    href: "#services",
    style: "outline",
    intensity: "mid",
    primary: false,
  },
  mechanism: {
    label: "Start a project",
    href: "#contact",
    style: "outline",
    intensity: "mid",
    primary: true,
  },
  validation: {
    label: "Request a breakdown",
    href: "mailto:hello@1mw.studio",
    style: "filled",
    intensity: "high",
    primary: true,
  },
  conversion: {
    label: "Start now",
    href: "mailto:hello@1mw.studio",
    style: "direct",
    intensity: "direct",
    primary: true,
  },
};

/**
 * Get Tailwind class string for a CTA style.
 * Direct actions use full gold fill; ghost CTAs are almost invisible.
 */
export function ctaClasses(style: CTAStyle, base = ""): string {
  const map: Record<CTAStyle, string> = {
    ghost:
      "border border-white/10 text-muted hover:text-light hover:border-white/20 transition-all duration-500",
    outline:
      "border border-border text-light hover:border-accent hover:text-accent transition-all duration-300",
    filled:
      "bg-accent/80 text-bg hover:bg-accent transition-colors duration-300",
    direct:
      "bg-accent text-bg hover:bg-off transition-colors duration-200 font-medium",
  };
  return `${map[style]} font-mono text-fluid-xs tracking-widest uppercase px-6 py-3 ${base}`.trim();
}
