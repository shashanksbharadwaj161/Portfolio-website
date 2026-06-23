'use client';
import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildGlove, disposeGlove, GLOVE_OFFSET, GLOVE_TILT } from './gloveModel';
import { filmStore } from './filmStore';
import { gloveReveal, sensorIgnite, clamp01 } from './scenes';

// Procedural extruded-silhouette glove. Used as the fallback while no real
// /research/models/glove.glb is present (or if it fails to load).
export default function GloveSilhouette() {
  const glove = useMemo(() => buildGlove(), []);

  useEffect(() => () => disposeGlove(glove.group), [glove]);

  useFrame((state) => {
    const p = filmStore.progress;
    const reveal = gloveReveal(p);
    const ignite = sensorIgnite(p);
    const t = state.clock.elapsedTime;

    for (const mat of glove.bodyMats) {
      (mat as THREE.Material).opacity = reveal;
    }
    glove.sensors.forEach((sensor, i) => {
      const mat = sensor.mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = reveal;
      const seq = clamp01((ignite - (i % 6) * 0.05) / 0.4);
      const pulse = 0.55 + Math.sin(t * 2.2 + sensor.phase) * 0.45;
      mat.emissiveIntensity = reveal * seq * (0.7 + pulse);
    });

    glove.group.position.set(GLOVE_OFFSET[0], GLOVE_OFFSET[1] + Math.sin(t * 0.5) * 0.04 * reveal, GLOVE_OFFSET[2]);
    glove.group.rotation.set(GLOVE_TILT[0], GLOVE_TILT[1] + Math.sin(t * 0.3) * 0.03 * reveal, GLOVE_TILT[2]);
  });

  return <primitive object={glove.group} />;
}
