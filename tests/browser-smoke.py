"""Real Chromium interaction checks. Requires Python Playwright and local Chrome.

Run: python3 tests/browser-smoke.py (start the site on port 3000 first).
"""
import os
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright


class PortfolioBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(
            headless=True, executable_path=os.environ.get("CHROME_PATH", "/usr/bin/google-chrome")
        )

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def open_page(self, width=1440, height=900, **kwargs):
        page = self.browser.new_page(viewport={"width": width, "height": height}, **kwargs)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.goto(os.environ.get("PORTFOLIO_URL", "http://127.0.0.1:3000"))
        page.wait_for_timeout(2200)
        self.addCleanup(page.close)
        self.addCleanup(lambda: self.assertEqual(errors, [], "Browser errors must not be ignored"))
        return page

    def capture(self, page, name):
        folder = Path("qa/screens")
        folder.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(folder / f"{name}.png"))

    def test_work_anchor_lands_on_complete_pinned_stage(self):
        page = self.open_page()
        page.get_by_role("link", name="Work", exact=True).click()
        page.wait_for_timeout(2200)
        rect = page.locator(".work-stage").bounding_box()
        self.assertLess(abs(rect["y"]), 5, "Navigation must land at the pin, not 176px above it")

    def test_project_transitions_are_scrubbed_and_reversible(self):
        page = self.open_page()
        self.assertEqual(page.locator(".project-chapter").count(), 4)
        destinations = []
        for name in ["RoyaltyOS", "JobHunter", "Learn Sphere", "CLIFFY"]:
            page.get_by_role("button", name=f"View {name}", exact=True).click()
            page.wait_for_timeout(1900)
            destinations.append(page.evaluate("scrollY"))
            panel = page.locator(".project-panel.is-active")
            self.assertEqual(panel.locator("h3").inner_text(), name)
            self.assertEqual(panel.get_attribute("aria-hidden"), "false")
            self.assertEqual(page.locator(".project-panel:not([inert])").count(), 1)
            self.assertEqual(panel.locator(".project-actions").evaluate("el => getComputedStyle(el).opacity"), "1")
            for previous in page.locator(".project-panel").all()[:len(destinations) - 1]:
                self.assertEqual(previous.evaluate("el => getComputedStyle(el).opacity"), "0", "Settled chapters must not leave ghost cards behind")

        for index in range(3):
            # The latter part of each chapter interval is the animated handoff.
            halfway = destinations[index] + .75 * (destinations[index + 1] - destinations[index])
            page.evaluate("y => window.scrollTo(0, y)", halfway)
            page.wait_for_timeout(1200)
            self.assertLess(abs(page.evaluate("scrollY") - halfway), 5, "Do not snap away from a transition")
            incoming = page.locator(".project-panel").nth(index + 1)
            self.assertNotEqual(incoming.evaluate("el => getComputedStyle(el).transform"), "none")
            self.assertTrue(incoming.evaluate("el => getComputedStyle(el).transform.startsWith('matrix3d')"), "Incoming cards should move through depth")
            self.capture(page, f"project-transition-{index + 1}")

        page.get_by_role("button", name="View RoyaltyOS", exact=True).click()
        page.wait_for_timeout(2000)
        first = page.locator(".project-panel").first
        self.assertEqual(first.locator("h3").inner_text(), "RoyaltyOS")
        self.assertEqual(first.get_attribute("aria-hidden"), "false")
        self.assertEqual(first.evaluate("el => getComputedStyle(el).opacity"), "1")

    def test_project_motion_mobile_and_reduced_fallbacks(self):
        mobile = self.open_page(390, 844, is_mobile=True, has_touch=True)
        panel = mobile.locator(".project-panel").nth(1)
        title = panel.locator("h3 span")
        before = title.evaluate("el => getComputedStyle(el).transform")
        panel.scroll_into_view_if_needed()
        mobile.wait_for_timeout(1300)
        self.assertNotEqual(title.evaluate("el => getComputedStyle(el).transform"), before)
        self.assertEqual(mobile.locator(".pin-spacer").count(), 0)
        self.assertEqual(mobile.locator(".project-panel[inert]").count(), 0)
        self.assertLessEqual(mobile.evaluate("document.documentElement.scrollWidth"), 390)
        reduced = self.open_page(reduced_motion="reduce")
        self.assertEqual(reduced.locator(".pin-spacer").count(), 0)
        for panel in reduced.locator(".project-panel").all():
            self.assertEqual(panel.get_attribute("aria-hidden"), "false")
            self.assertEqual(panel.evaluate("el => getComputedStyle(el).transform"), "none")
            self.assertEqual(panel.locator("h3").evaluate("el => getComputedStyle(el).opacity"), "1")

    def test_mobile_all_project_previews_are_interactive(self):
        page = self.open_page(390, 844)
        self.assertEqual(page.locator(".project-panel[inert]").count(), 0)
        self.assertEqual(page.locator(".drag-preview[inert]").count(), 0, "All stacked previews must be accessible")

    def test_preview_reset_is_not_clipped(self):
        page = self.open_page()
        page.get_by_role("button", name="View JobHunter", exact=True).click()
        page.wait_for_timeout(2200)
        preview = page.locator(".project-panel.is-active .project-preview-wrap").bounding_box()
        reset = page.get_by_role("button", name="Reset JobHunter preview position").bounding_box()
        self.assertIsNotNone(reset)
        self.assertLessEqual(reset["y"] + reset["height"], preview["y"] + preview["height"], "Reset button must fit its clipped parent")

    def test_first_screen_and_reduced_motion(self):
        for width, height in [(1440, 900), (1280, 800), (390, 844)]:
            page = self.open_page(width, height)
            self.assertLess(page.locator(".hero-actions").bounding_box()["y"], height)
            self.assertEqual(page.locator(".liquid-background canvas").count(), 1)
            self.assertLessEqual(page.evaluate("document.documentElement.scrollWidth"), width)
            self.capture(page, f"hero-{width}")
        page = self.open_page(reduced_motion="reduce")
        self.assertEqual(page.locator(".pin-spacer").count(), 0)
        self.assertEqual(page.locator(".project-panel[inert]").count(), 0)
        self.assertEqual(page.locator(".drag-preview[inert]").count(), 0)

    def test_project_selection_reverse_and_drag(self):
        page = self.open_page()
        for name in ["RoyaltyOS", "JobHunter", "Learn Sphere", "CLIFFY", "Learn Sphere", "RoyaltyOS"]:
            page.get_by_role("button", name=f"View {name}", exact=True).click()
            page.wait_for_timeout(1900)
            self.assertEqual(page.locator(".project-panel.is-active h3").inner_text(), name)
            self.assertEqual(page.locator(".project-panel:not([inert])").count(), 1)
            self.assertEqual(page.locator(".project-panel.is-active").get_attribute("aria-hidden"), "false")
            self.capture(page, name.lower().replace(" ", "-"))
        card = page.locator(".project-panel.is-active .drag-preview__card")
        before = card.bounding_box()
        # Drag the browser chrome; a live iframe owns its content's pointer events.
        page.mouse.move(before["x"] + 40, before["y"] + 20)
        page.mouse.down()
        page.mouse.move(before["x"] + 90, before["y"] + 60, steps=10)
        self.assertEqual(page.locator(".drag-preview.is-dragging").count(), 1)
        self.assertGreater(card.bounding_box()["x"], before["x"] + 10)
        page.mouse.up()
        page.get_by_role("button", name="Reset RoyaltyOS preview position").click()
        page.wait_for_timeout(500)
        self.assertEqual(page.locator(".drag-preview.is-dragging").count(), 0)
        self.assertLess(abs(card.bounding_box()["x"] - before["x"]), 5)

    def test_remaining_scenes_navigation_and_mobile_menu(self):
        page = self.open_page()
        for name in ["Experience", "About", "Contact", "Work"]:
            page.get_by_role("link", name=name, exact=True).click()
            page.wait_for_timeout(2200)
            selector = {"Experience": ".experience-stage", "About": ".about-stage", "Contact": ".contact-panel", "Work": ".work-stage"}[name]
            rect = page.locator(selector).bounding_box()
            self.assertLess(rect["y"], 400 if name == "Contact" else 200)
            self.assertGreater(rect["y"] + rect["height"], 400)
            liquid = page.locator(".liquid-background").bounding_box()
            self.assertEqual(round(liquid["y"]), 0)
            self.assertEqual(round(liquid["height"]), 900)
            self.capture(page, name.lower())
        mobile = self.open_page(390, 844, is_mobile=True, has_touch=True)
        menu = mobile.get_by_role("button", name="Toggle navigation")
        menu.click()
        self.assertEqual(menu.get_attribute("aria-expanded"), "true")
        mobile.keyboard.press("Escape")
        self.assertEqual(menu.get_attribute("aria-expanded"), "false")
        menu.click()
        mobile.get_by_role("link", name="Contact", exact=True).click()
        mobile.wait_for_timeout(2000)
        self.assertEqual(menu.get_attribute("aria-expanded"), "false")
        self.assertLess(mobile.locator(".site-header").bounding_box()["y"], 15)
        self.capture(mobile, "mobile-contact")

    def test_narrow_desktop_and_live_preview_opt_in(self):
        page = self.open_page(900, 700)
        page.route("https://jobhunter.vinaybuilds.me/**", lambda route: route.fulfill(content_type="text/html", body="<h1>Test frame</h1>"))
        page.get_by_role("link", name="Work", exact=True).click()
        page.wait_for_timeout(2000)
        self.assertEqual(page.locator(".project-panel.is-active iframe").count(), 1, "RoyaltyOS retains its auto-loaded live preview")
        panel = page.locator(".project-panel.is-active").bounding_box()
        actions = page.locator(".project-panel.is-active .project-actions").bounding_box()
        self.assertLessEqual(actions["y"] + actions["height"], panel["y"] + panel["height"])
        page.get_by_role("button", name="View JobHunter", exact=True).click()
        page.wait_for_timeout(2100)
        self.assertEqual(page.locator("iframe").count(), 0, "JobHunter remains opt-in")
        page.locator(".project-panel.is-active").get_by_role("button", name="Load interactive preview").click()
        self.assertEqual(page.locator("iframe").count(), 1)
        page.locator(".project-panel.is-active").get_by_role("button", name="Back to project poster").click()
        self.assertEqual(page.locator("iframe").count(), 0)
        self.capture(page, "work-900")

    def test_wheel_rest_runtime_motion_and_webgl_fallback(self):
        page = self.open_page()
        page.get_by_role("button", name="View JobHunter", exact=True).click()
        page.wait_for_timeout(2100)
        old_y = page.evaluate("scrollY")
        page.mouse.wheel(0, 180)
        page.wait_for_timeout(2200)
        new_y = page.evaluate("scrollY")
        self.assertGreater(new_y, old_y + 10)
        page.wait_for_timeout(1000)
        self.assertLess(abs(page.evaluate("scrollY") - new_y), 3, "Scroll must settle for reading")
        page.emulate_media(reduced_motion="reduce")
        page.wait_for_timeout(500)
        self.assertEqual(page.locator(".pin-spacer").count(), 0)
        self.assertEqual(page.locator(".drag-preview[inert]").count(), 0)
        page.emulate_media(reduced_motion="no-preference")
        page.wait_for_timeout(1500)
        self.assertEqual(page.locator(".pin-spacer").count(), 4)
        fallback = self.browser.new_page(viewport={"width":1280,"height":800})
        self.addCleanup(fallback.close)
        fallback.add_init_script("""const original = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function(type, ...args) {
                if (type.includes('webgl')) return null;
                return original.call(this, type, ...args);
            };""")
        fallback.goto(os.environ.get("PORTFOLIO_URL", "http://127.0.0.1:3000"))
        fallback.wait_for_timeout(2000)
        self.assertEqual(fallback.locator(".liquid-background").get_attribute("data-renderer"), "canvas2d")
        self.assertEqual(fallback.locator(".liquid-background canvas").count(), 1)
        self.capture(fallback, "webgl-fallback")


if __name__ == "__main__":
    unittest.main(verbosity=2)
