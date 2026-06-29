"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/* A clean custom pointer: a small dot at the real hotspot with a soft ring that
   expands on interactive elements, plus a contextual label. The dot also marks
   where the site-wide smoke is emitted from. */
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
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "expo.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "expo.out" });

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
      <span className="cursor__ring" />
      <span className="cursor__dot" />
      <span className="cursor__label">{label}</span>
    </div>
  );
}
