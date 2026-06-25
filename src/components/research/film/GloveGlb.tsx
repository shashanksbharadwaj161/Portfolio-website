'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { filmStore } from './filmStore';
import { gloveReveal, sensorIgnite, clamp01 } from './scenes';

// Drop a real glove here (see public/research/models/README.md).
export const GLOVE_MODEL_URL = '/research/models/glove.glb';

// --- Normalisation -----------------------------------------------------------
// The supplied Quaternius .glb (FBX2glTF export) imports lying flat: a baked
// -90° X node rotation + 100x scale leave the model's longest axis along world
// Z (fingertips at +Z, open cuff at -Z, verified from its bounding box + taper).
// We stand it up with a corrective rotation, THEN measure, so "height" is the
// real fingertip-to-cuff length rather than the ~0.27 unit thickness.
//
// ORIENT is the one thing that may still need a browser tweak: if the glove
// appears upside-down flip ORIENT_X sign; if the palm faces away from camera
// set ORIENT_Y to Math.PI.
const TARGET_HEIGHT = 5.0;
const OFFSET = new THREE.Vector3(1.0, 0.0, 0);
const ORIENT_X = -Math.PI / 2; // fingers (+Z) -> up (+Y)
const ORIENT_Y = 0; // rotate to choose which face (palm/back) meets the camera

// Matte off-white e-textile fabric. Deliberately NOT pure white so it doesn't
// blow out under bloom (the reference glove is cotton, not paper-white).
const BODY_COLOR = 0xe8e4da;

const TIP_COLOR = 0x1fd6bd; // bright teal fingertip / knuckle sensor nodes
const PALM_COLOR = 0x14b89a; // slightly deeper teal palm-grid nodes
const LED_COLOR = 0x00e5cc;

function fabricMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: BODY_COLOR,
    roughness: 0.85,
    metalness: 0.0,
    transparent: true,
    opacity: 0,
  });
}

// Emissive teal sensor dot — the whole "e-textile" read, since the model's UVs
// are a single-texel palette (no usable unwrap) so a thread texture is impossible.
function makeSensor(color: number, radius = 0.065): THREE.Mesh {
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0,
    roughness: 0.25,
    metalness: 0.1,
    transparent: true,
    opacity: 0,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 10), mat);
}

// Black neoprene wrist strap (a flattened band wrapping the cuff) with the
// microcontroller PCB velcro'd onto its FRONT face — strapped on, not embedded.
function buildWristModule(hx: number, hy: number): {
  group: THREE.Group;
  mats: THREE.Material[];
  led: THREE.Mesh;
} {
  const group = new THREE.Group();
  const mats: THREE.Material[] = [];
  const track = (m: THREE.MeshStandardMaterial) => {
    m.transparent = true;
    m.opacity = 0;
    mats.push(m);
    return m;
  };

  const wristY = -hy * 0.78; // sit at the cuff, just above the bottom edge
  const strapR = hx * 0.5;

  // --- strap: a torus rotated so its hole runs vertically, squashed to an oval.
  const strap = new THREE.Mesh(
    new THREE.TorusGeometry(strapR, 0.14, 12, 36),
    track(new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.9, metalness: 0.1 }))
  );
  strap.rotation.x = Math.PI / 2;
  strap.scale.set(1.18, 1.0, 0.8); // wider across the wrist than front-to-back
  strap.position.set(0, wristY, 0);
  group.add(strap);

  // --- PCB module, sitting on the front of the strap, facing the camera.
  const pcbGroup = new THREE.Group();
  pcbGroup.position.set(0, wristY + 0.08, strapR * 0.8 + 0.22);
  pcbGroup.rotation.x = -0.18; // tilt the face up toward the camera
  group.add(pcbGroup);

  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.5, 0.1),
    track(new THREE.MeshStandardMaterial({ color: 0x123d24, metalness: 0.3, roughness: 0.5 }))
  );
  pcbGroup.add(pcb);

  const chip = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.22, 0.06),
    track(new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.6, roughness: 0.3 }))
  );
  chip.position.set(0.04, 0.04, 0.08);
  pcbGroup.add(chip);

  // small passives
  ([[-0.22, 0.12], [-0.2, -0.12], [0.26, -0.1]] as [number, number][]).forEach(([x, y]) => {
    const comp = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.05),
      track(new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.4 }))
    );
    comp.position.set(x, y, 0.07);
    pcbGroup.add(comp);
  });

  // connector header — a row of pins along the bottom edge (matches the photo).
  for (let i = 0; i < 4; i++) {
    const pin = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.07, 0.05),
      track(new THREE.MeshStandardMaterial({ color: 0xc9b458, metalness: 0.8, roughness: 0.3 }))
    );
    pin.position.set(-0.12 + i * 0.08, -0.22, 0.08);
    pcbGroup.add(pin);
  }

  // thin antenna stub
  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6),
    track(new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 }))
  );
  antenna.position.set(0.28, 0.18, 0.05);
  antenna.rotation.z = 0.35;
  pcbGroup.add(antenna);

  // status LED (blinks)
  const ledMat = new THREE.MeshStandardMaterial({
    color: LED_COLOR,
    emissive: new THREE.Color(LED_COLOR),
    emissiveIntensity: 0,
    transparent: true,
    opacity: 0,
  });
  mats.push(ledMat);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), ledMat);
  led.position.set(-0.26, -0.04, 0.1);
  pcbGroup.add(led);

  return { group, mats, led };
}

export default function GloveGlb() {
  const { scene } = useGLTF(GLOVE_MODEL_URL);

  const built = useMemo(() => {
    const root = new THREE.Group();
    const bodyMats: THREE.Material[] = [];

    // Clone (useGLTF caches the original) + override materials for the fabric look.
    const model = scene.clone(true);
    model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        const mat = fabricMaterial();
        mesh.material = mat;
        bodyMats.push(mat);
      }
    });

    // Stand it up, THEN measure (so size.y is the real height), THEN centre.
    const oriented = new THREE.Group();
    oriented.rotation.set(ORIENT_X, ORIENT_Y, 0);
    oriented.add(model);

    const box = new THREE.Box3().setFromObject(oriented);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    oriented.position.sub(center);

    const normalized = new THREE.Group();
    normalized.add(oriented);
    const s = TARGET_HEIGHT / (size.y || 1);
    normalized.scale.setScalar(s);
    root.add(normalized);

    // Scaled half-extents (model now centred at root origin).
    const hx = (size.x * s) / 2;
    const hy = (size.y * s) / 2;
    const hz = (size.z * s) / 2;
    const zFront = hz * 0.82; // park dots just proud of the front surface

    // Wrist strap + microcontroller module.
    const wrist = buildWristModule(hx, hy);
    root.add(wrist.group);
    bodyMats.push(...wrist.mats);

    // Sensor dots (STEP 2B): fingertips + a mid-finger row + a palm grid. Read
    // as a high-tech sensor glove; placement is proportional, not anatomical.
    const sensors: { mesh: THREE.Mesh; phase: number }[] = [];
    const addSensor = (mesh: THREE.Mesh, x: number, y: number) => {
      mesh.position.set(x, y, zFront);
      root.add(mesh);
      sensors.push({ mesh, phase: Math.random() * Math.PI * 2 });
    };

    // 5 fingertips (thumb sits lower/out; middle finger highest).
    ([[-0.66, 0.6], [-0.33, 0.86], [-0.04, 0.92], [0.25, 0.85], [0.52, 0.72]] as [number, number][]).forEach(
      ([fx, fy]) => addSensor(makeSensor(TIP_COLOR), fx * hx, fy * hy)
    );
    // mid-finger knuckle nodes (index..pinky).
    ([[-0.33, 0.46], [-0.04, 0.5], [0.25, 0.46], [0.52, 0.38]] as [number, number][]).forEach(([fx, fy]) =>
      addSensor(makeSensor(TIP_COLOR, 0.055), fx * hx, fy * hy)
    );
    // palm grid (6 nodes).
    ([[-0.34, 0.16], [0.0, 0.18], [0.32, 0.12], [-0.28, -0.16], [0.06, -0.14], [0.3, -0.2]] as [number, number][]).forEach(
      ([px, py]) => addSensor(makeSensor(PALM_COLOR), px * hx, py * hy)
    );

    root.position.copy(OFFSET);
    return { root, bodyMats, sensors, led: wrist.led };
  }, [scene]);

  const rootRef = useRef<THREE.Group>(null);

  useEffect(() => {
    return () => {
      built.root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const m = mesh.material;
          if (m) (Array.isArray(m) ? m : [m]).forEach((mm) => mm.dispose());
        }
      });
    };
  }, [built]);

  useFrame((state) => {
    const p = filmStore.progress;
    const reveal = gloveReveal(p);
    const ignite = sensorIgnite(p);
    const t = state.clock.elapsedTime;

    for (const mat of built.bodyMats) {
      (mat as THREE.MeshStandardMaterial).opacity = reveal;
    }
    built.sensors.forEach((sensor, i) => {
      const mat = sensor.mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = reveal;
      const seq = clamp01((ignite - (i % 6) * 0.05) / 0.4);
      const pulse = 0.55 + Math.sin(t * 2.2 + sensor.phase) * 0.45;
      mat.emissiveIntensity = reveal * seq * (0.7 + pulse);
    });
    // Status LED blink.
    (built.led.material as THREE.MeshStandardMaterial).emissiveIntensity =
      reveal * (Math.sin(t * 5) > 0.4 ? 1.4 : 0.2);

    // Gentle oscillating rotation so it reads as 3D.
    built.root.rotation.y = Math.sin(t * 0.35) * 0.1;
    built.root.position.y = OFFSET.y + Math.sin(t * 0.5) * 0.05 * reveal;
  });

  return <primitive ref={rootRef} object={built.root} />;
}

useGLTF.preload(GLOVE_MODEL_URL);
