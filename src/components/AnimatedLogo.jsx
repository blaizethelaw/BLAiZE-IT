import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 2D fbm noise + HSV isolation to primarily animate the neon-green flame region
const FRAG = `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uTex;
  uniform vec2  uRes;
  uniform float uTime;
  uniform vec2  uMouse;   // [-1,1] centered
  uniform float uAmp;     // distortion amplitude
  uniform float uDetail;  // noise detail

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.,0.));
    float c = hash(i + vec2(0.,1.));
    float d = hash(i + vec2(1.,1.));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
  }
  float fbm(vec2 p){
    float s = 0.0;
    float a = 0.5;
    for(int i=0;i<5;i++){
      s += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return s;
  }

  vec3 rgb2hsv(vec3 c){
    vec4 K = vec4(0., -1./3., 2./3., -1.);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y)/(6.*d+e)), d/(q.x+e), q.x);
  }

  vec3 nebula(vec2 uv, float t){
    float n = fbm(uv*2.5 + vec2(0.0, t*0.3));
    float m = fbm(uv*4.0 + vec2(t*0.1, -t*0.2));
    float v = smoothstep(0.35, 0.9, n*0.75 + m*0.25);
    vec3 c1 = vec3(0.1, 0.8, 0.2);
    vec3 c2 = vec3(1.0, 0.45, 0.0);
    return mix(c1, c2, v) * 0.3;
  }

  void main(){
    vec2 uv = vUv;

    vec4 tex = texture2D(uTex, uv);
    vec3 hsv = rgb2hsv(tex.rgb);

    // Hue band around ~0.33 (green), plus high saturation/value
    float greenBand = 1.0 - smoothstep(0.36, 0.52, abs(hsv.x - 0.33));
    float flameMask = greenBand * smoothstep(0.55, 0.9, hsv.y) * smoothstep(0.55, 0.95, hsv.z);

    // Upward flow + mouse turbulence
    float flow = fbm(uv * (2.0 + uDetail) + vec2(0.0, uTime*0.25));
    float mouseHeat = clamp(length(uMouse)*0.6, 0.0, 1.0);
    float wobble = (flow*0.6 + fbm(uv*6.0 + uTime*0.5)) * (uAmp * (0.6 + 0.7*mouseHeat));

    vec2 duv = uv + flameMask * (vec2(wobble*0.02, -wobble*0.045));
    vec4 texFlame = texture2D(uTex, duv);

    vec3 neb = nebula(uv + uTime*0.08 + uMouse*0.05, uTime);
    vec3 mixed = mix(tex.rgb, texFlame.rgb + neb, clamp(flameMask, 0.0, 1.0));

    float glow = smoothstep(0.6, 0.95, flameMask) * 0.12;
    mixed += vec3(glow, glow, glow*0.6);

    gl_FragColor = vec4(mixed, tex.a);
  }
`;

export default function AnimatedLogo({
  logoUrl = "https://i.imgur.com/VHCRCEn.png",
  width = 512,
  quality = "med", // 'low' | 'med' | 'high'
}) {
  const mountRef = useRef(null);
  const uniformsRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, width, false);
    mount.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    let mesh, material, geometry;
    let disposed = false;

    // handlers we can clean up
    let onMove = null;
    let onLeave = null;
    let onResize = null;
    const canvas = renderer.domElement;

    const tex = loader.load(
      logoUrl,
      (texture) => {
        if (disposed) return;

        texture.anisotropy = Math.min(
          8,
          renderer.capabilities.getMaxAnisotropy()
        );
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const aspect =
          texture.image && texture.image.width
            ? texture.image.width / texture.image.height
            : 1;
        const targetW = width;
        const targetH = Math.round(targetW / Math.max(aspect, 0.01));

        renderer.setSize(targetW, targetH, false);
        mount.style.width = `${targetW}px`;
        mount.style.height = `${targetH}px`;

        geometry = new THREE.PlaneGeometry(2, 2);

        const amp = quality === "high" ? 1.0 : quality === "low" ? 0.5 : 0.8;
        const detail = quality === "high" ? 1.0 : quality === "low" ? 0.2 : 0.6;

        const uniforms = {
          uTex: { value: texture },
          uRes: { value: new THREE.Vector2(targetW, targetH) },
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uAmp: { value: amp },
          uDetail: { value: detail },
        };
        uniformsRef.current = uniforms;

        material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
        });

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        onMove = (e) => {
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          uniforms.uMouse.value.set((x - 0.5) * 2.0, (0.5 - y) * 2.0);
        };
        onLeave = () => uniforms.uMouse.value.set(0, 0);
        onResize = () => {
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.setSize(targetW, targetH, false);
          uniforms.uRes.value.set(targetW, targetH);
        };

        canvas.addEventListener("mousemove", onMove);
        canvas.addEventListener("mouseleave", onLeave);
        window.addEventListener("resize", onResize);

        let last = performance.now();
        const tick = (t) => {
          const dt = (t - last) / 1000;
          last = t;
          uniforms.uTime.value += dt;
          renderer.render(scene, camera);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }
    );

    return () => {
      disposed = true;
      cancelAnimationFrame(rafRef.current);
      if (onResize) window.removeEventListener("resize", onResize);
      if (onMove) canvas.removeEventListener("mousemove", onMove);
      if (onLeave) canvas.removeEventListener("mouseleave", onLeave);
      if (mesh) scene.remove(mesh);
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [logoUrl, width, quality]);

  return (
    <div
      ref={mountRef}
      className="relative select-none pointer-events-auto"
      style={{ width, height: width }}
      aria-label="BLAiZE IT animated flame logo"
      role="img"
    />
  );
}
