"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/* The custom cursor is a lit cigarette drawn as vector art (crisp at any DPI).
   Its glowing ember sits exactly on the real pointer hotspot, which is also the
   point the hero's WebGL smoke is emitted from — so the smoke reads as drifting
   straight off the tip. */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    // hover-capable pointers only — phones keep their native touch behaviour
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      el.style.display = "none";
      return;
    }

    gsap.set(el, { x: -200, y: -200 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "expo.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "expo.out" });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.(
        "[data-cursor]"
      ) as HTMLElement | null;
      if (target) {
        el.classList.add("is-hover");
        setLabel(target.dataset.cursor || "");
      }
    };

    const onOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.("[data-cursor]");
      if (target) {
        el.classList.remove("is-hover");
        setLabel("");
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <div ref={root} className="cursor" aria-hidden>
      <div className="cursor__cig">
        <svg
          width="96"
          height="44"
          viewBox="0 0 96 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="cigPaper"
              x1="0"
              y1="14"
              x2="0"
              y2="30"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#fdfbf6" />
              <stop offset="0.5" stopColor="#efeae0" />
              <stop offset="1" stopColor="#d3ccbd" />
            </linearGradient>
            <linearGradient
              id="cigFilter"
              x1="0"
              y1="14"
              x2="0"
              y2="30"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#d8b06b" />
              <stop offset="0.5" stopColor="#bd9150" />
              <stop offset="1" stopColor="#9b7236" />
            </linearGradient>
            <radialGradient id="cigEmber" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffe6a3" />
              <stop offset="0.35" stopColor="#ff9d36" />
              <stop offset="0.7" stopColor="#f1521a" />
              <stop offset="1" stopColor="#7e2207" />
            </radialGradient>
            <radialGradient id="cigGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ff9632" stopOpacity="0.85" />
              <stop offset="1" stopColor="#ff5a14" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ember halo */}
          <circle
            className="cursor__glow"
            cx="78"
            cy="22"
            r="16"
            fill="url(#cigGlow)"
          />

          {/* contact shadow */}
          <rect
            x="2"
            y="17"
            width="74"
            height="13"
            rx="6.5"
            fill="#000000"
            fillOpacity="0.28"
          />

          {/* cork filter */}
          <rect x="2" y="14" width="26" height="16" rx="7" fill="url(#cigFilter)" />
          <rect x="9" y="14" width="1.4" height="16" fill="#6f5224" fillOpacity="0.5" />
          <rect x="15" y="14" width="1.4" height="16" fill="#6f5224" fillOpacity="0.5" />

          {/* paper */}
          <rect x="27" y="14" width="44" height="16" fill="url(#cigPaper)" />
          <rect x="27" y="15" width="44" height="1.2" fill="#ffffff" fillOpacity="0.6" />
          <rect x="28" y="14" width="2" height="16" fill="#c7ad7b" />

          {/* ash / char before the coal */}
          <rect x="69" y="14" width="7" height="16" fill="#8a847a" />
          <rect x="73" y="14" width="4" height="16" fill="#5d564d" />

          {/* glowing coal */}
          <circle
            className="cursor__ember"
            cx="78"
            cy="22"
            r="8"
            fill="url(#cigEmber)"
          />
          <circle cx="78" cy="22" r="3" fill="#ffd98a" />
        </svg>
      </div>

      <span className="cursor__label">{label}</span>
    </div>
  );
}
