# Research film — 3D glove model

Drop a glove model here as:

```
public/research/models/glove.glb
```

The research film (`src/components/research/film/GloveGlb.tsx`) loads this path
via `useGLTF('/research/models/glove.glb')`. Until the file exists, the film
falls back to the procedural silhouette glove automatically (no errors).

## What to download

A free, **downloadable**, portfolio-safe (CC0 / CC-BY) tactical or work glove:

- **Sketchfab** — https://sketchfab.com/search?q=tactical+glove&type=models
  (filter: Downloadable + Free; CC0 or CC-BY). "Download 3D Model" → **glTF (.glb)**.
- Alternatives: Poly Pizza, TurboSquid Free, CGTrader Free.

Requirements:
- Format **.glb** (single file, textures embedded).
- **Not Draco-compressed** (or we add a local Draco decoder — ask first).
- Under ~50k triangles for web performance.
- 5 distinct fingers + a cuff/wrist opening (matches the reference photo).
- If CC-BY, keep the author credit (add it to the site footer / this file).

## After adding the file

No code changes needed — reload `/en/research` (desktop) and scroll to Chapter 1.
The model is auto-centred and scaled to ~5 units tall, placed right-of-centre,
with the procedural microcontroller + glowing sensor dots attached. Scale,
orientation and sensor placement will likely need a quick tuning pass once the
specific model is in (its native up-axis / facing may differ).
