import { ImageResponse } from 'next/og';

export const alt = 'Shashank S Bharadwaj — Full-Stack Developer & AI Researcher';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Branded Open Graph card (generated at build time — no static asset needed).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '90px',
          background: '#060914',
          backgroundImage:
            'radial-gradient(circle at 80% 20%, rgba(0,217,255,0.18), transparent 45%), radial-gradient(circle at 15% 85%, rgba(124,58,237,0.18), transparent 45%)',
          color: '#f0f4ff',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, color: '#00d9ff' }}>
          MASTER&#39;S RESEARCHER · FULL-STACK DEVELOPER
        </div>
        <div style={{ display: 'flex', fontSize: 92, fontWeight: 700, marginTop: 22 }}>
          Shashank S Bharadwaj
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: '#8892a4', marginTop: 26 }}>
          AI · AR · Embedded Sensing — University of Aizu, Japan
        </div>
        <div
          style={{
            marginTop: 44,
            height: 6,
            width: 240,
            background: 'linear-gradient(90deg, #00d9ff, #d4a574)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
