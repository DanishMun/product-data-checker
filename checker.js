// The checker: looks at each product and lists what is missing or wrong.
// No React here, just plain functions. That makes it easy to test.

// Different systems name the same column differently.
// Example: Shopify calls the name "Title", others call it "name".
// We map them all to one simple name.
const COLUMN_NAMES = {
  sku: ["sku", "variant sku", "product code", "id"],
  name: ["name", "title", "product name"],
  description: ["description", "body (html)", "body"],
  image: ["image", "image src", "image url", "images"],
  price: ["price", "variant price"],
};

// Find the value for one field (like "name") in a row, whatever the column is called.
function getField(row, field) {
  for (const [column, value] of Object.entries(row)) {
    if (COLUMN_NAMES[field].includes(column.trim().toLowerCase())) {
      return String(value ?? "").trim();
    }
  }
  return "";
}

// Remove HTML tags like <p> so we count only real text.
function plainText(text) {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Check one product. Returns a list of problems (empty list = perfect).
export function checkProduct(row) {
  const problems = [];
  const name = getField(row, "name");
  const description = plainText(getField(row, "description"));
  const price = getField(row, "price");

  if (!getField(row, "sku")) problems.push("Missing SKU");

  if (!name) problems.push("Missing name");
  else if (name.length < 10) problems.push("Name too short");

  if (!description) problems.push("Missing description");
  else if (description.length < 50) problems.push("Description too short");

  if (!getField(row, "image")) problems.push("Missing image");

  if (!price) problems.push("Missing price");
  else if (isNaN(Number(price.replace(",", ".")))) problems.push("Price is not a number");

  return problems;
}

// Each product starts at 100 and loses 20 points per problem (never below 0).
export function scoreProduct(problems) {
  return Math.max(0, 100 - problems.length * 20);
}

// Check all products, and also find SKUs that are used more than once.
export function checkAll(rows) {
  const skuCount = {};
  for (const row of rows) {
    const sku = getField(row, "sku");
    if (sku) skuCount[sku] = (skuCount[sku] || 0) + 1;
  }

  const products = rows.map((row) => {
    const sku = getField(row, "sku");
    const problems = checkProduct(row);
    if (sku && skuCount[sku] > 1) problems.push("Duplicate SKU");
    return {
      sku: sku || "—",
      name: getField(row, "name") || "(no name)",
      problems,
      score: scoreProduct(problems),
    };
  });

  // Worst products first, so the user sees what to fix.
  products.sort((a, b) => a.score - b.score);

  const total = products.reduce((sum, p) => sum + p.score, 0);
  const averageScore = products.length ? Math.round(total / products.length) : 0;
  const perfect = products.filter((p) => p.problems.length === 0).length;

  return { products, averageScore, perfect };
}
