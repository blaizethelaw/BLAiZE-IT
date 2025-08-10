import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

// --- GLSL Shader Code ---
// By moving the shaders outside the component, we make the component logic much cleaner.

// Vertex Shader: Deforms the logo's geometry based on mouse position and time.
const vertexShader = `
  // Data passed from fragment shader
  varying vec2 vUv;
  varying vec3 vPosition;

  // Values passed from our React component
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;

  // Simplex Noise function for organic-looking distortions
  // This is a standard noise function used in graphics for natural effects.
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m * m*m;
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

  void main() {
    vUv = uv; // Pass the texture coordinates to the fragment shader
    vPosition = position;

    vec3 pos = position;
    float dist = distance(uv, uMouse);

    // 1. Mouse-reactive wave distortion
    float wave = snoise(vec2(uTime * 0.5, uv.y * 3.0)) * 0.15;
    float mouseInfluence = smoothstep(0.5, 0.0, dist);
    pos.z += wave * mouseInfluence * (1.0 + uHover * 2.0);

    // 2. Flame-like effect at the top of the logo
    if (uv.y > 0.3) {
      float flameIntensity = smoothstep(0.3, 0.8, uv.y);
      float flame = snoise(vec2(uTime * 3.0 + uv.x * 8.0, uv.y)) * 0.1;
      pos.y += flame * flameIntensity * (1.0 + uHover);
      pos.x += snoise(vec2(uTime * 2.0, uv.y * 5.0)) * 0.08 * flameIntensity;
      pos.z += sin(uTime * 4.0 + uv.y * 15.0) * 0.05 * flameIntensity;
    }

    // 3. Radial pulse effect on hover
    if (uHover > 0.0) {
      float pulse = sin(uTime * 5.0 - dist * 12.0) * 0.08;
      pos.z += pulse * uHover * (1.0 - dist);
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment Shader: Manipulates the color and texture of the logo.
const fragmentShader = `
  // Data passed from vertex shader
  varying vec2 vUv;

  // Values passed from our React component
  uniform float uTime;
  uniform vec2 uMouse;
  uniform sampler2D uTexture;
  uniform float uHover;

  // Noise function for texture distortion
  float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = vUv;
    float dist = distance(uv, uMouse);

    // 1. Distort texture coordinates near the mouse
    float distortionStrength = smoothstep(0.5, 0.0, dist) * (0.5 + uHover);
    if (distortionStrength > 0.0) {
      float noiseX = (noise(uv * 15.0 + uTime * 3.0) - 0.5);
      float noiseY = (noise(uv * 15.0 - uTime * 2.5) - 0.5);
      uv += vec2(noiseX, noiseY) * distortionStrength * 0.08;
    }

    // 2. Heat shimmer effect for the "flame" area
    if (uv.y > 0.35) {
      float flameIntensity = smoothstep(0.35, 0.75, uv.y);
      float heat = sin(uTime * 6.0 + uv.x * 20.0) * 0.03;
      uv.y += heat * flameIntensity * (1.0 + uHover);
    }

    // 3. Sample the logo texture with the distorted coordinates
    vec4 texColor = texture2D(uTexture, uv);

    // 4. Add a glow effect that follows the mouse
    float glow = 1.0 + (0.4 - dist) * 2.0 * (0.5 + uHover);
    texColor.rgb *= glow;

    // 5. Enhance flame colors on hover
    if (uHover > 0.0 && uv.y > 0.35) {
      float flameBoost = smoothstep(0.35, 0.75, uv.y) * uHover;
      texColor.g += flameBoost * 0.5; // Boost green
      float flicker = noise(vec2(uTime * 15.0, 0.0)) * 0.3 + 0.7;
      texColor.rgb *= (1.0 + flicker * flameBoost * 0.5);
    }

    // Make sure we don't render transparent pixels from the PNG
    if (texColor.a < 0.5) discard;

    gl_FragColor = texColor;
  }
`;

// --- React Component ---

const InteractiveLogo = ({ logoSrc }) => {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Using useCallback to memoize these functions, preventing unnecessary re-renders.
  const handleLoad = useCallback(() => setIsLoading(false), []);
  const handleError = useCallback((err) => {
    console.error('Error loading logo texture:', err);
    setIsLoading(false); // Stop loading even if there's an error
  }, []);

  useEffect(() => {
    // --- Basic setup ---
    const mountNode = mountRef.current;
    if (!mountNode) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountNode.clientWidth / mountNode.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountNode.appendChild(renderer.domElement);

    // --- State and Refs for animation ---
    let animationId = null;
    const mouse = new THREE.Vector2(0.5, 0.5);
    let targetHover = 0;
    let currentHover = 0;
    const clock = new THREE.Clock();

    // --- Objects ---
    let logoMesh, particleSystem, particles = [];
    const particleCount = 200;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x88ff00, 2, 10); // Greenish light
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    // --- Texture Loading and Object Creation ---
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(logoSrc, (texture) => {
      // Create Logo Mesh
      const logoGeometry = new THREE.PlaneGeometry(4, 4, 64, 64);
      const logoMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uTexture: { value: texture },
          uHover: { value: 0 },
        },
        transparent: true,
        side: THREE.DoubleSide,
      });
      logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
      scene.add(logoMesh);

      // Create Particle System
      const particleGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 3;
        positions[i3 + 1] = Math.random() * 3 - 1;
        positions[i3 + 2] = (Math.random() - 0.5) * 2;

        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.1 + 0.25, 0.9, 0.6); // Green/yellow tones
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        particles.push({
          position: new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]),
          velocity: new THREE.Vector3((Math.random() - 0.5) * 0.01, Math.random() * 0.02 + 0.01, (Math.random() - 0.5) * 0.01),
          originalY: positions[i3 + 1],
        });
      }
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.7,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      particleSystem = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particleSystem);

      handleLoad(); // Signal that loading is complete
      animate(); // Start animation loop only after texture is loaded
    }, undefined, handleError);

    // --- Animation Loop ---
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smoothly interpolate hover value for softer transitions
      currentHover += (targetHover - currentHover) * 0.1;

      if (logoMesh) {
        logoMesh.material.uniforms.uTime.value = elapsedTime;
        logoMesh.material.uniforms.uHover.value = currentHover;
      }

      // Animate Particles
      if (particleSystem) {
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          const p = particles[i];
          positions[i3] += p.velocity.x;
          positions[i3 + 1] += p.velocity.y;

          // Reset particles that fly off screen
          if (positions[i3 + 1] > 3) {
            positions[i3] = (Math.random() - 0.5) * 3;
            positions[i3 + 1] = -2;
          }
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    // --- Event Handlers ---
    const handleMouseMove = (event) => {
      mouse.x = event.clientX / mountNode.clientWidth;
      mouse.y = 1.0 - (event.clientY / mountNode.clientHeight);
      if (logoMesh) {
        logoMesh.material.uniforms.uMouse.value.copy(mouse);
      }
    };
    const handleMouseEnter = () => { targetHover = 1; };
    const handleMouseLeave = () => { targetHover = 0; };
    const handleResize = () => {
      camera.aspect = mountNode.clientWidth / mountNode.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    };

    // --- Event Listener Setup ---
    mountNode.addEventListener('mousemove', handleMouseMove);
    mountNode.addEventListener('mouseenter', handleMouseEnter);
    mountNode.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (mountNode) {
        mountNode.removeEventListener('mousemove', handleMouseMove);
        mountNode.removeEventListener('mouseenter', handleMouseEnter);
        mountNode.removeEventListener('mouseleave', handleMouseLeave);
        if(renderer.domElement) {
            mountNode.removeChild(renderer.domElement);
        }
      }

      // Dispose of Three.js objects to free up memory
      if (scene && typeof scene.traverse === 'function') {
        scene.traverse(object => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
              if (Array.isArray(object.material)) {
                  object.material.forEach(material => material.dispose());
              } else {
                  object.material.dispose();
              }
          }
        });
      }
      renderer.dispose();
    };
  }, [logoSrc, handleLoad, handleError]); // Dependencies for the effect

  return (
    <div className="relative w-screen h-screen bg-gray-900 cursor-crosshair overflow-hidden" style={{ background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)' }}>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-lime-400 font-sans">
          <div className="text-3xl mb-5 animate-pulse">Loading Interactive Logo...</div>
          <div className="text-base text-gray-500">
            Please wait while the experience is being prepared.
          </div>
        </div>
      )}
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

// --- Main App Component ---
// This is how you would use the InteractiveLogo component.
export default function App() {
  return (
    <main>
      <InteractiveLogo logoSrc="https://i.imgur.com/VHCRCEn.png" />
    </main>
  );
}
