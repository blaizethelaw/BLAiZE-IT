// src/components/AnimatedLogo.jsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// This is the vertex shader. It positions the vertices of the plane.
const flameVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// This is the fragment shader. It colors the pixels and creates the flame effect.
const flameFragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouse;

  // 2D noise function to create the flame's movement
  float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // 2D noise function for distortion
  float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
  }

  void main() {
    vec2 uv = vUv;
    
    // Calculate distance from the mouse to the current pixel
    float mouseDist = distance(uv, uMouse);

    // This effect targets the upper part of the image where the flame is.
    // The uv.y > 0.6 condition ensures we only distort the flame.
    if (uv.y > 0.6) {
      // Create a time-varying distortion effect using the noise function
      float distortion = noise(uv * 4.0 + uTime * 0.8) * 0.03;
      
      // Make the flame "flicker" upwards
      uv.y += noise(uv * 3.0 + uTime * 1.5) * 0.04;
      
      // Apply horizontal distortion
      uv.x += distortion;

      // When the mouse is close, increase the distortion effect
      if (mouseDist < 0.3) {
        uv.x += (noise(uv * 10.0 + uTime * 2.0) - 0.5) * 0.05 * (1.0 - mouseDist / 0.3);
      }
    }

    // Get the color from the original texture at the (potentially distorted) uv coordinate
    vec4 textureColor = texture2D(uTexture, uv);

    // If the pixel is outside the logo's visible area (alpha is 0), discard it.
    if (textureColor.a < 0.1) {
      discard;
    }

    gl_FragColor = textureColor;
  }
`;

export default function AnimatedLogo() {
  const mountRef = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // --- Scene, Camera, and Renderer Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    // --- Texture Loading ---
    const loader = new THREE.TextureLoader();
    // Using the CORRECT direct image link
    const texture = loader.load('https://i.imgur.com/VHCRCEn.png');

    // --- Geometry and Material ---
    const geometry = new THREE.PlaneGeometry(8, 8);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) } // Start mouse in the center
      },
      vertexShader: flameVertexShader,
      fragmentShader: flameFragmentShader,
      transparent: true
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // --- Mouse Move Handler ---
    const handleMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      // Convert mouse position to UV coordinates (0 to 1)
      mouse.current.x = (event.clientX - rect.left) / rect.width;
      mouse.current.y = 1.0 - (event.clientY - rect.top) / rect.height; // Invert Y
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    const animate = () => {
      // Update time uniform for animation
      material.uniforms.uTime.value = clock.getElapsedTime();
      // Smoothly update mouse uniform
      material.uniforms.uMouse.value.x += (mouse.current.x - material.uniforms.uMouse.value.x) * 0.05;
      material.uniforms.uMouse.value.y += (mouse.current.y - material.uniforms.uMouse.value.y) * 0.05;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // --- Resize Handler ---
    const handleResize = () => {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '400px', height: '400px', maxWidth: '90vw', maxHeight: '90vw' }} />;
}
