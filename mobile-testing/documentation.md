# Part 3: Mobile Application Testing (WebdriverIO Native Demo App - Android)

Platform: WebdriverIO Native Demo App (Android)

## Objective

Menjalankan otomasi untuk test case:

1. **Login Flow**
2. **Forms Test**
3. **Swipe/Gesture Test (Bonus)**

## Required Setup

### 1) Android Studio + Emulator

- Install Android Studio
- Buat emulator: **Pixel 5**, **API 30+** (atau yang lebih tinggi)

### 1b) Node.js

- Gunakan **Node.js 20+** untuk menjalankan WebdriverIO (di repo ini beberapa dependency butuh Node 20).

### 2) Install APK

- Download APK dari: `https://github.com/webdriverio/native-demo-app/releases`
- Install ke emulator:
  - Jalankan emulator
  - Drag & drop file APK ke window emulator (atau install via adb)

### 3) Appium (v2) + Driver (UIAutomator2)

Pastikan Appium dan driver Android sudah ter-install:

```bash
appium --version
appium driver list --installed
appium driver install uiautomator2
```

### 4) Install dependency repo (WebdriverIO)

Di root project:

```bash
npm install
```

## Proposed Automation Tool

Paling umum:

- **Appium** (UIAutomator2) + WebdriverIO / JavaScript

Repo ini sudah menambahkan scaffolding runnable:

- WDIO config: `mobile-testing/wdio.conf.cjs`
- Specs:
  - `mobile-testing/specs/00-login.e2e.js`
  - `mobile-testing/specs/01-forms.e2e.js`
  - `mobile-testing/specs/02-swipe.e2e.js`

## How to Run

### Opsi A (Recommended): pakai APK path (install fresh saat run)

1) Jalankan emulator

2) Set env var `APK_PATH` (path ke file APK yang sudah kamu download). Contoh PowerShell:

```powershell
$env:APK_PATH="D:\Downloads\native-demo-app-android.apk"
```

3) Run tests:

```bash
npm run mobile
```

### Clear cache/data tiap run (default ON)

Secara default, config akan menjalankan:

- `adb shell pm clear com.wdiodemoapp`

sebelum session Appium dibuat, supaya setiap run mulai dari kondisi bersih.

Kamu bisa atur via env:

- `CLEAR_CACHE=false` untuk mematikan (kalau emulator terlalu lambat)
- `APP_PACKAGE=<package>` jika package app berbeda

### Opsi B: app sudah ter-install (pakai appPackage/appActivity)

Jika app sudah ter-install di emulator, set:

- `APP_PACKAGE` (contoh umum: `com.wdiodemoapp`)
- `APP_ACTIVITY` (contoh umum: `.MainActivity`)

Contoh PowerShell:

```powershell
$env:APP_PACKAGE="com.wdiodemoapp"
$env:APP_ACTIVITY=".MainActivity"
```

Lalu:

```bash
npm run mobile
```

## Artifacts

- Screenshot saat test gagal otomatis disimpan di `mobile-testing/screenshots/`

## Troubleshooting (paling sering)

- Jika selector tidak ketemu: buka **Appium Inspector** dan update accessibility-id di file spec (pakai selector `~...`).
- Jika ada lebih dari satu device: set `ANDROID_UDID` dan/atau `ANDROID_DEVICE_NAME`.

## Locator Strategy (Recommended)

- Prefer:
  - **Accessibility ID** (`content-desc`)
  - `resource-id`
- Avoid (sebisa mungkin):
  - XPath panjang/fragile
- Tambahkan waits eksplisit untuk menghindari flakiness (element displayed/enabled).

## Test Case Details (Ringkas)

### Test Case 1: Login Flow

- Navigate to Login screen
- Input credentials test (valid/invalid)
- Tap Login button
- Verify success login **atau** capture error message
- Dokumentasikan behavior + screenshot

### Test Case 2: Forms Test

- Navigate to Forms screen
- Fill text input
- Toggle switch
- Select option dari dropdown
- Verify interaksi bekerja

### Test Case 3: Swipe/Gesture (Bonus)

- Navigate to Swipe screen
- Swipe left/right/up/down
- Verify cards/content berubah setelah swipe

## Artifacts

- Screenshot: simpan di `mobile-testing/screenshots/`
- (Opsional) screen recording sesuai kebutuhan submission

## AI Tools Used (contoh isi)

- Membantu menyusun checklist test cases, locator strategy, dan struktur dokumentasi.


