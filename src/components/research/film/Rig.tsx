'use client';
import { useThree, useFrame } from '@react-three/fiber';
import { filmStore } from './filmStore';
import { getCamera } from './scenes';

// Drives the camera deterministically from scroll progress every frame.
export default function Rig() {
  const camera = useThree((s) => s.camera);

  useFrame(() => {
    const { pos, target } = getCamera(filmStore.progress);
    camera.position.set(pos[0], pos[1], pos[2]);
    camera.lookAt(target[0], target[1], target[2]);
  });

  return null;
}
