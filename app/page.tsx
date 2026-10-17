import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";
import { CrossingRibbon } from "@/components/sections/CrossingRibbon";
import { CapabilitiesReveal } from "@/components/sections/CapabilitiesReveal";
import { Services } from "@/components/Services";
import { Process } from "@/components/Process";
import { Projects } from "@/components/Projects";
import { WhyCognit } from "@/components/WhyCognit";
import { FAQ } from "@/components/FAQ";
import { CTABand } from "@/components/CTABand";

export default function Home() {
  return (
    <>
      <ResponsiveHeroBanner />
      {/* Ribbon as a hero transition: pulled up so the crossing ribbons bleed
          over the hero's bottom edge. It sits ABOVE the hero (z-10 vs the
          hero's z-1) so the rotated ends render on top instead of being
          clipped by the hero's opaque background. */}
      <div className="relative z-10 -mt-12 md:-mt-16">
        <CrossingRibbon />
      </div>
      <CapabilitiesReveal />
      <Services />
      <Process />
      <Projects />
      <WhyCognit />
      <FAQ />
      <CTABand />
    </>
  );
}
