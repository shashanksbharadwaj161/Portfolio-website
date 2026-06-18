'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { filmStore } from './filmStore';
import { particleMorph, particleFade, smoothstep, lerp } from './scenes';

// Dust starts cyan, shifts to the teal of the conductive thread as it prints.
const DUST_COLOR = new THREE.Color(0x00d9ff);
const THREAD_COLOR = new THREE.Color(0x00e5cc);

// A single particle buffer that reconfigures: a dust cloud in the cold open,
// then travels onto the sampled glove surface to "print" it in Scene 1, then
// dissolves as the solid glove takes over.
export default function Particles({ targets }: { targets: Float32Array }) {
  const count = targets.length / 3;
  const pointsRef = useRef<THREE.Points>(null);

  const { dust, geometry, material } = useMemo(() => {
    const dust = new Float32Array(count * 3);
    const live = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      dust[i * 3] = x;
      dust[i * 3 + 1] = y;
      dust[i * 3 + 2] = z;
      live[i * 3] = x;
      live[i * 3 + 1] = y;
      live[i * 3 + 2] = z;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(live, 3));
    const material = new THREE.PointsMaterial({
      color: 0x00d9ff,
      size: 0.035,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return { dust, geometry, material };
  }, [count]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state) => {
    const p = filmStore.progress;
    const morph = particleMorph(p);
    const fade = particleFade(p);
    const t = state.clock.elapsedTime;
    const arr = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      // gentle drift while still dust
      const drift = (1 - morph) * 0.04;
      const wob = Math.sin(t * 0.6 + i) * drift;
      arr[ix] = lerp(dust[ix] + wob, targets[ix], morph);
      arr[ix + 1] = lerp(dust[ix + 1] + Math.cos(t * 0.5 + i) * drift, targets[ix + 1], morph);
      arr[ix + 2] = lerp(dust[ix + 2] + wob, targets[ix + 2], morph);
    }
    geometry.attributes.position.needsUpdate = true;
    material.opacity = 0.2 + 0.65 * fade;
    // Deterministic cyan → teal shift as the dust becomes thread.
    material.color.copy(DUST_COLOR).lerp(THREAD_COLOR, smoothstep(0.45, 0.75, morph));
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
