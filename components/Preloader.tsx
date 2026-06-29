"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

const INTRO_EVENT = "intro:play";

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const fire = () => {
      (window as unknown as { __introPlayed?: boolean }).__introPlayed = true;
      window.dispatchEvent(new Event(INTRO_EVENT));
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDone(true);
      fire();
      return;
    }

    document.documentElement.style.overflow = "hidden";

    const state = { v: 0 };
    const tl = gsap.timeline();

    tl.to(state, {
      v: 100,
      duration: 1.9,
      ease: "power2.inOut",
      onUpdate: () => setCount(Math.round(state.v)),
    });

    if (bar.current) {
      tl.fromTo(
        bar.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.9, ease: "power2.inOut" },
        0
      );
    }

    tl.to({}, { duration: 0.25 });

    tl.to(root.current, {
      yPercent: -100,
      duration: 1.1,
      ease: "expo.inOut",
      onStart: fire,
      onComplete: () => {
        document.documentElement.style.overflow = "";
        setDone(true);
      },
    });

    return () => {
      tl.kill();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div className="preloader" ref={root} aria-hidden>
      <div className="preloader__count">
        {count}
        <sup>%</sup>
      </div>
      <div className="preloader__word">Loading&nbsp;—&nbsp;Portfolio</div>
      <div className="preloader__bar">
        <i ref={bar} />
      </div>
    </div>
  );
}

export { INTRO_EVENT };
