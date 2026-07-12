# Vinay Saini Portfolio — Next.js Scrollytelling Build

A production-ready Next.js portfolio rebuilt from the approved static design and upgraded into a pinned, scroll-driven experience.

## Motion system

- **GSAP + ScrollTrigger** for pinned scenes, scrubbed timelines, snap points, curtain wipes and horizontal tool movement.
- **Lenis** for smooth, controlled scrolling integrated with GSAP's ticker.
- **@gsap/react** for scoped animation setup and cleanup inside React.
- Desktop uses cinematic pinned scrollytelling: the viewport remains in place while the content changes.
- Tablet/mobile automatically fall back to a clean stacked layout with lightweight reveal animations.
- `prefers-reduced-motion` disables the cinematic system and preserves full usability.

## Main scenes

1. Hero opens into a full-screen lime transition.
2. Selected work stays pinned while Ad Factory, Skillarious and JobHunter_ replace one another with curtain wipes.
3. Shopify internship reveals the production website through an opening browser curtain.
4. About stays pinned while the tools track moves horizontally.
5. Contact expands into view as the final scene.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production

```bash
npm run build
npm start
```

The project has been tested with `npm run build` on Next.js 16.2.10. The dependency lockfile is included and `npm audit` reports zero known vulnerabilities at the time this archive was generated.

## Editing content

- Main content and animation timelines: `components/Portfolio.tsx`
- Visual system and responsive rules: `app/globals.css`
- Metadata: `app/layout.tsx`
