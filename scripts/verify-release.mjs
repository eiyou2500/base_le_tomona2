import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
const failures = [];
for (const f of ["README.md", "AGENTS.md", "docs/release-checklist.md", "docs/verification-protocol.md", "LOOP_LOG.md", "NEXT_HYPOTHESES.md", ".github/workflows/verify.yml", ".codex/hooks.json", ".codex/hooks/stop_verify.py", "dist/index.html"]) if (!existsSync(f)) failures.push(`missing ${f}`);
const checklist = existsSync("docs/release-checklist.md") ? await readFile("docs/release-checklist.md", "utf8") : "";
for (const s of ["BASE live checkout", "BASE テイクアウト App", "BASE HTML編集 App", "Instagram アプリ内ブラウザ", "実機スマートフォン", "食品表示の最終確認", "Playwright visual and functional checks", "reduced-motion audit", "no horizontal overflow audit", "Lighthouse measurement"]) if (!checklist.includes(s)) failures.push(`release checklist missing ${s}`);
const protocol = existsSync("docs/verification-protocol.md") ? await readFile("docs/verification-protocol.md", "utf8") : "";
for (const s of ["worker", "verifier", "Stop hook", "make verify", "PASS", "FAIL", "BLOCKED", "self-reporting is not trusted", "Playwright", "screenshots", "performance notes"]) if (!protocol.includes(s)) failures.push(`verification protocol missing ${s}`);
if (!existsSync(".codex/verify-output/performance-notes.json")) failures.push("missing performance notes artifact");
if (!existsSync(".codex/verify-output/screenshots")) failures.push("missing screenshots artifact directory");
else {
  const shots = await readdir(".codex/verify-output/screenshots");
  for (const width of [320, 375, 390, 414, 430, 768, 1024, 1280, 1440]) if (!shots.includes(`${width}.svg`)) failures.push(`missing screenshot ${width}.svg`);
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("release verification passed");
