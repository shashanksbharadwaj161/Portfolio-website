'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Final HUD readouts: hand position (mm), tracking confidence (%), pressure (g).
const HUD_VALUES = [120, 98, 65];

// Fingertip + palm joints get an expanding pulse ring [cx, cy].
const PULSE_JOINTS: Array<[number, number]> = [
  [56, 42],
  [75, 22],
  [92, 30],
  [108, 48],
  [28, 112],
];

// Inner knuckle / mid joints (static, smaller) [cx, cy].
const MID_JOINTS: Array<[number, number]> = [
  [57, 64],
  [75, 50],
  [91, 56],
  [107, 68],
  [58, 86],
  [75, 76],
  [91, 82],
  [107, 90],
];

export default function ArGlassesReveal() {
  const t = useTranslations('research');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Reduced motion: CSS renders the panel fully formed with final values.
    if (reduced) return;

    const ctx = gsap.context(() => {
      // Panel fades + scales in on scroll.
      gsap.fromTo(
        '.ar-display-wrapper',
        { opacity: 0, scale: 0.92, y: 40 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 60%' },
        }
      );

      // Scan line sweeps down the panel continuously (top% is relative to the panel).
      gsap.to('.ar-scanline', { top: '100%', duration: 2.5, ease: 'none', repeat: -1, delay: 1 });

      // Corner targeting brackets draw in.
      gsap.fromTo(
        '.ar-corner',
        { opacity: 0, scale: 0.6 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: { trigger: containerRef.current, start: 'top 55%' },
        }
      );

      // Metric readouts count up from 0 → final values.
      gsap.set('.ar-metric-num', { textContent: 0 });
      gsap.fromTo(
        '.ar-metric-num',
        { textContent: 0 },
        {
          textContent: (i: number) => HUD_VALUES[i] ?? 0,
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
          delay: 0.8,
          scrollTrigger: { trigger: containerRef.current, start: 'top 55%' },
        }
      );

      // Floating metric rows slide in.
      gsap.fromTo(
        '.ar-hud-metric',
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power2.out',
          delay: 0.6,
          scrollTrigger: { trigger: containerRef.current, start: 'top 55%' },
        }
      );

      // Hand skeleton joints pop in with a stagger.
      gsap.fromTo(
        '.ar-joint',
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.06,
          ease: 'back.out(2)',
          delay: 1,
          scrollTrigger: { trigger: containerRef.current, start: 'top 55%' },
        }
      );

      // Pulse rings on fingertip + palm joints.
      gsap.to('.ar-joint-pulse', {
        scale: 2.5,
        opacity: 0,
        duration: 1.5,
        repeat: -1,
        stagger: 0.3,
        ease: 'power2.out',
        delay: 1.5,
      });

      // Guidance target ring pulses.
      gsap.to('.ar-target-ring', {
        scale: 1.3,
        opacity: 0.3,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5,
      });

      // Success badge slides up.
      gsap.fromTo(
        '.ar-success-badge',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'back.out(1.7)',
          delay: 2,
          scrollTrigger: { trigger: containerRef.current, start: 'top 55%' },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="ar-display-section">
      {/* Glasses frame top decoration */}
      <div className="ar-glasses-frame-top" aria-hidden="true">
        <div className="ar-frame-bar ar-frame-left" />
        <div className="ar-frame-nose" />
        <div className="ar-frame-bar ar-frame-right" />
      </div>

      {/* Main AR display panel */}
      <div className="ar-display-wrapper">
        {/* Scan line effect */}
        <div className="ar-scanline" aria-hidden="true" />

        {/* Corner targeting brackets */}
        <div className="ar-corner ar-corner-tl" aria-hidden="true" />
        <div className="ar-corner ar-corner-tr" aria-hidden="true" />
        <div className="ar-corner ar-corner-bl" aria-hidden="true" />
        <div className="ar-corner ar-corner-br" aria-hidden="true" />

        {/* Top status bar */}
        <div className="ar-status-bar">
          <span>
            <span className="ar-status-dot" />
            RAY-BAN META · LIVE
          </span>
          <span className="ar-status-right">
            <span className="ar-status-dot ar-dot-green" />
            TRACKING ACTIVE
          </span>
        </div>

        {/* Main HUD content */}
        <div className="ar-hud-content">
          {/* LEFT: Sensor metrics panel */}
          <div className="ar-metrics-panel">
            <div className="ar-metrics-label">SENSOR DATA</div>
            <div className="ar-hud-metric">
              <span className="ar-metric-label">{t('chapter4_hud_hand_position')}</span>
              <span className="ar-metric-val">
                <span className="ar-metric-num">120</span>
              </span>
            </div>
            <div className="ar-hud-metric">
              <span className="ar-metric-label">{t('chapter4_hud_confidence')}</span>
              <span className="ar-metric-val">
                <span className="ar-metric-num">98</span>%
              </span>
            </div>
            <div className="ar-hud-metric">
              <span className="ar-metric-label">{t('chapter4_hud_pressure')}</span>
              <span className="ar-metric-val">
                <span className="ar-metric-num">65</span>g
              </span>
            </div>

            {/* Pressure bars */}
            <div className="ar-pressure-bars">
              <div className="ar-p-bar-row">
                <span className="ar-p-label">T</span>
                <div className="ar-p-track">
                  <div className="ar-p-fill" style={{ width: '80%' }} />
                </div>
              </div>
              <div className="ar-p-bar-row">
                <span className="ar-p-label">I</span>
                <div className="ar-p-track">
                  <div className="ar-p-fill" style={{ width: '55%' }} />
                </div>
              </div>
              <div className="ar-p-bar-row">
                <span className="ar-p-label">M</span>
                <div className="ar-p-track">
                  <div className="ar-p-fill" style={{ width: '65%' }} />
                </div>
              </div>
              <div className="ar-p-bar-row">
                <span className="ar-p-label">R</span>
                <div className="ar-p-track">
                  <div className="ar-p-fill" style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: Hand skeleton visualization */}
          <div className="ar-skeleton-panel">
            <svg viewBox="0 0 160 220" className="ar-hand-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Palm outline */}
              <path
                d="M 55 130 Q 44 148 44 175 L 44 195 Q 44 205 54 205 L 106 205 Q 116 205 116 195 L 116 175 Q 116 148 105 130 Z"
                stroke="rgba(0,217,255,0.5)"
                strokeWidth="1.5"
                fill="rgba(0,217,255,0.04)"
              />
              {/* Thumb */}
              <path
                d="M 55 148 L 36 136 L 28 112 L 40 118 Z"
                stroke="rgba(0,217,255,0.5)"
                strokeWidth="1.5"
                fill="rgba(0,217,255,0.04)"
              />
              {/* Finger bones */}
              <line x1="60" y1="130" x2="56" y2="42" stroke="rgba(0,217,255,0.4)" strokeWidth="1.5" />
              <line x1="75" y1="130" x2="75" y2="22" stroke="rgba(0,217,255,0.4)" strokeWidth="1.5" />
              <line x1="90" y1="130" x2="92" y2="30" stroke="rgba(0,217,255,0.4)" strokeWidth="1.5" />
              <line x1="104" y1="134" x2="108" y2="48" stroke="rgba(0,217,255,0.4)" strokeWidth="1.5" />
              {/* Knuckle ticks */}
              <line x1="57" y1="86" x2="60" y2="86" stroke="rgba(0,217,255,0.25)" strokeWidth="1" />
              <line x1="73" y1="76" x2="77" y2="76" stroke="rgba(0,217,255,0.25)" strokeWidth="1" />
              <line x1="89" y1="82" x2="94" y2="82" stroke="rgba(0,217,255,0.25)" strokeWidth="1" />
              <line x1="105" y1="90" x2="109" y2="90" stroke="rgba(0,217,255,0.25)" strokeWidth="1" />

              {/* Fingertip joints with pulse rings */}
              {PULSE_JOINTS.map(([cx, cy], i) => (
                <g key={`tip-${i}`}>
                  <circle
                    className="ar-joint-pulse"
                    cx={cx}
                    cy={cy}
                    r="6"
                    fill="none"
                    stroke="rgba(0,217,255,0.6)"
                    strokeWidth="1"
                  />
                  <circle className="ar-joint" cx={cx} cy={cy} r="4" fill="rgba(0,217,255,0.8)" />
                </g>
              ))}

              {/* Mid joints */}
              {MID_JOINTS.map(([cx, cy], i) => (
                <circle key={`mid-${i}`} className="ar-joint" cx={cx} cy={cy} r="2.5" fill="rgba(0,217,255,0.6)" />
              ))}

              {/* Palm center (gold — pressure point) */}
              <circle className="ar-joint-pulse" cx="80" cy="170" r="8" fill="none" stroke="rgba(212,165,116,0.5)" strokeWidth="1.5" />
              <circle className="ar-joint" cx="80" cy="170" r="5" fill="rgba(212,165,116,0.9)" />
            </svg>
          </div>

          {/* RIGHT: Guidance panel */}
          <div className="ar-guidance-panel">
            <div className="ar-metrics-label">GUIDANCE</div>

            {/* Target position indicator */}
            <div className="ar-target-display">
              <svg viewBox="0 0 80 80" className="ar-target-svg" aria-hidden="true">
                <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(212,165,116,0.2)" strokeWidth="1" />
                <circle className="ar-target-ring" cx="40" cy="40" r="20" fill="none" stroke="rgba(212,165,116,0.5)" strokeWidth="1.5" />
                <circle cx="40" cy="40" r="6" fill="rgba(212,165,116,0.8)" />
                {/* Crosshair */}
                <line x1="40" y1="12" x2="40" y2="24" stroke="rgba(212,165,116,0.6)" strokeWidth="1.5" />
                <line x1="40" y1="56" x2="40" y2="68" stroke="rgba(212,165,116,0.6)" strokeWidth="1.5" />
                <line x1="12" y1="40" x2="24" y2="40" stroke="rgba(212,165,116,0.6)" strokeWidth="1.5" />
                <line x1="56" y1="40" x2="68" y2="40" stroke="rgba(212,165,116,0.6)" strokeWidth="1.5" />
              </svg>
              <div className="ar-target-label">{t('chapter4_hud_target')}</div>
            </div>

            {/* Direction arrows */}
            <div className="ar-arrows">
              <svg viewBox="0 0 60 60" className="ar-arrow-svg" aria-hidden="true">
                <polygon points="30,5 40,25 20,25" fill="rgba(212,165,116,0.7)" />
                <polygon points="30,55 40,35 20,35" fill="rgba(212,165,116,0.3)" />
              </svg>
            </div>

            {/* Success badge */}
            <div className="ar-success-badge">✓ {t('chapter4_hud_success')}</div>
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="ar-bottom-bar">
          <span className="ar-bottom-stat">40+ Hz</span>
          <span className="ar-bottom-divider">|</span>
          <span className="ar-bottom-stat">9-DOF IMU</span>
          <span className="ar-bottom-divider">|</span>
          <span className="ar-bottom-stat ar-bottom-highlight">&lt;50ms LATENCY</span>
        </div>
      </div>

      {/* Glasses arms bottom decoration */}
      <div className="ar-glasses-frame-bottom" aria-hidden="true">
        <div className="ar-frame-arm ar-arm-left" />
        <div className="ar-frame-arm ar-arm-right" />
      </div>
    </div>
  );
}
