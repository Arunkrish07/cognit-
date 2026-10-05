export type Service = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: "globe" | "smartphone" | "bot" | "message-square";
  whatYouGet: string[];
  timeline: string;
  featured?: boolean;
  combo?: boolean;
};

export const services: Service[] = [
  {
    id: "website",
    title: "Website development",
    description:
      "Fast, modern websites that build trust and bring in enquiries.",
    tags: ["Next.js", "React", "SEO"],
    icon: "globe",
    whatYouGet: [
      "Mobile-first responsive design",
      "Contact forms and WhatsApp integration",
      "Fast loading and SEO setup",
    ],
    timeline: "2-4 weeks", // CONFIRM WITH OWNER
  },
  {
    id: "mobile",
    title: "Mobile app development",
    description: "Android and iOS apps for your business or startup idea.",
    tags: ["Flutter", "React Native", "Firebase"],
    icon: "smartphone",
    whatYouGet: [
      "Cross-platform Android and iOS app",
      "Clean UI matched to your brand",
      "App store submission support",
    ],
    timeline: "6-12 weeks", // CONFIRM WITH OWNER
  },
  {
    id: "ai",
    title: "AI automation",
    description:
      "Chatbots, AI assistants and workflows that save hours every week.",
    tags: ["OpenAI", "n8n", "Custom bots"],
    icon: "bot",
    whatYouGet: [
      "AI chatbot trained on your business",
      "Automated workflows for repetitive tasks",
      "Integration with your existing tools",
    ],
    timeline: "2-6 weeks", // CONFIRM WITH OWNER
  },
  {
    id: "whatsapp",
    title: "WhatsApp automation",
    description: "Auto-replies, lead capture, order updates and broadcasts.",
    tags: ["WhatsApp API", "Lead capture", "Broadcasts"],
    icon: "message-square",
    whatYouGet: [
      "Instant auto-replies to common questions",
      "Lead capture and follow-up flows",
      "Order updates and broadcast messages",
    ],
    timeline: "1-3 weeks", // CONFIRM WITH OWNER
  },
];

export const featuredCombo: Service = {
  id: "combo",
  title: "Website + WhatsApp bot starter",
  description:
    "A professional site that captures leads and replies to them automatically.",
  tags: ["Website", "WhatsApp bot", "Lead capture"],
  icon: "message-square",
  whatYouGet: [
    "Professional business website",
    "WhatsApp auto-reply bot connected to your site",
    "Lead capture form with instant notifications",
  ],
  timeline: "3-5 weeks", // CONFIRM WITH OWNER
  featured: true,
  combo: true,
};
