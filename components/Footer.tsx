"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import Magnetic from "./Magnetic";
import { site } from "@/data/site";

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(".footer__big", {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".footer__cta", start: "top 85%" },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className="footer shell" id="contact" ref={root}>
      <div className="footer__cta">
        <span className="mono">Got a project in mind?</span>
        <span className="footer__big">
          <Magnetic strength={0.18}>
            <a href={`mailto:${site.email}`} data-cursor="Say hi">
              Let&apos;s talk <span className="arrow">{"↗︎"}</span>
            </a>
          </Magnetic>
        </span>
      </div>

      <div className="footer__bottom">
        <span className="mono">
          © {year} {site.name} — All rights reserved
        </span>
        <div className="footer__socials">
          {site.socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              data-cursor=""
            >
              {s.label}
            </a>
          ))}
        </div>
        <span className="mono">{site.email}</span>
      </div>
    </footer>
  );
}
