import { $, browser } from "@wdio/globals";
import fs from "node:fs";
import path from "node:path";

export function a11y(id) {
  return `~${id}`;
}

function esc(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function textExact(text) {
  return `android=new UiSelector().text("${esc(text)}")`;
}

export function textContains(text) {
  return `android=new UiSelector().textContains("${esc(text)}")`;
}

export function descExact(desc) {
  return `android=new UiSelector().description("${esc(desc)}")`;
}

export function descContains(desc) {
  return `android=new UiSelector().descriptionContains("${esc(desc)}")`;
}

export function editTextInstance(n) {
  return `android=new UiSelector().className("android.widget.EditText").instance(${n})`;
}

async function tryGetDisplayed(selector) {
  const el = await $(selector);
  if (!(await el.isExisting())) return null;
  try {
    if (await el.isDisplayed()) return el;
  } catch {
    // ignore stale / not displayed errors
  }
  return null;
}

/**
 * Find the first element that exists & is displayed from a list of selectors.
 */
export async function findFirstDisplayed(selectors, { timeout = 30000, interval = 500 } = {}) {
  const started = Date.now();
  let lastErr = null;

  while (Date.now() - started < timeout) {
    for (const sel of selectors) {
      try {
        const el = await tryGetDisplayed(sel);
        if (el) return el;
      } catch (e) {
        lastErr = e;
      }
    }
    await browser.pause(interval);
  }

  const hint = selectors.map((s) => `- ${s}`).join("\n");
  const errMsg =
    `Element not found/displayed within ${timeout}ms. Tried selectors:\n${hint}` +
    (lastErr ? `\nLast error: ${lastErr?.message || String(lastErr)}` : "");
  throw new Error(errMsg);
}

export async function tapFirstDisplayed(selectors, opts) {
  const el = await findFirstDisplayed(selectors, opts);
  await el.click();
  return el;
}

/**
 * Best-effort to dismiss common dialogs/alerts that block navigation (e.g., "OK").
 */
export async function dismissOkIfPresent({ timeout = 1500 } = {}) {
  const selectors = [
    a11y("OK"),
    a11y("Ok"),
    textExact("OK"),
    textExact("Ok"),
    textExact("Okay"),
    descExact("OK"),
    descExact("Ok"),
    descContains("OK"),
    descContains("Ok"),
  ];

  const started = Date.now();
  while (Date.now() - started < timeout) {
    for (const sel of selectors) {
      try {
        const el = await $(sel);
        if (await el.isExisting() && (await el.isDisplayed())) {
          await el.click();
          return true;
        }
      } catch {
        // ignore
      }
    }
    await browser.pause(150);
  }
  return false;
}

export async function dumpPageSource(fileNameBase = "page-source") {
  const outDir = path.resolve("mobile-testing", "screenshots");
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(outDir, `${stamp}-${fileNameBase}.xml`);
  const src = await browser.getPageSource();
  fs.writeFileSync(file, src, "utf8");
  return file;
}

export async function tapBottomNavIndex(index, total = 6) {
  const { width, height } = await browser.getWindowSize();
  const x = Math.floor((width * (index + 0.5)) / total);
  const y = Math.floor(height * 0.94); // near bottom nav
  await browser.performActions([
    {
      type: "pointer",
      id: "finger-nav",
      parameters: { pointerType: "touch" },
      actions: [
        { type: "pointerMove", duration: 0, x, y },
        { type: "pointerDown", button: 0 },
        { type: "pause", duration: 80 },
        { type: "pointerUp", button: 0 },
      ],
    },
  ]);
  await browser.releaseActions();
}
