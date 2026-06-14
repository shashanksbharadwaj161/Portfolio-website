'use client';
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';

const SPREAD = 30;

type MouseRef = React.MutableRefObject<{ x: number; y: number }>;

function Particles({ count, mouse }: { count: number; mouse: MouseRef }) {
  const meshRef = useRef<THREE.Points>(null);
  const parallax = useRef({ x: 0, y: 0 });

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * SPREAD;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - 10;

      // Color: mix of cyan / gold / purple
      const t = Math.random();
      if (t < 0.6) {
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 0.85;
        colors[i * 3 + 2] = 1;
      } else if (t < 0.85) {
        colors[i * 3] = 0.83;
        colors[i * 3 + 1] = 0.65;
        colors[i * 3 + 2] = 0.45;
      } else {
        colors[i * 3] = 0.49;
        colors[i * 3 + 1] = 0.23;
        colors[i * 3 + 2] = 0.93;
      }
    }
    return [positions, colors];
  }, [count]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const time = state.clock.getElapsedTime();

    // Continuous, gentle base rotation
    const baseY = time * 0.03;
    const baseX = Math.sin(time * 0.02) * 0.1;

    // Smoothed mouse parallax
    const targetX = mouse.current.x * 0.3;
    const targetY = -mouse.current.y * 0.15;
    parallax.current.x += (targetX - parallax.current.x) * 0.05;
    parallax.current.y += (targetY - parallax.current.y) * 0.05;

    mesh.rotation.y = baseY + parallax.current.x;
    mesh.rotation.x = baseX + parallax.current.y;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Floating geometric shape (represents data / tech)
function FloatingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const time = state.clock.getElapsedTime();
    mesh.rotation.x = time * 0.15;
    mesh.rotation.y = time * 0.1;
    mesh.position.y = Math.sin(time * 0.5) * 0.5;
  });

  return (
    <mesh ref={meshRef} position={[6, 0, -5]}>
      <icosahedronGeometry args={[2, 1]} />
      <meshStandardMaterial color="#00d9ff" wireframe transparent opacity={0.15} />
    </mesh>
  );
}

export default function HeroParticles() {
  const mouse = useRef({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  // Fewer particles on small screens for a steady 60fps.
  const count = useMemo(() => {
    if (typeof window === 'undefined') return 3000;
    return window.innerWidth < 768 ? 1200 : 3000;
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Respect the user's motion preference — fall back to the static glow.
  if (prefersReducedMotion) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 75 }}
      dpr={[1, 2]}
      style={{ position: 'absolute', inset: 0, background: 'transparent', pointerEvents: 'none' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} color="#00d9ff" intensity={0.5} />
      <pointLight position={[-10, -10, -10]} color="#d4a574" intensity={0.3} />
      <Particles count={count} mouse={mouse} />
      <FloatingGeometry />
      {process.env.NODE_ENV === 'development' && <Stats />}
    </Canvas>
  );
}
