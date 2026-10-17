"use client";

// Generative "typing" text — reveals one character at a time, the way a model
// writes it, with a caret trailing the last character. Behaviour adapted from
// the AccordionStreamingContent brief:
//   - the full text sits underneath at zero opacity to reserve the height, so
//     nothing below jumps while the words arrive, and it is the copy a screen
//     reader reads;
//   - the streaming layer on top is decorative (aria-hidden);
//   - punctuation adds a beat of its own;
//   - a reduced-motion preference skips straight to the finished answer.

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type StreamingTextProps = {
  text: string;
  /** Start streaming when true; while false nothing is revealed yet. @default true */
  play?: boolean;
  /** Milliseconds per character. @default 14 */
  speed?: number;
  /** Pause before the first character, in milliseconds. @default 120 */
  startDelay?: number;
  className?: string;
};

export function StreamingText({
  text,
  play = true,
  speed = 14,
  startDelay = 120,
  className,
}: StreamingTextProps) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    // Reduced motion (or no play yet) jumps to the finished / empty state.
    if (reduced) {
      setCount(text.length);
      return;
    }
    if (!play) {
      setCount(0);
      return;
    }

    let i = 0;
    setCount(0);
    const tick = () => {
      i += 1;
      setCount(i);
      if (i >= text.length) return;
      // Sentence breaks hold longest, soft breaks a little; everything else
      // runs at the base pace.
      const prev = text[i - 1];
      const beat = /[.!?]/.test(prev) ? 9 : /[,;:]/.test(prev) ? 5 : 1;
      timer.current = setTimeout(tick, speed * beat);
    };
    timer.current = setTimeout(tick, startDelay);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text, play, speed, startDelay, reduced]);

  const done = count >= text.length;

  return (
    <span className={cn("relative block", className)}>
      {/* Underneath: full text, reserves the height and is read aloud. */}
      <span className="block opacity-0">{text}</span>
      {/* On top: the characters as they stream in, with a trailing caret. */}
      <span aria-hidden className="absolute inset-0 block">
        {text.slice(0, count)}
        {!done && (
          <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] rounded-full bg-accent motion-safe:animate-pulse" />
        )}
      </span>
    </span>
  );
}
