// REPLACE: Update all placeholder values before going live

export const site = {
  brand: "cognit",
  tagline: "Made to think. Built to work.",
  domain: "https://cognit.co.in",
  ownerName: "Your Name", // REPLACE: your name
  location: "India", // REPLACE: city, India
  whatsappNumber: "91XXXXXXXXXX", // REPLACE: WhatsApp number without +
  whatsappUrl: "https://wa.me/91XXXXXXXXXX", // REPLACE
  whatsappPrefill:
    "https://wa.me/91XXXXXXXXXX?text=Hi%20Cognit%2C%20I%27d%20like%20to%20discuss%20a%20project.", // REPLACE
  email: "hello@cognit.co.in",
  social: {
    instagram: "https://instagram.com/HANDLE", // REPLACE
    youtube: "https://youtube.com/@HANDLE", // REPLACE
    linkedin: "https://linkedin.com/in/HANDLE", // REPLACE
    github: "", // REPLACE: optional
  },
  formAccessKey: "YOUR_WEB3FORMS_ACCESS_KEY", // REPLACE: get from web3forms.com
  // Trust strip: set to null to hide numeric counters (use only real numbers)
  trustStats: null as
    | null
    | { projects: number; clients: number },
  year: new Date().getFullYear(),
} as const;

// Landing-page anchors: the home page renders every section inline, so the
// nav scrolls to them. The standalone routes (/services, /work, …) still
// exist for direct access and SEO.
export const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "FAQ", href: "#faq" },
] as const;

export const whyPoints = [
  {
    title: "Clear communication",
    description: "Plain updates, no jargon. You always know where things stand.",
    icon: "message-circle" as const,
  },
  {
    title: "On-time delivery",
    description: "Realistic timelines and steady progress you can count on.",
    icon: "clock" as const,
  },
  {
    title: "Modern design",
    description: "Clean, fast interfaces that build trust with your customers.",
    icon: "sparkles" as const,
  },
  {
    title: "One person for website, app and automation",
    description: "One contact from idea to launch, with no handoffs between teams.",
    icon: "user" as const,
  },
  {
    title: "Support after launch",
    description: "I stay available when you need fixes, updates, or new features.",
    icon: "life-buoy" as const,
  },
] as const;
