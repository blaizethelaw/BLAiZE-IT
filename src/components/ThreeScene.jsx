import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function ThreeScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
      return;
    }
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

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
      size: 0.1,
      color: 0xff6b35,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particleMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particleMesh);

    // Floating shapes
    const shapes = [];
    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TetrahedronGeometry(1, 0),
      new THREE.IcosahedronGeometry(1, 0),
    ];
    for (let i = 0; i < 20; i++) {
      const geom = geometries[Math.floor(Math.random() * geometries.length)];
      const mat = new THREE.MeshPhongMaterial({
        color: 0xff6b35,
        emissive: 0xff6b35,
        emissiveIntensity: 0.2,
        wireframe: Math.random() > 0.5,
        transparent: true,
        opacity: 0.8,
      });
      const mesh = new THREE.Mesh(geom, mat);
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
      mesh.scale.set(
        Math.random() * 2 + 0.5,
        Math.random() * 2 + 0.5,
        Math.random() * 2 + 0.5
      );
      shapes.push({
        mesh,
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
      });
      camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      point.position.x = Math.sin(Date.now() * 0.001) * 10;
      point.position.y = Math.cos(Date.now() * 0.001) * 10;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-30 pointer-events-none" />;
}
