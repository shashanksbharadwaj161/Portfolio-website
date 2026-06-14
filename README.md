# Shashank S Bharadwaj — Portfolio

Award-winning bilingual (EN / 日本語) portfolio for **Shashank S Bharadwaj** —
Master's researcher & full-stack developer at the University of Aizu, Japan.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + custom glassmorphism / neumorphism (`globals.css`)
- **3D:** Three.js · React Three Fiber · @react-three/drei
- **Animation:** GSAP + ScrollTrigger · Framer Motion
- **Smooth scroll:** Lenis
- **i18n:** next-intl (`en`, `ja`)
- **Icons:** Lucide React

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000  (redirects to /en)
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint
```

## Project Structure

```
src/
├── app/
│   ├── [locale]/            # localized routes (en | ja)
│   │   ├── layout.tsx       # root layout + i18n provider + chrome
│   │   ├── page.tsx         # hero / landing
│   │   ├── research/        # research story
│   │   ├── projects/        # work showcase
│   │   └── achievements/    # scholarships, hackathons, certs
│   └── globals.css          # design system (tokens, glass, neo, fonts)
├── components/
│   ├── layout/              # NavigationOrbs, LanguageToggle, SmoothScroll
│   ├── ui/                  # GlassCard, NeoCard, GlowButton, AnimatedText, CustomCursor
│   └── three/               # ParticleField
├── lib/                     # animations, constants, utils
├── styles/                  # supplementary glass helpers
├── translations/            # en.json, ja.json
├── i18n.ts                  # next-intl request config
└── middleware.ts            # locale routing
```

## Assets

Project screenshots go in `public/projects/` and research visuals in
`public/research/` (see the READMEs in those folders for expected filenames).

## Status

**Sprint 1 — Foundation complete:** project setup, design system, bilingual
routing, translations, content constants, and reusable component scaffolding.
Rich animations and 3D scenes are layered on in subsequent sprints.
