const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function sanitizeFileName(input) {
  return String(input).replace(/[^a-z0-9-_]+/gi, "_").slice(0, 160);
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function isPortListeningWin(port) {
  try {
    // Example line: "  TCP    127.0.0.1:4723         0.0.0.0:0              LISTENING       12345"
    const out = execSync(`netstat -ano -p tcp | findstr :${port}`, { stdio: ["ignore", "pipe", "ignore"] }).toString();
    return out.toUpperCase().includes("LISTENING");
  } catch {
    return false;
  }
}

function pickFreePort({ start = 4731, end = 4749 } = {}) {
  for (let p = start; p <= end; p++) {
    if (!isPortListeningWin(p)) return p;
  }
  return null;
}

function getFirstAdbDevice() {
  const out = execSync("adb devices", { stdio: ["ignore", "pipe", "ignore"] }).toString();
  const lines = out
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  // Skip header line "List of devices attached"
  for (const line of lines) {
    if (line.toLowerCase().startsWith("list of devices")) continue;
    // Example: emulator-5554	device
    if (/\tdevice$/i.test(line)) return line.split(/\s+/)[0];
  }
  return null;
}

function clearAppDataIfEnabled() {
  const enabled = process.env.CLEAR_CACHE ? process.env.CLEAR_CACHE === "true" : true;
  if (!enabled) return;

  const udid = process.env.ANDROID_UDID || getFirstAdbDevice();
  if (!udid) {
    console.warn("[mobile] CLEAR_CACHE enabled but no adb device found. Skipping `pm clear`.");
    return;
  }

  const appPackage = process.env.APP_PACKAGE || "com.wdiodemoapp";
  try {
    // Clear app data/cache so each run starts from a clean state.
    const cmd = `adb -s ${udid} shell pm clear ${appPackage}`;
    const res = execSync(cmd, {
      stdio: ["ignore", "pipe", "pipe"],
      timeout: Number(process.env.CLEAR_CACHE_TIMEOUT || 120000),
    }).toString();
    console.log(`[mobile] Cleared app data: ${appPackage} on ${udid} (${res.trim() || "OK"})`);
  } catch (e) {
    console.warn(
      `[mobile] Failed to clear app data for ${appPackage}. You can disable via CLEAR_CACHE=false. Error: ${
        e?.message || String(e)
      }`,
    );
  }
}

function buildAndroidCapabilities() {
  const cap = {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:deviceName": process.env.ANDROID_DEVICE_NAME || "Android Emulator",
    "appium:newCommandTimeout": 180,
    "appium:autoGrantPermissions": true,
    // Default to true to avoid repeated `pm clear` / reset that can be slow on emulators.
    "appium:noReset": process.env.NO_RESET ? process.env.NO_RESET === "true" : true,
    "appium:fullReset": process.env.FULL_RESET ? process.env.FULL_RESET === "true" : false,
    // Make ADB/App install more tolerant of slow emulators.
    "appium:adbExecTimeout": Number(process.env.ADB_EXEC_TIMEOUT || 120000),
    "appium:androidInstallTimeout": Number(process.env.ANDROID_INSTALL_TIMEOUT || 240000),
    // Give UiAutomator2 more time to come up.
    "appium:uiautomator2ServerLaunchTimeout": Number(process.env.UIA2_SERVER_LAUNCH_TIMEOUT || 120000),
    "appium:uiautomator2ServerInstallTimeout": Number(process.env.UIA2_SERVER_INSTALL_TIMEOUT || 120000),
    // Speed up & reduce flakiness
    "appium:disableWindowAnimation": true
  };

  // Prefer APK_PATH (installs fresh each run). If not set, fall back to appPackage/appActivity (app must already be installed).
  if (process.env.APK_PATH) {
    cap["appium:app"] = path.resolve(process.env.APK_PATH);
  } else {
    if (process.env.APP_PACKAGE) cap["appium:appPackage"] = process.env.APP_PACKAGE;
    if (process.env.APP_ACTIVITY) cap["appium:appActivity"] = process.env.APP_ACTIVITY;
  }

  const hasApk = Boolean(cap["appium:app"]);
  const hasPackage = Boolean(cap["appium:appPackage"]) && Boolean(cap["appium:appActivity"]);
  if (!hasApk && !hasPackage) {
    throw new Error(
      "Mobile config error: set APK_PATH (recommended) OR set both APP_PACKAGE and APP_ACTIVITY before running `npm run mobile`.",
    );
  }

  // Optional: specify UDID if multiple devices connected
  if (process.env.ANDROID_UDID) cap["appium:udid"] = process.env.ANDROID_UDID;

  return cap;
}

const appiumHost = process.env.APPIUM_HOST || "127.0.0.1";
const appiumPath = process.env.APPIUM_PATH || "/";
const requestedPort = process.env.APPIUM_PORT ? Number(process.env.APPIUM_PORT) : null;
const appiumPort = (() => {
  if (requestedPort) {
    if (isPortListeningWin(requestedPort)) {
      const fallback = pickFreePort({ start: 4731, end: 4749 });
      console.warn(
        `[mobile] APPIUM_PORT=${requestedPort} is already in use. Falling back to a free port: ${fallback}`,
      );
      return fallback;
    }
    return requestedPort;
  }
  return pickFreePort({ start: 4731, end: 4749 });
})();

if (!appiumPort) {
  throw new Error("Could not find a free Appium port in range 4731-4749. Set APPIUM_PORT manually.");
}

async function swipeUpOnce() {
  const { width, height } = await browser.getWindowSize();
  const x = Math.floor(width * 0.5);
  const startY = Math.floor(height * 0.85);
  const endY = Math.floor(height * 0.25);

  await browser.performActions([
    {
      type: "pointer",
      id: "finger-swipe-up",
      parameters: { pointerType: "touch" },
      actions: [
        { type: "pointerMove", duration: 0, x, y: startY },
        { type: "pointerDown", button: 0 },
        { type: "pause", duration: 150 },
        { type: "pointerMove", duration: 450, x, y: endY },
        { type: "pointerUp", button: 0 },
      ],
    },
  ]);
  await browser.releaseActions();
}

async function closeAppIfEnabled() {
  const enabled = process.env.CLOSE_APP_ON_FINISH ? process.env.CLOSE_APP_ON_FINISH === "true" : true;
  if (!enabled) return;

  const appPackage = process.env.APP_PACKAGE || "com.wdiodemoapp";
  try {
    // Prefer terminateApp (more reliable)
    if (typeof browser.terminateApp === "function") {
      await browser.terminateApp(appPackage);
      console.log(`[mobile] App terminated: ${appPackage}`);
      return;
    }
  } catch (e) {
    console.warn(`[mobile] terminateApp failed: ${e?.message || String(e)}`);
  }

  try {
    // Fallbacks
    if (typeof browser.closeApp === "function") {
      await browser.closeApp();
      console.log("[mobile] App closed via closeApp()");
    }
  } catch (e) {
    console.warn(`[mobile] closeApp failed: ${e?.message || String(e)}`);
  }
}

exports.config = {
  runner: "local",
  // Run a single spec entrypoint to keep execution single-worker (more stable on emulators).
  specs: ["./specs/mobile.e2e.js"],
  exclude: [],
  maxInstances: 1,
  logLevel: "info",
  bail: 0,
  waitforTimeout: 20000,
  connectionRetryTimeout: 180000,
  connectionRetryCount: 2,

  // Appium
  hostname: appiumHost,
  port: appiumPort,
  path: appiumPath,

  services: [
    [
      "appium",
      {
        // Use globally installed appium (your environment already has Appium v2)
        command: process.env.APPIUM_COMMAND || "appium",
        args: {
          address: appiumHost,
          port: appiumPort,
          // Appium v2 commonly uses "base-path"; WDIO service maps this to CLI args
          "base-path": appiumPath
        }
      }
    ]
  ],

  framework: "mocha",
  reporters: ["spec"],
  mochaOpts: {
    ui: "bdd",
    timeout: 10 * 60 * 1000
  },

  capabilities: [buildAndroidCapabilities()],

  /**
   * Clear app cache/data before creating an Appium session.
   * Default: enabled (set CLEAR_CACHE=false to disable).
   */
  beforeSession: function () {
    clearAppDataIfEnabled();
  },

  before: async function () {
    // Ensure artifacts folder exists
    ensureDir(path.resolve("mobile-testing", "screenshots"));
  },

  /**
   * End-of-run cleanup:
   * - optional swipe up gesture (useful to visually confirm end state / unblock UI)
   * - optional close/terminate app
   */
  after: async function () {
    const doSwipe = process.env.SWIPE_UP_ON_FINISH ? process.env.SWIPE_UP_ON_FINISH === "true" : true;
    if (doSwipe) {
      try {
        await swipeUpOnce();
      } catch (e) {
        console.warn(`[mobile] swipeUpOnce failed: ${e?.message || String(e)}`);
      }
    }

    await closeAppIfEnabled();
  },

  afterTest: async function (test, context, { passed }) {
    if (passed) return;
    const outDir = path.resolve("mobile-testing", "screenshots");
    ensureDir(outDir);
    const file = `${stamp()}-${sanitizeFileName(test.title)}.png`;
    await browser.saveScreenshot(path.join(outDir, file));

    // Also dump page source for easier selector debugging
    try {
      const src = await browser.getPageSource();
      const srcFile = `${stamp()}-${sanitizeFileName(test.title)}.xml`;
      fs.writeFileSync(path.join(outDir, srcFile), src, "utf8");
    } catch {
      // ignore
    }
  }
};

