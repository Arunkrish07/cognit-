import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FAQ } from "@/components/FAQ";
import { CTABand } from "@/components/CTABand";
import { images } from "@/data/images";

export const metadata: Metadata = {
  title: "FAQ | Cognit",
  description:
    "Answers to common questions about timelines, cost, ownership, support and WhatsApp integration.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Questions, answered"
        intro="The things clients ask most before we start."
        image={images.faqBanner}
      />
      <FAQ hideHeading />
      <CTABand
        title="Still have a question?"
        subtitle="Send me an email or book a free call and I'll answer it directly."
      />
    </>
  );
}
