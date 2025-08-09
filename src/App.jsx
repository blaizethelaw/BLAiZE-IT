// src/App.jsx
import React, { useState, useEffect, useRef, Suspense } from "react";
import { Menu, X, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import * as THREE from 'three';
import BioStructureBackground from './components/BioStructureBackground';

// Enhanced Adaptive Quality Manager with advanced mobile optimizations
class AdaptiveQualityManager {
  constructor(renderer, scene) {
    this.renderer = renderer;
    this.scene = scene;
    this.qualitySettings = {
      pixelRatio: Math.min(window.devicePixelRatio, 2), // Cap at 2x for performance
      particleCount: this.getInitialParticleCount(),
      rayMarchSteps: this.getInitialRayMarchSteps(),
      postProcessing: true,
    };
    this.performanceMonitor = {
      frameTimes: [],
      stable: true,
      gpuUtilization: 0,
      lastFrameTime: performance.now(),
    };
    this.isLowEnd = this.detectLowEndDevice();
    this.memoryBudget = this.calculateMemoryBudget();
  }

  detectLowEndDevice() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return true;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';

    // Detect low-end GPUs
    const lowEndGPUs = ['powervr', 'adreno 3', 'adreno 4', 'mali-4', 'intel'];
    return lowEndGPUs.some(gpu => renderer.toLowerCase().includes(gpu)) ||
           navigator.hardwareConcurrency < 4;
  }

  getInitialParticleCount() {
    if (this.isLowEnd) return 25000;
    if (window.innerWidth < 768) return 50000;
    return 100000;
  }

  getInitialRayMarchSteps() {
    return this.isLowEnd ? 16 : 32;
  }

  calculateMemoryBudget() {
    // Conservative estimate: 2MB per million screen pixels
    const screenPixels = window.innerWidth * window.innerHeight;
    return Math.floor(screenPixels * 2 / 1000000); // MB
  }

  update() {
    const now = performance.now();
    const frameTime = now - this.performanceMonitor.lastFrameTime;
    this.performanceMonitor.lastFrameTime = now;

    this.performanceMonitor.frameTimes.push(frameTime);
    if (this.performanceMonitor.frameTimes.length > 60) {
      this.performanceMonitor.frameTimes.shift();
    }

    const avgFrameTime = this.performanceMonitor.frameTimes.reduce((a, b) => a + b, 0) / this.performanceMonitor.frameTimes.length;

    // GPU bound detection (simplified)
    if (avgFrameTime > 33) { // Slower than 30fps
      this.reduceRenderQuality();
      this.performanceMonitor.stable = false;
    } else if (avgFrameTime < 13 && this.performanceMonitor.frameTimes.length >= 30) { // Faster than 75fps
      this.increaseQuality();
      this.performanceMonitor.stable = true;
    }
  }

  reduceRenderQuality() {
    // Reduce pixel ratio first
    if (this.qualitySettings.pixelRatio > 0.5) {
      this.qualitySettings.pixelRatio = Math.max(this.qualitySettings.pixelRatio * 0.9, 0.5);
      this.renderer.setPixelRatio(this.qualitySettings.pixelRatio);
      return;
    }

    // Then reduce particle count
    if (this.qualitySettings.particleCount > 10000) {
      this.qualitySettings.particleCount *= 0.8;
    }

    // Disable post-processing
    this.qualitySettings.postProcessing = false;
  }

  increaseQuality() {
    if (this.qualitySettings.pixelRatio < Math.min(window.devicePixelRatio, 2)) {
      this.qualitySettings.pixelRatio = Math.min(this.qualitySettings.pixelRatio * 1.05, Math.min(window.devicePixelRatio, 2));
      this.renderer.setPixelRatio(this.qualitySettings.pixelRatio);
    }
  }
}

// Enhanced GPU Computation Renderer with mobile optimizations
class MobileGPUComputationRenderer {
  constructor(sizeX, sizeY, renderer) {
    this.variables = [];
    this.currentTextureIndex = 0;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();
    this.camera.position.z = 1;

    // Use HalfFloat on mobile for better performance
    this.dataType = this.isMobile() ? THREE.HalfFloatType : THREE.FloatType;

    this.passThruUniforms = {
      passThruTexture: { value: null }
    };

    this.init();
  }

  isMobile() {
    return /(iPad|iPhone|iPod|Android)/g.test(navigator.userAgent);
  }

  addResolutionDefine(material) {
    material.defines = material.defines || {};
    material.defines.resolution = `vec2(${this.sizeX.toFixed(1)}, ${this.sizeY.toFixed(1)})`;
  }

  createShaderMaterial(computeFragmentShader, uniforms = {}) {
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: this.getPassThroughVertexShader(),
      fragmentShader: computeFragmentShader
    });

    this.addResolutionDefine(material);
    return material;
  }

  init() {
    const passThruShader = this.createShaderMaterial(this.getPassThroughFragmentShader(), this.passThruUniforms);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), passThruShader);
    this.scene.add(mesh);
    this.mesh = mesh;
    this.passThruShader = passThruShader;
  }

  addVariable(variableName, computeFragmentShader, initialValueTexture) {
    const material = this.createShaderMaterial(computeFragmentShader);

    const variable = {
      name: variableName,
      initialValueTexture: initialValueTexture,
      material: material,
      renderTargets: [],
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter
    };

    this.variables.push(variable);

    variable.renderTargets[0] = this.createRenderTarget();
    variable.renderTargets[1] = this.createRenderTarget();
    this.renderTexture(initialValueTexture, variable.renderTargets[0]);
    this.renderTexture(initialValueTexture, variable.renderTargets[1]);

    return variable;
  }

  createRenderTarget() {
    return new THREE.WebGLRenderTarget(this.sizeX, this.sizeY, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: this.dataType,
      stencilBuffer: false
    });
  }

  createTexture() {
    const size = this.sizeX * this.sizeY * 4;
    const data = this.dataType === THREE.HalfFloatType ?
      new Uint16Array(size) : new Float32Array(size);

    return new THREE.DataTexture(data, this.sizeX, this.sizeY, THREE.RGBAFormat, this.dataType);
  }

  compute() {
    const currentTextureIndex = this.currentTextureIndex;
    const nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;

    for (let v = 0; v < this.variables.length; v++) {
      const variable = this.variables[v];
      const uniforms = variable.material.uniforms;

      // Set dependencies
      for (let d = 0; d < this.variables.length; d++) {
        const depVar = this.variables[d];
        if (uniforms.hasOwnProperty(depVar.name)) {
          uniforms[depVar.name].value = depVar.renderTargets[currentTextureIndex].texture;
        }
      }

      this.doRenderTarget(variable.material, variable.renderTargets[nextTextureIndex]);
    }

    this.currentTextureIndex = nextTextureIndex;
  }

  getCurrentRenderTarget(variable) {
    return variable.renderTargets[this.currentTextureIndex];
  }

  doRenderTarget(material, output) {
    this.mesh.material = material;
    this.renderer.setRenderTarget(output);
    this.renderer.render(this.scene, this.camera);
    this.mesh.material = this.passThruShader;
  }

  renderTexture(input, output) {
    this.passThruUniforms.passThruTexture.value = input;
    this.doRenderTarget(this.passThruShader, output);
    this.passThruUniforms.passThruTexture.value = null;
  }

  getPassThroughVertexShader() {
    return `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;
  }

  getPassThroughFragmentShader() {
    return `
      uniform sampler2D passThruTexture;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        gl_FragColor = texture2D(passThruTexture, uv);
      }
    `;
  }
}

// Enhanced Nebula Component with advanced shader techniques
function EnhancedNebula({ adaptiveQualityManager }) {
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

    // High-performance FBM with rotation matrix
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

    // Domain warping for organic patterns
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
    const textureWidth = Math.floor(Math.sqrt(particleCount));
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
    const uvArray = new Float32Array(textureWidth * textureHeight * 2);

    let idx = 0;
    for (let y = 0; y < textureHeight; y++) {
      for (let x = 0; x < textureWidth; x++) {
        uvArray[idx++] = x / textureWidth;
        uvArray[idx++] = y / textureHeight;
      }
    }

    particleGeometry.setAttribute('a_uv', new THREE.BufferAttribute(uvArray, 2));

    // Create particle material
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_positions: { value: null },
        u_size: { value: adaptiveQualityManager.current.isLowEnd ? 1.5 : 2.0 },
        u_time: { value: 0 }
      },
      vertexShader: `
        uniform sampler2D u_positions;
        uniform float u_size;
        uniform float u_time;
        attribute vec2 a_uv;
        void main() {
          vec3 pos = texture2D(u_positions, a_uv).xyz;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          float sizeAttenuation = 300.0 / length(mvPosition.xyz);
          gl_PointSize = u_size * sizeAttenuation;
        }
      `,
      fragmentShader: `
        uniform float u_time;
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha *= 0.8;
          vec3 color1 = vec3(0.2, 0.8, 1.0);
          vec3 color2 = vec3(0.8, 0.4, 1.0);
          vec3 color = mix(color1, color2, sin(u_time * 0.001) * 0.5 + 0.5);
          gl_FragColor = vec4(color, alpha);
        }
      `,
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

// Utility Components
function FadeInWhenVisible({ children, className = '', delay = 0, duration = 700 }) {
  const domRef = useRef();
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isVisible) {
        setVisible(true);
        observer.unobserve(domRef.current);
      }
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
      observer.disconnect();
    };
  }, [isVisible]);

  return (
    <div
      ref={domRef}
      className={`
        transition-all ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        ${className}
      `}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionDivider({ flip = false }) {
  return (
    <div className={`relative w-full overflow-hidden ${flip ? 'transform rotate-180' : ''}`}>
      <svg
        className="block w-full h-24 text-blaize-dark"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
      >
        <path
          d="M0,0 L0,100 L100,100 L100,0 C70,50 30,50 0,0 Z"
          fill="currentColor"
        ></path>
      </svg>
    </div>
  );
}

function BookingButton() {
  const handleBookingClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex justify-center py-12">
      <button
        onClick={handleBookingClick}
        className="relative px-8 py-4 rounded-full font-bold text-black text-xl
                   bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange
                   shadow-lg shadow-blaize-green/40 transition-all duration-500
                   transform hover:scale-105 focus:outline-none overflow-hidden group
                   before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                   before:-translate-x-full hover:before:translate-x-0 before:transition-transform before:duration-700
                   after:absolute after:inset-0 after:bg-gradient-to-r after:from-cyan-400/0 after:via-cyan-400/30 after:to-cyan-400/0
                   after:blur-xl after:scale-y-0 hover:after:scale-y-100 after:transition-transform after:duration-500"
      >
        <span className="relative z-10">Book a Consultation Now!</span>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 blur-2xl group-hover:blur-3xl transition-all duration-500 animate-pulse"></div>
      </button>
    </div>
  );
}

// Navbar Component
function Navbar({ currentPage, setCurrentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "home" },
    { name: "Services", path: "services" },
    { name: "About", path: "about" },
    { name: "Testimonials", path: "testimonials" },
    { name: "Contact", path: "contact" },
  ];

  const handleNavLinkClick = (path) => {
    setCurrentPage(path);
    setIsMenuOpen(false);
    const section = document.getElementById(path);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-2">
        <button onClick={() => handleNavLinkClick("home")}>
          <div className="h-9 w-24 bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange rounded-md flex items-center justify-center">
            <span className="text-black font-bold text-sm">BLAiZE IT</span>
          </div>
        </button>

        <nav className="hidden md:flex flex-1 justify-end">
          <ul className="flex gap-6 text-lg font-semibold">
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleNavLinkClick(item.path)}
                  className={`
                    relative group
                    ${currentPage === item.path
                      ? "text-blaize-green"
                      : "text-white/90 hover:text-blaize-green transition-colors duration-300"}
                    after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-cyan-400 after:to-blaize-green after:scale-x-0 after:transition-transform after:duration-300 after:ease-out
                    ${currentPage === item.path ? "after:scale-x-100" : "group-hover:after:scale-x-100"}
                  `}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:hidden flex items-center">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <div
        className={`
          md:hidden fixed inset-0 bg-blaize-slate/95 backdrop-blur-md z-40
          transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col items-center justify-center h-full pt-16">
          <ul className="flex flex-col gap-8 text-2xl font-semibold">
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleNavLinkClick(item.path)}
                  className={`
                    ${currentPage === item.path
                      ? "text-blaize-green"
                      : "text-white/90 hover:text-blaize-green transition-colors duration-300"}
                    block py-2 text-center
                  `}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}

// Page Sections
function HeroSection() {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center">
      <div className="relative z-10 text-center text-white p-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
          <span className="bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange text-transparent bg-clip-text">
            BLAiZE IT
          </span>
          <br />
          Advanced WebGL Solutions
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          Cutting-edge GPU-accelerated nebula rendering with mobile-optimized performance and realistic space effects.
        </p>
        <button
          onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
          className="px-8 py-3 rounded-full font-bold text-black text-lg
                     bg-gradient-to-r from-blaize-yellow to-blaize-orange
                     shadow-lg shadow-blaize-yellow/40 hover:brightness-110 transition-all duration-300
                     transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blaize-yellow/50"
        >
          Explore Our Tech
        </button>
      </div>
    </section>
  );
}

// Services Data with WebGL focus
const servicesData = [
  {
    title: "GPU-Accelerated Rendering",
    description: "Transform feedback and Three.js GPUComputationRenderer for 100K-1M particles at 60fps.",
    icon: "🚀",
    tech: "WebGL 2.0, GLSL"
  },
  {
    title: "Mobile Optimization",
    description: "Adaptive quality scaling with automatic performance monitoring and resource management.",
    icon: "📱",
    tech: "Progressive Enhancement"
  },
  {
    title: "Volumetric Rendering",
    description: "Realistic raymarching with Beer's Law light scattering and Henyey-Greenstein phase functions.",
    icon: "🌌",
    tech: "Advanced Shaders"
  },
  {
    title: "Real-time Physics",
    description: "GPU-based particle simulation with fractal Brownian motion and curl noise dynamics.",
    icon: "⚡",
    tech: "Compute Shaders"
  },
  {
    title: "Cross-Platform Performance",
    description: "Optimized for iOS Safari, Android Chrome, and desktop with VRAM budgeting systems.",
    icon: "🎯",
    tech: "Universal Compatibility"
  },
];

function ServicesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextService = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % servicesData.length);
  };

  const prevService = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? servicesData.length - 1 : prevIndex - 1
    );
  };

  return (
    <section id="services" className="py-20 px-4 bg-blaize-dark text-white">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange text-transparent bg-clip-text">
        Advanced WebGL Technologies
      </h2>
      <div className="relative max-w-5xl mx-auto">
        <div className="flex items-center justify-center">
          <div className="relative bg-zinc-900 border border-blaize-green/30 rounded-xl p-8 shadow-glow w-full md:w-3/4 lg:w-2/3 text-center
                          transition-all duration-500 hover:border-blaize-green/60 hover:shadow-2xl hover:shadow-green-400/20 group">
            <div className="absolute -inset-px bg-gradient-to-r from-cyan-400/30 to-blaize-green/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="text-6xl mb-4">{servicesData[currentIndex].icon}</div>
            <h3 className="text-2xl font-semibold mb-3 text-blaize-green">
              {servicesData[currentIndex].title}
            </h3>
            <p className="text-white/80 leading-relaxed mb-4">
              {servicesData[currentIndex].description}
            </p>
            <div className="inline-block px-3 py-1 bg-blaize-yellow/20 rounded-full text-blaize-yellow text-sm font-medium">
              {servicesData[currentIndex].tech}
            </div>
          </div>
        </div>

        <button
          onClick={prevService}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-blaize-green/70 rounded-full text-white transition-all duration-300 z-10 ml-2
                    hover:bg-blaize-green hover:shadow-glow hover:scale-110"
          aria-label="Previous service"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextService}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-blaize-green/70 rounded-full text-white transition-all duration-300 z-10 mr-2
                    hover:bg-blaize-green hover:shadow-glow hover:scale-110"
          aria-label="Next service"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 text-white bg-blaize-slate">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-blaize-orange via-blaize-yellow to-blaize-green text-transparent bg-clip-text">
          High-Performance WebGL Research
        </h2>
        <p className="text-lg leading-relaxed mb-6">
          Our advanced mobile WebGL nebula rendering system achieves desktop-quality visuals while maintaining 60fps on mobile devices. Through GPU-accelerated particle systems, optimized volumetric shaders, and intelligent quality scaling, we create photorealistic space environments that work across all platforms.
        </p>
        <p className="text-lg leading-relaxed mb-10">
          Using cutting-edge techniques like transform feedback, blue noise dithering, and adaptive LOD systems, our solutions push the boundaries of what's possible with real-time graphics in the browser.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative bg-zinc-900 p-6 rounded-lg shadow-md border border-blaize-yellow/30 overflow-hidden group
                          transition-all duration-500 hover:border-blaize-yellow/60 hover:shadow-xl hover:shadow-yellow-400/20">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h3 className="text-xl font-semibold text-blaize-yellow mb-2">GPU Acceleration</h3>
            <p className="text-white/80">Transform feedback and compute shaders for massive particle systems</p>
          </div>
          <div className="relative bg-zinc-900 p-6 rounded-lg shadow-md border border-blaize-green/30 overflow-hidden group
                          transition-all duration-500 hover:border-blaize-green/60 hover:shadow-xl hover:shadow-green-400/20">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h3 className="text-xl font-semibold text-blaize-green mb-2">Mobile First</h3>
            <p className="text-white/80">Adaptive quality scaling and VRAM budgeting for all devices</p>
          </div>
          <div className="relative bg-zinc-900 p-6 rounded-lg shadow-md border border-blaize-orange/30 overflow-hidden group
                          transition-all duration-500 hover:border-blaize-orange/60 hover:shadow-xl hover:shadow-orange-400/20">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h3 className="text-xl font-semibold text-blaize-orange mb-2">Realistic Physics</h3>
            <p className="text-white/80">Physically-based rendering with advanced noise functions</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Performance Metrics Display
function PerformanceMetrics({ adaptiveQualityManager }) {
  const [metrics, setMetrics] = useState({
    fps: 60,
    particleCount: 100000,
