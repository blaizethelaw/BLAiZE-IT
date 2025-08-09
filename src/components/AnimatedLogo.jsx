// src/components/AnimatedLogo.jsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const flameVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const flameFragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouse;

  // FBM noise function from the existing App.jsx
  mat2 m2 = mat2(0.8, -0.6, 0.6, 0.8);

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float fbm(vec2 p) {
    float f = 0.0;
    f += 0.5000 * noise(p); p = m2 * p * 2.02;
    f += 0.2500 * noise(p); p = m2 * p * 2.03;
    f += 0.1250 * noise(p);
    return f / 0.875;
  }

  void main() {
    vec2 uv = vUv;
    float mouseDist = distance(uv, uMouse);

    // Apply distortion only to the flame part of the logo (approximated coordinates)
    if (uv.y > 0.5) {
      float distortion = fbm(uv * 3.0 + uTime * 0.5) * 0.1;
      distortion *= (1.0 - smoothstep(0.0, 0.3, mouseDist)); // Mouse interaction
      uv.x += distortion;
      uv.y += fbm(uv * 2.0 - uTime * 0.3) * 0.05;
    }

    vec4 color = texture2D(uTexture, uv);
    gl_FragColor = color;
  }
`;

export default function AnimatedLogo() {
  const mountRef = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const texture = loader.load('/logo.png');

    const geometry = new THREE.PlaneGeometry(8, 8);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) }
      },
      vertexShader: flameVertexShader,
      fragmentShader: flameFragmentShader,
      transparent: true
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const handleMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      mouse.current.x = (event.clientX - rect.left) / rect.width;
      mouse.current.y = 1.0 - (event.clientY - rect.top) / rect.height;
    };

    currentMount.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();
    const animate = () => {
      material.uniforms.uTime.value = clock.getElapsedTime();
      material.uniforms.uMouse.value.x += (mouse.current.x - material.uniforms.uMouse.value.x) * 0.05;
      material.uniforms.uMouse.value.y += (mouse.current.y - material.uniforms.uMouse.value.y) * 0.05;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    window.addEventListener('resize', handleResize);


    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('mousemove', handleMouseMove);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '512px', height: '512px', maxWidth: '100%' }} />;
}
