"use client";

import { useEffect, useState } from "react";
import { useLenis } from "./SmoothScroll";
import Magnetic from "./Magnetic";
import ThemeToggle from "./ThemeToggle";
import { site } from "@/data/site";

const links = [
  { label: "Work", target: "#work" },
  { label: "About", target: "#about" },
  { label: "Certs", target: "#credentials" },
  { label: "Contact", target: "#contact" },
];

export default function Nav() {
  const lenis = useLenis();
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    tick();
    const id = window.setInterval(tick, 1000 * 20);
    return () => window.clearInterval(id);
  }, []);

  const go = (e: React.MouseEvent, target: string) => {
    e.preventDefault();
    const el = document.querySelector(target);
    if (!el) return;
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: 0 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="nav">
      <div className="nav__left">
        <Magnetic strength={0.3}>
          <a
            className="nav__brand"
            href="#top"
            data-cursor=""
            onClick={(e) => {
              e.preventDefault();
              lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0 });
            }}
          >
            Crsgh
            <span className="mono">/{site.initials}</span>
          </a>
        </Magnetic>
        <ThemeToggle />
      </div>

      <nav className="nav__links">
        <span className="nav__link nav__link--hide mono" aria-hidden>
          {site.location} · {clock}
        </span>
        {links.map((l) => (
          <Magnetic key={l.label} strength={0.25}>
            <a
              className="nav__link"
              href={l.target}
              data-cursor=""
              onClick={(e) => go(e, l.target)}
            >
              {l.label}
            </a>
          </Magnetic>
        ))}
      </nav>
    </header>
  );
}
