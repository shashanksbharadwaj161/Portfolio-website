'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Particles from './Particles';
import { buildGlove, disposeGlove, GLOVE_OFFSET, GLOVE_TILT } from './gloveModel';
import { filmStore } from './filmStore';
import { gloveReveal, sensorIgnite, lightUp, clamp01 } from './scenes';

// Lights + the white e-textile glove + the dust particles. Scene 0 dust fades
// out, then the glove dissolves in (no morph); the teal sensor dots ignite in
// sequence. Lighting is intentionally soft so the white fabric never blows out.
export default function FilmContent() {
  const glove = useMemo(() => buildGlove(), []);

  const keyRef = useRef<THREE.DirectionalLight>(null);
  const tealRef = useRef<THREE.PointLight>(null);

  useEffect(() => () => disposeGlove(glove.group), [glove]);

  useFrame((state) => {
    const p = filmStore.progress;
    const reveal = gloveReveal(p);
    const ignite = sensorIgnite(p);
    const up = lightUp(p);
    const t = state.clock.elapsedTime;

    // Fabric / hardware fade in together.
    for (const mat of glove.bodyMats) {
      (mat as THREE.Material).opacity = reveal;
    }

    // Sensor dots: fade with the body, then ignite in a staggered sweep.
    glove.sensors.forEach((sensor, i) => {
      const mat = sensor.mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = reveal;
      const seq = clamp01((ignite - (i % 6) * 0.05) / 0.4);
      const pulse = 0.55 + Math.sin(t * 2.2 + sensor.phase) * 0.45;
      mat.emissiveIntensity = reveal * seq * (0.7 + pulse);
    });

    // Soft lighting ramps up with the reveal.
    if (keyRef.current) keyRef.current.intensity = up * 1.0;
    if (tealRef.current) tealRef.current.intensity = up * 2.5;

    // Preserve the base tilt + add a gentle living sway once revealed.
    glove.group.position.set(GLOVE_OFFSET[0], GLOVE_OFFSET[1] + Math.sin(t * 0.5) * 0.04 * reveal, GLOVE_OFFSET[2]);
    glove.group.rotation.set(GLOVE_TILT[0], GLOVE_TILT[1] + Math.sin(t * 0.3) * 0.03 * reveal, GLOVE_TILT[2]);
  });

  return (
    <>
      <ambientLight color={0x1a2535} intensity={0.4} />
      {/* Key from upper-left. */}
      <directionalLight ref={keyRef} color={0xfff5ee} intensity={0} position={[-3, 5, 3]} />
      {/* Teal rim from the right — catches the conductive grid. */}
      <pointLight ref={tealRef} color={0x00e5cc} intensity={0} distance={16} position={[4, 2, 2]} />

      <primitive object={glove.group} />
      <Particles />
    </>
  );
}
