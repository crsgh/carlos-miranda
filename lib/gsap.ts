"use client";

// Single GSAP instance for the whole app. Importing this module registers
// ScrollTrigger at evaluation time — which always runs before any React effect
// — so every scroll-driven tween finds the plugin already registered.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
