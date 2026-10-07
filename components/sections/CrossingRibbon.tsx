import { InfiniteRibbon } from "@/components/ui/infinite-ribbon";

// Service commitments shown in the crossing ribbons under the hero.
const commitments = [
  "Fast delivery",
  "Clear communication",
  "Post-launch support",
  "Reliable development",
  "Modern design",
  "Business-focused solutions",
];

function RibbonContent({ separatorClass }: { separatorClass: string }) {
  return (
    <>
      {commitments.map((item) => (
        <span key={item} className="inline-flex items-center">
          <span className="px-6 md:px-8">{item}</span>
          <span className={`text-base ${separatorClass}`} aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </>
  );
}

const barBase =
  "border-y py-3 text-xs font-semibold uppercase tracking-[0.16em] sm:text-sm md:py-4 md:text-base md:tracking-[0.2em]";

/**
 * Two counter-scrolling ribbons, oppositely rotated and centered on the same
 * point, so they cross through the middle in an X. Each ribbon is wrapped in a
 * positioning/rotation element; the InfiniteRibbon inside only runs the
 * marquee (rotation={0}), so the rotation is never overwritten by the scroll
 * transform. The section clips the rotated ends, and the body never scrolls
 * horizontally.
 */
export function CrossingRibbon() {
  return (
    <section
      aria-label="Our service commitments"
      className="relative w-full overflow-hidden h-[150px] sm:h-[190px] md:h-[220px]"
    >
      {/* Ribbon A — black / orange, scrolls right → left, angled up. */}
      <div className="absolute left-1/2 top-1/2 z-10 w-[170%] -translate-x-1/2 -translate-y-1/2 rotate-[5deg] sm:w-[155%] md:w-[150%] md:rotate-[6deg]">
        <InfiniteRibbon
          duration={32}
          rotation={0}
          repeat={6}
          className={`${barBase} border-white/10 bg-[#090706] text-accent shadow-[0_14px_44px_-18px_rgba(0,0,0,0.95)]`}
        >
          <RibbonContent separatorClass="text-white/85" />
        </InfiniteRibbon>
      </div>

      {/* Ribbon B — orange / black, scrolls left → right, angled down. */}
      <div className="absolute left-1/2 top-1/2 z-20 w-[170%] -translate-x-1/2 -translate-y-1/2 -rotate-[5deg] sm:w-[155%] md:w-[150%] md:-rotate-[6deg]">
        <InfiniteRibbon
          duration={32}
          reverse
          rotation={0}
          repeat={6}
          className={`${barBase} border-black/15 bg-accent text-black shadow-[0_14px_44px_-18px_rgba(0,0,0,0.95)]`}
        >
          <RibbonContent separatorClass="text-white/90" />
        </InfiniteRibbon>
      </div>
    </section>
  );
}

export default CrossingRibbon;
