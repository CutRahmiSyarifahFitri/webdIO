import { expect } from "@wdio/globals";
import {
  a11y,
  dismissOkIfPresent,
  descContains,
  descExact,
  editTextInstance,
  findFirstDisplayed,
  tapFirstDisplayed,
  textContains,
  textExact,
} from "./helpers.js";

/**
 * NOTE:
 * Selector IDs can vary by app version. If these fail, open Appium Inspector and
 * update the accessibility IDs here (prefer ~accessibilityId).
 */

describe("Mobile - Login Flow", () => {
  it("should open Login screen and attempt login", async () => {
    // Clear any blocking dialog from prior state
    await dismissOkIfPresent();

    // Open Login tab/screen
    // Common patterns in the Native Demo App:
    // - tab/button with accessibility id "Login"
    await tapFirstDisplayed([a11y("Login"), textExact("Login"), descExact("Login"), descContains("Login")], {
      timeout: 30000,
    });

    // Some versions have "Login" screen with email/password inputs
    // Use best-effort selectors (accessibility IDs are recommended)
    // Ensure we are on the "Login" sub-tab (not "Sign up") if present
    await tapFirstDisplayed([textExact("Login"), descExact("Login"), descContains("Login")], { timeout: 5000 }).catch(() => {});

    const email = await findFirstDisplayed([a11y("input-email"), editTextInstance(0)]);
    await email.setValue(process.env.MOBILE_TEST_EMAIL || "test@qa.com");

    const password = await findFirstDisplayed([a11y("input-password"), editTextInstance(1)]);
    await password.setValue(process.env.MOBILE_TEST_PASSWORD || "invalid-password");

    await tapFirstDisplayed(
      [
        a11y("button-LOGIN"),
        a11y("button-Login"),
        textExact("LOGIN"),
        textExact("Login"),
        descExact("LOGIN"),
        descExact("Login"),
      ],
      { timeout: 30000 },
    );

    // Verify either success or error message appears
    // Use broader text matching because IDs can differ by app version.
    const resultEl = await findFirstDisplayed(
      [
        a11y("You are logged in!"),
        textContains("logged in"),
        textContains("Logged in"),
        textContains("Invalid"),
        textContains("invalid"),
        textContains("error"),
        textContains("Error"),
        textContains("Please"),
      ],
      { timeout: 30000 },
    );
    await expect(await resultEl.isDisplayed()).toBe(true);

    // Dismiss "Success" dialog if it appears (so next tests can navigate)
    await dismissOkIfPresent({ timeout: 5000 });
  });
});

