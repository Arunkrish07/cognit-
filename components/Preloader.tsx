"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Intro logo animation. Plays on first open AND on every full page load /
 * refresh (not on client-side link navigation, since the root layout persists
 * across those). Ported from the standalone "Cognit Logo Animation" file onto
 * React refs: the letters fade in while an orange dot zooms into the "o", then
 * hops g -> n -> i as the camera pulls back to the whole word.
 *
 * Tap / click anywhere to skip. Respects prefers-reduced-motion.
 */

// Total animation runtime (seconds) — matches the source animation.
const END = 5.3;

export function Preloader() {
  const [mounted, setMounted] = useState(true);
  const [fade, setFade] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const oRef = useRef<HTMLSpanElement>(null);
  const iRef = useRef<HTMLSpanElement>(null);
  const blRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const scene = sceneRef.current;
    const word = wordRef.current;
    const dot = dotRef.current;
    const oEl = oRef.current;
    const iEl = iRef.current;
    const bl = blRef.current;
    if (!stage || !scene || !word || !dot || !oEl || !iEl || !bl) return;

    const letters = Array.from(
      word.querySelectorAll<HTMLElement>(".pl-l")
    );
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const G: Record<string, number> = {};
    let raf = 0;
    let t0 = 0;
    let finished = false;
    let cancelled = false;

    const ease = (p: number) =>
      p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
    const backOut = (p: number) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
    };
    const clamp = (p: number) => Math.max(0, Math.min(1, p));

    // Find the empty circle (counter) inside the "o" by scanning rendered pixels.
    function counterOf(font: string, fs: number) {
      const W = Math.ceil(fs * 1.4);
      const H = Math.ceil(fs * 1.6);
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const x = c.getContext("2d", { willReadFrequently: true })!;
      x.font = font;
      x.fillStyle = "#000";
      x.textBaseline = "alphabetic";
      const ox = fs * 0.2;
      const oy = fs * 1.1;
      x.fillText("o", ox, oy);
      const m = x.measureText("o");
      const gx = ox + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
      const gy =
        oy -
        m.actualBoundingBoxAscent +
        (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / 2;
      const d = x.getImageData(0, 0, W, H).data;
      const solid = (px: number, py: number) =>
        d[(Math.round(py) * W + Math.round(px)) * 4 + 3] > 128;
      let L = 0;
      let R = 0;
      let U = 0;
      let D = 0;
      while (!solid(gx - L, gy) && L < fs) L++;
      while (!solid(gx + R, gy) && R < fs) R++;
      while (!solid(gx, gy - U) && U < fs) U++;
      while (!solid(gx, gy + D) && D < fs) D++;
      const ccx = gx + (R - L) / 2;
      const ccy = gy + (D - U) / 2;
      return {
        offX: ccx - ox,
        offY: ccy - oy,
        rad: Math.min((L + R) / 2, (U + D) / 2),
        outerH: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
      };
    }

    function measure() {
      scene!.style.transform = "none";
      letters.forEach((l) => {
        l.style.transform = "none";
      });
      const cs = getComputedStyle(word!);
      const fs = parseFloat(cs.fontSize);
      const font = cs.fontWeight + " " + fs + "px " + cs.fontFamily;
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.font = font;
      const m = ctx.measureText("ı");
      const stemW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const glyphCenter =
        (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
      const sb = stage!.getBoundingClientRect();
      const baseY = bl!.getBoundingClientRect().top - sb.top;
      const r = Math.max(6, stemW * 0.64);
      const gap = r * 0.55;
      G.fs = fs;
      G.r = r;
      G.dotY = baseY - m.actualBoundingBoxAscent - gap - r;
      const co = counterOf(font, fs);
      const ob = oEl!.getBoundingClientRect();
      G.ox = ob.left - sb.left + co.offX;
      G.oy = baseY + co.offY;
      G.S0 = (co.rad * 0.98) / r;
      G.gx = (() => {
        const b = letters[2].getBoundingClientRect();
        return b.left - sb.left + b.width / 2;
      })();
      G.nx = (() => {
        const b = letters[3].getBoundingClientRect();
        return b.left - sb.left + b.width / 2;
      })();
      const ib = iEl!.getBoundingClientRect();
      G.ix = ib.left - sb.left + glyphCenter;
      G.cx = sb.width / 2;
      G.cy = sb.height / 2;
      G.Z0 = Math.max(1.6, (0.62 * Math.min(sb.width, sb.height)) / co.outerH);
      dot!.style.width = dot!.style.height = 2 * r + "px";
      dot!.style.marginLeft = dot!.style.marginTop = -r + "px";
    }

    const CAM_HOLD = 1.4;
    const CAM_DUR = 1.3;
    const HOPS = [
      { s: 2.95, d: 0.58, h: 0.5 },
      { s: 3.65, d: 0.42, h: 0.26 },
      { s: 4.2, d: 0.44, h: 0.28 },
    ];

    function frame(t: number) {
      // Camera: starts zoomed into the "o", then pulls back to the whole word.
      const cp = ease(clamp((t - CAM_HOLD) / CAM_DUR));
      const z = lerp(G.Z0, 1, cp);
      const fx = lerp(G.ox, G.cx, cp);
      const fy = lerp(G.oy, G.cy, cp);
      scene!.style.transform =
        "translate(" +
        (G.cx - z * fx) +
        "px," +
        (G.cy - z * fy) +
        "px) scale(" +
        z +
        ")";

      // Dot: sits in the o, then hops g -> n -> i.
      const xs = [G.ox, G.gx, G.nx, G.ix];
      const ys = [G.oy, G.dotY, G.dotY, G.dotY];
      let x = G.ox;
      let y = G.oy;
      let s = G.S0;
      let sx = 1;
      let sy = 1;
      if (t < HOPS[0].s) {
        if (t < 0.9) {
          s = G.S0 * backOut(clamp(t / 0.9)); // the dot alone zooms in
        } else {
          s = G.S0 * (1 + 0.025 * Math.sin(t * 5)); // then rests inside the o
        }
      } else {
        for (let k = 0; k < 3; k++) {
          const H = HOPS[k];
          const lt = t - H.s;
          if (lt < 0) break;
          if (lt < H.d) {
            const p = lt / H.d;
            x = lerp(xs[k], xs[k + 1], p);
            y = lerp(ys[k], ys[k + 1], p) - 4 * G.fs * H.h * p * (1 - p);
            s = k === 0 ? lerp(G.S0, 1, ease(p)) : 1;
            const st = Math.sin(Math.PI * p) * 0.16;
            sy = 1 + st;
            sx = 1 - st * 0.6;
          } else {
            x = xs[k + 1];
            y = ys[k + 1];
            s = 1;
            const dd = clamp((lt - H.d) / 0.18);
            const amp = k === 2 ? 0.3 : 0.18;
            const sq = Math.sin(dd * Math.PI) * Math.exp(-2 * dd) * amp * 2.2;
            sy = 1 - sq;
            sx = 1 + sq * 0.8;
          }
        }
      }
      dot!.style.opacity = "1";
      dot!.style.transform =
        "translate(" +
        x +
        "px," +
        (y + (1 - sy) * G.r * s) +
        "px) scale(" +
        s * sx +
        "," +
        s * sy +
        ")";

      // Letters fade in after the dot (all together, the o stays still).
      letters.forEach((l, idx) => {
        l.style.opacity = String(clamp((t - 1.2 - Math.abs(idx - 1) * 0.09) / 0.5));
      });
    }

    function finish() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      try {
        frame(END + 1); // snap to the resolved logo
      } catch {
        /* geometry not ready — fade out anyway */
      }
      setFade(true);
      window.setTimeout(() => {
        if (!cancelled) setMounted(false);
      }, 450);
    }

    function play() {
      try {
        measure();
      } catch {
        finish();
        return;
      }
      if (reduce) {
        try {
          frame(END + 1);
        } catch {
          /* ignore */
        }
        // Hold the resolved logo briefly, then reveal the site.
        window.setTimeout(finish, 600);
        return;
      }
      frame(0);
      t0 = performance.now();
      const tick = (now: number) => {
        if (cancelled || finished) return;
        const t = (now - t0) / 1000;
        frame(t);
        if (t < END + 0.2) {
          raf = requestAnimationFrame(tick);
        } else {
          finish();
        }
      };
      raf = requestAnimationFrame(tick);
    }

    // Wait for the Outfit font before measuring — the glyph geometry depends
    // on it. next/font gives the family a hashed name, so we rely on
    // document.fonts.ready rather than loading the literal "Outfit" name.
    const fontsReady: Promise<unknown> =
      typeof document !== "undefined" && "fonts" in document
        ? document.fonts.ready
        : Promise.resolve();

    fontsReady
      .catch(() => {})
      .then(() => {
        if (cancelled) return;
        window.setTimeout(() => {
          if (!cancelled) play();
        }, 250);
      });

    // Hard safety net: never leave the overlay up longer than the animation.
    const safety = window.setTimeout(finish, (END + 2) * 1000);

    // Skip on tap / click.
    stage.addEventListener("click", finish);

    // On resize, snap to the resolved logo and reveal (mid-play resize is rare).
    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(finish, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
      window.clearTimeout(rt);
      stage.removeEventListener("click", finish);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={stageRef}
      className={`pl-stage${fade ? " pl-fade" : ""}`}
      role="presentation"
      aria-hidden
    >
      <style>{PRELOADER_CSS}</style>
      <div ref={sceneRef} className="pl-scene">
        <div ref={wordRef} className="pl-word" aria-label="cognit">
          <span className="pl-l">c</span>
          <span className="pl-l" ref={oRef}>
            o
          </span>
          <span className="pl-l">g</span>
          <span className="pl-l">n</span>
          <span className="pl-l" ref={iRef}>
            {"ı"}
          </span>
          <span className="pl-l">t</span>
          <span className="pl-bl" ref={blRef} />
        </div>
        <div ref={dotRef} className="pl-dot" />
      </div>
    </div>
  );
}

const PRELOADER_CSS = `
.pl-stage{position:fixed;inset:0;overflow:hidden;cursor:pointer;background:var(--bg,#0a0807);z-index:200}
.pl-stage.pl-fade{opacity:0;transition:opacity .45s cubic-bezier(.22,1,.36,1)}
.pl-scene{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transform-origin:0 0}
.pl-word{font-family:var(--font-outfit),system-ui,sans-serif;font-weight:600;font-size:clamp(64px,19vw,220px);color:#fff;letter-spacing:-.02em;line-height:1;white-space:nowrap;user-select:none}
.pl-word .pl-l{display:inline-block;opacity:0}
.pl-word .pl-bl{display:inline-block;width:0;height:0}
.pl-dot{position:absolute;left:0;top:0;border-radius:50%;background:#ff8a1f;will-change:transform;opacity:0}
`;
