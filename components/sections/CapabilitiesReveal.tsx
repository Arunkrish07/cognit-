"use client";

import {
  ImageTextReveal,
  type RevealLine,
} from "@/components/ui/imgtext-reveal-scroll-animation";

// Reads as one sentence; the CSS uppercases it. Each image slot expands on
// scroll. Images are stable Unsplash photos; the component falls back safely
// if any fails to load.
const lines: RevealLine[] = [
  {
    prefix: "We design",
    image:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1200&auto=format&fit=crop",
    alt: "Website design on a laptop",
    suffix: "websites",
  },
  {
    prefix: "build",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
    alt: "App code on a screen",
    suffix: "apps",
  },
  {
    prefix: "& automate",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    alt: "AI and automation",
    suffix: "work",
  },
  { fullText: "with AI." },
];

/**
 * Scroll-reveal "what we do" statement, placed after the plane sweep. As you
 * scroll each line in, the inline image slots grow open; hovering one floats a
 * large preview that trails the cursor.
 */
export function CapabilitiesReveal() {
  return (
    <section aria-label="What we build" className="relative w-full">
      <ImageTextReveal lines={lines} />
    </section>
  );
}

export default CapabilitiesReveal;
