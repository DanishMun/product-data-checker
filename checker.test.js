import { describe, test, expect } from "vitest";
import { checkProduct, scoreProduct, checkAll } from "./checker";

// A complete, perfect product. Each test changes only what it needs.
const goodProduct = {
  sku: "SAU-100",
  name: "Wood-Burning Sauna Stove",
  description: "A classic wood-burning stove for home saunas. Heats quickly and holds the heat.",
  image: "https://example.com/stove.jpg",
  price: "649.00",
};

function problemsFor(changes) {
  return checkProduct({ ...goodProduct, ...changes });
}

describe("checking one product", () => {
  test("a complete product has no problems", () => {
    expect(problemsFor({})).toEqual([]);
  });

  test("finds a missing name, description, image, price and SKU", () => {
    const problems = problemsFor({ sku: "", name: "", description: "", image: "", price: "" });
    expect(problems).toEqual([
      "Missing SKU", "Missing name", "Missing description", "Missing image", "Missing price",
    ]);
  });

  test("finds a name that is too short", () => {
    expect(problemsFor({ name: "Bucket" })).toEqual(["Name too short"]);
  });

  test("finds a description that is too short", () => {
    expect(problemsFor({ description: "Wooden bucket." })).toEqual(["Description too short"]);
  });

  test("HTML tags don't count as description text", () => {
    expect(problemsFor({ description: "<p><strong>Hi</strong></p>" })).toEqual(["Description too short"]);
  });

  test("finds a price that is not a number", () => {
    expect(problemsFor({ price: "ask us" })).toEqual(["Price is not a number"]);
  });

  test("accepts a Finnish price with a comma", () => {
    expect(problemsFor({ price: "12,90" })).toEqual([]);
  });
});

describe("column names", () => {
  test("understands a Shopify export", () => {
    const shopifyRow = {
      "Variant SKU": "SAU-100",
      Title: "Wood-Burning Sauna Stove",
      "Body (HTML)": "<p>A classic wood-burning stove for home saunas. Heats quickly.</p>",
      "Image Src": "https://example.com/stove.jpg",
      "Variant Price": "649.00",
    };
    expect(checkProduct(shopifyRow)).toEqual([]);
  });
});

describe("scores", () => {
  test("no problems = 100, each problem costs 20 points", () => {
    expect(scoreProduct([])).toBe(100);
    expect(scoreProduct(["a", "b"])).toBe(60);
  });

  test("the score never goes below 0", () => {
    expect(scoreProduct(["a", "b", "c", "d", "e", "f"])).toBe(0);
  });
});

describe("checking a whole list", () => {
  const rows = [
    goodProduct,
    { ...goodProduct, name: "Sauna Pillow Large" },        // same SKU as the first one
    { ...goodProduct, sku: "SAU-200", image: "" },          // missing image
  ];
  const result = checkAll(rows);

  test("finds duplicate SKUs", () => {
    const duplicates = result.products.filter((p) => p.problems.includes("Duplicate SKU"));
    expect(duplicates).toHaveLength(2);
  });

  test("puts the worst products first", () => {
    const scores = result.products.map((p) => p.score);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
  });

  test("counts perfect products and the average score", () => {
    expect(result.perfect).toBe(0);
    expect(result.averageScore).toBe(80);
  });
});
