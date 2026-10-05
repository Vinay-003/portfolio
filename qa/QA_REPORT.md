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

## Follow-up: production posters, 16:10 and mobile motion

The screenshot follow-up was reproduced before changes. The count intersected the bars at 1920 by 1200, the headline was sized from the viewport rather than its available column, mobile bar transforms stayed unchanged on scroll, and the requested production posters were absent.

### Changes

- Added `components/ProductionPosters.tsx` and `app/production-posters.css`: two separate production articles for Ad Factory and The Obesity Killer, each with direct live links and opt-in iframe preview controls.
- Corrected the old experience link to `https://theobesitykiller.com`, labeled as Aarogya Kaya LLP's product storefront. Ad Factory uses `https://ad-factory-pzgh.onrender.com`.
- Sized the hero title using its actual content column and viewport height, retaining large typography without clipped words.
- Placed the featured count in a reserved grid row above the bars and faded it before the desktop curtain motion crosses that area.
- Added unpinned mobile scroll choreography for the bars, headline, experience content and ticket, about text, tools and contact. Horizontal tool movement uses native container scrolling so every tool remains reachable by touch.
- Bounded mobile ticket rotation and row movement to prevent horizontal overflow on a 320 pixel screen. Removed redundant poster captions on compact screens so they do not sit under buttons; the conceptual artwork label remains visible.
- Fixed the intro/scroll timeline conflict that left the hero paragraph invisible after reverse navigation.

### Verified against the new production build

`npm test`, `npm run typecheck`, `npm run build` and `git diff --check` passed.

`PORTFOLIO_URL=http://127.0.0.1:3001 python3 tests/browser-followup.py` passed **all 14 Chromium browser tests**. This includes the original eight tests plus six follow-up regressions.

Follow-up checks cover headline text bounds and count/bar separation at 1920 by 1200, 1920 by 1113 (browser chrome accounted for), 1680 by 1050, 1440 by 900 and 1280 by 800. Touch-emulated 320 by 568, 390 by 844 and 768 by 1024 layouts were checked for overflow, poster controls and runtime reduced motion. Mobile bar transforms and ticket transforms were verified to change with scrolling; the count stays clear at several mobile scroll positions. Returning from Work restores the hero paragraph.

Screenshots are in `qa/screens/followup-*.png`. The new hero, production showcase and compact poster screenshots were visually inspected. As before, iframe test responses are intercepted fixtures; these tests verify the correct URLs and controls, not external hosting uptime. Physical mobile hardware and other browser engines were not tested.

## Follow-up: refused iframe previews

Actual deployed response headers explain the reported error. RoyaltyOS sends `Content-Security-Policy` with `frame-ancestors 'none'`. The Obesity Killer sends the same directive plus `X-Frame-Options: DENY`. Both returned HTTP 200 as top-level pages; these policies block embedding in the portfolio rather than normal website navigation.

### Repair

- Both blocked cards explicitly use external preview mode. They cannot mount an iframe or display an interactive-preview button, even if previous load state is retained.
- Real signed-out public website screenshots are stored at `public/previews/royaltyos.webp` and `public/previews/the-obesity-killer.webp`. Source/capture notes are in `public/previews/README.md`. No private session or credentials were used.
- The screenshot surfaces are clearly labeled static previews and have **Open live site** links opening new tabs with `noopener noreferrer`. Existing live/source actions remain available.
- Images fit within the frame without cropping. Native image dragging is disabled so the existing pointer-based card dragging still works. Failed images retain truthful conceptual posters and external links, including failures that happen before React hydration.
- JobHunter and Ad Factory retain opt-in embedded controls. Their controls are still fixture-tested; their full interactive application flows and future framing policies are not guaranteed by these tests.

### Verification

`npm test` passed all **3 source-contract checks**. `npm run typecheck`, `npm run build` and `git diff --check` passed.

`PORTFOLIO_URL=http://127.0.0.1:3001 PORTFOLIO_CHECK_LIVE=1 python3 tests/browser-followup.py` passed **all 17 Chromium browser tests** against the final production build. The new checks verify screenshot loading, no blocked-site requests/iframes before clicking, desktop/mobile external controls, image-failure fallback, and actual new-tab opening of both deployed sites without mocked responses. The real destinations loaded at their correct URLs and had their expected page titles. Their public captures also returned HTTP 200.

Updated screenshot evidence: `qa/screens/external-royaltyos-1440.png`, `qa/screens/external-royaltyos-390.png`, `qa/screens/external-the-obesity-killer-1440.png` and `qa/screens/external-the-obesity-killer-390.png`. Desktop RoyaltyOS and mobile storefront screenshots were visually inspected. This is a point-in-time hosting check, not a guarantee of uptime; physical phones and Safari/Firefox remain untested.

## Vercel production deployment

- Project: `vinay-003s-projects/portfolio`, connected to `https://github.com/Vinay-003/portfolio`.
- Production alias: https://portfolio-three-rust-33.vercel.app
- Deployed application commit: `8a8f052`. Vercel reported production status **Ready**; an unauthenticated request returned HTTP 200 with the expected portfolio content.
- `PORTFOLIO_URL=https://portfolio-three-rust-33.vercel.app PORTFOLIO_CHECK_LIVE=1 python3 tests/browser-followup.py` passed all **17 tests** on the actual deployed site.
- `vercel.json` uses the Next.js framework, `npm ci`, and `npm run build`. `.vercelignore` excludes private workspace metadata, environment files and generated files; local Vercel linkage and credentials remain ignored.
- GitHub push was attempted but failed because the terminal has no HTTPS GitHub credentials. The changes are committed locally, not yet pushed. Authenticate GitHub locally before running `git push origin main`; the Vercel GitHub connection alone does not authenticate local Git.
- `npm audit --omit=dev` reported five dependency findings: one moderate, three high and one critical, including Next.js. No automatic dependency upgrade was performed as part of deployment; security remediation remains open.
- Custom domain not added: the desired domain was not supplied. Add it under the project's **Settings > Domains**, then copy the exact displayed A or CNAME target to the DNS provider. Keep unrelated email and other subdomain records unchanged.
