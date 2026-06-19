'use client';
import { useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { filmStore } from './filmStore';
import { bloomStrength } from './scenes';

// Subtle film grain in screen space.
const GrainShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uAmount: { value: 0.05 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAmount;
    varying vec2 vUv;
    float rand(vec2 co) { return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      float g = rand(vUv + fract(uTime));
      c.rgb += (g - 0.5) * uAmount;
      gl_FragColor = c;
    }
  `,
};

// Hand-rolled post stack (RenderPass → bloom → grain → OutputPass). Used instead
// of @react-three/postprocessing because that package's current major requires
// R3F v9; this matches the proven jsm pipeline used elsewhere in the project.
// Taking over the render loop (useFrame priority 1) disables R3F's auto-render.
export default function Effects() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const fx = useMemo(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    // strength (driven per-frame), radius (tight), threshold (high so only the
    // emissive teal sensors/threads bloom — not the diffuse white fabric).
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 1.6, 0.35, 0.7);
    composer.addPass(bloom);
    const grain = new ShaderPass(GrainShader);
    composer.addPass(grain);
    composer.addPass(new OutputPass());
    return { composer, bloom, grain };
    // size handled in a dedicated effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => {
    fx.composer.setSize(size.width, size.height);
    fx.composer.setPixelRatio(gl.getPixelRatio());
    fx.bloom.setSize(size.width, size.height);
  }, [fx, size, gl]);

  useEffect(() => () => fx.composer.dispose(), [fx]);

  useFrame((_, delta) => {
    fx.bloom.strength = bloomStrength(filmStore.progress);
    fx.grain.uniforms.uTime.value += delta;
    fx.composer.render();
  }, 1);

  return null;
}
