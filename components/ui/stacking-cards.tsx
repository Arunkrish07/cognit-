"use client";

// Stacking scroll cards — adapted from Khoa Phan <https://www.pldkhoa.dev>.
// Original uses `motion/react` + a fixed scroll container; this project ships
// framer-motion, so the imports are swapped and the default target is the
// window scroll (pass `scrollOptions.container` to scope it instead).

import {
  createContext,
  useContext,
  useRef,
  type HTMLAttributes,
  type PropsWithChildren,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
  type UseScrollOptions,
} from "framer-motion";

import { cn } from "@/lib/utils";

interface StackingCardsProps
  extends PropsWithChildren,
    HTMLAttributes<HTMLDivElement> {
  scrollOptions?: UseScrollOptions;
  scaleMultiplier?: number;
  totalCards: number;
}

interface StackingCardItemProps
  extends HTMLAttributes<HTMLDivElement>,
    PropsWithChildren {
  index: number;
  topPosition?: string;
}

const StackingCardsContext = createContext<{
  progress: MotionValue<number>;
  scaleMultiplier?: number;
  totalCards?: number;
} | null>(null);

export function useStackingCardsContext() {
  const context = useContext(StackingCardsContext);
  if (!context)
    throw new Error("StackingCardItem must be used within StackingCards");
  return context;
}

export default function StackingCards({
  children,
  className,
  scrollOptions,
  scaleMultiplier,
  totalCards,
  ...props
}: StackingCardsProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"],
    ...scrollOptions,
    target: targetRef,
  });

  return (
    <StackingCardsContext.Provider
      value={{ progress: scrollYProgress, scaleMultiplier, totalCards }}
    >
      <div className={cn(className)} ref={targetRef} {...props}>
        {children}
      </div>
    </StackingCardsContext.Provider>
  );
}

export function StackingCardItem({
  index,
  topPosition,
  className,
  children,
  ...props
}: StackingCardItemProps) {
  const { progress, scaleMultiplier, totalCards = 0 } =
    useStackingCardsContext();
  // Lower cards in the stack settle at a smaller scale as the user scrolls.
  const scaleTo = 1 - (totalCards - index) * (scaleMultiplier ?? 0.04);
  const rangeScale = [index * (1 / totalCards), 1];
  const scale = useTransform(progress, rangeScale, [1, scaleTo]);
  const top = topPosition ?? `${6 + index * 3}%`;

  return (
    // The wrapper spans a full viewport box, so a later card's transparent
    // area would otherwise intercept clicks meant for the card beneath it.
    // Disable pointer events here and let the visible card re-enable them.
    <div
      className={cn("pointer-events-none sticky top-0 h-full", className)}
      {...props}
    >
      <motion.div className="relative h-full origin-top" style={{ top, scale }}>
        {children}
      </motion.div>
    </div>
  );
}
