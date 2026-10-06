# Vinay Saini Portfolio

A Next.js portfolio combining the original pinned scroll scenes with the updated project content and liquid artwork from the supplied ZIP.

## Motion system

- **GSAP + ScrollTrigger** for pinned scenes, scrubbed project handoffs and horizontal tool movement.
- **Lenis** for smooth controlled scrolling integrated with the GSAP ticker.
- **@gsap/react** for scoped animation setup and cleanup.
- Desktop keeps the viewport pinned while content changes inside each scene.
- Tablet and mobile use a stacked layout with scroll driven hero bars, title parallax, experience reveals, a swinging production ticket and contact motion, without pinning or taking over touch gestures.
- `prefers-reduced-motion` disables cinematic motion while preserving content and navigation.
- A persistent Three.js shader adds luminous liquid behind every section. Canvas2D and CSS provide fallbacks when WebGL is unavailable.
- Hero typography reveals on arrival, with the original seven bars retained as dimensional, pointer responsive artwork.
- Previews support bounded mouse dragging and keyboard reset. Touch gestures keep scrolling the document.

## Main scenes

1. A wider hero exits quickly, followed by a slower reveal into the selected-work section.
2. RoyaltyOS, JobHunter, Learn Sphere and CLIFFY use a pinned cinematic deck: alternating 3D card tilts, diagonal reveals, parallax chapter numbers and staggered title/copy/preview entrances. Scroll stays reversible and can rest mid-transition without snapping; numbered navigation lands on settled reading holds. Tablet/mobile use unpinned scrubbed reveals, and reduced motion presents static, accessible cards.
3. The Aarogya Kaya internship section uses a hanging production ticket and scroll driven reveals.
   Ad Factory and The Obesity Killer have their own live preview posters below the ticket. The Obesity Killer is Aarogya Kaya LLP's product storefront, not a separate company website.
4. About stays pinned while the tools track moves horizontally.
5. Contact expands into view as the final scene.

## Run locally

Use Node.js 24 LTS (the verified local and deployment runtime).

```bash
npm ci
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
npm run lint
npm test
npm run typecheck
npm run build
npm audit
# With the app running, Python Playwright and Chrome installed:
python3 tests/browser-smoke.py
# Includes the original suite plus 16:10 and mobile follow-up regressions:
python3 tests/browser-followup.py
# Optional network-dependent check of the real new-tab destinations:
PORTFOLIO_CHECK_LIVE=1 python3 tests/browser-followup.py FollowupTests.test_real_external_links_open_as_top_level_pages
```

Lint uses ESLint's supported CLI with JavaScript, TypeScript and React Hooks recommended rules, rather than the removed `next lint` command. Next.js is pinned to `16.3.8`; the dependency audit reported zero findings after a clean install on 6 October 2026. Audit results can change as new advisories are published.

For a different test server, set `PORTFOLIO_URL`. For a different Chrome installation, set `CHROME_PATH`.
Browser screenshots are saved in `qa/screens/` and excluded from git. Results and limitations are recorded in `qa/QA_REPORT.md`.

The existing `lint` script uses the removed `next lint` command. A standalone ESLint configuration is not installed; lint is not included in these checks.

## Preview behavior

RoyaltyOS and CLIFFY load their live sites in the active project card. The Obesity Killer blocks iframe embedding, so its card uses a real, locally stored public website screenshot with an **Open live site** link that opens a separate tab. The screenshot is static, not interactive or automatically refreshed. If an image fails, a labeled conceptual poster remains available with the same external link.

JobHunter and Ad Factory retain opt-in **Load interactive preview** buttons and return-to-poster controls. Learn Sphere has an editorial learning poster with a dimensional book illustration; CLIFFY retains its conceptual terminal preview. External hosting availability and embedding policies can change; direct live and repository links remain available. Never disable a deployed site's security headers or proxy around its frame restrictions just to make a poster interactive.

Ad Factory uses `https://adfactory.vinaybuilds.me` for both its production preview and experience link. Learn Sphere and CLIFFY have direct **Open live** links to `https://learnsphere.vinaybuilds.me` and `https://cliffy.vinaybuilds.me`. There are no coming-soon labels or deployment checks: the destination loads or returns its own error. Posters do not automatically request these domains. GitHub links are preserved; `skillarious` is the Learn Sphere repository slug, not the displayed project name.

No portfolio setting needs changing when either destination deploys. Switch its `preview` to `"live"` only if you separately want an opt-in website preview and have verified the destination permits embedding.

## Editing content

- Main content and animation timelines: `components/Portfolio.tsx`
- Visual system and responsive rules: `app/globals.css`
- Project transition layers and motion fallbacks: `app/project-motion.css`
- Persistent liquid and preview surfaces: `app/effects.css`
- Liquid shader and fallbacks: `components/LiquidBackground.tsx`
- Interactive project artwork: `components/DraggablePreview.tsx`
- Public website screenshot assets: `public/previews/` (captured without signing in)
- Metadata: `app/layout.tsx`
