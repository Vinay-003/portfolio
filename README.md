# Vinay Saini Portfolio

A Next.js portfolio combining the original pinned scroll scenes with the updated project content and liquid artwork from the supplied ZIP.

## Motion system

- **GSAP + ScrollTrigger** for pinned scenes, scrubbed timelines, project snapping and horizontal tool movement.
- **Lenis** for smooth controlled scrolling integrated with the GSAP ticker.
- **@gsap/react** for scoped animation setup and cleanup.
- Desktop keeps the viewport pinned while content changes inside each scene.
- Tablet and mobile switch to a clean stacked layout with lightweight reveals.
- `prefers-reduced-motion` disables cinematic motion while preserving content and navigation.
- A persistent Three.js shader adds luminous liquid behind every section. Canvas2D and CSS provide fallbacks when WebGL is unavailable.
- Hero typography reveals on arrival, with the original seven bars retained as dimensional, pointer responsive artwork.
- Previews support bounded mouse dragging and keyboard reset. Touch gestures keep scrolling the document.

## Main scenes

1. A wider hero exits quickly, followed by a slower reveal into the selected-work section.
2. RoyaltyOS, JobHunter, Learn Sphere and CLIFFY use the original pinned card timeline, with numbered navigation, reading holds and accessible active states.
3. The Aarogya Kaya internship section uses a hanging production ticket and scroll driven reveals.
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

## Checks

```bash
npm test
npm run typecheck
npm run build
# With the app running, Python Playwright and Chrome installed:
python3 tests/browser-smoke.py
```

For a different test server, set `PORTFOLIO_URL`. For a different Chrome installation, set `CHROME_PATH`.
Browser screenshots are saved in `qa/screens/` and excluded from git. Results and limitations are recorded in `qa/QA_REPORT.md`.

The existing `lint` script uses the removed `next lint` command. A standalone ESLint configuration is not installed; lint is not included in these checks.

## Preview behavior

Project artwork is explicitly labeled as a designed poster or conceptual diagram, not a screenshot of the deployed product. Live iframes load only after clicking **Load interactive preview**, with a button to return to the poster. External hosting availability and embedding policies are outside this portfolio's control. Direct live and repository links remain available.

## Editing content

- Main content and animation timelines: `components/Portfolio.tsx`
- Visual system and responsive rules: `app/globals.css`
- Persistent liquid and preview surfaces: `app/effects.css`
- Liquid shader and fallbacks: `components/LiquidBackground.tsx`
- Interactive project artwork: `components/DraggablePreview.tsx`
- Metadata: `app/layout.tsx`
