"""Real Chromium interaction checks. Requires Python Playwright and local Chrome.

Run: python3 tests/browser-smoke.py (start the site on port 3000 first).
"""
import os
import unittest
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
        page.goto(os.environ.get("PORTFOLIO_URL", "http://127.0.0.1:3000"))
        page.wait_for_timeout(2200)
        self.addCleanup(page.close)
        return page

    def test_work_anchor_lands_on_complete_pinned_stage(self):
        page = self.open_page()
        page.get_by_role("link", name="Work", exact=True).click()
        page.wait_for_timeout(2200)
        rect = page.locator(".work-stage").bounding_box()
        self.assertLess(abs(rect["y"]), 5, "Navigation must land at the pin, not 176px above it")

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
        page = self.open_page(reduced_motion="reduce")
        self.assertEqual(page.locator(".pin-spacer").count(), 0)
        self.assertEqual(page.locator(".project-panel[inert]").count(), 0)
        self.assertEqual(page.locator(".drag-preview[inert]").count(), 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
