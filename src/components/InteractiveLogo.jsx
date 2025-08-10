import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

const InteractiveLogo = () => {
  const mountRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const particlesRef = useRef([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x88ff00, 2, 10);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    // Logo plane with shader material
    const logoGeometry = new THREE.PlaneGeometry(3, 3, 32, 32);

    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform float uTime;
      uniform vec2 uMouse;

      void main() {
        vUv = uv;
        vPosition = position;

        vec3 pos = position;
        float dist = distance(uv, uMouse);

        // Wave distortion based on mouse distance
        float wave = sin(uTime * 2.0 + dist * 10.0) * 0.1;
        pos.z += wave * (1.0 - dist);

        // Flame-like distortion at top
        if (uv.y > 0.5) {
          float flame = sin(uTime * 3.0 + uv.x * 5.0) * 0.05;
          pos.y += flame * (uv.y - 0.5);
          pos.x += cos(uTime * 2.0 + uv.y * 3.0) * 0.03 * (uv.y - 0.5);
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform sampler2D uTexture;
      uniform float uHover;

      // Noise function for organic effects
      float noise(vec2 p) {
        return sin(p.x * 10.0) * sin(p.y * 10.0);
      }

      void main() {
        vec2 uv = vUv;
        float dist = distance(uv, uMouse);

        // Distortion effect
        float distortion = noise(uv * 5.0 + uTime) * 0.02;

        // Enhanced distortion near mouse
        if (dist < 0.3) {
          distortion += (0.3 - dist) * 0.1;
          uv += vec2(
            sin(uTime * 3.0 + uv.y * 10.0) * distortion,
            cos(uTime * 2.0 + uv.x * 10.0) * distortion
          );
        }

        // Flame effect at top
        if (uv.y > 0.6) {
          float flameIntensity = (uv.y - 0.6) * 2.5;
          uv.x += sin(uTime * 4.0 + uv.y * 8.0) * 0.02 * flameIntensity;
          uv.y += noise(uv * 10.0 + uTime * 2.0) * 0.03 * flameIntensity;
        }

        // Sample texture
        vec4 texColor = texture2D(uTexture, uv);

        // Glow effect
        float glow = 1.0 + (0.3 - dist) * uHover * 0.5;
        texColor.rgb *= glow;

        // Color enhancement for flame parts
        if (uv.y > 0.6) {
          float heat = (uv.y - 0.6) * 2.0;
          texColor.r += heat * 0.3 * sin(uTime * 3.0);
          texColor.g += heat * 0.5 * cos(uTime * 2.0);
        }

        gl_FragColor = texColor;
      }
    `;

    // Create texture from canvas with logo
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx && typeof ctx.bezierCurveTo === 'function') {
      // Draw logo on canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, 512, 512);

      // Draw flame shape
      ctx.fillStyle = '#88ff00';
      ctx.beginPath();
      ctx.moveTo(256, 100);
      ctx.bezierCurveTo(200, 150, 180, 200, 200, 250);
      ctx.bezierCurveTo(180, 280, 190, 320, 230, 340);
      ctx.lineTo(256, 280);
      ctx.lineTo(282, 340);
      ctx.bezierCurveTo(322, 320, 332, 280, 312, 250);
      ctx.bezierCurveTo(332, 200, 312, 150, 256, 100);
      ctx.fill();

      // Add gradient for depth
      const gradient = ctx.createLinearGradient(256, 100, 256, 340);
      gradient.addColorStop(0, '#ccff00');
      gradient.addColorStop(0.5, '#88ff00');
      gradient.addColorStop(1, '#44aa00');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('BLAiZE', 256, 400);

      ctx.fillStyle = '#88ff00';
      ctx.font = 'bold 60px Arial';
      const text = 'BLAiZE';
      const gradient2 = ctx.createLinearGradient(100, 380, 412, 380);
      gradient2.addColorStop(0, '#88ff00');
      gradient2.addColorStop(0.5, '#ff8800');
      gradient2.addColorStop(1, '#88ff00');
      ctx.fillStyle = gradient2;
      ctx.fillText(text, 256, 400);

      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText('IT SOLUTIONS', 256, 440);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const logoMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uTexture: { value: texture },
        uHover: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide
    });

    const logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
    scene.add(logoMesh);

    // Particle system for flame effects
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 2;
      particlePositions[i3 + 1] = Math.random() * 2 - 1;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 0.5;

      particleSizes[i] = Math.random() * 20 + 10;

      const colorChoice = Math.random();
      if (colorChoice > 0.6) {
        particleColors[i3] = 0.53; // Green
        particleColors[i3 + 1] = 1.0;
        particleColors[i3 + 2] = 0;
      } else if (colorChoice > 0.3) {
        particleColors[i3] = 1.0; // Orange
        particleColors[i3 + 1] = 0.53;
        particleColors[i3 + 2] = 0;
      } else {
        particleColors[i3] = 1.0; // Yellow
        particleColors[i3 + 1] = 1.0;
        particleColors[i3 + 2] = 0;
      }

      particlesRef.current.push({
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          Math.random() * 0.02 + 0.01,
          (Math.random() - 0.5) * 0.01
        ),
        life: Math.random()
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Mouse tracking
    const handleMouseMove = (event) => {
      mouseRef.current.x = event.clientX / window.innerWidth;
      mouseRef.current.y = 1.0 - (event.clientY / window.innerHeight);

      logoMaterial.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
    };

    // Hover effects
    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseenter', handleMouseEnter);
    renderer.domElement.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    const clock = new THREE.Clock();
    let hoverValue = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Update time uniform
      logoMaterial.uniforms.uTime.value = elapsedTime;

      // Smooth hover transition
      const targetHover = isHovered ? 1 : 0;
      hoverValue += (targetHover - hoverValue) * 0.1;
      logoMaterial.uniforms.uHover.value = hoverValue;

      // Logo rotation on hover
      if (isHovered) {
        logoMesh.rotation.y = Math.sin(elapsedTime * 2) * 0.1;
        logoMesh.rotation.x = Math.cos(elapsedTime * 1.5) * 0.05;
      } else {
        logoMesh.rotation.y *= 0.95;
        logoMesh.rotation.x *= 0.95;
      }

      // Update particles
      const positions = particleGeometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const particle = particlesRef.current[i];

        // Update position
        positions[i3] += particle.velocity.x;
        positions[i3 + 1] += particle.velocity.y;
        positions[i3 + 2] += particle.velocity.z;

        // Reset particle if it goes too high
        if (positions[i3 + 1] > 2) {
          positions[i3] = (Math.random() - 0.5) * 2;
          positions[i3 + 1] = -1;
          positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
        }

        // Mouse influence on particles
        const dx = mouseRef.current.x - 0.5;
        const dy = mouseRef.current.y - 0.5;
        particle.velocity.x += dx * 0.0001;
        particle.velocity.y += Math.abs(dy) * 0.0001;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mouseenter', handleMouseEnter);
      renderer.domElement.removeEventListener('mouseleave', handleMouseLeave);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [isHovered]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    />
  );
};

export default InteractiveLogo;
