"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "@/lib/gsap";
import { site } from "@/data/site";
import { INTRO_EVENT } from "./Preloader";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const play = () => {
        gsap.fromTo(
          ".hero__title .line-mask > span",
          { yPercent: 110, y: 0 },
          {
            yPercent: 0,
            y: 0,
            duration: 1.2,
            ease: "expo.out",
            stagger: 0.09,
          }
        );
        gsap.to(".hero__meta", {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "expo.out",
          delay: 0.45,
        });
      };

      gsap.set(".hero__meta", { opacity: 0, y: 24 });

      if ((window as unknown as { __introPlayed?: boolean }).__introPlayed) {
        play();
      } else {
        window.addEventListener(INTRO_EVENT, play, { once: true });
      }

      // subtle parallax drift of the title as you scroll
      gsap.to(".hero__title", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const [l1, l2, l3] = site.heroLines;

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero__canvas">
        <HeroCanvas />
      </div>

      <div className="hero__inner">
        <span className="mono" style={{ color: "var(--bone-dim)" }}>
          {site.location} — Portfolio ’26
        </span>

        <h1 className="hero__title" style={{ marginTop: "0.6rem" }}>
          <span className="line-mask">
            <span>{l1}</span>
          </span>
          <span className="line-mask">
            <span>{l2}</span>
          </span>
          <span className="line-mask">
            <span>
              <i className="ix">&amp;</i> {l3?.replace(/^&\s*/, "")}
            </span>
          </span>
        </h1>

        <div className="hero__meta">
          <p className="hero__tagline">{site.heroTagline}</p>
          <div className="hero__scroll mono">
            <span>Scroll</span>
            <i>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path
                  d="M5.5 1v9M1 5.5l4.5 4.5L10 5.5"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </i>
          </div>
        </div>
      </div>
    </section>
  );
}
