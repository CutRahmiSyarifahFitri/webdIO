import { $, expect } from "@wdio/globals";
import { dismissOkIfPresent } from "./helpers.js";

describe("Mobile - Forms", () => {
  it("should interact with form elements", async () => {
    await dismissOkIfPresent();

    const formsTab = await $("~Forms");
    await formsTab.waitForDisplayed({ timeout: 30000 });
    await formsTab.click();

    // Text input
    const textInput = await $("~text-input");
    await textInput.waitForDisplayed({ timeout: 30000 });
    await textInput.setValue("Hello QA");

    // Verify entered text reflected somewhere (often "~input-text-result")
    const inputResult = await $("~input-text-result");
    if (await inputResult.isExisting()) {
      await expect(await inputResult.getText()).toContain("Hello QA");
    }

    // Switch
    const switchElem = await $("~switch");
    if (await switchElem.isExisting()) {
      await switchElem.click();
    }

    // Dropdown / picker (often "~Dropdown" and "~dropdown-text")
    const dropdown = await $("~Dropdown");
    if (await dropdown.isExisting()) {
      await dropdown.click();
      const option1 = await $("~webdriver.io is awesome");
      if (await option1.isExisting()) {
        await option1.click();
      }
    }

    // Submit button (often "~button-Active")
    const activeButton = await $("~button-Active");
    if (await activeButton.isExisting()) {
      await activeButton.click();
      // Some versions show an alert
      await dismissOkIfPresent({ timeout: 5000 });
    }
  });
});

