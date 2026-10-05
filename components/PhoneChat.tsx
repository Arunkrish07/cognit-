"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

const chatScript = [
  { from: "customer", text: "Hi, do you deliver on Sundays?" },
  {
    from: "bot",
    text: "Yes! We deliver 9 AM to 8 PM on Sundays. Want to place an order?",
  },
  { from: "customer", text: "Yes, 2 large pizzas." },
  {
    from: "bot",
    text: "Done. Order #1042 confirmed. You'll get updates here.",
  },
];

export function PhoneChat() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [typing, setTyping] = useState(false);
  const [inView, setInView] = useState(true);

  // Pointer tilt via motion values (spring-smoothed) so it never
  // re-renders the React tree on mouse move.
  const rotateX = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !inView) return;

    let cancelled = false;
    let msgIndex = 0;

    const runLoop = async () => {
      while (!cancelled) {
        setVisibleMessages(0);
        setTyping(false);
        await wait(600);
        if (cancelled) break;

        for (let i = 0; i < chatScript.length; i++) {
          if (cancelled) break;
          if (chatScript[i].from === "bot") {
            setTyping(true);
            await wait(900);
            setTyping(false);
          }
          msgIndex = i + 1;
          setVisibleMessages(msgIndex);
          await wait(1200);
        }
        await wait(1500);
      }
    };

    const onVis = () => {
      if (document.hidden) cancelled = true;
    };
    document.addEventListener("visibilitychange", onVis);
    runLoop();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduced, inView]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduced || window.innerWidth < 768) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    rotateY.set(((e.clientX - rect.left) / rect.width - 0.5) * 6);
    rotateX.set(((e.clientY - rect.top) / rect.height - 0.5) * -4);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[280px] sm:max-w-[300px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative rounded-[24px] border border-border bg-surface p-3 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.5)]"
        style={{
          rotateX,
          rotateY,
          transformPerspective: 800,
        }}
        initial={reduced ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-3 flex items-center gap-2 border-b border-border px-2 pb-3">
          <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center text-xs font-bold text-success">
            C
          </div>
          <div>
            <p className="text-sm font-medium text-text">Cognit Bot</p>
            <p className="text-xs text-muted">Online</p>
          </div>
        </div>

        <div className="flex min-h-[220px] flex-col gap-2 px-1">
          {reduced
            ? chatScript.map((msg, i) => (
                <ChatBubble key={i} from={msg.from as "customer" | "bot"}>
                  {msg.text}
                </ChatBubble>
              ))
            : chatScript.slice(0, visibleMessages).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChatBubble from={msg.from as "customer" | "bot"}>
                    {msg.text}
                  </ChatBubble>
                </motion.div>
              ))}

          {!reduced && typing && (
            <div className="self-start rounded-2xl rounded-bl-sm bg-surface-2 px-3 py-2 text-xs text-muted">
              typing...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ChatBubble({
  from,
  children,
}: {
  from: "customer" | "bot";
  children: string;
}) {
  return (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-snug",
        from === "customer"
          ? "self-end rounded-br-sm bg-accent-fill text-on-accent"
          : "self-start rounded-bl-sm bg-surface-2 text-text"
      )}
    >
      {children}
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
