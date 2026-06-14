'use client';

/**
 * Subtle animated PCB / circuit background for the research hero.
 * Traces carry a moving cyan "pulse" (driven by CSS stroke-dash animation).
 */
export default function CircuitBackground() {
  const traces = [
    'M0 60 H120 V140 H280',
    'M0 200 H80 V120 H200 V40 H360',
    'M0 320 H160 V260 H320 V300 H520',
    'M0 440 H100 V380 H260 V420 H480',
    'M640 80 H520 V160 H400',
    'M640 240 H560 V320 H420 V260 H300',
    'M640 400 H500 V340 H360',
  ];

  const nodes = [
    [120, 60],
    [280, 140],
    [200, 40],
    [160, 320],
    [320, 300],
    [520, 160],
    [420, 260],
    [260, 420],
  ];

  return (
    <svg
      className="circuit-bg"
      viewBox="0 0 640 480"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g className="circuit-traces">
        {traces.map((d, i) => (
          <path
            key={i}
            d={d}
            className="circuit-trace"
            style={{ animationDelay: `${i * 0.55}s` }}
          />
        ))}
      </g>
      <g className="circuit-nodes">
        {nodes.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={3}
            className="circuit-node"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
