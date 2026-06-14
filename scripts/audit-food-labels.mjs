import { readFile } from "node:fs/promises";
const html = await readFile("dist/index.html", "utf8");
const failures = [];
const cards = [...html.matchAll(/<article class="product-card" data-product="([^"]+)" data-mode="[^"]+">([\s\S]*?)<\/article>/g)];
if (!cards.length) failures.push("no product cards found");
for (const [, name, body] of cards) {
  for (const label of ["原材料", "アレルギー", "保存方法"]) if (!body.includes(`<dt>${label}</dt>`)) failures.push(`${name}: missing ${label}`);
  if (!body.includes("賞味期限") && !body.includes("消費期限")) failures.push(`${name}: missing 賞味期限 or 消費期限`);
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`food labeling audit passed (${cards.length} product cards)`);
