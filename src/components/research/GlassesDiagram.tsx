'use client';

/** Chapter 4 — Ray-Ban Meta glasses with an AR HUD overlay. */
export default function GlassesDiagram() {
  return (
    <svg className="story-svg glasses-svg" viewBox="0 0 280 160" aria-hidden="true">
      {/* Frames */}
      <g stroke="#f0f4ff" strokeWidth={3} fill="none">
        <rect x="24" y="54" width="92" height="56" rx="16" />
        <rect x="164" y="54" width="92" height="56" rx="16" />
        <path d="M116 70 Q140 60 164 70" />
        <line x1="24" y1="60" x2="6" y2="48" />
        <line x1="256" y1="60" x2="274" y2="48" />
      </g>

      {/* AR HUD inside the right lens */}
      <g className="hud-overlay">
        <rect x="176" y="64" width="68" height="36" rx="6" fill="rgba(0,217,255,0.10)" stroke="#00d9ff" strokeWidth="1" />
        <line x1="182" y1="74" x2="222" y2="74" stroke="#00d9ff" strokeWidth="2" />
        <line x1="182" y1="82" x2="238" y2="82" stroke="#00d9ff" strokeWidth="1.5" opacity="0.7" />
        <line x1="182" y1="90" x2="210" y2="90" stroke="#d4a574" strokeWidth="2" />
      </g>

      {/* Capture dot */}
      <circle className="dot-pulse" cx="140" cy="78" r="3" fill="#7c3aed" />
    </svg>
  );
}
