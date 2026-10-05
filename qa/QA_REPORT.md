# Portfolio integration QA

Checked on 5 October 2026 against the local optimized production build at `http://127.0.0.1:3001`.

## Delivered

- Kept the original Lenis scrolling and four GSAP pinned stages. Did not import the ZIP's wheel interception or whole section visibility fades.
- Integrated the ZIP's RoyaltyOS, JobHunter, Learn Sphere and CLIFFY content, project links, experience details and education.
- Added opening typography reveals on desktop and mobile. Preserved the seven moving hero bars with dimensional surfaces and pointer tilt.
- Added persistent, brighter liquid artwork with pointer and scroll response. Scene backgrounds remain transparent; cards use translucent surfaces.
- Widened the project stage, added label based project navigation, alternating composition and draggable conceptual artwork.
- Added a hanging production ticket, the pinned about/tools scene and the expanding contact scene.
- Rewrote the paragraphs in a casual voice without decorative dashes or symbols.
- Added reduced motion behavior, accessible inactive states, mobile menu dismissal, responsive layouts and explicit live preview loading.

## Regressions found and fixed

1. Anchor navigation landed 176 pixels before the work pin. Pinned anchors now use their actual ScrollTrigger start and reading position; ordinary anchors rely on the existing scroll margin once.
2. Reset controls were positioned outside clipped preview parents. Preview cards now reserve space for controls inside the surface.
3. Stacked mobile and reduced motion previews were inert. All stacked previews are now accessible.
4. Active project selection used an approximate scroll formula. It now follows actual timeline time and labels, including reverse navigation.
5. Continually floating live poster buttons could not stabilize for clicking. Live posters stay still before interaction, and pointer/focus activity pauses floating artwork.
6. Runtime reduced motion changes did not reconfigure Lenis. They now remove and restore the smooth scrolling layer alongside the GSAP media queries.

## Actual checks

| Command | Result |
| --- | --- |
| `npm test` | 2 integration contract checks passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed, static routes generated |
| `git diff --check` | Passed |
| `PORTFOLIO_URL=http://127.0.0.1:3001 python3 tests/browser-smoke.py` | All 8 Chromium interaction tests passed |

Browser tests cover opening screens at 1440 by 900, 1280 by 800 and 390 by 844, plus the narrow desktop project layout at 900 by 700. They exercise forward and reverse project selection, inactive accessibility states, drag and reset, all navigation destinations, mobile menu opening and Escape dismissal, wheel movement and reading rest, reduced motion at load and runtime, and Canvas2D fallback with WebGL intentionally disabled. Application console errors and page errors fail the regular browser test pages; none were reported in the passing run.

## Screenshots

Generated locally by the production browser tests in `qa/screens/`:

- `hero-1440.png`, `hero-1280.png`, `hero-390.png`
- `royaltyos.png`, `jobhunter.png`, `learn-sphere.png`, `cliffy.png`
- `work.png`, `work-900.png`, `experience.png`, `about.png`, `contact.png`
- `mobile-contact.png`, `webgl-fallback.png`

Screenshots are excluded from git but remain in the workspace for viewing. Desktop hero, project, experience, about, contact, mobile contact and fallback screenshots were visually inspected during integration.

## Boundaries

- Browser automation used real headless Google Chrome through Python Playwright. Safari, Firefox and physical touch hardware were not tested.
- The opt-in iframe test uses an intercepted test response. It proves loading and dismissal, not availability or embedding permission of the external deployed services. Direct project links remain available if an external site refuses framing.
- Project previews are labeled conceptual artwork rather than invented production screenshots or measured product metrics.
- The retained legacy `lint` command is `next lint`, which Next.js 16 no longer supports. No standalone ESLint setup was added or claimed to pass.
- No numeric code coverage percentage was collected. The source contract checks and browser suite are focused regression checks, not a claim of complete coverage.
