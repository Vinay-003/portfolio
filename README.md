# Vinay Saini Portfolio — Next.js Scrollytelling Build

A production-ready Next.js portfolio with pinned, scroll-driven scenes and a responsive mobile fallback.

## Motion system

- **GSAP + ScrollTrigger** for pinned scenes, scrubbed timelines, project snapping and horizontal tool movement.
- **Lenis** for smooth controlled scrolling integrated with the GSAP ticker.
- **@gsap/react** for scoped animation setup and cleanup.
- Desktop keeps the viewport pinned while content changes inside each scene.
- Tablet and mobile switch to a clean stacked layout with lightweight reveals.
- `prefers-reduced-motion` disables cinematic motion while preserving content and navigation.

## Main scenes

1. A wider hero exits quickly, followed by a slower reveal into the selected-work section.
2. Ad Factory, Skillarious and JobHunter_ replace one another using direct masked card reveals, with stable snap points and no blank transition screen.
3. The Shopify internship section presents verified production-work details and the live URL without a fabricated website screenshot.
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

The project was successfully tested with `npm run build` on Next.js 16.2.10.

## Editing content

- Main content and animation timelines: `components/Portfolio.tsx`
- Visual system and responsive rules: `app/globals.css`
- Metadata: `app/layout.tsx`
