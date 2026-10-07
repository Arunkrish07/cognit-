import { Hero } from "@/components/Hero";
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
      <Hero />
      {/* Ribbon as a hero transition: pulled up to tuck under the hero's
          bottom, with a negative z-index so hero content always sits on top
          and the ribbon never covers it. */}
      <div className="relative -z-10 -mt-12 md:-mt-16">
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
