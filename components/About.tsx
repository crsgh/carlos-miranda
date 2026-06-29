"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import Words from "./Words";
import { site } from "@/data/site";

export default function About() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".about__lead .reveal-word > span",
        { yPercent: 110, y: 0 },
        {
          yPercent: 0,
          y: 0,
          duration: 1,
          ease: "expo.out",
          stagger: 0.025,
          scrollTrigger: { trigger: ".about__lead", start: "top 82%" },
        }
      );

      gsap.from(".about__body", {
        opacity: 0,
        y: 26,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about__body", start: "top 88%" },
      });

      gsap.from(".about__service", {
        opacity: 0,
        y: 22,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".about__services", start: "top 85%" },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className="about shell" id="about" ref={root}>
      <div className="about__grid">
        <div>
          <span className="about__label mono">About</span>
          <p className="about__body" style={{ marginTop: "1.6rem" }}>
            {site.aboutBody}
          </p>
          <div className="about__services">
            {site.services.map((s, i) => (
              <div className="about__service" key={s}>
                <span>{s}</span>
                <span className="mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="about__lead">
          <Words text={site.aboutLead} />
        </p>
      </div>
    </section>
  );
}
