const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

const APP_KEY = "518144";
const APP_SECRET = "COmmaWfjMfaLC2ZftkgkQuuSH2GX9ftb";

function generateSignature(params) {
  const sorted = Object.keys(params).sort();
  let base = APP_SECRET;
  sorted.forEach((key) => {
    base += key + params[key];
  });
  base += APP_SECRET;
  return crypto.createHash("md5").update(base).digest("hex").toUpperCase();
}

app.get("/get", async (req, res) => {
  const productId = req.query.productId;
  if (!productId) return res.status(400).json({ error: "Missing productId" });

  const params = {
    app_key: APP_KEY,
    method: "aliexpress.affiliate.product.query",
    sign_method: "md5",
    timestamp: new Date().toISOString().slice(0, 19),
    format: "json",
    v: "2.0",
    target_currency: "USD",
    target_language: "EN",
    tracking_id: "test",
    fields: "product_id,product_title,product_main_image_url,app_sale_price",
    product_ids: productId,
  };

  const sign = generateSignature(params);
  const query = new URLSearchParams({ ...params, sign }).toString();
  const url = `https://api-sg.aliexpress.com/sync?${query}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "API request failed", details: err.message });
  }
});

app.listen(port, () => console.log("Proxy API running on port", port));