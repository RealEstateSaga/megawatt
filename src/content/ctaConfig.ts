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
    href: "mailto:hello@1mw.com",
    style: "filled",
    intensity: "high",
    primary: true,
  },
  conversion: {
    label: "Start now",
    href: "mailto:hello@1mw.com",
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
      "border border-black/30 text-light hover:text-black hover:border-black transition-colors duration-300",
    outline:
      "border border-black text-black hover:bg-[#F2F2F2] transition-colors duration-300",
    filled:
      "bg-black text-white hover:bg-[#1a1a1a] transition-colors duration-300",
    direct:
      "bg-black text-white hover:bg-[#1a1a1a] transition-colors duration-300 font-semibold",
  };
  return `${map[style]} text-fluid-xs tracking-wide uppercase px-6 py-3 ${base}`.trim();
}
