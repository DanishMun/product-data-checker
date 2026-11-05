"use client";
import { useState } from "react";
import Papa from "papaparse"; // reads CSV files
import { checkAll } from "../checker";

export default function Home() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Turn CSV text into rows, then check them.
  function checkCsv(text) {
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
    if (data.length === 0) {
      setError("No products found in this file.");
      setResult(null);
      return;
    }
    setError("");
    setResult(checkAll(data));
  }

  // When the user picks a file, read it as text.
  async function handleFile(event) {
    const file = event.target.files[0];
    if (file) checkCsv(await file.text());
  }

  // Load our example file, so people can try without their own data.
  async function trySample() {
    const response = await fetch("/sample-products.csv");
    checkCsv(await response.text());
  }

  return (
    <main>
      <h1>Product Data Checker</h1>
      <p className="tagline">Find the gaps in your product data</p>
      <p className="intro">
        Upload your product list (CSV). See which products are missing a name,
        description, image or price, in seconds. Your file never leaves your browser.
      </p>

      <div className="card">
        <div className="buttons">
          <label className="button">
            Upload CSV
            <input type="file" accept=".csv" onChange={handleFile} hidden />
          </label>
          <button className="button secondary" onClick={trySample}>
            Try sample data
          </button>
        </div>
        <p className="hint">
          Works with columns like sku, name, description, image, price, and with a Shopify product export.
        </p>
        {error && <p className="error">{error}</p>}
      </div>

      {result && <Results result={result} />}
    </main>
  );
}

function Results({ result }) {
  const { products, averageScore, perfect } = result;

  return (
    <>
      <div className="summary">
        <Stat number={`${averageScore}%`} label="Average quality" />
        <Stat number={products.length} label="Products checked" />
        <Stat number={products.length - perfect} label="Need fixing" />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Score</th><th>SKU</th><th>Product</th><th>Problems</th></tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td className={`score ${product.score === 100 ? "good" : "bad"}`}>{product.score}</td>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>
                  {product.problems.length === 0
                    ? <span className="tag ok">All good</span>
                    : product.problems.map((problem) => <span key={problem} className="tag">{problem}</span>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Stat({ number, label }) {
  return (
    <div className="stat">
      <strong>{number}</strong>
      <span>{label}</span>
    </div>
  );
}
