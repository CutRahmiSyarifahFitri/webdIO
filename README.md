# QA Automation Assessment (OCX - Technical Test)

Dokumentasi utama untuk assessment QA automation lintas **Web**, **API**, dan **Mobile**, termasuk script runnable, artefak hasil eksekusi, dan ringkasan penggunaan AI tools.

> Catatan: Repository GitHub ini sebelumnya berisi README singkat “webdIO”. Konten di bawah ini adalah dokumentasi lengkap untuk assessment.

## Overview

Assessment ini menguji kemampuan membuat automated testing menggunakan bantuan AI tools pada:

- Web application testing
- API/Backend testing
- Mobile application testing

Fokus penilaian: **kualitas otomasi** dan **kualitas dokumentasi**.

## Prerequisites (Must Have)

- Komputer dengan internet
- Code editor (VS Code, IntelliJ, dsb.)
- Akses ke AI tools (Claude/ChatGPT/GitHub Copilot, dsb.)
- Android Studio + emulator (wajib untuk mobile)
- APK WebdriverIO Native Demo App sudah diunduh
  - Download: `https://github.com/webdriverio/native-demo-app/releases`

Tambahan untuk menjalankan repo ini:

- Node.js **20+** (dibutuhkan untuk WebdriverIO/Appium dependencies; web/api juga jalan di Node 18+, tapi supaya konsisten disarankan Node 20)
- npm

## Repository Structure (Submission)

```
qa-automation-assessment/
  README.md
  web-testing/
    test-script.js
    screenshots/
    documentation.md
  api-testing/
    api-tests.js
    result/
    documentation.md
  mobile-testing/
    test-script.js
    screenshots/
    documentation.md
  diagrams/
    flow-diagram.mmd
```

## Setup (Install)

Di root project:

```bash
npm install
npx playwright install
```

## Run Tests

### Web (Part 1)

```bash
npm run web
```

Artifacts:

- Screenshot: `web-testing/screenshots/`
- Order ID: `web-testing/order-id.txt`

### API (Part 2)

```bash
npm run api
```

Artifacts:

- JSON report: `api-testing/result/api-test-report-*.json`

### Mobile (Part 3)

Mobile automation di repo ini sudah disiapkan dengan **WebdriverIO + Appium**. Langkah setup & cara menjalankan ada di `mobile-testing/documentation.md`.

## Part 1: Web Application Testing

Platform: `https://www.demoblaze.com`

Scenario: automate e-commerce purchase flow:

1. Navigate ke website
2. Browse & pilih product (any category)
3. Add product ke cart
4. Buka cart & verifikasi product benar
5. Complete checkout
6. Verifikasi order confirmation muncul
7. Capture & dokumentasikan **Order ID**

Deliverables:

- Working automation script (`web-testing/test-script.js`)
- Screenshot hasil sukses eksekusi (`web-testing/screenshots/`)
- Dokumentasi test flow + AI tools used + challenges (`web-testing/documentation.md`)

## Part 2: API / Backend Testing

Platform: JSONPlaceholder `https://jsonplaceholder.typicode.com`

Scenario: test REST API menggunakan AI tools untuk generate & validate test cases.

Deliverables:

- API test scripts (`api-testing/api-tests.js`) (alternatif: Postman collection)
- Test execution result (report) (`api-testing/result/`)
- Dokumentasi test cases (expected vs actual) (`api-testing/documentation.md`)

## Part 3: Mobile Application Testing

Platform: WebdriverIO Native Demo App (Android)

Required setup (ringkas):

- Install Android Studio & buat emulator (Pixel 5, API 30+)
- Download APK dari GitHub releases
- Install APK ke emulator (drag & drop)

Test cases:

- **Login Flow**
- **Forms Test**
- **Swipe/Gesture Test (bonus)**

Deliverables:

- Working mobile automation script (Appium/Maestro/atau tool lain)
- Screenshot / screen recording hasil eksekusi
- Dokumentasi setup, locator strategy, AI tools used, hasil/observasi

## Part 4: Comprehensive Documentation

### 1) Executive Summary

- **What tested**: Web (Demoblaze), API (JSONPlaceholder), Mobile (Native Demo App - plan/setup)
- **Overall results summary**: Web/API script runnable; Mobile disiapkan via dokumentasi + skeleton
- **Key findings/insights**: lihat masing-masing `documentation.md` per folder

### 2) AI Tools Usage Report

- **Tools used**: ChatGPT (untuk drafting struktur repo, template test, dan dokumentasi)
- **How AI accelerated**:
  - Membantu menyusun struktur submission & checklist deliverables
  - Membuat baseline script runnable (Playwright web + API smoke/negative)
  - Membantu menulis template dokumentasi
- **Examples (AI-generated)**:
  - Web: flow purchase + capture order id + screenshot
  - API: positive & negative test + JSON report output
- **Pros**:
  - Mempercepat pembuatan scaffolding & ide test cases
  - Mengurangi waktu untuk boilerplate
- **Cons/Risks**:
  - Perlu review manual untuk selector flaky, timing, dan edge cases
  - Perlu validasi terhadap requirement real & reliability (retries/reporting)

