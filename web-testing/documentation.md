# Part 1: Web Application Testing (Demoblaze)

Platform: `https://www.demoblaze.com`

## Objective

Automate e-commerce purchase flow dan menghasilkan **Order ID** + **screenshot** sebagai bukti.

## Test Flow (High Level)

1. Open homepage
2. Pick any product dari list
3. Open product detail
4. Click **Add to cart** (accept browser alert)
5. Navigate ke **Cart**
6. Verify product ada di cart
7. Click **Place Order**
8. Isi form checkout dan klik **Purchase**
9. Verifikasi confirmation muncul dan ambil **Order ID**
10. Simpan screenshot + Order ID file

## How to Run

Di root project:

```bash
npm install
npx playwright install
npm run web
```

## Artifacts

- **Screenshot**: `web-testing/screenshots/order-confirmation-<orderId>.png`
- **Order ID file**: `web-testing/order-id.txt`

## Notes / Challenges

- Demoblaze memakai modal + alert; script sudah handle dialog `Product added` dengan `page.on("dialog")`.
- Jika sewaktu-waktu flakey (network/timeout), bisa ditambah retry atau explicit waits yang lebih robust.


