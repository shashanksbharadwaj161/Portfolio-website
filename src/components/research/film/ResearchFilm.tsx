'use client';
import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Rig from './Rig';
import Effects from './Effects';
import FilmContent from './FilmContent';

// Pauses the render loop when the tab is hidden (the canvas is fixed and spans
// the route, so it is effectively always on-screen while mounted).
function VisibilityPause() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? 'never' : 'always');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [setFrameloop]);
  return null;
}

// The persistent film canvas. Loaded via dynamic(ssr:false) so Three.js never
// runs on the server and the heavy chunk is code-split.
export default function ResearchFilm() {
  return (
    <div className="film-canvas-wrap" aria-hidden="true">
      <Canvas
        frameloop="always"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 42, near: 0.01, far: 100, position: [0, 0.7, 9] }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          scene.background = new THREE.Color(0x020810);
          scene.fog = new THREE.FogExp2(0x020810, 0.04);
        }}
      >
        <VisibilityPause />
        <Rig />
        <FilmContent />
        <Effects />
      </Canvas>
    </div>
  );
}
