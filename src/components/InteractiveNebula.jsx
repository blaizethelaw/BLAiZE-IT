import React, { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aScale;
  attribute float aSpeed;
  varying vec3 vColor;
  varying float vAlpha;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vec3 pos = position;

    // Multi-layered noise for organic movement
    float time = uTime * aSpeed;
    float noise1 = snoise(vec3(pos.x * 0.3, pos.y * 0.3, time * 0.5));
    float noise2 = snoise(vec3(pos.x * 0.7 + 100.0, pos.y * 0.7, time * 0.3)) * 0.5;
    float noise3 = snoise(vec3(pos.x * 1.4 + 200.0, pos.y * 1.4, time * 0.7)) * 0.25;
    float totalNoise = noise1 + noise2 + noise3;

    // Breathing effect
    float breathe = sin(time * 2.0) * 0.1 + 1.0;

    // Apply noise deformation
    pos.xy += vec2(
      snoise(vec3(pos.x * 0.5, pos.y * 0.5, time)) * 0.3,
      snoise(vec3(pos.x * 0.5 + 50.0, pos.y * 0.5, time)) * 0.3
    ) * breathe;

    // Mouse interaction
    float dist = distance(pos.xy, uMouse);
    float influence = 1.0 - smoothstep(0.0, 2.0, dist);
    vec2 direction = normalize(pos.xy - uMouse);
    pos.xy += direction * influence * 0.5 * (0.5 + totalNoise * 0.5);

    // Z displacement for depth
    pos.z += totalNoise * 0.4 * breathe;

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Dynamic point size
    float sizeModifier = 1.0 + totalNoise * 0.3 + influence * 0.5;
    gl_PointSize = uSize * aScale * uPixelRatio * sizeModifier * breathe;
    gl_PointSize *= (1.0 / -viewPosition.z);

    // Color variation
    vec3 baseColor = vec3(0.3, 0.6, 1.0); // Cyan-blue base
    vec3 highlightColor = vec3(0.5, 0.8, 1.0); // Lighter cyan
    vec3 accentColor = vec3(1.0, 0.6, 0.8); // Pink accent

    float colorMix = totalNoise * 0.5 + 0.5;
    vColor = mix(baseColor, highlightColor, colorMix);
    vColor = mix(vColor, accentColor, influence * 0.3);

    // Alpha based on various factors
    vAlpha = 0.15 + influence * 0.2 + (totalNoise * 0.5 + 0.5) * 0.1;
    vAlpha *= breathe;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Soft circular particles
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    float strength = 1.0 - smoothstep(0.0, 0.5, dist);

    // Glow effect
    float glow = exp(-dist * 4.0);

    vec3 finalColor = vColor + vec3(glow * 0.2);
    float finalAlpha = vAlpha * strength * (0.6 + glow * 0.4);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

function Nebula() {
  const { size, viewport } = useThree();
  const mouse = useRef([0, 0]);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uSize: { value: 30.0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
  }), []);

  const particles = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);

    // Create circular distribution with more particles in center
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 5; // Square root for even distribution

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

      scales[i] = Math.random() * 0.8 + 0.2;
      speeds[i] = Math.random() * 0.5 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    return geo;
  }, []);

  useFrame((state, delta) => {
    uniforms.uTime.value += delta * 0.15;

    const targetMouse = new THREE.Vector2(
      (mouse.current[0] / size.width) * 2 - 1,
      -(mouse.current[1] / size.height) * 2 + 1
    ).multiplyScalar(viewport.width / 2);

    uniforms.uMouse.value.lerp(targetMouse, 0.1);
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current = [e.clientX, e.clientY];
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <points geometry={particles}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function InteractiveNebula() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      pointerEvents: 'none',
      background: 'radial-gradient(circle at center, rgba(77, 153, 0, 0.05) 0%, transparent 70%)'
    }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 75 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 0);
        }}
      >
        <Suspense fallback={null}>
          <Nebula />
        </Suspense>
      </Canvas>
    </div>
  );
}
