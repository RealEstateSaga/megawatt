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
      "There is no mystery in what people want. The challenge is delivering it in a way that's sharper, smarter, and more compelling than anything they've seen before. That's what 1MW is built to do.",
  },

  pillars: [
    {
      id: "expertise",
      title: "Expertise",
      body:
        "We partner with the best in the industry to ensure our clients are at the cutting edge of now and next.",
    },
    {
      id: "strategy",
      title: "Strategy",
      body:
        "Every move is mapped to a clear objective, with the right channels, messaging, and timing to back it up. Strategy isn't a deliverable here, it's how we operate.",
    },
    {
      id: "audience",
      title: "Audience",
      body:
        "Uncovering the who, what, and where with real-world audience models, compiling segmentations and target profiles, rooted in behaviors and context.",
    },
    {
      id: "creative",
      title: "Creative",
      body:
        "We build ideas that break through, with powerful impact. Our work doesn't just look awesome or work great, it changes what's next. We combine insight, storytelling, and design to shape your vision and show up powerfully, wherever that may be.",
    },
    {
      id: "campaigns",
      title: "Campaigns",
      body:
        "From insight to launch, we build the strategic foundation, opportunities, truths, and insights to inform and give creative its edge, giving the people what they want.",
    },
    {
      id: "omnichannel",
      title: "Omnichannel",
      body:
        "Big ideas, everywhere they need to be. Our campaignable creative platforms stretch across brand, retail, social, and digital, with a clear story and strong spine.",
    },
    {
      id: "production",
      title: "Production",
      body:
        "Fast, nimble, and on point, we handle high-volume, quick-turn creative with consistency and craft, delivering flawlessly at speed without cutting corners. What usually takes a week is done in a day.",
    },
    {
      id: "reach",
      title: "Reach",
      body:
        "Connecting people with what matters, our data and insight-driven social strategies are designed for scrolls, shares, saves, and success across the ever-shifting social landscape.",
    },
    {
      id: "network",
      title: "Network",
      body:
        "A value-add we bring to any engagement is our private network. Should your vision demand targeted reach, we can connect you with the right people to tell your story in the right way, with relevance and results.",
    },
    {
      id: "collaborations",
      title: "Collaborations",
      body:
        "We build credibility and conversations at the same time, from press hits to thought leadership. We pair our clients with the right partners, from creators to companies, to amplify reach and bring values to life.",
    },
    {
      id: "direct",
      title: "Direct",
      body:
        "Deep roots in this industry give us something rare, direct access, and everything we do is built to show results.",
    },
    {
      id: "data",
      title: "Data",
      body:
        "Our proprietary data sharing platform includes more than 75 million persona-backed contacts to ensure your message resonates with your target audience, while uncovering growth and ROI opportunities.",
    },
    {
      id: "tracking",
      title: "Tracking",
      body:
        "Focus on what matters by way of campaign dashboards and data storytelling to turn metrics into momentum and make your program, website, and campaigns reach around the corner or around the globe.",
    },
    {
      id: "connect",
      title: "Connect",
      body:
        "We build relationships through CRM and email campaigns, using grounded segmentation and personalization to keep the conversation relevant.",
    },
    {
      id: "optimization",
      title: "Optimization",
      body:
        "We assess your current marketing infrastructure, channels, tools, and competitive position promptly. Before recommending anything, it's quite possible everything is operating perfectly, other than your coffee.",
    },
    {
      id: "websites",
      title: "Websites",
      body:
        "Digital designed for a human experience. We create digital experiences, websites, mobile apps, and ecommerce, to drive connection throughout the entire online journey.",
    },
    {
      id: "infrastructure",
      title: "Infrastructure",
      body:
        "Full transition to scalable cloud environments, with integration of Google Workspace, domain name acquisition, configuration, and unified storage built for security and operational clarity.",
    },
    {
      id: "one-million-watts",
      title: "One Million Watts",
      body:
        "1MW is a universal measure of power, and the firm carries that same weight. 1MW.com is a highly desirable three-character .com, rare by nature, deliberate by design, that's where it starts. Founded by Mike Wilen, we explore any territory in pursuit of a stronger idea, taking unconventional approaches and making big, bold investments in unexpected places.",
    },
  ] as Pillar[],

  conversion: {
    title: "Let's Connect",
    body: "One click to map your next move.",
    email: "hello@1mw.com",
  },
} as const;
