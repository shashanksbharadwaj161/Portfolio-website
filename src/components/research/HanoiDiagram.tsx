'use client';

/** Chapter 3 — a stylised Tower of Hanoi with a glowing "next move" disk. */
export default function HanoiDiagram() {
  return (
    <svg className="story-svg hanoi-svg" viewBox="0 0 260 180" aria-hidden="true">
      <line x1="20" y1="150" x2="240" y2="150" stroke="#1f2a44" strokeWidth={4} />
      {[50, 130, 210].map((x) => (
        <line key={x} x1={x} y1="60" x2={x} y2="150" stroke="#1f2a44" strokeWidth={4} />
      ))}

      {/* Peg A stack */}
      <rect x="22" y="138" width="56" height="12" rx="6" fill="#00d9ff" opacity="0.85" />
      <rect x="30" y="124" width="40" height="12" rx="6" fill="#00d9ff" opacity="0.6" />
      <rect x="36" y="110" width="28" height="12" rx="6" fill="#00d9ff" opacity="0.4" />

      {/* Peg B */}
      <rect x="108" y="138" width="44" height="12" rx="6" fill="#d4a574" opacity="0.7" />

      {/* The guided "next move" disk hovering over peg C */}
      <g className="hanoi-move">
        <rect x="186" y="40" width="48" height="12" rx="6" fill="#10b981" />
      </g>
      <path d="M210 56 L210 132" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.7" />
    </svg>
  );
}
