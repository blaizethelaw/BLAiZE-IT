import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import AdaptiveQualityManager from '../lib/AdaptiveQualityManager';
import MobileGPUComputationRenderer from '../lib/MobileGPUComputationRenderer';

// Enhanced Nebula Component with advanced shader techniques
export default function EnhancedNebula({ adaptiveQualityManager }) {
    const containerRef = useRef();
    const sceneRef = useRef();
    const rendererRef = useRef();
    const mouseRef = useRef([0, 0]);
    const timeRef = useRef(0);

    // Mobile-optimized shaders with FBM and domain warping
    const positionFragmentShader = `
      uniform float u_time;
      uniform sampler2D u_velocities;
      uniform float u_stepScale;

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec3 pos = texture2D(u_positions, uv).xyz;
        vec3 vel = texture2D(u_velocities, uv).xyz;

        // Apply velocity with adaptive step scaling for mobile
        pos += vel * 0.016 * u_stepScale;

        // Boundary conditions
        if (length(pos.xy) > 8.0) {
          pos.xy = normalize(pos.xy) * 8.0;
        }

        gl_FragColor = vec4(pos, 1.0);
      }
    `;

    const velocityFragmentShader = `
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_noiseScale;

      // High-performance FBM with rotation matrix (from research)
      const mat2 m2 = mat2(0.8, -0.6, 0.6, 0.8);

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
      }

      float fbm(vec2 p) {
        float f = 0.0;
        f += 0.5000 * noise(p); p = m2 * p * 2.02;
        f += 0.2500 * noise(p); p = m2 * p * 2.03;
        f += 0.1250 * noise(p); p = m2 * p * 2.01;
        f += 0.0625 * noise(p);
        return f / 0.9375;
      }

      // Domain warping for organic patterns (from research)
      float pattern(vec2 p) {
        vec2 q = vec2(fbm(p + vec2(0.0, 0.0)),
                      fbm(p + vec2(5.2, 1.3)));

        vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2)),
                      fbm(p + 4.0 * q + vec2(8.3, 2.8)));

        return fbm(p + 4.0 * r);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec3 pos = texture2D(u_positions, uv).xyz;
        vec3 vel = texture2D(u_velocities, uv).xyz;

        // Mouse interaction with distance-based influence
        float dist = distance(pos.xy, u_mouse);
        float influence = 1.0 - smoothstep(0.0, 3.0, dist);
        vec2 direction = normalize(pos.xy - u_mouse);
        vel.xy += direction * influence * 0.15;

        // Add organic noise using domain warping
        vec2 noiseForce = vec2(
          pattern(pos.xy * 0.1 + u_time * 0.02),
          pattern(pos.xy * 0.1 + u_time * 0.02 + 100.0)
        ) * 0.03 * u_noiseScale;

        vel.xy += noiseForce;

        // Damping
        vel *= 0.98;

        gl_FragColor = vec4(vel, 1.0);
      }
    `;

    const particleVertexShader = `
      uniform sampler2D u_positions;
      uniform float u_size;
      uniform float u_time;

      attribute vec2 a_uv;

      void main() {
        vec3 pos = texture2D(u_positions, a_uv).xyz;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Size attenuation based on distance
        float sizeAttenuation = 300.0 / length(mvPosition.xyz);
        gl_PointSize = u_size * sizeAttenuation;
      }
    `;

    const particleFragmentShader = `
      uniform float u_time;

      void main() {
        // Create circular particles with soft edges
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);

        if (dist > 0.5) discard;

        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        alpha *= 0.8;

        // Color gradient based on position and time
        vec3 color1 = vec3(0.2, 0.8, 1.0); // Cyan
        vec3 color2 = vec3(0.8, 0.4, 1.0); // Purple
        vec3 color = mix(color1, color2, sin(u_time * 0.001) * 0.5 + 0.5);

        gl_FragColor = vec4(color, alpha);
      }
    `;

    useEffect(() => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Initialize renderer with mobile optimizations
      const renderer = new THREE.WebGLRenderer({
        antialias: false, // Disable for mobile performance
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;
      sceneRef.current = scene;

      // Initialize adaptive quality manager
      if (!adaptiveQualityManager.current) {
        adaptiveQualityManager.current = new AdaptiveQualityManager(renderer, scene);
      }

      // GPU computation setup
      const particleCount = adaptiveQualityManager.current.qualitySettings.particleCount;
      const textureWidth = Math.sqrt(particleCount);
      const textureHeight = textureWidth;

      const gpuCompute = new MobileGPUComputationRenderer(textureWidth, textureHeight, renderer);

      // Initialize textures
      const posTexture = gpuCompute.createTexture();
      const velTexture = gpuCompute.createTexture();

      const posArray = posTexture.image.data;
      const velArray = velTexture.image.data;

      // Initialize particle positions in a spiral galaxy pattern
      for (let i = 0; i < posArray.length; i += 4) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * 6;
        const spiralOffset = radius * 0.2;

        posArray[i] = Math.cos(angle + spiralOffset) * radius;
        posArray[i + 1] = Math.sin(angle + spiralOffset) * radius;
        posArray[i + 2] = (Math.random() - 0.5) * 1;
        posArray[i + 3] = 1.0;

        velArray[i] = 0;
        velArray[i + 1] = 0;
        velArray[i + 2] = 0;
        velArray[i + 3] = 1.0;
      }

      posTexture.needsUpdate = true;
      velTexture.needsUpdate = true;

      // Add variables to GPU compute
      const positionVariable = gpuCompute.addVariable("u_positions", positionFragmentShader, posTexture);
      const velocityVariable = gpuCompute.addVariable("u_velocities", velocityFragmentShader, velTexture);

      // Set up variable dependencies
      gpuCompute.variables.forEach(variable => {
        gpuCompute.variables.forEach(dependency => {
          if (variable !== dependency) {
            variable.material.uniforms[dependency.name] = { value: null };
          }
        });
      });

      // Add uniforms
      positionVariable.material.uniforms.u_time = { value: 0 };
      positionVariable.material.uniforms.u_stepScale = { value: 1.0 };

      velocityVariable.material.uniforms.u_time = { value: 0 };
      velocityVariable.material.uniforms.u_mouse = { value: new THREE.Vector2(0, 0) };
      velocityVariable.material.uniforms.u_noiseScale = { value: 1.0 };

      // Create particle geometry
      const particleGeometry = new THREE.BufferGeometry();
      const uvArray = new Float32Array(particleCount * 2);

      for (let i = 0; i < particleCount; i++) {
        uvArray[i * 2] = (i % textureWidth) / textureWidth;
        uvArray[i * 2 + 1] = Math.floor(i / textureWidth) / textureHeight;
      }

      particleGeometry.setAttribute('a_uv', new THREE.BufferAttribute(uvArray, 2));

      // Create particle material
      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          u_positions: { value: null },
          u_size: { value: adaptiveQualityManager.current.isLowEnd ? 1.5 : 2.0 },
          u_time: { value: 0 }
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      // Mouse tracking
      const handleMouseMove = (event) => {
        const rect = container.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        mouseRef.current = [x * 4, y * 4];
      };

      const handleResize = () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      container.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('resize', handleResize);

      // Animation loop
      const animate = () => {
        if (!renderer || !scene || !camera) return;

        timeRef.current += 0.016;

        // Update adaptive quality manager
        if (adaptiveQualityManager.current) {
          adaptiveQualityManager.current.update();

          // Apply quality settings
          const quality = adaptiveQualityManager.current.qualitySettings;
          positionVariable.material.uniforms.u_stepScale.value = quality.rayMarchSteps / 32;
          velocityVariable.material.uniforms.u_noiseScale.value = quality.postProcessing ? 1.0 : 0.5;
        }

        // Update uniforms
        positionVariable.material.uniforms.u_time.value = timeRef.current;
        velocityVariable.material.uniforms.u_time.value = timeRef.current;
        velocityVariable.material.uniforms.u_mouse.value.set(mouseRef.current[0], mouseRef.current[1]);

        particleMaterial.uniforms.u_time.value = timeRef.current;

        // Compute GPU simulation
        gpuCompute.compute();

        // Update particle positions
        particleMaterial.uniforms.u_positions.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };

      animate();

      // Cleanup
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
      };
    }, []);

    return (
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
    );
  }
