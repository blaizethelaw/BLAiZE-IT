// src/components/AnimatedLogo.jsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Vertex shader: passes UVs through.
const flameVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader: flame distortion + optional nebula overlay on top half.
const flameFragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouse;

  // Hash / random helpers
  float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // 2D value noise
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
  }

  // Fractal Brownian Motion
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    // Distance from mouse (in UV space)
    float mouseDist = distance(uv, uMouse);

    // Distort the upper part (flame region)
    if (uv.y > 0.6) {
      float distortion = noise(uv * 4.0 + uTime * 0.8) * 0.03;
      uv.y += noise(uv * 3.0 + uTime * 1.5) * 0.04; // upward flicker
      uv.x += distortion;

      // React to mouse proximity
      if (mouseDist < 0.3) {
        uv.x += (noise(uv * 10.0 + uTime * 2.0) - 0.5) * 0.05 * (1.0 - mouseDist / 0.3);
      }
    }

    vec4 baseColor = texture2D(uTexture, uv);

    // Discard fully transparent areas of the logo
    if (baseColor.a < 0.1) {
      discard;
    }

    // Optional nebula tint on the top half for extra depth
    if (vUv.y > 0.5) {
      float n = fbm(vUv * 4.0 + uTime * 0.2);
      vec3 color1 = vec3(0.2, 0.8, 1.0); // cyan
      vec3 color2 = vec3(0.8, 0.4, 1.0); // purple
      vec3 nebula = mix(color1, color2, n);
      baseColor.rgb = mix(baseColor.rgb, nebula, 0.5);
    }

    gl_FragColor = baseColor;
  }
`;

export default function AnimatedLogo() {
  const mountRef = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene / camera / renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Texture
    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://i.imgur.com/VHCRCEn.png', (tex) => {
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
    });
    // For ShaderMaterial sampling orientation
    texture.flipY = false;

    // Geometry / material / mesh
    const geometry = new THREE.PlaneGeometry(8, 8);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      },
      vertexShader: flameVertexShader,
      fragmentShader: flameFragmentShader,
      transparent: true,
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Mouse tracking (UV space)
    const handleMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height; // invert Y for UV
      mouse.current.x = THREE.MathUtils.clamp(x, 0, 1);
      mouse.current.y = THREE.MathUtils.clamp(y, 0, 1);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Render loop
    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      material.uniforms.uTime.value = clock.getElapsedTime();
      material.uniforms.uMouse.value.lerp(
        new THREE.Vector2(mouse.current.x, mouse.current.y),
        0.1
      );
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      scene.remove(plane);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: '400px', height: '400px', maxWidth: '90vw', maxHeight: '90vw' }}
    />
  );
}
