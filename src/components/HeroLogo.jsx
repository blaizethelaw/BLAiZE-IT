import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

// --- GLSL Shader Code ---
// By moving the shaders outside the component, we make the component logic much cleaner.

// Vertex Shader: Deforms the logo's geometry based on mouse position and time.
const vertexShader = `
  // Data passed to fragment shader
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

const HeroLogo = ({ logoSrc }) => {
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
    let logoMesh, particleSystem;
    const particles = [];
    const particleCount =6; // Reduced from 80
    let flameSpawnPoints = []; // This will store valid spawn coordinates

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x88ff00, 2, 10); // Greenish light
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    // --- Texture Loading and Object Creation ---
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin(''); // Important for loading from Imgur
    textureLoader.load(logoSrc, (texture) => {
      const planeWidth = 4;
      const planeHeight = 4;

      // --- Get valid spawn points from texture ---
      const image = texture.image;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const alphaIndex = (y * canvas.width + x) * 4 + 3;
          // Check if the pixel is part of the flame (alpha > ~50%)
          // and if it's in the upper part of the image (y < canvas.height * 0.7)
          if (imageData.data[alphaIndex] > 128 && y < canvas.height * 0.7) {
            // Convert pixel coordinates (0 to width/height) to world coordinates (-2 to 2)
            const worldX = (x / canvas.width) * planeWidth - planeWidth / 2;
            const worldY = -(y / canvas.height) * planeHeight + planeHeight / 2;
            flameSpawnPoints.push(new THREE.Vector3(worldX, worldY, 0));
          }
        }
      }

      // Create Logo Mesh
      const logoGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 64, 64);
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

      // --- Create Particle System ---
      if (flameSpawnPoints.length > 0) {
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          // Pick a random spawn point from our generated list
          const spawnPoint = flameSpawnPoints[Math.floor(Math.random() * flameSpawnPoints.length)];
          positions[i3] = spawnPoint.x;
          positions[i3 + 1] = spawnPoint.y;
          positions[i3 + 2] = (Math.random() - 0.5) * 0.5; // Give it some z-depth

          const color = new THREE.Color();
          color.setHSL(Math.random() * 0.1 + 0.25, 0.9, 0.6); // Green/yellow tones
          colors[i3] = color.r;
          colors[i3 + 1] = color.g;
          colors[i3 + 2] = color.b;

          particles.push({
            // Further slowed down the velocity
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.005, Math.random() * 0.005 + 0.0025, (Math.random() - 0.5) * 0.005),
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
      }

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
      if (particleSystem && flameSpawnPoints.length > 0) {
        const positions = particleSystem.geometry.attributes.position.array;
        const flameTopBoundary = 2.5;

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          positions[i3] += particles[i].velocity.x;
          positions[i3 + 1] += particles[i].velocity.y;
          positions[i3 + 2] += particles[i].velocity.z;

          // Reset particles that fly off the top
          if (positions[i3 + 1] > flameTopBoundary) {
            const spawnPoint = flameSpawnPoints[Math.floor(Math.random() * flameSpawnPoints.length)];
            positions[i3] = spawnPoint.x;
            positions[i3 + 1] = spawnPoint.y;
            positions[i3 + 2] = spawnPoint.z;
          }
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    // --- Event Handlers ---
    const handleMouseMove = (event) => {
      const rect = mountNode.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width);
      mouse.y = 1.0 - ((event.clientY - rect.top) / rect.height);
      if (logoMesh) {
        logoMesh.material.uniforms.uMouse.value.copy(mouse);
      }
    };
    const handleMouseEnter = () => { targetHover = 1; };
    const handleMouseLeave = () => { targetHover = 0; };
    const handleResize = () => {
      if(mountNode) {
          camera.aspect = mountNode.clientWidth / mountNode.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
      }
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

      if (scene && typeof scene.traverse === 'function') {
        scene.traverse(object => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
              if (Array.isArray(object.material)) {
                  object.material.forEach(material => {
                      if(material.map) material.map.dispose();
                      material.dispose()
                  });
              } else {
                  if(object.material.map) object.material.map.dispose();
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

export default HeroLogo;
