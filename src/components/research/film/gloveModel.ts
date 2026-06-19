import * as THREE from 'three';

// ============================================================
// The research glove, rebuilt as a single front-facing silhouette (like the
// glove laid flat and shot head-on). One extruded THREE.Shape = the whole body
// (palm + 5 fingers + thumb), so nothing can detach. The teal conductive grid
// is DRAWN as a canvas texture on a plane sharing the exact same outline, so it
// can never drift. Only the glowing sensor dots are real 3D meshes.
// ============================================================

export const GLOVE_SCALE = 1.1;
export const GLOVE_OFFSET: [number, number, number] = [1.1, 0.15, 0];
export const GLOVE_TILT: [number, number, number] = [0, 0.15, -0.08];

// Silhouette bounding box (shape space) — shared by the extrude, the texture
// plane and the canvas, so everything lines up by construction.
const MIN_X = -1.85;
const MAX_X = 1.1;
const MIN_Y = -2.6;
const MAX_Y = 2.4;
const BBOX_W = MAX_X - MIN_X;
const BBOX_H = MAX_Y - MIN_Y;
const CENTER_X = (MIN_X + MAX_X) / 2;
const CENTER_Y = (MIN_Y + MAX_Y) / 2;
const PLANE_Z = 0.3;
const SENSOR_Z = 0.36;

interface Pen {
  moveTo(x: number, y: number): unknown;
  lineTo(x: number, y: number): unknown;
  quadraticCurveTo(cx: number, cy: number, x: number, y: number): unknown;
}

// One continuous outline: wrist → up left palm → thumb → index → middle →
// ring → pinky → down right palm → wrist. Rounded tips + notches via quads.
function traceGlove(p: Pen) {
  p.moveTo(-0.9, -2.4);
  p.lineTo(-0.95, -0.3); // up left palm edge to thumb base
  // thumb (angled out-left)
  p.quadraticCurveTo(-1.75, 0.0, -1.55, 0.65);
  p.quadraticCurveTo(-1.45, 0.95, -1.2, 0.7);
  p.quadraticCurveTo(-0.95, 0.35, -0.82, -0.05);
  // webbing up to index base
  p.quadraticCurveTo(-0.95, 0.3, -0.93, 0.55);
  // index
  p.lineTo(-0.93, 1.75);
  p.quadraticCurveTo(-0.93, 1.97, -0.75, 1.97);
  p.quadraticCurveTo(-0.57, 1.97, -0.57, 1.75);
  p.lineTo(-0.57, 0.72);
  p.quadraticCurveTo(-0.48, 0.56, -0.39, 0.72); // index→middle notch
  // middle (tallest)
  p.lineTo(-0.39, 1.95);
  p.quadraticCurveTo(-0.39, 2.2, -0.2, 2.2);
  p.quadraticCurveTo(-0.01, 2.2, -0.01, 1.95);
  p.lineTo(-0.01, 0.75);
  p.quadraticCurveTo(0.08, 0.58, 0.17, 0.75); // middle→ring notch
  // ring
  p.lineTo(0.17, 1.8);
  p.quadraticCurveTo(0.17, 2.05, 0.35, 2.05);
  p.quadraticCurveTo(0.53, 2.05, 0.53, 1.8);
  p.lineTo(0.53, 0.72);
  p.quadraticCurveTo(0.61, 0.56, 0.69, 0.72); // ring→pinky notch
  // pinky (shortest)
  p.lineTo(0.69, 1.4);
  p.quadraticCurveTo(0.69, 1.62, 0.83, 1.62);
  p.quadraticCurveTo(0.97, 1.62, 0.97, 1.4);
  p.lineTo(0.95, 0.3);
  // down right palm edge to wrist
  p.lineTo(0.9, -2.4);
  p.lineTo(-0.9, -2.4);
}

// Conductive thread grid (shape-space line segments).
const GRID_V: [number, number, number, number][] = [
  // palm verticals
  [-0.6, -2.2, -0.6, 0.4], [-0.3, -2.2, -0.3, 0.5], [0.0, -2.2, 0.0, 0.6], [0.3, -2.2, 0.3, 0.5], [0.6, -2.2, 0.6, 0.4],
  // index
  [-0.86, 0.5, -0.86, 1.8], [-0.75, 0.5, -0.75, 1.85], [-0.64, 0.5, -0.64, 1.8],
  // middle
  [-0.34, 0.6, -0.34, 2.05], [-0.2, 0.6, -0.2, 2.1], [-0.06, 0.6, -0.06, 2.05],
  // ring
  [0.22, 0.6, 0.22, 1.9], [0.35, 0.6, 0.35, 1.95], [0.48, 0.6, 0.48, 1.9],
  // pinky
  [0.73, 0.45, 0.73, 1.45], [0.83, 0.45, 0.83, 1.5], [0.93, 0.45, 0.93, 1.45],
  // thumb
  [-0.9, -0.1, -1.45, 0.65], [-0.8, -0.25, -1.3, 0.5],
];
const GRID_H: [number, number, number, number][] = [
  // palm horizontals
  [-0.8, -2.0, 0.8, -2.0], [-0.82, -1.6, 0.82, -1.6], [-0.85, -1.2, 0.85, -1.2], [-0.82, -0.8, 0.82, -0.8], [-0.8, -0.4, 0.8, -0.4], [-0.75, 0.0, 0.75, 0.0],
  // index
  [-0.9, 0.9, -0.6, 0.9], [-0.9, 1.3, -0.6, 1.3], [-0.9, 1.65, -0.6, 1.65],
  // middle
  [-0.36, 1.1, -0.04, 1.1], [-0.36, 1.5, -0.04, 1.5], [-0.36, 1.9, -0.04, 1.9],
  // ring
  [0.2, 1.05, 0.5, 1.05], [0.2, 1.45, 0.5, 1.45], [0.2, 1.8, 0.5, 1.8],
  // pinky
  [0.71, 0.8, 0.95, 0.8], [0.71, 1.1, 0.95, 1.1], [0.71, 1.35, 0.95, 1.35],
];

type SensorKind = 'tip' | 'palm';
const SENSOR_POINTS: { x: number; y: number; kind: SensorKind }[] = [
  { x: -0.75, y: 1.78, kind: 'tip' },
  { x: -0.2, y: 2.0, kind: 'tip' },
  { x: 0.35, y: 1.88, kind: 'tip' },
  { x: 0.83, y: 1.43, kind: 'tip' },
  { x: -1.4, y: 0.68, kind: 'tip' },
  { x: -0.5, y: -0.25, kind: 'palm' },
  { x: 0.0, y: -0.05, kind: 'palm' },
  { x: 0.5, y: -0.25, kind: 'palm' },
  { x: -0.4, y: -0.95, kind: 'palm' },
  { x: 0.3, y: -0.95, kind: 'palm' },
  { x: 0.0, y: -1.5, kind: 'palm' },
];

const TIP_COLOR = 0x00e5cc;
const PALM_COLOR = 0x14b89a;
const IMU_COLOR = 0x7c3aed;

function makeGridTexture(): THREE.CanvasTexture {
  const H = 1024;
  const W = Math.round((1024 * BBOX_W) / BBOX_H);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const px = (x: number) => ((x - MIN_X) / BBOX_W) * W;
  const py = (y: number) => H - ((y - MIN_Y) / BBOX_H) * H;

  // Silhouette path (transformed into pixel space).
  const pen: Pen = {
    moveTo: (x, y) => ctx.moveTo(px(x), py(y)),
    lineTo: (x, y) => ctx.lineTo(px(x), py(y)),
    quadraticCurveTo: (cx, cy, x, y) => ctx.quadraticCurveTo(px(cx), py(cy), px(x), py(y)),
  };

  ctx.clearRect(0, 0, W, H);
  ctx.beginPath();
  traceGlove(pen);
  ctx.closePath();
  ctx.fillStyle = '#e8ede9';
  ctx.fill();

  // Clip to the silhouette so threads/dots never bleed outside the fabric.
  ctx.save();
  ctx.clip();

  ctx.strokeStyle = 'rgba(26,188,156,0.85)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  [...GRID_V, ...GRID_H].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(px(x1), py(y1));
    ctx.lineTo(px(x2), py(y2));
    ctx.stroke();
  });

  // Faint sensor marks baked into the texture (3D spheres glow on top).
  SENSOR_POINTS.forEach(({ x, y, kind }) => {
    ctx.beginPath();
    ctx.arc(px(x), py(y), kind === 'tip' ? 7 : 6, 0, Math.PI * 2);
    ctx.fillStyle = kind === 'tip' ? 'rgba(0,229,204,0.9)' : 'rgba(20,184,154,0.85)';
    ctx.fill();
  });
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export interface GloveModel {
  group: THREE.Group;
  /** All fabric / hardware materials — faded in together on reveal. */
  bodyMats: THREE.Material[];
  /** Glowing sensor dots — faded + sequenced emissive ignition. */
  sensors: { mesh: THREE.Mesh; phase: number }[];
}

export function buildGlove(): GloveModel {
  const group = new THREE.Group();
  const sensors: GloveModel['sensors'] = [];

  // ── Extruded white body (one continuous silhouette) ──
  const shape = new THREE.Shape();
  traceGlove(shape);
  shape.closePath();
  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.25,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 4,
  });
  const fabricMat = new THREE.MeshStandardMaterial({ color: 0xe8ede9, roughness: 0.8, metalness: 0, transparent: true, opacity: 0 });
  const body = new THREE.Mesh(bodyGeo, fabricMat);
  body.renderOrder = 1;
  group.add(body);

  // ── Texture plane (grid + dots) directly in front, same outline ──
  const gridTex = makeGridTexture();
  const planeMat = new THREE.MeshStandardMaterial({
    map: gridTex,
    roughness: 0.85,
    metalness: 0,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(BBOX_W, BBOX_H), planeMat);
  plane.position.set(CENTER_X, CENTER_Y, PLANE_Z);
  plane.renderOrder = 2;
  group.add(plane);

  // ── Wrist band + buckle + PCB module ──
  // Band overlaps the cuff bottom (palm bottom is y=-2.4) so it never floats.
  const bandMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.9, metalness: 0.1, transparent: true, opacity: 0 });
  const band = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, 0.5), bandMat);
  band.position.set(-0.05, -2.5, 0.0); // spans y -2.2 .. -2.8, overlapping the cuff
  group.add(band);

  const buckleMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.35, metalness: 0.7, transparent: true, opacity: 0 });
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.1), buckleMat);
  buckle.position.set(-0.05, -2.55, 0.3);
  group.add(buckle);

  const pcbMat = new THREE.MeshStandardMaterial({
    color: 0x0a2010,
    roughness: 0.4,
    metalness: 0.4,
    emissive: new THREE.Color(0x001a08),
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0,
  });
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.12), pcbMat);
  pcb.position.set(0.15, -2.25, 0.34); // on the cuff front, just above the strap
  group.add(pcb);
  const chipMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.6, transparent: true, opacity: 0 });
  ([[0.05, 0], [-0.08, 0.05]] as [number, number][]).forEach(([dx, dy]) => {
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.04), chipMat);
    chip.position.set(0.15 + dx, -2.25 + dy, 0.42);
    group.add(chip);
  });

  const bodyMats: THREE.Material[] = [fabricMat, planeMat, bandMat, buckleMat, pcbMat, chipMat];

  // ── Sensor dots (real 3D glow meshes, aligned to the texture dots) ──
  const addSensor = (mesh: THREE.Mesh) => {
    sensors.push({ mesh, phase: Math.random() * Math.PI * 2 });
    group.add(mesh);
  };
  SENSOR_POINTS.forEach(({ x, y, kind }) => {
    const col = kind === 'tip' ? TIP_COLOR : PALM_COLOR;
    const mat = new THREE.MeshStandardMaterial({
      color: col,
      emissive: new THREE.Color(col),
      emissiveIntensity: 0,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(kind === 'tip' ? 0.07 : 0.06, 12, 10), mat);
    mesh.position.set(x, y, SENSOR_Z);
    mesh.renderOrder = 3;
    addSensor(mesh);
  });
  // IMU sensor on the PCB.
  const imuMat = new THREE.MeshStandardMaterial({
    color: IMU_COLOR,
    emissive: new THREE.Color(IMU_COLOR),
    emissiveIntensity: 0,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0,
  });
  const imu = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), imuMat);
  imu.position.set(0.15, -2.25, 0.46);
  imu.renderOrder = 3;
  addSensor(imu);

  group.scale.setScalar(GLOVE_SCALE);
  group.position.set(GLOVE_OFFSET[0], GLOVE_OFFSET[1], GLOVE_OFFSET[2]);
  group.rotation.set(GLOVE_TILT[0], GLOVE_TILT[1], GLOVE_TILT[2]);

  return { group, bodyMats, sensors };
}

export function disposeGlove(group: THREE.Group) {
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material;
    if (mat) {
      (Array.isArray(mat) ? mat : [mat]).forEach((m) => {
        const map = (m as THREE.MeshStandardMaterial).map;
        if (map) map.dispose();
        m.dispose();
      });
    }
  });
}
