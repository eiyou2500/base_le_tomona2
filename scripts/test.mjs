import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
const failures = [];
if (!existsSync("src/templates/base-theme.html")) failures.push("missing source template");
if (!existsSync("dist/index.html")) failures.push("missing dist/index.html; run build first");
const html = existsSync("dist/index.html") ? await readFile("dist/index.html", "utf8") : "";
for (const s of ["lang=\"ja\"", "配送で購入", "店頭受け取り予約", "滋賀県米原市顔戸439", "原材料", "アレルギー", "保存方法"]) if (!html.includes(s)) failures.push(`dist/index.html missing ${s}`);
if (!html.includes("賞味期限") && !html.includes("消費期限")) failures.push("dist/index.html missing deadline field");
for (const bad of ["裏予約", "Shipping", "Pickup reservation", "Add to cart", "Read more", "lorem ipsum", "TODO", "最高級", "完全再現", "健康に良い", "無添加", "保存料不使用"]) if (html.includes(bad)) failures.push(`dist/index.html forbidden ${bad}`);
for (const re of [/フラン[\s\S]{0,40}配送できます/, /フラン[\s\S]{0,40}発送できます/, /アップルパイ[\s\S]{0,40}配送できます/, /アップルパイ[\s\S]{0,40}発送できます/]) if (re.test(html)) failures.push(`dist/index.html suspicious ${re}`);
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("tests passed");
