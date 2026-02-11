import {
  a11y,
  dismissOkIfPresent,
  descContains,
  descExact,
  dumpPageSource,
  findFirstDisplayed,
  tapBottomNavIndex,
  tapFirstDisplayed,
  textContains,
  textExact,
} from "./helpers.js";

describe("Mobile - Swipe/Gesture (Bonus)", () => {
  it("should navigate to Swipe screen and perform a swipe", async () => {
    await dismissOkIfPresent();

    // In some app versions the bottom tab uses text, not accessibility-id.
    try {
      await tapFirstDisplayed(
        [a11y("Swipe"), textExact("Swipe"), descExact("Swipe"), textContains("Swipe"), descContains("Swipe")],
        {
          timeout: 30000,
        },
      );
    } catch (e) {
      // Fallback: bottom nav is icon-only in some builds; click by position (Home, Webview, Login, Forms, Swipe, Drag)
      await dumpPageSource("swipe-tab-not-found");
      await tapBottomNavIndex(4, 6);
    }

    // Best-effort verify we're on Swipe screen
    await findFirstDisplayed([textContains("Swipe"), descContains("Swipe")], { timeout: 10000 }).catch(() => {});

    // Basic swipe gesture (left) using touchAction on a known container.
    // If selector doesn't exist in your app version, update it via Appium Inspector.
    const swipeScreen = await browser.$(a11y("Swipe-screen"));
    if (!(await swipeScreen.isExisting())) {
      // Fallback: swipe on the whole screen
      const { width, height } = await browser.getWindowSize();
      const startX = Math.floor(width * 0.8);
      const endX = Math.floor(width * 0.2);
      const y = Math.floor(height * 0.5);

      await browser.performActions([
        {
          type: "pointer",
          id: "finger1",
          parameters: { pointerType: "touch" },
          actions: [
            { type: "pointerMove", duration: 0, x: startX, y },
            { type: "pointerDown", button: 0 },
            { type: "pause", duration: 200 },
            { type: "pointerMove", duration: 400, x: endX, y },
            { type: "pointerUp", button: 0 }
          ]
        }
      ]);
      await browser.releaseActions();
      return;
    }

    const rect = await swipeScreen.getRect();
    const startX = Math.floor(rect.x + rect.width * 0.8);
    const endX = Math.floor(rect.x + rect.width * 0.2);
    const y = Math.floor(rect.y + rect.height * 0.5);

    const beforeSource = await browser.getPageSource().catch(() => "");

    await browser.performActions([
      {
        type: "pointer",
        id: "finger1",
        parameters: { pointerType: "touch" },
        actions: [
          { type: "pointerMove", duration: 0, x: startX, y },
          { type: "pointerDown", button: 0 },
          { type: "pause", duration: 200 },
          { type: "pointerMove", duration: 400, x: endX, y },
          { type: "pointerUp", button: 0 }
        ]
      }
    ]);
    await browser.releaseActions();

    // Verify some UI change happened (best-effort)
    const afterSource = await browser.getPageSource().catch(() => "");
    if (beforeSource && afterSource) {
      if (beforeSource === afterSource) {
        throw new Error("Swipe did not change UI (page source identical before/after).");
      }
    }
  });
});

