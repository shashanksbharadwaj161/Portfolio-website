'use client';
import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Particles from './Particles';
import { buildGlove, disposeGlove } from './gloveModel';
import { filmStore } from './filmStore';
import { gloveReveal } from './scenes';

const SAMPLE_COUNT = 1600;

// Lights + the glove + the shared particle system. One useFrame reveals the
// glove body, pulses the sensors, and adds a touch of life — all driven by
// scroll progress.
export default function FilmContent() {
  const glove = useMemo(() => buildGlove(SAMPLE_COUNT), []);

  useEffect(() => () => disposeGlove(glove.group), [glove]);

  useFrame((state) => {
    const reveal = gloveReveal(filmStore.progress);
    const t = state.clock.elapsedTime;

    for (const mat of glove.bodyMats) {
      (mat as THREE.Material).opacity = reveal;
    }

    for (const sensor of glove.sensors) {
      const mat = sensor.mesh.material as THREE.MeshStandardMaterial;
      const pulse = 0.55 + Math.sin(t * 2 + sensor.phase) * 0.45;
      mat.opacity = reveal;
      mat.emissiveIntensity = reveal * pulse * 1.7;
    }

    // Subtle living sway once revealed.
    glove.group.rotation.y = Math.sin(t * 0.22) * 0.05 * reveal;
    glove.group.position.y = Math.sin(t * 0.5) * 0.04 * reveal;
  });

  return (
    <>
      <ambientLight color={0x06101e} intensity={1} />
      <directionalLight color={0xffeedd} intensity={2.2} position={[2, 4, 3]} />
      <pointLight color={0x00d9ff} intensity={9} distance={16} position={[-4, 2, -2]} />
      <pointLight color={0xd4a574} intensity={6} distance={14} position={[4, 0, -2]} />
      <pointLight color={0x0a2a66} intensity={3} distance={9} position={[0, -4, 1]} />
      <primitive object={glove.group} />
      <Particles targets={glove.samples} />
    </>
  );
}
