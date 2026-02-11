/**
 * Part 1: Web Application Testing
 * Platform: https://www.demoblaze.com
 *
 * Goal (per PDF):
 * 1) Navigate to site
 * 2) Browse & select product (any category)
 * 3) Add to cart
 * 4) Go to cart & verify
 * 5) Complete checkout
 * 6) Verify order confirmation
 * 7) Capture & document Order ID
 *
 * Output artifacts:
 * - Screenshot: web-testing/screenshots/
 * - Order ID: web-testing/order-id.txt
 */

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function extractOrderId(confirmationText) {
  // Example text (Demoblaze):
  // "Id: 12345\nAmount: 790 USD\nCard Number: ...\nName: ...\nDate: ..."
  const match = confirmationText.match(/Id:\s*(\d+)/i);
  return match?.[1] ?? null;
}

async function main() {
  const baseUrl = process.env.WEB_BASE_URL || "https://www.demoblaze.com";
  const screenshotsDir = path.resolve("web-testing", "screenshots");
  ensureDir(screenshotsDir);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Handle "Product added" alert
  page.on("dialog", async (dialog) => {
    try {
      await dialog.accept();
    } catch {
      // ignore
    }
  });

  try {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#tbodyid .card-title a", { timeout: 30_000 });

    // Pick the first product visible on the home page
    const productName = await page.locator("#tbodyid .card-title a").first().innerText();
    await page.locator("#tbodyid .card-title a").first().click();

    // Product page
    await page.waitForSelector(".name", { timeout: 30_000 });
    const productNameOnDetail = await page.locator(".name").innerText();
    if (!productNameOnDetail.toLowerCase().includes(productName.toLowerCase())) {
      throw new Error(`Product detail mismatch. Home="${productName}" Detail="${productNameOnDetail}"`);
    }

    await page.locator("a:has-text('Add to cart')").click();
    // Give the alert a moment to appear/resolve + cart state to update
    await page.waitForTimeout(1500);

    // Go to cart
    await page.locator("#cartur").click();
    await page.waitForSelector("#tbodyid tr", { timeout: 30_000 });

    // Verify product exists in cart table
    const cartText = await page.locator("#tbodyid").innerText();
    if (!cartText.toLowerCase().includes(productName.toLowerCase())) {
      throw new Error(`Expected product "${productName}" in cart, but not found.`);
    }

    // Checkout
    await page.locator("button:has-text('Place Order')").click();
    await page.waitForSelector("#orderModal .modal-body", { timeout: 30_000 });

    // Fill minimal fields
    await page.locator("#name").fill("QA Candidate");
    await page.locator("#country").fill("Indonesia");
    await page.locator("#city").fill("Jakarta");
    await page.locator("#card").fill("4111111111111111");
    await page.locator("#month").fill("01");
    await page.locator("#year").fill("2030");

    await page.locator("#orderModal button:has-text('Purchase')").click();

    // Confirmation
    const confirmation = page.locator(".sweet-alert.showSweetAlert.visible");
    await confirmation.waitFor({ timeout: 30_000 });
    const confirmationText = await confirmation.innerText();

    const orderId = extractOrderId(confirmationText);
    if (!orderId) {
      throw new Error(`Order ID not found in confirmation text:\n${confirmationText}`);
    }

    // Save artifacts
    const screenshotPath = path.join(screenshotsDir, `order-confirmation-${orderId}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const orderIdPath = path.resolve("web-testing", "order-id.txt");
    fs.writeFileSync(
      orderIdPath,
      `Order ID: ${orderId}\nProduct: ${productNameOnDetail}\nScreenshot: ${path.relative(process.cwd(), screenshotPath)}\n`,
      "utf8",
    );

    // Close confirmation
    await page.locator("button.confirm:has-text('OK')").click();

    console.log("[web-testing] PASS");
    console.log(`[web-testing] Order ID captured: ${orderId}`);
    console.log(`[web-testing] Screenshot: ${screenshotPath}`);
    console.log(`[web-testing] Order file: ${orderIdPath}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((err) => {
  console.error("[web-testing] FAIL");
  console.error(err);
  process.exitCode = 1;
});

