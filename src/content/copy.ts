/**
 * Content Engine — single source of truth for all site messaging.
 *
 * Structured as narrative state blocks so any section can pull its copy
 * without coupling messaging to layout decisions. AI tools (Figma, etc.)
 * can modify this file without touching component logic.
 */

export const copy = {
  // ─── STATE 1: ORIENTATION ───────────────────────────────────────────────────
  hero: {
    system: "Marketing Operating System",
    headline: "1MW",
    subtext:
      "Marketing and advertising operating system for modern attention markets.",
    // Scroll intensity variants: slow = clarity, fast = outcome
    subtextFast:
      "Attention is the asset. We engineer the systems that capture it.",
  },

  // ─── STATE 2: REFRAMING ─────────────────────────────────────────────────────
  reframing: {
    label: "The Shift",
    statement: "Marketing is no longer messaging.",
    clarification: "It is engineered attention systems.",
    supporting:
      "The brands dominating attention today are not louder. They are more precise. 1MW builds the operating systems that make precision scalable, measurable, and compounding.",
    cta: "Understand the system",
  },

  // ─── STATE 3: MECHANISM ─────────────────────────────────────────────────────
  mechanism: {
    label: "How It Works",
    headline: "The System",
    pillars: [
      {
        id: "strategy",
        number: "01",
        title: "Strategy",
        definition: "Defines positioning systems that compress decision time.",
        outcome: "Clarity that converts faster than content.",
        tags: ["Positioning", "Architecture", "Brief"],
        cta: "Build your strategy",
      },
      {
        id: "creative",
        number: "02",
        title: "Creative Systems",
        definition:
          "Builds narrative environments that increase attention retention.",
        outcome: "Environments that hold attention longer.",
        tags: ["Identity", "Motion", "Systems"],
        cta: "See creative work",
      },
      {
        id: "media",
        number: "03",
        title: "Media + AI",
        definition:
          "Optimizes distribution and creative performance in real time.",
        outcome: "Performance that compounds over time.",
        tags: ["Distribution", "AI", "Analytics"],
        cta: "Explore media systems",
      },
    ],
  },

  // ─── STATE 4: VALIDATION ────────────────────────────────────────────────────
  validation: {
    label: "Built for Performance",
    statements: [
      "Built for high-velocity acquisition systems.",
      "Designed for measurable attention growth.",
      "Engineered for modern media environments.",
      "Deployed across channels that matter.",
    ],
    metrics: [
      { value: "47+", label: "Systems Deployed" },
      { value: "12", label: "Industry Awards" },
      { value: "98%", label: "Client Retention" },
      { value: "5×", label: "Avg. Performance Lift" },
    ],
    testimonials: [
      {
        quote:
          "1MW didn't just redesign our website — they transformed how the entire industry perceives us. Three competitors have tried to copy our site in the months since launch.",
        author: "Sarah Chen",
        title: "CEO, Nexus Capital",
        logo: "NC",
        metric: "+280% qualified leads",
      },
      {
        quote:
          "The team's ability to translate complex data into intuitive interfaces is genuinely rare. Our user activation rate increased 340% in 90 days.",
        author: "Marcus Webb",
        title: "CTO, Lumina Health",
        logo: "LH",
        metric: "+340% user activation",
      },
      {
        quote:
          "Every other agency was selling us a website. 1MW sold us a competitive advantage. The difference is visible in our revenue.",
        author: "Elena Vasquez",
        title: "CMO, Arc Architecture",
        logo: "AA",
        metric: "FWA Site of the Day",
      },
    ],
  },

  // ─── STATE 5: CONVERSION ────────────────────────────────────────────────────
  conversion: {
    label: "Ready When You Are",
    primary:
      "Work with 1MW to build marketing systems that scale attention and performance.",
    availability: "Accepting new projects — Q2 2026",
    actions: [
      {
        label: "Start a Project",
        href: "mailto:hello@1mw.studio",
        primary: true,
      },
      {
        label: "View Capabilities",
        href: "#services",
        primary: false,
      },
      {
        label: "Request a Breakdown",
        href: "mailto:hello@1mw.studio",
        primary: false,
      },
    ],
    // CTA label adapts by narrative depth
    depthLabels: {
      intro: "See how it works",
      framing: "Explore the system",
      mechanism: "Start a project",
      validation: "Request a breakdown",
      conversion: "Start now",
    },
  },

  // ─── FOOTER ─────────────────────────────────────────────────────────────────
  footer: {
    tagline: "Marketing operating system.",
    sub: "Built for attention. Measured by results.",
    cta: "Have a project in mind?",
    ctaSub: "We're selective. That's the point.",
  },
} as const;
