import * as THREE from 'three';

// ============================================================
// The actual research glove: WHITE cotton fabric, TEAL conductive thread
// stitched in a grid, small teal sensor dots at intersections, BLACK wrist
// strap + a dark-green PCB (IMU) module at the wrist.
// ============================================================

// ── MATERIALS ────────────────────────────────────────────────────────────────
function makeWhiteFabric() {
  return new THREE.MeshStandardMaterial({ color: 0xf0f0ee, metalness: 0.0, roughness: 0.92, transparent: true, opacity: 0 });
}
function makeTealThread() {
  return new THREE.MeshStandardMaterial({
    color: 0x1abc9c,
    emissive: new THREE.Color(0x0d7a63),
    emissiveIntensity: 0.4,
    metalness: 0.3,
    roughness: 0.5,
    transparent: true,
    opacity: 0,
  });
}
function makeSensorNode() {
  return new THREE.MeshStandardMaterial({
    color: 0x00e5cc,
    emissive: new THREE.Color(0x00c4ae),
    emissiveIntensity: 0,
    metalness: 0.1,
    roughness: 0.2,
    transparent: true,
    opacity: 0,
  });
}
function makeBlackNeoprene() {
  return new THREE.MeshStandardMaterial({ color: 0x0d0d0d, metalness: 0.1, roughness: 0.9, transparent: true, opacity: 0 });
}
function makePCB() {
  return new THREE.MeshStandardMaterial({
    color: 0x0a2010,
    metalness: 0.4,
    roughness: 0.4,
    emissive: new THREE.Color(0x001a08),
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0,
  });
}

// ── GEOMETRY HELPERS ─────────────────────────────────────────────────────────
function fingerSeg(rTop: number, rBot: number, len: number, mat: THREE.Material): THREE.Mesh {
  return new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, len, 14, 1), mat);
}

// Thin tube between two points — the conductive thread lines.
function makeTube(p1: THREE.Vector3, p2: THREE.Vector3, radius: number, mat: THREE.Material): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len, 6, 1), mat);
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

// ── RETURN SHAPE (matches the film driver in FilmContent) ─────────────────────
export interface GloveModel {
  group: THREE.Group;
  /** White fabric / strap / PCB / hardware materials — faded in on reveal. */
  bodyMats: THREE.Material[];
  /** Shared teal thread material — faded + glow-pulsed. */
  threadMat: THREE.MeshStandardMaterial;
  /** Teal sensor dots — opacity + sequenced emissive ignition. */
  sensors: { mesh: THREE.Mesh; phase: number }[];
  /** Point cloud roughly filling the glove — the particle morph target. */
  samples: Float32Array;
}

const FINGER_DEFS: [number, number, number, number][] = [
  [-0.72, 0.72, 0.16, 1.0], // index
  [-0.22, 0.82, 0.05, 1.1], // middle (longest)
  [0.28, 0.76, -0.05, 1.05], // ring
  [0.76, 0.6, -0.18, 0.88], // pinky
];

export function buildGlove(): GloveModel {
  const group = new THREE.Group();

  const fabric = makeWhiteFabric();
  const thread = makeTealThread();
  const sensorBase = makeSensorNode();
  const strap = makeBlackNeoprene();
  const pcb = makePCB();
  const buckleMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7, roughness: 0.3, transparent: true, opacity: 0 });
  const chipMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0 });

  const bodyMats: THREE.Material[] = [fabric, strap, pcb, buckleMat, chipMat];
  const sensors: GloveModel['sensors'] = [];
  const THREAD_R = 0.012;

  const addSensor = (mesh: THREE.Mesh) => {
    sensors.push({ mesh, phase: Math.random() * Math.PI * 2 });
    group.add(mesh);
  };

  // ── PALM ──
  const palm = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.1, 0.45), fabric);
  palm.position.set(0, -0.25, 0);
  group.add(palm);
  [-0.95, 0.95].forEach((x) => {
    const edge = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 2.1, 10), fabric);
    edge.position.set(x, -0.25, 0);
    group.add(edge);
  });

  // ── WRIST + BLACK STRAP + PCB MODULE ──
  const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.92, 0.7, 16), fabric);
  wrist.position.set(0, -1.5, 0);
  group.add(wrist);

  const strapMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.5, 20), strap);
  strapMesh.position.set(0, -1.85, 0);
  group.add(strapMesh);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.08), buckleMat);
  buckle.position.set(0, -1.85, 0.98);
  group.add(buckle);

  const pcbMesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.12), pcb);
  pcbMesh.position.set(0.2, -1.78, 0.88);
  group.add(pcbMesh);
  ([[0, 0], [0.12, -0.06], [-0.1, 0.05]] as [number, number][]).forEach(([dx, dy]) => {
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.04), chipMat);
    chip.position.set(0.2 + dx, -1.78 + dy, 0.95);
    group.add(chip);
  });

  // ── FINGERS ──
  const fingertips: THREE.Vector3[] = [];
  const midJoints: THREE.Vector3[] = [];

  FINGER_DEFS.forEach(([x, yBase, rz, scale]) => {
    const fg = new THREE.Group();
    fg.position.set(x, yBase, 0);
    fg.rotation.z = rz;

    const segLengths = [0.55, 0.48, 0.4].map((l) => l * scale);
    const segRadii = [
      [0.158, 0.148],
      [0.148, 0.138],
      [0.138, 0.118],
    ].map((r) => r.map((v) => v * scale));

    let yOff = 0;
    segLengths.forEach((len, si) => {
      const seg = fingerSeg(segRadii[si][0], segRadii[si][1], len, fabric);
      seg.position.y = yOff + len / 2;
      fg.add(seg);

      const crease = new THREE.Mesh(new THREE.TorusGeometry(segRadii[si][0] * 1.02, 0.012, 6, 18), fabric);
      crease.position.y = yOff + len;
      crease.rotation.x = Math.PI / 2;
      fg.add(crease);

      if (si === 1) midJoints.push(new THREE.Vector3(x, yBase + yOff + len, 0.16));
      yOff += len + 0.015;
    });

    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(segRadii[2][0], 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      fabric
    );
    tip.position.y = yOff;
    tip.rotation.x = Math.PI;
    fg.add(tip);

    fingertips.push(new THREE.Vector3(x, yBase + yOff + 0.05, 0.05));
    group.add(fg);
  });

  // ── THUMB ──
  const thumbGrp = new THREE.Group();
  thumbGrp.position.set(-1.12, -0.05, 0.08);
  thumbGrp.rotation.set(-0.05, -0.25, 0.85);
  ([
    [0.19, 0.175, 0.58],
    [0.175, 0.158, 0.48],
    [0.158, 0.135, 0.4],
  ] as [number, number, number][]).forEach(([r1, r2, l], si) => {
    const seg = fingerSeg(r1, r2, l, fabric);
    seg.position.y = si * 0.52 + l / 2;
    thumbGrp.add(seg);
    if (si < 2) {
      const crease = new THREE.Mesh(new THREE.TorusGeometry(r1 * 1.02, 0.012, 6, 18), fabric);
      crease.position.y = si * 0.52 + l;
      crease.rotation.x = Math.PI / 2;
      thumbGrp.add(crease);
    }
  });
  group.add(thumbGrp);
  fingertips.push(new THREE.Vector3(-1.55, 0.9, 0.1));

  // ── CONDUCTIVE THREAD GRID (the key visual) ──
  // Vertical lines up palm + each finger.
  FINGER_DEFS.forEach(([x, yBase, , scale], fi) => {
    const baseY = -1.2;
    const tipY = yBase + [1.5, 1.65, 1.58, 1.32][fi] * scale;
    [-0.06, 0.0, 0.06].forEach((dx) => {
      group.add(makeTube(new THREE.Vector3(x + dx, baseY, 0.23), new THREE.Vector3(x + dx * 0.3, tipY, 0.15), THREAD_R, thread));
    });
  });
  // Horizontal palm rows.
  for (let yi = 0; yi < 7; yi++) {
    const y = -1.1 + yi * 0.28;
    group.add(makeTube(new THREE.Vector3(-1.0, y, 0.23), new THREE.Vector3(1.0, y, 0.23), THREAD_R, thread));
  }
  // Horizontal finger rows.
  FINGER_DEFS.forEach(([x, yBase, rz, scale]) => {
    for (let row = 0; row < 3; row++) {
      const y = yBase + 0.35 + row * 0.48 * scale;
      const hw = 0.14 * scale;
      group.add(
        makeTube(
          new THREE.Vector3(x - hw * Math.cos(rz), y, 0.15),
          new THREE.Vector3(x + hw * Math.cos(rz), y, 0.15),
          THREAD_R * 0.9,
          thread
        )
      );
    }
  });
  // Thumb threads.
  for (let i = 0; i < 3; i++) {
    group.add(
      makeTube(
        new THREE.Vector3(-1.25, -0.1 + i * 0.45, 0.2),
        new THREE.Vector3(-1.45, 0.1 + i * 0.45, 0.15),
        THREAD_R * 0.85,
        thread
      )
    );
  }

  // ── SENSOR NODES (teal dots at intersections) ──
  fingertips.forEach((pos) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), sensorBase.clone());
    s.position.copy(pos);
    addSensor(s);
  });
  midJoints.forEach((pos) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 6), sensorBase.clone());
    s.position.copy(pos);
    addSensor(s);
  });
  ([
    [-0.55, 0.05, 0.24],
    [0.0, 0.15, 0.24],
    [0.5, 0.05, 0.24],
    [-0.45, -0.4, 0.24],
    [0.0, -0.3, 0.24],
    [0.45, -0.4, 0.24],
    [-0.5, -0.8, 0.24],
    [0.5, -0.8, 0.24],
  ] as [number, number, number][]).forEach(([x, y, z]) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 6), sensorBase.clone());
    s.position.set(x, y, z);
    addSensor(s);
  });
  sensorBase.dispose(); // only its clones are used

  // ── SURFACE POINT CLOUD (particle morph target) ──
  const COUNT = 2800;
  const samples = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r = Math.random();
    let x: number;
    let y: number;
    let z: number;
    if (r < 0.4) {
      x = (Math.random() - 0.5) * 1.8;
      y = -1.1 + Math.random() * 1.7;
      z = (Math.random() - 0.5) * 0.45;
    } else if (r < 0.8) {
      const fi = Math.floor(Math.random() * 4);
      const [fx, fyBase] = FINGER_DEFS[fi];
      x = fx + (Math.random() - 0.5) * 0.32;
      y = fyBase + Math.random() * 1.5;
      z = (Math.random() - 0.5) * 0.3;
    } else {
      x = -1.12 + (Math.random() - 0.5) * 0.38;
      y = -0.05 + Math.random() * 1.1;
      z = 0.08 + (Math.random() - 0.5) * 0.3;
    }
    samples[i * 3] = x;
    samples[i * 3 + 1] = y;
    samples[i * 3 + 2] = z;
  }

  return { group, bodyMats, threadMat: thread, sensors, samples };
}

export function disposeGlove(group: THREE.Group) {
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material;
    if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((m) => m.dispose());
  });
}
