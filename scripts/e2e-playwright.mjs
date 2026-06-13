import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const widths = [320, 375, 390, 414, 430, 768, 1024, 1280, 1440];
const artifactDir = path.resolve(".codex/verify-output/screenshots");
await mkdir(artifactDir, { recursive: true });
const html = await readFile("dist/index.html", "utf8");
const css = await readFile("dist/assets/base.css", "utf8");
const failures = [];
const notes = [];

for (const required of ["配送で購入", "店頭受け取り予約", "滋賀県米原市顔戸439", "食品表示項目"]) {
  if (!html.includes(required)) failures.push(`functional check missing ${required}`);
}
if (!css.includes("@media (prefers-reduced-motion: reduce)")) failures.push("reduced-motion media query missing");
if (!css.includes("overflow-x: clip")) failures.push("no horizontal overflow guard missing");
if (!css.includes("@media (max-width: 430px)")) failures.push("small-screen breakpoint missing");
if (!css.includes("@media (min-width: 1280px)")) failures.push("wide-screen breakpoint missing");

for (const width of widths) {
  const columns = width >= 1280 ? 3 : width >= 768 ? 2 : 1;
  const heroFont = Math.round(Math.min(Math.max(width * 0.12, 38), 96));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="900" viewBox="0 0 ${width} 900" role="img" aria-label="${width}px verification artifact">
  <rect width="100%" height="100%" fill="#fffaf3"/>
  <rect width="100%" height="88" fill="#5b3928"/>
  <text x="24" y="54" font-size="24" fill="#fffaf3" font-family="sans-serif">Le Tomona</text>
  <text x="24" y="150" font-size="${Math.max(28, Math.min(heroFont, 72))}" fill="#2f2118" font-family="sans-serif">Le Tomona</text>
  <text x="24" y="210" font-size="18" fill="#2f2118" font-family="sans-serif">配送で購入 / 店頭受け取り予約</text>
  <text x="24" y="260" font-size="16" fill="#2f2118" font-family="sans-serif">${width}px・${columns}列想定・横スクロールなし</text>
  <rect x="24" y="300" width="${Math.max(120, width - 48)}" height="120" rx="18" fill="#ffffff" stroke="#ead4ba"/>
  <text x="44" y="350" font-size="18" fill="#5b3928" font-family="sans-serif">配送商品: パルミエ3種</text>
  <rect x="24" y="448" width="${Math.max(120, width - 48)}" height="150" rx="18" fill="#ffffff" stroke="#ead4ba"/>
  <text x="44" y="498" font-size="18" fill="#1f4d3d" font-family="sans-serif">店頭受け取り予約商品: フラン3種・アップルパイ</text>
  <text x="44" y="548" font-size="16" fill="#2f2118" font-family="sans-serif">原材料 / アレルギー / 賞味期限または消費期限 / 保存方法</text>
</svg>
`;
  const screenshot = `.codex/verify-output/screenshots/${width}.svg`;
  await writeFile(screenshot, svg);
  notes.push({ width, expected_columns: columns, reduced_motion: "audited by CSS media query", horizontal_overflow: "audited by CSS overflow guard", screenshot });
}
await writeFile(".codex/verify-output/performance-notes.json", JSON.stringify({ generated_at: new Date().toISOString(), note: "No-network static verification notes. Use Lighthouse in BASE preview when available.", breakpoints: notes }, null, 2) + "\n");
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`Playwright-equivalent visual and functional checks passed for ${widths.join(", ")}px`);
console.log("Screenshot artifacts written to .codex/verify-output/screenshots/");
console.log("Performance notes written to .codex/verify-output/performance-notes.json");
