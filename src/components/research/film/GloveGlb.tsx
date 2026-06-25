'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { filmStore } from './filmStore';
import { SCENES, localProgress, clamp01, lerp, smoothstep } from './scenes';

// Scene 1 is the glove chapter; we drive the whole reveal off ITS local 0->1.
const SCENE1 = SCENES[1];

// Drop a real glove here (see public/research/models/README.md).
export const GLOVE_MODEL_URL = '/research/models/glove.glb';

// --- Normalisation -----------------------------------------------------------
// The supplied Quaternius .glb (FBX2glTF export) imports lying flat: a baked
// -90° X node rotation + 100x scale leave the model's longest axis along world
// Z (fingertips at +Z, open cuff at -Z, verified from its bounding box + taper).
// We stand it up with a corrective rotation, THEN measure, so "height" is the
// real fingertip-to-cuff length rather than the ~0.27 unit thickness.
//
// ORIENT is the one thing that may still need a browser tweak:
//  - ORIENT_X = -PI/2 stands the glove up (fingers +Z -> up +Y), from the taper.
//  - ORIENT_Y = PI flips the detected thumb from +X (screen right) to -X (screen
//    left) to match the reference photo. If the thumb ends up on the right in
//    the browser, set this back to 0.
const TARGET_HEIGHT = 5.0;
const OFFSET = new THREE.Vector3(1.0, 0.0, 0);
const ORIENT_X = -Math.PI / 2; // fingers (+Z) -> up (+Y)
const ORIENT_Y = Math.PI; // thumb -> screen-left (matches the photo)

// --- Scene 1 reveal timing (all in Scene-1 LOCAL progress, 0 -> 1) -----------
// Scrub-safe: everything below is a pure function of local progress (only the
// idle breathe / pulse / LED blink use clock time), so reversing scroll cleanly
// un-turns the glove and de-ignites the dots in reverse order.
const ENTRANCE_END = 0.15; // opacity fade-in + small/rotated entrance
const TURN_END = 0.45; // turntable settle (rotation + scale) completes here
const IGNITE_START = 0.45; // sensors begin lighting only after the settle
const IGNITE_END = 0.75; // all sensors lit by here; idle breathe owns 0.75->1

const ENTRANCE_SCALE = 0.85; // starts smaller, grows to 1.0
const ENTRANCE_TURN = 0.4; // rad: rotated away from camera at entrance
const ENTRANCE_DROP = -0.3; // starts this far below resting, drifts up
const ENTRANCE_RISE_END = 0.35; // local progress where the upward drift finishes

const IGNITION_STAGGER = 0.06; // per-dot gap (LED -> knuckles -> palm -> tips)
const IGNITION_RAMP = 0.13; // how fast each dot powers on
const IGNITION_OVERSHOOT = 0.6; // emissive spike above resting glow when igniting
const SENSOR_BASE_GLOW = 1.3; // resting emissive once a dot is fully lit

const IDLE_ROT_AMP = 0.06; // rad: idle turntable oscillation
const IDLE_ROT_SPEED = 0.85; // ~7.4s period
const IDLE_BOB_AMP = 0.02; // idle vertical bob
const IDLE_BOB_SPEED = 0.7;
const IDLE_PULSE_AMP = 0.18; // subtle per-dot brightness pulse
const IDLE_PULSE_SPEED = 2.0;

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

    // Sensor dots (STEP 2B): fingertips + a knuckle row + a palm grid. Read as a
    // high-tech sensor glove; placement is proportional, not anatomical. `ord` is
    // the ignition order: LED(0) -> knuckles(1-4) -> palm(5-10) -> fingertips(11-15).
    const sensors: { mesh: THREE.Mesh; phase: number; ord: number }[] = [];
    const addSensor = (mesh: THREE.Mesh, x: number, y: number, ord: number) => {
      mesh.position.set(x, y, zFront);
      root.add(mesh);
      sensors.push({ mesh, phase: Math.random() * Math.PI * 2, ord });
    };

    // 5 fingertips, thumb -> pinky (thumb sits lower/out on the detected lobe).
    ([[-0.82, 0.42], [-0.33, 0.86], [-0.04, 0.92], [0.25, 0.85], [0.52, 0.72]] as [number, number][]).forEach(
      ([fx, fy], i) => addSensor(makeSensor(TIP_COLOR), fx * hx, fy * hy, 11 + i)
    );
    // mid-finger knuckle nodes (index..pinky) — ignite first after the LED.
    ([[-0.33, 0.46], [-0.04, 0.5], [0.25, 0.46], [0.52, 0.38]] as [number, number][]).forEach(([fx, fy], i) =>
      addSensor(makeSensor(TIP_COLOR, 0.055), fx * hx, fy * hy, 1 + i)
    );
    // palm grid (6 nodes).
    ([[-0.34, 0.16], [0.0, 0.18], [0.32, 0.12], [-0.28, -0.16], [0.06, -0.14], [0.3, -0.2]] as [number, number][]).forEach(
      ([px, py], i) => addSensor(makeSensor(PALM_COLOR), px * hx, py * hy, 5 + i)
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
    const t = state.clock.elapsedTime;
    const L = localProgress(filmStore.progress, SCENE1); // Scene-1 local 0 -> 1
    const root = built.root;

    // --- 0.00-0.15 ENTRANCE: opacity fades in (this band only). ---
    const reveal = smoothstep(0.02, ENTRANCE_END, L);
    for (const mat of built.bodyMats) {
      (mat as THREE.MeshStandardMaterial).opacity = reveal;
    }

    // --- 0.15-0.45 TURN + SETTLE: eased turntable into the resting pose. ---
    const settle = smoothstep(ENTRANCE_END, TURN_END, L); // 0 -> 1, decelerating
    root.scale.setScalar(lerp(ENTRANCE_SCALE, 1.0, settle));
    const turnOffset = lerp(ENTRANCE_TURN, 0, settle);

    // Idle breathe ramps in across the ignite band so it fully owns 0.75 -> 1.
    const idleGate = smoothstep(TURN_END, IGNITE_END, L);
    root.rotation.y = turnOffset + IDLE_ROT_AMP * Math.sin(t * IDLE_ROT_SPEED) * idleGate;

    const drop = ENTRANCE_DROP * (1 - smoothstep(0, ENTRANCE_RISE_END, L));
    const bob = IDLE_BOB_AMP * Math.sin(t * IDLE_BOB_SPEED) * idleGate;
    root.position.y = OFFSET.y + drop + bob;

    // --- 0.45-0.75 IGNITE: staggered power-on (LED -> knuckles -> palm -> tips),
    // each dot overshoots then settles; idle pulse blends in once it is lit. ---
    // Lower-bounded but NOT capped at 1: during the hold band ip keeps rising so
    // the last-staggered dots finish powering on and settle to their resting glow.
    const ip = Math.max(0, (L - IGNITE_START) / (IGNITE_END - IGNITE_START));
    built.sensors.forEach((sensor) => {
      const mat = sensor.mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = reveal;
      const litRaw = (ip - sensor.ord * IGNITION_STAGGER) / IGNITION_RAMP;
      if (litRaw <= 0) {
        mat.emissiveIntensity = 0;
        return;
      }
      const base = clamp01(litRaw); // steady 0 -> 1 power-on
      const over = IGNITION_OVERSHOOT * Math.sin(clamp01(litRaw / 1.5) * Math.PI); // spike, back to 0
      const pulse = 1 + IDLE_PULSE_AMP * Math.sin(t * IDLE_PULSE_SPEED + sensor.phase);
      mat.emissiveIntensity = reveal * SENSOR_BASE_GLOW * (base + over) * lerp(1, pulse, base);
    });

    // Status LED blinks on first, the instant ignition begins.
    const ledGate = clamp01((L - IGNITE_START) / 0.04);
    (built.led.material as THREE.MeshStandardMaterial).emissiveIntensity =
      reveal * ledGate * (Math.sin(t * 6) > 0.2 ? 1.6 : 0.2);
  });

  return <primitive ref={rootRef} object={built.root} />;
}

useGLTF.preload(GLOVE_MODEL_URL);
