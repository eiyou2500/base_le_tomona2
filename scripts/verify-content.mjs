import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
const roots = ["src", "dist", "templates"].filter((p) => existsSync(p));
const exts = new Set([".html", ".css", ".js", ".md"]);
const forbidden = ["裏予約", "顔戸452", "Shipping", "Pickup reservation", "Add to cart", "Read more", "lorem ipsum", "TODO", "最高級", "完全再現", "健康に良い", "無添加", "保存料不使用"];
const readmeLikePublicContent = ["Le Tomona BASE custom theme のブートストラップ用リポジトリです", "make verify は lint", "検証", "ビルド"];
const required = ["滋賀県米原市顔戸439", "配送で購入", "店頭受け取り予約", "パルミエ プレーン", "パルミエ ショコラ", "パルミエ ショコラホワイト", "フラン バニラ", "フラン ショコラ", "フラン セゾン", "アップルパイ", "原材料", "アレルギー", "保存方法", "lang=\"ja\""];
const failures = [];
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir)) {
    const p = path.join(dir, entry);
    const s = await stat(p);
    if (s.isDirectory()) await walk(p);
    else if (exts.has(path.extname(p))) files.push(p);
  }
}
for (const root of roots) await walk(root);
const corpusParts = [];
for (const file of files) {
  const text = await readFile(file, "utf8");
  corpusParts.push(text);
  for (const bad of forbidden) if (text.includes(bad)) failures.push(`${file}: forbidden string ${bad}`);
  if (file === "dist/index.html") {
    for (const bad of readmeLikePublicContent) if (text.includes(bad)) failures.push(`${file}: README-like public content ${bad}`);
  }
  for (const re of [/フラン[\s\S]{0,40}配送できます/, /フラン[\s\S]{0,40}発送できます/, /アップルパイ[\s\S]{0,40}配送できます/, /アップルパイ[\s\S]{0,40}発送できます/]) {
    if (re.test(text)) failures.push(`${file}: suspicious shipping copy ${re}`);
  }
}
const corpus = corpusParts.join("\n");
for (const item of required) if (!corpus.includes(item)) failures.push(`missing required public-facing occurrence: ${item}`);
if (!corpus.includes("賞味期限") && !corpus.includes("消費期限")) failures.push("missing required deadline label: 賞味期限 or 消費期限");
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`content verification passed (${files.length} files)`);
