import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Projects } from "@/components/Projects";
import { CTABand } from "@/components/CTABand";
import { images } from "@/data/images";

export const metadata: Metadata = {
  title: "Work | Cognit",
  description:
    "Selected projects: websites, mobile apps, AI and WhatsApp automation built for growing businesses.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Selected work"
        title="Work that shows results"
        intro="A few sample projects. Real case studies land here as they ship."
        image={images.workBanner}
      />
      <Projects hideHeading />
      <CTABand
        title="Want results like these for your business?"
        subtitle="Tell me what you're building and I'll suggest the fastest path to launch."
      />
    </>
  );
}
