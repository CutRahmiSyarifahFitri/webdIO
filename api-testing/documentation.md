# Part 2: API / Backend Testing (JSONPlaceholder)

Platform: `https://jsonplaceholder.typicode.com`

## Objective

Membuat test untuk **positive** dan **negative** cases dan menyimpan hasil eksekusi sebagai report.

## Test Cases

### Positive

- **GET `/posts/1`**
  - Expected:
    - status `200`
    - response JSON object
    - minimal schema: `userId:number`, `id:number`, `title:string`, `body:string`
    - `id === 1`
- **POST `/posts`**
  - Expected:
    - status `201`
    - response JSON object berisi `id` (number)
    - payload utama ter-echo kembali (`title`, `body`, `userId`)

### Negative

- **GET `/this-route-does-not-exist`**
  - Expected: status `404`
- **GET `/posts/abc`**
  - Expected: status `404`

## How to Run

Di root project:

```bash
npm install
npm run api
```

## Artifacts

- JSON report: `api-testing/result/api-test-report-*.json`
  - berisi totals (pass/fail) dan detail tiap test (timing/status/sample).

## Notes

- JSONPlaceholder adalah fake API; beberapa validasi server-side tidak realistis (namun cukup untuk menunjukkan positive/negative coverage).


