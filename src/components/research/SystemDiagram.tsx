'use client';

/** Chapter 5 — the complete loop: glove → processing → AR glasses. */
export default function SystemDiagram() {
  return (
    <svg className="story-svg system-svg" viewBox="0 0 300 200" aria-hidden="true">
      {/* Glove node */}
      <g>
        <circle cx="50" cy="100" r="34" fill="rgba(0,217,255,0.10)" stroke="#00d9ff" strokeWidth="2" />
        <path d="M40 96 v-18 M50 94 v-22 M60 96 v-18 M40 96 q-6 4 -6 14 v8 h32 v-8 q0 -10 -6 -14" stroke="#00d9ff" strokeWidth="2" fill="none" />
      </g>

      {/* Processing node */}
      <g>
        <rect x="120" y="74" width="60" height="52" rx="10" fill="rgba(124,58,237,0.12)" stroke="#7c3aed" strokeWidth="2" />
        <circle cx="150" cy="100" r="10" fill="none" stroke="#7c3aed" strokeWidth="2" />
        <circle cx="150" cy="100" r="3" fill="#7c3aed" />
      </g>

      {/* Glasses node */}
      <g>
        <circle cx="250" cy="100" r="34" fill="rgba(212,165,116,0.10)" stroke="#d4a574" strokeWidth="2" />
        <rect x="232" y="92" width="14" height="12" rx="4" fill="none" stroke="#d4a574" strokeWidth="2" />
        <rect x="254" y="92" width="14" height="12" rx="4" fill="none" stroke="#d4a574" strokeWidth="2" />
        <line x1="246" y1="96" x2="254" y2="96" stroke="#d4a574" strokeWidth="2" />
      </g>

      {/* Data flow lines */}
      <line className="flow-line" x1="84" y1="100" x2="120" y2="100" stroke="#00d9ff" strokeWidth="2" strokeDasharray="4 4" />
      <line className="flow-line" x1="180" y1="100" x2="216" y2="100" stroke="#d4a574" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  );
}
