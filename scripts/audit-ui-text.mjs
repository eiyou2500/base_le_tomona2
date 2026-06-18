import { readFile } from "node:fs/promises";
const html = await readFile("dist/index.html", "utf8");
const visibleText = html
  .replace(/<script[\s\S]*?<\/script>/g, " ")
  .replace(/<style[\s\S]*?<\/style>/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const failures = [];
const allowedLatin = new Set(["Le", "Tomona", "BASE"]);
for (const token of visibleText.match(/[A-Za-z][A-Za-z0-9'-]*/g) || []) {
  if (!allowedLatin.has(token)) failures.push(`unexpected public Latin UI token: ${token}`);
}
for (const bad of ["Shipping", "Pickup", "reservation", "Add", "cart", "Read", "more"]) if (visibleText.includes(bad)) failures.push(`forbidden public English UI text: ${bad}`);
if (failures.length) { console.error([...new Set(failures)].join("\n")); process.exit(1); }
console.log("Japanese public UI text audit passed");
