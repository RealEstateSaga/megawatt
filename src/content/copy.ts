/**
 * Content Engine — single source of truth for all site messaging.
 */

export type Pillar = {
  id: string;
  title: string;        // h1
  definition: string;   // h2
  outcome: string;      // h3 (hover-revealed body)
};

export const copy = {
  hero: {
    // Visual: 1MW red wordmark sits above the H1
    h1: "Marketing & Advertising",
    h2: "There is really no mystery as to what people want, the whole idea though, is to serve it up in a way that's unique and different, and better than before.",
    h3: "1MW is our attempt to do just that.",
  },

  pillars: [
    {
      id: "expertise",
      title: "Expertise",
      definition: "Best of the Best",
      outcome:
        "We partner with the best in the industry to ensure our clients are at the cutting edge of now and next.",
    },
    {
      id: "strategy",
      title: "Strategy",
      definition: "No Wasted Energy",
      outcome:
        "Every move is mapped to a clear objective, with the right channels, messaging, and timing to back it up. Strategy isn't a deliverable here, it's how we operate.",
    },
    {
      id: "audience",
      title: "Audience",
      definition: "Persona Modeling",
      outcome:
        "Uncovering the who, what, and where with real-world audience models, compiling segmentations and target profiles, rooted in behaviors and context.",
    },
    {
      id: "creative",
      title: "Creative",
      definition: "Unlocking The Ah-Ha",
      outcome:
        "We build ideas that break through, with powerful impact. Our work doesn't just look awesome or work great, it changes what's next. We combine insight, storytelling, and design to shape your vision to show up powerfully, wherever that may be.",
    },
    {
      id: "campaigns",
      title: "Campaigns",
      definition: "Go-to-Market Strategies",
      outcome:
        "From insight to launch. We build the strategic foundation, opportunities, truths, and insights, to inform and give creative its edge, giving the people what they want.",
    },
    {
      id: "omnichannel",
      title: "Omnichannel",
      definition: "Creative Concepts",
      outcome:
        "Big ideas, everywhere they need to be. Our campaignable creative platforms stretch across brand, retail, social, and digital, with a clear story and strong spine.",
    },
    {
      id: "production",
      title: "Production",
      definition: "Design Studio",
      outcome:
        "Fast, nimble, and on point, we handle high-volume, quick-turn creative with consistency and craft, delivering flawlessly at speed without cutting corners. What usually takes a week is done in a day.",
    },
    {
      id: "reach",
      title: "Reach",
      definition: "Social Media",
      outcome:
        "Connecting people with what matters, our data and insight-driven social strategies are designed for scrolls, shares, saves, and success across the ever-shifting social landscape.",
    },
    {
      id: "network",
      title: "Network",
      definition: "Influencers & Creators",
      outcome:
        "A value-add we bring to any engagement is our private network. Should your vision demand targeted reach, we can connect you with the right people to tell your story in the right way, with relevance and results.",
    },
    {
      id: "partnerships",
      title: "Partnerships",
      definition: "Public Relations & Collaborations",
      outcome:
        "We build credibility and conversations at the same time, from press hits to thought leadership. We pair our clients with the right partners, from creators to companies, to amplify reach and bring values to life.",
    },
    {
      id: "access",
      title: "Access",
      definition: "We'll Hold the Door",
      outcome:
        "Deep roots in this industry give us something rare, direct access, and everything we do is built to show results.",
    },
    {
      id: "data",
      title: "Data",
      definition: "Sharing is Caring",
      outcome:
        "Our proprietary data sharing platform includes more than 75 million persona-backed contacts to ensure your message resonates with your target audience, while uncovering growth and ROI opportunities.",
    },
    {
      id: "tracking",
      title: "Tracking",
      definition: "Analytics & Performance",
      outcome:
        "Focus on what matters by way of campaign dashboards and data storytelling to turn metrics into momentum and make your program, website, and campaigns reach around the corner or around the globe.",
    },
    {
      id: "connect",
      title: "Connect",
      definition: "CRM & Email Marketing",
      outcome:
        "We build relationships through CRM and email campaigns, using grounded segmentation and personalization to keep the conversation relevant.",
    },
    {
      id: "optimization",
      title: "Optimization",
      definition: "One Size Never Fits All",
      outcome:
        "We assess your current marketing infrastructure, channels, tools, and competitive position promptly. Before recommending anything, it's quite possible everything is operating perfectly, other than your coffee.",
    },
    {
      id: "websites",
      title: "Websites",
      definition: "Design & Development",
      outcome:
        "Digital designed for a human experience. We create digital experiences, websites, mobile apps, and ecommerce, to drive connection throughout the entire online journey.",
    },
    {
      id: "infrastructure",
      title: "Infrastructure",
      definition: "Cloud & Digital",
      outcome:
        "Full transition to scalable cloud environments, with integration of Google Workspace, domain name acquisition, configuration, and unified storage built for security and operational clarity.",
    },
    {
      id: "our-story",
      title: "Our Story",
      definition: "One Million Watts",
      outcome:
        "1MW.com is a highly desirable three-character .com, rare by nature, deliberate by design, that's where it starts. 1Megawatt is a universal measure of power, and the firm carries that same weight. Founded by Mike Wilen, we bring experts together to explore any territory in pursuit of a stronger idea, taking unconventional approaches and making big, bold investments in unexpected places.",
    },
  ] as Pillar[],

  conversion: {
    title: "One",
    definition: "Click to Map Your Next Move",
    outcome: "Hello@1mw.com",
    email: "hello@1mw.com",
  },
} as const;
