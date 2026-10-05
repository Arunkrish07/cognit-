import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Services } from "@/components/Services";
import { Pricing } from "@/components/Pricing";
import { CTABand } from "@/components/CTABand";
import { images } from "@/data/images";

export const metadata: Metadata = {
  title: "Services | Cognit",
  description:
    "Websites, mobile apps, AI automation and WhatsApp automation for growing businesses in India.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="What Cognit builds"
        intro="Websites, apps, AI and WhatsApp automation, built by one person from the first idea to launch."
        image={images.servicesBanner}
      />
      <Services hideHeading />
      <Pricing />
      <CTABand />
    </>
  );
}
