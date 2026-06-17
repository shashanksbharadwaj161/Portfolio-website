'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

gsap.registerPlugin(ScrollTrigger);

export default function ArGlassesReveal() {
  const t = useTranslations('research');
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (typeof window === 'undefined' || !mount) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── RENDERER (guard against WebGL being unavailable) ──────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch {
      mount.classList.add('ar-three-unsupported');
      return;
    }

    const sizeOf = () => ({
      w: mount.offsetWidth || 900,
      h: mount.offsetHeight || 560,
    });

    let { w: W, h: H } = sizeOf();
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    // ── SCENE + IMAGE-BASED LIGHTING ──────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010508);
    scene.fog = new THREE.FogExp2(0x010508, 0.03);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.01, 100);
    camera.position.set(0, 0.3, 8.6);

    // ── LIGHTS ────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0a1428, 1));

    const key = new THREE.DirectionalLight(0xffeedd, 2.6);
    key.position.set(2, 5, 3);
    scene.add(key);

    const rimBlue = new THREE.PointLight(0x12aaff, 12, 18);
    rimBlue.position.set(-5, 1.6, -3);
    scene.add(rimBlue);

    const rimOrange = new THREE.PointLight(0xff5a18, 8, 16);
    rimOrange.position.set(5, 0.5, -4);
    scene.add(rimOrange);

    const fill = new THREE.DirectionalLight(0x6f86c4, 1.0);
    fill.position.set(0, 1, 6);
    scene.add(fill);

    const under = new THREE.PointLight(0x0a2a66, 4, 9);
    under.position.set(0, -3, 1);
    scene.add(under);

    // ── MATERIALS ──────────────────────────────────────────────────────
    // Glossy black acetate (clearcoat) — the Wayfarer signature.
    const frameMat = new THREE.MeshPhysicalMaterial({
      color: 0x0b0b0d,
      metalness: 0.1,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.25,
    });
    const glossyMat = new THREE.MeshPhysicalMaterial({
      color: 0x060606,
      metalness: 0.2,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.4,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xaab4c0,
      metalness: 1.0,
      roughness: 0.14,
      envMapIntensity: 1.6,
    });
    // Dark tinted reflective lens.
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0x060e1a,
      metalness: 0.1,
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      envMapIntensity: 2.6,
      transparent: true,
      opacity: 0.95,
    });

    // ── WAYFARER LENS SILHOUETTE ───────────────────────────────────────
    function wayfarerShape(width: number, height: number, r: number, topBias = 0.06): THREE.Shape {
      const tw = width * (1 + topBias);
      const s = new THREE.Shape();
      s.moveTo(-width / 2 + r, -height / 2);
      s.lineTo(width / 2 - r, -height / 2);
      s.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + r);
      s.lineTo(tw / 2, height / 2 - r);
      s.quadraticCurveTo(tw / 2, height / 2, tw / 2 - r, height / 2);
      s.lineTo(-tw / 2 + r, height / 2);
      s.quadraticCurveTo(-tw / 2, height / 2, -tw / 2, height / 2 - r);
      s.lineTo(-width / 2, -height / 2 + r);
      s.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + r, -height / 2);
      return s;
    }

    // ShapeGeometry assigns raw shape coordinates as UVs; remap to 0..1 so
    // the HUD canvas texture maps cleanly onto the lens silhouette.
    function normalizeUVs(geo: THREE.BufferGeometry) {
      geo.computeBoundingBox();
      const bb = geo.boundingBox!;
      const sx = bb.max.x - bb.min.x || 1;
      const sy = bb.max.y - bb.min.y || 1;
      const pos = geo.attributes.position;
      const uv = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) {
        uv[i * 2] = (pos.getX(i) - bb.min.x) / sx;
        uv[i * 2 + 1] = (pos.getY(i) - bb.min.y) / sy;
      }
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    }

    const LW = 1.65;
    const LH = 1.08;
    const LRAD = 0.15;
    const LENS_X = 1.68;

    const G = new THREE.Group();

    function makeLensFrame(xOff: number) {
      const grp = new THREE.Group();

      const outer = wayfarerShape(LW + 0.16, LH + 0.14, LRAD + 0.02);
      const inner = wayfarerShape(LW, LH, LRAD);
      outer.holes.push(inner);

      const frameGeo = new THREE.ExtrudeGeometry(outer, {
        depth: 0.14,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 5,
      });
      grp.add(new THREE.Mesh(frameGeo, frameMat));

      const lensGeo = new THREE.ShapeGeometry(inner, 40);
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.z = 0.08;
      lens.renderOrder = 1;
      grp.add(lens);

      grp.position.x = xOff;
      return grp;
    }

    G.add(makeLensFrame(-LENS_X));
    G.add(makeLensFrame(LENS_X));

    // Bridge
    const bridgeShape = new THREE.Shape();
    bridgeShape.moveTo(-0.35, 0.09);
    bridgeShape.lineTo(0.35, 0.09);
    bridgeShape.quadraticCurveTo(0.38, 0, 0.35, -0.09);
    bridgeShape.lineTo(-0.35, -0.09);
    bridgeShape.quadraticCurveTo(-0.38, 0, -0.35, 0.09);
    const bridgeGeo = new THREE.ExtrudeGeometry(bridgeShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
    const bridge = new THREE.Mesh(bridgeGeo, frameMat);
    bridge.position.set(0, 0.09, -0.02);
    G.add(bridge);

    // Nose pads
    const nosePadGeo = new THREE.SphereGeometry(0.055, 12, 10);
    [-0.24, 0.24].forEach((x) => {
      const np = new THREE.Mesh(nosePadGeo, glossyMat);
      np.scale.set(1, 1.3, 0.7);
      np.position.set(x, -0.2, 0.13);
      G.add(np);
    });

    // Temples (arms)
    function makeTemple(side: number) {
      const tg = new THREE.Group();
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.092, 0.068, 2.6), frameMat);
      bar.position.set(side * 2.7, 0.06, -1.25);
      bar.rotation.y = side * 0.055;
      tg.add(bar);
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.058, 0.38), glossyMat);
      tip.position.set(side * 2.78, -0.16, -2.44);
      tip.rotation.x = -0.28;
      tg.add(tip);
      const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.092, 16), chromeMat);
      hinge.rotation.z = Math.PI / 2;
      hinge.position.set(side * 2.38, 0.06, 0.04);
      tg.add(hinge);
      return tg;
    }
    G.add(makeTemple(-1));
    G.add(makeTemple(1));

    // Capture-camera module on the right arm (Meta signature) + recording LED
    const camGrp = new THREE.Group();
    const camBody = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.3, 20), glossyMat);
    camBody.rotation.z = Math.PI / 2;
    camBody.position.set(0, 0.088, 0.062);
    camGrp.add(camBody);

    const camLens = new THREE.Mesh(
      new THREE.CircleGeometry(0.038, 24),
      new THREE.MeshStandardMaterial({ color: 0x020810, metalness: 0.3, roughness: 0.02, envMapIntensity: 2 })
    );
    camLens.position.set(0.16, 0.088, 0.102);
    camGrp.add(camLens);

    const camRing = new THREE.Mesh(new THREE.RingGeometry(0.036, 0.05, 24), chromeMat);
    camRing.position.set(0.16, 0.088, 0.105);
    camGrp.add(camRing);

    const ledMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
    const led = new THREE.Mesh(new THREE.CircleGeometry(0.014, 14), ledMat);
    led.position.set(-0.06, 0.088, 0.103);
    camGrp.add(led);

    camGrp.position.set(2.15, 0, 0);
    G.add(camGrp);

    const metaBar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.026, 0.026), chromeMat);
    metaBar.position.set(2.65, 0.068, -0.55);
    G.add(metaBar);

    scene.add(G);

    // ── FLOOR ───────────────────────────────────────────────────────────
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({
        color: 0x00040a,
        metalness: 0.9,
        roughness: 0.12,
        envMapIntensity: 0.6,
        transparent: true,
        opacity: 0.7,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.3;
    scene.add(floor);

    // ── PARTICLE FIELD ───────────────────────────────────────────────────
    const PCOUNT = 700;
    const pArr = new Float32Array(PCOUNT * 3);
    for (let i = 0; i < PCOUNT; i++) {
      pArr[i * 3] = (Math.random() - 0.5) * 24;
      pArr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pArr[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
    const points = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: 0x1f6bd6, size: 0.024, transparent: true, opacity: 0.4, depthWrite: false })
    );
    scene.add(points);

    // ── AR HUD CANVAS TEXTURES ─────────────────────────────────────────────
    function ensureRoundRect(c: CanvasRenderingContext2D) {
      if (typeof c.roundRect === 'function') return;
      // Minimal fallback for older canvas implementations.
      (c as unknown as { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect = (
        x,
        y,
        wd,
        ht,
        r
      ) => {
        const rr = Math.min(r, wd / 2, ht / 2);
        c.beginPath();
        c.moveTo(x + rr, y);
        c.arcTo(x + wd, y, x + wd, y + ht, rr);
        c.arcTo(x + wd, y + ht, x, y + ht, rr);
        c.arcTo(x, y + ht, x, y, rr);
        c.arcTo(x, y, x + wd, y, rr);
        c.closePath();
      };
    }

    function makeHUDCanvas(side: 'left' | 'right'): THREE.CanvasTexture {
      const tc = document.createElement('canvas');
      tc.width = 512;
      tc.height = 340;
      const c = tc.getContext('2d')!;
      ensureRoundRect(c);

      c.fillStyle = 'rgba(0,6,18,0.97)';
      c.fillRect(0, 0, 512, 340);

      for (let y = 0; y < 340; y += 4) {
        c.fillStyle = 'rgba(0,0,0,0.1)';
        c.fillRect(0, y, 512, 2);
      }

      c.strokeStyle = 'rgba(0,217,255,0.85)';
      c.lineWidth = 2.5;
      ([[14, 14, 1, 1], [498, 14, -1, 1], [14, 326, 1, -1], [498, 326, -1, -1]] as const).forEach(([x, y, sx, sy]) => {
        c.beginPath();
        c.moveTo(x + sx * 30, y);
        c.lineTo(x, y);
        c.lineTo(x, y + sy * 30);
        c.stroke();
      });

      c.beginPath();
      c.arc(480, 20, 5, 0, Math.PI * 2);
      c.fillStyle = '#00d9ff';
      c.fill();

      if (side === 'left') {
        c.font = 'bold 13px "Courier New", monospace';
        c.fillStyle = 'rgba(0,217,255,0.6)';
        c.fillText('SENSOR DATA', 24, 38);
        c.strokeStyle = 'rgba(0,217,255,0.15)';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(24, 46);
        c.lineTo(488, 46);
        c.stroke();

        const rows: [string, string, number][] = [
          ['Hand Pos', '120', 0.72],
          ['Confidence', '98%', 0.92],
          ['Pressure', '65g', 0.51],
          ['IMU X', '0.32', 0.48],
        ];
        rows.forEach(([label, val, pct], i) => {
          const y = 78 + i * 60;
          c.font = '12px "Courier New", monospace';
          c.fillStyle = 'rgba(160,190,220,0.55)';
          c.fillText(label, 24, y);
          c.font = 'bold 22px "Courier New", monospace';
          c.fillStyle = '#00d9ff';
          c.fillText(val, 400, y);
          c.fillStyle = 'rgba(255,255,255,0.07)';
          c.beginPath();
          c.roundRect(24, y + 8, 330, 7, 3);
          c.fill();
          const gr = c.createLinearGradient(24, 0, 24 + 330 * pct, 0);
          gr.addColorStop(0, '#00d9ff');
          gr.addColorStop(1, '#d4a574');
          c.fillStyle = gr;
          c.beginPath();
          c.roundRect(24, y + 8, 330 * pct, 7, 3);
          c.fill();
        });

        c.beginPath();
        c.arc(24, 320, 5, 0, Math.PI * 2);
        c.fillStyle = '#00d9ff';
        c.fill();
        c.font = '10px "Courier New", monospace';
        c.fillStyle = 'rgba(0,217,255,0.55)';
        c.fillText('TRACKING ACTIVE  ·  40Hz  ·  9-DOF IMU', 38, 324);
      } else {
        c.font = 'bold 13px "Courier New", monospace';
        c.fillStyle = 'rgba(0,217,255,0.6)';
        c.fillText('GUIDANCE SYSTEM', 24, 38);
        c.strokeStyle = 'rgba(0,217,255,0.15)';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(24, 46);
        c.lineTo(488, 46);
        c.stroke();

        // Hand skeleton
        const hx = 140;
        const hy = 195;
        c.strokeStyle = 'rgba(0,217,255,0.55)';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(hx - 48, hy + 22);
        c.lineTo(hx + 48, hy + 22);
        c.lineTo(hx + 52, hy + 82);
        c.lineTo(hx - 52, hy + 82);
        c.closePath();
        c.stroke();
        const fingers: [number, number, number, number][] = [
          [hx - 40, hy + 22, hx - 46, hy - 68],
          [hx - 14, hy + 22, hx - 17, hy - 84],
          [hx + 12, hy + 22, hx + 10, hy - 80],
          [hx + 36, hy + 22, hx + 40, hy - 62],
        ];
        fingers.forEach(([x1, y1, x2, y2]) => {
          c.beginPath();
          c.moveTo(x1, y1);
          c.lineTo(x2, y2);
          c.stroke();
        });
        c.beginPath();
        c.moveTo(hx - 48, hy + 42);
        c.lineTo(hx - 78, hy + 22);
        c.lineTo(hx - 88, hy - 8);
        c.stroke();

        ([[hx - 46, hy - 68], [hx - 17, hy - 84], [hx + 10, hy - 80], [hx + 40, hy - 62], [hx - 88, hy - 8]] as const).forEach(
          ([x, y]) => {
            c.beginPath();
            c.arc(x, y, 5.5, 0, Math.PI * 2);
            c.fillStyle = 'rgba(0,217,255,0.95)';
            c.fill();
            c.beginPath();
            c.arc(x, y, 9, 0, Math.PI * 2);
            c.strokeStyle = 'rgba(0,217,255,0.3)';
            c.lineWidth = 1;
            c.stroke();
          }
        );

        c.beginPath();
        c.arc(hx, hy + 52, 7, 0, Math.PI * 2);
        c.fillStyle = 'rgba(212,165,116,0.9)';
        c.fill();
        c.beginPath();
        c.arc(hx, hy + 52, 13, 0, Math.PI * 2);
        c.strokeStyle = 'rgba(212,165,116,0.35)';
        c.lineWidth = 1.5;
        c.stroke();

        // Target crosshair
        const tx = 400;
        const ty = 168;
        c.strokeStyle = 'rgba(212,165,116,0.8)';
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(tx, ty, 26, 0, Math.PI * 2);
        c.stroke();
        c.beginPath();
        c.arc(tx, ty, 13, 0, Math.PI * 2);
        c.stroke();
        ([[tx, ty - 40, tx, ty - 30], [tx, ty + 30, tx, ty + 40], [tx - 40, ty, tx - 30, ty], [tx + 30, ty, tx + 40, ty]] as const).forEach(
          ([x1, y1, x2, y2]) => {
            c.beginPath();
            c.moveTo(x1, y1);
            c.lineTo(x2, y2);
            c.stroke();
          }
        );
        c.beginPath();
        c.arc(tx, ty, 5, 0, Math.PI * 2);
        c.fillStyle = 'rgba(212,165,116,0.9)';
        c.fill();
        c.font = '9px "Courier New", monospace';
        c.fillStyle = 'rgba(212,165,116,0.55)';
        c.fillText('TARGET POS', tx - 28, ty + 54);

        // Tower of Hanoi — solved (all rings on peg C)
        const hbottom = 322;
        c.strokeStyle = 'rgba(0,217,255,0.3)';
        c.lineWidth = 2;
        [290, 360, 430].forEach((px) => {
          c.beginPath();
          c.moveTo(px, 300);
          c.lineTo(px, hbottom);
          c.stroke();
        });
        c.beginPath();
        c.moveTo(266, hbottom);
        c.lineTo(454, hbottom);
        c.stroke();

        const rings: [number, number, string][] = [
          [52, 7, '#7c3aed'],
          [36, 6, '#d4a574'],
          [22, 5, '#00d9ff'],
        ];
        rings.forEach(([wd, ht, col], i) => {
          c.fillStyle = col + 'aa';
          c.strokeStyle = col;
          c.lineWidth = 1;
          c.beginPath();
          c.roundRect(430 - wd / 2, hbottom - 8 - i * 9, wd, ht, 3);
          c.fill();
          c.stroke();
        });
        c.font = '9px "Courier New", monospace';
        c.fillStyle = 'rgba(0,217,255,0.45)';
        c.fillText('MOVE 7/7  ·  TASK COMPLETE', 266, 338);

        // Success badge
        c.fillStyle = 'rgba(16,185,129,0.15)';
        c.strokeStyle = 'rgba(16,185,129,0.6)';
        c.lineWidth = 1;
        c.beginPath();
        c.roundRect(316, 266, 162, 28, 7);
        c.fill();
        c.stroke();
        c.font = 'bold 11px "Courier New", monospace';
        c.fillStyle = '#10b981';
        c.fillText('✓  EXCELLENT FORM!', 324, 285);
      }

      const tex = new THREE.CanvasTexture(tc);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return tex;
    }

    const hudShape = wayfarerShape(LW * 0.92, LH * 0.9, 0.1);
    const hudGeoL = new THREE.ShapeGeometry(hudShape, 40);
    normalizeUVs(hudGeoL);
    const hudGeoR = hudGeoL.clone();

    const leftHUDMat = new THREE.MeshBasicMaterial({
      map: makeHUDCanvas('left'),
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const rightHUDMat = new THREE.MeshBasicMaterial({
      map: makeHUDCanvas('right'),
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    const leftHUD = new THREE.Mesh(hudGeoL, leftHUDMat);
    leftHUD.position.set(-LENS_X, 0, 0.105);
    leftHUD.renderOrder = 2;
    G.add(leftHUD);

    const rightHUD = new THREE.Mesh(hudGeoR, rightHUDMat);
    rightHUD.position.set(LENS_X, 0, 0.105);
    rightHUD.renderOrder = 2;
    G.add(rightHUD);

    // ── POST-PROCESSING (bloom for neon / HUD / LED glow) ──────────────────
    const composer = new EffectComposer(renderer);
    composer.setSize(W, H);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.62, 0.5, 0.72);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ── ANIMATION STATE (driven by a GSAP cinematic timeline) ──────────────
    const state = {
      camX: 0,
      camY: 0.3,
      camZ: 8.6,
      lookX: 0,
      lookY: 0.05,
      lookZ: 0,
      gPosY: -4.6,
      gRotY: -Math.PI * 2,
      gRotX: 0,
      hud: 0,
    };

    const clock = new THREE.Clock();
    points.rotation.z = 0;

    function applyState(time: number) {
      const floatY = Math.sin(time * 0.7) * 0.05;
      const sway = Math.sin(time * 0.4) * 0.05;

      G.position.y = state.gPosY + floatY;
      G.rotation.y = state.gRotY + sway;
      G.rotation.x = state.gRotX + Math.sin(time * 0.3) * 0.022;

      camera.position.set(state.camX + Math.sin(time * 0.5) * 0.03, state.camY, state.camZ);
      camera.lookAt(state.lookX, state.lookY, state.lookZ);

      leftHUDMat.opacity = state.hud;
      rightHUDMat.opacity = state.hud;

      // Recording LED blinks once the HUD is live.
      ledMat.opacity = state.hud > 0.4 ? (Math.sin(time * 5) > 0.5 ? 1 : 0.12) : 0.25 + Math.sin(time * 1.5) * 0.12;

      rimBlue.intensity = 11 + Math.sin(time * 1.1) * 3.5;
      rimOrange.intensity = 7 + Math.sin(time * 0.85 + 1) * 2.5;
      points.rotation.y = time * 0.01;
    }

    let destroyed = false;
    let running = false;

    function renderFrame() {
      if (destroyed) return;
      applyState(clock.getElapsedTime());
      composer.render();
    }
    function startLoop() {
      if (running || destroyed) return;
      running = true;
      renderer.setAnimationLoop(renderFrame);
    }
    function stopLoop() {
      running = false;
      renderer.setAnimationLoop(null);
    }

    // ── RESIZE ──────────────────────────────────────────────────────────────
    const onResize = () => {
      const next = sizeOf();
      W = next.w;
      H = next.h;
      renderer.setSize(W, H);
      composer.setSize(W, H);
      bloom.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      if (!running) {
        applyState(clock.getElapsedTime());
        composer.render();
      }
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // ── REDUCED MOTION: render a single composed hero frame, no loop ─────────
    if (prefersReduced) {
      state.camX = 0;
      state.camY = 0.12;
      state.camZ = 4.7;
      state.lookY = 0.04;
      state.gPosY = 0;
      state.gRotY = 0;
      state.hud = 0.97;
      applyState(0);
      composer.render();

      return () => {
        destroyed = true;
        ro.disconnect();
        disposeAll();
      };
    }

    // ── CINEMATIC TIMELINE ────────────────────────────────────────────────────
    const tl = gsap.timeline({ paused: true });
    // Intro: rise from below + a full 360° reveal spin.
    tl.to(state, { gPosY: 0, gRotY: 0, duration: 2.4, ease: 'power3.out' }, 0);
    // Orbit sweep — right, then sweep left, then a low hero angle.
    tl.to(state, { camX: 5.2, camY: 1.6, camZ: 5.0, lookY: 0.15, duration: 2.6, ease: 'sine.inOut' }, 1.7);
    tl.to(state, { camX: -4.6, camY: 0.5, camZ: 5.4, lookY: 0.0, duration: 2.8, ease: 'sine.inOut' });
    tl.to(state, { camX: 1.4, camY: -1.3, camZ: 5.0, lookY: -0.08, duration: 2.4, ease: 'sine.inOut' });
    // Settle front-on.
    tl.to(state, { camX: 0, camY: 0.12, camZ: 4.7, lookY: 0.04, gRotY: 0, duration: 2.4, ease: 'power2.inOut' });
    // HUD powers on across both lenses while the camera settles.
    tl.to(state, { hud: 0.97, duration: 1.4, ease: 'power2.out' }, '-=1.3');

    // ── TRIGGER: play once on scroll-in; pause the render loop when offscreen ──
    const st = ScrollTrigger.create({
      trigger: mount,
      start: 'top 85%',
      end: 'bottom 15%',
      onEnter: () => {
        tl.play();
        startLoop();
      },
      onEnterBack: startLoop,
      onLeave: stopLoop,
      onLeaveBack: stopLoop,
    });

    // Kickstart if the section is already in view on load.
    const rect = mount.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
      tl.play();
      startLoop();
    } else {
      // Render the initial (pre-reveal) frame so the canvas isn't blank.
      applyState(0);
      composer.render();
    }

    // ── CLEANUP ────────────────────────────────────────────────────────────────
    function disposeAll() {
      stopLoop();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (mesh as THREE.Mesh).material;
        if (mat) {
          const mats = Array.isArray(mat) ? mat : [mat];
          mats.forEach((m) => {
            Object.values(m).forEach((v) => {
              if (v && (v as THREE.Texture).isTexture) (v as THREE.Texture).dispose();
            });
            m.dispose();
          });
        }
      });
      bloom.dispose();
      composer.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.parentNode?.removeChild(renderer.domElement);
    }

    return () => {
      destroyed = true;
      st.kill();
      tl.kill();
      ro.disconnect();
      disposeAll();
    };
  }, []);

  return (
    <div className="ar-glasses-wrapper">
      <div ref={mountRef} className="ar-three-mount" />
      <div className="ar-glasses-caption">
        <span className="ar-caption-dot" />
        <span>{t('chapter4_metrics_subtitle')}</span>
      </div>
    </div>
  );
}
