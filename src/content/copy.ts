/**
 * Content Engine — single source of truth for all site messaging.
 */

export const copy = {
  // ─── STATE 1: ORIENTATION ───────────────────────────────────────────────────
  hero: {
    system: "Marketing & Advertising",
    headline: "1MW",
    subtext:
      "1MW unifies your consumer-facing presence across data, creativity, media, technology, and AI — built for measurable growth and long-term scalability.",
    subtextFast:
      "1MW unifies your consumer-facing presence across data, creativity, media, technology, and AI — built for measurable growth and long-term scalability.",
  },

  // ─── STATE 2: REFRAMING ─────────────────────────────────────────────────────
  reframing: {
    label: "What We Build",
    statement: "Not a vendor.",
    clarification: "A marketing infrastructure.",
    supporting:
      "1MW combines data, creativity, media, technology, and artificial intelligence to deliver high-impact marketing systems that shape how brands engage audiences across every channel. Not isolated services — a fully integrated marketing infrastructure designed for measurable growth and long-term scalability.",
    cta: "See what we build",
  },

  // ─── STATE 3: MECHANISM ─────────────────────────────────────────────────────
  mechanism: {
    label: "What We Do",
    headline: "Six Systems. One Engine.",
    pillars: [
      {
        id: "full-spectrum",
        number: "01",
        title: "Full-Spectrum Marketing",
        definition:
          "Aligns marketing, creative, and media execution into a single coordinated system built around your business objectives.",
        outcome: "Strategy, execution, and impact as one continuous system.",
        tags: ["Strategy", "Execution", "Impact"],
        cta: "Build the system",
      },
      {
        id: "cloud",
        number: "02",
        title: "Cloud & Digital Infrastructure",
        definition:
          "Full transition to scalable cloud environments. Microsoft 365, Google Workspace, domain configuration, and unified storage built for security and operational clarity.",
        outcome: "Fast, stable, and fully integrated from day one.",
        tags: ["Cloud", "Integration", "Stability"],
        cta: "Build your infrastructure",
      },
      {
        id: "web",
        number: "03",
        title: "Website Design & Digital Experience",
        definition:
          "Custom-built websites engineered for speed, usability, and conversion. Every build is a core business asset — strategically effective, not just visually strong.",
        outcome: "Designed for clarity. Built to convert.",
        tags: ["Design", "Websites", "Redesign"],
        cta: "Start your build",
      },
      {
        id: "performance",
        number: "04",
        title: "Performance Marketing & SEO",
        definition:
          "Data-led campaigns across search, paid media, and conversion strategy. Every initiative tracked and aligned with revenue outcomes — not vanity metrics.",
        outcome: "Qualified traffic. Measurable growth.",
        tags: ["Search", "Paid", "Conversion"],
        cta: "Launch a campaign",
      },
      {
        id: "crm",
        number: "05",
        title: "CRM, Automation & Email",
        definition:
          "Intelligent customer communication systems that increase lifetime value. CRM platforms, automation workflows, and personalized email strategies that keep brands connected at every stage.",
        outcome: "Convert. Retain. Re-engage.",
        tags: ["Automation", "Email", "Intelligence"],
        cta: "Build your CRM system",
      },
      {
        id: "integration",
        number: "06",
        title: "Integration & Ecosystems",
        definition:
          "CRM, analytics, advertising, and automation tools connected into a unified operational ecosystem. No fragmentation. No blind spots. Faster decisions.",
        outcome: "All your systems. One source of truth.",
        tags: ["Integration", "Data", "Efficiency"],
        cta: "Connect your stack",
      },
    ],
  },

  // ─── STATE 4: VALIDATION ────────────────────────────────────────────────────
  validation: {
    label: "Built for Performance",
    statements: [
      "Built for brands that compete across every channel.",
      "Designed to unify data, creativity, and media into one system.",
      "Engineered for measurable growth — not vanity metrics.",
      "Deployed across search, paid, email, web, and cloud infrastructure.",
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
    label: "Let's Build It.",
    primary:
      "One conversation is all it takes to map your full marketing infrastructure.",
    availability: "Selective by design — accepting new partners now.",
    actions: [
      {
        label: "Start a Project",
        href: "mailto:hello@1mw.com",
        primary: true,
      },
      {
        label: "View Services",
        href: "#services",
        primary: false,
      },
      {
        label: "Request a Scope Breakdown",
        href: "mailto:hello@1mw.com",
        primary: false,
      },
    ],
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
    tagline: "Full-spectrum marketing & digital engine.",
    sub: "Strategy. Creative. Technology. All in.",
    cta: "Have a project in mind?",
    ctaSub: "We work with brands that are serious about growth.",
  },
} as const;
