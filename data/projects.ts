export type ProjectType =
  | "Website"
  | "Mobile app"
  | "AI automation"
  | "WhatsApp automation";

export type Project = {
  id: string;
  name: string;
  type: ProjectType;
  problem: string;
  solution: string;
  result: string;
  tech: string[];
  image: string;
  link?: string;
};

// REPLACE WITH REAL PROJECT
export const projects: Project[] = [
  {
    id: "sample-restaurant",
    name: "Sample project: restaurant ordering app",
    type: "Mobile app",
    problem:
      "A local restaurant was taking orders only by phone, missing enquiries after hours.",
    solution:
      "Built a mobile ordering app with menu browsing, cart checkout, and WhatsApp order confirmations.",
    result: "Placeholder result. Add a real outcome metric when available.",
    tech: ["Flutter", "Firebase", "WhatsApp API"],
    // Placeholder cover. Swap for a real project screenshot before launch.
    image: "https://picsum.photos/seed/cognit-restaurant-app/720/900?grayscale",
  },
  {
    id: "sample-clinic",
    name: "Sample project: clinic booking website",
    type: "Website",
    problem:
      "A clinic needed online appointment booking instead of endless phone calls.",
    solution:
      "Designed and built a fast booking website with service pages and a contact form linked to WhatsApp.",
    result: "Placeholder result. Add a real outcome metric when available.",
    tech: ["Next.js", "Tailwind CSS", "Formspree"],
    image: "https://picsum.photos/seed/cognit-clinic-website/900/640?grayscale",
  },
  {
    id: "sample-support-bot",
    name: "Sample project: customer support bot",
    type: "AI automation",
    problem:
      "A small business spent hours answering the same customer questions every day.",
    solution:
      "Deployed an AI assistant on their website and WhatsApp that handles FAQs and escalates complex queries.",
    result: "Placeholder result. Add a real outcome metric when available.",
    tech: ["OpenAI", "n8n", "WhatsApp API"],
    image: "https://picsum.photos/seed/cognit-support-bot/900/640?grayscale",
  },
];

export const projectFilters = [
  "All",
  "Websites",
  "Apps",
  "Automation",
] as const;

export type ProjectFilter = (typeof projectFilters)[number];

export function filterProjects(
  items: Project[],
  filter: ProjectFilter
): Project[] {
  if (filter === "All") return items;
  if (filter === "Websites")
    return items.filter((p) => p.type === "Website");
  if (filter === "Apps")
    return items.filter((p) => p.type === "Mobile app");
  return items.filter(
    (p) => p.type === "AI automation" || p.type === "WhatsApp automation"
  );
}
