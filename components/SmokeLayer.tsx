"use client";

import dynamic from "next/dynamic";

// WebGL must never run on the server — load the smoke field client-side only.
const SmokeBackground = dynamic(() => import("./SmokeBackground"), {
  ssr: false,
});

export default function SmokeLayer() {
  return <SmokeBackground />;
}
