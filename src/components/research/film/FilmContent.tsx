'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Particles from './Particles';
import { buildGlove, disposeGlove, GLOVE_SCALE, GLOVE_OFFSET } from './gloveModel';
import { filmStore } from './filmStore';
import { gloveReveal, sensorIgnite, lightUp, clamp01 } from './scenes';

// Lights + the white e-textile glove + the shared particle system. One useFrame
// reveals the fabric, glows the teal thread grid, ignites the sensor dots in
// sequence, and ramps the (deliberately soft) lighting — all from scroll.
export default function FilmContent() {
  const glove = useMemo(() => buildGlove(), []);

  // The particle morph target must match the glove's scale + offset, since the
  // samples are generated in unscaled local space.
  const targets = useMemo(() => {
    const s = glove.samples;
    const out = new Float32Array(s.length);
    for (let i = 0; i < s.length; i += 3) {
      out[i] = s[i] * GLOVE_SCALE + GLOVE_OFFSET[0];
      out[i + 1] = s[i + 1] * GLOVE_SCALE + GLOVE_OFFSET[1];
      out[i + 2] = s[i + 2] * GLOVE_SCALE + GLOVE_OFFSET[2];
    }
    return out;
  }, [glove]);

  const keyRef = useRef<THREE.DirectionalLight>(null);
  const tealRef = useRef<THREE.PointLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);
  const backRef = useRef<THREE.PointLight>(null);

  useEffect(() => () => disposeGlove(glove.group), [glove]);

  useFrame((state) => {
    const p = filmStore.progress;
    const reveal = gloveReveal(p);
    const ignite = sensorIgnite(p);
    const up = lightUp(p);
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

    // Soft lighting ramps up with the reveal (kept low so white never blows out).
    if (keyRef.current) keyRef.current.intensity = up * 1.2;
    if (tealRef.current) tealRef.current.intensity = up * 3.5;
    if (fillRef.current) fillRef.current.intensity = up * 0.8;
    if (backRef.current) backRef.current.intensity = up * 2.5;

    // Subtle living sway once revealed (camera does the orbiting).
    glove.group.position.set(GLOVE_OFFSET[0], GLOVE_OFFSET[1] + Math.sin(t * 0.5) * 0.04 * reveal, GLOVE_OFFSET[2]);
    glove.group.rotation.y = Math.sin(t * 0.22) * 0.05 * reveal;
  });

  return (
    <>
      {/* Very low ambient — white cotton needs almost none. */}
      <ambientLight color={0x223044} intensity={0.25} />
      {/* Soft warm key. */}
      <directionalLight ref={keyRef} color={0xfff5ee} intensity={0} position={[-3, 5, 3]} />
      {/* Teal rim — catches the conductive thread grid. */}
      <pointLight ref={tealRef} color={0x00e5cc} intensity={0} distance={14} position={[4, 2, 2]} />
      {/* Cool underfill lifts the palm shadow. */}
      <pointLight ref={fillRef} color={0x88ccff} intensity={0} distance={10} position={[0, -3, 3]} />
      {/* Back rim separates the glove from the background. */}
      <pointLight ref={backRef} color={0x004433} intensity={0} distance={14} position={[0, 1, -4]} />

      <primitive object={glove.group} />
      <Particles targets={targets} />
    </>
  );
}
