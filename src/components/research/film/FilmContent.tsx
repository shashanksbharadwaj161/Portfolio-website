'use client';
import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Particles from './Particles';
import { buildGlove, disposeGlove } from './gloveModel';
import { filmStore } from './filmStore';
import { gloveReveal, sensorIgnite, clamp01 } from './scenes';

// Lights + the white e-textile glove + the shared particle system. One useFrame
// reveals the fabric, glows the teal thread grid, and ignites the sensor dots
// in sequence — all driven by scroll progress.
export default function FilmContent() {
  const glove = useMemo(() => buildGlove(), []);

  useEffect(() => () => disposeGlove(glove.group), [glove]);

  useFrame((state) => {
    const reveal = gloveReveal(filmStore.progress);
    const ignite = sensorIgnite(filmStore.progress);
    const t = state.clock.elapsedTime;

    // White fabric / strap / PCB / hardware fade in.
    for (const mat of glove.bodyMats) {
      (mat as THREE.Material).opacity = reveal;
    }

    // Teal thread grid fades in + breathes.
    glove.threadMat.opacity = reveal;
    glove.threadMat.emissiveIntensity = reveal * (0.35 + Math.sin(t * 1.5) * 0.12);

    // Teal sensor dots: fade with the body, then ignite in a staggered sweep.
    glove.sensors.forEach((sensor, i) => {
      const mat = sensor.mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = reveal;
      const seq = clamp01((ignite - (i % 6) * 0.05) / 0.4);
      const pulse = 0.55 + Math.sin(t * 2.2 + sensor.phase) * 0.45;
      mat.emissiveIntensity = reveal * seq * (0.6 + pulse);
    });

    // Subtle living sway once revealed (camera does the orbiting).
    glove.group.rotation.y = Math.sin(t * 0.22) * 0.05 * reveal;
    glove.group.position.y = Math.sin(t * 0.5) * 0.04 * reveal;
  });

  return (
    <>
      {/* Lifted ambient so the white fabric reads against the dark studio. */}
      <ambientLight color={0x223044} intensity={0.6} />
      {/* Strong warm key — makes the white cotton pop. */}
      <directionalLight color={0xfff5ee} intensity={3.2} position={[-3, 5, 3]} />
      {/* Teal rim — catches the conductive thread grid. */}
      <pointLight color={0x00e5cc} intensity={7} distance={14} position={[4, 2, 2]} />
      {/* Soft cool fill from below lifts the palm shadow. */}
      <pointLight color={0x88ccff} intensity={2} distance={12} position={[0, -3, 3]} />
      {/* Back rim separates the glove from the background. */}
      <pointLight color={0x004433} intensity={5} distance={16} position={[0, 1, -4]} />

      <primitive object={glove.group} />
      <Particles targets={glove.samples} />
    </>
  );
}
