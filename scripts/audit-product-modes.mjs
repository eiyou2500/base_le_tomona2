import { readFile } from "node:fs/promises";
const html = await readFile("dist/index.html", "utf8");
const failures = [];
const products = [...html.matchAll(/<article class="product-card" data-product="([^"]+)" data-mode="([^"]+)">([\s\S]*?)<\/article>/g)].map((m) => ({ name: m[1], mode: m[2], body: m[3] }));
const shipping = ["パルミエ プレーン", "パルミエ ショコラ", "パルミエ ショコラホワイト"];
const neverShipping = ["フラン バニラ", "フラン ショコラ", "フラン セゾン", "アップルパイ"];
for (const name of shipping) {
  if (!products.some((p) => p.name === name && p.mode === "shipping" && p.body.includes("配送で購入"))) failures.push(`${name}: shipping product card missing`);
}
for (const name of neverShipping) {
  const bad = products.filter((p) => p.name === name && (p.mode === "shipping" || p.body.includes("配送で購入") || p.body.includes("配送商品")));
  if (bad.length) failures.push(`${name}: must never appear shippable`);
  if (!products.some((p) => p.name === name && p.mode === "pickup" && p.body.includes("店頭受け取り予約"))) failures.push(`${name}: pickup card missing`);
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("product-mode audit passed");
