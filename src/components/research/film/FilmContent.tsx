'use client';
import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Particles from './Particles';
import GloveBoundary from './GloveBoundary';
import GloveGlb from './GloveGlb';
import GloveSilhouette from './GloveSilhouette';
import { filmStore } from './filmStore';
import { lightUp } from './scenes';

// Lights + particles + the glove. The glove prefers a real model at
// /research/models/glove.glb; if that's absent or fails to load, it falls back
// to the procedural silhouette so the scene is never broken/empty.
export default function FilmContent() {
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);
  const tealRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const up = lightUp(filmStore.progress);
    if (keyRef.current) keyRef.current.intensity = up * 1.2;
    if (fillRef.current) fillRef.current.intensity = up * 0.5;
    if (tealRef.current) tealRef.current.intensity = up * 2.0;
  });

  return (
    <>
      {/* Product-render 3-point lighting (soft, ramped with the reveal). */}
      <ambientLight color={0x1a2535} intensity={0.3} />
      <directionalLight ref={keyRef} color={0xfff5ee} intensity={0} position={[-3, 5, 3]} />
      <pointLight ref={fillRef} color={0x6f9bd8} intensity={0} distance={16} position={[4, -1, 4]} />
      <pointLight ref={tealRef} color={0x00e5cc} intensity={0} distance={16} position={[2, 4, -3]} />

      <GloveBoundary fallback={<GloveSilhouette />}>
        <Suspense fallback={null}>
          <GloveGlb />
        </Suspense>
      </GloveBoundary>

      <Particles />
    </>
  );
}
