"use client";

/* ============================================================================
   SMOKE BACKGROUND — site-wide cigarette plume off the cursor
   ----------------------------------------------------------------------------
   A lightweight GPU fluid mounted as a fixed, full-viewport layer behind every
   section. A ping-pong pair of render targets holds a smoke density field that
   is advected (rises + curls), diffused and dissipated every frame, with fresh
   smoke injected at the cursor (the cigarette's ember).

   • A constant haze (uAmbient ~30%) rises from the bottom so the page is never
     plain. The ember always burns wherever the pointer is — a plume at ~70%
     when idle (uEmber) ramping to 100% with speed, plus a trail when moving.
   • Colour is cool grey lifting to white, like cigarette / vape smoke — never
     yellow. The page background shows through the wispy, translucent edges.
   • The simulation runs at half resolution, so it holds 60fps comfortably; the
     display pass is one cheap textured quad.
   ========================================================================== */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { THEME_EVENT, THEME_PALETTE, getStoredTheme } from "@/lib/theme";

/* fullscreen-quad vertex shader for the simulation passes (clip-space passthrough) */
const simVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/* standard transformed vertex shader for the visible display plane */
const displayVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* ---- the simulation step ------------------------------------------------- */
const simFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uPrev;        // previous density field
  uniform vec2  uPointer;         // current pointer, uv space (y up)
  uniform vec2  uPrevPointer;     // pointer last frame
  uniform float uTrail;           // movement-trail strength (0..1)
  uniform float uEmber;           // ember plume intensity (0 off · ~0.7 idle · 1 moving)
  uniform float uAmbient;         // bottom ambient haze intensity (~0.3)
  uniform float uTime;
  uniform float uDt;
  uniform vec2  uTexel;           // 1 / simResolution
  uniform float uAspect;          // width / height

  // Simplex 2D noise — Ashima Arts (public domain)
  vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
                  + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                            dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // shortest distance from p to segment a-b (so fast strokes stay continuous)
  float segDist(vec2 p, vec2 a, vec2 b){
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main(){
    vec2 uv  = vUv;
    vec2 asp = vec2(uAspect, 1.0);

    // --- velocity field: gentle rise + curling turbulence (uv units / sec) ---
    float t  = uTime * 0.15;
    vec2  np = uv * asp * 2.4;
    float a  = snoise(np + vec2(0.0, t));
    float b  = snoise(np + vec2(7.3, -t) + 19.0);
    vec2  curl = vec2(b, -a);
    // density lifts faster (hot air rises) — read the field a touch lower as it climbs
    float lift = 0.05 + 0.045 * smoothstep(0.0, 1.0, uv.y);
    vec2  vel  = vec2(curl.x * 0.05, lift + curl.y * 0.04);

    // --- semi-Lagrangian advection ---
    vec2  src = uv - vel * uDt;
    float d   = texture2D(uPrev, src).r;

    // --- cheap diffusion (4-tap) so it billows softly instead of streaking ---
    float blur = (
      texture2D(uPrev, src + vec2(uTexel.x, 0.0)).r +
      texture2D(uPrev, src - vec2(uTexel.x, 0.0)).r +
      texture2D(uPrev, src + vec2(0.0, uTexel.y)).r +
      texture2D(uPrev, src - vec2(0.0, uTexel.y)).r
    ) * 0.25;
    d = mix(d, blur, 0.12);

    // --- dissipation (frame-rate independent) ---
    d *= exp(-uDt * 0.62);

    // --- emit smoke ---------------------------------------------------------
    // rate factor keeps the steady emission identical at 60 or 120Hz
    float rate = uDt * 60.0;
    float wisp = 0.5 + 0.5 * snoise(uv * asp * 9.0 + t * 4.0);

    // ambient haze rising from the bottom — always on so the page never looks
    // plain. A soft band across the floor that the advection lifts and thins.
    float floorBand = smoothstep(0.26, 0.0, uv.y);
    float aN = 0.45 + 0.55 * snoise(vec2(uv.x * 3.2 + t * 1.3, t * 0.5));
    d += floorBand * aN * uAmbient * 0.02 * rate;

    // cigarette plume + movement trail, at the ember (where the pointer is)
    if (uEmber > 0.0001) {
      // movement trail: a continuous stroke from last frame's ember to this one
      float distSeg = segDist(uv * asp, uPrevPointer * asp, uPointer * asp);
      float trail   = smoothstep(0.05, 0.0, distSeg);
      d += trail * uTrail * wisp * 1.6;

      // always-on plume: a wisp at the ember, biased upward so it lifts
      vec2 e = (uv - uPointer) * asp;
      e.y = (e.y - 0.03) * 0.6;          // shift up + stretch vertically (teardrop)
      float tip  = smoothstep(0.07, 0.0, length(e));
      float burn = 0.7 + 0.3 * snoise(vec2(t * 6.0, 11.0)); // the source breathes
      d += tip * uEmber * wisp * burn * 0.02 * rate;
    }

    d = clamp(d, 0.0, 1.5);
    gl_FragColor = vec4(d, d, d, 1.0);
  }
`;

/* ---- the display pass: colour the density like real smoke ----------------- */
const displayFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uMap;
  uniform vec3 uBg;
  uniform vec3 uSmokeLo;
  uniform vec3 uSmokeHi;
  uniform vec2 uRes;

  void main(){
    float d = texture2D(uMap, vUv).r;

    // soft bloom — a few offset taps so the smoke glows instead of banding
    float b = (
      texture2D(uMap, vUv + vec2( 0.004, 0.0)).r +
      texture2D(uMap, vUv + vec2(-0.004, 0.0)).r +
      texture2D(uMap, vUv + vec2(0.0,  0.006)).r +
      texture2D(uMap, vUv + vec2(0.0, -0.006)).r
    ) * 0.25;
    d = clamp(max(d, b * 0.85), 0.0, 1.0);
    float dd = pow(d, 0.8);

    // smoke palette (theme-driven): low-density tint → dense tint
    vec3 smoke = mix(uSmokeLo, uSmokeHi, smoothstep(0.12, 0.95, dd));

    // wispy translucent edges — composite over the dark page colour
    float alpha = smoothstep(0.0, 0.4, dd);
    vec3  col   = mix(uBg, smoke, alpha);

    // subtle vignette so the page has a little depth
    float vig = smoothstep(1.15, 0.35, length(vUv - 0.5));
    col *= 0.9 + 0.1 * vig;

    // faint film grain to keep it from banding
    float g = fract(sin(dot(vUv * uRes, vec2(12.9898, 78.233))) * 43758.5453);
    col += (g - 0.5) * 0.02 * alpha;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Smoke() {
  const { gl, size, viewport } = useThree();

  // simulation runs at half the CSS resolution — plenty soft, very cheap
  const simW = Math.max(2, Math.floor(size.width * 0.5));
  const simH = Math.max(2, Math.floor(size.height * 0.5));

  // Render-target precision. Half-float gives the smoothest feedback loop, but
  // a lot of mobile GPUs can't render *into* a half-float colour buffer (the
  // framebuffer comes back incomplete and the field stays empty — i.e. no smoke
  // on phones). Rendering to half-float requires EXT_color_buffer_float under
  // WebGL2; when that isn't available, fall back to 8-bit unsigned-byte targets,
  // which are colour-renderable and linearly filterable everywhere. Byte targets
  // clamp the density at 1.0 instead of 1.5, which is visually indistinguishable
  // here, so the smoke shows up on every device.
  const rtType = useMemo(() => {
    const canRenderHalfFloat =
      gl.capabilities.isWebGL2 && !!gl.extensions.get("EXT_color_buffer_float");
    return canRenderHalfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType;
  }, [gl]);

  // pointer state, tracked in uv space (0..1, y up) from window events
  const pointer = useRef(new THREE.Vector2(0.5, 0.5));
  const prevPointer = useRef(new THREE.Vector2(0.5, 0.5));
  const hasMoved = useRef(false);
  const inside = useRef(false);
  const reduced = useRef(false);
  const visible = useRef(true);
  // touch / coarse-pointer support: drift the ember on its own so the smoke is
  // alive on phones, where there is no cursor to follow.
  const coarse = useRef(false);
  const lastInput = useRef(0);
  const autoSeeded = useRef(false);

  // ping-pong targets (recreated on resize or precision change)
  const targets = useMemo(() => {
    const opts: THREE.RenderTargetOptions = {
      type: rtType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    };
    return {
      a: new THREE.WebGLRenderTarget(simW, simH, opts),
      b: new THREE.WebGLRenderTarget(simW, simH, opts),
    };
  }, [simW, simH, rtType]);

  const read = useRef(targets.a);
  const write = useRef(targets.b);

  // offscreen scene that runs the simulation step
  const sim = useMemo(() => {
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const mat = new THREE.ShaderMaterial({
      vertexShader: simVertex,
      fragmentShader: simFragment,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uPrev: { value: null as THREE.Texture | null },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uPrevPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uTrail: { value: 0 },
        uEmber: { value: 0 },
        uAmbient: { value: 0.3 }, // constant bottom haze (~30%)
        uTime: { value: 0 },
        uDt: { value: 0 },
        uTexel: { value: new THREE.Vector2(1 / simW, 1 / simH) },
        uAspect: { value: simW / simH },
      },
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    quad.frustumCulled = false;
    scene.add(quad);
    return { scene, cam, mat, quad };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // material for the visible plane
  const displayMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: displayVertex,
        fragmentShader: displayFragment,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uMap: { value: null as THREE.Texture | null },
          uBg: { value: new THREE.Vector3(0.039, 0.039, 0.047) },
          uSmokeLo: { value: new THREE.Vector3(0.32, 0.34, 0.39) },
          uSmokeHi: { value: new THREE.Vector3(0.95, 0.965, 1.0) },
          uRes: { value: new THREE.Vector2(1, 1) },
        },
      }),
    []
  );

  // keep the smoke palette in sync with the active light/dark theme
  useEffect(() => {
    const sync = () => {
      const p = THEME_PALETTE[getStoredTheme()];
      const u = displayMat.uniforms;
      (u.uBg.value as THREE.Vector3).set(...p.bg);
      (u.uSmokeLo.value as THREE.Vector3).set(...p.lo);
      (u.uSmokeHi.value as THREE.Vector3).set(...p.hi);
    };
    sync();
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, [displayMat]);

  // on (re)size: resync uniforms, clear both targets to empty, dispose on cleanup
  useEffect(() => {
    sim.mat.uniforms.uTexel.value.set(1 / simW, 1 / simH);
    sim.mat.uniforms.uAspect.value = simW / simH;

    gl.setRenderTarget(targets.a);
    gl.clear();
    gl.setRenderTarget(targets.b);
    gl.clear();
    gl.setRenderTarget(null);

    read.current = targets.a;
    write.current = targets.b;

    return () => {
      targets.a.dispose();
      targets.b.dispose();
    };
  }, [targets, simW, simH, gl, sim]);

  // dispose the persistent sim/display resources when the component unmounts
  useEffect(() => {
    const { quad, mat } = sim;
    return () => {
      quad.geometry.dispose();
      mat.dispose();
      displayMat.dispose();
    };
  }, [sim, displayMat]);

  // pointer tracking (window-level so it works under the hero text overlay)
  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    coarse.current = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    const sample = (clientX: number, clientY: number) => {
      const rect = gl.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (clientX - rect.left) / rect.width;
      const y = 1 - (clientY - rect.top) / rect.height; // flip to uv (y up)
      inside.current = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      pointer.current.set(x, y);
      lastInput.current = performance.now();
      autoSeeded.current = false; // a real touch overrides the auto-drift
      if (!hasMoved.current) {
        // seed history so the first sample doesn't draw a line from the centre
        prevPointer.current.set(x, y);
        hasMoved.current = true;
      }
    };

    const onPointer = (e: PointerEvent) => sample(e.clientX, e.clientY);
    // touch fallback for browsers that don't deliver pointer events while a
    // finger is dragging (and so the plume follows the finger on phones)
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) sample(t.clientX, t.clientY);
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });

    // pause the simulation if the canvas is ever not on screen
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(gl.domElement);

    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouch);
      io.disconnect();
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (!visible.current) return; // canvas off-screen — nothing to draw
    const dt = Math.min(delta, 1 / 30); // clamp after tab-outs / hitches

    displayMat.uniforms.uRes.value.set(size.width, size.height);

    if (reduced.current) {
      // honour reduced-motion: leave the field empty, show only the background
      displayMat.uniforms.uMap.value = read.current.texture;
      return;
    }

    // on touch devices, once the finger lifts, let the ember wander on its own
    // so the smoke keeps living instead of freezing where the touch ended.
    const idle = performance.now() - lastInput.current > 1100;
    if (coarse.current && idle) {
      const t = performance.now() * 0.001;
      const ax = 0.5 + 0.3 * Math.sin(t * 0.5) + 0.07 * Math.sin(t * 1.7);
      const ay = 0.45 + 0.28 * Math.cos(t * 0.42) + 0.06 * Math.cos(t * 1.3);
      if (!autoSeeded.current) {
        prevPointer.current.set(ax, ay); // avoid a jump on the first auto frame
        autoSeeded.current = true;
      }
      pointer.current.set(ax, ay);
      inside.current = true;
      hasMoved.current = true;
    }

    // the ember is always burning wherever the pointer is: a steady plume
    // at ~70% idle that ramps to 100% with speed, plus a trail while moving.
    const active = hasMoved.current && inside.current;
    const speed = active ? pointer.current.distanceTo(prevPointer.current) : 0;
    const mv = Math.min(speed * 9.0, 1.0); // 0 when still, 1 when moving fast

    const u = sim.mat.uniforms;
    u.uPrev.value = read.current.texture;
    u.uPointer.value.copy(pointer.current);
    u.uPrevPointer.value.copy(prevPointer.current);
    u.uEmber.value = active ? 0.7 + 0.3 * mv : 0; // ≥70% idle → 100% moving
    u.uTrail.value = active ? mv : 0;
    u.uTime.value += dt;
    u.uDt.value = dt;

    // step the simulation: read -> write
    gl.setRenderTarget(write.current);
    gl.render(sim.scene, sim.cam);
    gl.setRenderTarget(null);

    // swap and feed the freshly written field to the display plane
    const tmp = read.current;
    read.current = write.current;
    write.current = tmp;
    displayMat.uniforms.uMap.value = read.current.texture;

    prevPointer.current.copy(pointer.current);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]} material={displayMat}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

export default function SmokeBackground() {
  return (
    <Canvas
      className="smoke-bg"
      // fixed, full-viewport, behind every section; never intercepts pointer
      // events (the pointer is read from window listeners instead)
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}
      dpr={[1, 2]}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 1], fov: 50 }}
    >
      <Smoke />
    </Canvas>
  );
}
