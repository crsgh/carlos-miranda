// ─────────────────────────────────────────────────────────────────────────────
// SITE CONTENT — edit everything about the portfolio from this one file.
// Colors per project drive the WebGL hover planes. Swap in real screenshots
// later by adding `image: "/work/your-shot.jpg"` to a project (see WorkCanvas).
// ─────────────────────────────────────────────────────────────────────────────

export type Project = {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  role: string;
  tags: string[];
  /** Duotone used by the procedural WebGL plane on hover. */
  colors: [string, string];
  href: string;
};

export const site = {
  name: "Carlos Miranda",
  initials: "CM",
  role: "Creative Developer",
  location: "Madrid, ES",
  email: "carlosdrmiranda@gmail.com",

  // Hero
  heroLines: ["Creative", "Developer", "& Designer"],
  heroTagline:
    "I build immersive digital experiences where motion, typography and code collide.",

  // About
  aboutLead:
    "I'm a developer and designer crafting interfaces that move. For the last decade I've turned brands into living, breathing things on the web — blending WebGL, motion design and obsessive attention to detail.",
  aboutBody:
    "I care about the millisecond between a hover and a reaction, the easing of a curtain wipe, the weight of a typeface at 14vw. Every project is a chance to make the screen feel physical.",

  services: [
    "Creative Development",
    "WebGL & Motion",
    "Art Direction",
    "Design Systems",
    "Brand Experiences",
  ],

  // Footer / contact
  socials: [
    { label: "Instagram", href: "#" },
    { label: "GitHub", href: "https://github.com/crsgh" },
    { label: "LinkedIn", href: "#" },
    { label: "Read.cv", href: "#" },
  ],

  projects: [
    {
      id: "01",
      title: "Aurora",
      subtitle: "Commerce, reimagined",
      year: "2025",
      role: "Lead Developer",
      tags: ["WebGL", "Next.js", "Shopify"],
      colors: ["#ff4d23", "#d8ff3e"],
      href: "#",
    },
    {
      id: "02",
      title: "Monolith",
      subtitle: "An archive in motion",
      year: "2024",
      role: "Creative Dev",
      tags: ["Three.js", "GSAP"],
      colors: ["#6a3cff", "#29ffd6"],
      href: "#",
    },
    {
      id: "03",
      title: "Tide",
      subtitle: "Fintech with a pulse",
      year: "2024",
      role: "Design + Build",
      tags: ["React", "Motion"],
      colors: ["#ff2e7e", "#ffb627"],
      href: "#",
    },
    {
      id: "04",
      title: "Field Notes",
      subtitle: "Editorial, alive",
      year: "2023",
      role: "Front-end",
      tags: ["Astro", "Lenis"],
      colors: ["#1f6bff", "#b6ff00"],
      href: "#",
    },
    {
      id: "05",
      title: "Halcyon",
      subtitle: "A festival, online",
      year: "2023",
      role: "Lead Developer",
      tags: ["WebGL", "Sound"],
      colors: ["#00b3a4", "#ffe600"],
      href: "#",
    },
  ] satisfies Project[],
};

export type Site = typeof site;
