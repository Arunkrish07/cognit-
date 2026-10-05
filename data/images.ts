// Placeholder imagery. Swap each URL for a real asset before launch —
// drop files in /public and change these to "/your-image.jpg".
// Grayscale keeps the stock photos cohesive with the Ink & Lime look.

export const images = {
  // Hero background (behind the headline). 1920x1080, dark-tinted in CSS.
  heroBackground:
    "https://picsum.photos/seed/cognit-hero-workspace/1920/1080?grayscale",

  // Page banner / accent images (one dominant image per route).
  servicesBanner:
    "https://picsum.photos/seed/cognit-services-build/1400/900?grayscale",
  workBanner:
    "https://picsum.photos/seed/cognit-work-results/1400/900?grayscale",
  processBanner:
    "https://picsum.photos/seed/cognit-process-collab/1400/900?grayscale",
  faqBanner:
    "https://picsum.photos/seed/cognit-faq-answers/1400/900?grayscale",
} as const;
