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
  role: "Software Engineer",
  location: "Marilao, PH",
  email: "carlosdrmiranda@gmail.com",

  // Hero
  heroLines: ["Crsgh", "Software", "& Engineer"],
  heroTagline:
    "Full-stack engineer building scalable web applications, internal developer tools and third-party platform integrations.",

  // About
  aboutLead:
    "I'm a full-stack software engineer with 2+ years of hands-on experience architecting and delivering scalable web applications, internal developer tools and third-party platform integrations.",
  aboutBody:
    "I shipped a production service request platform handling 200+ users with role-based access control, automated workflows and real-time status synchronization. I own projects end-to-end across React, Next.js, Node.js, TypeScript, PHP, Laravel and Python — from requirements gathering through deployment and release management.",

  services: [
    "Full-Stack Development",
    "Platform Integrations",
    "API Engineering",
    "Workflow Automation",
    "Release Management",
  ],

  // Footer / contact
  socials: [
    { label: "GitHub", href: "https://github.com/crsgh" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/carlos-miranda-82164b39b",
    },
    { label: "Email", href: "mailto:carlosdrmiranda@gmail.com" },
  ],

  projects: [
    {
      id: "01",
      title: "Orbit Support Portal",
      subtitle: "Service request platform · Jira + ConnectWise",
      year: "2025",
      role: "Software Engineering Intern · GlobalTek BPO",
      tags: ["React", "Next.js", "Node.js", "TypeScript", "MongoDB"],
      colors: ["#ff4d23", "#d8ff3e"],
      href: "#",
    },
    {
      id: "02",
      title: "Freelance Full-Stack",
      subtitle: "Client web apps, APIs & payments",
      year: "2024",
      role: "Full-Stack Developer (PHP & Laravel)",
      tags: ["PHP", "Laravel", "MySQL", "PayMongo", "Webhooks"],
      colors: ["#6a3cff", "#29ffd6"],
      href: "#",
    },
    {
      id: "03",
      title: "PetVax",
      subtitle: "Multi-vendor veterinary services platform",
      year: "2024",
      role: "Design + Build",
      tags: ["Laravel", "Flutter", "REST APIs", "Geotagging"],
      colors: ["#ff2e7e", "#ffb627"],
      href: "#",
    },
    {
      id: "04",
      title: "Patintero",
      subtitle: "A Filipino street game, digitized",
      year: "2023",
      role: "Game Developer",
      tags: ["Python", "Pygame"],
      colors: ["#1f6bff", "#b6ff00"],
      href: "#",
    },
  ] satisfies Project[],

  // Education
  education: [
    {
      school: "FEU Institute of Technology",
      degree:
        "BS Information Technology — Web & Mobile Applications",
      location: "Sampaloc, Manila",
      period: "2022 — 2026",
    },
  ],

  // Certifications
  certifications: [
    { name: "DevNet Associate", issuer: "Cisco", year: "2026" },
    {
      name: "CCNA: Enterprise Networking, Security & Automation",
      issuer: "Cisco",
      year: "2025",
    },
    { name: "CyberOps Associate", issuer: "Cisco", year: "2025" },
    {
      name: "PMI Project Management Ready™",
      issuer: "Project Management Institute",
      year: "2025",
    },
    {
      name: "IT Specialist — Python",
      issuer: "Certiport (Pearson VUE)",
      year: "2025",
    },
    {
      name: "IT Specialist — HTML & CSS",
      issuer: "Certiport (Pearson VUE)",
      year: "2024",
    },
    {
      name: "IT Specialist — Networking",
      issuer: "Certiport (Pearson VUE)",
      year: "2024",
    },
  ],
};

export type Site = typeof site;
