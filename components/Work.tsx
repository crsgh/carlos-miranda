"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "@/lib/gsap";
import { site } from "@/data/site";

const WorkCanvas = dynamic(() => import("./WorkCanvas"), { ssr: false });

export default function Work() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(-1);

  // refs read by the WebGL loop (no re-render per frame)
  const activeRef = useRef(-1);
  const pointerRef = useRef({ x: 0, y: 0 });

  const colors = site.projects.map((p) => p.colors);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(".work__row", {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".work__list", start: "top 80%" },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const enter = (i: number) => {
    activeRef.current = i;
    setActive(i);
  };
  const leave = () => {
    activeRef.current = -1;
    setActive(-1);
  };

  return (
    <section className="work shell" id="work" ref={root}>
      <div className="work__head">
        <h2>
          Selected
          <br />
          Work
        </h2>
        <span className="mono" style={{ color: "var(--bone-dim)" }}>
          ({String(site.projects.length).padStart(2, "0")}) — ’23–’26
        </span>
      </div>

      <div className={`work__list ${active >= 0 ? "is-hovering" : ""}`}>
        {site.projects.map((p, i) => (
          <a
            key={p.id}
            href={p.href}
            className={`work__row ${active === i ? "is-active" : ""}`}
            data-cursor="View"
            onMouseEnter={() => enter(i)}
            onMouseLeave={leave}
          >
            <span className="num">{p.id}</span>
            <span className="title">
              {p.title}
              <em>{p.subtitle}</em>
            </span>
            <span className="meta">
              <span className="tags">
                {p.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </span>
              <span className="yr">
                {p.role} · {p.year}
              </span>
            </span>
          </a>
        ))}
      </div>

      <WorkCanvas
        activeRef={activeRef}
        pointerRef={pointerRef}
        colors={colors}
      />
    </section>
  );
}
