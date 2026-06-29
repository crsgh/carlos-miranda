"use client";

import { cloneElement, useRef, type ReactElement } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Wraps a single element and pulls it toward the pointer while hovered.
 * Usage: <Magnetic><a href="#">link</a></Magnetic>
 */
export default function Magnetic({
  children,
  strength = 0.4,
}: {
  children: ReactElement<Record<string, unknown>>;
  strength?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  const xTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const yTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  const ensure = () => {
    if (!ref.current) return;
    if (!xTo.current) {
      xTo.current = gsap.quickTo(ref.current, "x", {
        duration: 0.9,
        ease: "elastic.out(1, 0.4)",
      });
      yTo.current = gsap.quickTo(ref.current, "y", {
        duration: 0.9,
        ease: "elastic.out(1, 0.4)",
      });
    }
  };

  const onMove = (e: React.MouseEvent) => {
    ensure();
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    xTo.current?.(relX * strength);
    yTo.current?.(relY * strength);
  };

  const onLeave = () => {
    xTo.current?.(0);
    yTo.current?.(0);
  };

  return cloneElement(children, {
    ref,
    onMouseMove: onMove,
    onMouseLeave: onLeave,
  } as Record<string, unknown>);
}
