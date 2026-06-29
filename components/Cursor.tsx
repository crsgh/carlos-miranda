"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    // hover-capable pointers only
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      el.style.display = "none";
      return;
    }

    gsap.set(el, { xPercent: 0, yPercent: 0, x: -100, y: -100 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.55, ease: "expo.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.55, ease: "expo.out" });

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
      <div className="cursor__dot" />
      <div className="cursor__label">{label}</div>
    </div>
  );
}
