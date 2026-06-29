"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uHover;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float ripple = sin(pos.x * 6.0 + uTime * 2.2) * 0.035
                 + cos(pos.y * 5.0 - uTime * 1.6) * 0.035;
    pos.z += ripple * uHover;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uHover;
  uniform vec3  uColorA;
  uniform vec3  uColorB;

  void main() {
    vec2 uv = vUv;

    // diagonal flowing duotone
    float g = smoothstep(0.0, 1.0, uv.y + sin(uv.x * 7.0 + uTime * 0.8) * 0.08);
    vec3 col = mix(uColorA, uColorB, g);

    // moving sheen band
    float band = sin((uv.x - uv.y) * 5.0 + uTime * 1.4) * 0.5 + 0.5;
    col += pow(band, 3.0) * 0.18;

    // soft inner vignette to give the plane depth
    float vig = smoothstep(1.3, 0.35, length((uv - 0.5) * 1.6));
    col *= 0.78 + vig * 0.22;

    // grain
    float n = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
    col += (n - 0.5) * 0.05;

    gl_FragColor = vec4(col, uHover);
  }
`;

type Vec2Ref = MutableRefObject<{ x: number; y: number }>;
type NumRef = MutableRefObject<number>;

function Plane({
  activeRef,
  pointerRef,
  colors,
}: {
  activeRef: NumRef;
  pointerRef: Vec2Ref;
  colors: [string, string][];
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const hover = useRef(0);
  const lastX = useRef(0);
  const targetA = useRef(new THREE.Color("#ffffff"));
  const targetB = useRef(new THREE.Color("#ffffff"));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uColorA: { value: new THREE.Color("#ffffff") },
      uColorB: { value: new THREE.Color("#ffffff") },
    }),
    []
  );

  useFrame((_, delta) => {
    const idx = activeRef.current;
    const active = idx >= 0 && idx < colors.length;
    const m = mat.current;
    const node = mesh.current;
    if (!m || !node) return;

    if (active) {
      targetA.current.set(colors[idx][0]);
      targetB.current.set(colors[idx][1]);
    }

    m.uniforms.uTime.value += delta;
    (m.uniforms.uColorA.value as THREE.Color).lerp(targetA.current, 0.14);
    (m.uniforms.uColorB.value as THREE.Color).lerp(targetB.current, 0.14);

    hover.current += ((active ? 1 : 0) - hover.current) * 0.12;
    m.uniforms.uHover.value = hover.current;

    // follow pointer (normalized device coords -> world units at z=0)
    const px = (pointerRef.current.x * viewport.width) / 2;
    const py = (pointerRef.current.y * viewport.height) / 2;
    node.position.x += (px - node.position.x) * 0.1;
    node.position.y += (py - node.position.y) * 0.1;

    // velocity-based skew for a touch of fluidity
    const vx = node.position.x - lastX.current;
    lastX.current = node.position.x;
    const targetRot = THREE.MathUtils.clamp(-vx * 0.01, -0.18, 0.18);
    node.rotation.z += (targetRot - node.rotation.z) * 0.12;

    // scale in from the centre as it appears
    const h = viewport.height * 0.4 * (0.55 + hover.current * 0.45);
    node.scale.set(h * 1.3, h, 1);
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthTest={false}
      />
    </mesh>
  );
}

export default function WorkCanvas({
  activeRef,
  pointerRef,
  colors,
}: {
  activeRef: NumRef;
  pointerRef: Vec2Ref;
  colors: [string, string][];
}) {
  return (
    <Canvas
      className="work__canvas"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 5], fov: 45 }}
    >
      <Plane activeRef={activeRef} pointerRef={pointerRef} colors={colors} />
    </Canvas>
  );
}
