"""Focused regression checks for 16:10, production posters and mobile motion."""
import importlib.util
import unittest

spec = importlib.util.spec_from_file_location("smoke", "tests/browser-smoke.py")
smoke = importlib.util.module_from_spec(spec)
spec.loader.exec_module(smoke)


class FollowupTests(smoke.PortfolioBrowserTests):
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

    def test_correct_production_posters_and_product_links(self):
        page = self.open_page()
        posters = page.locator('.production-poster')
        self.assertEqual(posters.count(), 2, "Ad Factory and the product site each need a live poster")
        expected = [("Ad Factory", "https://ad-factory-pzgh.onrender.com"),
                    ("The Obesity Killer", "https://theobesitykiller.com")]
        self.assertEqual(page.locator('a[href="https://arogyamhealth.in"]').count(), 0)
        for name, url in expected:
            poster = posters.filter(has=page.get_by_role('heading', name=name, exact=True))
            self.assertEqual(poster.count(), 1)
            self.assertGreater(poster.locator(f'a[href="{url}"]').count(), 0)
            page.route(url + '/**', lambda route: route.fulfill(content_type="text/html", body="<h1>Test production site</h1>"))
            poster.scroll_into_view_if_needed()
            page.wait_for_timeout(700)
            poster.get_by_role('button', name='Load interactive preview').click()
            self.assertEqual(poster.locator('iframe').get_attribute('src'), url)
            poster.get_by_role('button', name='Back to project poster').click()
            self.assertEqual(poster.locator('iframe').count(), 0)
        self.capture(page, "followup-production-posters")


if __name__ == "__main__":
    unittest.main(verbosity=2)
