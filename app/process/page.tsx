import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Process } from "@/components/Process";
import { CTABand } from "@/components/CTABand";
import { images } from "@/data/images";

export const metadata: Metadata = {
  title: "Process | Cognit",
  description:
    "How we work together: a clear four-step path from first call to launch and ongoing support.",
  alternates: { canonical: "/process" },
};

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Process"
        title="How we work together"
        intro="A clear, four-step path from the first call to launch and beyond."
        image={images.processBanner}
      />
      <Process hideHeading />
      <CTABand
        title="Ready to start with step one?"
        subtitle="Book a free call and we'll talk through your idea and goals."
      />
    </>
  );
}
