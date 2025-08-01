import React, { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GPGPU } from '@epok.tech/gl-gpgpu';
import { AdaptiveQualityManager } from './AdaptiveQualityManager.js';

function Nebula({ adaptiveQualityManager }) {
  const { gl, size, viewport } = useThree();
  const mouse = useRef([0, 0]);

  const PARTICLE_COUNT = 100000;
  const WIDTH = Math.sqrt(PARTICLE_COUNT);
  const HEIGHT = Math.sqrt(PARTICLE_COUNT);

  const gpgpu = useMemo(() => {
    const gpgpu = new GPGPU(gl, {
        data: new Float32Array(PARTICLE_COUNT * 4),
        format: gl.RGBA,
        type: gl.FLOAT,
        width: WIDTH,
        height: HEIGHT,
        channels: 4,
    });

    const pass = gpgpu.addPass({
        fragment: `
            precision highp float;
            uniform sampler2D u_data;
            uniform vec2 u_mouse;
            varying vec2 v_uv;

            const mat2 m2 = mat2(0.8,-0.6,0.6,0.8);

            float noise(vec3 p) {
                return sin(p.x)*sin(p.y)*sin(p.z);
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
                vec4 d = texture2D(u_data, v_uv);
                d.xy += vec2(pattern(d.xyz), pattern(d.xyz + 100.0)) * 0.01;

                float dist = distance(d.xy, u_mouse);
                float influence = 1.0 - smoothstep(0.0, 2.0, dist);
                vec2 direction = normalize(d.xy - u_mouse);
                d.xy += direction * influence * 0.1;

                gl_FragColor = d;
            }
        `,
        uniforms: {
            u_mouse: { value: new THREE.Vector2(0, 0) },
        },
    });

    gpgpu.init();

    return gpgpu;
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
    u_data: { value: null },
    u_size: { value: 1.0 },
  }), []);

  useFrame((state, delta) => {
    if (adaptiveQualityManager) {
      adaptiveQualityManager.update();
    }

    gpgpu.passes[0].uniforms.u_mouse.value.lerp(
        new THREE.Vector2(
            (mouse.current[0] / size.width) * 2 - 1,
            -(mouse.current[1] / size.height) * 2 + 1
        ).multiplyScalar(viewport.width/2),
        0.1
    );
    gpgpu.update();
    uniforms.u_data.value = gpgpu.data;
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
        vertexShader={`
            precision highp float;
            uniform sampler2D u_data;
            uniform float u_size;
            void main() {
                vec4 d = texture2D(u_data, position.xy);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(d.xyz, 1.0);
                gl_PointSize = u_size;
            }
        `}
        fragmentShader={`
            precision highp float;
            void main() {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }
        `}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

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
    }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 75 }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor('#000000', 1);
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
