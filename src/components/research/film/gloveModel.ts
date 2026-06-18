import * as THREE from 'three';

export interface GloveSensor {
  mesh: THREE.Mesh;
  color: THREE.Color;
  phase: number;
}

export interface GloveModel {
  group: THREE.Group;
  /** Emissive sensor nodes (cyan fingertips, gold palm, purple IMU). */
  sensors: GloveSensor[];
  /** Fabric/hardware materials faded in together as the glove "prints". */
  bodyMats: THREE.Material[];
  /** Point cloud sampled from the fabric surface — the morph target for the dust. */
  samples: Float32Array;
}

/**
 * Builds the e-textile pressure glove as a single THREE.Group, plus a surface
 * point cloud used by the particle system to "print" the glove in Scene 1.
 * Body materials start at opacity 0 (invisible during the cold open) and are
 * revealed by the film driver.
 */
export function buildGlove(sampleCount: number): GloveModel {
  const group = new THREE.Group();
  const sensors: GloveSensor[] = [];

  const fabricMat = new THREE.MeshStandardMaterial({
    color: 0x0a0e16,
    metalness: 0.1,
    roughness: 0.85,
    transparent: true,
    opacity: 0,
  });
  const threadMat = new THREE.MeshStandardMaterial({
    color: 0x1a2235,
    metalness: 0.4,
    roughness: 0.5,
    emissive: new THREE.Color(0x001122),
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0,
  });
  const hardMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.6,
    roughness: 0.3,
    transparent: true,
    opacity: 0,
  });
  const bodyMats: THREE.Material[] = [fabricMat, threadMat, hardMat];

  const sensorMaterial = (col: number) =>
    new THREE.MeshStandardMaterial({
      color: col,
      emissive: new THREE.Color(col),
      emissiveIntensity: 0,
      metalness: 0.2,
      roughness: 0.15,
      transparent: true,
      opacity: 0,
    });

  const addSensor = (mesh: THREE.Mesh, col: number) => {
    mesh.userData.isSensor = true;
    sensors.push({ mesh, color: new THREE.Color(col), phase: Math.random() * Math.PI * 2 });
  };

  // ── Palm + chamfered sides ──
  const palm = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.9, 0.5), fabricMat);
  palm.position.set(0, -0.3, 0);
  group.add(palm);
  [-0.85, 0.85].forEach((x) => {
    const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 1.9, 10), fabricMat);
    ch.position.set(x, -0.3, 0);
    group.add(ch);
  });

  // ── Wrist + IMU housing ──
  const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.74, 0.9, 16), fabricMat);
  wrist.position.set(0, -1.55, 0);
  group.add(wrist);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.26, 18), hardMat);
  band.position.set(0, -1.7, 0);
  group.add(band);
  const imu = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.18, 0.22), hardMat);
  imu.position.set(0, -1.7, 0.6);
  group.add(imu);

  // ── Four fingers (3 tapered segments + knuckle rings + fingertip sensor) ──
  const fingerDefs: [number, number, number][] = [
    [-0.7, 0.6, 1.0],
    [-0.22, 0.72, 1.1],
    [0.26, 0.68, 1.05],
    [0.72, 0.5, 0.9],
  ];
  fingerDefs.forEach(([x, yBase, scale]) => {
    const fg = new THREE.Group();
    fg.position.set(x, yBase, 0);
    const lens = [0.5, 0.44, 0.36].map((l) => l * scale);
    const rads = [
      [0.155, 0.145],
      [0.145, 0.135],
      [0.135, 0.115],
    ].map((r) => r.map((v) => v * scale));
    let yOff = 0;
    lens.forEach((len, si) => {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(rads[si][0], rads[si][1], len, 12), fabricMat);
      seg.position.y = yOff + len / 2;
      fg.add(seg);
      yOff += len + 0.02;
      const knuckle = new THREE.Mesh(new THREE.TorusGeometry(rads[si][0] + 0.01, 0.018, 6, 16), threadMat);
      knuckle.position.y = yOff - len * 0.1;
      knuckle.rotation.x = Math.PI / 2;
      fg.add(knuckle);
    });
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), sensorMaterial(0x00d9ff));
    tip.position.y = yOff + 0.04;
    fg.add(tip);
    addSensor(tip, 0x00d9ff);
    group.add(fg);
  });

  // ── Thumb ──
  const thumb = new THREE.Group();
  thumb.position.set(-1.0, -0.1, 0.1);
  thumb.rotation.z = 0.9;
  thumb.rotation.y = -0.3;
  let ty = 0;
  ([
    [0.18, 0.165, 0.5],
    [0.165, 0.15, 0.42],
    [0.15, 0.13, 0.34],
  ] as [number, number, number][]).forEach(([r1, r2, l]) => {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, l, 12), fabricMat);
    s.position.y = ty + l / 2;
    thumb.add(s);
    ty += l + 0.02;
  });
  const thumbTip = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), sensorMaterial(0x00d9ff));
  thumbTip.position.y = ty + 0.03;
  thumb.add(thumbTip);
  addSensor(thumbTip, 0x00d9ff);
  group.add(thumb);

  // ── Palm velostat sensors (gold) ──
  ([
    [-0.5, 0.15, 0.27],
    [0.05, 0.32, 0.27],
    [0.5, 0.1, 0.27],
    [-0.05, -0.35, 0.27],
  ] as [number, number, number][]).forEach(([x, y, z]) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), sensorMaterial(0xd4a574));
    s.position.set(x, y, z);
    group.add(s);
    addSensor(s, 0xd4a574);
  });

  // ── IMU sensor node (purple) ──
  const imuSensor = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), sensorMaterial(0x7c3aed));
  imuSensor.position.set(0, -1.66, 0.74);
  group.add(imuSensor);
  addSensor(imuSensor, 0x7c3aed);

  // ── Sample the fabric surface into a morph-target point cloud ──
  group.updateMatrixWorld(true);
  const verts: number[] = [];
  const v = new THREE.Vector3();
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh && !mesh.userData.isSensor) {
      const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
        verts.push(v.x, v.y, v.z);
      }
    }
  });
  const total = verts.length / 3;
  const samples = new Float32Array(sampleCount * 3);
  for (let i = 0; i < sampleCount; i++) {
    const r = Math.floor(Math.random() * total) * 3;
    samples[i * 3] = verts[r] + (Math.random() - 0.5) * 0.04;
    samples[i * 3 + 1] = verts[r + 1] + (Math.random() - 0.5) * 0.04;
    samples[i * 3 + 2] = verts[r + 2] + (Math.random() - 0.5) * 0.04;
  }

  return { group, sensors, bodyMats, samples };
}

/** Frees every geometry + material in the glove group. */
export function disposeGlove(group: THREE.Group) {
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material;
    if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((m) => m.dispose());
  });
}
