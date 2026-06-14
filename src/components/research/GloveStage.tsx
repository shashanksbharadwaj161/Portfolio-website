'use client';
import { useTranslations } from 'next-intl';

/**
 * Chapter 2's pinned, scroll-scrubbed glove deep-dive. The base hand is always
 * visible; cyan sensors, gold velostat rings and the purple IMU accumulate as
 * the four phase panels cross-fade. All opacity/transform is driven by the
 * scrubbed GSAP timeline in page.tsx; the pulsing/rotation here is CSS.
 */
export default function GloveStage() {
  const t = useTranslations('research');

  return (
    <section className="chapter2-section">
      <div className="chapter2-pin">
        <div className="glove-stage">
          <span className="phase-watermark phase-wm-1">01</span>
          <span className="phase-watermark phase-wm-2">02</span>
          <span className="phase-watermark phase-wm-3">03</span>
          <span className="phase-watermark phase-wm-4">04</span>

          <div className="glove-figure">
            <svg className="glove-svg" viewBox="0 0 200 300" aria-hidden="true">
              <defs>
                <linearGradient id="fabric" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(0,217,255,0.10)" />
                  <stop offset="100%" stopColor="rgba(124,58,237,0.08)" />
                </linearGradient>
              </defs>

              {/* Base hand / glove */}
              <g className="g-base" stroke="#00d9ff" strokeWidth={2} fill="url(#fabric)">
                <path d="M 60 140 Q 50 165 50 200 L 50 250 Q 50 268 70 268 L 130 268 Q 150 268 150 250 L 150 200 Q 150 165 140 140 Z" />
                <rect x="63" y="50" width="14" height="95" rx="7" />
                <rect x="93" y="38" width="14" height="107" rx="7" />
                <rect x="123" y="44" width="14" height="101" rx="7" />
                <path d="M 150 160 L 168 150 L 176 120 L 162 128 Q 150 140 150 160 Z" />
                <rect x="40" y="265" width="120" height="28" rx="8" fill="none" />
              </g>

              {/* Phase 2 — cyan sensors */}
              <g className="g-sensors" fill="#00d9ff">
                <circle className="dot-pulse" cx="70" cy="52" r="5" />
                <circle className="dot-pulse" cx="100" cy="40" r="5" />
                <circle className="dot-pulse" cx="130" cy="46" r="5" />
                <circle className="dot-pulse" cx="170" cy="124" r="5" />
                <circle className="dot-pulse" cx="100" cy="200" r="6" />
                <circle className="dot-pulse" cx="100" cy="235" r="4" />
              </g>

              {/* Phase 3 — gold velostat rings */}
              <g className="g-velostat" stroke="#d4a574" fill="none" strokeWidth={2}>
                <circle className="ring-pulse" cx="70" cy="80" r="7" />
                <circle className="ring-pulse" cx="100" cy="72" r="7" />
                <circle className="ring-pulse" cx="130" cy="78" r="7" />
                <circle className="ring-pulse" cx="160" cy="150" r="7" />
                <circle className="ring-pulse" cx="80" cy="185" r="7" />
                <circle className="ring-pulse" cx="120" cy="185" r="7" />
                <circle className="ring-pulse" cx="100" cy="220" r="7" />
                <circle className="ring-pulse" cx="100" cy="160" r="7" />
              </g>

              {/* Phase 4 — purple IMU + axes */}
              <g className="g-imu">
                <rect
                  x="78"
                  y="248"
                  width="44"
                  height="26"
                  rx="5"
                  fill="rgba(124,58,237,0.18)"
                  stroke="#7c3aed"
                  strokeWidth={2}
                />
                <g className="imu-axes" stroke="#7c3aed" strokeWidth={2}>
                  <line x1="100" y1="261" x2="100" y2="234" />
                  <line x1="100" y1="261" x2="124" y2="273" stroke="#00d9ff" />
                  <line x1="100" y1="261" x2="76" y2="273" stroke="#d4a574" />
                </g>
              </g>
            </svg>
          </div>

          <div className="phase-panels">
            <div className="phase-panel panel-1">
              <span className="phase-kicker">PHASE 01</span>
              <h3 className="phase-title">{t('phase1_title')}</h3>
              <p className="phase-text">{t('phase1_text')}</p>
            </div>

            <div className="phase-panel panel-2">
              <span className="phase-kicker">PHASE 02</span>
              <h3 className="phase-title">{t('phase2_title')}</h3>
              <p className="phase-text">{t('phase2_text')}</p>
            </div>

            <div className="phase-panel panel-3">
              <span className="phase-kicker">PHASE 03</span>
              <h3 className="phase-title">{t('phase3_title')}</h3>
              <p className="phase-text">{t('phase3_text')}</p>
              <div className="info-card info-card--gold">
                <span className="info-card-label">{t('phase3_sensor')}</span>
                <span className="info-card-value">{t('phase3_card')}</span>
              </div>
            </div>

            <div className="phase-panel panel-4">
              <span className="phase-kicker">PHASE 04</span>
              <h3 className="phase-title">{t('phase4_title')}</h3>
              <p className="phase-text">{t('phase4_text')}</p>
              <div className="info-card info-card--purple">
                <span className="info-card-label">{t('phase4_sensor')}</span>
                <span className="info-card-value">{t('phase4_card')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
