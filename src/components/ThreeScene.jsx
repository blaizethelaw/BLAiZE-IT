import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function ThreeScene() {
 ovmw8q-codex/enhance-website-with-3d-effects
  const containerRef = useRef(null);
  const requestRef = useRef();
  const shapesRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Skip initialization if WebGL is unavailable (e.g. during Jest tests)
    let testCanvas;
    try {
      testCanvas = document.createElement('canvas');
      if (!testCanvas.getContext('webgl') && !testCanvas.getContext('experimental-webgl')) {
        return;
      }
    } catch {
      return;
    }

=======
  const mountRef = useRef(null);

  useEffect(() => {
 yka9y8-codex/enhance-website-with-3d-effects
    if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
=======
    if (typeof window === 'undefined' || !('WebGLRenderingContext' in window)) {
 main
      return;
    }
    const mount = mountRef.current;
 main
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
 yka9y8-codex/enhance-website-with-3d-effects
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
=======
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
 main
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
 ovmw8q-codex/enhance-website-with-3d-effects
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

=======
    mount.appendChild(renderer.domElement);

 yka9y8-codex/enhance-website-with-3d-effects
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const point = new THREE.PointLight(0xff6b35, 2, 100);
    point.position.set(0, 0, 20);
    scene.add(point);

    // Particle system
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
=======
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
 main
    const pointLight = new THREE.PointLight(0xff6b35, 2, 100);
    pointLight.position.set(0, 0, 20);
    scene.add(pointLight);

    const particlesGeometry = new THREE.BufferGeometry();
 ovmw8q-codex/enhance-website-with-3d-effects
    const particlesCount = 3000;
=======
    const particlesCount = 5000;
 main
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
 main
      size: 0.1,
      color: 0xff6b35,
      transparent: true,
      opacity: 0.8,
 yka9y8-codex/enhance-website-with-3d-effects
 yka9y8-codex/enhance-website-with-3d-effects
      blending: THREE.AdditiveBlending,
    });
    const particleMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particleMesh);

    // Floating shapes
=======
 ovmw8q-codex/enhance-website-with-3d-effects
      blending: THREE.AdditiveBlending,
 main
=======
      blending: THREE.AdditiveBlending
 main
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

 yka9y8-codex/enhance-website-with-3d-effects
 main
=======
 ovmw8q-codex/enhance-website-with-3d-effects
    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.OctahedronGeometry(1),
      new THREE.TetrahedronGeometry(1),
      new THREE.IcosahedronGeometry(1),
    ];
    const shapes = [];
    for (let i = 0; i < 15; i++) {
=======
 main
    const shapes = [];
    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TetrahedronGeometry(1, 0),
 yka9y8-codex/enhance-website-with-3d-effects
      new THREE.IcosahedronGeometry(1, 0),
    ];
    for (let i = 0; i < 20; i++) {
      const geom = geometries[Math.floor(Math.random() * geometries.length)];
      const mat = new THREE.MeshPhongMaterial({
=======
      new THREE.IcosahedronGeometry(1, 0)
    ];

    for (let i = 0; i < 20; i++) {
 main
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = new THREE.MeshPhongMaterial({
 main
        color: 0xff6b35,
        emissive: 0xff6b35,
        emissiveIntensity: 0.2,
        wireframe: Math.random() > 0.5,
        transparent: true,
 yka9y8-codex/enhance-website-with-3d-effects
 yka9y8-codex/enhance-website-with-3d-effects
        opacity: 0.8,
      });
      const mesh = new THREE.Mesh(geom, mat);
=======
 ovmw8q-codex/enhance-website-with-3d-effects
        opacity: 0.8,
 main
=======
        opacity: 0.8
 main
      });
      const mesh = new THREE.Mesh(geometry, material);
 main
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
 ovmw8q-codex/enhance-website-with-3d-effects
      const scale = Math.random() * 2 + 0.5;
      mesh.scale.set(scale, scale, scale);
      scene.add(mesh);
=======
      mesh.scale.set(
        Math.random() * 2 + 0.5,
        Math.random() * 2 + 0.5,
        Math.random() * 2 + 0.5
      );
 main
      shapes.push({
        mesh,
 yka9y8-codex/enhance-website-with-3d-effects
        speed: {
          x: Math.random() * 0.01 - 0.005,
          y: Math.random() * 0.01 - 0.005,
          z: Math.random() * 0.01 - 0.005,
        },
      });
      scene.add(mesh);
    }

    camera.position.z = 30;

    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const animate = () => {
      requestAnimationFrame(animate);
      particleMesh.rotation.y += 0.0005;
      particleMesh.rotation.x += 0.0002;
      shapes.forEach(({ mesh, speed }) => {
        mesh.rotation.x += speed.x;
        mesh.rotation.y += speed.y;
        mesh.rotation.z += speed.z;
=======
        rotationSpeed: {
          x: Math.random() * 0.01 - 0.005,
          y: Math.random() * 0.01 - 0.005,
 ovmw8q-codex/enhance-website-with-3d-effects
          z: Math.random() * 0.01 - 0.005,
        },
      });
    }
    shapesRef.current = shapes;

    camera.position.z = 30;

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.0005;
      particlesMesh.rotation.x += 0.0002;
      shapesRef.current.forEach((shape) => {
=======
          z: Math.random() * 0.01 - 0.005
        }
      });
      scene.add(mesh);
    }
    camera.position.z = 30;
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.0005;
      particlesMesh.rotation.x += 0.0002;
      shapes.forEach((shape) => {
 main
        shape.mesh.rotation.x += shape.rotationSpeed.x;
        shape.mesh.rotation.y += shape.rotationSpeed.y;
        shape.mesh.rotation.z += shape.rotationSpeed.z;
 main
      });
      camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
 yka9y8-codex/enhance-website-with-3d-effects
      point.position.x = Math.sin(Date.now() * 0.001) * 10;
      point.position.y = Math.cos(Date.now() * 0.001) * 10;
=======
      pointLight.position.x = Math.sin(Date.now() * 0.001) * 10;
      pointLight.position.y = Math.cos(Date.now() * 0.001) * 10;
 main
      renderer.render(scene, camera);
    };
    animate();

 yka9y8-codex/enhance-website-with-3d-effects
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
=======
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
 ovmw8q-codex/enhance-website-with-3d-effects
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef.current);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 -z-20" />;
=======
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
 main
      mount.removeChild(renderer.domElement);
    };
  }, []);

 yka9y8-codex/enhance-website-with-3d-effects
  return <div ref={mountRef} className="fixed inset-0 -z-30 pointer-events-none" />;
=======
  return <div ref={mountRef} className="fixed inset-0 -z-30" />;
 main
}
