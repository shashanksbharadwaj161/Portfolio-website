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

## Current model

`glove.glb` — Quaternius low-poly glove (via Poly Pizza), **CC0**, 456 tris.
FBX2glTF export: it imports lying flat (baked −90° X + 100× scale, fingers
along +Z), and its UVs are a single-texel palette (no usable unwrap), so the
conductive-thread look is done with **emissive sensor dots**, not a texture.

`GloveGlb.tsx` stands it up, centres it, scales to ~5 units tall, places it
right-of-centre, overrides the material to matte off-white, and attaches a
black wrist strap + procedural PCB module and the glowing sensor grid.

## Tuning (likely needs a browser pass)

Orientation is the one thing to eyeball in `GloveGlb.tsx`:

- `ORIENT_X` — flip the sign if the glove appears upside-down.
- `ORIENT_Y` — set to `Math.PI` if the palm faces away from the camera.

Sensor-dot and strap placement are proportional to the bounding box, so they
move with any scale/orientation change but may want nudging to taste.

## Replacing the model

Drop a different `.glb` at this path and reload. If the new model isn't
lying-flat / Z-forward, adjust `ORIENT_X` / `ORIENT_Y` accordingly.
