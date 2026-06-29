"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { site } from "@/data/site";

export default function Credentials() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(".cred__row", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: { trigger: ".cred__list", start: "top 85%" },
      });
      gsap.from(".cred__edu", {
        opacity: 0,
        y: 26,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".cred__edu", start: "top 88%" },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="cred shell" id="credentials" ref={root}>
      <div className="cred__head">
        <h2>
          Education
          <br />
          &amp; Certs
        </h2>
        <span className="mono" style={{ color: "var(--bone-dim)" }}>
          ({String(site.certifications.length).padStart(2, "0")}) — certified
        </span>
      </div>

      <div className="cred__grid">
        <div>
          <span className="cred__label mono">Education</span>
          {site.education.map((e) => (
            <div className="cred__edu" key={e.school}>
              <h3>{e.school}</h3>
              <p>{e.degree}</p>
              <span className="mono">
                {e.location} · {e.period}
              </span>
            </div>
          ))}
        </div>

        <div>
          <span className="cred__label mono">Certifications</span>
          <div className="cred__list">
            {site.certifications.map((c) => (
              <div className="cred__row" key={c.name}>
                <span className="cred__name">{c.name}</span>
                <span className="cred__meta mono">
                  {c.issuer} · {c.year}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
