import React, { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GPUComputationRenderer } from './GPUComputationRenderer.js';

const particleRenderVertexShader = `
  precision mediump float;
  uniform sampler2D u_positions;
  uniform float u_size;

  void main() {
    vec3 pos = texture2D(u_positions, position.xy).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = u_size;
  }
`;

const particleRenderFragmentShader = `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(0.3, 0.6, 1.0, 0.5);
  }
`;

const positionFragmentShader = `
  precision mediump float;
  uniform float u_time;
  uniform sampler2D u_velocities;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(u_positions, uv).xyz;
    vec3 vel = texture2D(u_velocities, uv).xyz;

    pos += vel * 0.016;

    gl_FragColor = vec4(pos, 1.0);
  }
`;

const velocityFragmentShader = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_mouse;

  const mat2 m2 = mat2(0.8,-0.6,0.6,0.8);

  float noise(vec3 p) {
    return sin(p.x)*sin(p.y);
  }

  float fbm(vec3 p) {
      float f = 0.0;
      f += 0.5000*noise( p ); p = m2*p*2.02;
      f += 0.2500*noise( p ); p = m2*p*2.03;
      f += 0.1250*noise( p ); p = m2*p*2.01;
      f += 0.0625*noise( p );
      return f/0.9375;
  }

  float pattern(vec3 p) {
    vec3 q = vec3( fbm( p + vec3(0.0,0.0,0.0) ),
                   fbm( p + vec3(5.2,1.3,4.6) ),
                   fbm( p + vec3(11.2,7.3,9.6) ) );

    vec3 r = vec3( fbm( p + 4.0*q + vec3(1.7,9.2,5.5) ),
                   fbm( p + 4.0*q + vec3(8.3,2.8,1.2) ),
                   fbm( p + 4.0*q + vec3(15.3,12.8,7.2) ) );

    return fbm( p + 4.0*r );
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(u_positions, uv).xyz;
    vec3 vel = texture2D(u_velocities, uv).xyz;

    float dist = distance(pos.xy, u_mouse);
    float influence = 1.0 - smoothstep(0.0, 2.0, dist);
    vec2 direction = normalize(pos.xy - u_mouse);

    vel.xy += direction * influence * 0.1;

    // Add noise
    vel.xy += vec2(
      pattern(pos + u_time * 0.01),
      pattern(pos + u_time * 0.01 + 100.0)
    ) * 0.01;

    vel *= 0.99;

    gl_FragColor = vec4(vel, 1.0);
  }
`;


function Nebula({ adaptiveQualityManager }) {
  const { gl, size, viewport } = useThree();
  const mouse = useRef([0, 0]);

  const PARTICLE_COUNT = 100000;
  const WIDTH = Math.sqrt(PARTICLE_COUNT);
  const HEIGHT = Math.sqrt(PARTICLE_COUNT);

  const gpuCompute = useMemo(() => {
    const compute = new GPUComputationRenderer(WIDTH, HEIGHT, gl);

    const posTexture = compute.createTexture();
    const velTexture = compute.createTexture();

    const posData = posTexture.image.data;
    const velData = velTexture.image.data;

    for (let i = 0; i < posData.length; i += 4) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 5;

      posData[i] = Math.cos(angle) * radius;
      posData[i + 1] = Math.sin(angle) * radius;
      posData[i + 2] = (Math.random() - 0.5) * 2;
      posData[i + 3] = 1.0;

      velData[i] = 0;
      velData[i + 1] = 0;
      velData[i + 2] = 0;
      velData[i + 3] = 1.0;
    }

    const positionVariable = compute.addVariable("u_positions", positionFragmentShader, posTexture);
    const velocityVariable = compute.addVariable("u_velocities", velocityFragmentShader, velTexture);

    compute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);
    compute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);

    positionVariable.material.uniforms.u_time = { value: 0 };
    velocityVariable.material.uniforms.u_time = { value: 0 };
    velocityVariable.material.uniforms.u_mouse = { value: new THREE.Vector2(0,0) };

    compute.init();
    return compute;
  }, [gl]);

  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3 + 0] = (i % WIDTH) / WIDTH;
        positions[i * 3 + 1] = Math.floor(i / WIDTH) / HEIGHT;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  const uniforms = useMemo(() => ({
    u_positions: { value: null },
    u_size: { value: 1.0 }
  }), []);

  useFrame((state, delta) => {
    if (adaptiveQualityManager) {
      adaptiveQualityManager.update();
    }

    gpuCompute.variables.position.material.uniforms.u_time.value += delta;
    gpuCompute.variables.velocity.material.uniforms.u_time.value += delta;
    gpuCompute.variables.velocity.material.uniforms.u_mouse.value.lerp(
        new THREE.Vector2(
            (mouse.current[0] / size.width) * 2 - 1,
            -(mouse.current[1] / size.height) * 2 + 1
        ).multiplyScalar(viewport.width/2),
        0.1
    );

    gpuCompute.compute();

    uniforms.u_positions.value = gpuCompute.getCurrentRenderTarget(gpuCompute.variables.position).texture;
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
        vertexShader={particleRenderVertexShader}
        fragmentShader={particleRenderFragmentShader}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

import { AdaptiveQualityManager } from './AdaptiveQualityManager.js';

export default function InteractiveNebula({ adaptiveQualityManager, setAdaptiveQualityManager }) {
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
        onCreated={({ gl, scene }) => {
          gl.setClearColor('#000000', 0);
          if (!adaptiveQualityManager) {
            setAdaptiveQualityManager(new AdaptiveQualityManager(gl, scene));
          }
        }}
      >
        <Suspense fallback={null}>
          <Nebula adaptiveQualityManager={adaptiveQualityManager} />
        </Suspense>
      </Canvas>
    </div>
  );
}
