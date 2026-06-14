'use client';

/**
 * Chapter 1 hand illustration. Strokes draw themselves, sensor dots pop in,
 * and the neural lines fade — all driven by GSAP on scroll (see page.tsx).
 */
export default function HandDiagram() {
  return (
    <svg className="hand-svg" viewBox="0 0 150 240" aria-hidden="true">
      {/* Palm */}
      <path
        d="M 50 120 Q 40 140 40 170 L 40 200 Q 40 210 50 210 L 100 210 Q 110 210 110 200 L 110 170 Q 110 140 100 120 Z"
        stroke="#00d9ff"
        strokeWidth={2}
        fill="none"
      />
      {/* Thumb */}
      <path d="M 50 140 L 35 130 L 30 100 L 40 110 Z" stroke="#00d9ff" strokeWidth={2} fill="none" />
      {/* Fingers */}
      <line x1="55" y1="120" x2="55" y2="30" stroke="#00d9ff" strokeWidth={2} />
      <line x1="70" y1="120" x2="70" y2="10" stroke="#00d9ff" strokeWidth={2} />
      <line x1="85" y1="120" x2="85" y2="20" stroke="#00d9ff" strokeWidth={2} />
      <line x1="100" y1="140" x2="105" y2="35" stroke="#00d9ff" strokeWidth={2} />

      {/* Neural network connecting lines */}
      <g className="neural-lines">
        <line x1="55" y1="30" x2="75" y2="160" stroke="#00d9ff" strokeWidth={1} opacity={0.5} />
        <line x1="70" y1="10" x2="75" y2="160" stroke="#00d9ff" strokeWidth={1} opacity={0.5} />
        <line x1="85" y1="20" x2="75" y2="160" stroke="#00d9ff" strokeWidth={1} opacity={0.5} />
        <line x1="105" y1="35" x2="75" y2="160" stroke="#00d9ff" strokeWidth={1} opacity={0.5} />
      </g>

      {/* Sensor dots */}
      <circle className="sensor-dot" cx="55" cy="30" r="4" fill="#00d9ff" />
      <circle className="sensor-dot" cx="70" cy="10" r="4" fill="#00d9ff" />
      <circle className="sensor-dot" cx="85" cy="20" r="4" fill="#00d9ff" />
      <circle className="sensor-dot" cx="105" cy="35" r="4" fill="#00d9ff" />
      <circle className="sensor-dot" cx="75" cy="160" r="5" fill="#d4a574" />
      <circle className="sensor-dot" cx="55" cy="170" r="3" fill="#00d9ff" />
    </svg>
  );
}
