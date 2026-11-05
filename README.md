# Product Data Checker

Upload a product list (CSV file). The tool shows which products are missing
a name, description, image, price or SKU, gives each product a quality score,
and puts the worst products first.

**Why:** bad product data costs sales. A product with no image or a one-line
description sells worse, and fixing it by hand across Excel, the online store
and brochures takes hours. This is the first step of PIM work
(Product Information Management): find what's missing before you fix it.

Your file never leaves the browser. Nothing is uploaded to a server.

## Tech

- **Next.js + React**: the page
- **PapaParse**: reads CSV files
- **Vitest**: tests

## Files (only 4 to read)

| File | What it does |
|---|---|
| `checker.js` | The rules: finds problems, gives scores, finds duplicate SKUs |
| `app/page.js` | Upload button, sample button, summary and results table |
| `app/globals.css` | Styles |
| `public/sample-products.csv` | Example data, so anyone can try it |

## The rules (`checker.js`)

| Check | Problem shown |
|---|---|
| No SKU | Missing SKU |
| Same SKU used twice | Duplicate SKU |
| No name / under 10 letters | Missing name / Name too short |
| No description / under 50 letters (HTML tags removed) | Missing description / Description too short |
| No image | Missing image |
| No price / not a number (`12,90` is OK) | Missing price / Price is not a number |

Every product starts at 100 points and loses 20 per problem.

Column names are matched in a simple list, so a **Shopify product export**
(`Title`, `Body (HTML)`, `Image Src`, `Variant Price`, `Variant SKU`) works too.

## Run it

```bash
npm install
npm run dev     # open http://localhost:3000
npm test        # runs the 13 tests
```
