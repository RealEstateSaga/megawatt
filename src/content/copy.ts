/**
 * Content Engine — single source of truth for all site messaging.
 */

export type Pillar = {
  id: string;
  title: string; // h2
  body: string;  // single combined paragraph
};

export const copy = {
  hero: {
    h1: "Marketing & Advertising",
    // "1MW" is highlighted bright red in the component
    body:
      "There is no mystery in what people want. The challenge is delivering it sharper, smarter, and more compellingly than ever before. That's what 1MW is built to do.",
  },

  pillars: [
    {
      id: "partners",
      title: "Partners",
      body:
        "We partner with the best in the industry to ensure our clients are at the cutting edge of now and next.",
    },
    {
      id: "strategy",
      title: "Strategy",
      body:
        "Every move is mapped to a clear objective. Strategy isn't a deliverable here—it's how we operate, building the foundation from insight to launch.",
    },
    {
      id: "audience",
      title: "Audience",
      body:
        "Uncovering the who, what, and where with real-world audience models. We compile segmentations and target profiles rooted in behaviors and context.",
    },
    {
      id: "creative",
      title: "Creative",
      body:
        "We build ideas that break through. Our work combines insight, storytelling, and design to shape your vision and show up powerfully, wherever that may be.",
    },
    {
      id: "campaigns",
      title: "Campaigns",
      body:
        "From insight to launch, we build the strategic foundation and truths that give creative its edge. We give the people what they want.",
    },
    {
      id: "omnichannel",
      title: "Omnichannel",
      body:
        "Big ideas, everywhere they need to be. Our platforms stretch across brand, retail, social, and digital with a clear story and a strong spine.",
    },
    {
      id: "production",
      title: "Production",
      body:
        "What takes others weeks, we deliver in moments. Fast, sharp, and flawlessly executed creative content, ready right when you need it without cutting corners.",
    },
    {
      id: "reach",
      title: "Reach",
      body:
        "Connecting people with what matters. Our data-driven social strategies are designed for scrolls, shares, and success across the ever-shifting social landscape.",
    },
    {
      id: "network",
      title: "Network",
      body:
        "Our private network is a value-add for any engagement. If your vision demands targeted reach, we connect you with the right people to tell your story.",
    },
    {
      id: "collabs",
      title: "Collabs",
      body:
        "We build credibility and conversations simultaneously. We pair clients with the right partners, from creators to companies, to amplify reach.",
    },
    {
      id: "direct",
      title: "Direct",
      body:
        "Deep roots in this industry give us something rare: direct access. Everything we do is built to show immediate, tangible results.",
    },
    {
      id: "data",
      title: "Data",
      body:
        "Our proprietary data platform includes more than 75 million persona-backed contacts to ensure your message resonates while uncovering growth opportunities.",
    },
    {
      id: "tracking",
      title: "Tracking",
      body:
        "By way of campaign dashboards through Google Analytics and proprietary in-house software, we turn metrics into momentum, offering invaluable insight into what works.",
    },
    {
      id: "connect",
      title: "Connect",
      body:
        "We build relationships through CRM and email campaigns, using grounded segmentation and personalization to keep the conversation relevant.",
    },
    {
      id: "audit",
      title: "Audit",
      body:
        "We assess your current infrastructure, channels, and tools promptly. It is quite possible everything is operating perfectly, other than your coffee.",
    },
    {
      id: "websites",
      title: "Websites",
      body:
        "Digital designed for a human experience. We create websites, mobile apps, and ecommerce to drive connection throughout the entire online journey.",
    },
    {
      id: "systems",
      title: "Systems",
      body:
        "Full transition to scalable cloud environments, domain name acquisition, and unified storage built for security and operational clarity.",
    },
    {
      id: "about",
      title: "About",
      body:
        "1MW is a universal measure of power. Founded by Mike Wilen, we move fast, take unconventional approaches, and make bold investments in unexpected places.",
    },
  ] as Pillar[],

  conversion: {
    title: "Contact",
    body: "One click to map your next move.",
    email: "hello@1mw.com",
  },
} as const;
