"""Focused regression checks for 16:10, production posters and mobile motion."""
import importlib.util
import os
import unittest

spec = importlib.util.spec_from_file_location("smoke", "tests/browser-smoke.py")
smoke = importlib.util.module_from_spec(spec)
spec.loader.exec_module(smoke)


class FollowupTests(smoke.PortfolioBrowserTests):
    def test_blocked_sites_use_local_screenshots_without_iframes(self):
        for width, height in [(1440, 900), (390, 844)]:
            page = self.open_page(width, height, is_mobile=width < 900, has_touch=width < 900)
            external_requests = []
            page.on('request', lambda request: external_requests.append(request.url)
                    if any(host in request.url for host in ['royaltyos.vinaybuilds.me', 'theobesitykiller.com']) else None)
            page.get_by_role('link', name='Work', exact=True).click() if width >= 900 else page.locator('.work-scene').scroll_into_view_if_needed()
            page.wait_for_timeout(2200)
            for name, selector, url in [
                ('RoyaltyOS', '.project-panel', 'https://royaltyos.vinaybuilds.me'),
                ('The Obesity Killer', '.production-poster', 'https://theobesitykiller.com'),
            ]:
                card = page.locator(selector).filter(has=page.get_by_role('heading', name=name, exact=True))
                if name == 'The Obesity Killer' or width < 900:
                    card.scroll_into_view_if_needed()
                page.wait_for_timeout(800)
                image = card.get_by_alt_text(name + ' website screenshot')
                self.assertTrue(image.evaluate('img => img.complete && img.naturalWidth === 1440'))
                self.assertEqual(card.locator('iframe').count(), 0)
                self.assertEqual(card.get_by_role('button', name='Load interactive preview').count(), 0)
                link = card.get_by_role('link', name='Open live site', exact=True)
                self.assertEqual(link.get_attribute('href'), url)
                self.assertEqual(link.get_attribute('target'), '_blank')
                self.assertIn('noopener', link.get_attribute('rel'))
                self.assertTrue(card.get_by_text('Screenshot preview. Opens in a new tab.', exact=True).is_visible())
                self.capture(page, f'external-{name.lower().replace(" ", "-")}-{width}')
            self.assertEqual(external_requests, [], 'Posters must not silently request the blocked sites')

    def test_failed_screenshot_retains_truthful_poster_and_external_link(self):
        page = self.browser.new_page(viewport={'width':390, 'height':844}, is_mobile=True, has_touch=True)
        self.addCleanup(page.close)
        page.route('**/previews/*.webp', lambda route: route.fulfill(status=200, content_type='image/webp', body=b'invalid-image'))
        page.goto(os.environ.get('PORTFOLIO_URL', 'http://127.0.0.1:3000'))
        for name, selector in [('RoyaltyOS', '.project-panel'), ('The Obesity Killer', '.production-poster')]:
            card = page.locator(selector).filter(has=page.get_by_role('heading', name=name, exact=True))
            card.scroll_into_view_if_needed()
            page.wait_for_timeout(1000)
            self.assertEqual(card.locator('.browser-preview__screenshot').count(), 0)
            self.assertTrue(card.locator('.browser-poster').is_visible())
            self.assertTrue(card.get_by_text('Poster preview. Opens in a new tab.', exact=True).is_visible())
            self.assertTrue(card.get_by_role('link', name='Open live site', exact=True).is_visible())
            self.assertEqual(card.locator('iframe').count(), 0)

    @unittest.skipUnless(os.environ.get('PORTFOLIO_CHECK_LIVE') == '1', 'Opt-in real external-site check')
    def test_real_external_links_open_as_top_level_pages(self):
        page = self.open_page(390, 844, is_mobile=True, has_touch=True)
        for name, selector, url, title in [
            ('RoyaltyOS', '.project-panel', 'https://royaltyos.vinaybuilds.me/', 'RoyaltyOS'),
            ('The Obesity Killer', '.production-poster', 'https://theobesitykiller.com/', 'The Obesity Killer'),
        ]:
            card = page.locator(selector).filter(has=page.get_by_role('heading', name=name, exact=True))
            card.scroll_into_view_if_needed()
            page.wait_for_timeout(1000)
            with page.expect_popup() as opened:
                card.get_by_role('link', name='Open live site', exact=True).click()
            popup = opened.value
            try:
                popup.wait_for_url(url, wait_until='domcontentloaded', timeout=60000)
                self.assertEqual(popup.url, url)
                self.assertIn(title, popup.title())
                self.assertIsNone(popup.main_frame.parent_frame)
            finally:
                popup.close()

    def test_hero_copy_returns_after_reverse_navigation(self):
        page = self.open_page(1920, 1113)
        page.get_by_role('link', name='Work', exact=True).click()
        page.wait_for_timeout(2100)
        page.locator('.brand').click()
        page.wait_for_timeout(2200)
        self.assertGreater(float(page.locator('.hero-copy').evaluate('el => getComputedStyle(el).opacity')), 0.95,
                           'Intro and scroll timelines must not leave the opening paragraph invisible')

    def test_16_10_hero_text_fits_and_number_does_not_overlap(self):
        for width, height in [(1920, 1200), (1920, 1113), (1680, 1050), (1440, 900), (1280, 800)]:
            page = self.open_page(width, height)
            measurements = page.evaluate("""() => {
              const index = document.querySelector('.hero-art-index').getBoundingClientRect();
              const overlaps = [...document.querySelectorAll('.hero-art-bar')].some(el => {
                const r = el.getBoundingClientRect();
                return r.left < index.right && r.right > index.left && r.top < index.bottom && r.bottom > index.top;
              });
              const lines = [...document.querySelectorAll('.hero-title-line > span')].map(el => {
                const range = document.createRange(); range.selectNodeContents(el);
                return {textWidth:range.getBoundingClientRect().width, containerWidth:el.getBoundingClientRect().width};
              });
              return {overlaps, lines};
            }""")
            self.assertFalse(measurements["overlaps"], f"Featured count overlaps bars at {width}x{height}")
            for line in measurements["lines"]:
                self.assertLessEqual(line["textWidth"], line["containerWidth"] + 1, "Hero words must not be clipped")
            actions = page.locator(".hero-actions").bounding_box()
            self.assertLess(actions["y"] + actions["height"], height)
            self.capture(page, f"followup-hero-{width}-{height}")

    def test_mobile_bars_and_experience_respond_to_scroll(self):
        page = self.open_page(390, 844, is_mobile=True, has_touch=True)
        bar = page.locator('.hero-art-bar').first
        original = bar.evaluate("el => getComputedStyle(el).transform")
        page.evaluate("window.scrollTo(0, 250)")
        page.wait_for_timeout(1000)
        changed = bar.evaluate("el => getComputedStyle(el).transform")
        self.assertNotEqual(original, changed, "The mobile bars need actual scroll driven motion")
        proof = page.locator('.experience-proof')
        first = proof.evaluate("el => getComputedStyle(el).transform")
        page.locator('.experience-copy').scroll_into_view_if_needed()
        page.wait_for_timeout(800)
        proof.scroll_into_view_if_needed()
        page.wait_for_timeout(800)
        self.assertNotEqual(first, proof.evaluate("el => getComputedStyle(el).transform"), "Production ticket needs mobile scroll motion")
        self.assertEqual(page.locator('.pin-spacer').count(), 0, "Mobile scrolling should not be trapped by pins")
        self.capture(page, "followup-mobile-motion")

    def test_mobile_posters_layout_and_reduced_motion(self):
        for width, height in [(320, 568), (390, 844), (768, 1024)]:
            page = self.open_page(width, height, is_mobile=True, has_touch=True)
            self.assertLessEqual(page.evaluate('document.documentElement.scrollWidth'), width)
            for title in ['Ad Factory', 'The Obesity Killer']:
                poster = page.locator('.production-poster').filter(has=page.get_by_role('heading', name=title, exact=True))
                poster.scroll_into_view_if_needed()
                page.wait_for_timeout(800)
                preview = poster.locator('.production-poster__preview').bounding_box()
                control = poster.get_by_role('link', name='Open live site', exact=True) if title == 'The Obesity Killer' else poster.get_by_role('button', name='Load interactive preview')
                button = control.bounding_box()
                reset = poster.get_by_role('button', name=f'Reset {title} preview position').bounding_box()
                for rect in [button, reset]:
                    self.assertGreaterEqual(rect['x'], preview['x'])
                    self.assertLessEqual(rect['x'] + rect['width'], preview['x'] + preview['width'] + 1)
                    self.assertLessEqual(rect['y'] + rect['height'], preview['y'] + preview['height'] + 1)
                self.capture(page, f"followup-{title.lower().replace(' ', '-')}-{width}")
            page.emulate_media(reduced_motion='reduce')
            page.wait_for_timeout(500)
            self.assertEqual(page.locator('.pin-spacer').count(), 0)
            page.evaluate('window.scrollTo(0, 0)')
            page.wait_for_timeout(500)
            first = page.locator('.hero-art-bar').first.evaluate('el => getComputedStyle(el).transform')
            page.evaluate('window.scrollTo(0, 250)')
            page.wait_for_timeout(500)
            self.assertEqual(first, page.locator('.hero-art-bar').first.evaluate('el => getComputedStyle(el).transform'))

    def test_mobile_featured_count_stays_clear_during_scroll(self):
        page = self.open_page(390, 844, is_mobile=True, has_touch=True)
        for y in [0, 150, 300, 500]:
            page.evaluate('(y) => window.scrollTo(0, y)', y)
            page.wait_for_timeout(600)
            overlaps = page.evaluate("""() => {
              const r = document.querySelector('.hero-art-index').getBoundingClientRect();
              return [...document.querySelectorAll('.hero-art-bar')].some(el => {
                const b = el.getBoundingClientRect();
                return r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top;
              });
            }""")
            self.assertFalse(overlaps, f'Count intersects moving bars at mobile scrollY {y}')

    def test_correct_production_posters_and_product_links(self):
        page = self.open_page()
        posters = page.locator('.production-poster')
        self.assertEqual(posters.count(), 2, "Ad Factory and the product site each need a live poster")
        expected = [("Ad Factory", "https://adfactory.vinaybuilds.me"),
                    ("The Obesity Killer", "https://theobesitykiller.com")]
        self.assertEqual(page.locator('a[href="https://arogyamhealth.in"]').count(), 0)
        for name, url in expected:
            poster = posters.filter(has=page.get_by_role('heading', name=name, exact=True))
            self.assertEqual(poster.count(), 1)
            self.assertGreater(poster.locator(f'a[href="{url}"]').count(), 0)
            poster.scroll_into_view_if_needed()
            page.wait_for_timeout(700)
            if name == 'The Obesity Killer':
                self.assertEqual(poster.get_by_role('button', name='Load interactive preview').count(), 0)
                self.assertEqual(poster.locator('iframe').count(), 0)
                self.assertEqual(poster.get_by_role('link', name='Open live site', exact=True).get_attribute('href'), url)
                self.assertTrue(poster.get_by_alt_text(name + ' website screenshot').evaluate('img => img.complete && img.naturalWidth > 0'))
            else:
                page.route(url + '/**', lambda route: route.fulfill(content_type="text/html", body="<h1>Test production site</h1>"))
                poster.get_by_role('button', name='Load interactive preview').click()
                self.assertEqual(poster.locator('iframe').get_attribute('src'), url)
                poster.get_by_role('button', name='Back to project poster').click()
                self.assertEqual(poster.locator('iframe').count(), 0)
        self.capture(page, "followup-production-posters")

    def test_project_links_open_directly_and_learning_poster_fits(self):
        for width, height in [(1440, 900), (320, 568), (390, 844)]:
            page = self.open_page(width, height, is_mobile=width < 900, has_touch=width < 900)
            page.route('https://skillarious.vinaybuilds.me/**', lambda route: route.fulfill(
                status=200, content_type='text/html', body='<h1>Skillarious preview fixture</h1>'))
            requests = []
            page.on('request', lambda request: requests.append(request.url)
                    if any(host in request.url for host in ['skillarious.vinaybuilds.me', 'cliffy.vinaybuilds.me']) else None)
            for name, host, artwork, repo, response in [
                ('Skillarious', 'skillarious.vinaybuilds.me', '.system-visual--learn', 'https://github.com/Vinay-003/skillarious', 200),
                ('CLIFFY', 'cliffy.vinaybuilds.me', None, 'https://github.com/Vinay-003/aishell2', 200),
            ]:
                card = page.locator('.project-panel').filter(has=page.get_by_role('heading', name=name, exact=True))
                if width >= 900:
                    page.get_by_role('button', name=f'View {name}', exact=True).click()
                else:
                    card.scroll_into_view_if_needed()
                page.wait_for_timeout(2200 if width >= 900 else 800)
                self.assertEqual(page.get_by_text('Coming soon', exact=False).count(), 0)
                self.assertEqual(page.locator('.project-launch-status').count(), 0)
                link = card.get_by_role('link', name='Open live')
                self.assertTrue(link.is_visible())
                self.assertEqual(link.get_attribute('href'), f'https://{host}')
                self.assertEqual(link.get_attribute('target'), '_blank')
                self.assertIn('noreferrer', link.get_attribute('rel'))
                if name == 'Skillarious':
                    self.assertEqual(card.get_by_role('button', name='Load interactive preview').count(), 1)
                    self.assertEqual(card.locator('iframe').count(), 0)
                    self.assertTrue(card.locator(artwork).is_visible())
                    self.assertFalse(any(f'https://{host}' in request for request in requests),
                                     'Skillarious must not request a live preview before the user opts in')
                    card.get_by_role('button', name='Load interactive preview').click()
                    page.wait_for_timeout(800)
                    self.assertEqual(card.locator('iframe').count(), 1)
                    self.assertEqual(card.locator('iframe').get_attribute('src'), 'https://skillarious.vinaybuilds.me')
                    card.get_by_role('button', name='Back to project poster').click()
                    self.assertEqual(card.locator('iframe').count(), 0)
                else:
                    self.assertEqual(card.get_by_role('button', name='Load interactive preview').count(), 0)
                    self.assertEqual(card.locator('iframe').count(), 1)
                    self.assertEqual(card.locator('iframe').get_attribute('src'), 'https://cliffy.vinaybuilds.me')
                    self.assertEqual(card.locator('.system-visual--terminal').count(), 1)
                self.assertEqual(card.get_by_role('link', name='Source').get_attribute('href'), repo)
                self.assertEqual(page.get_by_role('heading', name='Learn Sphere', exact=True).count(), 0)
                actions = card.locator('.project-actions').bounding_box()
                panel = card.bounding_box()
                self.assertLessEqual(actions['y'] + actions['height'], panel['y'] + panel['height'] + 1)
                if name == 'Skillarious':
                    self.assertIn('conceptual', card.locator(artwork).get_attribute('aria-label'))
                    self.assertEqual(card.locator('.learn-book').count(), 1)
                    self.assertTrue(card.locator(artwork).evaluate('el => el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight'))
                    fits = card.locator(artwork).evaluate('''el => {
                        const box = el.getBoundingClientRect();
                        return [...el.querySelectorAll('.learn-mast, .learn-heading, .learn-copy, .learn-foot')].every(child => {
                            const r = child.getBoundingClientRect();
                            return r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom;
                        });
                    }''')
                    self.assertTrue(fits, 'Learning poster text must fit inside its card')
                    self.assertTrue(any(f'https://{host}' in request for request in requests),
                                    'Skillarious must request the live preview after the user opts in')
                else:
                    self.assertTrue(any(f'https://{host}' in request for request in requests),
                                    'CLIFFY must request the live preview when its card is selected')
                self.capture(page, f'direct-{name.lower().replace(" ", "-")}-{width}')
                # Fixtures prove navigation for success and failure, not remote availability.
                page.context.route(f'https://{host}/**', lambda route, request, status=response: route.fulfill(
                    status=status, content_type='text/html', body=f'<h1>Destination response {status}</h1>'))
                with page.expect_popup() as opened:
                    link.click()
                popup = opened.value
                popup.wait_for_url(f'https://{host}/')
                popup.wait_for_load_state('domcontentloaded')
                self.assertEqual(popup.url, f'https://{host}/')
                self.assertTrue(popup.get_by_role('heading', name=f'Destination response {response}').is_visible())
                popup.close()
            self.assertLessEqual(page.evaluate('document.documentElement.scrollWidth'), width)

    def test_learning_poster_respects_reduced_motion(self):
        page = self.open_page(390, 844, is_mobile=True, has_touch=True, reduced_motion='reduce')
        poster = page.locator('.system-visual--learn')
        poster.scroll_into_view_if_needed()
        self.assertEqual(poster.locator('.learn-book').evaluate('el => getComputedStyle(el).animationName'), 'none')
        poster.screenshot(path='qa/screens/learn-sphere-poster-mobile.png')
        self.capture(page, 'learn-sphere-reduced-motion')


if __name__ == "__main__":
    unittest.main(verbosity=2)
