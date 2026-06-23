'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { filmStore } from './filmStore';
import { gloveReveal, sensorIgnite, clamp01 } from './scenes';

// Drop a real glove here (see public/research/models/README.md).
export const GLOVE_MODEL_URL = '/research/models/glove.glb';

// Normalize whatever model is provided to a consistent on-screen size + place.
const TARGET_HEIGHT = 5.0;
const OFFSET = new THREE.Vector3(1.0, 0.0, 0);

const TIP_COLOR = 0x00e5cc;
const PALM_COLOR = 0x14b89a;
const LED_COLOR = 0x00e5cc;

// Small PCB / microcontroller — fine to build procedurally (simple, inorganic).
function buildMicrocontroller(): { group: THREE.Group; mats: THREE.Material[]; led: THREE.Mesh } {
  const group = new THREE.Group();
  const mats: THREE.Material[] = [];
  const mat = (m: THREE.MeshStandardMaterial) => {
    m.transparent = true;
    m.opacity = 0;
    mats.push(m);
    return m;
  };

  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.08, 0.35),
    mat(new THREE.MeshStandardMaterial({ color: 0x0a3018, metalness: 0.3, roughness: 0.5 }))
  );
  group.add(pcb);

  const chip = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.04, 0.18),
    mat(new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.6, roughness: 0.3 }))
  );
  chip.position.set(0.05, 0.06, 0);
  group.add(chip);

  ([[-0.15, 0.1], [-0.1, -0.08], [0.18, -0.1]] as [number, number][]).forEach(([x, z]) => {
    const comp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.03, 8),
      mat(new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.4 }))
    );
    comp.position.set(x, 0.06, z);
    group.add(comp);
  });

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.15, 6),
    mat(new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 }))
  );
  antenna.position.set(0.2, 0.12, 0.1);
  antenna.rotation.z = 0.3;
  group.add(antenna);

  const ledMat = new THREE.MeshStandardMaterial({
    color: LED_COLOR,
    emissive: new THREE.Color(LED_COLOR),
    emissiveIntensity: 0,
    transparent: true,
    opacity: 0,
  });
  mats.push(ledMat);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), ledMat);
  led.position.set(-0.2, 0.06, 0.15);
  group.add(led);

  return { group, mats, led };
}

function makeSensor(color: number): THREE.Mesh {
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), mat);
}

export default function GloveGlb() {
  const { scene } = useGLTF(GLOVE_MODEL_URL);

  const built = useMemo(() => {
    const root = new THREE.Group();
    const bodyMats: THREE.Material[] = [];

    // Clone (useGLTF caches the original) + override materials for the e-textile look.
    const model = scene.clone(true);
    model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        const mat = new THREE.MeshStandardMaterial({
          color: 0xdde3e0,
          roughness: 0.75,
          metalness: 0.05,
          transparent: true,
          opacity: 0,
        });
        mesh.material = mat;
        bodyMats.push(mat);
      }
    });

    // Normalize: center the model, scale it to TARGET_HEIGHT.
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    const inner = new THREE.Group();
    inner.add(model);
    const s = TARGET_HEIGHT / (size.y || 1);
    inner.scale.setScalar(s);
    root.add(inner);

    // Scaled half-extents (model now centred at root origin).
    const hw = (size.x * s) / 2;
    const hh = (size.y * s) / 2;

    // Microcontroller at the wrist (bottom), slightly to the front.
    const micro = buildMicrocontroller();
    micro.group.position.set(0, -hh * 0.92, hw * 0.35);
    root.add(micro.group);
    bodyMats.push(...micro.mats);

    // Sensor dots — approximate fingertip + palm placements from the bounding box.
    const sensors: { mesh: THREE.Mesh; phase: number }[] = [];
    const addSensor = (mesh: THREE.Mesh, x: number, y: number, z: number) => {
      mesh.position.set(x, y, z);
      root.add(mesh);
      sensors.push({ mesh, phase: Math.random() * Math.PI * 2 });
    };
    // 5 fingertips across the top edge.
    [-0.55, -0.27, 0.0, 0.28, 0.52].forEach((fx) => {
      addSensor(makeSensor(TIP_COLOR), fx * hw, hh * 0.82, hw * 0.18);
    });
    // 6 palm sensors.
    ([[-0.35, 0.1], [0.15, 0.18], [0.4, -0.05], [-0.3, -0.25], [0.2, -0.3], [-0.05, -0.05]] as [number, number][]).forEach(
      ([px, py]) => {
        addSensor(makeSensor(PALM_COLOR), px * hw, py * hh, hw * 0.22);
      }
    );

    root.position.copy(OFFSET);
    return { root, bodyMats, sensors, led: micro.led };
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
